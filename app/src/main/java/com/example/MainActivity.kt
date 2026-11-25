package com.example

import android.annotation.SuppressLint
import android.os.Bundle
import android.view.View
import android.webkit.JavascriptInterface
import android.webkit.WebChromeClient
import android.webkit.WebSettings
import android.webkit.WebView
import android.webkit.WebViewClient
import androidx.activity.ComponentActivity
import androidx.activity.compose.BackHandler
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.activity.result.PickVisualMediaRequest
import androidx.activity.result.contract.ActivityResultContracts
import androidx.activity.viewModels
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.WindowInsets
import androidx.compose.foundation.layout.displayCutout
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.widthIn
import androidx.compose.foundation.layout.windowInsetsPadding
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.rounded.Logout
import androidx.compose.material.icons.rounded.Block
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.viewinterop.AndroidView
import androidx.core.view.WindowCompat
import androidx.core.view.WindowInsetsCompat
import androidx.core.view.WindowInsetsControllerCompat
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.example.ui.theme.AsphaltSurface
import com.example.ui.theme.CityLifeTheme
import com.example.ui.theme.CrimsonSiren
import com.example.ui.theme.MidnightSlate
import com.example.ui.theme.MutedSteel
import org.json.JSONObject

class MainActivity : ComponentActivity() {
  private val viewModel: CityLifeViewModel by viewModels()

  override fun onCreate(savedInstanceState: Bundle?) {
    super.onCreate(savedInstanceState)
    enableEdgeToEdge()
    applyFullscreenMode(viewModel.uiState.value.snapshot.settings.fullscreen)
    setContent {
      CityLifeTheme {
        CityLifeScreen(
          viewModel = viewModel,
          onFullscreenChanged = { enabled -> applyFullscreenMode(enabled) },
        )
      }
    }
  }

  override fun onWindowFocusChanged(hasFocus: Boolean) {
    super.onWindowFocusChanged(hasFocus)
    if (hasFocus) {
      applyFullscreenMode(viewModel.uiState.value.snapshot.settings.fullscreen)
    }
  }

  private fun applyFullscreenMode(fullscreen: Boolean) {
    WindowCompat.setDecorFitsSystemWindows(window, false)
    val controller = WindowInsetsControllerCompat(window, window.decorView)
    controller.systemBarsBehavior =
      WindowInsetsControllerCompat.BEHAVIOR_SHOW_TRANSIENT_BARS_BY_SWIPE
    if (fullscreen) {
      controller.hide(WindowInsetsCompat.Type.systemBars())
    } else {
      controller.show(WindowInsetsCompat.Type.systemBars())
    }
  }
}

@SuppressLint("SetJavaScriptEnabled")
@Composable
fun CityLifeScreen(
  viewModel: CityLifeViewModel,
  onFullscreenChanged: (Boolean) -> Unit,
) {
  val uiState by viewModel.uiState.collectAsStateWithLifecycle()
  val pendingEngineConfig by viewModel.pendingEngineConfigJson.collectAsStateWithLifecycle()
  val pendingResetEvent by viewModel.pendingResetPlayerEvent.collectAsStateWithLifecycle()
  val activityContext = LocalContext.current
  var webViewRef by remember { mutableStateOf<WebView?>(null) }

  LaunchedEffect(Unit) {
    viewModel.attemptAutoSignIn(activityContext)
  }

  LaunchedEffect(uiState.snapshot.settings.fullscreen) {
    onFullscreenChanged(uiState.snapshot.settings.fullscreen)
  }

  fun evalJs(script: String) {
    webViewRef?.post {
      webViewRef?.evaluateJavascript(script, null)
    }
  }

  fun pushPhotoToGame(targetType: String, targetId: String, dataUrl: String?) {
    evalJs(
      "window.CityGameAPI && window.CityGameAPI.applyCustomPhoto(${JSONObject.quote(targetType)}, ${JSONObject.quote(targetId)}, ${if (dataUrl != null) JSONObject.quote(dataUrl) else "null"});"
    )
  }

  fun pushOwnerConfigToEngine(configJson: String, isPreview: Boolean) {
    evalJs(
      "window.CityGameAPI && window.CityGameAPI.applyOwnerConfig(${JSONObject.quote(configJson)}, $isPreview);"
    )
  }

  LaunchedEffect(pendingEngineConfig) {
    val pair = pendingEngineConfig ?: return@LaunchedEffect
    pushOwnerConfigToEngine(pair.first, pair.second)
    viewModel.consumePendingEngineConfig()
  }

  LaunchedEffect(pendingResetEvent) {
    if (pendingResetEvent > 0L) {
      evalJs("window.CityGameAPI && window.CityGameAPI.ownerAction('reset_player_progress', '{}');")
      viewModel.consumePendingResetPlayerEvent()
    }
  }

  // Pressing system Back toggles in-game Pause Menu when studio sheet is closed
  BackHandler(enabled = !uiState.isSheetOpen && !uiState.isCurrentPlayerBanned) {
    evalJs("window.CityGameAPI && window.CityGameAPI.togglePause();")
  }

  val photoPickerLauncher =
    rememberLauncherForActivityResult(contract = ActivityResultContracts.PickVisualMedia()) { uri ->
      if (uri != null) {
        viewModel.handlePickedPhoto(uri) { targetType, targetId, dataUrl ->
          pushPhotoToGame(targetType, targetId, dataUrl)
        }
      }
    }

  fun launchPhotoPicker(targetType: String, targetId: String) {
    viewModel.pendingPhotoRequest = PhotoPickerRequest(targetType, targetId)
    photoPickerLauncher.launch(
      PickVisualMediaRequest(ActivityResultContracts.PickVisualMedia.ImageOnly)
    )
  }

  val bridge =
    remember(viewModel) {
      object {
        @JavascriptInterface
        fun openStudioSheet(tabName: String, snapshotJson: String?) {
          var subTab = "story"
          val tab =
            when (tabName.lowercase()) {
              "inventory" -> StudioTab.INVENTORY
              "billboards" -> StudioTab.BILLBOARDS
              "garage" -> StudioTab.GARAGE
              "combat" -> StudioTab.COMBAT
              "missions" -> StudioTab.MISSIONS
              "missions_story" -> {
                subTab = "story"
                StudioTab.MISSIONS
              }
              "missions_free" -> {
                subTab = "free"
                StudioTab.MISSIONS
              }
              "maps" -> StudioTab.MAPS
              "settings" -> StudioTab.SETTINGS
              "world" -> StudioTab.WORLD
              "owner" -> StudioTab.OWNER
              else -> StudioTab.WARDROBE
            }
          viewModel.openStudio(tab, snapshotJson, subTab)
        }

        @JavascriptInterface
        fun openPhotoPicker(targetType: String, targetId: String) {
          webViewRef?.post { launchPhotoPicker(targetType, targetId) }
        }

        @JavascriptInterface
        fun saveGameState(json: String) {
          viewModel.repository.saveGameStateJson(json)
        }

        @JavascriptInterface
        fun loadGameState(): String {
          return viewModel.repository.loadGameStateJson()
        }

        @JavascriptInterface
        fun syncStateSnapshot(json: String) {
          viewModel.syncSnapshot(json)
        }

        @JavascriptInterface
        fun requestInitialCustomPhotos() {
          webViewRef?.post {
            val st = viewModel.uiState.value
            val effectiveCfg = if (st.isPreviewActive) st.draftConfig else st.publishedConfig
            pushOwnerConfigToEngine(
              effectiveCfg.normalized(st.isOwnerUnlocked).toJson(),
              st.isPreviewActive,
            )
            st.customCharacterDataUrls.forEach { (id, url) ->
              pushPhotoToGame("character", id, url)
            }
            st.customBillboardDataUrls.forEach { (id, url) ->
              pushPhotoToGame("billboard", id, url)
            }
            st.customVehicleDataUrls.forEach { (kind, url) ->
              pushPhotoToGame("vehicle", kind, url)
            }
          }
        }
      }
    }

  Box(
    modifier =
      Modifier.fillMaxSize()
        .background(MidnightSlate)
        .windowInsetsPadding(WindowInsets.displayCutout),
  ) {
    AndroidView(
      modifier = Modifier.fillMaxSize(),
      factory = { context ->
        WebView(context).apply {
          setLayerType(View.LAYER_TYPE_HARDWARE, null)
          setBackgroundColor(android.graphics.Color.parseColor("#0A101D"))
          settings.javaScriptEnabled = true
          settings.domStorageEnabled = true
          settings.allowFileAccess = true
          settings.mediaPlaybackRequiresUserGesture = false
          settings.useWideViewPort = true
          settings.loadWithOverviewMode = true
          settings.cacheMode = WebSettings.LOAD_DEFAULT
          isHorizontalScrollBarEnabled = false
          isVerticalScrollBarEnabled = false
          overScrollMode = View.OVER_SCROLL_NEVER

          webViewClient = WebViewClient()
          webChromeClient = WebChromeClient()
          addJavascriptInterface(bridge, "AndroidBridge")
          loadUrl("file:///android_asset/citylife/index.html")
          webViewRef = this
        }
      },
      update = { view -> webViewRef = view },
    )

    if (uiState.isCurrentPlayerBanned) {
      Surface(
        color = MidnightSlate.copy(alpha = 0.96f),
        modifier = Modifier.fillMaxSize().testTag("player_banned_overlay"),
      ) {
        Box(
          modifier = Modifier.fillMaxSize().padding(24.dp),
          contentAlignment = Alignment.Center,
        ) {
          Card(
            colors = CardDefaults.cardColors(containerColor = AsphaltSurface),
            shape = RoundedCornerShape(20.dp),
            modifier = Modifier.widthIn(max = 460.dp).fillMaxWidth(),
          ) {
            Column(
              modifier = Modifier.fillMaxWidth().padding(24.dp),
              horizontalAlignment = Alignment.CenterHorizontally,
              verticalArrangement = Arrangement.spacedBy(12.dp),
            ) {
              Icon(
                imageVector = Icons.Rounded.Block,
                contentDescription = "Account Suspended",
                tint = CrimsonSiren,
                modifier = Modifier.size(48.dp),
              )
              Text(
                text = "Account Suspended",
                style = MaterialTheme.typography.headlineSmall,
                color = CrimsonSiren,
                fontWeight = FontWeight.Bold,
              )
              Text(
                text = "This account (${uiState.authUser.email.ifBlank { "Player" }}) has been suspended by the game owner. Contact the administrator or sign out.",
                style = MaterialTheme.typography.bodyMedium,
                color = MutedSteel,
                textAlign = TextAlign.Center,
              )
              Spacer(Modifier.height(4.dp))
              Button(
                onClick = {
                  viewModel.signOutOwner {
                    evalJs("window.CityGameAPI && window.CityGameAPI.ownerAction('set_unlocked', 'false');")
                  }
                },
                colors = ButtonDefaults.buttonColors(containerColor = CrimsonSiren, contentColor = Color.White),
                modifier = Modifier.fillMaxWidth().testTag("banned_sign_out_btn"),
              ) {
                Icon(Icons.AutoMirrored.Rounded.Logout, contentDescription = null, modifier = Modifier.size(18.dp))
                Text("  Sign Out", fontWeight = FontWeight.Bold)
              }
            }
          }
        }
      }
    }
  }

  val ownerCallbacks =
    remember(viewModel) {
      OwnerDashboardCallbacks(
        onSelectSection = { section -> viewModel.selectOwnerSection(section) },
        onSignInGoogle = { viewModel.signInWithGoogle(activityContext) },
        onSignOut = {
          viewModel.signOutOwner {
            evalJs("window.CityGameAPI && window.CityGameAPI.ownerAction('set_unlocked', 'false');")
          }
        },
        onClaimPasscode = { passcode ->
          val ok = viewModel.claimOwnerPasscode(passcode)
          if (ok) {
            evalJs("window.CityGameAPI && window.CityGameAPI.ownerAction('set_unlocked', 'true');")
          }
          ok
        },
        onUnlockOwner = { passcode ->
          val ok = viewModel.unlockOwner(passcode)
          if (ok) {
            evalJs("window.CityGameAPI && window.CityGameAPI.ownerAction('set_unlocked', 'true');")
          }
          ok
        },
        onChangePasscode = { current, next -> viewModel.changeOwnerPasscode(current, next) },
        onLockOwner = {
          viewModel.lockOwner()
          evalJs("window.CityGameAPI && window.CityGameAPI.ownerAction('set_unlocked', 'false');")
        },
        onUpdateDraft = { transform -> viewModel.updateDraftConfig(transform) },
        onSaveDraft = { viewModel.saveDraftChanges() },
        onPreviewDraft = {
          viewModel.previewDraftChanges { configJson, isPreview ->
            pushOwnerConfigToEngine(configJson, isPreview)
          }
        },
        onPublishDraft = { label ->
          viewModel.publishDraftChanges(label) { configJson, isPreview ->
            pushOwnerConfigToEngine(configJson, isPreview)
          }
        },
        onCancelDraft = {
          viewModel.cancelDraftChanges { configJson, isPreview ->
            pushOwnerConfigToEngine(configJson, isPreview)
          }
        },
        onRestoreHistory = { snap ->
          viewModel.restoreHistorySnapshot(snap) { configJson, isPreview ->
            pushOwnerConfigToEngine(configJson, isPreview)
          }
        },
        onRestoreCloudBackup = { backup ->
          viewModel.restoreCloudBackup(backup) { configJson, isPreview ->
            pushOwnerConfigToEngine(configJson, isPreview)
          }
        },
        onDeleteCloudBackup = { backupId -> viewModel.deleteCloudBackup(backupId) },
        onExportBackupJson = { viewModel.exportDraftBackupJson() },
        onImportBackupJson = { json ->
          viewModel.importBackupJson(json) { configJson, isPreview ->
            pushOwnerConfigToEngine(configJson, isPreview)
          }
        },
        onUpsertCustomMission = { dto ->
          evalJs(
            "window.CityGameAPI && window.CityGameAPI.upsertCustomMission(${JSONObject.quote(dto.toJson())});"
          )
        },
        onDeleteCustomMission = { missionId ->
          evalJs(
            "window.CityGameAPI && window.CityGameAPI.deleteCustomMission(${JSONObject.quote(missionId)});"
          )
        },
        onStartMission = { missionId ->
          evalJs(
            "window.CityGameAPI && window.CityGameAPI.openMissionBriefing(${JSONObject.quote(missionId)});"
          )
        },
        onOwnerAction = { action, payloadJson ->
          evalJs(
            "window.CityGameAPI && window.CityGameAPI.ownerAction(${JSONObject.quote(action)}, ${JSONObject.quote(payloadJson)});"
          )
        },
        onOpenMapEditor = {
          viewModel.closeStudio()
          evalJs("window.CityGameAPI && window.CityGameAPI.openMapModal('map');")
        },
        onPickPhoto = { targetType, targetId -> launchPhotoPicker(targetType, targetId) },
        onClearPhoto = { targetType, targetId ->
          viewModel.clearCustomPhoto(targetType, targetId) { t, id ->
            pushPhotoToGame(t, id, null)
          }
        },
        onTogglePlayerBan = { player -> viewModel.togglePlayerBan(player) },
        onResetCloudPlayer = { player -> viewModel.resetCloudPlayer(player) },
        onResetLocalProgress = {
          evalJs("window.CityGameAPI && window.CityGameAPI.ownerAction('reset_player_progress', '{}');")
        },
        onClearStatusBanner = { viewModel.clearStatusBanner() },
      )
    }

  if (uiState.isSheetOpen && !uiState.isCurrentPlayerBanned) {
    CityStudioSheet(
      state = uiState,
      onDismiss = { viewModel.closeStudio() },
      onSelectTab = { viewModel.selectTab(it) },
      onSelectCharacter = { charId ->
        viewModel.selectCharacterProfile(charId)
        evalJs("window.CityGameAPI && window.CityGameAPI.setCharacter(${JSONObject.quote(charId)});")
      },
      onSelectOutfit = { outfitId, skinHex, hairHex ->
        evalJs(
          "window.CityGameAPI && window.CityGameAPI.setOutfit(${JSONObject.quote(outfitId)}, ${JSONObject.quote(skinHex)}, ${JSONObject.quote(hairHex)});"
        )
        viewModel.updateOutfitSelection(outfitId, skinHex, hairHex)
      },
      onPickPhoto = { targetType, targetId -> launchPhotoPicker(targetType, targetId) },
      onClearPhoto = { targetType, targetId ->
        viewModel.clearCustomPhoto(targetType, targetId) { t, id ->
          pushPhotoToGame(t, id, null)
        }
      },
      onGarageAction = { action, param ->
        evalJs(
          "window.CityGameAPI && window.CityGameAPI.garageAction(${JSONObject.quote(action)}, ${JSONObject.quote(param)});"
        )
      },
      onCombatAction = { action, param ->
        evalJs(
          "window.CityGameAPI && window.CityGameAPI.combatAction(${JSONObject.quote(action)}, ${JSONObject.quote(param)});"
        )
      },
      onStartMission = { missionId ->
        evalJs(
          "window.CityGameAPI && window.CityGameAPI.openMissionBriefing(${JSONObject.quote(missionId)});"
        )
      },
      onClaimReward = { missionId ->
        evalJs(
          "window.CityGameAPI && window.CityGameAPI.claimMissionReward(${JSONObject.quote(missionId)});"
        )
      },
      onRestartMission = {
        evalJs("window.CityGameAPI && window.CityGameAPI.restartActiveMission();")
      },
      onAbortMission = {
        evalJs("window.CityGameAPI && window.CityGameAPI.abortMission();")
      },
      onSelectCity = { cityId ->
        viewModel.setSelectedCity(cityId)
        evalJs("window.CityGameAPI && window.CityGameAPI.selectCity(${JSONObject.quote(cityId)});")
      },
      onOpenMapModal = { mode ->
        evalJs("window.CityGameAPI && window.CityGameAPI.openMapModal(${JSONObject.quote(mode)});")
      },
      onUpdateSettings = { newSettings ->
        viewModel.updateSettings(newSettings)
        evalJs(
          "window.CityGameAPI && window.CityGameAPI.setSettings(${JSONObject.quote(newSettings.toJson())});"
        )
      },
      onOpenControlEditor = {
        evalJs("window.CityGameAPI && window.CityGameAPI.openControlEditor();")
      },
      onResetControls = {
        viewModel.resetControlsLayout()
        evalJs("window.CityGameAPI && window.CityGameAPI.resetCustomControls();")
      },
      onSaveNow = {
        evalJs("window.CityGameAPI && window.CityGameAPI.saveNow();")
      },
      onSetTimeMode = { mode ->
        viewModel.setTimeMode(mode)
        evalJs("window.CityGameAPI && window.CityGameAPI.setTimeMode(${JSONObject.quote(mode)});")
      },
      onSetWeather = { weather ->
        evalJs("window.CityGameAPI && window.CityGameAPI.setWeather(${JSONObject.quote(weather)});")
        viewModel.updateWeather(weather)
      },
      ownerCallbacks = ownerCallbacks,
    )
  }
}
