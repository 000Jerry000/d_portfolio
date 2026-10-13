// Tawk.to live chat, shared by every page: site-styled launcher, theme injected into
// Tawk's iframes, language following the site's ja/en switch, and the owner's profile.
// Pages dispatch "site:langchange" on document when their language changes.

const siteLang = () => (document.documentElement.lang === 'en' ? 'en' : 'ja');

// Start of Tawk.to Live Chat
var Tawk_API = Tawk_API || {}, Tawk_LoadStart = new Date();

// replace Tawk's default bubble with the site's own launcher
const chatLauncher = document.getElementById('chat-launcher');
const chatBadge = chatLauncher.querySelector('.chat-launcher-badge');

// Tawk renders into same-origin iframes, so the site theme can be injected into them
const TAWK_THEME_HREF = new URL('/assets/css/tawk-theme.css', location.origin).href;
const TAWK_FONTS_HREF = 'https://fonts.googleapis.com/css2?family=Shippori+Mincho:wght@400;600&family=Zen+Kaku+Gothic+New:wght@400;500;700&display=swap';
const themedTawkFrames = new WeakSet();

function addStylesheet(doc, href, id) {
    const link = doc.createElement('link');
    link.rel = 'stylesheet';
    link.href = href;
    if (id) link.id = id;
    doc.head.appendChild(link);
}

// Tawk sets a rounded border-radius inline (with !important) on its iframes
function squareTawkFrame(frame) {
    if (frame.style.getPropertyValue('border-radius') !== '0px') {
        frame.style.setProperty('border-radius', '0px', 'important');
    }
}

// the "Powered by tawk.to" badge lives in its own iframe (with randomised ids)
const hiddenTawkFrames = new WeakSet();
function hideTawkFrame(frame) {
    if (frame.style.getPropertyValue('display') !== 'none') {
        frame.style.setProperty('display', 'none', 'important');
    }
}

function themeTawkFrames() {
    document.querySelectorAll('iframe').forEach(frame => {
        let doc;
        try { doc = frame.contentDocument; } catch (e) { return; }
        if (!doc || !doc.head) return;

        const isWidget = doc.querySelector('.tawk-max-container, .tawk-min-container');
        if (!isWidget && doc.querySelector('a[href*="tawk.to"], img[src*="Tawky"]')) {
            if (!hiddenTawkFrames.has(frame)) {
                hiddenTawkFrames.add(frame);
                hideTawkFrame(frame);
                new MutationObserver(() => hideTawkFrame(frame))
                    .observe(frame, { attributes: true, attributeFilter: ['style'] });
            }
            return;
        }
        if (!isWidget) return;

        if (!doc.getElementById('site-tawk-theme')) {
            addStylesheet(doc, TAWK_FONTS_HREF);
            addStylesheet(doc, TAWK_THEME_HREF, 'site-tawk-theme');
        }
        if (!themedTawkFrames.has(frame)) {
            themedTawkFrames.add(frame);
            squareTawkFrame(frame);
            new MutationObserver(() => squareTawkFrame(frame))
                .observe(frame, { attributes: true, attributeFilter: ['style'] });
        }
    });
    watchTawkDocuments();
}

// Tawk fills its iframes asynchronously, so retry briefly after each state change
function themeTawkSoon() {
    themeTawkFrames();
    [50, 250, 800, 2000].forEach(ms => setTimeout(themeTawkFrames, ms));
}

new MutationObserver(themeTawkSoon).observe(document.body, { childList: true });

// ----- Tawk language follows the site language -----
// Tawk's own language is fixed in the dashboard (English). Two layers switch it:
// 1. its translate helper is read from window.$_Tawk.i18next on every call, so text
//    rendered later comes from Tawk's Japanese bundle when the site is in Japanese;
// 2. text already on screen is swapped using the paired en/ja bundles (plus a few
//    strings that come from the dashboard rather than the bundles).
const TAWK_EXTRA_STRINGS = [
    ["Welcome to my site, if you need help simply reply to this message, I'm online and ready to help.",
        'ご覧いただきありがとうございます。ご相談やご質問がございましたら、お気軽にこのメッセージへご返信ください。'],
    ['Maximum {{ count }} characters', '最大{{ count }}文字'],
    ['Close Chat', 'チャットを閉じる'],
    ['This icon closes the chat window.', 'このアイコンでチャットウィンドウを閉じます。'],
];

let tawkTranslate = null;
const tawkBundles = { en: null, ja: null };
let tawkBundlesRequest = null;

function flattenBundle(node, prefix = '', out = {}) {
    Object.entries(node || {}).forEach(([key, value]) => {
        if (value && typeof value === 'object') flattenBundle(value, `${prefix}${key}.`, out);
        else if (typeof value === 'string') out[prefix + key] = value;
    });
    return out;
}

const fillPlaceholders = (template, values) =>
    template.replace(/{{\s*(\w+)\s*}}|{(\w+)}/g, (m, a, b) => values[a || b] ?? '');

function siteTawkTranslate(key, options = {}) {
    const ja = siteLang() === 'ja' && tawkBundles.ja && tawkBundles.ja[key];
    if (ja) return fillPlaceholders(ja, options);
    return typeof tawkTranslate === 'function' ? tawkTranslate(key, options) : '';
}

window.$_Tawk = window.$_Tawk || {};
Object.defineProperty(window.$_Tawk, 'i18next', {
    configurable: true,
    get() { return siteTawkTranslate; },
    set(fn) { tawkTranslate = fn; },
});

// string pairs for swapping rendered text: exact strings, plus templates whose
// placeholders are numbers ("Maximum 500 characters")
let tawkPairs = { exact: new Map(), templates: [] };

function buildTawkPairs() {
    const pairs = [...TAWK_EXTRA_STRINGS];
    if (tawkBundles.en && tawkBundles.ja) {
        Object.entries(tawkBundles.en).forEach(([key, en]) => {
            if (tawkBundles.ja[key]) pairs.push([en, tawkBundles.ja[key]]);
        });
    }
    const exact = { en: new Map(), ja: new Map() };
    const templates = { en: [], ja: [] };
    const escape = s => s.replace(/[.*+?^$()|[\]\\]/g, '\\$&');
    const placeholder = /{{\s*(\w+)\s*}}|{(\w+)}/;

    pairs.forEach(([en, ja]) => {
        if (!placeholder.test(en)) {
            exact.ja.set(en, ja);
            exact.en.set(ja, en);
            return;
        }
        [[en, ja, 'ja'], [ja, en, 'en']].forEach(([from, to, target]) => {
            const names = [];
            const source = escape(from).replace(/{{\s*(\w+)\s*}}|{(\w+)}/g, (m, a, b) => {
                names.push(a || b);
                return '(\\d[\\d,]*)';
            });
            if (names.length) templates[target].push({ re: new RegExp(`^${source}$`), names, to });
        });
    });
    tawkPairs = { exact, templates };
}

function translateTawkText(text, lang) {
    const trimmed = text.trim();
    if (!trimmed) return null;
    const key = trimmed.replace(/&#39;/g, "'");
    const hit = tawkPairs.exact[lang].get(key);
    if (hit) return text.replace(trimmed, hit);
    for (const { re, names, to } of tawkPairs.templates[lang]) {
        const m = key.match(re);
        if (m) {
            const values = Object.fromEntries(names.map((n, i) => [n, m[i + 1]]));
            return text.replace(trimmed, fillPlaceholders(to, values));
        }
    }
    return null;
}

// remembers what Tawk originally rendered, so switching back restores it exactly
// (several English strings share one Japanese translation)
const tawkOriginals = new WeakMap();

function swapTawkString(owner, slot, value, lang) {
    const saved = tawkOriginals.get(owner) || {};
    const memo = saved[slot];
    let next;
    if (memo && value === memo.shown) {
        next = lang === memo.lang ? value : memo.source;
        if (lang !== memo.lang) delete saved[slot];
    } else {
        next = translateTawkText(value, lang);
        if (next !== null && next !== value) {
            saved[slot] = { source: value, shown: next, lang };
            tawkOriginals.set(owner, saved);
        }
    }
    return next !== null && next !== value ? next : null;
}

// show the site owner's nickname and photo instead of the Tawk account profile
const TAWK_AGENT = {
    accountName: 'Jigar',
    name: 'Akira',
    avatar: new URL('/assets/images/chat-avatar.webp', location.origin).href,
};
const TAWK_AGENT_NAME_RE = new RegExp(`\\b${TAWK_AGENT.accountName}\\b`, 'g');

function applyTawkAgentProfile(doc) {
    const walker = doc.createTreeWalker(doc.body, NodeFilter.SHOW_TEXT);
    for (let node = walker.nextNode(); node; node = walker.nextNode()) {
        if (node.nodeValue.includes(TAWK_AGENT.accountName)) {
            node.nodeValue = node.nodeValue.replace(TAWK_AGENT_NAME_RE, TAWK_AGENT.name);
        }
    }
    doc.body.querySelectorAll('[aria-label], [title], [alt]').forEach(el => {
        ['aria-label', 'title', 'alt'].forEach(attr => {
            const value = el.getAttribute(attr);
            if (value && value.includes(TAWK_AGENT.accountName)) {
                el.setAttribute(attr, value.replace(TAWK_AGENT_NAME_RE, TAWK_AGENT.name));
            }
        });
    });
    doc.body.querySelectorAll('.tawk-avatar img, img[alt="Agent profile image"]').forEach(img => {
        if (img.getAttribute('src') !== TAWK_AGENT.avatar) img.setAttribute('src', TAWK_AGENT.avatar);
    });
}

function translateTawkDocument(doc) {
    if (!doc || !doc.body) return;
    applyTawkAgentProfile(doc);
    if (!tawkPairs.exact[siteLang()]) return;
    const lang = siteLang();
    const walker = doc.createTreeWalker(doc.body, NodeFilter.SHOW_TEXT);
    for (let node = walker.nextNode(); node; node = walker.nextNode()) {
        const next = swapTawkString(node, 'text', node.nodeValue, lang);
        if (next !== null) node.nodeValue = next;
    }
    doc.body.querySelectorAll('[placeholder], [aria-label], [title]').forEach(el => {
        ['placeholder', 'aria-label', 'title'].forEach(attr => {
            const value = el.getAttribute(attr);
            const next = value && swapTawkString(el, attr, value, lang);
            if (next) el.setAttribute(attr, next);
        });
    });
}

// the language files sit next to Tawk's versioned app bundle
function loadTawkBundles() {
    if (tawkBundlesRequest) return tawkBundlesRequest;
    const app = document.querySelector('script[src*="embed.tawk.to/_s/"][src$="/js/twk-main.js"]');
    if (!app) return Promise.resolve();
    const base = app.src.replace(/\/js\/twk-main\.js$/, '/languages/');
    tawkBundlesRequest = Promise.all(['en', 'ja'].map(lang =>
        fetch(`${base}${lang}.json`)
            .then(res => (res.ok ? res.json() : null))
            .then(json => { tawkBundles[lang] = json && flattenBundle(json); })
            .catch(() => null)
    )).then(buildTawkPairs);
    return tawkBundlesRequest;
}

function tawkDocuments() {
    return [...document.querySelectorAll('iframe')].map(frame => {
        try { return frame.contentDocument; } catch (e) { return null; }
    }).filter(doc => doc && doc.querySelector('.tawk-max-container, .tawk-min-container'));
}

function translateTawkFrames() {
    tawkDocuments().forEach(translateTawkDocument);
}

// re-translate whenever Tawk re-renders part of a frame
const watchedTawkDocs = new WeakSet();
function watchTawkDocuments() {
    tawkDocuments().forEach(doc => {
        if (watchedTawkDocs.has(doc)) return;
        watchedTawkDocs.add(doc);
        let queued = false;
        new MutationObserver(() => {
            if (queued) return;
            queued = true;
            requestAnimationFrame(() => { queued = false; translateTawkDocument(doc); });
        }).observe(doc.body, { childList: true, subtree: true, characterData: true, attributes: true, attributeFilter: ['src'] });
        translateTawkDocument(doc);
    });
}

document.addEventListener('site:langchange', translateTawkFrames);

Tawk_API.onLoad = function () {
    Tawk_API.hideWidget();
    chatLauncher.hidden = false;
    themeTawkSoon();
    loadTawkBundles().then(() => { themeTawkSoon(); translateTawkFrames(); });
};
Tawk_API.onChatMaximized = function () {
    chatLauncher.classList.add('is-open');
    themeTawkSoon();
};
Tawk_API.onChatMinimized = function () {
    Tawk_API.hideWidget();
    chatLauncher.classList.remove('is-open');
};
Tawk_API.onUnreadCountChanged = function (count) {
    chatBadge.textContent = count > 0 ? count : '';
};

chatLauncher.addEventListener('click', function () {
    Tawk_API.showWidget();
    Tawk_API.maximize();
});
(function () {
    var s1 = document.createElement("script"), s0 = document.getElementsByTagName("script")[0];
    s1.async = true;
    s1.src = 'https://embed.tawk.to/60df10bf7f4b000ac03ab6a8/1f9jlirg6';
    s1.charset = 'UTF-8';
    s1.setAttribute('crossorigin', '*');
    s0.parentNode.insertBefore(s1, s0);
})();
// End of Tawk.to Live Chat
