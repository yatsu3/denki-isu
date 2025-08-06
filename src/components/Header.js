import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "./Header.css";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  // メニューが開いている時に背景をタップして閉じる
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isMenuOpen && !event.target.closest('.nav-container')) {
        closeMenu();
      }
    };

    if (isMenuOpen) {
      document.addEventListener('click', handleClickOutside);
      // スクロールを無効化
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.removeEventListener('click', handleClickOutside);
      document.body.style.overflow = 'unset';
    };
  }, [isMenuOpen]);

  return (
    <header className="header">
      <nav className="nav">
        <div className="nav-container">
          {/* ハンバーガーメニューボタン */}
          <button 
            className={`hamburger ${isMenuOpen ? 'active' : ''}`}
            onClick={toggleMenu}
            aria-label="メニューを開く"
          >
            <span></span>
            <span></span>
            <span></span>
          </button>

          {/* ナビゲーションメニュー */}
          <ul className={`nav-list ${isMenuOpen ? 'active' : ''}`}>
            <li><Link to="/" onClick={closeMenu}>トップ</Link></li>
            <li><Link to="/how-to-play" onClick={closeMenu}>遊び方</Link></li>
            <li><Link to="/contact" onClick={closeMenu}>問い合わせ</Link></li>
            <li><Link to="/release-info" onClick={closeMenu}>リリース情報</Link></li>
            <li><Link to="/terms" onClick={closeMenu}>利用規約</Link></li>
          </ul>
        </div>
      </nav>
    </header>
  );
};

export default Header; 