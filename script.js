'use strict';
/* TinyTools – vanilla JS. All tools run in the browser.
   External libraries (loaded only when a tool needs them, from cdnjs):
   - qrcode-generator (QR Code Generator)
   - PDF.js (PDF to Images) */
const QR_SRC = 'https://cdnjs.cloudflare.com/ajax/libs/qrcode-generator/1.4.4/qrcode.min.js';
const PDF_SRC = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
const PDF_WORKER = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const UX = m => Object.assign(new Error(m), { ux: 1 });
const msg = e => (e && e.ux ? e.message : 'Something went wrong. Please try again.');



/* ---------- helpers ---------- */
let toastT;
function toast(m) { const t = $('#toast'); t.textContent = m; t.classList.add('show'); clearTimeout(toastT); toastT = setTimeout(() => t.classList.remove('show'), 3200); }
const fmtBytes = b => b < 1024 ? b + ' B' : b < 1048576 ? (b / 1024).toFixed(1) + ' KB' : (b / 1048576).toFixed(2) + ' MB';
function dl(blob, name) {
  const u = URL.createObjectURL(blob), a = document.createElement('a');
  a.href = u; a.download = name; document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(u), 3000);
}
const scripts = {};
const loadScript = src => scripts[src] || (scripts[src] = new Promise((res, rej) => {
  const s = document.createElement('script'); s.src = src; s.onload = res; s.onerror = () => { delete scripts[src]; rej(UX("Couldn't load a required library. Check your connection and try again.")); };
  document.head.appendChild(s);
}));
const dz = (accept, text) => `<label class="drop" tabindex="0"><input type="file" accept="${accept}" hidden><span class="drop-ic">${ico('upload')}</span><strong>${text}</strong><span class="muted">or click to browse</span></label>`;
function bindDrop(root, cb) {
  const d = $('.drop', root), inp = $('input', d);
  inp.onchange = () => { if (inp.files[0]) cb(inp.files[0]); inp.value = ''; };
  d.onkeydown = e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); inp.click(); } };
  ['dragenter', 'dragover'].forEach(ev => d.addEventListener(ev, e => { e.preventDefault(); d.classList.add('over'); }));
  ['dragleave', 'drop'].forEach(ev => d.addEventListener(ev, e => { e.preventDefault(); d.classList.remove('over'); }));
  d.addEventListener('drop', e => { const f = e.dataTransfer.files[0]; if (f) cb(f); });
}
const IMG_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/bmp'];
function readImage(f) {
  return new Promise((res, rej) => {
    if (!IMG_TYPES.includes(f.type)) return rej(UX("That file type isn't supported. Try a JPG, PNG, WebP, GIF or BMP image."));
    const img = new Image(), u = URL.createObjectURL(f);
    img.onload = () => res(img);
    img.onerror = () => rej(UX("That image couldn't be read. Try a different file."));
    img.src = u;
  });
}
const baseName = f => f.name.replace(/\.[^.]+$/, '') || 'image';
const extOf = t => ({ 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp' }[t]);
const numFmt = (n, d = 4) => n.toLocaleString('en', { maximumFractionDigits: d });

/* ---------- tool UIs ---------- */
const UI = {};

UI['image-compressor'] = {
  html: () => `${dz('image/*', 'Drop an image here')}
  <div class="work" hidden>
    <div class="row"><label class="f">Quality: <output id="qv">75</output>%<input type="range" id="q" min="10" max="100" value="75"></label>
    <label class="f">Format<select id="fmt"><option value="image/jpeg">JPEG</option><option value="image/webp">WebP</option></select></label></div>
    <div class="cols"><figure><figcaption>Original<span id="os"></span></figcaption><img id="oi" alt="Original image preview"></figure>
    <figure><figcaption>Compressed<span id="cs"></span></figcaption><img id="ci" alt="Compressed image preview"></figure></div>
    <p class="stat" id="st" aria-live="polite"></p>
    <div class="row btns"><button class="btn" id="dl" disabled>Download compressed image</button><button class="btn ghost" id="again">Choose another image</button></div>
  </div>
  <p class="note">${ico('lock')} Your image is processed in your browser.</p>`,
  init(r) {
    let img, file, blob, url, t;
    const work = $('.work', r), drop = $('.drop', r);
    bindDrop(r, async f => {
      try { img = await readImage(f); file = f; $('#oi', r).src = img.src; $('#os', r).textContent = fmtBytes(f.size); drop.hidden = true; work.hidden = false; run(); }
      catch (e) { toast(msg(e)); }
    });
    function run() {
      if (!img) return toast('Please upload an image first.');
      const type = $('#fmt', r).value, q = $('#q', r).value / 100;
      const c = document.createElement('canvas'); c.width = img.naturalWidth; c.height = img.naturalHeight;
      const x = c.getContext('2d');
      if (type === 'image/jpeg') { x.fillStyle = '#fff'; x.fillRect(0, 0, c.width, c.height); }
      x.drawImage(img, 0, 0);
      c.toBlob(b => {
        if (!b) return toast('Something went wrong. Please try again.');
        blob = b; if (url) URL.revokeObjectURL(url); url = URL.createObjectURL(b);
        $('#ci', r).src = url; $('#cs', r).textContent = fmtBytes(b.size);
        const p = (1 - b.size / file.size) * 100, st = $('#st', r);
        st.className = 'stat' + (p < 0 ? ' bad' : '');
        st.textContent = p >= 0 ? `Saved ${p.toFixed(1)}% (${fmtBytes(file.size)} → ${fmtBytes(b.size)})` : `This image is already well compressed. The result is ${Math.abs(p).toFixed(1)}% larger, so try a lower quality.`;
        $('#dl', r).disabled = false;
      }, type, q);
    }
    $('#q', r).oninput = e => { $('#qv', r).textContent = e.target.value; clearTimeout(t); t = setTimeout(run, 150); };
    $('#fmt', r).onchange = run;
    $('#dl', r).onclick = () => blob && dl(blob, `${baseName(file)}-compressed.${extOf(blob.type)}`);
    $('#again', r).onclick = () => { work.hidden = true; drop.hidden = false; img = null; };
  }
};

UI['image-resizer'] = {
  html: () => {
    const P = [['Instagram Post', 1080, 1080], ['Instagram Story', 1080, 1920], ['YouTube Thumbnail', 1280, 720], ['Profile Picture', 400, 400], ['HD', 1280, 720], ['Full HD', 1920, 1080]];
    return `${dz('image/*', 'Drop an image here')}
    <div class="work" hidden>
      <div class="tabs" role="group" aria-label="Size presets">${P.map(p => `<button type="button" data-w="${p[1]}" data-h="${p[2]}" aria-pressed="false">${p[0]}</button>`).join('')}</div>
      <div class="row"><label class="f">Width (px)<input type="number" id="w" min="1" max="8000" inputmode="numeric"></label>
      <label class="f">Height (px)<input type="number" id="h" min="1" max="8000" inputmode="numeric"></label>
      <label class="f">Fit<select id="fit"><option value="stretch">Stretch to size</option><option value="cover">Crop to fill</option></select></label>
      <label class="f">Format<select id="fmt"><option value="image/png">PNG</option><option value="image/jpeg">JPEG</option><option value="image/webp">WebP</option></select></label></div>
      <label><input type="checkbox" id="lock" checked> Lock aspect ratio</label>
      <div class="row btns"><button class="btn" id="go">Resize image</button><button class="btn ghost" id="again">Choose another image</button></div>
      <div id="out" hidden><figure><figcaption>Result<span id="info"></span></figcaption><img id="ri" alt="Resized image preview"></figure>
      <div class="row btns"><button class="btn" id="dl">Download resized image</button></div></div>
    </div>
    <p class="note">${ico('lock')} Your image is processed in your browser.</p>`;
  },
  init(r) {
    let img, file, blob, ratio = 1;
    const W = $('#w', r), H = $('#h', r), lock = $('#lock', r), work = $('.work', r), drop = $('.drop', r);
    bindDrop(r, async f => {
      try { img = await readImage(f); file = f; ratio = img.naturalWidth / img.naturalHeight; W.value = img.naturalWidth; H.value = img.naturalHeight; $('#out', r).hidden = true; drop.hidden = true; work.hidden = false; }
      catch (e) { toast(msg(e)); }
    });
    W.oninput = () => { if (lock.checked && +W.value > 0) H.value = Math.max(1, Math.round(W.value / ratio)); };
    H.oninput = () => { if (lock.checked && +H.value > 0) W.value = Math.max(1, Math.round(H.value * ratio)); };
    $$('.tabs button', r).forEach(b => b.onclick = () => {
      $$('.tabs button', r).forEach(x => x.setAttribute('aria-pressed', x === b));
      W.value = b.dataset.w; H.value = b.dataset.h; lock.checked = false; $('#fit', r).value = 'cover';
    });
    $('#go', r).onclick = () => {
      if (!img) return toast('Please upload an image first.');
      const w = Math.round(+W.value), h = Math.round(+H.value);
      if (!(w > 0 && h > 0 && w <= 8000 && h <= 8000)) return toast('Enter a width and height between 1 and 8000 pixels.');
      const type = $('#fmt', r).value, c = document.createElement('canvas'); c.width = w; c.height = h;
      const x = c.getContext('2d');
      if (type === 'image/jpeg') { x.fillStyle = '#fff'; x.fillRect(0, 0, w, h); }
      if ($('#fit', r).value === 'cover') {
        const s = Math.max(w / img.naturalWidth, h / img.naturalHeight), dw = img.naturalWidth * s, dh = img.naturalHeight * s;
        x.drawImage(img, (w - dw) / 2, (h - dh) / 2, dw, dh);
      } else x.drawImage(img, 0, 0, w, h);
      c.toBlob(b => {
        if (!b) return toast('That size is too large for this device. Try something smaller.');
        blob = b; $('#ri', r).src = URL.createObjectURL(b); $('#info', r).textContent = `${w} × ${h}px, ${fmtBytes(b.size)}`; $('#out', r).hidden = false;
      }, type, .92);
    };
    $('#dl', r).onclick = () => blob && dl(blob, `${baseName(file)}-${W.value}x${H.value}.${extOf(blob.type)}`);
    $('#again', r).onclick = () => { work.hidden = true; drop.hidden = false; img = null; };
  }
};

UI['qr-code-generator'] = {
  html: () => `<div class="qr-layout"><div>
    <div class="tabs" id="mode" role="group" aria-label="Content type"><button type="button" data-m="text" aria-pressed="true">Text</button><button type="button" data-m="url" aria-pressed="false">URL</button><button type="button" data-m="wifi" aria-pressed="false">Wi-Fi</button></div>
    <div class="row" data-p="text"><label class="f">Text<textarea id="t" style="min-height:110px" placeholder="Type anything…"></textarea></label></div>
    <div class="row" data-p="url" hidden><label class="f">Website address<input type="text" id="u" placeholder="example.com" inputmode="url" autocapitalize="off"></label></div>
    <div class="row" data-p="wifi" hidden><label class="f">Network name (SSID)<input type="text" id="ssid"></label><label class="f">Password<input type="text" id="pw" autocomplete="off"></label>
      <label class="f">Security<select id="sec"><option value="WPA">WPA/WPA2/WPA3</option><option value="WEP">WEP</option><option value="nopass">None</option></select></label></div>
    <div class="row"><label class="f">Size: <output id="szv">320</output>px<input type="range" id="sz" min="160" max="1024" step="32" value="320"></label>
      <label class="f">Error correction<select id="ec"><option value="L">Low</option><option value="M" selected>Medium</option><option value="Q">Quartile</option><option value="H">High</option></select></label></div>
    <div class="row"><label class="f">Foreground<input type="color" id="fg" value="#000000"></label><label class="f">Background<input type="color" id="bg" value="#ffffff"></label></div>
  </div><div><div class="qr-out" id="qo"><canvas id="cv" hidden></canvas><p class="muted" id="hint" style="text-align:center;margin:0">Your QR code will appear here.</p></div>
    <div class="row btns"><button class="btn" id="dl" disabled>Download PNG</button></div></div></div>`,
  async init(r) {
    try { await loadScript(QR_SRC); } catch (e) { $('#hint', r).textContent = msg(e); $('#hint', r).className = 'err'; return; }
    qrcode.stringToBytes = s => Array.from(new TextEncoder().encode(s)); // UTF-8 so non-Latin text scans correctly
    let mode = 'text';
    const cv = $('#cv', r), hint = $('#hint', r);
    const wesc = s => s.replace(/([\\;,:"])/g, '\\$1');
    const val = () => {
      if (mode === 'text') return $('#t', r).value;
      if (mode === 'url') { const u = $('#u', r).value.trim(); return !u ? '' : /^[a-z][a-z0-9+.-]*:/i.test(u) ? u : 'https://' + u; }
      const s = $('#ssid', r).value, sec = $('#sec', r).value;
      return s ? `WIFI:T:${sec};S:${wesc(s)};${sec === 'nopass' ? '' : `P:${wesc($('#pw', r).value)};`};` : '';
    };
    function draw() {
      const s = val(), dlb = $('#dl', r);
      if (!s) { cv.hidden = true; hint.hidden = false; hint.className = 'muted'; hint.textContent = 'Your QR code will appear here.'; dlb.disabled = true; return; }
      try {
        const q = qrcode(0, $('#ec', r).value); q.addData(s); q.make();
        const n = q.getModuleCount(), size = +$('#sz', r).value, cell = Math.max(1, Math.floor(size / (n + 8))), px = cell * (n + 8);
        cv.width = cv.height = px; const x = cv.getContext('2d');
        x.fillStyle = $('#bg', r).value; x.fillRect(0, 0, px, px); x.fillStyle = $('#fg', r).value;
        for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) if (q.isDark(i, j)) x.fillRect((j + 4) * cell, (i + 4) * cell, cell, cell);
        cv.hidden = false; hint.hidden = true; dlb.disabled = false;
      } catch (e) { cv.hidden = true; hint.hidden = false; hint.className = 'err'; hint.textContent = "That's too much for one QR code. Try shorter content or a lower error correction level."; dlb.disabled = true; }
    }
    r.addEventListener('input', e => { if (e.target.id === 'sz') $('#szv', r).textContent = e.target.value; draw(); });
    $$('#mode button', r).forEach(b => b.onclick = () => {
      mode = b.dataset.m; $$('#mode button', r).forEach(x => x.setAttribute('aria-pressed', x === b));
      $$('[data-p]', r).forEach(p => p.hidden = p.dataset.p !== mode); draw();
    });
    $('#dl', r).onclick = () => cv.toBlob(b => b ? dl(b, 'tinytools-qr.png') : toast('Something went wrong. Please try again.'));
  }
};

UI['pdf-to-images'] = {
  html: () => `${dz('application/pdf,.pdf', 'Drop a PDF here')}
  <div class="work" hidden>
    <p id="meta" class="muted"></p>
    <div class="row btns"><button class="btn ghost sm" id="all">Select all</button><button class="btn ghost sm" id="none">Select none</button></div>
    <div class="pages" id="pages"></div>
    <div class="row"><label class="f">Format<select id="fmt"><option value="image/png">PNG</option><option value="image/jpeg">JPG</option></select></label>
    <label class="f">Quality<select id="scale"><option value="1.5">Standard</option><option value="2" selected>High</option><option value="3">Maximum</option></select></label></div>
    <div class="row btns"><button class="btn" id="go">Convert selected pages</button><button class="btn ghost" id="again">Choose another PDF</button></div>
    <p class="muted" id="prog" aria-live="polite"></p>
    <div id="results" hidden><div class="row btns"><h3>Results</h3><button class="btn sm" id="dlall">Download all</button></div><div class="res" id="res"></div></div>
  </div>
  <p class="note">${ico('lock')} Your PDF is processed in your browser.</p>`,
  init(r) {
    let pdf, name = 'document', token = 0, urls = [], files = [];
    const work = $('.work', r), drop = $('.drop', r);
    bindDrop(r, async f => {
      if (f.type !== 'application/pdf' && !/\.pdf$/i.test(f.name)) return toast("That file type isn't supported. Please choose a PDF.");
      const my = ++token;
      try {
        await loadScript(PDF_SRC); pdfjsLib.GlobalWorkerOptions.workerSrc = PDF_WORKER;
        pdf = await pdfjsLib.getDocument({ data: await f.arrayBuffer() }).promise;
        name = f.name.replace(/\.pdf$/i, '') || 'document';
        drop.hidden = true; work.hidden = false; $('#results', r).hidden = true; $('#prog', r).textContent = '';
        $('#meta', r).textContent = `${f.name} · ${pdf.numPages} page${pdf.numPages > 1 ? 's' : ''}`;
        const box = $('#pages', r); box.innerHTML = '';
        for (let i = 1; i <= pdf.numPages; i++) box.insertAdjacentHTML('beforeend', `<label class="pg"><input type="checkbox" data-i="${i}" checked aria-label="Page ${i}"><canvas></canvas><span>Page ${i}</span></label>`);
        const cvs = $$('canvas', box);
        for (let i = 1; i <= pdf.numPages; i++) {
          if (my !== token) return;
          const pg = await pdf.getPage(i), vp = pg.getViewport({ scale: .3 }), c = cvs[i - 1];
          c.width = vp.width; c.height = vp.height; await pg.render({ canvasContext: c.getContext('2d'), viewport: vp }).promise;
        }
      } catch (e) {
        toast(e && e.name === 'PasswordException' ? 'This PDF is password-protected. Remove the password and try again.' : e && e.ux ? e.message : "That PDF couldn't be read. Try a different file.");
      }
    });
    $('#all', r).onclick = () => $$('#pages input', r).forEach(i => i.checked = true);
    $('#none', r).onclick = () => $$('#pages input', r).forEach(i => i.checked = false);
    $('#go', r).onclick = async () => {
      const sel = $$('#pages input:checked', r).map(i => +i.dataset.i);
      if (!pdf) return toast('Please upload a PDF first.');
      if (!sel.length) return toast('Select at least one page.');
      const type = $('#fmt', r).value, ext = type === 'image/png' ? 'png' : 'jpg', go = $('#go', r);
      go.disabled = true; urls.forEach(URL.revokeObjectURL); urls = []; files = []; $('#res', r).innerHTML = '';
      try {
        for (let k = 0; k < sel.length; k++) {
          $('#prog', r).textContent = `Converting page ${sel[k]} (${k + 1} of ${sel.length})…`;
          const pg = await pdf.getPage(sel[k]), vp = pg.getViewport({ scale: +$('#scale', r).value }), c = document.createElement('canvas');
          c.width = vp.width; c.height = vp.height; const x = c.getContext('2d');
          x.fillStyle = '#fff'; x.fillRect(0, 0, c.width, c.height);
          await pg.render({ canvasContext: x, viewport: vp }).promise;
          const b = await new Promise(res => c.toBlob(res, type, .92)); if (!b) throw 0;
          const u = URL.createObjectURL(b), fn = `${name}-page-${sel[k]}.${ext}`; urls.push(u); files.push([b, fn]);
          const d = document.createElement('div'); d.innerHTML = `<img alt="Page ${sel[k]} as an image"><span>${fmtBytes(b.size)}</span><button class="btn ghost sm">Download page ${sel[k]}</button>`;
          $('img', d).src = u; $('button', d).onclick = () => dl(b, fn); $('#res', r).appendChild(d);
        }
        $('#results', r).hidden = false; $('#prog', r).textContent = `Done. ${sel.length} image${sel.length > 1 ? 's' : ''} ready.`;
      } catch (e) { toast('Something went wrong. Please try again.'); $('#prog', r).textContent = ''; }
      go.disabled = false;
    };
    $('#dlall', r).onclick = () => files.forEach(([b, n], i) => setTimeout(() => dl(b, n), i * 400));
    $('#again', r).onclick = () => { token++; work.hidden = true; drop.hidden = false; pdf = null; };
  }
};

UI['word-counter'] = {
  html: () => `<label class="f" for="ta">Your text</label><textarea id="ta" placeholder="Start typing or paste your text here…"></textarea>
  <div class="stats" aria-live="polite">${[['words', 'Words'], ['chars', 'Characters'], ['nosp', 'Characters (no spaces)'], ['sent', 'Sentences'], ['para', 'Paragraphs'], ['time', 'Reading time']].map(s => `<div><b id="${s[0]}">0</b><span>${s[1]}</span></div>`).join('')}</div>
  <div class="row btns"><button class="btn" id="copy">Copy text</button><button class="btn ghost" id="clear">Clear</button></div>`,
  init(r) {
    const ta = $('#ta', r), set = (k, v) => $('#' + k, r).textContent = v;
    const upd = () => {
      const t = ta.value, w = t.trim() ? t.trim().split(/\s+/).length : 0;
      set('words', w); set('chars', t.length); set('nosp', t.replace(/\s/g, '').length);
      set('sent', (t.match(/[^.!?]+[.!?]+|[^.!?]+$/g) || []).filter(s => /\w/.test(s)).length);
      set('para', t.split(/\n\s*\n/).filter(p => p.trim()).length);
      const m = w / 200; set('time', w === 0 ? '0 min' : m < 1 ? '< 1 min' : Math.round(m) + ' min');
    };
    ta.oninput = upd;
    $('#copy', r).onclick = async () => {
      if (!ta.value) return toast('There is no text to copy yet.');
      try { await navigator.clipboard.writeText(ta.value); toast('Copied to clipboard.'); }
      catch { ta.select(); toast('Press Ctrl+C (or Cmd+C) to copy the selected text.'); }
    };
    $('#clear', r).onclick = () => { ta.value = ''; upd(); ta.focus(); };
  }
};

UI['percentage-calculator'] = {
  html: () => `<div class="tabs" id="modes" role="group" aria-label="Calculation type"></div>
  <div class="row" id="fields"></div><div class="row btns"><button class="btn" id="calc">Calculate</button></div>
  <div aria-live="polite"><div class="big" id="res"></div><p class="muted" id="why"></p></div>`,
  init(r) {
    const f = n => numFmt(n, 4);
    const M = [
      { l: 'What is X% of Y?', f: ['X (%)', 'Y'], fn: (x, y) => ({ r: f(x / 100 * y), e: `${f(x)}% of ${f(y)} = ${f(x)} ÷ 100 × ${f(y)}` }) },
      { l: 'X is what % of Y?', f: ['X', 'Y'], fn: (x, y) => y === 0 ? 0 : ({ r: f(x / y * 100) + '%', e: `${f(x)} ÷ ${f(y)} × 100` }) },
      { l: 'Percentage increase', f: ['From', 'To'], fn: (a, b) => a === 0 ? 0 : ({ r: f(Math.abs((b - a) / a * 100)) + '%', e: `(${f(b)} − ${f(a)}) ÷ ${f(a)} × 100` + (b < a ? '. The value actually went down, so this is a decrease.' : '') }) },
      { l: 'Percentage decrease', f: ['From', 'To'], fn: (a, b) => a === 0 ? 0 : ({ r: f(Math.abs((a - b) / a * 100)) + '%', e: `(${f(a)} − ${f(b)}) ÷ ${f(a)} × 100` + (b > a ? '. The value actually went up, so this is an increase.' : '') }) },
      { l: 'Discount', f: ['Original price', 'Discount (%)'], fn: (p, d) => ({ r: f(p - p * d / 100), e: `You save ${f(p * d / 100)}. Final price = ${f(p)} − (${f(p)} × ${f(d)} ÷ 100)` }) }
    ];
    let m = 0;
    const show = () => {
      $$('#modes button', r).forEach((b, i) => b.setAttribute('aria-pressed', i === m));
      $('#fields', r).innerHTML = M[m].f.map((l, i) => `<label class="f">${l}<input type="number" step="any" inputmode="decimal" data-i="${i}"></label>`).join('');
      $('#res', r).textContent = ''; $('#why', r).textContent = '';
    };
    $('#modes', r).innerHTML = M.map((x, i) => `<button type="button" data-i="${i}" aria-pressed="false">${x.l}</button>`).join('');
    $('#modes', r).onclick = e => { const b = e.target.closest('button'); if (b) { m = +b.dataset.i; show(); } };
    const calc = () => {
      const v = $$('#fields input', r).map(i => i.value === '' ? NaN : +i.value);
      if (v.some(isNaN)) return toast('Please enter both numbers.');
      const o = M[m].fn(...v);
      if (!o) return toast("The starting value can't be zero for this calculation.");
      $('#res', r).textContent = o.r; $('#why', r).textContent = o.e;
    };
    $('#calc', r).onclick = calc; r.addEventListener('keydown', e => { if (e.key === 'Enter' && e.target.matches('input')) calc(); });
    show();
  }
};

const UNITS = {
  Length: { m: ['Metres', 1], km: ['Kilometres', 1000], cm: ['Centimetres', .01], mm: ['Millimetres', .001], mi: ['Miles', 1609.344], yd: ['Yards', .9144], ft: ['Feet', .3048], in: ['Inches', .0254] },
  Weight: { kg: ['Kilograms', 1], g: ['Grams', .001], mg: ['Milligrams', 1e-6], lb: ['Pounds', .45359237], oz: ['Ounces', .028349523125], t: ['Tonnes', 1000] },
  Temperature: { C: ['Celsius'], F: ['Fahrenheit'], K: ['Kelvin'] },
  Area: { m2: ['Square metres', 1], km2: ['Square kilometres', 1e6], cm2: ['Square centimetres', 1e-4], ha: ['Hectares', 1e4], ac: ['Acres', 4046.8564224], ft2: ['Square feet', .09290304], mi2: ['Square miles', 2589988.110336] },
  Volume: { L: ['Litres', 1], mL: ['Millilitres', .001], m3: ['Cubic metres', 1000], gal: ['Gallons (US)', 3.785411784], qt: ['Quarts (US)', .946352946], cup: ['Cups (US)', .2365882365], floz: ['Fluid ounces (US)', .0295735295625] },
  Speed: { ms: ['Metres/second', 1], kmh: ['Kilometres/hour', 1 / 3.6], mph: ['Miles/hour', .44704], kn: ['Knots', 1852 / 3600] },
  Time: { s: ['Seconds', 1], min: ['Minutes', 60], h: ['Hours', 3600], d: ['Days', 86400], w: ['Weeks', 604800], y: ['Years (365.25 days)', 31557600] },
  Data: { bit: ['Bits', .125], B: ['Bytes', 1], KB: ['Kilobytes (1000 B)', 1e3], MB: ['Megabytes', 1e6], GB: ['Gigabytes', 1e9], TB: ['Terabytes', 1e12], KiB: ['Kibibytes (1024 B)', 1024], MiB: ['Mebibytes', 1048576], GiB: ['Gibibytes', 1073741824] }
};
const DEF = { Length: ['km', 'mi'], Weight: ['kg', 'lb'], Temperature: ['C', 'F'], Area: ['m2', 'ft2'], Volume: ['L', 'gal'], Speed: ['kmh', 'mph'], Time: ['h', 'min'], Data: ['MB', 'GB'] };
UI['unit-converter'] = {
  html: () => `<div class="tabs" id="cats" role="group" aria-label="Category">${Object.keys(UNITS).map(c => `<button type="button" aria-pressed="false">${c}</button>`).join('')}</div>
  <div class="row"><label class="f">Value<input type="number" id="v" step="any" value="1" inputmode="decimal"></label>
  <label class="f">From<select id="from"></select></label><label class="f">To<select id="to"></select></label></div>
  <div class="row btns"><button class="btn ghost sm" id="swap">Swap units</button></div>
  <div aria-live="polite"><div class="big" id="out"></div><p class="muted" id="line"></p></div>`,
  init(r) {
    let cat = 'Length';
    const fmt = v => v === 0 ? '0' : Math.abs(v) >= 1e12 || Math.abs(v) < 1e-6 ? v.toExponential(6) : (+v.toPrecision(10)).toLocaleString('en', { maximumFractionDigits: 10 });
    const toC = (v, u) => u === 'C' ? v : u === 'F' ? (v - 32) * 5 / 9 : v - 273.15;
    const fromC = (c, u) => u === 'C' ? c : u === 'F' ? c * 9 / 5 + 32 : c + 273.15;
    function conv() {
      const raw = $('#v', r).value, f = $('#from', r).value, t = $('#to', r).value;
      if (raw === '' || isNaN(+raw)) { $('#out', r).textContent = ''; $('#line', r).textContent = 'Enter a number to convert.'; return; }
      const v = +raw, U = UNITS[cat];
      const res = cat === 'Temperature' ? fromC(toC(v, f), t) : v * U[f][1] / U[t][1];
      $('#out', r).textContent = `${fmt(res)} ${t}`; $('#line', r).textContent = `${fmt(v)} ${U[f][0].toLowerCase()} = ${fmt(res)} ${U[t][0].toLowerCase()}`;
    }
    function setCat(c) {
      cat = c; $$('#cats button', r).forEach(b => b.setAttribute('aria-pressed', b.textContent === c));
      const o = Object.entries(UNITS[c]).map(([k, u]) => `<option value="${k}">${u[0]} (${k})</option>`).join('');
      $('#from', r).innerHTML = o; $('#to', r).innerHTML = o; $('#from', r).value = DEF[c][0]; $('#to', r).value = DEF[c][1]; conv();
    }
    $('#cats', r).onclick = e => { const b = e.target.closest('button'); if (b) setCat(b.textContent); };
    ['v', 'from', 'to'].forEach(i => $('#' + i, r).addEventListener('input', conv));
    $('#swap', r).onclick = () => { const f = $('#from', r), t = $('#to', r), x = f.value; f.value = t.value; t.value = x; conv(); };
    setCat('Length');
  }
};

UI['age-calculator'] = {
  html: () => `<div class="row"><label class="f">Date of birth<input type="date" id="dob"></label></div>
  <div class="row btns"><button class="btn" id="calc">Calculate age</button></div>
  <div id="out" hidden aria-live="polite"><div class="big" id="age"></div><div class="stats" id="stats"></div></div>
  <p class="note">${ico('lock')} Your date of birth is calculated on your device and never sent anywhere.</p>`,
  init(r) {
    $('#dob', r).max = new Date().toISOString().slice(0, 10);
    $('#calc', r).onclick = () => {
      const v = $('#dob', r).value; if (!v) return toast('Please enter your date of birth.');
      const [by, bm, bd] = v.split('-').map(Number), n = new Date(), ty = n.getFullYear(), tm = n.getMonth() + 1, td = n.getDate();
      const today = Date.UTC(ty, tm - 1, td), birth = Date.UTC(by, bm - 1, bd);
      if (birth > today) return toast("That date is in the future. Please check your date of birth.");
      let y = ty - by, m = tm - bm, d = td - bd;
      if (d < 0) { m--; d += new Date(ty, tm - 1, 0).getDate(); }
      if (m < 0) { y--; m += 12; }
      let nb = Date.UTC(ty, bm - 1, bd); if (nb < today) nb = Date.UTC(ty + 1, bm - 1, bd);
      const until = Math.round((nb - today) / 864e5), nbd = new Date(nb);
      const pl = (x, s) => `${x} ${s}${x === 1 ? '' : 's'}`;
      $('#age', r).textContent = `${pl(y, 'year')}, ${pl(m, 'month')}, ${pl(d, 'day')}`;
      $('#stats', r).innerHTML = [[nbd.toLocaleDateString('en', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' }), 'Next birthday'], [until === 0 ? 'Today!' : numFmt(until, 0), 'Days until then'], [numFmt(Math.round((today - birth) / 864e5), 0), 'Days lived']].map(s => `<div><b style="font-size:1.15rem">${s[0]}</b><span>${s[1]}</span></div>`).join('');
      $('#out', r).hidden = false;
    };
  }
};

/* ---------- page enhancements (pages are pre-built as static HTML by build.mjs) ---------- */
function search(q) {
  q = q.trim().toLowerCase(); if (!q) return [];
  return TOOLS.map(t => ({ t, s: (t.name.toLowerCase().includes(q) ? 3 : 0) + (t.kw.split(' ').some(k => k.startsWith(q)) ? 2 : 0) + (t.kw.includes(q) || t.desc.toLowerCase().includes(q) || t.cat.toLowerCase().includes(q) ? 1 : 0) }))
    .filter(x => x.s).sort((a, b) => b.s - a.s).map(x => x.t);
}
function bindSearch(input, out, after) {
  const show = () => {
    const q = input.value, res = search(q);
    out.innerHTML = !q.trim() ? '' : res.length ? res.map(t => `<a class="res-item" href="/${t.id}"><span class="tico" style="width:36px;height:36px;border-radius:10px">${ico(t.icon)}</span><span><strong>${t.name}</strong><small>${t.desc}</small></span></a>`).join('') : `<p class="res-none">No tools match "${esc(q)}". Try "image" or "pdf".</p>`;
  };
  input.addEventListener('input', show);
  input.addEventListener('keydown', e => {
    if (e.key === 'Enter') { const t = search(input.value)[0]; if (t) location.href = '/' + t.id; }
    if (e.key === 'Escape') { input.value = ''; out.innerHTML = ''; }
  });
}
function boot() {
  const hs = $('#hs'); if (hs) bindSearch(hs, $('#hr'));
  const tp = $('#toPop'); if (tp) tp.onclick = () => $('#popular').scrollIntoView({ behavior: 'smooth' });
  const list = $('#list'), q = $('#q'), sort = $('#sort');
  if (list && q && sort) {
    const draw = () => {
      const s = sort.value; let l = q.value.trim() ? search(q.value) : TOOLS.slice();
      if (s === 'new') l.sort((a, b) => (b.isNew || 0) - (a.isNew || 0));
      list.innerHTML = !l.length ? `<p class="muted">No tools match "${esc(q.value)}". Try "image" or "pdf".</p>`
        : s === 'cat' ? CATS.filter(c => l.some(t => t.cat === c)).map(c => `<h2 class="cat-h">${c}</h2><div class="grid">${l.filter(t => t.cat === c).map(card).join('')}</div>`).join('')
        : `<div class="grid">${l.map(card).join('')}</div>`;
    };
    q.oninput = draw; sort.onchange = draw;
  }
  const up = $('#upi');
  if (up) {
    $('#upiCopy').onclick = async () => {
      try { await navigator.clipboard.writeText(up.dataset.upi); toast('UPI ID copied.'); }
      catch { toast('Copy it manually: ' + up.dataset.upi); }
    };
    loadScript(QR_SRC).then(() => {
      qrcode.stringToBytes = s => Array.from(new TextEncoder().encode(s));
      const q = qrcode(0, 'M'); q.addData(`upi://pay?pa=${up.dataset.upi}&pn=TinyTools&cu=INR`); q.make();
      const n = q.getModuleCount(), cell = Math.floor(280 / (n + 8)), px = cell * (n + 8), cv = $('#upiQr'), x = cv.getContext('2d');
      cv.width = cv.height = px; x.fillStyle = '#fff'; x.fillRect(0, 0, px, px); x.fillStyle = '#000';
      for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) if (q.isDark(i, j)) x.fillRect((j + 4) * cell, (i + 4) * cell, cell, cell);
      cv.hidden = false; $('#upiHint').hidden = true;
    }).catch(() => { $('#upiHint').textContent = 'The QR code could not load. You can still copy the UPI ID above.'; });
  }
  const tl = $('#tool');
  if (tl && UI[tl.dataset.tool]) {
    const u = UI[tl.dataset.tool]; tl.innerHTML = u.html();
    Promise.resolve(u.init(tl)).catch(() => toast('Something went wrong. Please try again.'));
  }
}

/* ---------- global UI ---------- */
const sd = $('#sd');
bindSearch($('#sdInput'), $('#sdRes'), () => sd.close());
const openSearch = () => { $('#sdRes').innerHTML = ''; $('#sdInput').value = ''; sd.showModal(); $('#sdInput').focus(); };
$('#openSearch').onclick = openSearch;
sd.addEventListener('click', e => { if (e.target === sd) sd.close(); });
document.addEventListener('keydown', e => {
  if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
    e.preventDefault(); const hs = $('#hs'); if (hs) hs.focus(); else if (!sd.open) openSearch();
  }
});
$('#theme').onclick = () => {
  const t = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
  document.documentElement.dataset.theme = t; try { localStorage.setItem('tt-theme', t); } catch (e) { }
};
$('#burger').onclick = () => { const o = $('#nav').classList.toggle('open'); $('#burger').setAttribute('aria-expanded', o); };
boot();
