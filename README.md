# Career.fm

他己紹介風の音声名刺を生成・共有できるWebサービス

## 概要

Career.fm（キャリア・エフエム）は、NotebookLMや自作音声を用いて「人となり」を伝える新しい音声プロフィール体験を提供します。

## 技術スタック

- **フロントエンド**: Next.js + TypeScript + TailwindCSS
- **バックエンド**: Firebase (Authentication, Firestore, Cloud Functions)
- **ストレージ**: Google Cloud Storage
- **配信**: Firebase Hosting + Cloud CDN
- **CI/CD**: GitHub Actions
- **インフラ**: Terraform

## 開発環境のセットアップ

```bash
# 依存関係のインストール
npm install

# 開発サーバーの起動
npm run dev

# ビルド
npm run build

# テストの実行
npm test
```

## プロジェクト構成

```
careerfm/
├── src/              # ソースコード
├── public/           # 静的ファイル
├── docs/             # ドキュメント
├── tests/            # テストコード
└── terraform/        # インフラ設定
```

## ライセンス

[MIT License](LICENSE)