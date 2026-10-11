/* ===== 第六章 分頁 4：臺灣地震模擬器（規模 vs 震度）＋震度分級表 =====
   簡化震度公式（以 0403 花蓮地震校準）：I = 1.2·M − 2·log10(R) + 0.54，R = 震源距離（公里）。 */
(() => {
  const cv = document.getElementById('c6eq'); if (!cv) return;
  const S = stage(cv, 420, 560), ctx = S.ctx;
  const L0 = 119.9, L1 = 122.2, A0 = 21.8, A1 = 25.45, KM = 111;
  const P = (lo, la) => [(lo - L0) / (L1 - L0) * S.W, (A1 - la) / (A1 - A0) * S.H];
  const inv = (x, y) => [L0 + x / S.W * (L1 - L0), A1 - y / S.H * (A1 - A0)];
  const CLS = [['0', '#FFFFFF', '人無感覺'], ['1', '#D7F0C8', '人靜止時可感覺微小搖晃'], ['2', '#A6DD8C', '多數人可感覺搖晃，懸吊物會搖晃'], ['3', '#F6E96B', '所有人都感覺搖晃，門窗發出聲音'],
    ['4', '#F4B740', '有些人會尋求躲避，房屋搖動甚烈，少數未固定物品可能傾倒'], ['5弱', '#EF8A2E', '多數人驚嚇恐慌，未固定的物品掉落'], ['5強', '#E1622A', '人難以走動，部分門窗變形、牆壁產生裂痕'],
    ['6弱', '#C9402A', '人站立困難，傢俱移動或翻倒，門窗扭曲變形'], ['6強', '#A3262A', '耐震能力較強的房屋也可能受損，大範圍停電或通訊中斷'], ['7', '#6E1323', '山崩地裂，鐵軌彎曲']];
  const cls = I => I < .5 ? 0 : I < 1.5 ? 1 : I < 2.5 ? 2 : I < 3.5 ? 3 : I < 4.5 ? 4 : I < 5 ? 5 : I < 5.5 ? 6 : I < 6 ? 7 : I < 6.5 ? 8 : 9;
  let epi = [121.62, 23.84];
  const mag = bindRange('c6M', v => (v / 10).toFixed(1), () => draw());
  const dep = bindRange('c6D', v => v + ' 公里' + (v > 70 ? '（深層）' : v <= 30 ? '（淺層）' : ''), () => draw());
  const I_at = (lo, la) => { const dx = (lo - epi[0]) * KM * Math.cos(23.5 * Math.PI / 180), dy = (la - epi[1]) * KM; const R = Math.max(5, Math.hypot(dx, dy, +dep.value)); return 1.2 * (+mag.value / 10) - 2 * Math.log10(R) + .54; };
  let grid = null;
  function draw() {
    S.fit(); ctx.clearRect(0, 0, S.W, S.H);
    ctx.fillStyle = '#D8ECF5'; ctx.fillRect(0, 0, S.W, S.H);
    if (!grid) { grid = []; for (let y = 0; y < S.H; y += 5) for (let x = 0; x < S.W; x += 5) { const ll = inv(x + 2.5, y + 2.5); if (inPoly(ll, TW_COAST)) grid.push([x, y, ll]); } }
    grid.forEach(([x, y, ll]) => { ctx.fillStyle = CLS[cls(I_at(...ll))][1]; ctx.fillRect(x, y, 5.6, 5.6); });
    ctx.strokeStyle = '#555'; ctx.lineWidth = 1.2; ctx.beginPath(); TW_COAST.forEach(([lo, la], i) => { const [x, y] = P(lo, la); i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); }); ctx.closePath(); ctx.stroke();
    // 城市
    TW_CITY.forEach(([n, lo, la]) => { const [x, y] = P(lo, la); const c = cls(I_at(lo, la)); ctx.fillStyle = '#222'; ctx.beginPath(); ctx.arc(x, y, 3, 0, 7); ctx.fill(); label(ctx, `${n} ${CLS[c][0]}`, x + 6, y, { size: 12, bold: true, bg: 'rgba(255,255,255,.8)' }); });
    // 震央
    const [ex, ey] = P(...epi);
    ctx.fillStyle = '#E53935'; ctx.strokeStyle = '#fff'; ctx.lineWidth = 2; ctx.beginPath();
    for (let k = 0; k < 10; k++) { const r = k % 2 ? 6 : 14, a = k / 10 * Math.PI * 2 - Math.PI / 2; ctx.lineTo(ex + Math.cos(a) * r, ey + Math.sin(a) * r); } ctx.closePath(); ctx.fill(); ctx.stroke();
    label(ctx, '震央', ex + 18, ey + 18, { align: 'left', bold: true, size: 13, color: '#B71C1C', bg: 'rgba(255,255,255,.85)' });
    // 圖例
    CLS.forEach(([n, c], i) => { ctx.fillStyle = c; ctx.fillRect(8, 300 + i * 20, 18, 18); ctx.strokeStyle = '#999'; ctx.strokeRect(8, 300 + i * 20, 18, 18); label(ctx, n, 36, 309 + i * 20, { size: 11 }); });
    label(ctx, '震度', 8, 288, { size: 12, bold: true });
    drawSide();
    const M = +mag.value / 10, Imax = I_at(...epi);
    document.getElementById('c6eqList').innerHTML = `<div class="readout"><div><b>${M.toFixed(1)}</b><span>規模（全臺只有這一個數字）</span></div><div><b>${CLS[cls(Imax)][0]} 級</b><span>震央附近的震度</span></div>
      <div><b>${Math.pow(10, 1.5 * (M - 5)).toFixed(M >= 6 ? 0 : 1)} 倍</b><span>能量是規模 5.0 的</span></div></div>`;
  }
  // 側視圖：震源、震央、震源深度
  const sc = document.getElementById('c6side');
  const SD = stage(sc, 360, 150), sx = SD.ctx;
  function drawSide() {
    SD.fit(); sx.clearRect(0, 0, SD.W, SD.H);
    sx.fillStyle = '#E3F1FA'; sx.fillRect(0, 0, SD.W, 30); sx.fillStyle = '#C8B49A'; sx.fillRect(0, 30, SD.W, SD.H - 30);
    const d = +dep.value, y = 30 + d / 150 * 110;
    sx.setLineDash([5, 4]); sx.strokeStyle = '#333'; sx.beginPath(); sx.moveTo(180, 30); sx.lineTo(180, y); sx.stroke(); sx.setLineDash([]);
    sx.fillStyle = '#E53935'; sx.beginPath(); sx.arc(180, 30, 6, 0, 7); sx.fill(); sx.beginPath(); sx.arc(180, y, 7, 0, 7); sx.fill();
    sx.strokeStyle = 'rgba(229,57,53,.5)'; for (let r = 18; r < 70; r += 16) { sx.beginPath(); sx.arc(180, y, r, 0, 7); sx.stroke(); }
    label(sx, '震央（地表）', 190, 18, { size: 12, bold: true }); label(sx, '震源（岩層斷裂處）', 194, y, { size: 12, bold: true, color: '#fff' });
    label(sx, `震源深度 ${d} km`, 172, (30 + y) / 2, { size: 12, align: 'right', bold: true, color: '#3E2723' });
  }
  let drag = false;
  cv.addEventListener('pointerdown', e => { const p = S.pt(e), [ex, ey] = P(...epi); if (Math.hypot(p.x - ex, p.y - ey) < 26) { drag = true; cv.setPointerCapture(e.pointerId); } else { epi = inv(p.x, p.y); draw(); } });
  cv.addEventListener('pointermove', e => { if (!drag) return; const p = S.pt(e); epi = inv(clamp(p.x, 0, S.W), clamp(p.y, 0, S.H)); draw(); });
  cv.addEventListener('pointerup', () => drag = false);
  const PRE = { hl: [121.62, 23.84, 71, 22], cc: [120.82, 23.85, 73, 8], deep: [121.75, 24.55, 60, 120] };
  document.querySelectorAll('#p-t4 [data-pre]').forEach(b => b.onclick = () => { const [lo, la, m, d] = PRE[b.dataset.pre]; epi = [lo, la]; mag.value = m; dep.value = d; [mag, dep].forEach(x => x.dispatchEvent(new Event('input'))); });
  registerSim('t4', { start: draw, resize: draw });
  document.getElementById('c6scale').innerHTML = '<tr><th>震度</th><th>人的感受與影響</th></tr>' + CLS.map(([n, c, t]) => `<tr><td style="background:${c};color:${['6弱', '6強', '7', '5強'].includes(n) ? '#fff' : '#222'};font-weight:bold">${n}</td><td style="text-align:left">${t}</td></tr>`).join('');
})();
