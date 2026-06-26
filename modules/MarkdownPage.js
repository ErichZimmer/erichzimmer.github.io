const SAFE_URL_PATTERN = /^(https?:|mailto:|#|\.\/|\.\.\/|\/|[\w.-]+\/|[\w.-]+\.[\w]+|[^:]+$)/i;

export default class MarkdownPage {
    constructor({ url = '', raw = '', slug = '' } = {}) {
        this.url = url;
        this.raw = raw;
        this.slug = slug || MarkdownPage.slugFromUrl(url);
        const parsed = MarkdownPage.parseFrontMatter(raw);
        this.frontMatter = parsed.frontMatter;
        this.content = parsed.content;
    }

    static async fromURL(url) {
        const response = await fetch(url, { cache: 'no-cache' });

        if (!response.ok) {
            throw new Error(`Unable to load markdown file: ${url}`);
        }

        const raw = await response.text();
        return new MarkdownPage({ url, raw });
    }

    static slugFromUrl(url = '') {
        const clean = url.split('?')[0].split('#')[0];
        const fileName = clean.substring(clean.lastIndexOf('/') + 1);
        return fileName.replace(/\.(md|markdown)$/i, '');
    }

    static parseFrontMatter(raw = '') {
        const normalized = raw.replace(/^\uFEFF/, '').replaceAll('\r\n', '\n');

        if (!normalized.startsWith('---\n')) {
            return { frontMatter: {}, content: normalized };
        }

        const end = normalized.indexOf('\n---', 4);
        if (end === -1) {
            return { frontMatter: {}, content: normalized };
        }

        const frontMatterText = normalized.slice(4, end).trim();
        const content = normalized.slice(end + 4).replace(/^\n/, '');
        return {
            frontMatter: MarkdownPage.parseYamlLikeFrontMatter(frontMatterText),
            content
        };
    }

    static parseYamlLikeFrontMatter(text = '') {
        const data = {};
        const lines = text.split('\n');
        let currentListKey = '';

        for (const rawLine of lines) {
            const line = rawLine.trim();
            if (!line || line.startsWith('#')) {
                continue;
            }

            const listMatch = line.match(/^-\s+(.+)$/);
            if (listMatch && currentListKey) {
                data[currentListKey].push(MarkdownPage.parseScalar(listMatch[1]));
                continue;
            }

            const keyValue = line.match(/^([A-Za-z0-9_-]+):\s*(.*)$/);
            if (!keyValue) {
                continue;
            }

            const key = keyValue[1];
            const value = keyValue[2];

            if (!value) {
                data[key] = [];
                currentListKey = key;
                continue;
            }

            currentListKey = '';
            data[key] = MarkdownPage.parseScalar(value);
        }

        if (typeof data.tags === 'string') {
            data.tags = data.tags.split(',').map((tag) => tag.trim()).filter(Boolean);
        }

        if (!Array.isArray(data.tags)) {
            data.tags = [];
        }

        return data;
    }

    static parseScalar(value = '') {
        const trimmed = value.trim();

        if ((trimmed.startsWith('"') && trimmed.endsWith('"')) || (trimmed.startsWith("'") && trimmed.endsWith("'"))) {
            return trimmed.slice(1, -1);
        }

        if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
            return trimmed.slice(1, -1)
                .split(',')
                .map((item) => MarkdownPage.parseScalar(item.trim()))
                .filter((item) => item !== '');
        }

        if (trimmed === 'true') {
            return true;
        }

        if (trimmed === 'false') {
            return false;
        }

        return trimmed;
    }

    get title() {
        return this.frontMatter.title || this.slug.replaceAll('-', ' ');
    }

    get date() {
        return this.frontMatter.date || '';
    }

    get tags() {
        return Array.isArray(this.frontMatter.tags) ? this.frontMatter.tags : [];
    }

    get summary() {
        return this.frontMatter.summary || this.frontMatter.description || '';
    }

    get wordCount() {
        return MarkdownPage.countWords(this.content);
    }

    get readingTimeMinutes() {
        return MarkdownPage.estimateReadingTime(this.content);
    }

    get readingTimeText() {
        const minutes = this.readingTimeMinutes;
        return minutes ? `${minutes} min read` : '';
    }

    toHTML() {
        return MarkdownPage.renderMarkdown(this.content);
    }

    static countWords(markdown = '') {
        const textOnly = markdown
            .replace(/```[\s\S]*?```/g, ' ')
            .replace(/`[^`]*`/g, ' ')
            .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ')
            .replace(/\[([^\]]+)\]\([^)]*\)/g, ' $1 ')
            .replace(/<[^>]+>/g, ' ')
            .replace(/[\#>*_~|`=\-+\[\]{}()]/g, ' ');
        const words = textOnly.match(/[A-Za-z0-9]+(?:[.'-][A-Za-z0-9]+)*/g);
        return words ? words.length : 0;
    }

    static estimateReadingTime(markdown = '', wordsPerMinute = 200) {
        const words = MarkdownPage.countWords(markdown);
        return words ? Math.max(1, Math.ceil(words / wordsPerMinute)) : 0;
    }

    static renderMarkdown(markdown = '') {
        const lines = markdown.replaceAll('\r\n', '\n').split('\n');
        const html = [];
        let paragraph = [];
        let listType = '';
        let i = 0;

        const closeParagraph = () => {
            if (paragraph.length) {
                html.push(`<p>${MarkdownPage.renderInline(paragraph.join(' '))}</p>`);
                paragraph = [];
            }
        };

        const closeList = () => {
            if (listType) {
                html.push(`</${listType}>`);
                listType = '';
            }
        };

        while (i < lines.length) {
            const line = lines[i];
            const trimmed = line.trim();

            if (trimmed.startsWith('```')) {
                closeParagraph();
                closeList();
                const lang = trimmed.slice(3).trim();
                const codeLines = [];
                i += 1;
                while (i < lines.length && !lines[i].trim().startsWith('```')) {
                    codeLines.push(lines[i]);
                    i += 1;
                }
                html.push(`<pre><code${lang ? ` class="language-${MarkdownPage.escapeAttr(lang)}"` : ''}>${MarkdownPage.escapeHTML(codeLines.join('\n'))}</code></pre>`);
                i += 1;
                continue;
            }

            if (!trimmed) {
                closeParagraph();
                closeList();
                i += 1;
                continue;
            }

            if (/^(-{3,}|\*{3,}|_{3,})$/.test(trimmed)) {
                closeParagraph();
                closeList();
                html.push('<hr>');
                i += 1;
                continue;
            }

            if (MarkdownPage.isTableStart(lines, i)) {
                closeParagraph();
                closeList();
                const tableLines = [lines[i], lines[i + 1]];
                i += 2;
                while (i < lines.length && lines[i].includes('|') && lines[i].trim()) {
                    tableLines.push(lines[i]);
                    i += 1;
                }
                html.push(MarkdownPage.renderTable(tableLines));
                continue;
            }

            const heading = trimmed.match(/^(#{1,6})\s+(.+)$/);
            if (heading) {
                closeParagraph();
                closeList();
                const level = heading[1].length;
                const text = MarkdownPage.renderInline(heading[2].replace(/\s+#+$/, ''));
                html.push(`<h${level}>${text}</h${level}>`);
                i += 1;
                continue;
            }

            const quote = trimmed.match(/^>\s?(.*)$/);
            if (quote) {
                closeParagraph();
                closeList();
                const quoteLines = [];
                while (i < lines.length) {
                    const quoteMatch = lines[i].trim().match(/^>\s?(.*)$/);
                    if (!quoteMatch) {
                        break;
                    }
                    quoteLines.push(quoteMatch[1]);
                    i += 1;
                }
                html.push(`<blockquote>${MarkdownPage.renderMarkdown(quoteLines.join('\n'))}</blockquote>`);
                continue;
            }

            const ul = line.match(/^\s*[-*+]\s+(.+)$/);
            const ol = line.match(/^\s*\d+\.\s+(.+)$/);
            if (ul || ol) {
                closeParagraph();
                const desired = ul ? 'ul' : 'ol';
                if (listType !== desired) {
                    closeList();
                    listType = desired;
                    html.push(`<${listType}>`);
                }
                html.push(`<li>${MarkdownPage.renderInline((ul || ol)[1])}</li>`);
                i += 1;
                continue;
            }

            closeList();
            paragraph.push(trimmed);
            i += 1;
        }

        closeParagraph();
        closeList();
        return html.join('\n');
    }

    static isTableStart(lines, index) {
        const current = lines[index] || '';
        const next = lines[index + 1] || '';
        return current.includes('|') && /^\s*\|?\s*:?-{3,}:?\s*(\|\s*:?-{3,}:?\s*)+\|?\s*$/.test(next);
    }

    static renderTable(lines = []) {
        const splitRow = (line) => line.trim().replace(/^\|/, '').replace(/\|$/, '').split('|').map((cell) => cell.trim());
        const headers = splitRow(lines[0]);
        const aligners = splitRow(lines[1]).map((cell) => {
            if (cell.startsWith(':') && cell.endsWith(':')) return 'center';
            if (cell.endsWith(':')) return 'right';
            return 'left';
        });
        const rows = lines.slice(2).map(splitRow);

        const ths = headers.map((header, index) => `<th style="text-align:${aligners[index] || 'left'}">${MarkdownPage.renderInline(header)}</th>`).join('');
        const trs = rows.map((row) => {
            const tds = row.map((cell, index) => `<td style="text-align:${aligners[index] || 'left'}">${MarkdownPage.renderInline(cell)}</td>`).join('');
            return `<tr>${tds}</tr>`;
        }).join('');

        return `<table><thead><tr>${ths}</tr></thead><tbody>${trs}</tbody></table>`;
    }

    static renderInline(value = '') {
        const code = [];
        let text = MarkdownPage.escapeHTML(value);

        text = text.replace(/`([^`]+)`/g, (_, inner) => {
            const token = `@@CODE_${code.length}@@`;
            code.push(`<code>${inner}</code>`);
            return token;
        });

        text = text.replace(/!\[([^\]]*)\]\(([^\s)]+)(?:\s+&quot;([^&]*)&quot;)?\)/g, (_, alt, href, title) => {
            const safeHref = MarkdownPage.safeURL(href);
            const titleAttr = title ? ` title="${MarkdownPage.escapeAttr(title)}"` : '';
            return safeHref ? `<img src="${MarkdownPage.escapeAttr(safeHref)}" alt="${MarkdownPage.escapeAttr(alt)}"${titleAttr}>` : '';
        });

        text = text.replace(/\[([^\]]+)\]\(([^\s)]+)(?:\s+&quot;([^&]*)&quot;)?\)/g, (_, label, href, title) => {
            const safeHref = MarkdownPage.safeURL(href);
            const titleAttr = title ? ` title="${MarkdownPage.escapeAttr(title)}"` : '';
            return safeHref ? `<a href="${MarkdownPage.escapeAttr(safeHref)}"${titleAttr}>${label}</a>` : label;
        });

        text = text.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
        text = text.replace(/__([^_]+)__/g, '<strong>$1</strong>');
        text = text.replace(/\*([^*]+)\*/g, '<em>$1</em>');
        text = text.replace(/_([^_]+)_/g, '<em>$1</em>');

        code.forEach((html, index) => {
            text = text.replace(`@@CODE_${index}@@`, html);
        });

        return text;
    }

    static safeURL(url = '') {
        const clean = url.trim();
        return SAFE_URL_PATTERN.test(clean) && !clean.toLowerCase().startsWith('javascript:') ? clean : '';
    }

    static escapeHTML(value = '') {
        return String(value)
            .replaceAll('&', '&amp;')
            .replaceAll('<', '&lt;')
            .replaceAll('>', '&gt;')
            .replaceAll('"', '&quot;')
            .replaceAll("'", '&#39;');
    }

    static escapeAttr(value = '') {
        return MarkdownPage.escapeHTML(value).replaceAll('`', '&#96;');
    }
}
