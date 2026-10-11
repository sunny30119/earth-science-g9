/* =====================================================================
   地科互動課本 共用引擎
   - 分頁切換、一般班／資優班、投影模式、抽號、鍵盤翻頁
   - 畫布工具 stage()／loop()
   - 「猜一猜」(全班) 與「迷思擂台」(資優) 兩種互動元件
   ===================================================================== */
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const lerp = (a, b, t) => a + (b - a) * t;

/* ---------- 存檔（只存介面偏好，壞掉也不影響使用） ---------- */
const store = {
  get() { try { return JSON.parse(localStorage.getItem(STORE_KEY)) || {}; } catch { return {}; } },
  set(o) { try { localStorage.setItem(STORE_KEY, JSON.stringify({ ...store.get(), ...o })); } catch {} },
};

/* ---------- 分頁 ---------- */
const SIMS = {};
let curTab = null;
function registerSim(tab, obj) {
  (SIMS[tab] ||= []).push(obj);
  if (curTab === tab && obj.start) obj.start();
}
function showTab(id) {
  if (!document.getElementById('p-' + id)) return;
  if (curTab && SIMS[curTab]) SIMS[curTab].forEach(s => s.stop && s.stop());
  $$('nav.tabs button').forEach(b => b.classList.toggle('active', b.dataset.tab === id));
  $$('.panel').forEach(p => p.classList.toggle('active', p.id === 'p-' + id));
  curTab = id;
  requestAnimationFrame(() => (SIMS[id] || []).forEach(s => s.start && s.start()));
  store.set({ tab: id });
  window.scrollTo({ top: 0 });
  const b = $(`nav.tabs button[data-tab="${id}"]`);
  if (b) b.scrollIntoView({ inline: 'center', block: 'nearest' });
}
function stepTab(d) {
  const ids = $$('nav.tabs button').map(b => b.dataset.tab);
  const i = ids.indexOf(curTab);
  showTab(ids[clamp(i + d, 0, ids.length - 1)]);
}

/* ---------- 一般班 / 資優班 ---------- */
function setMode(m) {
  $$('#modeSeg button').forEach(b => b.classList.toggle('on', b.dataset.mode === m));
  $$('details.deep').forEach(d => d.open = (m === 'deep'));
  document.body.dataset.mode = m;
  store.set({ mode: m });
}

/* ---------- 畫布工具：用固定的邏輯座標 W×H 作畫，自動配合螢幕寬度 ---------- */
function stage(cv, W, H) {
  cv.style.aspectRatio = `${W} / ${H}`;
  cv.style.setProperty('--ar', W / H);
  const ctx = cv.getContext('2d');
  const s = { cv, ctx, W, H, fit() {
    const dpr = window.devicePixelRatio || 1;
    const cw = cv.clientWidth || 600;
    const pw = Math.round(cw * dpr), ph = Math.round(cw * H / W * dpr);
    if (cv.width !== pw || cv.height !== ph) { cv.width = pw; cv.height = ph; }
    ctx.setTransform(pw / W, 0, 0, ph / H, 0, 0);
  }, pt(e) {
    const r = cv.getBoundingClientRect();
    return { x: (e.clientX - r.left) / r.width * W, y: (e.clientY - r.top) / r.height * H };
  } };
  return s;
}
/* 動畫迴圈：分頁不在畫面上就停，省電 */
function loop(fn) {
  let id = null, last = 0;
  return {
    start() {
      if (id) return; last = performance.now();
      const f = t => { const dt = Math.min(0.05, (t - last) / 1000); last = t; fn(dt); id = requestAnimationFrame(f); };
      id = requestAnimationFrame(f);
    },
    stop() { cancelAnimationFrame(id); id = null; },
  };
}
/* 滑桿綁定：<input id> + <output for=id> */
function bindRange(id, fmt, onChange) {
  const el = document.getElementById(id);
  const out = $(`output[for="${id}"]`);
  const lab = () => { if (out) out.textContent = fmt ? fmt(+el.value) : el.value; };
  el.addEventListener('input', () => { lab(); onChange && onChange(+el.value); });
  lab();   // 一開始只更新文字，不觸發重畫（畫布可能還沒準備好）
  return el;
}
/* 常用繪圖 */
function rrect(ctx, x, y, w, h, r) {
  ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath();
}
function label(ctx, txt, x, y, opt = {}) {
  ctx.save();
  const sz = Math.max(13, opt.size || 15);   // 投影時畫布會縮小，文字至少 13
  ctx.font = `${opt.bold ? 'bold ' : ''}${sz}px "PingFang TC","Microsoft JhengHei",sans-serif`;
  ctx.textAlign = opt.align || 'left'; ctx.textBaseline = opt.base || 'middle';
  if (opt.bg) {
    const w = ctx.measureText(txt).width, h = sz + 8;
    const x0 = opt.align === 'center' ? x - w / 2 - 6 : opt.align === 'right' ? x - w - 6 : x - 6;
    ctx.fillStyle = opt.bg; rrect(ctx, x0, y - h / 2, w + 12, h, 5); ctx.fill();
  }
  ctx.fillStyle = opt.color || '#23302B'; ctx.fillText(txt, x, y);
  ctx.restore();
}
function arrow(ctx, x1, y1, x2, y2, color = '#333', w = 2, head = 9) {
  const a = Math.atan2(y2 - y1, x2 - x1);
  ctx.save(); ctx.strokeStyle = ctx.fillStyle = color; ctx.lineWidth = w;
  ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2 - Math.cos(a) * head * .6, y2 - Math.sin(a) * head * .6); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(x2, y2);
  ctx.lineTo(x2 - head * Math.cos(a - .45), y2 - head * Math.sin(a - .45));
  ctx.lineTo(x2 - head * Math.cos(a + .45), y2 - head * Math.sin(a + .45)); ctx.closePath(); ctx.fill();
  ctx.restore();
}
/* 可重現的亂數（同一個種子每次畫出一樣的圖） */
function rng(seed) { let s = seed >>> 0 || 1; return () => (s = (s * 1664525 + 1013904223) >>> 0) / 4294967296; }

/* ---------- 投票選項（老師數舉手，點 + / −） ---------- */
function voteList(host, opts, onPick) {
  const counts = opts.map(() => 0);
  host.innerHTML = '';
  const wrap = document.createElement('div'); wrap.className = 'opts';
  const rows = opts.map((t, i) => {
    const row = document.createElement('div'); row.className = 'opt'; row.tabIndex = 0;
    row.innerHTML = `<span class="letter">${'ABCDEF'[i]}</span><span class="t">${t}</span>
      <span class="bar"><i style="width:0"></i><em>0 人</em></span>
      <span class="vote-ctl"><button title="少一票">−</button><button title="多一票">＋</button></span>`;
    const [minus, plus] = $$('.vote-ctl button', row);
    const upd = () => {
      const tot = counts.reduce((a, b) => a + b, 0) || 1;
      rows.forEach((r, k) => { $('.bar i', r).style.width = (counts[k] / tot * 90) + 'px'; $('.bar em', r).textContent = counts[k] + ' 人'; });
    };
    plus.onclick = e => { e.stopPropagation(); counts[i]++; upd(); };
    minus.onclick = e => { e.stopPropagation(); counts[i] = Math.max(0, counts[i] - 1); upd(); };
    row.onclick = () => { rows.forEach(r => r.classList.remove('picked')); row.classList.add('picked'); onPick && onPick(i); };
    wrap.appendChild(row);
    return row;
  });
  host.appendChild(wrap);
  return {
    counts,
    reveal(ans) { rows.forEach((r, k) => r.classList.add(k === ans ? 'right' : 'wrong')); },
  };
}

/* ---------- 猜一猜（全班版：先猜 → 操作模擬 → 公布） ---------- */
function mountGuess(host, g) {
  host.classList.add('card', 'guess');
  host.innerHTML = `<h3>🤔 猜一猜 <span class="tag note">先舉手投票，再用這一頁的模擬驗證</span></h3>
    <div class="q">${g.q}</div><div class="vl"></div>
    <div class="btnrow" style="margin-top:10px"><button class="btn warn">公布答案</button></div>
    <div class="reveal callout good">${g.after}</div>`;
  const v = voteList($('.vl', host), g.opts);
  $('.btn', host).onclick = () => { v.reveal(g.ans); $('.reveal', host).classList.add('show'); };
}

/* ---------- 迷思擂台（資優版：先賭 → 跑模擬 → 撞牆 → 重建 → 再考） ---------- */
function mountArena(host, a) {
  const names = ['① 先賭', '② 跑模擬', '③ 撞牆', '④ 重建', '⑤ 換情境再考'];
  host.classList.add('arena');
  host.innerHTML = `<h4>⚔️ ${a.title}</h4>
    <div class="steps">${names.map(n => `<span>${n}</span>`).join('')}</div>
    <div class="stage s0"><div class="q big" style="margin-bottom:8px">${a.q}</div><div class="vl"></div>
      <div class="btnrow" style="margin-top:10px"><button class="btn deepb go1">鎖定預測，去驗證 →</button></div></div>
    <div class="stage s1"><div class="callout">${a.sim}</div>
      <div class="btnrow" style="margin-top:10px"><button class="btn deepb go2">做完了，對照全班的預測 →</button></div></div>
    <div class="stage s2"><div class="clash"><b>結果：</b><span class="stat"></span><br>${a.clash}</div>
      <div class="btnrow"><button class="btn deepb go3">我們來把它想清楚 →</button></div></div>
    <div class="stage s3">${a.hints.map((h, i) => `<div class="hint">💡 提示 ${i + 1}：${h}</div>`).join('')}
      <div class="btnrow" style="margin-top:8px"><button class="btn ghost more">下一個提示</button>
      <button class="btn deepb go4" style="display:none">看完整解釋 →</button></div>
      <div class="explain" style="display:none">${a.explain}</div>
      <div class="btnrow" style="margin-top:10px"><button class="btn deepb go5" style="display:none">換個情境考考你 →</button></div></div>
    <div class="stage s4"><div class="q big" style="margin-bottom:8px">${a.transfer.q}</div><div class="vt"></div>
      <div class="reveal explain tw">${a.transfer.why}</div>
      <div class="btnrow" style="margin-top:10px"><button class="btn ghost restart">↺ 重新開始這一關</button></div></div>`;
  const stages = $$('.stage', host), chips = $$('.steps span', host);
  const go = (n, quiet) => {
    stages.forEach((s, i) => s.classList.toggle('show', i <= n));
    chips.forEach((c, i) => { c.classList.toggle('now', i === n); c.classList.toggle('done', i < n); });
    if (!quiet) stages[n].scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  };
  const v = voteList($('.vl', host), a.opts);
  $('.go1', host).onclick = () => go(1);
  $('.go2', host).onclick = () => {
    const tot = v.counts.reduce((x, y) => x + y, 0);
    const right = v.counts[a.ans];
    $('.stat', host).innerHTML = tot
      ? `全班 ${tot} 人中，有 <b>${right}</b> 人選了正確答案（${Math.round(right / tot * 100)}%）。正確答案是 <b>${'ABCDEF'[a.ans]}</b>。`
      : `正確答案是 <b>${'ABCDEF'[a.ans]}</b>。`;
    v.reveal(a.ans); go(2);
  };
  let hi = 0;
  const hints = $$('.hint', host);
  const showHint = () => {
    if (hi < hints.length) hints[hi++].classList.add('show');
    if (hi >= hints.length) { $('.more', host).style.display = 'none'; $('.go4', host).style.display = ''; }
  };
  $('.go3', host).onclick = () => { go(3); if (hi === 0) showHint(); };
  $('.more', host).onclick = showHint;
  $('.go4', host).onclick = () => { $('.explain', host).style.display = 'block'; $('.go5', host).style.display = ''; };
  $('.go5', host).onclick = () => go(4);
  const t = a.transfer;
  const vt = voteList($('.vt', host), t.opts, () => { vt.reveal(t.ans); $('.tw', host).classList.add('show'); });
  $('.restart', host).onclick = () => mountArena(host, a);
  go(0, true);
}

/* ---------- 分類小遊戲：每列一個敘述，點選它屬於哪一類 ---------- */
function mountSort(host, cats, items) {
  host.classList.add('sortq');
  host.innerHTML = items.map((it, i) => `<div class="item" data-i="${i}"><span class="txt">${it[0]}</span>
     <span class="chips">${cats.map((c, k) => `<button class="chip" data-k="${k}">${c}</button>`).join('')}</span></div>`).join('')
    + `<div class="note">點錯也沒關係，會顯示原因。</div>`;
  $$('.item', host).forEach(row => {
    const it = items[+row.dataset.i];
    $$('.chip', row).forEach(ch => ch.onclick = () => {
      $$('.chip', row).forEach(c => c.classList.remove('on')); ch.classList.add('on');
      const ok = +ch.dataset.k === it[1];
      row.classList.toggle('ok', ok); row.classList.toggle('no', !ok);
      let why = $('.why', row);
      if (!why) { why = document.createElement('div'); why.className = 'why note'; why.style.flexBasis = '100%'; row.appendChild(why); }
      why.textContent = (ok ? '✔ ' : '✘ ') + (it[2] || '');
    });
  });
}

/* ---------- 啟動 ---------- */
function boot() {
  $$('nav.tabs button').forEach(b => b.addEventListener('click', () => showTab(b.dataset.tab)));
  $$('#modeSeg button').forEach(b => b.addEventListener('click', () => setMode(b.dataset.mode)));
  $('#projBtn').onclick = () => { document.body.classList.toggle('proj'); store.set({ proj: document.body.classList.contains('proj') }); window.dispatchEvent(new Event('resize')); };
  $('#fsBtn').onclick = () => document.fullscreenElement ? document.exitFullscreen() : document.documentElement.requestFullscreen?.();
  // 抽號
  const pk = $('#picker');
  $('#pickBtn').onclick = () => { pk.classList.add('show'); spin(); };
  const spin = () => {
    const max = +$('#pickMax').value || 30; let n = 0;
    const t = setInterval(() => { $('#pickNum').textContent = 1 + Math.floor(Math.random() * max); if (++n > 14) clearInterval(t); }, 60);
  };
  $('#pickAgain').onclick = spin;
  $('#pickClose').onclick = () => pk.classList.remove('show');
  // 鍵盤：← → 翻分頁（正在拖滑桿或打字時不搶）
  document.addEventListener('keydown', e => {
    const tag = (e.target.tagName || '').toLowerCase();
    if (['input', 'textarea', 'select'].includes(tag)) return;
    if (e.key === 'ArrowRight' || e.key === 'PageDown') { stepTab(1); e.preventDefault(); }
    if (e.key === 'ArrowLeft' || e.key === 'PageUp') { stepTab(-1); e.preventDefault(); }
  });
  // 掛上「猜一猜」「迷思擂台」
  $$('[data-guess]').forEach(h => mountGuess(h, GUESS[h.dataset.guess]));
  $$('[data-arena]').forEach(h => mountArena(h, ARENA[h.dataset.arena]));
  // 紫色卡片打開時，裡面的畫布要重畫（收合時寬度是 0）
  $$('details').forEach(d => d.addEventListener('toggle', () => window.dispatchEvent(new Event('resize'))));
  window.addEventListener('resize', () => (SIMS[curTab] || []).forEach(s => s.resize ? s.resize() : (s.stop && s.stop(), s.start && s.start())));
  const st = store.get();
  if (st.proj) document.body.classList.add('proj');
  setMode(st.mode || 'normal');
  showTab(st.tab && document.getElementById('p-' + st.tab) ? st.tab : $$('nav.tabs button')[0].dataset.tab);
}
