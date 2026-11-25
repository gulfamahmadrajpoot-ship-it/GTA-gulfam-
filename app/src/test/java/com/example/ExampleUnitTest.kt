package com.example

import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertTrue
import org.junit.Test

class ExampleUnitTest {
  @Test
  fun addition_isCorrect() {
    assertEquals(4, 2 + 2)
  }

  @Test
  fun gameSnapshot_parsesPhase03DualMapMissionsAndOwnerConfig() {
    val json =
      """
      {
        "cash": 4200,
        "xp": 360,
        "outfit": "biker",
        "skinHex": "#c68642",
        "hairHex": "#451a03",
        "ownedVehicles": ["coupe", "superbike", "boat", "heli", "bus"],
        "ownedWeapons": ["fists", "pistol", "rifle"],
        "ammo": {"pistol": 42, "smg": 0, "rifle": 60},
        "activeWeapon": "rifle",
        "upgrades": {"turbo": 2, "handling": 1},
        "weather": "rain",
        "selectedCityId": "lahore",
        "completedMissions": ["story_1", "story_2", "free_race_1"],
        "unlockedMissions": ["story_1", "story_2", "story_3"],
        "customMissions": [
          {
            "id": "custom_101",
            "title": "Canal Bank Express",
            "description": "Deliver courier package along Canal Bank Rd",
            "objective": "Reach Gulberg",
            "startX": 880,
            "startZ": 1540,
            "tx": 2300,
            "tz": 1500,
            "time": 90,
            "reward": 1800,
            "xp": 360,
            "difficulty": "Hard",
            "mode": "goto"
          }
        ],
        "favorites": [
          {"id": "fav_1", "name": "Liberty Market", "x": 2300, "z": 750, "lat": 31.51, "lng": 74.34, "cityId": "lahore"}
        ],
        "vehicleHp": 84,
        "vehicleKind": "heli",
        "settings": {
          "joystickPos": "high",
          "buttonPos": "low",
          "buttonSize": 1.15,
          "cameraSens": 1.4,
          "drivingSens": 1.2,
          "graphicsQuality": "high",
          "soundVol": 0.7,
          "musicVol": 0.3,
          "language": "es",
          "layout": "swap",
          "autoSave": false
        },
        "ownerConfig": {
          "disabledCityIds": ["tokyo"],
          "rewardMultiplier": 1.5,
          "ownerUnlocked": false
        }
      }
      """.trimIndent()
    val snap = GameSnapshot.fromJson(json)
    assertEquals(4200, snap.cash)
    assertEquals("biker", snap.outfit)
    assertEquals(2, snap.turboLevel)
    assertEquals("rain", snap.weather)
    assertEquals("lahore", snap.selectedCityId)
    assertTrue(snap.inVehicle)
    assertTrue(snap.ownedVehicles.contains("heli"))
    assertEquals("rifle", snap.activeWeapon)
    assertEquals(3, snap.completedMissions.size)
    assertTrue(snap.unlockedMissions.contains("story_3"))
    assertEquals(1, snap.customMissions.size)
    assertEquals("Canal Bank Express", snap.customMissions.first().title)
    assertEquals(1, snap.favorites.size)
    assertEquals("Liberty Market", snap.favorites.first().name)
    assertEquals(1.5f, snap.ownerConfig.rewardMultiplier)
    assertEquals(listOf("tokyo"), snap.ownerConfig.disabledCityIds)
    assertEquals("high", snap.settings.graphicsQuality)
    assertEquals("es", snap.settings.language)
  }

  @Test
  fun cityCatalog_containsDualMissionsAndRealWorldCities() {
    // Mode A: 20 sequential connected story missions
    assertEquals(20, CityCatalog.storyMissions.size)
    assertEquals(null, CityCatalog.storyMissions.first().unlockReqId)
    for (i in 1 until CityCatalog.storyMissions.size) {
      assertEquals(CityCatalog.storyMissions[i - 1].id, CityCatalog.storyMissions[i].unlockReqId)
    }

    // Mode B: 18 open-access free missions across all 9 categories
    assertEquals(18, CityCatalog.freeMissions.size)
    val freeCats = CityCatalog.freeMissions.map { it.category }.toSet()
    assertEquals(9, freeCats.size)

    // Real-World Cities: Lahore, Karachi, Islamabad playable in 3D + nav-only cities clearly marked
    val byId = CityCatalog.cities.associateBy { it.id }
    assertTrue(byId["original"]?.playable3d == true)
    assertTrue(byId["lahore"]?.playable3d == true)
    assertTrue(byId["karachi"]?.playable3d == true)
    assertTrue(byId["islamabad"]?.playable3d == true)
    assertFalse(byId["london"]?.playable3d == true)
    assertFalse(byId["tokyo"]?.playable3d == true)
  }

  @Test
  fun passcodeSecurity_usesSaltedSha256Verification() {
    val salt = PasscodeSecurity.generateSaltBase64()
    val hash = PasscodeSecurity.hashPasscode("my-owner-pin-94", salt)
    assertTrue(PasscodeSecurity.verify("my-owner-pin-94", salt, hash))
    assertFalse(PasscodeSecurity.verify("wrong-pin", salt, hash))
    assertFalse(PasscodeSecurity.verify("", salt, hash))
  }

  @Test
  fun mobileControls_parsesCharactersRewardsActiveMissionAndCustomControls() {
    val json =
      """
      {
        "cash": 5800,
        "xp": 1250,
        "health": 88,
        "stamina": 74,
        "characterId": "zara",
        "outfit": "racer",
        "activeMission": {
          "id": "story_5",
          "title": "05 · Street Syndicate Trial",
          "objective": "Complete 3 Street Race Checkpoints",
          "remaining": 64
        },
        "pendingRewards": [
          {"id": "story_4", "title": "04 · First Vehicle Delivery", "reward": 900, "xp": 170}
        ],
        "settings": {
          "joystickSens": 1.6,
          "fullscreen": false,
          "customControls": {
            "joystick": {"dx": 24.0, "dy": -18.0, "scale": 1.15},
            "actions": {"dx": -12.0, "dy": -10.0, "scale": 1.10}
          }
        }
      }
      """.trimIndent()
    val snap = GameSnapshot.fromJson(json)
    assertEquals("zara", snap.characterId)
    assertEquals(88, snap.health)
    assertEquals(74, snap.stamina)
    assertEquals("story_5", snap.activeMission?.id)
    assertEquals(64, snap.activeMission?.remaining)
    assertEquals(1, snap.pendingRewards.size)
    assertEquals(900, snap.pendingRewards.first().reward)
    assertEquals(1.6f, snap.settings.joystickSens)
    assertFalse(snap.settings.fullscreen)
    assertEquals(24.0f, snap.settings.customControls["joystick"]?.dx)
    assertEquals(1.15f, snap.settings.customControls["joystick"]?.scale)

    assertEquals(5, CityCatalog.characters.size)
    assertEquals("Character", StudioTab.WARDROBE.label)
    assertEquals("Inventory", StudioTab.INVENTORY.label)
  }

  @Test
  fun ownerConfigDto_roundtripAndNormalizationWorks() {
    val cfg =
      OwnerConfigDto(
        version = 4,
        disabledCityIds = listOf("tokyo", "london"),
        customCities = listOf(CustomCityDto(id = "dubai", name = "Dubai Marina", lat = 25.08, lng = 55.14)),
        locationRenames = mapOf("Downtown" to "Central Hub"),
        customDestinationPins = listOf(CustomDestinationPinDto(id = "pin_1", name = "VIP Club", x = 1200f, z = 900f)),
        disabledMissionIds = listOf("free_race_1"),
        missionOverrides = mapOf("story_1" to MissionOverrideDto(title = "Opening Run", reward = 1500)),
        police = PoliceControlDto(enabled = true, maxVehicles = 12, difficulty = 1.6f, maxWanted = 4),
        vehicleOverrides = mapOf("coupe" to VehicleOverrideDto(price = 2100, maxSpeed = 520)),
        customVehicles = listOf(CustomVehicleDto(kind = "drift_gt", name = "Drift GT", price = 4500)),
        characterOverrides = mapOf("alex" to CharacterOverrideDto(maxHealth = 120, speedMult = 1.15f)),
        customCharacters = listOf(CustomCharacterDto(id = "hero_2", name = "Ayaan", role = "Stunt Driver")),
        customBillboards = listOf(CustomBillboardDto(id = "bb_custom_1", title = "City Mall Ad")),
        economy = EconomyConfigDto(rewardMultiplier = 2.0f, startingCash = 5000, repairCost = 75, ammoCost = 90),
        worldSettings = WorldSettingsAdminDto(defaultTimeMode = "night", globalDifficulty = "hard", trafficDensity = 1.3f),
        ownerUnlocked = true,
      )
    val json = cfg.toJson()
    val parsed = OwnerConfigDto.fromJson(json)
    requireNotNull(parsed)
    assertEquals(4, parsed.version)
    assertFalse(parsed.ownerUnlocked) // fromJson normalizes ownerUnlocked to false for safety
    assertEquals(2.0f, parsed.rewardMultiplier)
    assertEquals(5000, parsed.economy.startingCash)
    assertEquals("Dubai Marina", parsed.customCities.first().name)
    assertEquals("Drift GT", parsed.customVehicles.first().name)
    assertEquals("Ayaan", parsed.customCharacters.first().name)
    assertEquals(12, parsed.police.maxVehicles)
    assertEquals("night", parsed.worldSettings.defaultTimeMode)
  }

  @Test
  fun imageUploadValidator_enforcesMimeAndSizeLimits() {
    assertTrue(ImageUploadValidator.isAllowedMime("image/png"))
    assertTrue(ImageUploadValidator.isAllowedMime("image/jpeg"))
    assertTrue(ImageUploadValidator.isAllowedMime("image/webp"))
    assertFalse(ImageUploadValidator.isAllowedMime("image/gif"))
    assertFalse(ImageUploadValidator.isAllowedMime("application/pdf"))

    assertTrue(ImageUploadValidator.isAllowedSize(1024L * 1024L))
    assertTrue(ImageUploadValidator.isAllowedSize(ImageUploadValidator.MAX_IMAGE_BYTES))
    assertFalse(ImageUploadValidator.isAllowedSize(ImageUploadValidator.MAX_IMAGE_BYTES + 1L))
  }

  @Test
  fun ownerAuthUser_validatesBootstrappedAdminEmail() {
    val admin = OwnerAuthUser(uid = "u1", email = "GulfamAhmadRajpoot@gmail.com", emailVerified = true, isAdmin = true)
    val unverified = OwnerAuthUser(uid = "u2", email = "gulfamahmadrajpoot@gmail.com", emailVerified = false, isAdmin = false)
    val player = OwnerAuthUser(uid = "u3", email = "player@gmail.com", emailVerified = true, isAdmin = false)
    assertTrue(admin.isSignedIn)
    assertTrue(admin.isBootstrappedEmail)
    assertFalse(unverified.isBootstrappedEmail)
    assertFalse(player.isBootstrappedEmail)
  }
}
