import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import socketService from '../services/socketService';
import './GameRoom.css';

const GameRoom = ({ roomCode: propRoomCode, isHost: propIsHost }) => {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  
  // propsまたはlocation.stateから値を取得（location.stateを優先）
  const actualRoomCode = propRoomCode || location.state?.roomCode || roomId;
  const actualIsHost = location.state?.isHost !== undefined ? location.state.isHost : (propIsHost !== undefined ? propIsHost : false);
  const initialGameStarted = location.state?.gameStarted || false;
  const initialGameState = location.state?.gameState || {
    currentPhase: 'waiting',
    currentRound: 1,
    player1Score: 0,
    player2Score: 0,
    player1Shocks: 0,
    player2Shocks: 0,
    chairs: Array(12).fill(null),
    player1Selection: null,
    player2Selection: null,
    player1Confirmed: false,
    player2Confirmed: false,
    currentTurn: 'player1'
  };
  
  const [gameState, setGameState] = useState(initialGameState);

  const [localSelectedChair, setLocalSelectedChair] = useState(null); // ローカル選択状態
  const [gameStarted, setGameStarted] = useState(initialGameStarted);
  const [connectionStatus, setConnectionStatus] = useState('connecting');
  const [showResult, setShowResult] = useState(false);
  const [resultData, setResultData] = useState(null);
  const [comment, setComment] = useState(''); // 自分のコメント
  const [opponentComment, setOpponentComment] = useState(''); // 相手のコメント
  const [commentInputVisible, setCommentInputVisible] = useState(true); // コメント入力欄の表示制御
  const [isSoundEnabled, setIsSoundEnabled] = useState(true); // 音量ON/OFF状態
  const [audioLoaded, setAudioLoaded] = useState(false); // 音声ファイル読み込み状態

  const [playerName] = useState(actualIsHost ? 'プレイヤー1' : 'プレイヤー2');
  const getPlayerType = useCallback(() => (actualIsHost ? 'player1' : 'player2'), [actualIsHost]);
  const [opponentDisconnected, setOpponentDisconnected] = useState(false);

  const prevIsCommentInputPhase = useRef(false);

  // 音声オブジェクトを事前に作成
  const audioRefs = useRef({
    shock: null,
    point: null,
    gameOver: null
  });

  // 音声ファイルを事前に読み込む関数
  const loadAudioFiles = useCallback(async () => {
    try {
      
      
      // 音声オブジェクトを作成（絶対パスで指定）
      const baseUrl = window.location.origin;
      
      
      audioRefs.current.shock = new Audio(`${baseUrl}/sounds/shock.mp3`);
      audioRefs.current.point = new Audio(`${baseUrl}/sounds/point.mp3`);
      audioRefs.current.gameOver = new Audio(`${baseUrl}/sounds/gameover.mp3`);
            
      // 音量を設定
      audioRefs.current.shock.volume = 0.7;
      audioRefs.current.point.volume = 0.7;
      audioRefs.current.gameOver.volume = 0.3;
      
      // エラーハンドリングを追加
      const handleError = (audio, name) => {
        audio.addEventListener('error', (e) => {
          console.error(`${name}音声ファイルの読み込みエラー:`, e);
        });
      };
      
      handleError(audioRefs.current.shock, 'shock');
      handleError(audioRefs.current.point, 'point');
      handleError(audioRefs.current.gameOver, 'gameOver');
      
      // 音声ファイルの読み込みを待つ（タイムアウト付き）
      const loadWithTimeout = (audio, name, timeout = 10000) => {
        return new Promise((resolve, reject) => {
          const timer = setTimeout(() => {
            console.warn(`${name}音声ファイルの読み込みがタイムアウトしました`);
            resolve(); // タイムアウトでも続行
          }, timeout);
          
          audio.addEventListener('canplaythrough', () => {
            clearTimeout(timer);
            
            resolve();
          }, { once: true });
          
          audio.addEventListener('error', () => {
            clearTimeout(timer);
            console.warn(`${name}音声ファイルの読み込みに失敗しました`);
            resolve(); // エラーでも続行
          }, { once: true });
          
          audio.load();
        });
      };
      
      await Promise.all([
        loadWithTimeout(audioRefs.current.shock, 'shock'),
        loadWithTimeout(audioRefs.current.point, 'point'),
        loadWithTimeout(audioRefs.current.gameOver, 'gameOver')
      ]);
      
      
      setAudioLoaded(true);
    } catch (error) {
      console.error('音声ファイルの読み込みに失敗:', error);
      setAudioLoaded(true); // エラーでも読み込み完了として扱う
    }
  }, []);

  // BGM再生用の関数（音量制御対応）
  const playShockSound = useCallback(() => {
    // 音量OFFの場合は再生しない
    if (!isSoundEnabled) {
      return;
    }
    if (!audioLoaded || !audioRefs.current.shock) {
      
      return;
    }
    try {
      // 音声を最初から再生
      audioRefs.current.shock.currentTime = 0;
      audioRefs.current.shock.play().catch(e => console.error('電流音の再生に失敗:', e));
    } catch (error) {
      console.error('電流音の再生エラー:', error);
    }
  }, [isSoundEnabled, audioLoaded]);

  const playPointSound = useCallback(() => {
    
    // 音量OFFの場合は再生しない
    if (!isSoundEnabled) {
      return;
    }
    if (!audioLoaded || !audioRefs.current.point) {
      
      return;
    }
    try {
      // 音声を最初から再生
      audioRefs.current.point.currentTime = 0;
      audioRefs.current.point.play().catch(e => console.error('ポイント音の再生に失敗:', e));
    } catch (error) {
      console.error('ポイント音の再生エラー:', error);
    }
  }, [isSoundEnabled, audioLoaded]);

  const playGameOverSound = useCallback(() => {
    
    // 音量OFFの場合は再生しない 
    if (!isSoundEnabled) {
      return;
    }
    if (!audioLoaded || !audioRefs.current.gameOver) {
      
      return;
    }
    try {
      // 音声を最初から再生
      audioRefs.current.gameOver.currentTime = 0;
      audioRefs.current.gameOver.play().catch(e => console.error('ゲーム終了音の再生に失敗:', e));
    } catch (error) {
      console.error('ゲーム終了音の再生エラー:', error);
    }
  }, [isSoundEnabled, audioLoaded]);

  // 音量制御ボタンのハンドラー
  const toggleSound = () => {
    setIsSoundEnabled(prev => {
      const newValue = !prev;
      
      
      // 音量ONに変更した時、音声を有効にする
      if (newValue && audioLoaded) {
        // ユーザーインタラクション後に音声を有効にするため、短い音を再生
        try {
          if (audioRefs.current.shock) {
            audioRefs.current.shock.currentTime = 0;
            audioRefs.current.shock.volume = 0;
            audioRefs.current.shock.play().then(() => {
              audioRefs.current.shock.pause();
              audioRefs.current.shock.volume = 0.7;
            }).catch(e => console.error('音声有効化のための再生に失敗:', e));
          }
        } catch (error) {
          console.error('音声有効化エラー:', error);
        }
      }
      
      return newValue;
    });
  };

  useEffect(() => {
    
    // コメント受信を監視（最初に設定）
    socketService.onCommentReceived((data) => {
      
      
      
      if (data && data.comment) {
        
        setOpponentComment(data.comment);
        
      }
      
    });

    // ゲーム状態更新を監視
    socketService.onGameStateUpdate((newState) => {
      
      
      
      
      // 新しいラウンドが始まったらローカル選択状態とコメント関連をリセット
      if (newState.currentRound !== gameState.currentRound) {
        setLocalSelectedChair(null);
        setComment(''); // 自分のコメントをリセット
        // opponentCommentのリセットは攻撃側になった瞬間だけ
      }
      
      // ターンが変わったらローカル選択状態とコメントをリセット
      if (newState.currentTurn !== gameState.currentTurn) {
        
        
        
        
        setLocalSelectedChair(null);
        setComment(''); // 自分のコメントをリセット
        // opponentCommentのリセットは攻撃側になった瞬間だけ
      }
      
      // フェーズが変わったらローカル選択状態とコメント関連をリセット
      if (newState.currentPhase !== gameState.currentPhase) {
        
        setLocalSelectedChair(null);
        setComment(''); // 自分のコメントをリセット
        // opponentCommentのリセットは攻撃側になった瞬間だけ
      }
      
      // 結果表示状態をリセット
      if (newState.currentPhase !== 'result') {
        
        setShowResult(false);
        setResultData(null);
      }
      
      setGameState(newState);
      
      // 自分のターンかどうかを判定
      const myPlayerType = actualIsHost ? 'player1' : 'player2';
      const wasMyTurn = gameState.currentTurn === myPlayerType;
      const isMyTurn = newState.currentTurn === myPlayerType;
      
      if (wasMyTurn !== isMyTurn) {
        
        
        
      }
      
      // 攻撃側になった瞬間だけopponentCommentをリセット
      const nowIsCommentInputPhase =
        (newState.currentPhase === 'omote' && getPlayerType() === 'player1') ||
        (newState.currentPhase === 'ura' && getPlayerType() === 'player2');
      if (!prevIsCommentInputPhase.current && nowIsCommentInputPhase) {
        
        setOpponentComment('');
      }
      prevIsCommentInputPhase.current = nowIsCommentInputPhase;
      
    });

    // ゲーム開始を監視
    socketService.onGameStarted((data) => {
      
      setGameStarted(true);
      setGameState(data.gameState);
    });

    // プレイヤー切断を監視
    socketService.onPlayerDisconnected(() => {
      
      setOpponentDisconnected(true);
    });

    // ゲーム終了を監視
    socketService.onGameOver((result) => {
      
      setGameState(prev => ({
        ...prev,
        gameOver: true,
        winner: result.winner,
        victoryReason: result.reason
      }));
      
      // ゲーム終了時にBGMを再生（音量チェック付き）
      if (isSoundEnabled) {
        playGameOverSound();
      }
    });

    // 結果表示を監視
    socketService.onShowResult((result) => {
      
      setShowResult(true);
      setResultData(result);
      
      // 結果に応じてBGMを再生（音量チェック付き）
      if (isSoundEnabled) {
        if (result.isShock) {
          playShockSound();
        } else {
          playPointSound();
        }
      }
    });

    // 結果表示終了を監視
    socketService.onHideResult(() => {
      
      setShowResult(false);
      setResultData(null);
    });

    // コメント受信を監視
    socketService.onCommentReceived((data) => {
      
      
      
      if (data && data.comment) {
        
        setOpponentComment(data.comment);
        
      }
    });
    
    
    
    const initializeGame = async () => {
      try {
        // 既存の接続があるかチェック
        if (!socketService.isSocketConnected()) {
          // Socket.IO接続が存在しないため、新規接続を開始
          await socketService.connect();
        }
        
        setConnectionStatus('connected');
        
        
      } catch (error) {
        console.error('GameRoom初期化エラー:', error);
        setConnectionStatus('error');
        alert('ゲームの初期化に失敗しました: ' + error.message);
      }
    };

    initializeGame();

    // 音声ファイルの読み込みを開始
    loadAudioFiles();

  }, [actualRoomCode, actualIsHost, initialGameStarted, initialGameState, propIsHost, location.state?.isHost, gameState.currentPhase, gameState.currentRound, playShockSound, playPointSound, playGameOverSound, isSoundEnabled, getPlayerType]); // eslint-disable-line react-hooks/exhaustive-deps

    // コメント入力フォームを表示する条件
  const isCommentInputPhase = useMemo(() => {
    return (gameState.currentPhase === 'omote' && getPlayerType() === 'player1') ||
           (gameState.currentPhase === 'ura' && getPlayerType() === 'player2');
  }, [gameState.currentPhase, getPlayerType]);

    // 攻撃側になったタイミングで入力欄を再表示（必ずトップレベルで呼ぶ）
  useEffect(() => {    
    if (isCommentInputPhase) {
      
      setCommentInputVisible(true);
    } else {
      
      setCommentInputVisible(false);
    }
  }, [isCommentInputPhase, gameState.currentTurn, commentInputVisible]); // eslint-disable-line react-hooks/exhaustive-deps

    // opponentCommentの値が変更されたときのデバッグログ
  useEffect(() => {
    
  }, [opponentComment]);


  const handleChairClick = (chairNumber) => {

    const myPlayerType = actualIsHost ? 'player1' : 'player2';
    const isMyTurn = gameState.currentTurn === myPlayerType;
    const isSelectionPhase = gameState.currentPhase === 'omote' || gameState.currentPhase === 'ura';

    if (!isMyTurn || !isSelectionPhase) {
      
      return;
    }

    // 既に選択済みの場合は選択解除
    if (localSelectedChair === chairNumber) {
      
      setLocalSelectedChair(null);
      socketService.selectChair(null, myPlayerType); // サーバーに選択解除を通知
      return;
    }

    // 新しい選択（1つのイスのみ選択可能）
    
    setLocalSelectedChair(chairNumber);
    
    
    socketService.selectChair(chairNumber, myPlayerType);
    
  };

  const handleConfirmSelection = () => {
        
    if (localSelectedChair === null) {
      
      return;
    }
    
    const playerType = actualIsHost ? 'player1' : 'player2';
    
    
    socketService.confirmSelection(playerType, comment);
    
    // ローカル選択状態をリセット
    setLocalSelectedChair(null);
    setComment(''); // コメントもリセット
    // 選択確定後は入力欄を非表示（次のターンで再表示される）
    setCommentInputVisible(false);
    
    
  };

  const checkIsMyTurn = () => {
    const myPlayerType = actualIsHost ? 'player1' : 'player2';
    return gameState.currentTurn === myPlayerType;
  };

  const canSelectChair = (chairNumber) => {
    const myPlayerType = actualIsHost ? 'player1' : 'player2';
    const isMyTurn = gameState.currentTurn === myPlayerType;
    const isSelectionPhase = gameState.currentPhase === 'omote' || gameState.currentPhase === 'ura';
    const chairIsEmpty = gameState.chairs[chairNumber] === null;
    const chairIsUsed = gameState.usedChairs && gameState.usedChairs.includes(chairNumber);
        
    return isMyTurn && isSelectionPhase && chairIsEmpty && !chairIsUsed;
  };

  const getCurrentPhaseText = () => {
    if (gameState.currentPhase === 'omote') {
      if (gameState.currentTurn === 'player1') {
        return 'プレイヤー1が電流を流すイスを選択中';
      } else {
        return 'プレイヤー2が座るイスを選択中';
      }
    } else if (gameState.currentPhase === 'ura') {
      if (gameState.currentTurn === 'player2') {
        return 'プレイヤー2が電流を流すイスを選択中';
      } else {
        return 'プレイヤー1が座るイスを選択中';
      }
    } else {
      return '選択中';
    }
  };

  const handleBackToTop = () => {
    socketService.disconnect();
    navigate('/');
  };

  if (connectionStatus === 'connecting') {
    return <div className="game-room">接続中...</div>;
  }

  if (connectionStatus === 'error') {
    return <div className="game-room">接続エラー</div>;
  }

  if (!gameStarted) {
    return (
      <div className="game-room">
        <h2>ゲーム待機中</h2>
        <p>部屋番号: {actualRoomCode}</p>
        <p>他のプレイヤーの参加を待っています...</p>
        <button onClick={handleBackToTop}>トップに戻る</button>
      </div>
    );
  }

  if (opponentDisconnected) {
    return (
      <div className="game-room">
        <h2>相手プレイヤーが切断しました</h2>
        <button onClick={handleBackToTop}>トップに戻る</button>
      </div>
    );
  }

  if (gameState.gameOver) {
    // X共有用のテキスト生成
    const shareText = `電気イスゲーム 結果\n勝者: ${gameState.winner}\nプレイヤー1: ${gameState.player1Score}点/電流${gameState.player1Shocks}回\nプレイヤー2: ${gameState.player2Score}点/電流${gameState.player2Shocks}回`;
    const shareUrl = encodeURIComponent(window.location.origin);
    const tweetUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${shareUrl}`;

    const handleShareX = () => {
      window.open(tweetUrl, '_blank', 'noopener');
    };

    return (
      <div className="game-room end-screen-bg">
        <div className="end-screen-card">
          <div className="winner-area">
            <span className="trophy">🏆</span>
            <h2 className="winner-title">勝者: <span className="winner-name">{gameState.winner}</span></h2>
            <p className="congrats">おめでとうございます！</p>
          </div>
          <div className="final-score-cards">
            <div className="score-card player1">
              <h3>プレイヤー1</h3>
              <p>ポイント: <span className="score-num">{gameState.player1Score}</span></p>
              <p>電流: {gameState.player1Shocks}回</p>
            </div>
            <div className="score-card player2">
              <h3>プレイヤー2</h3>
              <p>ポイント: <span className="score-num">{gameState.player2Score}</span></p>
              <p>電流: {gameState.player2Shocks}回</p>
            </div>
          </div>
          <div className="end-btn-row">
            <button className="x-share-btn" onClick={handleShareX} title="Xで結果を共有">
              <span className="x-logo">&#120143;</span> 結果をXで共有
            </button>
            <button className="button back-button end-btn" onClick={handleBackToTop}>トップに戻る</button>
          </div>
        </div>
      </div>
    );
  }

  // 結果表示中
  if (showResult && resultData) {
    return (
      <div className="game-container">
        <div className="result-display">
          <h2>結果発表</h2>
          <div className="result-content">
            <p>プレイヤー1が選択したイス: {resultData.player1Chair + 1}番</p>
            <p>プレイヤー2が選択したイス: {resultData.player2Chair + 1}番</p>
            
            {resultData.isShock ? (
              <div className="shock-result">
                <h3>⚡ 電流が流れました！ ⚡</h3>
                <p>{resultData.shockedPlayer === 'player1' ? 'プレイヤー1' : 'プレイヤー2'}が電流を食らいました！</p>
                <p className="score-reset">💥 {resultData.shockedPlayer === 'player1' ? 'プレイヤー1' : 'プレイヤー2'}の得点が0点にリセットされました！</p>
              </div>
            ) : (
              <div className="point-result">
                <h3>🎯 ポイント獲得！</h3>
                <p>{resultData.pointGain}ポイント獲得！</p>
              </div>
            )}
          </div>
          <p className="result-timer">3秒後に次のフェーズに移行します...</p>
        </div>
      </div>
    );
  }



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
          </div>
        </div>
      </div>
      {checkIsMyTurn() && (
          <p style={{ color: '#28a745', fontWeight: 'bold', marginTop: '5px' }}>
            あなたのターンです
          </p>
        )}


      <div className="score-board">
        <div className="player-score">
          <h3>プレイヤー1</h3>
          <p>ポイント: {gameState.player1Score}</p>
          <p>電流: {gameState.player1Shocks}回</p>
          <p className="player-status">
            {gameState.currentTurn === 'player1' ? '⚡ ターン中' : '待機中'}
          </p>
        </div>
        <div className="player-score">
          <h3>プレイヤー2</h3>
          <p>ポイント: {gameState.player2Score}</p>
          <p>電流: {gameState.player2Shocks}回</p>
          <p className="player-status">
            {gameState.currentTurn === 'player2' ? '⚡ ターン中' : '待機中'}
          </p>
        </div>
      </div>

      <div className="game-status">
        <p className="current-phase">{getCurrentPhaseText()}</p>
      </div>

      {/* コメント入力欄（攻撃側のみ、かつ未確定時のみ） */}
      {isCommentInputPhase && commentInputVisible && (
        <div className="comment-input-area" style={{ margin: '20px 0', textAlign: 'center' }}>
          <input
            type="text"
            value={comment}
            onChange={e => setComment(e.target.value)}
            placeholder="コメントを入力..."
            maxLength={100}
            style={{ width: '80%', padding: '8px', fontSize: '1rem' }}
          />
        </div>
      )}
      {!isCommentInputPhase && !!opponentComment && (
        <div className="comment-input-area" style={{ margin: '20px 0', textAlign: 'center' }}>
          <div className="opponent-comment" style={{ fontWeight: 'bold', fontSize: '1.2rem', background: '#fffbe6', border: '2px solid #ff9800', borderRadius: '10px', padding: '12px', color: '#d35400', boxShadow: '0 2px 8px rgba(255,152,0,0.15)' }}>
            相手のコメント: {opponentComment}
          </div>
        </div>
      )}

      <div className="chairs-container">
        <div className="chairs-grid">
          {Array.from({ length: 12 }, (_, i) => i).map(chairNumber => {
            const isAvailable = canSelectChair(chairNumber);
            const myTurn = checkIsMyTurn();
            const canClick = isAvailable && myTurn;
                        
            // 選択状態の判定（ローカル選択状態のみ表示）
            const isSelectedByLocal = localSelectedChair === chairNumber;
            const isSelected = isSelectedByLocal;
            const isUsed = gameState.usedChairs && gameState.usedChairs.includes(chairNumber);

            return (
              <div
                key={chairNumber}
                className={`chair ${isAvailable ? 'available' : 'unavailable'} ${isSelected ? 'selected' : ''} ${isUsed ? 'used' : ''}`}
                onClick={() => {
                  
                  if (canClick) {
                    handleChairClick(chairNumber);
                  }
                }}
                style={{
                  cursor: canClick ? 'pointer' : 'default',
                  opacity: canClick ? 1 : 0.6
                }}
                title={canClick ? `イス${chairNumber}を選択` : isUsed ? '使用済みのイス' : '選択できません'}
              >
                {chairNumber + 1}
              </div>
            );
          })}
        </div>
      </div>

      <div className="game-controls">
        {localSelectedChair !== null && (gameState.currentPhase === 'omote' || gameState.currentPhase === 'ura') && (
          <button 
            className="button confirm-button"
            onClick={handleConfirmSelection}
          >
            選択を確定
          </button>
        )}
        <button className="button back-button" onClick={handleBackToTop}>
          トップに戻る
        </button>
      </div>
    </div>
  );
};

export default GameRoom; 