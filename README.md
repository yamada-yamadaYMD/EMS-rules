# らぶぐらっ！EMS Website (GitHub Pages)

静的サイト（HTML/CSS/JS）で **EMSルール/SOP** を公開するテンプレです。  
そのまま GitHub に上げて **GitHub Pages** で公開できます。

## 使い方（最短）
1. このフォルダを GitHub のリポジトリにアップロード
2. GitHub → Settings → Pages
3. **Build and deployment**: Source = Deploy from a branch
4. Branch = `main` / Folder = `/ (root)` を選択して保存
5. 表示されたURLにアクセス

## 編集ポイント
- `content/rules.md` : ルール本文（Markdown）
- `content/faq.json` : よくある質問
- `assets/config.json` : サイトタイトルや連絡先（TBD）など
- `index.html` : トップ（見た目/構成）

## 機能
- Markdown（rules.md）をクライアント側でHTML化して表示
- サイドバー目次（見出しから自動生成）
- 検索（ルール本文を全文検索）
- FAQ アコーディオン
- 更新履歴（簡易）

> ライブラリはCDNのみ。ビルド不要で動きます。
