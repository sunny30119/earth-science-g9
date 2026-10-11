/* ===== 分頁 6：河床平衡（挖砂石）、海岸線收支、截彎取直 =====
   河床：擴散方程 z_t = D z_xx（突起被削、低窪被填）；上下游端點固定。比例 10 px = 1 m。
   海岸線：一線模型（one-line model）。沿岸輸沙 Q = K·w·(A − B·ds/dx)，ds/dt = −dQ/dx + 河沙 − 流失；突堤處 Q = 0。 */
(() => {
  /* ---------- ① 挖砂石 ---------- */
  const bc = document.getElementById('t6bed'); if (!bc) return;
  const B = stage(bc, 760, 330), bx = B.ctx;
  const N = 153, DX = 5, PIER = 50, PIER_X = PIER * DX;            // 橋在 x=250
  const base = i => 110 + i * DX * .16;
  let z0 = [], z = [], yrB = 0, bedPlay = false, mining = false;
  function bedReset() { z0 = Array.from({ length: N }, (_, i) => base(i)); z = z0.slice(); yrB = 0; mining = false; digBtn.classList.remove('sel'); digBtn.textContent = '⛏ 在下游持續挖砂石'; drawBed(); }
  function bedStep(dt) {
    if (bedPlay) {
      const yrs = dt * 4; yrB += yrs;
      for (let k = 0; k < 8; k++) {
        const nz = z.slice();
        for (let i = 1; i < N - 1; i++) nz[i] = z[i] + .22 * (z[i - 1] - 2 * z[i] + z[i + 1]);
        if (mining) for (let i = 88; i < 108; i++) nz[i] += .03 * Math.sin((i - 88) / 20 * Math.PI);   // 每年持續挖走砂石
        z = nz;
      }
    }
    drawBed();
  }
  function drawBed() {
    B.fit(); bx.clearRect(0, 0, B.W, B.H);
    bx.fillStyle = '#EAF4FA'; bx.fillRect(0, 0, B.W, B.H);
    // 河水
    bx.fillStyle = 'rgba(70,140,210,.45)'; bx.beginPath(); bx.moveTo(0, z[0] - 18);
    for (let i = 0; i < N; i++) bx.lineTo(i * DX, Math.min(z[i], z0[i]) - 18); for (let i = N - 1; i >= 0; i--) bx.lineTo(i * DX, z[i]); bx.fill();
    // 河床
    bx.fillStyle = '#B9A07E'; bx.beginPath(); bx.moveTo(0, z[0]); for (let i = 0; i < N; i++) bx.lineTo(i * DX, z[i]); bx.lineTo(B.W, B.H); bx.lineTo(0, B.H); bx.fill();
    bx.fillStyle = 'rgba(120,90,60,.35)'; for (let i = 0; i < N; i += 3) bx.fillRect(i * DX + 2, z[i] + 6, 2, 2);
    // 原本河床
    bx.setLineDash([6, 4]); bx.strokeStyle = '#C62828'; bx.lineWidth = 1.5; bx.beginPath(); for (let i = 0; i < N; i++) i ? bx.lineTo(i * DX, z0[i]) : bx.moveTo(0, z0[0]); bx.stroke(); bx.setLineDash([]);
    // 待侵蝕／待沉積
    for (let i = 2; i < N - 2; i += 4) {
      const d = z[i] - z0[i];
      if (Math.abs(d) > 4) { bx.fillStyle = d > 0 ? 'rgba(229,57,53,.18)' : 'rgba(30,136,229,.18)'; bx.fillRect(i * DX - 8, Math.min(z[i], z0[i]), 16, Math.abs(d)); }
    }
    // 橋
    const deckY = 60, footBot = z0[PIER] + 40;
    bx.fillStyle = '#607D8B'; bx.fillRect(PIER_X - 70, deckY - 10, 140, 10);
    bx.fillStyle = '#90A4AE'; bx.fillRect(PIER_X - 9, deckY, 18, footBot - deckY);
    bx.fillStyle = '#78909C'; bx.fillRect(PIER_X - 22, footBot - 16, 44, 16);         // 基礎
    // 被埋住的部分用土色蓋回去
    bx.save(); bx.beginPath(); bx.moveTo(0, z[0]); for (let i = 0; i < N; i++) bx.lineTo(i * DX, z[i]); bx.lineTo(B.W, B.H); bx.lineTo(0, B.H); bx.clip();
    bx.fillStyle = 'rgba(185,160,126,.85)'; bx.fillRect(PIER_X - 24, 0, 48, B.H); bx.restore();
    label(bx, '橋', PIER_X, deckY - 20, { align: 'center', bold: true, size: 14 });
    const exposed = (z[PIER] - z0[PIER]) / 10;
    if (exposed > .3) {
      arrow(bx, PIER_X + 34, z0[PIER], PIER_X + 34, z[PIER], '#C62828', 2, 7);
      label(bx, `橋墩裸露 ${exposed.toFixed(1)} m`, PIER_X + 42, (z0[PIER] + z[PIER]) / 2, { color: '#C62828', bold: true, size: 13, bg: 'rgba(255,255,255,.85)' });
    }
    if (z[PIER] > footBot - 16) label(bx, '⚠ 基礎被掏空，橋墩危險！', PIER_X, 30, { align: 'center', color: '#fff', bold: true, size: 14, bg: '#C62828' });
    if (mining) label(bx, '⛏ 挖砂石', 98 * DX, z[98] + 30, { align: 'center', bold: true, size: 13, color: '#fff', bg: '#C46A28' });
    label(bx, '上游', 16, 20, { bold: true, size: 13 }); label(bx, '下游', B.W - 16, 20, { bold: true, size: 13, align: 'right' });
    document.getElementById('t6bedR').innerHTML = `<div><b>${Math.floor(yrB)} 年</b><span>經過時間</span></div><div><b style="color:${exposed > .3 ? '#C62828' : ''}">${Math.max(0, exposed).toFixed(1)} m</b><span>橋墩處河床下降</span></div>`;
  }
  const digBtn = document.getElementById('t6dig');
  digBtn.onclick = () => { mining = !mining; digBtn.classList.toggle('sel', mining); digBtn.textContent = mining ? '⛏ 挖砂石中…（再按停止）' : '⛏ 在下游持續挖砂石'; if (mining && !bedPlay) bedBtn.click(); };
  document.getElementById('t6bump').onclick = () => { for (let i = 60; i < 76; i++) z[i] -= 35 * Math.sin((i - 60) / 16 * Math.PI); drawBed(); };
  const bedBtn = document.getElementById('t6bedPlay');
  bedBtn.onclick = () => { bedPlay = !bedPlay; bedBtn.textContent = bedPlay ? '⏸ 暫停' : '▶ 時間前進'; };
  document.getElementById('t6bedReset').onclick = bedReset;
  bedReset();
  const BL = loop(bedStep);
  registerSim('t6', { start() { BL.start(); }, stop() { BL.stop(); } });

  /* ---------- ② 海岸線 ---------- */
  const cc = document.getElementById('t6coast');
  const C = stage(cc, 760, 340), cx = C.ctx;
  const CN = 153, S0 = 170, RIVER = 50, JET = 102, VIL = 128;
  const sup = bindRange('t6sup', v => v < 20 ? '很少' : v < 60 ? '中等' : '很多');
  const wave = bindRange('t6wave', v => v < 35 ? '平靜' : v < 70 ? '中等' : '大浪');
  let s = [], yrC = 0, cPlay = false, dam = false, jetty = false;
  function coastReset() { s = new Array(CN).fill(S0); yrC = 0; dam = false; jetty = false; updBtns(); }
  function updBtns() { document.getElementById('t6dam').classList.toggle('sel', dam); document.getElementById('t6jetty').classList.toggle('sel', jetty); }
  function coastStep(dt) {
    if (cPlay) {
      yrC += dt * 5;
      const w = +wave.value / 50, A = 1, Bk = 60, K = .5;
      const supply = +sup.value / 60 * (dam ? .2 : 1);
      for (let it = 0; it < 6; it++) {
        const Q = new Array(CN + 1);
        Q[0] = K * w * A; Q[CN] = K * w * (A - Bk * 0);
        for (let i = 1; i < CN; i++) Q[i] = K * w * (A - Bk * (s[i] - s[i - 1]) / DX);
        if (jetty) Q[JET] = 0;
        for (let i = 0; i < CN; i++) {
          const src = supply * 1.1 * Math.exp(-((i - RIVER) ** 2) / 40);
          s[i] += (-(Q[i + 1] - Q[i]) * 1.2 + src - .08 * w) * .05;   // 波浪愈大，被帶離海岸的沙愈多
          s[i] = clamp(s[i], 40, 320);
        }
      }
    }
    drawCoast();
  }
  function drawCoast() {
    C.fit(); cx.clearRect(0, 0, C.W, C.H);
    cx.fillStyle = '#4F86C6'; cx.fillRect(0, 0, C.W, C.H);
    // 原本海岸線
    // 陸地
    cx.fillStyle = '#A5C88A'; cx.beginPath(); cx.moveTo(0, 0); for (let i = 0; i < CN; i++) cx.lineTo(i * DX, s[i] - 10); cx.lineTo(C.W, 0); cx.fill();
    // 沙灘
    cx.fillStyle = '#EED9A4'; cx.beginPath(); cx.moveTo(0, s[0] - 10); for (let i = 0; i < CN; i++) cx.lineTo(i * DX, s[i] - 10); for (let i = CN - 1; i >= 0; i--) cx.lineTo(i * DX, s[i]); cx.fill();
    // 浪花
    cx.strokeStyle = 'rgba(255,255,255,.7)'; cx.lineWidth = 2; cx.beginPath(); for (let i = 0; i < CN; i++) cx.lineTo(i * DX, s[i] + 4 + Math.sin(i / 3 + performance.now() / 400) * 1.5); cx.stroke();
    cx.setLineDash([6, 4]); cx.strokeStyle = '#FFEB3B'; cx.lineWidth = 1.5; cx.beginPath(); cx.moveTo(0, S0); cx.lineTo(C.W, S0); cx.stroke(); cx.setLineDash([]);
    label(cx, '原本的海岸線', 8, S0 + 14, { size: 12, color: '#FFEB3B', bold: true });
    // 河流
    cx.strokeStyle = '#3E7CC0'; cx.lineWidth = 7; cx.beginPath(); cx.moveTo(RIVER * DX - 60, 0); cx.quadraticCurveTo(RIVER * DX + 20, 60, RIVER * DX, s[RIVER] - 6); cx.stroke();
    if (dam) { cx.fillStyle = '#546E7A'; cx.fillRect(RIVER * DX - 62, 20, 34, 10); label(cx, '水庫', RIVER * DX - 45, 42, { size: 12, align: 'center', bold: true }); }
    label(cx, '河口', RIVER * DX + 14, s[RIVER] - 24, { size: 12, bold: true, color: '#0D47A1' });
    // 突堤
    if (jetty) { cx.fillStyle = '#5D4037'; cx.fillRect(JET * DX - 4, s[JET] - 30, 8, 80); label(cx, '突堤', JET * DX + 10, s[JET] + 40, { size: 12, color: '#fff', bold: true }); }
    // 村莊
    const vy = S0 - 40;
    cx.fillStyle = s[VIL] - 10 < vy + 10 ? '#E57373' : '#FFF8E1';
    for (let k = 0; k < 3; k++) { cx.fillRect(VIL * DX + k * 16 - 20, vy - 8, 12, 10); }
    label(cx, s[VIL] - 10 < vy + 10 ? '⚠ 海邊村莊被海侵蝕' : '海邊村莊', VIL * DX - 2, vy - 20, { align: 'center', size: 12, bold: true, color: s[VIL] - 10 < vy + 10 ? '#B71C1C' : '#33691E', bg: 'rgba(255,255,255,.8)' });
    // 沿岸流
    for (let k = 0; k < 5; k++) { const x = (k * 160 + performance.now() / 30) % 800 - 40; arrow(cx, x, 300, x + 40, 300, 'rgba(255,255,255,.55)', 2, 8); }
    label(cx, '沿岸流 →', 10, 322, { size: 12, color: '#fff' });
    const dv = i => ((s[i] - S0) * 10).toFixed(0);
    document.getElementById('t6coastR').innerHTML = `<div><b>${Math.floor(yrC)} 年</b><span>經過時間</span></div>
      <div><b>${dv(RIVER) > 0 ? '+' : ''}${dv(RIVER)} m</b><span>河口海岸線（＋前進／−後退）</span></div>
      ${jetty ? `<div><b>${dv(JET - 4) > 0 ? '+' : ''}${dv(JET - 4)} m</b><span>突堤左側（上游側）</span></div>
      <div><b>${dv(JET + 8) > 0 ? '+' : ''}${dv(JET + 8)} m</b><span>突堤右側（下游側）</span></div>` : `<div><b>${dv(VIL) > 0 ? '+' : ''}${dv(VIL)} m</b><span>海邊村莊前的海岸</span></div>`}`;
  }
  document.getElementById('t6dam').onclick = () => { dam = !dam; updBtns(); if (!cPlay) cBtn.click(); };
  document.getElementById('t6jetty').onclick = () => { jetty = !jetty; updBtns(); if (!cPlay) cBtn.click(); };
  const cBtn = document.getElementById('t6coastPlay');
  cBtn.onclick = () => { cPlay = !cPlay; cBtn.textContent = cPlay ? '⏸ 暫停' : '▶ 時間前進'; };
  document.getElementById('t6coastReset').onclick = () => { coastReset(); drawCoast(); };
  coastReset();
  const CL = loop(coastStep);
  registerSim('t6', { start() { CL.start(); }, stop() { CL.stop(); } });

  /* ---------- ③ 截彎取直 ---------- */
  const mc = document.getElementById('t6mea');
  const M = stage(mc, 560, 420), mx = M.ctx;
  const str = bindRange('t6str', v => v === 0 ? '原本彎曲' : v < 100 ? v + '%' : '完全拉直', () => drawM());
  function hydro(Lrel) {
    // 河道愈短 → 坡度愈陡 → 流速愈快；水流到下游的時間 T = L / v，v ∝ √(H/L)
    const v = Math.sqrt(1 / Lrel), T = Lrel / v, k = .55 * T;
    const out = [], dt = .05; let S = 0;
    for (let t = 0; t <= 12; t += dt) {
      const tt = t - T * .8;                                  // 平移延遲
      const I = tt < 0 ? 0 : tt < 1 ? tt : tt < 3 ? (3 - tt) / 2 : 0;   // 降雨造成的入流（三角形）
      S += (I - S / k) * dt; out.push([t, S / k]);
    }
    return { v, T, out };
  }
  function drawM() {
    M.fit(); mx.clearRect(0, 0, M.W, M.H);
    const f = +str.value / 100, L0 = 2.2, Lrel = lerp(L0, 1, f) / 1;    // 原本長度是直線距離的 2.2 倍
    // 上：河道
    mx.fillStyle = '#E8F1E0'; mx.fillRect(0, 0, M.W, 170);
    const amp = 52 * (1 - f);
    mx.strokeStyle = '#3E7CC0'; mx.lineWidth = 8; mx.lineCap = 'round'; mx.beginPath();
    for (let x = 30; x <= 530; x += 4) { const y = 85 + amp * Math.sin((x - 30) / 500 * Math.PI * 5); x === 30 ? mx.moveTo(x, y) : mx.lineTo(x, y); } mx.stroke();
    if (f > 0) { mx.strokeStyle = 'rgba(62,124,192,.18)'; mx.lineWidth = 6; mx.beginPath(); for (let x = 30; x <= 530; x += 4) { const y = 85 + 52 * Math.sin((x - 30) / 500 * Math.PI * 5); x === 30 ? mx.moveTo(x, y) : mx.lineTo(x, y); } mx.stroke(); label(mx, '淡色：舊河道', 400, 155, { size: 11, color: '#5A7EA8' }); }
    label(mx, '上游（高）', 30, 16, { size: 12, bold: true }); label(mx, '下游（低）', 530, 16, { size: 12, bold: true, align: 'right' });
    // 下：流量歷線
    const h0 = hydro(L0), h1 = hydro(Lrel);
    const gx = 50, gy = 195, gw = 490, gh = 190;
    const peak0 = Math.max(...h0.out.map(p => p[1]));
    const Yv = q => gy + gh - q / (peak0 * 1.9) * gh, Xt = t => gx + t / 12 * gw;
    mx.strokeStyle = '#999'; mx.lineWidth = 1; mx.beginPath(); mx.moveTo(gx, gy); mx.lineTo(gx, gy + gh); mx.lineTo(gx + gw, gy + gh); mx.stroke();
    label(mx, '下游的水量', gx, gy - 8, { size: 12, color: '#555' }); label(mx, '時間 →', gx + gw, gy + gh + 14, { size: 12, color: '#555', align: 'right' });
    // 淹水警戒線
    const warn = peak0 * 1.15;
    mx.setLineDash([5, 4]); mx.strokeStyle = '#E53935'; mx.beginPath(); mx.moveTo(gx, Yv(warn)); mx.lineTo(gx + gw, Yv(warn)); mx.stroke(); mx.setLineDash([]);
    label(mx, '堤防高度（超過就淹水）', gx + gw, Yv(warn) - 10, { size: 11, color: '#E53935', align: 'right' });
    [[h0, '#9E9E9E'], [h1, '#1E88E5']].forEach(([h, c]) => { mx.strokeStyle = c; mx.lineWidth = 3; mx.beginPath(); h.out.forEach(([t, q], i) => i ? mx.lineTo(Xt(t), Yv(q)) : mx.moveTo(Xt(t), Yv(q))); mx.stroke(); });
    const p1 = Math.max(...h1.out.map(p => p[1]));
    const tp = o => o.out.reduce((a, b) => b[1] > a[1] ? b : a)[0];
    document.getElementById('t6meaR').innerHTML = `<div><b>${(Lrel / L0 * 100).toFixed(0)}%</b><span>河道長度（和原本比）</span></div>
      <div><b>${(L0 / Lrel).toFixed(1)} 倍</b><span>坡度</span></div>
      <div><b>${(h1.v / h0.v).toFixed(1)} 倍</b><span>流速</span></div>
      <div><b style="color:${p1 > warn ? '#C62828' : ''}">${(p1 / peak0).toFixed(1)} 倍</b><span>下游最高水量（洪峰）${p1 > warn ? '⚠ 溢堤' : ''}</span></div>
      <div><b>提早 ${Math.max(0, (tp(h0) - tp(h1)) / tp(h0) * 100).toFixed(0)}%</b><span>洪峰抵達時間</span></div>`;
  }
  registerSim('t6', { start: drawM, resize: drawM });
})();
