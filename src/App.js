import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import TopPage from './components/TopPage';
import CreateRoom from './components/CreateRoom';
import JoinRoom from './components/JoinRoom';
import GameRoom from './components/GameRoom';
import { initGA, sendPageView } from './services/analytics';
import './App.css';

// ページビュートラッキング用コンポーネント
function PageTracker() {
  const location = useLocation();
  
  useEffect(() => {
    sendPageView(location.pathname);
  }, [location]);
  
  return null;
}

function App() {
  useEffect(() => {
    // Google Analytics初期化
    initGA();
  }, []);

  return (
    <Router>
      <div className="App">
        <PageTracker />
        <Routes>
          <Route path="/" element={<TopPage />} />
          <Route path="/create-room" element={<CreateRoom />} />
          <Route path="/join-room" element={<JoinRoom />} />
          <Route path="/game/:roomId" element={<GameRoom roomCode={null} isHost={false} />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App; 