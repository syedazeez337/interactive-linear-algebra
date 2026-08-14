/* Playground framework: drawing plane, form controls, step track, registry.
   Widgets themselves live in widgets-a.js and widgets-b.js.

   Convention: dragged handles snap to integers so every number in a readout is
   exact and the arithmetic can be checked by hand. Sliders that need fractions
   use an explicit step. */
var Widgets = (function () {
  'use strict';

  const INK = '#14140F', OXIDE = '#8C3A1E', MUTE = '#6B6754';
  const GROUND = '#CEC69B', GROUND2 = '#C5BC8E';
  const HAIR = 'rgba(20,20,15,.16)', HAIR2 = 'rgba(20,20,15,.4)';
  const FAINT = 'rgba(20,20,15,.38)';
  const MONO = '"SF Mono","Cascadia Mono","DejaVu Sans Mono",Menlo,Consolas,monospace';

  /* ---------- numbers ---------- */
  /* Display formatting. Uses the typographic minus (U+2212) so numbers line up
     with the minus signs written in the surrounding prose. */
  function f(n, dp) {
    if (!isFinite(n)) return '—';
    const s = (Math.abs(n - Math.round(n)) < 1e-9)
      ? String(Math.round(n))
      : n.toFixed(dp === undefined ? 2 : dp);
    return s.replace('-', '−');
  }
  function pad(s, n) { s = String(s); while (s.length < n) s = ' ' + s; return s; }
  function sgn(n) { return n < 0 ? '− ' + Math.abs(n) : '+ ' + n; }
  /* column of numbers as bracketed text rows, for the readout */
  function colBlock(vals, width) {
    const w = width || Math.max.apply(null, vals.map(v => String(v).length));
    return vals.map(v => '[' + pad(v, w) + ']');
  }
  function sideBySide(blocks, gap) {
    const g = ' '.repeat(gap === undefined ? 3 : gap);
    const h = Math.max.apply(null, blocks.map(b => b.length));
    const out = [];
    for (let i = 0; i < h; i++) {
      out.push(blocks.map(function (b) {
        const line = b[i] === undefined ? '' : b[i];
        const w = Math.max.apply(null, b.map(x => x.length));
        return line + ' '.repeat(w - line.length);
      }).join(g));
    }
    return out.join('\n');
  }

  /* ---------- plane ---------- */
  function Plane(w, h, unit, opt) {
    opt = opt || {};
    const cv = document.createElement('canvas');
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    cv.width = w * dpr; cv.height = h * dpr;
    cv.style.width = w + 'px'; cv.style.height = h + 'px';
    cv.id = 'widget';
    const c = cv.getContext('2d');
    c.setTransform(dpr, 0, 0, dpr, 0, 0);
    const ox = opt.ox === undefined ? w / 2 : opt.ox;
    const oy = opt.oy === undefined ? h / 2 : opt.oy;

    const P = {
      cv: cv, ctx: c, w: w, h: h, unit: unit, ox: ox, oy: oy,
      S: (x, y) => ({ x: ox + x * unit, y: oy - y * unit }),
      W: (px, py) => ({ x: (px - ox) / unit, y: (oy - py) / unit }),

      clear: function (opts) {
        opts = opts || {};
        c.fillStyle = GROUND2; c.fillRect(0, 0, w, h);
        if (opts.noGrid) return P;
        c.lineWidth = 1; c.strokeStyle = HAIR; c.beginPath();
        for (let x = -30; x <= 30; x++) { const p = P.S(x, 0); if (p.x > 0 && p.x < w) { c.moveTo(p.x, 0); c.lineTo(p.x, h); } }
        for (let y = -30; y <= 30; y++) { const p = P.S(0, y); if (p.y > 0 && p.y < h) { c.moveTo(0, p.y); c.lineTo(w, p.y); } }
        c.stroke();
        c.lineWidth = 1.4; c.strokeStyle = HAIR2; c.beginPath();
        c.moveTo(0, oy); c.lineTo(w, oy); c.moveTo(ox, 0); c.lineTo(ox, h); c.stroke();
        c.fillStyle = 'rgba(20,20,15,.5)'; c.font = '10px ' + MONO;
        c.textAlign = 'center'; c.textBaseline = 'top';
        for (let x = -9; x <= 9; x++) if (x) { const p = P.S(x, 0); if (p.x > 10 && p.x < w - 10) c.fillText(String(x), p.x, oy + 4); }
        c.textAlign = 'right'; c.textBaseline = 'middle';
        for (let y = -6; y <= 6; y++) if (y) { const p = P.S(0, y); if (p.y > 10 && p.y < h - 10) c.fillText(String(y), ox - 5, p.y); }
        return P;
      },

      seg: function (x1, y1, x2, y2, col, dash, width) {
        const a = P.S(x1, y1), b = P.S(x2, y2);
        c.save(); c.strokeStyle = col || FAINT; c.lineWidth = width || 1.3;
        if (dash) c.setLineDash(dash);
        c.beginPath(); c.moveTo(a.x, a.y); c.lineTo(b.x, b.y); c.stroke(); c.restore();
        return P;
      },

      vec: function (x, y, col, lab, opts) {
        opts = opts || {};
        const fx = opts.fromX || 0, fy = opts.fromY || 0;
        const a = P.S(fx, fy), b = P.S(x, y);
        if (Math.hypot(b.x - a.x, b.y - a.y) < 2) { if (lab) P.text(x, y, lab, col); return P; }
        c.save();
        c.strokeStyle = col; c.fillStyle = col; c.lineWidth = opts.width || 2.2;
        if (opts.dash) c.setLineDash(opts.dash);
        c.beginPath(); c.moveTo(a.x, a.y); c.lineTo(b.x, b.y); c.stroke();
        c.setLineDash([]);
        const ang = Math.atan2(b.y - a.y, b.x - a.x), s = opts.head || 11;
        c.beginPath();
        c.moveTo(b.x, b.y);
        c.lineTo(b.x - s * Math.cos(ang - 0.4), b.y - s * Math.sin(ang - 0.4));
        c.lineTo(b.x - s * Math.cos(ang + 0.4), b.y - s * Math.sin(ang + 0.4));
        c.closePath(); c.fill();
        if (lab) {
          c.font = 'bold 12px ' + MONO; c.textAlign = 'left'; c.textBaseline = 'bottom';
          const off = opts.labOff || [9, -5];
          c.fillText(lab, b.x + off[0], b.y + off[1]);
        }
        c.restore();
        return P;
      },

      handle: function (x, y, col) {
        const p = P.S(x, y);
        c.fillStyle = col; c.strokeStyle = GROUND2; c.lineWidth = 2;
        c.beginPath(); c.arc(p.x, p.y, 6, 0, Math.PI * 2); c.fill(); c.stroke();
        return P;
      },

      dot: function (x, y, col, r) {
        const p = P.S(x, y);
        c.fillStyle = col; c.beginPath(); c.arc(p.x, p.y, r || 3.5, 0, Math.PI * 2); c.fill();
        return P;
      },

      text: function (x, y, str, col, align) {
        const p = P.S(x, y);
        c.fillStyle = col || INK; c.font = '11px ' + MONO;
        c.textAlign = align || 'left'; c.textBaseline = 'middle';
        c.fillText(str, p.x + 7, p.y - 8);
        return P;
      },

      shape: function (pts, fill, stroke) {
        c.save(); c.beginPath();
        pts.forEach(function (q, i) { const p = P.S(q[0], q[1]); i ? c.lineTo(p.x, p.y) : c.moveTo(p.x, p.y); });
        c.closePath();
        if (fill) { c.fillStyle = fill; c.fill(); }
        if (stroke) { c.strokeStyle = stroke; c.lineWidth = 1.4; c.stroke(); }
        c.restore();
        return P;
      },

      circle: function (r, col, dash) {
        const o = P.S(0, 0);
        c.save(); c.strokeStyle = col || FAINT; c.lineWidth = 1.3;
        if (dash) c.setLineDash(dash);
        c.beginPath(); c.arc(o.x, o.y, r * unit, 0, Math.PI * 2); c.stroke(); c.restore();
        return P;
      },

      /* angle arc from vector a to vector b, drawn at radius r world units */
      arc: function (ax, ay, bx, by, r, col) {
        const o = P.S(0, 0);
        let a1 = Math.atan2(ay, ax), a2 = Math.atan2(by, bx);
        let diff = a2 - a1;
        while (diff > Math.PI) diff -= 2 * Math.PI;
        while (diff < -Math.PI) diff += 2 * Math.PI;
        c.save(); c.strokeStyle = col || INK; c.lineWidth = 1.5;
        c.beginPath();
        c.arc(o.x, o.y, r * unit, -a1, -(a1 + diff), diff > 0);
        c.stroke(); c.restore();
        return P;
      },

      /* small square marking a right angle between unit dirs u and v */
      rightAngle: function (ux, uy, vx, vy, s) {
        const n1 = Math.hypot(ux, uy), n2 = Math.hypot(vx, vy);
        if (!n1 || !n2) return P;
        const a = [ux / n1 * s, uy / n1 * s], b = [vx / n2 * s, vy / n2 * s];
        P.shape([[0, 0], a, [a[0] + b[0], a[1] + b[1]], b], null, INK);
        return P;
      },

      /* infinite line through origin in direction (dx,dy) */
      line: function (dx, dy, col, width) {
        const n = Math.hypot(dx, dy); if (!n) return P;
        const k = 40 / n;
        P.seg(-dx * k, -dy * k, dx * k, dy * k, col, null, width || 6);
        return P;
      }
    };
    return P;
  }

  /* ---------- dragging ---------- */
  function attachDrag(pl, handles, onChange, opt) {
    opt = opt || {};
    const bx = opt.bx === undefined ? 6 : opt.bx;
    const by = opt.by === undefined ? 4 : opt.by;
    const snap = opt.snap === undefined ? 1 : opt.snap;
    let held = -1;
    function pos(e) {
      const r = pl.cv.getBoundingClientRect();
      return { x: e.clientX - r.left, y: e.clientY - r.top };
    }
    pl.cv.addEventListener('pointerdown', function (e) {
      const p = pos(e); let best = -1, bd = 24;
      handles().forEach(function (h, i) {
        const s = pl.S(h.x, h.y);
        const d = Math.hypot(s.x - p.x, s.y - p.y);
        if (d < bd) { bd = d; best = i; }
      });
      if (best >= 0) { held = best; try { pl.cv.setPointerCapture(e.pointerId); } catch (_) {} e.preventDefault(); }
    });
    pl.cv.addEventListener('pointermove', function (e) {
      if (held < 0) return;
      const p = pos(e), wpt = pl.W(p.x, p.y);
      const q = v => Math.round(v / snap) * snap;
      onChange(held, Math.max(-bx, Math.min(bx, q(wpt.x))), Math.max(-by, Math.min(by, q(wpt.y))));
    });
    function up() { held = -1; }
    pl.cv.addEventListener('pointerup', up);
    pl.cv.addEventListener('pointercancel', up);
    pl.cv.addEventListener('pointerleave', up);
  }

  /* ---------- form controls ---------- */
  const ui = {
    bar: function () {
      const d = document.createElement('div');
      d.style.cssText = 'display:flex;gap:14px;align-items:center;padding:9px 11px;' +
        'border-top:1px solid rgba(20,20,15,.4);font-size:11px;letter-spacing:.05em;flex-wrap:wrap';
      for (let i = 0; i < arguments.length; i++) if (arguments[i]) d.appendChild(arguments[i]);
      return d;
    },
    label: function (t) {
      const s = document.createElement('span');
      s.textContent = t; s.style.color = MUTE; return s;
    },
    note: function (t) {
      const s = document.createElement('span');
      s.textContent = t; s.style.cssText = 'color:' + MUTE + ';font-size:10.5px'; return s;
    },
    num: function (val, onChange, w) {
      const inp = document.createElement('input');
      inp.type = 'number'; inp.value = val; inp.step = 1;
      inp.style.cssText = 'width:' + (w || 44) + 'px;padding:3px 4px;font:inherit;text-align:center;' +
        'background:' + GROUND + ';border:1px solid ' + INK + ';color:' + INK;
      inp.addEventListener('input', function () {
        const n = parseFloat(inp.value);
        onChange(isNaN(n) ? 0 : n);
      });
      return inp;
    },
    /* editable matrix; vals is a flat row-major array */
    mat: function (rows, cols, vals, onChange, w) {
      const g = document.createElement('div');
      g.style.cssText = 'display:grid;grid-template-columns:repeat(' + cols + ',' + (w || 44) + 'px);gap:3px';
      const cells = [];
      for (let i = 0; i < rows * cols; i++) {
        const inp = ui.num(vals[i], function (v) { vals[i] = v; onChange(); }, w);
        cells.push(inp); g.appendChild(inp);
      }
      return { el: g, cells: cells, sync: function () { cells.forEach((c, i) => c.value = vals[i]); } };
    },
    slider: function (lab, min, max, step, val, onChange) {
      const wrap = document.createElement('label');
      wrap.style.cssText = 'display:flex;align-items:center;gap:7px;color:' + MUTE;
      const t = document.createElement('span'); t.textContent = lab;
      const out = document.createElement('b');
      out.style.cssText = 'color:' + INK + ';min-width:34px;text-align:right;font-weight:600';
      out.textContent = val;
      const r = document.createElement('input');
      r.type = 'range'; r.min = min; r.max = max; r.step = step; r.value = val;
      r.style.cssText = 'width:104px;accent-color:' + INK;
      r.addEventListener('input', function () {
        const v = parseFloat(r.value); out.textContent = f(v); onChange(v);
      });
      wrap.appendChild(t); wrap.appendChild(r); wrap.appendChild(out);
      return { el: wrap, set: function (v) { r.value = v; out.textContent = f(v); } };
    },
    buttons: function (list) {
      const d = document.createElement('div');
      d.style.cssText = 'display:flex;gap:5px;flex-wrap:wrap';
      list.forEach(function (b) {
        const el = document.createElement('button');
        el.textContent = b.label;
        el.style.cssText = 'background:transparent;border:1px solid ' + INK + ';color:' + INK +
          ';padding:3px 8px;font:inherit;font-size:10.5px;cursor:pointer;letter-spacing:.05em';
        el.addEventListener('mouseenter', () => { el.style.background = INK; el.style.color = GROUND; });
        el.addEventListener('mouseleave', () => { el.style.background = 'transparent'; el.style.color = INK; });
        el.addEventListener('click', b.fn);
        d.appendChild(el);
      });
      return d;
    },
    pick: function (lab, options, val, onChange) {
      const wrap = document.createElement('label');
      wrap.style.cssText = 'display:flex;align-items:center;gap:6px;color:' + MUTE;
      const t = document.createElement('span'); t.textContent = lab;
      const s = document.createElement('select');
      s.style.cssText = 'font:inherit;padding:3px 5px;background:' + GROUND +
        ';border:1px solid ' + INK + ';color:' + INK;
      options.forEach(function (o) {
        const op = document.createElement('option');
        op.value = o.v; op.textContent = o.t; s.appendChild(op);
      });
      s.value = val;
      s.addEventListener('change', () => onChange(s.value));
      wrap.appendChild(t); wrap.appendChild(s);
      return { el: wrap, set: v => s.value = v };
    }
  };

  /* ---------- registry + mounting ---------- */
  const MAKERS = {};
  let live = null, wrapEl = null, readEl = null, stepsEl = null, stepIdx = 0;
  let runTimer = null;

  /* A hyphen immediately before a digit is always a negative sign in this app,
     never punctuation. Normalise it to the typographic minus at the render
     boundary so every widget is consistent without each one remembering. */
  function minus(s) { return String(s).replace(/-(?=\d)/g, '−'); }

  function renderSteps() {
    if (!stepsEl || !live) return;
    const list = live.steps();
    stepsEl.innerHTML = '';
    list.forEach(function (t, i) {
      const d = document.createElement('div');
      d.className = 'sl' + (i < stepIdx ? ' on' : '') + (i === stepIdx - 1 ? ' cur' : '');
      d.textContent = (i + 1) + '. ' + minus(t);
      stepsEl.appendChild(d);
    });
    if (stepIdx > 0) {
      const cur = stepsEl.querySelector('.cur') || stepsEl.querySelector('.sl.on');
      if (cur) cur.scrollIntoView({ block: 'nearest' });
    }
  }

  function stopRun() {
    if (runTimer) { clearInterval(runTimer); runTimer = null; }
  }

  return {
    /* exposed to widget files */
    Plane: Plane, attachDrag: attachDrag, ui: ui,
    f: f, pad: pad, sgn: sgn, colBlock: colBlock, sideBySide: sideBySide,
    INK: INK, OXIDE: OXIDE, MUTE: MUTE, GROUND: GROUND, GROUND2: GROUND2,
    HAIR2: HAIR2, FAINT: FAINT, MONO: MONO,
    read: function (txt) { if (readEl) readEl.textContent = minus(txt); renderSteps(); },
    register: function (kind, factory) { MAKERS[kind] = factory; },
    has: function (kind) { return !!MAKERS[kind]; },

    mount: function (kind, wrap, read, steps) {
      wrapEl = wrap; readEl = read; stepsEl = steps; stepIdx = 0;
      wrap.innerHTML = '';
      if (!kind || !MAKERS[kind]) {
        live = null;
        wrap.style.border = 'none';
        wrap.innerHTML = '<div class="nowidget">No playground for this node. ' +
          'Press <b>&larr;</b> to come back out.</div>';
        read.textContent = ''; steps.innerHTML = '';
        return;
      }
      wrap.style.border = '';
      live = MAKERS[kind]();
      if (live.cv) wrap.appendChild(live.cv);
      if (live.extra) wrap.appendChild(live.extra);
      live.draw();
    },
    unmount: function () { live = null; stopRun(); if (wrapEl) wrapEl.innerHTML = ''; },
    step: function () {
      if (!live) return;
      const n = live.steps().length;
      stepIdx = stepIdx >= n ? 0 : stepIdx + 1;
      renderSteps();
    },
    run: function (onDone) {
      if (!live) return;
      stopRun();
      if (stepIdx >= live.steps().length) stepIdx = 0;
      runTimer = setInterval(function () {
        if (!live) { stopRun(); if (onDone) onDone(); return; }
        if (stepIdx >= live.steps().length) { stopRun(); if (onDone) onDone(); return; }
        stepIdx++;
        renderSteps();
        if (stepIdx >= live.steps().length) { stopRun(); if (onDone) onDone(); }
      }, 900);
    },
    pause: function () { stopRun(); },
    isRunning: function () { return runTimer !== null; },
    reset: function () { if (live) { stepIdx = 0; live.reset(); } }
  };
})();
