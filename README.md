# HIIT Timer

An interval training timer. Add it to the iPhone home screen and use it as a PWA.

## Language

English and Japanese, switchable with the EN / JA buttons in the top right.
The first launch follows the device language; after that the choice is remembered in
`localStorage` under `hiit-lang`. Switching works mid-workout without disturbing the timer.

All UI strings live in the `I18N` object in `index.html` — add a locale there and to the
button group in the masthead to support another language.

## Sharing settings

"Share these settings as a link" under the Start button copies a URL that encodes the
current configuration, e.g. `?p=10&w=20&r=10&rd=8&s=1&sr=60`
(prep / work / rest / rounds / sets / set-rest, all clamped to valid ranges on load).
Anyone opening the link gets those settings pre-filled — no account needed.

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
5. After a minute or two, `https://kazuomiya.github.io/hiit-timer/` goes live

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
