import React from 'react';
import { Link } from 'react-router-dom';

const ReleaseInfo = () => {
  return (
    <div style={{ maxWidth: 600, margin: '40px auto', background: '#fff', borderRadius: 12, boxShadow: '0 2px 12px rgba(0,0,0,0.08)', padding: 32 }}>
      <h2 style={{ color: '#333', marginBottom: 24 }}>リリース情報</h2>
      <ul style={{ color: '#444', fontSize: '1.05rem', lineHeight: 1.7, marginBottom: 32 }}>
        <li>2024-07-01: リリース開始</li>
        <li>2024-07-11: リリースページ作成</li>
        <li>2025-07-19: ファビコン設定</li>
      </ul>
      <div style={{ textAlign: 'right' }}>
        <Link to="/" style={{ color: '#007bff', textDecoration: 'underline', fontSize: '1rem' }}>トップページに戻る</Link>
      </div>
    </div>
  );
};

export default ReleaseInfo; 