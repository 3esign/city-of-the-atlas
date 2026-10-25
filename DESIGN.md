# Design foundations

*Why the city looks and moves the way it does, and the ladder it climbs next.*

The city is an instrument, not a diorama. Every visual decision passes one
question: **what does this add to the reading?** Anything that is merely
beautiful and silent does not ship.

## Layers

- **L0 · Concept.** Height is standing in the current frame; contours are eight
  measures; the argument can be contested. Space is the thesis — scores take
  architectural form precisely so that interpretation can be *seen* and argued
  with, never mistaken for a measured fact. Provenance lives in the dossier,
  the method and the colophon, not in the geometry.
- **L1 · Rendering.** One sky, one sun, one grade: the scene is photographed
  once (ACES, bloom, vignette, grain) instead of every material guessing its
  own exposure. Depth cues are drawn in the sheet's language — ink-wash
  clouds, exponential haze — never sky photography.
- **L2 · Objects.** Procedural forms read the dataset directly (lobes from
  measures, floors from evidence, twist from autonomy minus recognition).
  The reader's marks are drafting marks: a dashed ink circle at the foot of
  the entity being read, a fainter ring under the pointer. No glow without a
  reason; the one accent (eel pink) is spent once.
- **L3 · Camera.** One `flyTo` choreography — shortest azimuth arc, eased,
  instant under reduced motion — serves the opening sweep, selection, the
  plan, and the guided tour. A pointer on the canvas cancels any flight:
  **the camera belongs to the visitor; narration only borrows it.**
- **L4 · Readability.** The plan solves for the rectangle the HUD actually
  leaves, turns the sheet to fit, and stacks 21 names without a collision
  solver. Captions speak as sheet notes. The dossier is the centre of
  information; the model is the centre of attention.
- **L5 · Art direction.** Paper, hairlines, one accent, a serif title.
  Furniture inherits one variable swap at dusk. Mobile is not a small desk:
  the thumb gets tabs, a drawer and analogue controls, not a shrunk margin.
- **L6 · Quality gates.** Content checks (`tests/check.cjs`) plus a browser
  battery: seven viewport sizes, keyboard paths, reduced motion, offline
  single-file build. Every wave passes the same gates.

## The guided tour

Eight steps the city already knew — frame change, plan, dusk, arrival at the
origin — sequenced into one reading with captions. Orientation before
narration: any drag or `Esc` ends the tour at that exact moment and leaves
the camera where the visitor grabbed it.

## The ladder ahead

1. **Dusk windows** (instanced, one per point of evidence) and dossier↔model
   coupling: hover a measure bar, see its contour band.
2. **"What if" reading:** ±1 on one measure, the city rearranges, and the
   hypothesis is named as a hypothesis in the URL.
3. **Two signed readings of one work**, standing together in space —
   disagreement as content.
4. **WebGPU evaluation** (SSAO/SSGI) — only if it passes L0 and L6.

## Reference study

The patterns behind these foundations — knowledge as navigable space,
fly-to narrative, atmosphere as craft, procedural detail from data — are
collected with sources in [RESEARCH.md](RESEARCH.md).
