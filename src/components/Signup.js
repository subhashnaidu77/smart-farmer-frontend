// src/pages/Signup.jsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth, db } from '../firebase';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { useTheme } from '../context/ThemeContext';
import Modal from '../components/Modal';
import { authErrorToCopy } from '../utils/authErrorCopy';
import { retryWithBackoff } from '../utils/retry';
import { FiEye, FiEyeOff } from 'react-icons/fi';

export default function Signup() {
  const { theme } = useTheme();
  const logoSrc = theme === 'light' ? '/logo-light-theme.png' : '/logo-dark-theme.png';
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [referralCode, setReferralCode] = useState('');
  const [showPass, setShowPass] = useState(false);

  const [loading, setLoading] = useState(false);

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState('info');
  const [modalTitle, setModalTitle] = useState();
  const [modalMsg, setModalMsg] = useState('');
  const [primaryLabel, setPrimaryLabel] = useState('OK');
  const [primaryAction, setPrimaryAction] = useState(() => () => setModalOpen(false));

  const openModal = ({ type, title, message, primaryActionLabel = 'OK', onPrimaryAction }) => {
    setModalType(type);
    setModalTitle(title);
    setModalMsg(message);
    setPrimaryLabel(primaryActionLabel);
    setPrimaryAction(() => (onPrimaryAction || (() => setModalOpen(false))));
    setModalOpen(true);
  };

  const doSignup = async () => {
    const cred = await createUserWithEmailAndPassword(auth, email.trim(), password);
    const { user } = cred;
    const newReferralCode = user.uid.substring(0, 6).toUpperCase();

    await setDoc(doc(db, "users", user.uid), {
      email: user.email,
      createdAt: serverTimestamp(),
      walletBalance: 0,
      role: 'user',
      referralCode: newReferralCode,
      referredBy: referralCode || null,
    });
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    if (loading) return;

    setLoading(true);
    try {
      await retryWithBackoff(doSignup);
      setEmail('');
      setPassword('');
      setReferralCode('');
      openModal({
        type: 'success',
        title: 'Account Created',
        message: 'Registration successful! Your account has been created.',
      });
    } catch (err) {
      openModal({
        type: 'error',
        title: 'Signup error',
        message: authErrorToCopy(err?.code),
      });
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
      <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>Create an Account</h2>

      <form onSubmit={handleSignup} style={{ width: '100%' }}>
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
            autoComplete="new-password"
          />
          <span
            style={{ position: 'absolute', right: 10, top: 38, cursor: 'pointer' }}
            onClick={() => setShowPass(!showPass)}
          >
            {showPass ? <FiEyeOff /> : <FiEye />}
          </span>
        </div>
        <div className="form-group">
          <label>Referral Code (Optional)</label>
          <input type="text" value={referralCode} onChange={(e) => setReferralCode(e.target.value)} />
        </div>
        <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
          {loading ? 'Creating…' : 'Sign Up'}
        </button>
      </form>

      <p style={{ textAlign: 'center', marginTop: '20px' }}>
        Already have an account? <Link to="/login">Login here</Link>
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
