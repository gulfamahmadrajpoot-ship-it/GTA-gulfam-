package com.example

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
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.rounded.AccountCircle
import androidx.compose.material.icons.rounded.Add
import androidx.compose.material.icons.rounded.Close
import androidx.compose.material.icons.rounded.Delete
import androidx.compose.material.icons.rounded.DirectionsCar
import androidx.compose.material.icons.rounded.Edit
import androidx.compose.material.icons.rounded.LocalPolice
import androidx.compose.material.icons.rounded.PhotoLibrary
import androidx.compose.material.icons.rounded.Visibility
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
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.res.painterResource
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
fun OwnerPoliceSection(
  state: CityStudioUiState,
  cb: OwnerDashboardCallbacks,
) {
  val pol = state.draftConfig.police

  LazyColumn(
    verticalArrangement = Arrangement.spacedBy(10.dp),
    contentPadding = PaddingValues(bottom = 16.dp),
  ) {
    item {
      Card(
        colors = CardDefaults.cardColors(containerColor = AsphaltSurface),
        border = BorderStroke(1.dp, CrimsonSiren.copy(alpha = 0.5f)),
        shape = RoundedCornerShape(16.dp),
      ) {
        Column(modifier = Modifier.fillMaxWidth().padding(14.dp), verticalArrangement = Arrangement.spacedBy(10.dp)) {
          Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(8.dp)) {
            Icon(Icons.Rounded.LocalPolice, contentDescription = null, tint = SkyCyan)
            Text("Police AI & Pursuit System Control", style = MaterialTheme.typography.titleMedium, color = SkyCyan)
          }

          Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween, verticalAlignment = Alignment.CenterVertically) {
            Column(modifier = Modifier.weight(1f)) {
              Text("Police System Enabled", style = MaterialTheme.typography.bodyMedium, fontWeight = FontWeight.SemiBold)
              Text("Disable to allow free exploration without arrests or sirens", style = MaterialTheme.typography.labelSmall, color = MutedSteel)
            }
            Switch(
              checked = pol.enabled,
              onCheckedChange = { enabled -> cb.onUpdateDraft { it.copy(police = it.police.copy(enabled = enabled)) } },
              colors = SwitchDefaults.colors(checkedThumbColor = MidnightSlate, checkedTrackColor = EmeraldSignal),
              modifier = Modifier.testTag("owner_police_enabled_switch"),
            )
          }

          Text("Max Active Police Vehicles: ${pol.maxVehicles}", style = MaterialTheme.typography.bodyMedium)
          Slider(
            value = pol.maxVehicles.toFloat(),
            onValueChange = { v -> cb.onUpdateDraft { it.copy(police = it.police.copy(maxVehicles = v.roundToInt().coerceIn(0, 16))) } },
            valueRange = 0f..16f,
            steps = 15,
          )

          Text("Chase Difficulty / Aggression: ${"%.1f".format(pol.difficulty)}x", style = MaterialTheme.typography.bodyMedium, color = WarmAmber)
          Slider(
            value = pol.difficulty,
            onValueChange = { v -> cb.onUpdateDraft { it.copy(police = it.police.copy(difficulty = v.coerceIn(0.5f, 2.0f))) } },
            valueRange = 0.5f..2.0f,
            colors = SliderDefaults.colors(thumbColor = WarmAmber, activeTrackColor = WarmAmber),
          )

          Text("Police Response Speed: ${"%.1f".format(pol.responseSpeed)}x", style = MaterialTheme.typography.bodyMedium, color = SkyCyan)
          Slider(
            value = pol.responseSpeed,
            onValueChange = { v -> cb.onUpdateDraft { it.copy(police = it.police.copy(responseSpeed = v.coerceIn(0.5f, 2.0f))) } },
            valueRange = 0.5f..2.0f,
          )

          Text("Minimum Wanted Stars: ${pol.minWanted} ★", style = MaterialTheme.typography.bodyMedium)
          Slider(
            value = pol.minWanted.toFloat(),
            onValueChange = { v ->
              val minW = v.roundToInt().coerceIn(0, 5)
              cb.onUpdateDraft { it.copy(police = it.police.copy(minWanted = minW, maxWanted = maxOf(minW, it.police.maxWanted))) }
            },
            valueRange = 0f..5f,
            steps = 4,
          )

          Text("Maximum Wanted Stars: ${pol.maxWanted} ★", style = MaterialTheme.typography.bodyMedium, color = CrimsonSiren)
          Slider(
            value = pol.maxWanted.toFloat(),
            onValueChange = { v ->
              val maxW = v.roundToInt().coerceIn(pol.minWanted, 5)
              cb.onUpdateDraft { it.copy(police = it.police.copy(maxWanted = maxW)) }
            },
            valueRange = 0f..5f,
            steps = 4,
          )

          Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween, verticalAlignment = Alignment.CenterVertically) {
            Text("Police Helicopters (3★+)", style = MaterialTheme.typography.bodyMedium)
            Switch(
              checked = pol.helisEnabled,
              onCheckedChange = { h -> cb.onUpdateDraft { it.copy(police = it.police.copy(helisEnabled = h)) } },
            )
          }

          Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween, verticalAlignment = Alignment.CenterVertically) {
            Text("Police Roadblocks (3★+)", style = MaterialTheme.typography.bodyMedium)
            Switch(
              checked = pol.roadblocksEnabled,
              onCheckedChange = { rb -> cb.onUpdateDraft { it.copy(police = it.police.copy(roadblocksEnabled = rb)) } },
            )
          }
        }
      }
    }
  }
}

@Composable
fun OwnerVehiclesSection(
  state: CityStudioUiState,
  cb: OwnerDashboardCallbacks,
) {
  val draft = state.draftConfig
  var newName by remember { mutableStateOf("") }
  var newCategory by remember { mutableStateOf("Sports Car") }
  var newKindType by remember { mutableStateOf("car") }
  var newPrice by remember { mutableFloatStateOf(3200f) }
  var newMaxSpeed by remember { mutableFloatStateOf(580f) }

  var editingBuiltInKind by remember { mutableStateOf<String?>(null) }
  var editPrice by remember { mutableFloatStateOf(1500f) }
  var editSpeed by remember { mutableFloatStateOf(500f) }

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
        Column(modifier = Modifier.fillMaxWidth().padding(14.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
          Text("Add New Custom Vehicle", style = MaterialTheme.typography.titleMedium, color = WarmAmber)
          OutlinedTextField(
            value = newName,
            onValueChange = { newName = it },
            label = { Text("Vehicle Name (e.g. Horizon Hypercar)") },
            singleLine = true,
            modifier = Modifier.fillMaxWidth(),
          )
          Row(
            modifier = Modifier.fillMaxWidth().horizontalScroll(rememberScrollState()),
            horizontalArrangement = Arrangement.spacedBy(6.dp),
          ) {
            listOf("car" to "Sports Car", "suv" to "SUV", "moto" to "Motorcycle", "truck" to "Truck", "boat" to "Boat", "heli" to "Helicopter").forEach { (kt, cat) ->
              FilterChip(
                selected = newKindType == kt,
                onClick = {
                  newKindType = kt
                  newCategory = cat
                },
                label = { Text(cat) },
              )
            }
          }
          Text("Top Speed: ${newMaxSpeed.roundToInt()} · Price: $${newPrice.roundToInt()}", style = MaterialTheme.typography.bodySmall, color = SkyCyan)
          Slider(value = newMaxSpeed, onValueChange = { newMaxSpeed = it }, valueRange = 280f..780f)
          Slider(value = newPrice, onValueChange = { newPrice = it }, valueRange = 0f..15000f)

          Button(
            onClick = {
              val clean = newName.trim()
              if (clean.isNotEmpty()) {
                val cv = CustomVehicleDto(
                  kind = "custom_v_${System.currentTimeMillis()}",
                  name = clean,
                  category = newCategory,
                  kindType = newKindType,
                  maxSpeed = newMaxSpeed.roundToInt(),
                  turn = if (newKindType == "moto") 3.7f else 3.0f,
                  price = newPrice.roundToInt(),
                  defaultColor = "#f59e0b",
                )
                cb.onUpdateDraft { cur -> cur.copy(customVehicles = cur.customVehicles + cv) }
                newName = ""
              }
            },
            colors = ButtonDefaults.buttonColors(containerColor = EmeraldSignal, contentColor = MidnightSlate),
            modifier = Modifier.fillMaxWidth().testTag("owner_add_vehicle_btn"),
          ) {
            Icon(Icons.Rounded.Add, contentDescription = null, modifier = Modifier.size(16.dp))
            Spacer(Modifier.width(6.dp))
            Text("Add Vehicle to Draft")
          }
        }
      }
    }

    editingBuiltInKind?.let { kind ->
      val vBase = CityCatalog.vehicles.find { it.kind == kind }
      item(key = "edit_veh_$kind") {
        Card(
          colors = CardDefaults.cardColors(containerColor = ElevatedConcrete),
          border = BorderStroke(1.5.dp, SkyCyan),
          shape = RoundedCornerShape(14.dp),
        ) {
          Column(modifier = Modifier.fillMaxWidth().padding(12.dp), verticalArrangement = Arrangement.spacedBy(6.dp)) {
            Text("Tune ${vBase?.name ?: kind}", style = MaterialTheme.typography.titleMedium, color = SkyCyan)
            Text("Price: $${editPrice.roundToInt()} · Max Speed: ${editSpeed.roundToInt()}", style = MaterialTheme.typography.bodySmall)
            Slider(value = editPrice, onValueChange = { editPrice = it }, valueRange = 0f..15000f)
            Slider(value = editSpeed, onValueChange = { editSpeed = it }, valueRange = 260f..780f)
            Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
              Button(
                onClick = {
                  val curOv = draft.vehicleOverrides[kind] ?: VehicleOverrideDto()
                  val nextOv = curOv.copy(price = editPrice.roundToInt(), maxSpeed = editSpeed.roundToInt())
                  cb.onUpdateDraft { it.copy(vehicleOverrides = it.vehicleOverrides + (kind to nextOv)) }
                  editingBuiltInKind = null
                },
                modifier = Modifier.weight(1f),
              ) { Text("Save Tuning") }
              OutlinedButton(onClick = { editingBuiltInKind = null }) { Text("Cancel") }
            }
          }
        }
      }
    }

    items(draft.customVehicles, key = { "ov_cv_${it.kind}" }) { cv ->
      val customWrap = state.customVehicleDataUrls[cv.kind]
      val customBmp = rememberOwnerBase64Bitmap(customWrap)
      Card(
        colors = CardDefaults.cardColors(containerColor = AsphaltSurface),
        border = BorderStroke(1.dp, SkyCyan.copy(alpha = 0.45f)),
        shape = RoundedCornerShape(14.dp),
      ) {
        Column(modifier = Modifier.fillMaxWidth().padding(12.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
          Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(10.dp)) {
            if (customBmp != null) {
              Image(bitmap = customBmp, contentDescription = cv.name, modifier = Modifier.size(44.dp).clip(RoundedCornerShape(8.dp)), contentScale = ContentScale.Crop)
            } else {
              Icon(Icons.Rounded.DirectionsCar, contentDescription = null, tint = WarmAmber, modifier = Modifier.size(30.dp))
            }
            Column(modifier = Modifier.weight(1f)) {
              Text("${cv.name} (Custom)", style = MaterialTheme.typography.titleMedium, color = SkyCyan)
              Text("${cv.category} · Spd ${cv.maxSpeed} · $${cv.price}", style = MaterialTheme.typography.labelSmall, color = MutedSteel)
            }
            Switch(
              checked = !cv.disabled,
              onCheckedChange = { enabled ->
                cb.onUpdateDraft { cur ->
                  cur.copy(customVehicles = cur.customVehicles.map { if (it.kind == cv.kind) it.copy(disabled = !enabled) else it })
                }
              },
            )
            IconButton(onClick = {
              cb.onUpdateDraft { cur -> cur.copy(customVehicles = cur.customVehicles.filterNot { it.kind == cv.kind }) }
            }) { Icon(Icons.Rounded.Delete, contentDescription = "Delete Custom Vehicle", tint = CrimsonSiren) }
          }
          Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
            Button(onClick = { cb.onPickPhoto("vehicle", cv.kind) }, modifier = Modifier.weight(1f)) {
              Icon(Icons.Rounded.PhotoLibrary, contentDescription = null, modifier = Modifier.size(16.dp))
              Spacer(Modifier.width(6.dp))
              Text("Upload Image")
            }
            if (customWrap != null) {
              OutlinedButton(onClick = { cb.onClearPhoto("vehicle", cv.kind) }) { Text("Clear") }
            }
          }
        }
      }
    }

    items(CityCatalog.vehicles, key = { "ov_bv_${it.kind}" }) { veh ->
      val ov = draft.vehicleOverrides[veh.kind]
      val enabled = !(ov?.disabled ?: false)
      val effPrice = if ((ov?.price ?: -1) >= 0) ov!!.price else veh.price
      val customWrap = state.customVehicleDataUrls[veh.kind]
      val customBmp = rememberOwnerBase64Bitmap(customWrap)
      Card(
        colors = CardDefaults.cardColors(containerColor = AsphaltSurface),
        border = BorderStroke(1.dp, HairlineBorder),
        shape = RoundedCornerShape(14.dp),
      ) {
        Column(modifier = Modifier.fillMaxWidth().padding(12.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
          Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(10.dp)) {
            if (customBmp != null) {
              Image(bitmap = customBmp, contentDescription = veh.name, modifier = Modifier.size(40.dp).clip(RoundedCornerShape(8.dp)), contentScale = ContentScale.Crop)
            } else {
              Icon(Icons.Rounded.DirectionsCar, contentDescription = null, tint = WarmAmber, modifier = Modifier.size(26.dp))
            }
            Column(modifier = Modifier.weight(1f)) {
              Text(veh.name, style = MaterialTheme.typography.titleMedium)
              Text("${veh.category} · $$effPrice", style = MaterialTheme.typography.labelSmall, color = MutedSteel)
            }
            IconButton(onClick = {
              editingBuiltInKind = veh.kind
              editPrice = effPrice.toFloat()
              editSpeed = (if ((ov?.maxSpeed ?: -1) > 0) ov!!.maxSpeed else 500).toFloat()
            }) { Icon(Icons.Rounded.Edit, contentDescription = "Tune Vehicle", tint = SkyCyan) }
            Switch(
              checked = enabled,
              onCheckedChange = { nextEnabled ->
                val curOv = ov ?: VehicleOverrideDto()
                cb.onUpdateDraft { cur -> cur.copy(vehicleOverrides = cur.vehicleOverrides + (veh.kind to curOv.copy(disabled = !nextEnabled))) }
              },
            )
          }
          Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
            OutlinedButton(onClick = { cb.onPickPhoto("vehicle", veh.kind) }, modifier = Modifier.weight(1f)) {
              Icon(Icons.Rounded.PhotoLibrary, contentDescription = null, modifier = Modifier.size(15.dp))
              Spacer(Modifier.width(6.dp))
              Text(if (customBmp != null) "Change Wrap Photo" else "Upload Vehicle Image")
            }
            if (customBmp != null) {
              OutlinedButton(onClick = { cb.onClearPhoto("vehicle", veh.kind) }) { Text("Reset") }
            }
          }
        }
      }
    }
  }
}

@Composable
fun OwnerCharactersSection(
  state: CityStudioUiState,
  cb: OwnerDashboardCallbacks,
) {
  val draft = state.draftConfig
  var newName by remember { mutableStateOf("") }
  var newRole by remember { mutableStateOf("City Specialist") }
  var newOutfit by remember { mutableStateOf("streetwear") }
  var newHealth by remember { mutableFloatStateOf(110f) }
  var newSpeed by remember { mutableFloatStateOf(1.05f) }

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
        Column(modifier = Modifier.fillMaxWidth().padding(14.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
          Text("Create New Playable Character", style = MaterialTheme.typography.titleMedium, color = WarmAmber)
          OutlinedTextField(
            value = newName,
            onValueChange = { newName = it },
            label = { Text("Character Name (e.g. Bilal Raza)") },
            singleLine = true,
            modifier = Modifier.fillMaxWidth(),
          )
          OutlinedTextField(
            value = newRole,
            onValueChange = { newRole = it },
            label = { Text("Role / Specialty") },
            singleLine = true,
            modifier = Modifier.fillMaxWidth(),
          )
          Row(
            modifier = Modifier.fillMaxWidth().horizontalScroll(rememberScrollState()),
            horizontalArrangement = Arrangement.spacedBy(6.dp),
          ) {
            CityCatalog.outfits.forEach { o ->
              FilterChip(selected = newOutfit == o.id, onClick = { newOutfit = o.id }, label = { Text(o.name) })
            }
          }
          Text("Max Health: ${newHealth.roundToInt()} · Speed: ${"%.2f".format(newSpeed)}x", style = MaterialTheme.typography.bodySmall, color = EmeraldSignal)
          Slider(value = newHealth, onValueChange = { newHealth = it }, valueRange = 80f..200f)
          Slider(value = newSpeed, onValueChange = { newSpeed = it }, valueRange = 0.8f..1.4f)
          Button(
            onClick = {
              val clean = newName.trim()
              if (clean.isNotEmpty()) {
                val cc = CustomCharacterDto(
                  id = "hero_${System.currentTimeMillis()}",
                  name = clean,
                  role = newRole.trim().ifBlank { "Operative" },
                  defaultOutfit = newOutfit,
                  maxHealth = newHealth.roundToInt(),
                  speedMult = newSpeed,
                )
                cb.onUpdateDraft { cur -> cur.copy(customCharacters = cur.customCharacters + cc) }
                newName = ""
              }
            },
            colors = ButtonDefaults.buttonColors(containerColor = EmeraldSignal, contentColor = MidnightSlate),
            modifier = Modifier.fillMaxWidth(),
          ) {
            Icon(Icons.Rounded.Add, contentDescription = null, modifier = Modifier.size(16.dp))
            Spacer(Modifier.width(6.dp))
            Text("Add Character to Draft")
          }
        }
      }
    }

    items(draft.customCharacters, key = { "oc_c_${it.id}" }) { cc ->
      val bmp = rememberOwnerBase64Bitmap(state.customCharacterDataUrls[cc.id])
      Card(
        colors = CardDefaults.cardColors(containerColor = AsphaltSurface),
        border = BorderStroke(1.dp, SkyCyan.copy(alpha = 0.45f)),
        shape = RoundedCornerShape(14.dp),
      ) {
        Column(modifier = Modifier.fillMaxWidth().padding(12.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
          Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(10.dp)) {
            Box(
              modifier = Modifier.size(48.dp).clip(CircleShape).background(ElevatedConcrete).border(1.5.dp, SkyCyan, CircleShape),
              contentAlignment = Alignment.Center,
            ) {
              if (bmp != null) Image(bitmap = bmp, contentDescription = cc.name, modifier = Modifier.fillMaxSize(), contentScale = ContentScale.Crop)
              else Icon(Icons.Rounded.AccountCircle, contentDescription = null, tint = SkyCyan, modifier = Modifier.size(30.dp))
            }
            Column(modifier = Modifier.weight(1f)) {
              Text("${cc.name} (Custom)", style = MaterialTheme.typography.titleMedium, color = SkyCyan)
              Text("${cc.role} · HP ${cc.maxHealth} · ${"%.2f".format(cc.speedMult)}x", style = MaterialTheme.typography.labelSmall, color = MutedSteel)
            }
            Switch(
              checked = !cc.disabled,
              onCheckedChange = { en ->
                cb.onUpdateDraft { cur -> cur.copy(customCharacters = cur.customCharacters.map { if (it.id == cc.id) it.copy(disabled = !en) else it }) }
              },
            )
            IconButton(onClick = {
              cb.onUpdateDraft { cur -> cur.copy(customCharacters = cur.customCharacters.filterNot { it.id == cc.id }) }
            }) { Icon(Icons.Rounded.Delete, contentDescription = "Remove Character", tint = CrimsonSiren) }
          }
          Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
            Button(onClick = { cb.onPickPhoto("character", cc.id) }, modifier = Modifier.weight(1f)) {
              Icon(Icons.Rounded.PhotoLibrary, contentDescription = null, modifier = Modifier.size(16.dp))
              Spacer(Modifier.width(6.dp))
              Text("Upload Portrait")
            }
            if (bmp != null) OutlinedButton(onClick = { cb.onClearPhoto("character", cc.id) }) { Text("Clear") }
          }
        }
      }
    }

    items(CityCatalog.characters, key = { "oc_b_${it.id}" }) { ch ->
      val ov = draft.characterOverrides[ch.id]
      val enabled = !(ov?.disabled ?: false)
      val bmp = rememberOwnerBase64Bitmap(state.customCharacterDataUrls[ch.id])
      Card(
        colors = CardDefaults.cardColors(containerColor = AsphaltSurface),
        border = BorderStroke(1.dp, HairlineBorder),
        shape = RoundedCornerShape(14.dp),
      ) {
        Column(modifier = Modifier.fillMaxWidth().padding(12.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
          Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(10.dp)) {
            Box(
              modifier = Modifier.size(44.dp).clip(CircleShape).background(ElevatedConcrete).border(1.5.dp, ch.accentColor, CircleShape),
              contentAlignment = Alignment.Center,
            ) {
              if (bmp != null) Image(bitmap = bmp, contentDescription = ch.name, modifier = Modifier.fillMaxSize(), contentScale = ContentScale.Crop)
              else Icon(Icons.Rounded.AccountCircle, contentDescription = null, tint = ch.accentColor, modifier = Modifier.size(28.dp))
            }
            Column(modifier = Modifier.weight(1f)) {
              Text(ch.name, style = MaterialTheme.typography.titleMedium)
              Text("${ch.role} · Default: ${ch.defaultOutfit}", style = MaterialTheme.typography.labelSmall, color = MutedSteel)
            }
            Switch(
              checked = enabled,
              onCheckedChange = { en ->
                val curOv = ov ?: CharacterOverrideDto()
                cb.onUpdateDraft { cur -> cur.copy(characterOverrides = cur.characterOverrides + (ch.id to curOv.copy(disabled = !en))) }
              },
            )
          }
          Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
            OutlinedButton(onClick = { cb.onPickPhoto("character", ch.id) }, modifier = Modifier.weight(1f)) {
              Text(if (bmp != null) "Change Custom Face" else "Upload Character Image")
            }
            if (bmp != null) OutlinedButton(onClick = { cb.onClearPhoto("character", ch.id) }) { Text("Reset") }
          }
        }
      }
    }
  }
}

@Composable
fun OwnerAdsSection(
  state: CityStudioUiState,
  cb: OwnerDashboardCallbacks,
) {
  val draft = state.draftConfig
  val disabledAds = draft.disabledBillboardIds.toSet()

  var newAdTitle by remember { mutableStateOf("") }
  var newAdType by remember { mutableStateOf("billboard") }
  var adSpot by remember { mutableStateOf(CityCatalog.locationPresets[3]) }
  var previewSlot by remember { mutableStateOf<Pair<String, String?>?>(null) }

  previewSlot?.let { (adTitle, dataUrl) ->
    val bmp = rememberOwnerBase64Bitmap(dataUrl)
    AlertDialog(
      onDismissRequest = { previewSlot = null },
      containerColor = MidnightSlate,
      title = { Text("Poster Preview · $adTitle", color = WarmAmber) },
      text = {
        Box(
          modifier = Modifier.fillMaxWidth().height(220.dp).clip(RoundedCornerShape(12.dp)).background(Color.Black),
          contentAlignment = Alignment.Center,
        ) {
          if (bmp != null) {
            Image(bitmap = bmp, contentDescription = adTitle, modifier = Modifier.fillMaxSize(), contentScale = ContentScale.Fit)
          } else {
            Text("Default city editorial poster active.", color = MutedSteel)
          }
        }
      },
      confirmButton = {
        Button(onClick = { previewSlot = null }) { Text("Close Preview") }
      },
    )
  }

  LazyColumn(
    verticalArrangement = Arrangement.spacedBy(10.dp),
    contentPadding = PaddingValues(bottom = 16.dp),
  ) {
    state.photoStatusMessage?.let { msg ->
      item {
        Surface(color = ElevatedConcrete, shape = RoundedCornerShape(10.dp), modifier = Modifier.fillMaxWidth()) {
          Row(modifier = Modifier.padding(10.dp), horizontalArrangement = Arrangement.SpaceBetween, verticalAlignment = Alignment.CenterVertically) {
            Text(msg, style = MaterialTheme.typography.bodySmall, color = SkyCyan, modifier = Modifier.weight(1f))
            IconButton(onClick = cb.onClearStatusBanner, modifier = Modifier.size(28.dp)) {
              Icon(Icons.Rounded.Close, contentDescription = "Dismiss", tint = MutedSteel, modifier = Modifier.size(16.dp))
            }
          }
        }
      }
    }

    item {
      Card(
        colors = CardDefaults.cardColors(containerColor = AsphaltSurface),
        border = BorderStroke(1.dp, WarmAmber.copy(alpha = 0.5f)),
        shape = RoundedCornerShape(16.dp),
      ) {
        Column(modifier = Modifier.fillMaxWidth().padding(14.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
          Text("Add New Billboard / Shop Ad / Wall Poster", style = MaterialTheme.typography.titleMedium, color = WarmAmber)
          Text(
            text = "Uploaded JPG, PNG, or WebP posters render verbatim without cropping or stretching text/logos.",
            style = MaterialTheme.typography.bodySmall,
            color = MutedSteel,
          )
          OutlinedTextField(
            value = newAdTitle,
            onValueChange = { newAdTitle = it },
            label = { Text("Poster / Brand Title") },
            singleLine = true,
            modifier = Modifier.fillMaxWidth(),
          )
          Row(horizontalArrangement = Arrangement.spacedBy(6.dp)) {
            listOf("billboard" to "Highway Billboard", "shop" to "Shop Sign", "wall" to "Wall Poster").forEach { (k, lbl) ->
              FilterChip(selected = newAdType == k, onClick = { newAdType = k }, label = { Text(lbl) })
            }
          }
          Row(
            modifier = Modifier.fillMaxWidth().horizontalScroll(rememberScrollState()),
            horizontalArrangement = Arrangement.spacedBy(6.dp),
          ) {
            CityCatalog.locationPresets.filter { it.x > 0f }.forEach { p ->
              FilterChip(selected = adSpot.id == p.id, onClick = { adSpot = p }, label = { Text(p.name) })
            }
          }
          Button(
            onClick = {
              val clean = newAdTitle.trim().ifBlank { "${adSpot.name} Sponsor" }
              val bb = CustomBillboardDto(
                id = "custom_bb_${System.currentTimeMillis()}",
                title = clean,
                location = adSpot.name,
                adType = newAdType,
                x = adSpot.x + 85f,
                z = adSpot.z - 65f,
                rotY = 0f,
              )
              cb.onUpdateDraft { cur -> cur.copy(customBillboards = cur.customBillboards + bb) }
              newAdTitle = ""
            },
            colors = ButtonDefaults.buttonColors(containerColor = EmeraldSignal, contentColor = MidnightSlate),
            modifier = Modifier.fillMaxWidth(),
          ) {
            Icon(Icons.Rounded.Add, contentDescription = null, modifier = Modifier.size(16.dp))
            Spacer(Modifier.width(6.dp))
            Text("Place Ad Slot in City")
          }
        }
      }
    }

    items(draft.customBillboards, key = { "oad_c_${it.id}" }) { bb ->
      val url = state.customBillboardDataUrls[bb.id]
      val bmp = rememberOwnerBase64Bitmap(url)
      Card(
        colors = CardDefaults.cardColors(containerColor = AsphaltSurface),
        border = BorderStroke(1.dp, SkyCyan.copy(alpha = 0.45f)),
        shape = RoundedCornerShape(14.dp),
      ) {
        Column(modifier = Modifier.padding(12.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
          Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween, verticalAlignment = Alignment.CenterVertically) {
            Column(modifier = Modifier.weight(1f)) {
              Text(bb.title, style = MaterialTheme.typography.titleMedium, color = SkyCyan)
              Text("${bb.adType.uppercase()} · ${bb.location}", style = MaterialTheme.typography.labelSmall, color = MutedSteel)
            }
            IconButton(onClick = { previewSlot = bb.title to url }) {
              Icon(Icons.Rounded.Visibility, contentDescription = "Preview Poster", tint = WarmAmber)
            }
            IconButton(onClick = {
              cb.onUpdateDraft { cur -> cur.copy(customBillboards = cur.customBillboards.filterNot { it.id == bb.id }) }
            }) {
              Icon(Icons.Rounded.Delete, contentDescription = "Delete Ad Slot", tint = CrimsonSiren)
            }
          }
          if (bmp != null) {
            Box(
              modifier = Modifier.fillMaxWidth().height(100.dp).clip(RoundedCornerShape(8.dp)).background(Color.Black),
              contentAlignment = Alignment.Center,
            ) {
              Image(bitmap = bmp, contentDescription = bb.title, modifier = Modifier.fillMaxSize(), contentScale = ContentScale.Fit)
            }
          }
          Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
            Button(onClick = { cb.onPickPhoto("billboard", bb.id) }, modifier = Modifier.weight(1f)) {
              Icon(Icons.Rounded.PhotoLibrary, contentDescription = null, modifier = Modifier.size(16.dp))
              Spacer(Modifier.width(6.dp))
              Text(if (bmp != null) "Replace Poster" else "Upload Poster Image")
            }
            if (bmp != null) OutlinedButton(onClick = { cb.onClearPhoto("billboard", bb.id) }) { Text("Reset") }
          }
        }
      }
    }

    items(CityCatalog.billboards, key = { "oad_b_${it.id}" }) { slot ->
      val url = state.customBillboardDataUrls[slot.id]
      val bmp = rememberOwnerBase64Bitmap(url)
      val enabled = !disabledAds.contains(slot.id)
      Card(
        colors = CardDefaults.cardColors(containerColor = AsphaltSurface),
        border = BorderStroke(1.dp, HairlineBorder),
        shape = RoundedCornerShape(14.dp),
      ) {
        Column(modifier = Modifier.padding(12.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
          Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween, verticalAlignment = Alignment.CenterVertically) {
            Column(modifier = Modifier.weight(1f)) {
              Text(slot.title, style = MaterialTheme.typography.titleMedium)
              Text(slot.location, style = MaterialTheme.typography.labelSmall, color = MutedSteel)
            }
            IconButton(onClick = { previewSlot = slot.title to url }) {
              Icon(Icons.Rounded.Visibility, contentDescription = "Preview", tint = WarmAmber)
            }
            Switch(
              checked = enabled,
              onCheckedChange = { nextEn ->
                cb.onUpdateDraft { cur ->
                  val next = cur.disabledBillboardIds.toMutableSet()
                  if (nextEn) next.remove(slot.id) else next.add(slot.id)
                  cur.copy(disabledBillboardIds = next.toList())
                }
              },
            )
          }
          Box(
            modifier = Modifier.fillMaxWidth().height(92.dp).clip(RoundedCornerShape(8.dp)).background(Color.Black),
            contentAlignment = Alignment.Center,
          ) {
            when {
              bmp != null -> Image(bitmap = bmp, contentDescription = slot.title, modifier = Modifier.fillMaxSize(), contentScale = ContentScale.Fit)
              slot.defaultDrawableRes != null -> Image(painter = painterResource(id = slot.defaultDrawableRes), contentDescription = slot.title, modifier = Modifier.fillMaxSize(), contentScale = ContentScale.Fit)
              else -> Text("NO CUSTOM AD YET", style = MaterialTheme.typography.labelSmall, color = MutedSteel)
            }
          }
          Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
            Button(onClick = { cb.onPickPhoto("billboard", slot.id) }, modifier = Modifier.weight(1f)) {
              Text(if (bmp != null) "Replace Poster" else "Upload Ad Poster")
            }
            if (bmp != null) OutlinedButton(onClick = { cb.onClearPhoto("billboard", slot.id) }) { Text("Clear") }
          }
        }
      }
    }
  }
}
