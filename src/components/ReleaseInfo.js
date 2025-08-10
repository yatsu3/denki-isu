import React from 'react';

const ReleaseInfo = () => {
  console.log('PUBLIC_URL:', process.env.PUBLIC_URL);
  console.log('Full image path:', `${process.env.PUBLIC_URL}/images/battle.png`);
  
  return (
    <div className="container">
      <h2 style={{ fontSize: '2rem', fontWeight: 'bold', color: '#ff6b6b', marginBottom: '20px', textShadow: '2px 2px 4px rgba(0,0,0,0.07)' }}>
        リリース情報
      </h2>
      
      <div style={{ textAlign: 'left', color: '#444', fontSize: '1.15rem', lineHeight: 1.8 }}>
      <h3 style={{ fontSize: '1.4rem', fontWeight: 'bold', color: '#333', borderLeft: '4px solid #ff6b6b', paddingLeft: '15px', marginTop: '30px', marginBottom: '15px' }}>
          2025-08-10
        </h3>
        <p style={{ marginBottom: '20px', paddingLeft: '15px' }}>
リリース情報ページのデザインを修正しました。特に大きなアップデートがあったものに関しては画像付きで分かりやすいように表示しています。        </p>
        <h3 style={{ fontSize: '1.4rem', fontWeight: 'bold', color: '#333', borderLeft: '4px solid #ff6b6b', paddingLeft: '15px', marginTop: '30px', marginBottom: '15px' }}>
          2025-08-09
        </h3>
        <center><img src="./images/battle.png" alt="X（Twitter）募集" style={{ width: '100%', maxWidth: '400px', marginBottom: '20px' }} /></center>
        <p style={{ marginBottom: '20px', paddingLeft: '15px' }}>
          2人プレイモードでX（旧Twitter）で対戦相手を募るボタンを追加しました。ゲーム画面のレイアウト崩れ（イス選択時の白背景拡大）を修正し、PC・モバイル両方で安定した表示になりました。サウンド設定のデフォルトをOFFに変更し、部屋作成画面にTwitter共有ボタンを追加しました。また、戻るボタンを押した際の部屋退出処理も改善しました。
        </p>

        <h3 style={{ fontSize: '1.4rem', fontWeight: 'bold', color: '#333', borderLeft: '4px solid #ff6b6b', paddingLeft: '15px', marginTop: '30px', marginBottom: '15px' }}>
          2025-08-05
        </h3>
        <center><img src="./images/one.png" alt="1人プレイモード" style={{ width: '100%', maxWidth: '400px', marginBottom: '20px' }} /></center>
        <p style={{ marginBottom: '20px', paddingLeft: '15px' }}>
          1人プレイモード（AI対戦）を追加しました。AIの難易度を選択でき、一人でも楽しめるようになりました。
        </p>

        <h3 style={{ fontSize: '1.4rem', fontWeight: 'bold', color: '#333', borderLeft: '4px solid #ff6b6b', paddingLeft: '15px', marginTop: '30px', marginBottom: '15px' }}>
          2025-08-02
        </h3>
        <p style={{ marginBottom: '20px', paddingLeft: '15px' }}>
          コメント送信処理を修正し、より安定した通信を実現しました。
        </p>

        <h3 style={{ fontSize: '1.4rem', fontWeight: 'bold', color: '#333', borderLeft: '4px solid #ff6b6b', paddingLeft: '15px', marginTop: '30px', marginBottom: '15px' }}>
          2025-07-30
        </h3>
        <p style={{ marginBottom: '20px', paddingLeft: '15px' }}>
          ページデザインを修正し、ポイント取得時・電流演出・ゲーム終了時にBGMを再生するようになりました。ゲーム体験がより豊かになりました。
        </p>

        <h3 style={{ fontSize: '1.4rem', fontWeight: 'bold', color: '#333', borderLeft: '4px solid #ff6b6b', paddingLeft: '15px', marginTop: '30px', marginBottom: '15px' }}>
          2025-07-19
        </h3>
        <p style={{ marginBottom: '20px', paddingLeft: '15px' }}>
          ファビコンを設定し、ブラウザタブでの識別が容易になりました。
        </p>

        <h3 style={{ fontSize: '1.4rem', fontWeight: 'bold', color: '#333', borderLeft: '4px solid #ff6b6b', paddingLeft: '15px', marginTop: '30px', marginBottom: '15px' }}>
          2024-07-11
        </h3>
        <p style={{ marginBottom: '20px', paddingLeft: '15px' }}>
          リリースページを作成し、更新履歴を確認できるようになりました。
        </p>

        <h3 style={{ fontSize: '1.4rem', fontWeight: 'bold', color: '#333', borderLeft: '4px solid #ff6b6b', paddingLeft: '15px', marginTop: '30px', marginBottom: '15px' }}>
          2024-07-01
        </h3>
        <p style={{ marginBottom: '20px', paddingLeft: '15px' }}>
          電気イスゲームの初回リリースを行いました。2人対戦の心理戦ゲームとして、電流を流すイスと座るイスを選択し合うゲームです。
        </p>
      </div>
    </div>
  );
};

export default ReleaseInfo; 