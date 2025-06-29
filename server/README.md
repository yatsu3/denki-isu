# 電気イスゲーム サーバー

電気イスゲームのWebSocketサーバーサイドです。

## 機能

- WebSocketを使用したリアルタイム通信
- 部屋の作成・参加管理
- ゲーム状態の同期
- プレイヤーの切断処理

## セットアップ

### 必要な環境
- Node.js (v14以上)
- npm または yarn

### インストール手順

1. 依存関係をインストール
```bash
cd server
npm install
```

2. サーバーを起動
```bash
# 開発モード（nodemon使用）
npm run dev

# 本番モード
npm start
```

3. サーバーが `http://localhost:3001` で起動します

## API エンドポイント

### ヘルスチェック
```
GET /health
```
サーバーの状態とアクティブな部屋数を返します。

### 部屋一覧（デバッグ用）
```
GET /rooms
```
現在アクティブな部屋の一覧を返します。

## WebSocket イベント

### クライアント → サーバー

#### `createRoom`
部屋を作成します。

#### `joinRoom`
指定された部屋に参加します。
```javascript
{
  roomCode: "ABC123DEF4"
}
```

#### `selectChair`
イスを選択します。
```javascript
{
  roomCode: "ABC123DEF4",
  chairNumber: 5,
  playerType: "player1"
}
```

#### `confirmSelection`
選択を確定します。
```javascript
{
  roomCode: "ABC123DEF4",
  playerType: "player1"
}
```

### サーバー → クライアント

#### `roomCreated`
部屋が作成されたことを通知します。
```javascript
{
  roomCode: "ABC123DEF4"
}
```

#### `gameStarted`
ゲームが開始されたことを通知します。
```javascript
{
  roomCode: "ABC123DEF4",
  gameState: { ... }
}
```

#### `gameStateUpdated`
ゲーム状態が更新されたことを通知します。
```javascript
{
  gameState: { ... }
}
```

#### `gameOver`
ゲームが終了したことを通知します。
```javascript
{
  winner: "プレイヤー1"
}
```

#### `joinError`
部屋参加エラーを通知します。
```javascript
{
  message: "部屋が見つかりません"
}
```

#### `playerDisconnected`
相手プレイヤーが切断したことを通知します。

## ゲーム状態の構造

```javascript
{
  round: 1,                    // 現在のラウンド
  phase: "omote",              // "omote" または "ura"
  player1Points: 0,            // プレイヤー1のポイント
  player2Points: 0,            // プレイヤー2のポイント
  player1Shocks: 0,            // プレイヤー1が電流を食らった回数
  player2Shocks: 0,            // プレイヤー2が電流を食らった回数
  availableChairs: [1,2,3...], // 利用可能なイスの番号
  player1SelectedChair: null,  // プレイヤー1が選択したイス
  player2SelectedChair: null,  // プレイヤー2が選択したイス
  player1ShockChair: null,     // プレイヤー1が電流を流すイス
  player2ShockChair: null,     // プレイヤー2が電流を流すイス
  gameOver: false,             // ゲーム終了フラグ
  winner: null,                // 勝者
  currentPlayer: "player1"     // 現在のプレイヤー
}
```

## 環境変数

- `PORT`: サーバーのポート番号（デフォルト: 3001）

## 開発

### ログ
サーバーは以下のログを出力します：
- ユーザーの接続・切断
- 部屋の作成・削除
- プレイヤーの参加・退出

### デバッグ
開発時は `npm run dev` を使用すると、ファイルの変更を監視して自動的にサーバーを再起動します。 