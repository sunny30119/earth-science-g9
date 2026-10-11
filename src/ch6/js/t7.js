/* ===== 第六章 分頁 7：岩層積木、排序挑戰、化石分類、46 億年月曆 =====
   岩層積木的原理：畫面上每一點 (x, e)，沿著「事件清單」從最新往最舊倒推，算出它最初屬於哪一層。
   e 是高度（往上為正）。基盤（最老的岩石）頂面在 e = BASE。 */
(() => {
  const cv = document.getElementById('c6strata'); if (!cv) return;
  const GW = 240, GH = 150, BASE = 18, AIR = null;
  const ROCK = {
    cong: { n: '礫岩', c: [178, 150, 120], tex: 'big' }, sand: { n: '砂岩', c: [226, 196, 128], tex: 'dot' },
    shale: { n: '頁岩', c: [140, 132, 120], tex: 'line' }, lime: { n: '石灰岩', c: [214, 210, 196], tex: 'shell' },
    dike: { n: '岩脈（火成岩）', c: [150, 60, 50], tex: '' }, base: { n: '基盤', c: [95, 95, 105], tex: 'hatch' },
  };
  const FOS = { tri: ['🪲', '三葉蟲', '古生代', '海洋'], amm: ['🐚', '菊石', '中生代', '海洋'], dino: ['🦕', '恐龍', '中生代', '陸地'], mam: ['🦣', '哺乳類', '新生代', '陸地'], coral: ['🪸', '珊瑚', '（各時代都有）', '海洋'], leaf: ['🍃', '樹葉', '（各時代都有）', '陸地'] };
  const COS60 = Math.cos(Math.PI / 3), SIN60 = Math.sin(Math.PI / 3);

  /* ---- 核心：倒推 ---- */
  function hw(ev, x, e) { return x > ev.fx + (GH - e) / Math.tan(Math.PI / 3); }
  function colorAt(E, x, e, i) {
    for (let k = i - 1; k >= 0; k--) {
      const ev = E[k];
      if (ev.t === 'dep') { if (e > ev.top) return AIR; const r = colorAt(E, x, e, k); return r === AIR ? { r: ev.rock, x, e, k } : r; }
      if (ev.t === 'ero') { if (e > ev.level) return AIR; }
      else if (ev.t === 'tilt' || ev.t === 'flip') {
        const eNow = e, c = Math.cos(-ev.a), s = Math.sin(-ev.a), dx = x - ev.cx, de = e - ev.ce; x = ev.cx + dx * c - de * s; e = ev.ce + dx * s + de * c;
        if (ev.t === 'flip') { const r = colorAt(E, x, e, k); return r === AIR && eNow <= ev.ce ? { r: 'base', x, e, k: -1 } : r; }   // 翻轉後底下補上基盤
      }
      else if (ev.t === 'fault') { if (hw(ev, x, e)) { x -= COS60 * ev.d; e += SIN60 * ev.d; } }
      else if (ev.t === 'dike') { if (Math.abs(x - (ev.x + e * ev.k)) < ev.w) { const r = colorAt(E, x, e, k); return r === AIR ? AIR : { r: 'dike', x, e, k }; } }
    }
    return e <= BASE ? { r: 'base', x, e, k: -1 } : AIR;
  }
  // 往前推：化石現在在哪
  function forward(E, f) {
    let { x, e } = f;
    for (let k = f.k + 1; k < E.length; k++) {
      const ev = E[k];
      if (ev.t === 'tilt' || ev.t === 'flip') { const c = Math.cos(ev.a), s = Math.sin(ev.a), dx = x - ev.cx, de = e - ev.ce; x = ev.cx + dx * c - de * s; e = ev.ce + dx * s + de * c; }
      else if (ev.t === 'fault') { if (hw(ev, x, e)) { x += COS60 * ev.d; e -= SIN60 * ev.d; } }
      else if (ev.t === 'ero') { if (e > ev.level) return null; }
      else if (ev.t === 'dike') { if (Math.abs(x - (ev.x + e * ev.k)) < ev.w) return null; }
    }
    return { x, e };
  }
  function surface(E) {
    let mx = -1e9, mn = 1e9;
    for (let x = 4; x < GW - 4; x += 6) { let top = BASE; for (let e = GH; e > 0; e -= 1) { if (colorAt(E, x, e, E.length) !== AIR) { top = e; break; } } mx = Math.max(mx, top); mn = Math.min(mn, top); }
    return [mn, mx];
  }
  function makeEvent(E, t, opt = {}) {
    const [mn, mx] = surface(E);
    if (t.startsWith('dep:')) return { t: 'dep', rock: t.slice(4), top: Math.min(GH - 6, mx + (opt.th || 22)), fos: opt.fos || '' };
    if (t === 'ero') return { t: 'ero', level: Math.max(BASE + 4, mn + (mx - mn) * .45 - 6) };
    if (t === 'tilt') return { t: 'tilt', a: (opt.a ?? 18) * Math.PI / 180, cx: GW / 2, ce: BASE };
    if (t === 'flip') return { t: 'flip', a: Math.PI * .92, cx: GW / 2, ce: (BASE + mx) / 2 };
    if (t === 'fault') return { t: 'fault', fx: opt.fx ?? GW * .38, d: opt.d ?? 16 };
    if (t === 'dike') return { t: 'dike', x: opt.x ?? GW * .68, k: .12, w: 5 };
  }
  const NAME = ev => ev.t === 'dep' ? `${ROCK[ev.rock].n}沉積${ev.fos ? `（含${FOS[ev.fos][1]}化石）` : ''}` : { ero: '侵蝕作用', tilt: '岩層受力傾斜', flip: '強烈擠壓，岩層翻轉', fault: '發生斷層', dike: '岩漿侵入，形成岩脈' }[ev.t];

  /* ---- 繪圖 ---- */
  function render(St, E, opts = {}) {
    const { ctx } = St; St.fit();
    const off = document.createElement('canvas'); off.width = GW; off.height = GH; const ox = off.getContext('2d');
    const img = ox.createImageData(GW, GH), d = img.data, kk = new Int16Array(GW * GH).fill(-9);
    for (let y = 0; y < GH; y++) for (let x = 0; x < GW; x++) {
      const e = GH - y, r = colorAt(E, x + .5, e - .5, E.length), i = (y * GW + x) * 4;
      if (!r) { const sky = y < GH * .5; d[i] = sky ? 214 : 205; d[i + 1] = sky ? 232 : 226; d[i + 2] = sky ? 245 : 240; d[i + 3] = 255; continue; }
      const R = ROCK[r.r]; let [cr, cg, cb] = R.c; kk[y * GW + x] = r.k;
      const hx = Math.floor(r.x / 3), he = Math.floor(r.e / 3), h = (hx * 73856093 ^ he * 19349663) >>> 0;
      let f = 1;
      if (R.tex === 'big' && h % 7 === 0) f = .72; else if (R.tex === 'dot' && h % 5 === 0) f = .86;
      else if (R.tex === 'line' && Math.floor(r.e) % 4 === 0) f = .82; else if (R.tex === 'shell' && h % 11 === 0) f = .8;
      else if (R.tex === 'hatch' && Math.floor(r.x + r.e) % 6 === 0) f = .8;
      d[i] = cr * f; d[i + 1] = cg * f; d[i + 2] = cb * f; d[i + 3] = 255;
    }
    // 層與層的界線加深
    for (let y = 1; y < GH; y++) for (let x = 0; x < GW; x++) { const a = kk[y * GW + x], b = kk[(y - 1) * GW + x]; if (a !== -9 && b !== -9 && a !== b) { const i = (y * GW + x) * 4; d[i] *= .55; d[i + 1] *= .55; d[i + 2] *= .55; } }
    ox.putImageData(img, 0, 0);
    ctx.clearRect(0, 0, St.W, St.H); ctx.imageSmoothingEnabled = false; ctx.drawImage(off, 0, 0, St.W, St.H);
    const sx = St.W / GW, sy = St.H / GH;
    // 斷層線
    E.forEach((ev, k) => { if (ev.t !== 'fault') return;
      // 斷層之後如果還有傾斜，線也要轉；這裡用兩個端點往前推
      const xAt = e => ev.fx + (GH - e) / Math.tan(Math.PI / 3), eTop = surface(E.slice(0, k))[1] - 1;
      const p1 = forward(E, { x: xAt(eTop), e: eTop, k }) || forward(E, { x: xAt(BASE + 30), e: BASE + 30, k }), p2 = forward(E, { x: xAt(BASE - 30), e: BASE - 30, k });
      if (p1 && p2) { ctx.strokeStyle = 'rgba(30,30,30,.75)'; ctx.setLineDash([5, 4]); ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(p1.x * sx, (GH - p1.e) * sy); ctx.lineTo(p2.x * sx, (GH - p2.e) * sy); ctx.stroke(); ctx.setLineDash([]); }
    });
    // 化石
    if (!opts.noFossil) E.forEach((ev, k) => {
      if (ev.t !== 'dep' || !ev.fos) return;
      const prevTop = k ? surfaceAt(E.slice(0, k)) : BASE;
      [.2, .5, .8].forEach(fx => {
        const f0 = { x: GW * fx, e: (Math.min(ev.top, GH) + prevTop) / 2, k };
        const p = forward(E, f0); if (!p || p.e < 0 || p.e > GH || p.x < 0 || p.x > GW) return;
        const r = colorAt(E, p.x, p.e, E.length); if (!r || r.k !== k) return;
        label(ctx, FOS[ev.fos][0], p.x * sx, (GH - p.e) * sy, { align: 'center', size: 18 });
      });
    });
    return E;
  }
  const topCache = new Map();
  function surfaceAt(E) { const key = JSON.stringify(E); if (!topCache.has(key)) topCache.set(key, surface(E)[1]); return topCache.get(key); }

  /* ---- 岩層積木 ---- */
  const S = stage(cv, 480, 300);
  let E = [], fos = '';
  function redraw() {
    render(S, E);
    document.getElementById('c6log').innerHTML = E.map(ev => `<li>${NAME(ev)}</li>`).join('') || '<li class="note" style="list-style:none;margin-left:-22px">一開始只有灰色的基盤。按左邊的按鈕開始堆積。</li>';
    const used = new Set(E.filter(ev => ev.t === 'dep').map(ev => ev.rock)); if (E.some(ev => ev.t === 'dike')) used.add('dike');
    document.getElementById('c6legend').innerHTML = [...used, 'base'].map(r => `<span style="display:inline-block;width:12px;height:12px;background:rgb(${ROCK[r].c});vertical-align:middle;border:1px solid #888"></span> ${ROCK[r].n}`).join('　');
  }
  document.querySelectorAll('#p-t7 [data-ev]').forEach(b => b.onclick = () => { if (E.length >= 12) return; E.push(makeEvent(E, b.dataset.ev, { fos })); redraw(); });
  document.querySelectorAll('#c6fos .chip').forEach(b => b.onclick = () => { document.querySelectorAll('#c6fos .chip').forEach(x => x.classList.remove('on')); b.classList.add('on'); fos = b.dataset.f; });
  document.getElementById('c6undo').onclick = () => { E.pop(); redraw(); };
  document.getElementById('c6clear').onclick = () => { E = []; redraw(); };
  // 課本 p.182：礫石沉積 → 傾斜＋侵蝕 → 砂岩沉積 → 岩脈 → 斷層 → 侵蝕
  document.getElementById('c6pre1').onclick = () => {
    E = []; const add = (t, o) => E.push(makeEvent(E, t, o));
    add('dep:cong', { th: 44 }); add('tilt', { a: 16 }); add('ero'); add('dep:sand', { th: 40 }); add('dike', { x: 112 }); add('fault', { fx: 52, d: 16 }); add('ero'); redraw();
  };
  registerSim('t7', { start: redraw, resize: redraw });

  /* ---- 排序挑戰 ---- */
  const Q = stage(document.getElementById('c6quiz'), 480, 300);
  let QE = [], order = [], cards = [];
  function genQuiz() {
    QE = []; const add = (t, o) => QE.push(makeEvent(QE, t, o));
    const rocks = ['cong', 'sand', 'shale', 'lime'].sort(() => Math.random() - .5);
    add('dep:' + rocks[0], { th: 24 }); add('dep:' + rocks[1], { th: 22 });
    const mid = ['tilt', 'fault', 'dike'].sort(() => Math.random() - .5).slice(0, 1 + Math.floor(Math.random() * 2)).sort((a, b) => (b === 'tilt') - (a === 'tilt'));   // 傾斜一定排在前面，避免順序無法判斷
    const fx = 50 + Math.random() * 60, dx = fx + 52 + Math.random() * 16;     // 岩脈放在斷層會經過的位置，兩者一定相交，順序才判斷得出來
    mid.forEach(m => add(m, m === 'tilt' ? { a: 14 + Math.random() * 10 } : m === 'fault' ? { fx, d: 14 } : { x: dx }));
    add('ero'); add('dep:' + rocks[2], { th: 22 });
    if (Math.random() < .5) add(mid.includes('dike') ? 'fault' : 'dike', { fx: mid.includes('dike') ? fx + 70 : fx, d: 12, x: dx });   // 第二條斷層要和第一條分開，才看得出發生過兩次
    cards = QE.map((ev, i) => ({ i, name: NAME(ev) })).sort(() => Math.random() - .5);
    order = []; showQuiz();
  }
  function showQuiz() {
    render(Q, QE);
    document.getElementById('c6qCards').innerHTML = cards.map(c => `<button class="chip" data-i="${c.i}" ${order.includes(c.i) ? 'disabled style="opacity:.35"' : ''}>${c.name}</button>`).join('');
    document.querySelectorAll('#c6qCards .chip').forEach(b => b.onclick = () => { order.push(+b.dataset.i); showQuiz(); });
    document.getElementById('c6qPick').innerHTML = order.map(i => `<li>${NAME(QE[i])}</li>`).join('');
    document.getElementById('c6qRes').style.display = 'none';
  }
  document.getElementById('c6qNew').onclick = genQuiz;
  document.getElementById('c6qReset').onclick = () => { order = []; showQuiz(); };
  document.getElementById('c6qCheck').onclick = () => {
    const res = document.getElementById('c6qRes'); res.style.display = 'block';
    // 同名事件（例如兩次侵蝕）視為可互換：比較名稱序列
    const ok = order.length === QE.length && order.every((i, k) => NAME(QE[i]) === NAME(QE[k]));
    res.className = 'callout ' + (ok ? 'good' : 'warn');
    res.innerHTML = ok ? '✔ 完全正確！' : `還不對喔。正確順序是：<ol style="margin:4px 0">${QE.map(ev => `<li>${NAME(ev)}</li>`).join('')}</ol>提示：先找「切過別人」的事件（它比較晚），再找「被侵蝕面截斷」的岩層（它比較早）。`;
  };
  registerSim('t7', { start() { if (!QE.length) genQuiz(); else showQuiz(); } });

  /* ---- 化石分類 ---- */
  mountSort(document.getElementById('c6fsort'), ['海洋環境', '陸地環境'], [
    ['三葉蟲（代表古生代）', 0], ['菊石（大多代表中生代）', 0], ['珊瑚', 0, '珊瑚只活在溫暖的淺海。'], ['魚類', 0],
    ['樹葉', 1], ['恐龍（代表中生代）', 1, '課本把恐龍歸在陸地環境。'], ['象', 1, '例：澎湖水道的古菱齒象——所以那裡以前是陸地！'],
  ]);

  /* ---- 46 億年月曆 ---- */
  const C = stage(document.getElementById('c6cal'), 760, 170), cx = C.ctx;
  const AGE = 4567;   // 百萬年
  const EVT = [
    [4567, '地球形成', '地球誕生。接下來大約 40 億年都是「前寒武紀」，化石很少，沒有代表性化石。'],
    [539, '古生代開始（三葉蟲）', '寒武紀開始，生物大量出現。三葉蟲是古生代的代表化石。'],
    [252, '中生代開始（恐龍、菊石）', '恐龍和大部分菊石化石代表中生代。'],
    [66, '恐龍滅絕，新生代開始', '哺乳類大量繁殖。新生代的化石以哺乳類為代表。'],
    [6, '臺灣開始隆起', '板塊碰撞讓臺灣開始從海中隆起（約幾百萬年前）。'],
    [2.6, '第四紀・人類出現', '人類屬的祖先出現。'],
    [0.3, '現代人（智人）', '我們這個物種出現，大約 30 萬年前。'],
  ];
  const day = a => (AGE - a) / AGE * 365;
  function fmt(a) {
    const dd = day(a); const MD = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]; let m = 0, d = dd; while (m < 11 && d >= MD[m]) { d -= MD[m]; m++; }
    if (m === 11 && dd > 364) { const mins = (dd - 364) * 24 * 60; return `12 月 31 日 ${String(Math.floor(mins / 60)).padStart(2, '0')}:${String(Math.floor(mins % 60)).padStart(2, '0')}`; }
    return `${m + 1} 月 ${Math.floor(d) + 1} 日`;
  }
  let selC = -1;
  function drawCal() {
    C.fit(); cx.clearRect(0, 0, C.W, C.H);
    const x0 = 30, x1 = 730, y = 80, X = dd => x0 + dd / 365 * (x1 - x0);
    const eras = [[4567, 539, '前寒武紀', '#CFD8DC'], [539, 252, '古生代', '#B3E5FC'], [252, 66, '中生代', '#C8E6C9'], [66, 0, '新生代', '#FFE0B2']];
    eras.forEach(([a, b, n, c]) => { cx.fillStyle = c; cx.fillRect(X(day(a)), y - 16, X(day(b)) - X(day(a)), 32); if (X(day(b)) - X(day(a)) > 70) label(cx, n, (X(day(a)) + X(day(b))) / 2, y, { align: 'center', size: 13, bold: true }); });
    ['1月', '3月', '5月', '7月', '9月', '11月'].forEach((m, i) => label(cx, m, X(i * 61), y + 30, { size: 11, color: '#888' }));
    EVT.forEach(([a, n], i) => {
      const x = X(day(a)), up = i % 2 === 0;
      cx.strokeStyle = i === selC ? '#C62828' : '#555'; cx.lineWidth = i === selC ? 3 : 1.5; cx.beginPath(); cx.moveTo(x, y - 16); cx.lineTo(x, up ? 30 : 140); cx.stroke();
      cx.fillStyle = i === selC ? '#C62828' : '#455A64'; cx.beginPath(); cx.arc(x, up ? 30 : 140, 6, 0, 7); cx.fill();
      EVT[i].hit = [x, up ? 30 : 140];
      if (i < 3 || i === selC) label(cx, i === selC ? n : ['地球形成', '古生代開始', '中生代開始'][i], Math.min(x + 8, 700), up ? 18 : 156, { size: 12, bold: true, align: x > 600 ? 'right' : 'left', bg: 'rgba(255,255,255,.85)' });
    });
    label(cx, '12 月底擠滿了事件 → 點右邊的標記 ↘', 730, 12, { size: 11, align: 'right', color: '#C62828' });
  }
  document.getElementById('c6cal').addEventListener('pointerdown', e => {
    const p = C.pt(e); let best = -1, bd = 1e9;
    EVT.forEach((ev, i) => { const d = Math.abs(ev.hit[0] - p.x) + Math.abs(ev.hit[1] - p.y) * .3; if (d < bd) { bd = d; best = i; } });
    if (best < 0) return; selC = best; drawCal();
    const [a, n, t] = EVT[best];
    document.getElementById('c6calTxt').innerHTML = `<b>${n}</b>：約 ${a >= 1 ? a.toLocaleString() + ' 百萬年' : (a * 100) + ' 萬年'}前 → 濃縮月曆上的 <b>${fmt(a)}</b><br>${t}`;
  });
  registerSim('t7', { start: drawCal, resize: drawCal });
})();
