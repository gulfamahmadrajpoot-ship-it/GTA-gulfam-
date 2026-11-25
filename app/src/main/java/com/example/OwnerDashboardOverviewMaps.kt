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
import androidx.compose.material.icons.rounded.Add
import androidx.compose.material.icons.rounded.AddLocationAlt
import androidx.compose.material.icons.rounded.Delete
import androidx.compose.material.icons.rounded.Edit
import androidx.compose.material.icons.rounded.Explore
import androidx.compose.material.icons.rounded.Flag
import androidx.compose.material.icons.rounded.LocalPolice
import androidx.compose.material.icons.rounded.Map
import androidx.compose.material.icons.rounded.PlayArrow
import androidx.compose.material.icons.rounded.Public
import androidx.compose.material.icons.rounded.Restore
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
import androidx.compose.material3.Switch
import androidx.compose.material3.SwitchDefaults
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableFloatStateOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.testTag
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
import kotlin.math.roundToInt

@Composable
fun OwnerOverviewSection(
  state: CityStudioUiState,
  cb: OwnerDashboardCallbacks,
) {
  val draft = state.draftConfig
  val enabledCitiesCount = (CityCatalog.cities.size + draft.customCities.size) - draft.disabledCityIds.size
  val totalMissions = CityCatalog.missions.size + state.snapshot.customMissions.size - draft.disabledMissionIds.size
  val activeVehicles = (CityCatalog.vehicles.size + draft.customVehicles.size) -
    draft.vehicleOverrides.count { it.value.disabled } - draft.customVehicles.count { it.disabled }
  val activeChars = (CityCatalog.characters.size + draft.customCharacters.size) -
    draft.characterOverrides.count { it.value.disabled } - draft.customCharacters.count { it.disabled }

  LazyColumn(
    verticalArrangement = Arrangement.spacedBy(10.dp),
    contentPadding = PaddingValues(bottom = 16.dp),
  ) {
    item {
      Card(
        colors = CardDefaults.cardColors(containerColor = AsphaltSurface),
        border = BorderStroke(1.dp, WarmAmber.copy(alpha = 0.5f)),
        shape = RoundedCornerShape(16.dp),
      ) {
        Column(modifier = Modifier.fillMaxWidth().padding(14.dp), verticalArrangement = Arrangement.spacedBy(10.dp)) {
          Text("System Telemetry & Live Status", style = MaterialTheme.typography.titleMedium, color = WarmAmber)
          Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(8.dp)) {
            OwnerStatMetricTile("Playable Maps", "$enabledCitiesCount", SkyCyan, Modifier.weight(1f))
            OwnerStatMetricTile("Missions Active", "$totalMissions", EmeraldSignal, Modifier.weight(1f))
          }
          Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(8.dp)) {
            OwnerStatMetricTile("Vehicles", "$activeVehicles", WarmAmber, Modifier.weight(1f))
            OwnerStatMetricTile("Characters", "$activeChars", Color(0xFFA855F7), Modifier.weight(1f))
          }
          Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(8.dp)) {
            OwnerStatMetricTile(
              "Police AI",
              if (draft.police.enabled) "Max ${draft.police.maxVehicles} · ★${draft.police.maxWanted}" else "OFF",
              if (draft.police.enabled) CrimsonSiren else MutedSteel,
              Modifier.weight(1f),
            )
            OwnerStatMetricTile("Registered Players", "${state.registeredPlayers.size}", EmeraldSignal, Modifier.weight(1f))
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
        Column(modifier = Modifier.fillMaxWidth().padding(14.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
          Text("Quick Owner Shortcuts", style = MaterialTheme.typography.titleMedium, color = SkyCyan)
          Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
            Button(
              onClick = cb.onOpenMapEditor,
              colors = ButtonDefaults.buttonColors(containerColor = WarmAmber, contentColor = MidnightSlate),
              modifier = Modifier.weight(1f).testTag("owner_open_map_builder_btn"),
            ) {
              Icon(Icons.Rounded.Map, contentDescription = null, modifier = Modifier.size(16.dp))
              Spacer(Modifier.width(6.dp))
              Text("Map Builder")
            }
            Button(
              onClick = { cb.onOwnerAction("add_building_here", "{\"name\":\"Owner Landmark\"}") },
              colors = ButtonDefaults.buttonColors(containerColor = SkyCyan, contentColor = MidnightSlate),
              modifier = Modifier.weight(1f).testTag("owner_place_building_btn"),
            ) {
              Text("+ 3D Building")
            }
          }
          Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
            OutlinedButton(
              onClick = { cb.onOwnerAction("grant_cash", "{\"amount\":2000}") },
              modifier = Modifier.weight(1f),
            ) { Text("+$2,000 Cash") }
            OutlinedButton(
              onClick = { cb.onOwnerAction("clear_wanted", "{}") },
              modifier = Modifier.weight(1f),
            ) { Text("Clear Wanted") }
          }
          Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
            OutlinedButton(
              onClick = { cb.onOwnerAction("unlock_all_vehicles", "{}") },
              modifier = Modifier.weight(1f),
            ) { Text("Unlock Fleet") }
            OutlinedButton(
              onClick = { cb.onSelectSection(OwnerDashboardSection.SAVE_PUBLISH) },
              modifier = Modifier.weight(1f),
            ) { Text("Save & Publish") }
          }
        }
      }
    }
  }
}

@Composable
fun OwnerMapsSection(
  state: CityStudioUiState,
  cb: OwnerDashboardCallbacks,
) {
  val draft = state.draftConfig
  val disabledSet = draft.disabledCityIds.toSet()

  var newCityName by remember { mutableStateOf("") }
  var newCityCountry by remember { mutableStateOf("Pakistan") }
  var newCityLat by remember { mutableStateOf("33.5651") }
  var newCityLng by remember { mutableStateOf("73.0169") }
  var newCityPlayable by remember { mutableStateOf(true) }
  var newCityFacade by remember { mutableStateOf("glass") }

  var selectedPlaceId by remember { mutableStateOf("park") }
  var renameValue by remember { mutableStateOf("") }

  var pinName by remember { mutableStateOf("") }
  var pinPreset by remember { mutableStateOf(CityCatalog.locationPresets[3]) }

  LazyColumn(
    verticalArrangement = Arrangement.spacedBy(10.dp),
    contentPadding = PaddingValues(bottom = 16.dp),
  ) {
    // Interactive 3D Map Builder & Custom Roads/Buildings
    item {
      Card(
        colors = CardDefaults.cardColors(containerColor = AsphaltSurface),
        border = BorderStroke(1.dp, WarmAmber.copy(alpha = 0.5f)),
        shape = RoundedCornerShape(16.dp),
      ) {
        Column(modifier = Modifier.fillMaxWidth().padding(14.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
          Text("World Map Builder (Buildings, Roads & Mission POIs)", style = MaterialTheme.typography.titleMedium, color = WarmAmber)
          Text(
            text = "Open the full interactive 2D/3D Map Builder to place custom buildings, draw new 2-tap roads, add POI markers & mission locations.",
            style = MaterialTheme.typography.bodySmall,
            color = MutedSteel,
          )
          Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
            Button(
              onClick = cb.onOpenMapEditor,
              colors = ButtonDefaults.buttonColors(containerColor = WarmAmber, contentColor = MidnightSlate),
              modifier = Modifier.weight(1f),
            ) {
              Icon(Icons.Rounded.Map, contentDescription = null, modifier = Modifier.size(16.dp))
              Spacer(Modifier.width(6.dp))
              Text("Open Map Builder")
            }
            OutlinedButton(
              onClick = { cb.onOwnerAction("clear_custom_world", "{}") },
              modifier = Modifier.weight(1f),
            ) {
              Text("Clear Placed Edits")
            }
          }
        }
      }
    }

    // Add New Playable Map / City
    item {
      Card(
        colors = CardDefaults.cardColors(containerColor = AsphaltSurface),
        border = BorderStroke(1.dp, HairlineBorder),
        shape = RoundedCornerShape(16.dp),
      ) {
        Column(modifier = Modifier.fillMaxWidth().padding(14.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
          Text("Add New Playable Map / City", style = MaterialTheme.typography.titleMedium, color = SkyCyan)
          OutlinedTextField(
            value = newCityName,
            onValueChange = { newCityName = it },
            label = { Text("City Name (e.g. Rawalpindi, PK)") },
            singleLine = true,
            modifier = Modifier.fillMaxWidth().testTag("owner_new_city_name"),
          )
          Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
            OutlinedTextField(
              value = newCityCountry,
              onValueChange = { newCityCountry = it },
              label = { Text("Country") },
              singleLine = true,
              modifier = Modifier.weight(1f),
            )
            OutlinedTextField(
              value = newCityLat,
              onValueChange = { newCityLat = it },
              label = { Text("OSM Lat") },
              singleLine = true,
              modifier = Modifier.weight(0.75f),
            )
            OutlinedTextField(
              value = newCityLng,
              onValueChange = { newCityLng = it },
              label = { Text("OSM Lng") },
              singleLine = true,
              modifier = Modifier.weight(0.75f),
            )
          }
          Row(
            modifier = Modifier.fillMaxWidth().horizontalScroll(rememberScrollState()),
            horizontalArrangement = Arrangement.spacedBy(6.dp),
          ) {
            listOf("glass" to "Modern Glass", "concrete" to "Metro Concrete", "brick" to "Heritage Brick").forEach { (id, lbl) ->
              FilterChip(selected = newCityFacade == id, onClick = { newCityFacade = id }, label = { Text(lbl) })
            }
          }
          Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween, verticalAlignment = Alignment.CenterVertically) {
            Text("3D Playable City Enabled", style = MaterialTheme.typography.bodyMedium)
            Switch(
              checked = newCityPlayable,
              onCheckedChange = { newCityPlayable = it },
              colors = SwitchDefaults.colors(checkedThumbColor = MidnightSlate, checkedTrackColor = EmeraldSignal),
            )
          }
          Button(
            onClick = {
              val cleanName = newCityName.trim()
              if (cleanName.isNotEmpty()) {
                val id = "city_${System.currentTimeMillis()}"
                val city = CustomCityDto(
                  id = id,
                  name = cleanName,
                  country = newCityCountry.trim().ifBlank { "Custom" },
                  mode = "real",
                  playable3d = newCityPlayable,
                  lat = newCityLat.toDoubleOrNull() ?: 31.5204,
                  lng = newCityLng.toDoubleOrNull() ?: 74.3587,
                  facadeStyle = newCityFacade,
                  summary = "Owner custom city ($cleanName) with OSM GPS & districts.",
                )
                cb.onUpdateDraft { it.copy(customCities = it.customCities + city) }
                newCityName = ""
              }
            },
            colors = ButtonDefaults.buttonColors(containerColor = EmeraldSignal, contentColor = MidnightSlate),
            modifier = Modifier.fillMaxWidth().testTag("owner_add_city_btn"),
          ) {
            Icon(Icons.Rounded.Add, contentDescription = null, modifier = Modifier.size(16.dp))
            Spacer(Modifier.width(6.dp))
            Text("Add City to Draft")
          }
        }
      }
    }

    // Manage Built-in & Custom Cities (Lahore, Karachi, Islamabad, Metro City, Custom)
    item {
      Card(
        colors = CardDefaults.cardColors(containerColor = AsphaltSurface),
        border = BorderStroke(1.dp, HairlineBorder),
        shape = RoundedCornerShape(16.dp),
      ) {
        Column(modifier = Modifier.fillMaxWidth().padding(14.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
          Text("Enable / Disable Available Cities", style = MaterialTheme.typography.titleMedium, color = EmeraldSignal)
          CityCatalog.cities.filter { it.id != "original" }.forEach { city ->
            val enabled = !disabledSet.contains(city.id)
            Row(
              modifier = Modifier.fillMaxWidth(),
              horizontalArrangement = Arrangement.SpaceBetween,
              verticalAlignment = Alignment.CenterVertically,
            ) {
              Column(modifier = Modifier.weight(1f)) {
                Text(city.name, style = MaterialTheme.typography.bodyMedium, fontWeight = FontWeight.SemiBold)
                Text(if (city.playable3d) "3D Playable + OSM" else "OSM Navigation Only", style = MaterialTheme.typography.labelSmall, color = MutedSteel)
              }
              Switch(
                checked = enabled,
                onCheckedChange = {
                  cb.onUpdateDraft { cur ->
                    val next = cur.disabledCityIds.toMutableSet()
                    if (enabled) next.add(city.id) else next.remove(city.id)
                    cur.copy(disabledCityIds = next.toList())
                  }
                },
                colors = SwitchDefaults.colors(checkedThumbColor = MidnightSlate, checkedTrackColor = EmeraldSignal),
                modifier = Modifier.testTag("owner_city_toggle_${city.id}"),
              )
            }
          }
          draft.customCities.forEach { cc ->
            val enabled = !disabledSet.contains(cc.id)
            Row(
              modifier = Modifier.fillMaxWidth(),
              horizontalArrangement = Arrangement.SpaceBetween,
              verticalAlignment = Alignment.CenterVertically,
            ) {
              Column(modifier = Modifier.weight(1f)) {
                Text("${cc.name} (Custom)", style = MaterialTheme.typography.bodyMedium, fontWeight = FontWeight.SemiBold, color = SkyCyan)
                Text("${cc.country} · ${if (cc.playable3d) "3D Playable" else "OSM Only"}", style = MaterialTheme.typography.labelSmall, color = MutedSteel)
              }
              Switch(
                checked = enabled,
                onCheckedChange = {
                  cb.onUpdateDraft { cur ->
                    val next = cur.disabledCityIds.toMutableSet()
                    if (enabled) next.add(cc.id) else next.remove(cc.id)
                    cur.copy(disabledCityIds = next.toList())
                  }
                },
              )
              IconButton(onClick = {
                cb.onUpdateDraft { cur -> cur.copy(customCities = cur.customCities.filterNot { it.id == cc.id }) }
              }) {
                Icon(Icons.Rounded.Delete, contentDescription = "Remove Custom City", tint = CrimsonSiren)
              }
            }
          }
        }
      }
    }

    // Rename Landmarks & Add Custom GPS Destinations
    item {
      Card(
        colors = CardDefaults.cardColors(containerColor = AsphaltSurface),
        border = BorderStroke(1.dp, HairlineBorder),
        shape = RoundedCornerShape(16.dp),
      ) {
        Column(modifier = Modifier.fillMaxWidth().padding(14.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
          Text("Rename Landmarks & Custom GPS Destinations", style = MaterialTheme.typography.titleMedium, color = WarmAmber)
          Row(
            modifier = Modifier.fillMaxWidth().horizontalScroll(rememberScrollState()),
            horizontalArrangement = Arrangement.spacedBy(6.dp),
          ) {
            listOf(
              "garage" to "Auto Garage",
              "market" to "Commercial Market",
              "park" to "Central Park",
              "hospital" to "Main Hospital",
              "police" to "Police HQ",
              "airport" to "Airport",
              "mall" to "Neon Mall",
            ).forEach { (id, lbl) ->
              FilterChip(selected = selectedPlaceId == id, onClick = { selectedPlaceId = id }, label = { Text(lbl) })
            }
          }
          Row(horizontalArrangement = Arrangement.spacedBy(8.dp), verticalAlignment = Alignment.CenterVertically) {
            OutlinedTextField(
              value = renameValue,
              onValueChange = { renameValue = it },
              label = { Text("New Landmark Name") },
              singleLine = true,
              modifier = Modifier.weight(1f),
            )
            Button(onClick = {
              val clean = renameValue.trim()
              if (clean.isNotEmpty()) {
                cb.onUpdateDraft { cur ->
                  cur.copy(locationRenames = cur.locationRenames + (selectedPlaceId to clean))
                }
                renameValue = ""
              }
            }) { Text("Rename") }
          }

          if (draft.locationRenames.isNotEmpty()) {
            Text("Active Location Renames (${draft.locationRenames.size})", style = MaterialTheme.typography.labelMedium, color = SkyCyan)
            draft.locationRenames.forEach { (id, label) ->
              Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween, verticalAlignment = Alignment.CenterVertically) {
                Text("$id -> $label", style = MaterialTheme.typography.bodySmall)
                IconButton(onClick = {
                  cb.onUpdateDraft { cur -> cur.copy(locationRenames = cur.locationRenames - id) }
                }) {
                  Icon(Icons.Rounded.Delete, contentDescription = "Reset Rename", tint = CrimsonSiren, modifier = Modifier.size(18.dp))
                }
              }
            }
          }

          OutlinedTextField(
            value = pinName,
            onValueChange = { pinName = it },
            label = { Text("Custom GPS Pin Label") },
            singleLine = true,
            modifier = Modifier.fillMaxWidth(),
          )
          Row(
            modifier = Modifier.fillMaxWidth().horizontalScroll(rememberScrollState()),
            horizontalArrangement = Arrangement.spacedBy(6.dp),
          ) {
            CityCatalog.locationPresets.filter { it.x > 0f }.forEach { preset ->
              FilterChip(selected = pinPreset.id == preset.id, onClick = { pinPreset = preset }, label = { Text(preset.name) })
            }
          }
          Button(
            onClick = {
              val lbl = pinName.trim().ifBlank { "Owner GPS · ${pinPreset.name}" }
              val pin = CustomDestinationPinDto(
                id = "pin_${System.currentTimeMillis()}",
                name = lbl,
                x = pinPreset.x,
                z = pinPreset.z,
                cityId = state.snapshot.selectedCityId,
              )
              cb.onUpdateDraft { cur -> cur.copy(customDestinationPins = cur.customDestinationPins + pin) }
              pinName = ""
            },
            colors = ButtonDefaults.buttonColors(containerColor = SkyCyan, contentColor = MidnightSlate),
            modifier = Modifier.fillMaxWidth(),
          ) {
            Icon(Icons.Rounded.AddLocationAlt, contentDescription = null, modifier = Modifier.size(16.dp))
            Spacer(Modifier.width(6.dp))
            Text("Add Navigable GPS Destination")
          }
          draft.customDestinationPins.forEach { pin ->
            Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween, verticalAlignment = Alignment.CenterVertically) {
              Text("${pin.name} (${pin.cityId})", style = MaterialTheme.typography.bodySmall, color = EmeraldSignal)
              IconButton(onClick = {
                cb.onUpdateDraft { cur -> cur.copy(customDestinationPins = cur.customDestinationPins.filterNot { it.id == pin.id }) }
              }) {
                Icon(Icons.Rounded.Delete, contentDescription = "Delete GPS Pin", tint = CrimsonSiren, modifier = Modifier.size(18.dp))
              }
            }
          }
        }
      }
    }
  }
}

@Composable
fun OwnerMissionsSection(
  state: CityStudioUiState,
  cb: OwnerDashboardCallbacks,
) {
  val draft = state.draftConfig
  val disabledIds = draft.disabledMissionIds.toSet()

  var editingId by remember { mutableStateOf("") }
  var title by remember { mutableStateOf("") }
  var description by remember { mutableStateOf("") }
  var objective by remember { mutableStateOf("Reach Destination") }
  var difficulty by remember { mutableStateOf("Normal") }
  var mode by remember { mutableStateOf("goto") }
  var startPreset by remember { mutableStateOf(CityCatalog.locationPresets.first()) }
  var destPreset by remember { mutableStateOf(CityCatalog.locationPresets[3]) }
  var timeLimitSec by remember { mutableFloatStateOf(90f) }
  var rewardAmt by remember { mutableFloatStateOf(1200f) }

  // Built-in override editor state
  var editingBuiltIn by remember { mutableStateOf<MissionOption?>(null) }
  var bTitle by remember { mutableStateOf("") }
  var bObj by remember { mutableStateOf("") }
  var bReward by remember { mutableFloatStateOf(1000f) }
  var bTime by remember { mutableFloatStateOf(90f) }

  LazyColumn(
    verticalArrangement = Arrangement.spacedBy(10.dp),
    contentPadding = PaddingValues(bottom = 16.dp),
  ) {
    // 1. Custom Mission Creator / Editor
    item {
      Card(
        colors = CardDefaults.cardColors(containerColor = AsphaltSurface),
        border = BorderStroke(1.dp, WarmAmber.copy(alpha = 0.5f)),
        shape = RoundedCornerShape(16.dp),
      ) {
        Column(modifier = Modifier.fillMaxWidth().padding(14.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
          Text(
            text = if (editingId.isEmpty()) "Create Custom Mission" else "Edit Custom Mission",
            style = MaterialTheme.typography.titleMedium,
            color = WarmAmber,
          )
          OutlinedTextField(
            value = title,
            onValueChange = { title = it },
            label = { Text("Mission Title") },
            singleLine = true,
            modifier = Modifier.fillMaxWidth().testTag("custom_mission_title"),
          )
          OutlinedTextField(
            value = description,
            onValueChange = { description = it },
            label = { Text("Story / Briefing Description") },
            modifier = Modifier.fillMaxWidth().testTag("custom_mission_desc"),
          )
          OutlinedTextField(
            value = objective,
            onValueChange = { objective = it },
            label = { Text("Objective") },
            singleLine = true,
            modifier = Modifier.fillMaxWidth().testTag("custom_mission_obj"),
          )

          Row(
            modifier = Modifier.fillMaxWidth().horizontalScroll(rememberScrollState()),
            horizontalArrangement = Arrangement.spacedBy(6.dp),
          ) {
            listOf("Easy", "Normal", "Hard", "Extreme").forEach { d ->
              FilterChip(selected = difficulty == d, onClick = { difficulty = d }, label = { Text(d) })
            }
          }
          Row(
            modifier = Modifier.fillMaxWidth().horizontalScroll(rememberScrollState()),
            horizontalArrangement = Arrangement.spacedBy(6.dp),
          ) {
            listOf("goto" to "Delivery / Route", "combat" to "Combat Raid", "nodamage" to "No-Damage Drive").forEach { (mKey, mLbl) ->
              FilterChip(selected = mode == mKey, onClick = { mode = mKey }, label = { Text(mLbl) })
            }
          }

          Text("Start: ${startPreset.name}", style = MaterialTheme.typography.labelLarge, color = SkyCyan)
          Row(
            modifier = Modifier.fillMaxWidth().horizontalScroll(rememberScrollState()),
            horizontalArrangement = Arrangement.spacedBy(6.dp),
          ) {
            CityCatalog.locationPresets.forEach { preset ->
              FilterChip(selected = startPreset.id == preset.id, onClick = { startPreset = preset }, label = { Text(preset.name) })
            }
          }

          Text("Target: ${destPreset.name}", style = MaterialTheme.typography.labelLarge, color = EmeraldSignal)
          Row(
            modifier = Modifier.fillMaxWidth().horizontalScroll(rememberScrollState()),
            horizontalArrangement = Arrangement.spacedBy(6.dp),
          ) {
            CityCatalog.locationPresets.filter { it.x > 0f }.forEach { preset ->
              FilterChip(selected = destPreset.id == preset.id, onClick = { destPreset = preset }, label = { Text(preset.name) })
            }
          }

          Text("Time Limit: ${if (timeLimitSec <= 0f) "Unlimited" else "${timeLimitSec.roundToInt()}s"}", style = MaterialTheme.typography.bodyMedium)
          Slider(value = timeLimitSec, onValueChange = { timeLimitSec = it }, valueRange = 0f..240f, steps = 7)

          Text("Cash Reward: $${rewardAmt.roundToInt()}", style = MaterialTheme.typography.bodyMedium, color = EmeraldSignal)
          Slider(
            value = rewardAmt,
            onValueChange = { rewardAmt = it },
            valueRange = 250f..5000f,
            colors = SliderDefaults.colors(thumbColor = EmeraldSignal, activeTrackColor = EmeraldSignal),
          )

          Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
            Button(
              onClick = {
                val dto = CustomMissionDto(
                  id = editingId.ifBlank { "custom_${System.currentTimeMillis()}" },
                  title = title.ifBlank { "Owner Contract" },
                  description = description.ifBlank { "Owner custom open-world contract." },
                  objective = objective.ifBlank { "Reach ${destPreset.name}" },
                  startX = if (startPreset.x > 0f) startPreset.x else null,
                  startZ = if (startPreset.z > 0f) startPreset.z else null,
                  tx = destPreset.x.coerceAtLeast(100f),
                  tz = destPreset.z.coerceAtLeast(100f),
                  time = timeLimitSec.roundToInt(),
                  reward = rewardAmt.roundToInt(),
                  xp = (rewardAmt / 5f).roundToInt(),
                  difficulty = difficulty,
                  mode = mode,
                )
                cb.onUpsertCustomMission(dto)
                editingId = ""
                title = ""
                description = ""
              },
              colors = ButtonDefaults.buttonColors(containerColor = WarmAmber, contentColor = MidnightSlate),
              modifier = Modifier.weight(1f).testTag("save_custom_mission_btn"),
            ) {
              Icon(Icons.Rounded.Add, contentDescription = null, modifier = Modifier.size(16.dp))
              Spacer(Modifier.width(6.dp))
              Text(if (editingId.isEmpty()) "Save Custom Mission" else "Update Mission")
            }
            if (editingId.isNotEmpty()) {
              OutlinedButton(onClick = {
                editingId = ""
                title = ""
                description = ""
              }) { Text("Cancel") }
            }
          }
        }
      }
    }

    if (state.snapshot.customMissions.isNotEmpty()) {
      items(state.snapshot.customMissions, key = { "om_c_${it.id}" }) { cm ->
        Card(
          colors = CardDefaults.cardColors(containerColor = AsphaltSurface),
          border = BorderStroke(1.dp, HairlineBorder),
          shape = RoundedCornerShape(14.dp),
        ) {
          Row(modifier = Modifier.fillMaxWidth().padding(12.dp), verticalAlignment = Alignment.CenterVertically) {
            Column(modifier = Modifier.weight(1f)) {
              Text(cm.title, style = MaterialTheme.typography.titleMedium)
              Text("${cm.difficulty} · $${cm.reward} · ${cm.objective}", style = MaterialTheme.typography.labelSmall, color = MutedSteel)
            }
            IconButton(onClick = { cb.onStartMission(cm.id) }) {
              Icon(Icons.Rounded.PlayArrow, contentDescription = "Play Mission", tint = EmeraldSignal)
            }
            IconButton(onClick = {
              editingId = cm.id
              title = cm.title
              description = cm.description
              objective = cm.objective
              difficulty = cm.difficulty
              mode = cm.mode
              timeLimitSec = cm.time.toFloat()
              rewardAmt = cm.reward.toFloat()
            }) {
              Icon(Icons.Rounded.Edit, contentDescription = "Edit Mission", tint = SkyCyan)
            }
            IconButton(onClick = { cb.onDeleteCustomMission(cm.id) }) {
              Icon(Icons.Rounded.Delete, contentDescription = "Delete Mission", tint = CrimsonSiren)
            }
          }
        }
      }
    }

    // 2. Built-in Story & Free Mission Overrides + Enable/Disable
    editingBuiltIn?.let { bm ->
      item(key = "edit_builtin_${bm.id}") {
        Card(
          colors = CardDefaults.cardColors(containerColor = ElevatedConcrete),
          border = BorderStroke(1.5.dp, SkyCyan),
          shape = RoundedCornerShape(16.dp),
        ) {
          Column(modifier = Modifier.fillMaxWidth().padding(14.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
            Text("Editing Built-in: ${bm.title}", style = MaterialTheme.typography.titleMedium, color = SkyCyan)
            OutlinedTextField(value = bTitle, onValueChange = { bTitle = it }, label = { Text("Override Title") }, singleLine = true, modifier = Modifier.fillMaxWidth())
            OutlinedTextField(value = bObj, onValueChange = { bObj = it }, label = { Text("Override Objective") }, singleLine = true, modifier = Modifier.fillMaxWidth())
            Text("Reward: $${bReward.roundToInt()} · Time: ${bTime.roundToInt()}s", style = MaterialTheme.typography.bodySmall, color = EmeraldSignal)
            Slider(value = bReward, onValueChange = { bReward = it }, valueRange = 200f..8000f)
            Slider(value = bTime, onValueChange = { bTime = it }, valueRange = 0f..300f)
            Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
              Button(
                onClick = {
                  val ov = MissionOverrideDto(
                    title = bTitle.trim(),
                    objective = bObj.trim(),
                    reward = bReward.roundToInt(),
                    time = bTime.roundToInt(),
                  )
                  cb.onUpdateDraft { cur -> cur.copy(missionOverrides = cur.missionOverrides + (bm.id to ov)) }
                  editingBuiltIn = null
                },
                modifier = Modifier.weight(1f),
              ) { Text("Save Override to Draft") }
              OutlinedButton(onClick = { editingBuiltIn = null }) { Text("Cancel") }
            }
          }
        }
      }
    }

    item {
      Text("Built-in Story & Free Missions (Enable / Disable / Override)", style = MaterialTheme.typography.labelLarge, color = SkyCyan)
    }
    items(CityCatalog.missions, key = { "om_b_${it.id}" }) { m ->
      val ov = draft.missionOverrides[m.id]
      val enabled = !disabledIds.contains(m.id)
      Card(
        colors = CardDefaults.cardColors(containerColor = AsphaltSurface),
        border = BorderStroke(1.dp, if (ov != null) SkyCyan.copy(alpha = 0.5f) else HairlineBorder),
        shape = RoundedCornerShape(12.dp),
      ) {
        Row(modifier = Modifier.fillMaxWidth().padding(10.dp), verticalAlignment = Alignment.CenterVertically) {
          Column(modifier = Modifier.weight(1f)) {
            Text(ov?.title?.ifBlank { null } ?: m.title, style = MaterialTheme.typography.bodyMedium, fontWeight = FontWeight.SemiBold)
            Text(
              text = "${m.track.uppercase()} · $${if ((ov?.reward ?: -1) > 0) ov!!.reward else m.reward}",
              style = MaterialTheme.typography.labelSmall,
              color = MutedSteel,
            )
          }
          IconButton(onClick = {
            editingBuiltIn = m
            bTitle = ov?.title?.ifBlank { null } ?: m.title
            bObj = ov?.objective?.ifBlank { null } ?: m.objective
            bReward = (if ((ov?.reward ?: -1) > 0) ov!!.reward else m.reward).toFloat()
            bTime = (if ((ov?.time ?: -1) >= 0) ov!!.time else m.durationSec).toFloat()
          }) {
            Icon(Icons.Rounded.Edit, contentDescription = "Edit Mission", tint = SkyCyan)
          }
          if (ov != null) {
            IconButton(onClick = {
              cb.onUpdateDraft { cur -> cur.copy(missionOverrides = cur.missionOverrides - m.id) }
            }) {
              Icon(Icons.Rounded.Restore, contentDescription = "Reset Override", tint = WarmAmber)
            }
          }
          Switch(
            checked = enabled,
            onCheckedChange = {
              cb.onUpdateDraft { cur ->
                val next = cur.disabledMissionIds.toMutableSet()
                if (enabled) next.add(m.id) else next.remove(m.id)
                cur.copy(disabledMissionIds = next.toList())
              }
            },
            colors = SwitchDefaults.colors(checkedThumbColor = MidnightSlate, checkedTrackColor = EmeraldSignal),
          )
        }
      }
    }
  }
}
