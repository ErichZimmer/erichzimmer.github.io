export default class ComponentLoader {
    constructor(root = document) {
        this.root = root;
    }

    async load() {
        const slots = [...this.root.querySelectorAll('[data-component]')];
        await Promise.all(slots.map((slot) => this.loadSlot(slot)));
    }

    async loadSlot(slot) {
        const name = slot.dataset.component;
        const response = await fetch(`./components/${name}.html`, { cache: 'no-cache' });

        if (!response.ok) {
            throw new Error(`Unable to load component: ${name}`);
        }

        slot.innerHTML = await response.text();
    }
}
