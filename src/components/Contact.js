import React from "react";

const Contact = () => {
  const handleTwitterClick = () => {
    window.open('https://twitter.com/yatsutako', '_blank', 'noopener');
  };

  return (
    <div className="container">
      <h2 style={{ fontSize: '2rem', fontWeight: 'bold', color: '#ff6b6b', marginBottom: '20px', textShadow: '2px 2px 4px rgba(0,0,0,0.07)' }}>
        問い合わせ
      </h2>
      <p style={{ fontSize: '1.15rem', color: '#444', lineHeight: 1.8, textAlign: 'left', marginBottom: '30px' }}>
        ご意見・ご要望・不具合報告などがありましたら、下記までご連絡ください。
      </p>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', alignItems: 'center' }}>
        <div style={{ 
          background: 'rgba(255, 255, 255, 0.95)', 
          padding: '20px', 
          borderRadius: '15px', 
          boxShadow: '0 5px 15px rgba(0, 0, 0, 0.1)',
          textAlign: 'center',
          minWidth: '300px'
        }}>
          <h3 style={{ color: '#333', marginBottom: '15px' }}>📧 メール</h3>
          <p style={{ fontSize: '1.1rem', color: '#555', marginBottom: '15px' }}>
            <b>メールアドレス：</b><br/>
            yatsutako3@gmail.com
          </p>
          <button 
            className="button"
            onClick={() => window.open('mailto:yatsutako3@gmail.com', '_blank')}
            style={{ 
              background: 'linear-gradient(45deg, #007bff, #0056b3)',
              color: 'white',
              border: 'none',
              padding: '12px 24px',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '1rem',
              fontWeight: 'bold',
              transition: 'all 0.3s ease'
            }}
          >
            📧 メールを送信
          </button>
        </div>

        <div style={{ 
          background: 'rgba(255, 255, 255, 0.95)', 
          padding: '20px', 
          borderRadius: '15px', 
          boxShadow: '0 5px 15px rgba(0, 0, 0, 0.1)',
          textAlign: 'center',
          minWidth: '300px'
        }}>
          <h3 style={{ color: '#333', marginBottom: '15px' }}>X（旧Twitter）</h3>
          <p style={{ fontSize: '1.1rem', color: '#555', marginBottom: '15px' }}>
            <b>アカウント：</b><br/>
            @yatsutako
          </p>
          <button 
            className="button"
            onClick={handleTwitterClick}
            style={{ 
              background: 'linear-gradient(45deg, #1da1f2, #0d8bd9)',
              color: 'white',
              border: 'none',
              padding: '12px 24px',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '1rem',
              fontWeight: 'bold',
              transition: 'all 0.3s ease'
            }}
          >
            X（旧Twitter）で連絡
          </button>
        </div>
      </div>
    </div>
  );
};

export default Contact; 