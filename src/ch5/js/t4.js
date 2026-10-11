/* ===== 分頁 4：外營力分類、河流模擬器、Hjulström 圖 =====
   河流：海岸在 x=690，海平面 y=330。河床高度 y(x) = 330 − 落差 × u^p，u = (690−x)/660（上游陡、下游緩）。
   流速 ∝ √(流量 × 坡度)，能搬動的最大顆粒 ∝ 流速²。顆粒大於搬運能力就停下來（沉積）。 */
(() => {
  /* ---------- 分類遊戲 ---------- */
  const host = document.getElementById('t4sort'); if (!host) return;
  mountSort(host, ['風化', '侵蝕', '搬運', '沉積'], [
    ['樹根伸進岩縫，把岩石撐裂', 0, '岩石變碎但還留在原地，是生物造成的風化。'],
    ['岩縫裡的水結冰膨脹，把岩石撐破', 0, '水造成的風化（冰楔作用）。風化不一定跟「風」有關！'],
    ['岩石表面的鐵和空氣裡的氧反應，變成紅褐色', 0, '成分被改變，也是風化（課本 p.143）。'],
    ['大雨把山坡上鬆動的碎石沖離原地', 1, '離開原處 → 侵蝕。'],
    ['海浪把岸邊的岩石一塊塊打下來', 1, '岩石被外營力從原處剝離 → 侵蝕。'],
    ['河水把鵝卵石一路滾到下游', 2, '運送到其他地方 → 搬運。'],
    ['撒哈拉沙漠的沙塵被風吹過大西洋', 2, '風也能搬運！而且能搬幾千公里（第 5 分頁有真實案例）。'],
    ['河流到了出海口變慢，泥沙堆成三角洲', 3, '搬運力量減弱而堆積 → 沉積。'],
  ]);

  /* ---------- 河流模擬器 ---------- */
  const cv = document.getElementById('t4cv');
  const S = stage(cv, 760, 400), ctx = S.ctx;
  const COAST = 690, SEA = 330, P = 2.2;
  const rel = bindRange('t4rel', v => v < 130 ? '平緩（平原）' : v < 210 ? '中等' : '陡峭（臺灣山區）');
  const qR = bindRange('t4q', v => v < 70 ? '枯水期' : v < 140 ? '平常' : '豐水期');
  const KIND = [
    { n: '巨石', d: 1.0, r: 8, c: '#78909C', w: .12 },
    { n: '鵝卵石', d: .3, r: 4.5, c: '#A1887F', w: .25 },
    { n: '細沙', d: .06, r: 2.4, c: '#E0B455', w: .33 },
    { n: '泥', d: .01, r: 1.4, c: '#8D6E63', w: .30 },
  ];
  let flood = 0, moving = [], beds = [], delta = 0, spawn = 0;
  const bedY = x => { const u = clamp((COAST - x) / 660, 0, 1); return SEA - +rel.value * Math.pow(u, P); };
  const slope = x => { const u = clamp((COAST - x) / 660, 0, 1); return +rel.value * P * Math.pow(u, P - 1) / 660; };
  const Q = () => +qR.value / 100 * (flood > 0 ? 3 : 1);
  const cap = x => 1.92 * Q() * (slope(x) + .01);       // 能搬動的最大顆粒
  const vel = x => Math.sqrt(Q() * (slope(x) + .01));    // 相對流速
  const stackH = new Map();                               // 每 8px 一格，記錄堆了多高
  function bin(x) { return Math.round(x / 8); }
  function step(dt) {
    if (flood > 0) flood -= dt;
    spawn += dt * 9;
    while (spawn > 1) {
      spawn--;
      let r = Math.random(), k = 0; while ((r -= KIND[k].w) > 0 && k < 3) k++;
      if (moving.length < 260) moving.push({ k, x: 30 + Math.random() * 15, o: Math.random() });
    }
    // 會動的顆粒
    for (let i = moving.length - 1; i >= 0; i--) {
      const p = moving[i], K = KIND[p.k], c = cap(p.x);
      if (p.x >= COAST) {                                 // 進到海裡：慢慢沉到海底，堆成三角洲
        p.x += dt * 30; if (p.x > COAST + 10 + Math.random() * 40) { delta = Math.min(delta + K.d * 4 + .4, 1600); moving.splice(i, 1); }
        continue;
      }
      if (K.d > c * (.45 + .55 * p.o)) {                  // 搬不動了 → 沉積（每顆門檻略不同，沉積帶才會散開）
        const b = bin(p.x), h = stackH.get(b) || 0;
        if (beds.length > 700) { const old = beds.shift(); stackH.set(bin(old.x), Math.max(0, (stackH.get(bin(old.x)) || 0) - KIND[old.k].r)); }
        beds.push({ k: p.k, x: p.x + (Math.random() - .5) * 6, h }); stackH.set(b, Math.min(h + K.r * .5, 12));
        moving.splice(i, 1); continue;
      }
      p.x += dt * (25 + 140 * vel(p.x)) * (1 - K.d / c * .6);
    }
    // 豪雨時，原本搬不動的又被沖走
    for (let i = beds.length - 1; i >= 0; i--) {
      const b = beds[i];
      if (KIND[b.k].d * 1.25 < cap(b.x)) { stackH.set(bin(b.x), Math.max(0, (stackH.get(bin(b.x)) || 0) - KIND[b.k].r * .9)); beds.splice(i, 1); moving.push({ k: b.k, x: b.x + 2, o: Math.random() }); }
    }
    draw();
  }
  function draw() {
    S.fit(); ctx.clearRect(0, 0, S.W, S.H);
    ctx.fillStyle = flood > 0 ? '#C9D6E0' : '#EAF4FA'; ctx.fillRect(0, 0, S.W, S.H);
    if (flood > 0) { ctx.strokeStyle = 'rgba(40,80,140,.35)'; for (let i = 0; i < 80; i++) { const x = (i * 53 + performance.now() / 4) % 760; ctx.beginPath(); ctx.moveTo(x, (i * 31) % 120); ctx.lineTo(x - 5, (i * 31) % 120 + 14); ctx.stroke(); } }
    // 海
    ctx.fillStyle = '#4F86C6'; ctx.fillRect(COAST, SEA, S.W - COAST, S.H - SEA);
    // 三角洲
    if (delta > 0) {
      const L = Math.sqrt(delta) * 1.6, H = Math.min(60, Math.sqrt(delta) * .9);
      ctx.fillStyle = '#9C7B5B'; ctx.beginPath(); ctx.moveTo(COAST - 4, SEA + 2); ctx.lineTo(COAST + L, S.H); ctx.lineTo(COAST, S.H); ctx.fill();
      ctx.fillStyle = '#B8956A'; ctx.beginPath(); ctx.moveTo(COAST - 4, SEA - 1); ctx.lineTo(COAST + L * .5, SEA + H * .2); ctx.lineTo(COAST + L, S.H); ctx.lineTo(COAST, S.H); ctx.fill();
      if (L > 20) label(ctx, '三角洲', COAST + 12, SEA + 30, { size: 13, color: '#fff', bold: true });
    }
    // 地形
    ctx.fillStyle = '#B9A07E'; ctx.beginPath(); ctx.moveTo(0, bedY(0)); for (let x = 0; x <= COAST; x += 6) ctx.lineTo(x, bedY(x));
    ctx.lineTo(COAST, S.H); ctx.lineTo(0, S.H); ctx.fill();
    // 河水（流量愈大愈厚）
    const th = 4 + Q() * 3;
    ctx.strokeStyle = 'rgba(66,135,210,.75)'; ctx.lineWidth = th; ctx.beginPath();
    for (let x = 20; x <= COAST; x += 6) { const y = bedY(x) - th / 2 - (stackH.get(bin(x)) || 0); x === 20 ? ctx.moveTo(x, y) : ctx.lineTo(x, y); } ctx.stroke();
    // 堆積物
    beds.forEach(b => { const K = KIND[b.k]; ctx.fillStyle = K.c; ctx.beginPath(); ctx.arc(b.x, bedY(b.x) - K.r - b.h, K.r, 0, 7); ctx.fill(); });
    // 移動中的顆粒
    moving.forEach(p => { const K = KIND[p.k]; const y = p.x >= COAST ? SEA + (p.x - COAST) * 1.2 : bedY(p.x) - K.r - (stackH.get(bin(p.x)) || 0) - p.o * th * .6;
      ctx.fillStyle = K.c; ctx.globalAlpha = .85; ctx.beginPath(); ctx.arc(p.x, y, K.r, 0, 7); ctx.fill(); ctx.globalAlpha = 1; });
    // 分段標籤
    [['上游', 110], ['中游', 330], ['下游', 560], ['出海口', 700]].forEach(([t, x]) => label(ctx, t, x, 385, { align: 'center', bold: true, size: 15, color: '#3E2723' }));
    // 河谷橫剖面小圖
    [['上游', 110], ['中游', 330], ['下游', 560]].forEach(([t, x], i) => {
      const s = slope(x), bx = 40 + i * 175, by = 18, w = 130, h = 62;
      ctx.fillStyle = 'rgba(255,255,255,.85)'; rrect(ctx, bx, by, w, h, 6); ctx.fill();
      const half = 14 + (1 - clamp(s / .6, 0, 1)) * 46, dep = 14 + clamp(s / .6, 0, 1) * 34;
      ctx.fillStyle = '#B9A07E'; ctx.beginPath(); ctx.moveTo(bx, by + 12); ctx.lineTo(bx + w / 2 - half, by + 12);
      if (s > .45) ctx.lineTo(bx + w / 2, by + 12 + dep); else ctx.quadraticCurveTo(bx + w / 2, by + 12 + dep * 1.6, bx + w / 2 + half, by + 12);
      ctx.lineTo(bx + w / 2 + half, by + 12); ctx.lineTo(bx + w, by + 12); ctx.lineTo(bx + w, by + h); ctx.lineTo(bx, by + h); ctx.fill();
      label(ctx, `${t}河谷：${s > .45 ? 'V 形谷（往下切）' : s > .2 ? '谷底變寬' : '寬闊（往兩側侵蝕）'}`, bx + w / 2, by + h + 10, { align: 'center', size: 11, color: '#455A64' });
    });
    // 讀數
    const can = x => { const c = cap(x); return c >= 1 ? '巨石' : c >= .3 ? '鵝卵石' : c >= .06 ? '細沙' : '泥'; };
    document.getElementById('t4read').innerHTML = [['上游', 110], ['中游', 330], ['下游', 600]].map(([t, x]) =>
      `<div><b>${(vel(x) * 3).toFixed(1)}</b><span>${t}流速（相對）<br>最大能搬：${can(x)}</span></div>`).join('') +
      (flood > 0 ? `<div style="background:#FDECEA"><b>⛈ ${flood.toFixed(0)} 秒</b><span>豪雨中</span></div>` : '');
  }
  document.getElementById('t4flood').onclick = () => { flood = 5; };
  document.getElementById('t4reset').onclick = () => { moving = []; beds = []; delta = 0; stackH.clear(); };
  [rel, qR].forEach(e => e.addEventListener('input', () => { if (e === rel) { beds = []; stackH.clear(); } }));
  const L = loop(step);
  registerSim('t4', { start() { L.start(); }, stop() { L.stop(); } });

  /* ---------- Hjulström 圖 ---------- */
  const hc = document.getElementById('t4hj');
  const H = stage(hc, 560, 400), hx = H.ctx;
  const ERO = [[.001, 200], [.005, 90], [.01, 60], [.05, 28], [.2, 20], [.5, 20], [1, 25], [5, 60], [10, 95], [100, 330], [1000, 1000]];
  const DEP = [[.005, .1], [.01, .2], [.1, 1.5], [1, 10], [10, 60], [100, 250], [1000, 700]];
  const GRAIN = [['黏土', .002], ['粉砂', .02], ['細沙', .2], ['粗沙', 1], ['礫石', 10], ['卵石', 100]];
  const ml = 58, mr = 14, mt = 16, mb = 52;
  const X = d => ml + (Math.log10(d) + 3) / 6 * (H.W - ml - mr);
  const Y = v => H.H - mb - (Math.log10(v) + 1) / 4 * (H.H - mt - mb);
  const interp = (tab, d) => { const L = Math.log10(d); for (let i = 0; i < tab.length - 1; i++) { const a = Math.log10(tab[i][0]), b = Math.log10(tab[i + 1][0]); if (L >= a && L <= b) { const t = (L - a) / (b - a); return Math.pow(10, lerp(Math.log10(tab[i][1]), Math.log10(tab[i + 1][1]), t)); } } return null; };
  const vR = bindRange('t4v', s => { const v = Math.pow(10, -1 + 4 * s / 100); return v < 1 ? v.toFixed(2) + ' 公分/秒' : v < 100 ? v.toFixed(0) + ' 公分/秒' : (v / 100).toFixed(1) + ' 公尺/秒'; }, () => drawH());
  function drawH() {
    H.fit(); hx.clearRect(0, 0, H.W, H.H);
    const v = Math.pow(10, -1 + 4 * +vR.value / 100);
    // 格線
    hx.strokeStyle = '#EEE'; hx.lineWidth = 1;
    for (let e = -3; e <= 3; e++) { hx.beginPath(); hx.moveTo(X(10 ** e), mt); hx.lineTo(X(10 ** e), H.H - mb); hx.stroke(); label(hx, e < 0 ? (10 ** e).toString() : (10 ** e).toString(), X(10 ** e), H.H - mb + 12, { size: 11, align: 'center', color: '#777' }); }
    for (let e = -1; e <= 3; e++) { hx.beginPath(); hx.moveTo(ml, Y(10 ** e)); hx.lineTo(H.W - mr, Y(10 ** e)); hx.stroke(); label(hx, (10 ** e).toString(), ml - 6, Y(10 ** e), { size: 11, align: 'right', color: '#777' }); }
    label(hx, '顆粒直徑（毫米，對數刻度）', (ml + H.W) / 2, H.H - 10, { align: 'center', size: 12, color: '#555' });
    hx.save(); hx.translate(14, (mt + H.H - mb) / 2); hx.rotate(-Math.PI / 2); label(hx, '流速（公分/秒）', 0, 0, { align: 'center', size: 12, color: '#555' }); hx.restore();
    // 區域上色
    hx.fillStyle = 'rgba(229,57,53,.08)'; hx.beginPath(); hx.moveTo(X(ERO[0][0]), mt); ERO.forEach(([d, u]) => hx.lineTo(X(d), Y(u))); hx.lineTo(X(1000), mt); hx.fill();
    hx.fillStyle = 'rgba(30,136,229,.08)'; hx.beginPath(); hx.moveTo(X(DEP[0][0]), H.H - mb); DEP.forEach(([d, u]) => hx.lineTo(X(d), Y(u))); hx.lineTo(X(1000), H.H - mb); hx.fill();
    // 曲線
    [[ERO, '#E53935', '侵蝕（沖起來）'], [DEP, '#1E88E5', '沉積（沉下去）']].forEach(([tab, c, t]) => {
      hx.strokeStyle = c; hx.lineWidth = 3; hx.beginPath(); tab.forEach(([d, u], i) => i ? hx.lineTo(X(d), Y(u)) : hx.moveTo(X(d), Y(u))); hx.stroke();
    });
    label(hx, '侵蝕區', X(.003), Y(500), { color: '#C62828', bold: true, size: 14 });
    label(hx, '搬運區', X(.03), Y(5), { color: '#E65100', bold: true, size: 14 });
    label(hx, '沉積區', X(5), Y(.4), { color: '#1565C0', bold: true, size: 14 });
    // 目前流速
    hx.setLineDash([6, 4]); hx.strokeStyle = '#333'; hx.lineWidth = 2; hx.beginPath(); hx.moveTo(ml, Y(v)); hx.lineTo(H.W - mr, Y(v)); hx.stroke(); hx.setLineDash([]);
    // 顆粒標記
    const rows = GRAIN.map(([n, d]) => {
      const e = interp(ERO, d), s = interp(DEP, d) ?? 0;
      const st = v > e ? ['🔴 從河床被沖起來', '#C62828'] : v > s ? ['🟠 在水中就繼續被帶走；在河床上沖不起來', '#E65100'] : ['🔵 沉下去', '#1565C0'];
      hx.fillStyle = st[1]; hx.beginPath(); hx.arc(X(d), Y(v), 6, 0, 7); hx.fill();
      label(hx, n, X(d), Y(v) - 14, { align: 'center', size: 12, bold: true, color: st[1], bg: 'rgba(255,255,255,.85)' });
      return `<div style="color:${st[1]}"><b>${n}</b>（${d} mm）：${st[0]}</div>`;
    });
    document.getElementById('t4hjList').innerHTML = rows.join('');
  }
  registerSim('t4', { start: drawH, resize: drawH });
})();
