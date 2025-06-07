# アーキテクチャ設計書（AWS版）

バージョン: 1.0  
作成日: 2025-06-04  
作成者: （ご担当者名）

---

## 1. 目的
「Career.fm」MVP のAWSベースシステム全体像を整理し、各コンポーネント間の連携および使用するフルマネージドサービスを定義することで、設計・開発・運用を円滑に進めることを目的とする。

## 2. アーキテクチャ概要
- パターン: サーバーレス / JAMstack
- キーワード: フルマネージド, スケーラブル, セキュア, イベント駆動

## 3. 論理アーキテクチャ

```txt
[ユーザー] → [CloudFront / フロントエンド (Next.js)] → [API Gateway + Lambda] → {DynamoDB, S3}
                   ↘ TTS連携 → [SQS → Lambda → S3]
```

- フロントエンド  : Next.js (React) + TailwindCSS
- 認証・認可      : Amazon Cognito (OAuth2)
- API             : API Gateway + AWS Lambda
- データベース    : DynamoDB (NoSQL)
- オブジェクト保管 : Amazon S3 (音声ファイル MP3/WAV)
- CDN             : CloudFront + S3
- イベント駆動    : Amazon SQS/SNS (非同期TTSジョブ)

## 4. 技術選定根拠

### 4.1 フロントエンド技術

| 技術 | 選定理由 |
|------|----------|
| **Next.js** | • SSG/SSR両対応でSEO最適化<br>• Vercel統合でデプロイ簡単<br>• React エコシステムの成熟度<br>• 音声名刺の静的生成に最適 |
| **TypeScript** | • 型安全性でバグ削減<br>• IDE支援充実<br>• チーム開発での保守性向上 |
| **TailwindCSS** | • ユーティリティファーストで開発速度向上<br>• モバイルファーストでレスポンシブ対応<br>• カスタムデザインシステム構築容易 |

### 4.2 バックエンド技術

| 技術 | 選定理由 |
|------|----------|
| **Amazon Cognito** | • OAuth2プロバイダー豊富(X, GitHub等)<br>• セキュリティのベストプラクティス内蔵<br>• SDK充実でフロントエンド統合容易<br>• 50,000MAU/月まで無料 |
| **AWS Lambda** | • サーバーレスで運用コスト削減<br>• 自動スケーリング<br>• AWS エコシステム統合<br>• コールドスタート最適化 |
| **DynamoDB** | • NoSQLでスキーマ変更柔軟<br>• ミリ秒単位の低レイテンシ<br>• 自動バックアップ・暗号化<br>• オンデマンド課金 |

### 4.3 インフラ技術

| 技術 | 選定理由 |
|------|----------|
| **Amazon S3** | • 音声ファイル特化ストレージ<br>• CloudFront統合でグローバル配信<br>• IAMきめ細かい権限制御<br>• 従量課金でコスト最適 |
| **CloudFront** | • 静的サイト配信特化<br>• SSL証明書自動管理<br>• カスタムドメイン対応<br>• エッジロケーション豊富 |
| **Amazon SQS/SNS** | • 非同期処理でUX向上<br>• メッセージ配信保証<br>• 将来のTTS連携拡張対応<br>• Lambda trigger統合 |

### 4.4 開発・運用技術

| 技術 | 選定理由 |
|------|----------|
| **GitHub Actions** | • AWS CLI/CDKとの統合充実<br>• 無料枠で十分なCI/CD<br>• マーケットプレイス豊富<br>• テスト〜デプロイまで自動化 |
| **AWS CDK** | • IaCでインフラ再現性確保<br>• TypeScript で統一開発体験<br>• チーム開発でのコード管理<br>• 本番・ステージング環境分離 |

## 5. コンポーネント詳細

### 5.1 フロントエンド
- 技術: Next.js + TypeScript + TailwindCSS
- 配信: CloudFront + S3（グローバル CDN）
- レンダリング:
  - ログイン／プロフィール編集：SSR or SSG + クライアントサイド動的レンダリング
  - 音声名刺公開ページ：SSG で事前ビルドし高速配信

### 5.2 認証・認可
- Amazon Cognito
  - メール／パスワード認証
  - OAuth2（X, GitHub）
  - JWT トークン管理

### 5.3 API / バックエンド
- API Gateway + AWS Lambda
  - ユーザー・プロフィール CRUD
  - 音声ファイルアップロード承認（Presigned URL発行）
  - 公開URL生成ロジック
  - Webhook／SNS連携（将来）

### 5.4 データストア
- DynamoDB
  - テーブル: Users, Profiles, AudioMetadata
  - パーティションキー設計: userId
  - GSI: 公開フラグ + 作成日時

### 5.5 ストレージ
- Amazon S3
  - バケット分割: career-fm-audio-{env}
  - プレフィックス: /{userId}/{fileId}
  - セキュリティ: Bucket Policy + IAM

### 5.6 TTS連携（拡張）
- Amazon Polly
- ワークフロー: API Gateway → SQS → Lambda → Polly → S3

### 5.7 CDN / キャッシュ
- CloudFront
  - TTL 設定: 音声ファイル長寿命キャッシュ、HTML (公開ページ) は短キャッシュ
- S3 Transfer Acceleration

### 5.8 モニタリング・ロギング
- CloudWatch Logs / CloudWatch Metrics
- X-Ray（分散トレーシング）

### 5.9 CI/CD
- GitHub Actions
  - Lint (ESLint, Prettier)
  - Test (Jest)
  - Deploy: AWS CDK → Lambda & CloudFront

## 6. 非機能要件とのマッピング

| 非機能要件     | 対応設計                                         |
|------------|----------------------------------------------|
| 可用性       | サーバーレス自動スケーリング + マルチAZ構成           |
| 性能         | SSG + CloudFront キャッシュ, DynamoDB オンデマンドスケーリング    |
| セキュリティ    | HTTPS 強制, AWS IAM, Cognito 統合認証                     |
| 拡張性       | マイクロサービス (Lambda), SQS/SNS イベント駆動アーキテクチャ |
| 運用性       | IaC (AWS CDK), CloudWatch 一元管理, アラート設定          |

## 7. インフラ構築 (IaC)
- AWS CDK / TypeScript
- スタック構成:
  - NetworkStack (VPC, Subnet) - Lambda VPC接続時
  - AuthStack (Cognito User Pool)
  - StorageStack (S3, DynamoDB)
  - ComputeStack (Lambda, API Gateway)
  - DistributionStack (CloudFront)
  - MonitoringStack (CloudWatch, X-Ray)

## 8. セキュリティ設計

### 8.1 認証・認可
- Cognito User Pool + Identity Pool
- JWT トークン（Access Token, ID Token, Refresh Token）
- API Gateway でのトークン検証

### 8.2 データ保護
- S3 暗号化（SSE-S3 or SSE-KMS）
- DynamoDB 暗号化（保存時・転送時）
- CloudFront HTTPS リダイレクト

### 8.3 アクセス制御
- IAM Role ベースアクセス制御
- S3 Bucket Policy で音声ファイル保護
- API Gateway リソースポリシー

## 9. リスクと対策

| リスク                  | 対策                                         |
|---------------------|--------------------------------------------|
| ベンダーロックイン        | 抽象化レイヤで将来マルチクラウド移行を想定              |
| コスト増大              | CloudWatch 課金アラート設定, 定期的な利用状況レビュー |
| レイテンシ             | CloudFront エッジキャッシュ, 適切なリージョン選択             |
| Lambda コールドスタート | Provisioned Concurrency 検討（必要時） |

---

以上、ご確認のほどよろしくお願いいたします。
