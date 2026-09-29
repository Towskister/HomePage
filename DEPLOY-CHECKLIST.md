# Go-live checklist

## Before uploading

- [ ] Download or copy a backup of the current live site.
- [ ] Confirm `hello@alexisgutowski.com` receives mail or forwards correctly.
- [ ] Unzip the package and open the `alexisgutowski-site` folder.

## Upload

- [ ] Upload the **contents** of `alexisgutowski-site` to the domain's document root.
- [ ] Preserve the `assets` and `friction-lab` folders.
- [ ] Replace the existing homepage files only after the backup is safe.
- [ ] Purge the host/CDN cache.

## Browser checks

- [ ] Homepage loads at `https://alexisgutowski.com/`.
- [ ] Mobile navigation opens, closes, and follows links.
- [ ] Homepage workload slider and diagnosis button respond.
- [ ] Friction Lab loads at `https://alexisgutowski.com/friction-lab/`.
- [ ] Scenario changes, sliders, node editing, diagnosis, optimization, and share-link copying work.
- [ ] Headshot and social card URLs load directly.
- [ ] Email button opens the intended address.
- [ ] A fake URL returns the branded 404 page.
- [ ] Test once on a phone and once on a desktop browser.

## Search and sharing

- [ ] `robots.txt`, `sitemap.xml`, and `llms.txt` load publicly.
- [ ] Verify the domain in Google Search Console.
- [ ] Submit `https://alexisgutowski.com/sitemap.xml`.
- [ ] Request indexing for `/` and `/friction-lab/`.
- [ ] Import or verify the site in Bing Webmaster Tools and submit the sitemap.
- [ ] Test both pages in Google's Rich Results Test.
- [ ] Refresh the homepage preview in the Facebook Sharing Debugger.
- [ ] Refresh it in the LinkedIn Post Inspector.

## Later improvements

- [ ] Add verified GitHub and LinkedIn URLs to the homepage `sameAs` array.
- [ ] Publish detailed case studies with real screenshots and outcomes.
- [ ] Update the sitemap date after substantial page changes.
