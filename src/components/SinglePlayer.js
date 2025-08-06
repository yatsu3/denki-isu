import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './GameRoom.css';

const SinglePlayer = () => {
  const navigate = useNavigate();
  const [gameState, setGameState] = useState({
    currentPhase: 'waiting', // waiting, attack, defense, result
    currentRound: 1,
    currentTurn: 1,
    playerScore: 0,
    aiScore: 0,
    playerShockCount: 0,
    aiShockCount: 0,
    usedChairs: [],
    gameHistory: []
  });

  const [selectedChair, setSelectedChair] = useState(null);
  const [result, setResult] = useState(null);
  const [isSoundEnabled, setIsSoundEnabled] = useState(true);
  const [audioLoaded, setAudioLoaded] = useState(false);
  const audioRefs = useRef({});

  // AIの難易度設定
  const [aiDifficulty, setAiDifficulty] = useState('normal'); // easy, normal, hard

  // 音声ファイルの読み込み
  const loadAudioFiles = useCallback(() => {
    const audioFiles = [
      { name: 'shock', path: '/sounds/shock.mp3' },
      { name: 'point', path: '/sounds/point.mp3' },
      { name: 'gameover', path: '/sounds/gameover.mp3' }
    ];

    const loadPromises = audioFiles.map(({ name, path }) => {
      return new Promise((resolve, reject) => {
        const audio = new Audio(path);
        audio.volume = 0.5;
        audio.preload = 'auto';
        
        const timeout = setTimeout(() => {
          reject(new Error(`Audio load timeout: ${name}`));
        }, 5000);

        audio.addEventListener('canplaythrough', () => {
          clearTimeout(timeout);
          audioRefs.current[name] = audio;
          resolve();
        });

        audio.addEventListener('error', () => {
          clearTimeout(timeout);
          reject(new Error(`Audio load error: ${name}`));
        });
      });
    });

    Promise.all(loadPromises)
      .then(() => {
        setAudioLoaded(true);
      })
      .catch((error) => {
        console.warn('Audio loading failed:', error);
        setAudioLoaded(true); // 音声がなくてもゲームは続行
      });
  }, []);

  useEffect(() => {
    loadAudioFiles();
  }, [loadAudioFiles]);

  // 音声再生関数
  const playShockSound = useCallback(() => {
    if (isSoundEnabled && audioLoaded && audioRefs.current.shock) {
      const audio = audioRefs.current.shock;
      audio.currentTime = 0;
      audio.play().catch(() => {});
    }
  }, [isSoundEnabled, audioLoaded]);

  const playPointSound = useCallback(() => {
    if (isSoundEnabled && audioLoaded && audioRefs.current.point) {
      const audio = audioRefs.current.point;
      audio.currentTime = 0;
      audio.play().catch(() => {});
    }
  }, [isSoundEnabled, audioLoaded]);

  const playGameOverSound = useCallback(() => {
    if (isSoundEnabled && audioLoaded && audioRefs.current.gameover) {
      const audio = audioRefs.current.gameover;
      audio.currentTime = 0;
      audio.play().catch(() => {});
    }
  }, [isSoundEnabled, audioLoaded]);

  // 音声ON/OFF切り替え
  const toggleSound = () => {
    setIsSoundEnabled(!isSoundEnabled);
  };

  // AIの行動ロジック
  const getAIChoice = useCallback((phase, availableChairs, difficulty) => {
    const random = Math.random();
    
    switch (difficulty) {
      case 'easy':
        // 簡単: ランダム選択
        return availableChairs[Math.floor(Math.random() * availableChairs.length)];
      
      case 'hard':
        // 難しい: 高度な戦略
        if (phase === 'attack') {
          // 攻撃時: プレイヤーの選択パターンを分析
          const playerHistory = gameState.gameHistory.filter(h => h.phase === 'defense');
          if (playerHistory.length > 0) {
            const lastPlayerChoice = playerHistory[playerHistory.length - 1].playerChoice;
            // プレイヤーが最後に選んだイスの隣を狙う
            const adjacentChairs = [lastPlayerChoice - 1, lastPlayerChoice + 1].filter(
              chair => chair >= 1 && chair <= 12 && availableChairs.includes(chair)
            );
            if (adjacentChairs.length > 0 && random < 0.7) {
              return adjacentChairs[Math.floor(Math.random() * adjacentChairs.length)];
            }
          }
        } else {
          // 防御時: プレイヤーの攻撃パターンを分析
          const playerAttackHistory = gameState.gameHistory.filter(h => h.phase === 'attack');
          if (playerAttackHistory.length > 0) {
            const lastPlayerAttack = playerAttackHistory[playerAttackHistory.length - 1].playerChoice;
            // プレイヤーが最後に攻撃したイスを避ける
            if (availableChairs.includes(lastPlayerAttack) && random < 0.3) {
              const safeChairs = availableChairs.filter(chair => chair !== lastPlayerAttack);
              if (safeChairs.length > 0) {
                return safeChairs[Math.floor(Math.random() * safeChairs.length)];
              }
            }
          }
        }
        // フォールバック: ランダム選択
        return availableChairs[Math.floor(Math.random() * availableChairs.length)];
      
      case 'normal':
      default:
        // 普通: 基本的な戦略
        if (phase === 'attack') {
          // 攻撃時: 中央付近を狙う傾向
          const centerChairs = availableChairs.filter(chair => chair >= 5 && chair <= 8);
          if (centerChairs.length > 0 && random < 0.6) {
            return centerChairs[Math.floor(Math.random() * centerChairs.length)];
          }
        } else {
          // 防御時: 端のイスを選ぶ傾向
          const edgeChairs = availableChairs.filter(chair => chair <= 3 || chair >= 10);
          if (edgeChairs.length > 0 && random < 0.5) {
            return edgeChairs[Math.floor(Math.random() * edgeChairs.length)];
          }
        }
        return availableChairs[Math.floor(Math.random() * availableChairs.length)];
    }
  }, [gameState.gameHistory]);

  // ゲーム開始
  const startGame = () => {
    setGameState(prev => ({
      ...prev,
      currentPhase: 'attack',
      currentRound: 1,
      currentTurn: 1,
      playerScore: 0,
      aiScore: 0,
      playerShockCount: 0,
      aiShockCount: 0,
      usedChairs: [],
      gameHistory: []
    }));
  };

  // イス選択
  const selectChair = (chairNumber) => {
    if (gameState.usedChairs.includes(chairNumber)) return;
    
    setSelectedChair(chairNumber);
  };

  // 選択を確定
  const handleConfirmSelection = () => {
    if (selectedChair === null) return;
    
    if (gameState.currentPhase === 'attack') {
      // プレイヤーが攻撃側
      handlePlayerAttack(selectedChair);
    } else if (gameState.currentPhase === 'defense') {
      // プレイヤーが防御側
      handlePlayerDefense(selectedChair);
    }
  };

  // プレイヤーの攻撃処理
  const handlePlayerAttack = (playerAttackChoice) => {
    const availableChairs = Array.from({ length: 12 }, (_, i) => i + 1)
      .filter(chair => !gameState.usedChairs.includes(chair));
    
    // AIの防御選択
    const aiDefenseChoice = getAIChoice('defense', availableChairs, aiDifficulty);
    
    // 結果判定
    const isHit = playerAttackChoice === aiDefenseChoice;
    const aiPoints = isHit ? 0 : aiDefenseChoice;
    
    // 結果を保存
    const roundResult = {
      phase: 'attack',
      playerChoice: playerAttackChoice,
      aiChoice: aiDefenseChoice,
      isHit,
      aiPoints,
      round: gameState.currentRound
    };
    
    setGameState(prev => ({
      ...prev,
      gameHistory: [...prev.gameHistory, roundResult],
      aiScore: isHit ? 0 : prev.aiScore + aiPoints, // 電流に引っかかった場合は0にリセット
      aiShockCount: isHit ? prev.aiShockCount + 1 : prev.aiShockCount,
      usedChairs: isHit ? prev.usedChairs : [...prev.usedChairs, aiDefenseChoice], // 電流に引っかかった場合は追加しない
      currentPhase: 'defense'
    }));
    
    setResult({
      phase: 'attack',
      playerChoice: playerAttackChoice,
      aiChoice: aiDefenseChoice,
      isHit,
      points: aiPoints
    });
    
    // 音声再生
    if (isHit) {
      playShockSound();
    } else {
      playPointSound();
    }
    
    // 3秒後に次のフェーズへ
    setTimeout(() => {
      setResult(null);
      setSelectedChair(null);
    }, 3000);
  };

  // プレイヤーの防御処理
  const handlePlayerDefense = (playerDefenseChoice) => {
    const availableChairs = Array.from({ length: 12 }, (_, i) => i + 1)
      .filter(chair => !gameState.usedChairs.includes(chair));
    
    // AIの攻撃選択
    const aiAttackChoice = getAIChoice('attack', availableChairs, aiDifficulty);
    
    // 結果判定
    const isHit = aiAttackChoice === playerDefenseChoice;
    const playerPoints = isHit ? 0 : playerDefenseChoice;
    
    // 結果を保存
    const roundResult = {
      phase: 'defense',
      playerChoice: playerDefenseChoice,
      aiChoice: aiAttackChoice,
      isHit,
      playerPoints,
      round: gameState.currentRound
    };
    
    setGameState(prev => ({
      ...prev,
      gameHistory: [...prev.gameHistory, roundResult],
      playerScore: isHit ? 0 : prev.playerScore + playerPoints, // 電流に引っかかった場合は0にリセット
      playerShockCount: isHit ? prev.playerShockCount + 1 : prev.playerShockCount,
      usedChairs: isHit ? prev.usedChairs : [...prev.usedChairs, playerDefenseChoice], // 電流に引っかかった場合は追加しない
      currentRound: prev.currentRound + 1,
      currentPhase: prev.currentRound >= 8 ? 'gameOver' : 'attack'
    }));
    
    setResult({
      phase: 'defense',
      playerChoice: playerDefenseChoice,
      aiChoice: aiAttackChoice,
      isHit,
      points: playerPoints
    });
    
    // 音声再生
    if (isHit) {
      playShockSound();
    } else {
      playPointSound();
    }
    
    // 3秒後に次のフェーズへ
    setTimeout(() => {
      setResult(null);
      setSelectedChair(null);
    }, 3000);
  };

  // ゲーム終了判定
  const isGameOver = gameState.currentRound > 8 || 
                    gameState.playerShockCount >= 3 || 
                    gameState.aiShockCount >= 3 ||
                    gameState.playerScore >= 40 ||
                    gameState.aiScore >= 40 ||
                    gameState.usedChairs.length >= 11; // 残り椅子が1つになったら終了

  // 勝利判定
  // eslint-disable-next-line
  const getWinner = () => {
    if (gameState.playerShockCount >= 3) return 'AI';
    if (gameState.aiShockCount >= 3) return 'あなた';
    if (gameState.playerScore >= 40) return 'あなた';
    if (gameState.aiScore >= 40) return 'AI';
    if (gameState.usedChairs.length >= 11) {
      // 残り椅子が1つの場合、得点の高い方が勝利
      if (gameState.playerScore > gameState.aiScore) return 'あなた';
      if (gameState.aiScore > gameState.playerScore) return 'AI';
      return gameState.playerShockCount < gameState.aiShockCount ? 'あなた' : 'AI';
    }
    if (gameState.currentRound > 8) {
      if (gameState.playerScore > gameState.aiScore) return 'あなた';
      if (gameState.aiScore > gameState.playerScore) return 'AI';
      return gameState.playerShockCount < gameState.aiShockCount ? 'あなた' : 'AI';
    }
    return null;
  };

  // ゲーム終了時の処理
  useEffect(() => {
    if (isGameOver) {
      const winner = getWinner();
      if (winner) {
        playGameOverSound();
      }
    }
  }, [isGameOver, getWinner, playGameOverSound]);

  // ゲーム終了画面
  if (isGameOver) {
    const winner = getWinner();
    
    return (
      <div className="game-room end-screen-bg">
        <div className="end-screen-card">
          <div className="winner-area">
            <span className="trophy">🏆</span>
            <h2 className="winner-title">勝者: <span className="winner-name">{winner}</span></h2>
            {winner === 'あなた' && <p className="congrats">おめでとうございます！</p>}
          </div>
          <div className="final-score-cards">
            <div className="score-card player1">
              <h3>あなた</h3>
              <p>ポイント: <span className="score-num">{gameState.playerScore}</span></p>
              <p>電流: {gameState.playerShockCount}回</p>
            </div>
            <div className="score-card player2">
              <h3>AI</h3>
              <p>ポイント: <span className="score-num">{gameState.aiScore}</span></p>
              <p>電流: {gameState.aiShockCount}回</p>
            </div>
          </div>
          <div className="end-btn-row">
            <button className="button back-button end-btn" onClick={() => navigate('/')}>トップに戻る</button>
            <button className="button end-btn" onClick={startGame}>もう一度遊ぶ</button>
          </div>
        </div>
      </div>
    );
  }

  // ゲーム開始前の画面
  if (gameState.currentPhase === 'waiting') {
    return (
      <div className="game-room">
        <h2>1人プレイモード</h2>
        <div className="difficulty-selector">
          <h3>AIの難易度を選択してください</h3>
          <div className="difficulty-buttons">
            <button 
              className={`difficulty-button ${aiDifficulty === 'easy' ? 'selected' : ''}`}
              onClick={() => setAiDifficulty('easy')}
            >
              🟢 簡単
            </button>
            <button 
              className={`difficulty-button ${aiDifficulty === 'normal' ? 'selected' : ''}`}
              onClick={() => setAiDifficulty('normal')}
            >
              🟡 普通
            </button>
            <button 
              className={`difficulty-button ${aiDifficulty === 'hard' ? 'selected' : ''}`}
              onClick={() => setAiDifficulty('hard')}
            >
              🔴 難しい
            </button>
          </div>
        </div>
        <div className="action-buttons">
          <button className="button" onClick={startGame}>
            ゲーム開始
          </button>
          <button className="button secondary-button" onClick={() => navigate('/')}>
            トップに戻る
          </button>
        </div>
      </div>
    );
  }

  // 結果表示中
  if (result) {
    return (
      <div className="game-container">
        <div className="result-display">
          <h2>結果発表</h2>
          <div className="result-content">
            {result.phase === 'attack' ? (
              <>
                <p>あなたが電流を流したイス: {result.playerChoice}番</p>
                <p>AIが座ったイス: {result.aiChoice}番</p>
              </>
            ) : (
              <>
                <p>AIが電流を流したイス: {result.aiChoice}番</p>
                <p>あなたが座ったイス: {result.playerChoice}番</p>
              </>
            )}
            
            {result.isHit ? (
              <div className="shock-result">
                <h3>⚡ 電流が流れました！ ⚡</h3>
                {result.phase === 'attack' ? (
                  <>
                    <p>AIが電流を食らいました！</p>
                    <p className="score-reset">💥 AIの得点が0点にリセットされました！</p>
                  </>
                ) : (
                  <>
                    <p>あなたが電流を食らいました！</p>
                    <p className="score-reset">💥 あなたの得点が0点にリセットされました！</p>
                  </>
                )}
              </div>
            ) : (
              <div className="point-result">
                <h3>🎯 ポイント獲得！</h3>
                {result.phase === 'attack' ? (
                  <>
                    <p>AIが安全なイスに座りました！</p>
                    <p className="point-gain">🎯 AIは{result.points}ポイントを獲得しました！</p>
                  </>
                ) : (
                  <>
                    <p>あなたが安全なイスに座りました！</p>
                    <p className="point-gain">🎯 あなたは{result.points}ポイントを獲得しました！</p>
                  </>
                )}
              </div>
            )}
          </div>
          <p className="result-timer">3秒後に次のフェーズに移行します...</p>
        </div>
      </div>
    );
  }

  // メインゲーム画面
  return (
    <div className="game-container">
      <div className="game-header">
        <div className="header-top">
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <div style={{ 
              background: 'rgba(255, 255, 255, 0.9)', 
              padding: '8px 12px', 
              borderRadius: '8px',
              fontSize: '0.9rem',
              fontWeight: 'bold',
              color: '#333',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
            }}>
              ラウンド: {gameState.currentRound}/8
            </div>
            <button 
              className="sound-toggle-btn"
              onClick={toggleSound}
              title={isSoundEnabled ? '音量OFF' : '音量ON'}
            >
              {isSoundEnabled ? '🔊' : '🔇'}
            </button>
            <p className="current-player">AI難易度: {
          aiDifficulty === 'easy' ? '簡単' : 
          aiDifficulty === 'normal' ? '普通' : '難しい'
        }</p>
          </div>
        </div>
      </div>
      <p style={{ color: '#28a745', fontWeight: 'bold', marginBottom: '10px' }}>
      {gameState.currentPhase === 'attack' ? '電流を流すイスを選択してください' : '座るイスを選択してください'}
      </p>

      <div className="score-board">
        <div className="player-score">
          <h3>あなた</h3>
          <p>ポイント: {gameState.playerScore}</p>
          <p>電流: {gameState.playerShockCount}回</p>
          <p className="player-status">
            {gameState.currentPhase === 'attack' ? '電流を流す' : '椅子に座る'}
          </p>
        </div>
        <div className="player-score">
          <h3>AI</h3>
          <p>ポイント: {gameState.aiScore}</p>
          <p>電流: {gameState.aiShockCount}回</p>
          <p className="player-status">
            {gameState.currentPhase === 'attack' ? '椅子に座る' : '電流を流す'}
          </p>
        </div>
      </div>

      {/* <div className="game-status">
        <p className="current-phase">
          {gameState.currentPhase === 'attack' ? '電流を流すイスを選択してください' : '座るイスを選択してください'}
        </p>
      </div> */}

      <div className="chairs-container">
        <div className="chairs-grid">
          {Array.from({ length: 12 }, (_, i) => i + 1).map(chairNumber => {
            const isAvailable = !gameState.usedChairs.includes(chairNumber);
            const isSelected = selectedChair === chairNumber;
            const isUsed = gameState.usedChairs.includes(chairNumber);

            return (
              <div
                key={chairNumber}
                className={`chair ${isAvailable ? 'available' : 'unavailable'} ${isSelected ? 'selected' : ''} ${isUsed ? 'used' : ''}`}
                onClick={() => {
                  if (isAvailable) {
                    selectChair(chairNumber);
                  }
                }}
                style={{
                  cursor: isAvailable ? 'pointer' : 'default',
                  opacity: isAvailable ? 1 : 0.6
                }}
                title={isAvailable ? `イス${chairNumber}を選択` : isUsed ? '使用済みのイス' : '選択できません'}
              >
                {chairNumber}
              </div>
            );
          })}
        </div>
      </div>

      <div className="game-controls">
        {selectedChair !== null && (gameState.currentPhase === 'attack' || gameState.currentPhase === 'defense') && (
          <button 
            className="button confirm-button"
            onClick={handleConfirmSelection}
          >
            選択を確定
          </button>
        )}
        <button className="button back-button" onClick={() => navigate('/')}>
          トップに戻る
        </button>
      </div>
    </div>
  );
};

export default SinglePlayer; 