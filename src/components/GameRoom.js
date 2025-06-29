import React, { useState, useEffect } from 'react';
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

  const [selectedChair, setSelectedChair] = useState(null);
  const [localSelectedChair, setLocalSelectedChair] = useState(null); // ローカル選択状態
  const [isMyTurnState, setIsMyTurnState] = useState(false);
  const [gameStarted, setGameStarted] = useState(initialGameStarted);
  const [connectionStatus, setConnectionStatus] = useState('connecting');
  const [showResult, setShowResult] = useState(false);
  const [resultData, setResultData] = useState(null);

  const [playerName] = useState(actualIsHost ? 'プレイヤー1' : 'プレイヤー2');
  const [playerType] = useState(actualIsHost ? 'player1' : 'player2');
  const [opponentDisconnected, setOpponentDisconnected] = useState(false);

  useEffect(() => {
    console.log('GameRoom useEffect開始:', { 
      actualRoomCode, 
      actualIsHost,
      initialGameStarted,
      initialGameState: initialGameState.currentPhase,
      propIsHost,
      locationStateIsHost: location.state?.isHost
    });
    
    // 即座にイベントリスナーを設定（接続前に）
    console.log('イベントリスナーを設定開始');
    
    // ゲーム状態の更新を監視
    socketService.onGameStateUpdate((newState) => {
      console.log('=== GameRoom: gameStateUpdatedイベント受信開始 ===');
      console.log('受信した新しい状態:', newState);
      console.log('現在の状態:', gameState);
      
      // 新しいラウンドが始まったらローカル選択状態をリセット
      if (newState.currentRound !== gameState.currentRound) {
        console.log('新しいラウンド開始、ローカル選択状態をリセット');
        setLocalSelectedChair(null);
      }
      
      // ターンが変わったらローカル選択状態をリセット
      if (newState.currentTurn !== gameState.currentTurn) {
        console.log('=== ターン変更検出 ===');
        console.log('前のターン:', gameState.currentTurn);
        console.log('新しいターン:', newState.currentTurn);
        console.log('ローカル選択状態をリセット');
        setLocalSelectedChair(null);
      }
      
      // フェーズが変わったらローカル選択状態をリセット
      if (newState.currentPhase !== gameState.currentPhase) {
        console.log('フェーズ変更、ローカル選択状態をリセット');
        setLocalSelectedChair(null);
      }
      
      // 結果表示状態をリセット
      if (newState.currentPhase !== 'result') {
        console.log('結果表示状態をリセット');
        setShowResult(false);
        setResultData(null);
      }
      
      setGameState(newState);
      
      // 自分のターンかどうかを判定
      const myPlayerType = actualIsHost ? 'player1' : 'player2';
      const wasMyTurn = gameState.currentTurn === myPlayerType;
      const isMyTurn = newState.currentTurn === myPlayerType;
      setIsMyTurnState(isMyTurn);
      
      if (wasMyTurn !== isMyTurn) {
        console.log('=== 自分のターン状態変更 ===');
        console.log('前の状態:', wasMyTurn ? '自分のターン' : '相手のターン');
        console.log('新しい状態:', isMyTurn ? '自分のターン' : '相手のターン');
      }
      
      console.log('状態更新完了:', {
        newPhase: newState.currentPhase,
        newTurn: newState.currentTurn,
        newRound: newState.currentRound,
        isMyTurn: newState.currentTurn === myPlayerType
      });
      console.log('=== GameRoom: gameStateUpdatedイベント受信終了 ===');
    });

    // ゲーム開始を監視
    socketService.onGameStarted((data) => {
      console.log('GameRoom: ゲーム開始イベントを受信:', data);
      setGameStarted(true);
      setGameState(data.gameState);
    });

    // プレイヤー切断を監視
    socketService.onPlayerDisconnected(() => {
      console.log('GameRoom: プレイヤー切断を受信');
      setOpponentDisconnected(true);
    });

    // ゲーム終了を監視
    socketService.onGameOver((result) => {
      console.log('GameRoom: ゲーム終了を受信:', result);
      setGameState(prev => ({
        ...prev,
        gameOver: true,
        winner: result.winner,
        victoryReason: result.reason
      }));
    });

    // 結果表示を監視
    socketService.onShowResult((result) => {
      console.log('GameRoom: 結果表示を受信:', result);
      setShowResult(true);
      setResultData(result);
    });

    // 結果表示終了を監視
    socketService.onHideResult(() => {
      console.log('GameRoom: 結果表示終了を受信');
      setShowResult(false);
      setResultData(null);
    });
    
    console.log('イベントリスナー設定完了');
    
    const initializeGame = async () => {
      try {
        // 既存の接続があるかチェック
        if (!socketService.isSocketConnected()) {
          console.log('Socket.IO接続が存在しないため、新規接続を開始');
          await socketService.connect();
        } else {
          console.log('既存のSocket.IO接続を使用');
        }
        
        setConnectionStatus('connected');
        console.log('Socket.IO接続完了');
        
        // 接続状態を詳細にログ出力
        console.log('接続状態詳細:', {
          socketId: socketService.socket?.id,
          connected: socketService.socket?.connected,
          isConnected: socketService.isSocketConnected(),
          roomCode: socketService.getRoomCode(),
          isHost: socketService.getIsHost()
        });

        console.log('GameRoom初期化完了');
      } catch (error) {
        console.error('GameRoom初期化エラー:', error);
        setConnectionStatus('error');
        alert('ゲームの初期化に失敗しました: ' + error.message);
      }
    };

    initializeGame();

    // クリーンアップ
    return () => {
      console.log('GameRoomクリーンアップ');
      // 接続は切断しない（他のコンポーネントでも使用する可能性があるため）
    };
  }, [actualRoomCode, actualIsHost, initialGameStarted, initialGameState, propIsHost, location.state?.isHost]);

  const handleChairClick = (chairNumber) => {
    console.log('handleChairClick呼び出し:', {
      chairNumber,
      isMyTurnState,
      gameState: gameState.currentPhase,
      localSelectedChair
    });

    const myPlayerType = actualIsHost ? 'player1' : 'player2';
    const isMyTurn = gameState.currentTurn === myPlayerType;
    const isSelectionPhase = gameState.currentPhase === 'omote' || gameState.currentPhase === 'ura';

    if (!isMyTurn || !isSelectionPhase) {
      console.log('選択不可:', { isMyTurn, phase: gameState.currentPhase });
      return;
    }

    // 既に選択済みの場合は選択解除
    if (localSelectedChair === chairNumber) {
      console.log('選択解除:', chairNumber);
      setLocalSelectedChair(null);
      socketService.selectChair(null, myPlayerType); // サーバーに選択解除を通知
      return;
    }

    // 新しい選択（1つの椅子のみ選択可能）
    console.log('椅子選択処理開始:', chairNumber);
    setLocalSelectedChair(chairNumber);
    
    console.log('Socket.IO selectChair呼び出し前');
    socketService.selectChair(chairNumber, myPlayerType);
    console.log('Socket.IO selectChair呼び出し後');
  };

  const handleConfirmSelection = () => {
    console.log('=== handleConfirmSelection呼び出し開始 ===');
    console.log('現在の状態:', {
      localSelectedChair,
      currentPhase: gameState.currentPhase,
      currentTurn: gameState.currentTurn,
      playerType: actualIsHost ? 'player1' : 'player2'
    });
    
    if (localSelectedChair === null) {
      console.log('選択された椅子がないため、処理を中止');
      return;
    }
    
    const playerType = actualIsHost ? 'player1' : 'player2';
    console.log('選択確定処理開始:', { playerType, chairNumber: localSelectedChair });
    
    socketService.confirmSelection(playerType);
    
    // ローカル選択状態をリセット
    setLocalSelectedChair(null);
    console.log('ローカル選択状態をリセット');
    console.log('=== handleConfirmSelection呼び出し終了 ===');
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
    
    console.log('椅子選択条件チェック:', {
      chairNumber,
      myPlayerType,
      currentTurn: gameState.currentTurn,
      isMyTurn,
      currentPhase: gameState.currentPhase,
      isSelectionPhase,
      chairIsEmpty,
      chairIsUsed,
      canSelect: isMyTurn && isSelectionPhase && chairIsEmpty && !chairIsUsed
    });
    
    return isMyTurn && isSelectionPhase && chairIsEmpty && !chairIsUsed;
  };

  const getChairStatus = (chairNumber) => {
    const chair = gameState.chairs[chairNumber];
    if (chair === null) return 'empty';
    if (chair.player === 'player1') return 'player1';
    if (chair.player === 'player2') return 'player2';
    return 'empty';
  };

  const getCurrentPhaseText = () => {
    if (gameState.currentPhase === 'omote') {
      if (gameState.currentTurn === 'player1') {
        return '表の攻撃: プレイヤー1が電流を流す椅子を選択中';
      } else {
        return '表の攻撃: プレイヤー2が座る椅子を選択中';
      }
    } else if (gameState.currentPhase === 'ura') {
      if (gameState.currentTurn === 'player2') {
        return '裏の攻撃: プレイヤー2が電流を流す椅子を選択中';
      } else {
        return '裏の攻撃: プレイヤー1が座る椅子を選択中';
      }
    } else {
      return '選択中';
    }
  };

  const getConfirmButtonText = () => {
    if (gameState.currentPhase === 'omote') {
      return gameState.currentTurn === 'player1' ? 'プレイヤー1選択終了' : 'プレイヤー2選択終了';
    } else {
      return gameState.currentTurn === 'player2' ? 'プレイヤー2選択終了' : 'プレイヤー1選択終了';
    }
  };

  const canConfirm = () => {
    if (gameState.currentPhase === 'omote') {
      if (gameState.currentTurn === 'player1') {
        return gameState.chairs[gameState.player1Selection] !== null;
      } else {
        return gameState.chairs[gameState.player2Selection] !== null;
      }
    } else {
      if (gameState.currentTurn === 'player2') {
        return gameState.chairs[gameState.player2Selection] !== null;
      } else {
        return gameState.chairs[gameState.player1Selection] !== null;
      }
    }
  };

  const handleBackToTop = () => {
    socketService.disconnect();
    navigate('/');
  };

  // デバッグ情報を表示
  console.log('GameRoom デバッグ情報:', {
    actualRoomCode,
    actualIsHost,
    propIsHost,
    locationStateIsHost: location.state?.isHost,
    playerType,
    playerName,
    gameStarted,
    connectionStatus,
    locationState: location.state,
    socketServiceIsHost: socketService.getIsHost(),
    gameState: {
      currentPhase: gameState.currentPhase,
      currentTurn: gameState.currentTurn,
      chairs: gameState.chairs,
      player1Selection: gameState.player1Selection,
      player2Selection: gameState.player2Selection
    },
    isMyTurn: checkIsMyTurn(),
    canSelectChair0: canSelectChair(0),
    // ホスト/参加者判定の詳細
    hostDetermination: {
      locationStateDefined: location.state?.isHost !== undefined,
      propIsHostDefined: propIsHost !== undefined,
      finalResult: actualIsHost
    }
  });

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
        <button onClick={handleBackToTop}>トップページに戻る</button>
      </div>
    );
  }

  if (opponentDisconnected) {
    return (
      <div className="game-room">
        <h2>相手プレイヤーが切断しました</h2>
        <button onClick={handleBackToTop}>トップページに戻る</button>
      </div>
    );
  }

  if (gameState.gameOver) {
    // X共有用のテキスト生成
    const shareText = `電気椅子ゲーム 結果\n勝者: ${gameState.winner}\nプレイヤー1: ${gameState.player1Score}点/電流${gameState.player1Shocks}回\nプレイヤー2: ${gameState.player2Score}点/電流${gameState.player2Shocks}回`;
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
            <button className="button back-button end-btn" onClick={handleBackToTop}>トップページに戻る</button>
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
            <p>プレイヤー1が選択した椅子: {resultData.player1Chair + 1}番</p>
            <p>プレイヤー2が選択した椅子: {resultData.player2Chair + 1}番</p>
            
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
        <h2>電気椅子ゲーム</h2>
        <p>部屋番号: {actualRoomCode}</p>
        <p>ラウンド: {gameState.currentRound}/8</p>
        <p>フェーズ: {gameState.currentPhase === 'omote' ? '表の攻撃' : gameState.currentPhase === 'ura' ? '裏の攻撃' : '選択中'}</p>
      </div>

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
        <p className="current-player">あなた: {playerName}</p>
        {checkIsMyTurn() && (
          <p style={{ color: '#28a745', fontWeight: 'bold', marginTop: '10px' }}>
            ⚡ あなたのターンです ⚡
          </p>
        )}
        {/* デバッグ情報を表示 */}
        <div style={{ 
          backgroundColor: '#f8f9fa', 
          padding: '10px', 
          marginTop: '10px', 
          borderRadius: '5px', 
          fontSize: '0.8rem' 
        }}>
          <p>デバッグ: プレイヤー{playerType}, 現在のプレイヤー: {gameState.currentTurn}, 自分のターン: {checkIsMyTurn() ? 'はい' : 'いいえ'}</p>
          <p>フェーズ: {gameState.currentPhase === 'omote' ? '表の攻撃' : gameState.currentPhase === 'ura' ? '裏の攻撃' : gameState.currentPhase}</p>
          <p>選択状態: プレイヤー1選択: {gameState.player1Selection !== null ? gameState.player1Selection + 1 : 'なし'}, プレイヤー2選択: {gameState.player2Selection !== null ? gameState.player2Selection + 1 : 'なし'}</p>
          <p>確認状態: プレイヤー1確認: {gameState.player1Confirmed ? '済' : '未'}, プレイヤー2確認: {gameState.player2Confirmed ? '済' : '未'}</p>
          <p>利用可能椅子数: {gameState.chairs.filter(chair => chair === null).length}</p>
        </div>
      </div>

      <div className="chairs-container">
        <div className="chairs-grid">
          {Array.from({ length: 12 }, (_, i) => i).map(chairNumber => {
            const isAvailable = canSelectChair(chairNumber);
            const myTurn = checkIsMyTurn();
            const canClick = isAvailable && myTurn;
            
            // デバッグ: 最初の椅子の詳細情報をログ出力
            if (chairNumber === 0) {
              console.log('椅子0の詳細:', {
                chairNumber,
                isAvailable,
                myTurn,
                canClick,
                chairs: gameState.chairs
              });
            }
            
            // 選択状態の判定（ローカル選択状態のみ表示）
            const isSelectedByLocal = localSelectedChair === chairNumber;
            const isSelected = isSelectedByLocal;
            const isUsed = gameState.usedChairs && gameState.usedChairs.includes(chairNumber);

            return (
              <div
                key={chairNumber}
                className={`chair ${isAvailable ? 'available' : 'unavailable'} ${isSelected ? 'selected' : ''} ${isUsed ? 'used' : ''}`}
                onClick={() => {
                  console.log(`椅子${chairNumber}クリック試行:`, { canClick, isAvailable, myTurn });
                  if (canClick) {
                    handleChairClick(chairNumber);
                  }
                }}
                style={{
                  cursor: canClick ? 'pointer' : 'default',
                  opacity: canClick ? 1 : 0.6
                }}
                title={canClick ? `椅子${chairNumber}を選択` : isUsed ? '使用済みの椅子' : '選択できません'}
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