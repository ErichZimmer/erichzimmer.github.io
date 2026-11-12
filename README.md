# Personal Website

The site uses static HTML pages generated from Markdown. Collection metadata is stored in `pages/research/index.json`, `pages/blogs/index.json`, and `pages/projects/index.json`.

Use Node.js 22 or newer. There are no dependencies to install.

Render the articles and site pages:

```sh
npm run render
```

Each Markdown file gets a complete HTML page beside it with the same basename. The renderer also updates collection metadata and tiles. Run it again after editing Markdown, components, or the shared templates in `modules/PageRenderer.js`.

To add a project, create a Markdown file in `pages/projects/` using the same front matter as research and blog posts:

```markdown
---
title: My Project
date: 2026-11-12
tags: [Hardware, Software]
summary: A short description of the project.
---
# Overview

Project details go here.
```

Run `npm run render` to generate its article page and add it to the searchable Projects collection at `/projects.html`.

To link a tile directly to a project website, add `externalUrl: https://example.com/project` to its front matter. The tile uses this address in both generated pages and browser navigation.

Render a single collection:

```sh
npm run render -- pages/research
```

Passing a Markdown filename also refreshes its containing collection and metadata:

```sh
npm run render -- pages/research/project-opensync.md
```

The rendering functions can also be imported directly. `renderMarkdownFile()` writes one HTML file and returns its metadata, `renderCollection()` updates a collection and its manifest, and `renderSite()` renders everything.

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

Article links use their mostly use their `.html` paths. A backwards compatible hased URL (`/#/blogs/blog-openpiv-cxx-performance`) was created due to it being referenced on LinkedIn and simply redirects to the HTML page. During navigation, a missing generated article may fall back to its Markdown source with the cost of added latency.

Generated HTML and manifests are included in the repository. Render and commit them along with source changes before pushing. Automatic rendering in GitHub
