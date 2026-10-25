# How the atlas becomes architecture

An authored set of questions produces different spatial readings of architectural education.

This is a speculative, uncalibrated study by **Semir Poturak / Svemir**. Its 0–5 scores, relationships and formulas are our interpretations. They are not ratings supplied by the institutions, an accreditation assessment, or evidence of endorsement. Entity notes inherited from the research draft require further source-by-source calibration. A zero is a design input, not a finding that an institution has no activity in that area.

## Three frames

| Frame | X / Z anchors | Height numerator |
| --- | --- | --- |
| Ontological depth | Autonomy / World | Autonomy + World + Matter + Episteme + Access |
| Qualification | Recognition / Evidence | 2 × Recognition + 2 × Evidence + Matter |
| Cosmotechnical difference | Cosmology / Matter | 3 × Cosmology + World + Matter |

Height is `9 + 86 × numerator / 25` in fictional model units. It is not the height of a real building. The regulatory references are represented by boundary slabs and are included in the comparative totals; they are not schools. Equal scores share a rank. Cosmotechnics informs the question; the numeric method is not attributed to Yuk Hui.

Positions begin on the two selected score axes, with deterministic small offsets. Overlapping footprints are separated by a deterministic pairwise relaxation. Positions therefore identify neighborhoods, not exact scatterplot coordinates. The numeric table is the exact representation. Spatial separation is computed independently for each frame.

## Contour mode

Each form is generated directly from its eight values. There are no prebuilt models and no random choice of building shape.

| Form component | Rule |
| --- | --- |
| Eight contour directions | Autonomy, World, Matter, Episteme, Access, Evidence, Recognition, Cosmology; clockwise in the model's X/Z plane |
| Radius between directions | Cosine interpolation of the neighboring scores; normalized radius `0.30 + 0.70 × score / 5` |
| Overall diameter | `23 + 4 × Access` model units |
| Atrium radius fraction | `0.14 + 0.045 × Access`, capped at 60% of the local outer radius to preserve a positive wall thickness |
| Slab count | `8 + 4 × Evidence` |
| Continuous rib count | `12 + 4 × Matter` |
| Total twist | `12° × (Autonomy − Recognition)` |
| Vertical profile at normalized height y | `1 − (0.10 + 0.035 × Matter)y + 0.24 × World/5 × sin(πy) − 0.20 × Episteme/5 × sin(2πy)` |
| Height | The active frame's formula above |

These are expressive mappings, not causal models or fabrication specifications. The visible minimum radius lets zero values remain inspectable. The radar diagram shows the raw scores without that minimum radius. Regulatory walls retain their slab form. Historical entries use translucent graphite; living schools use plaster; eel and related entries use pink and rose.

## Terraces mode

The previous representation remains as a comparison. The eight measures are sorted in descending order. Stage area uses a nonzero minimum and is normalized against the largest score. Each stage's vertical share is proportional to `0.20 + score/5`. This sorts away the fixed directional identity that the contour mode preserves.

## Relationships and proposals

Connections are authored analytical hypotheses, hidden by default and available through the controls. They do not establish a formal partnership. The small plots around eel are proposed contributions. Only this atlas experience is implemented here. An empty plot does not assert that the school lacks corresponding work.

The source school is [eel Free School of Architecture](https://eelfreeschoolofarchitecture.com/). Its work, name and authorship remain its own. No school artwork or photography is redistributed in this release.

## The inhabited city

The population and the lighting are read off the same eight measures as the forms. Nothing in the city moves or glows for decoration alone.

| Element | Rule | What it says |
| --- | --- | --- |
| Walking figures | `2 × Access` per entity, minimum 2, maximum 12. One per point on a phone, so the ratio holds at half the population instead of truncating the last districts to fit the instance cap | How open the work is, in bodies on the street |
| Where they walk | Between their own mass and a mass it is connected to, on a lane offset from the centre line, pushed out of every building footprint by the same colliders that stop the player | The connection diagram, walked rather than drawn |
| Street lamps | `Evidence` lamps per entity, on the kerb of its own footprint | What is documented is lit; an undocumented school stands in the dark |
| Travelling dots | Two per connection, running the filament curve, visible only when connections are shown | Traffic on a proposed line of descent |
| Dusk | One switch: key light, sky, environment, fog, exposure, bloom and lamp emission move together | The lamp readings only mean something against a dark city |

The whole population is one instanced draw call, as are the posts, the heads and the pools. The crowd stops when the page is hidden, when `prefers-reduced-motion` is set, and whenever the population is switched off.

## The engine

Every height in the city is computed; the engine (E, or `?engine`) refuses to let that
computation stay invisible. Eight measure-nodes ring the survey at a height set by the
weight the active frame gives them, each dropping hairlines to the three masses its
value leads. Tapping a node opens a lens: that one measure's drop-lines run to all 21
masses in the accent ink, the other measures fall silent, and the readout prints the
measure's own field — who carries 5, who carries 0 — under the weight the frame applies.
The readout always shows the frame's formula in code form (`score(e) = aut + wld + …`)
and, under the pointer, evaluates it live for the mass beneath it.

The exhibited weights are not documentation of the score function; they are bound to it.
`tests/check.cjs` proves, for every entity in every frame, that the declared weights
reproduce `FRAMES[n].score` exactly — if the formula and the city ever drift apart, the
build fails. The motes falling along the drop lines are the only animation the engine
has, and reduced-motion keeps the wiring while silencing them. In plan view the engine
stands down, so the named survey reads alone.

## Plan

Plan view solves the camera distance from the measured free rectangle of the screen — the area the masthead, margin, controls, tabs, stamp and credit leave unoccupied — using both half-angles of the frustum, so the entire survey lands inside what is actually visible rather than inside the raw viewport. Where the survey runs diagonally across a portrait screen the sheet is turned, in 15° steps, to whichever angle needs the least distance; the caption states the turn. On a wide sheet every entity is named with its rank; below 700 px, or when the free band is shorter than 300 px, the plan is numbered by rank and the names are read in the index, because 21 names at a readable size would bury the city they describe.

## Scope of walking

Walking uses an eye-height camera, keyboard or touch joystick, a map, and conservative building-footprint collisions. It is an exterior model walk, not a simulation of enterable rooms, stairs or structural behavior. Atriums are visual voids; collision envelopes do not permit interior circulation.
