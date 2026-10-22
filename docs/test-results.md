# テスト結果

実施日: 2026-10-23 JST。

| 対象 | 結果 |
|---|---|
| 公開サイトの取得 | 14ページ、失敗0件 |
| GitHub Pages用ビルド | 成功、14ページ＋404 |
| Cloudflare用ビルド | 成功、14ページ＋404 |
| 原文照合 | 28ページ分すべて一致（空白・改行を正規化） |
| 本文リンク | 208件×2ビルドで文言・順序・href一致。内部URLはbase変換後に比較 |
| Google Driveリンク | 延べ183件のhref一致。リンク先の閲覧権限とファイル実体は未検証 |
| UTF-8 | 全ページで確認。置換文字なし |
| 内部リンク・CSS・ページ内ID | 両ビルドで実ファイル・リンク先IDを照合、成功 |
| noindex | 404を含む全ページのmetaを確認 |
| 静的ページ | script・iframe・form・object・embedなし |
| 単体テスト | 4件成功。base処理、外部URL保持、未知の旧URL保持、WXR除外・DTD拒否 |
| ブラウザーのレスポンシブ確認 | 390×844、820×1180、1280×800の各14ページ、計42ケース。横はみ出し0 |
| モバイルメニュー | 開閉とResearchへの遷移を確認 |
| 元サイトとの画面比較 | HomeのPC表示をスクリーンショットとDOM寸法で確認。広告とフォントに差あり |
| 既存インタラクティブ教材 | 指定URLがHTTP 200。内容やリポジトリは変更なし |
| CloudflareローカルHTTP | 14ページすべて200、X-Robots-Tag付き |
| Cloudflareローカル404 | 不存在パスが404、専用本文とnoindexヘッダー付き |
| Cloudflare deploy dry-run | 成功。実アップロードなし |
| 依存関係の検査 | npm audit: 既知脆弱性0件（導入時） |
| 公開前のファイル検査 | 許可ファイル・認証情報パターン・ローカルパス検査を実装・実行 |

ブラウザー検証はCodexのブラウザー操作環境で実施しました。画面幅を指定した検証であり、iPhone/iPad実機のSafari検証は未実施です。外部資料のダウンロード、大学のメールや学生情報へのアクセスは行っていません。

変換過程でHTML段組み、非同期Markdownコンパイル、日本語に続く強調記号の扱いを修正し、本文照合を再実行しました。上表は修正後の結果です。

## 再実行

```sh
npm ci --ignore-scripts
npm run build:github
npm run build:cloudflare
npm run check:content
npm test
npm run check:publish
npm run preview:cloudflare
```

画面幅を390px、820px、1280pxにして全ページとメニューを確認します。存在しないパスでもHomeへのリンクが有効であることを確認します。HTTP検査は `node scripts/check-http.mjs http://127.0.0.1:8787/ cloudflare` で再実行できます。

## GitHub Pages公開後の検証

公開URL: <https://sisogai.github.io/website-migration-preview/>

[初回のGitHub Actions実行](https://github.com/sisogai/website-migration-preview/actions/runs/39814022979)で、インストール・公開前検査・脆弱性検査・単体テスト・両ビルド・本文照合・Pagesデプロイがすべて成功しました。

公開URLでも14ページすべてがHTTP 200で、存在しないパスは専用本文付きHTTP 404でした。公開Homeをブラウザーで表示し、CSS、本文、メニューのサブディレクトリURL、noindexを確認しました。
