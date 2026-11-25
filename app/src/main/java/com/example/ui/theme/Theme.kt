package com.example.ui.theme

import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.runtime.Composable

private val CityLifeColorScheme =
  darkColorScheme(
    primary = WarmAmber,
    onPrimary = MidnightSlate,
    primaryContainer = ElevatedConcrete,
    onPrimaryContainer = AmberHighlight,
    secondary = SkyCyan,
    onSecondary = MidnightSlate,
    tertiary = EmeraldSignal,
    onTertiary = MidnightSlate,
    error = CrimsonSiren,
    background = MidnightSlate,
    onBackground = CrispIvory,
    surface = AsphaltSurface,
    onSurface = CrispIvory,
    surfaceVariant = ElevatedConcrete,
    onSurfaceVariant = MutedSteel,
    outline = HairlineBorder,
  )

@Composable
fun CityLifeTheme(content: @Composable () -> Unit) {
  MaterialTheme(
    colorScheme = CityLifeColorScheme,
    typography = Typography,
    content = content,
  )
}
