// ===== header / menu =====
const header = document.getElementById('header');
const menuBtn = document.getElementById('menu');
const navbar = document.getElementById('navbar');
const scrollTopBtn = document.getElementById('scroll-top');

function closeMenu() {
    menuBtn.classList.remove('open');
    navbar.classList.remove('nav-toggle');
    menuBtn.setAttribute('aria-expanded', 'false');
}

menuBtn.addEventListener('click', function () {
    const open = navbar.classList.toggle('nav-toggle');
    menuBtn.classList.toggle('open', open);
    menuBtn.setAttribute('aria-expanded', String(open));
});

navbar.querySelectorAll('a').forEach(a => a.addEventListener('click', closeMenu));

function onScroll() {
    const y = window.scrollY;
    header.classList.toggle('scrolled', y > 20);
    scrollTopBtn.classList.toggle('active', y > 60);
}
window.addEventListener('scroll', onScroll, { passive: true });
onScroll();

// ===== scroll spy =====
const navLinks = navbar.querySelectorAll('a[href^="#"]');
const spy = new IntersectionObserver(entries => {
    entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        navLinks.forEach(a => a.classList.toggle('active', a.getAttribute('href') === `#${entry.target.id}`));
    });
}, { rootMargin: '-45% 0px -50% 0px' });
document.querySelectorAll('main section[id]').forEach(s => spy.observe(s));

// ===== reveal on scroll =====
const revealer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            revealer.unobserve(entry.target);
        }
    });
}, { threshold: 0.12 });

function observeReveal(root = document) {
    root.querySelectorAll('.reveal:not(.is-visible)').forEach((el, i) => {
        // stagger siblings in grids
        el.style.transitionDelay = `${Math.min(i % 6, 5) * 80}ms`;
        revealer.observe(el);
    });
}
observeReveal();

// ===== language (ja / en) =====
const I18N = {
    ja: {
        title: "Portfolio | 土井　健広 | Doi Takehiro",
        awayTitle: "Come Back To Portfolio",
        roles: ["フロントエンドエンジニア", "バックエンドエンジニア", "AIエンジニア", "Androidアプリ開発者", "Webエンジニア"],
        viewSite: "サイトを見る",
        code: "コード",
        sending: "送信中です…",
        sent: "送信が完了しました。ありがとうございます。",
        failed: "送信に失敗しました。お手数ですがメールにてご連絡ください。",
    },
    en: {
        title: "Portfolio | Takehiro Doi | Full-Stack & AI Engineer",
        awayTitle: "Come Back To Portfolio",
        roles: ["a front-end engineer", "a back-end engineer", "an AI engineer", "an Android app developer", "a web engineer"],
        viewSite: "Visit site",
        code: "Code",
        sending: "Sending…",
        sent: "Your message has been sent. Thank you!",
        failed: "Sorry, something went wrong. Please contact me by email instead.",
    },
};
const LANGS = Object.keys(I18N);
const LANG_KEY = 'portfolio-lang';

// the Japanese markup is the source; English lives in data-en / data-en-* attributes
const i18nNodes = [...document.querySelectorAll('[data-en]')].map(el => ({
    el,
    ja: el.tagName === 'META' ? el.content : el.innerHTML,
    en: el.dataset.en,
}));
const i18nAttrs = [];
document.querySelectorAll('*').forEach(el => {
    for (const { name, value } of [...el.attributes]) {
        if (name.startsWith('data-en-')) {
            const attr = name.slice('data-en-'.length);
            i18nAttrs.push({ el, attr, ja: el.getAttribute(attr), en: value });
        }
    }
});

let currentLang = 'ja';
const t = key => I18N[currentLang][key];

function readStoredLang() {
    try { return localStorage.getItem(LANG_KEY); } catch (e) { return null; }
}

function setLang(lang, { save = true } = {}) {
    if (!LANGS.includes(lang)) lang = 'ja';
    currentLang = lang;
    document.documentElement.lang = lang;
    document.title = t('title');

    i18nNodes.forEach(({ el, ja, en }) => {
        const value = lang === 'en' ? en : ja;
        if (el.tagName === 'META') el.content = value;
        else el.innerHTML = value;
    });
    i18nAttrs.forEach(({ el, attr, ja, en }) => el.setAttribute(attr, lang === 'en' ? en : ja));

    document.querySelectorAll('.lang-switch button').forEach(btn =>
        btn.setAttribute('aria-pressed', String(btn.dataset.lang === lang)));

    roleEl.textContent = t('roles')[roleIndex];
    if (projectsData) showProjects(projectsData);
    formStatus.textContent = '';

    if (save) {
        try { localStorage.setItem(LANG_KEY, lang); } catch (e) { /* storage unavailable */ }
    }

    document.dispatchEvent(new CustomEvent('site:langchange', { detail: lang }));
}

document.querySelectorAll('.lang-switch button').forEach(btn =>
    btn.addEventListener('click', () => setLang(btn.dataset.lang)));

// ===== rotating role =====
const roleEl = document.querySelector('.role-rotator');
let roleIndex = 0;
setInterval(() => {
    roleEl.classList.add('out');
    setTimeout(() => {
        roleIndex = (roleIndex + 1) % t('roles').length;
        roleEl.textContent = t('roles')[roleIndex];
        roleEl.classList.remove('out');
    }, 400);
}, 2800);

// ===== tab title =====
document.addEventListener('visibilitychange', function () {
    const favicon = document.getElementById('favicon');
    if (document.visibilityState === "visible") {
        document.title = t('title');
        favicon.setAttribute("href", "assets/images/favicon.svg");
    } else {
        document.title = t('awayTitle');
        favicon.setAttribute("href", "assets/images/favhand.webp");
    }
});

// ===== skills / projects =====
async function fetchData(type = "skills") {
    const response = await fetch(type === "skills" ? "skills.json" : "./projects/projects.json");
    return response.json();
}

function showSkills(skills) {
    const skillsContainer = document.getElementById("skillsContainer");
    skillsContainer.innerHTML = skills.map(skill => `
        <div class="skill reveal">
            <img src="${skill.icon}" alt="" loading="lazy" />
            <span>${skill.name}</span>
        </div>`).join("");
    observeReveal(skillsContainer);
}

let projectsData = null;

function showProjects(projects) {
    const en = currentLang === 'en';
    const projectsContainer = document.querySelector("#work .work-grid");
    projectsContainer.innerHTML = projects
        .filter(project => project.category != "android")
        .slice(0, 9)
        .map((project, i) => {
            const name = (en && project.name_en) || project.name;
            const desc = (en && project.desc_en) || project.desc;
            return `
        <article class="work-card reveal">
            <div class="work-thumb">
                <img draggable="false" src="/assets/images/projects/${project.image}" alt="${name}" loading="lazy" />
                <span class="work-num">${String(i + 1).padStart(2, "0")}</span>
            </div>
            <h3>${name}</h3>
            <p>${desc}</p>
            <div class="work-links">
                <a href="${project.links.view}" target="_blank" rel="noopener"><i class="fas fa-eye"></i>${t('viewSite')}</a>
                <a href="${project.links.code}" target="_blank" rel="noopener"><i class="fas fa-code"></i>${t('code')}</a>
            </div>
        </article>`;
        }).join("");
    observeReveal(projectsContainer);
}

fetchData().then(showSkills);
fetchData("projects").then(projects => {
    projectsData = projects;
    showProjects(projects);
});

// ===== contact form (emailjs) =====
const form = document.getElementById('contact-form');
const formStatus = form.querySelector('.form-status');
const submitBtn = form.querySelector('button[type="submit"]');

form.addEventListener('submit', function (event) {
    event.preventDefault();
    submitBtn.disabled = true;
    formStatus.classList.remove('error');
    formStatus.textContent = t('sending');

    emailjs.sendForm('default_service', 'template_tqr125r', this)
        .then(() => {
            formStatus.textContent = t('sent');
            form.reset();
        }, (err) => {
            formStatus.classList.add('error');
            formStatus.textContent = t('failed');
            console.error(err);
        })
        .finally(() => {
            submitBtn.disabled = false;
        });
});

// ?lang=en|ja in the URL wins (shareable links), then the visitor's last choice, then Japanese
const urlLang = new URLSearchParams(location.search).get('lang');
if (LANGS.includes(urlLang)) setLang(urlLang);
else if (LANGS.includes(readStoredLang())) setLang(readStoredLang(), { save: false });

document.getElementById('year').textContent = new Date().getFullYear();

// disable developer mode shortcuts
document.onkeydown = function (e) {
    if (e.keyCode == 123) {
        return false;
    }
    if (e.ctrlKey && e.shiftKey && e.keyCode == 'I'.charCodeAt(0)) {
        return false;
    }
    if (e.ctrlKey && e.shiftKey && e.keyCode == 'C'.charCodeAt(0)) {
        return false;
    }
    if (e.ctrlKey && e.shiftKey && e.keyCode == 'J'.charCodeAt(0)) {
        return false;
    }
    if (e.ctrlKey && e.keyCode == 'U'.charCodeAt(0)) {
        return false;
    }
}

// Start of Tawk.to Live Chat
var Tawk_API = Tawk_API || {}, Tawk_LoadStart = new Date();

// replace Tawk's default bubble with the site's own launcher
const chatLauncher = document.getElementById('chat-launcher');
const chatBadge = chatLauncher.querySelector('.chat-launcher-badge');

// Tawk renders into same-origin iframes, so the site theme can be injected into them
const TAWK_THEME_HREF = new URL('assets/css/tawk-theme.css', document.baseURI).href;
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

function themeTawkFrames() {
    document.querySelectorAll('iframe').forEach(frame => {
        let doc;
        try { doc = frame.contentDocument; } catch (e) { return; }
        if (!doc || !doc.head || !doc.querySelector('.tawk-max-container, .tawk-min-container')) return;

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
    const ja = currentLang === 'ja' && tawkBundles.ja && tawkBundles.ja[key];
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

function translateTawkDocument(doc) {
    if (!doc || !doc.body || !tawkPairs.exact[currentLang]) return;
    const lang = currentLang;
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
        }).observe(doc.body, { childList: true, subtree: true, characterData: true });
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
