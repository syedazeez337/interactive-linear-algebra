/* Playgrounds: the objects, building with vectors, measuring.
   Every number shown is computed from state. Nothing is hardcoded. */
(function (W) {
  'use strict';
  const INK = W.INK, OX = W.OXIDE, MUTE = W.MUTE, FAINT = W.FAINT, GROUND = W.GROUND;
  const f = W.f;
  const grp = n => n.toLocaleString('en-US');

  /* ============ Z - scalar ============ */
  W.register('scalar', function () {
    const pl = W.Plane(560, 200, 40, { oy: 108 });
    const st = { k: 3 };
    function draw() {
      pl.clear({ noGrid: true });
      const c = pl.ctx, o = pl.S(0, 0);
      c.strokeStyle = W.HAIR2; c.lineWidth = 1.4;
      c.beginPath(); c.moveTo(10, o.y); c.lineTo(pl.w - 10, o.y); c.stroke();
      c.font = '10px ' + W.MONO; c.textAlign = 'center'; c.textBaseline = 'top';
      for (let i = -6; i <= 6; i++) {
        const p = pl.S(i, 0);
        c.strokeStyle = 'rgba(20,20,15,.35)'; c.lineWidth = 1;
        c.beginPath(); c.moveTo(p.x, o.y - 5); c.lineTo(p.x, o.y + 5); c.stroke();
        c.fillStyle = 'rgba(20,20,15,.55)'; c.fillText(String(i), p.x, o.y + 9);
      }
      /* magnitude bar from 0 to k */
      pl.seg(0, 0.55, st.k, 0.55, OX, null, 5);
      pl.text(st.k / 2, 0.62, '|k| = ' + f(Math.abs(st.k)), OX);
      pl.handle(st.k, 0, INK);
      c.fillStyle = INK; c.font = 'bold 15px ' + W.MONO;
      c.textAlign = 'center'; c.textBaseline = 'bottom';
      const hp = pl.S(st.k, 0);
      c.fillText('k = ' + f(st.k), hp.x, hp.y - 12);
      paint();
    }
    function paint() {
      const k = st.k;
      W.read(
        'k = ' + f(k) + '\n\n' +
        '|k|  = ' + f(Math.abs(k)) + '\n' +
        'sign = ' + (k > 0 ? 'positive' : k < 0 ? 'negative' : 'zero') + '\n' +
        'shape: 1 × 1, one number, no direction\n\n' +
        'THE LADDER\n' +
        '  order 0   scalar    1 number         0 indices\n' +
        '  order 1   vector    n numbers        1 index\n' +
        '  order 2   matrix    m×n numbers      2 indices\n' +
        '  order 3   tensor    m×n×p numbers    3 indices'
      );
    }
    W.attachDrag(pl, () => [{ x: st.k, y: 0 }], (i, x) => { st.k = x; draw(); });
    return {
      cv: pl.cv, draw: draw,
      reset: function () { st.k = 3; draw(); },
      steps: () => [
        'A scalar is a single number. Drag the handle along the line.',
        'It has size |k| = ' + f(Math.abs(st.k)) + ', shown by the bar, but it does not point anywhere.',
        st.k < 0 ? 'k is negative. That sign matters: multiplying a vector by it reverses the direction.'
          : 'The sign matters: a negative scalar reverses whatever vector you multiply.',
        'Shape 1 × 1. You need zero indices to reach it. There is nothing to index.',
        'This is the bottom rung. Add one index and you have a vector, two and you have a matrix.'
      ]
    };
  });

  /* ============ V - vector ============ */
  W.register('vector', function () {
    const pl = W.Plane(560, 380, 44);
    const st = { x: 3, y: 4 };
    function draw() {
      pl.clear();
      pl.seg(st.x, st.y, st.x, 0, FAINT, [3, 3]);
      pl.seg(st.x, st.y, 0, st.y, FAINT, [3, 3]);
      pl.vec(st.x, st.y, INK, 'v');
      pl.handle(st.x, st.y, INK);
      const mag = Math.hypot(st.x, st.y);
      W.read(
        W.sideBySide([['v  ='], W.colBlock([st.x, st.y])], 1) + '\n\n' +
        'v₁ = ' + st.x + '        v₂ = ' + st.y + '\n' +
        'components: 2   →   v ∈ R²\n\n' +
        '‖v‖ = √(' + st.x + '² + ' + st.y + '²) = √' + (st.x * st.x + st.y * st.y) + ' = ' + f(mag)
      );
    }
    W.attachDrag(pl, () => [st], (i, x, y) => { st.x = x; st.y = y; draw(); });
    return {
      cv: pl.cv, draw: draw,
      reset: function () { st.x = 3; st.y = 4; draw(); },
      steps: () => [
        'The arrow starts at the origin and ends where you drag the handle.',
        'v₁ = ' + st.x + ', how far it runs along x.',
        'v₂ = ' + st.y + ', how far it runs along y.',
        'Stack them in a column: v = [' + st.x + ', ' + st.y + '].',
        'Two components, so v ∈ R². Its length is ' + f(Math.hypot(st.x, st.y)) + '.'
      ]
    };
  });

  /* ============ M - matrix ============ */
  W.register('matrix', function () {
    const pl = W.Plane(560, 330, 44, { ox: 40, oy: 40 });
    const st = { rows: 2, cols: 3, v: [1, 2, 3, 4, 5, 6], sr: 1, sc: 2 };
    const CW = 62, CH = 44, X0 = 74, Y0 = 66;
    let matUI = null;

    function cellRect(r, c) { return { x: X0 + c * CW, y: Y0 + r * CH, w: CW - 6, h: CH - 6 }; }

    function draw() {
      const c = pl.ctx;
      pl.clear({ noGrid: true });
      c.font = '11px ' + W.MONO; c.textAlign = 'center'; c.textBaseline = 'middle';
      for (let j = 0; j < st.cols; j++) {
        c.fillStyle = MUTE;
        c.fillText('c' + (j + 1), X0 + j * CW + (CW - 6) / 2, Y0 - 16);
      }
      for (let i = 0; i < st.rows; i++) {
        c.fillStyle = MUTE; c.textAlign = 'right';
        c.fillText('r' + (i + 1), X0 - 14, Y0 + i * CH + (CH - 6) / 2);
        c.textAlign = 'center';
      }
      for (let i = 0; i < st.rows; i++) for (let j = 0; j < st.cols; j++) {
        const R = cellRect(i, j), on = (i === st.sr && j === st.sc);
        c.fillStyle = on ? INK : W.GROUND;
        c.fillRect(R.x, R.y, R.w, R.h);
        c.strokeStyle = INK; c.lineWidth = on ? 2 : 1;
        c.strokeRect(R.x + .5, R.y + .5, R.w, R.h);
        c.fillStyle = on ? W.GROUND : INK; c.font = '14px ' + W.MONO;
        c.fillText(String(st.v[i * st.cols + j]), R.x + R.w / 2, R.y + R.h / 2);
      }
      /* brackets */
      const bx = X0 - 10, bw = st.cols * CW - 6 + 20, by = Y0 - 8, bh = st.rows * CH - 6 + 16;
      c.strokeStyle = INK; c.lineWidth = 2; c.beginPath();
      c.moveTo(bx + 9, by); c.lineTo(bx, by); c.lineTo(bx, by + bh); c.lineTo(bx + 9, by + bh);
      c.moveTo(bx + bw - 9, by); c.lineTo(bx + bw, by); c.lineTo(bx + bw, by + bh); c.lineTo(bx + bw - 9, by + bh);
      c.stroke();
      paint();
    }
    function paint() {
      const idx = st.sr * st.cols + st.sc;
      const lines = [];
      for (let i = 0; i < st.rows; i++) {
        const row = [];
        for (let j = 0; j < st.cols; j++) row.push(W.pad(st.v[i * st.cols + j], 3));
        lines.push('[' + row.join(' ') + ' ]');
      }
      W.read(
        'A is ' + st.rows + ' × ' + st.cols + ', ' + st.rows + ' rows, ' + st.cols + ' columns\n' +
        'entries: m × n = ' + st.rows + ' × ' + st.cols + ' = ' + (st.rows * st.cols) + '\n\n' +
        lines.join('\n') + '\n\n' +
        'selected   a(' + (st.sr + 1) + ',' + (st.sc + 1) + ') = ' + st.v[idx] + '\n' +
        '           row ' + (st.sr + 1) + ', column ' + (st.sc + 1) + '\n\n' +
        'a column vector in R' + st.rows + ' would be ' + st.rows + ' × 1'
      );
    }
    pl.cv.addEventListener('pointerdown', function (e) {
      const r = pl.cv.getBoundingClientRect(), px = e.clientX - r.left, py = e.clientY - r.top;
      for (let i = 0; i < st.rows; i++) for (let j = 0; j < st.cols; j++) {
        const R = cellRect(i, j);
        if (px >= R.x && px <= R.x + R.w && py >= R.y && py <= R.y + R.h) { st.sr = i; st.sc = j; draw(); }
      }
    });
    function resize(rows, cols) {
      const nv = [];
      for (let i = 0; i < rows; i++) for (let j = 0; j < cols; j++)
        nv.push((i < st.rows && j < st.cols) ? st.v[i * st.cols + j] : 0);
      st.rows = rows; st.cols = cols; st.v = nv;
      st.sr = Math.min(st.sr, rows - 1); st.sc = Math.min(st.sc, cols - 1);
      rebuild();
    }
    let bar = W.ui.bar();
    function rebuild() {
      bar.innerHTML = '';
      const rowsPick = W.ui.pick('rows', [1, 2, 3, 4].map(n => ({ v: n, t: n })), st.rows, v => resize(+v, st.cols));
      const colsPick = W.ui.pick('cols', [1, 2, 3, 4].map(n => ({ v: n, t: n })), st.cols, v => resize(st.rows, +v));
      matUI = W.ui.mat(st.rows, st.cols, st.v, draw, 40);
      bar.appendChild(rowsPick.el); bar.appendChild(colsPick.el);
      bar.appendChild(W.ui.label('A =')); bar.appendChild(matUI.el);
      bar.appendChild(W.ui.note('click a cell to select it'));
      draw();
    }
    rebuild();
    return {
      cv: pl.cv, extra: bar, draw: draw,
      reset: function () { st.rows = 2; st.cols = 3; st.v = [1, 2, 3, 4, 5, 6]; st.sr = 1; st.sc = 2; rebuild(); },
      steps: () => [
        'Size is always quoted rows first. This one is ' + st.rows + ' × ' + st.cols + '.',
        'aⱼ,ₖ means the entry in row j, column k. Click any cell to select it.',
        'The selected cell is a(' + (st.sr + 1) + ',' + (st.sc + 1) + ') = ' + st.v[st.sr * st.cols + st.sc] +
          ', row ' + (st.sr + 1) + ', column ' + (st.sc + 1) + '.',
        'Total entries = m × n = ' + (st.rows * st.cols) + '.',
        'Set cols to 1 and you have a column vector. Everything you did with vectors was already a matrix one column wide.'
      ]
    };
  });

  /* ============ T - tensor ============ */
  W.register('tensor', function () {
    const pl = W.Plane(560, 300, 40, { ox: 40, oy: 40 });
    const st = { dims: [32, 128, 768], name: 'batch of sentences' };
    function count() { return st.dims.length ? st.dims.reduce((a, b) => a * b, 1) : 1; }
    function draw() {
      const c = pl.ctx;
      pl.clear({ noGrid: true });
      const ord = st.dims.length;
      c.strokeStyle = INK; c.fillStyle = W.GROUND; c.lineWidth = 1.4;
      const bx = 60, by = 70, cw = 26, ch = 26;
      function cell(x, y) { c.fillRect(x, y, cw, ch); c.strokeRect(x + .5, y + .5, cw, ch); }
      if (ord === 0) cell(bx, by);
      else if (ord === 1) for (let i = 0; i < 4; i++) cell(bx, by + i * ch);
      else if (ord === 2) for (let i = 0; i < 3; i++) for (let j = 0; j < 4; j++) cell(bx + j * cw, by + i * ch);
      else {
        const slices = Math.min(4, st.dims[0]);
        for (let s = slices - 1; s >= 0; s--) {
          const ox2 = bx + s * 22, oy2 = by + s * 16;
          c.fillStyle = W.GROUND;
          for (let i = 0; i < 3; i++) for (let j = 0; j < 4; j++) cell(ox2 + j * cw, oy2 + i * ch);
        }
        if (st.dims[0] > 4) {
          c.fillStyle = MUTE; c.font = '13px ' + W.MONO; c.textAlign = 'left';
          c.fillText('…  ' + grp(st.dims[0]) + ' slices', bx + 4 * 22 + 4 * cw + 12, by + 40);
        }
      }
      c.fillStyle = INK; c.font = '13px ' + W.MONO; c.textAlign = 'left'; c.textBaseline = 'alphabetic';
      c.fillText(ord === 0 ? 'scalar' : ord === 1 ? 'vector' : ord === 2 ? 'matrix' : 'order-' + ord + ' tensor', bx, by - 22);
      paint();
    }
    function paint() {
      const ord = st.dims.length, n = count();
      const idx = ord === 0 ? '(no index)' : 'T' + st.dims.map((_, i) => '[' + 'ijkl'[i] + ']').join('');
      W.read(
        st.name + '\n\n' +
        'shape:    ' + (ord ? st.dims.map(grp).join(' × ') : '1 × 1') + '\n' +
        'order:    ' + ord + '   (' + ord + ' ' + (ord === 1 ? 'index' : 'indices') + ' to reach one element)\n' +
        'elements: ' + grp(n) + '\n' +
        'access:   ' + idx + '\n\n' +
        'THE LADDER\n' +
        '  order 0   scalar    5\n' +
        '  order 1   vector    v[i]\n' +
        '  order 2   matrix    A[i][j]\n' +
        '  order 3   tensor    T[i][j][k]\n\n' +
        'In ML a tensor is an n-dimensional array, this.\n' +
        'In pure maths it means a multilinear function, which\n' +
        'is a different and much heavier idea.'
      );
    }
    const bar = W.ui.bar(W.ui.buttons([
      { label: 'scalar', fn: () => { st.dims = []; st.name = 'a single number'; draw(); } },
      { label: 'embedding R⁷⁶⁸', fn: () => { st.dims = [768]; st.name = 'one word embedding'; draw(); } },
      { label: 'weight 1000×768', fn: () => { st.dims = [1000, 768]; st.name = 'one layer’s weight matrix'; draw(); } },
      { label: 'RGB image', fn: () => { st.dims = [224, 224, 3]; st.name = 'one colour image . H × W × channels'; draw(); } },
      { label: 'batch', fn: () => { st.dims = [32, 128, 768]; st.name = 'batch of sentences, batch × tokens × d'; draw(); } },
      { label: 'video batch', fn: () => { st.dims = [8, 16, 224, 224]; st.name = 'batch of video clips, order 4'; draw(); } }
    ]));
    return {
      cv: pl.cv, extra: bar, draw: draw,
      reset: function () { st.dims = [32, 128, 768]; st.name = 'batch of sentences, batch × tokens × d'; draw(); },
      steps: function () {
        const ord = st.dims.length;
        return [
          'Order is how many indices you need to reach one element. This has order ' + ord + '.',
          'Its shape is ' + (ord ? st.dims.map(grp).join(' × ') : '1 × 1') + '.',
          'Multiply the shape out and you get ' + grp(count()) + ' individual numbers.',
          'Order 0 is a scalar, 1 a vector, 2 a matrix. Everything above 2 is just called a tensor.',
          'Try the buttons. A batch of sentences is order 3. That is the shape a transformer actually eats.'
        ];
      }
    };
  });

  /* ============ A - addition ============ */
  W.register('add', function () {
    const pl = W.Plane(560, 380, 44);
    const a = { x: 3, y: 1 }, b = { x: 1, y: 2 };
    function draw() {
      pl.clear();
      const s = { x: a.x + b.x, y: a.y + b.y };
      pl.shape([[0, 0], [a.x, a.y], [s.x, s.y], [b.x, b.y]], 'rgba(20,20,15,.06)', null);
      pl.vec(b.x, b.y, OX, 'b');
      pl.vec(s.x, s.y, OX, null, { fromX: a.x, fromY: a.y, dash: [5, 4], width: 1.6 });
      pl.vec(a.x, a.y, INK, 'a');
      pl.vec(s.x, s.y, INK, 'a+b', { width: 3 });
      pl.handle(a.x, a.y, INK); pl.handle(b.x, b.y, OX);
      W.read(
        W.sideBySide([['a ='], W.colBlock([a.x, a.y]), ['+'], ['b ='], W.colBlock([b.x, b.y])], 1) + '\n\n' +
        W.sideBySide([['a+b ='], W.colBlock([a.x + ' + ' + b.x, a.y + ' + ' + b.y]), ['='],
          W.colBlock([a.x + b.x, a.y + b.y])], 1) + '\n\n' +
        'b+a = [' + (b.x + a.x) + ', ' + (b.y + a.y) + '], same point, order does not matter'
      );
    }
    W.attachDrag(pl, () => [a, b], function (i, x, y) {
      const t = i === 0 ? a : b; t.x = x; t.y = y; draw();
    });
    return {
      cv: pl.cv, draw: draw,
      reset: function () { a.x = 3; a.y = 1; b.x = 1; b.y = 2; draw(); },
      steps: () => [
        'Add the first components: ' + a.x + ' + ' + b.x + ' = ' + (a.x + b.x) + '.',
        'Add the second components: ' + a.y + ' + ' + b.y + ' = ' + (a.y + b.y) + '.',
        'a + b = [' + (a.x + b.x) + ', ' + (a.y + b.y) + '].',
        'The dashed arrow is b slid so its tail sits on a’s head. The sum runs from the origin to where it finishes.',
        'b + a lands in the same place, the shaded parallelogram is why. Addition is commutative.'
      ]
    };
  });

  /* ============ S - subtraction ============ */
  W.register('sub', function () {
    const pl = W.Plane(560, 380, 44);
    const a = { x: 1, y: 1 }, b = { x: 4, y: 3 };
    function draw() {
      pl.clear();
      const d = { x: b.x - a.x, y: b.y - a.y };
      pl.vec(a.x, a.y, INK, 'a');
      pl.vec(b.x, b.y, INK, 'b');
      pl.vec(b.x, b.y, OX, 'b−a', { fromX: a.x, fromY: a.y, width: 3 });
      pl.vec(d.x, d.y, OX, null, { dash: [5, 4], width: 1.6 });
      pl.handle(a.x, a.y, INK); pl.handle(b.x, b.y, INK);
      W.read(
        W.sideBySide([['a ='], W.colBlock([a.x, a.y]), ['   b ='], W.colBlock([b.x, b.y])], 1) + '\n\n' +
        W.sideBySide([['b−a ='], W.colBlock([b.x + ' − ' + a.x, b.y + ' − ' + a.y]), ['='],
          W.colBlock([b.x - a.x, b.y - a.y])], 1) + '\n\n' +
        'a−b = [' + (a.x - b.x) + ', ' + (a.y - b.y) + '], same length, opposite way\n\n' +
        '‖b−a‖ = √(' + (b.x - a.x) + '² + ' + (b.y - a.y) + '²) = ' + f(Math.hypot(d.x, d.y)) +
        '   ← the distance from a to b'
      );
    }
    W.attachDrag(pl, () => [a, b], function (i, x, y) {
      const t = i === 0 ? a : b; t.x = x; t.y = y; draw();
    });
    return {
      cv: pl.cv, draw: draw,
      reset: function () { a.x = 1; a.y = 1; b.x = 4; b.y = 3; draw(); },
      steps: () => [
        'Subtract the first components: ' + b.x + ' − ' + a.x + ' = ' + (b.x - a.x) + '.',
        'Subtract the second: ' + b.y + ' − ' + a.y + ' = ' + (b.y - a.y) + '.',
        'b − a = [' + (b.x - a.x) + ', ' + (b.y - a.y) + '].',
        'The solid red arrow is drawn from a’s head to b’s head, b−a is the trip that takes you from a to b.',
        'Its length, ' + f(Math.hypot(b.x - a.x, b.y - a.y)) + ', is the distance between the two points.'
      ]
    };
  });

  /* ============ K - scalar multiple ============ */
  W.register('scale', function () {
    const pl = W.Plane(560, 380, 44);
    const st = { x: 2, y: 1, k: 2 };
    let sl = null;
    function draw() {
      pl.clear();
      pl.line(st.x, st.y, 'rgba(20,20,15,.10)', 8);
      const kx = st.k * st.x, ky = st.k * st.y;
      pl.vec(kx, ky, OX, 'kv', { width: 3 });
      pl.vec(st.x, st.y, INK, 'v');
      pl.handle(st.x, st.y, INK);
      const nv = Math.hypot(st.x, st.y), nk = Math.hypot(kx, ky);
      W.read(
        'k = ' + f(st.k) + '\n\n' +
        W.sideBySide([['kv = ' + f(st.k)], W.colBlock([st.x, st.y]), ['='],
          W.colBlock([f(kx), f(ky)])], 1) + '\n\n' +
        '‖v‖  = ' + f(nv) + '\n' +
        '‖kv‖ = ' + f(nk) + '\n' +
        '|k|·‖v‖ = ' + f(Math.abs(st.k)) + ' × ' + f(nv) + ' = ' + f(Math.abs(st.k) * nv) + '   ✓ matches\n\n' +
        'direction: ' + (st.k > 0 ? 'unchanged' : st.k < 0 ? 'reversed' : 'none, kv is the zero vector')
      );
    }
    W.attachDrag(pl, () => [st], (i, x, y) => { st.x = x; st.y = y; draw(); });
    sl = W.ui.slider('k', -3, 3, 0.5, 2, v => { st.k = v; draw(); });
    const bar = W.ui.bar(sl.el, W.ui.note('drag v · slide k past zero to flip it'));
    return {
      cv: pl.cv, extra: bar, draw: draw,
      reset: function () { st.x = 2; st.y = 1; st.k = 2; sl.set(2); draw(); },
      steps: function () {
        const nv = Math.hypot(st.x, st.y);
        return [
          'Multiply every component by k: kv = [' + f(st.k * st.x) + ', ' + f(st.k * st.y) + '].',
          'The arrow stays on the same faint line through the origin, however you set k.',
          'Length scales by |k|, not by k: ‖kv‖ = |k|·‖v‖ = ' + f(Math.abs(st.k)) + ' × ' + f(nv) + ' = ' + f(Math.abs(st.k) * nv) + '.',
          st.k < 0 ? 'k is negative, so kv points the opposite way. The length is still positive.'
            : 'Push k below zero and kv flips to the opposite direction. The length stays positive.',
          'k = 0 collapses kv to the zero vector, which has no direction at all.'
        ];
      }
    };
  });

  /* ============ C - linear combination ============ */
  W.register('lincomb', function () {
    const pl = W.Plane(560, 380, 44);
    const a = { x: 2, y: 1 }, b = { x: 1, y: 2 }, st = { c1: 1, c2: 1 };
    let s1, s2;
    function draw() {
      pl.clear();
      const p1 = { x: st.c1 * a.x, y: st.c1 * a.y };
      const p2 = { x: st.c2 * b.x, y: st.c2 * b.y };
      const r = { x: p1.x + p2.x, y: p1.y + p2.y };
      pl.line(a.x, a.y, 'rgba(20,20,15,.07)', 7);
      pl.line(b.x, b.y, 'rgba(140,58,30,.07)', 7);
      pl.vec(a.x, a.y, 'rgba(20,20,15,.45)', 'a', { width: 1.6 });
      pl.vec(b.x, b.y, 'rgba(140,58,30,.45)', 'b', { width: 1.6 });
      pl.vec(p1.x, p1.y, INK, null, { dash: [5, 4], width: 1.8 });
      pl.vec(r.x, r.y, OX, null, { fromX: p1.x, fromY: p1.y, dash: [5, 4], width: 1.8 });
      pl.vec(r.x, r.y, INK, 'c₁a + c₂b', { width: 3 });
      pl.handle(a.x, a.y, INK); pl.handle(b.x, b.y, OX);
      const det = a.x * b.y - b.x * a.y;
      W.read(
        'c₁ = ' + f(st.c1) + '     c₂ = ' + f(st.c2) + '\n\n' +
        W.sideBySide([[f(st.c1)], W.colBlock([a.x, a.y]), ['+ ' + f(st.c2)], W.colBlock([b.x, b.y]),
          ['='], W.colBlock([f(p1.x) + ' + ' + f(p2.x), f(p1.y) + ' + ' + f(p2.y)]),
          ['='], W.colBlock([f(r.x), f(r.y)])], 1) + '\n\n' +
        'det[a b] = (' + a.x + '×' + b.y + ') − (' + b.x + '×' + a.y + ') = ' + det + '\n' +
        (det === 0
          ? 'a and b are dependent → these combinations only ever reach one line'
          : 'a and b are independent → these combinations reach every point in R²')
      );
    }
    W.attachDrag(pl, () => [a, b], function (i, x, y) {
      const t = i === 0 ? a : b; t.x = x; t.y = y; draw();
    });
    s1 = W.ui.slider('c₁', -3, 3, 0.5, 1, v => { st.c1 = v; draw(); });
    s2 = W.ui.slider('c₂', -3, 3, 0.5, 1, v => { st.c2 = v; draw(); });
    const bar = W.ui.bar(s1.el, s2.el, W.ui.note('drag a and b · try making them parallel'));
    return {
      cv: pl.cv, extra: bar, draw: draw,
      reset: function () { a.x = 2; a.y = 1; b.x = 1; b.y = 2; st.c1 = 1; st.c2 = 1; s1.set(1); s2.set(1); draw(); },
      steps: function () {
        const det = a.x * b.y - b.x * a.y;
        return [
          'Scale a by c₁ = ' + f(st.c1) + '. That is the first dashed arrow.',
          'Scale b by c₂ = ' + f(st.c2) + ', the second dashed arrow, laid head to tail.',
          'Add them: c₁a + c₂b = [' + f(st.c1 * a.x + st.c2 * b.x) + ', ' + f(st.c1 * a.y + st.c2 * b.y) + '].',
          'Every choice of c₁ and c₂ gives a different reachable point. That whole set is the span.',
          det === 0
            ? 'You have made a and b parallel: det = 0, so no combination escapes the line. The span has collapsed.'
            : 'det = ' + det + ' ≠ 0, so a and b are independent and these two arrows can reach anywhere in R².'
        ];
      }
    };
  });

  /* ============ N - magnitude ============ */
  W.register('magnitude', function () {
    const pl = W.Plane(560, 380, 44);
    const st = { x: 3, y: 4 };
    function draw() {
      pl.clear();
      pl.shape([[0, 0], [st.x, 0], [st.x, st.y]], 'rgba(140,58,30,.09)', null);
      pl.seg(0, 0, st.x, 0, OX, null, 2.4);
      pl.seg(st.x, 0, st.x, st.y, OX, null, 2.4);
      if (st.x && st.y) pl.rightAngle(st.x > 0 ? -0.4 : 0.4, 0, 0, st.y > 0 ? 0.4 : -0.4, 1);
      pl.vec(st.x, st.y, INK, 'v', { width: 3 });
      pl.handle(st.x, st.y, INK);
      pl.text(st.x / 2, 0, '|' + st.x + '|', OX);
      pl.text(st.x, st.y / 2, '|' + st.y + '|', OX);
      const sq = st.x * st.x + st.y * st.y;
      W.read(
        W.sideBySide([['v ='], W.colBlock([st.x, st.y])], 1) + '\n\n' +
        '‖v‖ = √(v₁² + v₂²)\n' +
        '    = √(' + st.x + '² + ' + st.y + '²)\n' +
        '    = √(' + (st.x * st.x) + ' + ' + (st.y * st.y) + ')\n' +
        '    = √' + sq + '\n' +
        '    = ' + f(Math.sqrt(sq), 4) + '\n\n' +
        'The two red legs and the arrow form a right triangle.\nThis is Pythagoras, nothing more.'
      );
    }
    W.attachDrag(pl, () => [st], (i, x, y) => { st.x = x; st.y = y; draw(); });
    return {
      cv: pl.cv, draw: draw,
      reset: function () { st.x = 3; st.y = 4; draw(); },
      steps: function () {
        const sq = st.x * st.x + st.y * st.y;
        return [
          'The horizontal leg is |' + st.x + '| and the vertical leg is |' + st.y + '|.',
          'Square them: ' + (st.x * st.x) + ' and ' + (st.y * st.y) + '.',
          'Add: ' + (st.x * st.x) + ' + ' + (st.y * st.y) + ' = ' + sq + '.',
          'Take the square root: ‖v‖ = √' + sq + ' = ' + f(Math.sqrt(sq), 4) + '.',
          'In Rⁿ nothing changes except the number of terms: ‖v‖ = √(v₁² + … + vₙ²).'
        ];
      }
    };
  });

  /* ============ U - normalisation ============ */
  W.register('normalise', function () {
    const pl = W.Plane(560, 380, 40);
    const st = { x: 3, y: 4 };
    function draw() {
      pl.clear();
      pl.circle(1, 'rgba(140,58,30,.55)', [4, 4]);
      const n = Math.hypot(st.x, st.y);
      pl.vec(st.x, st.y, INK, 'v');
      if (n) pl.vec(st.x / n, st.y / n, OX, 'v̂', { width: 3 });
      pl.handle(st.x, st.y, INK);
      W.read(
        W.sideBySide([['v ='], W.colBlock([st.x, st.y])], 1) + '\n\n' +
        '‖v‖ = √(' + (st.x * st.x) + ' + ' + (st.y * st.y) + ') = ' + f(n, 4) + '\n\n' +
        (n ? W.sideBySide([['v̂ = v/‖v‖ ='], W.colBlock([f(st.x / n, 4), f(st.y / n, 4)])], 1) : 'v̂ undefined') + '\n\n' +
        (n ? '‖v̂‖ = √(' + f((st.x / n) * (st.x / n), 4) + ' + ' + f((st.y / n) * (st.y / n), 4) + ') = ' +
          f(Math.hypot(st.x / n, st.y / n), 4) + '   ✓ exactly 1'
          : 'the zero vector cannot be normalised, since you would divide by zero') + '\n\n' +
        'v̂ always lands on the dashed unit circle.'
      );
    }
    W.attachDrag(pl, () => [st], (i, x, y) => { st.x = x; st.y = y; draw(); }, { bx: 6, by: 4 });
    return {
      cv: pl.cv, draw: draw,
      reset: function () { st.x = 3; st.y = 4; draw(); },
      steps: function () {
        const n = Math.hypot(st.x, st.y);
        return [
          'First find the length: ‖v‖ = ' + f(n, 4) + '.',
          'Divide each component by it: ' + st.x + '/' + f(n, 4) + ' = ' + f(st.x / n, 4) +
            ' and ' + st.y + '/' + f(n, 4) + ' = ' + f(st.y / n, 4) + '.',
          'That is v̂, the red arrow, sitting exactly on the unit circle.',
          'Check it: ‖v̂‖ = ' + f(Math.hypot(st.x / n, st.y / n), 4) + '. Every non-zero vector normalises to length 1.',
          'Direction survives, magnitude is discarded. That is exactly what cosine similarity needs.'
        ];
      }
    };
  });

  /* ============ D - distance ============ */
  W.register('distance', function () {
    const pl = W.Plane(560, 380, 44);
    const a = { x: -1, y: -1 }, b = { x: 2, y: 3 };
    function draw() {
      pl.clear();
      const dx = b.x - a.x, dy = b.y - a.y;
      pl.shape([[a.x, a.y], [b.x, a.y], [b.x, b.y]], 'rgba(140,58,30,.09)', null);
      pl.seg(a.x, a.y, b.x, a.y, OX, null, 2);
      pl.seg(b.x, a.y, b.x, b.y, OX, null, 2);
      pl.seg(a.x, a.y, b.x, b.y, INK, null, 3);
      pl.dot(a.x, a.y, INK, 5); pl.dot(b.x, b.y, INK, 5);
      pl.text(a.x, a.y, 'a', INK); pl.text(b.x, b.y, 'b', INK);
      pl.text((a.x + b.x) / 2, a.y, '|' + dx + '|', OX);
      pl.text(b.x, (a.y + b.y) / 2, '|' + dy + '|', OX);
      const sq = dx * dx + dy * dy;
      W.read(
        W.sideBySide([['a ='], W.colBlock([a.x, a.y]), ['   b ='], W.colBlock([b.x, b.y])], 1) + '\n\n' +
        W.sideBySide([['b−a ='], W.colBlock([dx, dy])], 1) + '\n\n' +
        'd(a,b) = ‖b−a‖\n' +
        '       = √(' + dx + '² + ' + dy + '²)\n' +
        '       = √' + sq + '\n' +
        '       = ' + f(Math.sqrt(sq), 4) + '\n\n' +
        'd(b,a) = ' + f(Math.sqrt(sq), 4) + ', reversing flips both signs, squaring undoes it'
      );
    }
    W.attachDrag(pl, () => [a, b], function (i, x, y) {
      const t = i === 0 ? a : b; t.x = x; t.y = y; draw();
    }, { by: 4 });
    return {
      cv: pl.cv, draw: draw,
      reset: function () { a.x = -1; a.y = -1; b.x = 2; b.y = 3; draw(); },
      steps: function () {
        const dx = b.x - a.x, dy = b.y - a.y, sq = dx * dx + dy * dy;
        return [
          'Subtract to get the arrow from a to b: b − a = [' + dx + ', ' + dy + '].',
          'Its legs are |' + dx + '| across and |' + dy + '| up, the shaded right triangle.',
          'Square and add: ' + (dx * dx) + ' + ' + (dy * dy) + ' = ' + sq + '.',
          'Square root: d(a,b) = ' + f(Math.sqrt(sq), 4) + '.',
          'Distance is just the magnitude of a difference. Nothing new, item 1.5 followed by item 1.7.'
        ];
      }
    };
  });

  /* ============ P - dot product ============ */
  W.register('dot', function () {
    const pl = W.Plane(560, 380, 44);
    const a = { x: 3, y: 1 }, b = { x: 1, y: 3 };
    function draw() {
      pl.clear();
      pl.vec(a.x, a.y, INK, 'a');
      pl.vec(b.x, b.y, OX, 'b');
      pl.handle(a.x, a.y, INK); pl.handle(b.x, b.y, OX);
      const d = a.x * b.x + a.y * b.y;
      const na = Math.hypot(a.x, a.y), nb = Math.hypot(b.x, b.y);
      const cos = (na && nb) ? d / (na * nb) : 0;
      const deg = Math.acos(Math.max(-1, Math.min(1, cos))) * 180 / Math.PI;
      W.read(
        W.sideBySide([['a ='], W.colBlock([a.x, a.y]), ['   b ='], W.colBlock([b.x, b.y])], 1) + '\n\n' +
        'a·b = (' + a.x + '×' + b.x + ') + (' + a.y + '×' + b.y + ')\n' +
        '    = ' + (a.x * b.x) + ' ' + W.sgn(a.y * b.y) + '\n' +
        '    = ' + d + '        ← a scalar, not a vector\n\n' +
        '‖a‖ = ' + f(na, 4) + '   ‖b‖ = ' + f(nb, 4) + '\n' +
        'cos θ = ' + d + ' / (' + f(na, 4) + ' × ' + f(nb, 4) + ') = ' + f(cos, 4) + '\n' +
        'θ = ' + f(deg, 2) + '°\n\n' +
        (d > 0 ? 'a·b > 0  →  θ < 90°' : d < 0 ? 'a·b < 0  →  θ > 90°' : 'a·b = 0  →  θ = 90°, orthogonal')
      );
    }
    W.attachDrag(pl, () => [a, b], function (i, x, y) {
      const t = i === 0 ? a : b; t.x = x; t.y = y; draw();
    });
    return {
      cv: pl.cv, draw: draw,
      reset: function () { a.x = 3; a.y = 1; b.x = 1; b.y = 3; draw(); },
      steps: function () {
        const d = a.x * b.x + a.y * b.y;
        return [
          'Multiply the first components: ' + a.x + ' × ' + b.x + ' = ' + (a.x * b.x) + '.',
          'Multiply the second components: ' + a.y + ' × ' + b.y + ' = ' + (a.y * b.y) + '.',
          'Add them. a·b = ' + d + ', one number, not a vector.',
          d === 0 ? 'It came out zero, so the two arrows are exactly perpendicular.'
            : d > 0 ? 'It is positive, so the angle between them is under 90°.'
              : 'It is negative, so the angle between them is over 90°.',
          'Divide by both lengths and you have cos θ. That single step turns a dot product into cosine similarity.'
        ];
      }
    };
  });

  /* ============ G - angle ============ */
  W.register('angle', function () {
    const pl = W.Plane(560, 380, 44);
    const a = { x: 4, y: 0 }, b = { x: 2, y: 3 };
    function draw() {
      pl.clear();
      const na = Math.hypot(a.x, a.y), nb = Math.hypot(b.x, b.y);
      if (na && nb) pl.arc(a.x, a.y, b.x, b.y, 1.1, INK);
      pl.vec(a.x, a.y, INK, 'a');
      pl.vec(b.x, b.y, OX, 'b');
      pl.handle(a.x, a.y, INK); pl.handle(b.x, b.y, OX);
      const d = a.x * b.x + a.y * b.y;
      const cos = (na && nb) ? d / (na * nb) : 0;
      const deg = Math.acos(Math.max(-1, Math.min(1, cos))) * 180 / Math.PI;
      const mid = { x: (a.x / (na || 1) + b.x / (nb || 1)) / 2, y: (a.y / (na || 1) + b.y / (nb || 1)) / 2 };
      pl.text(mid.x * 1.35, mid.y * 1.35, f(deg, 1) + '°', INK);
      W.read(
        'a·b = ' + d + '\n' +
        '‖a‖ = ' + f(na, 4) + '\n' +
        '‖b‖ = ' + f(nb, 4) + '\n\n' +
        '            a·b            ' + d + '\n' +
        'cos θ = ───────────  =  ─────────────── = ' + f(cos, 4) + '\n' +
        '         ‖a‖ ‖b‖        ' + f(na, 3) + ' × ' + f(nb, 3) + '\n\n' +
        'θ = arccos(' + f(cos, 4) + ') = ' + f(deg, 2) + '°\n\n' +
        'CASES\n' +
        '  a·b > 0   θ < 90°    broadly agree\n' +
        '  a·b = 0   θ = 90°    perpendicular\n' +
        '  a·b < 0   θ > 90°    broadly oppose'
      );
    }
    W.attachDrag(pl, () => [a, b], function (i, x, y) {
      const t = i === 0 ? a : b; t.x = x; t.y = y; draw();
    });
    return {
      cv: pl.cv, draw: draw,
      reset: function () { a.x = 4; a.y = 0; b.x = 2; b.y = 3; draw(); },
      steps: function () {
        const na = Math.hypot(a.x, a.y), nb = Math.hypot(b.x, b.y);
        const d = a.x * b.x + a.y * b.y, cos = d / (na * nb);
        const deg = Math.acos(Math.max(-1, Math.min(1, cos))) * 180 / Math.PI;
        return [
          'Start from a·b = ‖a‖‖b‖cos θ, the dot product already contains the angle.',
          'Compute the dot product: ' + d + '.',
          'Compute both lengths: ' + f(na, 4) + ' and ' + f(nb, 4) + '.',
          'Divide: cos θ = ' + d + ' / ' + f(na * nb, 4) + ' = ' + f(cos, 4) + '.',
          'Take arccos: θ = ' + f(deg, 2) + '°. The arc on the canvas is that angle.'
        ];
      }
    };
  });

  /* ============ O - orthogonality ============ */
  W.register('ortho', function () {
    const pl = W.Plane(560, 380, 44);
    const a = { x: 3, y: 1 }, b = { x: -1, y: 3 };
    function draw() {
      pl.clear();
      pl.line(-a.y, a.x, 'rgba(140,58,30,.14)', 8);
      const d = a.x * b.x + a.y * b.y;
      pl.vec(a.x, a.y, INK, 'a');
      pl.vec(b.x, b.y, OX, 'b');
      if (d === 0 && (a.x || a.y) && (b.x || b.y)) pl.rightAngle(a.x, a.y, b.x, b.y, 0.55);
      pl.handle(a.x, a.y, INK); pl.handle(b.x, b.y, OX);
      W.read(
        'a·b = (' + a.x + '×' + b.x + ') + (' + a.y + '×' + b.y + ')\n' +
        '    = ' + (a.x * b.x) + ' ' + W.sgn(a.y * b.y) + '\n' +
        '    = ' + d + '\n\n' +
        (d === 0 ? '→  a ⊥ b        exactly perpendicular'
          : '→  not orthogonal   (drag b onto the faint red line)') + '\n\n' +
        'THE SHORTCUT\n' +
        'A perpendicular to [x, y] is [−y, x].\n' +
        'Here that is [' + (-a.y) + ', ' + a.x + '].\n' +
        'Check: (' + a.x + '×' + (-a.y) + ') + (' + a.y + '×' + a.x + ') = ' +
        (a.x * -a.y) + ' + ' + (a.y * a.x) + ' = 0   ✓ always\n\n' +
        'No trigonometry anywhere, one multiply-and-add decides it.'
      );
    }
    W.attachDrag(pl, () => [a, b], function (i, x, y) {
      const t = i === 0 ? a : b; t.x = x; t.y = y; draw();
    });
    return {
      cv: pl.cv, draw: draw,
      reset: function () { a.x = 3; a.y = 1; b.x = -1; b.y = 3; draw(); },
      steps: function () {
        const d = a.x * b.x + a.y * b.y;
        return [
          'Orthogonal just means perpendicular. The test is a single number.',
          'Compute a·b = ' + d + '.',
          d === 0 ? 'It is zero, so a ⊥ b. The small square marks the right angle.'
            : 'It is ' + d + ', not zero, so they are not perpendicular yet. Drag b onto the faint red line.',
          'Why zero means 90°: a·b = ‖a‖‖b‖cos θ, and cos 90° = 0, so the whole product vanishes.',
          'The quick perpendicular to [x, y] is [−y, x], here [' + (-a.y) + ', ' + a.x + ']. It works for any vector.'
        ];
      }
    };
  });

  /* ============ Q - cosine similarity ============ */
  W.register('cosine', function () {
    const pl = W.Plane(560, 380, 52);
    const a = { x: 3, y: 1 }, b = { x: 1, y: 3 }, st = { t: 1 };
    let sl;
    function draw() {
      pl.clear();
      pl.circle(1, 'rgba(20,20,15,.3)', [4, 4]);
      const bs = { x: b.x * st.t, y: b.y * st.t };
      const na = Math.hypot(a.x, a.y), nb = Math.hypot(bs.x, bs.y);
      pl.vec(a.x, a.y, 'rgba(20,20,15,.35)', null, { width: 1.6 });
      pl.vec(bs.x, bs.y, 'rgba(140,58,30,.35)', null, { width: 1.6 });
      if (na) pl.vec(a.x / na, a.y / na, INK, 'â', { width: 3 });
      if (nb) pl.vec(bs.x / nb, bs.y / nb, OX, 'b̂', { width: 3 });
      pl.handle(a.x, a.y, INK); pl.handle(b.x, b.y, OX);
      const dRaw = a.x * b.x + a.y * b.y;
      const dScaled = a.x * bs.x + a.y * bs.y;
      const nbRaw = Math.hypot(b.x, b.y);
      const cos = (na && nb) ? dScaled / (na * nb) : 0;
      const deg = Math.acos(Math.max(-1, Math.min(1, cos))) * 180 / Math.PI;
      W.read(
        'scale on b:  t = ' + f(st.t) + '\n\n' +
        '           a·b      ‖a‖‖b‖     cos θ\n' +
        't = 1     ' + W.pad(f(dRaw, 2), 6) + '   ' + W.pad(f(na * nbRaw, 3), 8) + '   ' +
        f((na && nbRaw) ? dRaw / (na * nbRaw) : 0, 4) + '\n' +
        't = ' + W.pad(f(st.t), 3) + '   ' + W.pad(f(dScaled, 2), 6) + '   ' + W.pad(f(na * nb, 3), 8) + '   ' + f(cos, 4) + '\n\n' +
        'The dot product changes with t.\n' +
        'cos θ does not, the t cancels:\n\n' +
        '   t(a·b)        a·b\n' +
        '  ─────────  =  ───────\n' +
        '  ‖a‖·t‖b‖      ‖a‖‖b‖\n\n' +
        'θ = ' + f(deg, 2) + '°   ·   range −1 ≤ cos θ ≤ 1\n' +
        '  1 same direction · 0 perpendicular · −1 opposite'
      );
    }
    W.attachDrag(pl, () => [a, b], function (i, x, y) {
      const t = i === 0 ? a : b; t.x = x; t.y = y; draw();
    }, { bx: 5, by: 3 });
    sl = W.ui.slider('t', 0.25, 3, 0.25, 1, v => { st.t = v; draw(); });
    const bar = W.ui.bar(sl.el, W.ui.note('stretch b and watch cos θ refuse to move'));
    return {
      cv: pl.cv, extra: bar, draw: draw,
      reset: function () { a.x = 3; a.y = 1; b.x = 1; b.y = 3; st.t = 1; sl.set(1); draw(); },
      steps: function () {
        const na = Math.hypot(a.x, a.y), nb = Math.hypot(b.x, b.y);
        const d = a.x * b.x + a.y * b.y;
        const cos = d / (na * nb);
        return [
          'Cosine similarity is the dot product divided by both lengths: ' + f(cos, 4) + '.',
          'Normalise each arrow and it lands on the dashed unit circle, those are â and b̂.',
          'Now drag the t slider. The dot product changes: t = ' + f(st.t) + ' scales it to ' + f(d * st.t, 2) + '.',
          'But cos θ stays at ' + f(cos, 4) + '. The t appears in the numerator and the denominator and cancels.',
          'That is the whole point: it measures direction and ignores magnitude, which is why embeddings are compared this way.'
        ];
      }
    };
  });

  /* ============ L1 - L1 norm ============ */
  W.register('l1norm', function () {
    const pl = W.Plane(560, 380, 44);
    const st = { x: 3, y: -4 };
    const DIAMOND = [[1, 0], [0, 1], [-1, 0], [0, -1]];
    function draw() {
      pl.clear();
      pl.shape(DIAMOND, 'rgba(140,58,30,.07)', 'rgba(140,58,30,.35)');
      pl.seg(0, 0, st.x, 0, OX, [3, 3]);
      pl.seg(st.x, 0, st.x, st.y, OX, [3, 3]);
      pl.vec(st.x, st.y, INK, 'v', { width: 3 });
      pl.handle(st.x, st.y, INK);
      const n = Math.abs(st.x) + Math.abs(st.y);
      W.read(
        W.sideBySide([['v ='], W.colBlock([st.x, st.y])], 1) + '\n\n' +
        '‖v‖₁ = |v₁| + |v₂|\n' +
        '     = |' + st.x + '| + |' + st.y + '|\n' +
        '     = ' + Math.abs(st.x) + ' + ' + Math.abs(st.y) + '\n' +
        '     = ' + f(n) + '\n\n' +
        'MANHATTAN / TAXICAB NORM\n' +
        'The dashed red path is the distance a taxi drives:\n' +
        'across ' + Math.abs(st.x) + ' then up ' + Math.abs(st.y) + '. It never cuts the corner.\n\n' +
        'unit ball: the diamond of all vectors with ‖v‖₁ = 1'
      );
    }
    W.attachDrag(pl, () => [st], (i, x, y) => { st.x = x; st.y = y; draw(); }, { bx: 5, by: 4 });
    return {
      cv: pl.cv, draw: draw,
      reset: function () { st.x = 3; st.y = -4; draw(); },
      steps: function () {
        return [
          'The L1 norm adds absolute values: ‖v‖₁ = |' + st.x + '| + |' + st.y + '| = ' + f(Math.abs(st.x) + Math.abs(st.y)) + '.',
          'The dashed red path shows the Manhattan route, horizontal then vertical, never diagonal.',
          'Absolute values mean the sign of each component is ignored. Only distance from the axes counts.',
          'The diamond is the unit ball: every point on it has ‖v‖₁ = 1. Notice it has corners on the axes.',
          'L1 favours axis-aligned directions: a unit step along an axis costs 1, but a diagonal step of the same L2 length costs more.'
        ];
      }
    };
  });

  /* ============ LI - L∞ norm ============ */
  W.register('linfnorm', function () {
    const pl = W.Plane(560, 380, 44);
    const st = { x: 3, y: -4 };
    function draw() {
      pl.clear();
      const box = [[-1, -1], [1, -1], [1, 1], [-1, 1]];
      pl.shape(box, 'rgba(140,58,30,.07)', 'rgba(140,58,30,.35)');
      const m = Math.max(Math.abs(st.x), Math.abs(st.y));
      const sq = [[-m, -m], [m, -m], [m, m], [-m, m]];
      pl.shape(sq, 'rgba(20,20,15,.04)', 'rgba(20,20,15,.3)');
      pl.vec(st.x, st.y, INK, 'v', { width: 3 });
      pl.handle(st.x, st.y, INK);
      W.read(
        W.sideBySide([['v ='], W.colBlock([st.x, st.y])], 1) + '\n\n' +
        '‖v‖∞ = max(|v₁|, |v₂|)\n' +
        '     = max(|' + st.x + '|, |' + st.y + '|)\n' +
        '     = max(' + Math.abs(st.x) + ', ' + Math.abs(st.y) + ')\n' +
        '     = ' + f(m) + '\n\n' +
        'MAX / CHEBYSHEV NORM\n' +
        'Only the single biggest component matters.\n' +
        'The faint square shows every vector with ‖v‖∞ = ' + f(m) + '\n' +
        ', the square just touches the larger of the two components.\n\n' +
        'unit ball: the square of all vectors with ‖v‖∞ = 1'
      );
    }
    W.attachDrag(pl, () => [st], (i, x, y) => { st.x = x; st.y = y; draw(); }, { bx: 5, by: 4 });
    return {
      cv: pl.cv, draw: draw,
      reset: function () { st.x = 3; st.y = -4; draw(); },
      steps: function () {
        const m = Math.max(Math.abs(st.x), Math.abs(st.y));
        return [
          'The L∞ norm takes the largest absolute component: max(|' + st.x + '|, |' + st.y + '|) = ' + f(m) + '.',
          'It ignores every component except the biggest. Here the winner is ' + (Math.abs(st.x) >= Math.abs(st.y) ? '|x| = ' + Math.abs(st.x) : '|y| = ' + Math.abs(st.y)) + '.',
          'The faint square shows all vectors with the same L∞ value. Drag the handle and it snaps to the larger component.',
          'The unit ball is a square. L∞ measures “how far out the box reaches”, not the true diagonal length.',
          '[5,0] and [5,1000] have the same L∞ norm, proof that a single large component can dominate everything else.'
        ];
      }
    };
  });

  /* ============ NC - compare norms ============ */
  W.register('normcompare', function () {
    const pl = W.Plane(560, 380, 52);
    const st = { x: 3, y: 2 };
    const DIAMOND = [[1, 0], [0, 1], [-1, 0], [0, -1]];
    const SQUARE = [[-1, -1], [1, -1], [1, 1], [-1, 1]];
    function draw() {
      pl.clear();
      pl.shape(DIAMOND, 'rgba(140,58,30,.08)', 'rgba(140,58,30,.45)');
      pl.circle(1, 'rgba(20,20,15,.45)', [4, 4]);
      pl.shape(SQUARE, 'rgba(20,20,15,.04)', 'rgba(20,20,15,.45)');
      pl.vec(st.x, st.y, INK, 'v', { width: 3 });
      pl.handle(st.x, st.y, INK);
      const l1 = Math.abs(st.x) + Math.abs(st.y);
      const l2 = Math.hypot(st.x, st.y);
      const li = Math.max(Math.abs(st.x), Math.abs(st.y));
      const scaled = l2 ? { x: st.x / l2, y: st.y / l2 } : { x: 0, y: 0 };
      pl.dot(scaled.x, scaled.y, OX, 4);
      W.read(
        W.sideBySide([['v ='], W.colBlock([st.x, st.y])], 1) + '\n\n' +
        '‖v‖₁  = |' + st.x + '| + |' + st.y + '|  = ' + f(l1) + '\n' +
        '‖v‖₂  = √(' + (st.x * st.x) + ' + ' + (st.y * st.y) + ')  = ' + f(l2, 4) + '\n' +
        '‖v‖∞  = max(' + Math.abs(st.x) + ', ' + Math.abs(st.y) + ')  = ' + f(li) + '\n\n' +
        'ORDER\n' +
        '  ‖v‖∞ ≤ ‖v‖₂ ≤ ‖v‖₁\n' +
        '  ' + f(li) + ' ≤ ' + f(l2, 4) + ' ≤ ' + f(l1) + '\n\n' +
        'UNIT BALLS, every point at distance 1 from the origin\n' +
        '  diamond  = L1\n' +
        '  circle   = L2\n' +
        '  square   = L∞\n\n' +
        'The red dot is v scaled to L2 length 1; it lies on the circle.'
      );
    }
    W.attachDrag(pl, () => [st], (i, x, y) => { st.x = x; st.y = y; draw(); }, { bx: 5, by: 4 });
    return {
      cv: pl.cv, draw: draw,
      reset: function () { st.x = 3; st.y = 2; draw(); },
      steps: function () {
        const l1 = Math.abs(st.x) + Math.abs(st.y), l2 = Math.hypot(st.x, st.y), li = Math.max(Math.abs(st.x), Math.abs(st.y));
        return [
          'Three norms, one vector. The diamond, circle and square are the three unit balls at distance 1.',
          'L1 = ' + f(l1) + ' is the Manhattan distance; L2 = ' + f(l2, 4) + ' is the straight-line (Euclidean) length; L∞ = ' + f(li) + ' is the largest component.',
          'They always order the same way: ‖v‖∞ ≤ ‖v‖₂ ≤ ‖v‖₁, here ' + f(li) + ' ≤ ' + f(l2, 4) + ' ≤ ' + f(l1) + '.',
          'Drag v along an axis and the three values become equal; drag diagonally and they separate.',
          'This is why the choice matters: L1 favours sparsity, L2 the familiar geometry, and L∞ the worst-case component.'
        ];
      }
    };
  });

})(Widgets);
