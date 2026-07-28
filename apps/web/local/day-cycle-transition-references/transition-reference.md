# Transition Reference

## Solar phases
- below -18°: full night
- -18° to -12°: astronomical twilight
- -12° to -6°: nautical twilight
- -6° to 0°: civil twilight
- 0° to 8°: sunrise/sunset and golden light
- 8° to 35°: morning/afternoon
- above 35°: broad daylight

## Region behavior
- Sky: replace completely; concentrate warm colors close to the horizon.
- Horizon haze: strongest near sunrise/sunset; weaker at noon and full night.
- Mountain: always lighter, cooler, and less saturated than foreground.
- Midground: preserve some blossom color through dusk to avoid muddy results.
- Foreground: darkens fastest after sunset; preserve silhouette readability at night.
- Highlights: warm at dawn/dusk, cool and restrained at night.
- Shadows: blue-purple at dawn/dusk, not pure black.

## Interpolation
- Use OKLCH or Oklab.
- Use smoothstep easing.
- Interpolate color, opacity, exposure, saturation, and star visibility separately.
- Maintain distinct rising and setting palettes.
