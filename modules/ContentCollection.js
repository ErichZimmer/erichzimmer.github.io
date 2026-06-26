import MarkdownPage from './MarkdownPage.js';

export default class ContentCollection {
    constructor({ type, title, description, basePath }) {
        this.type = type;
        this.title = title;
        this.description = description;
        this.basePath = basePath;
        this.items = [];
        this.manifest = { files: [] };
    }

    async load() {
        await this.loadManifest();
        const files = Array.isArray(this.manifest.files) ? this.manifest.files : [];
        const pages = await Promise.all(files.map((file) => this.loadMarkdown(file)));
        this.items = pages
            .filter(Boolean)
            .sort((a, b) => String(b.date).localeCompare(String(a.date)) || a.title.localeCompare(b.title));
        return this.items;
    }

    async loadManifest() {
        const response = await fetch(`${this.basePath}/index.json`, { cache: 'no-cache' });

        if (!response.ok) {
            throw new Error(`Could not load ${this.basePath}/index.json. Add a manifest listing markdown files.`);
        }

        this.manifest = await response.json();
    }

    async loadMarkdown(file) {
        const fileName = typeof file === 'string' ? file : file.file;
        if (!fileName) {
            return null;
        }

        const page = await MarkdownPage.fromURL(`${this.basePath}/${fileName}`);
        page.slug = page.slug || fileName.replace(/\.(md|markdown)$/i, '');
        return page;
    }

    getBySlug(slug) {
        return this.items.find((item) => item.slug === slug);
    }
}
