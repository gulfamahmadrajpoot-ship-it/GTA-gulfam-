package com.example

import android.graphics.BitmapFactory
import android.util.Base64
import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.horizontalScroll
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.rounded.Logout
import androidx.compose.material.icons.rounded.AccountCircle
import androidx.compose.material.icons.rounded.AdminPanelSettings
import androidx.compose.material.icons.rounded.Campaign
import androidx.compose.material.icons.rounded.Close
import androidx.compose.material.icons.rounded.CloudUpload
import androidx.compose.material.icons.rounded.Dashboard
import androidx.compose.material.icons.rounded.DirectionsCar
import androidx.compose.material.icons.rounded.Flag
import androidx.compose.material.icons.rounded.Group
import androidx.compose.material.icons.rounded.Key
import androidx.compose.material.icons.rounded.LocalPolice
import androidx.compose.material.icons.rounded.Lock
import androidx.compose.material.icons.rounded.LockOpen
import androidx.compose.material.icons.rounded.Map
import androidx.compose.material.icons.rounded.Person
import androidx.compose.material.icons.rounded.Security
import androidx.compose.material.icons.rounded.Tune
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.FilterChip
import androidx.compose.material3.FilterChipDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.ImageBitmap
import androidx.compose.ui.graphics.asImageBitmap
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.PasswordVisualTransformation
import androidx.compose.ui.unit.dp
import com.example.ui.theme.AsphaltSurface
import com.example.ui.theme.CrimsonSiren
import com.example.ui.theme.ElevatedConcrete
import com.example.ui.theme.EmeraldSignal
import com.example.ui.theme.HairlineBorder
import com.example.ui.theme.MidnightSlate
import com.example.ui.theme.MutedSteel
import com.example.ui.theme.SkyCyan
import com.example.ui.theme.WarmAmber

data class OwnerDashboardCallbacks(
  val onSelectSection: (OwnerDashboardSection) -> Unit,
  val onSignInGoogle: () -> Unit,
  val onSignOut: () -> Unit,
  val onClaimPasscode: (String) -> Boolean,
  val onUnlockOwner: (String) -> Boolean,
  val onChangePasscode: (current: String, next: String) -> String?,
  val onLockOwner: () -> Unit,
  val onUpdateDraft: ((OwnerConfigDto) -> OwnerConfigDto) -> Unit,
  val onSaveDraft: () -> Unit,
  val onPreviewDraft: () -> Unit,
  val onPublishDraft: (String) -> Unit,
  val onCancelDraft: () -> Unit,
  val onRestoreHistory: (OwnerConfigSnapshotDto) -> Unit,
  val onRestoreCloudBackup: (CloudBackupRecord) -> Unit,
  val onDeleteCloudBackup: (String) -> Unit,
  val onExportBackupJson: () -> String,
  val onImportBackupJson: (String) -> String?,
  val onUpsertCustomMission: (CustomMissionDto) -> Unit,
  val onDeleteCustomMission: (String) -> Unit,
  val onStartMission: (String) -> Unit,
  val onOwnerAction: (action: String, payloadJson: String) -> Unit,
  val onOpenMapEditor: () -> Unit,
  val onPickPhoto: (targetType: String, targetId: String) -> Unit,
  val onClearPhoto: (targetType: String, targetId: String) -> Unit,
  val onTogglePlayerBan: (PlayerAccountRecord) -> Unit,
  val onResetCloudPlayer: (PlayerAccountRecord) -> Unit,
  val onResetLocalProgress: () -> Unit,
  val onClearStatusBanner: () -> Unit,
)

@Composable
fun rememberOwnerBase64Bitmap(dataUrl: String?): ImageBitmap? {
  return remember(dataUrl) {
    if (dataUrl.isNullOrBlank()) return@remember null
    try {
      val base64Part = dataUrl.substringAfter("base64,", dataUrl)
      val bytes = Base64.decode(base64Part, Base64.DEFAULT)
      BitmapFactory.decodeByteArray(bytes, 0, bytes.size)?.asImageBitmap()
    } catch (_: Exception) {
      null
    }
  }
}

@Composable
fun OwnerStatMetricTile(
  label: String,
  value: String,
  accent: Color,
  modifier: Modifier = Modifier,
) {
  Card(
    colors = CardDefaults.cardColors(containerColor = ElevatedConcrete),
    border = BorderStroke(1.dp, accent.copy(alpha = 0.4f)),
    shape = RoundedCornerShape(12.dp),
    modifier = modifier,
  ) {
    Column(modifier = Modifier.padding(10.dp), verticalArrangement = Arrangement.spacedBy(2.dp)) {
      Text(label, style = MaterialTheme.typography.labelSmall, color = MutedSteel)
      Text(value, style = MaterialTheme.typography.titleMedium, color = accent, fontWeight = FontWeight.Bold)
    }
  }
}

@Composable
fun OwnerTabContent(
  state: CityStudioUiState,
  cb: OwnerDashboardCallbacks,
) {
  var passcodeInput by remember { mutableStateOf("") }
  var confirmInput by remember { mutableStateOf("") }
  var authError by remember { mutableStateOf<String?>(null) }

  // Gate 1: Verified Google Sign-In + Admin Authorization
  if (!state.authUser.isSignedIn || !state.authUser.isAdmin) {
    LazyColumn(
      verticalArrangement = Arrangement.spacedBy(12.dp),
      contentPadding = PaddingValues(bottom = 16.dp),
    ) {
      item {
        Card(
          colors = CardDefaults.cardColors(containerColor = AsphaltSurface),
          border = BorderStroke(1.dp, WarmAmber.copy(alpha = 0.6f)),
          shape = RoundedCornerShape(16.dp),
        ) {
          Column(modifier = Modifier.fillMaxWidth().padding(16.dp), verticalArrangement = Arrangement.spacedBy(10.dp)) {
            Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(10.dp)) {
              Icon(Icons.Rounded.Security, contentDescription = null, tint = WarmAmber, modifier = Modifier.size(30.dp))
              Column {
                Text("Owner Authentication Required", style = MaterialTheme.typography.titleMedium, color = WarmAmber)
                Text(
                  text = if (!state.authUser.isSignedIn) {
                    "Sign in with the verified Owner Google account to access City Life administrative controls. Regular players cannot unlock this panel."
                  } else {
                    "Signed in as ${state.authUser.email} (Standard Player). Owner controls are strictly restricted to the verified game owner."
                  },
                  style = MaterialTheme.typography.bodyMedium,
                  color = if (state.authUser.isSignedIn) CrimsonSiren else MutedSteel,
                )
              }
            }

            state.authMessage?.let { msg ->
              Text(msg, style = MaterialTheme.typography.bodySmall, color = SkyCyan)
            }

            if (!state.authUser.isSignedIn) {
              Button(
                onClick = cb.onSignInGoogle,
                enabled = !state.authLoading,
                colors = ButtonDefaults.buttonColors(containerColor = WarmAmber, contentColor = MidnightSlate),
                modifier = Modifier.fillMaxWidth().testTag("owner_google_signin_btn"),
              ) {
                if (state.authLoading) {
                  CircularProgressIndicator(modifier = Modifier.size(18.dp), strokeWidth = 2.dp, color = MidnightSlate)
                  Spacer(Modifier.width(8.dp))
                  Text("Verifying...")
                } else {
                  Icon(Icons.Rounded.AccountCircle, contentDescription = null, modifier = Modifier.size(18.dp))
                  Spacer(Modifier.width(8.dp))
                  Text("Sign In with Google (Owner)")
                }
              }
            } else {
              OutlinedButton(
                onClick = cb.onSignOut,
                modifier = Modifier.fillMaxWidth().testTag("owner_switch_account_btn"),
              ) {
                Icon(Icons.AutoMirrored.Rounded.Logout, contentDescription = null, modifier = Modifier.size(18.dp))
                Spacer(Modifier.width(8.dp))
                Text("Sign Out & Switch Account")
              }
            }
          }
        }
      }
    }
    return
  }

  // Gate 2: Secondary Salted SHA-256 Owner Passcode
  if (!state.isOwnerUnlocked) {
    LazyColumn(
      verticalArrangement = Arrangement.spacedBy(12.dp),
      contentPadding = PaddingValues(bottom = 16.dp),
    ) {
      item {
        Card(
          colors = CardDefaults.cardColors(containerColor = AsphaltSurface),
          border = BorderStroke(1.dp, EmeraldSignal.copy(alpha = 0.6f)),
          shape = RoundedCornerShape(16.dp),
        ) {
          Column(modifier = Modifier.fillMaxWidth().padding(16.dp), verticalArrangement = Arrangement.spacedBy(10.dp)) {
            Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween, verticalAlignment = Alignment.CenterVertically) {
              Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                Icon(Icons.Rounded.Lock, contentDescription = null, tint = WarmAmber, modifier = Modifier.size(26.dp))
                Column {
                  Text(
                    text = if (state.isOwnerPasscodeConfigured) "Enter Owner Passcode" else "Claim Owner Passcode",
                    style = MaterialTheme.typography.titleMedium,
                    color = WarmAmber,
                  )
                  Text("Verified Owner: ${state.authUser.email}", style = MaterialTheme.typography.labelSmall, color = EmeraldSignal)
                }
              }
              OutlinedButton(onClick = cb.onSignOut) {
                Icon(Icons.AutoMirrored.Rounded.Logout, contentDescription = null, modifier = Modifier.size(16.dp))
                Spacer(Modifier.width(4.dp))
                Text("Logout")
              }
            }

            OutlinedTextField(
              value = passcodeInput,
              onValueChange = {
                passcodeInput = it
                authError = null
              },
              label = { Text("Owner Passcode") },
              singleLine = true,
              visualTransformation = PasswordVisualTransformation(),
              modifier = Modifier.fillMaxWidth().testTag("owner_passcode_input"),
            )

            if (!state.isOwnerPasscodeConfigured) {
              OutlinedTextField(
                value = confirmInput,
                onValueChange = {
                  confirmInput = it
                  authError = null
                },
                label = { Text("Confirm Passcode (4+ chars)") },
                singleLine = true,
                visualTransformation = PasswordVisualTransformation(),
                modifier = Modifier.fillMaxWidth().testTag("owner_confirm_input"),
              )
            }

            if (authError != null) {
              Text(authError!!, style = MaterialTheme.typography.bodyMedium, color = CrimsonSiren)
            }

            Button(
              onClick = {
                val p = passcodeInput.trim()
                if (!state.isOwnerPasscodeConfigured) {
                  if (p.length < 4) {
                    authError = "Passcode must be at least 4 characters."
                  } else if (p != confirmInput.trim()) {
                    authError = "Passcodes do not match."
                  } else if (cb.onClaimPasscode(p)) {
                    passcodeInput = ""
                    confirmInput = ""
                    authError = null
                  } else {
                    authError = "Unable to claim owner passcode."
                  }
                } else {
                  if (cb.onUnlockOwner(p)) {
                    passcodeInput = ""
                    authError = null
                  } else {
                    authError = "Incorrect owner passcode."
                  }
                }
              },
              colors = ButtonDefaults.buttonColors(containerColor = WarmAmber, contentColor = MidnightSlate),
              modifier = Modifier.fillMaxWidth().testTag("owner_unlock_btn"),
            ) {
              Icon(Icons.Rounded.LockOpen, contentDescription = null, modifier = Modifier.size(18.dp))
              Spacer(Modifier.width(8.dp))
              Text(if (state.isOwnerPasscodeConfigured) "Unlock Dashboard" else "Save & Unlock Dashboard")
            }
          }
        }
      }
    }
    return
  }

  // Unlocked 10-Section Dark Gaming Owner Control Dashboard
  var showChangePassword by remember { mutableStateOf(false) }
  var curPass by remember { mutableStateOf("") }
  var newPass by remember { mutableStateOf("") }
  var changePassErr by remember { mutableStateOf<String?>(null) }

  if (showChangePassword) {
    AlertDialog(
      onDismissRequest = { showChangePassword = false },
      containerColor = MidnightSlate,
      title = { Text("Change Owner Passcode", color = WarmAmber) },
      text = {
        Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
          OutlinedTextField(
            value = curPass,
            onValueChange = { curPass = it; changePassErr = null },
            label = { Text("Current Passcode") },
            singleLine = true,
            visualTransformation = PasswordVisualTransformation(),
            modifier = Modifier.fillMaxWidth(),
          )
          OutlinedTextField(
            value = newPass,
            onValueChange = { newPass = it; changePassErr = null },
            label = { Text("New Passcode (4+ chars)") },
            singleLine = true,
            visualTransformation = PasswordVisualTransformation(),
            modifier = Modifier.fillMaxWidth(),
          )
          if (changePassErr != null) {
            Text(changePassErr!!, style = MaterialTheme.typography.bodySmall, color = CrimsonSiren)
          }
        }
      },
      confirmButton = {
        Button(onClick = {
          val err = cb.onChangePasscode(curPass, newPass)
          if (err == null) {
            showChangePassword = false
            curPass = ""
            newPass = ""
          } else {
            changePassErr = err
          }
        }) { Text("Update Password") }
      },
      dismissButton = {
        OutlinedButton(onClick = { showChangePassword = false }) { Text("Cancel") }
      },
    )
  }

  Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
    // Session Top Bar
    Card(
      colors = CardDefaults.cardColors(containerColor = ElevatedConcrete),
      border = BorderStroke(1.dp, EmeraldSignal.copy(alpha = 0.55f)),
      shape = RoundedCornerShape(14.dp),
    ) {
      Row(
        modifier = Modifier.fillMaxWidth().padding(horizontal = 12.dp, vertical = 8.dp),
        horizontalArrangement = Arrangement.SpaceBetween,
        verticalAlignment = Alignment.CenterVertically,
      ) {
        Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(8.dp), modifier = Modifier.weight(1f)) {
          Icon(Icons.Rounded.AdminPanelSettings, contentDescription = null, tint = EmeraldSignal)
          Column {
            Text("OWNER CONTROL PANEL", style = MaterialTheme.typography.labelLarge, color = EmeraldSignal, fontWeight = FontWeight.Bold)
            Text("v${state.publishedConfig.version} · ${state.authUser.email}", style = MaterialTheme.typography.labelSmall, color = MutedSteel, maxLines = 1)
          }
        }
        IconButton(onClick = { showChangePassword = true }, modifier = Modifier.testTag("owner_change_password_btn")) {
          Icon(Icons.Rounded.Key, contentDescription = "Change Password", tint = SkyCyan)
        }
        IconButton(onClick = cb.onLockOwner, modifier = Modifier.testTag("owner_lock_btn")) {
          Icon(Icons.Rounded.Lock, contentDescription = "Lock Session", tint = WarmAmber)
        }
        IconButton(onClick = cb.onSignOut, modifier = Modifier.testTag("owner_logout_btn")) {
          Icon(Icons.AutoMirrored.Rounded.Logout, contentDescription = "Sign Out", tint = CrimsonSiren)
        }
      }
    }

    // Status Banner / Unsaved Draft & Preview Bar
    state.statusBanner?.let { banner ->
      Surface(color = SkyCyan.copy(alpha = 0.14f), shape = RoundedCornerShape(10.dp), modifier = Modifier.fillMaxWidth()) {
        Row(modifier = Modifier.padding(horizontal = 10.dp, vertical = 6.dp), verticalAlignment = Alignment.CenterVertically) {
          Text(banner, style = MaterialTheme.typography.labelSmall, color = SkyCyan, modifier = Modifier.weight(1f))
          IconButton(onClick = cb.onClearStatusBanner, modifier = Modifier.size(24.dp)) {
            Icon(Icons.Rounded.Close, contentDescription = "Dismiss", tint = SkyCyan, modifier = Modifier.size(16.dp))
          }
        }
      }
    }

    if (state.hasUnsavedDraftChanges || state.isPreviewActive) {
      Surface(
        color = if (state.isPreviewActive) SkyCyan.copy(alpha = 0.16f) else WarmAmber.copy(alpha = 0.16f),
        border = BorderStroke(1.dp, if (state.isPreviewActive) SkyCyan else WarmAmber),
        shape = RoundedCornerShape(12.dp),
        modifier = Modifier.fillMaxWidth(),
      ) {
        Row(
          modifier = Modifier.fillMaxWidth().padding(horizontal = 10.dp, vertical = 6.dp),
          horizontalArrangement = Arrangement.SpaceBetween,
          verticalAlignment = Alignment.CenterVertically,
        ) {
          Text(
            text = if (state.isPreviewActive) "Preview Active (Not Live)" else "Draft Changes Pending",
            style = MaterialTheme.typography.labelMedium,
            color = if (state.isPreviewActive) SkyCyan else WarmAmber,
            fontWeight = FontWeight.Bold,
          )
          Row(horizontalArrangement = Arrangement.spacedBy(6.dp)) {
            OutlinedButton(onClick = cb.onPreviewDraft) { Text("Preview") }
            Button(
              onClick = { cb.onPublishDraft("") },
              colors = ButtonDefaults.buttonColors(containerColor = EmeraldSignal, contentColor = MidnightSlate),
            ) { Text("Publish") }
          }
        }
      }
    }

    // 10-Section Dashboard Navigation Pills
    Row(
      modifier = Modifier.fillMaxWidth().horizontalScroll(rememberScrollState()),
      horizontalArrangement = Arrangement.spacedBy(6.dp),
    ) {
      OwnerDashboardSection.entries.forEach { sec ->
        val selected = state.ownerSection == sec
        val icon = when (sec) {
          OwnerDashboardSection.OVERVIEW -> Icons.Rounded.Dashboard
          OwnerDashboardSection.MAPS -> Icons.Rounded.Map
          OwnerDashboardSection.MISSIONS -> Icons.Rounded.Flag
          OwnerDashboardSection.POLICE -> Icons.Rounded.LocalPolice
          OwnerDashboardSection.VEHICLES -> Icons.Rounded.DirectionsCar
          OwnerDashboardSection.CHARACTERS -> Icons.Rounded.Person
          OwnerDashboardSection.ADVERTISEMENTS -> Icons.Rounded.Campaign
          OwnerDashboardSection.PLAYERS -> Icons.Rounded.Group
          OwnerDashboardSection.SETTINGS -> Icons.Rounded.Tune
          OwnerDashboardSection.SAVE_PUBLISH -> Icons.Rounded.CloudUpload
        }
        FilterChip(
          selected = selected,
          onClick = { cb.onSelectSection(sec) },
          label = { Text(sec.label, fontWeight = FontWeight.SemiBold) },
          leadingIcon = { Icon(icon, contentDescription = null, modifier = Modifier.size(16.dp)) },
          colors = FilterChipDefaults.filterChipColors(
            selectedContainerColor = SkyCyan,
            selectedLabelColor = MidnightSlate,
            selectedLeadingIconColor = MidnightSlate,
            containerColor = AsphaltSurface,
            labelColor = Color.White,
          ),
          modifier = Modifier.testTag("owner_sec_${sec.name.lowercase()}"),
        )
      }
    }

    // Active Section View
    when (state.ownerSection) {
      OwnerDashboardSection.OVERVIEW -> OwnerOverviewSection(state, cb)
      OwnerDashboardSection.MAPS -> OwnerMapsSection(state, cb)
      OwnerDashboardSection.MISSIONS -> OwnerMissionsSection(state, cb)
      OwnerDashboardSection.POLICE -> OwnerPoliceSection(state, cb)
      OwnerDashboardSection.VEHICLES -> OwnerVehiclesSection(state, cb)
      OwnerDashboardSection.CHARACTERS -> OwnerCharactersSection(state, cb)
      OwnerDashboardSection.ADVERTISEMENTS -> OwnerAdsSection(state, cb)
      OwnerDashboardSection.PLAYERS -> OwnerPlayersSection(state, cb)
      OwnerDashboardSection.SETTINGS -> OwnerGameSettingsSection(state, cb)
      OwnerDashboardSection.SAVE_PUBLISH -> OwnerSavePublishSection(state, cb)
    }
  }
}
