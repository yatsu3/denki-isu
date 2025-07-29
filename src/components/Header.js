import React from "react";
import { Link } from "react-router-dom";
import "./Header.css";

const Header = () => (
  <header className="header">
    <nav className="nav">
      <ul className="nav-list">
        <li><Link to="/">トップ</Link></li>
        <li><Link to="/how-to-play">遊び方</Link></li>
        <li><Link to="/terms">利用規約</Link></li>
        <li><Link to="/contact">問い合わせ</Link></li>
        <li><Link to="/release-info">リリース情報</Link></li>
      </ul>
    </nav>
  </header>
);

export default Header; 