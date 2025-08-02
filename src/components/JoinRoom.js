import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import socketService from '../services/socketService';
import { sendRoomJoined, sendGameStarted } from '../services/analytics';

function JoinRoom() {
  const navigate = useNavigate();
  const [roomCode, setRoomCode] = useState('');
  const [error, setError] = useState('');
  const [isJoining, setIsJoining] = useState(false);

  const handleJoinRoom = async () => {
    if (roomCode.trim().length === 0) {
      setError('部屋番号を入力してください');
      return;
    }

    if (roomCode.trim().length !== 10) {
      setError('部屋番号は10桁で入力してください');
      return;
    }

    try {
      setIsJoining(true);
      setError('');
      
      // 接続処理（既存接続があっても新規接続を確実に行う）
      
      await socketService.connect();
      
      
      
      
      // 部屋に参加（gameStartedイベントを待つ）
      const result = await socketService.joinRoom(roomCode.trim());
      
      
      // Google Analytics: 部屋参加イベント
      sendRoomJoined(roomCode.trim());
      
      // Google Analytics: ゲーム開始イベント
      sendGameStarted(roomCode.trim());
      
      // ゲームページに遷移（isHost: falseで参加者として）
      navigate(`/game/${roomCode.trim()}`, { 
        state: { 
          roomCode: roomCode.trim(), 
          isHost: false,
          gameStarted: true,
          gameState: result.gameState
        } 
      });
      
    } catch (err) {
      setError(err.message || '部屋への参加に失敗しました');
      console.error('部屋参加エラー:', err);
      socketService.disconnect();
    } finally {
      setIsJoining(false);
    }
  };

  const handleBack = () => {
    navigate('/');
  };

  const handleInputChange = (e) => {
    setRoomCode(e.target.value.toUpperCase());
    setError('');
  };

  return (
    <div className="container">
      <h1 className="title">部屋に入る</h1>
      
      {error && (
        <div style={{ 
          backgroundColor: '#ffebee', 
          color: '#c62828', 
          padding: '15px', 
          borderRadius: '10px', 
          marginBottom: '20px' 
        }}>
          <p>{error}</p>
          {error.includes('サーバー') && (
            <p style={{ fontSize: '0.9rem', marginTop: '10px' }}>
              サーバーが起動しているか確認してください。
            </p>
          )}
        </div>
      )}
      
      <div style={{ marginBottom: '30px' }}>
        <h3 style={{ color: '#333', marginBottom: '15px' }}>部屋番号を入力</h3>
        <input
          type="text"
          className="input"
          placeholder="例: ABC123DEF4"
          value={roomCode}
          onChange={handleInputChange}
          maxLength={10}
          style={{ textTransform: 'uppercase' }}
          disabled={isJoining}
        />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        <button 
          className="button" 
          onClick={handleJoinRoom}
          disabled={isJoining}
        >
          {isJoining ? '入室中...' : '入室する'}
        </button>
        <button 
          className="button" 
          onClick={handleBack} 
          style={{ backgroundColor: '#6c757d' }}
          disabled={isJoining}
        >
          戻る
        </button>
      </div>
    </div>
  );
}

export default JoinRoom; 