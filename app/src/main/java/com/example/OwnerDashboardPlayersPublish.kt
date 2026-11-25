package com.example

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
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.rounded.Backup
import androidx.compose.material.icons.rounded.Block
import androidx.compose.material.icons.rounded.Cancel
import androidx.compose.material.icons.rounded.CheckCircle
import androidx.compose.material.icons.rounded.CloudUpload
import androidx.compose.material.icons.rounded.Delete
import androidx.compose.material.icons.rounded.Download
import androidx.compose.material.icons.rounded.History
import androidx.compose.material.icons.rounded.Person
import androidx.compose.material.icons.rounded.Preview
import androidx.compose.material.icons.rounded.RestartAlt
import androidx.compose.material.icons.rounded.Save
import androidx.compose.material.icons.rounded.Upload
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.FilterChip
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Slider
import androidx.compose.material3.SliderDefaults
import androidx.compose.material3.Surface
import androidx.compose.material3.Switch
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalClipboardManager
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.AnnotatedString
import androidx.compose.ui.text.font.FontWeight
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
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale
import kotlin.math.roundToInt

@Composable
fun OwnerPlayersSection(
  state: CityStudioUiState,
  cb: OwnerDashboardCallbacks,
) {
  var confirmResetPlayer by remember { mutableStateOf<PlayerAccountRecord?>(null) }

  confirmResetPlayer?.let { p ->
    AlertDialog(
      onDismissRequest = { confirmResetPlayer = null },
      containerColor = MidnightSlate,
      title = { Text("Reset Player Progress?", color = CrimsonSiren) },
      text = {
        Text("This resets ${p.displayName}'s cash to $${state.publishedConfig.economy.startingCash}, XP to 0, and completed missions to 0.")
      },
      confirmButton = {
        Button(
          onClick = {
            cb.onResetCloudPlayer(p)
            confirmResetPlayer = null
          },
          colors = ButtonDefaults.buttonColors(containerColor = CrimsonSiren),
        ) { Text("Reset Account") }
      },
      dismissButton = {
        OutlinedButton(onClick = { confirmResetPlayer = null }) { Text("Cancel") }
      },
    )
  }

  LazyColumn(
    verticalArrangement = Arrangement.spacedBy(10.dp),
    contentPadding = PaddingValues(bottom = 16.dp),
  ) {
    item {
      Card(
        colors = CardDefaults.cardColors(containerColor = AsphaltSurface),
        border = BorderStroke(1.dp, SkyCyan.copy(alpha = 0.5f)),
        shape = RoundedCornerShape(16.dp),
      ) {
        Column(modifier = Modifier.fillMaxWidth().padding(14.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
          Text("Player Accounts & Moderation", style = MaterialTheme.typography.titleMedium, color = SkyCyan)
          Text(
            text = "Manage registered player profiles (no sensitive emails or credentials displayed). Ban/unban accounts or reset player progression.",
            style = MaterialTheme.typography.bodySmall,
            color = MutedSteel,
          )
          OutlinedButton(
            onClick = cb.onResetLocalProgress,
            modifier = Modifier.fillMaxWidth(),
          ) {
            Icon(Icons.Rounded.RestartAlt, contentDescription = null, modifier = Modifier.size(16.dp))
            Spacer(Modifier.width(6.dp))
            Text("Reset Active Device Game Progress")
          }
        }
      }
    }

    if (state.registeredPlayers.isEmpty()) {
      item {
        Card(
          colors = CardDefaults.cardColors(containerColor = AsphaltSurface),
          border = BorderStroke(1.dp, HairlineBorder),
          shape = RoundedCornerShape(14.dp),
        ) {
          Text(
            text = "No cloud-synced players registered yet. Signed-in players appear here automatically.",
            style = MaterialTheme.typography.bodyMedium,
            color = MutedSteel,
            modifier = Modifier.padding(14.dp),
          )
        }
      }
    } else {
      items(state.registeredPlayers, key = { "pl_${it.id}" }) { pl ->
        Card(
          colors = CardDefaults.cardColors(containerColor = AsphaltSurface),
          border = BorderStroke(1.dp, if (pl.banned) CrimsonSiren.copy(alpha = 0.7f) else HairlineBorder),
          shape = RoundedCornerShape(14.dp),
        ) {
          Column(modifier = Modifier.fillMaxWidth().padding(12.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
            Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(10.dp)) {
              Icon(Icons.Rounded.Person, contentDescription = null, tint = if (pl.banned) CrimsonSiren else EmeraldSignal)
              Column(modifier = Modifier.weight(1f)) {
                Text(pl.displayName, style = MaterialTheme.typography.titleMedium)
                Text(
                  text = "Lv.${pl.level} · $${pl.cash} · ${pl.xp} XP · City: ${pl.selectedCityId} · Missions: ${pl.completedMissionsCount}",
                  style = MaterialTheme.typography.labelSmall,
                  color = MutedSteel,
                )
              }
              Surface(
                color = if (pl.banned) CrimsonSiren.copy(alpha = 0.2f) else EmeraldSignal.copy(alpha = 0.16f),
                shape = RoundedCornerShape(99.dp),
              ) {
                Text(
                  text = if (pl.banned) "BANNED" else "ACTIVE",
                  style = MaterialTheme.typography.labelSmall,
                  color = if (pl.banned) CrimsonSiren else EmeraldSignal,
                  fontWeight = FontWeight.Bold,
                  modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp),
                )
              }
            }
            Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
              OutlinedButton(
                onClick = { cb.onTogglePlayerBan(pl) },
                modifier = Modifier.weight(1f),
              ) {
                Icon(Icons.Rounded.Block, contentDescription = null, modifier = Modifier.size(16.dp), tint = if (pl.banned) EmeraldSignal else CrimsonSiren)
                Spacer(Modifier.width(6.dp))
                Text(if (pl.banned) "Unban" else "Ban Player")
              }
              OutlinedButton(
                onClick = { confirmResetPlayer = pl },
                modifier = Modifier.weight(1f),
              ) {
                Icon(Icons.Rounded.RestartAlt, contentDescription = null, modifier = Modifier.size(16.dp))
                Spacer(Modifier.width(6.dp))
                Text("Reset Stats")
              }
            }
          }
        }
      }
    }
  }
}

@Composable
fun OwnerGameSettingsSection(
  state: CityStudioUiState,
  cb: OwnerDashboardCallbacks,
) {
  val ws = state.draftConfig.worldSettings
  val econ = state.draftConfig.economy

  LazyColumn(
    verticalArrangement = Arrangement.spacedBy(10.dp),
    contentPadding = PaddingValues(bottom = 16.dp),
  ) {
    // 1. World, Time, Weather, Density & Graphics
    item {
      Card(
        colors = CardDefaults.cardColors(containerColor = AsphaltSurface),
        border = BorderStroke(1.dp, WarmAmber.copy(alpha = 0.5f)),
        shape = RoundedCornerShape(16.dp),
      ) {
        Column(modifier = Modifier.fillMaxWidth().padding(14.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
          Text("World Environment, Density & Modes", style = MaterialTheme.typography.titleMedium, color = WarmAmber)

          Text("Default Time of Day", style = MaterialTheme.typography.labelLarge, color = MutedSteel)
          Row(modifier = Modifier.fillMaxWidth().horizontalScroll(rememberScrollState()), horizontalArrangement = Arrangement.spacedBy(6.dp)) {
            listOf("cycle" to "24h Cycle", "morning" to "Morning", "noon" to "Noon", "sunset" to "Sunset", "night" to "Night").forEach { (id, lbl) ->
              FilterChip(
                selected = ws.defaultTimeMode == id,
                onClick = { cb.onUpdateDraft { cur -> cur.copy(worldSettings = cur.worldSettings.copy(defaultTimeMode = id)) } },
                label = { Text(lbl) },
              )
            }
          }

          Text("Default Weather & Graphics", style = MaterialTheme.typography.labelLarge, color = MutedSteel)
          Row(horizontalArrangement = Arrangement.spacedBy(6.dp)) {
            listOf("clear" to "Clear Sky", "rain" to "City Rain").forEach { (id, lbl) ->
              FilterChip(
                selected = ws.defaultWeather == id,
                onClick = { cb.onUpdateDraft { cur -> cur.copy(worldSettings = cur.worldSettings.copy(defaultWeather = id)) } },
                label = { Text(lbl) },
              )
            }
            listOf("low" to "Low", "balanced" to "Balanced", "high" to "High").forEach { (id, lbl) ->
              FilterChip(
                selected = ws.defaultGraphicsQuality == id,
                onClick = { cb.onUpdateDraft { cur -> cur.copy(worldSettings = cur.worldSettings.copy(defaultGraphicsQuality = id)) } },
                label = { Text(lbl) },
              )
            }
          }

          Text("Traffic Density: ${(ws.trafficDensity * 100).roundToInt()}%", style = MaterialTheme.typography.bodyMedium)
          Slider(
            value = ws.trafficDensity,
            onValueChange = { v -> cb.onUpdateDraft { cur -> cur.copy(worldSettings = cur.worldSettings.copy(trafficDensity = v)) } },
            valueRange = 0.25f..2.0f,
          )

          Text("Pedestrian Density: ${(ws.pedestrianDensity * 100).roundToInt()}%", style = MaterialTheme.typography.bodyMedium)
          Slider(
            value = ws.pedestrianDensity,
            onValueChange = { v -> cb.onUpdateDraft { cur -> cur.copy(worldSettings = cur.worldSettings.copy(pedestrianDensity = v)) } },
            valueRange = 0.25f..2.0f,
          )

          Text("Global Difficulty & Enabled Game Modes", style = MaterialTheme.typography.labelLarge, color = SkyCyan)
          Row(horizontalArrangement = Arrangement.spacedBy(6.dp)) {
            listOf("easy" to "Easy", "normal" to "Normal", "hard" to "Hard").forEach { (id, lbl) ->
              FilterChip(
                selected = ws.globalDifficulty == id,
                onClick = { cb.onUpdateDraft { cur -> cur.copy(worldSettings = cur.worldSettings.copy(globalDifficulty = id)) } },
                label = { Text(lbl) },
              )
            }
          }
          Row(horizontalArrangement = Arrangement.spacedBy(6.dp)) {
            listOf("story" to "Story Mode", "free" to "Free Missions", "freeroam" to "Free Roam").forEach { (mId, lbl) ->
              val enabled = ws.enabledModes.contains(mId)
              FilterChip(
                selected = enabled,
                onClick = {
                  cb.onUpdateDraft { cur ->
                    val next = cur.worldSettings.enabledModes.toMutableSet()
                    if (enabled && next.size > 1) next.remove(mId) else next.add(mId)
                    cur.copy(worldSettings = cur.worldSettings.copy(enabledModes = next.toList()))
                  }
                },
                label = { Text(lbl) },
              )
            }
          }
        }
      }
    }

    // 2. Economy & Audio Defaults
    item {
      Card(
        colors = CardDefaults.cardColors(containerColor = AsphaltSurface),
        border = BorderStroke(1.dp, EmeraldSignal.copy(alpha = 0.5f)),
        shape = RoundedCornerShape(16.dp),
      ) {
        Column(modifier = Modifier.fillMaxWidth().padding(14.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
          Text("Economy, Pricing & Audio Defaults", style = MaterialTheme.typography.titleMedium, color = EmeraldSignal)

          Text("Mission Reward Multiplier: ${"%.1f".format(econ.rewardMultiplier)}x", style = MaterialTheme.typography.bodyMedium)
          Slider(
            value = econ.rewardMultiplier,
            onValueChange = { v ->
              cb.onUpdateDraft { cur -> cur.copy(rewardMultiplier = v, economy = cur.economy.copy(rewardMultiplier = v)) }
            },
            valueRange = 0.5f..3.0f,
            colors = SliderDefaults.colors(thumbColor = EmeraldSignal, activeTrackColor = EmeraldSignal),
          )

          Text("New Player Starting Cash: $${econ.startingCash}", style = MaterialTheme.typography.bodyMedium)
          Slider(
            value = econ.startingCash.toFloat(),
            onValueChange = { v -> cb.onUpdateDraft { cur -> cur.copy(economy = cur.economy.copy(startingCash = v.roundToInt())) } },
            valueRange = 500f..15000f,
          )

          Text("Garage Repair Fee: $${econ.repairCost} · Ammo Pack Fee: $${econ.ammoCost}", style = MaterialTheme.typography.bodyMedium)
          Slider(
            value = econ.repairCost.toFloat(),
            onValueChange = { v -> cb.onUpdateDraft { cur -> cur.copy(economy = cur.economy.copy(repairCost = v.roundToInt())) } },
            valueRange = 25f..500f,
          )
          Slider(
            value = econ.ammoCost.toFloat(),
            onValueChange = { v -> cb.onUpdateDraft { cur -> cur.copy(economy = cur.economy.copy(ammoCost = v.roundToInt())) } },
            valueRange = 25f..500f,
          )

          Text("Default SFX Vol: ${(ws.defaultSoundVol * 100).roundToInt()}% · Music Vol: ${(ws.defaultMusicVol * 100).roundToInt()}%", style = MaterialTheme.typography.bodySmall, color = MutedSteel)
          Slider(
            value = ws.defaultSoundVol,
            onValueChange = { v -> cb.onUpdateDraft { cur -> cur.copy(worldSettings = cur.worldSettings.copy(defaultSoundVol = v)) } },
            valueRange = 0f..1f,
          )
          Slider(
            value = ws.defaultMusicVol,
            onValueChange = { v -> cb.onUpdateDraft { cur -> cur.copy(worldSettings = cur.worldSettings.copy(defaultMusicVol = v)) } },
            valueRange = 0f..1f,
          )

          Button(
            onClick = { cb.onOwnerAction("grant_cash", "{\"amount\":2500}") },
            colors = ButtonDefaults.buttonColors(containerColor = WarmAmber, contentColor = MidnightSlate),
            modifier = Modifier.fillMaxWidth(),
          ) { Text("Grant Active Player +$2,500 Cash Now") }
        }
      }
    }
  }
}

@Composable
fun OwnerSavePublishSection(
  state: CityStudioUiState,
  cb: OwnerDashboardCallbacks,
) {
  val clipboard = LocalClipboardManager.current
  var publishLabel by remember { mutableStateOf("") }
  var showImportDialog by remember { mutableStateOf(false) }
  var importText by remember { mutableStateOf("") }
  var importError by remember { mutableStateOf<String?>(null) }

  if (showImportDialog) {
    AlertDialog(
      onDismissRequest = { showImportDialog = false },
      containerColor = MidnightSlate,
      title = { Text("Import Backup JSON", color = SkyCyan) },
      text = {
        Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
          OutlinedTextField(
            value = importText,
            onValueChange = {
              importText = it
              importError = null
            },
            label = { Text("Paste OwnerConfig JSON") },
            maxLines = 6,
            modifier = Modifier.fillMaxWidth(),
          )
          if (importError != null) {
            Text(importError!!, color = CrimsonSiren, style = MaterialTheme.typography.bodySmall)
          }
        }
      },
      confirmButton = {
        Button(onClick = {
          val err = cb.onImportBackupJson(importText)
          if (err == null) showImportDialog = false
          else importError = err
        }) { Text("Import to Draft") }
      },
      dismissButton = {
        OutlinedButton(onClick = { showImportDialog = false }) { Text("Cancel") }
      },
    )
  }

  val df = remember { SimpleDateFormat("MMM dd, HH:mm", Locale.getDefault()) }

  LazyColumn(
    verticalArrangement = Arrangement.spacedBy(10.dp),
    contentPadding = PaddingValues(bottom = 16.dp),
  ) {
    // 1. Save Draft, Preview, Publish & Cancel
    item {
      Card(
        colors = CardDefaults.cardColors(containerColor = AsphaltSurface),
        border = BorderStroke(1.dp, EmeraldSignal.copy(alpha = 0.55f)),
        shape = RoundedCornerShape(16.dp),
      ) {
        Column(modifier = Modifier.fillMaxWidth().padding(14.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
          Text("Draft vs Live Publish Workflow", style = MaterialTheme.typography.titleMedium, color = EmeraldSignal)
          Text(
            text = "Live Version: v${state.publishedConfig.version} · Draft Status: ${if (state.hasUnsavedDraftChanges) "Unpublished Changes" else "Synced with Live"}",
            style = MaterialTheme.typography.bodySmall,
            color = if (state.hasUnsavedDraftChanges) WarmAmber else EmeraldSignal,
          )
          OutlinedTextField(
            value = publishLabel,
            onValueChange = { publishLabel = it },
            label = { Text("Release Note / Backup Label (optional)") },
            singleLine = true,
            modifier = Modifier.fillMaxWidth(),
          )
          Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
            OutlinedButton(
              onClick = cb.onSaveDraft,
              modifier = Modifier.weight(1f).testTag("owner_save_draft_btn"),
            ) {
              Icon(Icons.Rounded.Save, contentDescription = null, modifier = Modifier.size(16.dp))
              Spacer(Modifier.width(4.dp))
              Text("Save Draft")
            }
            Button(
              onClick = cb.onPreviewDraft,
              colors = ButtonDefaults.buttonColors(containerColor = SkyCyan, contentColor = MidnightSlate),
              modifier = Modifier.weight(1f).testTag("owner_preview_btn"),
            ) {
              Icon(Icons.Rounded.Preview, contentDescription = null, modifier = Modifier.size(16.dp))
              Spacer(Modifier.width(4.dp))
              Text("Preview Live")
            }
          }
          Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
            Button(
              onClick = {
                cb.onPublishDraft(publishLabel)
                publishLabel = ""
              },
              colors = ButtonDefaults.buttonColors(containerColor = EmeraldSignal, contentColor = MidnightSlate),
              modifier = Modifier.weight(1f).testTag("owner_publish_btn"),
            ) {
              Icon(Icons.Rounded.CloudUpload, contentDescription = null, modifier = Modifier.size(16.dp))
              Spacer(Modifier.width(4.dp))
              Text("Publish Live")
            }
            OutlinedButton(
              onClick = cb.onCancelDraft,
              modifier = Modifier.weight(1f).testTag("owner_cancel_draft_btn"),
            ) {
              Icon(Icons.Rounded.Cancel, contentDescription = null, modifier = Modifier.size(16.dp))
              Spacer(Modifier.width(4.dp))
              Text("Cancel Draft")
            }
          }
        }
      }
    }

    // 2. JSON Backup & Import
    item {
      Card(
        colors = CardDefaults.cardColors(containerColor = AsphaltSurface),
        border = BorderStroke(1.dp, HairlineBorder),
        shape = RoundedCornerShape(16.dp),
      ) {
        Column(modifier = Modifier.fillMaxWidth().padding(14.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
          Text("JSON Backup & Restore", style = MaterialTheme.typography.titleMedium, color = SkyCyan)
          Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
            OutlinedButton(
              onClick = {
                clipboard.setText(AnnotatedString(cb.onExportBackupJson()))
              },
              modifier = Modifier.weight(1f),
            ) {
              Icon(Icons.Rounded.Download, contentDescription = null, modifier = Modifier.size(16.dp))
              Spacer(Modifier.width(6.dp))
              Text("Copy Backup JSON")
            }
            OutlinedButton(
              onClick = {
                importText = ""
                importError = null
                showImportDialog = true
              },
              modifier = Modifier.weight(1f),
            ) {
              Icon(Icons.Rounded.Upload, contentDescription = null, modifier = Modifier.size(16.dp))
              Spacer(Modifier.width(6.dp))
              Text("Import JSON")
            }
          }
        }
      }
    }

    // 3. Cloud Backups (Firestore)
    if (state.cloudBackups.isNotEmpty()) {
      item {
        Text("Cloud Restore Points (${state.cloudBackups.size})", style = MaterialTheme.typography.labelLarge, color = WarmAmber)
      }
      items(state.cloudBackups, key = { "cbk_${it.id}" }) { bk ->
        Card(
          colors = CardDefaults.cardColors(containerColor = AsphaltSurface),
          border = BorderStroke(1.dp, HairlineBorder),
          shape = RoundedCornerShape(12.dp),
        ) {
          Row(modifier = Modifier.fillMaxWidth().padding(12.dp), verticalAlignment = Alignment.CenterVertically) {
            Icon(Icons.Rounded.Backup, contentDescription = null, tint = SkyCyan, modifier = Modifier.size(22.dp))
            Spacer(Modifier.width(10.dp))
            Column(modifier = Modifier.weight(1f)) {
              Text(bk.label, style = MaterialTheme.typography.bodyMedium, fontWeight = FontWeight.SemiBold)
              Text("Version v${bk.version}", style = MaterialTheme.typography.labelSmall, color = MutedSteel)
            }
            OutlinedButton(onClick = { cb.onRestoreCloudBackup(bk) }) { Text("Restore") }
            IconButton(onClick = { cb.onDeleteCloudBackup(bk.id) }) {
              Icon(Icons.Rounded.Delete, contentDescription = "Delete Backup", tint = CrimsonSiren)
            }
          }
        }
      }
    }

    // 4. Local Previous Settings History
    if (state.configHistory.isNotEmpty()) {
      item {
        Text("Local Snapshot History (${state.configHistory.size})", style = MaterialTheme.typography.labelLarge, color = SkyCyan)
      }
      items(state.configHistory, key = { "hist_${it.id}" }) { snap ->
        Card(
          colors = CardDefaults.cardColors(containerColor = AsphaltSurface),
          border = BorderStroke(1.dp, HairlineBorder),
          shape = RoundedCornerShape(12.dp),
        ) {
          Row(modifier = Modifier.fillMaxWidth().padding(12.dp), verticalAlignment = Alignment.CenterVertically) {
            Icon(Icons.Rounded.History, contentDescription = null, tint = WarmAmber, modifier = Modifier.size(22.dp))
            Spacer(Modifier.width(10.dp))
            Column(modifier = Modifier.weight(1f)) {
              Text(snap.label, style = MaterialTheme.typography.bodyMedium, fontWeight = FontWeight.SemiBold)
              Text("v${snap.version} · ${df.format(Date(snap.savedAtMs))}", style = MaterialTheme.typography.labelSmall, color = MutedSteel)
            }
            OutlinedButton(onClick = { cb.onRestoreHistory(snap) }) { Text("Restore") }
          }
        }
      }
    }
  }
}
