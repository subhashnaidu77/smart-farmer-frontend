import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth, db } from '../firebase';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { useTheme } from '../context/ThemeContext';
import Modal from '../components/Modal';
import { authErrorToCopy } from '../utils/authErrorCopy';
import { retryWithBackoff } from '../utils/retry';

export default function Signup() {
  const { theme } = useTheme();
  const logoSrc = theme === 'light' ? '/logo-light-theme.png' : '/logo-dark-theme.png';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [referralCode, setReferralCode] = useState('');

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
      firstName: '',
      lastName: '',
      phone: '',
      notificationPrefs: { activity: true, investment: true, promotions: false },
      withdrawalSettings: { bankName: '', accountNumber: '', accountName: '' },
      referralCode: newReferralCode,
      referredBy: referralCode || null,
    });
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    if (loading) return;

    setLoading(true);
    try {
      if (typeof navigator !== 'undefined' && !navigator.onLine) {
        // Force a retriable error to enter backoff flow
        throw { code: 'auth/network-request-failed' };
      }

      // Retry wrapper for transient network failures
      await retryWithBackoff(doSignup, {
        retries: 3,
        baseMs: 300,
        maxMs: 1500,
      });

      setEmail('');
      setPassword('');
      setReferralCode('');

      openModal({
        type: 'success',
        title: 'Account Created',
        message: 'Registration successful! Your account has been created.',
        primaryActionLabel: 'Great',
      });
    } catch (err) {
      console.error('Signup error:', err);
      const msg = authErrorToCopy(err?.code, 'Error creating your account. Please try again.');

      const isNetwork = err?.code === 'auth/network-request-failed';
      openModal({
        type: 'error',
        title: 'Sign up error',
        message: msg,
        primaryActionLabel: isNetwork ? 'Retry' : 'OK',
        onPrimaryAction: async () => {
          setModalOpen(false);
          if (isNetwork) {
            try {
              await retryWithBackoff(doSignup, { retries: 3, baseMs: 300, maxMs: 1500 });
              openModal({
                type: 'success',
                title: 'Account Created',
                message: 'Registration successful! Your account has been created.',
                primaryActionLabel: 'Great',
              });
            } catch (reErr) {
              console.error('Retry signup failed:', reErr);
              openModal({
                type: 'error',
                title: 'Still offline?',
                message: authErrorToCopy(reErr?.code, 'We still could not complete signup. Please check your connection and try again.'),
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

  return (
    <div className="card" style={{ maxWidth: '450px', margin: '50px auto', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <img src={logoSrc} alt="Smart Farmer Logo" className="auth-logo" />
      <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>Create an Account</h2>

      <form onSubmit={handleSignup} style={{ width: '100%' }}>
        <div className="form-group">
          <label>Email Address</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" />
        </div>
        <div className="form-group">
          <label>Password</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required autoComplete="new-password" />
        </div>
        <div className="form-group">
          <label>Referral Code (Optional)</label>
          <input type="text" value={referralCode} onChange={(e) => setReferralCode(e.target.value)} placeholder="Enter code if you have one" />
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
