/* ===== 第七章 分頁 0：韋伯三張照片排序 ===== */
(() => {
  const cv = document.getElementById('c7jw'); if (!cv) return;
  const S = stage(cv, 780, 260), ctx = S.ctx;
  const ITEMS = ['木星', '車輪星系', '深空影像'];
  function draw() {
    S.fit(); ctx.fillStyle = '#05070F'; ctx.fillRect(0, 0, S.W, S.H);
    const r = rng(5);
    for (let i = 0; i < 250; i++) { ctx.fillStyle = `rgba(255,255,255,${r() * .6})`; ctx.fillRect(r() * S.W, r() * S.H, 1.2, 1.2); }
    // 木星
    const jx = 130, jy = 120;
    ctx.save(); ctx.beginPath(); ctx.arc(jx, jy, 80, 0, 7); ctx.clip();
    ['#D9B38C', '#B8865B', '#E8CFA8', '#A4714A', '#E2C49C', '#B07B52', '#D9B38C'].forEach((c, i) => { ctx.fillStyle = c; ctx.fillRect(jx - 80, jy - 80 + i * 23, 160, 24); });
    ctx.fillStyle = '#C0563A'; ctx.beginPath(); ctx.ellipse(jx + 25, jy + 28, 18, 10, 0, 0, 7); ctx.fill(); ctx.restore();
    ctx.strokeStyle = 'rgba(120,200,255,.5)'; ctx.lineWidth = 3; ctx.beginPath(); ctx.ellipse(jx, jy - 74, 26, 7, 0, 0, 7); ctx.stroke();
    // 車輪星系
    const gx = 390, gy = 120;
    const g = ctx.createRadialGradient(gx, gy, 5, gx, gy, 85); g.addColorStop(0, 'rgba(255,230,180,.95)'); g.addColorStop(.25, 'rgba(255,200,150,.25)'); g.addColorStop(.7, 'rgba(120,160,255,.1)'); g.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(gx, gy, 85, 0, 7); ctx.fill();
    ctx.strokeStyle = 'rgba(150,190,255,.85)'; ctx.lineWidth = 9; ctx.beginPath(); ctx.ellipse(gx, gy, 78, 58, .3, 0, 7); ctx.stroke();
    for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2; ctx.strokeStyle = 'rgba(255,170,120,.3)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(gx + Math.cos(a) * 12, gy + Math.sin(a) * 9); ctx.lineTo(gx + Math.cos(a) * 70, gy + Math.sin(a) * 52); ctx.stroke(); }
    // 深空影像
    const dx = 650;
    for (let i = 0; i < 90; i++) { const x = dx - 100 + r() * 200, y = 30 + r() * 180, s = 1 + r() * 5; ctx.fillStyle = ['#FFD8A8', '#FFB3B3', '#B3D1FF', '#FFFFFF'][Math.floor(r() * 4)]; ctx.globalAlpha = .5 + r() * .5; ctx.beginPath(); ctx.ellipse(x, y, s, s * (.4 + r() * .6), r() * 3, 0, 7); ctx.fill(); }
    ctx.globalAlpha = 1;
    [['木星', jx], ['車輪星系', gx], ['深空影像（數千個星系）', dx]].forEach(([t, x]) => label(ctx, t, x, 240, { align: 'center', color: '#fff', bold: true, size: 15 }));
  }
  function ranker(boxId, outId) {
    const box = document.getElementById(boxId), out = document.getElementById(outId); let pick = [];
    const render = () => { box.innerHTML = ITEMS.map(n => `<button class="chip" ${pick.includes(n) ? 'disabled style="opacity:.35"' : ''}>${n}</button>`).join(''); out.textContent = pick.join(' ＜ ');
      box.querySelectorAll('.chip').forEach(b => b.onclick = () => { pick.push(b.textContent); render(); }); };
    render(); return () => { pick = []; render(); };
  }
  const r1 = ranker('c7r1', 'c7r1o'), r2 = ranker('c7r2', 'c7r2o');
  document.getElementById('c7jwAns').onclick = () => document.getElementById('c7jwTxt').classList.add('show');
  document.getElementById('c7jwReset').onclick = () => { r1(); r2(); document.getElementById('c7jwTxt').classList.remove('show'); };
  registerSim('t0', { start: draw, resize: draw });
})();
