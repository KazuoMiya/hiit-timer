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
| `.nojekyll` | Disables Jekyll processing on GitHub Pages |

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
