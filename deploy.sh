#!/bin/bash

echo "🚀 電気椅子ゲーム デプロイスクリプト"
echo "=================================="

# 依存関係のインストール
echo "📦 依存関係をインストール中..."
npm install
cd server && npm install && cd ..

# フロントエンドのビルド
echo "🔨 フロントエンドをビルド中..."
npm run build

# ビルド結果の確認
if [ -d "build" ]; then
    echo "✅ ビルド成功！"
    echo "📁 build/ フォルダが作成されました"
else
    echo "❌ ビルド失敗！"
    exit 1
fi

echo ""
echo "🎉 デプロイ準備完了！"
echo ""
echo "次の手順でデプロイしてください："
echo "1. GitHubにコードをプッシュ"
echo "2. 選択したホスティングサービスでリポジトリをインポート"
echo "3. 環境変数を設定"
echo "4. ドメインを設定"
echo ""
echo "詳細は DEPLOYMENT.md を参照してください" 