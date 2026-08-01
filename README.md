# HIIT Timer

インターバルトレーニング用のタイマー。iPhoneのホーム画面に追加してPWAとして使う。

## 構成

| ファイル | 役割 |
| --- | --- |
| `index.html` | 本体(HTML/CSS/JSすべて内包) |
| `manifest.webmanifest` | アプリ名・アイコン・全画面表示の定義 |
| `sw.js` | Service Worker(オフライン動作) |
| `icon-180.png` | iOSホーム画面アイコン |
| `icon-192.png` / `icon-512.png` | Android・その他用 |
| `icon-maskable-512.png` | マスク対応アイコン |
| `.nojekyll` | GitHub PagesのJekyll処理を無効化 |

## GitHub Pagesでの公開

1. GitHubで空のリポジトリ `hiit-timer` を作成(Public、READMEやライセンスは追加しない)
2. このフォルダで以下を実行

   ```sh
   git remote add origin https://github.com/KazuoMiya/hiit-timer.git
   git push -u origin main
   ```

3. リポジトリの Settings → Pages を開く
4. Source を `Deploy from a branch`、Branch を `main` / `(root)` にして Save
5. 1〜2分待つと `https://kazuomiya.github.io/hiit-timer/` が公開される

## iPhoneへの追加

1. **Safari** で公開URLを開く(Chromeではホーム画面に追加できない)
2. 数秒待つ(Service Workerがキャッシュを作る)
3. 共有ボタン → ホーム画面に追加 → 追加

ホーム画面のアイコンから起動すると、Safariのバーが消えて全画面になる。
初回起動後はオフラインでも動作するため、ジムの電波状況は関係ない。

## 動作条件

Service WorkerとScreen Wake Lock APIはHTTPS上でのみ動作する。
`file://` で直接開いた場合、ホーム画面追加もオフライン動作も機能しない。

画面が消えてしまう場合は、設定 → 画面表示と明るさ → 自動ロック → なし。

## 更新のしかた

ファイルを編集したあと、`sw.js` の1行目のキャッシュ名を上げてからpushする。

```js
var CACHE = "hiit-timer-v2";   // v1 → v2
```

これをしないと、端末に残った古いキャッシュが使われ続けて変更が反映されない。

```sh
git add -A
git commit -m "説明"
git push
```

## ネイティブアプリ化

Capacitorで包む場合。

```sh
npm install -D @capacitor/cli
npx cap init "HIIT Timer" com.nexuscode.hiit --web-dir=.
npx cap add ios
npx cap open ios
```

自分の端末に入れるだけなら無料のApple ID署名で可能だが、7日ごとに再署名が必要。
恒久的に使う、または配布するなら Apple Developer Program(年額99ドル)が要る。
