import React, { useState } from 'react';
import logoImg from '../assets/logo.jpg';
import { Sun, Moon, LayoutDashboard, Menu, X } from 'lucide-react';

export default function Navbar({ currentView, setView, theme, toggleTheme, user, handleLogout }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navigateTo = (viewName) => {
    setView(viewName);
    setIsMenuOpen(false); // Auto-close menu on mobile after navigation
  };

  return (
    <header className="header">
      <div className="container nav-container">
        <a href="#" className="logo-link" onClick={() => navigateTo('home')}>
          <img 
            src={logoImg} 
            alt="Umaylam Logo" 
            style={{ 
              width: '42px', 
              height: '42px', 
              borderRadius: '50%', 
              objectFit: 'cover',
              border: '2px solid var(--border-color)',
              boxShadow: 'var(--shadow-sm)'
            }} 
          />
          <span>Umaylam</span>
          <span className="logo-sub">Bengaluru</span>
        </a>

        {/* Right Nav Action Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          
          {/* Main Links Container */}
          <div className={`nav-links ${isMenuOpen ? 'open' : ''}`}>
            <button 
              className={`nav-item ${currentView === 'home' ? 'active' : ''}`}
              onClick={() => navigateTo('home')}
            >
              Events
            </button>

            {user && (
              <>
                <button 
                  className={`nav-item ${currentView === 'admin' ? 'active' : ''}`}
                  onClick={() => navigateTo('admin')}
                >
                  <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <LayoutDashboard size={16} /> Admin Panel
                  </span>
                </button>
                <button 
                  className="btn btn-secondary nav-logout-btn"
                  onClick={() => {
                    handleLogout();
                    setIsMenuOpen(false);
                  }}
                >
                  Logout
                </button>
              </>
            )}
          </div>

          {/* Theme Switcher (Always visible) */}
          <button 
            onClick={toggleTheme} 
            className="theme-toggle" 
            title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
            aria-label="Toggle theme"
          >
            {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
          </button>

          {/* Hamburger Menu Toggle Button (Mobile Only) */}
          <button 
            className="mobile-menu-btn"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle navigation menu"
            aria-expanded={isMenuOpen}
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>

        </div>
      </div>
    </header>
  );
}
