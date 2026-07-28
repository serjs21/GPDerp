# Mask Authoring Guide

Export same-size masks:
- mask-sky.png
- mask-horizon.png
- mask-mountain.png
- mask-midground.png
- mask-foreground.png
- mask-highlights.png
- mask-shadows.png

Alpha convention:
- white/opaque inside
- black/transparent outside

Suggested feathering:
- sky edges: 0.5–1.5 px
- distant haze/mountain: 2–6 px
- midground vegetation: 1–3 px
- foreground architecture/branches: 0.5–1 px
- highlight/shadow masks: soft luminance gradients

Precompute masks. Do not detect segmentation colors every animation frame.
