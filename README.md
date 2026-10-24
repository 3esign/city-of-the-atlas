# City of the Atlas

**An open-source architectural experience by Semir Poturak / Svemir.**

Twenty-one entities, eight authored measures, three ways of reading architectural education. Change the question and watch the city rearrange. Inspect a form, compare its measures, or enter the model at eye height.

Inspired by [eel Free School of Architecture](https://eelfreeschoolofarchitecture.com/). Independently created; **not affiliated with, commissioned by, or endorsed by the school**. Scores and relationships are provisional interpretations, not institutional ratings.

![The contour edition](preview.png)

## Experience

- A responsive exhibition HUD with frame navigation, an entity index and a reading room.
- Procedural contour architecture: measures shape lobes, atriums, floors, ribs, twist and height.
- A plan that actually fits: the camera solves the free area the HUD leaves, turns the sheet when the survey runs diagonally, and names every entity by rank.
- A city that is inhabited by its own numbers: two walking figures per point of access, one street lamp per point of evidence, traffic on every proposed connection, and a dusk switch that makes the lighting legible.
- Contour / Terraces comparison, optional relationship lines and dimensions.
- Exterior walking with keyboard or touch joystick, orientation map and an explicit exit.
- Reduced-motion support, render-on-demand, a static reading room and an offline single-file build.
- Local Three.js; no runtime CDN, external fonts, analytics or package installation.

The forms are speculative models, not the buildings of the named institutions. Walking uses exterior collision envelopes; interior circulation is not implemented.

## Run locally

Node.js 22 or later:

```sh
node build.js
node tests/check.cjs
node serve.js 8788
```

Open `http://localhost:8788/`. The generated `city.html` also opens directly from disk. Keep `atlas-table.html` beside it for the reading room.

## GitHub Pages

The project is ready for a repository subpath; all runtime assets use relative URLs. The included **Publish architectural atlas** workflow builds, checks and uploads only the static release files.

Publication is deliberately manual: set the repository's Pages source to **GitHub Actions**, then run the workflow. This repository does not claim an active Pages deployment until one has completed. A future maintainer may add a push trigger for continuous publishing.

## Controls

| Action | Desktop | Touch |
| --- | --- | --- |
| Orbit | Drag; arrow keys | One-finger drag |
| Zoom | Wheel; + / − | Pinch |
| Change frame | Bottom tabs; 1 / 2 / 3 | Bottom tabs |
| Select | Click a form; About / index | Tap a form; About / index |
| Walk | Enter / walk; F | Enter / walk |
| Move in walk mode | W A S D; Shift to run | Left joystick |
| Look | Pointer lock or drag | Drag outside joystick |
| Exit walk | Esc; Model button | Model button |
| Plan, everything named | Plan view; P | Plan view |
| Day / dusk | Dusk; N | Day / dusk, in About / index |
| Population on / off | Life; L | About / index |
| Reset | Reset view; R | Reset view |

Additional controls are available in About / index on narrow screens. Links: `#f0`, `#f1`, `#f2` select frames; `?e=0` opens an entity; `?walk` enters walking.

## Sources and verification

[Method and formulas](METHOD.md) · [Design reference study](RESEARCH.md) · [Validation and limits](QA.md) · [Credits and rights](NOTICE.md)

The numerical dataset is authored and uncalibrated. Public notes frame exploratory questions; the Taliesin continuation correction includes its primary source. Other notes do not establish current programmes, accreditation, costs or partnerships. Source artwork is not redistributed.

Original code and documentation: MIT. Three.js retains its own MIT notice. Third-party institutional names and publications are outside the license grant.
