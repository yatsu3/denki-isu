const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const path = require('path');

const app = express();
const server = http.createServer(app);

// 本番環境用の設定
const isProduction = process.env.NODE_ENV === 'production';
const PORT = process.env.PORT || 3001;

const io = socketIo(server, {
  cors: {
    origin: isProduction ? "*" : "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

app.use(cors());
app.use(express.json());

// 本番環境では静的ファイルを配信
if (isProduction) {
  app.use(express.static(path.join(__dirname, '../build')));
  
  // React Router用のフォールバック
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../build/index.html'));
  });
}

// ゲームルームの管理
const rooms = new Map();

// ランダムな部屋番号を生成
function generateRoomCode() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 10; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// ゲーム状態の初期化
function initializeGameState() {
  return {
    currentPhase: 'omote', // 表の攻撃から開始
    currentRound: 1,
    player1Score: 0,
    player2Score: 0,
    player1Shocks: 0,
    player2Shocks: 0,
    chairs: Array(12).fill(null),
    usedChairs: [], // 使用済みのイス番号を管理
    player1Selection: null,
    player2Selection: null,
    player1Confirmed: false,
    player2Confirmed: false,
    currentTurn: 'player1'
  };
}

// ゲーム終了条件のチェック
function checkGameOver(gameState) {
  // 電流を3回食らった場合
  if (gameState.player1Shocks >= 3 || gameState.player2Shocks >= 3) {
    let winner = null;
    if (gameState.player1Shocks >= 3) {
      winner = 'プレイヤー2';
    } else if (gameState.player2Shocks >= 3) {
      winner = 'プレイヤー1';
    }
    
    return {
      gameOver: true,
      winner,
      reason: '電流3回'
    };
  }
  
  // 40点以上ポイント取った場合
  if (gameState.player1Score >= 40 || gameState.player2Score >= 40) {
    let winner = null;
    if (gameState.player1Score >= 40) {
      winner = 'プレイヤー1';
    } else if (gameState.player2Score >= 40) {
      winner = 'プレイヤー2';
    }
    
    return {
      gameOver: true,
      winner,
      reason: '40点達成'
    };
  }
  
  // 8ラウンド終了の場合
  if (gameState.currentRound > 8) {
    const winner = gameState.player1Score > gameState.player2Score ? 'プレイヤー1' : 'プレイヤー2';
    
    return {
      gameOver: true,
      winner,
      reason: '8ラウンド終了'
    };
  }
  
  return { gameOver: false, winner: null, reason: null };
}

// 結果判定処理
function processResult(roomCode, gameState) {
  console.log('=== 結果判定処理開始 ===');
  
  // 結果判定
  let result = {
    player1Chair: gameState.player1Selection,
    player2Chair: gameState.player2Selection,
    isShock: false,
    pointGain: 0,
    shockedPlayer: null
  };
  
  if (gameState.player1Selection === gameState.player2Selection) {
    // 電流が流れた
    result.isShock = true;
    if (gameState.currentPhase === 'omote') {
      // 表の攻撃フェーズ：プレイヤー1が電流を流す、プレイヤー2が座る
      gameState.player2Shocks += 1;
      result.shockedPlayer = 'player2';
      // プレイヤー2の得点を0点にする
      gameState.player2Score = 0;
      console.log('プレイヤー2が電流を食らった（表の攻撃）、得点を0点にリセット');
    } else {
      // 裏の攻撃フェーズ：プレイヤー2が電流を流す、プレイヤー1が座る
      gameState.player1Shocks += 1;
      result.shockedPlayer = 'player1';
      // プレイヤー1の得点を0点にする
      gameState.player1Score = 0;
      console.log('プレイヤー1が電流を食らった（裏の攻撃）、得点を0点にリセット');
    }
  } else {
    // ポイント獲得
    if (gameState.currentPhase === 'omote') {
      // 表の攻撃フェーズ：プレイヤー2がポイント獲得
      const points = gameState.player2Selection + 1;
      gameState.player2Score += points;
      result.pointGain = points;
      // 使用済みイスに追加
      if (!gameState.usedChairs.includes(gameState.player2Selection)) {
        gameState.usedChairs.push(gameState.player2Selection);
      }
      console.log('プレイヤー2がポイント獲得（表の攻撃）:', points, '使用済みイス:', gameState.usedChairs);
    } else {
      // 裏の攻撃フェーズ：プレイヤー1がポイント獲得
      const points = gameState.player1Selection + 1;
      gameState.player1Score += points;
      result.pointGain = points;
      // 使用済みイスに追加
      if (!gameState.usedChairs.includes(gameState.player1Selection)) {
        gameState.usedChairs.push(gameState.player1Selection);
      }
      console.log('プレイヤー1がポイント獲得（裏の攻撃）:', points, '使用済みイス:', gameState.usedChairs);
    }
  }

  // 結果表示状態に移行
  const previousPhase = gameState.currentPhase; // 元のフェーズを保存
  gameState.currentPhase = 'result';
  gameState.result = result;
  gameState.previousPhase = previousPhase;
  
  console.log('結果表示状態に移行:', result, '元のフェーズ:', previousPhase);
  
  // 結果表示用のイベントを送信
  io.to(roomCode).emit('showResult', result);
  
  // 3秒後に次のフェーズに移行
  setTimeout(() => {
    // フェーズとターンの切り替え
    if (gameState.currentPhase === 'result') {
      if (gameState.previousPhase === 'omote') {
        // 表の攻撃フェーズが終了したら裏の攻撃フェーズへ
        gameState.currentPhase = 'ura';
        gameState.currentTurn = 'player2'; // プレイヤー2が電流を流す
        console.log('=== 裏の攻撃フェーズへ移行 ===');
      } else {
        // 裏の攻撃フェーズが終了したら次のラウンドの表の攻撃フェーズへ
        gameState.currentPhase = 'omote';
        gameState.currentTurn = 'player1'; // プレイヤー1が電流を流す
        gameState.currentRound += 1;
        console.log('=== 次のラウンドの表の攻撃フェーズへ移行 ===:', gameState.currentRound);
      }

      // 選択状態をリセット
      gameState.chairs = Array(12).fill(null);
      gameState.player1Selection = null;
      gameState.player2Selection = null;
      gameState.player1Confirmed = false;
      gameState.player2Confirmed = false;
      gameState.result = null;
      gameState.previousPhase = null;

      console.log('状態リセット完了:', {
        currentPhase: gameState.currentPhase,
        currentTurn: gameState.currentTurn,
        currentRound: gameState.currentRound,
        player1Score: gameState.player1Score,
        player2Score: gameState.player2Score,
        player1Shocks: gameState.player1Shocks,
        player2Shocks: gameState.player2Shocks
      });

      // ゲーム終了チェック
      const gameOverResult = checkGameOver(gameState);
      if (gameOverResult.gameOver) {
        gameState.currentPhase = 'finished';
        // room変数を正しく取得
        const room = rooms.get(roomCode);
        if (room) {
          room.status = 'finished';
        }
        console.log('ゲーム終了:', gameOverResult.winner, '理由:', gameOverResult.reason);
        io.to(roomCode).emit('gameOver', { winner: gameOverResult.winner, reason: gameOverResult.reason });
      } else {
        // 結果表示終了を通知
        io.to(roomCode).emit('hideResult');
        // 次のフェーズの状態更新を送信
        io.to(roomCode).emit('gameStateUpdated', gameState);
      }
    }
  }, 3000);
}

// Socket.IO接続の処理
io.on('connection', (socket) => {
  console.log('ユーザーが接続しました:', socket.id);

  // 部屋作成
  socket.on('createRoom', () => {
    console.log('部屋作成リクエスト受信:', socket.id);
    
    let roomCode;
    do {
      roomCode = generateRoomCode();
    } while (rooms.has(roomCode));

    const room = {
      id: roomCode,
      host: socket.id,
      players: [socket.id],
      gameState: initializeGameState(),
      status: 'waiting' // 'waiting', 'playing', 'finished'
    };

    rooms.set(roomCode, room);
    socket.join(roomCode);
    
    console.log('部屋作成完了:', { roomCode, socketId: socket.id, roomStatus: room.status });
    socket.emit('roomCreated', { roomCode });
    console.log(`部屋が作成されました: ${roomCode}`);
  });

  // 部屋参加
  socket.on('joinRoom', ({ roomCode }) => {
    console.log('部屋参加リクエスト受信:', { roomCode, socketId: socket.id });
    
    const room = rooms.get(roomCode);
    
    if (!room) {
      console.log('部屋が見つかりません:', roomCode);
      socket.emit('joinError', { message: '部屋が見つかりません' });
      return;
    }

    if (room.players.length >= 2) {
      console.log('部屋が満員です:', roomCode);
      socket.emit('joinError', { message: '部屋が満員です' });
      return;
    }

    room.players.push(socket.id);
    room.status = 'playing';
    socket.join(roomCode);

    console.log('部屋参加完了:', { 
      roomCode, 
      socketId: socket.id, 
      playerCount: room.players.length,
      roomStatus: room.status,
      allPlayers: room.players,
      gamePhase: room.gameState.currentPhase
    });

    // 両プレイヤーにゲーム開始を通知
    console.log('gameStartedイベント送信:', { roomCode, gameState: room.gameState });
    console.log('送信先プレイヤー:', room.players);
    
    io.to(roomCode).emit('gameStarted', {
      roomCode,
      gameState: room.gameState
    });

    console.log(`プレイヤーが部屋に参加しました: ${roomCode}`);
  });

  // イス選択（選択中の状態は管理しない）
  socket.on('selectChair', ({ roomCode, chairNumber, playerType }) => {
    console.log('イス選択リクエスト受信:', { roomCode, chairNumber, playerType, socketId: socket.id });
    
    const room = rooms.get(roomCode);
    if (!room || room.status !== 'playing') {
      console.log('部屋が見つからないか、ゲーム中ではない');
      return;
    }

    const gameState = room.gameState;

    // 使用済みのイスは選択できない
    if (gameState.usedChairs.includes(chairNumber)) {
      console.log('使用済みのイスのため選択不可:', chairNumber);
      return;
    }

    // プレイヤーの選択を記録（確定前の一時的な状態）
    if (playerType === 'player1') {
      gameState.player1Selection = chairNumber;
      console.log('プレイヤー1が選択:', chairNumber);
    } else {
      gameState.player2Selection = chairNumber;
      console.log('プレイヤー2が選択:', chairNumber);
    }

    console.log('イス選択完了:', { chairNumber, playerType });

    // 選択中の状態は相手に見せないため、状態更新は送信しない
  });

  // 選択確認
  socket.on('confirmSelection', ({ roomCode, playerType }) => {
    console.log('=== confirmSelectionイベント受信開始 ===');
    console.log('受信データ:', { roomCode, playerType, socketId: socket.id });
    
    const room = rooms.get(roomCode);
    console.log('部屋検索結果:', {
      roomFound: !!room,
      roomStatus: room?.status,
      roomCode,
      allRooms: Array.from(rooms.keys())
    });
    
    if (!room || room.status !== 'playing') {
      console.error('部屋が見つからないか、ゲーム中ではない');
      console.log('=== confirmSelectionイベント処理終了（エラー） ===');
      return;
    }

    const gameState = room.gameState;
    console.log('処理前のゲーム状態:', {
      currentPhase: gameState.currentPhase,
      currentTurn: gameState.currentTurn,
      player1Confirmed: gameState.player1Confirmed,
      player2Confirmed: gameState.player2Confirmed,
      player1Selection: gameState.player1Selection,
      player2Selection: gameState.player2Selection
    });

    // プレイヤーの確認状態を更新
    if (playerType === 'player1') {
      gameState.player1Confirmed = true;
      // プレイヤー1の選択は相手に見せないため、イスの状態は更新しない
      console.log('プレイヤー1の確認状態を更新（イスの状態は更新しない）');
    } else {
      gameState.player2Confirmed = true;
      // プレイヤー2の選択は相手に見せないため、イスの状態は更新しない
      console.log('プレイヤー2の確認状態を更新（イスの状態は更新しない）');
    }

    console.log('確認状態更新後:', {
      player1Confirmed: gameState.player1Confirmed,
      player2Confirmed: gameState.player2Confirmed,
      player1Selection: gameState.player1Selection,
      player2Selection: gameState.player2Selection,
      currentPhase: gameState.currentPhase,
      currentTurn: gameState.currentTurn
    });

    // プレイヤー1が確認したら、プレイヤー2のターンに移行
    if (playerType === 'player1' && gameState.player1Confirmed) {
      if (gameState.currentPhase === 'omote') {
        // 表の攻撃フェーズ：プレイヤー1が電流を流すイスを選択確定したらプレイヤー2のターンに移行
        console.log('=== プレイヤー1が確認完了（表の攻撃）、プレイヤー2のターンに移行 ===');
        gameState.currentTurn = 'player2';
        
        // 選択状態をリセット（プレイヤー2が選択できるように）
        gameState.player2Selection = null;
        gameState.player2Confirmed = false;
        
        console.log('プレイヤー2のターン開始:', {
          currentTurn: gameState.currentTurn,
          player2Selection: gameState.player2Selection,
          player2Confirmed: gameState.player2Confirmed
        });
      } else if (gameState.currentPhase === 'ura') {
        // 裏の攻撃フェーズ：プレイヤー1が座るイスを選択確定したら結果判定
        console.log('=== プレイヤー1が確認完了（裏の攻撃）、結果判定開始 ===');
        processResult(roomCode, gameState);
      }
    }
    // プレイヤー2が確認した場合の処理
    else if (playerType === 'player2' && gameState.player2Confirmed) {
      if (gameState.currentPhase === 'omote') {
        // 表の攻撃フェーズ：プレイヤー2が座るイスを選択確定したら結果判定
        console.log('=== プレイヤー2が確認完了（表の攻撃）、結果判定開始 ===');
        processResult(roomCode, gameState);
      } else if (gameState.currentPhase === 'ura') {
        // 裏の攻撃フェーズ：プレイヤー2が電流を流すイスを選択確定したらプレイヤー1のターンに移行
        console.log('=== プレイヤー2が確認完了（裏の攻撃）、プレイヤー1のターンに移行 ===');
        gameState.currentTurn = 'player1';
        
        // 選択状態をリセット（プレイヤー1が選択できるように）
        gameState.player1Selection = null;
        gameState.player1Confirmed = false;
        
        console.log('プレイヤー1のターン開始（裏の攻撃）:', {
          currentTurn: gameState.currentTurn,
          player1Selection: gameState.player1Selection,
          player1Confirmed: gameState.player1Confirmed,
          currentPhase: gameState.currentPhase
        });
        
        // 状態更新を即座に送信
        console.log('=== 即座にgameStateUpdatedイベント送信 ===');
        io.to(roomCode).emit('gameStateUpdated', gameState);
        console.log('=== 即座のgameStateUpdatedイベント送信完了 ===');
        
        // 即座送信した場合は、後で重複送信しないようにフラグを設定
        gameState._immediateUpdateSent = true;
      }
    }

    // 全プレイヤーに状態更新を通知
    console.log('=== gameStateUpdatedイベント送信開始 ===');
    console.log('送信データ:', gameState);
    console.log('送信先部屋:', roomCode);
    console.log('部屋のプレイヤー:', room.players);
    
    // 即座送信フラグが設定されている場合は重複送信を避ける
    if (!gameState._immediateUpdateSent) {
      io.to(roomCode).emit('gameStateUpdated', gameState);
    } else {
      console.log('即座送信済みのため、重複送信をスキップ');
      // フラグをリセット
      gameState._immediateUpdateSent = false;
    }
    
    console.log('=== gameStateUpdatedイベント送信完了 ===');
    console.log('=== confirmSelectionイベント処理終了 ===');
  });

  // 切断処理
  socket.on('disconnect', (reason) => {
    console.log('ユーザーが切断しました:', socket.id, '理由:', reason);
    
    // プレイヤーが参加している部屋を探して処理
    for (const [roomCode, room] of rooms.entries()) {
      const playerIndex = room.players.indexOf(socket.id);
      if (playerIndex !== -1) {
        console.log('プレイヤーが部屋から退出:', { roomCode, socketId: socket.id, playerIndex });
        room.players.splice(playerIndex, 1);
        
        if (room.players.length === 0) {
          // 部屋が空になったら削除
          rooms.delete(roomCode);
          console.log(`部屋が削除されました: ${roomCode}`);
        } else {
          // 残りのプレイヤーに通知
          console.log('残りのプレイヤーに切断通知:', { roomCode, remainingPlayers: room.players });
          io.to(roomCode).emit('playerDisconnected');
          console.log(`プレイヤーが部屋から退出しました: ${roomCode}`);
        }
        break;
      }
    }
  });
});

// ヘルスチェック用エンドポイント
app.get('/health', (req, res) => {
  res.json({ status: 'OK', rooms: rooms.size });
});

// 部屋一覧取得（デバッグ用）
app.get('/rooms', (req, res) => {
  const roomList = Array.from(rooms.entries()).map(([code, room]) => ({
    code,
    playerCount: room.players.length,
    status: room.status
  }));
  res.json(roomList);
});

server.listen(PORT, () => {
  console.log(`サーバーがポート${PORT}で起動しました`);
  console.log(`ヘルスチェック: http://localhost:${PORT}/health`);
}); 