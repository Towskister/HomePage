# AlexisGutowski.com deployment package

This is a complete, build-free static website for `https://alexisgutowski.com/`. It includes the portfolio homepage, the full Friction Lab simulation, responsive styling, share artwork, favicon assets, structured data, crawler controls, a sitemap, and a custom 404 page.

No package manager, database, API key, or server-side runtime is required. Upload the files and the site runs in the browser.

## What is included

```text
alexisgutowski-site/
├── index.html                    Portfolio homepage
├── styles.css                   Homepage styles
├── script.js                    Navigation and reveal behavior
├── preview.js                   Friction Lab homepage preview
├── 404.html                     Branded not-found page
├── favicon.svg                  Browser icon
├── site.webmanifest             Install and device metadata
├── robots.txt                   Search and AI crawler rules
├── sitemap.xml                  Search-engine URL inventory
├── llms.txt                     Plain-language site summary for AI systems
├── DEPLOY-CHECKLIST.md          Short go-live checklist
├── assets/
│   ├── alexis-gutowski-headshot.jpg
│   ├── alexis-gutowski-social-card.jpg
│   ├── apple-touch-icon.png
│   ├── icon-192.png
│   └── icon-512.png
└── friction-lab/
    ├── index.html                Full simulator page
    ├── lab.css                   Simulator styles
    ├── scenarios.js             Editable workflow scenarios
    ├── engine.js                Discrete-event simulation engine
    └── app.js                   Simulator interface and visualization
```

## Deploy the site

1. Back up the files currently serving `alexisgutowski.com`.
2. Unzip the package on your computer.
3. Open the `alexisgutowski-site` folder and upload **its contents** to the domain's document root. Depending on the host, that directory may be named `public_html`, `www`, or the domain name.
4. Preserve the included folder structure, especially `assets/` and `friction-lab/`.
5. Allow overwriting of the existing `index.html`, `styles.css`, and `script.js` after the backup is complete.
6. Purge any host or CDN cache.
7. Open the verification URLs listed below.

If the host uses a file manager, upload the ZIP to the document root, extract it, then move the **contents** of `alexisgutowski-site` up one level. Do not leave the live site at `/alexisgutowski-site/`.

### Verify after upload

- `https://alexisgutowski.com/`
- `https://alexisgutowski.com/friction-lab/`
- `https://alexisgutowski.com/assets/alexis-gutowski-social-card.jpg`
- `https://alexisgutowski.com/robots.txt`
- `https://alexisgutowski.com/sitemap.xml`
- `https://alexisgutowski.com/llms.txt`
- A nonexistent URL, such as `https://alexisgutowski.com/this-page-does-not-exist`

The custom `404.html` works automatically on many static hosts. Some hosts require selecting `404.html` as the error document in their control panel.

## Two details to confirm before launch

### Contact email

The site currently uses:

```text
hello@alexisgutowski.com
```

Confirm that this mailbox or forwarder exists. If it does not, replace that address in these files:

- `index.html`
- `llms.txt`
- `friction-lab/index.html`

### Public profiles

The homepage structured data currently links to the Instagram profile already associated with the site. When public GitHub or LinkedIn profiles are ready, add their full URLs to the `sameAs` array in `index.html`:

```json
"sameAs": [
  "https://www.instagram.com/unstoppablealexis/",
  "https://github.com/your-handle",
  "https://www.linkedin.com/in/your-handle/"
]
```

Only add profiles that belong to Alexis and are intended to be public.

## SEO already implemented

- Unique titles and descriptions for the homepage and Friction Lab
- Canonical URLs using the `.com` domain
- Crawlable, semantic HTML with descriptive headings and visible service/location copy
- Person, WebSite, SoftwareApplication, and Breadcrumb structured data
- Open Graph and X/Twitter large-image metadata
- A 1200 × 630 social card based on the supplied headshot
- Descriptive image alternative text and explicit image dimensions
- `robots.txt`, including independent OpenAI search and GPT crawler directives
- XML sitemap for both public pages
- `llms.txt` with a factual, plain-language description of Alexis and the demo
- Responsive layouts, keyboard focus states, skip links, reduced-motion support, and accessible result tables
- Fast static delivery with no framework bundle or third-party tracking

No one can guarantee rankings or inclusion in an AI answer. These files make the site understandable, crawlable, attributable, and technically ready. Strong public profiles, relevant links from other reputable sites, real project write-ups, and consistent updates are the next compounding signals.

### AI crawler choice

The included `robots.txt` allows both OpenAI search discovery and model-training crawling. OpenAI documents these as independent controls:

- `OAI-SearchBot` is used for inclusion in ChatGPT search features.
- `GPTBot` crawls content that may be used to improve generative AI foundation models.
- `ChatGPT-User` may visit a page in response to an explicit user action; OpenAI notes that normal `robots.txt` rules may not apply to those user-initiated visits.

To keep ChatGPT search discovery enabled while opting out of model-training crawling, change only the GPTBot section to `Disallow: /`. See the current [OpenAI crawler documentation](https://developers.openai.com/api/docs/bots) before changing these rules.

## Search-engine launch steps

### Google Search Console

1. Open [Google Search Console](https://search.google.com/search-console/) and add `alexisgutowski.com` as a Domain property.
2. Complete the DNS verification supplied by Google. Do not paste a made-up verification token into the HTML.
3. Submit `https://alexisgutowski.com/sitemap.xml` under **Sitemaps**.
4. Inspect the homepage and Friction Lab URLs and request indexing after deployment.
5. Watch **Pages**, **Core Web Vitals**, and **Enhancements** for crawl or structured-data issues.

### Bing Webmaster Tools

1. Open [Bing Webmaster Tools](https://www.bing.com/webmasters/) and import the verified property from Google Search Console or verify it directly.
2. Submit the same sitemap URL.
3. Inspect both public URLs after Bing has crawled them.

[IndexNow](https://www.indexnow.org/) can notify participating search engines after future changes. It requires a unique key tied to the live host, so no fake or reusable key is included in this package. Generate it from Bing Webmaster Tools or IndexNow only after the domain is under your control.

### Structured-data check

After deployment, test both URLs with [Google's Rich Results Test](https://search.google.com/test/rich-results) and [Schema.org's validator](https://validator.schema.org/). The markup is valid JSON-LD, but the live check confirms that hosting, edits, and caching did not change it.

## Refresh social link previews

The pages point to:

```text
https://alexisgutowski.com/assets/alexis-gutowski-social-card.jpg
```

After deployment, paste the live URL into the [Facebook Sharing Debugger](https://developers.facebook.com/tools/debug/) and [LinkedIn Post Inspector](https://www.linkedin.com/post-inspector/) to force a fresh fetch. Messaging apps often cache previews for hours or days. Adding a temporary query string such as `?v=2` when testing can distinguish an old cached preview from an upload problem.

If the social artwork changes later, keep it at 1200 × 630 pixels and either replace the existing file or update every `og:image` and `twitter:image` URL.

## Run locally

From the directory containing `alexisgutowski-site`, run:

```bash
python -m http.server 8080 --directory alexisgutowski-site
```

Then open:

```text
http://localhost:8080/
http://localhost:8080/friction-lab/
```

No build command is needed.

## How Friction Lab is organized

`friction-lab/engine.js` contains a seeded discrete-event model. It schedules arrivals and processing events, tracks queue time and completion time, estimates labor cost, and records per-step utilization, queue depth, errors, and rework. Because it is seeded, identical inputs produce stable comparisons.

`friction-lab/scenarios.js` contains the editable examples. Each node defines:

- `capacity`: how many items can be processed in parallel
- `processTime`: average active minutes per item
- `errorRate`: percentage of items expected to need rework
- `hourlyCost`: modeled labor cost for active work
- `x` and `y`: visual position on the workflow map

The app can optimize the diagnosed constraint, but it clearly labels the output as a modeled estimate rather than a guarantee.

### Add a scenario

Copy one scenario object in `friction-lab/scenarios.js`, give it a unique key and node IDs, and connect its nodes with `edges`. The interface automatically adds it to the selector. Keep the starting node first and the ending node last.

### Change the homepage preview

The homepage preview uses the `dispatch` scenario. To change that, replace `dispatch` in `preview.js` with another scenario key from `friction-lab/scenarios.js`.

## Maintenance

- Update the `lastmod` date in `sitemap.xml` when a page receives a meaningful content change.
- Keep page titles specific and readable. Do not add a `meta keywords` tag or repeat phrases unnaturally.
- Add complete case studies when possible: the problem, constraints, decisions, implementation, and measurable result.
- Use original screenshots and descriptive captions for new projects.
- Keep JavaScript files deferred and images compressed.
- If analytics are added, use a privacy-conscious setup and update any privacy notice or consent behavior required by the chosen provider and visitor locations.

## Rollback

If the deployment has a problem, restore the backup of the old document root or use the host's file-version history. This package does not modify a database, so rollback is limited to static files.
