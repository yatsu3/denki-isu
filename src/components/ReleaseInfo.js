import React from 'react';

const ReleaseInfo = () => {
  return (
    <div className="container">
      <h2 style={{ fontSize: '2rem', fontWeight: 'bold', color: '#ff6b6b', marginBottom: '20px', textShadow: '2px 2px 4px rgba(0,0,0,0.07)' }}>
        リリース情報
      </h2>
      <ul style={{ color: '#444', fontSize: '1.15rem', lineHeight: 1.8, marginBottom: 32, textAlign: 'left' }}>
        <li>2024-07-01: リリース開始</li>
        <li>2024-07-11: リリースページ作成</li>
        <li>2025-07-19: ファビコン設定</li>
        <li>2025-07-30: ページデザインの修正</li>
        <li>2025-07-30: ポイント取得時と電気イスに座った時とゲーム終了時にBGMを再生</li>
        <li>2025-08-02: コメント送信処理の修正</li>
        <li>2025-08-05: 1人プレイモードの追加</li>
      </ul>
    </div>
  );
};

export default ReleaseInfo; 