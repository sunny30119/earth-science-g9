/* ===== 第七章 分頁 5：日食／月食模擬器（本影、半影）、12 次新月與 5° 夾角 ===== */
(() => {
  const cv = document.getElementById('c7ecl'); if (!cv) return;
  const S = stage(cv, 780, 300), ctx = S.ctx;
  const SEE = stage(document.getElementById('c7eSee'), 180, 180), sx = SEE.ctx;
  let mode = 'solar';
  const dist = bindRange('c7eDist', v => v < 35 ? '遠（遠地點）' : v < 70 ? '中等' : '近（近地點）', () => draw());
  const obs = bindRange('c7eObs', v => v === 0 ? '正中央' : v > 0 ? '偏南' : '偏北', () => draw());
  const my = bindRange('c7eMoonY', v => v === 0 ? '正對影子中央' : Math.abs(v) < 40 ? '稍微偏離' : '偏離很多', () => draw());
  const CY = 150;
  // 兩圓的外公切線交點（本影尖端）與內公切線交點
  function tips(x1, r1, x2, r2) { return { ext: x2 + r2 * (x2 - x1) / (r1 - r2), int: x1 + r1 * (x2 - x1) / (r1 + r2) }; }
  function cone(x1, r1, x2, r2, xEnd, fill, inner) {
    // 從物體 2 往右延伸的陰影：inner=false 畫本影（外公切線），true 畫半影（內公切線）
    const t = tips(x1, r1, x2, r2);
    ctx.fillStyle = fill; ctx.beginPath();
    if (!inner) {
      const k = (xEnd - t.ext) / (x2 - t.ext);
      ctx.moveTo(x2, CY - r2); ctx.lineTo(xEnd, CY - r2 * k); ctx.lineTo(xEnd, CY + r2 * k); ctx.lineTo(x2, CY + r2);
    } else {
      const k = (xEnd - t.int) / (x2 - t.int);
      ctx.moveTo(x2, CY - r2); ctx.lineTo(xEnd, CY - r2 * k); ctx.lineTo(xEnd, CY + r2 * k); ctx.lineTo(x2, CY + r2);
    }
    ctx.closePath(); ctx.fill(); return t;
  }
  function draw() {
    S.fit(); ctx.fillStyle = '#05070F'; ctx.fillRect(0, 0, S.W, S.H);
    const sunX = 70, sunR = 60;
    const g = ctx.createRadialGradient(sunX, CY, 10, sunX, CY, sunR + 20); g.addColorStop(0, '#FFF59D'); g.addColorStop(.75, '#FFB300'); g.addColorStop(1, 'rgba(255,152,0,0)');
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(sunX, CY, sunR + 20, 0, 7); ctx.fill(); label(ctx, '太陽', sunX, CY + 95, { color: '#FFD54F', size: 13, align: 'center' });
    let txt = '', see = {};
    if (mode === 'solar') {
      const eX = 690, eR = 55, mR = 9, mX = lerp(470, 560, +dist.value / 100);
      const t = tips(sunX, sunR, mX, mR);
      // 半影（淡）＋本影（深）
      cone(sunX, sunR, mX, mR, 780, 'rgba(120,120,160,.25)', true);
      const umbraEnd = Math.min(t.ext, 780);
      ctx.fillStyle = 'rgba(0,0,0,.9)'; ctx.beginPath(); ctx.moveTo(mX, CY - mR); ctx.lineTo(umbraEnd, CY - mR * (t.ext - umbraEnd) / (t.ext - mX)); ctx.lineTo(umbraEnd, CY + mR * (t.ext - umbraEnd) / (t.ext - mX)); ctx.lineTo(mX, CY + mR); ctx.fill();
      ctx.strokeStyle = 'rgba(255,255,255,.35)'; ctx.setLineDash([4, 4]); ctx.beginPath(); ctx.moveTo(mX, CY - mR); ctx.lineTo(t.ext, CY); ctx.lineTo(mX, CY + mR); ctx.stroke();
      if (t.ext < eX - eR) { ctx.beginPath(); ctx.moveTo(t.ext, CY); ctx.lineTo(eX, CY - mR * (eX - t.ext) / (t.ext - mX)); ctx.moveTo(t.ext, CY); ctx.lineTo(eX, CY + mR * (eX - t.ext) / (t.ext - mX)); ctx.stroke(); }
      ctx.setLineDash([]);
      // 地球
      ctx.fillStyle = '#4A90E2'; ctx.beginPath(); ctx.arc(eX, CY, eR, Math.PI / 2, Math.PI * 1.5); ctx.fill(); ctx.fillStyle = '#1B2A4A'; ctx.beginPath(); ctx.arc(eX, CY, eR, -Math.PI / 2, Math.PI / 2); ctx.fill();
      ctx.fillStyle = '#9E9E9E'; ctx.beginPath(); ctx.arc(mX, CY, mR, 0, 7); ctx.fill(); label(ctx, '月球', mX, CY - 22, { color: '#ddd', size: 12, align: 'center' });
      label(ctx, '地球', eX + 10, CY + eR + 18, { color: '#fff', size: 12, align: 'center' });
      // 觀察者
      const oy = CY + (+obs.value / 100) * eR * .95, ox = eX - Math.sqrt(Math.max(0, eR * eR - (oy - CY) ** 2));
      ctx.fillStyle = '#FF7043'; ctx.beginPath(); ctx.arc(ox, oy, 5, 0, 7); ctx.fill();
      // 判斷觀察者在哪個影子裡
      const halfU = Math.abs(mR * (t.ext - ox) / (t.ext - mX));             // 本影（或偽本影）半徑
      const tp = tips(sunX, sunR, mX, mR).int, halfP = Math.abs(mR * (ox - tp) / (mX - tp));
      const dy = Math.abs(oy - CY);
      const moonApp = (mR / (ox - mX)) / (sunR / (ox - sunX));   // 月球和太陽的「看起來大小」比：>1 遮得住、<1 遮不住
      if (dy < halfU) { if (t.ext >= ox) { txt = '<b>日全食</b>：你在月球的<b>本影</b>裡，太陽被完全遮住，白天突然變暗，看得到日冕。'; see = { cover: 1, app: moonApp, off: 0 }; } else { txt = '<b>日環食</b>：月球離地球太遠，看起來比太陽小，本影碰不到地球。太陽中間被遮住，外圈留下一個金色的「火環」。'; see = { cover: 1, app: moonApp, off: 0 }; } }
      else if (dy < halfP) { txt = '<b>日偏食</b>：你在<b>半影</b>裡，太陽只被遮住一部分。'; see = { cover: 1, app: moonApp, off: (dy - halfU) / (halfP - halfU) * 1.6 + .2 }; }
      else { txt = '沒有日食：你不在月球的影子裡。'; see = { cover: 0 }; }
      drawSeeSun(see);
    } else {
      const eX = 380, eR = 45, mR = 14, xEnd = 780;
      const t = tips(sunX, sunR, eX, eR);
      cone(sunX, sunR, eX, eR, xEnd, 'rgba(120,120,160,.22)', true);
      cone(sunX, sunR, eX, eR, xEnd, 'rgba(0,0,0,.85)', false);
      ctx.fillStyle = '#4A90E2'; ctx.beginPath(); ctx.arc(eX, CY, eR, Math.PI / 2, Math.PI * 1.5); ctx.fill(); ctx.fillStyle = '#1B2A4A'; ctx.beginPath(); ctx.arc(eX, CY, eR, -Math.PI / 2, Math.PI / 2); ctx.fill();
      label(ctx, '地球', eX, CY + eR + 18, { color: '#fff', size: 12, align: 'center' });
      const mX = 640, mY = CY + (+my.value / 100) * 90;
      const halfU = eR * (t.ext - mX) / (t.ext - eX), halfP = eR * (mX - t.int) / (eX - t.int), d = Math.abs(mY - CY);
      let col = '#F5E9B8', st;
      if (d + mR <= halfU) { col = '#A0442A'; st = '<b>月全食</b>：月球完全進入地球的本影。月亮沒有消失，而是變成<b>紅銅色</b>——有一點陽光經過地球大氣層折射、散射後照到月球，剩下的主要是紅光。'; }
      else if (d - mR < halfU) { col = '#C9B98F'; st = '<b>月偏食</b>：月球有一部分進入本影，看起來像被咬了一口。'; }
      else if (d - mR < halfP) { col = '#E3D7AD'; st = '<b>半影月食</b>：月球只在半影裡，變暗一點點，肉眼不太容易察覺。'; }
      else st = '沒有月食：月球不在地球的影子裡，是一個普通的滿月。';
      ctx.fillStyle = col; ctx.beginPath(); ctx.arc(mX, mY, mR, 0, 7); ctx.fill();
      if (d - mR < halfU && d + mR > halfU) { ctx.save(); ctx.beginPath(); ctx.arc(mX, mY, mR, 0, 7); ctx.clip(); ctx.fillStyle = 'rgba(120,40,20,.85)'; ctx.fillRect(mX - mR, CY - halfU, 2 * mR, 2 * halfU); ctx.restore(); }
      label(ctx, '月球', mX, mY - 24, { color: '#ddd', size: 12, align: 'center' });
      label(ctx, '本影', 560, CY, { color: '#888', size: 12 }); label(ctx, '半影', 700, CY - 80, { color: '#99a', size: 12 });
      txt = st + '<br><span class="note">同一次月食，地球上所有在「夜晚」那一半的人，看到的月食情形幾乎一樣（課本 p.208）。</span>';
      drawSeeMoon(col, d, mR, halfU);
    }
    document.getElementById('c7eTxt').innerHTML = txt;
  }
  function drawSeeSun({ cover, app, off }) {
    SEE.fit(); sx.fillStyle = '#0B1530'; sx.fillRect(0, 0, 180, 180);
    const R = 50, total = cover && off === 0 && app >= 1;
    if (total) { const g = sx.createRadialGradient(90, 90, R, 90, 90, R * 1.9); g.addColorStop(0, 'rgba(255,255,255,.75)'); g.addColorStop(1, 'rgba(255,255,255,0)'); sx.fillStyle = g; sx.beginPath(); sx.arc(90, 90, R * 1.9, 0, 7); sx.fill(); }
    sx.fillStyle = '#FFC107'; sx.beginPath(); sx.arc(90, 90, R, 0, 7); sx.fill();
    if (cover) { sx.fillStyle = '#111'; sx.beginPath(); sx.arc(90 + (off || 0) * R, 90 - (off || 0) * R * .3, R * app, 0, 7); sx.fill(); }
    label(sx, '你看到的太陽', 90, 170, { color: '#aaa', size: 11, align: 'center' });
  }
  function drawSeeMoon(col, d, mR, halfU) {
    SEE.fit(); sx.fillStyle = '#0B1530'; sx.fillRect(0, 0, 180, 180);
    sx.fillStyle = col; sx.beginPath(); sx.arc(90, 90, 50, 0, 7); sx.fill();
    label(sx, '你看到的月亮', 90, 170, { color: '#aaa', size: 11, align: 'center' });
  }
  document.querySelectorAll('#c7eMode .chip').forEach(b => b.onclick = () => {
    document.querySelectorAll('#c7eMode .chip').forEach(x => x.classList.remove('on')); b.classList.add('on'); mode = b.dataset.m;
    document.getElementById('c7eDistBox').style.display = mode === 'solar' ? '' : 'none'; document.getElementById('c7eObsBox').style.display = mode === 'solar' ? '' : 'none';
    document.getElementById('c7eMoonBox').style.display = mode === 'lunar' ? '' : 'none'; draw();
  });
  registerSim('t5', { start: draw, resize: draw });

  /* ---------- 12 次新月 ---------- */
  const NC = stage(document.getElementById('c7nodes'), 780, 220), nx = NC.ctx;
  const inc = bindRange('c7inc', v => v + '°' + (v === 5 ? '（真實值）' : ''), () => drawNodes());
  function drawNodes() {
    NC.fit(); nx.fillStyle = '#05070F'; nx.fillRect(0, 0, NC.W, NC.H);
    const i = +inc.value, w = 780 / 12; let n = 0;
    for (let k = 0; k < 12; k++) {
      const x0 = k * w, cx = x0 + w / 2, beta = i * Math.sin(2 * Math.PI * (k + .3) / 12);   // 新月時月球在黃道面上下的角度
      const ecl = Math.abs(beta) < .9;
      if (ecl) { n++; nx.fillStyle = 'rgba(229,57,53,.25)'; nx.fillRect(x0 + 2, 10, w - 4, 180); }
      nx.strokeStyle = '#FFD54F'; nx.beginPath(); nx.moveTo(x0 + 6, 100); nx.lineTo(x0 + w - 6, 100); nx.stroke();
      nx.fillStyle = '#FFB300'; nx.beginPath(); nx.arc(x0 + 12, 100, 6, 0, 7); nx.fill();
      nx.fillStyle = '#4A90E2'; nx.beginPath(); nx.arc(x0 + w - 12, 100, 6, 0, 7); nx.fill();
      const myy = 100 - beta * 13; nx.fillStyle = '#ddd'; nx.beginPath(); nx.arc(cx + 6, myy, 4, 0, 7); nx.fill();
      label(nx, `${k + 1}月`, cx, 206, { color: '#aaa', size: 11, align: 'center' });
      if (ecl) label(nx, '日食！', cx, 24, { color: '#FF8A80', size: 12, bold: true, align: 'center' });
    }
    label(nx, `一年中可能發生日食的新月：${n} 次`, 10, 196 - 182, { color: '#fff', size: 12, bold: true });
  }
  registerSim('t5', { start: drawNodes, resize: drawNodes });
})();
