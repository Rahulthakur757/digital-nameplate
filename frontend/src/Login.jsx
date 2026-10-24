import React, { useState } from 'react';

// Default Admin Credentials (Aage chal kar MERN API se replace kar sakte hain)
const ADMIN_USER = 'admin';
const ADMIN_PASS = 'admin@123';

export default function Login({ onLoginSuccess }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    const cleanUser = username.trim();
    const cleanPass = password.trim();

    if (!cleanUser || !cleanPass) {
      setErrorMsg('Please enter both username and password.');
      setLoading(false);
      return;
    }

    // Credential check
    setTimeout(() => {
      if (cleanUser === ADMIN_USER && cleanPass === ADMIN_PASS) {
        // Session save karna taaki refresh par logout na ho
        localStorage.setItem('esl_auth', 'true');
        onLoginSuccess();
      } else {
        setErrorMsg('Invalid username or password. Please try again.');
        setLoading(false);
      }
    }, 300);
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #eceff1 0%, #cfd8dc 100%)',
      fontFamily: 'Segoe UI, Roboto, sans-serif',
      padding: '16px'
    }}>
      <div style={{
        background: '#ffffff',
        width: '100%',
        maxWidth: '400px',
        borderRadius: '12px',
        boxShadow: '0 8px 24px rgba(0, 0, 0, 0.12)',
        overflow: 'hidden',
        border: '1px solid #cfd8dc'
      }}>
        
        {/* Brand Header */}
        <div style={{
          background: '#b71c1c',
          color: '#ffffff',
          padding: '24px 20px',
          textAlign: 'center',
          position: 'relative'
        }}>
          <h2 style={{ margin: '0 0 6px 0', fontSize: '20px', letterSpacing: '0.5px' }}>
            ESL Gateway Login
          </h2>
          <small style={{ color: '#ffcdd2', fontSize: '13px', display: 'block' }}>
            ESL 7.50 DDS Management System
          </small>
          <span style={{
            position: 'absolute',
            top: '12px',
            right: '12px',
            background: 'rgba(255, 255, 255, 0.2)',
            padding: '3px 8px',
            borderRadius: '10px',
            fontSize: '10px',
            fontWeight: 'bold',
            letterSpacing: '0.5px'
          }}>
            MERN & BLE
          </span>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} style={{ padding: '24px 20px' }}>
          
          {errorMsg && (
            <div style={{
              background: '#ffebee',
              color: '#c62828',
              border: '1px solid #ef9a9a',
              borderRadius: '6px',
              padding: '10px 12px',
              fontSize: '13px',
              marginBottom: '16px',
              fontWeight: '500'
            }}>
              {errorMsg}
            </div>
          )}

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', color: '#37474f', marginBottom: '6px' }}>
              Username
            </label>
            <input
              type="text"
              placeholder="Enter username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 12px',
                borderRadius: '6px',
                border: '1px solid #b0bec5',
                fontSize: '14px',
                boxSizing: 'border-box',
                outline: 'none'
              }}
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <label style={{ fontSize: '13px', fontWeight: 'bold', color: '#37474f' }}>
                Password
              </label>
              <span
                onClick={() => setShowPassword(!showPassword)}
                style={{ fontSize: '12px', color: '#1565c0', cursor: 'pointer', fontWeight: '500' }}
              >
                {showPassword ? 'Hide' : 'Show'}
              </span>
            </div>
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 12px',
                borderRadius: '6px',
                border: '1px solid #b0bec5',
                fontSize: '14px',
                boxSizing: 'border-box',
                outline: 'none'
              }}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              background: loading ? '#9e9e9e' : '#b71c1c',
              color: '#ffffff',
              border: 'none',
              padding: '12px',
              borderRadius: '6px',
              fontSize: '15px',
              fontWeight: 'bold',
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'background 0.2s',
              boxShadow: '0 2px 6px rgba(183, 28, 28, 0.3)'
            }}
          >
            {loading ? 'Authenticating...' : 'Sign In'}
          </button>

          <div style={{ marginTop: '16px', textAlign: 'center', fontSize: '12px', color: '#78909c' }}>
            Default credentials: <strong>admin</strong> / <strong>admin@123</strong>
          </div>
        </form>

      </div>
    </div>
  );
}