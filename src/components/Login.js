// src/pages/Login.jsx
import React, { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase';
import { useTheme } from '../context/ThemeContext';
import Modal from '../components/Modal';
import { authErrorToCopy } from '../utils/authErrorCopy';
import { retryWithBackoff } from '../utils/retry';
import { FiEye, FiEyeOff } from 'react-icons/fi';

export default function Login() {
  const { theme } = useTheme();
  const logoSrc = theme === 'light' ? '/logo-light-theme.png' : '/logo-dark-theme.png';
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState('info');
  const [modalTitle, setModalTitle] = useState();
  const [modalMsg, setModalMsg] = useState('');
  const [primaryLabel, setPrimaryLabel] = useState('OK');
  const [primaryAction, setPrimaryAction] = useState(() => () => setModalOpen(false));

  const doLogin = async () => {
    await signInWithEmailAndPassword(auth, email.trim(), password);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (loading) return;

    setLoading(true);
    try {
      await retryWithBackoff(doLogin);
      navigate('/dashboard');
    } catch (err) {
      setModalType('error');
      setModalTitle('Login error');
      setModalMsg(authErrorToCopy(err?.code));
      setModalOpen(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card" style={{ maxWidth: '450px', margin: '50px auto', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      {/* Back to Landing Page */}
      <button
        className="btn btn-ghost"
        style={{ alignSelf: 'flex-start', marginBottom: '10px' }}
        onClick={() => navigate('/')}
      >
        ← Back to Landing Page
      </button>

      <img src={logoSrc} alt="Smart Farmer Logo" className="auth-logo" />
      <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>Welcome Back!</h2>

      <form onSubmit={handleLogin} style={{ width: '100%' }}>
        <div className="form-group">
          <label>Email Address</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" />
        </div>
        <div className="form-group" style={{ position: 'relative' }}>
          <label>Password</label>
          <input
            type={showPass ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
          />
          <span
            style={{ position: 'absolute', right: 10, top: 38, cursor: 'pointer' }}
            onClick={() => setShowPass(!showPass)}
          >
            {showPass ? <FiEyeOff /> : <FiEye />}
          </span>
        </div>
        <div style={{ textAlign: 'right', fontSize: '12px', marginBottom: '15px' }}>
          <Link to="/forgot-password">Forgot Password?</Link>
        </div>
        <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
          {loading ? 'Signing in…' : 'Login'}
        </button>
      </form>

      <p style={{ textAlign: 'center', marginTop: '20px' }}>
        Don&apos;t have an account? <Link to="/signup">Sign Up here</Link>
      </p>

      <Modal
        show={modalOpen}
        type={modalType}
        title={modalTitle}
        message={modalMsg}
        primaryActionLabel={primaryLabel}
        onPrimaryAction={primaryAction}
        onClose={() => setModalOpen(false)}
      />
    </div>
  );
}
