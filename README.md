# Droplab Studio — website

The portfolio site for [Droplab Studio](https://droplabstudio.com). It's plain HTML, CSS and JavaScript, with no build step and no monthly fees.

## Files

```
index.html            ← all page content (projects, services, FAQ, contact)
assets/css/styles.css ← all styling; colors and fonts are at the top under :root
assets/js/main.js     ← ASCII drop animation, project index, contact panel
assets/img/           ← logo, favicon and project screenshots
```

## Common edits

**Add a project:** in `index.html`, copy one `<article class="project">…</article>` block inside `.work__list`, then give it a new `id` and change the link, image and spec details. Add a matching `<li>` to the project index (`.work__index`) using the same `id`. Put the screenshot in `assets/img/` (about 2000px wide, saved as JPG).

**Change colors:** edit the variables at the top of `assets/css/styles.css`.

**Hero animation:** the ASCII drop is drawn in `assets/js/main.js` (the "Hero" section). The `balls()` function sets the size and movement of each droplet.

**Contact form:** submissions go to Formspree (`https://formspree.io/f/xqavakkv`), the same form the Shopify site used, and arrive in that Formspree account's inbox. In Formspree's settings, add the new domain if domain restrictions are on.

## Preview locally

Open `index.html` in a browser, or run `python3 -m http.server` in this folder and visit http://localhost:8000.

## Publish free with GitHub Pages

1. Merge this branch into `main`.
2. In the repo on GitHub, go to **Settings → Pages**. Under **Build and deployment**, choose **Deploy from a branch**, then **main** and **/ (root)**, and save.
3. After a minute or two the site is live at `https://droplabstudio.github.io/droplabwebsite/`.

## Point droplabstudio.com at it (when you're ready to leave Shopify)

1. In **Settings → Pages → Custom domain**, enter `droplabstudio.com` and save. GitHub adds a `CNAME` file for you.
2. Where the domain's DNS is managed (Shopify Domains or your registrar), replace the Shopify records with:
   - `A` records for `@`: `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153`
   - a `CNAME` record for `www` → `droplabstudio.github.io`
3. Once the domain shows as verified, tick **Enforce HTTPS**.
4. If the domain was bought through Shopify, transfer it to a registrar such as Cloudflare or Namecheap before you cancel the Shopify plan.
