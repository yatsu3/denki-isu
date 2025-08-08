import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import socketService from '../services/socketService';
import { sendRoomCreated, sendGameStarted } from '../services/analytics';

function CreateRoom() {
  const navigate = useNavigate();
  const [roomCode, setRoomCode] = useState('');
  const [isWaiting, setIsWaiting] = useState(false);
  const [isConnecting, setIsConnecting] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    initializeRoom();
    
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const initializeRoom = async () => {
    try {
      setIsConnecting(true);
      setError('');
      
      // 接続処理（既存接続があっても新規接続を確実に行う）
      
      await socketService.connect();
      
      
      // 接続完了後に部屋作成
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
      
      // Google Analytics: 部屋作成イベント
      sendRoomCreated(result.roomCode);
      
      
      
      // ゲーム開始を待機（gameStartedイベント）
      socketService.onGameStarted((data) => {
        
        
        // Google Analytics: ゲーム開始イベント
        sendGameStarted(result.roomCode);
        
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

  const shareOnTwitter = () => {
    if (!roomCode) return;
    
    const text = `⚡電気イスゲーム⚡\n\n部屋番号: ${roomCode}\n\n一緒に遊びませんか？\n\n${window.location.origin}\n\n#電気イスゲーム`;
    
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
    
    window.open(twitterUrl, '_blank', 'width=600,height=400');
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
        
        {roomCode && (
          <div style={{ marginTop: '15px', textAlign: 'center' }}>
            <button 
              onClick={shareOnTwitter}
              style={{
                backgroundColor: '#1da1f2',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                padding: '12px 20px',
                fontSize: '1rem',
                fontWeight: 'bold',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'all 0.3s ease',
                boxShadow: '0 2px 8px rgba(29, 161, 242, 0.3)'
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = '#1a8cd8';
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = '0 4px 12px rgba(29, 161, 242, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = '#1da1f2';
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = '0 2px 8px rgba(29, 161, 242, 0.3)';
              }}
              onTouchStart={(e) => {
                e.target.style.backgroundColor = '#1a8cd8';
                e.target.style.transform = 'scale(0.98)';
              }}
              onTouchEnd={(e) => {
                e.target.style.backgroundColor = '#1da1f2';
                e.target.style.transform = 'scale(1)';
              }}
            >
              X（旧Twitter）で対戦相手を募る
            </button>
          </div>
        )}
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