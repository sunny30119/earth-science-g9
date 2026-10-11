/* ===== 第六章 分頁 0：海平面下降 → 臺灣海峽變陸橋 =====
   水深為示意：海峽大多 50–80 m，澎湖水道較深，臺灣東邊與南邊急速變深。 */
(() => {
  const cv = document.getElementById('c6t0'); if (!cv) return;
  const S = stage(cv, 520, 560), ctx = S.ctx;
  const L0 = 116.6, L1 = 122.4, A0 = 21.6, A1 = 27.0;
  const P = (lo, la) => [(lo - L0) / (L1 - L0) * S.W, (A1 - la) / (A1 - A0) * S.H];
  const CHINA = [[116.6, 27.0], [120.6, 27.0], [120.3, 26.9], [119.9, 26.5], [119.65, 25.95], [119.45, 25.45], [119.0, 25.2], [118.65, 24.8], [118.15, 24.5], [117.7, 24.1], [117.2, 23.65], [116.6, 23.3]];
  const PENGHU = [119.58, 23.57];
  function depth(lo, la) {
    if (inPoly([lo, la], TW_COAST) || inPoly([lo, la], CHINA)) return -1;
    if (Math.hypot((lo - PENGHU[0]) * 1.2, la - PENGHU[1]) < .12) return -1;
    // 臺灣東側：很快變深
    const eastOf = lo > 121.9 || (lo > 121.0 && la < 23.6 && lo > 121.3) ;
    if (eastOf) return 600;
    let d = 55 + 15 * Math.sin(lo * 3.1 + la * 2.3);            // 海峽主體
    const ch = Math.hypot((lo - 119.95) * 2.2, (la - 23.15) * 1.1);   // 澎湖水道
    if (ch < .45) d += 70 * (1 - ch / .45);
    if (la < 22.9) d += (22.9 - la) * 260;                         // 往南海變深
    if (la > 25.6 && lo > 121.0) d += (la - 25.6) * 80;
    return d;
  }
  const sea = bindRange('c6sea', v => v + ' 公尺', () => draw());
  let grid = null;
  const G = 4;
  function build() {
    grid = [];
    for (let y = 0; y < S.H; y += G) for (let x = 0; x < S.W; x += G) {
      const lo = L0 + (x + G / 2) / S.W * (L1 - L0), la = A1 - (y + G / 2) / S.H * (A1 - A0);
      grid.push([x, y, depth(lo, la)]);
    }
  }
  function draw() {
    S.fit(); if (!grid) build();
    const drop = +sea.value;
    let exposed = 0, total = 0;
    grid.forEach(([x, y, d]) => {
      if (d < 0) ctx.fillStyle = '#B9D3A0';
      else if (d <= drop) { ctx.fillStyle = '#E3C98F'; exposed++; }
      else { const k = clamp((d - drop) / 200, 0, 1); ctx.fillStyle = `rgb(${Math.round(lerp(140, 40, k))},${Math.round(lerp(190, 90, k))},${Math.round(lerp(225, 160, k))})`; }
      if (d >= 0 && x > 120 && x < 380 && y > 150 && y < 430) total++;
      ctx.fillRect(x, y, G + .6, G + .6);
    });
    // 海岸線
    ctx.strokeStyle = '#5D7B48'; ctx.lineWidth = 1.5;
    [TW_COAST, CHINA].forEach(poly => { ctx.beginPath(); poly.forEach(([lo, la], i) => { const [x, y] = P(lo, la); i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); }); if (poly === TW_COAST) ctx.closePath(); ctx.stroke(); });
    label(ctx, '臺灣', ...P(120.95, 23.7), { bold: true, size: 15, align: 'center' });
    label(ctx, '亞洲大陸（福建）', ...P(117.6, 25.6), { bold: true, size: 14, align: 'center' });
    label(ctx, '澎湖', ...P(119.45, 23.85), { size: 13, align: 'center' });
    if (drop < 100) label(ctx, '澎湖水道', ...P(119.95, 23.0), { size: 12, align: 'center', color: '#fff' });
    // 動物走過來
    if (drop >= 80) {
      const pts = [[118.4, 24.6], [119.0, 24.1], [119.6, 23.7], [120.1, 23.4], [120.4, 23.3]];
      ctx.setLineDash([6, 5]); ctx.strokeStyle = '#8D4F1E'; ctx.lineWidth = 2.5; ctx.beginPath(); pts.forEach(([lo, la], i) => { const [x, y] = P(lo, la); i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); }); ctx.stroke(); ctx.setLineDash([]);
      label(ctx, '🦣🐃🦌 走過來！', ...P(118.9, 23.8), { size: 15, bold: true, bg: 'rgba(255,255,255,.85)' });
    }
    const txt = drop < 40 ? '現在的樣子：臺灣海峽是一片海。' : drop < 80 ? '海峽的淺處開始露出來，但還連不起來。' : drop < 120 ? '<b>陸橋出現了！</b>亞洲大陸和臺灣連在一起，動物可以走過來。' : '冰河時期最冷的時候：澎湖水道也幾乎露出來了。後來冰融化、海水回升，這些動物的骨頭就留在海底，被漁網撈起來。';
    document.getElementById('c6t0Txt').innerHTML = txt;
    document.getElementById('c6t0R').innerHTML = `<div><b>−${drop} m</b><span>海平面（和現在比）</span></div><div><b>${drop >= 120 ? '約 2 萬年前' : drop >= 80 ? '冰河時期' : '接近現在'}</b><span>大約像哪個時候</span></div>`;
  }
  registerSim('t0', { start: draw, resize: draw });
})();
