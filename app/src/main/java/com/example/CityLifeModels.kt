package com.example

import androidx.compose.ui.graphics.Color
import com.squareup.moshi.JsonClass
import com.squareup.moshi.Moshi
import com.squareup.moshi.kotlin.reflect.KotlinJsonAdapterFactory

enum class StudioTab(val label: String) {
  WARDROBE("Character"),
  INVENTORY("Inventory"),
  BILLBOARDS("Billboards"),
  GARAGE("Garage"),
  COMBAT("Arsenal"),
  MISSIONS("Missions"),
  MAPS("Cities & Map"),
  WORLD("World"),
  SETTINGS("Settings"),
  OWNER("Owner"),
}

data class CharacterProfileOption(
  val id: String,
  val name: String,
  val role: String,
  val defaultOutfit: String,
  val skinHex: String,
  val hairHex: String,
  val speedStat: Int,
  val staminaStat: Int,
  val combatStat: Int,
  val drivingStat: Int,
  val accentColor: Color,
)

data class OutfitOption(
  val id: String,
  val name: String,
  val subtitle: String,
  val swatch: Color,
)

data class BillboardSlot(
  val id: String,
  val title: String,
  val location: String,
  val defaultDrawableRes: Int?,
)

data class GarageVehicleOption(
  val kind: String,
  val name: String,
  val category: String,
  val speedRating: String,
  val price: Int,
)

data class WeaponOption(
  val id: String,
  val name: String,
  val stats: String,
  val isMelee: Boolean,
  val price: Int,
)

data class PaintSwatch(
  val name: String,
  val hex: String,
  val color: Color,
)

data class CityProfileOption(
  val id: String,
  val name: String,
  val country: String,
  val mode: String, // "original" | "real"
  val playable3d: Boolean,
  val summary: String,
)

data class LocationPreset(
  val id: String,
  val name: String,
  val x: Float,
  val z: Float,
)

data class MissionOption(
  val id: String,
  val track: String, // "story" | "free"
  val order: Int,
  val unlockReqId: String?,
  val category: String,
  val title: String,
  val description: String,
  val speaker: String?,
  val dialogueLine: String?,
  val objective: String,
  val reward: Int,
  val xp: Int,
  val durationSec: Int,
)

enum class OwnerDashboardSection(val label: String) {
  OVERVIEW("Overview"),
  MAPS("Maps & Cities"),
  MISSIONS("Missions"),
  POLICE("Police"),
  VEHICLES("Vehicles"),
  CHARACTERS("Characters"),
  ADVERTISEMENTS("Ads & Posters"),
  PLAYERS("Players"),
  SETTINGS("Game Settings"),
  SAVE_PUBLISH("Save & Publish"),
}

@JsonClass(generateAdapter = true)
data class CustomMissionDto(
  val id: String = "",
  val title: String = "Custom Mission",
  val description: String = "",
  val objective: String = "Reach Destination",
  val startX: Float? = null,
  val startZ: Float? = null,
  val tx: Float = 2300f,
  val tz: Float = 1500f,
  val time: Int = 90,
  val reward: Int = 1000,
  val xp: Int = 200,
  val difficulty: String = "Normal",
  val mode: String = "goto",
  val category: String = "Custom",
  val track: String = "custom",
) {
  fun toJson(): String = GameSnapshot.customMissionAdapter.toJson(this)
}

@JsonClass(generateAdapter = true)
data class CustomCityDto(
  val id: String = "",
  val name: String = "Custom City",
  val country: String = "Custom World",
  val mode: String = "real",
  val playable3d: Boolean = true,
  val lat: Double = 31.5204,
  val lng: Double = 74.3587,
  val waterColorHex: String = "#0e5a78",
  val facadeStyle: String = "glass",
  val summary: String = "Owner-created 3D playable city.",
)

@JsonClass(generateAdapter = true)
data class CustomDestinationPinDto(
  val id: String = "",
  val name: String = "GPS Waypoint",
  val x: Float = 2300f,
  val z: Float = 1500f,
  val lat: Double? = null,
  val lng: Double? = null,
  val cityId: String = "original",
)

@JsonClass(generateAdapter = true)
data class PoliceControlDto(
  val enabled: Boolean = true,
  val maxVehicles: Int = 8,
  val difficulty: Float = 1.0f,
  val minWanted: Int = 0,
  val maxWanted: Int = 5,
  val helisEnabled: Boolean = true,
  val roadblocksEnabled: Boolean = true,
  val responseSpeed: Float = 1.0f,
)

@JsonClass(generateAdapter = true)
data class VehicleOverrideDto(
  val disabled: Boolean = false,
  val name: String = "",
  val price: Int = -1,
  val maxSpeed: Int = -1,
  val turn: Float = -1f,
)

@JsonClass(generateAdapter = true)
data class CustomVehicleDto(
  val kind: String = "",
  val name: String = "Custom Supercar",
  val category: String = "Sports Car",
  val kindType: String = "car",
  val maxSpeed: Int = 560,
  val turn: Float = 3.2f,
  val price: Int = 3500,
  val defaultColor: String = "#f59e0b",
  val disabled: Boolean = false,
)

@JsonClass(generateAdapter = true)
data class CharacterOverrideDto(
  val disabled: Boolean = false,
  val name: String = "",
  val role: String = "",
  val defaultOutfit: String = "",
  val maxHealth: Int = 100,
  val speedMult: Float = 1.0f,
)

@JsonClass(generateAdapter = true)
data class CustomCharacterDto(
  val id: String = "",
  val name: String = "New Hero",
  val role: String = "Street Legend",
  val defaultOutfit: String = "streetwear",
  val skinHex: String = "#d8a482",
  val hairHex: String = "#1e1b18",
  val maxHealth: Int = 100,
  val speedMult: Float = 1.0f,
  val disabled: Boolean = false,
)

@JsonClass(generateAdapter = true)
data class CustomBillboardDto(
  val id: String = "",
  val title: String = "Custom Billboard",
  val location: String = "Downtown Plaza",
  val adType: String = "billboard", // "billboard" | "shop" | "wall"
  val x: Float = 1860f,
  val z: Float = 1180f,
  val rotY: Float = 0f,
)

@JsonClass(generateAdapter = true)
data class MissionOverrideDto(
  val title: String = "",
  val description: String = "",
  val objective: String = "",
  val reward: Int = -1,
  val xp: Int = -1,
  val time: Int = -1,
  val difficulty: String = "",
  val tx: Float? = null,
  val tz: Float? = null,
)

@JsonClass(generateAdapter = true)
data class EconomyConfigDto(
  val rewardMultiplier: Float = 1.0f,
  val startingCash: Int = 3200,
  val repairCost: Int = 100,
  val ammoCost: Int = 120,
)

@JsonClass(generateAdapter = true)
data class WorldSettingsAdminDto(
  val defaultTimeMode: String = "cycle",
  val defaultWeather: String = "clear",
  val trafficDensity: Float = 1.0f,
  val pedestrianDensity: Float = 1.0f,
  val globalDifficulty: String = "normal",
  val enabledModes: List<String> = listOf("story", "free", "freeroam"),
  val defaultGraphicsQuality: String = "balanced",
  val defaultSoundVol: Float = 0.85f,
  val defaultMusicVol: Float = 0.45f,
)

@JsonClass(generateAdapter = true)
data class OwnerConfigDto(
  val version: Int = 1,
  val disabledCityIds: List<String> = emptyList(),
  val customCities: List<CustomCityDto> = emptyList(),
  val locationRenames: Map<String, String> = emptyMap(),
  val customDestinationPins: List<CustomDestinationPinDto> = emptyList(),
  val disabledMissionIds: List<String> = emptyList(),
  val missionOverrides: Map<String, MissionOverrideDto> = emptyMap(),
  val police: PoliceControlDto = PoliceControlDto(),
  val vehicleOverrides: Map<String, VehicleOverrideDto> = emptyMap(),
  val customVehicles: List<CustomVehicleDto> = emptyList(),
  val characterOverrides: Map<String, CharacterOverrideDto> = emptyMap(),
  val customCharacters: List<CustomCharacterDto> = emptyList(),
  val customBillboards: List<CustomBillboardDto> = emptyList(),
  val disabledBillboardIds: List<String> = emptyList(),
  val economy: EconomyConfigDto = EconomyConfigDto(),
  val worldSettings: WorldSettingsAdminDto = WorldSettingsAdminDto(),
  val rewardMultiplier: Float = 1.0f,
  val ownerUnlocked: Boolean = false,
) {
  fun normalized(unlocked: Boolean = ownerUnlocked): OwnerConfigDto {
    val effMult = if (economy.rewardMultiplier != 1.0f) economy.rewardMultiplier else rewardMultiplier
    return copy(
      rewardMultiplier = effMult,
      economy = economy.copy(rewardMultiplier = effMult),
      ownerUnlocked = unlocked,
    )
  }

  fun toJson(): String = GameSnapshot.ownerConfigAdapter.toJson(this)

  companion object {
    fun fromJson(json: String?): OwnerConfigDto? {
      if (json.isNullOrBlank()) return null
      return try {
        GameSnapshot.ownerConfigAdapter.fromJson(json)?.normalized(false)
      } catch (_: Exception) {
        null
      }
    }
  }
}

@JsonClass(generateAdapter = true)
data class OwnerConfigSnapshotDto(
  val id: String = "",
  val label: String = "",
  val savedAtMs: Long = 0L,
  val version: Int = 1,
  val configJson: String = "",
)

data class OwnerAuthUser(
  val uid: String = "",
  val email: String = "",
  val displayName: String = "",
  val emailVerified: Boolean = false,
  val isAdmin: Boolean = false,
) {
  val isSignedIn: Boolean get() = uid.isNotBlank()
  val isBootstrappedEmail: Boolean
    get() = emailVerified && email.equals("gulfamahmadrajpoot@gmail.com", ignoreCase = true)
}

data class PlayerAccountRecord(
  @com.google.firebase.firestore.DocumentId val id: String = "",
  val userId: String = "",
  val displayName: String = "Player",
  val cash: Long = 3200L,
  val xp: Long = 0L,
  val level: Long = 1L,
  val selectedCityId: String = "original",
  val completedMissionsCount: Long = 0L,
  val banned: Boolean = false,
  val resetRequested: Boolean = false,
  val createdAt: com.google.firebase.Timestamp? = null,
  val updatedAt: com.google.firebase.Timestamp? = null,
)

data class CloudBackupRecord(
  @com.google.firebase.firestore.DocumentId val id: String = "",
  val label: String = "",
  val configJson: String = "",
  val version: Long = 1L,
  val createdBy: String = "",
  val createdAt: com.google.firebase.Timestamp? = null,
)

data class OwnerMetaRecord(
  val ownerUid: String = "",
  val claimed: Boolean = false,
  val salt: String = "",
  val passHash: String = "",
  val updatedBy: String = "",
  val updatedAt: com.google.firebase.Timestamp? = null,
)

data class CloudGameConfigDoc(
  val configJson: String = "",
  val version: Long = 1L,
  val updatedBy: String = "",
  val updatedAt: com.google.firebase.Timestamp? = null,
  val publishedAt: com.google.firebase.Timestamp? = null,
)

@JsonClass(generateAdapter = true)
data class FavoriteLocationDto(
  val id: String = "",
  val name: String = "",
  val x: Float? = null,
  val z: Float? = null,
  val lat: Double? = null,
  val lng: Double? = null,
  val cityId: String = "original",
)

@JsonClass(generateAdapter = true)
data class RawUpgradesDto(
  val turbo: Int = 0,
  val handling: Int = 0,
)

@JsonClass(generateAdapter = true)
data class CustomControlTransformDto(
  val dx: Float = 0f,
  val dy: Float = 0f,
  val scale: Float = 1.0f,
)

@JsonClass(generateAdapter = true)
data class ClaimableRewardDto(
  val id: String = "",
  val title: String = "",
  val reward: Int = 0,
  val xp: Int = 0,
)

@JsonClass(generateAdapter = true)
data class ActiveMissionProgressDto(
  val id: String = "",
  val title: String = "",
  val objective: String = "",
  val remaining: Int = -1,
)

@JsonClass(generateAdapter = true)
data class GameSettings(
  val joystickPos: String = "mid",
  val buttonPos: String = "mid",
  val buttonSize: Float = 1.0f,
  val cameraSens: Float = 1.0f,
  val joystickSens: Float = 1.0f,
  val drivingSens: Float = 1.0f,
  val graphicsQuality: String = "balanced",
  val soundVol: Float = 0.85f,
  val musicVol: Float = 0.45f,
  val language: String = "en",
  val layout: String = "standard",
  val autoSave: Boolean = true,
  val fullscreen: Boolean = true,
  val customControls: Map<String, CustomControlTransformDto> = emptyMap(),
) {
  fun toJson(): String = GameSnapshot.settingsAdapter.toJson(this)
}

@JsonClass(generateAdapter = true)
data class RawSnapshotDto(
  val cash: Int = 3200,
  val xp: Int = 0,
  val health: Int = 100,
  val stamina: Int = 100,
  val characterId: String = "alex",
  val outfit: String = "streetwear",
  val skinHex: String = "#d8a482",
  val hairHex: String = "#1e1b18",
  val ownedVehicles: List<String>? = null,
  val ownedWeapons: List<String>? = null,
  val ammo: Map<String, Int>? = null,
  val activeWeapon: String = "fists",
  val upgrades: RawUpgradesDto? = null,
  val weather: String = "clear",
  val selectedCityId: String? = null,
  val activeMission: ActiveMissionProgressDto? = null,
  val completedMissions: List<String>? = null,
  val unlockedMissions: List<String>? = null,
  val pendingRewards: List<ClaimableRewardDto>? = null,
  val customMissions: List<CustomMissionDto>? = null,
  val favorites: List<FavoriteLocationDto>? = null,
  val vehicleHp: Int = 100,
  val vehicleKind: String? = null,
  val settings: GameSettings? = null,
  val ownerConfig: OwnerConfigDto? = null,
)

data class GameSnapshot(
  val cash: Int = 3200,
  val xp: Int = 0,
  val health: Int = 100,
  val stamina: Int = 100,
  val characterId: String = "alex",
  val outfit: String = "streetwear",
  val skinHex: String = "#d8a482",
  val hairHex: String = "#1e1b18",
  val ownedVehicles: Set<String> = setOf("coupe", "superbike", "boat", "heli"),
  val ownedWeapons: Set<String> = setOf("fists", "pistol"),
  val ammo: Map<String, Int> = mapOf("pistol" to 36, "smg" to 0, "rifle" to 0),
  val activeWeapon: String = "fists",
  val turboLevel: Int = 0,
  val handlingLevel: Int = 0,
  val weather: String = "clear",
  val selectedCityId: String = "original",
  val activeMission: ActiveMissionProgressDto? = null,
  val completedMissions: Set<String> = emptySet(),
  val unlockedMissions: Set<String> = setOf("story_1"),
  val pendingRewards: List<ClaimableRewardDto> = emptyList(),
  val customMissions: List<CustomMissionDto> = emptyList(),
  val favorites: List<FavoriteLocationDto> = emptyList(),
  val vehicleHp: Int = 100,
  val inVehicle: Boolean = false,
  val settings: GameSettings = GameSettings(),
  val ownerConfig: OwnerConfigDto = OwnerConfigDto(),
) {
  companion object {
    internal val moshi: Moshi = Moshi.Builder().addLast(KotlinJsonAdapterFactory()).build()
    private val adapter = moshi.adapter(RawSnapshotDto::class.java)
    internal val settingsAdapter = moshi.adapter(GameSettings::class.java)
    internal val customMissionAdapter = moshi.adapter(CustomMissionDto::class.java)
    internal val ownerConfigAdapter = moshi.adapter(OwnerConfigDto::class.java)
    private val snapshotListType =
      com.squareup.moshi.Types.newParameterizedType(List::class.java, OwnerConfigSnapshotDto::class.java)
    internal val snapshotListAdapter = moshi.adapter<List<OwnerConfigSnapshotDto>>(snapshotListType)

    fun fromJson(json: String?): GameSnapshot {
      if (json.isNullOrBlank()) return GameSnapshot()
      return try {
        val dto = adapter.fromJson(json) ?: return GameSnapshot()
        val ownedV = dto.ownedVehicles?.filter { it.isNotBlank() }?.toSet()
        val ownedW = dto.ownedWeapons?.filter { it.isNotBlank() }?.toSet()
        val doneMissions = dto.completedMissions?.filter { it.isNotBlank() }?.toSet() ?: emptySet()
        val unlocked = dto.unlockedMissions?.filter { it.isNotBlank() }?.toSet()
        GameSnapshot(
          cash = dto.cash,
          xp = dto.xp,
          health = dto.health.coerceIn(0, 100),
          stamina = dto.stamina.coerceIn(0, 100),
          characterId = dto.characterId.takeIf { it.isNotBlank() } ?: "alex",
          outfit = dto.outfit,
          skinHex = dto.skinHex,
          hairHex = dto.hairHex,
          ownedVehicles = if (ownedV.isNullOrEmpty()) setOf("coupe", "superbike", "boat", "heli") else ownedV,
          ownedWeapons = if (ownedW.isNullOrEmpty()) setOf("fists", "pistol") else ownedW,
          ammo = dto.ammo ?: mapOf("pistol" to 36, "smg" to 0, "rifle" to 0),
          activeWeapon = dto.activeWeapon,
          turboLevel = dto.upgrades?.turbo ?: 0,
          handlingLevel = dto.upgrades?.handling ?: 0,
          weather = dto.weather,
          selectedCityId = dto.selectedCityId?.takeIf { it.isNotBlank() } ?: "original",
          activeMission = dto.activeMission,
          completedMissions = doneMissions,
          unlockedMissions = if (unlocked.isNullOrEmpty()) setOf("story_1") else unlocked,
          pendingRewards = dto.pendingRewards ?: emptyList(),
          customMissions = dto.customMissions ?: emptyList(),
          favorites = dto.favorites ?: emptyList(),
          vehicleHp = dto.vehicleHp,
          inVehicle = !dto.vehicleKind.isNullOrBlank() && dto.vehicleKind != "null",
          settings = dto.settings ?: GameSettings(),
          ownerConfig = (dto.ownerConfig ?: OwnerConfigDto()).normalized(),
        )
      } catch (_: Exception) {
        GameSnapshot()
      }
    }
  }
}

object CityCatalog {
  val cities =
    listOf(
      CityProfileOption(
        id = "original",
        name = "Metro City (Original)",
        country = "Original Game City",
        mode = "original",
        playable3d = true,
        summary = "Downtown, Residential, Markets, Industrial, Airport, Beaches, Parks, Bridges, Police & Hospitals.",
      ),
      CityProfileOption(
        id = "lahore",
        name = "Lahore, Pakistan",
        country = "Pakistan",
        mode = "real",
        playable3d = true,
        summary = "Playable 3D City mapped from OSM corridors: Mall Road, Canal Bank Rd, Gulberg Main Blvd, Anarkali & Airport.",
      ),
      CityProfileOption(
        id = "karachi",
        name = "Karachi, Pakistan",
        country = "Pakistan",
        mode = "real",
        playable3d = true,
        summary = "Playable 3D City mapped from OSM corridors: Shahrah-e-Faisal, Saddar, Clifton Sea View, Marina & Jinnah Airport.",
      ),
      CityProfileOption(
        id = "islamabad",
        name = "Islamabad, Pakistan",
        country = "Pakistan",
        mode = "real",
        playable3d = true,
        summary = "Playable 3D City mapped from OSM sectors: Blue Area, Jinnah Ave, F-9 Park, Centaurus Mall & Rawal Lake.",
      ),
      CityProfileOption(
        id = "dubai",
        name = "Dubai, UAE",
        country = "UAE",
        mode = "real",
        playable3d = true,
        summary = "Playable 3D City mapped from OSM roads: Sheikh Zayed Road, Jumeirah Beach, Downtown Mall & DXB Airport.",
      ),
      CityProfileOption(
        id = "london",
        name = "London, UK",
        country = "United Kingdom",
        mode = "real",
        playable3d = false,
        summary = "OpenStreetMap Navigation Map & Routing. Playable 3D city environment is currently unavailable.",
      ),
      CityProfileOption(
        id = "tokyo",
        name = "Tokyo, Japan",
        country = "Japan",
        mode = "real",
        playable3d = false,
        summary = "OpenStreetMap Navigation Map & Routing. Playable 3D city environment is currently unavailable.",
      ),
    )

  val locationPresets =
    listOf(
      LocationPreset("auto", "Keep Current Player Spot", -1f, -1f),
      LocationPreset("garage", "Auto Garage / Hub", 880f, 1540f),
      LocationPreset("market", "Commercial Market", 1520f, 1960f),
      LocationPreset("park", "Central City Park", 2300f, 1500f),
      LocationPreset("downtown", "Downtown / Financial Core", 2300f, 750f),
      LocationPreset("hospital", "Main City Hospital", 2280f, 2320f),
      LocationPreset("police", "Central Police HQ", 1460f, 3080f),
      LocationPreset("marina", "Coastal Beach & Marina", 4480f, 1900f),
      LocationPreset("airport", "International Airport", 4360f, 4140f),
    )

  val characters =
    listOf(
      CharacterProfileOption("alex", "Alex Mercer", "Street Hustler", "streetwear", "#d8a482", "#1e1b18", 82, 85, 78, 84, Color(0xFFF59E0B)),
      CharacterProfileOption("zara", "Zara Vance", "Pro Street Racer", "racer", "#f1c27d", "#451a03", 88, 90, 72, 96, Color(0xFFEF4444)),
      CharacterProfileOption("tariq", "Tariq Khan", "Tactical Operative", "tactical", "#c68642", "#1e1b18", 84, 88, 94, 82, Color(0xFF10B981)),
      CharacterProfileOption("elena", "Elena Cruz", "Executive Broker", "suit", "#d8a482", "#78350f", 78, 80, 76, 88, Color(0xFF38BDF8)),
      CharacterProfileOption("marcus", "Marcus Cole", "Heavy Enforcer", "biker", "#8d5524", "#1e1b18", 76, 86, 96, 80, Color(0xFFA855F7)),
    )

  val outfits =
    listOf(
      OutfitOption("streetwear", "Urban Streetwear", "Layered slate hoodie & amber trim", Color(0xFF334155)),
      OutfitOption("suit", "Executive Tailored", "Charcoal bespoke suit & crisp collar", Color(0xFF111827)),
      OutfitOption("biker", "Leather Biker", "Heavy charcoal leather & crimson stripe", Color(0xFF292524)),
      OutfitOption("tactical", "Metro Tactical", "Olive utility vest & cargo boots", Color(0xFF1E3A2F)),
      OutfitOption("racer", "Night Circuit", "Crimson racing jacket & carbon pants", Color(0xFF991B1B)),
    )

  val skinTones =
    listOf(
      "#f1c27d" to Color(0xFFF1C27D),
      "#d8a482" to Color(0xFFD8A482),
      "#c68642" to Color(0xFFC68642),
      "#8d5524" to Color(0xFF8D5524),
    )

  val hairColors =
    listOf(
      "#1e1b18" to Color(0xFF1E1B18),
      "#451a03" to Color(0xFF451A03),
      "#78350f" to Color(0xFF78350F),
      "#52525b" to Color(0xFF52525B),
    )

  val billboards =
    listOf(
      BillboardSlot("bb_0", "Downtown Espresso Billboard", "Midtown North Ave", R.drawable.img_billboard_espresso),
      BillboardSlot("bb_1", "Midtown Motors Billboard", "Neon Midtown Blvd", R.drawable.img_billboard_motors),
      BillboardSlot("bb_2", "Fashion District Poster", "Central Park West", null),
      BillboardSlot("bb_3", "Beachfront Boardwalk Billboard", "Golden Sands Boulevard", null),
      BillboardSlot("bb_4", "Airport Terminal Wall Poster", "Metro International Terminal", null),
      BillboardSlot("bb_5", "Downtown Shop Wall Poster", "Commercial Plaza", null),
    )

  val vehicles =
    listOf(
      GarageVehicleOption("coupe", "Apex GT Coupe", "Sports Car", "Top Speed · Balanced", 0),
      GarageVehicleOption("muscle", "Thunder V8", "Sports Car", "High Torque · Drift", 2800),
      GarageVehicleOption("sedan", "Metro Sedan", "Sedan", "Smooth · Durable", 1200),
      GarageVehicleOption("taxi", "City Yellow Cab", "Sedan", "Classic Street Cruiser", 1500),
      GarageVehicleOption("suv", "Titan Metro SUV", "SUV", "All-Terrain · Heavy Ram", 2100),
      GarageVehicleOption("superbike", "Veloce 1000cc", "Motorcycle", "Fastest · Agile Lean", 3200),
      GarageVehicleOption("cruiser", "Boulevard Cruiser", "Motorcycle", "Heavy Torque · Classic", 1800),
      GarageVehicleOption("bus", "Metro Transit Bus", "Bus", "Heavy Coach · High Mass", 3500),
      GarageVehicleOption("truck", "Heavy Cargo Truck", "Truck", "Freight Hauler · Armored", 3900),
      GarageVehicleOption("boat", "Harbour Speedboat", "Boat", "Offshore Ocean & Canal", 4200),
      GarageVehicleOption("heli", "Metro Air Chopper", "Helicopter", "Vertical Flight · Citywide", 6500),
    )

  val weapons =
    listOf(
      WeaponOption("fists", "Hand-to-Hand", "Melee · Fast Combo", true, 0),
      WeaponOption("baton", "Shock Baton", "Melee · High Impact", true, 350),
      WeaponOption("pistol", "VX-9 Pulse Pistol", "Semi-Auto · Mid Range", false, 600),
      WeaponOption("smg", "Kestrel-45 SMG", "Rapid Fire · Close Range", false, 1400),
      WeaponOption("rifle", "Vanguard Carbine", "High Damage · Long Range", false, 2400),
    )

  val paints =
    listOf(
      PaintSwatch("Liquid Silver", "#cbd5e1", Color(0xFFCBD5E1)),
      PaintSwatch("Obsidian", "#1e293b", Color(0xFF1E293B)),
      PaintSwatch("Crimson Pearl", "#b91c1c", Color(0xFFB91C1C)),
      PaintSwatch("Midnight Blue", "#1e40af", Color(0xFF1E40AF)),
      PaintSwatch("Emerald", "#065f46", Color(0xFF065F46)),
      PaintSwatch("Champagne Gold", "#d97706", Color(0xFFD97706)),
    )

  val freeMissionCategories =
    listOf(
      "All",
      "Racing",
      "Driving Challenges",
      "Delivery",
      "Police Chase",
      "Rescue",
      "Exploration",
      "Survival",
      "Combat",
      "Time Challenges",
    )

  // Mode A: 20 Sequential Connected Story Missions (matching missions.js)
  val storyMissions =
    listOf(
      MissionOption("story_1", "story", 1, null, "Story Mode", "01 · City Arrival", "Your flight just landed in the city. Head to the main Auto Garage to meet your first contact.", "Tariq (Contact)", "Welcome to the city! Keep your head low and grab the coupe keys at the garage.", "Reach the Auto Garage", 500, 100, 0),
      MissionOption("story_2", "story", 2, "story_1", "Story Mode", "02 · Meet the Broker", "Tariq wants you to meet Elena at the Commercial Market for your first paying contract.", "Elena (Broker)", "Good to see you on time. Let's put your driving skills to work right away.", "Meet Elena at Commercial Market", 650, 130, 110),
      MissionOption("story_3", "story", 3, "story_2", "Story Mode", "03 · Urgent Espresso Run", "A client at Central Park Plaza is waiting for confidential documents hidden in a coffee crate.", "Elena (Broker)", "No spills, no detours—get that crate across Central Park fast.", "Deliver Crate to Central Park", 750, 140, 75),
      MissionOption("story_4", "story", 4, "story_3", "Story Mode", "04 · First Vehicle Delivery", "Move an unmarked sports coupe from the Industrial Block to Financial Core cleanly.", "Tariq (Contact)", "Keep the bodywork clean—the buyer deducts every scratch.", "Deliver Vehicle to Financial Core (>50% HP)", 900, 170, 90),
      MissionOption("story_5", "story", 5, "story_4", "Story Mode", "05 · Street Syndicate Trial", "Local racers control the downtown streets. Prove yourself across 3 midnight checkpoints.", "Raza (Racer)", "Think your coupe can keep pace? Hit all three gates before the clock dies.", "Complete 3 Street Race Checkpoints", 1100, 200, 90),
      MissionOption("story_6", "story", 6, "story_5", "Story Mode", "06 · Precinct Leak", "A rival crew tipped off patrol officers. Grab the ledger outside Police HQ and shake a 2-star chase.", "Elena (Broker)", "Grab the drop near the precinct and vanish down the side streets!", "Reach Precinct & Escape 2-Star Police", 1200, 220, 130),
      MissionOption("story_7", "story", 7, "story_6", "Story Mode", "07 · Dockyard Trouble", "Armed thugs hijacked Tariq's freight near the South Docks. Clear them out!", "Tariq (Contact)", "Grab a weapon at Tactical Shop if you need firepower—watch the crossfire.", "Defeat 4 Dockyard Raiders", 1300, 240, 140),
      MissionOption("story_8", "story", 8, "story_7", "Story Mode", "08 · Medical Evacuation", "A friendly courier was injured during the dock fight. Rush them from the Beach to City Hospital.", "Paramedic Dispatch", "Every second counts—get them to Central Hospital before time expires!", "Pickup at Beach -> Central Hospital", 1350, 250, 105),
      MissionOption("story_9", "story", 9, "story_8", "Story Mode", "09 · Recovered Thunder V8", "Rival guards locked a stolen Thunder V8 in the Midtown lot. Neutralize the guards!", "Tariq (Contact)", "Clear the lot so we can haul that V8 back to our garage.", "Defeat 4 Lot Guards", 1450, 270, 130),
      MissionOption("story_10", "story", 10, "story_9", "Story Mode", "10 · Coastal Boulevard Sprint", "Run the beachfront circuit to draw rival scouts out of hiding.", "Raza (Racer)", "Full throttle down the coastal highway—don't miss a gate!", "Finish 3 Coastal Checkpoints", 1500, 280, 85),
      MissionOption("story_11", "story", 11, "story_10", "Story Mode", "11 · Gang Conflict: Alleyway", "The Red Crescent gang ambushed our contacts behind the Commercial Plaza.", "Elena (Broker)", "Use cover behind buildings and neutralize every shooter!", "Defeat 5 Gang Enforcers", 1650, 300, 150),
      MissionOption("story_12", "story", 12, "story_11", "Story Mode", "12 · Highway Lockdown", "Police roadblocks have sealed the West Expressway. Break out of a 3-star pursuit!", "Tariq (Contact)", "Watch out for roadblocks at intersections—hide out of sight until heat drops!", "Escape 3-Star Police Lockdown", 1800, 320, 150),
      MissionOption("story_13", "story", 13, "story_12", "Story Mode", "13 · Marina Boat Intercept", "Launch a speedboat from the Marina and collect floating intel buoys offshore.", "Elena (Broker)", "Grab a boat at the pier and sweep all three ocean coordinates!", "Hit 3 Offshore Marine Coordinates", 1850, 330, 120),
      MissionOption("story_14", "story", 14, "story_13", "Story Mode", "14 · Bridge Defense", "Armed militants are holding the Grand Canal Bridge. Clear the crossing!", "Tariq (Contact)", "If they blow that bridge, we lose access to the airport!", "Eliminate 5 Bridge Guards", 1950, 350, 140),
      MissionOption("story_15", "story", 15, "story_14", "Story Mode", "15 · Armored Bank Escort", "Move the syndicate vault truck safely from Financial Core to Harbour HQ.", "Elena (Broker)", "Keep vehicle damage minimal all the way to the waterfront!", "Reach Harbour HQ (>50% Vehicle HP)", 2050, 360, 115),
      MissionOption("story_16", "story", 16, "story_15", "Story Mode", "16 · Midtown Last Stand", "Hold Central Park Plaza against relentless gang waves for 50 seconds!", "Tariq (Contact)", "Stay in the plaza, watch your health, and survive until backup arrives!", "Survive 50s at Central Park", 2200, 390, 50),
      MissionOption("story_17", "story", 17, "story_16", "Story Mode", "17 · Repo South Highway", "Recover the cartel's armored SUV on South Ring Highway and bring it to Apex Garage.", "Raza (Racer)", "Grab it on the South Expressway and bring it straight home.", "South Expressway -> Auto Garage", 2350, 410, 125),
      MissionOption("story_18", "story", 18, "story_17", "Story Mode", "18 · Airport Tarmac Assault", "Cross the bridge into International Airport and neutralize the cartel security squad.", "Elena (Broker)", "Their private jet is fueling—clear the tarmac guards now!", "Eliminate 6 Airport Guards", 2600, 450, 175),
      MissionOption("story_19", "story", 19, "story_18", "Story Mode", "19 · Chopper Pursuit Escape", "Citywide 4-star alert! Police helicopters are tracking your heat signature.", "Tariq (Contact)", "Speed through tunnels and highways until the chopper loses your trail!", "Escape 4-Star Chopper Pursuit", 2900, 500, 180),
      MissionOption("story_20", "story", 20, "story_19", "Story Mode", "20 · Final City Challenge", "The ultimate citywide gauntlet: race from the Airport Runway across the Grand Bridge to Financial Core!", "Elena & Tariq", "This is it—claim the crown of the city in one final cross-metropolis run!", "Airport -> Bridge -> Park -> Financial Core", 5000, 900, 135),
    )

  // Mode B: 18 Open-Access Free Missions Across All 9 Categories (matching missions.js)
  val freeMissions =
    listOf(
      MissionOption("free_race_1", "free", 1, null, "Racing", "Midnight Grid GP", "High-speed downtown circuit through commercial blocks.", null, null, "Hit All 3 Race Gates", 950, 180, 80),
      MissionOption("free_race_2", "free", 2, null, "Racing", "Runway Drag Masters", "Full-throttle drag sprint across the airport runway.", null, null, "Clear 3 Runway Gates", 1250, 220, 85),
      MissionOption("free_drive_1", "free", 3, null, "Driving Challenges", "Slalom City Trial", "Thread through 4 tight intersections without running out of time.", null, null, "Clear 4 Slalom Checkpoints", 900, 170, 95),
      MissionOption("free_drive_2", "free", 4, null, "Driving Challenges", "Zero-Scratch Chauffeur", "Arrive at Velvet Bistro with minimal vehicle damage.", null, null, "Arrive with >50% Integrity", 1050, 200, 90),
      MissionOption("free_deliv_1", "free", 5, null, "Delivery", "Superbike Express", "Rush a VIP parcel to the Coastal Marina.", null, null, "Deliver to Boat Marina", 850, 160, 85),
      MissionOption("free_deliv_2", "free", 6, null, "Delivery", "Airport Cargo Haul", "Heavy freight delivery to the Airport Hangar.", null, null, "Reach Airport Hangar", 1200, 210, 110),
      MissionOption("free_chase_1", "free", 7, null, "Police Chase", "Two-Star Breakout", "Trigger a 2-star patrol pursuit and break line of sight.", null, null, "Evade 2-Star Pursuit", 800, 160, 110),
      MissionOption("free_chase_2", "free", 8, null, "Police Chase", "Five-Star Chaos", "Survive a citywide 5-star alert with choppers and roadblocks!", null, null, "Evade 5-Star Lockdown", 2600, 450, 200),
      MissionOption("free_rescue_1", "free", 9, null, "Rescue", "Beach Lifeguard Dash", "Pick up a stranded swimmer on the coast and rush to Medical Center.", null, null, "Beach -> Bayview Medical", 900, 175, 95),
      MissionOption("free_rescue_2", "free", 10, null, "Rescue", "Runway Emergency Evac", "Rescue stranded crew from the runway to Central Hospital.", null, null, "Runway -> Central Hospital", 1250, 230, 125),
      MissionOption("free_explore_1", "free", 11, null, "Exploration", "City Landmarks Tour", "Visit the Commercial Market, Central Park, and Coastal Boardwalk.", null, null, "Tour 3 City Landmarks", 850, 180, 140),
      MissionOption("free_explore_2", "free", 12, null, "Exploration", "Skyline Heli Recon", "Fly or drive to inspect the Financial Rooftop Pad and Airport Terminal.", null, null, "Survey 2 Major Hubs", 1150, 220, 130),
      MissionOption("free_surv_1", "free", 13, null, "Survival", "Docks Arena Holdout", "Survive 45 seconds against armed dock raiders!", null, null, "Survive 45s in Docks", 1300, 250, 45),
      MissionOption("free_surv_2", "free", 14, null, "Survival", "Industrial Siege", "Outlast waves of syndicate fighters for 55 seconds!", null, null, "Survive 55s at Industrial Yard", 1600, 300, 55),
      MissionOption("free_combat_1", "free", 15, null, "Combat", "Market Turf Cleanse", "Clear out 4 armed gangsters shaking down shopkeepers.", null, null, "Defeat 4 Hostiles", 1100, 210, 130),
      MissionOption("free_combat_2", "free", 16, null, "Combat", "Freight Yard Raid", "Take down 6 heavy cartel enforcers at the West Freight Yard.", null, null, "Defeat 6 Cartel Units", 1750, 330, 165),
      MissionOption("free_time_1", "free", 17, null, "Time Challenges", "Cross-Town Blitz", "Sprint from anywhere to Harbour Police HQ under 75 seconds.", null, null, "Reach Harbour HQ in 75s", 950, 185, 75),
      MissionOption("free_time_2", "free", 18, null, "Time Challenges", "Grand Bridge Dash", "Speed across the Grand Canal Bridge to the Airport Hangar in 80 seconds.", null, null, "Airport Hangar in 80s", 1200, 230, 80),
    )

  val missions: List<MissionOption> = storyMissions + freeMissions
}
