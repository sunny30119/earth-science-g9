/* ===== 第六章 分頁 3：虛擬黏土（褶皺／正斷層／逆斷層／平移斷層）、找上盤 =====
   繪圖用「反推」：畫面上每一點，算出它變形前原本在哪一層，就塗那一層的顏色。 */
(() => {
  const cv = document.getElementById('c6clay'); if (!cv) return;
  const S = stage(cv, 480, 320), ctx = S.ctx;
  const GW = 240, GH = 160, off = document.createElement('canvas'); off.width = GW; off.height = GH; const ox = off.getContext('2d');
  const COLS = [[214, 168, 112], [160, 120, 90], [232, 210, 160], [120, 140, 110], [200, 150, 130], [150, 110, 80]];
  let wet = 'wet', force = 'push';
  const amt = bindRange('c6amt', v => v === 0 ? '還沒施力' : v < 40 ? '輕輕' : v < 75 ? '用力' : '非常用力', () => draw());
  const TOP = 40, LH = 18, NL = 6;          // 黏土頂面、每層厚度（格點單位）
  // 斷層：通過 (FX, TOP)、往右下傾斜 60°
  const FX = 105, DIP = 60 * Math.PI / 180;
  function layerAt(x0, y0) {
    if (y0 < TOP) return null;
    const k = Math.floor((y0 - TOP) / LH);
    return k >= 0 && k < NL ? COLS[k] : [110, 90, 70];
  }
  function sideHW(x, y) { return x > FX + (y - TOP) / Math.tan(DIP); }    // 斷層面右上方 = 上盤
  function source(x, y, a) {
    if (force === 'slide') return [x, y];
    if (wet === 'wet') {
      if (force === 'push') {                                   // 褶皺：橫向縮短、上下波動
        const sh = 1 - a * .35, cx = GW / 2;
        const x0 = cx + (x - cx) / sh;
        const amp = a * 22 * (0.6 + (y - TOP) / 160);
        return [x0, y - amp * Math.sin((x0 - 20) / 200 * Math.PI * 2 * 1.5)];
      }
      const st = 1 + a * .3, cx = GW / 2; return [cx + (x - cx) / st, TOP + (y - TOP) * st];   // 拉薄
    }
    // 乾：斷層
    const d = a * 30, ux = Math.cos(DIP), uy = Math.sin(DIP);     // 沿斷層面「往下」的方向 (ux, uy)
    if (!sideHW(x, y)) return [x, y];
    return force === 'push' ? [x + ux * d, y + uy * d] : [x - ux * d, y - uy * d];   // 逆：上盤沿斷層面往上 → 原本在更下面
  }
  function draw() {
    S.fit(); ctx.clearRect(0, 0, S.W, S.H);
    const a = +amt.value / 100;
    if (force === 'slide') return drawSlide(a);
    const img = ox.createImageData(GW, GH), dd = img.data;
    for (let y = 0; y < GH; y++) for (let x = 0; x < GW; x++) {
      const [x0, y0] = source(x, y, a);
      let c = (x0 < 12 || x0 > GW - 12) ? null : layerAt(x0, y0);
      const i = (y * GW + x) * 4;
      if (!c) { dd[i] = 234; dd[i + 1] = 243; dd[i + 2] = 248; dd[i + 3] = 255; continue; }
      const stripe = Math.floor((y0 - TOP) / 3) % 6 === 0 ? .9 : 1;
      dd[i] = c[0] * stripe; dd[i + 1] = c[1] * stripe; dd[i + 2] = c[2] * stripe; dd[i + 3] = 255;
    }
    ox.putImageData(img, 0, 0);
    ctx.imageSmoothingEnabled = true; ctx.drawImage(off, 0, 0, S.W, S.H);
    const k = S.W / GW;
    // 力的箭頭
    const fy = (TOP + 55) * k;
    if (force === 'push') { arrow(ctx, 6, fy, 26 + a * 30, fy, '#C62828', 4, 12); arrow(ctx, S.W - 6, fy, S.W - 26 - a * 30, fy, '#C62828', 4, 12); }
    else { arrow(ctx, 40, fy, 4, fy, '#1565C0', 4, 12); arrow(ctx, S.W - 40, fy, S.W - 4, fy, '#1565C0', 4, 12); }
    let txt;
    if (wet === 'wet') txt = force === 'push' ? (a > .05 ? '<b>褶皺</b>：岩層<b>彎曲</b>但沒有斷。地底深處高溫高壓，岩層比較有「可塑性」（容易變形而不斷裂），像濕黏土一樣會彎。' : '按住滑桿慢慢往右拉，對黏土施力。')
      : '拉張時，濕黏土會被拉長、變薄（課本沒有做這個情況）。';
    else {
      if (a > .05) {
        // 斷層線與上下盤標示
        ctx.strokeStyle = '#222'; ctx.lineWidth = 2.5; ctx.setLineDash([7, 5]);
        ctx.beginPath(); ctx.moveTo(FX * k, TOP * k - 30); ctx.lineTo((FX + (GH - TOP) / Math.tan(DIP)) * k, S.H); ctx.stroke(); ctx.setLineDash([]);
        label(ctx, '斷層面', FX * k + 6, TOP * k - 30, { size: 12, bold: true });
        label(ctx, '上盤', 330, 210, { size: 15, bold: true, bg: 'rgba(255,255,255,.85)' });
        label(ctx, '下盤', 70, 250, { size: 15, bold: true, bg: 'rgba(255,255,255,.85)' });
        const ux = Math.cos(DIP), uy = Math.sin(DIP), mx = 300, my = 160;
        if (force === 'push') arrow(ctx, mx + ux * 22, my + uy * 22, mx - ux * 22, my - uy * 22, '#C62828', 3, 10);
        else arrow(ctx, mx - ux * 22, my - uy * 22, mx + ux * 22, my + uy * 22, '#1565C0', 3, 10);
      }
      txt = a <= .05 ? '按住滑桿慢慢往右拉，對黏土施力。' : force === 'push'
        ? '<b>逆斷層</b>：受到<b>擠壓</b>，岩層斷裂後，<b>上盤沿著斷層面往上</b>移動。接近地表的岩層比較「脆」，像乾黏土一樣會斷。例：921 車籠埔斷層。'
        : '<b>正斷層</b>：受到<b>拉張</b>，岩層斷裂後，<b>上盤沿著斷層面往下</b>掉。例：裂谷兩側常見正斷層。';
    }
    document.getElementById('c6clayTxt').innerHTML = txt;
  }
  function drawSlide(a) {
    // 從空中往下看：一條道路和一條小河被斷層水平錯開
    ctx.fillStyle = '#C5D9A4'; ctx.fillRect(0, 0, S.W, S.H);
    const off2 = a * 70, fy = 160;
    ctx.save(); ctx.beginPath(); ctx.rect(0, 0, S.W, fy); ctx.clip(); ctx.translate(-off2 / 2, 0); roadRiver(); ctx.restore();
    ctx.save(); ctx.beginPath(); ctx.rect(0, fy, S.W, S.H - fy); ctx.clip(); ctx.translate(off2 / 2, 0); roadRiver(); ctx.restore();
    ctx.strokeStyle = '#222'; ctx.lineWidth = 3; ctx.setLineDash([8, 6]); ctx.beginPath(); ctx.moveTo(0, fy); ctx.lineTo(S.W, fy); ctx.stroke(); ctx.setLineDash([]);
    arrow(ctx, 330, fy - 24, 270, fy - 24, '#C62828', 3, 10); arrow(ctx, 150, fy + 24, 210, fy + 24, '#C62828', 3, 10);
    label(ctx, '斷層（從空中往下看）', 10, fy - 10, { size: 12, bold: true });
    document.getElementById('c6clayTxt').innerHTML = a > .05 ? '<b>平移斷層</b>：岩層沿著斷層<b>水平</b>錯動，沒有明顯上下移動。從空中看，原本連續的道路、河流被「左右」錯開。例：2025 年緬甸實皆斷層。' : '按住滑桿慢慢往右拉，對岩層施力。';
    function roadRiver() {
      ctx.fillStyle = '#9E9E9E'; ctx.fillRect(200, 0, 26, S.H); ctx.strokeStyle = '#fff'; ctx.setLineDash([10, 10]); ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(213, 0); ctx.lineTo(213, S.H); ctx.stroke(); ctx.setLineDash([]);
      ctx.strokeStyle = '#4F86C6'; ctx.lineWidth = 9; ctx.beginPath(); ctx.moveTo(340, 0); ctx.bezierCurveTo(310, 100, 370, 220, 330, S.H); ctx.stroke();
      ctx.fillStyle = '#2E7D32'; [[80, 60], [110, 250], [420, 90], [60, 200]].forEach(([x, y]) => { ctx.beginPath(); ctx.arc(x, y, 12, 0, 7); ctx.fill(); });
    }
  }
  const pick = (sel, key, setter) => document.querySelectorAll(sel + ' .chip').forEach(b => b.onclick = () => { document.querySelectorAll(sel + ' .chip').forEach(x => x.classList.remove('on')); b.classList.add('on'); setter(b.dataset[key]); amt.value = 0; amt.dispatchEvent(new Event('input')); });
  pick('#c6wet', 'w', v => wet = v); pick('#c6force', 'f', v => force = v);
  registerSim('t3', { start: draw, resize: draw });

  /* ---------- 找上盤 ---------- */
  const hc = document.getElementById('c6hw');
  const H = stage(hc, 420, 280), hx = H.ctx;
  let q = null, score = { ok: 0, n: 0 }, answered = false;
  function newQ() {
    q = { dipRight: Math.random() < .5, normal: Math.random() < .5 }; answered = false;
    document.getElementById('c6hwTxt').innerHTML = '點一下你認為是<b>上盤</b>的那一塊。';
    drawH();
  }
  function faultX(y) { const top = 60, x0 = 210, k = 1 / Math.tan(55 * Math.PI / 180); return q.dipRight ? x0 + (y - top) * k : x0 - (y - top) * k; }
  function isHW(x, y) { return q.dipRight ? x > faultX(y) : x < faultX(y); }
  function drawH(hl) {
    H.fit(); hx.clearRect(0, 0, H.W, H.H);
    hx.fillStyle = '#EAF3F8'; hx.fillRect(0, 0, H.W, H.H);
    const off = 34 * (q.normal ? 1 : -1);          // 上盤相對下盤往下(+)或往上(−)
    const LC = ['#D6A870', '#A07A5A', '#E8D2A0', '#788C6E', '#C89682'];
    for (let y = 20; y < H.H; y += 2) for (let x = 0; x < H.W; x += 2) {
      const hw = isHW(x, y), y0 = y - (hw ? off : 0);
      if (y0 < 60) continue;
      const k = Math.floor((y0 - 60) / 36) % LC.length;
      hx.fillStyle = hl && hw === (hl === 'hw') ? '#FFD27A' : LC[k]; hx.fillRect(x, y, 2, 2);
    }
    hx.strokeStyle = '#222'; hx.lineWidth = 3; hx.beginPath(); hx.moveTo(faultX(40), 40); hx.lineTo(faultX(H.H), H.H); hx.stroke();
    label(hx, '斷層面', faultX(40) + (q.dipRight ? -60 : 10), 30, { size: 12, bold: true });
  }
  hc.addEventListener('pointerdown', e => {
    if (answered) return;
    const p = H.pt(e); if (p.y < 40) return;
    if (p.y - (isHW(p.x, p.y) ? 34 * (q.normal ? 1 : -1) : 0) < 60) return;   // 點到天空不算
    const pickedHW = isHW(p.x, p.y); answered = true; score.n++; if (pickedHW) score.ok++;
    drawH('hw');
    const typ = q.normal ? '正斷層（上盤往下掉）' : '逆斷層（上盤往上推）';
    document.getElementById('c6hwTxt').innerHTML = (pickedHW ? '✔ 答對！' : '✘ 不是喔。') + `黃色那塊才是上盤：它在<b>傾斜斷層面的上方</b>（斷層面「懸」在它的底下）。<br>看地層的錯動，這是 <b>${typ}</b>。<br><span class="note">（圖中為了好看出差異，上盤只畫了上下移動；真實的上盤是沿著斜的斷層面滑動。）</span>`;
    document.getElementById('c6hwScore').innerHTML = `<div><b>${score.ok} / ${score.n}</b><span>答對題數</span></div>`;
  });
  document.getElementById('c6hwNew').onclick = newQ;
  newQ();
  registerSim('t3', { start: () => drawH(answered ? 'hw' : null), resize: () => drawH(answered ? 'hw' : null) });
})();
