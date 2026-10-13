// Career page: durations and the "at a glance" span chart are computed from the timeline's
// data-start / data-end attributes (YYYY-MM; empty end = present), so the list stays the
// single source. Header, menu and ja/en switch come from /assets/js/page.js.

const careerItems = [...document.querySelectorAll('.career-item')];
const spanChart = document.getElementById('span-chart');

const now = new Date();
const monthIndex = ym => {
    const [y, m] = ym.split('-').map(Number);
    return y * 12 + (m - 1);
};
const NOW_INDEX = now.getFullYear() * 12 + now.getMonth();

const entries = careerItems.map((el, i) => {
    el.id = `career-${i + 1}`;
    const start = monthIndex(el.dataset.start);
    const ongoing = !el.dataset.end;
    const end = ongoing ? NOW_INDEX : monthIndex(el.dataset.end);
    return { el, type: el.dataset.type, start, end, ongoing, months: end - start + 1 };
});

function formatDuration(months, lang) {
    const y = Math.floor(months / 12);
    const m = months % 12;
    if (lang === 'en') {
        const parts = [];
        if (y) parts.push(`${y} ${y === 1 ? 'yr' : 'yrs'}`);
        if (m) parts.push(`${m} ${m === 1 ? 'mo' : 'mos'}`);
        return parts.join(' ') || '1 mo';
    }
    return `${y ? `${y}年` : ''}${m ? `${m}ヶ月` : ''}` || '1ヶ月';
}

function renderDurations() {
    const lang = siteLanguage();
    entries.forEach(({ el, months, ongoing }) => {
        const length = formatDuration(months, lang);
        el.querySelector('.career-duration').innerHTML = ongoing
            ? `<span class="career-now">${lang === 'en' ? 'Ongoing' : '継続中'}</span>${length}`
            : length;
    });
}

// one row per entry, oldest at the top so the chart reads left-to-right, top-to-bottom
function renderChart() {
    const firstYear = Math.floor(Math.min(...entries.map(e => e.start)) / 12);
    const lastYear = now.getFullYear() + 1;
    const from = firstYear * 12;
    const span = lastYear * 12 - from;
    const pct = month => ((month - from) / span) * 100;

    const years = [];
    for (let y = firstYear; y <= lastYear; y += 2) years.push(y);

    const rows = [...entries].reverse().map(e => {
        const title = e.el.querySelector('h3').textContent.trim();
        return `
        <div class="span-row" data-type="${e.type}">
            <span class="span-label">${title}</span>
            <span class="span-track">
                <span class="span-bar${e.ongoing ? ' is-ongoing' : ''}" data-target="${e.el.id}"
                    style="left:${pct(e.start)}%;width:${pct(e.end + 1) - pct(e.start)}%"
                    title="${title}"></span>
            </span>
        </div>`;
    }).join('');

    spanChart.innerHTML = `
        <div class="span-axis">
            <span class="span-label"></span>
            <span class="span-track">
                ${years.map(y => `<span class="span-tick" style="left:${pct(y * 12)}%">${y}</span>`).join('')}
                <span class="span-today" style="left:${pct(NOW_INDEX + 0.5)}%"></span>
            </span>
        </div>
        ${rows}`;
}

// clicking a bar jumps to that entry in the detailed list
spanChart.addEventListener('click', e => {
    const bar = e.target.closest('.span-bar');
    if (!bar) return;
    const target = document.getElementById(bar.dataset.target);
    target.scrollIntoView({ behavior: 'smooth', block: 'center' });
    target.classList.remove('is-flash');
    void target.offsetWidth;
    target.classList.add('is-flash');
});

function render() {
    renderDurations();
    renderChart();
}

document.addEventListener('site:langchange', render);
render();
