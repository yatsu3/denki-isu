import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
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
      <div className="game-rules">
        <h3 style={{ color: '#333', marginBottom: '15px' }}>ゲームルール</h3>
        <ul style={{ textAlign: 'left', color: '#666', lineHeight: '1.6' }}>
          <li>1から12までの数字が書かれた12脚のイスがあります</li>
          <li>仕掛け側は12脚のイスのどれか1つに電流を仕掛けます</li>
          <li>座る側は電流が仕掛けられていないイスに座ってください</li>
          <li>電流が仕掛けられていないイスに座ることができたらそのイスの数字が書かれているポイントを獲得できます</li>
          <li>電流に仕掛けられたイスに座ったら獲得したポイントを全て失います</li>
          <li>8ラウンド終了時点でポイントが多い方が勝利</li>
          <li>また相手に3回電流を食らわせた方も勝利</li>
        </ul>
        <div style={{ marginTop: '8px', textAlign: 'right' }}>
          <Link to="/release-info" style={{ fontSize: '0.95rem', color: '#007bff', textDecoration: 'underline', background: 'rgba(255,255,255,0.8)', padding: '4px 10px', borderRadius: '8px' }}>
            リリース情報
          </Link>
        </div>
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