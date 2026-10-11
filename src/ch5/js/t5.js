/* ===== 分頁 5：女王頭、海蝕地形演化、風的磨蝕與沙丘、冰川 ===== */
(() => {
  /* ---------- ① 女王頭（差異侵蝕） ---------- */
  const qc = document.getElementById('t5q'); if (!qc) return;
  const Q = stage(qc, 600, 340), qx = Q.ctx;
  const DATA = [[1994, 220], [2023.75, 118.3], [2024.8, 116.59]];
  const yr = bindRange('t5yr', v => v + ' 年' + (v > 2024 ? '（假設）' : ''), () => drawQ());
  const hard = bindRange('t5hard', v => v < 15 ? '幾乎一樣硬' : v < 70 ? '頭比脖子硬' : '頭硬很多', () => drawQ());
  const neckC = y => {
    const r0 = (220 - 116.59) / (2024.8 - 1994);      // 實測的平均速率
    if (y <= 2024.8) return 220 - r0 * (y - 1994);     // 過去：照實測，不受滑桿影響
    const k = +hard.value / 60;                       // 未來（假設）：硬度差愈大，脖子變細得愈快
    return Math.max(15, 116.59 - r0 * k * (y - 2024.8));
  };
  function drawQ() {
    Q.fit(); qx.clearRect(0, 0, Q.W, Q.H);
    const y = +yr.value, C = neckC(y), dPx = C / Math.PI * 1.4;   // 直徑 → 像素
    // 海與平台
    qx.fillStyle = '#7FB6D9'; qx.fillRect(0, 270, Q.W, 70);
    qx.fillStyle = '#C9B48F'; qx.fillRect(0, 280, 330, 60);
    // 底座
    qx.fillStyle = '#C2A57A'; qx.beginPath(); qx.ellipse(170, 285, 80, 18, 0, 0, 7); qx.fill();
    // 脖子（較軟的砂岩）
    const top = 150, bot = 278;
    qx.fillStyle = '#D9BD8C';
    qx.beginPath(); qx.moveTo(170 - dPx / 2 - 12, bot); qx.quadraticCurveTo(170 - dPx / 2, (top + bot) / 2, 170 - dPx / 2 - 6, top);
    qx.lineTo(170 + dPx / 2 + 6, top); qx.quadraticCurveTo(170 + dPx / 2, (top + bot) / 2, 170 + dPx / 2 + 12, bot); qx.fill();
    qx.strokeStyle = 'rgba(120,90,50,.35)'; for (let h = top + 10; h < bot; h += 14) { qx.beginPath(); qx.moveTo(170 - dPx / 2, h); qx.lineTo(170 + dPx / 2, h); qx.stroke(); }
    // 頭（較硬的鈣質砂岩）
    qx.fillStyle = '#A88458';
    qx.beginPath(); qx.ellipse(160, 112, 92, 46, -.12, 0, 7); qx.fill();
    qx.fillStyle = '#B9966A'; qx.beginPath(); qx.ellipse(210, 80, 34, 26, .3, 0, 7); qx.fill();   // 髮髻
    qx.strokeStyle = 'rgba(80,55,30,.35)'; for (let i = 0; i < 4; i++) { qx.beginPath(); qx.ellipse(160, 112, 92 - i * 18, 46 - i * 9, -.12, 3.4, 6); qx.stroke(); }
    label(qx, '頭：較硬（鈣質砂岩）', 160, 30, { align: 'center', size: 13, bold: true, bg: 'rgba(255,255,255,.8)' });
    label(qx, '脖子：較軟，被侵蝕得快', 170, 306, { align: 'center', size: 13, bold: true, color: '#BF360C', bg: 'rgba(255,255,255,.8)' });
    if (C < 60) label(qx, '⚠ 假設情境：脖子愈細，愈難撐住頭的重量', 170, 328, { align: 'center', size: 12, color: '#B71C1C', bold: true, bg: 'rgba(255,255,255,.85)' });
    // 小圖表：頸圍 vs 年份
    const gx = 350, gy = 40, gw = 230, gh = 200;
    qx.fillStyle = '#fff'; rrect(qx, gx - 10, gy - 20, gw + 30, gh + 60, 8); qx.fill();
    const X = t => gx + 20 + (t - 1990) / 50 * (gw - 20), Y = c => gy + gh - c / 240 * gh;
    qx.strokeStyle = '#999'; qx.lineWidth = 1; qx.beginPath(); qx.moveTo(gx + 20, gy); qx.lineTo(gx + 20, gy + gh); qx.lineTo(gx + gw, gy + gh); qx.stroke();
    [0, 100, 200].forEach(c => label(qx, c + '', gx + 14, Y(c), { size: 10, align: 'right', color: '#777' }));
    [1990, 2010, 2030].forEach(t => label(qx, t + '', X(t), gy + gh + 10, { size: 10, align: 'center', color: '#777' }));
    label(qx, '頸圍（公分）', gx + 20, gy - 8, { size: 11, color: '#555' });
    qx.strokeStyle = '#C46A28'; qx.lineWidth = 2;
    qx.beginPath(); for (let t = 1994; t <= 2024.8; t += .5) { t === 1994 ? qx.moveTo(X(t), Y(neckC(t))) : qx.lineTo(X(t), Y(neckC(t))); } qx.stroke();
    qx.setLineDash([4, 4]); qx.beginPath(); qx.moveTo(X(2024.8), Y(neckC(2024.8))); qx.lineTo(X(2040), Y(neckC(2040))); qx.stroke(); qx.setLineDash([]);
    DATA.forEach(([t, c]) => { qx.fillStyle = '#1F6FB2'; qx.beginPath(); qx.arc(X(t), Y(c), 4.5, 0, 7); qx.fill(); });
    qx.fillStyle = '#E53935'; qx.beginPath(); qx.arc(X(y), Y(C), 6, 0, 7); qx.fill();
    document.getElementById('t5qR').innerHTML = `<div><b>${C.toFixed(0)} cm</b><span>${y} 年的頸圍${y > 2024 ? '（假設）' : '（模型）'}</span></div><div><b>${(220 - C).toFixed(0)} cm</b><span>比 1994 年少了</span></div>`;
  }
  registerSim('t5', { start: drawQ, resize: drawQ });
  voteList(document.getElementById('t5poll'), ['無為而治，順應自然', '補強（灌藥劑、加支撐）', '與外界隔離（禁止靠近觸摸）', '其他想法']);

  /* ---------- ② 海蝕地形的一生 ---------- */
  const sc = document.getElementById('t5sea');
  const SE = stage(sc, 520, 320), sx = SE.ctx;
  const stR = bindRange('t5st', v => v < 10 ? '一開始' : v < 40 ? '幾千年後' : v < 68 ? '更久以後' : v < 88 ? '又過了很久' : '非常久以後', () => drawSea());
  const TXT = [[10, '<b>岬角</b>：海浪從兩側拍打，專挑岩石的裂縫（節理）和比較軟的地方下手。'],
    [40, '<b>海蝕洞</b>：裂縫被海浪和被擠壓的空氣一次次撐大，變成洞穴。'],
    [68, '<b>海蝕拱門</b>：洞被打穿，變成一座「石橋」。例：深澳象鼻岩、英國杜朵門。'],
    [88, '<b>海蝕柱</b>：拱門頂部撐不住而崩塌，留下孤立的石柱。例：英國老哈利岩。'],
    [101, '<b>殘根</b>：海蝕柱也被打倒，只剩下矮矮的底部；海浪削出的平坦岩面就是<b>海蝕平臺</b>。']];
  let waveT = 0, seaPlay = false;
  function drawSea() {
    SE.fit(); sx.clearRect(0, 0, SE.W, SE.H);
    const t = +stR.value, SL = 230;
    const sky = sx.createLinearGradient(0, 0, 0, SL); sky.addColorStop(0, '#B9DCF2'); sky.addColorStop(1, '#E6F3FB');
    sx.fillStyle = sky; sx.fillRect(0, 0, SE.W, SL);
    const rock = '#9C8466', rockD = '#7D6950';
    // 海蝕平臺（隨時間出現）
    sx.fillStyle = '#8E7A5F'; sx.fillRect(110, SL - 4, 300 * clamp(t / 60, .1, 1), 10);
    // 左邊陸地（懸崖），隨時間後退
    const back = t * .5;
    sx.fillStyle = rock; sx.beginPath(); sx.moveTo(0, 70); sx.lineTo(150 - back, 70); sx.lineTo(150 - back, SL - 18); sx.lineTo(140 - back, SL - 8); sx.lineTo(150 - back, SL + 40); sx.lineTo(0, SL + 40); sx.fill();
    label(sx, '海蝕崖', 60, 120, { size: 13, color: '#fff', bold: true });
    // 海蝕凹壁
    sx.fillStyle = rockD; sx.beginPath(); sx.ellipse(150 - back, SL - 12, 10, 12, 0, Math.PI / 2, Math.PI * 1.5); sx.fill();
    // 岬角（正面看）
    const cx = 290, half = 95;
    const holeW = t < 10 ? 0 : clamp((t - 10) / 30, 0, 1) * 34 + clamp((t - 40) / 28, 0, 1) * 16;
    const holeTop = SL - (t < 10 ? 0 : clamp((t - 10) / 30, 0, 1) * 70 + clamp((t - 40) / 28, 0, 1) * 55);
    if (t < 68) {
      sx.fillStyle = rock; sx.fillRect(cx - half, 75, half * 2, SL - 75 + 40);
      sx.strokeStyle = 'rgba(60,40,20,.35)'; sx.beginPath(); sx.moveTo(cx, 75); sx.lineTo(cx + 4, SL); sx.stroke();   // 節理
      if (holeW > 0) {
        if (t < 40) { sx.fillStyle = '#2E3B44'; } else { const g = sx.createLinearGradient(0, holeTop, 0, SL); g.addColorStop(0, '#D6ECF8'); g.addColorStop(1, '#BFE0F3'); sx.fillStyle = g; }
        sx.beginPath(); sx.moveTo(cx - holeW, SL + 2); sx.lineTo(cx - holeW, holeTop + holeW * .8); sx.quadraticCurveTo(cx, holeTop - holeW * .3, cx + holeW, holeTop + holeW * .8); sx.lineTo(cx + holeW, SL + 2); sx.fill();
      }
    } else {
      // 拱門崩塌後：左邊連著陸地的岬角殘餘＋右邊的海蝕柱
      const stackTop = t < 88 ? 75 + (t - 68) * 1.5 : 160 + (t - 88) * 4;
      sx.fillStyle = rock; sx.fillRect(cx - half, 75 + (t - 68) * .6, half - 50, SL - 75 + 40);
      sx.fillRect(cx + 50 - (t - 68) * .3, stackTop, half - 50 + (t - 68) * .3, SL - stackTop + 40);
      sx.fillStyle = rockD;   // 崩落的碎石
      [[cx - 10, 8], [cx + 12, 6], [cx + 30, 9], [cx - 30, 5]].forEach(([x, r]) => { sx.beginPath(); sx.arc(x, SL + 2, r, 0, 7); sx.fill(); });
    }
    // 海
    waveT += .03;
    sx.fillStyle = 'rgba(52,120,180,.88)'; sx.fillRect(0, SL, SE.W, SE.H - SL);
    sx.strokeStyle = 'rgba(255,255,255,.75)'; sx.lineWidth = 2;
    for (let k = 0; k < 3; k++) { sx.beginPath(); for (let x = 0; x <= SE.W; x += 8) { const y = SL + 4 + k * 14 + Math.sin(x / 26 + waveT * 3 + k) * 3; x ? sx.lineTo(x, y) : sx.moveTo(x, y); } sx.stroke(); }
    // 說明文字
    document.getElementById('t5seaTxt').innerHTML = TXT.find(([lim]) => t < lim)[1];
  }
  const seaBtn = document.getElementById('t5seaPlay');
  seaBtn.onclick = () => { seaPlay = !seaPlay; seaBtn.textContent = seaPlay ? '⏸ 暫停' : '▶ 自動播放'; if (seaPlay && +stR.value >= 100) stR.value = 0; };
  const SL_ = loop(dt => { if (seaPlay) { stR.value = Math.min(100, +stR.value + dt * 6); stR.dispatchEvent(new Event('input')); if (+stR.value >= 100) seaBtn.click(); } drawSea(); });
  registerSim('t5', { start() { SL_.start(); }, stop() { SL_.stop(); } });

  /* ---------- ③ 風：磨蝕與沙丘 ---------- */
  const wc = document.getElementById('t5wind');
  const W = stage(wc, 520, 280), wx = W.ctx;
  const ws = bindRange('t5ws', v => v < 15 ? '微風（吹不動沙）' : v < 50 ? '中等' : v < 80 ? '強風' : '狂風');
  const fence = document.getElementById('t5fence');
  const GR = 250, RX0 = 120, RX1 = 190, RH = 120, BIN = 4, NB = RH / BIN;
  let ero = new Array(NB).fill(0), dune = new Array(130).fill(0), grains = [], wspawn = 0;
  function windStep(dt) {
    const v = +ws.value;
    if (v >= 15) { wspawn += dt * v * .5; while (wspawn > 1 && grains.length < 220) { wspawn--; grains.push({ x: Math.random() * 20, y: GR, vx: v * 3 * (.8 + Math.random() * .4), vy: -(60 + v * 1.1) * (.6 + Math.random() * .6) }); } }
    for (let i = grains.length - 1; i >= 0; i--) {
      const g = grains[i];
      const shelter = fence.checked && g.x > 400 ? .2 : 1;
      g.vy += 420 * dt; g.x += g.vx * shelter * dt; g.y += g.vy * dt;
      // 撞到石頭
      const hb = Math.floor((GR - g.y) / BIN);
      if (hb >= 0 && hb < NB && g.x >= RX0 + ero[hb] && g.x <= RX1 && g.y <= GR) {
        ero[hb] = Math.min(ero[hb] + .22 * v / 60, (RX1 - RX0) * .6); grains.splice(i, 1); continue;
      }
      if (g.y >= GR) {
        g.y = GR;
        if (fence.checked && g.x > 420 && g.x < 520) { const k = Math.floor((g.x - 390) / 1); dune[clamp(k, 0, 129)] += 1; grains.splice(i, 1); continue; }
        if (v < 15) { grains.splice(i, 1); continue; }
        g.vy = -(60 + v * 1.1) * (.5 + Math.random() * .6);
      }
      if (g.x > W.W + 5) grains.splice(i, 1);
    }
    drawWind();
  }
  function drawWind() {
    W.fit(); wx.clearRect(0, 0, W.W, W.H);
    wx.fillStyle = '#FFF6E5'; wx.fillRect(0, 0, W.W, W.H);
    wx.fillStyle = '#E8C98E'; wx.fillRect(0, GR, W.W, W.H - GR);
    // 石頭（迎風面被磨掉）
    wx.fillStyle = '#8D7B6A'; wx.beginPath(); wx.moveTo(RX1, GR);
    for (let b = 0; b < NB; b++) wx.lineTo(RX1 - ero[b] * .15, GR - b * BIN);
    wx.lineTo(RX1 - 4, GR - RH - 8); wx.lineTo(RX0 + 6, GR - RH - 10);
    for (let b = NB - 1; b >= 0; b--) wx.lineTo(RX0 + ero[b], GR - b * BIN);
    wx.closePath(); wx.fill();
    const maxE = Math.max(...ero);
    if (maxE > 10) label(wx, '下半部被磨得最多 → 蕈狀', RX1 + 10, GR - 20, { size: 12, color: '#5D4037', bold: true, bg: 'rgba(255,255,255,.8)' });
    // 沙丘
    wx.fillStyle = '#E2B867'; wx.beginPath(); wx.moveTo(390, GR);
    // 平滑一點
    for (let k = 0; k < 130; k++) { const s = (dune[k - 2] || 0) + (dune[k - 1] || 0) + dune[k] + (dune[k + 1] || 0) + (dune[k + 2] || 0); wx.lineTo(390 + k, GR - Math.min(110, s / 5 * .35)); }
    wx.lineTo(520, GR); wx.fill();
    // 防風林
    if (fence.checked) { for (let k = 0; k < 3; k++) { const x = 400 + k * 8; wx.fillStyle = '#6D4C41'; wx.fillRect(x, GR - 30, 3, 30); wx.fillStyle = '#43A047'; wx.beginPath(); wx.arc(x + 1.5, GR - 36, 9, 0, 7); wx.fill(); } }
    if (dune.some(d => d > 20)) label(wx, '沙丘', 470, GR - 60, { size: 13, bold: true, color: '#8D6E00' });
    // 沙粒
    wx.fillStyle = '#B07A2A'; grains.forEach(g => wx.fillRect(g.x, g.y - 2, 2.4, 2.4));
    // 風
    const v = +ws.value;
    for (let k = 0; k < 4; k++) { const y = 40 + k * 32; const off = (performance.now() / 1000 * v * 3 + k * 70) % 520; arrow(wx, off - 40, y, off, y, `rgba(100,140,180,${.2 + v / 200})`, 2, 8); }
    label(wx, `風 → （沙粒最高只跳到約 ${Math.round((60 + v * 1.1) ** 2 * 1.44 / 840)} 像素高）`, 10, 18, { size: 12, color: '#456' });
  }
  document.getElementById('t5windReset').onclick = () => { ero.fill(0); dune.fill(0); grains = []; };
  const WL = loop(windStep);
  registerSim('t5', { start() { WL.start(); }, stop() { WL.stop(); } });

  /* ---------- ④ 冰川 ---------- */
  const icv = document.getElementById('t5ice');
  const I = stage(icv, 560, 300), ix = I.ctx;
  const age = bindRange('t5age', v => v < 5 ? '剛開始' : v < 50 ? '幾萬年' : '十幾萬年');
  const tmp = bindRange('t5tmp', v => v < 30 ? '很冷（冰期）' : v < 80 ? '回暖中' : '溫暖（冰都融了）');
  let debris = [], moraine = [], dsp = 0;
  const groundY = x => 120 + (x - 290) / 270 * 130;
  function iceStep(dt) {
    const T = +tmp.value, snout = 560 - T * 2.2;
    dsp += dt * 1.6;
    if (dsp > 1 && T < 80) { dsp--; debris.push({ x: 300, d: 2 + Math.random() ** 2 * 10, o: Math.random() }); }
    for (let i = debris.length - 1; i >= 0; i--) {
      const p = debris[i]; p.x += dt * 14;
      if (p.x >= snout) { moraine.push({ x: snout + (Math.random() - .5) * 10, d: p.d }); debris.splice(i, 1); }
    }
    if (moraine.length > 260) moraine.shift();
    drawIce(snout);
  }
  function drawIce(snout) {
    I.fit(); ix.clearRect(0, 0, I.W, I.H);
    ix.fillStyle = '#EEF5FB'; ix.fillRect(0, 0, I.W, I.H);
    // 左：山谷橫切面
    const a = +age.value / 100, T = +tmp.value;
    const prof = x => { const u = (x - 135) / 115; const V = 60 + 190 * (1 - Math.abs(u)); const U = 60 + 190 * Math.sqrt(Math.max(0, 1 - u ** 4)); return lerp(V, U, a); };
    ix.fillStyle = '#9E8B74'; ix.beginPath(); ix.moveTo(0, 60); ix.lineTo(20, 60);
    for (let x = 20; x <= 250; x += 3) ix.lineTo(x, prof(x));
    ix.lineTo(270, 60); ix.lineTo(270, I.H); ix.lineTo(0, I.H); ix.fill();
    if (T < 70) {           // 冰填在谷中
      const lv = 70 + T * 1.6;
      ix.save(); ix.beginPath(); ix.moveTo(20, 60); for (let x = 20; x <= 250; x += 3) ix.lineTo(x, prof(x)); ix.lineTo(250, 60); ix.closePath(); ix.clip();
      ix.fillStyle = 'rgba(200,228,250,.9)'; ix.fillRect(0, lv, 270, I.H); ix.restore();
    }
    label(ix, a < .3 ? '河流切出的 V 形谷' : a < .8 ? '被冰刨寬中…' : 'U 形谷', 135, 30, { align: 'center', bold: true, size: 14 });
    ix.strokeStyle = '#ccd'; ix.beginPath(); ix.moveTo(280, 10); ix.lineTo(280, 290); ix.stroke();
    // 右：冰舌與冰磧石
    ix.fillStyle = '#9E8B74'; ix.beginPath(); ix.moveTo(290, groundY(290)); ix.lineTo(560, groundY(560)); ix.lineTo(560, I.H); ix.lineTo(290, I.H); ix.fill();
    if (T < 80) {
      ix.fillStyle = 'rgba(205,232,252,.95)'; ix.beginPath(); ix.moveTo(290, groundY(290) - 50);
      ix.quadraticCurveTo(snout - 20, groundY(snout) - 40, snout, groundY(snout)); ix.lineTo(290, groundY(290)); ix.fill();
      ix.strokeStyle = '#9CC3E0'; ix.stroke();
    }
    moraine.forEach(m => { ix.fillStyle = '#6D5D4B'; ix.beginPath(); ix.arc(m.x, groundY(m.x) - m.d * .7, m.d * .8, 0, 7); ix.fill(); });
    debris.forEach(p => { ix.fillStyle = '#5D4E3E'; ix.beginPath(); ix.arc(p.x, groundY(p.x) - 6 - p.o * 22, p.d * .8, 0, 7); ix.fill(); });
    if (moraine.length > 15) label(ix, '冰磧石：大小混雜', Math.min(...moraine.map(m => m.x)) - 4, groundY(snout) + 28, { size: 12, bold: true, color: '#3E2723', bg: 'rgba(255,255,255,.85)', align: 'center' });
    label(ix, '冰川前端（冰舌）', 420, 40, { align: 'center', bold: true, size: 14 });
  }
  document.getElementById('t5iceReset').onclick = () => { debris = []; moraine = []; age.value = 0; age.dispatchEvent(new Event('input')); };
  const IL = loop(iceStep);
  registerSim('t5', { start() { IL.start(); }, stop() { IL.stop(); } });
})();
