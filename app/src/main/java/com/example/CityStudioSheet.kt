package com.example

import android.graphics.BitmapFactory
import android.util.Base64
import androidx.activity.compose.BackHandler
import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.horizontalScroll
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.WindowInsets
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.heightIn
import androidx.compose.foundation.layout.navigationBarsPadding
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.layout.widthIn
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.rounded.AccountCircle
import androidx.compose.material.icons.rounded.AdminPanelSettings
import androidx.compose.material.icons.rounded.AutoAwesome
import androidx.compose.material.icons.rounded.Badge
import androidx.compose.material.icons.rounded.Build
import androidx.compose.material.icons.rounded.CardGiftcard
import androidx.compose.material.icons.rounded.CheckCircle
import androidx.compose.material.icons.rounded.Close
import androidx.compose.material.icons.rounded.CloudDone
import androidx.compose.material.icons.rounded.DirectionsBoat
import androidx.compose.material.icons.rounded.DirectionsBus
import androidx.compose.material.icons.rounded.DirectionsCar
import androidx.compose.material.icons.rounded.Flag
import androidx.compose.material.icons.rounded.Flight
import androidx.compose.material.icons.rounded.Fullscreen
import androidx.compose.material.icons.rounded.GpsFixed
import androidx.compose.material.icons.rounded.Image
import androidx.compose.material.icons.rounded.Inventory2
import androidx.compose.material.icons.rounded.LocalShipping
import androidx.compose.material.icons.rounded.NightsStay
import androidx.compose.material.icons.rounded.Palette
import androidx.compose.material.icons.rounded.PhotoLibrary
import androidx.compose.material.icons.rounded.Public
import androidx.compose.material.icons.rounded.RestartAlt
import androidx.compose.material.icons.rounded.Save
import androidx.compose.material.icons.rounded.Security
import androidx.compose.material.icons.rounded.Settings
import androidx.compose.material.icons.rounded.Tune
import androidx.compose.material.icons.rounded.TwoWheeler
import androidx.compose.material.icons.rounded.WaterDrop
import androidx.compose.material.icons.rounded.WbSunny
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.FilterChip
import androidx.compose.material3.FilterChipDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.LinearProgressIndicator
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.ModalBottomSheet
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.Slider
import androidx.compose.material3.SliderDefaults
import androidx.compose.material3.Surface
import androidx.compose.material3.Switch
import androidx.compose.material3.SwitchDefaults
import androidx.compose.material3.Text
import androidx.compose.material3.rememberModalBottomSheetState
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.ImageBitmap
import androidx.compose.ui.graphics.asImageBitmap
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.res.stringResource
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

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun CityStudioSheet(
  state: CityStudioUiState,
  onDismiss: () -> Unit,
  onSelectTab: (StudioTab) -> Unit,
  onSelectCharacter: (characterId: String) -> Unit,
  onSelectOutfit: (outfitId: String, skinHex: String, hairHex: String) -> Unit,
  onPickPhoto: (targetType: String, targetId: String) -> Unit,
  onClearPhoto: (targetType: String, targetId: String) -> Unit,
  onGarageAction: (action: String, param: String) -> Unit,
  onCombatAction: (action: String, param: String) -> Unit,
  onStartMission: (missionId: String) -> Unit,
  onClaimReward: (missionId: String) -> Unit,
  onRestartMission: () -> Unit,
  onAbortMission: () -> Unit,
  onSelectCity: (cityId: String) -> Unit,
  onOpenMapModal: (mode: String) -> Unit,
  onUpdateSettings: (GameSettings) -> Unit,
  onOpenControlEditor: () -> Unit,
  onResetControls: () -> Unit,
  onSaveNow: () -> Unit,
  onSetTimeMode: (mode: String) -> Unit,
  onSetWeather: (weather: String) -> Unit,
  ownerCallbacks: OwnerDashboardCallbacks,
) {
  BackHandler(onBack = onDismiss)

  val sheetState = rememberModalBottomSheetState(skipPartiallyExpanded = true)
  val totalMissionCount = CityCatalog.missions.size + state.snapshot.customMissions.size

  ModalBottomSheet(
    onDismissRequest = onDismiss,
    sheetState = sheetState,
    containerColor = MidnightSlate,
    contentColor = MaterialTheme.colorScheme.onSurface,
    contentWindowInsets = { WindowInsets(0, 0, 0, 0) },
  ) {
    Column(
      modifier =
        Modifier.fillMaxWidth()
          .widthIn(max = 760.dp)
          .align(Alignment.CenterHorizontally)
          .navigationBarsPadding()
          .padding(horizontal = 16.dp),
    ) {
      // Header
      Row(
        modifier = Modifier.fillMaxWidth().padding(bottom = 8.dp),
        horizontalArrangement = Arrangement.SpaceBetween,
        verticalAlignment = Alignment.CenterVertically,
      ) {
        Column {
          Text(
            text = stringResource(R.string.studio_title).uppercase(),
            style = MaterialTheme.typography.titleLarge,
            color = WarmAmber,
          )
          Text(
            text = "Cash: $${state.snapshot.cash}  ·  XP: ${state.snapshot.xp}  ·  Missions: ${state.snapshot.completedMissions.size}/$totalMissionCount",
            style = MaterialTheme.typography.bodyMedium,
            color = EmeraldSignal,
            fontWeight = FontWeight.SemiBold,
          )
        }
        IconButton(
          onClick = onDismiss,
          modifier = Modifier.size(48.dp).testTag("studio_close_button"),
        ) {
          Icon(
            imageVector = Icons.Rounded.Close,
            contentDescription = stringResource(R.string.action_close),
            tint = MaterialTheme.colorScheme.onSurface,
          )
        }
      }

      // Horizontal Tab Strip
      Row(
        modifier =
          Modifier.fillMaxWidth()
            .horizontalScroll(rememberScrollState())
            .padding(bottom = 8.dp),
        horizontalArrangement = Arrangement.spacedBy(8.dp),
      ) {
        StudioTab.entries.forEach { tab ->
          val selected = state.activeTab == tab
          val icon =
            when (tab) {
              StudioTab.WARDROBE -> Icons.Rounded.AccountCircle
              StudioTab.INVENTORY -> Icons.Rounded.Inventory2
              StudioTab.BILLBOARDS -> Icons.Rounded.Image
              StudioTab.GARAGE -> Icons.Rounded.DirectionsCar
              StudioTab.COMBAT -> Icons.Rounded.Security
              StudioTab.MISSIONS -> Icons.Rounded.Flag
              StudioTab.MAPS -> Icons.Rounded.Public
              StudioTab.SETTINGS -> Icons.Rounded.Settings
              StudioTab.WORLD -> Icons.Rounded.WbSunny
              StudioTab.OWNER -> Icons.Rounded.AdminPanelSettings
            }
          FilterChip(
            selected = selected,
            onClick = { onSelectTab(tab) },
            label = { Text(tab.label, fontWeight = FontWeight.SemiBold) },
            leadingIcon = { Icon(icon, contentDescription = null, modifier = Modifier.size(18.dp)) },
            colors =
              FilterChipDefaults.filterChipColors(
                selectedContainerColor = WarmAmber,
                selectedLabelColor = MidnightSlate,
                selectedLeadingIconColor = MidnightSlate,
                containerColor = AsphaltSurface,
                labelColor = MaterialTheme.colorScheme.onSurface,
              ),
            modifier = Modifier.testTag("studio_tab_${tab.name.lowercase()}"),
          )
        }
      }

      // Active Tab Content (responsive height for landscape screens)
      Box(modifier = Modifier.fillMaxWidth().weight(1f, fill = false).heightIn(min = 180.dp, max = 390.dp)) {
        when (state.activeTab) {
          StudioTab.WARDROBE ->
            WardrobeTabContent(
              state = state,
              onSelectCharacter = onSelectCharacter,
              onSelectOutfit = onSelectOutfit,
              onPickPhoto = { onPickPhoto("character", "player") },
              onClearPhoto = { onClearPhoto("character", "player") },
            )
          StudioTab.INVENTORY ->
            InventoryTabContent(
              state = state,
              onCombatAction = onCombatAction,
              onGarageAction = onGarageAction,
              onJumpToTab = onSelectTab,
            )
          StudioTab.BILLBOARDS ->
            BillboardsTabContent(
              state = state,
              onPickPhoto = { bbId -> onPickPhoto("billboard", bbId) },
              onResetPhoto = { bbId -> onClearPhoto("billboard", bbId) },
            )
          StudioTab.GARAGE ->
            GarageTabContent(
              state = state,
              onGarageAction = onGarageAction,
            )
          StudioTab.COMBAT ->
            CombatTabContent(
              state = state,
              onCombatAction = onCombatAction,
            )
          StudioTab.MISSIONS ->
            MissionsTabContent(
              state = state,
              onStartMission = { id ->
                onStartMission(id)
                onDismiss()
              },
              onClaimReward = onClaimReward,
              onRestartMission = {
                onRestartMission()
                onDismiss()
              },
              onAbortMission = onAbortMission,
              onOpenOwnerEditor = { onSelectTab(StudioTab.OWNER) },
            )
          StudioTab.MAPS ->
            MapsTabContent(
              state = state,
              onSelectCity = { cityId ->
                onSelectCity(cityId)
                onDismiss()
              },
              onOpenMapModal = { mode ->
                onOpenMapModal(mode)
                onDismiss()
              },
            )
          StudioTab.SETTINGS ->
            SettingsTabContent(
              settings = state.snapshot.settings,
              onUpdateSettings = onUpdateSettings,
              onOpenControlEditor = {
                onOpenControlEditor()
                onDismiss()
              },
              onResetControls = onResetControls,
              onSaveNow = onSaveNow,
            )
          StudioTab.WORLD ->
            WorldTabContent(
              state = state,
              onSetTimeMode = onSetTimeMode,
              onSetWeather = onSetWeather,
            )
          StudioTab.OWNER ->
            OwnerTabContent(
              state = state,
              cb = ownerCallbacks,
            )
        }
      }

      Spacer(modifier = Modifier.height(14.dp))
    }
  }
}

@Composable
private fun rememberBase64Bitmap(dataUrl: String?): ImageBitmap? {
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
private fun StatProgressRow(label: String, value: Int, barColor: Color) {
  Column(verticalArrangement = Arrangement.spacedBy(3.dp)) {
    Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
      Text(label, style = MaterialTheme.typography.labelSmall, color = MutedSteel)
      Text("$value/100", style = MaterialTheme.typography.labelSmall, color = Color.White, fontWeight = FontWeight.Bold)
    }
    LinearProgressIndicator(
      progress = { (value.coerceIn(0, 100)) / 100f },
      modifier = Modifier.fillMaxWidth().height(6.dp).clip(RoundedCornerShape(99.dp)),
      color = barColor,
      trackColor = ElevatedConcrete,
    )
  }
}

@Composable
private fun WardrobeTabContent(
  state: CityStudioUiState,
  onSelectCharacter: (characterId: String) -> Unit,
  onSelectOutfit: (outfitId: String, skinHex: String, hairHex: String) -> Unit,
  onPickPhoto: () -> Unit,
  onClearPhoto: () -> Unit,
) {
  val customBitmap = rememberBase64Bitmap(
    state.customCharacterDataUrls[state.snapshot.characterId] ?: state.customCharacterDataUrl
  )
  val pub = state.publishedConfig
  val visibleCharacters = remember(pub.customCharacters, pub.characterOverrides) {
    val builtIn = CityCatalog.characters.filterNot { pub.characterOverrides[it.id]?.disabled == true }
    val custom = pub.customCharacters.filterNot { it.disabled }.map { cc ->
      CharacterProfileOption(
        id = cc.id,
        name = cc.name,
        role = cc.role,
        defaultOutfit = cc.defaultOutfit,
        skinHex = cc.skinHex,
        hairHex = cc.hairHex,
        speedStat = (80 * cc.speedMult).roundToInt().coerceIn(50, 99),
        staminaStat = 85,
        combatStat = (80 * (cc.maxHealth / 100f)).roundToInt().coerceIn(50, 99),
        drivingStat = 85,
        accentColor = SkyCyan,
      )
    }
    builtIn + custom
  }
  val activeChar = visibleCharacters.find { it.id == state.snapshot.characterId } ?: visibleCharacters.firstOrNull() ?: CityCatalog.characters.first()
  val rankLevel = 1 + (state.snapshot.xp / 500)

  LazyColumn(
    verticalArrangement = Arrangement.spacedBy(10.dp),
    contentPadding = PaddingValues(bottom = 16.dp),
  ) {
    // Character Roster Selection
    item {
      Card(
        colors = CardDefaults.cardColors(containerColor = AsphaltSurface),
        border = BorderStroke(1.dp, HairlineBorder),
        shape = RoundedCornerShape(16.dp),
      ) {
        Column(modifier = Modifier.fillMaxWidth().padding(14.dp), verticalArrangement = Arrangement.spacedBy(10.dp)) {
          Text("Select Playable Character", style = MaterialTheme.typography.titleMedium, color = WarmAmber)
          Row(
            modifier = Modifier.fillMaxWidth().horizontalScroll(rememberScrollState()),
            horizontalArrangement = Arrangement.spacedBy(10.dp),
          ) {
            visibleCharacters.forEach { ch ->
              val selected = state.snapshot.characterId == ch.id
              Card(
                onClick = { onSelectCharacter(ch.id) },
                colors = CardDefaults.cardColors(containerColor = if (selected) ElevatedConcrete else MidnightSlate),
                border = BorderStroke(if (selected) 2.dp else 1.dp, if (selected) ch.accentColor else HairlineBorder),
                shape = RoundedCornerShape(14.dp),
                modifier = Modifier.width(156.dp).testTag("character_card_${ch.id}"),
              ) {
                Column(modifier = Modifier.padding(10.dp), verticalArrangement = Arrangement.spacedBy(4.dp)) {
                  Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                    Icon(Icons.Rounded.Badge, contentDescription = null, tint = ch.accentColor, modifier = Modifier.size(18.dp))
                    Text(ch.name, style = MaterialTheme.typography.labelLarge, fontWeight = FontWeight.Bold, maxLines = 1)
                  }
                  Text(ch.role, style = MaterialTheme.typography.labelSmall, color = MutedSteel)
                  Text(
                    text = if (selected) "ACTIVE" else "Tap to Select",
                    style = MaterialTheme.typography.labelSmall,
                    color = if (selected) EmeraldSignal else ch.accentColor,
                    fontWeight = FontWeight.Bold,
                  )
                }
              }
            }
          }
        }
      }
    }

    // Live Character Statistics
    item {
      Card(
        colors = CardDefaults.cardColors(containerColor = AsphaltSurface),
        border = BorderStroke(1.dp, HairlineBorder),
        shape = RoundedCornerShape(16.dp),
        modifier = Modifier.fillMaxWidth().testTag("character_stats_card"),
      ) {
        Column(modifier = Modifier.fillMaxWidth().padding(14.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
          Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween, verticalAlignment = Alignment.CenterVertically) {
            Text("${activeChar.name} · Stats", style = MaterialTheme.typography.titleMedium, color = SkyCyan)
            Surface(color = ElevatedConcrete, shape = RoundedCornerShape(99.dp)) {
              Text(
                text = "Rank Lv.$rankLevel · ${state.snapshot.xp} XP",
                style = MaterialTheme.typography.labelSmall,
                color = WarmAmber,
                fontWeight = FontWeight.Bold,
                modifier = Modifier.padding(horizontal = 10.dp, vertical = 4.dp),
              )
            }
          }
          Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(12.dp)) {
            Column(modifier = Modifier.weight(1f), verticalArrangement = Arrangement.spacedBy(6.dp)) {
              StatProgressRow("Health", state.snapshot.health, EmeraldSignal)
              StatProgressRow("Stamina", state.snapshot.stamina, SkyCyan)
              StatProgressRow("Driving Skill", activeChar.drivingStat, WarmAmber)
            }
            Column(modifier = Modifier.weight(1f), verticalArrangement = Arrangement.spacedBy(6.dp)) {
              StatProgressRow("Sprint Speed", activeChar.speedStat, SkyCyan)
              StatProgressRow("Combat Power", activeChar.combatStat, Color(0xFFEF4444))
              StatProgressRow("Base Endurance", activeChar.staminaStat, EmeraldSignal)
            }
          }
          Text(
            text = "Missions Completed: ${state.snapshot.completedMissions.size} · Vehicles Owned: ${state.snapshot.ownedVehicles.size} · Weapons: ${state.snapshot.ownedWeapons.size}",
            style = MaterialTheme.typography.labelSmall,
            color = MutedSteel,
          )
        }
      }
    }

    item {
      Card(
        colors = CardDefaults.cardColors(containerColor = AsphaltSurface),
        border = BorderStroke(1.dp, HairlineBorder),
        shape = RoundedCornerShape(16.dp),
      ) {
        Row(
          modifier = Modifier.fillMaxWidth().padding(14.dp),
          verticalAlignment = Alignment.CenterVertically,
          horizontalArrangement = Arrangement.spacedBy(12.dp),
        ) {
          Box(
            modifier =
              Modifier.size(64.dp)
                .clip(CircleShape)
                .background(ElevatedConcrete)
                .border(2.dp, WarmAmber, CircleShape),
            contentAlignment = Alignment.Center,
          ) {
            if (customBitmap != null) {
              Image(
                bitmap = customBitmap,
                contentDescription = "Custom character portrait",
                modifier = Modifier.fillMaxSize(),
                contentScale = ContentScale.Crop,
              )
            } else {
              Icon(
                imageVector = Icons.Rounded.AccountCircle,
                contentDescription = "Default character avatar",
                tint = WarmAmber,
                modifier = Modifier.size(40.dp),
              )
            }
          }
          Column(modifier = Modifier.weight(1f)) {
            Text(
              text = "Custom Character Image",
              style = MaterialTheme.typography.titleMedium,
            )
            Text(
              text = "Upload a personal photo from your device to display on your character & HUD.",
              style = MaterialTheme.typography.bodyMedium,
              color = MutedSteel,
            )
            Spacer(modifier = Modifier.height(8.dp))
            Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
              Button(
                onClick = onPickPhoto,
                colors = ButtonDefaults.buttonColors(containerColor = WarmAmber, contentColor = MidnightSlate),
                modifier = Modifier.testTag("upload_character_photo_btn"),
              ) {
                Icon(Icons.Rounded.PhotoLibrary, contentDescription = null, modifier = Modifier.size(16.dp))
                Spacer(Modifier.width(6.dp))
                Text(stringResource(R.string.action_upload_photo))
              }
              if (customBitmap != null) {
                OutlinedButton(
                  onClick = onClearPhoto,
                  modifier = Modifier.testTag("clear_character_photo_btn"),
                ) {
                  Text("Clear")
                }
              }
            }
          }
        }
      }
    }

    item {
      Card(
        colors = CardDefaults.cardColors(containerColor = AsphaltSurface),
        border = BorderStroke(1.dp, HairlineBorder),
        shape = RoundedCornerShape(16.dp),
      ) {
        Column(modifier = Modifier.fillMaxWidth().padding(14.dp), verticalArrangement = Arrangement.spacedBy(10.dp)) {
          Text("Skin Tone & Hair", style = MaterialTheme.typography.titleMedium)
          Row(horizontalArrangement = Arrangement.spacedBy(12.dp), verticalAlignment = Alignment.CenterVertically) {
            Text("Skin", style = MaterialTheme.typography.bodyMedium, color = MutedSteel)
            CityCatalog.skinTones.forEach { (hex, col) ->
              val sel = state.snapshot.skinHex.equals(hex, ignoreCase = true)
              Box(
                modifier =
                  Modifier.size(34.dp)
                    .clip(CircleShape)
                    .background(col)
                    .border(if (sel) 3.dp else 1.dp, if (sel) WarmAmber else HairlineBorder, CircleShape)
                    .clickable { onSelectOutfit(state.snapshot.outfit, hex, state.snapshot.hairHex) }
                    .testTag("skin_tone_$hex"),
              )
            }
          }
          Row(horizontalArrangement = Arrangement.spacedBy(12.dp), verticalAlignment = Alignment.CenterVertically) {
            Text("Hair", style = MaterialTheme.typography.bodyMedium, color = MutedSteel)
            CityCatalog.hairColors.forEach { (hex, col) ->
              val sel = state.snapshot.hairHex.equals(hex, ignoreCase = true)
              Box(
                modifier =
                  Modifier.size(34.dp)
                    .clip(CircleShape)
                    .background(col)
                    .border(if (sel) 3.dp else 1.dp, if (sel) WarmAmber else HairlineBorder, CircleShape)
                    .clickable { onSelectOutfit(state.snapshot.outfit, state.snapshot.skinHex, hex) }
                    .testTag("hair_color_$hex"),
              )
            }
          }
        }
      }
    }

    items(CityCatalog.outfits, key = { it.id }) { outfit ->
      val isEquipped = state.snapshot.outfit == outfit.id
      Card(
        onClick = { onSelectOutfit(outfit.id, state.snapshot.skinHex, state.snapshot.hairHex) },
        colors = CardDefaults.cardColors(containerColor = if (isEquipped) ElevatedConcrete else AsphaltSurface),
        border = BorderStroke(if (isEquipped) 2.dp else 1.dp, if (isEquipped) WarmAmber else HairlineBorder),
        shape = RoundedCornerShape(14.dp),
        modifier = Modifier.fillMaxWidth().testTag("outfit_card_${outfit.id}"),
      ) {
        Row(
          modifier = Modifier.fillMaxWidth().padding(14.dp),
          verticalAlignment = Alignment.CenterVertically,
          horizontalArrangement = Arrangement.spacedBy(12.dp),
        ) {
          Box(
            modifier =
              Modifier.size(40.dp)
                .clip(RoundedCornerShape(10.dp))
                .background(outfit.swatch)
                .border(1.dp, Color.White.copy(alpha = 0.25f), RoundedCornerShape(10.dp)),
          )
          Column(modifier = Modifier.weight(1f)) {
            Text(outfit.name, style = MaterialTheme.typography.titleMedium)
            Text(outfit.subtitle, style = MaterialTheme.typography.bodyMedium, color = MutedSteel)
          }
          if (isEquipped) {
            Icon(Icons.Rounded.CheckCircle, contentDescription = "Equipped", tint = WarmAmber)
          }
        }
      }
    }
  }
}

@Composable
private fun InventoryTabContent(
  state: CityStudioUiState,
  onCombatAction: (action: String, param: String) -> Unit,
  onGarageAction: (action: String, param: String) -> Unit,
  onJumpToTab: (StudioTab) -> Unit,
) {
  val ownedWeapons = CityCatalog.weapons.filter { state.snapshot.ownedWeapons.contains(it.id) }
  val ownedVehicles = CityCatalog.vehicles.filter { state.snapshot.ownedVehicles.contains(it.kind) }

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
        Row(
          modifier = Modifier.fillMaxWidth().padding(14.dp),
          horizontalArrangement = Arrangement.SpaceBetween,
          verticalAlignment = Alignment.CenterVertically,
        ) {
          Column(modifier = Modifier.weight(1f)) {
            Text("Player Inventory & Gear", style = MaterialTheme.typography.titleMedium, color = WarmAmber)
            Text(
              text = "Cash: $${state.snapshot.cash} · Weapons: ${ownedWeapons.size} · Vehicles: ${ownedVehicles.size}",
              style = MaterialTheme.typography.bodyMedium,
              color = MutedSteel,
            )
          }
          if (state.snapshot.pendingRewards.isNotEmpty()) {
            Button(
              onClick = { onJumpToTab(StudioTab.MISSIONS) },
              colors = ButtonDefaults.buttonColors(containerColor = EmeraldSignal, contentColor = MidnightSlate),
              modifier = Modifier.testTag("inventory_claim_rewards_btn"),
            ) {
              Icon(Icons.Rounded.CardGiftcard, contentDescription = null, modifier = Modifier.size(16.dp))
              Spacer(Modifier.width(6.dp))
              Text("Claim (${state.snapshot.pendingRewards.size})")
            }
          }
        }
      }
    }

    item {
      Text("Owned Weapons (${ownedWeapons.size})", style = MaterialTheme.typography.labelLarge, color = SkyCyan)
    }
    items(ownedWeapons, key = { "inv_w_${it.id}" }) { weapon ->
      val equipped = state.snapshot.activeWeapon == weapon.id
      val ammoCount = state.snapshot.ammo[weapon.id] ?: 0
      Card(
        colors = CardDefaults.cardColors(containerColor = if (equipped) ElevatedConcrete else AsphaltSurface),
        border = BorderStroke(1.dp, if (equipped) WarmAmber else HairlineBorder),
        shape = RoundedCornerShape(14.dp),
      ) {
        Row(
          modifier = Modifier.fillMaxWidth().padding(12.dp),
          verticalAlignment = Alignment.CenterVertically,
          horizontalArrangement = Arrangement.spacedBy(10.dp),
        ) {
          Icon(
            imageVector = if (weapon.isMelee) Icons.Rounded.Security else Icons.Rounded.GpsFixed,
            contentDescription = weapon.name,
            tint = if (equipped) WarmAmber else SkyCyan,
            modifier = Modifier.size(26.dp),
          )
          Column(modifier = Modifier.weight(1f)) {
            Text(weapon.name, style = MaterialTheme.typography.titleMedium)
            Text(
              text = if (weapon.isMelee) weapon.stats else "Ammo: $ammoCount",
              style = MaterialTheme.typography.bodyMedium,
              color = MutedSteel,
            )
          }
          if (!weapon.isMelee) {
            OutlinedButton(onClick = { onCombatAction("buy_ammo", weapon.id) }) {
              Text("+$120 Ammo")
            }
          }
          Button(
            onClick = { onCombatAction("equip_or_buy", weapon.id) },
            colors = ButtonDefaults.buttonColors(containerColor = if (equipped) EmeraldSignal else WarmAmber, contentColor = MidnightSlate),
          ) {
            Text(if (equipped) "Equipped" else "Equip")
          }
        }
      }
    }

    item {
      Text("Owned Vehicle Fleet (${ownedVehicles.size})", style = MaterialTheme.typography.labelLarge, color = WarmAmber)
    }
    items(ownedVehicles, key = { "inv_v_${it.kind}" }) { veh ->
      Card(
        colors = CardDefaults.cardColors(containerColor = AsphaltSurface),
        border = BorderStroke(1.dp, HairlineBorder),
        shape = RoundedCornerShape(14.dp),
      ) {
        Row(
          modifier = Modifier.fillMaxWidth().padding(12.dp),
          verticalAlignment = Alignment.CenterVertically,
          horizontalArrangement = Arrangement.spacedBy(10.dp),
        ) {
          Icon(Icons.Rounded.DirectionsCar, contentDescription = veh.category, tint = WarmAmber, modifier = Modifier.size(26.dp))
          Column(modifier = Modifier.weight(1f)) {
            Text(veh.name, style = MaterialTheme.typography.titleMedium)
            Text("${veh.category} · ${veh.speedRating}", style = MaterialTheme.typography.bodyMedium, color = MutedSteel)
          }
          Button(
            onClick = { onGarageAction("spawn_vehicle", veh.kind) },
            colors = ButtonDefaults.buttonColors(containerColor = EmeraldSignal, contentColor = MidnightSlate),
          ) {
            Text(if (veh.kind == "heli") "Fly" else if (veh.kind == "boat") "Sail" else "Deliver")
          }
        }
      }
    }
  }
}

@Composable
private fun BillboardsTabContent(
  state: CityStudioUiState,
  onPickPhoto: (billboardId: String) -> Unit,
  onResetPhoto: (billboardId: String) -> Unit,
) {
  val pub = state.publishedConfig
  val disabledAds = pub.disabledBillboardIds.toSet()
  val allBillboards = remember(pub.customBillboards, disabledAds) {
    val base = CityCatalog.billboards.filterNot { disabledAds.contains(it.id) }
    val custom = pub.customBillboards.filterNot { disabledAds.contains(it.id) }.map { cb ->
      BillboardSlot(cb.id, cb.title, "${cb.adType.uppercase()} · ${cb.location}", null)
    }
    base + custom
  }

  LazyColumn(
    verticalArrangement = Arrangement.spacedBy(12.dp),
    contentPadding = PaddingValues(bottom = 16.dp),
  ) {
    item {
      Text(
        text = "Upload original photographs or posters (JPG, PNG, WebP) from your device gallery to display across city billboards and shop walls without cropping or distortion.",
        style = MaterialTheme.typography.bodyMedium,
        color = MutedSteel,
      )
    }

    items(allBillboards, key = { it.id }) { slot ->
      val customUrl = state.customBillboardDataUrls[slot.id]
      val customBmp = rememberBase64Bitmap(customUrl)

      Card(
        colors = CardDefaults.cardColors(containerColor = AsphaltSurface),
        border = BorderStroke(1.dp, HairlineBorder),
        shape = RoundedCornerShape(16.dp),
        modifier = Modifier.fillMaxWidth().testTag("billboard_card_${slot.id}"),
      ) {
        Column(modifier = Modifier.padding(12.dp), verticalArrangement = Arrangement.spacedBy(10.dp)) {
          Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically,
          ) {
            Column {
              Text(slot.title, style = MaterialTheme.typography.titleMedium)
              Text(slot.location, style = MaterialTheme.typography.bodyMedium, color = MutedSteel)
            }
            Surface(
              color = if (customBmp != null) EmeraldSignal.copy(alpha = 0.18f) else ElevatedConcrete,
              shape = RoundedCornerShape(99.dp),
            ) {
              Text(
                text = if (customBmp != null) "Custom Photo" else "Editorial Poster",
                style = MaterialTheme.typography.labelSmall,
                color = if (customBmp != null) EmeraldSignal else MutedSteel,
                modifier = Modifier.padding(horizontal = 10.dp, vertical = 4.dp),
              )
            }
          }

          Box(
            modifier =
              Modifier.fillMaxWidth()
                .height(110.dp)
                .clip(RoundedCornerShape(10.dp))
                .background(Color.Black),
            contentAlignment = Alignment.Center,
          ) {
            when {
              customBmp != null ->
                Image(
                  bitmap = customBmp,
                  contentDescription = slot.title,
                  modifier = Modifier.fillMaxSize(),
                  contentScale = ContentScale.Fit,
                )
              slot.defaultDrawableRes != null ->
                Image(
                  painter = painterResource(id = slot.defaultDrawableRes),
                  contentDescription = slot.title,
                  modifier = Modifier.fillMaxSize(),
                  contentScale = ContentScale.Fit,
                )
              else ->
                Text(
                  text = "${slot.title.uppercase()} · READY FOR PHOTO",
                  style = MaterialTheme.typography.labelLarge,
                  color = WarmAmber,
                )
            }
          }

          Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
            Button(
              onClick = { onPickPhoto(slot.id) },
              colors = ButtonDefaults.buttonColors(containerColor = WarmAmber, contentColor = MidnightSlate),
              modifier = Modifier.weight(1f).testTag("upload_billboard_${slot.id}"),
            ) {
              Icon(Icons.Rounded.PhotoLibrary, contentDescription = null, modifier = Modifier.size(16.dp))
              Spacer(Modifier.width(6.dp))
              Text(stringResource(R.string.action_upload_photo))
            }
            if (customBmp != null) {
              OutlinedButton(
                onClick = { onResetPhoto(slot.id) },
                modifier = Modifier.testTag("reset_billboard_${slot.id}"),
              ) {
                Text(stringResource(R.string.action_reset_photo))
              }
            }
          }
        }
      }
    }
  }
}

@Composable
private fun GarageTabContent(
  state: CityStudioUiState,
  onGarageAction: (action: String, param: String) -> Unit,
) {
  val pub = state.publishedConfig
  val repairFee = pub.economy.repairCost.coerceAtLeast(0)
  val visibleVehicles = remember(pub.vehicleOverrides, pub.customVehicles) {
    val builtIn = CityCatalog.vehicles
      .filterNot { pub.vehicleOverrides[it.kind]?.disabled == true }
      .map { v ->
        val ov = pub.vehicleOverrides[v.kind] ?: return@map v
        v.copy(
          name = ov.name.ifBlank { v.name },
          price = if (ov.price >= 0) ov.price else v.price,
        )
      }
    val custom = pub.customVehicles.filterNot { it.disabled }.map { cv ->
      GarageVehicleOption(cv.kind, cv.name, cv.category, "Spd ${cv.maxSpeed}", cv.price)
    }
    builtIn + custom
  }

  LazyColumn(
    verticalArrangement = Arrangement.spacedBy(10.dp),
    contentPadding = PaddingValues(bottom = 16.dp),
  ) {
    // Active Vehicle Repair & Metallic Respray
    item {
      Card(
        colors = CardDefaults.cardColors(containerColor = AsphaltSurface),
        border = BorderStroke(1.dp, HairlineBorder),
        shape = RoundedCornerShape(16.dp),
      ) {
        Column(modifier = Modifier.padding(14.dp), verticalArrangement = Arrangement.spacedBy(10.dp)) {
          Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically,
          ) {
            Column {
              Text("Current Vehicle Service", style = MaterialTheme.typography.titleMedium)
              Text(
                text = if (state.snapshot.inVehicle) "Body Integrity: ${state.snapshot.vehicleHp}%" else "Enter any vehicle to repair or respray",
                style = MaterialTheme.typography.bodyMedium,
                color = MutedSteel,
              )
            }
            Button(
              onClick = { onGarageAction("repair", "") },
              enabled = state.snapshot.inVehicle,
              colors = ButtonDefaults.buttonColors(containerColor = SkyCyan, contentColor = MidnightSlate),
              modifier = Modifier.testTag("garage_repair_btn"),
            ) {
              Icon(Icons.Rounded.Build, contentDescription = null, modifier = Modifier.size(16.dp))
              Spacer(Modifier.width(6.dp))
              Text("$$repairFee")
            }
          }

          Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(10.dp)) {
            Icon(Icons.Rounded.Palette, contentDescription = null, tint = WarmAmber, modifier = Modifier.size(18.dp))
            CityCatalog.paints.forEach { paint ->
              Box(
                modifier =
                  Modifier.size(32.dp)
                    .clip(CircleShape)
                    .background(paint.color)
                    .border(1.5.dp, Color.White.copy(alpha = 0.45f), CircleShape)
                    .clickable { onGarageAction("paint", paint.hex) }
                    .testTag("paint_swatch_${paint.hex}"),
              )
            }
          }
        }
      }
    }

    // Performance Upgrades
    item {
      Row(horizontalArrangement = Arrangement.spacedBy(10.dp), modifier = Modifier.fillMaxWidth()) {
        val turboLvl = state.snapshot.turboLevel
        val turboCost = 600 + turboLvl * 500
        Card(
          onClick = { onGarageAction("upgrade_turbo", "") },
          colors = CardDefaults.cardColors(containerColor = AsphaltSurface),
          border = BorderStroke(1.dp, HairlineBorder),
          modifier = Modifier.weight(1f).testTag("upgrade_turbo_card"),
        ) {
          Column(modifier = Modifier.padding(12.dp)) {
            Text("Turbo Lv.$turboLvl/3", style = MaterialTheme.typography.titleMedium, color = WarmAmber)
            Text(
              text = if (turboLvl >= 3) "MAXED" else "Upgrade $$turboCost",
              style = MaterialTheme.typography.bodyMedium,
              color = if (turboLvl >= 3) EmeraldSignal else MutedSteel,
            )
          }
        }
        val handLvl = state.snapshot.handlingLevel
        val handCost = 500 + handLvl * 450
        Card(
          onClick = { onGarageAction("upgrade_handling", "") },
          colors = CardDefaults.cardColors(containerColor = AsphaltSurface),
          border = BorderStroke(1.dp, HairlineBorder),
          modifier = Modifier.weight(1f).testTag("upgrade_handling_card"),
        ) {
          Column(modifier = Modifier.padding(12.dp)) {
            Text("Handling Lv.$handLvl/3", style = MaterialTheme.typography.titleMedium, color = SkyCyan)
            Text(
              text = if (handLvl >= 3) "MAXED" else "Upgrade $$handCost",
              style = MaterialTheme.typography.bodyMedium,
              color = if (handLvl >= 3) EmeraldSignal else MutedSteel,
            )
          }
        }
      }
    }

    items(visibleVehicles, key = { it.kind }) { veh ->
      val owned = state.snapshot.ownedVehicles.contains(veh.kind)
      val customBmp = rememberBase64Bitmap(state.customVehicleDataUrls[veh.kind])
      val vehIcon =
        when (veh.kind) {
          "superbike", "cruiser" -> Icons.Rounded.TwoWheeler
          "bus" -> Icons.Rounded.DirectionsBus
          "truck" -> Icons.Rounded.LocalShipping
          "boat" -> Icons.Rounded.DirectionsBoat
          "heli" -> Icons.Rounded.Flight
          else -> Icons.Rounded.DirectionsCar
        }
      Card(
        colors = CardDefaults.cardColors(containerColor = AsphaltSurface),
        border = BorderStroke(1.dp, HairlineBorder),
        shape = RoundedCornerShape(14.dp),
        modifier = Modifier.fillMaxWidth().testTag("vehicle_card_${veh.kind}"),
      ) {
        Row(
          modifier = Modifier.fillMaxWidth().padding(12.dp),
          verticalAlignment = Alignment.CenterVertically,
          horizontalArrangement = Arrangement.spacedBy(12.dp),
        ) {
          if (customBmp != null) {
            Image(
              bitmap = customBmp,
              contentDescription = veh.name,
              modifier = Modifier.size(34.dp).clip(RoundedCornerShape(8.dp)),
              contentScale = ContentScale.Crop,
            )
          } else {
            Icon(
              imageVector = vehIcon,
              contentDescription = veh.category,
              tint = WarmAmber,
              modifier = Modifier.size(30.dp),
            )
          }
          Column(modifier = Modifier.weight(1f)) {
            Text(veh.name, style = MaterialTheme.typography.titleMedium)
            Text("${veh.category} · ${veh.speedRating}", style = MaterialTheme.typography.bodyMedium, color = MutedSteel)
          }
          Button(
            onClick = { onGarageAction("spawn_vehicle", veh.kind) },
            colors =
              ButtonDefaults.buttonColors(
                containerColor = if (owned) EmeraldSignal else WarmAmber,
                contentColor = MidnightSlate,
              ),
            modifier = Modifier.testTag("spawn_vehicle_${veh.kind}"),
          ) {
            Text(if (owned) (if (veh.kind == "heli") "Fly" else if (veh.kind == "boat") "Sail" else "Drive") else "$${veh.price}")
          }
        }
      }
    }
  }
}

@Composable
private fun CombatTabContent(
  state: CityStudioUiState,
  onCombatAction: (action: String, param: String) -> Unit,
) {
  LazyColumn(
    verticalArrangement = Arrangement.spacedBy(10.dp),
    contentPadding = PaddingValues(bottom = 16.dp),
  ) {
    item {
      Text(
        text = "Equip hand-to-hand styles or fictional tactical weapons and restock ammunition.",
        style = MaterialTheme.typography.bodyMedium,
        color = MutedSteel,
      )
    }

    items(CityCatalog.weapons, key = { it.id }) { weapon ->
      val owned = state.snapshot.ownedWeapons.contains(weapon.id)
      val equipped = state.snapshot.activeWeapon == weapon.id
      val ammoCount = state.snapshot.ammo[weapon.id] ?: 0
      Card(
        colors = CardDefaults.cardColors(containerColor = if (equipped) ElevatedConcrete else AsphaltSurface),
        border = BorderStroke(if (equipped) 2.dp else 1.dp, if (equipped) WarmAmber else HairlineBorder),
        shape = RoundedCornerShape(14.dp),
        modifier = Modifier.fillMaxWidth().testTag("weapon_card_${weapon.id}"),
      ) {
        Row(
          modifier = Modifier.fillMaxWidth().padding(12.dp),
          verticalAlignment = Alignment.CenterVertically,
          horizontalArrangement = Arrangement.spacedBy(10.dp),
        ) {
          Icon(
            imageVector = if (weapon.isMelee) Icons.Rounded.Security else Icons.Rounded.GpsFixed,
            contentDescription = weapon.name,
            tint = if (equipped) WarmAmber else SkyCyan,
            modifier = Modifier.size(28.dp),
          )
          Column(modifier = Modifier.weight(1f)) {
            Text(weapon.name, style = MaterialTheme.typography.titleMedium)
            Text(
              text = if (weapon.isMelee) weapon.stats else "${weapon.stats} · Ammo: $ammoCount",
              style = MaterialTheme.typography.bodyMedium,
              color = MutedSteel,
            )
          }
          if (owned && !weapon.isMelee) {
            val ammoPrice = state.publishedConfig.economy.ammoCost
            OutlinedButton(
              onClick = { onCombatAction("buy_ammo", weapon.id) },
              modifier = Modifier.testTag("buy_ammo_${weapon.id}"),
            ) {
              Text("+$$ammoPrice Ammo")
            }
          }
          Button(
            onClick = { onCombatAction("equip_or_buy", weapon.id) },
            colors =
              ButtonDefaults.buttonColors(
                containerColor = if (equipped) EmeraldSignal else WarmAmber,
                contentColor = MidnightSlate,
              ),
            modifier = Modifier.testTag("weapon_btn_${weapon.id}"),
          ) {
            Text(
              when {
                equipped -> "Equipped"
                owned -> "Equip"
                else -> "$${weapon.price}"
              }
            )
          }
        }
      }
    }
  }
}



@Composable
private fun SettingsTabContent(
  settings: GameSettings,
  onUpdateSettings: (GameSettings) -> Unit,
  onOpenControlEditor: () -> Unit,
  onResetControls: () -> Unit,
  onSaveNow: () -> Unit,
) {
  LazyColumn(
    verticalArrangement = Arrangement.spacedBy(10.dp),
    contentPadding = PaddingValues(bottom = 16.dp),
  ) {
    // Control Layout, Positions & Custom Drag/Resize Editor
    item {
      Card(
        colors = CardDefaults.cardColors(containerColor = AsphaltSurface),
        border = BorderStroke(1.dp, HairlineBorder),
        shape = RoundedCornerShape(16.dp),
      ) {
        Column(modifier = Modifier.fillMaxWidth().padding(14.dp), verticalArrangement = Arrangement.spacedBy(10.dp)) {
          Text("Touch Control Layout & Custom Editor", style = MaterialTheme.typography.titleMedium, color = WarmAmber)

          Row(horizontalArrangement = Arrangement.spacedBy(8.dp), modifier = Modifier.fillMaxWidth()) {
            Button(
              onClick = onOpenControlEditor,
              colors = ButtonDefaults.buttonColors(containerColor = WarmAmber, contentColor = MidnightSlate),
              modifier = Modifier.weight(1f).testTag("open_control_editor_btn"),
            ) {
              Icon(Icons.Rounded.Tune, contentDescription = null, modifier = Modifier.size(16.dp))
              Spacer(Modifier.width(6.dp))
              Text("Custom Drag & Resize")
            }
            OutlinedButton(
              onClick = onResetControls,
              modifier = Modifier.testTag("reset_controls_btn"),
            ) {
              Icon(Icons.Rounded.RestartAlt, contentDescription = null, modifier = Modifier.size(16.dp))
              Spacer(Modifier.width(4.dp))
              Text("Reset")
            }
          }

          Text("Control Layout", style = MaterialTheme.typography.bodyMedium, color = MutedSteel)
          Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
            listOf("standard" to "Standard", "split" to "Wide Split", "swap" to "Left/Right Swap").forEach { (id, lbl) ->
              FilterChip(
                selected = settings.layout == id,
                onClick = { onUpdateSettings(settings.copy(layout = id)) },
                label = { Text(lbl) },
                modifier = Modifier.testTag("setting_layout_$id"),
              )
            }
          }

          Text("Joystick Vertical Position", style = MaterialTheme.typography.bodyMedium, color = MutedSteel)
          Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
            listOf("low" to "Low", "mid" to "Default", "high" to "Raised").forEach { (id, lbl) ->
              FilterChip(
                selected = settings.joystickPos == id,
                onClick = { onUpdateSettings(settings.copy(joystickPos = id)) },
                label = { Text(lbl) },
                modifier = Modifier.testTag("setting_joypos_$id"),
              )
            }
          }

          Text("Button Cluster Position", style = MaterialTheme.typography.bodyMedium, color = MutedSteel)
          Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
            listOf("low" to "Low", "mid" to "Default", "high" to "Raised").forEach { (id, lbl) ->
              FilterChip(
                selected = settings.buttonPos == id,
                onClick = { onUpdateSettings(settings.copy(buttonPos = id)) },
                label = { Text(lbl) },
                modifier = Modifier.testTag("setting_btnpos_$id"),
              )
            }
          }

          Text("Button Size: ${(settings.buttonSize * 100).roundToInt()}%", style = MaterialTheme.typography.bodyMedium)
          Slider(
            value = settings.buttonSize,
            onValueChange = { onUpdateSettings(settings.copy(buttonSize = it)) },
            valueRange = 0.85f..1.25f,
            colors = SliderDefaults.colors(thumbColor = WarmAmber, activeTrackColor = WarmAmber),
            modifier = Modifier.testTag("setting_button_size"),
          )
        }
      }
    }

    // Sensitivity, Display & Graphics Quality
    item {
      Card(
        colors = CardDefaults.cardColors(containerColor = AsphaltSurface),
        border = BorderStroke(1.dp, HairlineBorder),
        shape = RoundedCornerShape(16.dp),
      ) {
        Column(modifier = Modifier.fillMaxWidth().padding(14.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
          Text("Sensitivity, Display & Graphics", style = MaterialTheme.typography.titleMedium, color = SkyCyan)

          Text("Camera Sensitivity: ${"%.1f".format(settings.cameraSens)}x", style = MaterialTheme.typography.bodyMedium)
          Slider(
            value = settings.cameraSens,
            onValueChange = { onUpdateSettings(settings.copy(cameraSens = it)) },
            valueRange = 0.5f..2.0f,
            modifier = Modifier.testTag("setting_camera_sens"),
          )

          Text("Joystick Sensitivity: ${"%.1f".format(settings.joystickSens)}x", style = MaterialTheme.typography.bodyMedium)
          Slider(
            value = settings.joystickSens,
            onValueChange = { onUpdateSettings(settings.copy(joystickSens = it)) },
            valueRange = 0.5f..2.0f,
            modifier = Modifier.testTag("setting_joystick_sens"),
          )

          Text("Driving Steering Sensitivity: ${"%.1f".format(settings.drivingSens)}x", style = MaterialTheme.typography.bodyMedium)
          Slider(
            value = settings.drivingSens,
            onValueChange = { onUpdateSettings(settings.copy(drivingSens = it)) },
            valueRange = 0.5f..2.0f,
            modifier = Modifier.testTag("setting_driving_sens"),
          )

          Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically,
          ) {
            Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(8.dp)) {
              Icon(Icons.Rounded.Fullscreen, contentDescription = null, tint = SkyCyan, modifier = Modifier.size(20.dp))
              Column {
                Text("Full-Screen Mode", style = MaterialTheme.typography.titleMedium)
                Text("Hide system status & navigation bars", style = MaterialTheme.typography.bodyMedium, color = MutedSteel)
              }
            }
            Switch(
              checked = settings.fullscreen,
              onCheckedChange = { onUpdateSettings(settings.copy(fullscreen = it)) },
              colors = SwitchDefaults.colors(checkedThumbColor = MidnightSlate, checkedTrackColor = SkyCyan),
              modifier = Modifier.testTag("setting_fullscreen_switch"),
            )
          }

          Text("Graphics Quality", style = MaterialTheme.typography.bodyMedium, color = MutedSteel)
          Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
            listOf("low" to "Battery Saver", "balanced" to "Balanced", "high" to "Ultra High").forEach { (id, lbl) ->
              FilterChip(
                selected = settings.graphicsQuality == id,
                onClick = { onUpdateSettings(settings.copy(graphicsQuality = id)) },
                label = { Text(lbl) },
                modifier = Modifier.testTag("setting_gfx_$id"),
              )
            }
          }
        }
      }
    }

    // Audio, Language & Save System
    item {
      Card(
        colors = CardDefaults.cardColors(containerColor = AsphaltSurface),
        border = BorderStroke(1.dp, HairlineBorder),
        shape = RoundedCornerShape(16.dp),
      ) {
        Column(modifier = Modifier.fillMaxWidth().padding(14.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
          Text("Audio, Language & Save System", style = MaterialTheme.typography.titleMedium, color = EmeraldSignal)

          Text("Sound Effects Volume: ${(settings.soundVol * 100).roundToInt()}%", style = MaterialTheme.typography.bodyMedium)
          Slider(
            value = settings.soundVol,
            onValueChange = { onUpdateSettings(settings.copy(soundVol = it)) },
            valueRange = 0f..1f,
            modifier = Modifier.testTag("setting_sound_vol"),
          )

          Text("Ambient Music Volume: ${(settings.musicVol * 100).roundToInt()}%", style = MaterialTheme.typography.bodyMedium)
          Slider(
            value = settings.musicVol,
            onValueChange = { onUpdateSettings(settings.copy(musicVol = it)) },
            valueRange = 0f..1f,
            modifier = Modifier.testTag("setting_music_vol"),
          )

          Text("HUD Language", style = MaterialTheme.typography.bodyMedium, color = MutedSteel)
          Row(
            modifier = Modifier.fillMaxWidth().horizontalScroll(rememberScrollState()),
            horizontalArrangement = Arrangement.spacedBy(8.dp),
          ) {
            listOf("en" to "English", "es" to "Español", "fr" to "Français", "ur" to "اردو", "ar" to "العربية").forEach { (id, lbl) ->
              FilterChip(
                selected = settings.language == id,
                onClick = { onUpdateSettings(settings.copy(language = id)) },
                label = { Text(lbl) },
                modifier = Modifier.testTag("setting_lang_$id"),
              )
            }
          }

          Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically,
          ) {
            Column {
              Text("Auto-Save City Progress", style = MaterialTheme.typography.titleMedium)
              Text("Automatically saves cash, missions, vehicles & POIs", style = MaterialTheme.typography.bodyMedium, color = MutedSteel)
            }
            Switch(
              checked = settings.autoSave,
              onCheckedChange = { onUpdateSettings(settings.copy(autoSave = it)) },
              colors = SwitchDefaults.colors(checkedThumbColor = MidnightSlate, checkedTrackColor = EmeraldSignal),
              modifier = Modifier.testTag("setting_autosave_switch"),
            )
          }

          Button(
            onClick = onSaveNow,
            colors = ButtonDefaults.buttonColors(containerColor = EmeraldSignal, contentColor = MidnightSlate),
            modifier = Modifier.fillMaxWidth().testTag("setting_save_now_btn"),
          ) {
            Icon(Icons.Rounded.Save, contentDescription = null, modifier = Modifier.size(18.dp))
            Spacer(Modifier.width(8.dp))
            Text(stringResource(R.string.action_save_now))
          }

          Surface(
            color = ElevatedConcrete,
            shape = RoundedCornerShape(10.dp),
            modifier = Modifier.fillMaxWidth(),
          ) {
            Row(
              modifier = Modifier.padding(10.dp),
              verticalAlignment = Alignment.CenterVertically,
              horizontalArrangement = Arrangement.spacedBy(8.dp),
            ) {
              Icon(Icons.Rounded.CloudDone, contentDescription = null, tint = SkyCyan, modifier = Modifier.size(18.dp))
              Text(
                text = "Local Save Active (Selected city, GPS, missions, vehicles, custom world & favorites) · Cloud Sync Adapter Ready",
                style = MaterialTheme.typography.labelSmall,
                color = MutedSteel,
              )
            }
          }
        }
      }
    }
  }
}

@Composable
private fun WorldTabContent(
  state: CityStudioUiState,
  onSetTimeMode: (String) -> Unit,
  onSetWeather: (String) -> Unit,
) {
  Column(verticalArrangement = Arrangement.spacedBy(14.dp)) {
    Card(
      colors = CardDefaults.cardColors(containerColor = AsphaltSurface),
      border = BorderStroke(1.dp, HairlineBorder),
      shape = RoundedCornerShape(16.dp),
    ) {
      Column(modifier = Modifier.fillMaxWidth().padding(14.dp), verticalArrangement = Arrangement.spacedBy(10.dp)) {
        Text("Time of Day & Dynamic Lighting", style = MaterialTheme.typography.titleMedium)
        val modes =
          listOf(
            "cycle" to "Live 24h Cycle",
            "morning" to "Morning",
            "noon" to "Bright Noon",
            "sunset" to "Golden Hour",
            "night" to "Neon Night",
          )
        Row(
          modifier = Modifier.fillMaxWidth().horizontalScroll(rememberScrollState()),
          horizontalArrangement = Arrangement.spacedBy(8.dp),
        ) {
          modes.forEach { (id, label) ->
            val sel = state.timeMode == id
            FilterChip(
              selected = sel,
              onClick = { onSetTimeMode(id) },
              label = { Text(label) },
              leadingIcon = {
                Icon(
                  imageVector = if (id == "night") Icons.Rounded.NightsStay else if (id == "cycle") Icons.Rounded.AutoAwesome else Icons.Rounded.WbSunny,
                  contentDescription = null,
                  modifier = Modifier.size(16.dp),
                )
              },
              modifier = Modifier.testTag("time_mode_$id"),
            )
          }
        }
      }
    }

    Card(
      colors = CardDefaults.cardColors(containerColor = AsphaltSurface),
      border = BorderStroke(1.dp, HairlineBorder),
      shape = RoundedCornerShape(16.dp),
    ) {
      Column(modifier = Modifier.fillMaxWidth().padding(14.dp), verticalArrangement = Arrangement.spacedBy(10.dp)) {
        Text("Weather & City Atmosphere", style = MaterialTheme.typography.titleMedium)
        Row(horizontalArrangement = Arrangement.spacedBy(10.dp)) {
          val isClear = state.snapshot.weather == "clear"
          Button(
            onClick = { onSetWeather("clear") },
            colors =
              ButtonDefaults.buttonColors(
                containerColor = if (isClear) WarmAmber else ElevatedConcrete,
                contentColor = if (isClear) MidnightSlate else Color.White,
              ),
            modifier = Modifier.weight(1f).testTag("weather_clear_btn"),
          ) {
            Icon(Icons.Rounded.WbSunny, contentDescription = null, modifier = Modifier.size(16.dp))
            Spacer(Modifier.width(6.dp))
            Text("Clear Sky")
          }
          Button(
            onClick = { onSetWeather("rain") },
            colors =
              ButtonDefaults.buttonColors(
                containerColor = if (!isClear) SkyCyan else ElevatedConcrete,
                contentColor = if (!isClear) MidnightSlate else Color.White,
              ),
            modifier = Modifier.weight(1f).testTag("weather_rain_btn"),
          ) {
            Icon(Icons.Rounded.WaterDrop, contentDescription = null, modifier = Modifier.size(16.dp))
            Spacer(Modifier.width(6.dp))
            Text("City Rain")
          }
        }
      }
    }
  }
}
