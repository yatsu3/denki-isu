# 🚀 電気椅子ゲーム デプロイ手順

## 前提条件
- Node.js 16以上がインストール済み
- Gitがインストール済み
- ドメインを取得済み

## デプロイ方法

### 方法1: Vercel + Railway (推奨)

#### 1. フロントエンド (Vercel)
1. [Vercel](https://vercel.com)にアカウント作成・ログイン
2. GitHubリポジトリをインポート
3. プロジェクト設定:
   - Framework Preset: `Create React App`
   - Build Command: `npm run build`
   - Output Directory: `build`
   - Install Command: `npm install`
4. 環境変数設定:
   - `REACT_APP_SOCKET_URL`: バックエンドのURL (後で設定)

#### 2. バックエンド (Railway)
1. [Railway](https://railway.app)にアカウント作成・ログイン
2. GitHubリポジトリをインポート
3. プロジェクト設定:
   - Root Directory: `server`
   - Build Command: `npm install`
   - Start Command: `npm start`
4. 環境変数設定:
   - `NODE_ENV`: `production`
   - `PORT`: `3001`

#### 3. ドメイン設定
1. Vercelでカスタムドメインを設定
2. Railwayでカスタムドメインを設定
3. フロントエンドの環境変数 `REACT_APP_SOCKET_URL` をバックエンドのURLに更新

### 方法2: Heroku

#### 1. Heroku CLIインストール
```bash
# macOS
brew tap heroku/brew && brew install heroku

# Windows
# https://devcenter.heroku.com/articles/heroku-cli からダウンロード
```

#### 2. デプロイ
```bash
# Herokuにログイン
heroku login

# アプリケーション作成
heroku create your-app-name

# 環境変数設定
heroku config:set NODE_ENV=production

# デプロイ
git add .
git commit -m "Deploy to Heroku"
git push heroku main
```

#### 3. ドメイン設定
```bash
# カスタムドメイン追加
heroku domains:add your-domain.com

# SSL証明書追加
heroku certs:auto:enable
```

### 方法3: Netlify + Render

#### 1. フロントエンド (Netlify)
1. [Netlify](https://netlify.com)にアカウント作成・ログイン
2. GitHubリポジトリをインポート
3. ビルド設定:
   - Build command: `npm run build`
   - Publish directory: `build`
4. 環境変数設定:
   - `REACT_APP_SOCKET_URL`: バックエンドのURL

#### 2. バックエンド (Render)
1. [Render](https://render.com)にアカウント作成・ログイン
2. GitHubリポジトリをインポート
3. サービス設定:
   - Type: `Web Service`
   - Root Directory: `server`
   - Build Command: `npm install`
   - Start Command: `npm start`
4. 環境変数設定:
   - `NODE_ENV`: `production`

## ローカルテスト

### 本番環境のテスト
```bash
# フロントエンドビルド
npm run build

# サーバー起動（本番モード）
cd server
NODE_ENV=production npm start
```

### 環境変数確認
```bash
# フロントエンド
echo $REACT_APP_SOCKET_URL

# バックエンド
echo $NODE_ENV
echo $PORT
```

## トラブルシューティング

### よくある問題
1. **Socket.IO接続エラー**
   - CORS設定を確認
   - 環境変数のURLが正しいか確認

2. **ビルドエラー**
   - Node.jsバージョンを確認（16以上）
   - 依存関係を再インストール

3. **ドメイン設定エラー**
   - DNS設定を確認
   - SSL証明書の有効性を確認

### ログ確認
```bash
# Heroku
heroku logs --tail

# Railway
railway logs

# Vercel
vercel logs
```

## セキュリティ考慮事項
- 環境変数で機密情報を管理
- HTTPS通信を強制
- CORS設定を適切に設定
- レート制限の実装を検討

## パフォーマンス最適化
- 画像の最適化
- コード分割の実装
- CDNの活用
- キャッシュ戦略の実装 