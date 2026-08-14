/* Playgrounds: the space, building with matrices, multiplication, transformation. */
(function (W) {
  'use strict';
  const INK = W.INK, OX = W.OXIDE, MUTE = W.MUTE, FAINT = W.FAINT;
  const f = W.f;
  const EPS = 1e-9;

  /* ---------- small exact-ish linear algebra ---------- */
  function rref(M, rows, cols) {
    const R = M.slice(), piv = [];
    let lead = 0;
    for (let r = 0; r < rows && lead < cols; r++) {
      let i = r;
      while (Math.abs(R[i * cols + lead]) < EPS) {
        i++;
        if (i === rows) { i = r; lead++; if (lead === cols) return { R: R, piv: piv }; }
      }
      for (let k = 0; k < cols; k++) { const t = R[i * cols + k]; R[i * cols + k] = R[r * cols + k]; R[r * cols + k] = t; }
      const lv = R[r * cols + lead];
      for (let k = 0; k < cols; k++) R[r * cols + k] /= lv;
      for (let q = 0; q < rows; q++) if (q !== r) {
        const g = R[q * cols + lead];
        if (Math.abs(g) > EPS) for (let k = 0; k < cols; k++) R[q * cols + k] -= g * R[r * cols + k];
      }
      piv.push(lead); lead++;
    }
    return { R: R, piv: piv };
  }
  function rank(M, rows, cols) { return rref(M, rows, cols).piv.length; }
  /* one non-zero vector in the null space of M, or null if there is none */
  function nullVector(M, rows, cols) {
    const out = rref(M, rows, cols), piv = out.piv, R = out.R;
    const free = [];
    for (let c = 0; c < cols; c++) if (piv.indexOf(c) < 0) free.push(c);
    if (!free.length) return null;
    const v = new Array(cols).fill(0);
    v[free[0]] = 1;
    piv.forEach(function (pc, r) { v[pc] = -R[r * cols + free[0]]; });
    return v;
  }
  function matVec(M, rows, cols, x) {
    const y = [];
    for (let r = 0; r < rows; r++) { let s = 0; for (let c = 0; c < cols; c++) s += M[r * cols + c] * x[c]; y.push(s); }
    return y;
  }
  function blockOf(M, rows, cols, w) {
    const width = w || Math.max.apply(null, M.map(v => f(v).length));
    const out = [];
    for (let r = 0; r < rows; r++) {
      const row = [];
      for (let c = 0; c < cols; c++) row.push(W.pad(f(M[r * cols + c]), width));
      out.push('[' + row.join(' ') + ']');
    }
    return out;
  }

  /* ============ W - vector space ============ */
  W.register('space', function () {
    const pl = W.Plane(560, 380, 44);
    const u = { x: 2, y: 1 }, v = { x: 1, y: 3 }, st = { al: 2, be: -1 };
    let sa, sb;
    function draw() {
      pl.clear();
      const s = { x: u.x + v.x, y: u.y + v.y };
      pl.shape([[0, 0], [u.x, u.y], [s.x, s.y], [v.x, v.y]], 'rgba(20,20,15,.06)', null);
      pl.vec(u.x, u.y, INK, 'u');
      pl.vec(v.x, v.y, OX, 'v');
      pl.vec(s.x, s.y, INK, 'u+v', { width: 3 });
      pl.handle(u.x, u.y, INK); pl.handle(v.x, v.y, OX);
      const A = st.al, B = st.be;
      const L1 = [A * (u.x + v.x), A * (u.y + v.y)];
      const R1 = [A * u.x + A * v.x, A * u.y + A * v.y];
      const L2 = [(A + B) * v.x, (A + B) * v.y];
      const R2 = [A * v.x + B * v.x, A * v.y + B * v.y];
      W.read(
        'α = ' + f(A) + '     β = ' + f(B) + '\n\n' +
        'AXIOM 1, commutativity\n' +
        '  u+v = [' + (u.x + v.x) + ', ' + (u.y + v.y) + ']\n' +
        '  v+u = [' + (v.x + u.x) + ', ' + (v.y + u.y) + ']        ✓ equal\n\n' +
        'AXIOM 7, α(u+v) = αu + αv\n' +
        '  left  = ' + f(A) + '·[' + (u.x + v.x) + ', ' + (u.y + v.y) + '] = [' + f(L1[0]) + ', ' + f(L1[1]) + ']\n' +
        '  right = [' + f(A * u.x) + ', ' + f(A * u.y) + '] + [' + f(A * v.x) + ', ' + f(A * v.y) + '] = [' + f(R1[0]) + ', ' + f(R1[1]) + ']' +
        (Math.abs(L1[0] - R1[0]) < EPS && Math.abs(L1[1] - R1[1]) < EPS ? '   ✓' : '   ✗') + '\n\n' +
        'AXIOM 8, (α+β)v = αv + βv\n' +
        '  left  = ' + f(A + B) + '·[' + v.x + ', ' + v.y + '] = [' + f(L2[0]) + ', ' + f(L2[1]) + ']\n' +
        '  right = [' + f(A * v.x) + ', ' + f(A * v.y) + '] + [' + f(B * v.x) + ', ' + f(B * v.y) + '] = [' + f(R2[0]) + ', ' + f(R2[1]) + ']' +
        (Math.abs(L2[0] - R2[0]) < EPS && Math.abs(L2[1] - R2[1]) < EPS ? '   ✓' : '   ✗') + '\n\n' +
        'A SET THAT FAILS\n' +
        '  S = vectors in R² with first component ≥ 0\n' +
        '  u = [' + u.x + ', ' + u.y + ']  is in S\n' +
        '  (−1)u = [' + (-u.x) + ', ' + (-u.y) + ']  ' +
        (-u.x >= 0 ? 'is in S, try dragging u right of the axis' : 'is NOT in S  ✗ axiom 4 fails') + '\n' +
        '  so S is not a vector space'
      );
    }
    W.attachDrag(pl, () => [u, v], function (i, x, y) { const t = i === 0 ? u : v; t.x = x; t.y = y; draw(); });
    sa = W.ui.slider('α', -3, 3, 0.5, 2, x => { st.al = x; draw(); });
    sb = W.ui.slider('β', -3, 3, 0.5, -1, x => { st.be = x; draw(); });
    return {
      cv: pl.cv, extra: W.ui.bar(sa.el, sb.el, W.ui.note('the axioms are checked live against your numbers')),
      draw: draw,
      reset: function () { u.x = 2; u.y = 1; v.x = 1; v.y = 3; st.al = 2; st.be = -1; sa.set(2); sb.set(-1); draw(); },
      steps: () => [
        'A vector space is a set with two operations, add, and scale, whose results never leave the set.',
        'Eight axioms make that precise. Four govern addition, two multiplication, two tie them together.',
        'Axiom 1 says u+v = v+u. Both sides are computed above from your dragged vectors, and they agree.',
        'Axioms 7 and 8 are the distributive laws. Move the α and β sliders: both sides track each other exactly.',
        'The last block shows a set that fails. Vectors with first component ≥ 0 are not a vector space, because scaling by −1 escapes it.'
      ]
    };
  });

  /* ============ E - dimension ============ */
  W.register('dimension', function () {
    const pl = W.Plane(560, 380, 44);
    const a = { x: 2, y: 1 }, b = { x: -1, y: 2 }, st = { n: 2 };
    let pick;
    function rk() {
      if (st.n === 1) return (a.x || a.y) ? 1 : 0;
      const det = a.x * b.y - b.x * a.y;
      if (Math.abs(det) > EPS) return 2;
      return (a.x || a.y || b.x || b.y) ? 1 : 0;
    }
    function draw() {
      pl.clear();
      const r = rk();
      if (r === 2) pl.shape([[-9, -9], [9, -9], [9, 9], [-9, 9]], 'rgba(140,58,30,.10)', null);
      else if (r === 1) { const d = (a.x || a.y) ? a : b; pl.line(d.x, d.y, 'rgba(140,58,30,.35)', 10); }
      pl.vec(a.x, a.y, INK, 'v₁');
      if (st.n === 2) pl.vec(b.x, b.y, OX, 'v₂');
      pl.handle(a.x, a.y, INK);
      if (st.n === 2) pl.handle(b.x, b.y, OX);
      W.read(
        'spanning set: ' + st.n + ' vector' + (st.n > 1 ? 's' : '') + ' in R²\n\n' +
        'v₁ = [' + a.x + ', ' + a.y + ']' + (st.n === 2 ? '     v₂ = [' + b.x + ', ' + b.y + ']' : '') + '\n\n' +
        'the span is ' + (r === 2 ? 'the whole plane' : r === 1 ? 'a line through the origin' : 'just the origin') + '\n' +
        'a basis for it needs ' + r + ' vector' + (r === 1 ? '' : 's') + '\n\n' +
        'dim V              = ' + r + '     ← size of a basis\n' +
        'components each    = 2     ← length of the column\n\n' +
        (r === 2 ? 'here they happen to match'
          : 'these two numbers are different. That is the whole point.\n' +
            'the vectors still have 2 components, but the space\nthey span is only ' + r + '-dimensional')
      );
    }
    W.attachDrag(pl, () => st.n === 2 ? [a, b] : [a], function (i, x, y) {
      const t = i === 0 ? a : b; t.x = x; t.y = y; draw();
    });
    pick = W.ui.pick('vectors', [{ v: 1, t: '1' }, { v: 2, t: '2' }], 2, v => { st.n = +v; draw(); });
    return {
      cv: pl.cv, extra: W.ui.bar(pick.el, W.ui.note('make them parallel to collapse the span')),
      draw: draw,
      reset: function () { a.x = 2; a.y = 1; b.x = -1; b.y = 2; st.n = 2; pick.set(2); draw(); },
      steps: function () {
        const r = rk();
        return [
          'Dimension of a space means the number of vectors in a basis for it, not the length of the columns.',
          'Right now the span is ' + (r === 2 ? 'the whole plane' : r === 1 ? 'a line' : 'a single point') + ', so dim V = ' + r + '.',
          'Every vector on show still has 2 components. That number has not changed.',
          'Set the count to 1, or drag the two vectors parallel, and watch dim drop to 1 while the components stay at 2.',
          'A line inside R² is a 1-dimensional space made of 2-component vectors. Those are different counts and both are called dimension.'
        ];
      }
    };
  });

  /* ============ B - basis ============ */
  W.register('basis', function () {
    const pl = W.Plane(560, 380, 40);
    const b1 = { x: 2, y: 1 }, b2 = { x: -1, y: 2 }, t = { x: 3, y: 4 };
    function draw() {
      pl.clear();
      const det = b1.x * b2.y - b2.x * b1.y;
      if (Math.abs(det) > EPS) {
        for (let i = -6; i <= 6; i++) {
          pl.seg(i * b1.x - 6 * b2.x, i * b1.y - 6 * b2.y, i * b1.x + 6 * b2.x, i * b1.y + 6 * b2.y, 'rgba(20,20,15,.13)', null, 1);
          pl.seg(i * b2.x - 6 * b1.x, i * b2.y - 6 * b1.y, i * b2.x + 6 * b1.x, i * b2.y + 6 * b1.y, 'rgba(20,20,15,.13)', null, 1);
        }
      }
      pl.vec(b1.x, b1.y, INK, 'b₁', { width: 3 });
      pl.vec(b2.x, b2.y, OX, 'b₂', { width: 3 });
      pl.dot(t.x, t.y, INK, 6); pl.text(t.x, t.y, 't', INK);
      pl.handle(b1.x, b1.y, INK); pl.handle(b2.x, b2.y, OX);
      let body;
      if (Math.abs(det) < EPS) {
        body = 'det = 0  →  b₁ and b₂ are parallel.\nThey are NOT a basis: they span only a line,\nso most targets cannot be written at all.';
      } else {
        const c1 = (t.x * b2.y - b2.x * t.y) / det;
        const c2 = (b1.x * t.y - t.x * b1.y) / det;
        const rx = c1 * b1.x + c2 * b2.x, ry = c1 * b1.y + c2 * b2.y;
        body =
          'det = (' + b1.x + '×' + b2.y + ') − (' + b2.x + '×' + b1.y + ') = ' + det + '  ≠ 0\n' +
          '→  b₁, b₂ are independent and span R²  →  a basis\n\n' +
          'coordinates of t in this basis\n' +
          '  c₁ = ' + f(c1, 4) + '\n' +
          '  c₂ = ' + f(c2, 4) + '\n\n' +
          'check   ' + f(c1, 3) + '·[' + b1.x + ', ' + b1.y + '] + ' + f(c2, 3) + '·[' + b2.x + ', ' + b2.y + ']\n' +
          '      = [' + f(rx, 3) + ', ' + f(ry, 3) + ']   ✓ that is t\n\n' +
          'the faint lattice is every integer combination\nof b₁ and b₂, the coordinate grid this basis builds';
      }
      W.read('b₁ = [' + b1.x + ', ' + b1.y + ']   b₂ = [' + b2.x + ', ' + b2.y + ']   t = [' + t.x + ', ' + t.y + ']\n\n' + body);
    }
    W.attachDrag(pl, () => [b1, b2, t], function (i, x, y) {
      const o = [b1, b2, t][i]; o.x = x; o.y = y; draw();
    }, { bx: 6, by: 4 });
    return {
      cv: pl.cv, draw: draw,
      reset: function () { b1.x = 2; b1.y = 1; b2.x = -1; b2.y = 2; t.x = 3; t.y = 4; draw(); },
      steps: function () {
        const det = b1.x * b2.y - b2.x * b1.y;
        if (Math.abs(det) < EPS) return [
          'A basis must span the space and be independent.',
          'You have made b₁ and b₂ parallel, so det = 0.',
          'They span only a line, which means most targets cannot be reached at all.',
          'That fails the spanning half of the definition.',
          'Drag one of them off the line to restore a basis.'
        ];
        const c1 = (t.x * b2.y - b2.x * t.y) / det, c2 = (b1.x * t.y - t.x * b1.y) / det;
        return [
          'b₁ and b₂ are independent (det = ' + det + '), so they form a basis of R².',
          'A basis is a coordinate system. The faint lattice is the grid it builds.',
          'Every point has exactly one address in it. For t the address is c₁ = ' + f(c1, 4) + ', c₂ = ' + f(c2, 4) + '.',
          'That means t = ' + f(c1, 3) + '·b₁ + ' + f(c2, 3) + '·b₂, which the check line confirms.',
          'Uniqueness is what independence buys you. Drag b₁ and b₂ and the whole coordinate grid tilts with them.'
        ];
      }
    };
  });

  /* ============ I - independence ============ */
  W.register('independence', function () {
    const pl = W.Plane(560, 380, 44);
    const a = { x: 2, y: 1 }, b = { x: -1, y: 2 };
    function draw() {
      pl.clear();
      const det = a.x * b.y - b.x * a.y;
      if (Math.abs(det) < EPS) { const d = (a.x || a.y) ? a : b; pl.line(d.x, d.y, 'rgba(140,58,30,.32)', 10); }
      else pl.shape([[-9, -9], [9, -9], [9, 9], [-9, 9]], 'rgba(140,58,30,.08)', null);
      pl.vec(a.x, a.y, INK, 'a');
      pl.vec(b.x, b.y, OX, 'b');
      pl.handle(a.x, a.y, INK); pl.handle(b.x, b.y, OX);
      let extra = '';
      if (Math.abs(det) < EPS && (a.x || a.y)) {
        const k = a.x ? b.x / a.x : b.y / a.y;
        extra = '\nb = ' + f(k, 3) + '·a, b is redundant, it adds nothing new\n';
      }
      W.read(
        'a = [' + a.x + ', ' + a.y + ']     b = [' + b.x + ', ' + b.y + ']\n\n' +
        'det[a b] = (' + a.x + '×' + b.y + ') − (' + b.x + '×' + a.y + ')\n' +
        '         = ' + (a.x * b.y) + ' − ' + (b.x * a.y) + '\n' +
        '         = ' + det + '\n\n' +
        (Math.abs(det) > EPS
          ? '→ INDEPENDENT\n  neither is a multiple of the other\n  together they span the whole plane'
          : '→ DEPENDENT' + extra + '  together they span only a line') + '\n\n' +
        'the test: two vectors in R² are dependent\nexactly when the determinant is zero'
      );
    }
    W.attachDrag(pl, () => [a, b], function (i, x, y) { const t = i === 0 ? a : b; t.x = x; t.y = y; draw(); });
    return {
      cv: pl.cv, draw: draw,
      reset: function () { a.x = 2; a.y = 1; b.x = -1; b.y = 2; draw(); },
      steps: function () {
        const det = a.x * b.y - b.x * a.y;
        return [
          'Independent means no vector in the set can be built from the others. Nothing is redundant.',
          'For two vectors in R² the test is one determinant: ad − bc = ' + det + '.',
          Math.abs(det) > EPS
            ? 'It is not zero, so a and b are independent and their span is the whole shaded plane.'
            : 'It is zero, so they are dependent. One is a multiple of the other and the span has collapsed to the red line.',
          'Drag b onto the line through a and watch the determinant fall to zero.',
          'More than n vectors in Rⁿ are always dependent, there simply is not room for a third independent direction in a plane.'
        ];
      }
    };
  });

  /* ============ R - the relationship ============ */
  W.register('relationship', function () {
    const pl = W.Plane(560, 380, 44);
    const vs = [{ x: 2, y: 1 }, { x: -1, y: 2 }, { x: 1, y: 3 }];
    const st = { n: 2 };
    let pick;
    function setRank() {
      const use = vs.slice(0, st.n);
      const nz = use.filter(v => v.x || v.y);
      if (!nz.length) return 0;
      for (let i = 0; i < nz.length; i++) for (let j = i + 1; j < nz.length; j++)
        if (Math.abs(nz[i].x * nz[j].y - nz[j].x * nz[i].y) > EPS) return 2;
      return 1;
    }
    function draw() {
      pl.clear();
      const r = setRank();
      if (r === 2) pl.shape([[-9, -9], [9, -9], [9, 9], [-9, 9]], 'rgba(140,58,30,.08)', null);
      else if (r === 1) { const d = vs.slice(0, st.n).find(v => v.x || v.y); if (d) pl.line(d.x, d.y, 'rgba(140,58,30,.3)', 10); }
      const cols = [INK, OX, '#4A5A2E'];
      for (let i = 0; i < st.n; i++) { pl.vec(vs[i].x, vs[i].y, cols[i], 'v' + '₁₂₃'[i]); pl.handle(vs[i].x, vs[i].y, cols[i]); }
      const indep = r === st.n, spans = r === 2, basis = indep && spans;
      W.read(
        'vectors in the set : ' + st.n + '\n' +
        'rank of the set    : ' + r + '   (independent directions)\n\n' +
        'independent ?   ' + (indep ? 'YES' : 'NO, ' + (st.n > 2 ? 'more than 2 vectors in R² never can be' : 'they are parallel')) + '\n' +
        'spans R² ?      ' + (spans ? 'YES' : 'NO, the span is ' + (r === 1 ? 'a line' : 'a point')) + '\n' +
        'dim of span     ' + r + '\n' +
        'basis of R² ?   ' + (basis ? 'YES' : 'NO, ' + (!spans ? 'too few directions' : 'redundant, too many vectors')) + '\n\n' +
        'COUNTING IN R^n  (n = 2 here)\n' +
        '  fewer than n vectors  → can never span\n' +
        '  more than n vectors   → must be dependent\n' +
        '  exactly n vectors     → independent ⇔ spans ⇔ basis\n' +
        '                          ⇔ means "exactly when"'
      );
    }
    W.attachDrag(pl, () => vs.slice(0, st.n), function (i, x, y) { vs[i].x = x; vs[i].y = y; draw(); });
    pick = W.ui.pick('vectors', [{ v: 1, t: '1' }, { v: 2, t: '2' }, { v: 3, t: '3' }], 2, v => { st.n = +v; draw(); });
    return {
      cv: pl.cv, extra: W.ui.bar(pick.el, W.ui.note('1 = too few · 2 = just right · 3 = too many')),
      draw: draw,
      reset: function () { vs[0] = { x: 2, y: 1 }; vs[1] = { x: -1, y: 2 }; vs[2] = { x: 1, y: 3 }; st.n = 2; pick.set(2); draw(); },
      steps: function () {
        const r = setRank();
        return [
          'Span, independence, basis and dimension are one idea from four angles. Change the count and watch all four move together.',
          'You have ' + st.n + ' vector' + (st.n > 1 ? 's' : '') + ' with rank ' + r + '. That is how many genuinely different directions they carry.',
          st.n < 2 ? 'One vector can never span R². Too few directions, so it cannot be a basis however you drag it.'
            : st.n > 2 ? 'Three vectors in R² are always dependent. There is no room for a third independent direction in a plane.'
              : r === 2 ? 'Two independent vectors in R²: they span, so they are a basis. Exactly the dimension, exactly right.'
                : 'Two parallel vectors: rank 1. They span only a line, so they are not a basis.',
          'A basis has to hit the dimension exactly, too few cannot span, too many cannot stay independent.',
          'That is the basis theorem: in a space of dimension m, any m independent vectors are automatically a basis, and so are any m that span.'
        ];
      }
    };
  });

  /* ============ MA - matrix add / subtract ============ */
  W.register('matadd', function () {
    const st = { ar: 2, ac: 2, br: 2, bc: 2, op: '+', A: [1, 2, 3, 4], B: [5, 6, 7, 8] };
    let uiA, uiB, bar = W.ui.bar();
    function fit(arr, n) { while (arr.length < n) arr.push(0); arr.length = n; }
    function draw() {
      const ok = st.ar === st.br && st.ac === st.bc;
      if (!ok) {
        W.read(
          'A is ' + st.ar + ' × ' + st.ac + '\n' +
          'B is ' + st.br + ' × ' + st.bc + '\n\n' +
          'A ' + st.op + ' B is UNDEFINED\n\n' +
          'Entry-by-entry addition needs an entry in B\n' +
          'sitting opposite every entry in A. Different\n' +
          'shapes leave entries with no partner.\n\n' +
          'Exactly the rule from vector addition, you\n' +
          'cannot add a 2D and a 3D vector either.'
        );
        return;
      }
      const R = st.A.map((v, i) => st.op === '+' ? v + st.B[i] : v - st.B[i]);
      const workBlock = [];
      for (let r = 0; r < st.ar; r++) {
        const row = [];
        for (let c = 0; c < st.ac; c++) {
          const i = r * st.ac + c;
          row.push(st.A[i] + (st.op === '+' ? '+' : '−') + (st.B[i] < 0 ? '(' + st.B[i] + ')' : st.B[i]));
        }
        workBlock.push('[' + row.map(s => W.pad(s, 5)).join(' ') + ']');
      }
      W.read(
        'A is ' + st.ar + ' × ' + st.ac + '     B is ' + st.br + ' × ' + st.bc + '     sizes match ✓\n\n' +
        W.sideBySide([blockOf(st.A, st.ar, st.ac), [st.op], blockOf(st.B, st.br, st.bc), ['=']], 2) + '\n\n' +
        W.sideBySide([workBlock, ['='], blockOf(R, st.ar, st.ac)], 2) + '\n\n' +
        '(A ' + st.op + ' B)ⱼ,ₖ = aⱼ,ₖ ' + st.op + ' bⱼ,ₖ, position by position'
      );
    }
    function rebuild() {
      fit(st.A, st.ar * st.ac); fit(st.B, st.br * st.bc);
      bar.innerHTML = '';
      const pa = W.ui.pick('A', [{ v: '2x2', t: '2×2' }, { v: '2x3', t: '2×3' }, { v: '3x2', t: '3×2' }],
        st.ar + 'x' + st.ac, v => { st.ar = +v[0]; st.ac = +v[2]; rebuild(); });
      const pb = W.ui.pick('B', [{ v: '2x2', t: '2×2' }, { v: '2x3', t: '2×3' }, { v: '3x2', t: '3×2' }],
        st.br + 'x' + st.bc, v => { st.br = +v[0]; st.bc = +v[2]; rebuild(); });
      const po = W.ui.pick('op', [{ v: '+', t: '+' }, { v: '−', t: '−' }], st.op, v => { st.op = v; draw(); });
      uiA = W.ui.mat(st.ar, st.ac, st.A, draw, 40);
      uiB = W.ui.mat(st.br, st.bc, st.B, draw, 40);
      bar.appendChild(pa.el); bar.appendChild(uiA.el);
      bar.appendChild(po.el);
      bar.appendChild(pb.el); bar.appendChild(uiB.el);
      draw();
    }
    rebuild();
    return {
      extra: bar, draw: draw,
      reset: function () { st.ar = st.ac = st.br = st.bc = 2; st.op = '+'; st.A = [1, 2, 3, 4]; st.B = [5, 6, 7, 8]; rebuild(); },
      steps: function () {
        const ok = st.ar === st.br && st.ac === st.bc;
        return [
          'Matrix addition works entry by entry, the same rule you already wrote for vectors.',
          ok ? 'A and B are both ' + st.ar + ' × ' + st.ac + ', so every entry has a partner.'
            : 'A is ' + st.ar + ' × ' + st.ac + ' and B is ' + st.br + ' × ' + st.bc + '. No partner for most entries, so the sum does not exist.',
          '(A ' + st.op + ' B)ⱼ,ₖ = aⱼ,ₖ ' + st.op + ' bⱼ,ₖ. Nothing is mixed across positions.',
          'Change either size picker to break the match and watch the operation become undefined.',
          'Because addition and scaling both work this way, the set of all m × n matrices is itself a vector space.'
        ];
      }
    };
  });

  /* ============ MK - scalar x matrix ============ */
  W.register('matscale', function () {
    const st = { k: 3, A: [1, 2, 3, 4, 5, 6] };
    let sl, uiA;
    function draw() {
      const R = st.A.map(v => v * st.k);
      const work = [];
      for (let r = 0; r < 2; r++) {
        const row = [];
        for (let c = 0; c < 3; c++) row.push(f(st.k) + '×' + st.A[r * 3 + c]);
        work.push('[' + row.map(s => W.pad(s, 6)).join(' ') + ']');
      }
      W.read(
        'k = ' + f(st.k) + '\n\n' +
        W.sideBySide([[f(st.k)], blockOf(st.A, 2, 3), ['='], work, ['='], blockOf(R, 2, 3)], 2) + '\n\n' +
        'kA multiplies every entry by k. Size is unchanged:\n' +
        'a 2 × 3 matrix stays 2 × 3 whatever k is.\n\n' +
        (st.k === 0 ? 'k = 0 gives the zero matrix, the additive identity.'
          : st.k < 0 ? 'k is negative, so every entry flips sign.'
            : 'Unlike matrix multiplication, there is no size rule to satisfy here.')
      );
    }
    sl = W.ui.slider('k', -3, 3, 0.5, 3, v => { st.k = v; draw(); });
    uiA = W.ui.mat(2, 3, st.A, draw, 40);
    return {
      extra: W.ui.bar(W.ui.label('A ='), uiA.el, sl.el), draw: draw,
      reset: function () { st.k = 3; st.A.splice(0, 6, 1, 2, 3, 4, 5, 6); uiA.sync(); sl.set(3); draw(); },
      steps: () => [
        'Multiply every entry by k = ' + f(st.k) + '. No entry is treated differently.',
        'The middle block shows each multiplication before it is worked out.',
        'The size never changes, a 2 × 3 matrix scales to a 2 × 3 matrix.',
        'Compare with scalar × vector: it is the identical rule applied to a grid instead of a column.',
        'Addition and scaling both behaving entry-wise is exactly what makes the set of m × n matrices a vector space.'
      ]
    };
  });

  /* ============ TR - transpose ============ */
  W.register('transpose', function () {
    const pl = W.Plane(560, 300, 40, { ox: 30, oy: 30 });
    const st = { r: 2, c: 3, v: [1, 2, 3, 4, 5, 6], sr: 0, sc: 2 };
    const CW = 46, CH = 40;
    let bar = W.ui.bar(), uiA;
    function rectA(i, j) { return { x: 60 + j * CW, y: 74 + i * CH, w: CW - 6, h: CH - 6 }; }
    function rectT(i, j) { return { x: 330 + j * CH, y: 74 + i * CW, w: CH - 6, h: CW - 6 }; }
    function draw() {
      const c = pl.ctx;
      pl.clear({ noGrid: true });
      c.font = '12px ' + W.MONO; c.textAlign = 'left'; c.fillStyle = MUTE;
      c.fillText('A  (' + st.r + ' × ' + st.c + ')', 60, 58);
      c.fillText('Aᵀ  (' + st.c + ' × ' + st.r + ')', 330, 58);
      c.textAlign = 'center'; c.textBaseline = 'middle';
      for (let i = 0; i < st.r; i++) for (let j = 0; j < st.c; j++) {
        const on = (i === st.sr && j === st.sc);
        [[rectA(i, j), st.v[i * st.c + j]], [rectT(j, i), st.v[i * st.c + j]]].forEach(function (pair, k) {
          const R = pair[0];
          c.fillStyle = on ? (k ? OX : INK) : W.GROUND;
          c.fillRect(R.x, R.y, R.w, R.h);
          c.strokeStyle = INK; c.lineWidth = on ? 2 : 1;
          c.strokeRect(R.x + .5, R.y + .5, R.w, R.h);
          c.fillStyle = on ? W.GROUND : INK; c.font = '13px ' + W.MONO;
          c.fillText(String(pair[1]), R.x + R.w / 2, R.y + R.h / 2);
        });
      }
      const A = rectA(st.sr, st.sc), T = rectT(st.sc, st.sr);
      c.strokeStyle = OX; c.lineWidth = 1.6; c.setLineDash([4, 3]);
      c.beginPath();
      c.moveTo(A.x + A.w, A.y + A.h / 2);
      c.bezierCurveTo(A.x + A.w + 60, A.y + A.h / 2, T.x - 60, T.y + T.h / 2, T.x, T.y + T.h / 2);
      c.stroke(); c.setLineDash([]);
      paint();
    }
    function paint() {
      W.read(
        W.sideBySide([blockOf(st.v, st.r, st.c), ['ᵀ  ='], blockOf(transposed(), st.c, st.r)], 2) + '\n\n' +
        '(Aᵀ)ⱼ,ₖ = Aₖ,ⱼ, the indices swap\n\n' +
        'selected  a(' + (st.sr + 1) + ',' + (st.sc + 1) + ') = ' + st.v[st.sr * st.c + st.sc] + '\n' +
        'lands at  aᵀ(' + (st.sc + 1) + ',' + (st.sr + 1) + ') = ' + st.v[st.sr * st.c + st.sc] + '\n\n' +
        'size  ' + st.r + ' × ' + st.c + '  →  ' + st.c + ' × ' + st.r + '\n' +
        (st.r === st.c ? 'square, so the size is unchanged' : 'not square, so the size changes') + '\n' +
        '(Aᵀ)ᵀ = A, transposing twice returns the original'
      );
    }
    function transposed() {
      const out = [];
      for (let j = 0; j < st.c; j++) for (let i = 0; i < st.r; i++) out.push(st.v[i * st.c + j]);
      return out;
    }
    pl.cv.addEventListener('pointerdown', function (e) {
      const r = pl.cv.getBoundingClientRect(), px = e.clientX - r.left, py = e.clientY - r.top;
      for (let i = 0; i < st.r; i++) for (let j = 0; j < st.c; j++) {
        const R = rectA(i, j);
        if (px >= R.x && px <= R.x + R.w && py >= R.y && py <= R.y + R.h) { st.sr = i; st.sc = j; draw(); }
      }
    });
    function rebuild() {
      bar.innerHTML = '';
      const p = W.ui.pick('A', [{ v: '2x3', t: '2×3' }, { v: '3x2', t: '3×2' }, { v: '2x2', t: '2×2' }, { v: '3x3', t: '3×3' }],
        st.r + 'x' + st.c, function (v) {
          const nr = +v[0], nc = +v[2], nv = [];
          for (let i = 0; i < nr * nc; i++) nv.push(i + 1);
          st.r = nr; st.c = nc; st.v = nv; st.sr = 0; st.sc = Math.min(st.sc, nc - 1); rebuild();
        });
      uiA = W.ui.mat(st.r, st.c, st.v, draw, 40);
      bar.appendChild(p.el); bar.appendChild(uiA.el);
      bar.appendChild(W.ui.note('click a cell in A to trace where it lands'));
      draw();
    }
    rebuild();
    return {
      cv: pl.cv, extra: bar, draw: draw,
      reset: function () { st.r = 2; st.c = 3; st.v = [1, 2, 3, 4, 5, 6]; st.sr = 0; st.sc = 2; rebuild(); },
      steps: () => [
        'Transposing turns the rows of A into the columns of Aᵀ.',
        'The selected entry a(' + (st.sr + 1) + ',' + (st.sc + 1) + ') travels along the dashed curve to position (' + (st.sc + 1) + ',' + (st.sr + 1) + ').',
        'The rule is just an index swap: (Aᵀ)ⱼ,ₖ = Aₖ,ⱼ.',
        'The size flips too: ' + st.r + ' × ' + st.c + ' becomes ' + st.c + ' × ' + st.r + '.',
        'This is the operation that makes QKᵀ work in attention, without it the inner dimensions never line up.'
      ]
    };
  });

  /* ============ MV - matrix x vector ============ */
  W.register('matvec', function () {
    const pl = W.Plane(560, 380, 44);
    /* x must not start on top of a column of A, or the two arrows and their
       labels land in the same place. Column 1 here is (2, 1). */
    const A = [2, 1, 1, 2], x = { x: 2, y: -1 };
    let uiA;
    function ax() { return { x: A[0] * x.x + A[1] * x.y, y: A[2] * x.x + A[3] * x.y }; }
    function draw() {
      pl.clear();
      const det = A[0] * A[3] - A[1] * A[2];
      if (Math.abs(det) < EPS) {
        const cx = A[0] || A[1], cy = A[2] || A[3];
        if (cx || cy) pl.line(cx, cy, 'rgba(140,58,30,.3)', 9);
      }
      pl.vec(A[0], A[2], 'rgba(20,20,15,.4)', 'col1', { dash: [5, 4], width: 1.6 });
      pl.vec(A[1], A[3], 'rgba(20,20,15,.4)', 'col2', { dash: [5, 4], width: 1.6 });
      const o = ax();
      pl.vec(o.x, o.y, OX, 'Ax', { width: 3 });
      pl.vec(x.x, x.y, INK, 'x');
      pl.handle(x.x, x.y, INK);
      const det2 = A[0] * A[3] - A[1] * A[2];
      W.read(
        W.sideBySide([['A ='], blockOf(A, 2, 2), ['   x ='], W.colBlock([x.x, x.y])], 2) + '\n\n' +
        'ROW VIEW, each entry is one dot product\n' +
        '  row1·x = (' + A[0] + '×' + x.x + ') + (' + A[1] + '×' + x.y + ') = ' + o.x + '\n' +
        '  row2·x = (' + A[2] + '×' + x.x + ') + (' + A[3] + '×' + x.y + ') = ' + o.y + '\n\n' +
        'COLUMN VIEW, a linear combination of the columns\n' +
        W.sideBySide([['  ' + x.x], W.colBlock([A[0], A[2]]), ['+ ' + x.y], W.colBlock([A[1], A[3]]),
          ['='], W.colBlock([o.x, o.y])], 1) + '\n\n' +
        'Ax = [' + o.x + ', ' + o.y + ']\n' +
        'det A = ' + det2 + (Math.abs(det2) < EPS
          ? '   →  rank 1: every output lands on one line'
          : '   →  rank 2: outputs fill the plane')
      );
    }
    W.attachDrag(pl, () => [x], function (i, gx, gy) { x.x = gx; x.y = gy; draw(); });
    uiA = W.ui.mat(2, 2, A, draw, 44);
    const bar = W.ui.bar(W.ui.label('A ='), uiA.el,
      W.ui.buttons([{ label: 'flatten it', fn: () => { A[0] = 1; A[1] = 2; A[2] = 2; A[3] = 4; uiA.sync(); draw(); } }]),
      W.ui.note('drag x'));
    return {
      cv: pl.cv, extra: bar, draw: draw,
      reset: function () { A[0] = 2; A[1] = 1; A[2] = 1; A[3] = 2; x.x = 2; x.y = -1; uiA.sync(); draw(); },
      steps: function () {
        const o = ax(), det = A[0] * A[3] - A[1] * A[2];
        return [
          'Row 1 of A dotted with x: (' + A[0] + '×' + x.x + ') + (' + A[1] + '×' + x.y + ') = ' + o.x + '.',
          'Row 2 of A dotted with x: (' + A[2] + '×' + x.x + ') + (' + A[3] + '×' + x.y + ') = ' + o.y + '.',
          'That is Ax = [' + o.x + ', ' + o.y + ']. Each entry is one dot product.',
          'The other reading: ' + x.x + ' lots of column 1 plus ' + x.y + ' lots of column 2. Ax is a linear combination of the columns.',
          Math.abs(det) < EPS
            ? 'det A = 0. The columns are dependent, so every possible output lies on the shaded line. That is rank 1.'
            : 'det A = ' + det + '. The columns are independent, so outputs fill the plane, rank 2. Press "flatten it" to collapse them.'
        ];
      }
    };
  });

  /* ============ VM - vector x matrix ============ */
  W.register('vecmat', function () {
    const st = { x: [1, 2], A: [1, 2, 3, 4, 5, 6] };
    let uiX, uiA;
    function draw() {
      const out = [];
      for (let c = 0; c < 3; c++) out.push(st.x[0] * st.A[c] + st.x[1] * st.A[3 + c]);
      W.read(
        W.sideBySide([['x ='], ['[' + st.x.map(v => W.pad(v, 2)).join(' ') + ']'], ['   A ='], blockOf(st.A, 2, 3)], 2) + '\n\n' +
        'SIZES   (1 × 2)(2 × 3) = 1 × 3\n' +
        '         inner 2s match and vanish\n\n' +
        'ENTRY VIEW, x dotted with each column\n' +
        '  col1: (' + st.x[0] + '×' + st.A[0] + ') + (' + st.x[1] + '×' + st.A[3] + ') = ' + out[0] + '\n' +
        '  col2: (' + st.x[0] + '×' + st.A[1] + ') + (' + st.x[1] + '×' + st.A[4] + ') = ' + out[1] + '\n' +
        '  col3: (' + st.x[0] + '×' + st.A[2] + ') + (' + st.x[1] + '×' + st.A[5] + ') = ' + out[2] + '\n\n' +
        'ROW VIEW, a combination of A’s rows\n' +
        '  ' + st.x[0] + '·[' + st.A.slice(0, 3).join(' ') + '] + ' + st.x[1] + '·[' + st.A.slice(3, 6).join(' ') + ']\n' +
        '  = [' + out.join(' ') + ']\n\n' +
        'xA = [' + out.join(' ') + ']\n\n' +
        'column vector on the RIGHT → combines columns\n' +
        'row vector on the LEFT     → combines rows'
      );
    }
    uiX = W.ui.mat(1, 2, st.x, draw, 44);
    uiA = W.ui.mat(2, 3, st.A, draw, 44);
    return {
      extra: W.ui.bar(W.ui.label('x ='), uiX.el, W.ui.label('A ='), uiA.el), draw: draw,
      reset: function () { st.x.splice(0, 2, 1, 2); st.A.splice(0, 6, 1, 2, 3, 4, 5, 6); uiX.sync(); uiA.sync(); draw(); },
      steps: function () {
        const out = [];
        for (let c = 0; c < 3; c++) out.push(st.x[0] * st.A[c] + st.x[1] * st.A[3 + c]);
        return [
          'A row vector goes on the left. Sizes: (1 × 2)(2 × 3) = 1 × 3.',
          'Each output entry is x dotted with one column of A. Column 1 gives ' + out[0] + '.',
          'Repeat for the other columns: ' + out[1] + ' and ' + out[2] + '.',
          'The other reading: the answer is ' + st.x[0] + ' lots of row 1 plus ' + st.x[1] + ' lots of row 2.',
          'That is the mirror of matrix × vector. On the right you combine columns; on the left you combine rows.'
        ];
      }
    };
  });

  /* ============ MM - matrix x matrix ============ */
  W.register('matmat', function () {
    const st = { A: [1, 2, 3, 4], B: [5, 6, 7, 8], sr: 0, sc: 0 };
    let uiA, uiB;
    function mul(X, Y) {
      const R = [];
      for (let r = 0; r < 2; r++) for (let c = 0; c < 2; c++)
        R.push(X[r * 2] * Y[c] + X[r * 2 + 1] * Y[2 + c]);
      return R;
    }
    function draw() {
      const AB = mul(st.A, st.B), BA = mul(st.B, st.A);
      const r = st.sr, c = st.sc;
      const same = AB.every((v, i) => Math.abs(v - BA[i]) < EPS);
      W.read(
        W.sideBySide([['A ='], blockOf(st.A, 2, 2), ['   B ='], blockOf(st.B, 2, 2)], 2) + '\n\n' +
        'RULE  (AB)ⱼ,ₖ = (row j of A) · (column k of B)\n\n' +
        'entry (' + (r + 1) + ',' + (c + 1) + ') of AB\n' +
        '  row ' + (r + 1) + ' of A = [' + st.A[r * 2] + ' ' + st.A[r * 2 + 1] + ']\n' +
        '  col ' + (c + 1) + ' of B = [' + st.B[c] + ' ' + st.B[2 + c] + ']ᵀ\n' +
        '  = (' + st.A[r * 2] + '×' + st.B[c] + ') + (' + st.A[r * 2 + 1] + '×' + st.B[2 + c] + ')' +
        ' = ' + AB[r * 2 + c] + '\n\n' +
        W.sideBySide([['AB ='], blockOf(AB, 2, 2), ['   BA ='], blockOf(BA, 2, 2)], 2) + '\n\n' +
        (same ? 'AB = BA here, you found a commuting pair, which is rare'
          : 'AB ≠ BA, matrix multiplication is not commutative') + '\n\n' +
        'SIZE RULE  (m × n)(n × r) = (m × r)\n' +
        '  inner numbers must match, then vanish\n' +
        '  outer numbers survive\n' +
        '  a 2×3 times a 3×2 gives 2×2, but reversed gives 3×3'
      );
    }
    const pickE = W.ui.pick('entry of AB', [
      { v: '00', t: '(1,1)' }, { v: '01', t: '(1,2)' }, { v: '10', t: '(2,1)' }, { v: '11', t: '(2,2)' }
    ], '00', v => { st.sr = +v[0]; st.sc = +v[1]; draw(); });
    uiA = W.ui.mat(2, 2, st.A, draw, 44);
    uiB = W.ui.mat(2, 2, st.B, draw, 44);
    return {
      extra: W.ui.bar(W.ui.label('A ='), uiA.el, W.ui.label('B ='), uiB.el, pickE.el), draw: draw,
      reset: function () { st.A.splice(0, 4, 1, 2, 3, 4); st.B.splice(0, 4, 5, 6, 7, 8); st.sr = 0; st.sc = 0; uiA.sync(); uiB.sync(); pickE.set('00'); draw(); },
      steps: function () {
        const AB = mul(st.A, st.B), BA = mul(st.B, st.A), r = st.sr, c = st.sc;
        return [
          'Every entry of AB is one dot product: row j of A against column k of B.',
          'For entry (' + (r + 1) + ',' + (c + 1) + '): (' + st.A[r * 2] + '×' + st.B[c] + ') + (' + st.A[r * 2 + 1] + '×' + st.B[2 + c] + ') = ' + AB[r * 2 + c] + '.',
          'Do that four times and you have AB = [' + AB.join(', ') + '].',
          'Now compare BA = [' + BA.join(', ') + ']. ' +
            (AB.every((v, i) => Math.abs(v - BA[i]) < EPS) ? 'These happen to agree, unusual.' : 'Different. AB ≠ BA.'),
          'Order encodes time: in AB the transformation B happens first and A second. Read the product right to left.'
        ];
      }
    };
  });

  /* ============ X - geometric meaning ============ */
  W.register('transform', function () {
    const pl = W.Plane(560, 380, 64);
    const A = [1, 1, 0, 1];
    let uiA;
    function ap(x, y) { return { x: A[0] * x + A[1] * y, y: A[2] * x + A[3] * y }; }
    function draw() {
      pl.clear();
      pl.shape([[0, 0], [1, 0], [1, 1], [0, 1]], 'rgba(20,20,15,.10)', 'rgba(20,20,15,.45)');
      const p10 = ap(1, 0), p11 = ap(1, 1), p01 = ap(0, 1);
      pl.shape([[0, 0], [p10.x, p10.y], [p11.x, p11.y], [p01.x, p01.y]], 'rgba(140,58,30,.16)', OX);
      /* Both basis labels sit next to an axis tick number, so push them far
         enough along the axis to read as separate words. */
      pl.vec(1, 0, 'rgba(20,20,15,.45)', 'e₁', { width: 1.8, labOff: [11, 16] });
      pl.vec(0, 1, 'rgba(20,20,15,.45)', 'e₂', { width: 1.8, labOff: [-34, -4] });
      pl.vec(p10.x, p10.y, INK, 'Ae₁', { width: 3, labOff: [10, -6] });
      pl.vec(p01.x, p01.y, OX, 'Ae₂', { width: 3, labOff: [10, -6] });
      const det = A[0] * A[3] - A[1] * A[2];
      W.read(
        W.sideBySide([['A ='], blockOf(A, 2, 2)], 2) + '\n\n' +
        'Ae₁ = [' + f(A[0]) + ', ' + f(A[2]) + ']   ← column 1 of A\n' +
        'Ae₂ = [' + f(A[1]) + ', ' + f(A[3]) + ']   ← column 2 of A\n\n' +
        'THE COLUMNS ARE WHERE THE BASIS VECTORS LAND.\n' +
        'To build any transformation, decide where e₁ and\n' +
        'e₂ should go and write those down as the columns.\n\n' +
        'det A = (' + f(A[0]) + '×' + f(A[3]) + ') − (' + f(A[1]) + '×' + f(A[2]) + ') = ' + f(det) + '\n' +
        'the grey unit square has area 1\n' +
        'the red image has area |det| = ' + f(Math.abs(det)) + '\n' +
        (Math.abs(det) < EPS ? '→ area zero: the square is crushed onto a line'
          : det < 0 ? '→ negative det: the plane has been flipped over'
            : '→ area scaled by ' + f(Math.abs(det)))
      );
    }
    uiA = W.ui.mat(2, 2, A, draw, 44);
    function setA(v) { A[0] = v[0]; A[1] = v[1]; A[2] = v[2]; A[3] = v[3]; uiA.sync(); draw(); }
    const bar = W.ui.bar(W.ui.label('A ='), uiA.el, W.ui.buttons([
      { label: 'identity', fn: () => setA([1, 0, 0, 1]) },
      { label: 'rotate 90°', fn: () => setA([0, -1, 1, 0]) },
      { label: 'reflect y', fn: () => setA([-1, 0, 0, 1]) },
      { label: 'scale ×2', fn: () => setA([2, 0, 0, 2]) },
      { label: 'shear', fn: () => setA([1, 1, 0, 1]) },
      { label: 'collapse', fn: () => setA([1, 2, 2, 4]) }
    ]));
    return {
      cv: pl.cv, extra: bar, draw: draw,
      reset: function () { setA([1, 1, 0, 1]); },
      steps: function () {
        const det = A[0] * A[3] - A[1] * A[2];
        return [
          'A matrix is a function. Feed it e₁ = [1,0] and you get back column 1 of A: [' + f(A[0]) + ', ' + f(A[2]) + '].',
          'Feed it e₂ = [0,1] and you get column 2: [' + f(A[1]) + ', ' + f(A[3]) + '].',
          'So the columns of A are literally where the basis vectors land. Everything else follows by linearity.',
          'The grey unit square maps to the red parallelogram, and its area is |det A| = ' + f(Math.abs(det)) + '.',
          Math.abs(det) < EPS
            ? 'det is zero here, the square has been crushed flat onto a line, and that collapse cannot be undone.'
            : 'Press "collapse" to set det to zero and watch the whole square flatten onto a line.'
        ];
      }
    };
  });

  /* ============ DR - 4D to 3D ============ */
  W.register('reduce', function () {
    const st = { A: [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0], x: [1, 2, 3, 4] };
    let uiA, uiX, msg = '';
    function draw() {
      const y = matVec(st.A, 3, 4, st.x);
      const rk = rank(st.A.slice(), 3, 4);
      const nv = nullVector(st.A.slice(), 3, 4);
      let twin = '';
      if (nv) {
        const x2 = st.x.map((v, i) => v + nv[i]);
        const y2 = matVec(st.A, 3, 4, x2);
        twin = 'A DIFFERENT INPUT, THE SAME OUTPUT\n' +
          '  x′ = [' + x2.map(v => f(v, 3)).join(', ') + ']\n' +
          '  Ax′ = [' + y2.map(v => f(v, 3)).join(', ') + ']   ← identical\n' +
          '  the difference x′ − x = [' + nv.map(v => f(v, 3)).join(', ') + ']\n' +
          '  is crushed to zero. That information is gone.\n';
      }
      const rows = [];
      for (let r = 0; r < 3; r++) {
        const parts = [];
        for (let c = 0; c < 4; c++) parts.push('(' + f(st.A[r * 4 + c]) + '×' + f(st.x[c]) + ')');
        rows.push('  row' + (r + 1) + '·x = ' + parts.join(' + ') + ' = ' + f(y[r]));
      }
      W.read(
        /* Superscript 4 and above collapse into a blob at the 12.5px readout
           size, so the dimension that carries the whole point becomes
           unreadable. The caret form stays legible at any size. */
        'A is 3 × 4, so 4 columns in and 3 rows out\n' +
        'A maps R^4 → R^3\n\n' +
        W.sideBySide([['A ='], blockOf(st.A, 3, 4), ['   x ='], W.colBlock(st.x.map(v => f(v)))], 2) + '\n\n' +
        rows.join('\n') + '\n\n' +
        'Ax = [' + y.map(v => f(v)).join(', ') + ']\n\n' +
        'rank counts the independent directions the output can\n' +
        'reach; nullity counts the directions crushed to zero.\n' +
        'rank A = ' + rk + '     nullity = ' + (4 - rk) + '     rank + nullity = 4  ✓\n\n' +
        twin + (msg ? '\n' + msg : '')
      );
    }
    uiA = W.ui.mat(3, 4, st.A, draw, 40);
    uiX = W.ui.mat(4, 1, st.x, draw, 40);
    const bar = W.ui.bar(W.ui.label('A ='), uiA.el, W.ui.label('x ='), uiX.el,
      W.ui.buttons([{
        label: 'jump to the twin', fn: function () {
          const nv = nullVector(st.A.slice(), 3, 4);
          if (!nv) { msg = 'no twin exists, this A happens to have no null direction'; draw(); return; }
          st.x.forEach((v, i) => st.x[i] = v + nv[i]);
          uiX.sync(); msg = 'moved x by a null direction, the output did not budge'; draw();
        }
      }]));
    return {
      extra: bar, draw: draw,
      reset: function () {
        st.A.splice(0, 12, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0);
        st.x.splice(0, 4, 1, 2, 3, 4); msg = ''; uiA.sync(); uiX.sync(); draw();
      },
      steps: function () {
        const y = matVec(st.A, 3, 4, st.x), rk = rank(st.A.slice(), 3, 4);
        return [
          'To go from R^4 to R^3 you need 4 columns and 3 rows, a 3 × 4 matrix.',
          'Each of the 3 output entries is one row of A dotted with the whole 4-component input.',
          'Ax = [' + y.map(v => f(v)).join(', ') + ']. Four numbers went in, three came out.',
          'rank A = ' + rk + ', so nullity = ' + (4 - rk) + '. At least one whole direction gets crushed to zero.',
          'Press "jump to the twin": x changes but Ax does not. Two different inputs, one output. That is what irreversible means.'
        ];
      }
    };
  });

  /* ============ DI - 4D to 6D ============ */
  W.register('increase', function () {
    const st = {
      A: [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0],
      x: [1, 2, 3, 4]
    };
    let uiA, uiX;
    function draw() {
      const y = matVec(st.A, 6, 4, st.x);
      const rk = rank(st.A.slice(), 6, 4);
      const rows = [];
      for (let r = 0; r < 6; r++) {
        const parts = [];
        for (let c = 0; c < 4; c++) parts.push(f(st.A[r * 4 + c]) + '×' + f(st.x[c]));
        rows.push('  row' + (r + 1) + ' = ' + parts.join(' + ') + ' = ' + f(y[r]));
      }
      W.read(
        'A is 6 × 4, so 4 columns in and 6 rows out\n' +
        'A maps R^4 → R^6\n\n' +
        W.sideBySide([['A ='], blockOf(st.A, 6, 4), ['  x ='], W.colBlock(st.x.map(v => f(v)))], 2) + '\n\n' +
        rows.join('\n') + '\n\n' +
        'Ax = [' + y.map(v => f(v)).join(', ') + ']\n\n' +
        'rank A = ' + rk + '   ≤ 4, because there are only 4 columns\n\n' +
        'THE CEILING\n' +
        '  every output is a linear combination of A’s\n' +
        '  4 columns, so the outputs can only fill a\n' +
        '  ' + rk + '-dimensional slice of the 6-dimensional space.\n' +
        '  ' + (6 - rk) + ' of the 6 directions are never reached.\n\n' +
        'The output lives in R^6 but does not fill it.\n' +
        'Raising dimension cannot create information.'
      );
    }
    uiA = W.ui.mat(6, 4, st.A, draw, 38);
    uiX = W.ui.mat(4, 1, st.x, draw, 40);
    const bar = W.ui.bar(W.ui.label('A ='), uiA.el, W.ui.label('x ='), uiX.el,
      W.ui.note('the last two rows are zero, those directions are unreachable'));
    return {
      extra: bar, draw: draw,
      reset: function () {
        st.A.splice(0, 24, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0);
        st.x.splice(0, 4, 1, 2, 3, 4); uiA.sync(); uiX.sync(); draw();
      },
      steps: function () {
        const y = matVec(st.A, 6, 4, st.x), rk = rank(st.A.slice(), 6, 4);
        return [
          'To go from R^4 to R^6 you need 4 columns and 6 rows, a 6 × 4 matrix.',
          'Ax = [' + y.map(v => f(v)).join(', ') + ']. Six numbers came out of four.',
          'But no information was created. Every output is a linear combination of just 4 columns.',
          'rank A = ' + rk + ', so the outputs only ever fill a ' + rk + '-dimensional slice of R^6.',
          'Edit the bottom rows and you can change which slice, but never how big it is. The ceiling is the column count.'
        ];
      }
    };
  });

})(Widgets);
