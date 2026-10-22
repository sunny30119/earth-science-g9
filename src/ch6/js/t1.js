/* ===== 第六章 分頁 1：地球分層（剖面＋放大鏡）、地震波陰影區 =====
   半徑（公里）：地表 6370；地殼厚 35（大陸）；地函底 2900 深；外核 2900–5150 深；內核 5150 深以下。 */
(() => {
  const cv = document.getElementById('c6earth'); if (!cv) return;
  const S = stage(cv, 520, 420), ctx = S.ctx;
  const R = 6370;
  const LAYERS = {
    comp: [['地殼', 0, 35, '#8D6E63', '地球最外層的薄殼。<b>大陸地殼</b>較厚、密度小、以花岡岩為主；<b>海洋地殼</b>較薄、密度大、以玄武岩為主。'],
      ['地函', 35, 2900, '#E07B39', '位在地殼下方，由密度更大的岩石組成，主要元素為<b>氧、矽、鎂</b>。注意：地函大部分是<b>固體</b>！'],
      ['地核', 2900, 6370, '#F2C14E', '地球最內層，密度最大，主要由<b>鐵、鎳</b>等金屬組成。🟣 加深：外核是液體、內核是固體。']],
    mech: [['岩石圈', 0, 100, '#5D4037', '從地表到約 100 公里深，包含<b>地殼＋部分地函</b>，由堅硬的岩石組成。<b>板塊就是岩石圈</b>裂成的一塊塊。'],
      ['軟流圈', 100, 350, '#C0504D', '在岩石圈下方、地函之中，是具<b>可塑性</b>、移動極緩慢的物質。板塊就「漂」在它上面緩慢移動。'],
      ['其餘的地函', 350, 2900, '#E8A26A', '（課本不細分）'], ['地核', 2900, 6370, '#F2C14E', '鐵、鎳組成。']],
  };
  let view = 'comp', sel = null;
  const zoom = bindRange('c6zoom', v => v < 2 ? '整顆地球' : '× ' + Math.round(Math.pow(10, v / 100 * 2.6)), () => draw());
  // 把「深度」換成畫面座標：以地表頂點 (cx, top) 為放大中心
  function geom() {
    const z = Math.pow(10, +zoom.value / 100 * 2.6), r0 = 190;
    const cx = 260, cy0 = 215;
    const scale = r0 / R * z;
    const top = cy0 - r0;                               // 地表頂點的畫面位置（放大時固定在這）
    const cy = top + R * scale;
    return { z, scale, cx, cy, top };
  }
  function draw() {
    S.fit(); ctx.clearRect(0, 0, S.W, S.H);
    ctx.fillStyle = '#0E1A2B'; ctx.fillRect(0, 0, S.W, S.H);
    const g = geom(), Ls = LAYERS[view];
    ctx.save(); ctx.beginPath(); ctx.rect(0, 0, S.W, S.H); ctx.clip();
    // 由外往內畫圓（只畫下半部扇形會比較像切開；這裡畫完整的圓再切掉右上四分之一）
    Ls.forEach(([n, d0, d1, c]) => {
      ctx.fillStyle = c; ctx.beginPath(); ctx.arc(g.cx, g.cy, (R - d0) * g.scale, 0, Math.PI * 2); ctx.fill();
      if (sel === n) { ctx.strokeStyle = '#FFD27A'; ctx.lineWidth = 4; ctx.stroke(); }
    });
    if (view === 'comp') { ctx.fillStyle = '#FFE38A'; ctx.beginPath(); ctx.arc(g.cx, g.cy, 1220 * g.scale, 0, 7); ctx.fill(); }
    // 切開的那一角改成地表外觀（藍綠色）
    if (g.z < 3) { ctx.fillStyle = '#2F6E9E'; ctx.beginPath(); ctx.moveTo(g.cx, g.cy); ctx.arc(g.cx, g.cy, R * g.scale, -Math.PI / 2, 0); ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#5E9E5A'; [[.3, -.5, 30], [.6, -.75, 22], [.15, -.2, 18]].forEach(([fx, fy, rr]) => { ctx.beginPath(); ctx.arc(g.cx + fx * R * g.scale, g.cy + fy * R * g.scale, rr, 0, 7); ctx.fill(); }); }
    // 鑽井（約 12 公里）
    const wellPx = 12 * g.scale;
    ctx.strokeStyle = '#fff'; ctx.lineWidth = Math.max(2, 4); ctx.beginPath(); ctx.moveTo(g.cx - 40, g.top); ctx.lineTo(g.cx - 40, g.top + Math.max(wellPx, .5)); ctx.stroke();
    ctx.fillStyle = '#fff'; ctx.fillRect(g.cx - 48, g.top - 14, 16, 14);
    label(ctx, wellPx < 6 ? '← 最深的鑽井（12 公里）短到看不見！' : '最深的鑽井 12 公里', g.cx - 30, g.top - 8, { size: 13, color: '#fff', bold: true });
    // 層名
    Ls.forEach(([n, d0, d1]) => {
      const mid = (d0 + Math.min(d1, 6370)) / 2, y = g.top + mid * g.scale;
      const dh = (Math.min(d1, 6370) - d0) * g.scale;
      if (y > 0 && y < S.H && dh > 14) label(ctx, `${n}`, g.cx + 12, Math.min(y, S.H - 14), { size: 14, bold: true, color: '#fff', bg: 'rgba(0,0,0,.35)' });
    });
    // 深度尺
    if (g.z > 3) {
      const kmPerPx = 1 / g.scale; const nice = [1, 2, 5, 10, 20, 50, 100, 200, 500, 1000].find(k => k / kmPerPx > 60) || 1000;
      ctx.strokeStyle = '#fff'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(20, S.H - 20); ctx.lineTo(20 + nice / kmPerPx, S.H - 20); ctx.stroke();
      label(ctx, nice + ' 公里', 20, S.H - 34, { size: 12, color: '#fff' });
    }
    ctx.restore();
  }
  cv.addEventListener('pointerdown', e => {
    const p = S.pt(e), g = geom(); const r = Math.hypot(p.x - g.cx, p.y - g.cy) / g.scale; const d = R - r;
    if (d < 0) return;
    const L = LAYERS[view].find(([, d0, d1]) => d >= d0 && d < d1); if (!L) return;
    sel = L[0];
    document.getElementById('c6layer').innerHTML = `<b style="font-size:1.1rem">${L[0]}</b>（深度約 ${L[1]}～${L[2] >= 6370 ? '6370（地心）' : L[2]} 公里）<br>${L[4]}`;
    draw();
  });
  document.querySelectorAll('#c6view .chip').forEach(b => b.onclick = () => { document.querySelectorAll('#c6view .chip').forEach(x => x.classList.remove('on')); b.classList.add('on'); view = b.dataset.v; sel = null; draw(); });
  registerSim('t1', { start: draw, resize: draw });

  /* ---------- 地震波 X 光 ---------- */
  const wc = document.getElementById('c6wave');
  const W = stage(wc, 420, 420), wx = W.ctx;
  let wtype = 'S';
  const solid = document.getElementById('c6solid');
  function wdraw() {
    W.fit(); wx.clearRect(0, 0, W.W, W.H); wx.fillStyle = '#0E1A2B'; wx.fillRect(0, 0, W.W, W.H);
    const cx = 210, cy = 210, r = 180, rc = r * 3470 / 6370, ri = r * 1220 / 6370;
    wx.fillStyle = '#E07B39'; wx.beginPath(); wx.arc(cx, cy, r, 0, 7); wx.fill();
    wx.fillStyle = solid.checked ? '#C9A33C' : '#F2C14E'; wx.beginPath(); wx.arc(cx, cy, rc, 0, 7); wx.fill();
    wx.fillStyle = '#FFE38A'; wx.beginPath(); wx.arc(cx, cy, ri, 0, 7); wx.fill();
    label(wx, '地函（固體）', cx, cy - rc - 22, { align: 'center', size: 12, color: '#fff', bold: true });
    label(wx, solid.checked ? '外核（假設固體）' : '外核（液體）', cx, cy - ri - 22, { align: 'center', size: 12, color: '#5D4037', bold: true });
    const sx = cx, sy = cy - r;                 // 震源在頂端
    let blocked = 0, arrived = 0;
    for (let a = 4; a <= 176; a += 4) {
      // 從震源出發的直線（弦），角度 a 是相對垂直往下的方向
      const ang = Math.PI / 2 + (a - 90) * Math.PI / 180 * .99;
      const dx = Math.cos(ang), dy = Math.sin(ang);
      // 和外核的交點
      const fx = sx - cx, fy = sy - cy, b = fx * dx + fy * dy, c = fx * fx + fy * fy - rc * rc, disc = b * b - c;
      const tEnd = -2 * (fx * dx + fy * dy);    // 和地表另一端的交點
      let tCut = tEnd, hit = false;
      if (disc > 0) { const t1 = -b - Math.sqrt(disc); if (t1 > 0 && t1 < tEnd) { tCut = t1; hit = true; } }
      const stop = wtype === 'S' && hit && !solid.checked;
      wx.strokeStyle = stop ? 'rgba(255,90,90,.9)' : wtype === 'S' ? 'rgba(120,220,255,.75)' : 'rgba(170,255,170,.75)';
      wx.lineWidth = 1.6; wx.beginPath(); wx.moveTo(sx, sy); wx.lineTo(sx + dx * (stop ? tCut : tEnd), sy + dy * (stop ? tCut : tEnd)); wx.stroke();
      if (stop) { blocked++; wx.fillStyle = '#FF5A5A'; wx.beginPath(); wx.arc(sx + dx * tCut, sy + dy * tCut, 2.5, 0, 7); wx.fill(); }
      else { arrived++; wx.fillStyle = '#fff'; wx.beginPath(); wx.arc(sx + dx * tEnd, sy + dy * tEnd, 2.5, 0, 7); wx.fill(); }
    }
    // 陰影區
    if (wtype === 'S' && !solid.checked) {
      const half = Math.PI - 2 * Math.acos(rc / r); wx.strokeStyle = 'rgba(255,90,90,.9)'; wx.lineWidth = 8; wx.beginPath(); wx.arc(cx, cy, r + 6, Math.PI / 2 - half, Math.PI / 2 + half); wx.stroke();
      label(wx, 'S 波收不到的「陰影區」', cx, cy + r + 20, { align: 'center', size: 13, color: '#FF8A80', bold: true });
    }
    wx.fillStyle = '#FF3B3B'; wx.beginPath(); for (let k = 0; k < 10; k++) { const rr = k % 2 ? 4 : 10, a = k / 10 * Math.PI * 2 - Math.PI / 2; wx.lineTo(sx + Math.cos(a) * rr, sy + Math.sin(a) * rr); } wx.closePath(); wx.fill();
    document.getElementById('c6wTxt').innerHTML = wtype === 'S'
      ? (solid.checked ? '如果外核是固體，S 波應該能穿過去，地球另一面也收得到。<b>但真實的地震站在另一面收不到 S 波</b>——所以外核不是固體。'
        : `S 波穿過了<b>整個地函</b>（所以地函是固體！），但一碰到外核就停了（${blocked} 條被擋下）。地球另一面出現一大片收不到 S 波的「陰影區」→ 外核是<b>液體</b>。<br><span class="note">真實的地震波會彎曲前進，實際上從震央算起約 103° 以外就收不到 S 波。</span>`)
      : 'P 波在固體和液體中都能傳播，可以穿過外核（真實情況：P 波進出外核時會大幅轉彎，也會形成一圈較窄的 P 波陰影區）。';
  }
  document.querySelectorAll('#c6wtype .chip').forEach(b => b.onclick = () => { document.querySelectorAll('#c6wtype .chip').forEach(x => x.classList.remove('on')); b.classList.add('on'); wtype = b.dataset.w; wdraw(); });
  solid.onchange = wdraw;
  registerSim('t1', { start: wdraw, resize: wdraw });
})();

/* ===== 地震波速度–深度圖＋推理鏈（莫氏、古氏、雷曼不連續面） =====
   速度數值依「初步參考地球模型」（PREM）概略取值，單位：公里/秒。 */
(() => {
  const cv = document.getElementById('c6vel'); if (!cv) return;
  const S = stage(cv, 460, 420), ctx = S.ctx;
  // [深度, P 波速度, S 波速度]；同一深度出現兩次代表「跳一下」
  const PROF = [[0, 5.8, 3.2], [35, 6.8, 3.9], [35, 8.0, 4.5], [100, 8.0, 4.45], [180, 7.9, 4.35], [220, 8.5, 4.6], [400, 9.0, 4.9], [670, 10.2, 5.6], [670, 10.8, 5.95],
    [2891, 13.7, 7.3], [2891, 8.06, 0], [5150, 10.36, 0], [5150, 11.03, 3.5], [6371, 11.26, 3.67]];
  const MARK = [
    [35, '①', '莫氏不連續面（約 35 公里，大陸地殼底部）', '<b>① 莫氏不連續面</b>（地殼｜地函）<br>深度：大陸底下約 30～50 公里，海洋底下約 5～10 公里。<br>P 波速度從每秒約 6～7 公里突然<b>變快</b>到約 8 公里 → 下面的岩石密度更大、更堅硬。'],
    [2891, '②', '古氏不連續面（約 2900 公里）', '<b>② 古氏不連續面</b>（地函｜地核）<br>深度：約 2900 公里。<br>P 波速度突然<b>大幅變慢</b>（約 13.7 → 8 公里/秒），而且 <b>S 波消失了</b> → 下面是液體：<b>外地核</b>（液態的鐵、鎳）。'],
    [5150, '③', '雷曼不連續面（約 5150 公里）', '<b>③ 雷曼不連續面</b>（外地核｜內地核）<br>深度：約 5150 公里。<br>P 波速度又<b>變快</b>，而且科學家推論這裡 S 波又能傳播 → 下面是固體：<b>內地核</b>。'],
  ];
  let zoom = 'all', sel = -1;
  const geo = () => { const dmax = zoom === 'all' ? 6371 : 400; return { dmax, X: v => 50 + v / 14 * 380, Y: d => 30 + d / dmax * 360 }; };
  function draw() {
    S.fit(); ctx.clearRect(0, 0, S.W, S.H);
    const { dmax, X, Y } = geo();
    // 分層底色
    const bands = [[0, 35, '#D7CCC8', '地殼'], [35, 2891, '#FFE0B2', '地函'], [2891, 5150, '#FFF59D', '外地核（液）'], [5150, 6371, '#FFECB3', '內地核（固）']];
    bands.forEach(([a, b, c, n]) => { if (a > dmax) return; const y0 = Y(a), y1 = Y(Math.min(b, dmax)); ctx.fillStyle = c; ctx.fillRect(50, y0, 380, y1 - y0); if (y1 - y0 > 18) label(ctx, n, 425, (y0 + y1) / 2, { align: 'right', size: 13, bold: true, color: '#6D4C41' }); });
    if (zoom === 'top') { ctx.fillStyle = 'rgba(192,80,77,.15)'; ctx.fillRect(50, Y(100), 380, Y(220) - Y(100)); label(ctx, '軟流圈附近：S 波變慢一點', 300, Y(160), { size: 12, color: '#B71C1C', bold: true }); }
    // 座標軸
    ctx.strokeStyle = '#999'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(50, 30); ctx.lineTo(430, 30); ctx.moveTo(50, 30); ctx.lineTo(50, 390); ctx.stroke();
    [0, 4, 8, 12].forEach(v => label(ctx, v + '', X(v), 18, { align: 'center', size: 12, color: '#666' }));
    label(ctx, '速度（公里/秒）→', 430, 404, { align: 'right', size: 12, color: '#666' });
    const ticks = zoom === 'all' ? [0, 1000, 2000, 3000, 4000, 5000, 6000] : [0, 100, 200, 300, 400];
    ticks.forEach(d => label(ctx, d + '', 44, Y(d), { align: 'right', size: 12, color: '#666' }));
    label(ctx, '深度（公里）', 6, 404, { size: 12, color: '#666' });
    // 曲線
    [[1, '#1E88E5', 'P 波'], [2, '#E53935', 'S 波']].forEach(([k, c, n]) => {
      ctx.strokeStyle = c; ctx.lineWidth = 3; ctx.beginPath(); let started = false;
      PROF.forEach(p => { if (p[0] > dmax + 1) return; const x = X(p[k]), y = Y(Math.min(p[0], dmax)); if (!started) { ctx.moveTo(x, y); started = true; } else ctx.lineTo(x, y); });
      if (dmax < 6371) { const last = PROF.filter(p => p[0] <= dmax).pop(); ctx.lineTo(X(last[k]), Y(dmax)); }
      ctx.stroke();
      label(ctx, n, X(k === 1 ? 6.2 : 3.4) + 6, Y(dmax * .04) + 6, { size: 13, bold: true, color: c, bg: 'rgba(255,255,255,.85)' });
    });
    if (zoom === 'all') label(ctx, 'S 波到這裡就消失了', X(1.2), Y(3600), { size: 12, bold: true, color: '#C62828', bg: 'rgba(255,255,255,.85)' });
    // 不連續面標記
    MARK.forEach(([d, sym, nm], i) => {
      if (d > dmax) return;
      const y = Y(d);
      ctx.setLineDash([5, 4]); ctx.strokeStyle = i === sel ? '#6A3FA0' : 'rgba(0,0,0,.35)'; ctx.lineWidth = i === sel ? 2.5 : 1.2; ctx.beginPath(); ctx.moveTo(50, y); ctx.lineTo(430, y); ctx.stroke(); ctx.setLineDash([]);
      ctx.fillStyle = i === sel ? '#6A3FA0' : '#455A64'; ctx.beginPath(); ctx.arc(64, y, 11, 0, 7); ctx.fill();
      label(ctx, sym, 64, y, { align: 'center', size: 13, bold: true, color: '#fff' });
      MARK[i].hit = y;
    });
  }
  cv.addEventListener('pointerdown', e => {
    const p = S.pt(e); let best = -1, bd = 22;
    MARK.forEach((m, i) => { if (m.hit !== undefined && m[0] <= geo().dmax && Math.abs(m.hit - p.y) < bd) { bd = Math.abs(m.hit - p.y); best = i; } });
    if (best < 0) return; sel = best; draw(); document.getElementById('c6velTxt').innerHTML = MARK[best][3];
  });
  document.querySelectorAll('#c6velZoom .chip').forEach(b => b.onclick = () => { document.querySelectorAll('#c6velZoom .chip').forEach(x => x.classList.remove('on')); b.classList.add('on'); zoom = b.dataset.z; draw(); });
  registerSim('t1', { start: draw, resize: draw });

  /* ---------- 推理鏈 ---------- */
  const CH = [
    ['🧠 前提', '我們已經知道的事', '① 波的速度會隨介質改變，碰到兩種介質的交界會<b>轉彎（折射）或反彈（反射）</b>（第三冊學過）。<br>② 地震波有兩種：<b>P 波</b>在固體、液體裡都能傳；<b>S 波</b>只能在<b>固體</b>裡傳。', ''],
    ['👀 觀察 1', '1909 年｜克羅埃西亞科學家 莫霍洛維奇', '一次地震後，他比對各地測站的紀錄：離震央大約 200 公里以外的測站，竟然收到一組 P 波<b>比預期更早到</b>。',
      '🤔 推論：走「比較深、比較遠」的路線反而先到，代表地下某個深度以下的岩石，讓波跑得<b>更快</b>——就像繞道走高速公路，路比較長卻比較早到。<br>✅ 結論：地殼和下面的地函之間有一個分界 → <b>莫氏不連續面</b>（大陸底下約 30～50 公里、海洋底下約 5～10 公里）。'],
    ['👀 觀察 2', '1914 年｜德國科學家 古騰堡', '全世界的測站發現：在距離震央大約 103°～142° 的一圈地區，<b>幾乎收不到 P 波</b>（P 波陰影區）。',
      '🤔 推論：P 波在某個深度突然<b>變慢、大幅轉彎</b>，像光從空氣射進水裡一樣偏折，所以跳過了這一圈。古騰堡算出這個界面約在 <b>2900 公里</b>深。<br>✅ 結論：地函和地核的分界 → <b>古氏不連續面</b>。'],
    ['👀 觀察 3', '1926 年｜英國科學家 傑佛瑞斯等人', '距離震央 103° 以外的地方，<b>完全收不到 S 波</b>。',
      '🤔 推論：S 波只能在固體中傳播。它一碰到 2900 公里深的界面就過不去 → 界面下面是<b>液體</b>。<br>✅ 結論：地核的外層是液態的鐵、鎳 → <b>外地核</b>。（這一頁下方的資優挑戰「地震波穿過地球」可以親手驗證。）'],
    ['👀 觀察 4', '1936 年｜丹麥女科學家 雷曼', '奇怪的是，在 P 波陰影區<b>裡面</b>，竟然收到了<b>微弱的 P 波</b>。如果整個地核都是液體，這些 P 波應該不會出現在這裡。',
      '🤔 推論：地核裡面一定還有另一個界面，把一部分 P 波反彈、折射進陰影區。而且 P 波在那裡又<b>變快</b>了 → 那是一個<b>固體</b>的核心。<br>✅ 結論：約 5150 公里深處有 <b>內地核</b>（固態），分界叫做<b>雷曼不連續面</b>。'],
    ['🟣 加深', '更熱的內核，為什麼反而是固體？', '地球愈深愈熱，內地核的溫度可能比外地核還高，卻是固體，好像說不通？',
      '🤔 推論：深處的<b>壓力</b>大到不可思議（約是地表大氣壓力的 300 多萬倍）。壓力愈大，鐵的熔點就愈高——鐵被「壓」成了固體。<br>💡 所以「是固體還是液體」，要同時看溫度和壓力。'],
    ['🏁 全部連起來', '一張地圖', '地殼 ─①莫氏不連續面─ 地函 ─②古氏不連續面─ 外地核（液）─③雷曼不連續面─ 內地核（固）',
      '沒有人去過地底下，科學家只靠「波在哪裡變快、變慢、轉彎、消失」這些線索，就畫出了整個地球的內部構造。這就是<b>從證據推論</b>的科學方法。'],
  ];
  let shown = 0;
  const host = document.getElementById('c6chain');
  function renderChain() {
    host.innerHTML = CH.slice(0, Math.max(1, shown)).map(([tag, who, obs, inf], i) => `
      <div class="callout" style="margin:8px 0;${tag.includes('🟣') ? 'background:var(--deep-bg);border-left:4px solid var(--deep)' : ''}">
        <div><b>${tag}</b>　<span class="note">${who}</span></div>
        <div style="margin-top:4px">${obs}</div>
        ${inf ? `<div style="margin-top:6px">${inf}</div>` : ''}
      </div>`).join('');
    document.getElementById('c6chainNext').style.display = shown >= CH.length ? 'none' : '';
  }
  document.getElementById('c6chainNext').onclick = () => { shown = Math.min(CH.length, Math.max(1, shown) + 1); renderChain(); };
  document.getElementById('c6chainAll').onclick = () => { shown = CH.length; renderChain(); };
  document.getElementById('c6chainReset').onclick = () => { shown = 1; renderChain(); };
  shown = 1; renderChain();
})();
