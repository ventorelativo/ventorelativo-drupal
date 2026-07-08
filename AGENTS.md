# AGENTS.md — Ventorelativo

Context for AI coding agents working in this repository. Vendor-neutral by design
(`CLAUDE.md`, `.github/copilot-instructions.md`, etc. just point here).

## What this is

The website of **Ventorelativo**, a paragliding club (`Parapendio Club`). It is a
**Drupal 11.3** site whose content is in **Italian** (`langcode: it`), rendered as a
**static site** (no live database in production) and hosted on **Netlify**.

The key architectural fact: **Drupal runs only at build time.** Editors work in a
local/authoring Drupal, content is committed to the repo as JSON, and every push to
`main` rebuilds a fully static HTML export with [Tome](https://www.drupal.org/project/tome)
that Netlify serves. There is no PHP, no database, and no dynamic Drupal in production.

## Repository layout

| Path | What lives there |
|---|---|
| `composer.json` / `composer.lock` | Drupal core + contrib modules (the real dependency manifest). |
| `web/` | Drupal docroot (`web-root` per `drupal-scaffold`). |
| `web/modules/custom/` | Custom modules: `helper`, `mapper`, `scraper`. |
| `web/themes/custom/vr/` | The active front-end theme, `vr`. |
| `config/` | Exported Drupal config (`config_sync_directory = ../config`). **Source of truth for site structure.** |
| `content/` | Tome content export as JSON (`node.*.json`, `block_content.*.json`, `file.*.json`, …). **Source of truth for content.** |
| `translations/` | Italian (and other) `.po` interface translations. |
| `patches/` + `patches.lock.json` | Composer patches applied to contrib/core. |
| `recipes/` | Empty (boilerplate only). |
| `netlify/functions/` | Netlify function(s); `scheduled-deploy.js` (currently commented out). |
| `netlify.toml` | Production build command + publish dir. |
| `.github/workflows/main.yml` | Leftover DrupalPod/GitHub-Pages starter workflow — **not** the real deploy (Netlify is). |
| `drush/`, `web/sites/default/` | Drush config and site settings. `settings.local.php`/`settings.ddev.php` are local-only. |

`vendor/`, `web/core/`, `web/modules/contrib/`, `web/themes/contrib/`, `html/` (Tome
output) and `.ht.sqlite*` are all git-ignored / generated — **never edit or commit them.**

## Local development

First install everything (Drupal core, contrib, and the Drush binary) with Composer:

```
composer install
```

The local database is **SQLite** (`.ht.sqlite*` at the repo root, git-ignored). To run
the site locally, start Drupal's built-in server and leave it running:

```
drush rs        # drush runserver — serves the site locally
```

DDEV config is also present (`settings.ddev.php`) as an alternative way to run the server,
but the standard workflow here is `drush rs` against the SQLite database.

Common Drush tasks (`vendor/bin/drush`, on `PATH` after `composer install`):

- Install/rebuild from config + content: `drush tome:install -y`
- Export a static build locally: `drush tome:static -l http://localhost`
- Rebuild cache: `drush cr`
- Export config after changing site structure in the UI: `drush cex -y` (writes to `config/`)
- Import config: `drush cim -y`
- Content lives in Tome JSON under `content/` — use Tome's export (`drush tome:export`) rather than editing JSON by hand unless you know exactly what you're doing.

## Production build & deploy (Netlify)

Push to `main` → Netlify runs the command in `netlify.toml` (PHP 8.3, publish dir `html`):

```
drush tome:install -y && drush cr && drush cron \
  && drush simple-sitemap:generate -l $URL \
  && drush pmu project_browser \
  && drush tome:static -l $URL
```

Tome installs Drupal from committed `config/` + `content/`, then writes static HTML to
`html/`, which Netlify publishes. A scheduled daily rebuild via a Netlify function exists
but is **currently disabled** (`netlify/functions/scheduled-deploy.js` is commented out).

## Site structure (from `config/`)

- **Active themes** (`config/system.theme.yml`): front-end `vr`, admin `gin`.
- **Front page** = `/node/2`, **404** = `/node/3` (`config/system.site.yml`).
- **Content types** (node bundles):
  - `article` (*Articolo*) — `body`, `field_image`, `field_tags` (taxonomy ref).
  - `page` (*Pagina base*) — `body` + **Layout Builder** (`layout_builder__layout`).
  - `sito` (*Sito di volo* — a flight site) — `body`, `field_images`, `field_tags`, and
    `field_map_elements` referencing `storage`/`map_feature` entities.
- **`storage` / `map_feature`** (contrib *Storage* entity) — geolocated map features
  (takeoff / landing / POI) with `field_type` and `field_location` (**geofield**).
- **Custom block bundle**: `basic` (*Blocco base*).
- **Notable views**: `flight_sites`, `sites_map`, `site_features`, `xcontest_flights`,
  `news`, plus standard `frontpage`/`archive`/`glossary`.

## Custom modules (`web/modules/custom/`)

- **`helper`** — light-/dark-mode theme toggle. Block `helper_theme_toggle` (rendered in
  the footer as `vr_themetoggle`), library `helper/theme_toggle` (`js/theme-toggle.js`).
- **`mapper`** — Maptiler/Leaflet map rendering. Block `mapper_maptiler_map` drives the
  homepage GeoJSON map (default source `/api/sites/all/geo.json`); loads the Maptiler SDK
  from CDN. `hook_..._geofield_value_alter` splits WKT `GEOMETRYCOLLECTION`s into markers.
- **`scraper`** — scrapes XContest flight data (`https://www.xcontest.org/world/en/`) using
  Symfony BrowserKit `HttpBrowser` + DomCrawler. Block `scraper_scraper`. Note: because the
  site is static, scraped data is captured **at build time** and frozen into the export.

## The `vr` theme (`web/themes/custom/vr/`)

- Sub-theme of contrib **`bootstrap5`**. Disables the parent's global styling
  (`libraries-override`) and ships its own.
- **Regions**: `header`, `nav_branding`, `nav_main`, `nav_additional`, `breadcrumb`,
  `content`, `sidebar_first`, `sidebar_second`, `footer`.
- **Styling**: SCSS sources in `scss/` compile to `css/` (`style.scss` → `css/style.css`,
  `ck5style.scss` → `css/ck5style.css`). **There is no JS/Node build in the theme** — the
  root `package.json` only holds Netlify function deps. If you change SCSS, the compiled
  `css/` must be regenerated (Bootstrap 5 sub-theme Sass workflow) and committed.
- Libraries (`vr.libraries.yml`): `global-styling` (`css/style.css`), `overrides`
  (`css/overrides.css` + `js/global.js`).
- **SDC components** in `components/molecules/`: `tags`, `card-big`, `listing`, `badges`.
- **Template overrides** in `templates/`: `layout/page.html.twig`, node + teaser templates
  (`node--sito--teaser`, `node--article--teaser`), branding block, breadcrumb, field-tags.
- **`vr.theme`** notable hooks: language-suffixed inline-SVG logos; renames a contact-form
  input to `subject` so **Netlify forms** work on the static export; strips toolbar
  anti-flicker JS for anonymous users; adds bg-schema theme settings.

## Conventions & guardrails for agents

- **Config and content are files, not a database.** To change site structure, prefer
  changing it in Drupal and exporting (`drush cex`) so `config/` stays authoritative;
  hand-editing YAML is fine for small, well-understood changes but must stay consistent
  with dependencies and UUIDs. Don't hand-edit `content/` JSON unless necessary.
- **Custom `vr_*` prefix** is used for this site's block placements and theme; keep it.
- **Everything must survive static export.** Anything requiring a live server at request
  time (forms without a static handler, dynamic PHP, uncached authenticated views) will
  not work in production — Netlify forms and build-time data capture are the patterns here.
- **Don't touch generated/ignored dirs** (`vendor/`, `web/core/`, `web/modules/contrib/`,
  `web/themes/contrib/`, `html/`) — changes there are wiped on rebuild.
- **Contrib changes go through Composer** (`composer require/update`), and code fixes to
  contrib/core go through `patches.lock.json` + `patches/`, never by editing files in place.
- Match existing code style (Drupal coding standards; `drupal/coder` is in `require-dev`).
