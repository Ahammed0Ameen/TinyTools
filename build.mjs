// Run with: node build.mjs
// Generates one real HTML page per tool/article (clean URLs), sitemap.xml, robots.txt and 404.html.
// No dependencies. Edit SITE if you move to a custom domain, then re-run.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const SITE = 'https://tinytoools.vercel.app';
const DATE = '2026-10-04';
const dir = path.dirname(fileURLToPath(import.meta.url));
const { ico, CATS, TOOLS, tool, card } = new Function(fs.readFileSync(path.join(dir, 'tools-data.js'), 'utf8') + '\nreturn {IC,ico,CATS,TOOLS,tool,card}')();

const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const L = (id, label) => `<a href="/${id}">${label || tool(id).name}</a>`;

const ARTICLES = [
  { slug: 'how-to-check-word-count-for-an-essay', title: 'How to Check Word Count for an Essay', desc: 'Four quick ways to check the word count of an essay, plus what usually is and is not included in the total.', tool: 'word-counter', cta: 'Open the Word Counter',
    body: `<p>Most essays come with a word limit, and going well over or under it can cost marks. Here is how to check your count quickly, and what to watch for.</p>
<h2>Ways to check your word count</h2>
<ol><li><strong>Microsoft Word:</strong> the word count appears in the status bar at the bottom of the window. You can also open the Review tab and choose Word Count.</li>
<li><strong>Google Docs:</strong> open the Tools menu and choose Word count, or press Ctrl+Shift+C (Cmd+Shift+C on a Mac).</li>
<li><strong>An online counter:</strong> paste your text into the ${L('word-counter', 'TinyTools Word Counter')} to see words, characters, sentences, paragraphs and reading time at once.</li>
<li><strong>Your phone's notes app:</strong> many notes apps show a word count in the document info.</li></ol>
<h2>What counts as a word?</h2>
<p>Counters treat anything separated by spaces as one word, so "well-known" counts as one and "well known" counts as two. Numbers count too. Different tools can differ by a few words when text includes symbols or unusual spacing, so leave a small safety margin.</p>
<h2>What is usually included?</h2>
<p>This depends on your instructor or publisher, so check the brief. Many courses count the main body only and exclude the title, reference list and appendices. Quotes and in-text citations are often included. When in doubt, ask.</p>
<h2>Tips for hitting the limit</h2>
<ul><li>Write the first draft without worrying about length, then trim or expand.</li>
<li>To cut words, remove filler such as "in order to" and "it is important to note that".</li>
<li>To add words, strengthen your evidence and explain why each example matters.</li>
<li>Check the count again after final edits, since small changes add up.</li></ul>` },
  { slug: 'how-to-create-a-qr-code-for-free', title: 'How to Create a QR Code for Free', desc: 'A simple guide to making a free QR code for a link, text or Wi-Fi network, and how to make sure it scans reliably.', tool: 'qr-code-generator', cta: 'Open the QR Code Generator',
    body: `<p>A QR code turns a link, a message or Wi-Fi details into a square that anyone can scan with a phone camera. You can make one in under a minute without an account.</p>
<h2>Steps</h2>
<ol><li>Open the ${L('qr-code-generator', 'QR Code Generator')}.</li>
<li>Choose Text, URL or Wi-Fi.</li>
<li>Enter your content. The code updates as you type.</li>
<li>Pick a size and colors, then download the PNG.</li>
<li>Scan it with your own phone before sharing it.</li></ol>
<h2>Making a Wi-Fi QR code</h2>
<p>Choose Wi-Fi, enter the network name and password, and select the security type your router uses (usually WPA). Guests can then scan the code to join without typing the password. Only share it where you are comfortable with people having access to your network.</p>
<h2>Tips for a code that scans well</h2>
<ul><li>Keep strong contrast. A dark code on a light background is the safest choice.</li>
<li>Shorter content makes a simpler code, which is easier to scan at small sizes.</li>
<li>Leave the blank border around the code. It helps scanners find the edges.</li>
<li>If you are printing it, test a printed copy at its final size.</li>
<li>Use a higher error correction level if the code may get dirty or scratched.</li></ul>
<h2>Static codes do not expire</h2>
<p>The codes made here contain your content directly, so they keep working as long as the link or information inside them stays valid.</p>` },
  { slug: 'how-to-compress-an-image-without-losing-quality', title: 'How to Compress an Image Without Losing Much Quality', desc: 'Learn when to use JPEG, WebP or PNG, how to pick a quality setting, and why resizing first often saves the most space.', tool: 'image-compressor', cta: 'Open the Image Compressor',
    body: `<p>Large images slow down websites and fill up inboxes. You can usually shrink them a lot with little visible difference if you follow a few simple steps.</p>
<h2>1. Resize first</h2>
<p>A photo straight from a phone can be 4000 pixels wide, while a web page might only show it at 1200. Reducing the dimensions with the ${L('image-resizer', 'Image Resizer')} often saves more space than any quality setting.</p>
<h2>2. Choose the right format</h2>
<ul><li><strong>JPEG</strong> suits photographs and is supported everywhere.</li>
<li><strong>WebP</strong> is usually smaller than JPEG at similar quality and supports transparency. Modern browsers support it.</li>
<li><strong>PNG</strong> suits screenshots, logos and graphics with sharp edges, but files are larger.</li></ul>
<h2>3. Pick a sensible quality</h2>
<p>For photos, a quality somewhere around 70 to 85 percent often looks very close to the original while cutting the file size noticeably. Try a value, compare the previews in the ${L('image-compressor', 'Image Compressor')}, and lower it until you can see a difference, then go back up a little.</p>
<h2>4. Keep your original</h2>
<p>Compression discards detail permanently, so keep the original file and save the compressed copy under a new name.</p>
<h2>Your files stay on your device</h2>
<p>The compressor works in your browser, so your image is not sent to a server by the tool.</p>` }
];

const ldTag = o => `<script type="application/ld+json">${JSON.stringify(o)}</script>`;
const crumbList = items => ({ '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: items.map((c, i) => ({ '@type': 'ListItem', position: i + 1, name: c[0], item: SITE + c[1] })) });
const crumbs = items => `<nav class="crumbs" aria-label="Breadcrumb">${items.map((c, i) => i < items.length - 1 ? `<a href="${c[1]}">${c[0]}</a> <span aria-hidden="true">→</span>` : `<span aria-current="page">${c[0]}</span>`).join(' ')}</nav>`;

const shell = ({ title, desc, p, body, ld = [], type = 'website', noindex = false }) => `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(title)}</title>
<meta name="description" content="${esc(desc)}">
${noindex ? '<meta name="robots" content="noindex">' : `<link rel="canonical" href="${SITE}${p}">`}
<meta property="og:type" content="${type}">
<meta property="og:site_name" content="TinyTools">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(desc)}">
<meta property="og:url" content="${SITE}${p}">
<meta name="twitter:card" content="summary">
<meta name="google-site-verification" content="y-hlRtIveJ4gaj0G-6xnTOxiyi8_pX_OM1ujx7QhtbE">
<meta name="google-adsense-account" content="ca-pub-6393190693280727">
<meta name="theme-color" content="#3350ff">
<link rel="icon" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Crect x='3' y='10' width='26' height='17' rx='5' fill='%233350ff'/%3E%3Cpath d='M11 10V8a3 3 0 0 1 3-3h4a3 3 0 0 1 3 3v2' fill='none' stroke='%233350ff' stroke-width='2.4'/%3E%3C/svg%3E">
<script>try{var t=localStorage.getItem('tt-theme')||(matchMedia('(prefers-color-scheme:dark)').matches?'dark':'light');document.documentElement.dataset.theme=t}catch(e){}</script>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:wght@600;700;800&family=Instrument+Sans:wght@400;500;600&display=swap">
<link rel="stylesheet" href="/style.css">
${ld.map(ldTag).join('\n')}
</head>
<body>
<a class="skip" href="#main">Skip to content</a>
<header class="site">
  <div class="wrap bar">
    <a class="brand" href="/" aria-label="TinyTools home">
      <svg viewBox="0 0 32 32" width="30" height="30" aria-hidden="true"><rect x="3" y="10" width="26" height="17" rx="5" fill="var(--accent)"/><path d="M11 10V8a3 3 0 0 1 3-3h4a3 3 0 0 1 3 3v2" fill="none" stroke="var(--accent)" stroke-width="2.4"/><rect x="3" y="17" width="26" height="2" fill="var(--bg)" opacity=".45"/><rect x="14" y="15.5" width="4" height="5" rx="1.2" fill="var(--bg)"/></svg>
      <span>TinyTools</span>
    </a>
    <nav id="nav" aria-label="Main"><a href="/">Home</a><a href="/tools">All Tools</a><a href="/articles">Articles</a><a href="/about">About</a><a href="/contact">Contact</a></nav>
    <div class="actions">
      <button class="icon-btn" id="openSearch" aria-label="Search tools (Ctrl+K)"><svg class="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><circle cx="11" cy="11" r="6.5"/><path d="M16 16l4 4"/></svg></button>
      <button class="icon-btn" id="theme" aria-label="Toggle dark mode"><svg class="ic sun" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><circle cx="12" cy="12" r="4"/><path d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6l1.4 1.4M17 17l1.4 1.4M5.6 18.4L7 17M17 7l1.4-1.4"/></svg><svg class="ic moon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M20 14.5A8 8 0 0 1 9.5 4 8 8 0 1 0 20 14.5z"/></svg></button>
      <button class="icon-btn burger" id="burger" aria-label="Menu" aria-expanded="false" aria-controls="nav"><svg class="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M4 7h16M4 12h16M4 17h16"/></svg></button>
    </div>
  </div>
</header>
<main id="main" tabindex="-1">
${body}
</main>
<footer class="site">
  <div class="wrap foot">
    <div><strong class="brand-name">TinyTools</strong><p class="muted">Small tools. Big convenience.</p></div>
    <nav aria-label="Footer"><a href="/tools">Tools</a><a href="/articles">Articles</a><a href="/about">About</a><a href="/privacy">Privacy</a><a href="/terms">Terms</a><a href="/contact">Contact</a></nav>
    <p class="muted copy">© 2026 TinyTools</p>
  </div>
</footer>
<dialog id="sd" aria-label="Search tools"><div class="sd-in"><input id="sdInput" class="sd-field" type="search" placeholder="Search tools..." autocomplete="off" aria-label="Search tools"><div id="sdRes" class="results" aria-live="polite"></div><p class="muted sd-hint">Press Esc to close</p></div></dialog>
<div id="toast" role="status" aria-live="polite"></div>
<script src="/tools-data.js" defer></script>
<script src="/script.js" defer></script>
</body>
</html>
`;

const files = {}; // url path -> html
const urls = ['/'];
const add = (p, html, inSitemap = true) => { files[p] = html; if (inSitemap && p !== '/') urls.push(p); };

/* Home */
const pop = ['image-compressor', 'qr-code-generator', 'word-counter', 'pdf-to-images'].map(tool);
add('/', shell({
  title: 'TinyTools – Free Online Tools That Run in Your Browser', p: '/',
  desc: 'Free, fast, browser-based tools for everyday tasks: compress and resize images, make QR codes, convert PDF pages, count words, and more. No sign-up.',
  ld: [{ '@context': 'https://schema.org', '@type': 'WebSite', name: 'TinyTools', url: SITE + '/' }],
  body: `<section class="hero"><div class="wrap">
  <h1>Useful tools,<br>right when you need them.</h1>
  <p class="sub">Free, fast, browser-based tools for everyday tasks.</p>
  <div class="search-wrap"><div class="search"><svg class="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><circle cx="11" cy="11" r="6.5"/><path d="M16 16l4 4"/></svg>
  <input id="hs" type="search" placeholder="Search tools..." autocomplete="off" aria-label="Search tools"><kbd>Ctrl K</kbd></div><div id="hr" class="results" aria-live="polite"></div></div>
  <div class="chips"><span class="muted">Try:</span>${pop.map(t => `<a class="chip" href="/${t.id}">${t.name}</a>`).join('')}</div>
  <div class="cta"><a class="btn" href="/tools">Explore Tools</a><button class="btn ghost" id="toPop" type="button">Popular Tools</button></div>
</div></section>
<section class="sec" id="popular"><div class="wrap"><div class="sec-head"><h2>Popular tools</h2><a href="/tools" class="chip">See all tools</a></div><div class="grid">${TOOLS.map(card).join('')}</div></div></section>
<section class="sec"><div class="wrap"><div class="sec-head"><h2>Browse by category</h2></div><div class="cats">${CATS.map(c => `<div class="cat"><h3>${c}</h3>${TOOLS.filter(t => t.cat === c).map(t => `<a href="/${t.id}"><span class="tico">${ico(t.icon)}</span>${t.name}</a>`).join('')}</div>`).join('')}</div></div></section>
<section class="sec"><div class="wrap"><div class="sec-head"><h2>From the articles</h2><a href="/articles" class="chip">All articles</a></div><div class="grid">${ARTICLES.map(a => `<a class="card" href="/articles/${a.slug}"><h3>${a.title}</h3><p>${a.desc}</p></a>`).join('')}</div></div></section>
<section class="sec"><div class="wrap"><div class="sec-head"><h2>Why TinyTools?</h2></div><div class="why">
  <div><h3>No sign-up</h3><p>Open a tool and use it. There are no accounts or passwords.</p></div>
  <div><h3>Free to use</h3><p>Every tool is free, with no trial periods or paywalled downloads.</p></div>
  <div><h3>Works in your browser</h3><p>Tools run on your device, so there is nothing to install.</p></div>
  <div><h3>Fast and private</h3><p>Files are processed locally by the tool, not uploaded to our servers.</p></div></div></div></section>`
}));

/* Tools directory */
add('/tools', shell({
  title: 'All Free Online Tools – TinyTools', p: '/tools',
  desc: 'Browse every TinyTools utility: image, PDF, text, calculator, converter and generator tools that run in your browser.',
  ld: [crumbList([['Home', '/'], ['Tools', '/tools']])],
  body: `<div class="wrap">${crumbs([['Home', '/'], ['Tools', '/tools']])}<div class="page-head"><h1>All tools</h1><p>Search, sort and pick a tool. Everything runs in your browser.</p></div>
<div class="row" style="max-width:560px"><label class="f">Search<input type="search" id="q" placeholder="Search tools..." autocomplete="off"></label><label class="f">Sort by<select id="sort"><option value="popular">Popular</option><option value="new">New</option><option value="cat">Category</option></select></label></div>
<div id="list" style="padding-bottom:24px"><div class="grid">${TOOLS.map(card).join('')}</div></div></div>`
}));

/* Tool pages */
for (const t of TOOLS) {
  const rel = [...TOOLS.filter(x => x.cat === t.cat && x !== t), ...TOOLS.filter(x => x.cat !== t.cat && x !== t)].slice(0, 3);
  const [cid, cq] = t.cross, art = ARTICLES.find(a => a.tool === t.id);
  const p = '/' + t.id;
  add(p, shell({
    title: t.title, desc: t.seo, p,
    ld: [crumbList([['Home', '/'], ['Tools', '/tools'], [t.name, p]]),
      { '@context': 'https://schema.org', '@type': 'WebApplication', name: t.name, url: SITE + p, description: t.seo, applicationCategory: 'UtilitiesApplication', operatingSystem: 'Any', offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' } },
      { '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: t.faq.map(f => ({ '@type': 'Question', name: f[0], acceptedAnswer: { '@type': 'Answer', text: f[1] } })) }],
    body: `<div class="wrap">${crumbs([['Home', '/'], ['Tools', '/tools'], [t.name, p]])}
<div class="page-head"><h1>${t.h1}</h1><p>${t.seo}</p></div>
<section class="panel" id="tool" data-tool="${t.id}" aria-label="${t.name}"><p class="muted">Loading the tool…</p><noscript><p>This tool needs JavaScript to run in your browser.</p></noscript></section>
<div class="two"><div class="prose"><h2>How to use the ${t.name}</h2><ol class="how">${t.how.map(h => `<li>${h}</li>`).join('')}</ol>
<h2>About this tool</h2><p>${t.body}</p><p class="cross">${cq} Try our ${L(cid)}.</p>${art ? `<p>Want to learn more? Read <a href="/articles/${art.slug}">${art.title}</a>.</p>` : ''}</div>
<section><h2 style="margin-bottom:8px">FAQ</h2>${t.faq.map(f => `<details><summary>${f[0]}</summary><p>${f[1]}</p></details>`).join('')}</section></div>
<section class="sec" style="padding-top:0"><h2 style="margin-bottom:18px">Related tools</h2><div class="grid">${rel.map(card).join('')}</div></section></div>`
  }));
}

/* Articles */
add('/articles', shell({
  title: 'Articles and Guides – TinyTools', p: '/articles',
  desc: 'Short, practical guides on word counts, QR codes, image compression and more, with links to the free tools that help.',
  ld: [crumbList([['Home', '/'], ['Articles', '/articles']])],
  body: `<div class="wrap">${crumbs([['Home', '/'], ['Articles', '/articles']])}<div class="page-head"><h1>Articles and guides</h1><p>Short, practical guides that go with our tools.</p></div>
<div class="grid" style="padding-bottom:24px">${ARTICLES.map(a => `<a class="card" href="/articles/${a.slug}"><h3>${a.title}</h3><p>${a.desc}</p></a>`).join('')}</div></div>`
}));
for (const a of ARTICLES) {
  const p = '/articles/' + a.slug, t = tool(a.tool), others = ARTICLES.filter(x => x !== a);
  add(p, shell({
    title: `${a.title} | TinyTools`, desc: a.desc, p, type: 'article',
    ld: [crumbList([['Home', '/'], ['Articles', '/articles'], [a.title, p]]),
      { '@context': 'https://schema.org', '@type': 'Article', headline: a.title, description: a.desc, datePublished: DATE, dateModified: DATE, author: { '@type': 'Organization', name: 'TinyTools' }, publisher: { '@type': 'Organization', name: 'TinyTools' }, mainEntityOfPage: SITE + p }],
    body: `<div class="wrap">${crumbs([['Home', '/'], ['Articles', '/articles'], [a.title, p]])}<article class="prose" style="padding:12px 0 24px"><h1>${a.title}</h1><p class="meta">Updated ${DATE}</p>${a.body}
<div class="callout"><p>Try it now: ${t.desc}</p><a class="btn" href="/${t.id}">${a.cta}</a></div></article>
<section class="sec" style="padding-top:0"><h2 style="margin-bottom:18px">More guides</h2><div class="grid">${others.map(o => `<a class="card" href="/articles/${o.slug}"><h3>${o.title}</h3><p>${o.desc}</p></a>`).join('')}</div></section></div>`
  }));
}

/* Static pages */
const page = (slug, title, desc, inner) => add('/' + slug, shell({ title: `${title} – TinyTools`, desc, p: '/' + slug, ld: [crumbList([['Home', '/'], [title, '/' + slug]])], body: `<div class="wrap">${crumbs([['Home', '/'], [title, '/' + slug]])}<div class="legal"><h1>${title}</h1>${inner}</div></div>` }));
page('about', 'About', 'TinyTools is a collection of simple browser-based utilities designed to solve small everyday problems quickly.',
  `<p class="muted" style="margin-top:16px;font-size:1.1rem">TinyTools is a collection of simple browser-based utilities designed to solve small everyday problems quickly.</p><p>There are no accounts, no paid APIs and no clutter. Each tool does one job, and most run entirely on your device.</p><p><a class="btn" href="/tools">Explore Tools</a></p>`);
page('privacy', 'Privacy', 'How TinyTools handles your files and data.', `<p class="muted">Last updated: 2026</p>
<h2>Your files</h2><p>The image, PDF, text, calculator and converter tools are designed to process your input in your browser. The files and text you use with them are not uploaded to a TinyTools server.</p>
<h2>What we don't collect</h2><p>TinyTools has no accounts and does not ask for personal information. This version includes no analytics or advertising cookies.</p>
<h2>Stored on your device</h2><p>Your light/dark theme choice is saved in your browser's local storage. Nothing else is saved.</p>
<h2>Third-party requests</h2><p>Fonts load from Google Fonts. The QR Code Generator and PDF to Images tools load a small open-source library from cdnjs the first time you open them. Those services can see your IP address and browser details when they serve these files, as with any website resource. Your own files and text are not sent to them.</p>
<h2>Hosting</h2><p>Whoever hosts this site (for example Vercel or Cloudflare) may keep standard server logs. Check their policy for details.</p>
<h2>Questions</h2><p>See the <a href="/contact">contact page</a>.</p>`);
page('terms', 'Terms', 'Terms of use for TinyTools.', `<p class="muted">Last updated: 2026</p>
<h2>Use of the tools</h2><p>TinyTools is free to use. You are responsible for the files and content you process and for having the right to use them.</p>
<h2>No warranty</h2><p>The tools are provided "as is". We work to make results accurate, but calculators and converters can contain mistakes, so double-check anything important such as medical, legal or financial figures.</p>
<h2>Changes</h2><p>We may change or remove tools and update these terms at any time.</p>`);
page('contact', 'Contact', 'Get in touch with the TinyTools team.', `<p class="muted" style="margin-top:16px;font-size:1.1rem">Questions, bug reports or ideas for new tools? Send an email.</p>
<p><a class="btn" href="mailto:recallpdf@gmail.com">recallpdf@gmail.com</a></p>`);

add('/404', shell({ title: 'Page not found – TinyTools', desc: 'This page could not be found.', p: '/404', noindex: true,
  body: `<div class="wrap legal"><h1>Page not found</h1><p class="muted">That page doesn't exist. Head back to the <a href="/tools">tools</a> or the <a href="/">homepage</a>.</p></div>` }), false);

/* Write everything */
for (const [p, html] of Object.entries(files)) {
  const out = path.join(dir, p === '/' ? 'index.html' : p.slice(1) + '.html');
  fs.mkdirSync(path.dirname(out), { recursive: true }); fs.writeFileSync(out, html);
}
fs.writeFileSync(path.join(dir, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map(u => `  <url><loc>${SITE}${u === '/' ? '/' : u}</loc><lastmod>${DATE}</lastmod></url>`).join('\n')}\n</urlset>\n`);
fs.writeFileSync(path.join(dir, 'robots.txt'), `User-agent: *\nAllow: /\n\nSitemap: ${SITE}/sitemap.xml\n`);
fs.writeFileSync(path.join(dir, 'vercel.json'), JSON.stringify({ cleanUrls: true, trailingSlash: false }, null, 2) + '\n');
console.log(`Built ${Object.keys(files).length} pages, ${urls.length} URLs in sitemap.`);
