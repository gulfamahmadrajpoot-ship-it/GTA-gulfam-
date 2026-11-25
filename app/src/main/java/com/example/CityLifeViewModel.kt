package com.example

import android.app.Application
import android.content.Context
import android.net.Uri
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.viewModelScope
import kotlinx.coroutines.Job
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch

data class PhotoPickerRequest(
  val targetType: String, // "character" | "billboard" | "vehicle"
  val targetId: String,   // "player" | charId | "bb_0".. | vehicleKind
)

data class CityStudioUiState(
  val isSheetOpen: Boolean = false,
  val activeTab: StudioTab = StudioTab.WARDROBE,
  val missionInitialSubTab: String = "story",
  val snapshot: GameSnapshot = GameSnapshot(),
  val customCharacterDataUrl: String? = null,
  val customCharacterDataUrls: Map<String, String> = emptyMap(),
  val customBillboardDataUrls: Map<String, String> = emptyMap(),
  val customVehicleDataUrls: Map<String, String> = emptyMap(),
  val timeMode: String = "cycle",
  val authUser: OwnerAuthUser = OwnerAuthUser(),
  val authLoading: Boolean = false,
  val authMessage: String? = null,
  val isOwnerPasscodeConfigured: Boolean = false,
  val isOwnerUnlocked: Boolean = false,
  val isCurrentPlayerBanned: Boolean = false,
  val ownerSection: OwnerDashboardSection = OwnerDashboardSection.OVERVIEW,
  val draftConfig: OwnerConfigDto = OwnerConfigDto(),
  val publishedConfig: OwnerConfigDto = OwnerConfigDto(),
  val hasUnsavedDraftChanges: Boolean = false,
  val isPreviewActive: Boolean = false,
  val configHistory: List<OwnerConfigSnapshotDto> = emptyList(),
  val cloudBackups: List<CloudBackupRecord> = emptyList(),
  val registeredPlayers: List<PlayerAccountRecord> = emptyList(),
  val statusBanner: String? = null,
  val photoStatusMessage: String? = null,
)

class CityLifeViewModel(application: Application) : AndroidViewModel(application) {
  val repository = CityLifeRepository(application)
  val firebaseRepo = OwnerFirebaseRepository(application)

  private val _uiState = MutableStateFlow(
    CityStudioUiState(isOwnerPasscodeConfigured = repository.isOwnerPasscodeSet())
  )
  val uiState: StateFlow<CityStudioUiState> = _uiState.asStateFlow()

  var pendingPhotoRequest: PhotoPickerRequest? = null

  private val _pendingEngineConfigJson = MutableStateFlow<Pair<String, Boolean>?>(null)
  val pendingEngineConfigJson: StateFlow<Pair<String, Boolean>?> = _pendingEngineConfigJson.asStateFlow()

  private val _pendingResetPlayerEvent = MutableStateFlow(0L)
  val pendingResetPlayerEvent: StateFlow<Long> = _pendingResetPlayerEvent.asStateFlow()

  private var userListenersJob: Job? = null
  private var adminListenersJob: Job? = null
  private var lastPlayerSyncMs = 0L
  private var pendingResetClearAck = false

  init {
    val savedJson = repository.loadGameStateJson()
    val savedSnap = if (savedJson.isNotEmpty()) GameSnapshot.fromJson(savedJson) else GameSnapshot()

    val savedPublished = OwnerConfigDto.fromJson(repository.loadPublishedConfigJson())
      ?: savedSnap.ownerConfig.normalized(false)
    val savedDraft = OwnerConfigDto.fromJson(repository.loadDraftConfigJson()) ?: savedPublished
    val history = repository.loadOwnerHistory()

    _uiState.update {
      it.copy(
        snapshot = savedSnap,
        publishedConfig = savedPublished,
        draftConfig = savedDraft,
        hasUnsavedDraftChanges = savedDraft != savedPublished,
        configHistory = history,
      )
    }
    loadSavedPhotos()
  }

  fun consumePendingEngineConfig() {
    _pendingEngineConfigJson.value = null
  }

  fun consumePendingResetPlayerEvent() {
    _pendingResetPlayerEvent.value = 0L
  }

  fun clearStatusBanner() {
    _uiState.update { it.copy(statusBanner = null, photoStatusMessage = null, authMessage = null) }
  }

  private fun loadSavedPhotos() {
    viewModelScope.launch {
      val keys = repository.listSavedPhotoKeys()
      val charMap = mutableMapOf<String, String>()
      val bbMap = mutableMapOf<String, String>()
      val vehMap = mutableMapOf<String, String>()

      keys.forEach { key ->
        val dataUrl = repository.loadSavedPhotoDataUrl(key) ?: return@forEach
        when {
          key.startsWith("character_") -> {
            val id = key.removePrefix("character_")
            charMap[id] = dataUrl
          }
          key.startsWith("billboard_") -> {
            val id = key.removePrefix("billboard_")
            bbMap[id] = dataUrl
          }
          key.startsWith("vehicle_") -> {
            val kind = key.removePrefix("vehicle_")
            vehMap[kind] = dataUrl
          }
        }
      }

      _uiState.update {
        it.copy(
          customCharacterDataUrl = charMap["player"],
          customCharacterDataUrls = charMap,
          customBillboardDataUrls = bbMap,
          customVehicleDataUrls = vehMap,
        )
      }
    }
  }

  fun attemptAutoSignIn(activityContext: Context) {
    viewModelScope.launch {
      val result = firebaseRepo.attemptAutoSignIn(activityContext)
      result.onSuccess { user ->
        onAuthenticatedUser(user)
      }
    }
  }

  fun signInWithGoogle(activityContext: Context) {
    viewModelScope.launch {
      _uiState.update { it.copy(authLoading = true, authMessage = null) }
      val result = firebaseRepo.signInWithGoogle(activityContext)
      result
        .onSuccess { user ->
          onAuthenticatedUser(user)
          _uiState.update {
            it.copy(
              authLoading = false,
              authMessage = if (user.isAdmin) "Verified Owner signed in: ${user.email}" else "Signed in as Player (${user.email}). Owner controls restricted.",
            )
          }
        }
        .onFailure { err ->
          _uiState.update {
            it.copy(
              authLoading = false,
              authMessage = err.message ?: "Google Sign-In cancelled or failed.",
            )
          }
        }
    }
  }

  private fun onAuthenticatedUser(user: OwnerAuthUser) {
    _uiState.update {
      it.copy(
        authUser = user,
        isOwnerUnlocked = if (user.isAdmin) it.isOwnerUnlocked else false,
      )
    }
    attachAuthenticatedListeners(user)
    viewModelScope.launch {
      firebaseRepo.syncPlayerProfile(_uiState.value.snapshot)
      if (user.isAdmin) {
        val meta = firebaseRepo.fetchOwnerMeta()
        if (meta != null && meta.claimed && meta.salt.isNotBlank() && meta.passHash.isNotBlank()) {
          repository.applySyncedOwnerPasscode(meta.salt, meta.passHash)
          _uiState.update { it.copy(isOwnerPasscodeConfigured = true) }
        }
      }
    }
  }

  private fun attachAuthenticatedListeners(user: OwnerAuthUser) {
    userListenersJob?.cancel()
    adminListenersJob?.cancel()
    if (!user.isSignedIn) return

    userListenersJob = viewModelScope.launch {
      launch {
        firebaseRepo.observePublishedConfig().collect { doc ->
          val remoteCfg = OwnerConfigDto.fromJson(doc?.configJson) ?: return@collect
          val curPub = _uiState.value.publishedConfig
          if (remoteCfg != curPub) {
            repository.savePublishedConfigJson(remoteCfg.toJson())
            _uiState.update { st ->
              val nextDraft = if (!st.hasUnsavedDraftChanges) remoteCfg else st.draftConfig
              st.copy(
                publishedConfig = remoteCfg,
                draftConfig = nextDraft,
                statusBanner = "Live game configuration synced from cloud (v${remoteCfg.version}).",
              )
            }
            if (!_uiState.value.isPreviewActive) {
              _pendingEngineConfigJson.value = remoteCfg.normalized(_uiState.value.isOwnerUnlocked).toJson() to false
            }
          }
        }
      }
      launch {
        firebaseRepo.observeOwnPlayerAccount().collect { account ->
          if (account != null) {
            _uiState.update { it.copy(isCurrentPlayerBanned = account.banned) }
            if (account.resetRequested) {
              pendingResetClearAck = true
              _pendingResetPlayerEvent.value = System.currentTimeMillis()
            }
          }
        }
      }
    }

    if (user.isAdmin) {
      adminListenersJob = viewModelScope.launch {
        launch {
          firebaseRepo.observeAllPlayers().collect { players ->
            _uiState.update { it.copy(registeredPlayers = players) }
          }
        }
        launch {
          firebaseRepo.observeBackups().collect { backups ->
            _uiState.update { it.copy(cloudBackups = backups) }
          }
        }
        launch {
          firebaseRepo.observeDraftConfig().collect { draftDoc ->
            val remoteDraft = OwnerConfigDto.fromJson(draftDoc?.configJson) ?: return@collect
            if (!_uiState.value.hasUnsavedDraftChanges && remoteDraft != _uiState.value.publishedConfig) {
              repository.saveDraftConfigJson(remoteDraft.toJson())
              _uiState.update {
                it.copy(
                  draftConfig = remoteDraft,
                  hasUnsavedDraftChanges = remoteDraft != it.publishedConfig,
                )
              }
            }
          }
        }
      }
    }
  }

  fun signOutOwner(onLockedForWebView: () -> Unit) {
    userListenersJob?.cancel()
    adminListenersJob?.cancel()
    userListenersJob = null
    adminListenersJob = null
    viewModelScope.launch {
      firebaseRepo.signOut()
      _uiState.update {
        it.copy(
          authUser = OwnerAuthUser(),
          isOwnerUnlocked = false,
          registeredPlayers = emptyList(),
          cloudBackups = emptyList(),
          isCurrentPlayerBanned = false,
          authMessage = "Signed out securely.",
        )
      }
      onLockedForWebView()
    }
  }

  fun acknowledgeServerPlayerReset(snapshotJson: String) {
    val updatedSnap = GameSnapshot.fromJson(snapshotJson)
    _uiState.update { it.copy(snapshot = updatedSnap, statusBanner = "Account progress reset applied.") }
    viewModelScope.launch {
      firebaseRepo.syncPlayerProfile(updatedSnap, clearingResetFlag = true)
    }
  }

  fun openStudio(tab: StudioTab, snapshotJson: String?, missionSubTab: String = "story") {
    _uiState.update {
      it.copy(
        isSheetOpen = true,
        activeTab = tab,
        missionInitialSubTab = missionSubTab,
        snapshot = if (!snapshotJson.isNullOrBlank()) GameSnapshot.fromJson(snapshotJson) else it.snapshot,
        isOwnerPasscodeConfigured = repository.isOwnerPasscodeSet(),
      )
    }
  }

  fun closeStudio() {
    _uiState.update { it.copy(isSheetOpen = false) }
  }

  fun selectTab(tab: StudioTab) {
    _uiState.update { it.copy(activeTab = tab) }
  }

  fun selectOwnerSection(section: OwnerDashboardSection) {
    _uiState.update { it.copy(ownerSection = section) }
  }

  fun syncSnapshot(snapshotJson: String) {
    if (pendingResetClearAck) {
      pendingResetClearAck = false
      lastPlayerSyncMs = System.currentTimeMillis()
      acknowledgeServerPlayerReset(snapshotJson)
      return
    }
    val snap = GameSnapshot.fromJson(snapshotJson)
    _uiState.update { it.copy(snapshot = snap) }
    val now = System.currentTimeMillis()
    if (firebaseRepo.currentUser() != null && now - lastPlayerSyncMs > 12_000L) {
      lastPlayerSyncMs = now
      viewModelScope.launch {
        firebaseRepo.syncPlayerProfile(snap)
      }
    }
  }

  fun claimOwnerPasscode(passcode: String): Boolean {
    if (!_uiState.value.authUser.isAdmin) return false
    val pair = repository.setOwnerPasscode(passcode) ?: return false
    _uiState.update {
      it.copy(
        isOwnerPasscodeConfigured = true,
        isOwnerUnlocked = true,
        statusBanner = "Owner passcode claimed & encrypted with salted SHA-256.",
      )
    }
    viewModelScope.launch {
      firebaseRepo.saveOwnerMeta(pair.first, pair.second)
    }
    return true
  }

  fun unlockOwner(passcode: String): Boolean {
    if (!_uiState.value.authUser.isAdmin) return false
    val ok = repository.verifyOwnerPasscode(passcode)
    if (ok) {
      _uiState.update {
        it.copy(
          isOwnerUnlocked = true,
          statusBanner = "Owner Dashboard unlocked.",
        )
      }
    }
    return ok
  }

  fun changeOwnerPasscode(currentPasscode: String, newPasscode: String): String? {
    if (!_uiState.value.authUser.isAdmin || !_uiState.value.isOwnerUnlocked) {
      return "Owner access required."
    }
    if (newPasscode.trim().length < 4) {
      return "New passcode must be at least 4 characters."
    }
    val pair = repository.changeOwnerPasscode(currentPasscode, newPasscode)
      ?: return "Current passcode is incorrect."
    viewModelScope.launch {
      firebaseRepo.saveOwnerMeta(pair.first, pair.second)
    }
    _uiState.update { it.copy(statusBanner = "Owner passcode updated securely.") }
    return null
  }

  fun lockOwner() {
    _uiState.update { it.copy(isOwnerUnlocked = false) }
  }

  fun updateDraftConfig(transform: (OwnerConfigDto) -> OwnerConfigDto) {
    _uiState.update { st ->
      val updated = transform(st.draftConfig).normalized(false)
      st.copy(
        draftConfig = updated,
        hasUnsavedDraftChanges = updated != st.publishedConfig,
      )
    }
  }

  fun saveDraftChanges() {
    val draft = _uiState.value.draftConfig.normalized(false)
    val json = draft.toJson()
    repository.saveDraftConfigJson(json)
    _uiState.update { it.copy(statusBanner = "Draft saved locally. Syncing to cloud...") }
    viewModelScope.launch {
      val res = firebaseRepo.saveDraftConfig(draft)
      res
        .onSuccess {
          _uiState.update { it.copy(statusBanner = "Draft saved locally & to Firestore cloud.") }
        }
        .onFailure {
          _uiState.update { it.copy(statusBanner = "Draft saved locally (cloud sync pending sign-in).") }
        }
    }
  }

  fun previewDraftChanges(onApplyToEngine: (configJson: String, isPreview: Boolean) -> Unit) {
    val draft = _uiState.value.draftConfig.normalized(_uiState.value.isOwnerUnlocked)
    _uiState.update {
      it.copy(
        isPreviewActive = true,
        statusBanner = "Preview mode active in 3D city (not yet published).",
      )
    }
    onApplyToEngine(draft.toJson(), true)
  }

  fun publishDraftChanges(
    label: String = "",
    onApplyToEngine: (configJson: String, isPreview: Boolean) -> Unit,
  ) {
    val st = _uiState.value
    val nextVer = (maxOf(st.publishedConfig.version, st.draftConfig.version) + 1).coerceIn(1, 999_999)
    val prevSnapshot = OwnerConfigSnapshotDto(
      id = "snap_${System.currentTimeMillis()}",
      label = "Before Publish v$nextVer",
      savedAtMs = System.currentTimeMillis(),
      version = st.publishedConfig.version,
      configJson = st.publishedConfig.normalized(false).toJson(),
    )
    val nextHistory = (listOf(prevSnapshot) + st.configHistory).take(10)
    val nextPublished = st.draftConfig.copy(version = nextVer).normalized(false)
    val cleanJson = nextPublished.toJson()

    repository.savePublishedConfigJson(cleanJson)
    repository.saveDraftConfigJson(cleanJson)
    repository.saveOwnerHistory(nextHistory)

    _uiState.update {
      it.copy(
        publishedConfig = nextPublished,
        draftConfig = nextPublished,
        hasUnsavedDraftChanges = false,
        isPreviewActive = false,
        configHistory = nextHistory,
        statusBanner = "Published v$nextVer live to game engine!",
      )
    }
    onApplyToEngine(nextPublished.copy(ownerUnlocked = st.isOwnerUnlocked).toJson(), false)

    viewModelScope.launch {
      val backupName = label.ifBlank { "Live Release v$nextVer" }
      val res = firebaseRepo.publishConfig(nextPublished, backupName)
      res.onSuccess {
        _uiState.update { it.copy(statusBanner = "Published v$nextVer live locally & to Firestore cloud!") }
      }
    }
  }

  fun cancelDraftChanges(onApplyToEngine: (configJson: String, isPreview: Boolean) -> Unit) {
    val st = _uiState.value
    val pub = st.publishedConfig.normalized(false)
    repository.saveDraftConfigJson(pub.toJson())
    _uiState.update {
      it.copy(
        draftConfig = pub,
        hasUnsavedDraftChanges = false,
        isPreviewActive = false,
        statusBanner = "Draft edits discarded. Reverted to live v${pub.version}.",
      )
    }
    if (st.isPreviewActive) {
      onApplyToEngine(pub.copy(ownerUnlocked = st.isOwnerUnlocked).toJson(), false)
    }
  }

  fun restoreHistorySnapshot(
    snapshot: OwnerConfigSnapshotDto,
    onApplyToEngine: (configJson: String, isPreview: Boolean) -> Unit,
  ) {
    val restored = OwnerConfigDto.fromJson(snapshot.configJson) ?: return
    _uiState.update {
      it.copy(
        draftConfig = restored,
        hasUnsavedDraftChanges = true,
        isPreviewActive = true,
        statusBanner = "Loaded '${snapshot.label}' into Draft & Preview. Tap Publish to make live.",
      )
    }
    onApplyToEngine(restored.copy(ownerUnlocked = _uiState.value.isOwnerUnlocked).toJson(), true)
  }

  fun restoreCloudBackup(
    backup: CloudBackupRecord,
    onApplyToEngine: (configJson: String, isPreview: Boolean) -> Unit,
  ) {
    val restored = OwnerConfigDto.fromJson(backup.configJson) ?: return
    _uiState.update {
      it.copy(
        draftConfig = restored,
        hasUnsavedDraftChanges = true,
        isPreviewActive = true,
        statusBanner = "Loaded backup '${backup.label}' into Draft & Preview. Tap Publish to confirm.",
      )
    }
    onApplyToEngine(restored.copy(ownerUnlocked = _uiState.value.isOwnerUnlocked).toJson(), true)
  }

  fun deleteCloudBackup(backupId: String) {
    viewModelScope.launch {
      firebaseRepo.deleteBackup(backupId)
        .onSuccess { _uiState.update { it.copy(statusBanner = "Cloud backup deleted.") } }
    }
  }

  fun exportDraftBackupJson(): String = repository.exportBackupJson(_uiState.value.draftConfig)

  fun importBackupJson(
    json: String,
    onApplyToEngine: (configJson: String, isPreview: Boolean) -> Unit,
  ): String? {
    val res = repository.parseBackupJson(json)
    return res.fold(
      onSuccess = { cfg ->
        _uiState.update {
          it.copy(
            draftConfig = cfg,
            hasUnsavedDraftChanges = true,
            isPreviewActive = true,
            statusBanner = "Backup JSON imported into Draft & Preview.",
          )
        }
        onApplyToEngine(cfg.copy(ownerUnlocked = _uiState.value.isOwnerUnlocked).toJson(), true)
        null
      },
      onFailure = { err -> err.message ?: "Invalid JSON." },
    )
  }

  fun togglePlayerBan(player: PlayerAccountRecord) {
    viewModelScope.launch {
      val nextBanned = !player.banned
      firebaseRepo.setPlayerBanned(player.id, nextBanned)
        .onSuccess {
          _uiState.update {
            it.copy(statusBanner = "${player.displayName} ${if (nextBanned) "banned" else "unbanned"}.")
          }
        }
        .onFailure { err ->
          _uiState.update { it.copy(statusBanner = err.message ?: "Unable to update ban status.") }
        }
    }
  }

  fun resetCloudPlayer(player: PlayerAccountRecord) {
    val startCash = _uiState.value.publishedConfig.economy.startingCash
    viewModelScope.launch {
      firebaseRepo.requestPlayerReset(player.id, startCash)
        .onSuccess {
          _uiState.update {
            it.copy(statusBanner = "Reset scheduled for ${player.displayName} (\$$startCash starting cash).")
          }
        }
        .onFailure { err ->
          _uiState.update { it.copy(statusBanner = err.message ?: "Unable to reset player.") }
        }
    }
  }

  fun setSelectedCity(cityId: String) {
    _uiState.update {
      it.copy(snapshot = it.snapshot.copy(selectedCityId = cityId))
    }
  }

  fun updateOutfitSelection(outfitId: String, skinHex: String, hairHex: String) {
    _uiState.update {
      it.copy(snapshot = it.snapshot.copy(outfit = outfitId, skinHex = skinHex, hairHex = hairHex))
    }
  }

  fun selectCharacterProfile(characterId: String) {
    val builtIn = CityCatalog.characters.find { it.id == characterId }
    val custom = _uiState.value.publishedConfig.customCharacters.find { it.id == characterId }
    val outfit = custom?.defaultOutfit ?: builtIn?.defaultOutfit ?: return
    val skin = custom?.skinHex ?: builtIn?.skinHex ?: "#d8a482"
    val hair = custom?.hairHex ?: builtIn?.hairHex ?: "#1e1b18"
    _uiState.update {
      it.copy(
        snapshot =
          it.snapshot.copy(
            characterId = characterId,
            outfit = outfit,
            skinHex = skin,
            hairHex = hair,
          )
      )
    }
  }

  fun updateWeather(weather: String) {
    _uiState.update {
      it.copy(snapshot = it.snapshot.copy(weather = weather))
    }
  }

  fun updateSettings(settings: GameSettings) {
    _uiState.update {
      it.copy(snapshot = it.snapshot.copy(settings = settings))
    }
  }

  fun resetControlsLayout() {
    _uiState.update {
      val s = it.snapshot.settings.copy(
        joystickPos = "mid",
        buttonPos = "mid",
        buttonSize = 1.0f,
        layout = "standard",
        customControls = emptyMap(),
      )
      it.copy(snapshot = it.snapshot.copy(settings = s))
    }
  }

  fun setTimeMode(mode: String) {
    _uiState.update { it.copy(timeMode = mode) }
  }

  fun handlePickedPhoto(
    uri: Uri,
    onReadyForWebView: (targetType: String, targetId: String, dataUrl: String) -> Unit,
  ) {
    val req = pendingPhotoRequest ?: return
    pendingPhotoRequest = null
    viewModelScope.launch {
      val cleanId = req.targetId.ifBlank { "player" }
      val key = when (req.targetType) {
        "character" -> "character_$cleanId"
        "vehicle" -> "vehicle_$cleanId"
        else -> "billboard_$cleanId"
      }
      val maxW = when (req.targetType) {
        "billboard" -> 1024
        "vehicle" -> 512
        else -> 384
      }
      val maxH = when (req.targetType) {
        "billboard" -> 768
        "vehicle" -> 512
        else -> 384
      }
      val lossless = req.targetType == "billboard"
      when (val result = repository.processAndSavePhoto(uri, key, maxW, maxH, lossless)) {
        is PhotoUploadResult.Error -> {
          _uiState.update { it.copy(photoStatusMessage = result.message) }
        }
        is PhotoUploadResult.Success -> {
          val dataUrl = result.dataUrl
          _uiState.update { state ->
            when (req.targetType) {
              "character" -> state.copy(
                customCharacterDataUrl = if (cleanId == "player") dataUrl else state.customCharacterDataUrl,
                customCharacterDataUrls = state.customCharacterDataUrls + (cleanId to dataUrl),
                photoStatusMessage = "Character image saved & applied.",
              )
              "vehicle" -> state.copy(
                customVehicleDataUrls = state.customVehicleDataUrls + (cleanId to dataUrl),
                photoStatusMessage = "Vehicle wrap image saved & applied.",
              )
              else -> state.copy(
                customBillboardDataUrls = state.customBillboardDataUrls + (cleanId to dataUrl),
                photoStatusMessage = "Ad poster uploaded cleanly without distortion.",
              )
            }
          }
          onReadyForWebView(req.targetType, cleanId, dataUrl)
        }
      }
    }
  }

  fun clearCustomPhoto(
    targetType: String,
    targetId: String,
    onClearedForWebView: (targetType: String, targetId: String) -> Unit,
  ) {
    viewModelScope.launch {
      val cleanId = targetId.ifBlank { "player" }
      val key = when (targetType) {
        "character" -> "character_$cleanId"
        "vehicle" -> "vehicle_$cleanId"
        else -> "billboard_$cleanId"
      }
      repository.clearSavedPhoto(key)
      _uiState.update { state ->
        when (targetType) {
          "character" -> state.copy(
            customCharacterDataUrl = if (cleanId == "player") null else state.customCharacterDataUrl,
            customCharacterDataUrls = state.customCharacterDataUrls - cleanId,
            photoStatusMessage = "Custom character image cleared.",
          )
          "vehicle" -> state.copy(
            customVehicleDataUrls = state.customVehicleDataUrls - cleanId,
            photoStatusMessage = "Vehicle wrap cleared.",
          )
          else -> state.copy(
            customBillboardDataUrls = state.customBillboardDataUrls - cleanId,
            photoStatusMessage = "Billboard reset to default.",
          )
        }
      }
      onClearedForWebView(targetType, cleanId)
    }
  }
}
