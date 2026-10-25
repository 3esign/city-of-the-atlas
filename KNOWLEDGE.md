# Project knowledge

## Errors
- Performance counters read after post-processing reported one quad, not the scene. Capture renderer.info immediately after the scene render.
- Atrium radius could exceed a low-scoring local contour. Cap it to 60% of the local outer radius.
- Equal score neighborhoods overlap when the footprint expands. Use deterministic packing and disclose the positional offset.

## Experience
- Modal focus must return to a visible trigger: a button inside a closed drawer is not a usable return target. Keep the close control reachable while long mobile content scrolls. Verified 2026-10-25 in session c1792925216310h276/qa-release.
- Retain an alternate representation of the same data; it makes the expressive mapping reviewable.
- Keep the non-spatial reading room generated from the same dataset.

## Sources
- See RESEARCH.md and METHOD.md. Three.js r169 is vendored with its license.

## Skills
- Svemir design: spatial mapping, responsive composition, screenshot review, fallback and render-on-demand.

## Decisions
- Manual Pages workflow: repository preparation is authorized; live hosting was not explicitly requested.
- Public notes are authored questions instead of unverified biographies or categorical institutional judgments. Earlier research artifacts remain preserved outside this release.
- All original code is credited to Semir Poturak / Svemir under MIT. Source institutions retain their own identity and rights.
