# Erich Zimmer

The site uses static HTML pages generated from Markdown. Collection metadata is
stored in `pages/research/index.json` and `pages/blogs/index.json`.

Use Node.js 22 or newer. There are no dependencies to install.

Render the articles and site pages:

```sh
npm run render
```

Each Markdown file gets a complete HTML page beside it with the same basename.
The renderer also updates collection metadata and tiles. Run it again after
editing Markdown, components, or the shared templates in `modules/PageRenderer.js`.

Render a single collection:

```sh
npm run render -- pages/research
```

Passing a Markdown filename also refreshes its containing collection and metadata:

```sh
npm run render -- pages/research/project-opensync.md
```

The rendering functions can also be imported directly. `renderMarkdownFile()`
writes one HTML file and returns its metadata; `renderCollection()` updates a
collection and its manifest; `renderSite()` renders everything.

```js
import { renderMarkdownFile } from './scripts/render-pages.mjs';

await renderMarkdownFile('pages/research/project-opensync.md');
```

Start the local preview, then open the printed URL. Refresh after rendering changes:

```sh
npm run preview
```

The default address is `http://127.0.0.1:5173`. To use another port:

```sh
npm run preview -- 8080
```

Run the content checks with `npm test` after rendering.

Article links use their `.html` paths. The original
`/#/blogs/blog-openpiv-cxx-performance` link redirects to the corresponding HTML
page. During navigation, a missing generated article falls back to its Markdown
source. `404.html` provides the same fallback for direct visits, with HTTP status
404 until the HTML file is generated.

Generated HTML and manifests are included in the repository. Render and commit
them along with source changes before pushing. Automatic rendering in GitHub
Actions has not been configured.
