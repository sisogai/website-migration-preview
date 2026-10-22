# Shigeki ISOGAI — 静的サイト移行試作

WordPress.comの公開14ページを、Astroで生成する静的サイトに移行した試作です。同じMarkdownからGitHub PagesとCloudflare Workers Static Assets向けにビルドできます。

元サイト: <https://shigekiisogai.wordpress.com/>  
試験公開先: <https://sisogai.github.io/website-migration-preview/>

## ローカルで確認する

Node.js 24とnpmを使用します。依存パッケージはこのプロジェクト内に導入します。

```sh
npm ci --ignore-scripts
npm run dev
```

表示されたlocalhost URLをブラウザーで開きます。

```sh
npm run build:github
npm run build:cloudflare
npm run check:content
npm test
npm run check:publish
npm run preview:cloudflare
```

Cloudflare互換プレビューは通常 `http://127.0.0.1:8787/` です。停止はCtrl+Cです。ローカル接続が制限される環境では、loopback待受の許可が必要です。

## 更新する場所

- 本文・研究業績: `src/content/pages/*.md`
- ページタイトル、元URL、新パス、言語: 各Markdown冒頭のfrontmatter
- 共通メニューとフッター: `src/layouts/Layout.astro`
- 見た目とレスポンシブ対応: `src/styles/site.css`
- ページ一覧: `src/lib/routes.json`
- 内部URLの変換: `src/lib/paths.mjs`

本文はMarkdownです。原文の強調、複雑な段組み、ページ内ID、外部リンクを正確に保持する部分ではHTMLを併用しています。Homeは元サイトの段組みを保つためHTML中心です。数式表記を追加変換していません。

1. 対象Markdownを編集します。Google Driveの資料は元URLを貼ります。
2. 両方をビルドし、画面とリンクを確認します。
3. `npm run check:content` で移行時の記録との差分を確認します。意図的な更新でも差分がある間は公開を停止します。
4. 公開してよい内容であることと差分を確認してから、`node scripts/accept-content.mjs --reviewed-public-content` で比較基準を更新します。
5. `npm test`、`npm run check:content`、`npm run check:publish` を実行し、Gitの差分を確認してcommit/pushします。
6. mainへのpushでGitHub Actionsが検査・ビルド・Pages公開を実施します。

新規ページはMarkdownと `src/lib/routes.json` に追加し、必要に応じてメニューにも追加します。元WordPressの更新は自動同期されません。今回の取得記録は `provenance/pages.json` にあります。

## ビルドと公開先

| 対象 | コマンド | 出力 | URLの先頭 |
|---|---|---|---|
| GitHub Pages | `npm run build:github` | `dist-github/` | `/website-migration-preview/` |
| Cloudflare | `npm run build:cloudflare` | `dist-cloudflare/` | `/` |

`.github/workflows/deploy.yml` は公式ActionsをコミットSHAで固定し、公開ジョブだけにPages用の権限を付与します。公開リポジトリ・標準GitHubホストランナーを利用します。既存の `sisogai.github.io` リポジトリは作業対象に含みません。

## WordPress XMLを後から利用する

```sh
npm run import:wxr -- /path/to/export.xml
```

WordPress WXR 1.2に対応します。公開済みpageのみを `.migration/wxr-review/candidates.json` に抽出し、下書き・非公開・パスワード保護・コメント・著者情報・添付ファイルを除外します。XMLのDTDと実体宣言は拒否します。候補HTMLには未検査のタグが含まれ得るため、内容のレビューとスクリプト・イベント属性等の除去を行ってからMarkdownへ反映してください。既存本文を自動で上書きしません。原本XMLと候補ファイルはGit管理対象外です。

公開HTMLを再取得する場合は `python3 scripts/fetch-public.py`、変換は `node scripts/migrate.mjs` です。後者は取得内容でMarkdownと比較基準を書き直すので、手動編集がある場合は別ブランチで差分を確認してください。資料PDFやGoogle Driveの中身は取得しません。

## 公開範囲と費用

公開されるものは、既存公開ページの本文・リンク、および移行用コードと説明資料です。実配信にはビルド出力だけを使用します。`.migration/`、`.local/`、XML、環境変数ファイル、ログをGitから除外します。公開前チェックは許可したパス・拡張子、認証情報の典型パターン、ローカルパス、不審なHTMLを検査します。新しい文章や資料の公開可否は人による差分確認も必要です。

試験サイトには全ページの `noindex` を設定しています。Cloudflareには同じHTTPヘッダーも付けます。検索エンジンが設定を読めるようrobots.txtはクロールを許可します。noindexは検索掲載を抑える設定です。URLを知っている人は閲覧できます。GitHubの公開リポジトリ自体も誰でも閲覧できます。

追加の月額費用は無料プランの条件内で0円を見込みます。独自ドメイン、AI API、データベース、学生の情報を保存するサービスは今回の構成に含めていません。

詳細: [移行レポート](docs/migration-report.md)・[テスト結果](docs/test-results.md)・[ページ対応表](docs/page-map.md)・[本人の操作](docs/user-steps.md)・[Cloudflare設定](docs/cloudflare.md)・[教育アプリ拡張案](docs/future-education.md)
