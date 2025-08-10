import React from "react";

const HowToPlay = () => {

  return (
    <div className="container">
      <h2 style={{ fontSize: '2rem', fontWeight: 'bold', color: '#ff6b6b', marginBottom: '20px', textShadow: '2px 2px 4px rgba(0,0,0,0.07)' }}>
        遊び方
      </h2>
      
      <div style={{ textAlign: 'left', color: '#444', fontSize: '1.15rem', lineHeight: 1.8 }}>
        <h3 style={{ fontSize: '1.4rem', fontWeight: 'bold', color: '#333', borderLeft: '4px solid #ff6b6b', paddingLeft: '15px', marginTop: '30px', marginBottom: '15px' }}>
          ゲームの目的
        </h3>
        <center><img src="/images/purpose.png" alt="ゲームの目的" style={{ width: '100%', maxWidth: '250px', marginBottom: '20px' }} /></center>
        <p style={{ marginBottom: '20px', paddingLeft: '15px' }}>
          電気イスゲームは、1vs1の心理戦ゲームです。相手の心理を読み、電流を流すイスと座るイスを選択し合い、8ラウンド終了時点でポイントが多い方が勝利します。また、相手に3回電流を食らわせた方も勝利となります。
        </p>

        <h3 style={{ fontSize: '1.4rem', fontWeight: 'bold', color: '#333', borderLeft: '4px solid #ff6b6b', paddingLeft: '15px', marginTop: '30px', marginBottom: '15px' }}>
          ゲームの流れ
        </h3>
        <center><img src="/images/map.png" alt="ゲームの流れ" style={{ width: '100%', maxWidth: '250px', marginBottom: '20px' }} /></center>
        <p style={{ marginBottom: '20px', paddingLeft: '15px' }}>
          1から12までの数字が書かれた12脚のイスが用意されています。各イスには対応する数字のポイントが設定されており、電流が仕掛けられていないイスに座ることができればそのポイントを獲得できます。
        </p>
        <p style={{ marginBottom: '20px', paddingLeft: '15px' }}>
          ゲームは表の攻撃フェーズと裏の攻撃フェーズに分かれています。表の攻撃では、プレイヤー1が電流を流すイスを選択し、プレイヤー2が座るイスを選択します。裏の攻撃では、プレイヤー2が電流を流すイスを選択し、プレイヤー1が座るイスを選択します。
        </p>
        <h3 style={{ fontSize: '1.4rem', fontWeight: 'bold', color: '#333', borderLeft: '4px solid #ff6b6b', paddingLeft: '15px', marginTop: '30px', marginBottom: '15px' }}>
          ポイントの獲得
        </h3>
        <center><img src="/images/point.png" alt="ポイントの獲得" style={{ width: '100%', maxWidth: '250px', marginBottom: '20px' }} /></center>
        <p style={{ marginBottom: '20px', paddingLeft: '15px' }}>
          電流が仕掛けられていないイスに座ることができたら、そのイスの数字が書かれているポイントを獲得できます。例えば、5番のイスに座れば5ポイントを獲得できます。
        </p>

        <h3 style={{ fontSize: '1.4rem', fontWeight: 'bold', color: '#333', borderLeft: '4px solid #ff6b6b', paddingLeft: '15px', marginTop: '30px', marginBottom: '15px' }}>
          電流のペナルティ
        </h3>
        <center><img src="/images/lose.png" alt="電流のペナルティ" style={{ width: '100%', maxWidth: '250px', marginBottom: '20px' }} /></center>
        <p style={{ marginBottom: '20px', paddingLeft: '15px' }}>
          電流が仕掛けられたイスに座ってしまった場合、それまでに獲得したポイントを全て失います。また、電流を食らった回数が記録され、3回電流を食らったプレイヤーは即座に敗北となります。
        </p>

        <h3 style={{ fontSize: '1.4rem', fontWeight: 'bold', color: '#333', borderLeft: '4px solid #ff6b6b', paddingLeft: '15px', marginTop: '30px', marginBottom: '15px' }}>
          勝利条件
        </h3>
        <center><img src="/images/winner.png" alt="勝利条件" style={{ width: '100%', maxWidth: '250px', marginBottom: '20px' }} /></center>
        <p style={{ marginBottom: '20px', paddingLeft: '15px' }}>
          8ラウンド終了時点でポイントが多い方が勝利します。また、相手に3回電流を食らわせた方も勝利となります。どちらかの条件を満たした時点でゲームが終了します。
        </p>

        <h3 style={{ fontSize: '1.4rem', fontWeight: 'bold', color: '#333', borderLeft: '4px solid #ff6b6b', paddingLeft: '15px', marginTop: '30px', marginBottom: '15px' }}>
          戦略のヒント
        </h3>
        <center><img src="/images/11772_color.png" alt="戦略のヒント" style={{ width: '100%', maxWidth: '200px', marginBottom: '20px' }} /></center>
        <p style={{ marginBottom: '20px', paddingLeft: '15px' }}>
          相手の選択パターンを観察し、心理を読み取ることが重要です。また、高ポイントのイスは魅力的ですが、相手も狙っている可能性が高いため、時には低ポイントのイスを選択することも有効な戦略となります。
        </p>
        <p style={{ marginBottom: '20px', paddingLeft: '15px' }}>
          ゲーム中はコメント機能を使って相手との心理戦を楽しむことができます。攻撃側のプレイヤーは、電流を流すイスを選択する際にコメントを送信できます。このコメントは相手に表示され、相手の選択に影響を与える可能性があります。例えば「高ポイントのイスは危険だよ」とコメントすることで、相手を低ポイントのイスに誘導することも戦略の一つです。
        </p>
      </div>
    </div>
  );
};

export default HowToPlay; 