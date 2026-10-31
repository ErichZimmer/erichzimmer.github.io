import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';
import test from 'node:test';
import ContentCollection from '../modules/ContentCollection.js';
import MarkdownPage from '../modules/MarkdownPage.js';
import collectionConfig from '../modules/collections.js';

test('collection tiles use metadata without downloading or rendering articles', async (t) => {
    const requests = [];
    const metadata = {
        file: 'example.html',
        source: 'example.md',
        slug: 'example',
        title: 'Example',
        date: '2026-10-31',
        tags: ['Hardware'],
        summary: 'A project summary.',
        wordCount: 450,
        readingTimeMinutes: 3
    };
    t.mock.method(globalThis, 'fetch', async (url) => {
        requests.push(url);
        return Response.json({ files: [metadata] });
    });
    t.mock.method(MarkdownPage, 'renderMarkdown', () => assert.fail('Article rendering was not needed.'));
    t.mock.method(MarkdownPage, 'countWords', () => assert.fail('Word counting was not needed.'));

    const collection = new ContentCollection(collectionConfig.research);
    await collection.load();
    const item = collection.getBySlug('example');
    assert.equal(item.url, '/pages/research/example.html');
    assert.equal(item.title, metadata.title);
    assert.deepEqual(item.tags, metadata.tags);
    assert.equal(item.wordCount, 450);
    assert.equal(item.readingTimeText, '3 min read');
    assert.deepEqual(requests, ['/pages/research/index.json']);
});

for (const failure of ['missing', 'network']) {
    test(`articles fall back to Markdown after an HTML ${failure} failure and cache the result`, async (t) => {
        const requests = [];
        t.mock.method(globalThis, 'fetch', async (url) => {
            requests.push(url);
            if (url.endsWith('.html')) {
                if (failure === 'network') {
                    throw new TypeError('Failed to fetch');
                }
                return new Response('', { status: 404 });
            }
            return new Response('---\ntitle: Updated title\n---\n# Introduction\n\nOne two three.');
        });

        const page = MarkdownPage.fromMetadata({
            file: 'example.html',
            source: 'example.md',
            slug: 'example',
            title: 'Old title',
            wordCount: 900,
            readingTimeMinutes: 5
        }, '/pages/research');
        const html = await page.loadHTML();
        assert.match(html, /<h1>Introduction<\/h1>/);
        assert.match(html, /<p>One two three\.<\/p>/);
        assert.equal(page.title, 'Updated title');
        assert.equal(page.wordCount, 4);
        assert.equal(page.readingTimeMinutes, 1);
        assert.equal(await page.loadHTML(), html);
        assert.deepEqual(requests, ['/pages/research/example.html', '/pages/research/example.md']);
    });
}

test('generated pages and manifests match their Markdown sources', async () => {
    for (const config of Object.values(collectionConfig)) {
        const directory = new URL(`..${config.basePath}/`, import.meta.url);
        const manifest = JSON.parse(await readFile(new URL('index.json', directory), 'utf8'));
        const entries = await readdir(directory);
        const sources = entries.filter((file) => /\.(md|markdown)$/i.test(file)).sort();
        assert.deepEqual(manifest.files.map((item) => item.source).sort(), sources);

        for (const metadata of manifest.files) {
            const raw = await readFile(new URL(metadata.source, directory), 'utf8');
            const page = new MarkdownPage({ url: metadata.source, raw });
            const html = await readFile(new URL(metadata.file, directory), 'utf8');
            assert.equal(metadata.file, metadata.source.replace(/\.(md|markdown)$/i, '.html'));
            assert.equal(metadata.title, page.title);
            assert.equal(metadata.wordCount, page.wordCount);
            assert.equal(metadata.readingTimeMinutes, page.readingTimeMinutes);
            assert.ok(html.includes(page.toHTML()), `${metadata.file} should contain the rendered source.`);
            assert.match(html, /<!DOCTYPE html>/);
            assert.match(html, /src="\/modules\/app\.js"/);
            assert.match(html, /class="markdown-body"/);
        }
    }
});
