# HIIT Timer

An interval training timer. Add it to the iPhone home screen and use it as a PWA.

## Language

English and Japanese, switchable with the EN / JA buttons in the top right.
The first launch follows the device language; after that the choice is remembered in
`localStorage` under `hiit-lang`. Switching works mid-workout without disturbing the timer.

All UI strings live in the `I18N` object in `index.html` — add a locale there and to the
button group in the masthead to support another language.

## Setting values

Each value can be nudged with −/＋ or typed: tap the number (the dashed underline) and an
editor opens — minutes and seconds as two boxes for time fields, since phone numeric keypads
have no ":" key. Enter or tapping elsewhere commits, Escape cancels.

`FIELDS` in `index.html` holds each field's min/max, and every route a value can take into
the settings object (steppers, typed entry, shared-link parameters) is clamped against it.
Typed input is reduced to ASCII digits first (full-width digits from a Japanese IME are
converted), so nothing but an in-range integer ever reaches the state. Limits: prep 0–10:00,
work 0:05–60:00, rest / set-rest 0–60:00, rounds 1–30, sets 1–10.

## Sharing settings

"Share these settings as a link" under the Start button copies a URL that encodes the
current configuration, e.g. `?p=10&w=20&r=10&rd=8&s=1&sr=60`
(prep / work / rest / rounds / sets / set-rest, all clamped to valid ranges on load).
Anyone opening the link gets those settings pre-filled — no account needed.

## Analytics

[GoatCounter](https://www.goatcounter.com) at `nexuscode.goatcounter.com`. No cookies, no
unique identifiers, no cross-site tracking — so no consent banner is required. It counts
page views plus four usage events, fired through the `track()` helper in `index.html`:

| Event | Fires when |
| --- | --- |
| `start-workout` | Start is pressed |
| `finish-workout` | The last round completes |
| `share-link` | The share button is used |
| `launch-installed` | Opened from the home screen (`display-mode: standalone`) |

Together these give a funnel: visits → starts → finishes, plus how many installs stuck.
`track()` is a no-op if the script is blocked or the device is offline, and GoatCounter
skips localhost on its own, so local testing never reaches the real stats.

Note that `sw.js` deliberately ignores cross-origin requests. Without that guard the
cache-first handler would serve the analytics beacon from cache and counting would
silently stop.

The script is loaded as a pinned release with Subresource Integrity
(`count.v5.js` + `integrity="sha384-…"`), not the floating `count.js`. The floating file
changes without notice; a pinned one that is altered — by an update or by tampering — is
refused by the browser rather than run. To move to a newer release, take the URL and hash
from <https://www.goatcounter.com/help/countjs-versions> and check the hash yourself:

```sh
curl -s https://gc.zgo.at/count.v5.js | openssl dgst -sha384 -binary | openssl base64 -A
```

## Fonts

Oswald (display) and IBM Plex Mono (text) are served from `fonts/` on this origin. Nothing
is requested from Google Fonts or any other font host, so a visit discloses no IP address
to a third party for typography, no stylesheet on another host blocks first paint, and the
service worker precaches the files so the installed app keeps its typefaces offline.

| File | Source | SHA-256 |
| --- | --- | --- |
| `oswald-latin-wght.woff2` | Google Fonts, Oswald v57, latin subset, variable `wght` 400–700 (font version 4.103) | `9dde3797547520f762f4ba3a822d417a0872b962bc78753a7ee9f955382b6b85` |
| `ibm-plex-mono-400-latin1.woff2` | `@ibm/plex-mono` 2.5.0, `fonts/split/woff2/IBMPlexMono-Regular-Latin1.woff2` | `e8993d946649b9d01abb1ed06d574b19d8ea3e66b5c3948602db335c44c18e56` |
| `ibm-plex-mono-600-latin1.woff2` | same package, `IBMPlexMono-SemiBold-Latin1.woff2` | `b7acd05041ab65f3b7039e218ddd893065e11a07e85ea85019473152a51b6b7d` |

How each was checked before it was committed:

- **IBM Plex Mono** comes from IBM's own npm package. The tarball's SHA-512 matched the
  registry's `dist.integrity`
  (`sha512-STBJIPxPomOYPmBMO7z5TKPJUotAF9u3gAUumTqVgwgrAO+K4FRNh0MlhsoJjKhJKsMbBJR10/bk4inkj/wc1w==`).
  It was downloaded with `curl` and unpacked with `tar`, not `npm install` — the package
  declares a `postinstall` telemetry script, and that way it never runs.
- **Oswald** has no publisher checksum for the web subset. The file was taken from
  `fonts.gstatic.com` (the URL the Google Fonts stylesheet hands to browsers) and compared
  with the source font in `google/fonts` (`ofl/oswald/Oswald[wght].ttf`, git blob
  `d1a3b9cb1325bf20b3a06ef9849d21c411212a3b`): same version string and metrics, and all
  226 characters render pixel-identically at weights 400, 500, 600 and 700.

Both families are under the SIL Open Font License 1.1. `fonts/OFL-Oswald.txt` and
`fonts/OFL-IBM-Plex-Mono.txt` are the licence texts as shipped by each source; the licence
requires them to travel with the fonts, so keep them published next to the files. IBM Plex
has the Reserved Font Name "Plex" — use IBM's files as they are; a re-subset or converted
copy may not keep the name.

The `@font-face` rules are inlined in each of the three pages (a shared stylesheet would be
one more blocking request). Do not go back to `@import`: it is only valid before every
other rule, and the landing pages had it after `:root{}`, where browsers drop it without
any error — those two pages rendered in fallback fonts until this was replaced.

To change a font file: replace it, update the hash above, and bump the cache name in
`sw.js` (the fonts are in its precache list).

## Content Security Policy

Each page carries its policy in a `<meta http-equiv="Content-Security-Policy">` tag at the
top of `<head>`, because GitHub Pages cannot send response headers. It starts from
`default-src 'none'` and lists only what the page uses:

| Directive | Allows | Why |
| --- | --- | --- |
| `script-src` | the app's own inline script (by SHA-256), `https://gc.zgo.at` | the timer itself; the pinned analytics file |
| `style-src 'unsafe-inline'` | the inline `<style>` block | see the note below |
| `font-src 'self'` | `fonts/` | self-hosted fonts |
| `img-src`, `connect-src` | this origin's icons; `https://nexuscode.goatcounter.com` | the analytics beacon (`sendBeacon`, with an image fallback) |
| `media-src data:` | the embedded silent video | the screen wake-lock fallback |
| `manifest-src`, `worker-src`, `child-src` `'self'` | manifest and service worker (`child-src` covers Safari before 15.5) | install and offline |
| `frame-src 'self'` (landing pages) | the live demo iframe | |
| `base-uri 'none'`, `form-action 'none'` | nothing | neither is used |

So an injected `<script>`, an inline event handler, `eval`, a script from any other host and
a request to any other host are all refused by the browser.

**The script hash must match the script.** `index.html` allows its inline script by hash,
which keeps the app a single file. Change one character of that script without updating
the hash and the browser will not run it — the page loads and nothing works. So:

```sh
git config core.hooksPath .githooks   # once per clone
.githooks/pre-commit --fix            # after editing the inline script: rewrites the hash
```

With the hook enabled, a commit whose hash is stale is refused and tells you to run
`--fix`. Editing through the GitHub web UI bypasses the hook — don't edit `index.html`
there. JSON-LD blocks are data, not script, and need no hash.

Styles are allowed inline without a hash on purpose. Hashing them would add the same
"stale hash breaks the page" failure to all three pages on every CSS tweak, in exchange for
blocking style injection on a site with no user-supplied content and nothing secret in the
DOM. The script side, where the real risk is, is strict.

What a meta tag cannot do: `frame-ancestors` (who may embed the page), violation
reporting, and every non-CSP header — `Strict-Transport-Security`,
`X-Content-Type-Options`, `Permissions-Policy`. Those need a host that lets you set
response headers. Pages does redirect HTTP to HTTPS.

When adding anything that loads from a new place (a script, an image host, an API), add it
to the policy in the same change, and check the browser console for
"Content Security Policy" errors before pushing.

## Service worker rules

`sw.js` is cache-first for same-origin GETs. Three rules keep that from going wrong:

- only successful (`res.ok`) same-origin responses are stored — a cached 404 or 5xx would
  be served forever, until the next cache-name bump;
- lookups ignore the query string and query-string URLs are never stored, so a shared
  link (`/?w=45&r=15`) is served from the cached `/` and works offline, instead of each
  distinct link storing another full copy of the page;
- the offline fallback to `index.html` applies to page navigations only.

## License

MIT — see [LICENSE](LICENSE).

## Files

| File | Purpose |
| --- | --- |
| `index.html` | The app itself (HTML/CSS/JS all inline) |
| `manifest.webmanifest` | App name, icons, full-screen display |
| `sw.js` | Service worker (offline support) |
| `icon-180.png` | iOS home screen icon |
| `icon-192.png` / `icon-512.png` | Android and everything else |
| `icon-maskable-512.png` | Maskable icon |
| `about.html` / `about-en.html` | Landing page (JA / EN) with the embedded live demo |
| `fonts/` | Self-hosted Oswald and IBM Plex Mono (WOFF2) with their OFL licence texts |
| `.githooks/pre-commit` | Refuses a commit whose inline-script hash is stale; `--fix` rewrites it |
| `_config.yml` | Keeps `README.md` and `LICENSE` off the published site (see below) |

## What is published

GitHub Pages serves this branch through Jekyll with nothing to render: every file is copied
as-is except the ones listed under `exclude` in `_config.yml`, and dotfiles. That is what
keeps this README and the LICENSE from being reachable at the product's own URL. Do not
add a `.nojekyll` file back — it turns Jekyll off, which publishes every file in the repo.

## Publishing on GitHub Pages

1. Create an empty repository `hiit-timer` on GitHub (Public, no README or license)
2. Run this from this folder:

   ```sh
   git remote add origin https://github.com/KazuoMiya/hiit-timer.git
   git push -u origin main
   ```

3. Open Settings → Pages in the repository
4. Set Source to `Deploy from a branch`, Branch to `main` / `(root)`, then Save
5. After a minute or two the site goes live — this repo serves at
   `https://timer.nexus-code.studio/` (custom domain via the `CNAME` file;
   `kazuomiya.github.io/hiit-timer` redirects there)

## Adding it to an iPhone

1. Open the published URL in **Safari** (Chrome can't add to the home screen)
2. Wait a few seconds (the service worker builds its cache)
3. Share button → Add to Home Screen → Add

Launching from the home screen icon hides the Safari bars and runs full screen.
After the first launch it works offline, so gym reception doesn't matter.

## Requirements

The service worker and the Screen Wake Lock API only work over HTTPS.
Opening the file directly via `file://` breaks both home screen install and offline support.

If the screen still turns off, go to Settings → Display & Brightness → Auto-Lock → Never.

## Updating

After editing files, bump the cache name on the first line of `sw.js`, then push.
If the inline script in `index.html` changed, run `.githooks/pre-commit --fix` first
(see Content Security Policy above).

```js
var CACHE = "hiit-timer-v2";   // v1 → v2
```

Skip this and devices keep serving the old cache, so the changes never show up.

The install step fetches with `{cache: "reload"}` on purpose. GitHub Pages serves HTML
with `max-age=600`, so a plain `addAll()` can populate a brand-new cache version from the
HTTP cache and ship a stale build even though the cache name changed. Don't remove it.

```sh
git add -A
git commit -m "description"
git push
```

## Shipping it as a native app

To wrap it with Capacitor:

```sh
npm install -D @capacitor/cli
npx cap init "HIIT Timer" com.nexuscode.hiit --web-dir=.
npx cap add ios
npx cap open ios
```

Installing it on your own device works with free Apple ID signing, but needs re-signing every 7 days.
For permanent use or distribution you need the Apple Developer Program ($99/year).
