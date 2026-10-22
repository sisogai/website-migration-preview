# 本人が行う操作

GitHub Pagesの試験公開とソース管理はこの専用リポジトリで行います。WordPressを従来どおり利用できます。

## Cloudflareにも公開する場合

1. Cloudflareのアカウントを用意し、Workers Freeプランを確認してください。
2. このプロジェクトのターミナルで `npx --no-install wrangler login` を実行し、ブラウザーでログイン・承認してください。
3. 公開先アカウントと専用Worker名を確認し、`npm run deploy:cloudflare` を実行してください。
4. 表示されたURLを開き、Home、Research、講義資料、日本語ページ、404を確認してください。

GitHubとの自動連携を希望する場合は、Cloudflare上でこの新規リポジトリへのアクセスを承認し、[Cloudflare設定](cloudflare.md)のコマンドを登録してください。

## 試作を確認する場合

公開URLから文章・研究業績・教材リンク・画面を確認してください。Google Drive資料は従来のリンク先を利用するため、必要な資料を本人の通常の環境で開き、共有設定が意図どおりであることを確認できます。

WordPress XMLの提出は任意です。後から利用する場合はREADMEの抽出コマンドを使えます。

独自ドメインへの切り替え、WordPressの停止、学生限定機能、AI機能、課金は今回の作業に含めていません。これらを進めるときは別途決定できます。
