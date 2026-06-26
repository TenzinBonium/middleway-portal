import React, { useState } from 'react';
import { auth, isConfigured } from '../firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { KeyRound, Mail, AlertCircle, Info } from 'lucide-react';

export default function Login({ onLoginSuccess }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (isConfigured) {
      try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        onLoginSuccess(userCredential.user);
      } catch (err) {
        console.error(err);
        setError('Invalid email or password. Please try again.');
      } finally {
        setLoading(false);
      }
    } else {
      // Mock Login Mode
      setTimeout(() => {
        if (email === 'admin@middleway.org' && password === 'admin') {
          onLoginSuccess({ email: 'admin@middleway.org', uid: 'mock-admin-uid' });
        } else {
          setError('Incorrect mock credentials. Use email "admin@middleway.org" and password "admin".');
        }
        setLoading(false);
      }, 600);
    }
  };

  return (
    <div className="container" style={{ display: 'flex', justifyContent: 'center' }}>
      <div className="login-card glass-panel">
        <div className="modal-meta-icon-wrapper" style={{ margin: '0 auto 20px', width: '56px', height: '56px' }}>
          <KeyRound size={28} />
        </div>
        <h2 className="login-title">Admin Access</h2>
        <p className="login-sub">Sign in to manage Middleway Approach Bengaluru events.</p>

        {!isConfigured && (
          <div style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: '10px',
            backgroundColor: 'var(--primary-light)',
            color: 'var(--primary)',
            padding: '12px',
            borderRadius: 'var(--radius-md)',
            marginBottom: '20px',
            fontSize: '0.85rem',
            textAlign: 'left'
          }}>
            <Info size={24} style={{ flexShrink: 0, marginTop: '2px' }} />
            <div>
              <strong>Local Mock Mode:</strong> Firebase is not configured. 
              Use credentials:<br/>
              Email: <code>admin@middleway.org</code><br/>
              Password: <code>admin</code>
            </div>
          </div>
        )}

        {error && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            color: 'var(--danger)',
            backgroundColor: 'rgba(225, 29, 72, 0.1)',
            border: '1px solid rgba(225, 29, 72, 0.2)',
            padding: '12px',
            borderRadius: 'var(--radius-md)',
            marginBottom: '20px',
            fontSize: '0.9rem',
            textAlign: 'left'
          }}>
            <AlertCircle size={18} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <div style={{ position: 'relative' }}>
              <Mail size={18} style={{ position: 'absolute', left: '14px', top: '15px', color: 'var(--text-light)' }} />
              <input
                id="email"
                type="email"
                required
                className="form-control"
                placeholder="admin@middleway.org"
                style={{ paddingLeft: '44px', width: '100%' }}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <div style={{ position: 'relative' }}>
              <KeyRound size={18} style={{ position: 'absolute', left: '14px', top: '15px', color: 'var(--text-light)' }} />
              <input
                id="password"
                type="password"
                required
                className="form-control"
                placeholder="••••••••"
                style={{ paddingLeft: '44px', width: '100%' }}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', marginTop: '12px', padding: '12px' }}
            disabled={loading}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
}
