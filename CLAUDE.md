# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## プロジェクト概要

Career.fm（キャリア・エフエム）は、他己紹介風の音声名刺を生成・共有できるWebサービス。NotebookLMや自作音声を用いて「人となり」を伝える新しい音声プロフィール体験を提供する。

## 技術スタック

- **フロントエンド**: Next.js + TypeScript + TailwindCSS
- **バックエンド**: AWS Lambda + API Gateway
- **認証**: Amazon Cognito
- **データベース**: Amazon DynamoDB
- **ストレージ**: Amazon S3 (音声ファイル保管)
- **配信**: Amazon CloudFront CDN
- **CI/CD**: GitHub Actions
- **インフラ**: AWS CDK (IaC)
- **モニタリング**: CloudWatch Logs, CloudWatch Metrics, X-Ray

## アーキテクチャ

サーバーレス / JAMstack構成：
```
[ユーザー] → [CloudFront / Next.js] → [API Gateway] → [Lambda] → {DynamoDB, S3}
```

## 開発哲学

### テスト駆動開発 (TDD)
- 期待される入出力に基づき、まずテストを作成
- テストを実行し失敗を確認後、実装を進める
- テストが通過するまで繰り返し

## MVPの主要機能

1. **ユーザー登録**: SNSログイン（X/Twitter、GitHub）、メールアドレス登録
2. **音声アップロード**: MP3/WAVファイル（最大10MB）
3. **プロフィール入力**: 名前、肩書き、リンク、自己紹介テキスト
4. **音声名刺生成**: 音声とプロフィールを組み合わせた公開ページ
5. **公開・シェア**: 固定URL発行、SNSシェアボタン

## セキュリティ・法的考慮

- HTTPS強制、S3 Bucket Policy、IAM管理
- 音声ファイルの著作権・利用許諾への配慮
- プライバシーポリシーと利用規約の策定

## コスト構造

MVPステージ（10ユーザー想定）：約$0.002/月
- AWSサービス: $0.002/月（ほぼ無料枠内）
- 外部サービス: $0（CloudWatchでエラー追跡）
- 主要変動要因：音声ファイル増加によるS3コスト

## 開発ワークフロー

現在の開発状況：
1. AWS CDKインフラ構築完了（Phase 1）
2. Next.js + TypeScript プロジェクト作成済み
3. Cognito認証統合中（Phase 2）
4. CI/CD パイプライン構築済み

## 開発進捗管理ルール

### 必須更新ファイル
AIエージェントは、以下のファイルを常に最新の状態に保つこと：

1. **PROGRESS.md** - 開発進捗の記録
   - 各作業完了時に必ず更新
   - 完了したタスク、進行中のタスク、次のタスクを明記
   - 日付とタイムスタンプを含める

2. **DEVELOPMENT_ROADMAP.md** - 開発ロードマップ
   - フェーズの進捗に応じて更新
   - 完了したマイルストーンにチェックマーク
   - 新しい課題や変更があれば反映

### 更新タイミング
- 機能実装の完了時
- 重要な設定変更時
- フェーズの移行時
- バグ修正や改善の実施時
- 新しい技術的決定時

### 更新方法
1. 作業完了後、即座に該当ファイルを更新
2. 具体的な成果物や変更内容を記載
3. 次のステップを明確にする
4. コミットメッセージに進捗更新を含める旨を記載