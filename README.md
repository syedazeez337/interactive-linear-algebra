# The Vector Works — interactive linear algebra

An interactive learning atlas for linear algebra, from scalars through attention.
Forty-eight topics on an isometric map, each opening a playground you can drag and
edit while the arithmetic updates underneath.

**Live:** https://syedazeez337.github.io/interactive-linear-algebra/

It is a self-contained static site. No build step, no dependencies, no framework.

## Run locally

Double-click `index.html`, or serve the folder:

```bash
python -m http.server 8731
# open http://127.0.0.1:8731/
```

The scripts are classic `<script>` tags rather than ES modules, so opening the file
directly over `file://` works without a server.

## Structure

| File | Role |
|---|---|
| `index.html` | shell: stat bar, sidebar, canvas, right panel |
| `notes.html` | the written workshop notes the map follows |
| `styles.css` | palette, type, layout |
| `nodes.js` | the 48 nodes, prose, geometry, graph |
| `atlas.js` | isometric map, navigation, focus and zoom |
| `widgets.js` | playground framework: plane, controls, step track |
| `widgets-a.js` | objects, vector ops, measuring, norms |
| `widgets-b.js` | space, matrices, multiplication, transformation |
| `widgets-c.js` | rank, projection, eigenvalues, SVD, attention |
| `DESIGN-NOTES.md` | design rationale and encoding rules |

## Design language

Shape carries meaning, it is not decoration:

- **True shape** — an object (scalar, vector, matrix, tensor)
- **Cube** — an operation
- **Tall cube** — a measurement, which collapses objects to a number
- **Flat plate** — structure, a claim about the space
- **Solid edge** — the learning path
- **Thin edge** — a relationship off the path

Click a topic in the sidebar to open its playground. Click a section header to zoom
the map to that group. Arrow keys move along the path, `→` goes inside a node and
`←` comes back out.

## Screen sizes

Built for a desktop-width screen. Below 820px the three columns stack and the page
scrolls; the map stays usable but the isometric view is tight.

## Hosting on GitHub Pages

Pages serves the repository root directly, so no build step and no workflow file are
needed. In the repository settings, under Pages, set the source to `main` and the
folder to `/ (root)`. Every push to `main` then triggers a rebuild automatically.

If you would rather deploy through Actions, add a workflow yourself — this repository
does not include one, and does not need one.

## Sources

Mathematical content is drawn from MIT 18.065, Stanford CS224N, CMU 10-701, Princeton
NEU560, Cornell CS4220, and UC Berkeley Math 54, alongside Treil's *Linear Algebra
Done Wrong* and Margalit and Rabinoff's *Interactive Linear Algebra*. Each note page
in `notes.html` cites the specific source it follows.
