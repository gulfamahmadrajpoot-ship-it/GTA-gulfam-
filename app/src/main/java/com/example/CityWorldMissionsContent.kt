package com.example

import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.horizontalScroll
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.rounded.CardGiftcard
import androidx.compose.material.icons.rounded.CheckCircle
import androidx.compose.material.icons.rounded.Close
import androidx.compose.material.icons.rounded.Explore
import androidx.compose.material.icons.rounded.Flag
import androidx.compose.material.icons.rounded.Lock
import androidx.compose.material.icons.rounded.Map
import androidx.compose.material.icons.rounded.Public
import androidx.compose.material.icons.rounded.Refresh
import androidx.compose.material.icons.rounded.Star
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.FilterChip
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
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
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontStyle
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import com.example.ui.theme.AsphaltSurface
import com.example.ui.theme.ElevatedConcrete
import com.example.ui.theme.EmeraldSignal
import com.example.ui.theme.HairlineBorder
import com.example.ui.theme.MidnightSlate
import com.example.ui.theme.MutedSteel
import com.example.ui.theme.SkyCyan
import com.example.ui.theme.WarmAmber
import kotlin.math.roundToInt

@Composable
fun MapsTabContent(
  state: CityStudioUiState,
  onSelectCity: (cityId: String) -> Unit,
  onOpenMapModal: (mode: String) -> Unit,
) {
  val pub = state.publishedConfig
  val disabledIds = pub.disabledCityIds.toSet()
  val allCities = remember(pub.customCities) {
    val customMapped = pub.customCities.map { cc ->
      CityProfileOption(
        id = cc.id,
        name = cc.name,
        country = cc.country,
        mode = cc.mode,
        playable3d = cc.playable3d,
        summary = cc.summary,
      )
    }
    CityCatalog.cities + customMapped
  }

  LazyColumn(
    verticalArrangement = Arrangement.spacedBy(10.dp),
    contentPadding = PaddingValues(bottom = 16.dp),
  ) {
    item {
      Card(
        colors = CardDefaults.cardColors(containerColor = AsphaltSurface),
        border = BorderStroke(1.dp, HairlineBorder),
        shape = RoundedCornerShape(16.dp),
      ) {
        Column(modifier = Modifier.fillMaxWidth().padding(14.dp), verticalArrangement = Arrangement.spacedBy(10.dp)) {
          Text("Dual World Map & OpenStreetMap GPS", style = MaterialTheme.typography.titleMedium, color = WarmAmber)
          Text(
            text = "Explore Mode A (Original Metro City) or Mode B (Real-World Cities using OpenStreetMap data, search & GPS routing).",
            style = MaterialTheme.typography.bodyMedium,
            color = MutedSteel,
          )
          Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
            Button(
              onClick = { onOpenMapModal("original") },
              colors = ButtonDefaults.buttonColors(containerColor = WarmAmber, contentColor = MidnightSlate),
              modifier = Modifier.weight(1f).testTag("open_original_map_btn"),
            ) {
              Icon(Icons.Rounded.Map, contentDescription = null, modifier = Modifier.size(16.dp))
              Spacer(Modifier.width(6.dp))
              Text("Game Map")
            }
            Button(
              onClick = { onOpenMapModal("real") },
              colors = ButtonDefaults.buttonColors(containerColor = SkyCyan, contentColor = MidnightSlate),
              modifier = Modifier.weight(1f).testTag("open_osm_map_btn"),
            ) {
              Icon(Icons.Rounded.Public, contentDescription = null, modifier = Modifier.size(16.dp))
              Spacer(Modifier.width(6.dp))
              Text("OSM Search Map")
            }
          }
        }
      }
    }

    if (state.snapshot.favorites.isNotEmpty()) {
      item {
        Card(
          colors = CardDefaults.cardColors(containerColor = AsphaltSurface),
          border = BorderStroke(1.dp, HairlineBorder),
          shape = RoundedCornerShape(14.dp),
        ) {
          Column(modifier = Modifier.fillMaxWidth().padding(12.dp), verticalArrangement = Arrangement.spacedBy(6.dp)) {
            Text("Saved Favorite Locations (${state.snapshot.favorites.size})", style = MaterialTheme.typography.labelLarge, color = WarmAmber)
            Row(
              modifier = Modifier.fillMaxWidth().horizontalScroll(rememberScrollState()),
              horizontalArrangement = Arrangement.spacedBy(8.dp),
            ) {
              state.snapshot.favorites.forEach { fav ->
                Surface(color = ElevatedConcrete, shape = RoundedCornerShape(99.dp)) {
                  Row(
                    modifier = Modifier.padding(horizontal = 10.dp, vertical = 5.dp),
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(4.dp),
                  ) {
                    Icon(Icons.Rounded.Star, contentDescription = null, tint = WarmAmber, modifier = Modifier.size(14.dp))
                    Text(fav.name, style = MaterialTheme.typography.labelSmall)
                  }
                }
              }
            }
          }
        }
      }
    }

    items(allCities, key = { it.id }) { city ->
      val isSelected = state.snapshot.selectedCityId == city.id
      val isDisabled = disabledIds.contains(city.id)
      Card(
        colors = CardDefaults.cardColors(containerColor = if (isSelected) ElevatedConcrete else AsphaltSurface),
        border = BorderStroke(if (isSelected) 2.dp else 1.dp, if (isSelected) WarmAmber else HairlineBorder),
        shape = RoundedCornerShape(14.dp),
        modifier = Modifier.fillMaxWidth().testTag("city_card_${city.id}"),
      ) {
        Row(
          modifier = Modifier.fillMaxWidth().padding(14.dp),
          verticalAlignment = Alignment.CenterVertically,
          horizontalArrangement = Arrangement.spacedBy(12.dp),
        ) {
          Icon(
            imageVector = if (city.mode == "original") Icons.Rounded.Explore else Icons.Rounded.Public,
            contentDescription = city.name,
            tint = if (city.playable3d) EmeraldSignal else MutedSteel,
            modifier = Modifier.size(30.dp),
          )
          Column(modifier = Modifier.weight(1f), verticalArrangement = Arrangement.spacedBy(4.dp)) {
            Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(8.dp)) {
              Text(city.name, style = MaterialTheme.typography.titleMedium)
              Surface(
                color = if (city.playable3d) EmeraldSignal.copy(alpha = 0.16f) else WarmAmber.copy(alpha = 0.16f),
                shape = RoundedCornerShape(99.dp),
              ) {
                Text(
                  text = if (city.playable3d) "Playable 3D City" else "OSM Map Only · 3D Unavailable",
                  style = MaterialTheme.typography.labelSmall,
                  color = if (city.playable3d) EmeraldSignal else WarmAmber,
                  modifier = Modifier.padding(horizontal = 8.dp, vertical = 3.dp),
                )
              }
            }
            Text(city.summary, style = MaterialTheme.typography.bodyMedium, color = MutedSteel)
          }
          Button(
            onClick = { onSelectCity(city.id) },
            enabled = !isDisabled,
            colors =
              ButtonDefaults.buttonColors(
                containerColor = if (city.playable3d) EmeraldSignal else SkyCyan,
                contentColor = MidnightSlate,
              ),
            modifier = Modifier.testTag("select_city_${city.id}"),
          ) {
            Text(
              when {
                isDisabled -> "Disabled"
                isSelected && city.playable3d -> "Active"
                city.playable3d -> "Enter 3D"
                else -> "Open Map"
              }
            )
          }
        }
      }
    }
  }
}

@Composable
fun MissionsTabContent(
  state: CityStudioUiState,
  onStartMission: (String) -> Unit,
  onClaimReward: (String) -> Unit,
  onRestartMission: () -> Unit,
  onAbortMission: () -> Unit,
  onOpenOwnerEditor: () -> Unit,
) {
  val pub = state.publishedConfig
  val disabledMissions = pub.disabledMissionIds.toSet()
  val enabledModes = pub.worldSettings.enabledModes.toSet()

  var missionMode by remember(state.missionInitialSubTab) { mutableStateOf(state.missionInitialSubTab) } // "story" | "free" | "custom"
  var selectedCategory by remember { mutableStateOf("All") }

  val completed = state.snapshot.completedMissions
  val rewardMult = pub.economy.rewardMultiplier.coerceIn(0.5f, 3.0f)

  val activeStory = remember(disabledMissions, pub.missionOverrides) {
    CityCatalog.storyMissions.filterNot { disabledMissions.contains(it.id) }.map { m ->
      val ov = pub.missionOverrides[m.id] ?: return@map m
      m.copy(
        title = ov.title.ifBlank { m.title },
        description = ov.description.ifBlank { m.description },
        objective = ov.objective.ifBlank { m.objective },
        reward = if (ov.reward > 0) ov.reward else m.reward,
        xp = if (ov.xp > 0) ov.xp else m.xp,
        durationSec = if (ov.time >= 0) ov.time else m.durationSec,
      )
    }
  }

  val filteredFree = remember(selectedCategory, disabledMissions, pub.missionOverrides) {
    CityCatalog.freeMissions
      .filterNot { disabledMissions.contains(it.id) }
      .filter { selectedCategory == "All" || it.category == selectedCategory }
      .map { m ->
        val ov = pub.missionOverrides[m.id] ?: return@map m
        m.copy(
          title = ov.title.ifBlank { m.title },
          description = ov.description.ifBlank { m.description },
          objective = ov.objective.ifBlank { m.objective },
          reward = if (ov.reward > 0) ov.reward else m.reward,
          xp = if (ov.xp > 0) ov.xp else m.xp,
          durationSec = if (ov.time >= 0) ov.time else m.durationSec,
        )
      }
  }

  Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
    // Dual Mission System Switcher + Custom Missions
    Row(
      modifier = Modifier.fillMaxWidth().horizontalScroll(rememberScrollState()),
      horizontalArrangement = Arrangement.spacedBy(8.dp),
    ) {
      if (enabledModes.contains("story")) {
        FilterChip(
          selected = missionMode == "story",
          onClick = { missionMode = "story" },
          label = { Text("Mode A: Story (${completed.count { it.startsWith("story_") }}/${activeStory.size})") },
          modifier = Modifier.testTag("mission_mode_story"),
        )
      }
      if (enabledModes.contains("free")) {
        FilterChip(
          selected = missionMode == "free",
          onClick = { missionMode = "free" },
          label = { Text("Mode B: Free Missions (${CityCatalog.freeMissions.count { !disabledMissions.contains(it.id) }})") },
          modifier = Modifier.testTag("mission_mode_free"),
        )
      }
      FilterChip(
        selected = missionMode == "custom",
        onClick = { missionMode = "custom" },
        label = { Text("Custom (${state.snapshot.customMissions.size})") },
        modifier = Modifier.testTag("mission_mode_custom"),
      )
    }

    if (missionMode == "free") {
      Row(
        modifier = Modifier.fillMaxWidth().horizontalScroll(rememberScrollState()),
        horizontalArrangement = Arrangement.spacedBy(6.dp),
      ) {
        CityCatalog.freeMissionCategories.forEach { cat ->
          FilterChip(
            selected = selectedCategory == cat,
            onClick = { selectedCategory = cat },
            label = { Text(cat) },
            modifier = Modifier.testTag("mission_cat_${cat.lowercase().replace(" ", "_")}"),
          )
        }
      }
    }

    LazyColumn(
      verticalArrangement = Arrangement.spacedBy(10.dp),
      contentPadding = PaddingValues(bottom = 16.dp),
    ) {
      // Live Active Mission Progress Tracker
      state.snapshot.activeMission?.let { active ->
        item(key = "active_mission_tracker") {
          Card(
            colors = CardDefaults.cardColors(containerColor = ElevatedConcrete),
            border = BorderStroke(1.5.dp, WarmAmber),
            shape = RoundedCornerShape(14.dp),
            modifier = Modifier.fillMaxWidth().testTag("active_mission_progress_card"),
          ) {
            Column(modifier = Modifier.fillMaxWidth().padding(12.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
              Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically,
              ) {
                Text("ACTIVE MISSION IN PROGRESS", style = MaterialTheme.typography.labelSmall, color = WarmAmber, fontWeight = FontWeight.Bold)
                Text(
                  text = if (active.remaining >= 0) "${active.remaining}s left" else "No Time Limit",
                  style = MaterialTheme.typography.labelSmall,
                  color = SkyCyan,
                  fontWeight = FontWeight.Bold,
                )
              }
              Text(active.title, style = MaterialTheme.typography.titleMedium)
              Text("Objective: ${active.objective}", style = MaterialTheme.typography.bodyMedium, color = MutedSteel)
              Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                OutlinedButton(
                  onClick = onRestartMission,
                  modifier = Modifier.testTag("active_mission_restart_btn"),
                ) {
                  Icon(Icons.Rounded.Refresh, contentDescription = null, modifier = Modifier.size(16.dp))
                  Spacer(Modifier.width(6.dp))
                  Text("Restart")
                }
                OutlinedButton(
                  onClick = onAbortMission,
                  modifier = Modifier.testTag("active_mission_abort_btn"),
                ) {
                  Icon(Icons.Rounded.Close, contentDescription = null, modifier = Modifier.size(16.dp))
                  Spacer(Modifier.width(6.dp))
                  Text("Abort")
                }
              }
            }
          }
        }
      }

      // Claimable Mission Rewards
      if (state.snapshot.pendingRewards.isNotEmpty()) {
        items(state.snapshot.pendingRewards, key = { "reward_${it.id}" }) { rewardItem ->
          Card(
            colors = CardDefaults.cardColors(containerColor = EmeraldSignal.copy(alpha = 0.14f)),
            border = BorderStroke(1.5.dp, EmeraldSignal),
            shape = RoundedCornerShape(14.dp),
            modifier = Modifier.fillMaxWidth().testTag("claim_reward_card_${rewardItem.id}"),
          ) {
            Row(
              modifier = Modifier.fillMaxWidth().padding(12.dp),
              verticalAlignment = Alignment.CenterVertically,
              horizontalArrangement = Arrangement.spacedBy(10.dp),
            ) {
              Icon(Icons.Rounded.CardGiftcard, contentDescription = null, tint = EmeraldSignal, modifier = Modifier.size(28.dp))
              Column(modifier = Modifier.weight(1f)) {
                Text("Reward Ready: ${rewardItem.title}", style = MaterialTheme.typography.titleMedium, color = Color.White)
                Text("+$${rewardItem.reward} Cash · +${rewardItem.xp} XP", style = MaterialTheme.typography.bodyMedium, color = EmeraldSignal, fontWeight = FontWeight.Bold)
              }
              Button(
                onClick = { onClaimReward(rewardItem.id) },
                colors = ButtonDefaults.buttonColors(containerColor = EmeraldSignal, contentColor = MidnightSlate),
                modifier = Modifier.testTag("claim_reward_btn_${rewardItem.id}"),
              ) {
                Text("Claim")
              }
            }
          }
        }
      }

      if (missionMode == "story") {
        items(CityCatalog.storyMissions, key = { it.id }) { m ->
          val isDone = completed.contains(m.id)
          val isUnlocked = m.unlockReqId == null || completed.contains(m.unlockReqId)
          val scaledReward = (m.reward * rewardMult).roundToInt()
          Card(
            colors = CardDefaults.cardColors(containerColor = AsphaltSurface),
            border =
              BorderStroke(
                1.dp,
                when {
                  isDone -> EmeraldSignal.copy(alpha = 0.6f)
                  isUnlocked -> WarmAmber.copy(alpha = 0.55f)
                  else -> HairlineBorder
                },
              ),
            shape = RoundedCornerShape(14.dp),
            modifier = Modifier.fillMaxWidth().testTag("story_card_${m.id}"),
          ) {
            Row(
              modifier = Modifier.fillMaxWidth().padding(14.dp),
              verticalAlignment = Alignment.CenterVertically,
              horizontalArrangement = Arrangement.spacedBy(12.dp),
            ) {
              Icon(
                imageVector =
                  when {
                    isDone -> Icons.Rounded.CheckCircle
                    isUnlocked -> Icons.Rounded.Flag
                    else -> Icons.Rounded.Lock
                  },
                contentDescription = null,
                tint = if (isDone) EmeraldSignal else if (isUnlocked) WarmAmber else MutedSteel,
                modifier = Modifier.size(28.dp),
              )
              Column(modifier = Modifier.weight(1f), verticalArrangement = Arrangement.spacedBy(3.dp)) {
                Text(m.title, style = MaterialTheme.typography.titleMedium)
                Text(m.description, style = MaterialTheme.typography.bodyMedium, color = MutedSteel)
                if (!m.speaker.isNullOrBlank() && !m.dialogueLine.isNullOrBlank()) {
                  Text(
                    text = "${m.speaker}: \"${m.dialogueLine}\"",
                    style = MaterialTheme.typography.labelSmall,
                    fontStyle = FontStyle.Italic,
                    color = SkyCyan,
                  )
                }
                Text(
                  text =
                    if (isUnlocked) {
                      "Objective: ${m.objective} · $$scaledReward (+${m.xp} XP)" + if (m.durationSec > 0) " · ${m.durationSec}s" else ""
                    } else {
                      "Locked · Complete Mission ${m.order - 1} to unlock"
                    },
                  style = MaterialTheme.typography.labelSmall,
                  color = if (isUnlocked) EmeraldSignal else MutedSteel,
                )
              }
              Button(
                onClick = { onStartMission(m.id) },
                enabled = isUnlocked,
                colors =
                  ButtonDefaults.buttonColors(
                    containerColor = if (isDone) ElevatedConcrete else WarmAmber,
                    contentColor = if (isDone) Color.White else MidnightSlate,
                  ),
                modifier = Modifier.testTag("start_mission_${m.id}"),
              ) {
                Text(if (!isUnlocked) "Locked" else if (isDone) "Replay" else "Play")
              }
            }
          }
        }
      } else if (missionMode == "free") {
        items(filteredFree, key = { it.id }) { m ->
          val isDone = completed.contains(m.id)
          val scaledReward = (m.reward * rewardMult).roundToInt()
          Card(
            colors = CardDefaults.cardColors(containerColor = AsphaltSurface),
            border = BorderStroke(1.dp, if (isDone) EmeraldSignal.copy(alpha = 0.55f) else HairlineBorder),
            shape = RoundedCornerShape(14.dp),
            modifier = Modifier.fillMaxWidth().testTag("mission_card_${m.id}"),
          ) {
            Row(
              modifier = Modifier.fillMaxWidth().padding(14.dp),
              verticalAlignment = Alignment.CenterVertically,
              horizontalArrangement = Arrangement.spacedBy(12.dp),
            ) {
              Icon(
                imageVector = if (isDone) Icons.Rounded.CheckCircle else Icons.Rounded.Flag,
                contentDescription = null,
                tint = if (isDone) EmeraldSignal else SkyCyan,
                modifier = Modifier.size(28.dp),
              )
              Column(modifier = Modifier.weight(1f), verticalArrangement = Arrangement.spacedBy(2.dp)) {
                Text("${m.title} · ${m.category}", style = MaterialTheme.typography.titleMedium)
                Text(m.description, style = MaterialTheme.typography.bodyMedium, color = MutedSteel)
                Text(
                  text = "Objective: ${m.objective} · $$scaledReward (+${m.xp} XP)" + if (m.durationSec > 0) " · ${m.durationSec}s" else "",
                  style = MaterialTheme.typography.labelSmall,
                  color = EmeraldSignal,
                )
              }
              Button(
                onClick = { onStartMission(m.id) },
                colors =
                  ButtonDefaults.buttonColors(
                    containerColor = if (isDone) ElevatedConcrete else SkyCyan,
                    contentColor = if (isDone) Color.White else MidnightSlate,
                  ),
                modifier = Modifier.testTag("start_mission_${m.id}"),
              ) {
                Text(if (isDone) "Replay" else "Play")
              }
            }
          }
        }
      } else {
        item {
          Card(
            colors = CardDefaults.cardColors(containerColor = AsphaltSurface),
            border = BorderStroke(1.dp, HairlineBorder),
            shape = RoundedCornerShape(14.dp),
          ) {
            Row(
              modifier = Modifier.fillMaxWidth().padding(12.dp),
              horizontalArrangement = Arrangement.SpaceBetween,
              verticalAlignment = Alignment.CenterVertically,
            ) {
              Column(modifier = Modifier.weight(1f)) {
                Text("Custom Owner Missions", style = MaterialTheme.typography.titleMedium)
                Text(
                  text = "Play custom missions created in the Protected Owner Panel.",
                  style = MaterialTheme.typography.bodyMedium,
                  color = MutedSteel,
                )
              }
              OutlinedButton(
                onClick = onOpenOwnerEditor,
                modifier = Modifier.testTag("goto_owner_editor_btn"),
              ) {
                Text(if (state.isOwnerUnlocked) "Edit Missions" else "Owner Panel")
              }
            }
          }
        }

        if (state.snapshot.customMissions.isEmpty()) {
          item {
            Text(
              text = "No custom missions created yet. Unlock Owner Control Panel to build custom missions.",
              style = MaterialTheme.typography.bodyMedium,
              color = MutedSteel,
              modifier = Modifier.padding(vertical = 12.dp),
            )
          }
        } else {
          items(state.snapshot.customMissions, key = { it.id }) { cm ->
            val scaledReward = (cm.reward * rewardMult).roundToInt()
            Card(
              colors = CardDefaults.cardColors(containerColor = AsphaltSurface),
              border = BorderStroke(1.dp, WarmAmber.copy(alpha = 0.45f)),
              shape = RoundedCornerShape(14.dp),
              modifier = Modifier.fillMaxWidth().testTag("custom_mission_card_${cm.id}"),
            ) {
              Row(
                modifier = Modifier.fillMaxWidth().padding(14.dp),
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.spacedBy(12.dp),
              ) {
                Icon(Icons.Rounded.Star, contentDescription = null, tint = WarmAmber, modifier = Modifier.size(28.dp))
                Column(modifier = Modifier.weight(1f)) {
                  Text("${cm.title} · ${cm.difficulty}", style = MaterialTheme.typography.titleMedium)
                  Text(cm.description.ifBlank { cm.objective }, style = MaterialTheme.typography.bodyMedium, color = MutedSteel)
                  Text(
                    text = "Objective: ${cm.objective} · $$scaledReward · ${if (cm.time > 0) "${cm.time}s" else "Open"}",
                    style = MaterialTheme.typography.labelSmall,
                    color = EmeraldSignal,
                  )
                }
                Button(
                  onClick = { onStartMission(cm.id) },
                  colors = ButtonDefaults.buttonColors(containerColor = WarmAmber, contentColor = MidnightSlate),
                  modifier = Modifier.testTag("start_custom_${cm.id}"),
                ) {
                  Text("Play")
                }
              }
            }
          }
        }
      }
    }
  }
}
