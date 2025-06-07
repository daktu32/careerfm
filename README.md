# Career.fm

他己紹介風の音声名刺を生成・共有できるWebサービス

## 概要

Career.fm（キャリア・エフエム）は、NotebookLMや自作音声を用いて「人となり」を伝える新しい音声プロフィール体験を提供します。

## 技術スタック

- **フロントエンド**: Next.js + TypeScript + TailwindCSS
- **バックエンド**: AWS Lambda + API Gateway
- **認証**: Amazon Cognito
- **データベース**: Amazon DynamoDB
- **ストレージ**: Amazon S3
- **配信**: Amazon CloudFront
- **インフラ**: AWS CDK
- **CI/CD**: GitHub Actions
- **監視**: CloudWatch + X-Ray

## アーキテクチャ

```
[ユーザー] → [CloudFront/Next.js] → [API Gateway] → [Lambda] → [DynamoDB/S3]
```

## 開発環境のセットアップ

### 前提条件

- Node.js 18+
- AWS CLI v2
- AWS CDK CLI

### インストール

```bash
# 依存関係のインストール
npm install

# AWS CDK のブートストラップ（初回のみ）
cd infrastructure
npx cdk bootstrap

# ローカル開発環境の起動
cd ../packages/frontend
npm run dev
```

### AWS設定

```bash
# AWS認証情報の設定
aws configure
# または
aws configure sso
```

## プロジェクト構成

```
careerfm/
├── infrastructure/      # AWS CDK インフラコード
│   ├── lib/
│   │   └── stacks/     # CDKスタック定義
│   ├── bin/            # CDKアプリケーション
│   └── test/           # インフラ用テストコード
├── packages/
│   └── frontend/       # Next.js フロントエンド
├── docs/               # ドキュメント
├── decisions/          # 意思決定記録
└── scripts/            # ユーティリティスクリプト
```

## 開発コマンド

```bash
# フロントエンド開発
cd packages/frontend
npm run dev              # 開発サーバー起動
npm run build            # プロダクションビルド
npm test                 # テスト実行

# バックエンド開発
cd packages/backend
npm run build            # TypeScriptコンパイル
npm test                 # テスト実行

# インフラストラクチャ
cd infrastructure
npm run build            # CDKビルド
npm run test             # CDKテスト
npx cdk diff             # 変更確認
npx cdk deploy           # AWSへデプロイ
```

## デプロイメント

### 開発環境

```bash
npm run deploy:dev
```

### ステージング環境

```bash
npm run deploy:staging
```

### 本番環境

```bash
npm run deploy:prod
```

## ドキュメント

- [アーキテクチャ設計](docs/ARCHITECTURE.md)
- [開発ガイド](CONTRIBUTING.md)
- [実装計画](docs/implementation-plan.md)
- [コスト試算](docs/cost-estimation-aws.md)

## ライセンス

[MIT License](LICENSE)