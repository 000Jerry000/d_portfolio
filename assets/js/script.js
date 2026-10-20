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
        roles: ["フロントエンドエンジニア", "バックエンドエンジニア", "AIエンジニア", "アプリ開発者", "Webエンジニア"],
        viewSite: "サイトを見る",
        code: "コード",
        sending: "送信中です…",
        sent: "送信が完了しました。ありがとうございます。",
        failed: "送信に失敗しました。お手数ですがライブチャットからご連絡ください。",
    },
    en: {
        title: "Portfolio | Takehiro Doi | Full-Stack & AI Engineer",
        awayTitle: "Come Back To Portfolio",
        roles: ["a front-end engineer", "a back-end engineer", "an AI engineer", "an Android app developer", "a web engineer"],
        viewSite: "Visit site",
        code: "Code",
        sending: "Sending…",
        sent: "Your message has been sent. Thank you!",
        failed: "Sorry, something went wrong. Please reach me via live chat instead.",
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
