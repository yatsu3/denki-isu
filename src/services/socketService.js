import { io } from 'socket.io-client';

// 本番環境用の設定
const isProduction = process.env.NODE_ENV === 'production';
const SOCKET_URL = isProduction 
  ? process.env.REACT_APP_SOCKET_URL 
  : 'http://localhost:3001';

class SocketService {
  constructor() {
    this.socket = null;
    this.roomCode = null;
    this.isHost = false;
    this.isConnected = false;
  }

  // サーバーのヘルスチェック
  async checkServerHealth() {
    try {
      const response = await fetch('http://localhost:3001/health');
      if (response.ok) {
        const data = await response.json();
        return data.status === 'OK';
      }
      return false;
    } catch (error) {
      console.error('ヘルスチェックエラー:', error);
      return false;
    }
  }

  connect() {
    return new Promise((resolve, reject) => {
      if (this.socket && this.isConnected) {
        console.log('既に接続済みです');
        resolve(this.socket);
        return;
      }

      console.log('Socket.IO接続開始:', SOCKET_URL);
      
      this.socket = io(SOCKET_URL, {
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
        timeout: 20000
      });
      
      this.socket.on('connect', () => {
        console.log('サーバーに接続しました:', this.socket.id);
        this.isConnected = true;
        resolve(this.socket);
      });

      this.socket.on('disconnect', (reason) => {
        console.log('サーバーから切断されました:', reason);
        this.isConnected = false;
      });

      this.socket.on('connect_error', (error) => {
        console.error('接続エラー:', error);
        this.isConnected = false;
        reject(error);
      });

      this.socket.on('reconnect', (attemptNumber) => {
        console.log('再接続しました:', attemptNumber);
        this.isConnected = true;
      });

      this.socket.on('reconnect_error', (error) => {
        console.error('再接続エラー:', error);
      });

      // タイムアウト設定
      setTimeout(() => {
        if (!this.isConnected) {
          console.error('接続タイムアウト');
          reject(new Error('接続タイムアウト'));
        }
      }, 20000);
    });
  }

  disconnect() {
    if (this.socket) {
      console.log('Socket.IO接続を切断します');
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
    }
  }

  createRoom() {
    return new Promise((resolve, reject) => {
      // より厳密な接続状態チェック
      if (!this.socket) {
        console.error('Socket.IO接続が存在しません');
        reject(new Error('Socket not connected'));
        return;
      }

      if (!this.socket.connected) {
        console.error('Socket.IO接続が切断されています');
        reject(new Error('Socket not connected'));
        return;
      }

      console.log('部屋作成リクエスト送信 - Socket状態:', {
        socketId: this.socket.id,
        connected: this.socket.connected,
        isConnected: this.isConnected
      });
      
      this.socket.emit('createRoom');
      
      this.socket.once('roomCreated', (data) => {
        console.log('部屋作成成功:', data);
        this.roomCode = data.roomCode;
        this.isHost = true;
        console.log('Socket.IOサービス: ホストに設定されました');
        resolve(data);
      });

      // タイムアウト設定
      setTimeout(() => {
        reject(new Error('部屋作成タイムアウト'));
      }, 10000);
    });
  }

  joinRoom(roomCode) {
    return new Promise((resolve, reject) => {
      // より厳密な接続状態チェック
      if (!this.socket) {
        console.error('Socket.IO接続が存在しません');
        reject(new Error('Socket not connected'));
        return;
      }

      if (!this.socket.connected) {
        console.error('Socket.IO接続が切断されています');
        reject(new Error('Socket not connected'));
        return;
      }

      console.log('部屋参加リクエスト送信:', roomCode);
      console.log('現在のSocket.IO状態:', {
        socketId: this.socket.id,
        connected: this.socket.connected,
        isConnected: this.isConnected
      });
      
      this.socket.emit('joinRoom', { roomCode });
      
      // タイムアウトを設定
      const timeout = setTimeout(() => {
        console.error('部屋参加タイムアウト');
        reject(new Error('部屋参加タイムアウト'));
      }, 10000);
      
      this.socket.once('gameStarted', (data) => {
        console.log('gameStartedイベントを受信:', data);
        clearTimeout(timeout);
        this.roomCode = data.roomCode;
        this.isHost = false;
        console.log('Socket.IOサービス: 参加者に設定されました');
        resolve(data);
      });

      this.socket.once('joinError', (error) => {
        console.error('部屋参加エラー:', error);
        clearTimeout(timeout);
        reject(error);
      });
    });
  }

  selectChair(chairNumber, playerType) {
    console.log('selectChair呼び出し:', {
      chairNumber,
      playerType,
      socket: this.socket,
      roomCode: this.roomCode,
      isConnected: this.isConnected
    });
    
    if (!this.socket || !this.roomCode) {
      console.error('Socket.IOまたは部屋番号が無効');
      return;
    }
    
    console.log('Socket.IO emit実行:', {
      roomCode: this.roomCode,
      chairNumber,
      playerType
    });
    
    this.socket.emit('selectChair', {
      roomCode: this.roomCode,
      chairNumber,
      playerType
    });
    
    console.log('Socket.IO emit完了');
  }

  confirmSelection(playerType, comment = '') {
    console.log('=== confirmSelection呼び出し開始 ===');
    console.log('確認状態:', {
      playerType,
      roomCode: this.roomCode,
      socket: this.socket,
      isConnected: this.isConnected,
      socketId: this.socket?.id,
      comment
    });
    
    if (!this.socket || !this.roomCode) {
      console.error('Socket.IOまたは部屋番号が無効');
      return;
    }
    
    const emitData = {
      roomCode: this.roomCode,
      playerType,
      comment
    };
    
    console.log('Socket.IO emit実行:', emitData);
    
    this.socket.emit('confirmSelection', emitData);
    
    console.log('Socket.IO emit完了');
    console.log('=== confirmSelection呼び出し終了 ===');
  }

  onGameStarted(callback) {
    if (!this.socket) {
      console.error('Socket.IO接続が存在しません');
      return;
    }
    
    console.log('onGameStartedリスナーを設定');
    // 既存のリスナーを削除
    this.socket.off('gameStarted');
    this.socket.on('gameStarted', (data) => {
      console.log('gameStartedイベントを受信:', data);
      callback(data);
    });
  }

  onGameStateUpdate(callback) {
    if (!this.socket) {
      console.error('Socket.IO接続が存在しません');
      return;
    }
    
    console.log('onGameStateUpdateリスナーを設定');
    // 既存のリスナーを削除
    this.socket.off('gameStateUpdated');
    this.socket.on('gameStateUpdated', (data) => {
      console.log('gameStateUpdatedイベントを受信:', data);
      callback(data);
    });
  }

  onGameOver(callback) {
    if (!this.socket) {
      console.error('Socket.IO接続が存在しません');
      return;
    }
    
    console.log('onGameOverリスナーを設定');
    // 既存のリスナーを削除
    this.socket.off('gameOver');
    this.socket.on('gameOver', (data) => {
      console.log('gameOverイベントを受信:', data);
      callback(data);
    });
  }

  onPlayerDisconnected(callback) {
    if (!this.socket) {
      console.error('Socket.IO接続が存在しません');
      return;
    }
    
    console.log('onPlayerDisconnectedリスナーを設定');
    // 既存のリスナーを削除
    this.socket.off('playerDisconnected');
    this.socket.on('playerDisconnected', (data) => {
      console.log('playerDisconnectedイベントを受信:', data);
      callback(data);
    });
  }

  onShowResult(callback) {
    if (!this.socket) {
      console.error('Socket.IO接続が存在しません');
      return;
    }
    
    console.log('onShowResultリスナーを設定');
    // 既存のリスナーを削除
    this.socket.off('showResult');
    this.socket.on('showResult', (data) => {
      console.log('showResultイベントを受信:', data);
      callback(data);
    });
  }

  onHideResult(callback) {
    if (!this.socket) {
      console.error('Socket.IO接続が存在しません');
      return;
    }
    
    console.log('onHideResultリスナーを設定');
    // 既存のリスナーを削除
    this.socket.off('hideResult');
    this.socket.on('hideResult', (data) => {
      console.log('hideResultイベントを受信:', data);
      callback(data);
    });
  }

  onCommentReceived(callback) {
    if (!this.socket) {
      console.error('Socket.IO接続が存在しません');
      return;
    }
    
    console.log('onCommentReceivedリスナーを設定');
    this.socket.off('commentReceived');
    this.socket.on('commentReceived', (data) => {
      console.log('=== socketService: commentReceivedイベント受信開始 ===');
      console.log('受信データ:', data);
      console.log('コールバック関数:', callback);
      callback(data);
      console.log('=== socketService: commentReceivedイベント受信終了 ===');
    });
  }

  getRoomCode() {
    return this.roomCode;
  }

  getIsHost() {
    return this.isHost;
  }

  isSocketConnected() {
    return this.isConnected;
  }
}

const socketService = new SocketService();
export default socketService;