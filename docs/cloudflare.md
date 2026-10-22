# Cloudflare Workers Static Assets

静的ファイルの配信だけを設定しています。`wrangler.jsonc` にWorker処理の `main`、データベース、AI、課金対象のサービス連携はありません。Cloudflare用ビルドは `/`、GitHub用は `/website-migration-preview/` を基準にします。

## 現在の準備

- Wrangler設定、ビルド、ローカルプレビュー、カスタム404、noindexヘッダーを実装。
- `wrangler deploy --dry-run` 成功。
- ローカルで14ページがHTTP 200、存在しないパスがカスタム本文付きHTTP 404。
- `wrangler whoami` は未認証。アカウントの有無はこの結果だけでは判定できません。

## CLIで公開する

1. アカウントがなければ [Cloudflare](https://dash.cloudflare.com/sign-up) で本人が登録します。Workers Freeプランを選びます。
2. プロジェクトディレクトリで `npx --no-install wrangler login` を実行し、本人が認証します。
3. `npx --no-install wrangler whoami` で対象アカウントを確認します。複数ある場合は公開先を選択します。
4. 同名Worker `isogai-website-preview` が既にある場合は、専用の別名に `wrangler.jsonc` の `name` を変更します。
5. `npm run deploy:cloudflare` を実行します。CLIに表示される実際の `workers.dev` URLを記録します。
6. 全主要ページ、Google Driveへのリンク、教材リンク、メニュー、存在しないURLの404を確認します。ページソースのnoindexとHTTPレスポンスの `X-Robots-Tag` も確認します。

ログインにより作成される認証情報はCLIの認証機構で管理し、リポジトリやコマンド引数にトークンを記載しません。今回の作業ではログインと本番デプロイを実行していません。

## GitHub連携で公開する

CloudflareのWorkers & PagesからGitリポジトリ連携を選び、この試作用リポジトリだけへのアクセスを本人が承認します。

| 設定 | 値 |
|---|---|
| Repository | `sisogai/website-migration-preview` |
| Production branch | `main` |
| Root directory | `/` |
| Node version | `24` |
| Build command | `npm ci --ignore-scripts && npm run check:publish && npm test && npm run build:github && npm run build:cloudflare && npm run check:content` |
| Deploy command | `npx --no-install wrangler deploy` |
| Worker name | `isogai-website-preview`（設定ファイルと一致させる） |
| Environment | `ASTRO_TELEMETRY_DISABLED=1`, `WRANGLER_SEND_METRICS=false` |

CloudflareのGitHubアプリに追加権限が必要なため、この連携操作を保留しています。CLI公開とGit連携はどちらかから始められます。

## 無料運用の条件

Workers Freeを維持し、標準の `workers.dev` URLを使います。静的アセットへのリクエストは無料・無制限で、アセット保存への追加料金もありません。Workers BuildsのFree枠は月3,000分です。無料枠・プランの条件は契約時点でも確認してください。上限に達した場合はビルドを待つか、ローカルでビルドしてCLI公開します。有料プランへの自動切り替えを設定しません。

今回の出力は約140KBで、無料枠のファイル数・サイズに対して十分小さい構成です。Cloudflareのアカウントプランはダッシュボードで管理されるため、本人がそこでFreeを確認します。

参考: [Static Assets料金](https://developers.cloudflare.com/workers/static-assets/billing-and-limitations/)・[Buildsの上限](https://developers.cloudflare.com/workers/ci-cd/builds/limits-and-pricing/)・[Git連携とビルド設定](https://developers.cloudflare.com/workers/ci-cd/builds/configuration/)
