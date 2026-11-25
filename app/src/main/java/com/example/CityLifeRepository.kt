package com.example

import android.content.Context
import android.graphics.Bitmap
import android.graphics.BitmapFactory
import android.net.Uri
import android.util.Base64
import java.io.ByteArrayOutputStream
import java.io.File
import java.security.MessageDigest
import java.security.SecureRandom
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext

/**
 * Pure JVM helper for salted SHA-256 Owner Passcode hashing and constant-time verification.
 * Never stores or checks any hardcoded default password.
 */
object PasscodeSecurity {
  fun generateSaltBase64(): String {
    val bytes = ByteArray(16)
    SecureRandom().nextBytes(bytes)
    return java.util.Base64.getEncoder().encodeToString(bytes)
  }

  fun hashPasscode(passcode: String, saltBase64: String): String {
    val salt = java.util.Base64.getDecoder().decode(saltBase64)
    val digest = MessageDigest.getInstance("SHA-256")
    digest.update(salt)
    digest.update(passcode.toByteArray(Charsets.UTF_8))
    return java.util.Base64.getEncoder().encodeToString(digest.digest())
  }

  fun verify(passcode: String, saltBase64: String, expectedHashBase64: String): Boolean {
    if (passcode.isEmpty() || saltBase64.isEmpty() || expectedHashBase64.isEmpty()) return false
    val candidate = hashPasscode(passcode, saltBase64).toByteArray(Charsets.UTF_8)
    val expected = expectedHashBase64.toByteArray(Charsets.UTF_8)
    return MessageDigest.isEqual(candidate, expected)
  }
}

/**
 * Clean abstraction prepared for future optional cloud backup/sync integration.
 */
interface CloudSyncProvider {
  val providerName: String
  val isConfigured: Boolean
  suspend fun syncUp(snapshotJson: String): Result<Unit>
}

class LocalOnlyCloudSyncProvider : CloudSyncProvider {
  override val providerName: String = "Local Save Active (Cloud Hook Ready)"
  override val isConfigured: Boolean = false

  override suspend fun syncUp(snapshotJson: String): Result<Unit> {
    return Result.success(Unit)
  }
}

sealed class PhotoUploadResult {
  data class Success(val dataUrl: String) : PhotoUploadResult()
  data class Error(val message: String) : PhotoUploadResult()
}

object ImageUploadValidator {
  const val MAX_IMAGE_BYTES = 5L * 1024L * 1024L // 5 MB
  val ALLOWED_MIME_TYPES = setOf("image/jpeg", "image/jpg", "image/png", "image/webp")

  fun isAllowedMime(mime: String?): Boolean {
    if (mime.isNullOrBlank()) return true // Content URI without MIME reported falls back to BitmapFactory validation
    return ALLOWED_MIME_TYPES.contains(mime.lowercase())
  }

  fun isAllowedSize(byteSize: Long): Boolean {
    return byteSize <= 0L || byteSize <= MAX_IMAGE_BYTES
  }
}

class CityLifeRepository(private val context: Context) {
  private val prefs = context.getSharedPreferences("city_life_2d_prefs", Context.MODE_PRIVATE)
  private val photoDir = File(context.filesDir, "custom_photos").apply { mkdirs() }
  val cloudSyncProvider: CloudSyncProvider = LocalOnlyCloudSyncProvider()

  fun saveGameStateJson(json: String) {
    prefs.edit().putString("game_state_json", json).apply()
  }

  fun loadGameStateJson(): String {
    return prefs.getString("game_state_json", "") ?: ""
  }

  fun saveDraftConfigJson(json: String) {
    prefs.edit().putString("owner_draft_config_json", json).apply()
  }

  fun loadDraftConfigJson(): String {
    return prefs.getString("owner_draft_config_json", "") ?: ""
  }

  fun savePublishedConfigJson(json: String) {
    prefs.edit().putString("owner_published_config_json", json).apply()
  }

  fun loadPublishedConfigJson(): String {
    return prefs.getString("owner_published_config_json", "") ?: ""
  }

  fun saveOwnerHistory(history: List<OwnerConfigSnapshotDto>) {
    val trimmed = history.take(10)
    prefs.edit().putString("owner_history_json", GameSnapshot.snapshotListAdapter.toJson(trimmed)).apply()
  }

  fun loadOwnerHistory(): List<OwnerConfigSnapshotDto> {
    val raw = prefs.getString("owner_history_json", "") ?: ""
    if (raw.isBlank()) return emptyList()
    return try {
      GameSnapshot.snapshotListAdapter.fromJson(raw) ?: emptyList()
    } catch (_: Exception) {
      emptyList()
    }
  }

  fun exportBackupJson(config: OwnerConfigDto): String {
    return config.normalized(false).toJson()
  }

  fun parseBackupJson(json: String): Result<OwnerConfigDto> {
    val parsed = OwnerConfigDto.fromJson(json.trim())
      ?: return Result.failure(IllegalArgumentException("Invalid configuration JSON format."))
    return Result.success(parsed)
  }

  fun isOwnerPasscodeSet(): Boolean {
    val hash = prefs.getString("owner_pass_hash", null)
    val salt = prefs.getString("owner_pass_salt", null)
    return !hash.isNullOrBlank() && !salt.isNullOrBlank()
  }

  fun getOwnerSaltAndHash(): Pair<String, String>? {
    val salt = prefs.getString("owner_pass_salt", null) ?: return null
    val hash = prefs.getString("owner_pass_hash", null) ?: return null
    return salt to hash
  }

  fun applySyncedOwnerPasscode(salt: String, hash: String) {
    if (salt.isBlank() || hash.isBlank()) return
    prefs.edit()
      .putString("owner_pass_salt", salt)
      .putString("owner_pass_hash", hash)
      .apply()
  }

  fun setOwnerPasscode(passcode: String): Pair<String, String>? {
    val trimmed = passcode.trim()
    if (trimmed.length < 4) return null
    val salt = PasscodeSecurity.generateSaltBase64()
    val hash = PasscodeSecurity.hashPasscode(trimmed, salt)
    prefs.edit()
      .putString("owner_pass_salt", salt)
      .putString("owner_pass_hash", hash)
      .apply()
    return salt to hash
  }

  fun verifyOwnerPasscode(passcode: String): Boolean {
    val salt = prefs.getString("owner_pass_salt", null) ?: return false
    val hash = prefs.getString("owner_pass_hash", null) ?: return false
    return PasscodeSecurity.verify(passcode.trim(), salt, hash)
  }

  fun changeOwnerPasscode(currentPasscode: String, newPasscode: String): Pair<String, String>? {
    if (!verifyOwnerPasscode(currentPasscode)) return null
    return setOwnerPasscode(newPasscode)
  }

  suspend fun processAndSavePhoto(
    uri: Uri,
    key: String,
    maxWidth: Int,
    maxHeight: Int,
    losslessPng: Boolean = false,
  ): PhotoUploadResult =
    withContext(Dispatchers.IO) {
      try {
        val mime = context.contentResolver.getType(uri)
        if (!ImageUploadValidator.isAllowedMime(mime)) {
          return@withContext PhotoUploadResult.Error("Unsupported image format. Please choose JPG, PNG, or WebP.")
        }

        val rawBytes =
          context.contentResolver.openInputStream(uri)?.use { stream ->
            stream.readBytes()
          } ?: return@withContext PhotoUploadResult.Error("Unable to read selected image file.")

        if (rawBytes.isEmpty()) {
          return@withContext PhotoUploadResult.Error("Selected image file is empty.")
        }
        if (!ImageUploadValidator.isAllowedSize(rawBytes.size.toLong())) {
          return@withContext PhotoUploadResult.Error("Image exceeds 5 MB upload limit. Please pick a smaller file.")
        }

        val rawBitmap = BitmapFactory.decodeByteArray(rawBytes, 0, rawBytes.size)
          ?: return@withContext PhotoUploadResult.Error("File could not be decoded as a valid image.")

        if (rawBitmap.width < 16 || rawBitmap.height < 16) {
          rawBitmap.recycle()
          return@withContext PhotoUploadResult.Error("Image resolution is too small (min 16x16).")
        }

        val scaled = scaleBitmapDown(rawBitmap, maxWidth, maxHeight)
        if (scaled !== rawBitmap) rawBitmap.recycle()

        val outBytes = ByteArrayOutputStream()
        if (losslessPng) {
          scaled.compress(Bitmap.CompressFormat.PNG, 100, outBytes)
        } else {
          scaled.compress(Bitmap.CompressFormat.JPEG, 92, outBytes)
        }
        scaled.recycle()

        clearSavedPhoto(key)
        val bytes = outBytes.toByteArray()
        val ext = if (losslessPng) "png" else "jpg"
        val dataPrefix = if (losslessPng) "data:image/png;base64," else "data:image/jpeg;base64,"
        File(photoDir, "$key.$ext").writeBytes(bytes)
        PhotoUploadResult.Success(dataPrefix + Base64.encodeToString(bytes, Base64.NO_WRAP))
      } catch (e: Exception) {
        PhotoUploadResult.Error(e.message ?: "Image processing failed.")
      }
    }

  suspend fun loadSavedPhotoDataUrl(key: String): String? =
    withContext(Dispatchers.IO) {
      val pngFile = File(photoDir, "$key.png")
      val jpgFile = File(photoDir, "$key.jpg")
      val (f, mime) = when {
        pngFile.exists() -> pngFile to "image/png"
        jpgFile.exists() -> jpgFile to "image/jpeg"
        else -> return@withContext null
      }
      try {
        val bytes = f.readBytes()
        "data:$mime;base64," + Base64.encodeToString(bytes, Base64.NO_WRAP)
      } catch (_: Exception) {
        null
      }
    }

  suspend fun listSavedPhotoKeys(): List<String> =
    withContext(Dispatchers.IO) {
      photoDir.listFiles()
        ?.filter { it.isFile && (it.name.endsWith(".jpg") || it.name.endsWith(".png")) }
        ?.map { it.nameWithoutExtension }
        ?.distinct()
        ?: emptyList()
    }

  suspend fun clearSavedPhoto(key: String) =
    withContext(Dispatchers.IO) {
      val jpg = File(photoDir, "$key.jpg")
      val png = File(photoDir, "$key.png")
      if (jpg.exists()) jpg.delete()
      if (png.exists()) png.delete()
    }

  private fun scaleBitmapDown(src: Bitmap, maxW: Int, maxH: Int): Bitmap {
    val ratio = minOf(maxW.toFloat() / src.width, maxH.toFloat() / src.height, 1f)
    if (ratio >= 1f) return src
    val nw = (src.width * ratio).toInt().coerceAtLeast(1)
    val nh = (src.height * ratio).toInt().coerceAtLeast(1)
    return Bitmap.createScaledBitmap(src, nw, nh, true)
  }
}
