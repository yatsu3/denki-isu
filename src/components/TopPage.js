import React from 'react';
import { useNavigate } from 'react-router-dom';
import AdBanner from './AdBanner';

function TopPage() {
  const navigate = useNavigate();

  const handleCreateRoom = () => {
    navigate('/create-room');
  };

  const handleJoinRoom = () => {
    navigate('/join-room');
  };

  return (
    <div className="container">
      <h1 className="title">⚡ 電気イスゲーム ⚡</h1>
      <p style={{ fontSize: '1.2rem', color: '#666', marginBottom: '40px' }}>
        水曜日のダウンタウンの企画でやっていた電気イスゲームをブラウザで遊べるようにしました。
      </p>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <button className="button" onClick={handleCreateRoom}>
          部屋を作る
        </button>
        <button className="button" onClick={handleJoinRoom}>
          部屋に入る
        </button>
      </div>
      
      {/* 広告バナー */}
      <div style={{ marginTop: '40px' }}>
        <AdBanner 
          adSlot="1234567890" // あなたの広告ユニットID
          style={{ 
            textAlign: 'center',
            margin: '20px 0'
          }}
        />
      </div>
    </div>
  );
}

export default TopPage; 