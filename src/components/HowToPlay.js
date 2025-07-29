import React from "react";

const HowToPlay = () => (
  <div className="container">
    <h2 style={{ fontSize: '2rem', fontWeight: 'bold', color: '#ff6b6b', marginBottom: '20px', textShadow: '2px 2px 4px rgba(0,0,0,0.07)' }}>
      遊び方
    </h2>
    <p style={{ fontSize: '1.15rem', color: '#444', lineHeight: 1.8, textAlign: 'left' }}>
      <center>このゲームの遊び方を簡単に説明します。</center>
      <ul>
      <li>1から12までの数字が書かれた12脚のイスがあります</li>
          <li>仕掛け側は12脚のイスのどれか1つに電流を仕掛けます</li>
          <li>座る側は電流が仕掛けられていないイスに座ってください</li>
          <li>電流が仕掛けられていないイスに座ることができたらそのイスの数字が書かれているポイントを獲得できます</li>
          <li>電流に仕掛けられたイスに座ったら獲得したポイントを全て失います</li>
          <li>8ラウンド終了時点でポイントが多い方が勝利</li>
          <li>また相手に3回電流を食らわせた方も勝利</li>
      </ul>
    </p>
  </div>
);

export default HowToPlay; 