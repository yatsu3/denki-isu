# 🚀 電気椅子ゲーム デプロイ手順

## 前提条件
- Node.js 16以上がインストール済み
- Gitがインストール済み
- ドメイン: `electric-chair.com` を取得済み

## 🎯 推奨デプロイ方法: Vercel + Railway

### ステップ1: バックエンド (Railway) のデプロイ

#### 1. Railwayアカウント作成・ログイン
1. [Railway](https://railway.app)にアクセス
2. GitHubアカウントでログイン

#### 2. プロジェクト作成
1. "New Project" → "Deploy from GitHub repo"
2. `yatsu3/denki-isu` リポジトリを選択
3. "Deploy Now" をクリック

#### 3. プロジェクト設定
1. プロジェクト名: `denki-isu-backend`
2. Root Directory: `server`
3. Build Command: `npm install`
4. Start Command: `npm start`

#### 4. 環境変数設定
Railwayのダッシュボードで以下を設定：
```
NODE_ENV=production
PORT=3001
```

#### 5. カスタムドメイン設定
1. "Settings" → "Domains"
2. "Generate Domain" で一時的なドメインを取得
3. 例: `denki-isu-backend-production.up.railway.app`
4. このドメインをメモ（フロントエンド設定で使用）

### ステップ2: フロントエンド (Vercel) のデプロイ

#### 1. Vercelアカウント作成・ログイン
1. [Vercel](https://vercel.com)にアクセス
2. GitHubアカウントでログイン

#### 2. プロジェクト作成
1. "New Project" → "Import Git Repository"
2. `yatsu3/denki-isu` リポジトリを選択
3. プロジェクト設定:
   - Framework Preset: `Create React App`
   - Root Directory: `./` (デフォルト)
   - Build Command: `npm run build`
   - Output Directory: `build`
   - Install Command: `npm install`

#### 3. 環境変数設定
Vercelのダッシュボードで以下を設定：
```
REACT_APP_SOCKET_URL=https://denki-isu-backend-production.up.railway.app
```

#### 4. カスタムドメイン設定
1. "Settings" → "Domains"
2. "Add Domain" → `electric-chair.com`
3. DNS設定:
   - Type: `CNAME`
   - Name: `@`
   - Value: `cname.vercel-dns.com`

### ステップ3: DNS設定

#### ドメインプロバイダーでの設定
1. ドメインプロバイダーのDNS管理画面にアクセス
2. 以下のレコードを追加：

**Aレコード:**
```
Type: A
Name: @
Value: 76.76.19.36
```

**CNAMEレコード:**
```
Type: CNAME
Name: www
Value: electric-chair.com
```

### ステップ4: SSL証明書の確認

#### Vercel
- 自動的にSSL証明書が発行されます
- 数分で有効になります

#### Railway
- 自動的にSSL証明書が発行されます
- カスタムドメイン設定時に有効になります

## 🔧 動作確認

### 1. フロントエンド確認
```bash
# ブラウザでアクセス
https://electric-chair.com
```

### 2. バックエンド確認
```bash
# ヘルスチェック
curl https://denki-isu-backend-production.up.railway.app/health

# 部屋一覧（デバッグ用）
curl https://denki-isu-backend-production.up.railway.app/rooms
```

### 3. Socket.IO接続確認
1. ブラウザの開発者ツールを開く
2. Consoleタブで接続ログを確認
3. NetworkタブでWebSocket接続を確認

## 🚨 トラブルシューティング

### よくある問題と解決方法

#### 1. Socket.IO接続エラー
**症状:** フロントエンドでSocket.IO接続エラー
**解決方法:**
- 環境変数 `REACT_APP_SOCKET_URL` が正しく設定されているか確認
- Railwayのバックエンドが正常に起動しているか確認
- CORS設定を確認

#### 2. ドメインアクセスエラー
**症状:** `electric-chair.com` にアクセスできない
**解決方法:**
- DNS設定が正しく反映されているか確認（最大24時間かかる場合があります）
- Vercelのドメイン設定が完了しているか確認

#### 3. ビルドエラー
**症状:** Vercelでビルドが失敗する
**解決方法:**
- Node.jsバージョンを確認（16以上）
- 依存関係のインストールエラーを確認
- ビルドログを詳細に確認

### ログ確認方法

#### Vercel
```bash
# Vercel CLIでログ確認
npm i -g vercel
vercel login
vercel logs
```

#### Railway
```bash
# Railway CLIでログ確認
npm i -g @railway/cli
railway login
railway logs
```

## 📊 監視とメンテナンス

### 1. パフォーマンス監視
- Vercel Analytics でフロントエンドのパフォーマンスを監視
- Railway Metrics でバックエンドのリソース使用量を監視

### 2. エラー監視
- ブラウザのコンソールエラーを定期的に確認
- サーバーログを定期的に確認

### 3. セキュリティ
- 定期的に依存関係の脆弱性をチェック
- `npm audit` を実行してセキュリティ問題を確認

## 🎉 デプロイ完了後の確認事項

- [ ] フロントエンドが `https://electric-chair.com` でアクセス可能
- [ ] バックエンドが正常に起動している
- [ ] Socket.IO接続が確立される
- [ ] ゲームが正常に動作する
- [ ] 部屋作成・参加が正常に動作する
- [ ] 椅子選択が正常に動作する
- [ ] ゲーム終了処理が正常に動作する

## 📞 サポート

問題が発生した場合は、以下を確認してください：
1. 各サービスのダッシュボードでログを確認
2. ブラウザの開発者ツールでエラーを確認
3. 環境変数が正しく設定されているか確認
4. DNS設定が正しく反映されているか確認 