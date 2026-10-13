// Shared shell for the sub pages (/projects, /experience): header, menu, ja/en switch,
// reveal-on-scroll, tab title. The top page has its own copy in script.js.
// Page scripts react to language changes through the "site:langchange" event.

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

document.getElementById('year').textContent = new Date().getFullYear();

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
        el.style.transitionDelay = `${Math.min(i % 6, 5) * 80}ms`;
        revealer.observe(el);
    });
}

// ===== language (ja / en) =====
const LANGS = ['ja', 'en'];
const LANG_KEY = 'portfolio-lang';

// the Japanese markup is the source; English lives in data-en / data-en-* attributes
// (<title data-en="…"> is included, so each page sets its own English title)
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

const siteLanguage = () => (document.documentElement.lang === 'en' ? 'en' : 'ja');

function readStoredLang() {
    try { return localStorage.getItem(LANG_KEY); } catch (e) { return null; }
}

let pageTitle = document.title;

function setLang(lang, { save = true } = {}) {
    if (!LANGS.includes(lang)) lang = 'ja';
    document.documentElement.lang = lang;

    i18nNodes.forEach(({ el, ja, en }) => {
        const value = lang === 'en' ? en : ja;
        if (el.tagName === 'META') el.content = value;
        else if (el.tagName === 'TITLE') el.textContent = value;
        else el.innerHTML = value;
    });
    i18nAttrs.forEach(({ el, attr, ja, en }) => el.setAttribute(attr, lang === 'en' ? en : ja));
    pageTitle = document.title;

    document.querySelectorAll('.lang-switch button').forEach(btn =>
        btn.setAttribute('aria-pressed', String(btn.dataset.lang === lang)));

    if (save) {
        try { localStorage.setItem(LANG_KEY, lang); } catch (e) { /* storage unavailable */ }
    }

    document.dispatchEvent(new CustomEvent('site:langchange', { detail: lang }));
}

document.querySelectorAll('.lang-switch button').forEach(btn =>
    btn.addEventListener('click', () => setLang(btn.dataset.lang)));

const urlLang = new URLSearchParams(location.search).get('lang');
if (LANGS.includes(urlLang)) setLang(urlLang);
else if (LANGS.includes(readStoredLang())) setLang(readStoredLang(), { save: false });

observeReveal();

// ===== tab title =====
document.addEventListener('visibilitychange', function () {
    const favicon = document.getElementById('favicon');
    if (document.visibilityState === 'visible') {
        document.title = pageTitle;
        favicon.setAttribute('href', '/assets/images/favicon.svg');
    } else {
        document.title = 'Come Back To Portfolio';
        favicon.setAttribute('href', '/assets/images/favhand.webp');
    }
});

// block dev-tools shortcuts (same as the top page)
document.onkeydown = function (e) {
    if (e.keyCode == 123) {
        return false;
    }
    if (e.ctrlKey && e.shiftKey && ['I', 'C', 'J'].some(k => e.keyCode == k.charCodeAt(0))) {
        return false;
    }
    if (e.ctrlKey && e.keyCode == 'U'.charCodeAt(0)) {
        return false;
    }
};
