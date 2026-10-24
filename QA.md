# Validation · 24 October 2026

44 browser checks passed, plus the Node build/content checks. Browser tests ran through Chrome DevTools Protocol on desktop hardware; mobile viewports emulate touch and screen dimensions.

## Measured

- Desktop 1440 × 900; phone 390 × 844; narrow phone 320 × 568; landscape 844 × 390; tablet 768 × 1024.
- All 21 generated meshes have finite coordinates; shape parameters vary with the dataset.
- Repeated frame and Contour/Terraces changes preserve geometry and collider counts.
- Idle scene stops rendering. Pinch, orbit, selection, focus, touch walking, keyboard walking, exit and orientation were exercised.
- Reading room works with JavaScript disabled. WebGL failure presents a usable link. The single-file build opens offline.
- Measured active mobile-viewport frame delivery on an AMD Radeon RX 580: median 16.7 ms; p95 16.8 ms over 121 animation-frame samples. This is a short desktop GPU measurement, not a physical-phone or sustained thermal benchmark.
- Reviewed rendered desktop, mobile, focused pavilion, panel, plan, terraces and no-effects captures.
- Final public-copy changes were followed by another build and link/content check.

## Checks

- PASS — mobile initializes
- PASS — mobile viewport has no horizontal overflow
- PASS — walk clears bottom tabs
- PASS — controls at least 44px tall
- PASS — idle stops rendering
- PASS — frame switches do not leak colliders or GPU resources
- PASS — entity index opens corrected Taliesin record
- PASS — touch drag orbits
- PASS — two-finger pinch zooms in
- PASS — joystick moves forward in view direction
- PASS — joystick releases to rest
- PASS — touch drag looks while walking
- PASS — walk exit restores model
- PASS — orientation preserves view and layout
- PASS — 320px controls do not overlap
- PASS — keyboard changes frame
- PASS — keyboard W moves forward
- PASS — escape exits walking
- PASS — reduced motion settles frame immediately
- PASS — no runtime or network errors
- PASS — index has all entities and contributions
- PASS — tablet starts
- PASS — tap mass opens entity
- PASS — closing panel restores visible keyboard focus
- PASS — WebGL failure offers a real index link
- PASS — complete index works with JS disabled
- PASS — one-file city opens offline from disk
- PASS — malformed URL returns 400 without killing server
- PASS — path traversal cannot read sibling source
- PASS — server remains healthy
- PASS — LAN address serves final build
- PASS — all procedural meshes have finite vertices
- PASS — contours encode evidence as slab count
- PASS — forms respond to distinct data
- PASS — featured pavilion focuses and clears introduction
- PASS — about drawer states authorship and independence
- PASS — repeated form changes do not leak GPU geometry or colliders
- PASS — terraces comparison works
- PASS — plan view is square on and fits every entity
- PASS — connections expose pressed state
- PASS — dimension controls expose state
- PASS — mobile drawer exposes plan view
- PASS — mobile focus retains usable distance
- PASS — new features produce no runtime errors

## v5 — plan, population and dusk (2026-10-24)

Measured in the live page over a desktop viewport, an emulated phone, a walk and a phone-sized plan.

- PASS — population instrumented for QA
- PASS — two figures per point of access
- PASS — one lamp per point of evidence
- PASS — crowd and lamps are instanced, not 300 meshes
- PASS — figures move through the city
- PASS — plan is square on
- PASS — every entity is inside the free rectangle in plan
- PASS — every entity is labelled in plan
- PASS — wide sheet spells the names out
- PASS — plan labels do not collide
- PASS — leaving plan restores the oblique frame
- PASS — dusk drops the key light and lights the lamps
- PASS — filament traffic runs when connections are shown
- PASS — walk mode still runs with the population
- PASS — phone plan fits every entity in the free rectangle
- PASS — phone plan numbers all 21 without spelling them
- PASS — phone population is halved but exact
- PASS — phone viewport holds a usable frame rate (desktop GPU)
- PASS — draw calls stay in budget
- PASS — no runtime errors across the v5 pass

## Design review

1. **Purpose:** changing the evaluative question changes the architectural reading.
2. **Truth:** forms map to authored data; visible independence and uncalibrated status; no institutional endorsement claimed.
3. **Reduction:** removed the persistent sidebar, title-block duplication, automatic connection lines, chromatic aberration and strong bloom.
4. **Hierarchy:** identity and invitation, spatial model, frame controls; detail on demand.
5. **Motion:** scene movement follows navigation or a changed frame. No automatic orbit. Reduced motion removes resurvey interpolation.
6. **Bare screen:** reviewed without post effects and shadows; the forms and controls remain legible.
7. **Access:** keyboard/touch paths, visible focus, non-3D reading room and offline build checked. This is not a formal WCAG certification or screen-reader audit.

## Remaining limits

Physical iOS/Android devices, sustained battery/thermal behavior, screen-reader interaction and broad browser compatibility have not been measured. Spatial packing improves separation but camera views can still occlude entities; the index provides direct access. Collision geometry is conservative and does not permit atrium or room traversal. Scores remain an editorial prototype. Pages packaging is prepared; no deployment is claimed here.
