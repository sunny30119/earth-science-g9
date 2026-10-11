/* ===== 第六章 分頁 6：臺灣板塊時光機、抬升計算器、內外營力分類 ===== */
(() => {
  const cv = document.getElementById('c6tw'); if (!cv) return;
  const S = stage(cv, 440, 560), ctx = S.ctx;
  const L0 = 119.6, L1 = 122.9, A0 = 21.6, A1 = 25.6, KMX = 111 * Math.cos(23.5 * Math.PI / 180);
  const P = (lo, la) => [(lo - L0) / (L1 - L0) * S.W, (A1 - la) / (A1 - A0) * S.H];
  const RIFT = [[121.62, 24.0], [121.45, 23.6], [121.3, 23.2], [121.15, 22.78]];   // 花東縱谷
  const COAST_RANGE = [[121.62, 24.0], [121.7, 23.9], [121.55, 23.4], [121.4, 23.0], [121.2, 22.75], [121.15, 22.78], [121.3, 23.2], [121.45, 23.6]];
  const VOL = [
    ['大屯火山群', 121.55, 25.18, '北部的火山群，有噴氣孔、溫泉、硫磺。持續有科學監測。', 'EU'],
    ['基隆火山群', 121.78, 25.12, '九份、金瓜石一帶，火山活動帶來金礦等金屬礦產。', 'EU'],
    ['龜山島', 121.95, 24.84, '宜蘭外海的火山島，像一隻浮在海上的烏龜。', 'EU'],
    ['綠島', 121.49, 22.66, '菲律賓海板塊上的火山島，屬於「呂宋島弧」的一部分，正跟著板塊往西北移動。', 'PH'],
    ['蘭嶼', 121.55, 22.05, '和綠島一樣是島弧上的火山島，一直被板塊載著往臺灣靠近。', 'PH'],
  ];
  const ago = bindRange('c6ago', v => v === 0 ? '現在' : (v * 2) + ' 萬年前', () => draw());
  function shift() { const yrs = +ago.value * 2e4, km = yrs * 0.08 / 1000; return [km * Math.cos(Math.PI / 4) / KMX, -km * Math.sin(Math.PI / 4) / 111]; }   // 過去在東南方
  function draw() {
    S.fit(); ctx.clearRect(0, 0, S.W, S.H);
    ctx.fillStyle = '#4F86C6'; ctx.fillRect(0, 0, S.W, S.H);
    // 板塊底色
    ctx.fillStyle = 'rgba(255,255,255,.06)'; ctx.beginPath(); ctx.moveTo(0, 0);
    const rp = RIFT.map(p => P(...p)); ctx.lineTo(rp[0][0] + 120, 0); rp.forEach(([x, y]) => ctx.lineTo(x, y)); ctx.lineTo(rp[rp.length - 1][0] - 60, S.H); ctx.lineTo(0, S.H); ctx.fill();
    label(ctx, '歐亞板塊', 40, 60, { size: 16, bold: true, color: '#fff' });
    label(ctx, '菲律賓海板塊', 300, 470, { size: 16, bold: true, color: '#fff' });
    // 臺灣本島（歐亞板塊那一側不動）
    ctx.fillStyle = '#B9D3A0'; ctx.beginPath(); TW_COAST.forEach(([lo, la], i) => { const [x, y] = P(lo, la); i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); }); ctx.closePath(); ctx.fill();
    // 中央山脈
    ctx.strokeStyle = 'rgba(110,90,60,.45)'; ctx.lineWidth = 10; ctx.lineCap = 'round'; ctx.beginPath(); [[121.5, 24.85], [121.25, 24.2], [121.05, 23.5], [120.88, 22.6]].forEach(([lo, la], i) => { const [x, y] = P(lo, la); i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); }); ctx.stroke();
    label(ctx, '中央山脈', ...P(120.95, 23.9), { size: 12, color: '#5D4037', bold: true, align: 'center' });
    // 海岸山脈＋綠島蘭嶼（菲律賓海板塊上，回到過去就往東南移）
    const [dx, dy] = shift(), a = +ago.value;
    if (a > 0) { ctx.save(); ctx.globalAlpha = .35; ctx.fillStyle = '#E8C98F'; ctx.beginPath(); COAST_RANGE.forEach(([lo, la], i) => { const [x, y] = P(lo, la); i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); }); ctx.closePath(); ctx.fill(); ctx.restore(); }
    ctx.fillStyle = '#D9B66F'; ctx.beginPath(); COAST_RANGE.forEach(([lo, la], i) => { const [x, y] = P(lo + dx, la + dy); i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); }); ctx.closePath(); ctx.fill();
    label(ctx, '海岸山脈', ...P(121.62 + dx, 23.35 + dy), { size: 12, color: '#3E2723', bold: true, bg: 'rgba(255,255,255,.75)' });
    // 縱谷（板塊交界）
    ctx.strokeStyle = '#E53935'; ctx.lineWidth = 3; ctx.setLineDash([6, 4]); ctx.beginPath(); rp.forEach(([x, y], i) => i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)); ctx.stroke(); ctx.setLineDash([]);
    label(ctx, '花東縱谷＝板塊交界', ...P(121.0, 22.95), { size: 12, color: '#B71C1C', bold: true, bg: 'rgba(255,255,255,.85)', align: 'right' });
    // 推擠方向
    arrow(ctx, ...P(122.6, 22.6), ...P(122.25, 22.95), '#fff', 4, 14);
    label(ctx, '每年 7～8 公分', ...P(122.45, 22.45), { size: 12, color: '#fff', bold: true, align: 'center' });
    // 火山
    VOL.forEach(v => {
      const [lo, la] = v[4] === 'PH' ? [v[1] + dx, v[2] + dy] : [v[1], v[2]];
      const [x, y] = P(lo, la); v.x = x; v.y = y;
      ctx.fillStyle = '#BF360C'; ctx.beginPath(); ctx.moveTo(x, y - 9); ctx.lineTo(x + 8, y + 6); ctx.lineTo(x - 8, y + 6); ctx.closePath(); ctx.fill();
      label(ctx, v[0], x + 10, y + (v[0] === '基隆火山群' ? 14 : v[0] === '大屯火山群' ? -8 : 0), { size: 12, bold: true, color: '#fff' });
    });
    const yrs = a * 2e4, km = yrs * .08 / 1000;
    document.getElementById('c6twR').innerHTML = `<div><b>${a === 0 ? '現在' : (a * 2) + ' 萬年前'}</b><span>時間</span></div><div><b>${km.toFixed(km < 10 ? 1 : 0)} 公里</b><span>綠島、蘭嶼當時離現在位置多遠</span></div>` + (a > 0 ? '<div style="grid-column:1/-1"><span>那時它們還是海上的一串火山島（島弧），不是一座完整的山脈漂過來</span></div>' : '');
  }
  cv.addEventListener('pointerdown', e => {
    const p = S.pt(e); const v = VOL.find(v => Math.hypot(v.x - p.x, v.y - p.y) < 18);
    if (v) document.getElementById('c6twTxt').innerHTML = `<b>▲ ${v[0]}</b>（${v[4] === 'PH' ? '菲律賓海板塊' : '歐亞板塊'}上）<br>${v[3]}`;
  });
  registerSim('t6', { start: draw, resize: draw });

  /* ---------- 抬升計算器 ---------- */
  const uc = document.getElementById('c6up');
  const U = stage(uc, 420, 260), ux = U.ctx;
  const rate = bindRange('c6rate', v => v + ' 公釐', () => drawU());
  const ero = bindRange('c6ero', v => v + ' 公釐', () => drawU());
  const yrs = bindRange('c6yrs', v => Math.round(Math.pow(v / 100, 2) * 300) + ' 萬年', () => drawU());
  function drawU() {
    U.fit(); ux.clearRect(0, 0, U.W, U.H);
    const Y = Math.pow(+yrs.value / 100, 2) * 3e6, net = (+rate.value - +ero.value) / 1000, h = Math.max(0, net * Y);
    const sky = ux.createLinearGradient(0, 0, 0, U.H); sky.addColorStop(0, '#CFE7F7'); sky.addColorStop(1, '#F4F9FC'); ux.fillStyle = sky; ux.fillRect(0, 0, U.W, U.H);
    const base = 230, scale = 180 / 5000, hp = Math.min(h, 6500) * scale;
    // 玉山參考線
    const yy = base - 3952 * scale; ux.setLineDash([5, 4]); ux.strokeStyle = '#6D4C41'; ux.beginPath(); ux.moveTo(0, yy); ux.lineTo(U.W, yy); ux.stroke(); ux.setLineDash([]);
    label(ux, '玉山 3952 公尺', U.W - 6, yy - 10, { align: 'right', size: 12, bold: true, color: '#6D4C41' });
    ux.fillStyle = '#8D9F6A'; ux.beginPath(); ux.moveTo(40, base); ux.lineTo(210, base - hp); ux.lineTo(240, base - hp * .92); ux.lineTo(380, base); ux.fill();
    if (h > 3000) { ux.fillStyle = '#fff'; ux.beginPath(); ux.moveTo(210 - 18, base - hp + 18 * hp / 170); ux.lineTo(210, base - hp); ux.lineTo(228, base - hp + 16 * hp / 170); ux.fill(); }
    ux.fillStyle = '#4F86C6'; ux.fillRect(0, base, U.W, U.H - base);
    label(ux, `${Math.round(h).toLocaleString()} 公尺`, 210, Math.max(16, base - hp - 14), { align: 'center', bold: true, size: 15, bg: 'rgba(255,255,255,.85)' });
    const need = net > 0 ? 3952 / net : Infinity;
    document.getElementById('c6upR').innerHTML = `<div><b>${(net * 1000).toFixed(0)} 公釐/年</b><span>淨抬升（抬升 − 侵蝕）</span></div>
      <div><b>${need === Infinity ? '長不高！' : Math.round(need / 1e4).toLocaleString() + ' 萬年'}</b><span>長到玉山的高度需要</span></div>
      <div><b>${(+rate.value / 10).toFixed(1)} 公分</b><span>一年的抬升（比指甲長得還慢好幾倍）</span></div>`;
  }
  registerSim('t6', { start: drawU, resize: drawU });

  mountSort(document.getElementById('c6io'), ['內營力（使地表起伏）', '外營力（使地表趨平）'], [
    ['板塊運動', 0], ['火山活動', 0], ['褶皺與斷層', 0], ['河流', 1, '侵蝕、搬運、沉積。'], ['風', 1], ['冰川', 1], ['海浪', 1], ['地震把海岸抬高 4 公尺（日本能登）', 0, '地殼變動造成的隆起，是內營力。'],
  ]);
})();
