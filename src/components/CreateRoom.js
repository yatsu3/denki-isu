import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import socketService from '../services/socketService';

function CreateRoom() {
  const navigate = useNavigate();
  const [roomCode, setRoomCode] = useState('');
  const [isWaiting, setIsWaiting] = useState(false);
  const [isConnecting, setIsConnecting] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    initializeRoom();
    
    // クリーンアップ
    return () => {
      // 接続は切断しない（GameRoomでも使用するため）
      console.log('CreateRoomクリーンアップ');
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const initializeRoom = async () => {
    try {
      setIsConnecting(true);
      setError('');
      
      // 既存の接続があるかチェック
      if (!socketService.isSocketConnected()) {
        console.log('Socket.IO接続が存在しないため、新規接続を開始');
        await socketService.connect();
      } else {
        console.log('既存のSocket.IO接続を使用');
      }
      
      // 部屋作成
      await createRoom();
      
    } catch (err) {
      setError('サーバーに接続できませんでした。サーバーが起動しているか確認してください。');
      console.error('初期化エラー:', err);
      setIsConnecting(false);
    }
  };

  const createRoom = async () => {
    try {
      setIsWaiting(true);
      setError('');
      
      const result = await socketService.createRoom();
      setRoomCode(result.roomCode);
      
      console.log('部屋作成完了、ゲーム開始イベントを待機中');
      
      // ゲーム開始を待機（gameStartedイベント）
      socketService.onGameStarted((data) => {
        console.log('CreateRoom: ゲーム開始イベントを受信:', data);
        // 即座にGameRoomに遷移
        navigate(`/game/${result.roomCode}`, { 
          state: { 
            roomCode: result.roomCode, 
            isHost: true,
            gameStarted: true,
            gameState: data.gameState
          } 
        });
      });
      
    } catch (err) {
      setError('部屋の作成に失敗しました: ' + err.message);
      console.error('部屋作成エラー:', err);
      setIsWaiting(false);
    }
  };

  const handleBack = () => {
    socketService.disconnect();
    navigate('/');
  };

  const copyRoomCode = async () => {
    if (!roomCode) return;
    
    try {
      await navigator.clipboard.writeText(roomCode);
      
      // コピー成功の視覚的フィードバック
      const roomCodeElement = document.querySelector('.room-code');
      if (roomCodeElement) {
        const originalText = roomCodeElement.textContent;
        roomCodeElement.textContent = 'コピーしました！';
        roomCodeElement.style.backgroundColor = '#4caf50';
        roomCodeElement.style.color = 'white';
        
        setTimeout(() => {
          roomCodeElement.textContent = originalText;
          roomCodeElement.style.backgroundColor = '';
          roomCodeElement.style.color = '';
        }, 2000);
      }
    } catch (err) {
      // フォールバック: 古いブラウザ対応
      const textArea = document.createElement('textarea');
      textArea.value = roomCode;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      
      alert('部屋番号をコピーしました！');
    }
  };

  const retryConnection = () => {
    setError('');
    initializeRoom();
  };

  if (isConnecting && !roomCode) {
    return (
      <div className="container">
        <h1 className="title">部屋を作成</h1>
        
        <div className="waiting">
          <span>サーバーに接続中...</span>
          <div className="loading"></div>
        </div>

        <p style={{ color: '#666', marginBottom: '30px' }}>
          しばらくお待ちください
        </p>

        <button className="button" onClick={handleBack}>
          戻る
        </button>
      </div>
    );
  }

  return (
    <div className="container">
      <h1 className="title">部屋を作成</h1>
      
      {error && (
        <div style={{ 
          backgroundColor: '#ffebee', 
          color: '#c62828', 
          padding: '15px', 
          borderRadius: '10px', 
          marginBottom: '20px' 
        }}>
          <p>{error}</p>
          <button 
            className="button" 
            onClick={retryConnection}
            style={{ 
              marginTop: '10px', 
              padding: '8px 16px', 
              fontSize: '0.9rem' 
            }}
          >
            再試行
          </button>
        </div>
      )}
      
      <div style={{ marginBottom: '30px' }}>
        <h3 style={{ color: '#333', marginBottom: '15px' }}>部屋番号</h3>
        <div 
          className="room-code" 
          onClick={copyRoomCode} 
          style={{ 
            cursor: roomCode ? 'pointer' : 'default',
            transition: 'all 0.3s ease'
          }}
        >
          {roomCode || '生成中...'}
        </div>
        <p style={{ fontSize: '0.9rem', color: '#666' }}>
          {roomCode ? '部屋番号をクリックしてコピーできます' : '部屋番号を生成中です'}
        </p>
      </div>

      {isWaiting && roomCode && (
        <>
          <div className="waiting">
            <span>相手の参加を待っています</span>
            <div className="loading"></div>
          </div>

          <p style={{ color: '#666', marginBottom: '30px' }}>
            相手が部屋に入るまでお待ちください
          </p>
        </>
      )}

      <button className="button" onClick={handleBack}>
        戻る
      </button>
    </div>
  );
}

export default CreateRoom; 