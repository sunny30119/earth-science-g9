/* ===== 第七章 分頁 1：宇宙放大鏡、光的時光機 ===== */
(() => {
  const cv = document.getElementById('c7zoom'); if (!cv) return;
  const S = stage(cv, 480, 400), ctx = S.ctx;
  const LV = [
    ['地球', '約 1 萬 3 千公里', '<b>行星</b>：繞著恆星公轉、自己不發光。地球是太陽系的一顆行星。'],
    ['地球與月球', '約 80 萬公里', '<b>衛星</b>：繞著行星公轉的天體。月球繞地球公轉，距離約 38 萬公里。'],
    ['太陽系', '約 90 億公里（60 天文單位）', '<b>太陽系</b>：太陽（恆星）＋八大行星＋衛星、矮行星、小行星、彗星。1 天文單位（AU）＝地球到太陽的平均距離。'],
    ['太陽的鄰居', '約 20 光年', '<b>恆星</b>：自己會發光發熱的天體。離太陽最近的恆星也要約 4 光年——光要走 4 年！'],
    ['銀河系', '約 15 萬光年', '<b>星系</b>：由恆星、氣體與塵埃構成的系統，是組成宇宙的基本單位。銀河系約有兩千多億顆恆星，太陽只是其中一顆。'],
    ['宇宙', '數十億光年', '<b>宇宙</b>：所有時空的總和（四面八方謂之「宇」，古往今來謂之「宙」）。宇宙中有數不清的星系。'],
  ];
  const z = bindRange('c7z', v => LV[Math.min(5, Math.round(v / 100))][0], () => draw());
  const r = rng(11), stars = Array.from({ length: 400 }, () => [r(), r(), r()]);
  function scene(i, a) {
    if (a <= 0.01) return;
    ctx.save(); ctx.globalAlpha = a;
    const cx = 240, cy = 200;
    if (i === 0) { const g = ctx.createRadialGradient(cx - 30, cy - 30, 10, cx, cy, 130); g.addColorStop(0, '#6FB6FF'); g.addColorStop(1, '#0B3D91'); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(cx, cy, 130, 0, 7); ctx.fill();
      ctx.fillStyle = 'rgba(90,170,90,.85)'; [[-40, -30, 40], [30, 20, 30], [-10, 60, 22]].forEach(([dx, dy, rr]) => { ctx.beginPath(); ctx.arc(cx + dx, cy + dy, rr, 0, 7); ctx.fill(); }); }
    if (i === 1) { ctx.fillStyle = '#3E7CC0'; ctx.beginPath(); ctx.arc(cx - 150, cy, 10, 0, 7); ctx.fill(); ctx.strokeStyle = 'rgba(255,255,255,.3)'; ctx.beginPath(); ctx.arc(cx - 150, cy, 300 * .66, -.5, .5); ctx.stroke();
      ctx.fillStyle = '#ccc'; ctx.beginPath(); ctx.arc(cx + 48, cy, 3, 0, 7); ctx.fill(); label(ctx, '月球', cx + 56, cy - 12, { color: '#fff', size: 13 }); label(ctx, '地球', cx - 150, cy + 24, { color: '#fff', size: 13, align: 'center' });
      label(ctx, '← 38 萬公里 →', cx - 50, cy + 30, { color: '#aaa', size: 12, align: 'center' }); }
    if (i === 2) { ctx.fillStyle = '#FFD54F'; ctx.beginPath(); ctx.arc(cx, cy, 8, 0, 7); ctx.fill();
      [0.39, 0.72, 1, 1.52, 5.2, 9.5, 19.2, 30].forEach((au, k) => { const rr = Math.sqrt(au) * 33; ctx.strokeStyle = 'rgba(255,255,255,.25)'; ctx.beginPath(); ctx.arc(cx, cy, rr, 0, 7); ctx.stroke(); const ang = k * 1.7; ctx.fillStyle = ['#aaa', '#e8c27a', '#4a90e2', '#d0623d', '#d9b38c', '#e8d39a', '#8fd3e8', '#4f6fd8'][k]; ctx.beginPath(); ctx.arc(cx + Math.cos(ang) * rr, cy + Math.sin(ang) * rr, k > 3 ? 5 : 3, 0, 7); ctx.fill(); });
      label(ctx, '（距離已壓縮，否則外行星會跑出畫面）', cx, 385, { color: '#999', size: 11, align: 'center' }); }
    if (i === 3) { stars.slice(0, 40).forEach(([x, y, b]) => { ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(x * 480, y * 400, 1 + b * 2.5, 0, 7); ctx.fill(); }); ctx.fillStyle = '#FFD54F'; ctx.beginPath(); ctx.arc(cx, cy, 4, 0, 7); ctx.fill(); label(ctx, '太陽', cx + 8, cy - 8, { color: '#FFD54F', size: 13 }); label(ctx, '比鄰星（約 4.2 光年）', cx + 70, cy + 40, { color: '#fff', size: 12 }); ctx.fillStyle = '#ff8a65'; ctx.beginPath(); ctx.arc(cx + 66, cy + 40, 2.5, 0, 7); ctx.fill(); }
    if (i === 4) { for (let k = 0; k < 1400; k++) { const t = k / 1400 * 14, arm = k % 2 ? Math.PI : 0, rr = 8 + t * 12, a2 = t * .9 + arm; const rr2 = rr + (stars[k % 400][0] - .5) * 18; ctx.fillStyle = `rgba(${200 + stars[k % 400][1] * 55},${190 + stars[k % 400][2] * 50},255,.55)`; ctx.fillRect(cx + Math.cos(a2) * rr2, cy + Math.sin(a2) * rr2 * .8, 1.5, 1.5); }
      const g = ctx.createRadialGradient(cx, cy, 2, cx, cy, 40); g.addColorStop(0, 'rgba(255,240,200,.9)'); g.addColorStop(1, 'rgba(255,240,200,0)'); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(cx, cy, 40, 0, 7); ctx.fill();
      ctx.strokeStyle = '#FFD54F'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(cx + 95, cy + 45, 6, 0, 7); ctx.stroke(); label(ctx, '太陽在這裡（不是中心！）', cx + 104, cy + 60, { color: '#FFD54F', size: 12, bold: true }); }
    if (i === 5) { stars.forEach(([x, y, b], k) => { ctx.fillStyle = `hsla(${200 + b * 60},70%,80%,.8)`; ctx.beginPath(); ctx.ellipse(x * 480, y * 400, 1 + b * 4, (1 + b * 4) * .5, k, 0, 7); ctx.fill(); }); label(ctx, '每一個光點都是一個星系', 240, 380, { color: '#fff', size: 13, align: 'center' }); }
    ctx.restore();
  }
  function draw() {
    S.fit(); ctx.fillStyle = '#05070F'; ctx.fillRect(0, 0, S.W, S.H);
    const v = +z.value / 100, i = Math.floor(v), f = v - i;
    scene(i, 1 - f); if (i < 5) scene(i + 1, f);
    const L = LV[Math.min(5, Math.round(v))];
    label(ctx, `畫面寬度：${L[1]}`, 10, 18, { color: '#fff', size: 13, bg: 'rgba(0,0,0,.5)' });
    document.getElementById('c7zTxt').innerHTML = `<span class="big">${L[0]}</span><br>${L[2]}`;
  }
  registerSim('t1', { start: draw, resize: draw });

  /* ---------- 光的時光機 ---------- */
  const OBJ = [
    ['月球', 1.3 / 31557600, '約 1.3 秒', '你看到的是「1 秒多以前」的月亮——幾乎就是現在。'],
    ['太陽', 8.3 / 525960, '約 8 分 20 秒', '太陽光要走約 8 分鐘才到地球。你看到的太陽是 8 分鐘前的太陽。'],
    ['北極星', 400, '約 400 年', '北極星的光約 400 年前出發。那時候大約是明朝末年，荷蘭人剛來到臺灣南部。'],
    ['仙女座星系', 2.5e6, '約 250 萬年', '肉眼看得到最遠的天體之一。光出發時，地球上的人類祖先才剛出現（第六章：第四紀）。'],
    ['車輪星系', 5e8, '約 5 億年', '光出發時，地球正處在古生代，海裡滿是三葉蟲（第六章！）。'],
    ['韋伯深空影像中最遠的星系', 9.5e9, '約 95 億年', '光出發時，太陽和地球都還沒誕生（地球約 46 億歲）。'],
  ];
  let sel = 2;
  const box = document.getElementById('c7ly');
  OBJ.forEach((o, i) => { const b = document.createElement('button'); b.className = 'chip' + (i === sel ? ' on' : ''); b.textContent = o[0]; b.onclick = () => { box.querySelectorAll('.chip').forEach(x => x.classList.remove('on')); b.classList.add('on'); sel = i; drawLy(); }; box.appendChild(b); });
  const LC = stage(document.getElementById('c7lyc'), 420, 200), lx = LC.ctx;
  let t0 = performance.now();
  function drawLy() {
    LC.fit(); lx.fillStyle = '#05070F'; lx.fillRect(0, 0, LC.W, LC.H);
    const o = OBJ[sel];
    // 對數尺：1 秒 ～ 100 億年
    const pos = Math.log10(o[1] * 31557600) / Math.log10(1e10 * 31557600);
    const x0 = 30, x1 = 390, xp = x0 + (x1 - x0) * clamp(pos, 0, 1);
    lx.strokeStyle = '#555'; lx.lineWidth = 2; lx.beginPath(); lx.moveTo(x0, 150); lx.lineTo(x1, 150); lx.stroke();
    [['1 秒', 0], ['1 年', Math.log10(31557600) / Math.log10(1e10 * 31557600)], ['1 萬年', Math.log10(1e4 * 31557600) / Math.log10(1e10 * 31557600)], ['100 億年', 1]].forEach(([t, p]) => { const x = x0 + (x1 - x0) * p; lx.fillStyle = '#888'; lx.fillRect(x - 1, 144, 2, 12); label(lx, t, x, 172, { color: '#aaa', size: 11, align: 'center' }); });
    lx.fillStyle = '#4A90E2'; lx.beginPath(); lx.arc(x0, 150, 8, 0, 7); lx.fill(); label(lx, '地球', x0, 128, { color: '#fff', size: 12, align: 'center' });
    lx.fillStyle = '#FFD54F'; lx.beginPath(); lx.arc(xp, 150, 7, 0, 7); lx.fill(); label(lx, o[0], xp, 128, { color: '#FFD54F', size: 12, align: 'center', bold: true });
    const ph = ((performance.now() - t0) / 2500) % 1;
    lx.fillStyle = '#fff'; lx.beginPath(); lx.arc(xp - (xp - x0) * ph, 150, 3, 0, 7); lx.fill();
    label(lx, '（距離用「對數尺」：每一大格都差很多倍）', 210, 192, { color: '#777', size: 10, align: 'center' });
    label(lx, `光走了 ${o[2]}`, 210, 40, { color: '#fff', size: 20, bold: true, align: 'center' });
    document.getElementById('c7lyTxt').innerHTML = `<span class="big">${o[0]}</span><br>距離約 ${o[1] >= 1 ? o[1].toLocaleString() + ' 光年' : o[2].replace('約 ', '約 ') + '的光程'}。<br>${o[3]}`;
  }
  const L = loop(drawLy);
  registerSim('t1', { start() { L.start(); }, stop() { L.stop(); } });
})();
