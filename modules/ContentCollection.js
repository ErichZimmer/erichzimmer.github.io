import MarkdownPage from './MarkdownPage.js';

export default class ContentCollection {
    constructor({ type, title, description, basePath }) {
        this.type = type;
        this.title = title;
        this.description = description;
        this.basePath = basePath;
        this.items = [];
        this.manifest = { files: [] };
        this.loaded = false;
    }

    async load() {
        await this.loadManifest();
        const files = Array.isArray(this.manifest.files) ? this.manifest.files : [];
        this.items = files
            .map((file) => MarkdownPage.fromMetadata(file, this.basePath))
            .sort((a, b) => String(b.date).localeCompare(String(a.date)) || a.title.localeCompare(b.title));
        this.loaded = true;
        
        return this.items;
    }

    async loadManifest() {
        const response = await fetch(`${this.basePath}/index.json`, { cache: 'no-cache' });

        if (!response.ok) {
            throw new Error(`Could not load ${this.basePath}/index.json.`);
        }

        this.manifest = await response.json();
    }

    getBySlug(slug) {
        return this.items.find((item) => item.slug === slug);
    }
}
