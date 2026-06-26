import logoImg from '../assets/logo.jpg';
import { Sun, Moon, LogIn, LayoutDashboard } from 'lucide-react';

export default function Navbar({ currentView, setView, theme, toggleTheme, user, handleLogout }) {
  return (
    <header className="header">
      <div className="container nav-container">
        <a href="#" className="logo-link" onClick={() => setView('home')}>
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

        <div className="nav-links">
          <button 
            className={`nav-item ${currentView === 'home' ? 'active' : ''}`}
            onClick={() => setView('home')}
          >
            Events
          </button>

          {user && (
            <>
              <button 
                className={`nav-item ${currentView === 'admin' ? 'active' : ''}`}
                onClick={() => setView('admin')}
              >
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <LayoutDashboard size={16} /> Admin Panel
                </span>
              </button>
              <button 
                className="btn btn-secondary"
                style={{ padding: '6px 12px', fontSize: '0.85rem' }}
                onClick={handleLogout}
              >
                Logout
              </button>
            </>
          )}

          <button 
            onClick={toggleTheme} 
            className="theme-toggle" 
            title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
            aria-label="Toggle theme"
          >
            {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
          </button>
        </div>
      </div>
    </header>
  );
}
