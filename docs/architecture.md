# アーキテクチャ設計書

バージョン: 1.0  
作成日: 2025-06-04  
作成者: （ご担当者名）

---

## 1. 目的
「Career.fm」MVP のシステム全体像を整理し、各コンポーネント間の連携および使用するフルマネージドサービスを定義することで、設計・開発・運用を円滑に進めることを目的とする。

## 2. アーキテクチャ概要
- パターン: サーバーレス / JAMstack
- キーワード: フルマネージド, スケーラブル, セキュア, イベント駆動

## 3. 論理アーキテクチャ

```txt
[ユーザー] → [CDN / フロントエンド (Next.js)] → [API層 (Firebase Functions)] → {Firestore, Cloud Storage}
                   ↘ TTS連携 → [Pub/Sub → Cloud Functions → Storage]
```

- フロントエンド  : Next.js (React) + TailwindCSS
- 認証・認可      : Firebase Authentication (OAuth2)
- API             : Firebase Cloud Functions (HTTP 関数)
- データベース    : Firestore (ドキュメント型)
- オブジェクト保管 : Cloud Storage (音声ファイル MP3/WAV)
- CDN             : Firebase Hosting + Cloud CDN
- イベント駆動    : Pub/Sub (非同期TTSジョブ)

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
| **Firebase Authentication** | • OAuth2プロバイダー豊富(X, GitHub等)<br>• セキュリティのベストプラクティス内蔵<br>• SDK充実でフロントエンド統合容易<br>• 無料枠で十分なMVP規模 |
| **Cloud Functions** | • サーバーレスで運用コスト削減<br>• 自動スケーリング<br>• Firebase エコシステム統合<br>• コールドスタート最適化済み |
| **Firestore** | • NoSQLでスキーマ変更柔軟<br>• リアルタイム同期機能<br>• 自動バックアップ・レプリケーション<br>• Firebase SDKとの親和性 |

### 4.3 インフラ技術

| 技術 | 選定理由 |
|------|----------|
| **Cloud Storage** | • 音声ファイル特化ストレージ<br>• CDN統合でグローバル配信<br>• IAM/ACL細かい権限制御<br>• 従量課金でコスト最適 |
| **Firebase Hosting** | • 静的サイト配信特化<br>• SSL証明書自動管理<br>• カスタムドメイン対応<br>• GitHub Actions連携容易 |
| **Pub/Sub** | • 非同期処理でUX向上<br>• At-least-once配信保証<br>• 将来のTTS連携拡張対応<br>• Functions trigger統合 |

### 4.4 開発・運用技術

| 技術 | 選定理由 |
|------|----------|
| **GitHub Actions** | • Firebase CLIとの統合充実<br>• 無料枠で十分なCI/CD<br>• マーケットプレイス豊富<br>• テスト〜デプロイまで自動化 |
| **Terraform** | • IaCでインフラ再現性確保<br>• Google Cloud Provider充実<br>• チーム開発でのコード管理<br>• 本番・ステージング環境分離 |

## 5. コンポーネント詳細

### 5.1 フロントエンド
- 技術: Next.js + TypeScript + TailwindCSS
- 配信: Firebase Hosting（グローバル CDN）
- レンダリング:
  - ログイン／プロフィール編集：SSR or SSG + クライアントサイド動的レンダリング
  - 音声名刺公開ページ：SSG で事前ビルドし高速配信

### 5.2 認証・認可
- Firebase Authentication
  - メール／パスワード認証
  - OAuth2（X, GitHub）

### 5.3 API / バックエンド
- Firebase Cloud Functions
  - ユーザー・プロフィール CRUD
  - 音声ファイルアップロード承認（署名付きURL発行）
  - 公開URL生成ロジック
  - Webhook／SNS連携（将来）

### 5.4 データストア
- Firestore
  - コレクション: users, profiles, audioMetadata
  - インデックス設計: userId + 公開フラグ

### 5.5 ストレージ
- Cloud Storage
  - バケット分割: /audio/{userId}/{fileId}
  - セキュリティ: Storage Rules で権限管理

### 5.6 TTS連携（拡張）
- Google Cloud Text-to-Speech
- ワークフロー: クライアント→Pub/Sub トピック→Cloud Functions→Storage に出力

### 5.7 CDN / キャッシュ
- Firebase Hosting + Cloud CDN
- TTL 設定: 音声ファイル長寿命キャッシュ、HTML (公開ページ) は短キャッシュ

### 5.8 モニタリング・ロギング
- Cloud Logging / Cloud Monitoring
- エラー追跡: Sentry 連携

### 5.9 CI/CD
- GitHub Actions
  - Lint (ESLint, Prettier)
  - Test (Jest)
  - Deploy: Firebase CLI → Hosting & Functions

## 6. 非機能要件とのマッピング

| 非機能要件     | 対応設計                                         |
|------------|----------------------------------------------|
| 可用性       | サーバーレス自動スケーリング + マルチリージョン構成           |
| 性能         | SSG + CDN キャッシュ, Firestore オンデマンドスケーリング    |
| セキュリティ    | HTTPS 強制, Firebase Rules, IAM 管理                     |
| 拡張性       | マイクロ関数 (Cloud Functions), Pub/Sub イベント駆動アーキテクチャ |
| 運用性       | IaC (Terraform), ログ・メトリクス一元管理, アラート設定          |

## 7. インフラ構築 (IaC)
- Terraform / Google Cloud Provider
- モジュール一覧:
  - network (VPC, Subnet)
  - auth (Firebase Authentication)
  - storage (Cloud Storage)
  - database (Firestore)
  - functions (Cloud Functions)
  - hosting (Firebase Hosting)
  - monitoring (Logging, Monitoring)

## 8. リスクと対策

| リスク                  | 対策                                         |
|---------------------|--------------------------------------------|
| ベンダーロックイン        | 抽象化レイヤで将来他クラウド移行を想定              |
| コスト増大              | モニタリング・予算アラート設定, 定期的な利用状況レビュー |
| レイテンシ             | エッジキャッシュ, 適切なリージョン選択             |

以上、ご確認のほどよろしくお願いいたします。 