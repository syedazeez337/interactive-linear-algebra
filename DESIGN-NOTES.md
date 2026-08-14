# Interactive Linear Algebra: design notes

Working notes for an interactive learning environment for linear algebra basics,
modelled on the visual and interaction language of `reference/evolution-harness.jpg`.

Sources for all mathematical content: the two textbooks in the parent folder
(`Linear Algebra Done Wrong`, `Interactive Linear Algebra`) plus the university
course material already cited in `../linear-algebra-workshop.html`.

Status: complete, all nine checklist sections. 48 live nodes render, carry prose,
and have a working playground; there are no dashed placeholder nodes left. Verified
in Chrome: all 48 widgets mount and step with no NaN, no unregistered node.

Files: `index.html`, `styles.css`, `nodes.js` (content + layout), `atlas.js` (isometric
map), `widgets.js` (framework), `widgets-a.js` (objects, vector ops, measuring, norms),
`widgets-b.js` (space, matrices, multiplication, transformation),
`widgets-c.js` (rank, projection, eigenvalues, SVD, attention).

To run: double-click `index.html`. The scripts are classic tags, not ES modules,
so they load from `file://` without a server. If you prefer one:
`python -m http.server 8731` from this folder, then open `http://127.0.0.1:8731/`.

---

## 1. What the reference actually is

"The Evolution Harness" is an explorer for a codebase (a 4X game plus a system that
breeds strategy programs to play it). Four regions:

**Top stat bar.** Key/value pairs in monospace. Small grey uppercase label above a
larger dark value. Six fields: repository, model roles, runs, doctrines bred, games
on record, engines.

**Top-right controls.** `RESUME THE FLOW` / `TRACE ONE STEP` / `RESET VIEW`. So the
diagram animates, and the animation can be played, single-stepped, or reset.

**Left sidebar.** A hierarchical index grouped under category headers (THE SYSTEM,
THE EVOLUTION LOOP, SUPPORTING THE LOOP, THE GAME, WHAT COMES OUT). Each row carries
a short letter key, a name, and a count on the right. Child rows are indented with a
lighter border.

**Centre canvas.** Isometric axonometric drawing on a faint ground grid. Nodes are
extruded solids filled with parallel-line hatching, labelled with the same letter
keys as the sidebar.

**Right panel.** Two tabs, `WHAT IT DOES` and `HOW IT'S BUILT`. Prose with
small-caps section headers over hairlines. Key terms are highlighted as inverse
text on a black background in paper-coloured type.

**Bottom hint bar.** `→ GO INSIDE · ← COME BACK OUT · ↓ ↑ MOVE · HOVER TO READ ·
DRAG TO PAN · SCROLL TO ZOOM`.

---

## 2. The part worth stealing: form carries meaning

The reference does not decorate. Shape encodes fact:

| Form | Means |
|---|---|
| Tall hatched cube | a measuring / processing part |
| Flat wide plate | a surface or arena |
| Stack of thin plates | an archive holding many items |
| Parallel slices side by side | several workers running at once |
| Dashed outline | present but not switched on |
| Solid black edge | the live flow path |
| Thin edge | a static relationship |
| Black diamond on an edge | position of the thing currently moving |

The panel states the rule outright: *"The tall structures are the measuring parts."*
The reader is told the encoding, so the drawing becomes legible rather than pretty.

---

## 3. Why this maps unusually well onto linear algebra

For a codebase, isometric solids are a metaphor. For linear algebra they are not.
The objects genuinely have shape, and the shape is the mathematics:

| Object | Literal form |
|---|---|
| Scalar | one cell |
| Vector in R^n | a column of n cells |
| m×n matrix | a grid, m cells tall and n wide |
| Order-3 tensor | a stack of grids |

So an isometric canvas is not an illustration of the mathematics. It *is* the
mathematics, drawn at true shape. Three consequences:

**Shape mismatches become visible errors.** Why `[2,3] + [4,5,6]` fails, and why
`QK` is undefined until you transpose, stop being rules to memorise and become
something you can see refuse to fit.

**Extrusion height can encode rank.** A full-rank matrix stands tall; a rank-1
matrix is flat. A matrix that flattens the plane onto a line looks flattened. That
is a real teaching device, not a flourish.

**The flow animation becomes a computation.** The reference's diamond markers travel
an edge. Ours can be an actual vector travelling into a matrix and emerging with a
different shape, so a dimension change becomes watchable.

---

## 4. Resolved design

**Model.** Hybrid. The isometric canvas is a concept atlas used for navigation;
pressing `→` on a node descends into a live playground for that one idea.

**Inside a node.** A manipulable widget. Drag the vectors and every number updates. A step track means so `TRACE ONE STEP` walks the arithmetic one line at a time.
Intuition and procedure in the same view.

**Scope.** All nine checklist sections. Sixty-three items, grouped into
forty-eight live nodes (no dashed placeholders remain).

### Node inventory

| Group | Nodes | Checklist items |
|---|---|---|
| The objects | `Z` scalar, `V` vector, `M` matrix, `T` tensor | 1.1, 1.2, 1.3, 1.21, 1.22, 2.1, 2.2 |
| Building with vectors | `A` add, `S` subtract, `K` scale, `C` linear combination | 1.4, 1.5, 1.6, 1.14 |
| Measuring | `N` magnitude, `U` normalise, `D` distance, `P` dot product, `G` angle, `O` orthogonality, `Q` cosine similarity | 1.7–1.13 |
| Norms | `L1` L1 norm, `LI` L∞ norm, `NC` compare norms | 4.1, 4.2, 4.3 |
| The space | `W` vector space, `B` basis, `I` independence, `E` dimension, `R` the relationship | 1.15–1.20 |
| Building with matrices | `MA` add/subtract, `MK` scale, `TR` transpose | 2.3, 2.4, 2.5, 2.6 |
| Multiplication | `MV` matrix×vector, `VM` vector×matrix, `MM` matrix×matrix | 2.7, 2.8, 2.9 |
| Transformation | `X` geometric meaning, `DR` 4D→3D, `DI` 4D→6D | 2.10, 2.11, 2.12 |
| Rank & information | `RK` rank, `RS` rank & span, `LO` LoRA | 5.1, 5.2, 5.3, 5.4 |
| Projection | `PR` projection, `PF` formula, `PI` why it matters | 6.1, 6.2, 6.3, 6.4, 6.5 |
| Eigenvalues & PCA | `EV` eigenvector, `EC` eigenvalue & calc, `PD` PCA | 7.1–7.6 |
| SVD & low-rank | `SV` SVD, `SG` geometry, `SP` pixels | 8.1–8.5 |
| Attention | `QK` Q/K/V, `QT` QKᵀ & scaling, `SM` softmax, `AT` full attention | 9.1–9.6 |

### Encoding rules

Stated on the page, the way the reference states its own.

| Form | Means |
|---|---|
| Drawn at literal true shape | an **object** - scalar is one cell, a vector in R^n is a column of n cells, an m×n matrix is a grid m tall and n wide, a tensor is a stack of grids |
| Cube | an **operation** - something that does work |
| **Tall** cube | a **measurement** - something that turns objects into a number |
| Wide flat plate | **structure** - a claim about the space itself |
| Solid black edge | the learning path |
| Thin edge | related, not on the path |
| Dashed outline | present but not switched on (reserved for future material) |

The tall-structures rule is carried over from the reference unchanged, and it
happens to be literally true here: magnitude, dot product, angle, distance,
cosine similarity, the L1 norm, the L∞ norm and rank are exactly the operations
that collapse objects into scalars.

### The four regions

**Stat bar.** topic · concepts · items · worked examples · sources · progress
(`step 3 of 48`, taking the reference's `RUNS 18 · 8 in era 4` slot).

**Sidebar.** The thirteen groups above as category headers, letter-keyed rows,
count on the right, children indented.

**Canvas.** Isometric atlas. `RESUME THE FLOW` animates a token along the
learning path; `TRACE ONE STEP` advances one node; `RESET VIEW` recentres.

**Right panel.** Two tabs, renamed for this subject:
`WHAT IT MEANS` (geometric, follows *Interactive Linear Algebra*) and
`HOW TO COMPUTE IT` (algebraic, follows *Linear Algebra Done Wrong*). The
reference's `Condition` field becomes `WATCH OUT`, the mistakes that item
invites, such as dimension mismatch or assuming `AB = BA`.

**Hint bar.** Unchanged from the reference; the verbs already fit.

### Build order

A vertical slice first: the full four-region shell with isometric rendering and
keyboard navigation, plus three nodes fully working, `V` vector, `P` dot product,
`MV` matrix×vector. One object, one measurement, one operation, which is enough to
prove all three widget archetypes before the remaining forty-five are filled in.

### Files

```
index.html      shell and the four regions
styles.css      palette, type, layout
atlas.js        isometric projection, hatching, navigation
nodes.js        content: the 48 nodes, their prose, their widget config
widgets.js      the interactive canvases
```

Canvas 2D for both the atlas and the widgets, the hatching and the isometric
projection are generated, not hand-authored.

---

## 5. Palette and type (provisional, read off the reference)

- Ground: olive / khaki, approximately `#CFC79F`
- Ink: near-black, approximately `#14140F`
- Hatching: same ink at low weight, parallel lines, direction varying by face
- Highlight: inverse, ink background, ground-coloured type
- Type: monospace throughout, uppercase small-caps for labels with wide tracking

The reference commits to a single visual world with no dark mode. Worth deciding
whether to follow that or build both themes.
