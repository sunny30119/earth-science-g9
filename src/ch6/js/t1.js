/* ===== 第六章 分頁 1：地球分層（剖面＋放大鏡）、地震波陰影區 =====
   半徑（公里）：地表 6370；地殼厚 35（大陸）；地函底 2900 深；外核 2900–5150 深；內核 5150 深以下。 */
(() => {
  const cv = document.getElementById('c6earth'); if (!cv) return;
  const S = stage(cv, 520, 420), ctx = S.ctx;
  const R = 6370;
  const LAYERS = {
    comp: [['地殼', 0, 35, '#8D6E63', '地球最外層的薄殼。<b>大陸地殼</b>較厚、密度小、以花岡岩為主；<b>海洋地殼</b>較薄、密度大、以玄武岩為主。'],
      ['地函', 35, 2900, '#E07B39', '位在地殼下方，由密度更大的岩石組成，主要元素為<b>氧、矽、鎂</b>。注意：地函大部分是<b>固體</b>！'],
      ['地核', 2900, 6370, '#F2C14E', '地球最內層，密度最大，主要由<b>鐵、鎳</b>等金屬組成。🟣 加深：外核是液體、內核是固體。']],
    mech: [['岩石圈', 0, 100, '#5D4037', '從地表到約 100 公里深，包含<b>地殼＋部分地函</b>，由堅硬的岩石組成。<b>板塊就是岩石圈</b>裂成的一塊塊。'],
      ['軟流圈', 100, 350, '#C0504D', '在岩石圈下方、地函之中，是具<b>可塑性</b>、移動極緩慢的物質。板塊就「漂」在它上面緩慢移動。'],
      ['其餘的地函', 350, 2900, '#E8A26A', '（課本不細分）'], ['地核', 2900, 6370, '#F2C14E', '鐵、鎳組成。']],
  };
  let view = 'comp', sel = null;
  const zoom = bindRange('c6zoom', v => v < 2 ? '整顆地球' : '× ' + Math.round(Math.pow(10, v / 100 * 2.6)), () => draw());
  // 把「深度」換成畫面座標：以地表頂點 (cx, top) 為放大中心
  function geom() {
    const z = Math.pow(10, +zoom.value / 100 * 2.6), r0 = 190;
    const cx = 260, cy0 = 215;
    const scale = r0 / R * z;
    const top = cy0 - r0;                               // 地表頂點的畫面位置（放大時固定在這）
    const cy = top + R * scale;
    return { z, scale, cx, cy, top };
  }
  function draw() {
    S.fit(); ctx.clearRect(0, 0, S.W, S.H);
    ctx.fillStyle = '#0E1A2B'; ctx.fillRect(0, 0, S.W, S.H);
    const g = geom(), Ls = LAYERS[view];
    ctx.save(); ctx.beginPath(); ctx.rect(0, 0, S.W, S.H); ctx.clip();
    // 由外往內畫圓（只畫下半部扇形會比較像切開；這裡畫完整的圓再切掉右上四分之一）
    Ls.forEach(([n, d0, d1, c]) => {
      ctx.fillStyle = c; ctx.beginPath(); ctx.arc(g.cx, g.cy, (R - d0) * g.scale, 0, Math.PI * 2); ctx.fill();
      if (sel === n) { ctx.strokeStyle = '#FFD27A'; ctx.lineWidth = 4; ctx.stroke(); }
    });
    if (view === 'comp') { ctx.fillStyle = '#FFE38A'; ctx.beginPath(); ctx.arc(g.cx, g.cy, 1220 * g.scale, 0, 7); ctx.fill(); }
    // 切開的那一角改成地表外觀（藍綠色）
    if (g.z < 3) { ctx.fillStyle = '#2F6E9E'; ctx.beginPath(); ctx.moveTo(g.cx, g.cy); ctx.arc(g.cx, g.cy, R * g.scale, -Math.PI / 2, 0); ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#5E9E5A'; [[.3, -.5, 30], [.6, -.75, 22], [.15, -.2, 18]].forEach(([fx, fy, rr]) => { ctx.beginPath(); ctx.arc(g.cx + fx * R * g.scale, g.cy + fy * R * g.scale, rr, 0, 7); ctx.fill(); }); }
    // 鑽井（約 12 公里）
    const wellPx = 12 * g.scale;
    ctx.strokeStyle = '#fff'; ctx.lineWidth = Math.max(2, 4); ctx.beginPath(); ctx.moveTo(g.cx - 40, g.top); ctx.lineTo(g.cx - 40, g.top + Math.max(wellPx, .5)); ctx.stroke();
    ctx.fillStyle = '#fff'; ctx.fillRect(g.cx - 48, g.top - 14, 16, 14);
    label(ctx, wellPx < 6 ? '← 最深的鑽井（12 公里）短到看不見！' : '最深的鑽井 12 公里', g.cx - 30, g.top - 8, { size: 13, color: '#fff', bold: true });
    // 層名
    Ls.forEach(([n, d0, d1]) => {
      const mid = (d0 + Math.min(d1, 6370)) / 2, y = g.top + mid * g.scale;
      const dh = (Math.min(d1, 6370) - d0) * g.scale;
      if (y > 0 && y < S.H && dh > 14) label(ctx, `${n}`, g.cx + 12, Math.min(y, S.H - 14), { size: 14, bold: true, color: '#fff', bg: 'rgba(0,0,0,.35)' });
    });
    // 深度尺
    if (g.z > 3) {
      const kmPerPx = 1 / g.scale; const nice = [1, 2, 5, 10, 20, 50, 100, 200, 500, 1000].find(k => k / kmPerPx > 60) || 1000;
      ctx.strokeStyle = '#fff'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(20, S.H - 20); ctx.lineTo(20 + nice / kmPerPx, S.H - 20); ctx.stroke();
      label(ctx, nice + ' 公里', 20, S.H - 34, { size: 12, color: '#fff' });
    }
    ctx.restore();
  }
  cv.addEventListener('pointerdown', e => {
    const p = S.pt(e), g = geom(); const r = Math.hypot(p.x - g.cx, p.y - g.cy) / g.scale; const d = R - r;
    if (d < 0) return;
    const L = LAYERS[view].find(([, d0, d1]) => d >= d0 && d < d1); if (!L) return;
    sel = L[0];
    document.getElementById('c6layer').innerHTML = `<b style="font-size:1.1rem">${L[0]}</b>（深度約 ${L[1]}～${L[2] >= 6370 ? '6370（地心）' : L[2]} 公里）<br>${L[4]}`;
    draw();
  });
  document.querySelectorAll('#c6view .chip').forEach(b => b.onclick = () => { document.querySelectorAll('#c6view .chip').forEach(x => x.classList.remove('on')); b.classList.add('on'); view = b.dataset.v; sel = null; draw(); });
  registerSim('t1', { start: draw, resize: draw });

  /* ---------- 地震波 X 光 ---------- */
  const wc = document.getElementById('c6wave');
  const W = stage(wc, 420, 420), wx = W.ctx;
  let wtype = 'S';
  const solid = document.getElementById('c6solid');
  function wdraw() {
    W.fit(); wx.clearRect(0, 0, W.W, W.H); wx.fillStyle = '#0E1A2B'; wx.fillRect(0, 0, W.W, W.H);
    const cx = 210, cy = 210, r = 180, rc = r * 3470 / 6370, ri = r * 1220 / 6370;
    wx.fillStyle = '#E07B39'; wx.beginPath(); wx.arc(cx, cy, r, 0, 7); wx.fill();
    wx.fillStyle = solid.checked ? '#C9A33C' : '#F2C14E'; wx.beginPath(); wx.arc(cx, cy, rc, 0, 7); wx.fill();
    wx.fillStyle = '#FFE38A'; wx.beginPath(); wx.arc(cx, cy, ri, 0, 7); wx.fill();
    label(wx, '地函（固體）', cx, cy - rc - 22, { align: 'center', size: 12, color: '#fff', bold: true });
    label(wx, solid.checked ? '外核（假設固體）' : '外核（液體）', cx, cy - ri - 22, { align: 'center', size: 12, color: '#5D4037', bold: true });
    const sx = cx, sy = cy - r;                 // 震源在頂端
    let blocked = 0, arrived = 0;
    for (let a = 4; a <= 176; a += 4) {
      // 從震源出發的直線（弦），角度 a 是相對垂直往下的方向
      const ang = Math.PI / 2 + (a - 90) * Math.PI / 180 * .99;
      const dx = Math.cos(ang), dy = Math.sin(ang);
      // 和外核的交點
      const fx = sx - cx, fy = sy - cy, b = fx * dx + fy * dy, c = fx * fx + fy * fy - rc * rc, disc = b * b - c;
      const tEnd = -2 * (fx * dx + fy * dy);    // 和地表另一端的交點
      let tCut = tEnd, hit = false;
      if (disc > 0) { const t1 = -b - Math.sqrt(disc); if (t1 > 0 && t1 < tEnd) { tCut = t1; hit = true; } }
      const stop = wtype === 'S' && hit && !solid.checked;
      wx.strokeStyle = stop ? 'rgba(255,90,90,.9)' : wtype === 'S' ? 'rgba(120,220,255,.75)' : 'rgba(170,255,170,.75)';
      wx.lineWidth = 1.6; wx.beginPath(); wx.moveTo(sx, sy); wx.lineTo(sx + dx * (stop ? tCut : tEnd), sy + dy * (stop ? tCut : tEnd)); wx.stroke();
      if (stop) { blocked++; wx.fillStyle = '#FF5A5A'; wx.beginPath(); wx.arc(sx + dx * tCut, sy + dy * tCut, 2.5, 0, 7); wx.fill(); }
      else { arrived++; wx.fillStyle = '#fff'; wx.beginPath(); wx.arc(sx + dx * tEnd, sy + dy * tEnd, 2.5, 0, 7); wx.fill(); }
    }
    // 陰影區
    if (wtype === 'S' && !solid.checked) {
      const half = Math.PI - 2 * Math.acos(rc / r); wx.strokeStyle = 'rgba(255,90,90,.9)'; wx.lineWidth = 8; wx.beginPath(); wx.arc(cx, cy, r + 6, Math.PI / 2 - half, Math.PI / 2 + half); wx.stroke();
      label(wx, 'S 波收不到的「陰影區」', cx, cy + r + 20, { align: 'center', size: 13, color: '#FF8A80', bold: true });
    }
    wx.fillStyle = '#FF3B3B'; wx.beginPath(); for (let k = 0; k < 10; k++) { const rr = k % 2 ? 4 : 10, a = k / 10 * Math.PI * 2 - Math.PI / 2; wx.lineTo(sx + Math.cos(a) * rr, sy + Math.sin(a) * rr); } wx.closePath(); wx.fill();
    document.getElementById('c6wTxt').innerHTML = wtype === 'S'
      ? (solid.checked ? '如果外核是固體，S 波應該能穿過去，地球另一面也收得到。<b>但真實的地震站在另一面收不到 S 波</b>——所以外核不是固體。'
        : `S 波穿過了<b>整個地函</b>（所以地函是固體！），但一碰到外核就停了（${blocked} 條被擋下）。地球另一面出現一大片收不到 S 波的「陰影區」→ 外核是<b>液體</b>。<br><span class="note">真實的地震波會彎曲前進，實際上從震央算起約 103° 以外就收不到 S 波。</span>`)
      : 'P 波在固體和液體中都能傳播，可以穿過外核（真實情況：P 波進出外核時會大幅轉彎，也會形成一圈較窄的 P 波陰影區）。';
  }
  document.querySelectorAll('#c6wtype .chip').forEach(b => b.onclick = () => { document.querySelectorAll('#c6wtype .chip').forEach(x => x.classList.remove('on')); b.classList.add('on'); wtype = b.dataset.w; wdraw(); });
  solid.onchange = wdraw;
  registerSim('t1', { start: wdraw, resize: wdraw });
})();
