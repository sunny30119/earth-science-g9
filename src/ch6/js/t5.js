/* ===== 第六章 分頁 5：地震預警（P 波、S 波、警報、盲區） ===== */
(() => {
  const cv = document.getElementById('c6ew'); if (!cv) return;
  const S = stage(cv, 420, 560), ctx = S.ctx;
  const L0 = 119.9, L1 = 122.6, A0 = 21.8, A1 = 25.45, KM = 111 * Math.cos(23.5 * Math.PI / 180);
  const kmPerPx = (L1 - L0) * KM / S.W;
  const P = (lo, la) => [(lo - L0) / (L1 - L0) * S.W, (A1 - la) / (A1 - A0) * S.H];
  const inv = (x, y) => [L0 + x / S.W * (L1 - L0), A1 - y / S.H * (A1 - A0)];
  const VP = 6, VS = 3.5, DEPTH = 15;
  let epi = [121.75, 23.85], t = -1, run = false;
  const proc = bindRange('c6proc', v => v + ' 秒', () => draw());
  const dist = (lo, la) => Math.hypot((lo - epi[0]) * KM, (la - epi[1]) * 111);
  function draw() {
    S.fit(); ctx.clearRect(0, 0, S.W, S.H);
    ctx.fillStyle = '#D8ECF5'; ctx.fillRect(0, 0, S.W, S.H);
    const T = +proc.value, alerted = t >= T;
    ctx.fillStyle = alerted ? '#FFF3C4' : '#CFE3B8';
    ctx.beginPath(); TW_COAST.forEach(([lo, la], i) => { const [x, y] = P(lo, la); i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); }); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = '#6E8B5A'; ctx.lineWidth = 1.2; ctx.stroke();
    const [ex, ey] = P(...epi);
    // 盲區
    const blind = Math.sqrt(Math.max(0, (VS * T) ** 2 - DEPTH ** 2));
    ctx.setLineDash([6, 4]); ctx.strokeStyle = '#C62828'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(ex, ey, blind / kmPerPx, 0, 7); ctx.stroke(); ctx.setLineDash([]);
    ctx.fillStyle = 'rgba(198,40,40,.1)'; ctx.fill();
    label(ctx, `預警盲區（半徑約 ${Math.round(blind)} 公里）`, ex, ey - blind / kmPerPx - 10, { align: 'center', size: 12, color: '#B71C1C', bold: true, bg: 'rgba(255,255,255,.8)' });
    // 波前
    if (t >= 0) {
      const rp = Math.sqrt(Math.max(0, (VP * t) ** 2 - DEPTH ** 2)), rs = Math.sqrt(Math.max(0, (VS * t) ** 2 - DEPTH ** 2));
      ctx.strokeStyle = 'rgba(30,136,229,.9)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(ex, ey, rp / kmPerPx, 0, 7); ctx.stroke();
      ctx.strokeStyle = 'rgba(229,57,53,.95)'; ctx.lineWidth = 4; ctx.beginPath(); ctx.arc(ex, ey, rs / kmPerPx, 0, 7); ctx.stroke();
      if (rp > 5) label(ctx, 'P 波（較快、較弱）', ex + rp / kmPerPx * .7, ey - rp / kmPerPx * .7, { size: 12, color: '#0D47A1', bold: true, bg: 'rgba(255,255,255,.8)' });
      if (rs > 5) label(ctx, 'S 波（較慢、搖得兇）', ex - rs / kmPerPx * .7, ey + rs / kmPerPx * .7, { size: 12, color: '#B71C1C', bold: true, bg: 'rgba(255,255,255,.8)', align: 'right' });
    }
    // 城市
    const rows = TW_CITY.map(([n, lo, la]) => {
      const d = dist(lo, la), R = Math.hypot(d, DEPTH), tS = R / VS, lead = tS - T;
      const shaking = t >= tS, gotAlert = t >= T;
      const [x, y] = P(lo, la);
      ctx.fillStyle = shaking ? '#E53935' : gotAlert ? '#FFB300' : '#455A64'; ctx.beginPath(); ctx.arc(x, y, shaking ? 6 : 4, 0, 7); ctx.fill();
      label(ctx, n + (gotAlert && !shaking ? ' 📱' : shaking ? ' 💥' : ''), x + 7, y, { size: 12, bold: true, bg: 'rgba(255,255,255,.8)' });
      return [n, d, lead];
    }).sort((a, b) => a[1] - b[1]);
    // 震央
    ctx.fillStyle = '#E53935'; ctx.beginPath(); for (let k = 0; k < 10; k++) { const r = k % 2 ? 5 : 12, a = k / 10 * Math.PI * 2 - Math.PI / 2; ctx.lineTo(ex + Math.cos(a) * r, ey + Math.sin(a) * r); } ctx.closePath(); ctx.fill();
    if (alerted && t < T + 1.5) label(ctx, '📢 國家級警報發出！', S.W / 2, 24, { align: 'center', size: 16, bold: true, color: '#fff', bg: '#C62828' });
    document.getElementById('c6ewClock').innerHTML = `<div><b>${t < 0 ? '—' : t.toFixed(1) + ' 秒'}</b><span>地震發生後</span></div><div><b>${T} 秒</b><span>警報發出時間</span></div>`;
    document.getElementById('c6ewList').innerHTML = '<table class="simple"><tr><th>城市</th><th>離震央</th><th>預警時間</th></tr>' +
      rows.map(([n, d, lead]) => `<tr><td>${n}</td><td>${Math.round(d)} km</td><td style="color:${lead <= 0 ? '#C62828' : '#2E7D32'};font-weight:bold">${lead <= 0 ? '來不及（盲區）' : '約 ' + Math.round(lead) + ' 秒'}</td></tr>`).join('') + '</table>';
  }
  const L = loop(dt => { if (!run) return; t += dt * 4; if (t > 90) { run = false; } draw(); });   // 4 倍速
  document.getElementById('c6ewGo').onclick = () => { t = 0; run = true; };
  document.getElementById('c6ewHL').onclick = () => { epi = [121.75, 23.85]; t = -1; run = false; draw(); };
  cv.addEventListener('pointerdown', e => { const p = S.pt(e); epi = inv(p.x, p.y); t = -1; run = false; draw(); });
  registerSim('t5', { start() { draw(); L.start(); }, stop() { L.stop(); }, resize: draw });
})();
