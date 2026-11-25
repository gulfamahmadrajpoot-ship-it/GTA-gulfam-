package com.example

import android.content.Context
import android.util.Log
import androidx.credentials.ClearCredentialStateRequest
import androidx.credentials.CredentialManager
import androidx.credentials.CustomCredential
import androidx.credentials.GetCredentialRequest
import androidx.credentials.exceptions.GetCredentialException
import com.google.android.libraries.identity.googleid.GetGoogleIdOption
import com.google.android.libraries.identity.googleid.GetSignInWithGoogleOption
import com.google.android.libraries.identity.googleid.GoogleIdTokenCredential
import com.google.firebase.FirebaseApp
import com.google.firebase.auth.FirebaseAuth
import com.google.firebase.auth.FirebaseUser
import com.google.firebase.auth.GoogleAuthProvider
import com.google.firebase.auth.auth
import com.google.firebase.firestore.DocumentSnapshot
import com.google.firebase.firestore.FieldValue
import com.google.firebase.firestore.FirebaseFirestore
import com.google.firebase.firestore.FirebaseFirestoreException
import com.google.firebase.firestore.MetadataChanges
import com.google.firebase.firestore.Query
import com.google.firebase.firestore.snapshots
import com.google.firebase.Firebase
import kotlinx.coroutines.CancellationException
import kotlinx.coroutines.NonCancellable
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.catch
import kotlinx.coroutines.flow.flowOf
import kotlinx.coroutines.flow.map
import kotlinx.coroutines.tasks.await
import kotlinx.coroutines.withContext

enum class OperationType {
  CREATE,
  UPDATE,
  DELETE,
  GET,
  LIST,
  WRITE,
}

class OwnerFirebaseRepository(private val context: Context) {
  companion object {
    private const val TAG = "OwnerFirebaseRepo"
    private const val BOOTSTRAPPED_OWNER_EMAIL = "gulfamahmadrajpoot@gmail.com"
  }

  private val databaseId: String = context.getString(R.string.firestore_database_id)
  private val auth: FirebaseAuth = Firebase.auth
  private val firestore: FirebaseFirestore = FirebaseFirestore.getInstance(FirebaseApp.getInstance(), databaseId)
  private val credentialManager: CredentialManager = CredentialManager.create(context)

  fun currentUser(): FirebaseUser? = auth.currentUser

  fun isBootstrappedOwnerEmail(user: FirebaseUser?): Boolean {
    return user != null &&
      user.isEmailVerified &&
      user.email?.equals(BOOTSTRAPPED_OWNER_EMAIL, ignoreCase = true) == true
  }

  fun handleFirestoreError(error: Throwable, operation: OperationType, path: String) {
    val fsErr = (error as? FirebaseFirestoreException) ?: (error.cause as? FirebaseFirestoreException)
    val user = auth.currentUser
    val summary = buildString {
      append("Firestore error [$operation] at '$path': ${error.message}")
      if (fsErr != null) append(" (code=${fsErr.code})")
      append(" | uid=${user?.uid ?: "none"}")
      append(" | email=${user?.email ?: "none"}")
      append(" | verified=${user?.isEmailVerified ?: false}")
    }
    Log.e(TAG, summary, error)
  }

  private fun webClientId(): String {
    val resId = context.resources.getIdentifier("default_web_client_id", "string", context.packageName)
    return if (resId != 0) context.getString(resId) else ""
  }

  suspend fun attemptAutoSignIn(activityContext: Context): Result<OwnerAuthUser> {
    auth.currentUser?.let { existing ->
      val isAdmin = checkIsAdmin(existing)
      return Result.success(existing.toOwnerAuthUser(isAdmin))
    }
    val clientId = webClientId()
    if (clientId.isBlank()) return Result.failure(IllegalStateException("Missing Web Client ID configuration."))
    return try {
      val option = GetGoogleIdOption.Builder()
        .setServerClientId(clientId)
        .setFilterByAuthorizedAccounts(true)
        .setAutoSelectEnabled(true)
        .build()
      val request = GetCredentialRequest.Builder()
        .addCredentialOption(option)
        .build()
      val result = credentialManager.getCredential(activityContext, request)
      authenticateCredential(result.credential)
    } catch (e: GetCredentialException) {
      Result.failure(e)
    } catch (e: Exception) {
      Result.failure(e)
    }
  }

  suspend fun signInWithGoogle(activityContext: Context): Result<OwnerAuthUser> {
    val clientId = webClientId()
    if (clientId.isBlank()) return Result.failure(IllegalStateException("Missing Web Client ID configuration."))
    return try {
      val option = GetSignInWithGoogleOption.Builder(clientId).build()
      val request = GetCredentialRequest.Builder()
        .addCredentialOption(option)
        .build()
      val result = credentialManager.getCredential(activityContext, request)
      authenticateCredential(result.credential)
    } catch (e: GetCredentialException) {
      Result.failure(e)
    } catch (e: Exception) {
      Result.failure(e)
    }
  }

  private suspend fun authenticateCredential(credential: androidx.credentials.Credential): Result<OwnerAuthUser> {
    if (credential is CustomCredential &&
      credential.type == GoogleIdTokenCredential.TYPE_GOOGLE_ID_TOKEN_CREDENTIAL
    ) {
      val googleCred = GoogleIdTokenCredential.createFrom(credential.data)
      val firebaseCred = GoogleAuthProvider.getCredential(googleCred.idToken, null)
      val authResult = auth.signInWithCredential(firebaseCred).await()
      val user = authResult.user ?: return Result.failure(IllegalStateException("Google Sign-In returned empty user."))
      if (isBootstrappedOwnerEmail(user)) {
        claimAdminIfEligible(user)
      }
      val isAdmin = checkIsAdmin(user)
      return Result.success(user.toOwnerAuthUser(isAdmin))
    }
    return Result.failure(IllegalStateException("Unsupported credential type."))
  }

  suspend fun signOut() = withContext(NonCancellable) {
    try {
      auth.signOut()
      credentialManager.clearCredentialState(ClearCredentialStateRequest())
    } catch (e: Exception) {
      Log.w(TAG, "Sign-out cleanup warning", e)
    }
  }

  suspend fun claimAdminIfEligible(user: FirebaseUser? = auth.currentUser): Boolean {
    if (user == null || !isBootstrappedOwnerEmail(user)) return false
    val path = "admins/${user.uid}"
    return try {
      val ref = firestore.collection("admins").document(user.uid)
      val snap = ref.get().await()
      if (!snap.exists()) {
        ref.set(
          mapOf(
            "uid" to user.uid,
            "role" to "owner",
            "createdAt" to FieldValue.serverTimestamp(),
          )
        ).await()
      }
      true
    } catch (e: Exception) {
      handleFirestoreError(e, OperationType.CREATE, path)
      false
    }
  }

  suspend fun checkIsAdmin(user: FirebaseUser? = auth.currentUser): Boolean {
    if (user == null) return false
    if (isBootstrappedOwnerEmail(user)) {
      claimAdminIfEligible(user)
      return true
    }
    val path = "admins/${user.uid}"
    return try {
      firestore.collection("admins").document(user.uid).get().await().exists()
    } catch (e: Exception) {
      handleFirestoreError(e, OperationType.GET, path)
      false
    }
  }

  suspend fun fetchOwnerMeta(): OwnerMetaRecord? {
    val user = auth.currentUser ?: return null
    val path = "ownerConfig/meta"
    return try {
      val snap = firestore.collection("ownerConfig").document("meta").get().await()
      if (!snap.exists()) null
      else snap.toObject(OwnerMetaRecord::class.java, DocumentSnapshot.ServerTimestampBehavior.ESTIMATE)
    } catch (e: Exception) {
      handleFirestoreError(e, OperationType.GET, path)
      null
    }
  }

  suspend fun saveOwnerMeta(salt: String, passHash: String): Boolean {
    val user = auth.currentUser ?: return false
    val path = "ownerConfig/meta"
    return try {
      firestore.collection("ownerConfig").document("meta").set(
        mapOf(
          "ownerUid" to user.uid,
          "claimed" to true,
          "salt" to salt,
          "passHash" to passHash,
          "updatedBy" to user.uid,
          "updatedAt" to FieldValue.serverTimestamp(),
        )
      ).await()
      true
    } catch (e: Exception) {
      handleFirestoreError(e, OperationType.WRITE, path)
      false
    }
  }

  fun observePublishedConfig(): Flow<CloudGameConfigDoc?> {
    if (auth.currentUser == null) return flowOf(null)
    val path = "gameConfig/published"
    return firestore.collection("gameConfig").document("published")
      .snapshots(MetadataChanges.EXCLUDE)
      .map { snap ->
        if (snap.exists()) snap.toObject(CloudGameConfigDoc::class.java, DocumentSnapshot.ServerTimestampBehavior.ESTIMATE)
        else null
      }
      .catch { e ->
        if (e is CancellationException) throw e
        handleFirestoreError(e, OperationType.GET, path)
        emit(null)
      }
  }

  fun observeDraftConfig(): Flow<CloudGameConfigDoc?> {
    if (auth.currentUser == null) return flowOf(null)
    val path = "gameConfig/draft"
    return firestore.collection("gameConfig").document("draft")
      .snapshots(MetadataChanges.EXCLUDE)
      .map { snap ->
        if (snap.exists()) snap.toObject(CloudGameConfigDoc::class.java, DocumentSnapshot.ServerTimestampBehavior.ESTIMATE)
        else null
      }
      .catch { e ->
        if (e is CancellationException) throw e
        handleFirestoreError(e, OperationType.GET, path)
        emit(null)
      }
  }

  suspend fun saveDraftConfig(config: OwnerConfigDto): Result<Unit> {
    val user = auth.currentUser ?: return Result.failure(IllegalStateException("Sign in required."))
    val path = "gameConfig/draft"
    val json = config.normalized(false).toJson()
    if (json.length > 440_000) {
      return Result.failure(IllegalStateException("Config JSON exceeds 440 KB Firestore document cap."))
    }
    return try {
      firestore.collection("gameConfig").document("draft").set(
        mapOf(
          "configJson" to json,
          "version" to config.version.coerceIn(1, 1_000_000).toLong(),
          "updatedBy" to user.uid,
          "updatedAt" to FieldValue.serverTimestamp(),
        )
      ).await()
      Result.success(Unit)
    } catch (e: Exception) {
      handleFirestoreError(e, OperationType.WRITE, path)
      Result.failure(e)
    }
  }

  suspend fun publishConfig(config: OwnerConfigDto, backupLabel: String): Result<Unit> {
    val user = auth.currentUser ?: return Result.failure(IllegalStateException("Sign in required."))
    val nextVersion = config.version.coerceIn(1, 999_999)
    val cleanConfig = config.copy(version = nextVersion).normalized(false)
    val json = cleanConfig.toJson()
    if (json.length > 440_000) {
      return Result.failure(IllegalStateException("Config JSON exceeds 440 KB Firestore document cap."))
    }
    val pubPath = "gameConfig/published"
    val backupId = "bk_${System.currentTimeMillis()}"
    val bkPath = "gameConfig/published/backups/$backupId"
    val label = backupLabel.trim().ifBlank { "Published v$nextVersion" }.take(80)

    return try {
      val pubRef = firestore.collection("gameConfig").document("published")
      val bkRef = pubRef.collection("backups").document(backupId)
      val batch = firestore.batch()
      batch.set(
        pubRef,
        mapOf(
          "configJson" to json,
          "version" to nextVersion.toLong(),
          "updatedBy" to user.uid,
          "updatedAt" to FieldValue.serverTimestamp(),
          "publishedAt" to FieldValue.serverTimestamp(),
        )
      )
      batch.set(
        bkRef,
        mapOf(
          "label" to label,
          "configJson" to json,
          "version" to nextVersion.toLong(),
          "createdBy" to user.uid,
          "createdAt" to FieldValue.serverTimestamp(),
        )
      )
      batch.commit().await()
      Result.success(Unit)
    } catch (e: Exception) {
      handleFirestoreError(e, OperationType.WRITE, "$pubPath & $bkPath")
      Result.failure(e)
    }
  }

  fun observeBackups(): Flow<List<CloudBackupRecord>> {
    if (auth.currentUser == null) return flowOf(emptyList())
    val path = "gameConfig/published/backups"
    return firestore.collection("gameConfig").document("published").collection("backups")
      .orderBy("createdAt", Query.Direction.DESCENDING)
      .limit(20)
      .snapshots(MetadataChanges.EXCLUDE)
      .map { snap ->
        snap.toObjects(CloudBackupRecord::class.java, DocumentSnapshot.ServerTimestampBehavior.ESTIMATE)
      }
      .catch { e ->
        if (e is CancellationException) throw e
        handleFirestoreError(e, OperationType.LIST, path)
        emit(emptyList())
      }
  }

  suspend fun deleteBackup(backupId: String): Result<Unit> {
    if (auth.currentUser == null || backupId.isBlank()) return Result.failure(IllegalStateException("Unauthorized"))
    val path = "gameConfig/published/backups/$backupId"
    return try {
      firestore.collection("gameConfig").document("published").collection("backups")
        .document(backupId).delete().await()
      Result.success(Unit)
    } catch (e: Exception) {
      handleFirestoreError(e, OperationType.DELETE, path)
      Result.failure(e)
    }
  }

  fun observeOwnPlayerAccount(): Flow<PlayerAccountRecord?> {
    val user = auth.currentUser ?: return flowOf(null)
    val path = "players/${user.uid}"
    return firestore.collection("players").document(user.uid)
      .snapshots(MetadataChanges.EXCLUDE)
      .map { snap ->
        if (snap.exists()) snap.toObject(PlayerAccountRecord::class.java, DocumentSnapshot.ServerTimestampBehavior.ESTIMATE)
        else null
      }
      .catch { e ->
        if (e is CancellationException) throw e
        handleFirestoreError(e, OperationType.GET, path)
        emit(null)
      }
  }

  fun observeAllPlayers(): Flow<List<PlayerAccountRecord>> {
    if (auth.currentUser == null) return flowOf(emptyList())
    val path = "players"
    return firestore.collection("players")
      .orderBy("updatedAt", Query.Direction.DESCENDING)
      .limit(100)
      .snapshots(MetadataChanges.EXCLUDE)
      .map { snap ->
        snap.toObjects(PlayerAccountRecord::class.java, DocumentSnapshot.ServerTimestampBehavior.ESTIMATE)
      }
      .catch { e ->
        if (e is CancellationException) throw e
        handleFirestoreError(e, OperationType.LIST, path)
        emit(emptyList())
      }
  }

  suspend fun syncPlayerProfile(snapshot: GameSnapshot, clearingResetFlag: Boolean = false) {
    val user = auth.currentUser ?: return
    val path = "players/${user.uid}"
    val safeName = (user.displayName?.takeIf { it.isNotBlank() } ?: "City Player").take(50)
    val safeCash = snapshot.cash.coerceIn(0, 100_000_000).toLong()
    val safeXp = snapshot.xp.coerceIn(0, 100_000_000).toLong()
    val safeLevel = (1 + snapshot.xp / 500).coerceIn(1, 10_000).toLong()
    val safeCity = snapshot.selectedCityId.trim().ifBlank { "original" }.take(64)
    val safeMissions = snapshot.completedMissions.size.coerceIn(0, 5000).toLong()

    try {
      val ref = firestore.collection("players").document(user.uid)
      val snap = ref.get().await()
      if (!snap.exists()) {
        ref.set(
          mapOf(
            "userId" to user.uid,
            "displayName" to safeName,
            "cash" to safeCash,
            "xp" to safeXp,
            "level" to safeLevel,
            "selectedCityId" to safeCity,
            "completedMissionsCount" to safeMissions,
            "banned" to false,
            "resetRequested" to false,
            "createdAt" to FieldValue.serverTimestamp(),
            "updatedAt" to FieldValue.serverTimestamp(),
          )
        ).await()
      } else {
        val updates = mutableMapOf<String, Any>(
          "displayName" to safeName,
          "cash" to safeCash,
          "xp" to safeXp,
          "level" to safeLevel,
          "selectedCityId" to safeCity,
          "completedMissionsCount" to safeMissions,
          "updatedAt" to FieldValue.serverTimestamp(),
        )
        if (clearingResetFlag) {
          updates["resetRequested"] = false
        }
        ref.update(updates).await()
      }
    } catch (e: Exception) {
      handleFirestoreError(e, OperationType.WRITE, path)
    }
  }

  suspend fun setPlayerBanned(playerId: String, banned: Boolean): Result<Unit> {
    if (auth.currentUser == null || playerId.isBlank()) return Result.failure(IllegalStateException("Unauthorized"))
    val path = "players/$playerId"
    return try {
      firestore.collection("players").document(playerId).update(
        mapOf(
          "banned" to banned,
          "updatedAt" to FieldValue.serverTimestamp(),
        )
      ).await()
      Result.success(Unit)
    } catch (e: Exception) {
      handleFirestoreError(e, OperationType.UPDATE, path)
      Result.failure(e)
    }
  }

  suspend fun requestPlayerReset(playerId: String, startingCash: Int): Result<Unit> {
    if (auth.currentUser == null || playerId.isBlank()) return Result.failure(IllegalStateException("Unauthorized"))
    val path = "players/$playerId"
    return try {
      firestore.collection("players").document(playerId).update(
        mapOf(
          "cash" to startingCash.coerceIn(0, 100_000_000).toLong(),
          "xp" to 0L,
          "level" to 1L,
          "completedMissionsCount" to 0L,
          "resetRequested" to true,
          "updatedAt" to FieldValue.serverTimestamp(),
        )
      ).await()
      Result.success(Unit)
    } catch (e: Exception) {
      handleFirestoreError(e, OperationType.UPDATE, path)
      Result.failure(e)
    }
  }

  private fun FirebaseUser.toOwnerAuthUser(isAdmin: Boolean): OwnerAuthUser {
    return OwnerAuthUser(
      uid = uid,
      email = email ?: "",
      displayName = displayName ?: "",
      emailVerified = isEmailVerified,
      isAdmin = isAdmin,
    )
  }
}
