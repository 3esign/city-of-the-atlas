/* Authored, uncalibrated study. Content review 2026-10-24; see QA.md. */
const M = [
  [
    "aut",
    "Autonomy"
  ],
  [
    "wld",
    "World"
  ],
  [
    "mat",
    "Matter"
  ],
  [
    "epi",
    "Episteme"
  ],
  [
    "acc",
    "Access"
  ],
  [
    "evi",
    "Evidence"
  ],
  [
    "rec",
    "Recognition"
  ],
  [
    "cos",
    "Cosmology"
  ]
];
const E = [
  {
    "n": "eel",
    "seat": "Colwyn Bay / NY / Belgrade / California / Athens",
    "kind": "eel",
    "aut": 5,
    "wld": 5,
    "mat": 4,
    "epi": 4,
    "acc": 5,
    "evi": 1,
    "rec": 1,
    "cos": 3,
    "t": "How might an architectural school be read through the worlds it proposes, as well as the qualifications it offers? This study gives eel a prominent place under the first question; another frame changes that reading.",
    "source": "https://eelfreeschoolofarchitecture.com/"
  },
  {
    "n": "eel_ lab (Spiller/Watson)",
    "seat": "Bartlett / Greenwich lineage",
    "kind": "sat",
    "aut": 4,
    "wld": 5,
    "mat": 3,
    "epi": 5,
    "acc": 2,
    "evi": 2,
    "rec": 3,
    "cos": 3,
    "t": "What changes when speculative design methods move between an experimental studio and a formal institution? This is an analytical relationship proposed by this atlas.",
    "source": "https://eelfreeschoolofarchitecture.com/"
  },
  {
    "n": "Underground School NY",
    "seat": "Central Park, New York",
    "kind": "sat",
    "aut": 5,
    "wld": 5,
    "mat": 3,
    "epi": 3,
    "acc": 5,
    "evi": 1,
    "rec": 0,
    "cos": 4,
    "t": "What might a school gain when its learning environment is conceived as a situated, evolving place? The values here explore that question rather than measuring a programme.",
    "source": "https://eelfreeschoolofarchitecture.com/"
  },
  {
    "n": "Form:uLA (Cantley)",
    "seat": "California",
    "kind": "sat",
    "aut": 4,
    "wld": 4,
    "mat": 2,
    "epi": 5,
    "acc": 2,
    "evi": 2,
    "rec": 4,
    "cos": 3,
    "t": "How can drawing, speculative objects and an authored design language count as architectural knowledge? This study tests a profile emphasizing world-making and episteme.",
    "source": "https://eelfreeschoolofarchitecture.com/"
  },
  {
    "n": "Belgrade academic lead",
    "seat": "Belgrade",
    "kind": "sat",
    "aut": 3,
    "wld": 3,
    "mat": 3,
    "epi": 5,
    "acc": 4,
    "evi": 5,
    "rec": 5,
    "cos": 4,
    "t": "How might a pedagogical connection help translate between an independent studio and an institutional evidence framework? This entry is a proposed relational role, not a verified biography or agreement.",
    "source": "https://eelfreeschoolofarchitecture.com/"
  },
  {
    "n": "Archigram",
    "seat": "London, 1961–1974",
    "kind": "hist",
    "aut": 5,
    "wld": 5,
    "mat": 2,
    "epi": 5,
    "acc": 3,
    "evi": 0,
    "rec": 3,
    "cos": 2,
    "t": "What kinds of architectural knowledge can drawings and publications produce before anything is constructed? The historical experiment is used here to test that question."
  },
  {
    "n": "Free School of Arch. (LA)",
    "seat": "Los Angeles, 2016–2018",
    "kind": "hist",
    "aut": 5,
    "wld": 3,
    "mat": 2,
    "epi": 3,
    "acc": 5,
    "evi": 1,
    "rec": 1,
    "cos": 2,
    "t": "What should survive a temporary learning community: its participants, methods, archive or physical setting? This entry represents historical editions considered in the research draft, not a verified statement about current activity."
  },
  {
    "n": "School of Arch. at Taliesin",
    "seat": "Arizona · Taliesin lineage, continuing as TSOA",
    "kind": "live",
    "aut": 3,
    "wld": 4,
    "mat": 5,
    "epi": 4,
    "acc": 1,
    "evi": 4,
    "rec": 4,
    "cos": 4,
    "source": "https://www.tsoa.edu/news/new-home-for-school-of-architecture",
    "t": "Correction: the 2020 closure decision was reversed. The school left the Taliesin campuses, changed its name to The School of Architecture and continued with its accreditation and students. The institution is shown as continuing, not as a ruin. Our scores remain provisional."
  },
  {
    "n": "Architectural Association",
    "seat": "London",
    "kind": "live",
    "aut": 4,
    "wld": 4,
    "mat": 3,
    "epi": 5,
    "acc": 2,
    "evi": 4,
    "rec": 5,
    "cos": 2,
    "t": "How might autonomy, publishing and pedagogical experiment be compared with the conditions of access? Our assigned values are provisional and invite correction."
  },
  {
    "n": "Bartlett B-Pro",
    "seat": "UCL, London",
    "kind": "live",
    "aut": 3,
    "wld": 4,
    "mat": 4,
    "epi": 4,
    "acc": 2,
    "evi": 4,
    "rec": 5,
    "cos": 2,
    "t": "How do computational research and material experimentation change when read through different institutional questions? The same input values are deliberately tested in every frame."
  },
  {
    "n": "RCA Architecture",
    "seat": "London",
    "kind": "live",
    "aut": 3,
    "wld": 4,
    "mat": 3,
    "epi": 4,
    "acc": 2,
    "evi": 3,
    "rec": 4,
    "cos": 2,
    "t": "What does an art-school perspective contribute to architecture when compared through knowledge, world-making and recognition? This is a question for the study, not an accreditation finding."
  },
  {
    "n": "CSM Spatial Practices",
    "seat": "London",
    "kind": "live",
    "aut": 4,
    "wld": 3,
    "mat": 3,
    "epi": 3,
    "acc": 2,
    "evi": 2,
    "rec": 3,
    "cos": 3,
    "t": "How might performance, public practice and spatial experimentation be represented alongside conventional architectural education? This model does not determine a programme’s professional status."
  },
  {
    "n": "Welsh School, Cardiff",
    "seat": "Cardiff",
    "kind": "live",
    "aut": 2,
    "wld": 2,
    "mat": 4,
    "epi": 3,
    "acc": 2,
    "evi": 5,
    "rec": 5,
    "cos": 1,
    "t": "How does a profile emphasizing evidence, material practice and recognition move when the frame changes? The contrast is a property of our chosen inputs, not a judgment of institutional quality."
  },
  {
    "n": "Sheffield SSoA",
    "seat": "Sheffield",
    "kind": "live",
    "aut": 2,
    "wld": 2,
    "mat": 3,
    "epi": 4,
    "acc": 3,
    "evi": 5,
    "rec": 5,
    "cos": 3,
    "t": "How might participation, public engagement and situated learning appear within an institutional framework? These scores express a draft reading rather than a validated comparison."
  },
  {
    "n": "London School of Arch.",
    "seat": "London",
    "kind": "live",
    "aut": 3,
    "wld": 2,
    "mat": 2,
    "epi": 3,
    "acc": 3,
    "evi": 5,
    "rec": 5,
    "cos": 2,
    "t": "How might the relationship between practice and teaching be made visible in an educational atlas? Its organizational status and current provision are outside this model’s assessment."
  },
  {
    "n": "Grymsdyke Farm",
    "seat": "Buckinghamshire",
    "kind": "live",
    "aut": 4,
    "wld": 2,
    "mat": 5,
    "epi": 2,
    "acc": 3,
    "evi": 3,
    "rec": 2,
    "cos": 4,
    "t": "What happens when fabrication and a particular place are treated as central educational values? This entry tests a material and situated profile."
  },
  {
    "n": "School of the Alternative",
    "seat": "Black Mountain, NC",
    "kind": "live",
    "aut": 5,
    "wld": 2,
    "mat": 3,
    "epi": 2,
    "acc": 5,
    "evi": 1,
    "rec": 0,
    "cos": 4,
    "t": "How might a peer learning community be read through autonomy and access? Assigned values are speculative; they do not establish cost, eligibility or qualification status."
  },
  {
    "n": "EASA",
    "seat": "Europe, itinerant",
    "kind": "live",
    "aut": 5,
    "wld": 2,
    "mat": 4,
    "epi": 2,
    "acc": 5,
    "evi": 1,
    "rec": 1,
    "cos": 3,
    "t": "How might student organization and collective making sustain a learning community across places? The model explores that relationship through authored values."
  },
  {
    "n": "Open City",
    "seat": "London",
    "kind": "live",
    "aut": 3,
    "wld": 1,
    "mat": 1,
    "epi": 2,
    "acc": 5,
    "evi": 1,
    "rec": 2,
    "cos": 2,
    "t": "What happens when public access becomes a central question in architectural education? This entry emphasizes access without claiming that it exhausts the organization’s work."
  },
  {
    "n": "RIBA / ARB Part 1-2-3",
    "seat": "United Kingdom",
    "kind": "base",
    "aut": 0,
    "wld": 0,
    "mat": 2,
    "epi": 1,
    "acc": 1,
    "evi": 5,
    "rec": 5,
    "cos": 0,
    "t": "A regulatory reference represented as a boundary in this model. Our Recognition and Evidence scores are illustrative; they do not reproduce an ARB assessment or establish eligibility for professional registration."
  },
  {
    "n": "EU Dir. 2005/36/EC Art.46",
    "seat": "European Union",
    "kind": "base",
    "aut": 0,
    "wld": 0,
    "mat": 2,
    "epi": 2,
    "acc": 1,
    "evi": 5,
    "rec": 5,
    "cos": 0,
    "t": "A legal reference represented as a boundary, not a school. This prototype does not assess compliance with the Directive or automatic recognition. Any future competence dossier must be mapped separately to the applicable official requirements."
  }
];
const FRAMES = [{no:"Frame 01",name:"Ontological depth",who:"our interpretation of eel’s published ambitions",x:"aut",y:"wld",score:d=>d.aut+d.wld+d.mat+d.epi+d.acc,max:25,z:"<b>Autonomy × World.</b> Height combines autonomy, world, matter, episteme and access. These are our proposed scores and weights, not a classification supplied or approved by eel."},
{no:"Frame 02",name:"Qualification",who:"our illustrative recognition-and-evidence frame",x:"rec",y:"evi",score:d=>2*d.rec+2*d.evi+d.mat,max:25,z:"<b>Recognition × Evidence.</b> Height gives greater weight to documented evidence and recognition. This is a design hypothesis, not an official registration assessment. Compare what becomes visible when the question changes."},
{no:"Frame 03",name:"Cosmotechnical difference",who:"our interpretation inspired by cosmotechnics",x:"cos",y:"mat",score:d=>3*d.cos+d.wld+d.mat,max:25,z:"<b>Cosmology × Matter.</b> Height emphasizes situated cosmology, world and material practice. The numeric translation is ours: Yuk Hui has not proposed or validated these scores."}];
const PROGRAMS = [
  {
    "n": "Atlas of Architecture",
    "d": "A",
    "st": "built",
    "q": "Source theme; follow the school link",
    "h": "Three-frame atlas",
    "b": "A working, uncalibrated prototype: 21 entities, eight measures and three alternate frames. Next: review the entities, evidence, weights and governance with the school."
  },
  {
    "n": "MAD Journal",
    "d": "B",
    "st": "site",
    "q": "Source theme; follow the school link",
    "h": "A journal with a DOI",
    "b": "A publishing workflow for essays and studio work: editorial roles, review, accessible reading, citation metadata and an enduring archive. Confirm editorial scope and registration requirements with the school."
  },
  {
    "n": "Post-Evolutionary Interfaces",
    "d": "N",
    "st": "site",
    "q": "Source theme; follow the school link",
    "h": "A measured superskin specimen",
    "b": "Translate one of the published material ideas into a documented specimen: fabrication parameters, measurements, photographs and a comparison with a simpler baseline."
  },
  {
    "n": "The Submariners / Nomachins",
    "d": "D",
    "st": "site",
    "q": "Source theme; follow the school link",
    "h": "A bilingual lexicon",
    "b": "Build a bilingual glossary of the school’s terms, with definitions approved by their authors, examples, references and version history."
  },
  {
    "n": "EEL Technology · Superskin",
    "d": "N",
    "st": "site",
    "q": "Source theme; follow the school link",
    "h": "Print-twin pipeline",
    "b": "Pair a digital model with a fabricated specimen and a repeatable record of material, mass, tolerances and process. This is a proposed experiment, not a validated responsive material."
  },
  {
    "n": "Underground School NY",
    "d": "F",
    "st": "site",
    "q": "Source theme; follow the school link",
    "h": "An actual platform",
    "b": "Create a studio space for sessions, participants and work in progress, with clear permissions and an exportable archive. Begin by checking the school’s existing practices."
  },
  {
    "n": "Landscape Interfaces",
    "d": "L",
    "st": "site",
    "q": "Source theme; follow the school link",
    "h": "Catalogued archive",
    "b": "Turn the collected images into a browsable catalogue with authors, titles, dates, rights and source links. Confirm the inventory and permissions before publication; evaluate IIIF where it adds value."
  },
  {
    "n": "Fractured Assemblies",
    "d": "J",
    "st": "site",
    "q": "Source theme; follow the school link",
    "h": "Entry into a live debate",
    "b": "Connect relevant essays and architectural experiments to an annotated reading room. Review primary literature and seek author feedback before proposing an edited issue."
  },
  {
    "n": "Marie Bebes Nightingale",
    "d": "M",
    "st": "site",
    "q": "Source theme; follow the school link",
    "h": "Accessibility review",
    "b": "Audit content structure, image descriptions, keyboard access, contrast and bandwidth, then test the improved experience with users. The existing research notes are a starting point, not a current compliance verdict."
  },
  {
    "n": "Midnight Garden / Sundials",
    "d": "E",
    "st": "site",
    "q": "Source theme; follow the school link",
    "h": "Visibility",
    "b": "Review search indexing, metadata, image weight and discoverability against the live site. Confirm intentional restrictions before changing them and measure the result."
  },
  {
    "n": "EEL R+D",
    "d": "H",
    "st": "site",
    "q": "Source theme; follow the school link",
    "h": "Competence dossier",
    "b": "Prototype an evidence portfolio linking studio work, reflections and assessments to explicitly chosen competence requirements. Validation by the relevant body would be a separate step; this is not a registration route."
  }
];
/* ── CGA-lite grammar: attribute → form, form → attribute ──────────────
   Every form number of a contour mass is derived here, and can be walked
   backwards: measure the form, recover the measure. tests/check.cjs holds
   both directions (reconstruction ±1) and the disonance test (two different
   attribute sets cannot produce one identical form). Authored thresholds,
   like every score — the grammar is published so it can be contested. */
const GRAMMAR = {
  /* footprint radius from Access: R = (23 + 4·acc) / 2 */
  radius:  { attr: "acc", f: v => (23 + 4 * v) / 2,        inv: r => Math.round((r * 2 - 23) / 4) },
  /* floor slabs from Evidence: floors = 8 + 4·evi */
  floors:  { attr: "evi", f: v => 8 + 4 * v,               inv: n => Math.round((n - 8) / 4) },
  /* atrium opening from Access */
  opening: { attr: "acc", f: v => 0.14 + 0.045 * v,        inv: o => Math.round((o - 0.14) / 0.045) },
  /* twist from Autonomy − Recognition, in π/15 steps */
  twist:   { attr: "aut-rec", f: (a, r) => (a - r) * Math.PI / 15,
             inv: t => Math.round(t * 15 / Math.PI) },
  /* the contour: eight measures on eight fixed directions. Radius fraction
     of the footprint = 0.30 + 0.70·value/5, blended halfway between. */
  contour: { attr: "M", f: v => 0.30 + 0.70 * v / 5,       inv: q => Math.round((q - 0.30) / 0.70 * 5) },
  /* terrace width from Access (the terraces reading) */
  terrace: { attr: "acc", f: v => 11 + 3.1 * v,            inv: w => Math.round((w - 11) / 3.1) }
};
/* the form of one entity, as the city builds it — pure numbers, no THREE */
function grammarForm(d) {
  return {
    radius: GRAMMAR.radius.f(d.acc),
    floors: GRAMMAR.floors.f(d.evi),
    opening: GRAMMAR.opening.f(d.acc),
    twist: GRAMMAR.twist.f(d.aut, d.rec),
    taper: y => 1 - (0.10 + 0.035 * d.mat) * y + 0.24 * d.wld / 5 * Math.sin(Math.PI * y)
              - 0.20 * d.epi / 5 * Math.sin(2 * Math.PI * y),
    contour: a => {
      const u = ((a / (Math.PI * 2) * 8) % 8 + 8) % 8, i = Math.floor(u), t = u - i;
      const blend = (1 - Math.cos(t * Math.PI)) / 2;
      return GRAMMAR.contour.f(d[M[i][0]] * (1 - blend) + d[M[(i + 1) % 8][0]] * blend);
    }
  };
}
/* measure the form, recover the measures. r0 is the measured footprint
   radius (it scales every contour reading away from Access); radii are the
   eight measured contour radii at the measure directions, y = 0. */
function grammarReconstruct(form, r0, radii) {
  const out = { acc: GRAMMAR.radius.inv(r0), evi: GRAMMAR.floors.inv(form.floors) };
  out["aut-rec"] = GRAMMAR.twist.inv(form.twist);
  M.forEach(([k], i) => { out[k] = GRAMMAR.contour.inv(radii[i] / r0); });
  return out;
}
const LOTS = [
  {
    "n": "Belgrade bridge",
    "d": "G",
    "h": "Join to the Belgrade city atlas",
    "b": "Propose a connection between this educational atlas and a separately documented urban atlas of Belgrade. Scope, data access and collaborators remain to be agreed."
  },
  {
    "n": "Graham Foundation",
    "d": "K",
    "h": "Research and production funding",
    "b": "Explore fit with Graham Foundation’s current programmes. Eligibility, award levels, deadlines and applicant rights must be checked for the intended call."
  },
  {
    "n": "KOZMOS ↔ cosmotechnics",
    "d": "O",
    "h": "Edited volume",
    "b": "Explore a shared reading room or edited volume connecting spatial boundaries with cosmotechnics. Treat the relationship as a research question and invite the authors to frame it."
  },
  {
    "n": "Erasmus+ partnership",
    "d": "P",
    "h": "Cooperation Partnership",
    "b": "Explore an international studio partnership after confirming institutional roles, eligible countries and the rules of the intended call. The network’s geography alone does not establish eligibility."
  }
];
export { M, E, FRAMES, PROGRAMS, LOTS, GRAMMAR, grammarForm, grammarReconstruct };
