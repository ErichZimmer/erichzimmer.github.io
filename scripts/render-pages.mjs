import { readFile, readdir, stat, writeFile } from 'node:fs/promises';
import { basename, dirname, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import MarkdownPage from '../modules/MarkdownPage.js';
import collectionConfig from '../modules/collections.js';
import { renderHTMLDocument, renderHomeMarkup, renderCollectionMarkup, renderArticleMarkup } from '../modules/PageRenderer.js';

const siteRoot = fileURLToPath(new URL('../', import.meta.url));

async function loadComponents() {
    const names = ['header', 'nav', 'footer'];
    const components = {};
    await Promise.all(names.map(async (name) => {
        components[name] = await readFile(resolve(siteRoot, 'components', `${name}.html`), 'utf8');
    }));
    return components;
}

function getCollection(directory) {
    const collection = Object.values(collectionConfig).find((config) => resolve(siteRoot, `.${config.basePath}`) === directory);
    if (!collection) {
        throw new Error(`Unknown collection: ${directory}`);
    }
    return collection;
}

export async function renderMarkdownFile(markdownPath, components = null) {
    const sourcePath = resolve(markdownPath);
    if (!/\.(md|markdown)$/i.test(sourcePath)) {
        throw new Error(`Expected a markdown file: ${markdownPath}`);
    }

    const collection = getCollection(dirname(sourcePath));
    const raw = await readFile(sourcePath, 'utf8');
    const page = new MarkdownPage({ url: `${collection.basePath}/${basename(sourcePath)}`, raw });
    const file = basename(sourcePath).replace(/\.(md|markdown)$/i, '.html');
    const metadata = {
        file,
        source: basename(sourcePath),
        slug: page.slug,
        title: page.title,
        date: page.date,
        tags: page.tags,
        summary: page.summary,
        ...(page.externalUrl ? { externalUrl: page.externalUrl } : {}),
        wordCount: page.wordCount,
        readingTimeMinutes: page.readingTimeMinutes
    };

    const html = renderHTMLDocument({
        title: page.title,
        description: page.summary,
        content: renderArticleMarkup(collection, page, page.toHTML()),
        components: components || await loadComponents()
    });
    await writeFile(resolve(dirname(sourcePath), file), html, 'utf8');
    return metadata;
}

export async function renderCollection(collectionPath, components = null) {
    const directory = resolve(collectionPath);
    const config = getCollection(directory);
    components = components || await loadComponents();
    const entries = await readdir(directory, { withFileTypes: true });
    const sources = entries.filter((entry) => entry.isFile() && /\.(md|markdown)$/i.test(entry.name));
    const files = await Promise.all(sources.map((entry) => renderMarkdownFile(resolve(directory, entry.name), components)));
    files.sort((a, b) => String(b.date).localeCompare(String(a.date)) || a.title.localeCompare(b.title));

    await writeFile(resolve(directory, 'index.json'), `${JSON.stringify({ files }, null, 4)}\n`, 'utf8');
    const collection = {
        ...config,
        items: files.map((metadata) => MarkdownPage.fromMetadata(metadata, config.basePath))
    };
    const html = renderHTMLDocument({
        title: config.title,
        description: config.description,
        content: renderCollectionMarkup(collection),
        components
    });
    await writeFile(resolve(siteRoot, `${config.type}.html`), html, 'utf8');
    return files;
}

export async function renderSite() {
    const components = await loadComponents();
    let count = 0;
    for (const config of Object.values(collectionConfig)) {
        const files = await renderCollection(resolve(siteRoot, `.${config.basePath}`), components);
        count += files.length;
    }

    await writeFile(resolve(siteRoot, 'index.html'), renderHTMLDocument({
        title: 'Home',
        description: 'A static GitHub Pages site for research, blogs, projects, and PIV utilities.',
        content: renderHomeMarkup(),
        components
    }), 'utf8');
    await writeFile(resolve(siteRoot, 'piv-utilities.html'), renderHTMLDocument({
        title: 'PIV Utilities',
        description: 'Calculator for maximum allowable velocity.',
        components
    }), 'utf8');
    await writeFile(resolve(siteRoot, '404.html'), renderHTMLDocument({
        title: 'Page not found',
        components
    }), 'utf8');
    return count;
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
    try {
        const target = process.argv[2];
        if (target) {
            const targetPath = resolve(target);
            const info = await stat(targetPath);
            if (info.isFile() && !/\.(md|markdown)$/i.test(targetPath)) {
                throw new Error(`Expected a markdown file or collection directory: ${target}`);
            }
            const directory = info.isFile() ? dirname(targetPath) : targetPath;
            const files = await renderCollection(directory);
            console.log(`Rendered ${files.length} articles in ${directory}.`);
        } else {
            const count = await renderSite();
            console.log(`Rendered ${count} articles and the site pages.`);
        }
    } catch (error) {
        console.error(error.message);
        process.exitCode = 1;
    }
}
