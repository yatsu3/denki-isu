import ReactGA from 'react-ga4';

// Google Analytics 4 の測定ID
const GA_MEASUREMENT_ID = process.env.REACT_APP_GA_MEASUREMENT_ID || 'G-XXXXXXXXXX';

// Google Analytics初期化
export const initGA = () => {
  if (GA_MEASUREMENT_ID && GA_MEASUREMENT_ID !== 'G-XXXXXXXXXX') {
    ReactGA.initialize(GA_MEASUREMENT_ID);
    console.log('Google Analytics初期化完了:', GA_MEASUREMENT_ID);
  } else {
    console.warn('Google Analytics測定IDが設定されていません');
  }
};

// ページビュー送信
export const sendPageView = (path) => {
  ReactGA.send({ hitType: "pageview", page: path });
  console.log('ページビュー送信:', path);
};

// カスタムイベント送信
export const sendEvent = (action, category, label, value) => {
  ReactGA.event({
    action: action,
    category: category,
    label: label,
    value: value
  });
  console.log('イベント送信:', { action, category, label, value });
};

// ゲーム関連のイベント送信
export const sendGameEvent = (action, details = {}) => {
  ReactGA.event({
    action: action,
    category: 'game',
    label: JSON.stringify(details)
  });
  console.log('ゲームイベント送信:', action, details);
};

// 部屋作成イベント
export const sendRoomCreated = (roomCode) => {
  sendGameEvent('room_created', { roomCode });
};

// 部屋参加イベント
export const sendRoomJoined = (roomCode) => {
  sendGameEvent('room_joined', { roomCode });
};

// ゲーム開始イベント
export const sendGameStarted = (roomCode) => {
  sendGameEvent('game_started', { roomCode });
};

// ゲーム終了イベント
export const sendGameEnded = (roomCode, winner, rounds) => {
  sendGameEvent('game_ended', { roomCode, winner, rounds });
};

// 椅子選択イベント
export const sendChairSelected = (roomCode, chairNumber, playerType) => {
  sendGameEvent('chair_selected', { roomCode, chairNumber, playerType });
}; 