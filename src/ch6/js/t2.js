/* ===== 第六章 分頁 2：板塊交界模擬器（剖面）＋分類 ===== */
(() => {
  const cv = document.getElementById('c6plate'); if (!cv) return;
  const S = stage(cv, 760, 360), ctx = S.ctx;
  const SEA = 120, LITH = 60;               // 海平面 y、岩石圈厚度
  let kind = 'mor', play = false;
  const tR = bindRange('c6pt', v => Math.round(v * .3) + ' 百萬年', () => draw());
  const mag = document.getElementById('c6mag');
  const TXT = {
    mor: '<b>海洋板塊分離 → 中洋脊</b>：兩個板塊被拉開，下方的地函岩石往上升、壓力變小而<b>部分熔融</b>成岩漿，從裂縫湧出，冷卻成新的玄武岩質海洋地殼，在海底形成綿延的火山山脈。<b>離中洋脊愈遠，岩石愈老</b>（顏色愈深）。例：大西洋中洋脊、冰島。',
    rift: '<b>大陸板塊分離 → 裂谷</b>：大陸被拉開，中間的地塊往下陷，形成狹長的谷地，常伴隨火山活動。裂谷繼續擴大，海水灌進來，就會變成新的海洋。例：東非大裂谷（還在裂）、紅海（已經進水）。',
    sub: '<b>海洋板塊撞大陸板塊 → 隱沒</b>：密度大的海洋板塊隱沒到大陸板塊下方，交界處形成很深的<b>海溝</b>；隱沒的板塊在約 100 公里深處釋出水分，讓上方的地函熔點降低而部分熔融，產生岩漿往上噴發形成<b>火山</b>，陸地也被擠出山脈。例：南美洲安地斯山脈。',
    cc: '<b>大陸板塊撞大陸板塊 → 造山</b>：兩塊大陸密度都小、都沉不下去，只好互相擠壓，岩層摺疊、隆起成高大的山脈（造山運動）。例：喜馬拉雅山脈。',
    oo: '<b>🟣 海洋撞海洋 → 島弧</b>：比較老、比較冷、密度比較大的那一塊隱沒下去，形成海溝；岩漿在海上冒出一串火山島，排成弧形，叫做「島弧」。例：馬里亞納群島與馬里亞納海溝、阿留申群島。臺灣東部的海岸山脈，就是一段撞上臺灣的島弧（呂宋島弧）。',
  };
  function asth() {
    const g = ctx.createLinearGradient(0, 240, 0, S.H); g.addColorStop(0, '#E8955A'); g.addColorStop(1, '#C8553D');
    ctx.fillStyle = g; ctx.fillRect(0, 230, S.W, S.H - 230);
    label(ctx, '軟流圈（可塑、緩慢流動）', 12, S.H - 16, { size: 12, color: '#fff', bold: true });
  }
  function sea(y = SEA) { ctx.fillStyle = 'rgba(79,134,198,.85)'; ctx.fillRect(0, y, S.W, 400); }
  function conv(x0, dir, t) {
    // 地函熱對流示意箭頭
    ctx.strokeStyle = 'rgba(255,255,255,.55)'; ctx.lineWidth = 2;
    const ph = (t * 2) % 1;
    for (let k = 0; k < 2; k++) { const r = 34 + k * 20; ctx.beginPath(); ctx.arc(x0, 300, r, dir > 0 ? Math.PI : 0, dir > 0 ? 2 * Math.PI : Math.PI, dir < 0); ctx.stroke(); }
    arrow(ctx, x0 + dir * 30, 266, x0 + dir * 60, 272, 'rgba(255,255,255,.75)', 2, 8);
  }
  function draw() {
    S.fit(); ctx.clearRect(0, 0, S.W, S.H);
    const t = +tR.value / 100;
    ctx.fillStyle = '#DDEBF5'; ctx.fillRect(0, 0, S.W, S.H);
    const mid = 380;
    if (kind === 'mor') {
      sea(); asth();
      const top = 200, v = 260;                  // 每 t=1 推開 260 px
      // 海洋地殼條紋：每 18px 一條，年齡 = 距離 / 速度
      for (let x = 0; x < 380; x += 3) {
        const age = x / v;                          // 0 在中脊
        const born = t * 2 - age;                   // 這條岩石誕生的時間：條紋會隨時間往外移動
        const shade = clamp(age / 1.4, 0, 1), band = Math.floor(born * 6) % 2 ? 12 : -12;
        let col = `rgb(${Math.round(lerp(150, 50, shade) + band)},${Math.round(lerp(150, 60, shade) + band)},${Math.round(lerp(160, 70, shade) + band)})`;
        if (mag.checked) col = Math.floor(born * 9 + 100) % 2 ? '#2C2C2C' : '#D9D9D9';
        const ridge = 40 * Math.exp(-x / 70);
        ctx.fillStyle = col;
        [mid - x - 3, mid + x].forEach(xx => ctx.fillRect(xx, top - ridge, 3, LITH * .5 + ridge));
        ctx.fillStyle = 'rgba(70,60,60,.9)'; [mid - x - 3, mid + x].forEach(xx => ctx.fillRect(xx, top + LITH * .5, 3, LITH * .5));
      }
      // 岩漿上湧
      ctx.fillStyle = '#FF7043'; ctx.beginPath(); ctx.moveTo(mid - 10, 240); ctx.quadraticCurveTo(mid, 160, mid + 10, 240); ctx.fill();
      arrow(ctx, mid - 60, 180, mid - 140, 180, '#fff', 3, 12); arrow(ctx, mid + 60, 180, mid + 140, 180, '#fff', 3, 12);
      conv(mid - 120, -1, t); conv(mid + 120, 1, t);
      label(ctx, '中洋脊', mid, top - 56, { align: 'center', bold: true, size: 15, bg: 'rgba(255,255,255,.85)' });
      label(ctx, '新', mid, top + 44, { align: 'center', size: 12, color: '#fff' }); label(ctx, '舊', 60, top + 44, { size: 12, color: '#fff' }); label(ctx, '舊', 700, top + 44, { size: 12, color: '#fff' });
      if (mag.checked) label(ctx, '黑白條紋左右對稱！', mid, 30, { align: 'center', bold: true, size: 14, color: '#4A2C7A', bg: 'rgba(255,255,255,.9)' });
    } else if (kind === 'rift') {
      asth();
      const w = 40 + t * 160, d = t * 90;
      const flood = t > .65;
      // 大陸塊（左右兩塊 + 中間下陷的地塊）
      ctx.fillStyle = '#B8956A';
      ctx.fillRect(0, 120, mid - w / 2, 120); ctx.fillRect(mid + w / 2, 120, S.W - mid - w / 2, 120);
      ctx.fillStyle = '#A88458'; ctx.beginPath(); ctx.moveTo(mid - w / 2, 120 + d); ctx.lineTo(mid + w / 2, 120 + d); ctx.lineTo(mid + w / 2 - 20, 240); ctx.lineTo(mid - w / 2 + 20, 240); ctx.fill();
      ctx.fillStyle = '#8BC34A'; ctx.fillRect(0, 114, mid - w / 2, 6); ctx.fillRect(mid + w / 2, 114, S.W - mid - w / 2, 6);
      if (flood) { ctx.fillStyle = 'rgba(79,134,198,.9)'; ctx.fillRect(mid - w / 2, 126 + d * .2, w, d * .8); label(ctx, '海水灌進來 → 新的海洋誕生', mid, 100, { align: 'center', bold: true, size: 14, color: '#0D47A1', bg: 'rgba(255,255,255,.85)' }); }
      else label(ctx, '裂谷', mid, 120 + d - 12, { align: 'center', bold: true, size: 14, bg: 'rgba(255,255,255,.85)' });
      ctx.fillStyle = '#FF7043'; ctx.beginPath(); ctx.moveTo(mid - 12, 240); ctx.quadraticCurveTo(mid, 200 - t * 30, mid + 12, 240); ctx.fill();
      arrow(ctx, 160, 180, 80, 180, '#fff', 3, 12); arrow(ctx, 600, 180, 680, 180, '#fff', 3, 12);
      label(ctx, '大陸板塊', 120, 160, { size: 13, color: '#fff', bold: true }); label(ctx, '大陸板塊', 600, 160, { size: 13, color: '#fff', bold: true });
    } else if (kind === 'sub' || kind === 'oo') {
      sea(); asth();
      const tr = 430, pushed = t * 120;
      // 隱沒的海洋板塊（左邊往右，往下彎）
      ctx.fillStyle = '#5B5B66';
      ctx.beginPath(); ctx.moveTo(0, 190); ctx.lineTo(tr - 20, 190);
      ctx.quadraticCurveTo(tr + 40, 195, tr + 60 + pushed * .6, 290 + pushed * .3); ctx.lineTo(tr + 20 + pushed * .6, 320 + pushed * .3);
      ctx.quadraticCurveTo(tr + 10, 240, tr - 30, 240); ctx.lineTo(0, 240); ctx.fill();
      label(ctx, '海洋板塊（密度大）', 30, 214, { size: 13, color: '#fff', bold: true });
      arrow(ctx, 200, 170, 300, 170, '#fff', 3, 12);
      // 上覆板塊
      if (kind === 'sub') {
        const mtn = 20 + t * 32;
        ctx.fillStyle = '#B8956A'; ctx.beginPath(); ctx.moveTo(tr, 128); ctx.lineTo(tr + 60, 112); ctx.lineTo(tr + 130, 112 - mtn * .5); ctx.lineTo(tr + 170, 112 - mtn); ctx.lineTo(tr + 210, 112 - mtn * .6); ctx.lineTo(S.W, 108); ctx.lineTo(S.W, 230); ctx.lineTo(tr + 70, 230); ctx.quadraticCurveTo(tr + 20, 200, tr, 150); ctx.fill();
        label(ctx, '大陸板塊（密度小）', 620, 200, { size: 13, color: '#fff', bold: true, align: 'center' });
      } else {
        ctx.fillStyle = '#6E6E78'; ctx.beginPath(); ctx.moveTo(tr, 150); ctx.lineTo(S.W, 150); ctx.lineTo(S.W, 210); ctx.lineTo(tr + 70, 210); ctx.quadraticCurveTo(tr + 20, 190, tr, 160); ctx.fill();
        label(ctx, '另一塊海洋板塊（較年輕、較輕）', 610, 190, { size: 12, color: '#fff', bold: true, align: 'center' });
      }
      // 海溝
      label(ctx, '海溝', tr - 12, 150, { align: 'center', bold: true, size: 14, bg: 'rgba(255,255,255,.85)' });
      // 岩漿上升與火山
      const vx = tr + 170, vTop = kind === 'sub' ? 112 - (20 + t * 32) - 10 : SEA - t * 40;
      ctx.fillStyle = 'rgba(255,112,67,.85)'; ctx.beginPath(); ctx.moveTo(vx - 6, 270); ctx.quadraticCurveTo(vx - 20, 200, vx - 3, vTop + 12); ctx.lineTo(vx + 3, vTop + 12); ctx.quadraticCurveTo(vx + 20, 200, vx + 6, 270); ctx.fill();
      if (t > .15) {
        ctx.fillStyle = kind === 'sub' ? '#8D6E63' : '#7E6A5A'; ctx.beginPath(); ctx.moveTo(vx - 40, kind === 'sub' ? vTop + 40 : SEA + 2); ctx.lineTo(vx - 6, vTop); ctx.lineTo(vx + 6, vTop); ctx.lineTo(vx + 40, kind === 'sub' ? vTop + 40 : SEA + 2); ctx.fill();
        ctx.fillStyle = 'rgba(120,120,120,.6)'; for (let k = 0; k < 4; k++) { ctx.beginPath(); ctx.arc(vx + k * 9, vTop - 12 - k * 10, 8 + k * 2, 0, 7); ctx.fill(); }
        label(ctx, kind === 'sub' ? '火山、山脈' : '火山島（島弧）', vx + 70, Math.max(16, vTop - 20), { align: 'center', bold: true, size: 14, bg: 'rgba(255,255,255,.85)' });
      }
      label(ctx, '約 100 公里深：產生岩漿', vx + 20, 280, { size: 12, color: '#fff' });
    } else if (kind === 'cc') {
      asth();
      const up = t * 92, sq = t * 60;
      ctx.fillStyle = '#B8956A';
      ctx.beginPath(); ctx.moveTo(0, 120); ctx.lineTo(mid - 120 + sq * .2, 120);
      for (let x = mid - 120; x <= mid + 120; x += 10) { const f = Math.cos((x - mid) / 120 * Math.PI / 2); ctx.lineTo(x, 120 - up * f * f - (x % 30 === 0 ? 6 : 0) * t); }
      ctx.lineTo(S.W, 120); ctx.lineTo(S.W, 240 + 0); ctx.lineTo(mid + 120, 240);
      for (let x = mid + 120; x >= mid - 120; x -= 10) { const f = Math.cos((x - mid) / 120 * Math.PI / 2); ctx.lineTo(x, 240 + up * .6 * f * f); }
      ctx.lineTo(0, 240); ctx.fill();
      // 褶皺紋路
      ctx.strokeStyle = 'rgba(90,60,30,.5)'; ctx.lineWidth = 1.5;
      for (let k = 0; k < 5; k++) { ctx.beginPath(); for (let x = mid - 110; x <= mid + 110; x += 4) { const f = Math.cos((x - mid) / 120 * Math.PI / 2); const y = 140 + k * 20 - up * f * f * (1 - k * .12) + Math.sin(x / 14) * 10 * t; x === mid - 110 ? ctx.moveTo(x, y) : ctx.lineTo(x, y); } ctx.stroke(); }
      ctx.fillStyle = '#fff'; if (up > 60) { ctx.beginPath(); ctx.moveTo(mid - 30, 120 - up + 30); ctx.lineTo(mid, 120 - up); ctx.lineTo(mid + 30, 120 - up + 30); ctx.fill(); }
      arrow(ctx, 80, 180, 180, 180, '#fff', 3, 12); arrow(ctx, 680, 180, 580, 180, '#fff', 3, 12);
      label(ctx, '大陸板塊', 60, 150, { size: 13, color: '#fff', bold: true }); label(ctx, '大陸板塊', 620, 150, { size: 13, color: '#fff', bold: true });
      if (t > .2) label(ctx, '高大的山脈（造山運動）', mid, 120 - up - 18, { align: 'center', bold: true, size: 14, bg: 'rgba(255,255,255,.85)' });
    }
    document.getElementById('c6pTxt').innerHTML = TXT[kind] + (kind === 'mor' && mag.checked ? '<br><span class="note">🟣 地球磁場每隔一段時間會南北翻轉。新岩石冷卻時會「記住」當時的磁場方向，所以海底出現左右對稱的黑白條紋——這是「海底擴張」最有力的證據，也讓韋格納的大陸漂移說被平反。</span>' : '');
  }
  document.querySelectorAll('#c6pb .chip').forEach(b => b.onclick = () => { document.querySelectorAll('#c6pb .chip').forEach(x => x.classList.remove('on')); b.classList.add('on'); kind = b.dataset.k; tR.value = 0; tR.dispatchEvent(new Event('input')); if (!play) pBtn.click(); });
  mag.onchange = draw;
  const pBtn = document.getElementById('c6pplay');
  pBtn.onclick = () => { play = !play; pBtn.textContent = play ? '⏸ 暫停' : '▶ 播放'; if (play && +tR.value >= 100) tR.value = 0; };
  const L = loop(dt => { if (play) { tR.value = Math.min(100, +tR.value + dt * 12); tR.dispatchEvent(new Event('input')); if (+tR.value >= 100) pBtn.click(); } });
  registerSim('t2', { start() { draw(); L.start(); }, stop() { L.stop(); }, resize: draw });

  mountSort(document.getElementById('c6sort'), ['板塊分離', '板塊聚合'], [
    ['冰島', 0, '中洋脊露出海面的地方（北美洲板塊與歐亞板塊分離）。'],
    ['東非大裂谷', 0, '大陸正在被拉開。'],
    ['大西洋中洋脊', 0, '海底綿延的火山山脈。'],
    ['喜馬拉雅山脈', 1, '印度板塊與歐亞板塊（大陸撞大陸）。'],
    ['安地斯山脈', 1, '納茲卡板塊隱沒到南美洲板塊下方（海洋撞大陸）。'],
    ['日本的富士山', 1, '隱沒帶上的火山。'],
    ['臺灣的中央山脈', 1, '菲律賓海板塊擠壓歐亞板塊。'],
  ]);
})();
