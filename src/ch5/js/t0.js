/* ===== 分頁 0：臺灣地景地圖 ===== */
(() => {
  const cv = document.getElementById('t0map'); if (!cv) return;
  const S = stage(cv, 500, 620), ctx = S.ctx;
  const P = (lon, lat) => [40 + (lon - 119.3) * 140, 30 + (25.45 - lat) * 154];
  const COAST = [[121.54,25.30],[121.62,25.27],[121.70,25.20],[121.75,25.14],[121.87,25.12],[122.00,25.01],[121.92,24.95],
    [121.83,24.86],[121.82,24.70],[121.86,24.60],[121.84,24.45],[121.72,24.25],[121.62,24.02],[121.57,23.80],[121.50,23.50],
    [121.40,23.15],[121.27,22.95],[121.15,22.75],[121.00,22.55],[120.90,22.35],[120.87,22.10],[120.85,21.90],[120.78,21.93],
    [120.72,21.95],[120.70,22.05],[120.62,22.30],[120.55,22.40],[120.40,22.50],[120.28,22.62],[120.18,22.90],[120.12,23.05],
    [120.07,23.15],[120.13,23.40],[120.18,23.60],[120.25,23.80],[120.32,24.05],[120.48,24.25],[120.60,24.45],[120.75,24.65],
    [120.90,24.85],[121.02,25.00],[121.15,25.08],[121.40,25.18]];
  const IMG = q => 'https://www.google.com/search?tbm=isch&q=' + encodeURIComponent(q);
  // k：分類；tab：在哪個分頁學
  const SPOTS = [
    { n: '老梅綠石槽', ll: [121.53, 25.27], k: 'wave', tab: 't5', d: '海浪長期沿著岩層的弱處侵蝕，切出一條條長溝（海蝕溝）。春天長滿綠藻，才變成「綠」石槽。', q: '老梅綠石槽' },
    { n: '富貴角 風稜石', ll: [121.56, 25.31], k: 'wind', tab: 't5', d: '強風吹起沙粒，像砂紙一樣把石頭磨出稜角。', q: '富貴角 風稜石', dx: 14, dy: -6 },
    { n: '野柳 女王頭', ll: [121.69, 25.21], k: 'wave', tab: 't5', d: '上面的岩石比較硬、下面比較軟，軟的被侵蝕得快——脖子愈來愈細（差異侵蝕）。', q: '野柳 女王頭' },
    { n: '九份・金瓜石', ll: [121.86, 25.10], k: 'rock', tab: 't7', d: '火成岩裡常藏有金屬礦產，這裡曾是臺灣重要的金礦區。', q: '金瓜石 黃金博物館 礦石' },
    { n: '基隆河 截彎取直', ll: [121.57, 25.07], k: 'river', tab: 't6', d: '為了防洪把彎曲河道拉直，結果流速變快、下游反而更容易淹水。', q: '基隆河 截彎取直 舊河道', dx: -10, dy: 10 },
    { n: '觀音 沙丘', ll: [121.08, 25.03], k: 'wind', tab: 't5', d: '風力減弱時，沙粒落下堆積成沙丘（風的沉積作用）。', q: '桃園 觀音 沙丘' },
    { n: '蘭陽溪', ll: [121.70, 24.63], k: 'river', tab: 't4', d: '課本圖 5-12：從源頭的巨石，到中下游的鵝卵石，再到出海口的泥沙。', q: '蘭陽溪 河口' },
    { n: '苗栗 火炎山', ll: [120.76, 24.43], k: 'rock', tab: 't7', d: '礫岩膠結差、容易崩落，裸露出紅色土壤，夕陽下像火焰。', q: '苗栗 火炎山' },
    { n: '太魯閣 大理岩峽谷', ll: [121.50, 24.17], k: 'rock', tab: 't7', d: '石灰岩經高溫高壓變成大理岩，再被立霧溪切出深峽谷。', q: '太魯閣 燕子口 大理岩' },
    { n: '日月潭', ll: [120.91, 23.86], k: 'water', tab: 't3', d: '臺灣最大的淡水湖。', q: '日月潭' },
    { n: '濁水溪 河川揚塵', ll: [120.42, 23.83], k: 'wind', tab: 't5', d: '冬天枯水期河床裸露，東北季風把細沙吹起來，下游空氣品質變差。', q: '濁水溪 揚塵', dx: -4, dy: 4 },
    { n: '雲林 地層下陷', ll: [120.32, 23.68], k: 'water', tab: 't2', d: '超抽地下水使地層被壓縮。高鐵經過這裡，所以特別受到關注。', q: '雲林 地層下陷 高鐵' },
    { n: '外傘頂洲', ll: [120.07, 23.47], k: 'wave', tab: 't6', d: '「會移動的國土」：沙洲面積愈來愈小，而且一直往南漂。', q: '外傘頂洲', dx: -16 },
    { n: '七股潟湖・馬沙溝', ll: [120.06, 23.15], k: 'wave', tab: 't6', d: '曾文溪上游蓋了水庫、海邊蓋了突堤，沙子變少，沙洲往陸地後退。', q: '七股 頂頭額汕 沙洲', dx: -16 },
    { n: '澎湖 柱狀玄武岩', ll: [119.58, 23.60], k: 'rock', tab: 't7', d: '岩漿噴出地表快速冷卻、收縮裂開，形成一根根六角形石柱。', q: '澎湖 大菓葉 柱狀玄武岩' },
    { n: '大武漁港 淤積', ll: [120.90, 22.35], k: 'wave', tab: 't6', d: '泥沙沉積得比被帶走的多，港口被淤塞，要一直用機具清淤。', q: '大武漁港 淤積' },
    { n: '墾丁 船帆石', ll: [120.86, 21.97], k: 'rock', tab: 't7', d: '珊瑚礁形成的石灰岩，高約 18 公尺。', q: '墾丁 船帆石' },
  ];
  const ICON = { wave: ['#1F6FB2', '🌊'], river: ['#2E8B57', '🏞'], wind: ['#C9A227', '💨'], rock: ['#8D6E63', '🪨'], water: ['#00A0B0', '💧'] };
  let filter = 'all', sel = null;

  function draw() {
    S.fit();
    ctx.clearRect(0, 0, S.W, S.H);
    // 海
    ctx.fillStyle = '#D8ECF5'; ctx.fillRect(0, 0, S.W, S.H);
    // 臺灣本島
    ctx.beginPath(); COAST.forEach(([lo, la], i) => { const [x, y] = P(lo, la); i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); }); ctx.closePath();
    const g = ctx.createLinearGradient(380, 0, 200, 0); g.addColorStop(0, '#B9D3A0'); g.addColorStop(1, '#DCE8C4');
    ctx.fillStyle = g; ctx.fill(); ctx.strokeStyle = '#6E8B5A'; ctx.lineWidth = 1.5; ctx.stroke();
    // 中央山脈示意
    ctx.save(); ctx.strokeStyle = 'rgba(110,90,60,.35)'; ctx.lineWidth = 12; ctx.lineCap = 'round';
    ctx.beginPath(); [[121.5, 24.85], [121.25, 24.2], [121.05, 23.5], [120.88, 22.6]].forEach(([lo, la], i) => { const [x, y] = P(lo, la); i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); }); ctx.stroke();
    ctx.restore();
    label(ctx, '中央山脈', ...P(121.2, 23.75), { color: 'rgba(90,70,40,.7)', size: 13, align: 'center' });
    // 澎湖
    ctx.fillStyle = '#C9DCAF'; [[119.58, 23.57, 9, 14], [119.65, 23.67, 6, 7], [119.50, 23.47, 5, 6]].forEach(([lo, la, rx, ry]) => {
      const [x, y] = P(lo, la); ctx.beginPath(); ctx.ellipse(x, y, rx, ry, .3, 0, Math.PI * 2); ctx.fill(); ctx.stroke(); });
    label(ctx, '澎湖', ...P(119.45, 23.85), { size: 13, color: '#456' });
    label(ctx, '臺灣海峽', 90, 330, { size: 14, color: '#6A93AA' });
    label(ctx, '太平洋', 445, 420, { size: 14, color: '#6A93AA' });
    // 指北
    arrow(ctx, 470, 80, 470, 40, '#456', 2); label(ctx, 'N', 470, 95, { align: 'center', size: 13, color: '#456' });
    // 地點
    SPOTS.forEach(s => {
      const [x, y] = P(...s.ll); s.x = x + (s.dx || 0) * .4; s.y = y + (s.dy || 0) * .4;
      const on = filter === 'all' || filter === s.k;
      const [c] = ICON[s.k];
      ctx.globalAlpha = on ? 1 : .18;
      if (s === sel) { ctx.fillStyle = 'rgba(255,210,122,.6)'; ctx.beginPath(); ctx.arc(s.x, s.y, 16, 0, 7); ctx.fill(); }
      ctx.fillStyle = c; ctx.strokeStyle = '#fff'; ctx.lineWidth = 2.5;
      ctx.beginPath(); ctx.arc(s.x, s.y, 8, 0, 7); ctx.fill(); ctx.stroke();
      if (on && (filter !== 'all' || s === sel)) label(ctx, s.n, s.x + (s.x > 330 ? -12 : 12), s.y, { size: 13, align: s.x > 330 ? 'right' : 'left', bg: 'rgba(255,255,255,.85)' });
      ctx.globalAlpha = 1;
    });
  }
  function info(s) {
    const [c, ic] = ICON[s.k];
    const tabBtn = document.querySelector(`nav.tabs button[data-tab="${s.tab}"]`);
    document.getElementById('t0info').innerHTML = `<h3 style="color:${c}">${ic} ${s.n}</h3><p>${s.d}</p>
      <div class="btnrow"><a class="btn ghost" href="${IMG(s.q)}" target="_blank" rel="noopener">📷 看照片（開新分頁）</a>
      <button class="btn" onclick="showTab('${s.tab}')">→ 到「${tabBtn ? tabBtn.textContent.replace(/^\d/, '') : ''}」學</button></div>`;
  }
  cv.addEventListener('pointerdown', e => {
    const p = S.pt(e);
    let best = null, bd = 22;
    SPOTS.forEach(s => { if (filter !== 'all' && filter !== s.k) return; const d = Math.hypot(s.x - p.x, s.y - p.y); if (d < bd) { bd = d; best = s; } });
    if (best) { sel = best; info(best); draw(); }
  });
  document.querySelectorAll('#t0f .chip').forEach(b => b.onclick = () => {
    document.querySelectorAll('#t0f .chip').forEach(x => x.classList.remove('on')); b.classList.add('on');
    filter = b.dataset.k; draw();
  });
  registerSim('t0', { start: draw });
})();
