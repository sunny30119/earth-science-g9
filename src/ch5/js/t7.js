/* ===== 分頁 7：火成岩／沉積岩／變質岩製造機、虛擬實驗桌、岩石循環、礦物檢查表 ===== */
(() => {
  const ic = document.getElementById('t7ign'); if (!ic) return;

  /* ---------- 共用：岩石紋理 ---------- */
  function speckle(ctx, x, y, w, h, cols, n, rmin, rmax, seed) {
    const r = rng(seed);
    for (let i = 0; i < n; i++) { ctx.fillStyle = cols[Math.floor(r() * cols.length)]; const rr = rmin + r() * (rmax - rmin); ctx.beginPath(); ctx.ellipse(x + r() * w, y + r() * h, rr, rr * (.6 + r() * .5), r() * 3, 0, 7); ctx.fill(); }
  }
  // 依名稱畫一塊岩石或礦物的表面
  function texture(ctx, name, x, y, w, h, seed = 1) {
    ctx.save(); rrect(ctx, x, y, w, h, 14); ctx.clip();
    const r = rng(seed);
    switch (name) {
      case '玄武岩': ctx.fillStyle = '#2E2E30'; ctx.fillRect(x, y, w, h); speckle(ctx, x, y, w, h, ['#3A3A3D', '#252527'], 900, .6, 1.4, seed);
        ctx.fillStyle = '#18181A'; for (let i = 0; i < 12; i++) { ctx.beginPath(); ctx.arc(x + r() * w, y + r() * h, 2 + r() * 3, 0, 7); ctx.fill(); } break;
      case '花岡岩': ctx.fillStyle = '#E9DDD2'; ctx.fillRect(x, y, w, h); speckle(ctx, x, y, w, h, ['#E3B7A3', '#F4EFE8', '#D4CFCB', '#2A2A2A'], 260, 3, 8, seed); break;
      case '礫岩': ctx.fillStyle = '#B9A383'; ctx.fillRect(x, y, w, h); speckle(ctx, x, y, w, h, ['#8D7B6A', '#A1887F', '#6D5D4B', '#C8B49A'], 40, 7, 20, seed); speckle(ctx, x, y, w, h, ['#A89272'], 300, .8, 1.5, seed + 1); break;
      case '石灰岩': ctx.fillStyle = '#D9D6CC'; ctx.fillRect(x, y, w, h); speckle(ctx, x, y, w, h, ['#CFCBC0', '#E3E0D7'], 300, 1, 3, seed);
        ctx.strokeStyle = 'rgba(120,110,95,.6)'; ctx.lineWidth = 1.5; for (let i = 0; i < 6; i++) { const cx = x + r() * w, cy = y + r() * h; ctx.beginPath(); ctx.arc(cx, cy, 6 + r() * 6, Math.PI, 2 * Math.PI); ctx.stroke(); for (let k = -2; k <= 2; k++) { ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx + k * 3, cy - 9); ctx.stroke(); } } break;
      case '板岩': ctx.fillStyle = '#4A4F57'; ctx.fillRect(x, y, w, h); ctx.strokeStyle = 'rgba(160,170,185,.35)'; ctx.lineWidth = 1;
        for (let i = -h; i < w; i += 6) { ctx.beginPath(); ctx.moveTo(x + i, y); ctx.lineTo(x + i + h * .25, y + h); ctx.stroke(); } break;
      case '頁岩': ctx.fillStyle = '#7B7064'; ctx.fillRect(x, y, w, h); for (let yy = y; yy < y + h; yy += 3 + r() * 4) { ctx.fillStyle = r() > .5 ? '#6E6458' : '#8A7F72'; ctx.fillRect(x, yy, w, 2); } break;
      case '大理岩': ctx.fillStyle = '#F5F3EF'; ctx.fillRect(x, y, w, h); ctx.strokeStyle = 'rgba(200,195,190,.9)'; ctx.lineWidth = 1;
        for (let i = 0; i < 70; i++) { const cx = x + r() * w, cy = y + r() * h, s = 6 + r() * 8; ctx.beginPath(); for (let k = 0; k < 6; k++) { const a = k / 6 * 7 + r(); ctx.lineTo(cx + Math.cos(a) * s, cy + Math.sin(a) * s); } ctx.closePath(); ctx.stroke(); }
        ctx.strokeStyle = 'rgba(150,150,160,.5)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(x, y + h * .3); ctx.bezierCurveTo(x + w * .3, y + h * .1, x + w * .6, y + h * .7, x + w, y + h * .5); ctx.stroke(); break;
      case '花岡片麻岩': for (let yy = y, k = 0; yy < y + h; yy += 9, k++) { ctx.fillStyle = k % 2 ? '#2F2F33' : '#E9DCCD'; ctx.beginPath(); ctx.moveTo(x, yy); for (let xx = x; xx <= x + w; xx += 8) ctx.lineTo(xx, yy + Math.sin((xx + k * 13) / 18) * 3); ctx.lineTo(x + w, yy + 10); ctx.lineTo(x, yy + 10); ctx.fill(); } break;
      case '方解石': ctx.fillStyle = '#EEF2F5'; ctx.fillRect(x, y, w, h); ctx.strokeStyle = 'rgba(150,170,190,.7)'; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(x + w * .2, y + h * .3); ctx.lineTo(x + w * .6, y + h * .15); ctx.lineTo(x + w * .85, y + h * .55); ctx.lineTo(x + w * .45, y + h * .8); ctx.closePath(); ctx.stroke(); break;
      case '石英': ctx.fillStyle = '#E8ECEF'; ctx.fillRect(x, y, w, h); ctx.fillStyle = 'rgba(255,255,255,.9)'; ctx.strokeStyle = 'rgba(140,160,175,.8)'; ctx.lineWidth = 2;
        [[.3, .2], [.5, .1], [.68, .25]].forEach(([fx, fy]) => { const cx = x + w * fx, cy = y + h * fy; ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx + 14, cy + 18); ctx.lineTo(cx + 14, cy + h * .7); ctx.lineTo(cx - 14, cy + h * .7); ctx.lineTo(cx - 14, cy + 18); ctx.closePath(); ctx.fill(); ctx.stroke(); }); break;
      default: ctx.fillStyle = '#999'; ctx.fillRect(x, y, w, h);
    }
    ctx.restore();
  }

  /* ---------- 火成岩：晶體生長 ---------- */
  const IG = stage(ic, 400, 260), igx = IG.ctx;
  const GW = 200, GH = 130;
  const off = document.createElement('canvas'); off.width = GW; off.height = GH; const ox = off.getContext('2d');
  const MIN = {
    light: [['石英', '#D9D9D9', .3], ['長石', '#EDB9A5', .3], ['長石', '#F6F1EA', .25], ['雲母', '#262626', .15]],
    mid: [['斜長石', '#E7E4DE', .5], ['角閃石', '#2C2F2B', .38], ['長石', '#D9B3A1', .12]],
    dark: [['輝石', '#1F2420', .5], ['斜長石', '#8F948F', .4], ['橄欖石', '#5E7A3A', .1]],
  };
  const NAME = {
    light: [['花岡岩', true, '晶體大、肉眼看得見白、粉紅、黑三種顆粒（石英、長石、雲母）。例：金門。'], ['流紋岩', false, '和花岡岩成分一樣，但冷卻快、晶體細小。']],
    mid: [['閃長岩', false, '和安山岩成分一樣，但在地底慢慢冷卻，晶體較大。'], ['安山岩', true, '灰色、晶體細小。例：大屯火山群（陽明山）。']],
    dark: [['輝長岩', false, '和玄武岩成分一樣，但在地底慢慢冷卻，晶體較大。'], ['玄武岩', true, '深黑色，晶體細到肉眼幾乎看不到。例：澎湖。']],
  };
  let comp = 'light', grow = 1, labels = null, dists = null, seedCol = null, R = 1, igAnim = false;
  const cool = bindRange('t7cool', v => v < 35 ? '地底深處，慢慢冷卻（上萬年）' : v < 90 ? '噴出地表，很快冷卻' : '瞬間急凍（例如熔岩流進海裡）');
  function compute() {
    const v = +cool.value, glass = v >= 90;
    const N = glass ? 0 : v < 35 ? Math.round(lerp(22, 80, v / 35)) : Math.round(lerp(300, 1100, (v - 35) / 55));
    const r = rng(42 + N);
    const seeds = Array.from({ length: N }, () => [r() * GW, r() * GH]);
    seedCol = seeds.map(() => { let q = r(), k = 0; const arr = MIN[comp]; while (k < arr.length - 1 && (q -= arr[k][2]) > 0) k++; return arr[k][1]; });
    labels = new Int32Array(GW * GH); dists = new Float32Array(GW * GH);
    // 用格子加速找最近的種子
    const CS = 10, gw = Math.ceil(GW / CS), gh = Math.ceil(GH / CS), grid = Array.from({ length: gw * gh }, () => []);
    seeds.forEach(([sx, sy], i) => grid[Math.floor(sy / CS) * gw + Math.floor(sx / CS)].push(i));
    for (let py = 0; py < GH; py++) for (let px = 0; px < GW; px++) {
      let best = -1, bd = 1e9; const cx = Math.floor(px / CS), cy = Math.floor(py / CS);
      for (let rad = 0; rad < Math.max(gw, gh) && (best < 0 || rad <= Math.ceil(Math.sqrt(bd) / CS) + 1); rad++) {
        for (let gy = cy - rad; gy <= cy + rad; gy++) for (let gx = cx - rad; gx <= cx + rad; gx++) {
          if (gx < 0 || gy < 0 || gx >= gw || gy >= gh || (Math.abs(gx - cx) !== rad && Math.abs(gy - cy) !== rad)) continue;
          for (const i of grid[gy * gw + gx]) { const d = (seeds[i][0] - px) ** 2 + (seeds[i][1] - py) ** 2; if (d < bd) { bd = d; best = i; } }
        }
        if (N === 0) break;
      }
      labels[py * GW + px] = best; dists[py * GW + px] = Math.sqrt(bd);
    }
    R = N ? Math.sqrt(GW * GH / N) * .75 : 1;
  }
  function drawIgn() {
    IG.fit();
    if (!labels) compute();
    const v = +cool.value, glass = v >= 90;
    const img = ox.createImageData(GW, GH), d = img.data;
    const melt = [255, Math.round(120 + 60 * (1 - grow)), 40];
    for (let i = 0; i < GW * GH; i++) {
      let c;
      if (glass) { const t = grow; const px = i % GW, py = (i / GW) | 0; const sheen = 18 * Math.sin(px / 9 + py / 14) * t; c = [lerp(melt[0], 22 + sheen, t), lerp(melt[1], 22 + sheen, t), lerp(melt[2], 28 + sheen, t)]; }
      else if (grow >= 1 || dists[i] <= R * grow * 1.6) {
        const hex = seedCol[labels[i]]; c = [parseInt(hex.slice(1, 3), 16), parseInt(hex.slice(3, 5), 16), parseInt(hex.slice(5, 7), 16)];
        const px = i % GW; if ((px < GW - 1 && labels[i + 1] !== labels[i]) || (i + GW < GW * GH && labels[i + GW] !== labels[i])) c = c.map(q => q * .65);
      } else c = melt;
      d[i * 4] = c[0]; d[i * 4 + 1] = c[1]; d[i * 4 + 2] = c[2]; d[i * 4 + 3] = 255;
    }
    ox.putImageData(img, 0, 0);
    igx.imageSmoothingEnabled = false; igx.drawImage(off, 0, 0, IG.W, IG.H);
    if (grow < 1) label(igx, '🔥 岩漿冷卻中…晶體正在長大', 200, 24, { align: 'center', size: 15, bold: true, color: '#fff', bg: 'rgba(0,0,0,.45)' });
    else label(igx, '放大約 10 倍', 392, 248, { align: 'right', size: 12, color: '#fff', bg: 'rgba(0,0,0,.4)' });
  }
  function nameIgn() {
    const v = +cool.value;
    const el = document.getElementById('t7ignName');
    if (v >= 90) { el.innerHTML = `<span class="big">火山玻璃（例如黑曜岩）</span> <span class="tag" style="color:var(--deep)">🟣 加深加廣</span><br>冷卻快到原子來不及排好，連晶體都沒有，像玻璃一樣光滑、斷口銳利。`; return; }
    const [nm, inBook, desc] = NAME[comp][v < 35 ? 0 : 1];
    el.innerHTML = `<span class="big">${nm}</span> ${inBook ? '<span class="tag" style="color:var(--ok)">✔ 課本</span>' : '<span class="tag" style="color:var(--deep)">🟣 加深加廣</span>'}<br>${desc}<br><span class="note">${v < 35 ? '慢慢冷卻 → 晶體有時間長大 → 顆粒大' : '快速冷卻 → 晶體來不及長大 → 顆粒小'}</span>`;
  }
  document.querySelectorAll('#t7comp .chip').forEach(b => b.onclick = () => { document.querySelectorAll('#t7comp .chip').forEach(x => x.classList.remove('on')); b.classList.add('on'); comp = b.dataset.c; labels = null; grow = 1; drawIgn(); nameIgn(); });
  cool.addEventListener('input', () => { labels = null; grow = 1; drawIgn(); nameIgn(); });
  const IL = loop(dt => { if (!igAnim) return; grow = Math.min(1, grow + dt / 2.5); drawIgn(); if (grow >= 1) { igAnim = false; nameIgn(); } });
  document.getElementById('t7go').onclick = () => { if (!labels) compute(); grow = 0; igAnim = true; document.getElementById('t7ignName').innerHTML = '冷卻中……先猜猜看：晶體會長得大還是小？'; };
  registerSim('t7', { start() { drawIgn(); nameIgn(); IL.start(); }, stop() { IL.stop(); }, resize: drawIgn });

  /* ---------- 沉積岩 ---------- */
  const sc = document.getElementById('t7sed');
  const SD = stage(sc, 400, 260), sx = SD.ctx;
  const SED = [
    { n: '礫岩', c: '#A1887F', r: [5, 11], k: 50, txt: '顆粒最大（大於 2 毫米）。例：苗栗火炎山——膠結差、易崩落。' },
    { n: '砂岩', c: '#D9B66F', r: [1.5, 3], k: 380, txt: '摸起來粗粗的。例：野柳的岩層、女王頭。' },
    { n: '頁岩', c: '#8D7F72', r: [.6, 1.1], k: 1200, txt: '顆粒最細，常可沿著層理一片片剝開。' },
    { n: '石灰岩', c: '#E5E1D6', r: [2, 6], k: 130, txt: '由貝殼、珊瑚等生物遺骸堆積而成，主要成分是碳酸鈣，滴鹽酸會冒泡。常作水泥原料。例：墾丁船帆石。', shell: true },
    { n: '鹽岩', c: '#F7F7F7', r: [2, 4], k: 260, txt: '海水或鹹水湖蒸發後，鹽結晶沉積而成（還記得第 3 分頁湖底那層白色的鹽嗎？）。', cube: true },
  ];
  let selS = 0, layers = [], falling = null;
  function sedDraw() {
    SD.fit(); sx.clearRect(0, 0, SD.W, SD.H);
    sx.fillStyle = '#CFE6F5'; sx.fillRect(0, 0, SD.W, SD.H);
    let yb = SD.H;
    layers.forEach((L, i) => {
      const rock = i < layers.length - 1;                      // 上面又蓋了一層 → 被壓密膠結
      const h = rock ? L.h * .7 : L.h; const top = yb - h;
      const K = SED[L.s];
      sx.fillStyle = rock ? K.c : 'rgba(255,255,255,.0)'; sx.fillRect(0, top, SD.W, h);
      if (rock) { sx.fillStyle = 'rgba(0,0,0,.08)'; sx.fillRect(0, top, SD.W, 2); }
      const r = rng(L.seed);
      sx.fillStyle = K.c;
      for (let k = 0; k < K.k; k++) {
        const px = r() * SD.W, py = top + r() * h, rr = K.r[0] + r() * (K.r[1] - K.r[0]);
        sx.fillStyle = rock ? `rgba(0,0,0,${.08 + r() * .12})` : K.c;
        if (K.cube) sx.fillRect(px, py, rr * 1.6, rr * 1.6);
        else if (K.shell && r() > .5) { sx.beginPath(); sx.arc(px, py, rr * 1.4, Math.PI, 2 * Math.PI); sx.fill(); }
        else { sx.beginPath(); sx.ellipse(px, py, rr, rr * .75, 0, 0, 7); sx.fill(); }
      }
      if (rock) label(sx, K.n, 10, top + h / 2, { size: 14, bold: true, bg: 'rgba(255,255,255,.85)' });
      else label(sx, '鬆散的' + ['礫石', '沙', '泥', '貝殼碎片', '鹽結晶'][L.s], 10, top + h / 2, { size: 13, color: '#455A64', bg: 'rgba(255,255,255,.7)' });
      yb = top;
    });
    if (falling) {
      const K = SED[falling.s], r = rng(falling.seed);
      for (let k = 0; k < Math.min(K.k, 160); k++) { const px = r() * SD.W, py = falling.t * (yb - 10) * (.6 + r() * .4); sx.fillStyle = K.c; sx.beginPath(); sx.arc(px, py, K.r[0] + r() * (K.r[1] - K.r[0]), 0, 7); sx.fill(); }
    }
    if (!layers.length && !falling) label(sx, '這裡是湖底或海底。按「一層層堆上去」', 200, 130, { align: 'center', size: 14, color: '#456' });
    if (layers.length > 1) { arrow(sx, 380, 10, 380, 40, '#C62828', 3, 10); label(sx, '上面的重量往下壓', 372, 54, { align: 'right', size: 12, color: '#C62828', bold: true }); }
  }
  const SL = loop(dt => { if (!falling) return; falling.t += dt * 1.4; if (falling.t >= 1) { layers.push({ s: falling.s, h: 55, seed: falling.seed }); if (layers.length > 4) layers.shift(); falling = null; sedName(); } sedDraw(); });
  function sedName() {
    const el = document.getElementById('t7sedName');
    if (layers.length < 2) { el.innerHTML = layers.length ? '鬆散的沉積物還不是岩石。再堆一層上去，讓上面的重量把它<b>壓密</b>，水中的礦物質把顆粒<b>膠結</b>在一起。' : '先選沉積物，再按「一層層堆上去」。'; return; }
    const K = SED[layers[layers.length - 2].s];
    el.innerHTML = `<span class="big">${K.n}</span>（沉積岩）<br>${K.txt}`;
  }
  document.querySelectorAll('#t7sedC .chip').forEach(b => b.onclick = () => { document.querySelectorAll('#t7sedC .chip').forEach(x => x.classList.remove('on')); b.classList.add('on'); selS = +b.dataset.s; });
  document.getElementById('t7press').onclick = () => { if (!falling) falling = { s: selS, t: 0, seed: Math.floor(Math.random() * 1e6) }; };
  document.getElementById('t7sedReset').onclick = () => { layers = []; falling = null; sedName(); sedDraw(); };
  registerSim('t7', { start() { sedDraw(); sedName(); SL.start(); }, stop() { SL.stop(); }, resize: sedDraw });

  /* ---------- 變質岩 ---------- */
  const mc = document.getElementById('t7met');
  const MT = stage(mc, 400, 230), mx = MT.ctx;
  const PAR = [['頁岩', '板岩', '頁岩變質而成，質地緻密，可以剝成平整的石板。臺灣原住民用來蓋冬暖夏涼的石板屋。'],
    ['石灰岩', '大理岩', '石灰岩變質而成，方解石重新結晶、緊密咬合，質地細緻，常做雕刻與建材。例：太魯閣、奇美博物館。'],
    ['花岡岩', '花岡片麻岩', '花岡岩變質而成，礦物被壓成深淺相間的條紋（片麻狀構造）。']];
  let selM = 0;
  const heat = bindRange('t7heat', v => `約 ${Math.round(v * .3)} 公里深、${Math.round(25 + v * 8)} °C`, () => metDraw());
  function metDraw() {
    MT.fit(); mx.clearRect(0, 0, MT.W, MT.H);
    const h = +heat.value, [p, m, txt] = PAR[selM];
    const a = clamp((h - 25) / 25, 0, 1);
    if (h < 85) {
      texture(mx, p, 20, 20, 170, 170, 7 + selM); if (a > 0) { mx.globalAlpha = a; texture(mx, m, 20, 20, 170, 170, 7 + selM); mx.globalAlpha = 1; }
      label(mx, a < .5 ? p : m, 105, 210, { align: 'center', bold: true, size: 16 });
    } else {
      const g = mx.createRadialGradient(105, 105, 10, 105, 105, 110); g.addColorStop(0, '#FFE082'); g.addColorStop(.5, '#FF7043'); g.addColorStop(1, '#BF360C');
      mx.fillStyle = g; rrect(mx, 20, 20, 170, 170, 14); mx.fill(); label(mx, '岩漿', 105, 210, { align: 'center', bold: true, size: 16, color: '#BF360C' });
    }
    // 溫度計
    mx.fillStyle = '#eee'; rrect(mx, 240, 20, 26, 180, 13); mx.fill();
    const lv = 20 + 180 * (1 - h / 100); const gg = mx.createLinearGradient(0, 200, 0, 20); gg.addColorStop(0, '#FFB74D'); gg.addColorStop(1, '#D32F2F');
    mx.fillStyle = gg; rrect(mx, 240, lv, 26, 200 - lv, 13); mx.fill();
    mx.setLineDash([4, 3]); mx.strokeStyle = '#C62828'; mx.beginPath(); mx.moveTo(232, 20 + 180 * .15); mx.lineTo(392, 20 + 180 * .15); mx.stroke(); mx.setLineDash([]);
    label(mx, '開始熔化', 278, 20 + 180 * .15 - 10, { size: 12, color: '#C62828', bold: true });
    mx.setLineDash([4, 3]); mx.strokeStyle = '#6A1B9A'; mx.beginPath(); mx.moveTo(232, 20 + 180 * .6); mx.lineTo(392, 20 + 180 * .6); mx.stroke(); mx.setLineDash([]);
    label(mx, '開始變質', 278, 20 + 180 * .6 - 10, { size: 12, color: '#6A1B9A', bold: true });
    const el = document.getElementById('t7metName');
    el.innerHTML = h < 40 ? `還是<b>${p}</b>。溫度和壓力還不夠，礦物沒有明顯改變。`
      : h < 85 ? `<span class="big">${m}</span>（變質岩）<br>${txt}<br><span class="note">岩石沒有熔化！是在「固體狀態」下，礦物重新排列、重新結晶。</span>`
      : `<b>熔化了！</b>溫度太高，岩石熔成岩漿——它已經不是變質岩，冷卻後會變成<b>火成岩</b>。這就是「岩石循環」的一段路（資優挑戰有完整地圖）。`;
  }
  document.querySelectorAll('#t7metC .chip').forEach(b => b.onclick = () => { document.querySelectorAll('#t7metC .chip').forEach(x => x.classList.remove('on')); b.classList.add('on'); selM = +b.dataset.m; metDraw(); });
  registerSim('t7', { start: metDraw, resize: metDraw });

  /* ---------- 虛擬實驗桌 ---------- */
  const LAB = {
    '玄武岩': { look: '深黑色，顆粒非常細，肉眼幾乎看不到晶體，有時有小氣孔。', acid: false, nail: false, iron: false },
    '花岡岩': { look: '白、粉紅、黑色的顆粒交錯，晶體大到肉眼看得見（石英、長石、雲母）。', acid: false, nail: false, iron: false, ironNote: '石英和長石刻不動（黑色的雲母比較軟，可能刮出痕跡）。' },
    '礫岩': { look: '大小不一、圓滑的礫石，被細沙和膠結物黏在一起。', acid: false, nail: false, iron: false, acidNote: '大多沒有氣泡（如果膠結物含碳酸鈣，可能冒出少量氣泡）。', ironNote: '礫石刻不動，但膠結物可能被刮下來。' },
    '石灰岩': { look: '灰白色、細緻，有時看得到貝殼或珊瑚碎片。', acid: true, nail: false, iron: true },
    '板岩': { look: '深灰色，質地緻密，可以沿著平行的面剝成薄片。', acid: false, nail: false, iron: false, ironNote: '大致刻不動，可能留下淡淡的刮痕。' },
    '大理岩': { look: '白色或淺色，由許多閃亮的方解石結晶緊密咬合在一起。', acid: true, nail: false, iron: true },
    '方解石': { look: '無色透明或白色；敲開時會沿三個方向裂成斜斜的方塊。（礦物）', acid: true, nail: false, iron: true },
    '石英': { look: '無色透明或白色，斷口像玻璃一樣有光澤。（礦物）', acid: false, nail: false, iron: false, ironNote: '刻不動！石英比鐵釘還硬，反而能刮傷鐵釘。' },
  };
  const lc = document.getElementById('t7lab');
  const LB = stage(lc, 420, 240), lx = LB.ctx;
  let spec = '石灰岩', tool = null, toolT = 0;
  const specBox = document.getElementById('t7spec');
  Object.keys(LAB).forEach(n => { const b = document.createElement('button'); b.className = 'chip' + (n === spec ? ' on' : ''); b.textContent = n; b.onclick = () => { specBox.querySelectorAll('.chip').forEach(x => x.classList.remove('on')); b.classList.add('on'); spec = n; tool = null; labOut(); }; specBox.appendChild(b); });
  document.querySelectorAll('#t7tools [data-t]').forEach(b => b.onclick = () => { tool = b.dataset.t; toolT = 0; labOut(); });
  function labOut() {
    const L = LAB[spec], el = document.getElementById('t7labOut');
    if (!tool) { el.innerHTML = `標本：<b>${spec}</b>。選一個工具試試看。`; return; }
    const res = {
      look: `🔍 ${L.look}`,
      acid: L.acid ? '💧 <b>冒出大量氣泡！</b>這些氣泡是<b>二氧化碳</b>，表示含有<b>碳酸鈣</b>（碳酸鈣＋鹽酸 → 氯化鈣＋水＋二氧化碳）。' : `💧 ${L.acidNote || '沒有氣泡。'}`,
      nail: `💅 ${L.nail ? '刻得出刮痕。' : '刻不動——它比指甲硬。'}`,
      iron: `🔩 ${L.iron ? '<b>刻得出刮痕</b>——它比鐵釘軟。' : (L.ironNote || '刻不動——它比鐵釘硬。')}`,
    }[tool];
    el.innerHTML = `標本：<b>${spec}</b><br>${res}` + (spec === '方解石' || spec === '石英' ? '<br><span class="note">探討活動 5-1：方解石和石英長得很像，但用「硬度」和「滴鹽酸」就分得出來。</span>' : '');
  }
  function labDraw(dt) {
    toolT += dt || 0;
    LB.fit(); lx.clearRect(0, 0, LB.W, LB.H);
    lx.fillStyle = '#F7F3EA'; lx.fillRect(0, 0, LB.W, LB.H);
    lx.fillStyle = 'rgba(0,0,0,.12)'; lx.beginPath(); lx.ellipse(210, 215, 130, 14, 0, 0, 7); lx.fill();
    texture(lx, spec, 90, 40, 240, 170, 3);
    const L = LAB[spec];
    if (tool === 'look') {
      lx.save(); lx.beginPath(); lx.arc(300, 90, 62, 0, 7); lx.clip(); lx.translate(300, 90); lx.scale(2.2, 2.2); lx.translate(-300, -90); texture(lx, spec, 90, 40, 240, 170, 3); lx.restore();
      lx.strokeStyle = '#5D4037'; lx.lineWidth = 7; lx.beginPath(); lx.arc(300, 90, 62, 0, 7); lx.stroke(); lx.beginPath(); lx.moveTo(345, 135); lx.lineTo(395, 190); lx.stroke();
    } else if (tool === 'acid') {
      lx.fillStyle = '#90A4AE'; lx.fillRect(196, 0, 10, 26); lx.fillStyle = '#B3E5FC'; lx.beginPath(); lx.arc(201, 30 + Math.min(toolT, 1) * 80, 5, 0, 7); lx.fill();
      if (toolT > 1) { lx.fillStyle = 'rgba(180,220,255,.5)'; lx.beginPath(); lx.ellipse(205, 115, 34, 10, 0, 0, 7); lx.fill();
        if (L.acid) { const r = rng(Math.floor(toolT * 6)); lx.strokeStyle = 'rgba(255,255,255,.95)'; lx.lineWidth = 1.5; for (let i = 0; i < 26; i++) { lx.beginPath(); lx.arc(175 + r() * 60, 112 - r() * 40 * ((toolT * 2) % 1 + .2), 2 + r() * 4, 0, 7); lx.stroke(); } } }
    } else if (tool === 'nail' || tool === 'iron') {
      const ok = L[tool], p = Math.min(1, toolT / 1.2);
      lx.strokeStyle = ok ? 'rgba(255,255,255,.95)' : 'rgba(255,255,255,0)'; lx.lineWidth = 3; lx.beginPath(); lx.moveTo(150, 140); lx.lineTo(150 + 120 * p, 120); lx.stroke();
      lx.save(); lx.translate(150 + 120 * p, 120); lx.rotate(-.9);
      if (tool === 'iron') { lx.fillStyle = '#78909C'; lx.fillRect(-4, -90, 8, 90); lx.fillRect(-12, -96, 24, 8); }
      else { lx.fillStyle = '#F2C9A8'; rrect(lx, -14, -90, 28, 90, 12); lx.fill(); lx.fillStyle = '#FBE9E7'; rrect(lx, -10, -20, 20, 18, 6); lx.fill(); }
      lx.restore();
      if (p >= 1) label(lx, ok ? '✔ 刮出痕跡' : '✘ 刮不動', 210, 20, { align: 'center', bold: true, size: 15, color: ok ? '#2E7D32' : '#C62828', bg: 'rgba(255,255,255,.9)' });
    }
    label(lx, spec, 210, 228, { align: 'center', bold: true, size: 14 });
  }
  const LL = loop(labDraw);
  registerSim('t7', { start() { labOut(); LL.start(); }, stop() { LL.stop(); } });
  mountSort(document.getElementById('t7sort'), ['火成岩', '沉積岩', '變質岩'], [
    ['玄武岩', 0, '岩漿噴出地表快速冷卻。'], ['花岡岩', 0, '岩漿在地底慢慢冷卻，晶體大。'], ['礫岩', 1, '礫石沉積後壓密膠結。'],
    ['石灰岩', 1, '生物遺骸堆積而成（含碳酸鈣）。'], ['板岩', 2, '頁岩經高溫高壓變質。'], ['大理岩', 2, '石灰岩變質——所以和石灰岩一樣，滴鹽酸會冒泡！'],
  ]);

  /* ---------- 岩石循環地圖 ---------- */
  const cc = document.getElementById('t7cyc');
  const CY = stage(cc, 480, 400), cx = CY.ctx;
  const NODE = { sed: ['沉積物', 240, 50, '#D9B66F'], sr: ['沉積岩', 410, 160, '#C8A97E'], mr: ['變質岩', 370, 320, '#8E7CC3'], mg: ['岩漿', 150, 340, '#E65100'], ir: ['火成岩', 70, 170, '#546E7A'] };
  const EDGE = [
    ['sed', 'sr', '沉積、壓密、膠結', '鬆散的碎屑一層層堆積，被壓緊、黏合。'],
    ['sr', 'mr', '高溫高壓', '沉積岩被埋到地底深處（例：頁岩 → 板岩）。'],
    ['mr', 'mg', '熔融', '溫度再升高，岩石熔化成岩漿。'],
    ['mg', 'ir', '冷卻凝固', '在地底慢慢冷卻（花岡岩）或噴出地表快速冷卻（玄武岩）。'],
    ['ir', 'sed', '抬升、風化、侵蝕、搬運', '火成岩露出地表，被外營力打碎帶走。'],
    ['ir', 'mr', '高溫高壓', '火成岩也可以直接變質（例：花岡岩 → 花岡片麻岩）。'],
    ['mr', 'sed', '抬升、風化、侵蝕、搬運', '變質岩被抬升到地表也會被侵蝕（例：太魯閣大理岩被立霧溪沖成碎石）。'],
    ['sr', 'sed', '抬升、風化、侵蝕、搬運', '沉積岩被抬升，再被打碎（例：野柳砂岩的差異侵蝕）。'],
    ['sr', 'mg', '熔融', '沉積岩被帶到很深的地方，也可能直接熔化。'],
    ['ir', 'mg', '熔融', '火成岩再被加熱，也會重新熔化。'],
  ];
  let hiE = -1, walkPos = null;
  function edgePts(e) {
    const a = NODE[e[0]], b = NODE[e[1]], dx = b[1] - a[1], dy = b[2] - a[2], L = Math.hypot(dx, dy), nx = -dy / L, ny = dx / L;
    const bend = (EDGE.findIndex(q => q[0] === e[1] && q[1] === e[0]) >= 0) ? 16 : 0;   // 雙向的線錯開一點
    return [a[1] + dx / L * 42 + nx * bend, a[2] + dy / L * 42 + ny * bend, b[1] - dx / L * 42 + nx * bend, b[2] - dy / L * 42 + ny * bend];
  }
  function cycDraw() {
    CY.fit(); cx.clearRect(0, 0, CY.W, CY.H);
    EDGE.forEach((e, i) => { const [x1, y1, x2, y2] = edgePts(e); arrow(cx, x1, y1, x2, y2, i === hiE ? '#6A3FA0' : '#B0A8BC', i === hiE ? 4 : 2, 11); });
    Object.entries(NODE).forEach(([k, [n, x, y, c]]) => {
      cx.fillStyle = c; cx.beginPath(); cx.arc(x, y, 38, 0, 7); cx.fill();
      if (walkPos === k) { cx.strokeStyle = '#FFD27A'; cx.lineWidth = 6; cx.stroke(); }
      label(cx, n, x, y, { align: 'center', bold: true, size: 15, color: '#fff' });
    });
    if (hiE >= 0) { const [x1, y1, x2, y2] = edgePts(EDGE[hiE]); label(cx, EDGE[hiE][2], (x1 + x2) / 2, (y1 + y2) / 2, { align: 'center', size: 13, bold: true, color: '#4A2C7A', bg: 'rgba(255,255,255,.92)' }); }
  }
  cc.addEventListener('pointerdown', ev => {
    const p = CY.pt(ev); let best = -1, bd = 26;
    EDGE.forEach((e, i) => { const [x1, y1, x2, y2] = edgePts(e); const d = Math.hypot((x1 + x2) / 2 - p.x, (y1 + y2) / 2 - p.y); if (d < bd) { bd = d; best = i; } });
    if (best >= 0) { hiE = best; const e = EDGE[best]; document.getElementById('t7walkLog').innerHTML = `<b>${NODE[e[0]][0]} → ${NODE[e[1]][0]}</b>：${e[2]}<br>${e[3]}`; cycDraw(); }
  });
  let walkTimer = null;
  document.getElementById('t7walk').onclick = () => {
    clearInterval(walkTimer);
    walkPos = ['ir', 'sr', 'mr'][Math.floor(Math.random() * 3)];
    const log = [`起點：<b>${NODE[walkPos][0]}</b>`]; let n = 0;
    document.getElementById('t7walkLog').innerHTML = log.join('<br>'); cycDraw();
    walkTimer = setInterval(() => {
      const opts = EDGE.map((e, i) => [e, i]).filter(([e]) => e[0] === walkPos);
      const [e, i] = opts[Math.floor(Math.random() * opts.length)];
      hiE = i; walkPos = e[1]; log.push(`${++n}. ${e[2]} → <b>${NODE[e[1]][0]}</b>`);
      document.getElementById('t7walkLog').innerHTML = log.join('<br>'); cycDraw();
      if (n >= 6) clearInterval(walkTimer);
    }, 900);
  };
  registerSim('t7', { start: cycDraw, resize: cycDraw });

  /* ---------- 礦物檢查表 ---------- */
  mountSort(document.getElementById('t7min'), ['是礦物', '不是礦物'], [
    ['石英', 0, '天然、原子規則排列、固體、無機物，四條都符合。'],
    ['冰河裡的冰', 0, '天然形成、水分子規則排列成晶體、在冰河中是固體、無機物——是礦物！'],
    ['窗戶的玻璃', 1, '原子排列沒有規則，而且是人造的。'],
    ['煤', 1, '由古代植物遺骸形成，屬於有機物。'],
    ['花岡岩', 1, '它是「岩石」：由長石、石英、雲母等多種礦物組成。'],
    ['實驗室合成的鑽石', 1, '成分和結構跟天然鑽石一樣，但不是「天然產生」。'],
    ['黃鐵礦（愚人金）', 0, '天然的硫化鐵晶體，是礦物，只是常被誤認成黃金。'],
  ]);
})();
