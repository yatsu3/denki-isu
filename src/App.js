import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import TopPage from './components/TopPage';
import CreateRoom from './components/CreateRoom';
import JoinRoom from './components/JoinRoom';
import GameRoom from './components/GameRoom';
import SinglePlayer from './components/SinglePlayer';
import ReleaseInfo from './components/ReleaseInfo';
import Header from './components/Header';
import HowToPlay from './components/HowToPlay';
import Terms from './components/Terms';
import Contact from './components/Contact';
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
        <Header />
        <PageTracker />
        <Routes>
          <Route path="/" element={<TopPage />} />
          <Route path="/how-to-play" element={<HowToPlay />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/create-room" element={<CreateRoom />} />
          <Route path="/join-room" element={<JoinRoom />} />
          <Route path="/single-player" element={<SinglePlayer />} />
          <Route path="/game/:roomId" element={<GameRoom roomCode={null} isHost={false} />} />
          <Route path="/release-info" element={<ReleaseInfo />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App; 