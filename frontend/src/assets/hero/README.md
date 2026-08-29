# Hero trio image

`hero-trio.png` is the right-side hero visual used by
`src/components/HeroTrioVisual.jsx`.

## Swapping in the real image

Replace `hero-trio.png` in this folder with the final trio cut-out, then rebuild
(`npm run build`) — nothing else needs to change. The component imports it by
this exact path.

Guidelines for the asset:
- **Transparent PNG** (or WebP), subject already cut out from its background.
- Portrait-ish, roughly **1:1 to 4:5** aspect. All three faces near the top.
- No baked-in text, coupons or badges (the old stock composite had a
  "FLAT 10% OFF" coupon — crop it out).
- ~1400px on the long edge is plenty; it renders at ≤ 520px.
- The component anchors the image to the bottom (`object-bottom`), so extra
  headroom is fine but don't crop heads/hands.
