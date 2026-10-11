/* ===== 第七章 分頁 6：潮汐模擬器、拉力差 =====
   臺灣的水位 h = cos 2(λ − λ月) + 0.46·cos 2(λ − λ日)；λ 是臺灣所在的方向（地球自轉），λ月每天前進 360°/29.5。 */
(() => {
  const cv = document.getElementById('c7tide'); if (!cv) return;
  const S = stage(cv, 380, 380), ctx = S.ctx;
  const G = stage(document.getElementById('c7tideG'), 380, 220), gx = G.ctx;
  const tday = bindRange('c7tday', v => v === 0 ? '初一（新月）' : v === 7.5 ? '初八（上弦）' : v === 15 ? '十五（滿月）' : v === 22 ? '廿三（下弦）' : `第 ${v} 天`, () => { hist = []; t = 0; draw(); });
  const sun = document.getElementById('c7sun'), moses = document.getElementById('c7moses');
  let t = 0, play = false, hist = [];   // t：小時
  const AS = () => sun.checked ? .46 : 0;
  const lamMoon = () => (+tday.value + t / 24) / 29.5 * 2 * Math.PI;   // 月球方向（相對太陽方向 0）
  const lamTW = () => Math.PI + t / 24 * 2 * Math.PI;                    // 臺灣的方向：t=0 時是半夜（背對太陽）
  const level = () => Math.cos(2 * (lamTW() - lamMoon())) + AS() * Math.cos(2 * lamTW());
  function draw() {
    S.fit(); ctx.fillStyle = '#05070F'; ctx.fillRect(0, 0, S.W, S.H);
    const C = [190, 190], R = 70;
    // 太陽方向（右）
    if (sun.checked) { for (let k = 0; k < 5; k++) arrow(ctx, 375, 110 + k * 40, 345, 110 + k * 40, 'rgba(255,213,79,.6)', 2, 7); label(ctx, '太陽 →', 370, 92, { color: '#FFD54F', size: 12, align: 'right' }); }
    // 月球
    const lm = lamMoon(), mx = C[0] + Math.cos(lm) * 160, my = C[1] - Math.sin(lm) * 160;
    ctx.fillStyle = '#ddd'; ctx.beginPath(); ctx.arc(mx, my, 12, 0, 7); ctx.fill(); label(ctx, '月球', mx, my - 20, { color: '#ddd', size: 12, align: 'center' });
    // 海水（誇張）
    ctx.fillStyle = 'rgba(64,140,230,.75)'; ctx.beginPath();
    for (let a = 0; a <= 2 * Math.PI + .01; a += .05) { const r = R + 22 + 16 * (Math.cos(2 * (a - lm)) + AS() * Math.cos(2 * a)); const x = C[0] + Math.cos(a) * r, y = C[1] - Math.sin(a) * r; a ? ctx.lineTo(x, y) : ctx.moveTo(x, y); }
    ctx.closePath(); ctx.fill();
    // 地球
    ctx.fillStyle = '#5E9E5A'; ctx.beginPath(); ctx.arc(...C, R, 0, 7); ctx.fill();
    ctx.fillStyle = 'rgba(0,0,0,.35)'; ctx.beginPath(); ctx.arc(...C, R, Math.PI / 2, Math.PI * 1.5); ctx.fill();   // 夜（左半）
    const lt = lamTW(), tx = C[0] + Math.cos(lt) * (R - 8), ty = C[1] - Math.sin(lt) * (R - 8);
    ctx.fillStyle = '#FF7043'; ctx.beginPath(); ctx.arc(tx, ty, 6, 0, 7); ctx.fill(); label(ctx, '臺灣', tx + Math.cos(lt) * 18, ty - Math.sin(lt) * 18, { color: '#fff', size: 12, bold: true, align: 'center' });
    label(ctx, '逆時鐘自轉', C[0], C[1], { color: '#fff', size: 11, align: 'center' });
    drawGraph();
  }
  function drawGraph() {
    G.fit(); gx.clearRect(0, 0, G.W, G.H);
    const x0 = 40, x1 = 370, y0 = 110, A = 55, span = 72;    // 顯示 72 小時
    gx.strokeStyle = '#ddd'; gx.beginPath(); gx.moveTo(x0, y0); gx.lineTo(x1, y0); gx.stroke();
    for (let d = 0; d <= 3; d++) { const x = x0 + d * 24 / span * (x1 - x0); gx.strokeStyle = '#eee'; gx.beginPath(); gx.moveTo(x, 10); gx.lineTo(x, 200); gx.stroke(); if (d < 3) label(gx, `第 ${d + 1} 天`, x + 4, 210, { size: 11, color: '#888' }); }
    label(gx, '水位', 4, 14, { size: 11, color: '#555' });
    if (moses.checked) { const th = y0 + A * .55; gx.fillStyle = 'rgba(46,125,50,.12)'; gx.fillRect(x0, th, x1 - x0, 200 - th); gx.strokeStyle = '#2E7D32'; gx.setLineDash([4, 3]); gx.beginPath(); gx.moveTo(x0, th); gx.lineTo(x1, th); gx.stroke(); gx.setLineDash([]); label(gx, '水位低於這條線 → 步道露出，可以走', x0 + 4, th + 12, { size: 11, color: '#2E7D32', bold: true }); }
    // 曲線（從現在往後畫 72 小時的預報）
    const save = t; gx.strokeStyle = '#1565C0'; gx.lineWidth = 2.5; gx.beginPath();
    const base = Math.floor(save / 24) * 24; let mx = -9, mn = 9;
    for (let h = 0; h <= span; h += .5) { t = base + h; const v = level() / (1 + AS()); mx = Math.max(mx, v); mn = Math.min(mn, v); const x = x0 + h / span * (x1 - x0), y = y0 - v * A; h ? gx.lineTo(x, y) : gx.moveTo(x, y); }
    gx.stroke(); t = save;
    const xn = x0 + (t - base) / span * (x1 - x0), vn = level() / (1 + AS());
    gx.fillStyle = '#E53935'; gx.beginPath(); gx.arc(xn, y0 - vn * A, 6, 0, 7); gx.fill();
    const hr = t % 24, d = +tday.value;
    const range = (mx - mn) * (1 + AS());
    const kind = !sun.checked ? '（沒有太陽的影響）' : (d < 2 || d > 27 || Math.abs(d - 15) < 2) ? '大潮' : (Math.abs(d - 7.5) < 2 || Math.abs(d - 22) < 2) ? '小潮' : '中潮';
    document.getElementById('c7tideR').innerHTML = `<div><b>${String(Math.floor(hr)).padStart(2, '0')}:${String(Math.floor((hr % 1) * 60)).padStart(2, '0')}</b><span>臺灣時間</span></div>
      <div><b>${vn > .5 ? '滿潮附近' : vn < -.5 ? '乾潮附近' : (Math.sin(2 * (lamTW() - lamMoon())) < 0 ? '漲潮中' : '退潮中')}</b><span>現在</span></div>
      <div><b>${range.toFixed(2)}</b><span>這三天最大的潮差（相對值）</span></div><div><b>${kind}</b><span>這幾天</span></div>`;
    document.getElementById('c7tideTxt').innerHTML = '月球附近和正對面的海水隆起（滿潮），兩側的海水較低（乾潮）。地球自轉一圈，臺灣會經過兩個隆起 → <b>一天約兩次滿潮、兩次乾潮</b>。因為月球同時在往前走，下一次滿潮會晚約 12 小時 25 分。';
  }
  const pb = document.getElementById('c7tidePlay');
  pb.onclick = () => { play = !play; pb.textContent = play ? '⏸ 暫停' : '▶ 時間前進'; };
  [sun, moses].forEach(e => e.onchange = draw);
  const L = loop(dt => { if (play) t += dt * 2; draw(); });   // 1 秒 = 2 小時
  registerSim('t6', { start() { L.start(); }, stop() { L.stop(); } });

  /* ---------- 拉力差 ---------- */
  const P = stage(document.getElementById('c7pull'), 420, 240), px = P.ctx;
  let pmode = 'raw';
  function drawPull() {
    P.fit(); px.fillStyle = '#05070F'; px.fillRect(0, 0, P.W, P.H);
    const ex = 150, ey = 120, R = 70, mxp = 400;
    px.fillStyle = '#ddd'; px.beginPath(); px.arc(mxp, ey, 12, 0, 7); px.fill(); label(px, '月球', mxp, ey - 22, { color: '#ddd', size: 12, align: 'center' });
    px.fillStyle = 'rgba(64,140,230,.6)'; px.beginPath(); px.ellipse(ex, ey, R + (pmode === 'rel' ? 26 : 12), R + 4, 0, 0, 7); px.fill();
    px.fillStyle = '#5E9E5A'; px.beginPath(); px.arc(ex, ey, R, 0, 7); px.fill();
    const pts = [['A 近側', ex + R], ['B 地心', ex], ['C 遠側', ex - R]];
    const F = x => 2.6e5 / Math.pow(mxp - x, 2);       // 萬有引力和距離平方成反比
    pts.forEach(([n, x]) => {
      let f = F(x); if (pmode === 'rel') f -= F(ex);
      const L2 = f * 4;
      px.fillStyle = '#FFD54F'; px.beginPath(); px.arc(x, ey, 4, 0, 7); px.fill();
      if (Math.abs(L2) > 2) arrow(px, x, ey, x + L2, ey, pmode === 'rel' ? '#FF8A65' : '#FFD54F', 3, 10);
      label(px, n, x, ey + 26, { color: '#fff', size: 12, align: 'center' });
    });
    document.getElementById('c7pullTxt').innerHTML = pmode === 'raw'
      ? '月球對三個點都往右拉，但<b>離月球愈近拉力愈大</b>：A ＞ B ＞ C。'
      : '從地球中心 B 的角度看（把每個箭頭都減掉 B 的拉力）：A 被「往月球拉走」，C 則「被留在後面」，看起來像被往反方向推。地球就像被往兩頭拉長——<b>兩邊都隆起</b>。<br><span class="note">🔬 引力和距離平方成反比，但「拉力差」（潮汐力）和距離的立方成反比，距離的影響更大。所以雖然太陽的引力大得多，近的月球對潮汐的影響反而約是太陽的兩倍。</span>';
  }
  document.querySelectorAll('#c7pullMode .chip').forEach(b => b.onclick = () => { document.querySelectorAll('#c7pullMode .chip').forEach(x => x.classList.remove('on')); b.classList.add('on'); pmode = b.dataset.m; drawPull(); });
  registerSim('t6', { start: drawPull, resize: drawPull });
})();
