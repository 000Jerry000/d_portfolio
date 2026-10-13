// Works page: category + keyword finder. Header, menu and ja/en switch come from /assets/js/page.js.

// ===== categories & tags =====
// Client-facing categories follow the order of the top page's services; each one
// gathers the technical tags stored in projects.json ("category": "design wordpress").
const CATEGORIES = [
    { id: 'ai', ja: 'AI活用・業務自動化', en: 'AI & Automation', tags: ['chatgpt', 'python', 'gas'] },
    { id: 'webapp', ja: 'Webアプリ・システム', en: 'Web Apps & Systems', tags: ['system', 'security'] },
    { id: 'app', ja: 'アプリ開発', en: 'App Development', tags: ['android', 'google-map'] },
    { id: 'website', ja: 'Webサイト制作', en: 'Websites', tags: ['wordpress', 'design', 'no-code', 'sass'] },
];

const TAGS = {
    wordpress: { ja: 'WordPress', en: 'WordPress' },
    design: { ja: 'デザイン', en: 'Design' },
    'no-code': { ja: 'ノーコード', en: 'No-code' },
    sass: { ja: 'Sass', en: 'Sass' },
    python: { ja: 'Python', en: 'Python' },
    chatgpt: { ja: 'ChatGPT', en: 'ChatGPT' },
    gas: { ja: 'GAS', en: 'GAS' },
    system: { ja: 'システム開発', en: 'Systems' },
    security: { ja: 'セキュリティ', en: 'Security' },
    android: { ja: 'Android', en: 'Android' },
    'google-map': { ja: 'Google マップ', en: 'Google Maps' },
};

// client industries, stored per project as "industry": ["medical", …] in projects.json
const INDUSTRIES = [
    { id: 'medical', ja: '医療・ヘルスケア', en: 'Healthcare & Medical', icon: 'fa-clinic-medical' },
    { id: 'beauty', ja: '美容・フィットネス', en: 'Beauty & Fitness', icon: 'fa-spa' },
    { id: 'realestate', ja: '不動産・住宅', en: 'Real Estate', icon: 'fa-home' },
    { id: 'retail', ja: 'EC・小売', en: 'E-commerce & Retail', icon: 'fa-shopping-bag' },
    { id: 'travel', ja: '観光・宿泊・イベント', en: 'Travel, Hotels & Events', icon: 'fa-hotel' },
    { id: 'media', ja: 'メディア・エンタメ', en: 'Media & Entertainment', icon: 'fa-newspaper' },
    { id: 'matching', ja: 'マッチング・コミュニティ', en: 'Matching & Community', icon: 'fa-user-friends' },
    { id: 'marketing', ja: 'マーケティング・集客', en: 'Marketing', icon: 'fa-chart-line' },
    { id: 'business', ja: '業務効率化・社内ツール', en: 'Business Tools', icon: 'fa-briefcase' },
    { id: 'other', ja: '個人・その他', en: 'Personal & Other', icon: 'fa-ellipsis-h' },
];

// quick searches clients commonly start from
const SUGGESTIONS = {
    ja: ['WordPress', 'ChatGPT', 'ECサイト', 'マッチング', '自動化', 'スクレイピング', 'セキュリティ'],
    en: ['WordPress', 'ChatGPT', 'E-commerce', 'Matching', 'Automation', 'Scraping', 'Security'],
};

// search expansions: typing any word in the first list also matches the words in both lists,
// so plain-language searches ("EC", "自動化") find technical entries. One-way on purpose:
// "Shopify" should not widen into every EC project.
const SYNONYMS = [
    [['ec', 'ecサイト', 'e-commerce', 'ecommerce', '通販', 'ネットショップ', 'ショップ'], ['shopify']],
    [['ai', '人工知能'], ['chatgpt', 'gpt', 'openai']],
    [['自動化', 'automation', 'automate'], ['自動', 'gas', 'スクレイピング', 'scraping']],
    [['スクレイピング', 'scraping', 'データ収集'], []],
    [['マッチング', 'matching'], []],
    [['アプリ', 'app'], ['android', 'flutterflow']],
    [['ホームページ', 'website', 'webサイト', 'コーポレートサイト'], ['wordpress', 'サイト', 'site']],
    [['ノーコード', 'no-code', 'nocode', 'ローコード', 'low-code'], ['shopify', 'squarespace']],
    [['セキュリティ', 'security'], ['パスワード', 'password']],
    [['地図', 'map', 'マップ'], ['google']],
    [['在庫', 'inventory'], ['zaiko']],
    [['予約', 'booking', 'reservation', 'ホテル', 'hotel', '宿泊'], []],
    [['wordpress', 'ワードプレス', 'wp'], []],
    [['python', 'パイソン'], []],
    [['chatgpt', 'チャットgpt', 'openai', 'gpt'], []],
    [['shopify', 'ショッピファイ'], []],
    [['歯科', 'dental', 'デンタル', 'クリニック', 'clinic', '医院', '病院'], []],
    [['サロン', 'salon', '美容', 'beauty', 'エステ'], []],
    [['不動産', 'estate', 'house', '住宅'], []],
    [['デザイン', 'design'], ['ui', 'ux']],
];

// ===== strings =====
const I18N = {
    ja: {
        all: 'すべて',
        viewSite: 'サイトを見る',
        code: 'コード',
        count: (shown, total) => `<strong>${shown}</strong>件の実績を表示中<span>（全${total}件）</span>`,
        tagSearch: tag => `「${tag}」で絞り込む`,
    },
    en: {
        all: 'All',
        viewSite: 'Visit site',
        code: 'Code',
        count: (shown, total) => `Showing <strong>${shown}</strong> ${shown === 1 ? 'project' : 'projects'}<span> (of ${total})</span>`,
        tagSearch: tag => `Filter by “${tag}”`,
    },
};

const t = key => I18N[siteLanguage()][key];
const label = item => item[siteLanguage()] || item.ja;

document.addEventListener('site:langchange', () => {
    if (!projects) return;
    renderSuggestions();
    render();
});

// ===== works finder =====
const grid = document.getElementById('work-grid');
const searchInput = document.getElementById('work-search');
const searchClear = document.getElementById('search-clear');
const categoryList = document.getElementById('category-list');
const suggestList = document.getElementById('suggest-list');
const resultCount = document.getElementById('result-count');
const resetBtn = document.getElementById('filter-reset');
const emptyState = document.getElementById('finder-empty');
const industryPanel = document.querySelector('.industry-panel');
const industryList = document.getElementById('industry-list');
const industryToggle = document.getElementById('industry-toggle');
const industryToggleCount = document.getElementById('industry-toggle-count');
const industryClear = document.getElementById('industry-clear');

let projects = null;
const state = { category: 'all', query: '', industries: [] };

// full-width → half-width, lower case, katakana → hiragana, so 「ワードプレス」「ＷＯＲＤＰＲＥＳＳ」 etc. match
function normalize(text) {
    return String(text || '')
        .normalize('NFKC')
        .toLowerCase()
        .replace(/[ァ-ヶ]/g, ch => String.fromCharCode(ch.charCodeAt(0) - 0x60));
}

const escapeHTML = text => String(text ?? '').replace(/[&<>"']/g, ch =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[ch]);

const SYNONYM_GROUPS = SYNONYMS.map(([when, also]) => ({
    when: when.map(normalize),
    words: [...when, ...also].map(normalize),
}));

// each typed word becomes a set of alternatives; every word must match
function parseQuery(query) {
    return normalize(query).split(/\s+/).filter(Boolean).map(word => {
        const alternatives = new Set([word]);
        SYNONYM_GROUPS.forEach(group => {
            if (group.when.includes(word)) group.words.forEach(w => alternatives.add(w));
        });
        return [...alternatives];
    });
}

// short Latin words ("ec", "ai", "ui") must match a whole word, not part of "project"
const matcherCache = new Map();
function wordMatcher(word) {
    if (!matcherCache.has(word)) {
        const short = /^[a-z0-9]{1,3}$/.test(word);
        matcherCache.set(word, short
            ? (text => new RegExp(`(^|[^a-z0-9])${word}([^a-z0-9]|$)`).test(text))
            : (text => text.includes(word)));
    }
    return matcherCache.get(word);
}

function prepareProject(project, index) {
    const tags = String(project.category || '').split(/\s+/).filter(Boolean);
    const categories = CATEGORIES.filter(c => c.tags.some(tag => tags.includes(tag))).map(c => c.id);
    const industries = (project.industry || []).filter(id => INDUSTRIES.some(i => i.id === id));
    const haystack = normalize([
        project.name, project.name_en, project.desc, project.desc_en,
        ...tags, ...tags.flatMap(tag => TAGS[tag] ? [TAGS[tag].ja, TAGS[tag].en] : []),
        ...CATEGORIES.filter(c => categories.includes(c.id)).flatMap(c => [c.ja, c.en]),
        ...INDUSTRIES.filter(i => industries.includes(i.id)).flatMap(i => [i.ja, i.en]),
        project.links && project.links.view,
    ].join(' '));
    return { ...project, index, tags, categories, industries, haystack };
}

const matchesQuery = (project, terms) =>
    terms.every(alternatives => alternatives.some(word => wordMatcher(word)(project.haystack)));

const matchesCategory = (project, category) =>
    category === 'all' || project.categories.includes(category);

// several selected industries widen the results (OR)
const matchesIndustry = (project, industries) =>
    industries.length === 0 || industries.some(id => project.industries.includes(id));

// wrap matched words in <mark> (on the visible text only)
function highlight(text, terms) {
    // normalized words cover case/width; the raw typed words cover katakana in the text
    const raw = state.query.normalize('NFKC').split(/\s+/);
    const words = [...new Set([...terms.flat(), ...raw])].filter(w => w.length > 0).sort((a, b) => b.length - a.length);
    const safe = escapeHTML(text);
    if (!words.length) return safe;
    const pattern = words.map(w => {
        const source = escapeHTML(w).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        return /^[a-z0-9]{1,3}$/i.test(w) ? `(?<![A-Za-z0-9])${source}(?![A-Za-z0-9])` : source;
    }).join('|');
    try {
        return safe.replace(new RegExp(`(${pattern})`, 'gi'), '<mark>$1</mark>');
    } catch (e) {
        return safe;
    }
}

function renderCategories(terms) {
    const pool = projects.filter(p => matchesQuery(p, terms) && matchesIndustry(p, state.industries));
    const items = [{ id: 'all', ja: I18N.ja.all, en: I18N.en.all }, ...CATEGORIES];
    categoryList.innerHTML = items.map(cat => {
        const count = pool.filter(p => matchesCategory(p, cat.id)).length;
        const active = state.category === cat.id;
        return `
        <button type="button" class="cat-chip${active ? ' is-active' : ''}" data-category="${cat.id}"
            aria-pressed="${active}"${count === 0 && !active ? ' disabled' : ''}>
            <span>${escapeHTML(label(cat))}</span><em>${count}</em>
        </button>`;
    }).join('');
}

// industry counts respect the keyword and category, so empty choices are visible at a glance
function renderIndustries(terms) {
    const pool = projects.filter(p => matchesQuery(p, terms) && matchesCategory(p, state.category));
    industryList.innerHTML = INDUSTRIES.map(ind => {
        const count = pool.filter(p => p.industries.includes(ind.id)).length;
        const checked = state.industries.includes(ind.id);
        return `
        <li>
            <label class="industry-option${checked ? ' is-checked' : ''}${count === 0 && !checked ? ' is-empty' : ''}">
                <input type="checkbox" value="${ind.id}"${checked ? ' checked' : ''}${count === 0 && !checked ? ' disabled' : ''}>
                <i class="fas ${ind.icon}" aria-hidden="true"></i>
                <span class="industry-name">${escapeHTML(label(ind))}</span>
                <em>${count}</em>
            </label>
        </li>`;
    }).join('');

    const selected = state.industries.length;
    industryToggleCount.textContent = selected ? selected : '';
    industryClear.hidden = selected === 0;
}

function renderSuggestions() {
    suggestList.innerHTML = SUGGESTIONS[siteLanguage()].map(word =>
        `<button type="button" class="suggest-chip" data-query="${escapeHTML(word)}">${escapeHTML(word)}</button>`
    ).join('');
}

function cardHTML(project, i, terms) {
    const en = siteLanguage() === 'en';
    const name = (en && project.name_en) || project.name;
    const desc = (en && project.desc_en) || project.desc;
    const category = CATEGORIES.find(c => project.categories.includes(c.id));
    const industries = INDUSTRIES.filter(i => project.industries.includes(i.id)).map(label);
    const view = project.links && project.links.view;
    const code = project.links && project.links.code;
    const tags = project.tags.filter(tag => TAGS[tag]).map(tag => {
        const text = label(TAGS[tag]);
        return `<li><button type="button" class="work-tag" data-query="${escapeHTML(text)}"
            aria-label="${escapeHTML(t('tagSearch')(text))}">${escapeHTML(text)}</button></li>`;
    }).join('');

    return `
    <article class="work-card works-item" style="--i:${Math.min(i, 12)}">
        <div class="work-thumb">
            <img draggable="false" src="/assets/images/projects/${encodeURIComponent(project.image)}" alt="${escapeHTML(name)}" loading="lazy" />
            <span class="work-num">${String(i + 1).padStart(2, '0')}</span>
            ${category ? `<span class="work-cat">${escapeHTML(label(category))}</span>` : ''}
        </div>
        ${industries.length ? `<p class="work-industry">${industries.map(escapeHTML).join('<span>／</span>')}</p>` : ''}
        <h3>${highlight(name, terms)}</h3>
        <p>${highlight(desc, terms)}</p>
        <ul class="work-tags">${tags}</ul>
        <div class="work-links">
            ${view ? `<a href="${escapeHTML(view)}" target="_blank" rel="noopener"><i class="fas fa-eye"></i>${t('viewSite')}</a>` : ''}
            ${code ? `<a href="${escapeHTML(code)}" target="_blank" rel="noopener"><i class="fas fa-code"></i>${t('code')}</a>` : ''}
        </div>
    </article>`;
}

function syncURL() {
    const params = new URLSearchParams(location.search);
    state.category === 'all' ? params.delete('cat') : params.set('cat', state.category);
    state.query ? params.set('q', state.query) : params.delete('q');
    state.industries.length ? params.set('ind', state.industries.join(',')) : params.delete('ind');
    const search = params.toString();
    history.replaceState(null, '', `${location.pathname}${search ? `?${search}` : ''}${location.hash}`);
}

function render() {
    const terms = parseQuery(state.query);
    const shown = projects.filter(p =>
        matchesCategory(p, state.category) && matchesIndustry(p, state.industries) && matchesQuery(p, terms));

    renderCategories(terms);
    renderIndustries(terms);
    grid.innerHTML = shown.map((p, i) => cardHTML(p, i, terms)).join('');
    grid.hidden = shown.length === 0;
    emptyState.hidden = shown.length > 0;
    resultCount.innerHTML = t('count')(shown.length, projects.length);

    const filtered = state.category !== 'all' || state.query.trim() !== '' || state.industries.length > 0;
    resetBtn.hidden = !filtered;
    searchClear.hidden = state.query === '';
    suggestList.querySelectorAll('.suggest-chip').forEach(chip =>
        chip.classList.toggle('is-active', normalize(chip.dataset.query) === normalize(state.query.trim())));
}

function update(changes, { scroll = false } = {}) {
    Object.assign(state, changes);
    if ('query' in changes && searchInput.value !== state.query) searchInput.value = state.query;
    render();
    syncURL();
    if (scroll) {
        const top = document.querySelector('.finder').getBoundingClientRect().top + window.scrollY - 90;
        if (window.scrollY > top) window.scrollTo({ top, behavior: 'smooth' });
    }
}

let searchTimer = null;
searchInput.addEventListener('input', () => {
    clearTimeout(searchTimer);
    searchTimer = setTimeout(() => update({ query: searchInput.value }), 120);
});
searchInput.addEventListener('keydown', e => {
    if (e.key === 'Escape' && searchInput.value) update({ query: '' });
});
searchClear.addEventListener('click', () => {
    update({ query: '' });
    searchInput.focus();
});

categoryList.addEventListener('click', e => {
    const chip = e.target.closest('.cat-chip');
    if (chip && !chip.disabled) update({ category: chip.dataset.category });
});

suggestList.addEventListener('click', e => {
    const chip = e.target.closest('.suggest-chip');
    if (!chip) return;
    const same = normalize(chip.dataset.query) === normalize(state.query.trim());
    update({ query: same ? '' : chip.dataset.query });
});

grid.addEventListener('click', e => {
    const tag = e.target.closest('.work-tag');
    if (tag) update({ query: tag.dataset.query }, { scroll: true });
});

industryList.addEventListener('change', e => {
    const box = e.target.closest('input[type="checkbox"]');
    if (!box) return;
    const selected = new Set(state.industries);
    box.checked ? selected.add(box.value) : selected.delete(box.value);
    // keep the sidebar's order in the URL
    update({ industries: INDUSTRIES.map(i => i.id).filter(id => selected.has(id)) });
});

industryClear.addEventListener('click', () => update({ industries: [] }));

// phones: the sidebar collapses into a toggle above the results
industryToggle.addEventListener('click', () => {
    const open = industryPanel.classList.toggle('is-open');
    industryToggle.setAttribute('aria-expanded', String(open));
});

const resetAll = () => update({ category: 'all', query: '', industries: [] });
resetBtn.addEventListener('click', resetAll);
document.getElementById('empty-reset').addEventListener('click', resetAll);

// ===== start =====
const params = new URLSearchParams(location.search);

if (CATEGORIES.some(c => c.id === params.get('cat'))) state.category = params.get('cat');
state.query = params.get('q') || '';
state.industries = (params.get('ind') || '').split(',').filter(id => INDUSTRIES.some(i => i.id === id));
searchInput.value = state.query;

fetch('/projects/projects.json')
    .then(res => res.json())
    .then(data => {
        projects = data.map(prepareProject);
        renderSuggestions();
        render();
    })
    .catch(() => {
        resultCount.textContent = siteLanguage() === 'en'
            ? 'Sorry, the projects could not be loaded.'
            : '実績を読み込めませんでした。時間をおいて再度お試しください。';
    });
