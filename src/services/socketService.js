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
        
        resolve(this.socket);
        return;
      }

      
      // socket.ioの接続設定
      this.socket = io(SOCKET_URL, {
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
        timeout: 20000
      });
      
      // サーバーに接続後の設定
      this.socket.on('connect', () => {
        
        this.isConnected = true;
        resolve(this.socket);
      });

      // サーバーから切断された場合の設定
      this.socket.on('disconnect', (reason) => {
        
        this.isConnected = false;
      });

      this.socket.on('connect_error', (error) => {
        console.error('接続エラー:', error);
        this.isConnected = false;
        reject(error);
      });

      // サーバーに再接続した場合の設定
      this.socket.on('reconnect', () => {
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

  // socketioの切断
  disconnect() {
    if (this.socket) {
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
      
      this.socket.emit('createRoom');
      
      this.socket.once('roomCreated', (data) => {
        this.roomCode = data.roomCode;
        this.isHost = true;
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
      
      this.socket.emit('joinRoom', { roomCode });
      
      // タイムアウトを設定
      const timeout = setTimeout(() => {
        console.error('部屋参加タイムアウト');
        reject(new Error('部屋参加タイムアウト'));
      }, 10000);
      
      this.socket.once('gameStarted', (data) => {
        
        clearTimeout(timeout);
        this.roomCode = data.roomCode;
        this.isHost = false;
        
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
    
    if (!this.socket || !this.roomCode) {
      console.error('Socket.IOまたは部屋番号が無効');
      return;
    }
        
    this.socket.emit('selectChair', {
      roomCode: this.roomCode,
      chairNumber,
      playerType
    });
    
    
  }

  confirmSelection(playerType, comment = '') {
        
    if (!this.socket || !this.roomCode) {
      console.error('Socket.IOまたは部屋番号が無効');
      return;
    }
    
    const emitData = {
      roomCode: this.roomCode,
      playerType,
      comment
    };
    
    
    
    this.socket.emit('confirmSelection', emitData);
    
    
    
  }

  onGameStarted(callback) {
    if (!this.socket) {
      console.error('Socket.IO接続が存在しません');
      return;
    }
    
    
    // 既存のリスナーを削除
    this.socket.off('gameStarted');
    this.socket.on('gameStarted', (data) => {
      
      callback(data);
    });
  }

  onGameStateUpdate(callback) {
    if (!this.socket) {
      console.error('Socket.IO接続が存在しません');
      return;
    }
    
    
    // 既存のリスナーを削除
    this.socket.off('gameStateUpdated');
    this.socket.on('gameStateUpdated', (data) => {
      
      callback(data);
    });
  }

  onGameOver(callback) {
    if (!this.socket) {
      console.error('Socket.IO接続が存在しません');
      return;
    }
    
    
    // 既存のリスナーを削除
    this.socket.off('gameOver');
    this.socket.on('gameOver', (data) => {
      
      callback(data);
    });
  }

  onPlayerDisconnected(callback) {
    if (!this.socket) {
      console.error('Socket.IO接続が存在しません');
      return;
    }
    
    
    // 既存のリスナーを削除
    this.socket.off('playerDisconnected');
    this.socket.on('playerDisconnected', (data) => {
      
      callback(data);
    });
  }

  onShowResult(callback) {
    if (!this.socket) {
      console.error('Socket.IO接続が存在しません');
      return;
    }
    
    
    // 既存のリスナーを削除
    this.socket.off('showResult');
    this.socket.on('showResult', (data) => {
      
      callback(data);
    });
  }

  onHideResult(callback) {
    if (!this.socket) {
      console.error('Socket.IO接続が存在しません');
      return;
    }
    
    
    // 既存のリスナーを削除
    this.socket.off('hideResult');
    this.socket.on('hideResult', (data) => {
      
      callback(data);
    });
  }

  onCommentReceived(callback) {
    if (!this.socket) {
      console.error('Socket.IO接続が存在しません');
      return;
    }
    
    
    this.socket.off('commentReceived');
    this.socket.on('commentReceived', (data) => {
      
      
      
      callback(data);
      
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