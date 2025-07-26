import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { auth } from '../firebase';
import { sendPasswordResetEmail } from 'firebase/auth';

function ForgotPassword() {
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleReset = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        try {
            await sendPasswordResetEmail(auth, email);
            setSuccess('Password reset link has been sent to your email. Please check your inbox.');
            setEmail('');
        } catch (err) {
            if (err.code === 'auth/user-not-found') {
                setError('No user found with this email address.');
            } else {
                setError('Failed to send reset link. Please try again.');
            }
            console.error("Password reset error:", err);
        }
    };
    
    return (
        <div style={{ maxWidth: '400px', margin: '50px auto', padding: '20px', border: '1px solid #ccc', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
            <h2>Reset Password</h2>
            <p style={{fontSize: '14px', color: '#666', marginBottom: '20px'}}>Enter your registered email address to receive a password reset link.</p>
            {error && <p style={{ color: 'red' }}>{error}</p>}
            {success && <p style={{ color: 'green' }}>{success}</p>}
            <form onSubmit={handleReset}>
                <div style={{ marginBottom: '15px' }}>
                    <label htmlFor="email" style={{ display: 'block', marginBottom: '5px' }}>Email:</label>
                    <input
                        type="email"
                        id="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px', boxSizing: 'border-box' }}
                    />
                </div>
                <button
                    type="submit"
                    style={{ width: '100%', padding: '10px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '16px' }}
                >
                    Send Reset Link
                </button>
            </form>
            <div style={{ textAlign: 'center', marginTop: '20px' }}>
                <Link to="/login">Back to Login</Link>
            </div>
        </div>
    );
}

export default ForgotPassword;