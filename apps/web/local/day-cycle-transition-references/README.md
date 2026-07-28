# Day-Cycle Transition References

Contents:
- palettes.json: detailed color, opacity, blend-mode, exposure, saturation, and stars keyframes
- transition-reference.md: visual behavior by region and phase
- mask-authoring-guide.md: production mask workflow
- dayCycle.ts: interpolation utilities
- react-layering-example.tsx: CSS-mask React example
- sources.md: supporting references

Recommended order:
1. Dynamic sky
2. Horizon haze
3. Neutral scene
4. Geographic masks
5. Highlight/shadow masks
6. Global grade
7. Sun, moon, stars, glow
8. Paper grain

Use solar elevation, not fixed hours. Keep separate rising and setting tracks near the horizon.
