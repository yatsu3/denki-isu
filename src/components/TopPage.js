import React from 'react';
import { useNavigate } from 'react-router-dom';

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
      <h1 className="title">⚡ 電気椅子ゲーム ⚡</h1>
      <p style={{ fontSize: '1.2rem', color: '#666', marginBottom: '40px' }}>
        水曜日のダウンタウン風 電気椅子ゲーム
      </p>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <button className="button" onClick={handleCreateRoom}>
          部屋を作る
        </button>
        <button className="button" onClick={handleJoinRoom}>
          部屋に入る
        </button>
      </div>
      
      <div style={{ marginTop: '40px', padding: '20px', backgroundColor: '#f8f9fa', borderRadius: '10px' }}>
        <h3 style={{ color: '#333', marginBottom: '15px' }}>ゲームルール</h3>
        <ul style={{ textAlign: 'left', color: '#666', lineHeight: '1.6' }}>
          <li>12脚の椅子から電流を流す椅子と座る椅子を選択</li>
          <li>一致すると電流を食らってポイント没収！</li>
          <li>一致しなければ椅子の番号がポイント獲得</li>
          <li>8ラウンド終了時点でポイントが多い方が勝利</li>
          <li>相手に3回電流を食らわせた方も勝利</li>
        </ul>
      </div>
    </div>
  );
}

export default TopPage; 