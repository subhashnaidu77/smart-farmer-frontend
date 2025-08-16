import React, { useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase';
import { useTheme } from '../context/ThemeContext';
import Modal from '../components/Modal';
import { authErrorToCopy } from '../utils/authErrorCopy';
import { retryWithBackoff } from '../utils/retry';

export default function Login() {
  const { theme } = useTheme();
  const logoSrc = theme === 'light' ? '/logo-light-theme.png' : '/logo-dark-theme.png';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState('info');
  const [modalTitle, setModalTitle] = useState();
  const [modalMsg, setModalMsg] = useState('');
  const [primaryLabel, setPrimaryLabel] = useState('OK');
  const [primaryAction, setPrimaryAction] = useState(() => () => setModalOpen(false));

  const navigate = useNavigate();
  const successTimerRef = useRef(null);

  const openModal = ({ type, title, message, primaryActionLabel = 'OK', onPrimaryAction }) => {
    setModalType(type);
    setModalTitle(title);
    setModalMsg(message);
    setPrimaryLabel(primaryActionLabel);
    setPrimaryAction(() => (onPrimaryAction || (() => setModalOpen(false))));
    setModalOpen(true);
  };

  const doLogin = async () => {
    await signInWithEmailAndPassword(auth, email.trim(), password);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (loading) return;

    setLoading(true);
    try {
      if (typeof navigator !== 'undefined' && !navigator.onLine) {
        throw { code: 'auth/network-request-failed' };
      }

      await retryWithBackoff(doLogin, { retries: 3, baseMs: 300, maxMs: 1500 });

      // Success: show a quick success modal, auto-close then navigate
      openModal({
        type: 'success',
        title: 'Welcome back!',
        message: 'Login successful. Redirecting to your dashboard…',
        primaryActionLabel: 'Continue',
        onPrimaryAction: () => {
          setModalOpen(false);
          navigate('/dashboard');
        },
      });

      // Auto-dismiss after ~1.2s to feel snappy
      clearTimeout(successTimerRef.current);
      successTimerRef.current = setTimeout(() => {
        setModalOpen(false);
        navigate('/dashboard');
      }, 1200);
    } catch (err) {
      console.error('Login error:', err);
      const isNetwork = err?.code === 'auth/network-request-failed';
      const msg = authErrorToCopy(err?.code, 'Error during login. Please try again.');

      openModal({
        type: 'error',
        title: 'Login error',
        message: msg,
        primaryActionLabel: isNetwork ? 'Retry' : 'OK',
        onPrimaryAction: async () => {
          setModalOpen(false);
          if (isNetwork) {
            try {
              await retryWithBackoff(doLogin, { retries: 3, baseMs: 300, maxMs: 1500 });
              openModal({
                type: 'success',
                title: 'Welcome back!',
                message: 'Login successful. Redirecting to your dashboard…',
                primaryActionLabel: 'Continue',
                onPrimaryAction: () => {
                  setModalOpen(false);
                  navigate('/dashboard');
                },
              });
              clearTimeout(successTimerRef.current);
              successTimerRef.current = setTimeout(() => {
                setModalOpen(false);
                navigate('/dashboard');
              }, 1200);
            } catch (reErr) {
              console.error('Retry login failed:', reErr);
              openModal({
                type: 'error',
                title: 'Still offline?',
                message: authErrorToCopy(reErr?.code, 'We still could not log you in. Please check your connection and try again.'),
                primaryActionLabel: 'OK',
              });
            }
          }
        },
      });
    } finally {
      setLoading(false);
    }
  };

  // Cleanup auto-dismiss timer if component unmounts
  React.useEffect(() => {
    return () => clearTimeout(successTimerRef.current);
  }, []);

  return (
    <div className="card" style={{ maxWidth: '450px', margin: '50px auto', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <img src={logoSrc} alt="Smart Farmer Logo" className="auth-logo" />
      <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>Welcome Back!</h2>

      <form onSubmit={handleLogin} style={{ width: '100%' }}>
        <div className="form-group">
          <label>Email Address</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" />
        </div>
        <div className="form-group">
          <label>Password</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required autoComplete="current-password" />
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
