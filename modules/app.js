import ComponentLoader from './ComponentLoader.js';
import ContentCollection from './ContentCollection.js';
import MarkdownPage from './MarkdownPage.js';
import PIVCalculator from './PIVCalculator.js';

const app = document.querySelector('#app');
const collections = {
    research: new ContentCollection({
        type: 'research',
        title: 'Research',
        description: 'Research projects and technical notes.',
        basePath: './pages/research'
    }),
    blogs: new ContentCollection({
        type: 'blogs',
        title: 'Blogs',
        description: 'General blog posts.',
        basePath: './pages/blogs'
    })
};

async function init() {
    try {
        await new ComponentLoader(document).load();
    } catch (error) {
        console.error(error);
        renderError('Component loading failed', error.message);
        return;
    }

    window.addEventListener('hashchange', route);
    document.addEventListener('click', handleDocumentClick);

    if (!window.location.hash) {
        window.location.hash = '#/home';
    } else {
        route();
    }
}

function setPageTitle(title = '') {
    const siteName = 'Erich Zimmer';
    document.title = title ? `${title} | ${siteName}` : siteName;
}

function parseRoute() {
    const hash = window.location.hash.replace(/^#\/?/, '');
    const parts = hash.split('/').filter(Boolean);
    return {
        page: parts[0] || 'home',
        slug: parts[1] || ''
    };
}

async function route() {
    const { page, slug } = parseRoute();
    setActiveNav(page);
    app.focus({ preventScroll: true });

    try {
        if (page === 'home') {
            renderHome();
            return;
        }

        if (page === 'research') {
            await renderCollectionPage('research', slug);
            return;
        }

        if (page === 'blogs') {
            await renderCollectionPage('blogs', slug);
            return;
        }

        if (page === 'piv-utilities') {
            setPageTitle('PIV Utilities');
            new PIVCalculator(app).render();
            return;
        }

        renderNotFound(page);
    } catch (error) {
        console.error(error);
        renderError('Page failed to render', error.message);
    }
}

function setActiveNav(page) {
    const navLinks = [...document.querySelectorAll('.site-nav a')];
    for (const link of navLinks) {
        link.classList.toggle('active', link.dataset.route === page);
    }
}

function handleDocumentClick(event) {
    const reset = event.target.closest('[data-reset-search]');
    if (reset) {
        const input = document.querySelector('#content-search');
        if (input) {
            input.value = '';
            input.dispatchEvent(new Event('input'));
        }
    }
}

function renderHome() {
    setPageTitle('Home');
    app.innerHTML = `
        <section class="center-zone">
            <article class="panel hero">
                <p class="eyebrow">Home</p>
                <h1>Research, blogs, and PIV utilities.</h1>
            </article>

            <section class="home-grid" aria-label="Site sections">
                ${homeCard('#/research', 'Research', 'Project summaries and technical research.')}
                ${homeCard('#/blogs', 'Blogs', 'General posts, updates, and notes.')}
                ${homeCard('#/piv-utilities', 'PIV Utilities', 'Calculator for maximum allowable velocity from FOV, resolution, blur, and pulse length.')}
            </section>

            <article class="panel">
                <div class="panel-body">
                    <h2>About</h2>
                    <p>
                        I am a graduate in computer science with a focus on 
                        machine learning and ethics. I am also a research 
                        enthusiast and love electrical engineering and fluid 
                        dynamics. This has led to efforts on my behalf to design 
                        and construct open source and low-cost hardware and 
                        software to further my self-studies along with those 
                        who suffer from stingent funding allocations. More 
                        information on these projects can be seen in the research 
                        page along with some miscellaneous information in the
                        blog page.
                    </p>
                </div>
            </article>
        </section>`;
}

function homeCard(href, title, description) {
    return `
        <a class="card" href="${href}">
            <p class="eyebrow">Open</p>
            <h2>${escapeHTML(title)}</h2>
            <p>${escapeHTML(description)}</p>
        </a>`;
}

async function renderCollectionPage(type, slug = '') {
    const collection = collections[type];

    if (!collection.items.length) {
        await collection.load();
    }

    if (slug) {
        renderArticle(collection, slug);
        return;
    }

    setPageTitle(collection.title);
    const listHTML = collection.items.map((item) => contentCard(collection.type, item)).join('');

    app.innerHTML = `
        <section class="center-zone">
            <article class="panel page-title">
                <p class="eyebrow">${escapeHTML(collection.title)}</p>
                <h1>${escapeHTML(collection.title)}</h1>
                <p>${escapeHTML(collection.description)}</p>
            </article>

            <article class="panel">
                <div class="toolbar">
                    <strong>${collection.items.length} markdown ${collection.items.length === 1 ? 'file' : 'files'}</strong>
                    <input id="content-search" class="search-input" type="search" placeholder="Search title, date, or tags" aria-label="Search ${escapeHTML(collection.title)}">
                </div>
                <div class="panel-body">
                    <section id="content-list" class="card-grid" aria-label="${escapeHTML(collection.title)} list">
                        ${listHTML || '<p class="empty-state">No markdown files were found. Add files to the manifest for this section.</p>'}
                    </section>
                </div>
            </article>
        </section>`;

    const searchInput = document.querySelector('#content-search');
    const list = document.querySelector('#content-list');
    searchInput.addEventListener('input', () => {
        const query = searchInput.value.trim().toLowerCase();
        const filtered = collection.items.filter((item) => {
            const haystack = `${item.title} ${item.date} ${item.tags.join(' ')} ${item.summary}`.toLowerCase();
            return haystack.includes(query);
        });

        list.innerHTML = filtered.length
            ? filtered.map((item) => contentCard(collection.type, item)).join('')
            : `<p class="empty-state">No items match this search. <button type="button" data-reset-search>Clear search</button></p>`;
    });
}

function contentCard(type, item) {
    const tags = item.tags.map((tag) => `<li class="tag">${escapeHTML(tag)}</li>`).join('');
    return `
        <a class="content-card" href="#/${type}/${encodeURIComponent(item.slug)}" data-title="${escapeAttr(item.title)}">
            <div class="meta-row">
                ${renderMetaParts(item)}
            </div>
            <h2>${escapeHTML(item.title)}</h2>
            ${item.summary ? `<p>${escapeHTML(item.summary)}</p>` : ''}
            ${tags ? `<ul class="tag-list">${tags}</ul>` : ''}
        </a>`;
}

function renderMetaParts(item, { includeWordCount = false } = {}) {
    const parts = [formatDate(item.date) || 'Undated'];

    if (item.readingTimeText) {
        parts.push(item.readingTimeText);
    }

    if (includeWordCount && item.wordCount) {
        parts.push(`${formatNumber(item.wordCount)} words`);
    }

    return parts
        .map((part) => `<span>${escapeHTML(part)}</span>`)
        .join('<span aria-hidden="true">·</span>');
}

function renderArticle(collection, slug) {
    const item = collection.getBySlug(decodeURIComponent(slug));
    if (!item) {
        renderNotFound(slug);
        return;
    }

    setPageTitle(item.title);
    const tags = item.tags.map((tag) => `<li class="tag">${escapeHTML(tag)}</li>`).join('');
    app.innerHTML = `
        <section class="center-zone">
            <article class="panel article">
                <header class="article-header">
                    <a class="back-link" href="#/${collection.type}">← Back to ${escapeHTML(collection.title)}</a>
                    <p class="eyebrow">${escapeHTML(collection.title)}</p>
                    <h1>${escapeHTML(item.title)}</h1>
                    <div class="meta-row">
                        ${renderMetaParts(item, { includeWordCount: true })}
                    </div>
                    ${tags ? `<ul class="tag-list">${tags}</ul>` : ''}
                </header>
                <section class="markdown-body">
                    ${item.toHTML()}
                </section>
            </article>
        </section>`;
}

function renderNotFound(label = '') {
    setPageTitle('404');
    app.innerHTML = `
        <section class="center-zone">
            <article class="panel">
                <div class="panel-body">
                    <p class="eyebrow">404</p>
                    <h1>Page not found</h1>
                    <p>The route <code>${escapeHTML(label)}</code> could not be found.</p>
                    <p><a class="back-link" href="#/home">Return home</a></p>
                </div>
            </article>
        </section>`;
}

function renderError(title, message) {
    setPageTitle('Error');
    app.innerHTML = `
        <section class="center-zone">
            <article class="panel">
                <div class="panel-body">
                    <p class="eyebrow">Error</p>
                    <h1>${escapeHTML(title)}</h1>
                    <p>${escapeHTML(message)}</p>
                </div>
            </article>
        </section>`;
}

function formatDate(value = '') {
    if (!value) {
        return '';
    }

    const date = new Date(`${value}T00:00:00`);
    if (Number.isNaN(date.getTime())) {
        return value;
    }

    return new Intl.DateTimeFormat(undefined, { year: 'numeric', month: 'short', day: 'numeric' }).format(date);
}

function formatNumber(value = 0) {
    return new Intl.NumberFormat(undefined).format(value);
}

function escapeHTML(value = '') {
    return MarkdownPage.escapeHTML(value);
}

function escapeAttr(value = '') {
    return MarkdownPage.escapeAttr(value);
}

init();
