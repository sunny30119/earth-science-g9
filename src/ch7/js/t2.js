/* ===== 第七章 分頁 2：太陽系縮小模型、密度水缸、行星判定器、流星模擬 ===== */
(() => {
  const cv = document.getElementById('c7model'); if (!cv) return;
  // [名稱, 直徑(km), 距離(AU), 相對質量, 密度, 類型, 顏色, 特色]
  const PL = [
    ['水星', 4879, .39, .06, 5.43, '類地', '#A8A8A8', '幾乎沒有大氣，日夜溫差很大（約 −180～430 °C）。'],
    ['金星', 12104, .72, .82, 5.24, '類地', '#E8C27A', '大氣濃密、以二氧化碳為主，溫室效應強，平均溫度高達約 470 °C。'],
    ['地球', 12742, 1, 1, 5.51, '類地', '#4A90E2', '大氣以氮氣、氧氣為主，平均溫度約 15 °C，目前唯一發現水三態並存的行星。'],
    ['火星', 6779, 1.52, .11, 3.93, '類地', '#D0623D', '大氣稀薄，以二氧化碳為主，溫度變化大。'],
    ['木星', 139820, 5.2, 317.83, 1.33, '類木', '#D9B38C', '太陽系最大的行星，主要由氫氣和氦氣組成，有大紅斑。'],
    ['土星', 116460, 9.57, 95.16, .69, '類木', '#E8D39A', '第二大的行星，有明顯的環；密度比水還小！'],
    ['天王星', 50724, 19.18, 14.54, 1.28, '類木', '#8FD3E8', '主要由各種冰（水、氨、甲烷）組成，自轉軸幾乎「躺著」。'],
    ['海王星', 49244, 30.07, 17.15, 1.64, '類木', '#4F6FD8', '離太陽最遠的行星，主要由各種冰組成。'],
  ];
  const SUN_D = 1392700, AU_KM = 1.496e8;
  let ball = .24;
  const S = stage(cv, 780, 200), ctx = S.ctx;
  const fmtLen = m => m >= 1000 ? (m / 1000).toFixed(2) + ' 公里' : m >= 1 ? m.toFixed(m < 10 ? 1 : 0) + ' 公尺' : m >= .01 ? (m * 100).toFixed(1) + ' 公分' : (m * 1000).toFixed(1) + ' 公釐';
  const things = d => d < .001 ? '一粒細沙' : d < .003 ? '一粒芝麻' : d < .006 ? '一粒綠豆' : d < .02 ? '一顆彈珠' : d < .04 ? '一顆乒乓球' : d < .1 ? '一顆網球' : '一顆小西瓜';
  function drawModel() {
    S.fit(); ctx.fillStyle = '#0B1020'; ctx.fillRect(0, 0, S.W, S.H);
    const k = ball / (SUN_D * 1000);   // 每公尺真實長度 → 模型公尺
    const maxD = 30.07 * AU_KM * 1000 * k, x0 = 30, x1 = 760, X = m => x0 + m / maxD * (x1 - x0);
    ctx.fillStyle = '#FFD54F'; ctx.beginPath(); ctx.arc(x0, 100, 10, 0, 7); ctx.fill(); label(ctx, '太陽', x0, 130, { color: '#FFD54F', size: 12, align: 'center' });
    ctx.strokeStyle = 'rgba(255,255,255,.25)'; ctx.beginPath(); ctx.moveTo(x0, 100); ctx.lineTo(x1, 100); ctx.stroke();
    PL.forEach(([n, d, au, , , , c], i) => { const x = X(au * AU_KM * 1000 * k); ctx.fillStyle = c; ctx.beginPath(); ctx.arc(x, 100, i > 3 ? 5 : 3, 0, 7); ctx.fill(); if (i >= 3 || i === 0) label(ctx, n, x, i % 2 ? 80 : 120, { color: '#fff', size: 12, align: 'center' }); });
    label(ctx, '←（這 4 顆擠在一起）', X(1.5 * AU_KM * 1000 * k) + 14, 60, { color: '#aaa', size: 11 });
    label(ctx, `海王星在 ${fmtLen(maxD)} 外`, x1, 175, { color: '#fff', size: 13, align: 'right', bold: true });
    document.getElementById('c7mt').innerHTML = '<tr><th>行星</th><th>模型中的大小</th><th>像什麼</th><th>離「太陽」多遠</th></tr>' +
      PL.map(([n, d, au]) => { const md = d * 1000 * k, ms = au * AU_KM * 1000 * k; return `<tr><td>${n}</td><td>${fmtLen(md)}</td><td>${things(md)}</td><td>${fmtLen(ms)}</td></tr>`; }).join('');
  }
  document.querySelectorAll('#c7scale .chip').forEach(b => b.onclick = () => { document.querySelectorAll('#c7scale .chip').forEach(x => x.classList.remove('on')); b.classList.add('on'); ball = +b.dataset.s; drawModel(); });
  registerSim('t2', { start: drawModel, resize: drawModel });

  /* ---------- 密度水缸 ---------- */
  const T = stage(document.getElementById('c7tank'), 360, 240), tx = T.ctx;
  let selP = 5, drop = 1;
  const plBox = document.getElementById('c7pl');
  PL.forEach((p, i) => { const b = document.createElement('button'); b.className = 'chip' + (i === selP ? ' on' : ''); b.textContent = p[0]; b.onclick = () => { plBox.querySelectorAll('.chip').forEach(x => x.classList.remove('on')); b.classList.add('on'); selP = i; drop = 0; }; plBox.appendChild(b); });
  function tank(dt) {
    drop = Math.min(1, drop + (dt || 0) * .7);
    T.fit(); tx.clearRect(0, 0, T.W, T.H);
    const [n, , , , D, typ, c, f] = PL[selP];
    const surf = 90, bottom = 220, r = 26, floats = D < 1;
    tx.fillStyle = '#BFE3F7'; tx.fillRect(40, surf, 280, bottom - surf);
    tx.strokeStyle = '#555'; tx.lineWidth = 3; tx.beginPath(); tx.moveTo(40, 40); tx.lineTo(40, bottom); tx.lineTo(320, bottom); tx.lineTo(320, 40); tx.stroke();
    const target = floats ? surf - r + 2 * r * D : bottom - r - 2;
    const y = lerp(10, target, drop * drop);
    tx.fillStyle = c; tx.beginPath(); tx.arc(180, y, r, 0, 7); tx.fill();
    if (n === '土星') { tx.strokeStyle = '#C9B37A'; tx.lineWidth = 4; tx.beginPath(); tx.ellipse(180, y, 44, 10, -.2, 0, 7); tx.stroke(); }
    label(tx, '水（密度 1 g/cm³）', 50, bottom - 12, { size: 12, color: '#0D47A1' });
    document.getElementById('c7tankTxt').innerHTML = `<b>${n}</b>（${typ}行星）密度 <b>${D}</b> g/cm³ → ${drop < 1 ? '……' : floats ? '<b style="color:#2E7D32">浮起來了！</b>' : '沉下去。'}<br>${f}`;
  }
  const TL = loop(tank);
  registerSim('t2', { start() { TL.start(); }, stop() { TL.stop(); } });

  /* ---------- 行星判定器 ---------- */
  const OBJ = [['地球', [1, 1, 1]], ['木星', [1, 1, 1]], ['冥王星', [1, 1, 0]], ['穀神星', [1, 1, 0]], ['月球', [0, 1, 0]], ['哈雷彗星', [1, 0, 0]], ['小行星帶裡的小行星', [1, 0, 0]]];
  const CRIT = ['① 繞著恆星（太陽）運轉', '② 質量夠大，形狀接近球體', '③ 能清除軌道上的其他小天體'];
  let selO = 2;
  const oBox = document.getElementById('c7obj');
  OBJ.forEach((o, i) => { const b = document.createElement('button'); b.className = 'chip' + (i === selO ? ' on' : ''); b.textContent = o[0]; b.onclick = () => { oBox.querySelectorAll('.chip').forEach(x => x.classList.remove('on')); b.classList.add('on'); selO = i; judge(); }; oBox.appendChild(b); });
  function judge() {
    const [n, c] = OBJ[selO];
    document.getElementById('c7crit').innerHTML = CRIT.map((t, i) => `<div class="item" style="padding:4px 0">${c[i] ? '✅' : '❌'} ${t}</div>`).join('');
    const res = n === '月球' ? '<b>衛星</b>：它不是繞太陽，而是繞著行星（地球）公轉。' : c[2] ? '<b>行星</b>：三條都符合。' : c[1] ? '<b>矮行星</b>：符合 ①②，但無法清除軌道上的其他小天體。冥王星在 2006 年就是因此從「行星」改為「矮行星」。' : '<b>太陽系小天體</b>：只符合第 ① 條。';
    document.getElementById('c7critTxt').innerHTML = `${n} → ${res}`;
  }
  judge();

  /* ---------- 流星模擬 ---------- */
  const M = stage(document.getElementById('c7met'), 420, 280), mx = M.ctx;
  const msz = bindRange('c7msz', v => v < 20 ? '沙粒大小' : v < 60 ? '拳頭大小' : v < 90 ? '一台汽車' : '一棟房子（約 20 公尺）');
  let met = null;
  function metStep(dt) {
    M.fit(); mx.fillStyle = '#0B1020'; mx.fillRect(0, 0, M.W, M.H);
    const g = mx.createLinearGradient(0, 120, 0, 280); g.addColorStop(0, 'rgba(70,130,200,0)'); g.addColorStop(1, 'rgba(70,130,200,.55)'); mx.fillStyle = g; mx.fillRect(0, 120, M.W, 160);
    mx.fillStyle = '#3E5B2E'; mx.fillRect(0, 262, M.W, 18);
    label(mx, '大氣層', 10, 150, { color: '#9cc3ee', size: 12 }); label(mx, '地面', 10, 271, { color: '#cfe', size: 12 });
    if (met) {
      met.t += dt; const p = met.t / 2.2, x = 60 + p * 300, y = 10 + p * 260;
      const inAir = y > 120, size = +msz.value;
      met.mass = inAir ? met.mass - dt * 1.4 : met.mass;
      if (met.mass > 0 || !inAir) {
        if (inAir) { for (let k = 0; k < 14; k++) { mx.strokeStyle = `rgba(255,${200 - k * 10},120,${.6 - k * .04})`; mx.lineWidth = 3 + size / 25; mx.beginPath(); mx.moveTo(x - k * 7, y - k * 6); mx.lineTo(x - (k + 1) * 7, y - (k + 1) * 6); mx.stroke(); } }
        mx.fillStyle = inAir ? '#FFF3C4' : '#888'; mx.beginPath(); mx.arc(x, y, 2 + size / 30, 0, 7); mx.fill();
      }
      if (y >= 262 && met.mass > 0 && !met.done) { met.done = true; met.hit = x; }
      if (met.done) { mx.fillStyle = '#5D4037'; mx.beginPath(); mx.ellipse(met.hit, 264, 14, 4, 0, 0, 7); mx.fill(); label(mx, '隕石！', met.hit, 245, { color: '#FFD27A', bold: true, size: 14, align: 'center' }); }
      if (met.t > 2.6 && !met.msg) { met.msg = true; document.getElementById('c7mTxt').innerHTML = met.done ? '一部分沒有燒完，掉到地面 → <b>隕石</b>。' : '在大氣層中和空氣摩擦，燒得一乾二淨，只留下一道亮光 → <b>流星</b>。'; }
    }
  }
  document.getElementById('c7mgo').onclick = () => { const s = +msz.value; met = { t: 0, mass: s < 20 ? .3 : s < 60 ? .9 : s < 90 ? 1.8 : 3, done: false }; document.getElementById('c7mTxt').textContent = ''; };
  const ML = loop(metStep);
  registerSim('t2', { start() { ML.start(); }, stop() { ML.stop(); } });
})();
