/* ===== 第七章 分頁 4：月相模擬器（俯視＋從臺灣看）、潮汐鎖定 =====
   俯視圖：太陽在右邊很遠的地方，陽光從右往左。月球逆時鐘繞地球。
   θ = 2π × 農曆日 / 29.5（0 = 新月，月球在地球和太陽之間＝右邊）。 */
(() => {
  const tc = document.getElementById('c7moonTop'); if (!tc) return;
  const T = stage(tc, 380, 380), tx = T.ctx;
  const V = stage(document.getElementById('c7moonView'), 380, 380), vx = V.ctx;
  const lunarName = v => { const n = Math.min(30, Math.round(v) + 1); return n <= 10 ? '初' + '一二三四五六七八九十'[n - 1] : n < 20 ? '十' + '一二三四五六七八九'[n - 11] : n === 20 ? '二十' : n < 30 ? '廿' + '一二三四五六七八九'[n - 21] : '三十'; };
  const lday = bindRange('c7lday', v => '農曆' + lunarName(v), () => drawAll());
  const shadow = document.getElementById('c7shadow');
  let play = false;
  const C = [190, 190], RO = 120;
  const theta = () => +lday.value / 29.5 * 2 * Math.PI;
  const mpos = th => [C[0] + Math.cos(th) * RO, C[1] - Math.sin(th) * RO];
  function name(d) {
    if (d < 1 || d > 28.5) return ['新月（朔）', '初一'];
    if (d < 6.4) return ['眉月（蛾眉月）', '初三、初四'];
    if (d < 8.4) return ['上弦月', '初七、初八'];
    if (d < 13.8) return ['盈凸月', '初十左右'];
    if (d < 15.8) return ['滿月（望）', '十五'];
    if (d < 21.2) return ['虧凸月', '十八左右'];
    if (d < 23.2) return ['下弦月', '二十二、二十三'];
    return ['殘月', '二十六左右'];
  }
  function drawTop() {
    T.fit(); tx.fillStyle = '#05070F'; tx.fillRect(0, 0, T.W, T.H);
    for (let k = 0; k < 8; k++) arrow(tx, 375, 30 + k * 46, 330, 30 + k * 46, 'rgba(255,213,79,.6)', 2, 8);
    label(tx, '陽光 ←（太陽在右邊很遠處）', 370, 14, { color: '#FFD54F', size: 12, align: 'right' });
    tx.strokeStyle = 'rgba(255,255,255,.25)'; tx.beginPath(); tx.arc(...C, RO, 0, 7); tx.stroke();
    if (shadow.checked) { tx.fillStyle = 'rgba(0,0,0,.6)'; tx.beginPath(); tx.moveTo(C[0], C[1] - 22); tx.lineTo(0, C[1] - 14); tx.lineTo(0, C[1] + 14); tx.lineTo(C[0], C[1] + 22); tx.fill(); tx.strokeStyle = 'rgba(255,120,120,.6)'; tx.setLineDash([4, 4]); tx.strokeRect(0, C[1] - 18, C[0], 36); tx.setLineDash([]); label(tx, '地球的影子', 40, C[1] - 28, { color: '#FF8A80', size: 12, bold: true }); }
    // 地球（右半亮）
    tx.fillStyle = '#1B2A4A'; tx.beginPath(); tx.arc(...C, 22, 0, 7); tx.fill();
    tx.fillStyle = '#4A90E2'; tx.beginPath(); tx.arc(...C, 22, -Math.PI / 2, Math.PI / 2); tx.fill();
    label(tx, '地球', C[0], C[1] + 36, { color: '#fff', size: 12, align: 'center' });
    // 月球位置與名稱環
    [[0, '初一'], [Math.PI / 2, '初八'], [Math.PI, '十五'], [Math.PI * 1.5, '廿三']].forEach(([a, n]) => { const [x, y] = mpos(a); label(tx, n, x + Math.cos(a) * 28, y - Math.sin(a) * 22, { color: '#888', size: 11, align: 'center' }); });
    const th = theta(), [mx, my] = mpos(th);
    tx.fillStyle = '#333'; tx.beginPath(); tx.arc(mx, my, 14, 0, 7); tx.fill();
    tx.fillStyle = '#F5E9B8'; tx.beginPath(); tx.arc(mx, my, 14, -Math.PI / 2, Math.PI / 2); tx.fill();   // 永遠右半（朝太陽）亮
    // 從地球看月球的視線，標出「看到的那一半」
    tx.strokeStyle = 'rgba(255,255,255,.35)'; tx.setLineDash([3, 4]); tx.beginPath(); tx.moveTo(...C); tx.lineTo(mx, my); tx.stroke(); tx.setLineDash([]);
    tx.strokeStyle = '#80DEEA'; tx.lineWidth = 3; tx.beginPath(); const fa = Math.atan2(C[1] - my, C[0] - mx); tx.arc(mx, my, 18, fa - Math.PI / 2, fa + Math.PI / 2); tx.stroke(); tx.lineWidth = 1;
    label(tx, '藍弧＝地球上看得到的半邊', 10, 370, { color: '#80DEEA', size: 11 });
    label(tx, '從北極上空看（逆時鐘公轉）', 10, 352, { color: '#aaa', size: 11 });
  }
  function drawView() {
    V.fit(); vx.fillStyle = '#0B1530'; vx.fillRect(0, 0, V.W, V.H);
    const r = rng(2); for (let i = 0; i < 60; i++) { vx.fillStyle = `rgba(255,255,255,${r() * .7})`; vx.fillRect(r() * 380, r() * 300, 1.4, 1.4); }
    const th = theta(), cx = 190, cy = 160, R = 95;
    const k = Math.cos(th);              // 1 = 新月、−1 = 滿月
    const waxing = th < Math.PI;         // 盈：亮面在右（西）
    vx.fillStyle = '#2A2A30'; vx.beginPath(); vx.arc(cx, cy, R, 0, 7); vx.fill();
    vx.fillStyle = '#F5E9B8'; vx.beginPath();
    // 亮的半圓（右或左）＋ 晨昏線橢圓
    vx.arc(cx, cy, R, -Math.PI / 2, Math.PI / 2, !waxing);
    vx.ellipse(cx, cy, Math.max(.5, Math.abs(k) * R), R, 0, Math.PI / 2, -Math.PI / 2, waxing === (k > 0));   // 眉月：晨昏線凹向亮面；凸月：凸向暗面
    vx.fill();
    // 月面坑洞（淡淡的，增加真實感）
    vx.fillStyle = 'rgba(0,0,0,.08)'; [[-30, -20, 16], [20, 30, 12], [35, -35, 9], [-10, 45, 10]].forEach(([dx, dy, rr]) => { vx.beginPath(); vx.arc(cx + dx, cy + dy, rr, 0, 7); vx.fill(); });
    // 地平線
    vx.fillStyle = '#1E3320'; vx.fillRect(0, 300, V.W, 80);
    label(vx, '東', 16, 320, { color: '#cfe', size: 13, bold: true }); label(vx, '南', 190, 320, { color: '#cfe', size: 13, bold: true, align: 'center' }); label(vx, '西', 364, 320, { color: '#cfe', size: 13, bold: true, align: 'right' });
    label(vx, '從臺灣面向南方看到的月亮', 190, 360, { color: '#aaa', size: 12, align: 'center' });
    const [n, lunar] = name(+lday.value), d = +lday.value;
    const frac = (1 - k) / 2;
    const riseH = (6 + d / 29.5 * 24) % 24;
    const at18 = d < 1 || d > 28.5 ? '和太陽一起落下，看不到' : d < 6 ? '西方低空' : d < 10 ? '南方天空' : d < 13.5 ? '東南方天空' : d < 16 ? '東方剛升起' : '還沒升起';
    document.getElementById('c7moonR').innerHTML = `<div><b>${n}</b><span>月相（農曆約${lunar}）</span></div>
      <div><b>${Math.round(frac * 100)}%</b><span>看到的亮面比例</span></div>
      <div><b>約 ${String(Math.floor(riseH)).padStart(2, '0')}:${String(Math.round((riseH % 1) * 60) % 60).padStart(2, '0')}</b><span>月出時間</span></div>
      <div><b>${at18}</b><span>傍晚 6 點時月亮在</span></div>`;
  }
  function drawAll() { drawTop(); drawView(); }
  let drag = false;
  tc.addEventListener('pointerdown', e => { drag = true; tc.setPointerCapture(e.pointerId); setFrom(e); });
  tc.addEventListener('pointermove', e => { if (drag) setFrom(e); });
  tc.addEventListener('pointerup', () => drag = false);
  function setFrom(e) { const p = T.pt(e); let a = Math.atan2(C[1] - p.y, p.x - C[0]); if (a < 0) a += 2 * Math.PI; lday.value = (a / (2 * Math.PI) * 29.5).toFixed(1); lday.dispatchEvent(new Event('input')); }
  shadow.onchange = drawAll;
  const pb = document.getElementById('c7moonPlay');
  pb.onclick = () => { play = !play; pb.textContent = play ? '⏸ 暫停' : '▶ 播放一個月'; };
  const L = loop(dt => { if (play) { lday.value = ((+lday.value + dt * 2.5) % 29.5).toFixed(2); lday.dispatchEvent(new Event('input')); } });
  registerSim('t4', { start() { drawAll(); L.start(); }, stop() { L.stop(); }, resize: drawAll });

  /* ---------- 潮汐鎖定 ---------- */
  const K = stage(document.getElementById('c7lock'), 360, 300), kx = K.ctx;
  let mode = 'sync', lk = 0, lkPlay = false;
  function drawLock() {
    K.fit(); kx.fillStyle = '#05070F'; kx.fillRect(0, 0, K.W, K.H);
    const c = [180, 150], ro = 105;
    kx.strokeStyle = 'rgba(255,255,255,.2)'; kx.beginPath(); kx.arc(...c, ro, 0, 7); kx.stroke();
    kx.fillStyle = '#4A90E2'; kx.beginPath(); kx.arc(...c, 18, 0, 7); kx.fill();
    // 畫出四個時刻的月球
    for (let i = 0; i < 4; i++) {
      const a = lk + i * Math.PI / 2, mx = c[0] + Math.cos(a) * ro, my = c[1] - Math.sin(a) * ro;
      kx.globalAlpha = i === 0 ? 1 : .35;
      kx.fillStyle = '#CFCFCF'; kx.beginPath(); kx.arc(mx, my, 16, 0, 7); kx.fill();
      const face = mode === 'sync' ? Math.atan2(c[1] - my, c[0] - mx) : Math.PI;   // 紅點：月球上的「臉」
      kx.fillStyle = '#E53935'; kx.beginPath(); kx.arc(mx + Math.cos(face) * 10, my + Math.sin(face) * 10, 4.5, 0, 7); kx.fill();
    }
    kx.globalAlpha = 1;
    document.getElementById('c7lockTxt').innerHTML = mode === 'sync'
      ? '紅點（月球上的同一塊地方）<b>永遠朝向地球</b>。因為月球自轉一圈的時間，剛好等於它繞地球公轉一圈的時間（約 27.3 天）。這叫做<b>同步自轉</b>（潮汐鎖定）。'
      : '如果月球完全不自轉，紅點會一直朝同一個方向，地球上的人就會輪流看到月球的每一面——但真實情況不是這樣！所以「永遠同一面」反而證明月球<b>有在自轉</b>。';
  }
  document.querySelectorAll('#c7lockMode .chip').forEach(b => b.onclick = () => { document.querySelectorAll('#c7lockMode .chip').forEach(x => x.classList.remove('on')); b.classList.add('on'); mode = b.dataset.m; drawLock(); });
  document.getElementById('c7lockGo').onclick = e => { lkPlay = !lkPlay; e.target.textContent = lkPlay ? '⏸ 暫停' : '▶ 播放'; };
  const KL = loop(dt => { if (lkPlay) lk += dt * .6; drawLock(); });
  registerSim('t4', { start() { KL.start(); }, stop() { KL.stop(); } });
})();
