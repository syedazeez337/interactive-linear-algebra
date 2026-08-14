/* Playgrounds: rank, projection, eigenvalues, SVD, attention.
   Every number shown is computed from state. Nothing is hardcoded. */
(function (W) {
  'use strict';
  const INK = W.INK, OX = W.OXIDE, MUTE = W.MUTE, FAINT = W.FAINT;
  const f = W.f, EPS = 1e-9;

  function det2(a, b, c, d) { return a * d - b * c; }
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
  function matVec(M, rows, cols, x) {
    const y = [];
    for (let r = 0; r < rows; r++) { let s = 0; for (let c = 0; c < cols; c++) s += M[r * cols + c] * x[c]; y.push(s); }
    return y;
  }
  function rank2(A) { return Math.abs(det2(A[0], A[1], A[2], A[3])) < EPS ? (A.some(v => v) ? 1 : 0) : 2; }

  /* Full 2×2 SVD. Returns singular values plus the left/right singular vectors
     so the geometry widget can draw the true ellipse axes (A v_i = σ_i u_i). */
  function svd2(A) {
    const a = A[0], b = A[1], c = A[2], d = A[3];
    const p = a * a + c * c, q = a * b + c * d, r = b * b + d * d;
    const tr = p + r, det = p * r - q * q;
    const disc = Math.sqrt(Math.max(0, tr * tr - 4 * det));
    const l1 = (tr + disc) / 2, l2 = (tr - disc) / 2;
    const s1 = Math.sqrt(l1), s2 = Math.sqrt(l2);
    let v1x, v1y;
    if (Math.abs(q) < EPS) {
      if (p >= r) { v1x = 1; v1y = 0; } else { v1x = 0; v1y = 1; }
    } else {
      v1x = q; v1y = l1 - p;
      const n1 = Math.hypot(v1x, v1y) || 1;
      v1x /= n1; v1y /= n1;
    }
    const v2x = -v1y, v2y = v1x;
    let u1x = 1, u1y = 0, u2x = 0, u2y = 1;
    if (s1 > EPS) { u1x = (a * v1x + b * v1y) / s1; u1y = (c * v1x + d * v1y) / s1; }
    if (s2 > EPS) { u2x = (a * v2x + b * v2y) / s2; u2y = (c * v2x + d * v2y) / s2; }
    return { s1: s1, s2: s2, u1: { x: u1x, y: u1y }, u2: { x: u2x, y: u2y }, v1: { x: v1x, y: v1y }, v2: { x: v2x, y: v2y } };
  }

  /* ============ RK - rank ============ */
  W.register('rank', function () {
    const A = [1, 2, 3, 4]; let uiA;
    function draw() {
      const r = rank2(A);
      const det = det2(A[0], A[1], A[2], A[3]);
      W.read(
        W.sideBySide([['A ='], blockOf(A, 2, 2)], 2) + '\n\n' +
        'det A = (' + A[0] + '×' + A[3] + ') − (' + A[1] + '×' + A[2] + ') = ' + det + '\n\n' +
        (r === 2
          ? 'rank A = 2\n  both columns are independent → full rank\n  the columns span the whole plane'
          : 'rank A = 1\n  the columns are dependent → one direction only\n  the columns span a line') + '\n\n' +
        'rank = dimension of the column span\n      = number of independent directions\n      ≤ min(rows, cols) = 2'
      );
    }
    uiA = W.ui.mat(2, 2, A, draw, 44);
    return {
      extra: W.ui.bar(W.ui.label('A ='), uiA.el,
        W.ui.buttons([{ label: 'make it rank 1', fn: () => { A[0] = 1; A[1] = 2; A[2] = 2; A[3] = 4; uiA.sync(); draw(); } }]),
        W.ui.note('change one entry to make the columns parallel')),
      draw: draw,
      reset: function () { A.splice(0, 4, 1, 2, 3, 4); uiA.sync(); draw(); },
      steps: function () {
        const r = rank2(A), det = det2(A[0], A[1], A[2], A[3]);
        return [
          'Rank counts independent directions, not entries. Here the two columns are [' + A[0] + ', ' + A[2] + '] and [' + A[1] + ', ' + A[3] + '].',
          'Their determinant is ' + det + '.',
          r === 2
            ? 'det ≠ 0, so the columns are independent and rank A = 2, full rank.'
            : 'det = 0, so the columns are dependent and rank A = 1. The columns all lie on one line.',
          'That rank is exactly the dimension of the column span: 2 means the plane, 1 means a line.',
          'A 2×2 matrix can never have rank 3, because there are only two columns to work with.'
        ];
      }
    };
  });

  /* ============ RS - rank & span ============ */
  W.register('rankspan', function () {
    const A = [1, 0, 0, 1]; let uiA;
    function draw() {
      const r = rank2(A);
      const col1 = [A[0], A[2]], col2 = [A[1], A[3]];
      W.read(
        W.sideBySide([['A ='], blockOf(A, 2, 2)], 2) + '\n\n' +
        'columns   [' + col1.join(', ') + ']   [' + col2.join(', ') + ']\n\n' +
        (r === 2
          ? 'span(columns) = R²   →  rank = 2\n  every output is reachable; the matrix is full rank'
          : 'span(columns) = a line →  rank = 1\n  only one direction is reachable') + '\n\n' +
        'rank = dim span(columns) = ' + r + '\n' +
        'two different matrices can share this rank\n' +
        'while looking completely different'
      );
    }
    uiA = W.ui.mat(2, 2, A, draw, 44);
    return {
      extra: W.ui.bar(W.ui.label('A ='), uiA.el,
        W.ui.buttons([{ label: 'collapse to a line', fn: () => { A[0] = 2; A[1] = 1; A[2] = 4; A[3] = 2; uiA.sync(); draw(); } }]),
        W.ui.note('the reachable space shrinks to one direction')),
      draw: draw,
      reset: function () { A.splice(0, 4, 1, 0, 0, 1); uiA.sync(); draw(); },
      steps: function () {
        const r = rank2(A);
        return [
          'The column span is the set of every output the matrix can produce.',
          'Its dimension is the rank. Right now rank = ' + r + '.',
          r === 2
            ? 'With two independent columns the span is the whole plane, every output is reachable.'
            : 'With dependent columns the span is only a line, most of R² is unreachable.',
          'Rank is the true size of the reachable space, not the number of entries.',
          'Try the button: the matrix changes, but its rank and span stay at 1. Same geometry, different numbers.'
        ];
      }
    };
  });

  /* ============ LO - LoRA ============ */
  W.register('lora', function () {
    const st = { W: [1, 2, 3, 4], r: 1, B: [1, 2], A: [3, 1] };
    let uiW, sr, uiB, uiA;
    /* B is 2×r, A is r×2, both stored row-major flat. */
    function delta() {
      const B = st.B, A = st.A, r = st.r;
      return [
        B[0] * A[0] + (r === 2 ? B[1] * A[2] : 0),
        B[0] * A[1] + (r === 2 ? B[1] * A[3] : 0),
        B[r] * A[0] + (r === 2 ? B[r + 1] * A[2] : 0),
        B[r] * A[1] + (r === 2 ? B[r + 1] * A[3] : 0)
      ];
    }
    function draw() {
      const D = delta();
      const Wnew = st.W.map((v, i) => v + D[i]);
      const full = st.r === 1
        ? 'ΔW = B·A  (rank 1)'
        : 'ΔW = B·A  (rank up to 2)';
      W.read(
        W.sideBySide([['W ='], blockOf(st.W, 2, 2), ['   ΔW ='], blockOf(D, 2, 2), ['   W+ΔW ='], blockOf(Wnew, 2, 2)], 2) + '\n\n' +
        'LoRA is short for low-rank adaptation. W is the\n' +
        'original weight matrix, the Greek capital delta in ΔW\n' +
        'means "the change in", and r is the rank of that change.\n\n' +
        'LoRA keeps W frozen and learns ΔW = BA.\n' +
        '  B is 2 × r, A is r × 2\n\n' +
        'r = ' + st.r + '   →   ' + full + '\n\n' +
        'parameters learned:\n' +
        '  full fine-tune   2×2 = ' + st.W.length + '\n' +
        '  LoRA r=' + st.r + '          2×' + st.r + ' + ' + st.r + '×2 = ' + (4 * st.r) + '\n\n' +
        (st.r === 1 ? 'r is the budget of new information, a rank-1 update can only move along one direction.'
          : 'r = 2 means no saving: ΔW can express any 2×2 change.')
      );
    }
    uiW = W.ui.mat(2, 2, st.W, draw, 40);
    sr = W.ui.slider('r', 1, 2, 1, 1, v => { st.r = v; rebuild(); });
    const bar = W.ui.bar();
    /* Changing r changes the shapes of B and A, so their input grids are rebuilt.
       The bar must be repopulated with the new grids, appending them once at
       construction leaves the old boxes on screen, detached from st.B / st.A. */
    function rebuild() {
      st.B = st.r === 1 ? [1, 2] : [1, 0, 0, 1];
      st.A = st.r === 1 ? [3, 1] : [2, 0, 0, 3];
      uiB = W.ui.mat(2, st.r, st.B, draw, 40);
      uiA = W.ui.mat(st.r, 2, st.A, draw, 40);
      bar.innerHTML = '';
      bar.appendChild(W.ui.label('W =')); bar.appendChild(uiW.el);
      bar.appendChild(W.ui.label('B =')); bar.appendChild(uiB.el);
      bar.appendChild(W.ui.label('A =')); bar.appendChild(uiA.el);
      bar.appendChild(sr.el);
      bar.appendChild(W.ui.note('drag r to 2 and the saving disappears'));
      draw();
    }
    rebuild();
    return {
      extra: bar,
      draw: draw,
      reset: function () { st.W.splice(0, 4, 1, 2, 3, 4); st.r = 1; sr.set(1); uiW.sync(); rebuild(); },
      steps: function () {
        const D = delta();
        return [
          'LoRA learns an update ΔW = BA instead of retraining W itself.',
          'B is 2×' + st.r + ' and A is ' + st.r + '×2, so ΔW has rank at most ' + st.r + '.',
          'Here ΔW = BA = [' + D.join(', ') + ']. W stays frozen while only B and A are trained.',
          st.r === 1
            ? 'With r = 1 the update must live on a single line, a budget of one independent direction.'
            : 'With r = 2 the update can be any 2×2 matrix, so the saving is gone.',
          'That is the trade-off: small r is cheap but cannot represent every possible change.'
        ];
      }
    };
  });

  /* ============ PR - projection ============ */
  W.register('projection', function () {
    const pl = W.Plane(560, 380, 44);
    const u = { x: 3, y: 1 }, v = { x: 2, y: 4 };
    function draw() {
      pl.clear();
      pl.line(u.x, u.y, 'rgba(20,20,15,.10)', 8);
      const uu = u.x * u.x + u.y * u.y;
      const s = uu ? (v.x * u.x + v.y * u.y) / uu : 0;
      const p = { x: s * u.x, y: s * u.y };
      pl.vec(u.x, u.y, INK, 'u', { width: 2 });
      pl.vec(v.x, v.y, OX, 'v');
      /* proj sits on the u line, so its label goes perpendicular to it. */
      pl.vec(p.x, p.y, INK, 'proj', { width: 3, labOff: W.perpOff(u.x, u.y, 16, 10) });
      pl.seg(p.x, p.y, v.x, v.y, 'rgba(140,58,30,.6)', [4, 3]);
      pl.handle(v.x, v.y, OX); pl.handle(u.x, u.y, INK);
      W.read(
        'u = [' + u.x + ', ' + u.y + ']    v = [' + v.x + ', ' + v.y + ']\n\n' +
        'v·u = ' + (v.x * u.x + v.y * u.y) + '\n' +
        'u·u = ' + uu + '\n\n' +
        'proj = (v·u / u·u) u\n' +
        '     = (' + (v.x * u.x + v.y * u.y) + '/' + uu + ') [' + u.x + ', ' + u.y + ']\n' +
        '     = [' + f(p.x, 4) + ', ' + f(p.y, 4) + ']\n\n' +
        'the dashed line is the leftover v − proj;\n' +
        'it is perpendicular to u'
      );
    }
    W.attachDrag(pl, () => [u, v], (i, x, y) => { const t = i === 0 ? u : v; t.x = x; t.y = y; draw(); }, { bx: 6, by: 5 });
    return {
      cv: pl.cv, draw: draw,
      reset: function () { u.x = 3; u.y = 1; v.x = 2; v.y = 4; draw(); },
      steps: function () {
        const uu = u.x * u.x + u.y * u.y;
        const s = uu ? (v.x * u.x + v.y * u.y) / uu : 0;
        return [
          'Projection drops v straight down onto the line through u.',
          'The shadow is a multiple of u, so it must lie exactly on that line.',
          'The scale factor is (v·u)/(u·u) = ' + (v.x * u.x + v.y * u.y) + '/' + uu + ' = ' + f(s, 4) + '.',
          'That gives proj = [' + f(s * u.x, 4) + ', ' + f(s * u.y, 4) + '].',
          'The dashed remainder is v − proj, and it is perpendicular to u. Projection splits v into two perpendicular pieces.'
        ];
      }
    };
  });

  /* ============ PF - projection formula ============ */
  W.register('projformula', function () {
    const pl = W.Plane(560, 380, 44);
    const u = { x: 1, y: 0 }, v = { x: 3, y: 2 };
    function draw() {
      pl.clear();
      pl.circle(1, 'rgba(20,20,15,.3)', [4, 4]);
      const un = Math.hypot(u.x, u.y);
      const uhat = un ? { x: u.x / un, y: u.y / un } : { x: 0, y: 0 };
      const d = v.x * uhat.x + v.y * uhat.y;
      const p = { x: d * uhat.x, y: d * uhat.y };
      pl.vec(uhat.x, uhat.y, INK, 'û', { width: 3 });
      pl.vec(v.x, v.y, OX, 'v');
      pl.vec(p.x, p.y, INK, 'proj', { width: 3, dash: [5, 4] });
      pl.seg(p.x, p.y, v.x, v.y, 'rgba(140,58,30,.6)', [4, 3]);
      pl.handle(v.x, v.y, OX);
      W.read(
        'unit direction û = u/‖u‖ = [' + f(uhat.x, 4) + ', ' + f(uhat.y, 4) + ']\n\n' +
        'proj_u(v) = (v·û) û\n' +
        '           = (' + (v.x * uhat.x + v.y * uhat.y) + ') û\n' +
        '           = [' + f(p.x, 4) + ', ' + f(p.y, 4) + ']\n\n' +
        'the dot product v·û is how far v reaches\n' +
        'in the û direction, the coordinate of the shadow'
      );
    }
    W.attachDrag(pl, () => [v], (i, x, y) => { v.x = x; v.y = y; draw(); }, { bx: 6, by: 5 });
    return {
      cv: pl.cv, draw: draw,
      reset: function () { u.x = 1; u.y = 0; v.x = 3; v.y = 2; draw(); },
      steps: function () {
        const un = Math.hypot(u.x, u.y);
        const uhat = { x: u.x / un, y: u.y / un };
        const d = v.x * uhat.x + v.y * uhat.y;
        return [
          'Normalise u to get a ruler of length 1: û = [' + f(uhat.x, 4) + ', ' + f(uhat.y, 4) + '].',
          'The dot product v·û = ' + f(d, 4) + ' measures how far v reaches along that ruler.',
          'Stretch û by that amount: proj = ' + f(d, 4) + ' × û = [' + f(d * uhat.x, 4) + ', ' + f(d * uhat.y, 4) + '].',
          'Because û has length 1, the formula has no denominator to remember.',
          'The shadow is always a multiple of û, and the leftover is perpendicular, those two facts are the entire formula.'
        ];
      }
    };
  });

  /* ============ PI - why projection matters ============ */
  W.register('whyproj', function () {
    const pl = W.Plane(560, 380, 44);
    const u = { x: 3, y: 1 }, v = { x: 1, y: 4 };
    function draw() {
      pl.clear();
      pl.line(u.x, u.y, 'rgba(20,20,15,.10)', 8);
      const uu = u.x * u.x + u.y * u.y;
      const s = uu ? (v.x * u.x + v.y * u.y) / uu : 0;
      const p = { x: s * u.x, y: s * u.y };
      const e = { x: v.x - p.x, y: v.y - p.y };
      pl.vec(u.x, u.y, INK, 'u');
      pl.vec(v.x, v.y, OX, 'v');
      /* proj lies on the u line, so its label goes perpendicular, below the
         line and away from the dashed error segment running up to v. */
      pl.vec(p.x, p.y, INK, 'best', { width: 3, labOff: W.perpOff(u.x, u.y, 16, 10) });
      pl.seg(p.x, p.y, v.x, v.y, OX, [4, 3]);
      pl.handle(v.x, v.y, OX);
      const err = Math.hypot(e.x, e.y);
      W.read(
        'approximate v = [' + v.x + ', ' + v.y + '] by a point on the line through u\n\n' +
        'the closest point is proj = [' + f(p.x, 4) + ', ' + f(p.y, 4) + ']\n\n' +
        'error = ‖v − proj‖ = ' + f(err, 4) + '\n' +
        'any other point on the line would be farther away\n\n' +
        'this “closest point” problem is exactly what\n' +
        'least-squares regression solves, and PCA solves\n' +
        'a batch version of it for a whole cloud of points'
      );
    }
    W.attachDrag(pl, () => [v], (i, x, y) => { v.x = x; v.y = y; draw(); }, { bx: 6, by: 5 });
    return {
      cv: pl.cv, draw: draw,
      reset: function () { u.x = 3; u.y = 1; v.x = 1; v.y = 4; draw(); },
      steps: function () {
        const uu = u.x * u.x + u.y * u.y;
        const s = uu ? (v.x * u.x + v.y * u.y) / uu : 0;
        const p = { x: s * u.x, y: s * u.y };
        const e = Math.hypot(v.x - p.x, v.y - p.y);
        return [
          'Projection asks: what point on the line is closest to v?',
          'The answer is the shadow [' + f(p.x, 4) + ', ' + f(p.y, 4) + '].',
          'Its error is ‖v − proj‖ = ' + f(e, 4) + '. Any other point on the line is strictly farther.',
          'That is the definition of a best approximation in Euclidean distance.',
          'Least-squares regression is this with more data; PCA is this applied to a whole cloud to find the direction that minimises total error.'
        ];
      }
    };
  });

  /* ============ EV - eigenvector ============ */
  W.register('eigen', function () {
    const pl = W.Plane(560, 380, 46);
    const A = [2, 0, 0, 3], v = { x: 1, y: 1 };
    let uiA;
    function av() { return { x: A[0] * v.x + A[1] * v.y, y: A[2] * v.x + A[3] * v.y }; }
    function draw() {
      pl.clear();
      const o = av();
      const sameLine = Math.abs(det2(v.x, o.x, v.y, o.y)) < EPS && (o.x || o.y);
      /* On an eigenvector the two arrows lie on one line, which is the state
         this widget asks you to find, so v's label has to step off that line
         or the Av arrow runs straight through the text. */
      pl.vec(v.x, v.y, INK, 'v', { width: 3, labOff: sameLine ? W.perpOff(v.x, v.y, -16, -4) : null });
      pl.vec(o.x, o.y, OX, 'Av', { width: 3 });
      pl.handle(v.x, v.y, INK);
      W.read(
        W.sideBySide([['A ='], blockOf(A, 2, 2), ['   v ='], W.colBlock([v.x, v.y])], 2) + '\n\n' +
        'Av = [' + f(o.x, 3) + ', ' + f(o.y, 3) + ']\n\n' +
        (sameLine
          ? 'v and Av lie on the same line → v is an eigenvector\n  λ = ' + f((o.x / v.x || o.y / v.y), 4) + ' (stretch only, no turn)'
          : 'v and Av do not lie on the same line → v is NOT an eigenvector\n  the matrix turns it, not just stretches it') + '\n\n' +
        'eigenvector rule: Av = λv, output is a scalar\n' +
        'multiple of the input, so the direction is preserved'
      );
    }
    uiA = W.ui.mat(2, 2, A, draw, 44);
    /* Av can be several times longer than v, so bound the drag by where the
       OUTPUT lands rather than the input. Otherwise the red arrow leaves the
       canvas as soon as you drag v near the edge. */
    W.attachDrag(pl, () => [v], function (i, x, y) {
      const ox = A[0] * x + A[1] * y, oy = A[2] * x + A[3] * y;
      const x0 = -pl.ox / pl.unit, x1 = (pl.w - pl.ox) / pl.unit;
      const y0 = -(pl.h - pl.oy) / pl.unit, y1 = pl.oy / pl.unit;
      const pad = 0.45;
      const inside = n => n.x > x0 + pad && n.x < x1 - pad && n.y > y0 + pad && n.y < y1 - pad;
      if (!inside({ x: x, y: y }) || !inside({ x: ox, y: oy })) return;
      v.x = x; v.y = y; draw();
    }, { bx: 5, by: 4 });
    return {
      cv: pl.cv, extra: W.ui.bar(W.ui.label('A ='), uiA.el, W.ui.note('drag v onto an axis to find an eigenvector')),
      draw: draw,
      reset: function () { A.splice(0, 4, 2, 0, 0, 3); v.x = 1; v.y = 1; uiA.sync(); draw(); },
      steps: function () {
        const o = av();
        const same = Math.abs(det2(v.x, o.x, v.y, o.y)) < EPS;
        return [
          'An eigenvector is a direction that survives the transformation without turning.',
          'Apply A to v: Av = [' + f(o.x, 3) + ', ' + f(o.y, 3) + '].',
          same
            ? 'They lie on the same line, so v is an eigenvector. A only stretches it.'
            : 'They point in different directions, so v is not an eigenvector. A turns it.',
          'Most vectors get turned. Only special directions, here the axes, are preserved.',
          'Drag v onto [1,0] or [0,1] and it snaps into an eigenvector of this diagonal matrix.'
        ];
      }
    };
  });

  /* ============ EC - eigenvalue & calculation ============ */
  W.register('eigencalc', function () {
    const A = [2, 1, 1, 2]; let uiA;
    function eigenvalues() {
      const tr = A[0] + A[3];
      const det = det2(A[0], A[1], A[2], A[3]);
      const disc = tr * tr - 4 * det;
      if (disc < -EPS) return null;
      const sq = Math.sqrt(Math.max(0, disc));
      return [(tr + sq) / 2, (tr - sq) / 2];
    }
    function draw() {
      const L = eigenvalues();
      W.read(
        W.sideBySide([['A ='], blockOf(A, 2, 2)], 2) + '\n\n' +
        'solve det(A − λI) = 0\n' +
        '  det[[' + A[0] + '−λ, ' + A[1] + '], [' + A[2] + ', ' + A[3] + '−λ]] = 0\n' +
        '  (' + A[0] + '−λ)(' + A[3] + '−λ) − (' + A[1] + '×' + A[2] + ') = 0\n\n' +
        (L
          ? '  λ² − ' + f(A[0] + A[3]) + 'λ + ' + f(det2(A[0], A[1], A[2], A[3])) + ' = 0\n' +
            '  λ₁ = ' + f(L[0], 4) + ',  λ₂ = ' + f(L[1], 4)
          : '  no real eigenvalues: the discriminant is negative') + '\n\n' +
        'each λ is a stretch factor: Av = λv'
      );
    }
    uiA = W.ui.mat(2, 2, A, draw, 44);
    return {
      extra: W.ui.bar(W.ui.label('A ='), uiA.el, W.ui.note('edit A to watch the characteristic polynomial change')),
      draw: draw,
      reset: function () { A.splice(0, 4, 2, 1, 1, 2); uiA.sync(); draw(); },
      steps: function () {
        const L = eigenvalues();
        return [
          'Eigenvalues solve the characteristic equation det(A − λI) = 0.',
          'Subtract λ from the diagonal, take the determinant, and you get a quadratic in λ.',
          L
            ? 'Its roots are the eigenvalues: ' + f(L[0], 4) + ' and ' + f(L[1], 4) + '.'
            : 'This matrix has no real roots, its eigenvalues live in the complex numbers.',
          'Each eigenvalue λ is the stretch factor for some eigenvector direction.',
          'To finish the job you would solve (A − λI)v = 0 for each λ to find that direction.'
        ];
      }
    };
  });

  /* ============ PD - PCA in depth ============ */
  W.register('pca', function () {
    const pl = W.Plane(560, 340, 38, { ox: 130, oy: 240 });
    const DEF = [[2, 1], [3, 2], [4, 1], [5, 3], [6, 2], [7, 4]];
    const pts = DEF.map(p => ({ x: p[0], y: p[1] }));

    /* Population covariance (divide by n), matching the standard PCA recipe,
       then the eigenpair of that symmetric 2×2 matrix. */
    function stats() {
      const n = pts.length;
      const mx = pts.reduce((s, p) => s + p.x, 0) / n;
      const my = pts.reduce((s, p) => s + p.y, 0) / n;
      const c = pts.map(p => [p.x - mx, p.y - my]);
      const xx = c.reduce((s, p) => s + p[0] * p[0], 0) / n;
      const xy = c.reduce((s, p) => s + p[0] * p[1], 0) / n;
      const yy = c.reduce((s, p) => s + p[1] * p[1], 0) / n;
      const tr = xx + yy, det = xx * yy - xy * xy;
      const disc = Math.sqrt(Math.max(0, tr * tr - 4 * det));
      const l1 = (tr + disc) / 2, l2 = Math.max(0, (tr - disc) / 2);
      let ex, ey;
      if (Math.abs(xy) < EPS) { if (xx >= yy) { ex = 1; ey = 0; } else { ex = 0; ey = 1; } }
      else { ex = xy; ey = l1 - xx; const nn = Math.hypot(ex, ey) || 1; ex /= nn; ey /= nn; }
      return { n: n, mx: mx, my: my, xx: xx, xy: xy, yy: yy, tr: tr,
               l1: l1, l2: l2, e1: { x: ex, y: ey }, e2: { x: -ey, y: ex } };
    }

    function draw() {
      pl.clear();
      const S = stats();
      const a1 = Math.sqrt(S.l1) * 2, a2 = Math.sqrt(S.l2) * 2;
      /* axes drawn through the mean, each scaled by its own standard deviation */
      pl.seg(S.mx - S.e2.x * a2, S.my - S.e2.y * a2, S.mx + S.e2.x * a2, S.my + S.e2.y * a2,
        'rgba(20,20,15,.45)', null, 2);
      pl.seg(S.mx - S.e1.x * a1, S.my - S.e1.y * a1, S.mx + S.e1.x * a1, S.my + S.e1.y * a1, OX, null, 3.5);
      /* each point's projection onto the first PC */
      pts.forEach(function (p) {
        const t = (p.x - S.mx) * S.e1.x + (p.y - S.my) * S.e1.y;
        pl.seg(p.x, p.y, S.mx + S.e1.x * t, S.my + S.e1.y * t, 'rgba(140,58,30,.35)', [3, 3]);
      });
      pts.forEach(p => pl.dot(p.x, p.y, INK, 5));
      pl.dot(S.mx, S.my, OX, 7);
      /* Oxide text on the oxide PC1 band, over a 7px oxide dot, barely reads.
         Step the label off along PC2 and set it in ink. */
      pl.text(S.mx + S.e2.x * 0.42, S.my + S.e2.y * 0.42, 'mean', INK);
      pl.text(S.mx + S.e1.x * a1, S.my + S.e1.y * a1, 'PC1', OX);

      const pct = S.tr ? S.l1 / S.tr * 100 : 0;
      W.read(
        'n = ' + S.n + ' points   ·   drag any of them\n\n' +
        'mean = [' + f(S.mx, 3) + ', ' + f(S.my, 3) + ']\n\n' +
        'covariance of the centred data\n' +
        '  [[ ' + f(S.xx, 3) + ', ' + f(S.xy, 3) + ' ],\n' +
        '   [ ' + f(S.xy, 3) + ', ' + f(S.yy, 3) + ' ]]\n\n' +
        'eigenvalues of that matrix\n' +
        '  λ₁ = ' + f(S.l1, 4) + '   λ₂ = ' + f(S.l2, 4) + '\n' +
        '  λ₁ + λ₂ = ' + f(S.l1 + S.l2, 4) + ' = trace ✓\n\n' +
        'PC1 and PC2 are the first and second principal\n' +
        'components, the directions the data spreads along.\n' +
        'Variance is how widely the points spread along one.\n\n' +
        'PC1 = [' + f(S.e1.x, 3) + ', ' + f(S.e1.y, 3) + ']   variance ' + f(S.l1, 3) + '\n' +
        'PC2 = [' + f(S.e2.x, 3) + ', ' + f(S.e2.y, 3) + ']   variance ' + f(S.l2, 3) + '\n' +
        '  PC1 · PC2 = ' + f(S.e1.x * S.e2.x + S.e1.y * S.e2.y, 3) + ', perpendicular ✓\n\n' +
        'variance explained by PC1 alone: ' + f(pct, 1) + '%\n' +
        'keeping only PC1 would discard ' + f(100 - pct, 1) + '%\n\n' +
        'the dashed lines are each point’s projection onto PC1, \n' +
        'that is what dimension reduction would keep'
      );
    }
    W.attachDrag(pl, () => pts, function (i, x, y) { pts[i].x = x; pts[i].y = y; draw(); },
      { bx: 9, by: 5 });
    return {
      cv: pl.cv, draw: draw,
      reset: function () { DEF.forEach((p, i) => { pts[i].x = p[0]; pts[i].y = p[1]; }); draw(); },
      steps: function () {
        const S = stats();
        const pct = S.tr ? S.l1 / S.tr * 100 : 0;
        return [
          'PCA looks for the direction along which the cloud varies most. Drag a point and watch the red axis chase it.',
          'First centre the data by subtracting the mean [' + f(S.mx, 2) + ', ' + f(S.my, 2) + '].',
          'Build the covariance matrix. Its diagonal is the spread along x and y; the off-diagonal ' +
            f(S.xy, 3) + ' says how much they move together.',
          'Its eigenvectors are the principal directions. The larger eigenvalue λ₁ = ' + f(S.l1, 3) +
            ' belongs to PC1, the red axis.',
          'PC1 alone carries ' + f(pct, 1) + '% of the total variance. Drag the points into a line and watch that climb towards 100%.'
        ];
      }
    };
  });

  /* ============ SV - SVD ============ */
  W.register('svd', function () {
    const A = [3, 0, 0, 1]; let uiA;
    function draw() {
      const S = svd2(A);
      W.read(
        W.sideBySide([['A ='], blockOf(A, 2, 2)], 2) + '\n\n' +
        'SVD is short for singular value decomposition.\n' +
        'A = U Σ Vᵀ, said "U sigma V transposed".\n\n' +
        '  U   = orthogonal change of output basis\n' +
        '  Σ   = capital sigma, the diagonal matrix of\n' +
        '        stretch factors  [[σ₁, 0], [0, σ₂]]\n' +
        '  Vᵀ  = orthogonal change of input basis, the raised\n' +
        '        T meaning transpose\n\n' +
        'orthogonal means the columns are perpendicular unit\n' +
        'vectors, so U and Vᵀ only rotate or reflect.\n\n' +
        'singular values, the lower-case σ, are the stretch\n' +
        'factors. They come from the eigenvalues of AᵀA:\n' +
        '  σ₁ = ' + f(S.s1, 4) + '\n' +
        '  σ₂ = ' + f(S.s2, 4) + '\n\n' +
        'every matrix, square, rectangular, singular or not, \n' +
        'has a singular value decomposition'
      );
    }
    uiA = W.ui.mat(2, 2, A, draw, 44);
    return {
      extra: W.ui.bar(W.ui.label('A ='), uiA.el, W.ui.note('singular values come from the eigenvalues of AᵀA')),
      draw: draw,
      reset: function () { A.splice(0, 4, 3, 0, 0, 1); uiA.sync(); draw(); },
      steps: function () {
        return [
          'The SVD writes any matrix as A = UΣVᵀ.',
          'Σ is a diagonal matrix of singular values, the stretch factors.',
          'U and Vᵀ are orthogonal: they rotate but never stretch.',
          'So every linear map is rotate → scale → rotate, in that exact order.',
          'Unlike eigenvalues, singular values are always real and non-negative, and the SVD exists for every matrix.'
        ];
      }
    };
  });

  /* ============ SG - SVD geometry ============ */
  W.register('svdgeom', function () {
    const pl = W.Plane(560, 380, 52);
    const A = [2, 1, 0, 1]; let uiA;
    function draw() {
      pl.clear();
      /* The readout and the steps both talk about the unit circle and the
         ellipse it becomes, so draw those two, not a square and a parallelogram.
         Sampling A(cos t, sin t) gives the image exactly. */
      const N = 120, circle = [], ellipse = [];
      for (let i = 0; i < N; i++) {
        const t = i / N * Math.PI * 2, ct = Math.cos(t), sn = Math.sin(t);
        circle.push([ct, sn]);
        ellipse.push([A[0] * ct + A[1] * sn, A[2] * ct + A[3] * sn]);
      }
      pl.shape(circle, 'rgba(20,20,15,.08)', 'rgba(20,20,15,.45)');
      pl.shape(ellipse, 'rgba(140,58,30,.16)', OX);
      const S = svd2(A);
      const a1 = { x: S.s1 * S.u1.x, y: S.s1 * S.u1.y };
      const a2 = { x: S.s2 * S.u2.x, y: S.s2 * S.u2.y };
      pl.vec(a1.x, a1.y, INK, 'σ₁u₁', { width: 3 });
      pl.vec(a2.x, a2.y, OX, 'σ₂u₂', { width: 3 });
      W.read(
        'A maps the unit circle to an ellipse.\n' +
        'Its axes are the true singular vectors u₁ and u₂.\n\n' +
        'A = [[ ' + A[0] + ', ' + A[1] + ' ], [ ' + A[2] + ', ' + A[3] + ' ]]\n\n' +
        'σ₁ = ' + f(S.s1, 4) + '   (long axis, direction [' + f(S.u1.x, 3) + ', ' + f(S.u1.y, 3) + '])\n' +
        'σ₂ = ' + f(S.s2, 4) + '   (short axis, direction [' + f(S.u2.x, 3) + ', ' + f(S.u2.y, 3) + '])\n\n' +
        'Vᵀ rotates the input so those axes line up,\n' +
        'Σ stretches along them, and U rotates the result.'
      );
    }
    uiA = W.ui.mat(2, 2, A, draw, 44);
    return {
      cv: pl.cv, extra: W.ui.bar(W.ui.label('A ='), uiA.el), draw: draw,
      reset: function () { A.splice(0, 4, 2, 1, 0, 1); uiA.sync(); draw(); },
      steps: function () {
        return [
          'The unit circle under A becomes an ellipse.',
          'The longest axis is the first singular vector and its length is σ₁.',
          'The shortest axis is the next singular vector with length σ₂.',
          'Read A = UΣVᵀ right to left: Vᵀ rotates the input onto those axes, Σ stretches, U rotates the result.',
          'That is why the SVD is described as rotate → scale → rotate.'
        ];
      }
    };
  });

  /* ============ SP - low-rank & pixels ============ */
  W.register('svdpixels', function () {
    const st = { k: 1, s1: 40, s2: 20, s3: 8 };
    let sk;
    /* Energy is the squared Frobenius norm, which the SVD splits as the sum of
       the squared singular values. Summing the values themselves understates
       how much of the image the top layer already carries. */
    function energy(k) {
      const sq = [st.s1 * st.s1, st.s2 * st.s2, st.s3 * st.s3];
      const full = sq[0] + sq[1] + sq[2];
      return sq.slice(0, k).reduce((a, b) => a + b, 0) / full * 100;
    }
    function draw() {
      const pct = energy(st.k);
      const storage = st.k === 1 ? '~k(1000+1000+1) = 2001 numbers'
        : st.k === 2 ? '~k(1000+1000+1) = 4002 numbers' : '1000×1000 = 1,000,000 numbers';
      W.read(
        'a 1000×1000 image stored as a matrix\n' +
        'singular values (this toy has 3):\n\n' +
        '  σ₁ = ' + st.s1 + '\n' +
        '  σ₂ = ' + st.s2 + '\n' +
        '  σ₃ = ' + st.s3 + '\n\n' +
        'k is how many layers you keep. Energy is the sum of\n' +
        'the squared singular values, written Σσ², where the\n' +
        'capital Σ means "add up" and σ is a singular value.\n\n' +
        'keep top k = ' + st.k + '\n' +
        '  energy kept  ' + f(pct, 1) + '%   (Σσ² of the kept layers,\n' +
        '                       as a share of the whole)\n' +
        '  storage      ' + storage + '\n\n' +
        (st.k === 1
          ? 'keeping one singular value captures most of the image\n  but throws away the fine detail'
          : st.k === 2 ? 'two singular values recover much of the remaining detail'
            : 'keeping all three is lossless but stores everything') + '\n\n' +
        'A ≈ U_k Σ_k V_kᵀ, where ≈ means approximately equal\n' +
        'and the subscript k means "keep only the first k".\n' +
        'That is how the ideas behind JPEG, the common photo\n' +
        'format, and low-rank compression in general trade\n' +
        'size against fidelity'
      );
    }
    sk = W.ui.slider('k', 1, 3, 1, 1, v => { st.k = v; draw(); });
    return {
      extra: W.ui.bar(sk.el, W.ui.note('more singular values → better image, more storage')),
      draw: draw,
      reset: function () { st.k = 1; sk.set(1); draw(); },
      steps: function () {
        return [
          'An image is just a matrix, and the SVD splits it into layers ranked by importance.',
          'The singular values are the sizes of those layers. Here σ₁ = ' + st.s1 + ' dominates.',
          'Keeping only the top k = ' + st.k + ' values keeps ' + f(energy(st.k), 1) + '% of the energy, measured as Σσ².',
          'Storage is roughly k×(rows+columns+1) instead of rows×columns, a huge saving for small k.',
          'Low rank is lossy: the dropped singular values are fine detail you chose to discard.'
        ];
      }
    };
  });

  /* ============ QK - Q, K, V ============ */
  W.register('qkv', function () {
    const st = { n: 3, d: 2 };
    let pick;
    function draw() {
      const X = [[1, 2], [3, 4], [5, 6]];
      W.read(
        'Q is the query, K the key, V the value.\n' +
        'a token is one piece of the input, a word or part of one.\n' +
        'n counts the tokens, d is the width of each one,\n' +
        'd_k the width of a query or key, d_v of a value.\n\n' +
        'input tokens  X  is n × d = ' + st.n + ' × ' + st.d + '\n\n' +
        'each token is a row of X:\n' +
        X.slice(0, st.n).map(r => '  [' + r.join(', ') + ']').join('\n') + '\n\n' +
        'learned projections, where W_Q, W_K and W_V are the\n' +
        'weight matrices the model learns:\n' +
        '  Q = X W_Q   (n × d_k)\n' +
        '  K = X W_K   (n × d_k)\n' +
        '  V = X W_V   (n × d_v)\n\n' +
        'Q asks, K answers, V hands over.\n' +
        'all three are the same tokens, projected three ways'
      );
    }
    pick = W.ui.pick('tokens n', [1, 2, 3].map(v => ({ v, t: String(v) })), 3, v => { st.n = +v; draw(); });
    return {
      extra: W.ui.bar(pick.el, W.ui.note('query, key and value all have n rows, one per token')),
      draw: draw,
      reset: function () { st.n = 3; pick.set(3); draw(); },
      steps: function () {
        return [
          'Attention works on a sequence of n token vectors, each of dimension d. A token is one piece of the input, a word or part of a word.',
          'Three learned weight matrices, written W_Q, W_K and W_V, project those tokens into three different spaces.',
          'The result is Q for query, K for key and V for value, each with n rows, one row per token.',
          'Q is “what am I looking for”, K is “what do I contain”, V is “what would I hand over”.',
          'Query and key share the same width, called d_k, because they must be dotted together; the value can have a different width, called d_v.'
        ];
      }
    };
  });

  /* ============ QT - QKᵀ & scaling ============ */
  W.register('qkt', function () {
    const st = { dk: 4 };
    let sk;
    function draw() {
      const n = 3, dk = st.dk;
      /* With q and k components independent, mean 0 and variance 1, the dot
         product has variance d_k, so its typical size is √d_k, not d_k.
         Dividing by √d_k is what pins the scaled score at about 1 whatever
         d_k does. Modelling raw as d_k would leave the scaled score growing
         and contradict the point of the scaling. */
      const raw = Math.sqrt(dk);
      const scaled = raw / Math.sqrt(dk);
      W.read(
        'Q is the query matrix, K the key matrix, n the number\n' +
        'of tokens, and d_k the width of one query or key.\n' +
        'The raised T in Kᵀ means transpose, rows swapped\n' +
        'with columns.\n\n' +
        'Q is n × d_k = ' + n + ' × ' + dk + '\n' +
        'K is n × d_k = ' + n + ' × ' + dk + '\n\n' +
        'QKᵀ is (' + n + ' × ' + dk + ')(' + dk + ' × ' + n + ') = ' + n + ' × ' + n + '\n' +
        'the transpose makes the inner d_k match\n\n' +
        'typical size of one score q·k, for components\n' +
        'drawn independently with mean 0 and variance 1\n' +
        '  raw score   ≈ √d_k = ' + f(raw, 2) + '\n' +
        '  ÷ √d_k = ÷ √' + dk + ' = ÷ ' + f(Math.sqrt(dk), 3) + '\n' +
        '  scaled      ≈ ' + f(scaled, 2) + '\n\n' +
        'the raw score grows with √d_k, the scaled one stays\n' +
        'at about 1, so softmax does not saturate'
      );
    }
    sk = W.ui.slider('d_k', 1, 64, 1, 4, v => { st.dk = v; draw(); });
    return {
      extra: W.ui.bar(sk.el, W.ui.note('raise d_k: the raw score grows, the scaled one holds')),
      draw: draw,
      reset: function () { st.dk = 4; sk.set(4); draw(); },
      steps: function () {
        return [
          'Q and K each have shape n × d_k, so their inner dimensions match only when K is transposed.',
          'QKᵀ = (n×d_k)(d_k×n) = n×n, one score for every query-key pair.',
          'A dot product sums d_k independent terms, so its variance is d_k and its typical size grows with √d_k.',
          'Dividing by √d_k brings that variance back to about 1, whatever d_k is.',
          'That keeps the softmax inputs in a sensible range instead of saturating into all-or-nothing weights.'
        ];
      }
    };
  });

  /* ============ SM - softmax ============ */
  W.register('softmax', function () {
    const st = { z: [2, 1, 0.1] };
    let uiZ;
    function draw() {
      /* The answer is computed from exp(z − max) so a huge score cannot overflow.
         The workings shown must use the SAME quantities as the sum underneath
         them, or the arithmetic on screen will not add up. Prefer the plain
         exp(z) form, and fall back to the shifted one only if it overflows. */
      const mx = Math.max.apply(null, st.z);
      const e = st.z.map(z => Math.exp(z - mx));
      const s = e.reduce((a, b) => a + b, 0);
      const p = e.map(v => v / s);
      const raw = st.z.map(z => Math.exp(z));
      const plain = raw.every(v => isFinite(v)) && isFinite(raw.reduce((a, b) => a + b, 0));
      const shown = plain ? raw : e;
      /* Add up the terms as they are printed, to 4 places. Rounding the exact
         sum instead lands on 11.2125 while the three lines above it read
         7.3891 + 2.7183 + 1.1052 = 11.2126, and the column stops adding up. */
      const shownSum = shown.reduce((a, b) => a + +f(b, 4), 0);
      W.read(
        'scores  z = [' + st.z.map(v => f(v, 2)).join(', ') + ']\n\n' +
        (plain ? 'e^zᵢ:\n' : 'e^(zᵢ − max), shifted, the raw form overflows:\n') +
        st.z.map((z, i) => '  ' + (plain ? 'e^' + f(z, 2) : 'e^' + f(z - mx, 2)) +
          ' = ' + f(shown[i], 4)).join('\n') + '\n\n' +
        'sum = ' + f(shownSum, 4) + '\n\n' +
        'softmax = [' + p.map(v => f(v, 4)).join(', ') + ']\n' +
        'sum of probabilities = ' + f(p.reduce((a, b) => a + b, 0), 4) + '\n\n' +
        'subtracting the max before exponentiating changes\n' +
        'nothing, the shift cancels top and bottom, but it\n' +
        'stops a large score overflowing to infinity\n\n' +
        'the largest score gets the most mass, but no one\n' +
        'gets exactly zero'
      );
    }
    uiZ = W.ui.mat(1, 3, st.z, draw, 50);
    return {
      extra: W.ui.bar(W.ui.label('z ='), uiZ.el, W.ui.note('edit the scores')),
      draw: draw,
      reset: function () { st.z.splice(0, 3, 2, 1, 0.1); uiZ.sync(); draw(); },
      steps: function () {
        const mx = Math.max.apply(null, st.z);
        const e = st.z.map(z => Math.exp(z - mx));
        const s = e.reduce((a, b) => a + b, 0);
        const p = e.map(v => v / s);
        return [
          'Softmax turns a row of arbitrary scores into a probability distribution.',
          'Exponentiate each score, then divide by the total. Subtracting the max first only avoids overflow.',
          'Here the largest score ' + f(Math.max.apply(null, st.z), 2) + ' gets ' + f(Math.max.apply(null, p) * 100, 1) + '% of the mass.',
          'The smallest score still keeps a non-zero share, softmax never fully excludes anyone.',
          'That is the difference from a hard max: softmax is differentiable and always assigns weights that sum to one.'
        ];
      }
    };
  });

  /* ============ AT - full attention ============ */
  W.register('attention', function () {
    /* Two tokens, d_k = d_v = 2. Q, K, V are each 2×2, row i = token i. */
    const DQ = [1, 0, 0, 1], DK = [1, 0, 0, 1], DV = [1, 0, 0, 1];
    const st = { Q: DQ.slice(), K: DK.slice(), V: DV.slice() };
    let uiQ, uiK, uiV;
    const dk = 2, root = Math.sqrt(dk);

    function pipeline() {
      const Q = st.Q, K = st.K, V = st.V;
      /* S = QKᵀ : S[i][j] = q_i · k_j */
      const S = [];
      for (let i = 0; i < 2; i++) for (let j = 0; j < 2; j++)
        S.push(Q[i * 2] * K[j * 2] + Q[i * 2 + 1] * K[j * 2 + 1]);
      const Sc = S.map(v => v / root);
      /* row-wise softmax, max-shifted so a large score cannot overflow */
      const Wt = [];
      for (let i = 0; i < 2; i++) {
        const row = [Sc[i * 2], Sc[i * 2 + 1]];
        const mx = Math.max(row[0], row[1]);
        const e = row.map(v => Math.exp(v - mx));
        const sum = e[0] + e[1];
        Wt.push(e[0] / sum, e[1] / sum);
      }
      /* O = W V : o_i = Σ_j W[i][j] · v_j  (v_j is row j of V) */
      const O = [];
      for (let i = 0; i < 2; i++) for (let c = 0; c < 2; c++)
        O.push(Wt[i * 2] * V[c] + Wt[i * 2 + 1] * V[2 + c]);
      return { S: S, Sc: Sc, Wt: Wt, O: O };
    }

    function draw() {
      const Q = st.Q, K = st.K, P = pipeline();
      const dotTxt = (i, j) => '(' + f(Q[i * 2]) + '×' + f(K[j * 2]) + ') + (' +
        f(Q[i * 2 + 1]) + '×' + f(K[j * 2 + 1]) + ') = ' + f(P.S[i * 2 + j], 2);
      const rowSum = i => f(P.Wt[i * 2] + P.Wt[i * 2 + 1], 4);
      W.read(
        'Q is the query, K the key, V the value. n counts the\n' +
        'tokens and d_k is the width of one query or key.\n\n' +
        'n = 2 tokens   d_k = ' + dk + '   √d_k = ' + f(root, 4) + '\n\n' +
        W.sideBySide([['Q ='], blockOf(Q, 2, 2), ['  K ='], blockOf(K, 2, 2), ['  V ='], blockOf(st.V, 2, 2)], 2) + '\n\n' +
        'STEP 1   S = QKᵀ, every query against every key\n' +
        '  S₁₁ = q₁·k₁ = ' + dotTxt(0, 0) + '\n' +
        '  S₁₂ = q₁·k₂ = ' + dotTxt(0, 1) + '\n' +
        '  S₂₁ = q₂·k₁ = ' + dotTxt(1, 0) + '\n' +
        '  S₂₂ = q₂·k₂ = ' + dotTxt(1, 1) + '\n' +
        '  transpose is what makes (2×2)(2×2) line up\n\n' +
        'STEP 2   divide by √d_k = ' + f(root, 4) + '\n' +
        W.sideBySide([['  '], blockOf(P.Sc.map(v => +f(v, 3)), 2, 2)], 1) + '\n\n' +
        'STEP 3   softmax each row\n' +
        '  row 1 → [' + f(P.Wt[0], 4) + ', ' + f(P.Wt[1], 4) + ']   sums to ' + rowSum(0) + '\n' +
        '  row 2 → [' + f(P.Wt[2], 4) + ', ' + f(P.Wt[3], 4) + ']   sums to ' + rowSum(1) + '\n\n' +
        'STEP 4   O = W V, a weighted sum of the value rows\n' +
        '  o₁ = ' + f(P.Wt[0], 4) + '·v₁ + ' + f(P.Wt[1], 4) + '·v₂ = [' + f(P.O[0], 4) + ', ' + f(P.O[1], 4) + ']\n' +
        '  o₂ = ' + f(P.Wt[2], 4) + '·v₁ + ' + f(P.Wt[3], 4) + '·v₂ = [' + f(P.O[2], 4) + ', ' + f(P.O[3], 4) + ']\n\n' +
        'Attention(Q,K,V) = softmax(QKᵀ / √d_k) V\n\n' +
        'Q and K only decide where to look.\n' +
        'V is what actually gets gathered, edit V and the\n' +
        'weights stay put while the output moves.'
      );
    }

    uiQ = W.ui.mat(2, 2, st.Q, draw, 40);
    uiK = W.ui.mat(2, 2, st.K, draw, 40);
    uiV = W.ui.mat(2, 2, st.V, draw, 40);
    const bar = W.ui.bar(W.ui.label('Q ='), uiQ.el, W.ui.label('K ='), uiK.el,
      W.ui.label('V ='), uiV.el,
      W.ui.buttons([{
        label: 'make token 1 stare at token 2', fn: function () {
          st.Q.splice(0, 4, 0, 3, 0, 1); st.K.splice(0, 4, 1, 0, 0, 1);
          uiQ.sync(); uiK.sync(); draw();
        }
      }]));

    return {
      extra: bar, draw: draw,
      reset: function () {
        st.Q.splice(0, 4); DQ.forEach(v => st.Q.push(v));
        st.K.splice(0, 4); DK.forEach(v => st.K.push(v));
        st.V.splice(0, 4); DV.forEach(v => st.V.push(v));
        uiQ.sync(); uiK.sync(); uiV.sync(); draw();
      },
      steps: function () {
        const P = pipeline();
        return [
          'Score. S = QKᵀ takes every query against every key, giving one number per pair, here S₁₁ = ' +
            f(P.S[0], 2) + ' and S₁₂ = ' + f(P.S[1], 2) + '.',
          'The transpose is not decoration: without it the inner dimensions do not match and the product does not exist.',
          'Scale. Divide by √d_k = ' + f(root, 4) +
            ' so the scores do not grow with dimension and push softmax into saturation.',
          'Weight. Softmax each row: token 1 gives [' + f(P.Wt[0], 4) + ', ' + f(P.Wt[1], 4) +
            '], which sums to ' + f(P.Wt[0] + P.Wt[1], 4) + '.',
          'Gather. o₁ = ' + f(P.Wt[0], 4) + '·v₁ + ' + f(P.Wt[1], 4) + '·v₂ = [' +
            f(P.O[0], 4) + ', ' + f(P.O[1], 4) + '], a linear combination of the value rows, exactly item 1.14.'
        ];
      }
    };
  });

})(Widgets);
