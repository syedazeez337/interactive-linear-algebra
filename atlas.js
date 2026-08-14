/* Isometric atlas: projection, hatching, navigation, flow. */
(function () {
  'use strict';

  const CV = document.getElementById('atlas');
  const ctx = CV.getContext('2d');
  const stage = document.getElementById('stage');
  const tip = document.getElementById('tip');

  const INK = '#14140F';
  const GROUND = '#CEC69B';
  const HATCH = 'rgba(20,20,15,.55)';
  const GRID = 'rgba(20,20,15,.13)';
  const OXIDE = '#8C3A1E';

  const UX = 30, UY = 15, UZ = 26;
  const GX = 32, GY = 24;

  const byId = {};
  NODES.forEach(n => byId[n.id] = n);
  const LIVE = NODES.filter(n => n.form !== 'locked');

  let zoom = 1, panX = 0, panY = 0;
  let hover = null, current = 'Z', inside = false;
  let flow = { playing: false, seg: 0, t: 0 };
  let dragging = false, dragMoved = false, lastX = 0, lastY = 0;

  /* focus presets: a single node gets a closer look than a whole section */
  const NODE_FOCUS = { padX: 120, padTop: 80, padBot: 80, minZoom: 0.7, maxZoom: 1.5 };
  const GROUP_FOCUS = { padX: 70, padTop: 52, padBot: 56, minZoom: 0.4, maxZoom: 1.25 };

  /* ---------------- projection ---------------- */
  function proj(x, y, z) {
    return {
      x: (x - y) * UX * zoom + panX,
      y: (x + y) * UY * zoom - z * UZ * zoom + panY
    };
  }
  function centreTop(n) { return proj(n.gx + n.w / 2, n.gy + n.d / 2, n.h); }

  function resize() {
    const r = stage.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    CV.width = Math.max(1, Math.round(r.width * dpr));
    CV.height = Math.max(1, Math.round(r.height * dpr));
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    render();
  }

  /* Fit the whole atlas into the stage: measure the projected bounds at zoom 1,
     then pick the zoom and pan that centre it with a margin. */
  function resetView() {
    fitTo(NODES, { padX: 54, padTop: 26, padBot: 46, minZoom: 0.3, maxZoom: 1.5 });
    render();
  }

  /* Zoom and pan so a set of nodes fills the stage comfortably. */
  function fitTo(list, opt) {
    const r = stage.getBoundingClientRect();
    zoom = 1; panX = 0; panY = 0;
    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    list.forEach(function (n) {
      const f = faces(n.gx, n.gy, 0, n.w, n.d, n.h);
      f.top.concat(f.left, f.right).forEach(function (p) {
        if (p.x < minX) minX = p.x; if (p.x > maxX) maxX = p.x;
        if (p.y < minY) minY = p.y; if (p.y > maxY) maxY = p.y;
      });
    });
    if (!isFinite(minX)) { resetView(); return; }
    const availW = Math.max(80, r.width - opt.padX * 2);
    const availH = Math.max(80, r.height - opt.padTop - opt.padBot);
    zoom = Math.max(opt.minZoom, Math.min(opt.maxZoom,
      Math.min(availW / (maxX - minX), availH / (maxY - minY))));
    panX = opt.padX - minX * zoom + (availW - (maxX - minX) * zoom) / 2;
    panY = opt.padTop - minY * zoom + (availH - (maxY - minY) * zoom) / 2;
  }

  function focusNode(n) {
    fitTo([n], NODE_FOCUS);
    render();
  }

  function focusGroup(groupId) {
    const members = NODES.filter(function (n) { return n.group === groupId && n.form !== 'locked'; });
    if (members.length) { fitTo(members, GROUP_FOCUS); render(); }
  }

  /* Pan only when the node has drifted outside a comfortable margin. */
  function ensureVisible(n) {
    const r = stage.getBoundingClientRect();
    const c = centreTop(n), m = 90;
    let dx = 0, dy = 0;
    if (c.x < m) dx = m - c.x; else if (c.x > r.width - m) dx = r.width - m - c.x;
    if (c.y < m) dy = m - c.y; else if (c.y > r.height - m) dy = r.height - m - c.y;
    if (dx || dy) { panX += dx; panY += dy; render(); }
  }

  /* ---------------- drawing helpers ---------------- */
  function poly(pts) {
    ctx.beginPath();
    pts.forEach((p, i) => i ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y));
    ctx.closePath();
  }

  function hatchPoly(pts, dx, dy, spacing) {
    ctx.save();
    poly(pts); ctx.clip();
    const xs = pts.map(p => p.x), ys = pts.map(p => p.y);
    const minX = Math.min.apply(null, xs), maxX = Math.max.apply(null, xs);
    const minY = Math.min.apply(null, ys), maxY = Math.max.apply(null, ys);
    const diag = Math.hypot(maxX - minX, maxY - minY) + 4;
    ctx.translate((minX + maxX) / 2, (minY + maxY) / 2);
    ctx.rotate(Math.atan2(dy, dx));
    ctx.beginPath();
    for (let o = -diag; o <= diag; o += spacing) { ctx.moveTo(-diag, o); ctx.lineTo(diag, o); }
    ctx.lineWidth = 1; ctx.strokeStyle = HATCH; ctx.stroke();
    ctx.restore();
  }

  function faces(x, y, z0, w, d, h) {
    const p = proj;
    return {
      top:   [p(x, y, z0 + h), p(x + w, y, z0 + h), p(x + w, y + d, z0 + h), p(x, y + d, z0 + h)],
      right: [p(x + w, y, z0 + h), p(x + w, y + d, z0 + h), p(x + w, y + d, z0), p(x + w, y, z0)],
      left:  [p(x, y + d, z0 + h), p(x + w, y + d, z0 + h), p(x + w, y + d, z0), p(x, y + d, z0)]
    };
  }

  function solid(x, y, z0, w, d, h, opt) {
    opt = opt || {};
    const f = faces(x, y, z0, w, d, h);
    const sp = Math.max(2.6, 4.4 * zoom);
    const lw = opt.bold ? 2.1 : 1.15;

    if (opt.dashed) {
      ctx.save();
      ctx.setLineDash([5, 4]);
      ctx.lineWidth = 1.1; ctx.strokeStyle = 'rgba(20,20,15,.55)';
      [f.left, f.right, f.top].forEach(p => { poly(p); ctx.stroke(); });
      ctx.restore();
      return f;
    }

    [['left', 0, 1], ['right', 0, 1], ['top', UX, UY]].forEach(function (spec) {
      const p = f[spec[0]];
      ctx.fillStyle = GROUND; poly(p); ctx.fill();
      hatchPoly(p, spec[1], spec[2], sp);
    });
    ctx.lineWidth = lw; ctx.strokeStyle = INK;
    [f.left, f.right, f.top].forEach(p => { poly(p); ctx.stroke(); });
    return f;
  }

  function drawNode(n) {
    const sel = n.id === current, hov = n.id === hover;
    const bold = sel || hov;

    if (n.form === 'locked') {
      solid(n.gx, n.gy, 0, n.w, n.d, n.h, { dashed: true });
    } else if (n.cells) {
      const ch = n.h / n.cells;
      for (let i = 0; i < n.cells; i++) solid(n.gx, n.gy, i * ch, n.w, n.d, ch * 0.92, { bold: bold });
    } else if (n.layers) {
      const th = n.h / n.layers;
      for (let i = 0; i < n.layers; i++) solid(n.gx, n.gy, i * th * 1.35, n.w, n.d, th * 0.72, { bold: bold });
    } else if (n.slices) {
      const sw = n.w / n.slices;
      for (let i = 0; i < n.slices; i++) solid(n.gx + i * sw, n.gy, 0, sw * 0.66, n.d, n.h + i * 0.16, { bold: bold });
    } else {
      const f = solid(n.gx, n.gy, 0, n.w, n.d, n.h, { bold: bold });
      if (n.grid) {
        ctx.save(); poly(f.top); ctx.clip();
        ctx.lineWidth = 1; ctx.strokeStyle = 'rgba(20,20,15,.5)';
        ctx.beginPath();
        for (let r = 1; r < n.grid[0]; r++) {
          const a = proj(n.gx, n.gy + n.d * r / n.grid[0], n.h);
          const b = proj(n.gx + n.w, n.gy + n.d * r / n.grid[0], n.h);
          ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y);
        }
        for (let c = 1; c < n.grid[1]; c++) {
          const a = proj(n.gx + n.w * c / n.grid[1], n.gy, n.h);
          const b = proj(n.gx + n.w * c / n.grid[1], n.gy + n.d, n.h);
          ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y);
        }
        ctx.stroke(); ctx.restore();
      }
    }

    /* label */
    const c = centreTop(n);
    ctx.fillStyle = INK;
    ctx.font = (sel ? 'bold ' : '') + Math.max(9, 11 * zoom) + 'px ' + getComputedStyle(document.body).fontFamily;
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(n.key, c.x, c.y);

    /* selection diamond, as in the reference */
    if (sel) {
      const d = proj(n.gx + n.w, n.gy, n.h);
      ctx.fillStyle = INK;
      ctx.beginPath();
      ctx.moveTo(d.x, d.y - 6); ctx.lineTo(d.x + 6, d.y);
      ctx.lineTo(d.x, d.y + 6); ctx.lineTo(d.x - 6, d.y);
      ctx.closePath(); ctx.fill();
    }
  }

  function drawGrid() {
    ctx.lineWidth = 1; ctx.strokeStyle = GRID; ctx.beginPath();
    for (let x = -2; x <= GX; x += 2) {
      const a = proj(x, -2, 0), b = proj(x, GY, 0);
      ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y);
    }
    for (let y = -2; y <= GY; y += 2) {
      const a = proj(-2, y, 0), b = proj(GX, y, 0);
      ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y);
    }
    ctx.stroke();
  }

  function elbow(a, b) {
    /* right-angled route in isometric space, like the reference's traces */
    const mid = { x: (a.x + b.x) / 2, y: a.y + (b.y - a.y) * 0.5 };
    return [a, { x: mid.x, y: a.y }, { x: mid.x, y: b.y }, b];
  }

  function drawEdges() {
    ctx.lineWidth = 1; ctx.strokeStyle = 'rgba(20,20,15,.34)';
    LINKS.forEach(function (l) {
      const A = byId[l[0]], B = byId[l[1]];
      if (!A || !B) return;
      const p = elbow(centreTop(A), centreTop(B));
      ctx.beginPath(); ctx.moveTo(p[0].x, p[0].y);
      for (let i = 1; i < p.length; i++) ctx.lineTo(p[i].x, p[i].y);
      if (B.form === 'locked') { ctx.save(); ctx.setLineDash([4, 4]); ctx.stroke(); ctx.restore(); }
      else ctx.stroke();
    });

    ctx.lineWidth = 2.2; ctx.strokeStyle = INK;
    for (let i = 0; i < PATH.length - 1; i++) {
      const A = byId[PATH[i]], B = byId[PATH[i + 1]];
      const p = elbow(centreTop(A), centreTop(B));
      ctx.beginPath(); ctx.moveTo(p[0].x, p[0].y);
      for (let k = 1; k < p.length; k++) ctx.lineTo(p[k].x, p[k].y);
      ctx.stroke();
    }
  }

  function drawToken() {
    const A = byId[PATH[flow.seg]], B = byId[PATH[flow.seg + 1]];
    if (!A || !B) return;
    const p = elbow(centreTop(A), centreTop(B));
    /* walk the polyline by arc length */
    let total = 0; const segs = [];
    for (let i = 1; i < p.length; i++) {
      const L = Math.hypot(p[i].x - p[i - 1].x, p[i].y - p[i - 1].y);
      segs.push(L); total += L;
    }
    let want = flow.t * total, at = p[0];
    for (let i = 0; i < segs.length; i++) {
      if (want <= segs[i] || i === segs.length - 1) {
        const u = segs[i] ? Math.min(1, want / segs[i]) : 0;
        at = { x: p[i].x + (p[i + 1].x - p[i].x) * u, y: p[i].y + (p[i + 1].y - p[i].y) * u };
        break;
      }
      want -= segs[i];
    }
    ctx.fillStyle = OXIDE;
    ctx.beginPath();
    ctx.moveTo(at.x, at.y - 7); ctx.lineTo(at.x + 7, at.y);
    ctx.lineTo(at.x, at.y + 7); ctx.lineTo(at.x - 7, at.y);
    ctx.closePath(); ctx.fill();
  }

  function render() {
    const r = stage.getBoundingClientRect();
    ctx.fillStyle = GROUND; ctx.fillRect(0, 0, r.width, r.height);
    drawGrid();
    drawEdges();
    NODES.slice().sort((a, b) => (a.gx + a.gy) - (b.gx + b.gy)).forEach(drawNode);
    if (flow.playing) drawToken();
  }

  /* ---------------- hit testing ---------------- */
  function inPoly(pt, pts) {
    let c = false;
    for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
      if (((pts[i].y > pt.y) !== (pts[j].y > pt.y)) &&
        (pt.x < (pts[j].x - pts[i].x) * (pt.y - pts[i].y) / (pts[j].y - pts[i].y) + pts[i].x)) c = !c;
    }
    return c;
  }
  function hitTest(pt) {
    const ordered = NODES.slice().sort((a, b) => (b.gx + b.gy) - (a.gx + a.gy));
    for (const n of ordered) {
      const f = faces(n.gx, n.gy, 0, n.w, n.d, n.h);
      if (inPoly(pt, f.top) || inPoly(pt, f.left) || inPoly(pt, f.right)) return n;
    }
    return null;
  }

  /* ---------------- sidebar ---------------- */
  function buildSidebar() {
    const el = document.getElementById('sidebar');
    el.innerHTML = '';
    GROUPS.forEach(function (g) {
      const list = NODES.filter(n => n.group === g.id);
      if (!list.length) return;
      const h = document.createElement('div');
      h.className = 'grp'; h.textContent = g.label;
      h.title = 'focus this section on the map';
      if (list.some(n => n.form !== 'locked')) h.addEventListener('click', () => focusGroup(g.id));
      el.appendChild(h);
      list.forEach(function (n) {
        const row = document.createElement('div');
        row.className = 'row' + (n.form === 'locked' ? ' locked' : '');
        row.dataset.id = n.id;
        row.innerHTML = '<span class="rk"></span><span class="rn"></span><span class="rc"></span>';
        row.querySelector('.rk').textContent = n.key;
        row.querySelector('.rn').textContent = n.name;
        row.querySelector('.rc').textContent = n.items ? String(n.items).split(',').length : '';
        if (n.form !== 'locked') row.addEventListener('click', () => select(n.id, true));
        row.title = n.form === 'locked' ? 'not switched on' : (n.items || '');
        el.appendChild(row);
      });
    });
  }

  function syncSidebar() {
    document.querySelectorAll('#sidebar .row').forEach(function (r) {
      const on = r.dataset.id === current;
      r.setAttribute('aria-current', on ? 'true' : 'false');
      if (on) r.scrollIntoView({ block: 'nearest' });
    });
  }

  /* ---------------- right panel ---------------- */
  let tab = 'means';
  function paintPanel() {
    const n = byId[current];
    document.getElementById('ptitle').textContent = n.name;
    document.getElementById('psub').textContent =
      n.items ? 'checklist item ' + n.items : 'not switched on yet';
    const body = document.getElementById('panel-prose');
    if (n.form === 'locked') {
      body.innerHTML = '<p class="ptext">Section ' + n.key + ' of the checklist. Drawn dashed ' +
        'because it exists in the syllabus but is not part of this build. The atlas covers ' +
        'all nine sections — vectors through attention.</p>';
      return;
    }
    const txt = tab === 'means' ? n.means : n.compute;
    body.innerHTML =
      '<p class="ptext">' + txt + '</p>' +
      '<div class="phead">WATCH OUT</div><div class="rule"></div>' +
      '<p class="ptext">' + n.watch + '</p>' +
      (n.widget
        ? '<p class="ptext"><mark>&rarr; goes inside</mark> to a live playground, then ' +
          '<mark>trace one step</mark> walks the arithmetic.</p>'
        : '<p class="ptext">No playground for this node.</p>');
    document.getElementById('statProgress').textContent =
      (PATH.indexOf(current) + 1) + ' of ' + PATH.length;
  }

  /* ---------------- selection + inside ---------------- */
  function select(id, follow) {
    if (!byId[id] || byId[id].form === 'locked') return;
    current = id;
    syncSidebar(); paintPanel(); render();
    if (follow) focusNode(byId[id]);
  }

  function enter() {
    const n = byId[current];
    if (!n || n.form === 'locked') return;
    inside = true;
    document.getElementById('inside').classList.add('on');
    document.getElementById('inside-key').textContent = n.key;
    document.getElementById('inside-name').textContent = n.name;
    Widgets.mount(n.widget, document.getElementById('widget-wrap'),
      document.getElementById('readout'), document.getElementById('steps'));
    document.getElementById('btn-flow').textContent = '▶ RUN THE STEPS';
  }
  function exit() {
    inside = false;
    document.getElementById('inside').classList.remove('on');
    Widgets.unmount();
    document.getElementById('btn-flow').textContent = '▶ RESUME THE FLOW';
  }

  function move(dir) {
    const i = PATH.indexOf(current);
    const j = Math.min(PATH.length - 1, Math.max(0, i + dir));
    select(PATH[j], true);
  }

  /* ---------------- events ---------------- */
  CV.addEventListener('mousedown', function (e) {
    dragging = true; dragMoved = false; lastX = e.clientX; lastY = e.clientY;
    CV.classList.add('drag');
  });
  window.addEventListener('mouseup', function () { dragging = false; CV.classList.remove('drag'); });
  window.addEventListener('mousemove', function (e) {
    const r = CV.getBoundingClientRect();
    if (dragging) {
      const dx = e.clientX - lastX, dy = e.clientY - lastY;
      if (Math.abs(dx) + Math.abs(dy) > 2) dragMoved = true;
      panX += dx; panY += dy; lastX = e.clientX; lastY = e.clientY;
      render(); return;
    }
    if (inside) return;
    const pt = { x: e.clientX - r.left, y: e.clientY - r.top };
    if (pt.x < 0 || pt.y < 0 || pt.x > r.width || pt.y > r.height) { hover = null; tip.style.opacity = 0; render(); return; }
    const n = hitTest(pt);
    const id = n ? n.id : null;
    if (id !== hover) { hover = id; render(); }
    if (n) {
      tip.textContent = n.key + ' · ' + n.name + (n.form === 'locked' ? ' · not switched on' : '');
      tip.style.left = (pt.x + 14) + 'px';
      tip.style.top = (pt.y + 14) + 'px';
      tip.style.opacity = 1;
    } else tip.style.opacity = 0;
  });
  CV.addEventListener('click', function (e) {
    if (dragMoved) return;
    const r = CV.getBoundingClientRect();
    const n = hitTest({ x: e.clientX - r.left, y: e.clientY - r.top });
    if (n && n.form !== 'locked') select(n.id, false);
  });
  CV.addEventListener('dblclick', function () { if (!inside) enter(); });
  CV.addEventListener('wheel', function (e) {
    e.preventDefault();
    const r = CV.getBoundingClientRect();
    const mx = e.clientX - r.left, my = e.clientY - r.top;
    const k = e.deltaY < 0 ? 1.12 : 1 / 1.12;
    const nz = Math.min(2.4, Math.max(0.34, zoom * k));
    const f = nz / zoom;
    panX = mx - (mx - panX) * f;
    panY = my - (my - panY) * f;
    zoom = nz; render();
  }, { passive: false });

  document.getElementById('zin').addEventListener('click', () => { zoom = Math.min(2.4, zoom * 1.2); render(); });
  document.getElementById('zout').addEventListener('click', () => { zoom = Math.max(0.34, zoom / 1.2); render(); });

  window.addEventListener('keydown', function (e) {
    if (e.target.tagName === 'INPUT') return;
    if (e.key === 'ArrowRight') { e.preventDefault(); if (!inside) enter(); }
    else if (e.key === 'ArrowLeft') { e.preventDefault(); if (inside) exit(); }
    else if (e.key === 'ArrowDown') { e.preventDefault(); if (!inside) move(1); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); if (!inside) move(-1); }
    else if (e.key === 'Escape' && inside) exit();
  });

  /* controls */
  document.getElementById('btn-flow').addEventListener('click', function () {
    if (inside) { Widgets.step(); return; }
    flow.playing = !flow.playing;
    this.setAttribute('aria-pressed', flow.playing ? 'true' : 'false');
    this.textContent = flow.playing ? '■ PAUSE THE FLOW' : '▶ RESUME THE FLOW';
    if (flow.playing) tick();
    else render();
  });
  document.getElementById('btn-step').addEventListener('click', function () {
    if (inside) { Widgets.step(); return; }
    move(1);
  });
  document.getElementById('btn-reset').addEventListener('click', function () {
    if (inside) { Widgets.reset(); return; }
    resetView();
  });

  document.querySelectorAll('#tabs button').forEach(function (b) {
    b.addEventListener('click', function () {
      tab = b.dataset.tab;
      document.querySelectorAll('#tabs button').forEach(x =>
        x.setAttribute('aria-selected', x === b ? 'true' : 'false'));
      paintPanel();
    });
  });
  document.getElementById('inside-back').addEventListener('click', exit);

  let raf = null;
  function tick() {
    if (!flow.playing) return;
    flow.t += 0.016;
    if (flow.t >= 1) {
      flow.t = 0; flow.seg++;
      if (flow.seg >= PATH.length - 1) flow.seg = 0;
      select(PATH[flow.seg], false);
    }
    render();
    raf = requestAnimationFrame(tick);
  }

  window.addEventListener('resize', resize);

  /* ---------------- boot ---------------- */
  document.getElementById('statNodes').textContent = LIVE.length;
  document.getElementById('statItems').textContent = '63 in 9 sections';
  buildSidebar();
  resize();
  resetView();
  select('Z', false);
})();
