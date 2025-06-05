# 実装計画書（AWS版）

バージョン: 1.0  
作成日: 2025-06-04  
プロジェクト: Career.fm MVP (AWS版)

---

## 1. 開発スケジュール

### 全体スケジュール（7週間）
```
Week 1: 環境構築・基盤実装
Week 2-3: 認証・API基盤
Week 4-5: 音声アップロード・プロフィール機能
Week 6: 音声名刺生成・公開機能
Week 7: テスト・調整・デプロイ
```

---

## 2. フェーズ別実装計画

### Phase 1: 環境構築・基盤（Week 1）

#### 1.1 開発環境セットアップ
- [ ] AWS アカウント作成・設定
- [ ] AWS CDK インストール・初期化
- [ ] GitHub リポジトリ作成
- [ ] ローカル開発環境構築

#### 1.2 インフラ基盤（CDK）
- [ ] NetworkStack（必要時）
- [ ] AuthStack（Cognito User Pool）
- [ ] StorageStack（S3, DynamoDB）
- [ ] MonitoringStack（CloudWatch）

#### 1.3 CI/CD パイプライン
- [ ] GitHub Actions 設定
- [ ] 開発・本番環境分離
- [ ] 自動テスト環境

**成果物**: 基本インフラ、CI/CD環境

---

### Phase 2: 認証・API基盤（Week 2-3）

#### 2.1 認証システム
- [ ] Cognito User Pool 設定
- [ ] OAuth2 プロバイダー連携（X, GitHub）
- [ ] JWT トークン管理

#### 2.2 API 基盤
- [ ] API Gateway + Lambda 構成
- [ ] 基本 CRUD API
- [ ] エラーハンドリング・ログ

#### 2.3 フロントエンド基盤
- [ ] Next.js プロジェクト初期化
- [ ] TailwindCSS 設定
- [ ] AWS Amplify SDK 統合

**成果物**: 認証可能なWebアプリ

---

### Phase 3: 音声アップロード・プロフィール（Week 4-5）

#### 3.1 音声ファイル管理
- [ ] S3 Presigned URL 生成
- [ ] ファイルアップロード UI
- [ ] 音声プレイヤー実装

#### 3.2 プロフィール機能
- [ ] ユーザープロフィール CRUD
- [ ] フォームバリデーション
- [ ] 画像アップロード（プロフィール写真）

#### 3.3 データベース設計
- [ ] DynamoDB テーブル設計
- [ ] GSI（Global Secondary Index）設定
- [ ] データアクセス層実装

**成果物**: 音声アップロード・プロフィール編集機能

---

### Phase 4: 音声名刺生成・公開（Week 6）

#### 4.1 音声名刺ページ
- [ ] 動的ページ生成（SSG）
- [ ] レスポンシブデザイン
- [ ] OGP・Twitter Card対応

#### 4.2 公開・シェア機能
- [ ] 固定URL生成
- [ ] SNSシェアボタン
- [ ] 埋め込み用コード生成

#### 4.3 CDN配信
- [ ] CloudFront 設定
- [ ] キャッシュ戦略

**成果物**: 完全機能する音声名刺サービス

---

### Phase 5: テスト・調整・デプロイ（Week 7）

#### 5.1 テスト
- [ ] ユニットテスト
- [ ] 統合テスト
- [ ] E2Eテスト
- [ ] パフォーマンステスト

#### 5.2 本番デプロイ
- [ ] 本番環境構築
- [ ] ドメイン設定
- [ ] SSL証明書設定
- [ ] 監視・アラート設定

**成果物**: 本番稼働MVP

---

## 3. 技術スタック詳細

### 3.1 インフラ（AWS CDK）
```typescript
// 主要スタック構成
- AuthStack: Cognito User Pool
- ApiStack: API Gateway + Lambda
- StorageStack: S3 + DynamoDB
- FrontendStack: CloudFront + S3
```

### 3.2 バックエンド（Node.js + TypeScript）
```typescript
// Lambda 関数構成
- auth: 認証関連
- users: ユーザー管理
- profiles: プロフィール管理
- audio: 音声ファイル管理
- cards: 音声名刺生成
```

### 3.3 フロントエンド（Next.js + TypeScript）
```typescript
// ページ構成
- /login: ログイン
- /profile: プロフィール編集
- /upload: 音声アップロード
- /cards/[id]: 音声名刺表示
- /dashboard: ダッシュボード
```

---

## 4. データベース設計

### 4.1 DynamoDB テーブル

#### Users テーブル
```typescript
{
  PK: "USER#${userId}",
  SK: "PROFILE",
  userId: string,
  email: string,
  name: string,
  avatar?: string,
  createdAt: string,
  updatedAt: string
}
```

#### AudioCards テーブル
```typescript
{
  PK: "USER#${userId}",
  SK: "CARD#${cardId}",
  cardId: string,
  title: string,
  description?: string,
  audioUrl: string,
  isPublic: boolean,
  socialLinks?: {
    twitter?: string,
    github?: string,
    linkedin?: string
  },
  createdAt: string,
  viewCount: number
}
```

#### GSI: PublicCards
```typescript
{
  PK: isPublic ? "PUBLIC" : "PRIVATE",
  SK: createdAt,
  // 公開カード一覧取得用
}
```

---

## 5. API設計

### 5.1 認証 API
```
POST /auth/login
POST /auth/register
POST /auth/refresh
DELETE /auth/logout
```

### 5.2 ユーザー API
```
GET /users/me
PUT /users/me
DELETE /users/me
```

### 5.3 音声名刺 API
```
GET /cards           # 自分のカード一覧
POST /cards          # カード作成
GET /cards/{id}      # カード詳細
PUT /cards/{id}      # カード更新
DELETE /cards/{id}   # カード削除
```

### 5.4 ファイル API
```
POST /upload/presigned-url  # アップロード用URL取得
POST /upload/complete       # アップロード完了通知
```

---

## 6. 開発環境要件

### 6.1 必要なツール
- Node.js 18+
- AWS CLI v2
- AWS CDK CLI
- Docker（LocalStack用）
- Git

### 6.2 AWS権限
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "cognito-idp:*",
        "dynamodb:*",
        "s3:*",
        "lambda:*",
        "apigateway:*",
        "cloudfront:*",
        "cloudwatch:*",
        "iam:*"
      ],
      "Resource": "*"
    }
  ]
}
```

---

## 7. 品質保証

### 7.1 テスト戦略
- **Unit**: Jest + @testing-library
- **Integration**: Supertest（API）
- **E2E**: Playwright
- **Load**: Artillery

### 7.2 コード品質
- ESLint + Prettier
- Husky（pre-commit hooks）
- SonarCloud 連携

---

## 8. デプロイ戦略

### 8.1 環境分離
```
Development: 個人開発環境
Staging: 検証環境
Production: 本番環境
```

### 8.2 デプロイフロー
```
1. main ブランチプッシュ
2. GitHub Actions 実行
3. テスト実行
4. CDK deploy (staging)
5. E2Eテスト
6. 手動承認
7. CDK deploy (production)
```

---

## 9. 監視・運用

### 9.1 監視項目
- API レスポンス時間
- エラー率
- Lambda実行時間
- DynamoDB読み書きキャパシティ

### 9.2 アラート設定
- エラー率 > 5%
- レスポンス時間 > 3秒
- 月額コスト > $50

---

## 10. 次のアクション

### 今週開始すべきタスク
1. [ ] AWS アカウント準備
2. [ ] 開発環境セットアップ
3. [ ] GitHub リポジトリ作成
4. [ ] CDK プロジェクト初期化

**開始可能状態**: ✅  
**推定完了**: 7週間後  
**MVP リリース目標**: 2025年8月初旬

---

進捗状況は週次でレビューし、必要に応じて計画を調整します。 