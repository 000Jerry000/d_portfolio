// Works page: category + keyword finder. Header, menu and ja/en switch come from /assets/js/page.js.

// ===== categories & tags =====
// Client-facing categories follow the order of the top page's services; each one
// gathers the technical tags stored in projects.json ("category": "design wordpress").
const CATEGORIES = [
    { id: 'ai', ja: 'AI活用・業務自動化', en: 'AI & Automation', tags: ['ai', 'chatgpt', 'python', 'gas', 'image-generate', 'text-generate', 'voice-generate', 'report-generation', 'rag', 'image-processing', 'prompt-engineering', 'bot', 'chatbot', 'dify', 'gpts', 'machine-learning', 'data-analysis', 'prediction', 'maintenance', 'personalization', 'healthcare'] },
    { id: 'webapp', ja: 'Webアプリ・システム', en: 'Web Apps & Systems', tags: ['webapp', 'system', 'saas', 'security', 'reservation', 'payment', 'marketing', 'crm', 'integration', 'automation', 'api', 'gemini-api', 'openai-api', 'realtime-chat'] },
    { id: 'app', ja: 'アプリ開発', en: 'App Development', tags: ['app', 'android', 'ios', 'flutter', 'firebase', 'google-map', '3d-visualization'] },
    { id: 'website', ja: 'Webサイト制作', en: 'Websites', tags: ['website', 'wordpress', 'design', 'no-code', 'sass', 'hp', 'lp', 'ui-ux', 'social-media'] },
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

// client industries, stored per project as "industry": ["medical", …] in projects.json.
// The sidebar keeps this order; industries without any project yet are grouped at the
// bottom behind a toggle.
const INDUSTRIES = [
    { id: 'it', ja: 'IT・通信・インターネット', en: 'IT, Telecom & Internet', icon: 'fa-wifi' },
    { id: 'mass-media', ja: 'マスコミ・メディア', en: 'Mass Media', icon: 'fa-broadcast-tower' },
    { id: 'publishing', ja: '新聞・雑誌・出版', en: 'Newspapers, Magazines & Publishing', icon: 'fa-newspaper' },
    { id: 'advertising', ja: '広告・イベント・プロモーション', en: 'Advertising, Events & Promotion', icon: 'fa-bullhorn' },
    { id: 'entertainment', ja: '芸能・エンターテイメント', en: 'Entertainment', icon: 'fa-star' },
    { id: 'games', ja: 'ゲーム・アニメ・玩具', en: 'Games, Anime & Toys', icon: 'fa-gamepad' },
    { id: 'dating', ja: '恋愛・出会い・占い', en: 'Dating & Fortune-telling', icon: 'fa-heart' },
    { id: 'wedding', ja: '婚活・ブライダル', en: 'Matchmaking & Weddings', icon: 'fa-ring' },
    { id: 'pets', ja: '動物・ペット', en: 'Animals & Pets', icon: 'fa-paw' },
    { id: 'gardening', ja: '生花・園芸・造園', en: 'Florists, Gardening & Landscaping', icon: 'fa-seedling' },
    { id: 'arts', ja: '美術・工芸・音楽', en: 'Art, Crafts & Music', icon: 'fa-music' },
    { id: 'sports', ja: 'スポーツ・フィットネス', en: 'Sports & Fitness', icon: 'fa-dumbbell' },
    { id: 'automotive', ja: '自動車・バイク', en: 'Cars & Motorcycles', icon: 'fa-car' },
    { id: 'travel', ja: '旅行・観光・グルメ', en: 'Travel, Tourism & Gourmet', icon: 'fa-plane' },
    { id: 'hotels', ja: 'ホテル・旅館・民泊', en: 'Hotels, Inns & Lodging', icon: 'fa-hotel' },
    { id: 'manufacturer', ja: 'メーカー', en: 'Manufacturers', icon: 'fa-industry' },
    { id: 'trading', ja: '商社', en: 'Trading Companies', icon: 'fa-globe-asia' },
    { id: 'logistics', ja: '流通・運輸・交通', en: 'Distribution, Logistics & Transport', icon: 'fa-truck' },
    { id: 'manufacturing', ja: '工業・製造', en: 'Industry & Manufacturing', icon: 'fa-cogs' },
    { id: 'retail', ja: '卸売・小売', en: 'Wholesale & Retail', icon: 'fa-store' },
    { id: 'fashion', ja: 'ファッション・アパレル', en: 'Fashion & Apparel', icon: 'fa-tshirt' },
    { id: 'furniture', ja: '家具・インテリア', en: 'Furniture & Interiors', icon: 'fa-couch' },
    { id: 'food', ja: '食品・飲料・たばこ', en: 'Food, Beverages & Tobacco', icon: 'fa-apple-alt' },
    { id: 'medical', ja: '医療・医薬', en: 'Medical & Pharmaceutical', icon: 'fa-clinic-medical' },
    { id: 'care', ja: '介護・福祉', en: 'Nursing Care & Welfare', icon: 'fa-hands-helping' },
    { id: 'housekeeping', ja: '家事代行', en: 'Housekeeping Services', icon: 'fa-broom' },
    { id: 'funeral', ja: '葬祭', en: 'Funeral Services', icon: 'fa-dove' },
    { id: 'finance', ja: '金融・保険', en: 'Finance & Insurance', icon: 'fa-yen-sign' },
    { id: 'realestate', ja: '住宅・不動産', en: 'Housing & Real Estate', icon: 'fa-home' },
    { id: 'construction', ja: '建築・工務店', en: 'Architecture & Builders', icon: 'fa-hard-hat' },
    { id: 'restaurants', ja: '店舗（飲食店・居酒屋など）', en: 'Shops (Restaurants, Bars, etc.)', icon: 'fa-utensils' },
    { id: 'salon', ja: '美容室・サロン', en: 'Hair & Beauty Salons', icon: 'fa-cut' },
    { id: 'lessons', ja: '資格・習い事', en: 'Qualifications & Lessons', icon: 'fa-certificate' },
    { id: 'childcare', ja: '保育園・幼稚園', en: 'Nurseries & Kindergartens', icon: 'fa-baby' },
    { id: 'cram-school', ja: '塾・予備校', en: 'Cram & Prep Schools', icon: 'fa-pencil-alt' },
    { id: 'schools', ja: '大学・学校', en: 'Universities & Schools', icon: 'fa-university' },
    { id: 'research', ja: '学術・研究', en: 'Academia & Research', icon: 'fa-flask' },
    { id: 'survey', ja: 'リサーチ・調査', en: 'Market Research & Surveys', icon: 'fa-search' },
    { id: 'consulting', ja: 'コンサルティング・シンクタンク', en: 'Consulting & Think Tanks', icon: 'fa-lightbulb' },
    { id: 'professional', ja: '士業（個人事務所）', en: 'Licensed Professionals (Private Practice)', icon: 'fa-balance-scale' },
    { id: 'staffing', ja: '人材紹介・人材派遣', en: 'Recruitment & Staffing', icon: 'fa-id-badge' },
    { id: 'translation', ja: '翻訳・通訳', en: 'Translation & Interpreting', icon: 'fa-language' },
    { id: 'energy', ja: 'エネルギー（電気・ガス・水道など）', en: 'Energy (Electricity, Gas, Water, etc.)', icon: 'fa-bolt' },
    { id: 'primary', ja: '農林・水産・鉱業', en: 'Agriculture, Fisheries & Mining', icon: 'fa-tractor' },
    { id: 'facilities', ja: '清掃・設備・警備', en: 'Cleaning, Facilities & Security', icon: 'fa-shield-alt' },
    { id: 'nonprofit', ja: '公益・非営利団体', en: 'Public Interest & Non-profits', icon: 'fa-hand-holding-heart' },
    { id: 'government', ja: '官公庁・自治体', en: 'Government & Municipalities', icon: 'fa-landmark' },
    { id: 'politics', ja: '政治', en: 'Politics', icon: 'fa-vote-yea' },
    { id: 'religion', ja: '宗教', en: 'Religion', icon: 'fa-place-of-worship' },
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
        showEmptyIndustries: n => `実績のない業種も表示<span>（${n}）</span>`,
        hideEmptyIndustries: '実績のない業種を閉じる',
    },
    en: {
        all: 'All',
        viewSite: 'Visit site',
        code: 'Code',
        count: (shown, total) => `Showing <strong>${shown}</strong> ${shown === 1 ? 'project' : 'projects'}<span> (of ${total})</span>`,
        tagSearch: tag => `Filter by “${tag}”`,
        showEmptyIndustries: n => `Show industries without projects<span> (${n})</span>`,
        hideEmptyIndustries: 'Hide industries without projects',
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
let showEmptyIndustries = false;

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

function industryOptionHTML(ind, count, { hasProjects }) {
    const checked = state.industries.includes(ind.id);
    const empty = count === 0 && !checked;
    return `
        <li>
            <label class="industry-option${checked ? ' is-checked' : ''}${empty ? ' is-empty' : ''}${hasProjects ? '' : ' is-unused'}">
                <input type="checkbox" value="${ind.id}"${checked ? ' checked' : ''}${empty ? ' disabled' : ''}>
                <i class="fas ${ind.icon}" aria-hidden="true"></i>
                <span class="industry-name">${escapeHTML(label(ind))}</span>
                <em>${count}</em>
            </label>
        </li>`;
}

// Industries with projects come first (in INDUSTRIES order); the rest sit behind a toggle.
// Counts respect the keyword and category, so choices that would empty the list are dimmed.
function renderIndustries(terms) {
    const pool = projects.filter(p => matchesQuery(p, terms) && matchesCategory(p, state.category));
    const used = new Set(projects.flatMap(p => p.industries));
    const withProjects = INDUSTRIES.filter(ind => used.has(ind.id));
    const withoutProjects = INDUSTRIES.filter(ind => !used.has(ind.id));
    const count = ind => pool.filter(p => p.industries.includes(ind.id)).length;

    // a selected industry must stay visible
    if (withoutProjects.some(ind => state.industries.includes(ind.id))) showEmptyIndustries = true;

    industryList.innerHTML =
        withProjects.map(ind => industryOptionHTML(ind, count(ind), { hasProjects: true })).join('') +
        (withoutProjects.length ? `
        <li class="industry-more">
            <button type="button" class="industry-more-btn" id="industry-more-btn"
                aria-expanded="${showEmptyIndustries}" aria-controls="industry-unused">
                <span>${showEmptyIndustries ? t('hideEmptyIndustries') : t('showEmptyIndustries')(withoutProjects.length)}</span>
                <i class="fas fa-chevron-down" aria-hidden="true"></i>
            </button>
        </li>
        <li class="industry-unused-wrap"${showEmptyIndustries ? '' : ' hidden'}>
            <ul class="industry-unused" id="industry-unused">
                ${withoutProjects.map(ind => industryOptionHTML(ind, 0, { hasProjects: false })).join('')}
            </ul>
        </li>` : '');

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

industryList.addEventListener('click', e => {
    if (!e.target.closest('#industry-more-btn')) return;
    showEmptyIndustries = !showEmptyIndustries;
    renderIndustries(parseQuery(state.query));
    document.getElementById('industry-more-btn').focus();
});

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
