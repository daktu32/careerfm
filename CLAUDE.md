# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## プロジェクト概要

Career.fm（キャリア・エフエム）は、他己紹介風の音声名刺を生成・共有できるWebサービス。NotebookLMや自作音声を用いて「人となり」を伝える新しい音声プロフィール体験を提供する。

## 技術スタック

- **フロントエンド**: Next.js + TypeScript + TailwindCSS
- **バックエンド**: Firebase (Authentication, Firestore, Cloud Functions)
- **ストレージ**: Google Cloud Storage (音声ファイル保管)
- **配信**: Firebase Hosting + Cloud CDN
- **CI/CD**: GitHub Actions
- **インフラ**: Terraform (IaC)
- **モニタリング**: Cloud Logging, Cloud Monitoring, Sentry

## アーキテクチャ

サーバーレス / JAMstack構成：
```
[ユーザー] → [CDN / Next.js] → [Firebase Functions] → {Firestore, Cloud Storage}
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

- HTTPS強制、Firebase Rules、IAM管理
- 音声ファイルの著作権・利用許諾への配慮
- プライバシーポリシーと利用規約の策定

## コスト構造

MVPステージ（10ユーザー想定）：約$26/月
- Firebase/Google Cloud: $0.076/月（主に無料枠内）
- 外部サービス（Sentry等）: $26/月
- 主要変動要因：音声ファイル増加によるストレージコスト

## 開発ワークフロー

プロジェクトが空の状態のため、以下の初期設定後に開発を開始：
1. Next.js + TypeScript プロジェクト作成
2. Firebase プロジェクト設定
3. TailwindCSS 設定
4. 基本的なCI/CD パイプライン構築