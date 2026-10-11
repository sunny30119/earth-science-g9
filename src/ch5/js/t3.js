/* ===== 分頁 3：水循環動畫、鹹水湖製造機 ===== */
(() => {
  /* ---------- 水循環 ---------- */
  const cv = document.getElementById('t3cyc'); if (!cv) return;
  const S = stage(cv, 760, 400), ctx = S.ctx;
  const temp = bindRange('t3temp', v => v + ' °C');
  // 路線：每段 [名稱, 點列, 狀態('l' 液態 / 'g' 氣態)]
  const SEG = {
    evapO: ['蒸發', [[120, 330], [160, 200], [250, 95]], 'g'],
    evapL: ['蒸發', [[560, 250], [560, 160], [520, 95]], 'g'],
    cloud: ['凝結（水蒸氣變成小水滴，形成雲）', [[250, 95], [390, 80], [520, 95]], 'c'],
    rainO: ['降水（落回海洋）', [[300, 100], [290, 330]], 'l'],
    rainL: ['降水（落在陸地上）', [[520, 100], [560, 200], [560, 250]], 'l'],
    river: ['河流把水帶回海洋', [[560, 250], [470, 290], [380, 318], [300, 336]], 'l'],
    infil: ['滲入地下，變成地下水', [[560, 250], [560, 340], [400, 365], [260, 360]], 'l'],
  };
  // 每段走完要去哪（機率）
  const NEXT = { evapO: [['cloud', 1]], evapL: [['cloud', 1]], cloud: [['rainO', .55], ['rainL', .45]], rainO: [['ocean', 1]],
    rainL: [['river', .45], ['infil', .35], ['evapL', .2]], river: [['ocean', 1]], infil: [['ocean', 1]] };
  const parts = [];
  let tracked = null, logLines = [], spawn = 0;
  function pick(arr) { let r = Math.random(); for (const [k, p] of arr) { if ((r -= p) <= 0) return k; } return arr[arr.length - 1][0]; }
  function newPart(seg) { return { seg, t: 0, x: 0, y: 0, jit: Math.random() * 16 - 8 }; }
  function pos(p) {
    const pts = SEG[p.seg][1]; const n = pts.length - 1; const f = clamp(p.t, 0, 1) * n; const i = Math.min(n - 1, Math.floor(f)); const u = f - i;
    p.x = lerp(pts[i][0], pts[i + 1][0], u) + p.jit; p.y = lerp(pts[i][1], pts[i + 1][1], u) + p.jit * .4;
  }
  function log(s) { logLines.push(s); document.getElementById('t3log').innerHTML = logLines.map((l, i) => `${i + 1}. ${l}`).join('<br>'); }
  function step(dt) {
    const T = +temp.value, k = .3 + T / 30;                 // 溫度愈高，跑得愈快、蒸發愈多
    spawn += dt * (2 + T * .35);
    while (spawn > 1 && parts.length < 160) { spawn--; parts.push(newPart('evapO')); }
    for (let i = parts.length - 1; i >= 0; i--) {
      const p = parts[i]; p.t += dt * k * (p.seg === 'infil' ? .25 : p.seg === 'cloud' ? .45 : .6);
      if (p.t >= 1) {
        const nx = pick(NEXT[p.seg]);
        if (nx === 'ocean') {
          if (p === tracked) { log('回到海洋。🎉 一趟旅程完成！（再按一次可以追蹤新的一滴）'); tracked = null; }
          parts.splice(i, 1); continue;
        }
        p.seg = nx; p.t = 0;
        if (p === tracked) log(SEG[nx][0]);
      }
      pos(p);
    }
    draw(T);
  }
  function draw(T) {
    S.fit(); ctx.clearRect(0, 0, S.W, S.H);
    const sky = ctx.createLinearGradient(0, 0, 0, 300); sky.addColorStop(0, T > 28 ? '#FFE8C2' : '#CFE7F7'); sky.addColorStop(1, '#F2F8FC');
    ctx.fillStyle = sky; ctx.fillRect(0, 0, S.W, S.H);
    // 太陽
    ctx.fillStyle = `rgba(255,${200 - T * 2},60,.9)`; ctx.beginPath(); ctx.arc(60, 55, 22 + T * .3, 0, 7); ctx.fill();
    // 海洋
    ctx.fillStyle = '#3E7CC0'; ctx.fillRect(0, 320, 320, 80);
    label(ctx, '海洋', 60, 365, { color: '#fff', bold: true, size: 16 });
    // 陸地與山
    ctx.fillStyle = '#9CCC65'; ctx.beginPath(); ctx.moveTo(300, 330); ctx.lineTo(470, 290); ctx.lineTo(600, 160); ctx.lineTo(700, 120); ctx.lineTo(760, 150); ctx.lineTo(760, 400); ctx.lineTo(300, 400); ctx.fill();
    ctx.fillStyle = '#C8A97E'; ctx.fillRect(300, 350, 460, 50);
    label(ctx, '地下水', 650, 375, { color: '#5D4037', size: 14, bold: true });
    ctx.strokeStyle = '#3E7CC0'; ctx.lineWidth = 6; ctx.lineCap = 'round';
    ctx.beginPath(); SEG.river[1].forEach(([x, y], i) => i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)); ctx.stroke();
    label(ctx, '河流', 470, 305, { size: 13, color: '#0D47A1' });
    // 雲
    ctx.fillStyle = 'rgba(255,255,255,.95)';
    [[260, 92, 34], [300, 80, 40], [350, 88, 34], [440, 82, 38], [500, 92, 32]].forEach(([x, y, r]) => { ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.fill(); });
    // 過程標籤
    [['蒸發', 140, 250], ['凝結', 390, 50], ['降水', 280, 220], ['降水', 600, 210], ['滲入', 585, 320], ['蒸發', 520, 175]].forEach(([t, x, y]) => label(ctx, t, x, y, { size: 14, bold: true, color: '#C46A28', bg: 'rgba(255,255,255,.75)', align: 'center' }));
    // 水分子
    parts.forEach(p => {
      const st = SEG[p.seg][2];
      if (st === 'g') { ctx.strokeStyle = 'rgba(70,130,200,.6)'; ctx.setLineDash([2, 2]); ctx.beginPath(); ctx.arc(p.x, p.y, 4, 0, 7); ctx.stroke(); ctx.setLineDash([]); }
      else if (st === 'c') { ctx.fillStyle = 'rgba(160,190,220,.9)'; ctx.beginPath(); ctx.arc(p.x, p.y, 2.5, 0, 7); ctx.fill(); }
      else { ctx.fillStyle = '#1565C0'; ctx.beginPath(); ctx.arc(p.x, p.y, 3.5, 0, 7); ctx.fill(); }
    });
    if (tracked) {
      ctx.strokeStyle = '#E53935'; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(tracked.x, tracked.y, 11, 0, 7); ctx.stroke();
      label(ctx, '我在這！', tracked.x + 14, tracked.y - 12, { color: '#C62828', bold: true, size: 13, bg: 'rgba(255,255,255,.85)' });
    }
  }
  document.getElementById('t3track').onclick = () => {
    tracked = newPart('evapO'); parts.push(tracked); logLines = []; log('從海洋表面「蒸發」，液態水變成看不見的水蒸氣（氣態），往上飄。');
  };
  const L = loop(step);
  registerSim('t3', { start() { L.start(); }, stop() { L.stop(); } });

  /* ---------- 鹹水湖製造機 ---------- */
  const lc = document.getElementById('t3lake');
  const K = stage(lc, 520, 330), kx = K.ctx;
  const inR = bindRange('t3in', v => v < 20 ? '很少' : v < 60 ? '中等' : '很多', () => drawLake());
  const evR = bindRange('t3ev', v => v < 25 ? '濕潤' : v < 65 ? '普通' : '非常乾燥', () => drawLake());
  const outC = document.getElementById('t3out');
  const C_IN = 0.5, SAT = 260, VMAX = 100;                 // 河水鹽度 0.5‰（示意）、飽和約 260‰
  const L0 = { year: 0, V: 70, M: 70 * C_IN, crust: 0, play: false, ocean: false };
  const lk = { ...L0 };
  function lakeStep(dt) {
    if (!lk.play) return;
    const yrs = dt * 1500; lk.year += yrs;
    const sub = 40, h = yrs / sub;
    for (let i = 0; i < sub; i++) {
      const Qin = +inR.value / 100 * 1.2, E = +evR.value / 100 * 1.6 * Math.sqrt(Math.max(lk.V, 0) / VMAX);
      let dV = Qin - E, out = 0;
      if (outC.checked && lk.V + dV * h > VMAX) { out = (lk.V + dV * h - VMAX) / h; dV -= out; }
      const c = lk.V > .5 ? lk.M / lk.V : 0;
      const sink = lk.ocean ? 1.3e-4 * lk.M : 0;      // 大海：生物做殼、沉積、鹽岩……把鹽帶走
      lk.M += (Qin * C_IN - out * c - sink) * h;
      lk.V = clamp(lk.V + dV * h, 0.3, VMAX + 5);
      if (lk.M / lk.V > SAT) { lk.crust += lk.M - SAT * lk.V; lk.M = SAT * lk.V; }   // 超過飽和 → 鹽在湖底結晶
    }
    drawLake();
  }
  function drawLake() {
    K.fit(); kx.clearRect(0, 0, K.W, K.H);
    kx.fillStyle = '#F4EEDF'; kx.fillRect(0, 0, K.W, K.H);
    const c = lk.V > .5 ? lk.M / lk.V : 0;
    // 盆地
    const bx0 = 110, bx1 = 430, top = 120, bot = 280;
    const depth = (bot - top) * lk.V / (VMAX + 5);
    const lvl = bot - depth;
    kx.fillStyle = '#A1887F'; kx.beginPath(); kx.moveTo(0, top); kx.lineTo(bx0, top); kx.quadraticCurveTo(270, 2 * bot - top, bx1, top); kx.lineTo(K.W, top);
    kx.lineTo(K.W, K.H); kx.lineTo(0, K.H); kx.fill();
    // 湖水
    kx.save(); kx.beginPath(); kx.moveTo(bx0, top); kx.quadraticCurveTo(270, 2 * bot - top, bx1, top); kx.closePath(); kx.clip();
    const sal = clamp(c / 120, 0, 1);
    kx.fillStyle = `rgb(${Math.round(lerp(70, 110, sal))},${Math.round(lerp(140, 190, sal))},${Math.round(lerp(210, 170, sal))})`;
    kx.fillRect(0, lvl, K.W, K.H);
    // 鹽粒
    const r = rng(3), dots = Math.min(500, Math.round(c * 2));
    kx.fillStyle = 'rgba(255,255,255,.85)';
    for (let i = 0; i < dots; i++) { const x = bx0 + r() * (bx1 - bx0), y = lvl + r() * (bot - lvl); kx.fillRect(x, y, 2, 2); }
    // 湖底鹽層
    if (lk.crust > 0) { const th = Math.min(30, 3 + lk.crust / 400); kx.fillStyle = '#FAFAFA'; kx.fillRect(0, bot - th, K.W, th + 10); }
    kx.restore();
    if (lk.crust > 0) label(kx, '⬆ 鹽在湖底結晶（鹽岩的開始！）', 270, bot + 25, { align: 'center', size: 13, bold: true, color: '#5D4037', bg: 'rgba(255,255,255,.8)' });
    // 河流進來
    const qin = +inR.value;
    kx.strokeStyle = '#4A8CD2'; kx.lineWidth = 2 + qin / 12; kx.beginPath(); kx.moveTo(0, top - 6); kx.lineTo(bx0 + 10, top - 4); kx.stroke();
    label(kx, '河水（帶著一點點溶解的鹽）→', 8, top - 24, { size: 12, color: '#0D47A1' });
    // 出口
    if (outC.checked) { kx.strokeStyle = '#4A8CD2'; kx.lineWidth = 4; kx.beginPath(); kx.moveTo(bx1 - 10, top - 4); kx.lineTo(K.W, top - 6); kx.stroke(); label(kx, '→ 出口', K.W - 8, top - 24, { size: 12, color: '#0D47A1', align: 'right' }); }
    else { kx.fillStyle = '#6D4C41'; kx.fillRect(bx1 - 4, top - 20, 10, 20); label(kx, '沒有出口', K.W - 8, top - 24, { size: 12, color: '#6D4C41', align: 'right', bold: true }); }
    // 蒸發
    const ev = +evR.value;
    for (let i = 0; i < ev / 10; i++) { const x = bx0 + 30 + i * 28; arrow(kx, x, lvl - 6, x, lvl - 40, 'rgba(230,120,40,.7)', 2, 7); }
    label(kx, '☀️ 蒸發只帶走「水」，鹽留下來', 270, 30, { align: 'center', size: 14, bold: true, color: '#BF360C' });
    // 讀數
    if (lk.ocean) label(kx, '大海模式：鹽也有「出口」（生物做成貝殼、沉積成岩石）', 270, 56, { align: 'center', size: 13, color: '#2E7D32', bold: true, bg: 'rgba(255,255,255,.85)' });
    const word = c < 1 ? '淡水' : c < 10 ? '微鹹' : c < 30 ? '鹹' : c < 45 ? '跟海水差不多鹹' : `比海水鹹 ${(c / 35).toFixed(1)} 倍`;
    document.getElementById('t3read').innerHTML =
      `<div><b>${Math.round(lk.year).toLocaleString()} 年</b><span>經過時間</span></div>
       <div><b>${c.toFixed(1)} ‰</b><span>湖水鹽度（海水約 35‰）</span></div>
       <div><b>${word}</b><span>喝起來</span></div>`;
  }
  const PRE = { sun: [80, 15, true], dead: [40, 70, false], ocean: [70, 55, false] };
  document.querySelectorAll('#p-t3 [data-pre]').forEach(b => b.onclick = () => {
    const [a, e, o] = PRE[b.dataset.pre];
    inR.value = a; evR.value = e; outC.checked = o; [inR, evR].forEach(x => x.dispatchEvent(new Event('input')));
    Object.assign(lk, { ...L0, ocean: b.dataset.pre === 'ocean' }); if (!lk.play) playB.click(); else drawLake();
  });
  outC.onchange = () => { lk.ocean = false; drawLake(); };
  const playB = document.getElementById('t3play');
  playB.onclick = () => { lk.play = !lk.play; playB.textContent = lk.play ? '⏸ 暫停' : '▶ 時間前進'; };
  document.getElementById('t3reset').onclick = () => { const p = lk.play; Object.assign(lk, { ...L0, play: p }); drawLake(); };
  const LL = loop(lakeStep);
  registerSim('t3', { start() { drawLake(); LL.start(); }, stop() { LL.stop(); } });
})();
