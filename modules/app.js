import ComponentLoader from './ComponentLoader.js';
import ContentCollection from './ContentCollection.js';
import MarkdownPage from './MarkdownPage.js';
import PIVCalculator from './PIVCalculator.js';
import collectionConfig from './collections.js';
import {
    renderHomeMarkup, 
    renderCollectionMarkup, 
    renderArticleMarkup, 
    contentCard
} from './PageRenderer.js';

const app = document.querySelector('#app');
const collections = {};
let navigationId = 0;

for (const [type, config] of Object.entries(collectionConfig)) {
    collections[type] = new ContentCollection(config);
}

async function init() {
    if (redirectLegacyBlogURL()) {
        return;
    }

    try {
        await new ComponentLoader(document).load();
        window.addEventListener('popstate', route);
        window.addEventListener('hashchange', redirectLegacyBlogURL);
        document.addEventListener('click', handleDocumentClick);

        await initializePage();
    } catch (error) {
        console.error(error);
        renderError('Page failed to load', error.message);
    }
}

function redirectLegacyBlogURL() {
    if (window.location.hash === '#/blogs/blog-openpiv-cxx-performance') {
        window.location.replace('/pages/blogs/blog-openpiv-cxx-performance.html');
        return true;
    }

    return false;
}

async function initializePage() {
    if (app.dataset.rendered !== 'true') {
        await route();
        return;
    }

    const { page, slug } = parseRoute();
    const currentNavigation = navigationId;
    setActiveNav(page);

    if (collections[page] && !slug) {
        await collections[page].load();

        if (currentNavigation === navigationId) {
            bindCollectionSearch(collections[page]);
        }
    }
}

function setPageTitle(title = '') {
    const siteName = 'Erich Zimmer';
    document.title = title ? `${title} | ${siteName}` : siteName;
}

function parseRoute(url = new URL(window.location.href)) {
    const path = url.pathname;
    if (path === '/' || path === '/index.html') {
        return { page: 'home', slug: '' };
    }

    const section = path.match(/^\/(research|blogs|piv-utilities)\.html$/);
    if (section) {
        return { page: section[1], slug: '' };
    }

    const article = path.match(/^\/pages\/(research|blogs)\/([^/]+)\.html$/);
    if (article) {
        return { page: article[1], slug: decodeURIComponent(article[2]) };
    }

    return { page: 'not-found', slug: path };
}

function navigate(url) {
    if (url.href === window.location.href) {
        return;
    }

    window.history.pushState(null, '', url);
    route();
}

async function route() {
    const currentNavigation = ++navigationId;
    const { page, slug } = parseRoute();

    setActiveNav(page);
    app.focus({ preventScroll: true });

    try {
        if (page === 'home') {
            setPageTitle('Home');
            app.innerHTML = renderHomeMarkup();

            return;
        }

        if (collections[page]) {
            await renderCollectionPage(page, slug, currentNavigation);
            
            return;
        }

        if (page === 'piv-utilities') {
            setPageTitle('PIV Utilities');
            new PIVCalculator(app).render();

            return;
        }

        renderNotFound(slug);
    } catch (error) {
        if (currentNavigation === navigationId) {
            console.error(error);
            renderError('Page failed to render', error.message);
        }
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

        return;
    }

    const link = event.target.closest('a[href]');
    if (!link || event.defaultPrevented || event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) {
        return;
    }

    if (link.hasAttribute('download') || (link.target && link.target !== '_self')) {
        return;
    }

    const url = new URL(link.href);
    if (url.origin !== window.location.origin || url.hash || parseRoute(url).page === 'not-found') {
        return;
    }

    event.preventDefault();
    navigate(url);
}

async function renderCollectionPage(type, slug, currentNavigation) {
    const collection = collections[type];
    if (!collection.loaded) {
        await collection.load();
    }

    if (currentNavigation !== navigationId) {
        return;
    }

    if (slug) {
        const item = collection.getBySlug(slug);

        if (!item) {
            renderNotFound(slug);
            return;
        }

        const bodyHTML = await item.loadHTML();

        if (currentNavigation !== navigationId) {
            return;
        }

        setPageTitle(item.title);
        app.innerHTML = renderArticleMarkup(collection, item, bodyHTML);

        return;
    }

    setPageTitle(collection.title);
    app.innerHTML = renderCollectionMarkup(collection);
    bindCollectionSearch(collection);
}

function bindCollectionSearch(collection) {
    const searchInput = document.querySelector('#content-search');
    const list = document.querySelector('#content-list');
    
    searchInput.addEventListener('input', () => {
        const query = searchInput.value.trim().toLowerCase();
        const filtered = collection.items.filter((item) => {
            const haystack = `${item.title} ${item.date} ${item.tags.join(' ')} ${item.summary}`.toLowerCase();
            return haystack.includes(query);
        });

        list.innerHTML = filtered.length
            ? filtered.map((item) => contentCard(item)).join('')
            : `<p class="empty-state">No items match this search. <button type="button" data-reset-search>Clear search</button></p>`;
    });
}

function renderNotFound(label = '') {
    setPageTitle('404');
    app.innerHTML = `
        <section class="center-zone">
            <article class="panel">
                <div class="panel-body">
                    <p class="eyebrow">404</p>
                    <h1>Page not found</h1>
                    <p>The route <code>${MarkdownPage.escapeHTML(label)}</code> could not be found.</p>
                    <p><a class="back-link" href="/">Return home</a></p>
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
                    <h1>${MarkdownPage.escapeHTML(title)}</h1>
                    <p>${MarkdownPage.escapeHTML(message)}</p>
                </div>
            </article>
        </section>`;
}

init();
