# The Vector Works — interactive linear algebra

An interactive learning atlas for linear algebra basics, from scalars through
attention. It is a self-contained static site — no build step, no server.

## Run locally

Double-click `index.html`, or serve the folder:

```bash
python -m http.server 8731
# open http://127.0.0.1:8731/
```

## Structure

| File | Role |
|---|---|
| `index.html` | shell: stat bar, sidebar, canvas, right panel |
| `styles.css` | palette, type, layout |
| `nodes.js` | the 48 nodes, prose, geometry, graph |
| `atlas.js` | isometric map, navigation, focus/zoom |
| `widgets.js` | playground framework |
| `widgets-a.js` | objects, vector ops, measuring, norms |
| `widgets-b.js` | space, matrices, multiplication, transformation |
| `widgets-c.js` | rank, projection, eigenvalues, SVD, attention |
| `DESIGN-NOTES.md` | design rationale and encoding rules |

## Design language

Shape carries meaning, it is not decoration:

- **True shape** — an object (scalar, vector, matrix, tensor)
- **Cube** — an operation
- **Tall cube** — a measurement (collapses objects to a number)
- **Flat plate** — structure (a claim about the space)
- **Solid edge** — the learning path
- **Thin edge** — a relationship off the path

Click a topic in the sidebar to zoom to that node. Click a section header to
focus the whole group.

## Hosting on GitHub Pages

The site is pure static HTML/CSS/JS. Pages serves the repository root, so no
build step is required. Two ways to deploy:

1. **Actions** (recommended): the included
   `.github/workflows/pages.yml` deploys on every push to `main`.
2. **Branch deploy**: in the repo settings, enable Pages and set the source to
   `main` / `(root)`.
