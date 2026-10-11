/* ===== 分頁 2：地下水模擬器（地層下陷、海水入侵） =====
   比例：畫面 10 px = 1 公尺。地面起始 y=150，海平面 y=168。
   下陷只在地下水面降到「歷史最低點」以下時發生，水面回升時不會反彈（不可逆）。 */
(() => {
  const cv = document.getElementById('t2cv'); if (!cv) return;
  const S = stage(cv, 760, 430), ctx = S.ctx;
  const G0 = 150, SEA = 168, AQ_BOT = 330, COAST = 640, PX = 10;
  const st = { year: 0, wt: 162, wtMin: 162, sub: 0, playing: false };
  const rain = bindRange('t2rain', v => v < 25 ? '少（旱）' : v < 70 ? '普通' : '多（雨季）', () => draw());
  const pump = bindRange('t2pump', v => v === 0 ? '不抽' : v < 40 ? '少' : v < 75 ? '多' : '超抽！', () => draw());
  const well = bindRange('t2well', v => v + ' 公尺', () => draw());
  const rnd = rng(7);
  const sandDots = Array.from({ length: 900 }, () => [rnd() * 760, rnd()]);

  function step(dt) {
    if (!st.playing) return;
    const yrs = dt * 3;                                   // 1 秒 = 3 年
    st.year += yrs;
    const ground = G0 + st.sub;
    const dwt = (+pump.value * 0.05 - +rain.value * 0.05) * yrs;   // 正值 = 水面變深
    st.wt = clamp(st.wt + dwt, ground + 5, AQ_BOT - 8);
    if (st.wt > st.wtMin) {                               // 低於過去最低點 → 黏土被壓密
      st.sub += (st.wt - st.wtMin) * 0.28;
      st.wtMin = st.wt;
    }
    draw();
  }
  function draw() {
    S.fit(); ctx.clearRect(0, 0, S.W, S.H);
    const ground = G0 + st.sub;
    // 天空
    ctx.fillStyle = '#E3F1FA'; ctx.fillRect(0, 0, S.W, S.H);
    // 海（右側）
    ctx.fillStyle = '#5E9ECF'; ctx.fillRect(COAST, SEA, S.W - COAST, AQ_BOT - SEA);
    // 透水層（砂）
    ctx.fillStyle = '#E8D6A8'; ctx.fillRect(0, ground, COAST, AQ_BOT - ground);
    ctx.fillStyle = 'rgba(150,120,70,.45)';
    sandDots.forEach(([x, f]) => { if (x < COAST) ctx.fillRect(x, ground + f * (AQ_BOT - ground), 2, 2); });
    // 地下水（飽和帶）
    ctx.fillStyle = 'rgba(70,140,210,.42)'; ctx.fillRect(0, st.wt, COAST, AQ_BOT - st.wt);
    // 海水入侵：地下水面愈低，鹹水楔形伸得愈進來
    const push = clamp((st.wt - SEA) * 4, 30, 420);
    ctx.save(); ctx.beginPath(); ctx.rect(0, Math.max(st.wt, SEA), COAST, AQ_BOT); ctx.clip();   // 鹹水只出現在飽和帶裡
    ctx.fillStyle = 'rgba(200,60,60,.38)';
    ctx.beginPath(); ctx.moveTo(COAST, SEA + 4); ctx.lineTo(COAST, AQ_BOT); ctx.lineTo(COAST - push, AQ_BOT); ctx.closePath(); ctx.fill();
    ctx.restore();
    // 不透水層（黏土）
    ctx.fillStyle = '#8C7A6B'; ctx.fillRect(0, AQ_BOT, S.W, S.H - AQ_BOT);
    ctx.strokeStyle = 'rgba(0,0,0,.15)'; for (let y = AQ_BOT + 10; y < S.H; y += 12) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(S.W, y); ctx.stroke(); }
    // 地表（草）
    ctx.fillStyle = '#7CB342'; ctx.fillRect(0, ground - 4, COAST, 6);
    // 原本的地面高度
    if (st.sub > 1) {
      ctx.setLineDash([6, 4]); ctx.strokeStyle = '#C62828'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(0, G0); ctx.lineTo(COAST, G0); ctx.stroke(); ctx.setLineDash([]);
      label(ctx, '原本的地面', 10, G0 - 10, { color: '#C62828', size: 13, bold: true });
      arrow(ctx, 470, G0, 470, ground - 2, '#C62828', 2, 8);
    }
    // 海水倒灌：地面比海還低
    if (ground > SEA - 2) { ctx.fillStyle = 'rgba(94,158,207,.6)'; ctx.fillRect(420, SEA - 2, COAST - 420, ground - SEA + 2); label(ctx, '⚠ 低於海面，容易淹水、海水倒灌', 530, SEA - 16, { align: 'center', size: 13, color: '#0D47A1', bold: true, bg: 'rgba(255,255,255,.8)' }); }
    // 房子（跟著地面一起沉）＋ 後來墊高的馬路
    const hx = 90, hy = ground - 4;
    ctx.fillStyle = '#F5F0E6'; ctx.fillRect(hx, hy - 50, 60, 50); ctx.strokeStyle = '#6D5D4B'; ctx.lineWidth = 2; ctx.strokeRect(hx, hy - 50, 60, 50);
    ctx.fillStyle = '#B5523B'; ctx.beginPath(); ctx.moveTo(hx - 6, hy - 50); ctx.lineTo(hx + 30, hy - 78); ctx.lineTo(hx + 66, hy - 50); ctx.fill();
    ctx.fillStyle = '#6D5D4B'; ctx.fillRect(hx + 24, hy - 26, 14, 26);
    if (st.sub > 6) { ctx.fillStyle = '#666'; ctx.fillRect(160, G0 - 6, 140, 8 + st.sub * 0); label(ctx, '後來墊高的馬路', 230, G0 - 16, { align: 'center', size: 12, color: '#444' }); }
    // 水井＋抽水機
    const wx = 380, wBot = ground + +well.value * PX;
    ctx.fillStyle = '#fff'; ctx.fillRect(wx - 5, ground - 20, 10, wBot - ground + 20);
    ctx.strokeStyle = '#455A64'; ctx.lineWidth = 2; ctx.strokeRect(wx - 5, ground - 20, 10, wBot - ground + 20);
    const wet = wBot > st.wt;
    if (wet) { ctx.fillStyle = '#4A8CD2'; ctx.fillRect(wx - 4, st.wt, 8, wBot - st.wt); }
    ctx.fillStyle = '#455A64'; ctx.fillRect(wx - 14, ground - 32, 28, 14);
    label(ctx, wet ? '💧 抽得到水' : '✘ 抽不到水', wx, ground - 46, { align: 'center', size: 13, bold: true, color: wet ? '#1565C0' : '#C62828', bg: 'rgba(255,255,255,.85)' });
    // 標示
    label(ctx, '地下水面', 12, st.wt - 9, { size: 13, color: '#0D47A1', bold: true });
    ctx.strokeStyle = '#0D47A1'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(0, st.wt); ctx.lineTo(COAST, st.wt); ctx.stroke();
    label(ctx, '透水層（砂，孔隙多）', 520, AQ_BOT - 14, { size: 13, color: '#5D4037', align: 'right' });
    label(ctx, '不透水層（黏土）', 12, AQ_BOT + 20, { size: 13, color: '#fff' });
    label(ctx, '海', 700, SEA + 30, { size: 16, color: '#fff', bold: true, align: 'center' });
    if (push > 60) label(ctx, '鹹水入侵', COAST - 50, AQ_BOT - 30, { size: 13, color: '#B71C1C', bold: true, align: 'right' });
    // 雨
    const r = +rain.value;
    ctx.strokeStyle = 'rgba(30,90,160,.5)'; ctx.lineWidth = 1.5;
    for (let i = 0; i < r / 4; i++) { const x = (i * 97 + st.year * 40) % COAST; ctx.beginPath(); ctx.moveTo(x, 20 + (i * 37) % 60); ctx.lineTo(x - 4, 32 + (i * 37) % 60); ctx.stroke(); }
    // 讀數
    document.getElementById('t2read').innerHTML =
      `<div><b>${Math.floor(st.year)} 年</b><span>經過時間</span></div>
       <div><b>${((st.wt - ground) / PX).toFixed(1)} m</b><span>地下水面深度</span></div>
       <div><b style="color:${st.sub > 1 ? '#C62828' : ''}">${(st.sub / PX * 100).toFixed(0)} cm</b><span>累積地層下陷</span></div>`;
  }
  const L = loop(step);
  const playBtn = document.getElementById('t2play');
  playBtn.onclick = () => { st.playing = !st.playing; playBtn.textContent = st.playing ? '⏸ 暫停' : '▶ 時間前進'; };
  document.getElementById('t2stop').onclick = () => { pump.value = 0; pump.dispatchEvent(new Event('input')); if (!st.playing) playBtn.click(); };
  document.getElementById('t2reset').onclick = () => { Object.assign(st, { year: 0, wt: 162, wtMin: 162, sub: 0 }); rain.value = 50; pump.value = 50; [rain, pump].forEach(e => e.dispatchEvent(new Event('input'))); draw(); };
  registerSim('t2', { start() { draw(); L.start(); }, stop() { L.stop(); }, resize: draw });
})();
