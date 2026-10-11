/* ===== 分頁 1：地球三圈、一千格的水、浮冰融化 ===== */
(() => {
  /* ---------- 三圈連連看 ---------- */
  const cv = document.getElementById('t1sph'); if (!cv) return;
  const S = stage(cv, 520, 360), ctx = S.ctx;
  const C = { A: { n: '大氣圈', x: 260, y: 110, c: '#7FB3E0' }, W: { n: '水圈', x: 170, y: 245, c: '#3E7CC0' }, R: { n: '岩石圈', x: 350, y: 245, c: '#A1887F' } };
  const EV = [
    ['🌋 火山噴發，火山灰衝上天空', [['R', 'A']]],
    ['🌧 雲變成雨落下來', [['A', 'W']]],
    ['☀️ 海水蒸發變成雲', [['W', 'A']]],
    ['🏞 河水溶解岩石裡的鹽類', [['R', 'W']]],
    ['💨 強風把沙吹起來磨石頭', [['A', 'R']]],
    ['🧊 冰川把山谷刮成 U 形', [['W', 'R']]],
    ['🌊 海浪拍打海岸，打出海蝕洞', [['W', 'R']]],
  ];
  let ev = null;
  function draw() {
    S.fit(); ctx.clearRect(0, 0, S.W, S.H);
    Object.entries(C).forEach(([k, s]) => {
      const on = !ev || ev[1].some(p => p.includes(k));
      ctx.globalAlpha = on ? .55 : .15; ctx.fillStyle = s.c;
      ctx.beginPath(); ctx.arc(s.x, s.y, 92, 0, 7); ctx.fill();
      ctx.globalAlpha = 1;
      label(ctx, s.n, s.x + (k === 'A' ? 0 : k === 'W' ? -35 : 35), s.y + (k === 'A' ? -40 : 30), { align: 'center', bold: true, size: 18, color: on ? '#1d2b26' : '#9aa' });
    });
    if (ev) {
      ev[1].forEach(([a, b]) => {
        const p = C[a], q = C[b], dx = q.x - p.x, dy = q.y - p.y, L = Math.hypot(dx, dy);
        arrow(ctx, p.x + dx / L * 30, p.y + dy / L * 30, q.x - dx / L * 30, q.y - dy / L * 30, '#C46A28', 5, 18);
      });
      label(ctx, ev[0], 260, 345, { align: 'center', size: 16, bold: true, bg: '#FFF3DC' });
    } else label(ctx, '三圈互相影響，共同塑造我們的環境', 260, 345, { align: 'center', size: 15, color: '#667' });
  }
  const evBox = document.getElementById('t1ev');
  EV.forEach(e => {
    const b = document.createElement('button'); b.className = 'chip'; b.textContent = e[0];
    b.onclick = () => { evBox.querySelectorAll('.chip').forEach(x => x.classList.remove('on')); b.classList.add('on'); ev = e; draw(); };
    evBox.appendChild(b);
  });
  registerSim('t1', { start: draw });

  /* ---------- 一千格的水 ---------- */
  const g = document.getElementById('t1grid');
  const G = stage(g, 520, 360), gx = G.ctx;
  const COLS = 40, ROWS = 25, cell = 12, ox = 20, oy = 18;
  // 依課本：鹹水約 97%、冰川約 2%、地下水約 1%、河流湖泊遠小於 1%
  const PART = [['鹹水（海洋為主）', 970, '#1E5B94'], ['冰川（淡水）', 20, '#E8F1F8'], ['地下水（淡水）', 10, '#8FB996']];
  let view = 'all';
  function drawGrid() {
    G.fit(); gx.clearRect(0, 0, G.W, G.H);
    let i = 0;
    PART.forEach(([n, cnt, col], pi) => {
      for (let k = 0; k < cnt; k++, i++) {
        const r = Math.floor(i / COLS), c = i % COLS;
        const vis = view === 'all' || (view === 'fresh' && pi > 0) || (view === 'use' && pi === 2);
        gx.fillStyle = vis ? col : '#F1F1EE';
        gx.fillRect(ox + c * cell, oy + r * cell, cell - 1.5, cell - 1.5);
        if (vis && pi === 1) { gx.strokeStyle = '#9BB7CF'; gx.lineWidth = .6; gx.strokeRect(ox + c * cell, oy + r * cell, cell - 1.5, cell - 1.5); }
      }
    });
    // 河流湖泊：連一格都不到
    const last = { x: ox + 39 * cell + 5, y: oy + 24 * cell + 5 };
    gx.fillStyle = '#E53935'; gx.beginPath(); gx.arc(last.x, last.y, 2.2, 0, 7); gx.fill();
    if (view !== 'all') { arrow(gx, last.x - 60, last.y + 30, last.x - 4, last.y + 4, '#E53935', 2); label(gx, '河流＋湖泊：不到 1 格！', last.x - 62, last.y + 36, { align: 'right', size: 13, color: '#C62828', bold: true }); }
    const n = view === 'all' ? 1000 : view === 'fresh' ? 30 : 10;
    document.getElementById('t1read').innerHTML =
      `<div><b>${n} 格</b><span>${view === 'all' ? '全部的水' : view === 'fresh' ? '淡水（約 3%）' : '地下水＋河湖（約 1%）'}</span></div>` +
      PART.map(([nm, c, col]) => `<div><b style="color:${col === '#E8F1F8' ? '#7A9AB8' : col}">${c} 格</b><span>${nm}</span></div>`).join('');
  }
  document.querySelectorAll('#p-t1 [data-v]').forEach(b => b.onclick = () => { view = b.dataset.v; drawGrid(); });
  registerSim('t1', { start: drawGrid });

  /* ---------- 兩杯水：浮冰 vs 陸冰 ---------- */
  const ic = document.getElementById('t1ice');
  const I = stage(ic, 520, 300), ix = I.ctx;
  const melt = document.getElementById('t1melt'), salt = document.getElementById('t1salt');
  function drawIce() {
    I.fit(); ix.clearRect(0, 0, I.W, I.H);
    const f = +melt.value / 100, rho = salt.checked ? 1.025 : 1.0;
    const cupW = 180, cupH = 200, base = 260, A = cupW;           // 截面寬度（2D 示意）
    const ice0 = 3600;                                             // 冰的「質量」（面積單位）
    const water0 = 18000;                                          // 原本的水
    const iceLeft = ice0 * (1 - f);
    // 左杯：浮冰排開的水 = 剩下冰的重 / 水的密度；融出的淡水 = 融化的冰
    const levL = (water0 + iceLeft / rho + ice0 * f / 1.0) / A;
    // 右杯：石頭佔掉固定體積；冰在石頭上不排水；融水全部流進杯中
    const rock = 2600;
    const levR = (water0 + rock + ice0 * f) / A;
    const lev0 = (water0 + ice0 / rho) / A;     // 左杯起始水位
    const lev0R = (water0 + rock) / A;
    [[60, levL, lev0, 'L'], [290, levR, lev0R, 'R']].forEach(([x0, lev, l0, side]) => {
      // 水
      ix.fillStyle = salt.checked ? '#7DB7D6' : '#9FD0EE';
      ix.fillRect(x0, base - lev, cupW, lev);
      // 起始水位虛線
      ix.setLineDash([5, 4]); ix.strokeStyle = '#C62828'; ix.lineWidth = 1.5;
      ix.beginPath(); ix.moveTo(x0 - 8, base - l0); ix.lineTo(x0 + cupW + 8, base - l0); ix.stroke(); ix.setLineDash([]);
      if (side === 'L') {
        // 浮冰：水下部分 = 冰重/水密度
        const s = Math.sqrt(iceLeft / .92) * 1.0, sub = s * .92 / rho;
        if (s > 2) { ix.fillStyle = 'rgba(240,248,255,.95)'; ix.strokeStyle = '#8AB'; ix.fillRect(x0 + cupW / 2 - s / 2, base - lev - (s - sub), s, s); ix.strokeRect(x0 + cupW / 2 - s / 2, base - lev - (s - sub), s, s); }
      } else {
        // 石頭（島）與上面的冰
        ix.fillStyle = '#8D7B6A'; ix.beginPath(); ix.moveTo(x0 + 40, base); ix.lineTo(x0 + 60, base - 140); ix.lineTo(x0 + 120, base - 140); ix.lineTo(x0 + 140, base); ix.fill();
        const s = Math.sqrt(iceLeft / .92);
        if (s > 2) { ix.fillStyle = 'rgba(240,248,255,.95)'; ix.strokeStyle = '#8AB'; ix.fillRect(x0 + 90 - s / 2, base - 140 - s, s, s); ix.strokeRect(x0 + 90 - s / 2, base - 140 - s, s, s); }
        if (f > 0 && f < 1) { ix.strokeStyle = '#5BA3D6'; ix.lineWidth = 2; ix.beginPath(); ix.moveTo(x0 + 120, base - 138); ix.quadraticCurveTo(x0 + 135, base - 90, x0 + 150, base - lev); ix.stroke(); }
      }
      // 杯子
      ix.strokeStyle = '#555'; ix.lineWidth = 3; ix.beginPath(); ix.moveTo(x0, base - cupH); ix.lineTo(x0, base); ix.lineTo(x0 + cupW, base); ix.lineTo(x0 + cupW, base - cupH); ix.stroke();
      label(ix, side === 'L' ? '冰浮在水上（海冰）' : '冰在陸地上（冰層）', x0 + cupW / 2, 28, { align: 'center', bold: true, size: 15 });
      const d = lev - l0;
      label(ix, `水面上升：${d.toFixed(1)} 公釐`, x0 + cupW / 2, 284, { align: 'center', size: 14, color: d < .05 ? '#2E7D32' : '#C62828', bold: true });
    });
    label(ix, '紅色虛線 = 一開始的水面', 260, 52, { align: 'center', size: 12, color: '#C62828' });
    document.getElementById('t1iceR').innerHTML = `<div><b>${Math.round(f * 100)}%</b><span>冰已融化</span></div><div><b>${salt.checked ? '海水' : '淡水'}</b><span>杯中的水</span></div>`;
  }
  bindRange('t1melt', v => v + '%', drawIce);
  salt.onchange = drawIce;
  registerSim('t1', { start: drawIce });
})();
