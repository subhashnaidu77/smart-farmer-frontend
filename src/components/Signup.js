import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth, db } from '../firebase';
import { doc, setDoc } from 'firebase/firestore';

function Signup() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [referralCode, setReferralCode] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleSignup = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;
            const newReferralCode = user.uid.substring(0, 6).toUpperCase();
            await setDoc(doc(db, "users", user.uid), {
                email: user.email,
                createdAt: new Date(),
                walletBalance: 0,
                role: 'user',
                firstName: '',
                lastName: '',
                phone: '',
                notificationPrefs: { activity: true, investment: true, promotions: false },
                withdrawalSettings: { bankName: '', accountNumber: '', accountName: '' },
                referralCode: newReferralCode,
                referredBy: referralCode,
            });
            setSuccess('Registration successful! Your account has been created.');
            setEmail('');
            setPassword('');
            setReferralCode('');
        } catch (err) {
            if (err.code === 'auth/email-already-in-use') {
                setError('The email address is already in use by another account.');
            } else if (err.code === 'auth/invalid-email') {
                setError('The email address is not valid.');
            } else if (err.code === 'auth/weak-password') {
                setError('The password is too weak. Please choose a stronger password.');
            } else {
                setError('Error during registration: ' + err.message);
            }
            console.error("Signup error:", err);
        }
    };

    return (
        <div className="card" style={{ maxWidth: '450px', margin: '50px auto', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <img src="/logo.png" alt="Smart Farmer Logo" className="auth-logo" />
            <h2 style={{textAlign: 'center', marginBottom: '20px'}}>Create an Account</h2>
            {error && <p className="status-message error" style={{width: '100%'}}>{error}</p>}
            {success && <p className="status-message success" style={{width: '100%'}}>{success}</p>}
            <form onSubmit={handleSignup} style={{width: '100%'}}>
                <div className="form-group">
                    <label>Email Address</label>
                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                </div>
                <div className="form-group">
                    <label>Password</label>
                    <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                </div>
                <div className="form-group">
                    <label>Referral Code (Optional)</label>
                    <input type="text" value={referralCode} onChange={(e) => setReferralCode(e.target.value)} placeholder="Enter code if you have one" />
                </div>
                <button type="submit" className="btn btn-primary" style={{width: '100%'}}>Sign Up</button>
            </form>
            <p style={{ textAlign: 'center', marginTop: '20px' }}>Already have an account? <Link to="/login">Login here</Link></p>
        </div>
    );
}

export default Signup;