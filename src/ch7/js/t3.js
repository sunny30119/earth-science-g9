/* ===== 第七章 分頁 3：地球自轉、直射斜射、四季模擬器、太陽軌跡 =====
   直射點緯度 δ = 傾角 × sin(2π(日−80)/365)（第 80 天約為春分）。
   白天長度 = 2·acos(−tanφ·tanδ) / 15° 小時；正午太陽高度 = 90° − |φ − δ|。 */
(() => {
  const D2R = Math.PI / 180;
  const MONTH = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  const dateStr = d => { let m = 0; d = Math.round(d); while (d >= MONTH[m]) { d -= MONTH[m]; m++; } return `${m + 1}/${d + 1}`; };

  /* ---------- 地球自轉 ---------- */
  const sc = document.getElementById('c7spin'); if (!sc) return;
  const SP = stage(sc, 360, 300), sx = SP.ctx;
  let rot = Math.PI, spinning = false;   // rot = 臺灣的經度角（相對太陽方向）
  function drawSpin() {
    SP.fit(); sx.fillStyle = '#05070F'; sx.fillRect(0, 0, SP.W, SP.H);
    const cx = 190, cy = 150, R = 110;
    for (let k = 0; k < 5; k++) arrow(sx, 8, 60 + k * 45, 60, 60 + k * 45, 'rgba(255,213,79,.8)', 2, 8);
    label(sx, '陽光', 10, 30, { color: '#FFD54F', size: 13, bold: true });
    sx.fillStyle = '#1B2A4A'; sx.beginPath(); sx.arc(cx, cy, R, 0, 7); sx.fill();
    sx.fillStyle = '#4A90E2'; sx.beginPath(); sx.arc(cx, cy, R, Math.PI / 2, Math.PI * 1.5); sx.fill();
    sx.fillStyle = '#fff'; sx.beginPath(); sx.arc(cx, cy, 5, 0, 7); sx.fill(); label(sx, '北極', cx + 8, cy - 8, { color: '#fff', size: 12 });
    arrow(sx, cx + 70, cy - 95, cx + 20, cy - 115, '#fff', 2, 9); label(sx, '逆時鐘', cx + 76, cy - 100, { color: '#fff', size: 12 });
    const tx = cx + Math.cos(rot) * R * .62, ty = cy + Math.sin(rot) * R * .62;
    sx.fillStyle = '#FF7043'; sx.beginPath(); sx.arc(tx, ty, 7, 0, 7); sx.fill(); label(sx, '臺灣', tx + 10, ty, { color: '#fff', size: 13, bold: true });
    // 時刻：rot = π 時正午（正對太陽）
    let h = ((Math.PI - rot) / (2 * Math.PI) * 24 + 12) % 24; if (h < 0) h += 24;
    const hh = Math.floor(h), mm = Math.floor((h - hh) * 60);
    const phase = h >= 5.5 && h < 6.5 ? '🌅 日出：太陽從東方升起' : h >= 17.5 && h < 18.5 ? '🌇 日落：太陽往西方落下' : h >= 6.5 && h < 17.5 ? '☀️ 白天' : '🌙 夜晚';
    document.getElementById('c7spinT').textContent = `臺灣時間約 ${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}　${phase}`;
  }
  const SL = loop(dt => { if (spinning) { rot -= dt * .8; } drawSpin(); });   // 畫面 y 向下，逆時鐘＝角度遞減
  document.getElementById('c7spinGo').onclick = e => { spinning = !spinning; e.target.textContent = spinning ? '⏸ 暫停' : '▶ 轉動'; };
  registerSim('t3', { start() { SL.start(); }, stop() { SL.stop(); } });

  /* ---------- 直射與斜射 ---------- */
  const TC = stage(document.getElementById('c7torch'), 360, 230), tcx = TC.ctx;
  const ang = bindRange('c7ang', v => v + '°' + (v === 90 ? '（直射）' : '（斜射）'), () => drawTorch());
  function drawTorch() {
    TC.fit(); tcx.clearRect(0, 0, TC.W, TC.H);
    const a = +ang.value * D2R, gy = 190, cx = 180, beam = 40, L = 130;
    // 方格紙
    tcx.fillStyle = '#F7F7F2'; tcx.fillRect(20, gy, 320, 30); tcx.strokeStyle = '#ccc';
    for (let x = 20; x <= 340; x += 20) { tcx.beginPath(); tcx.moveTo(x, gy); tcx.lineTo(x, gy + 30); tcx.stroke(); }
    const spread = beam / Math.sin(a);
    const g = tcx.createLinearGradient(0, 0, 0, gy); g.addColorStop(0, 'rgba(255,220,80,.85)'); g.addColorStop(1, `rgba(255,220,80,${.25 + .6 * Math.sin(a)})`);
    const dx = Math.cos(a), dy = -Math.sin(a);
    const p1 = [cx - spread / 2, gy], p2 = [cx + spread / 2, gy];
    const t1 = [cx - beam / 2 * Math.sin(a) + dx * L - beam / 2 * 0, gy - L * Math.sin(a)];
    const sxp = cx + dx * L, syp = gy + dy * L, nx = -dy, ny = dx;
    tcx.fillStyle = g; tcx.beginPath(); tcx.moveTo(sxp - nx * beam / 2, syp - ny * beam / 2); tcx.lineTo(sxp + nx * beam / 2, syp + ny * beam / 2); tcx.lineTo(...p2); tcx.lineTo(...p1); tcx.closePath(); tcx.fill();
    tcx.fillStyle = `rgba(255,200,0,${.25 + .7 * Math.sin(a)})`; tcx.fillRect(p1[0], gy, spread, 30);
    tcx.save(); tcx.translate(sxp, syp); tcx.rotate(Math.atan2(-dy, -dx)); tcx.fillStyle = '#455A64'; tcx.fillRect(-10, -26, 50, 52); tcx.restore();
    label(tcx, '手電筒', sxp, syp - 40, { align: 'center', size: 12, bold: true });
    document.getElementById('c7torchR').innerHTML = `<div><b>${(1 / Math.sin(a)).toFixed(1)} 倍</b><span>亮區面積（和直射比）</span></div><div><b>${(Math.sin(a) * 100).toFixed(0)}%</b><span>每單位面積接收的能量</span></div>`;
  }
  registerSim('t3', { start: drawTorch, resize: drawTorch });

  /* ---------- 四季模擬器 ---------- */
  const OC = stage(document.getElementById('c7orbit'), 380, 340), ox = OC.ctx;
  const SC = stage(document.getElementById('c7side'), 380, 340), cx2 = SC.ctx;
  const day = bindRange('c7day', v => dateStr(v), () => drawSeason());
  const tilt = bindRange('c7tilt', v => v + '°' + (v === 23.5 ? '（真實值）' : ''), () => drawSeason());
  const decl = d => +tilt.value * Math.sin(2 * Math.PI * (d - 80) / 365);
  const dayLen = (phi, del) => { const x = -Math.tan(phi * D2R) * Math.tan(del * D2R); return x <= -1 ? 24 : x >= 1 ? 0 : 2 * Math.acos(x) / D2R / 15; };
  const dist = d => 1.496 * (1 - .0167 * Math.cos(2 * Math.PI * (d - 3) / 365));   // 億公里
  function drawSeason() {
    const d = +day.value, del = decl(d);
    // 俯視公轉
    OC.fit(); ox.fillStyle = '#05070F'; ox.fillRect(0, 0, OC.W, OC.H);
    const c = [190, 170], Ro = 120;
    ox.strokeStyle = 'rgba(255,255,255,.25)'; ox.beginPath(); ox.ellipse(c[0], c[1], Ro, Ro * .98, 0, 0, 7); ox.stroke();
    ox.fillStyle = '#FFD54F'; ox.beginPath(); ox.arc(...c, 16, 0, 7); ox.fill();
    [[173, '夏至'], [266, '秋分'], [356, '冬至'], [80, '春分']].forEach(([dd, n]) => { const a = Math.PI + 2 * Math.PI * (dd - 173) / 365; label(ox, n, c[0] + Math.cos(a) * (Ro + 26), c[1] - Math.sin(a) * (Ro + 22), { color: '#aaa', size: 12, align: 'center' }); });
    const a = Math.PI + 2 * Math.PI * (d - 173) / 365, ex = c[0] + Math.cos(a) * Ro, ey = c[1] - Math.sin(a) * Ro;
    ox.fillStyle = '#4A90E2'; ox.beginPath(); ox.arc(ex, ey, 11, 0, 7); ox.fill();
    // 自轉軸（俯視投影永遠指向同一方向：右邊）
    const tl = 14 + +tilt.value * .5; arrow(ox, ex - tl * .3, ey, ex + tl, ey, '#fff', 2, 7);
    label(ox, '北極', ex + tl + 4, ey, { color: '#fff', size: 11 });
    label(ox, '北極上空看：逆時鐘公轉，軸指向不變', 190, 330, { color: '#999', size: 12, align: 'center' });
    { const ap = Math.PI + 2 * Math.PI * (3 - 173) / 365, px = c[0] + Math.cos(ap) * Ro, py = c[1] - Math.sin(ap) * Ro; ox.fillStyle = '#90A4AE'; ox.beginPath(); ox.arc(px, py, 3, 0, 7); ox.fill(); label(ox, '1 月初最靠近太陽', px + 8, py + 14, { color: '#90A4AE', size: 12 }); }
    // 側視：太陽在左
    SC.fit(); cx2.fillStyle = '#05070F'; cx2.fillRect(0, 0, SC.W, SC.H);
    const C = [210, 170], R = 120, dr = del * D2R;
    for (let k = 0; k < 7; k++) arrow(cx2, 6, 50 + k * 40, 70, 50 + k * 40, 'rgba(255,213,79,.7)', 2, 8);
    cx2.fillStyle = '#1B2A4A'; cx2.beginPath(); cx2.arc(...C, R, 0, 7); cx2.fill();
    cx2.save(); cx2.beginPath(); cx2.arc(...C, R, 0, 7); cx2.clip(); cx2.fillStyle = '#4A90E2'; cx2.fillRect(C[0] - R, C[1] - R, R, 2 * R); cx2.restore();
    const ax = [-Math.sin(dr), -Math.cos(dr)], pp = [Math.cos(dr), -Math.sin(dr)];
    const latLine = (phi, col, w, txt) => {
      const s = Math.sin(phi * D2R), co = Math.cos(phi * D2R);
      const m = [C[0] + R * s * ax[0], C[1] + R * s * ax[1]];
      cx2.strokeStyle = col; cx2.lineWidth = w; cx2.beginPath(); cx2.moveTo(m[0] - R * co * pp[0], m[1] - R * co * pp[1]); cx2.lineTo(m[0] + R * co * pp[0], m[1] + R * co * pp[1]); cx2.stroke();
      if (txt) label(cx2, txt, m[0] + R * co * pp[0] + 6, m[1] + R * co * pp[1], { color: col, size: 11 });
      return [m[0] - R * co * pp[0], m[1] - R * co * pp[1]];
    };
    const T = +tilt.value;   // 回歸線的緯度＝傾角；極圈＝90°−傾角
    if (T > 0) { latLine(90 - T, 'rgba(255,255,255,.45)', 1, '北極圈'); latLine(-(90 - T), 'rgba(255,255,255,.45)', 1, '南極圈');
    latLine(T, 'rgba(255,170,120,.7)', 1, '北回歸線'); latLine(-T, 'rgba(255,170,120,.7)', 1, '南回歸線'); }
    latLine(0, 'rgba(255,255,255,.8)', 1.5, '赤道');
    const tw = latLine(23.5, 'rgba(0,0,0,0)', 0);
    cx2.fillStyle = '#FF7043'; cx2.beginPath(); cx2.arc(...tw, 5, 0, 7); cx2.fill(); label(cx2, '臺灣（正午）', tw[0] + 8, tw[1] + 12, { color: '#FFAB91', size: 11, bold: true });
    cx2.strokeStyle = '#fff'; cx2.lineWidth = 2; cx2.beginPath(); cx2.moveTo(C[0] + ax[0] * (R + 22), C[1] + ax[1] * (R + 22)); cx2.lineTo(C[0] - ax[0] * (R + 22), C[1] - ax[1] * (R + 22)); cx2.stroke();
    label(cx2, 'N', C[0] + ax[0] * (R + 32), C[1] + ax[1] * (R + 32), { color: '#fff', size: 12, align: 'center', bold: true });
    // 直射點
    arrow(cx2, 20, C[1], C[0] - R - 2, C[1], '#FFD54F', 4, 12);
    label(cx2, `直射：${del >= 0 ? '北' : '南'}緯 ${Math.abs(del).toFixed(1)}°`, 22, C[1] - 16, { color: '#FFD54F', size: 13, bold: true });
    const N = d >= 80 && d < 173 ? '春' : d >= 173 && d < 266 ? '夏' : d >= 266 && d < 356 ? '秋' : '冬';
    const Sd = { 春: '秋', 夏: '冬', 秋: '春', 冬: '夏' }[N];
    const arc = dayLen(70, del);
    document.getElementById('c7seasonR').innerHTML = `
      <div><b>${N}季 / ${Sd}季</b><span>北半球 / 南半球</span></div>
      <div><b>${(90 - Math.abs(23.5 - del)).toFixed(1)}°</b><span>嘉義正午太陽高度</span></div>
      <div><b>${dayLen(23.5, del).toFixed(1)} 小時</b><span>臺灣白天長度</span></div>
      <div><b>${dayLen(-34, del).toFixed(1)} 小時</b><span>雪梨（南緯 34°）白天長度</span></div>
      <div><b>${arc >= 24 ? '永晝' : arc <= 0 ? '永夜' : arc.toFixed(1) + ' 小時'}</b><span>北緯 70°（北極圈內）</span></div>
      <div><b>${dist(d).toFixed(3)} 億公里</b><span>🟣 地球到太陽的距離</span></div>`;
    drawSky(del);
  }
  document.querySelectorAll('#p-t3 [data-d]').forEach(b => b.onclick = () => { day.value = b.dataset.d; day.dispatchEvent(new Event('input')); });

  /* ---------- 太陽軌跡（嘉義） ---------- */
  const KC = stage(document.getElementById('c7sky'), 760, 300), kx = KC.ctx;
  function sunPath(del) {
    const phi = 23.5 * D2R, dl = del * D2R, pts = [];
    for (let H = -180; H <= 180; H += 2) {
      const h = H * D2R, alt = Math.asin(Math.sin(phi) * Math.sin(dl) + Math.cos(phi) * Math.cos(dl) * Math.cos(h));
      const az = Math.atan2(Math.sin(h), Math.cos(h) * Math.sin(phi) - Math.tan(dl) * Math.cos(phi)) / D2R + 180;   // 0=北、90=東、180=南
      if (alt > -.02) pts.push([az, alt / D2R]);
    }
    return pts;
  }
  function drawSky(del) {
    KC.fit(); kx.clearRect(0, 0, KC.W, KC.H);
    // 天空半球：觀察者站在南邊往北看，東在右、西在左、南在前（下）、北在後（上）
    const cx = 380, cy = 200, R = 190, k = .3;
    const P3 = (az, alt) => { const a = az * D2R, h = alt * D2R, e = Math.cos(h) * Math.sin(a), n = Math.cos(h) * Math.cos(a), u = Math.sin(h); return [cx + R * e, cy - R * u * .9 - R * n * k]; };
    kx.fillStyle = '#EAF4FC'; kx.fillRect(0, 0, KC.W, KC.H);
    kx.fillStyle = '#C5E1A5'; kx.beginPath(); kx.ellipse(cx, cy, R, R * k, 0, 0, 7); kx.fill(); kx.strokeStyle = '#7CB342'; kx.stroke();
    kx.strokeStyle = 'rgba(0,0,0,.12)'; kx.beginPath(); kx.ellipse(cx, cy, R, R * .9, 0, Math.PI, 2 * Math.PI); kx.stroke();
    [['北', 0], ['東', 90], ['南', 180], ['西', 270]].forEach(([n, az]) => { const [x, y] = P3(az, 0); label(kx, n, x + (az === 90 ? 14 : az === 270 ? -14 : 0), y + (az === 180 ? 14 : az === 0 ? -10 : 0), { align: 'center', size: 14, bold: true, color: '#33691E' }); });
    kx.fillStyle = '#5D4037'; kx.fillRect(cx - 2, cy - 14, 4, 14); label(kx, '你', cx + 6, cy - 4, { size: 11 });
    const tl = +tilt.value;
    [[tl, '#BDBDBD', '夏至'], [-tl, '#BDBDBD', '冬至'], [del, '#F9A825', '']].forEach(([dd, col, nm], i) => {
      const p = sunPath(dd); if (!p.length) return;
      kx.strokeStyle = col; kx.lineWidth = i === 2 ? 4 : 2; kx.beginPath(); p.forEach(([az, al], j) => { const [x, y] = P3(az, al); j ? kx.lineTo(x, y) : kx.moveTo(x, y); }); kx.stroke();
      if (nm) { const top = p.reduce((a, b) => b[1] > a[1] ? b : a); const [x, y] = P3(top[0], top[1]); label(kx, nm, x + 24, y, { size: 11, color: '#888' }); }
      if (i === 2) { const top = p.reduce((a, b) => b[1] > a[1] ? b : a), [x, y] = P3(top[0], top[1]); kx.fillStyle = '#FFB300'; kx.beginPath(); kx.arc(x, y, 10, 0, 7); kx.fill(); label(kx, `正午太陽高度 ${top[1].toFixed(0)}°`, x + 14, y - 12, { size: 12, bold: true });
        const rise = p[0][0], [rx, ry] = P3(rise, 0); kx.fillStyle = '#E65100'; kx.beginPath(); kx.arc(rx, ry, 5, 0, 7); kx.fill(); label(kx, `日出：${rise < 88 ? '東偏北' : rise > 92 ? '東偏南' : '正東'}`, rx + 8, ry + 14, { size: 12, bold: true, color: '#E65100', bg: 'rgba(255,255,255,.8)' }); }
    });
  }
  registerSim('t3', { start: drawSeason, resize: drawSeason });
})();
