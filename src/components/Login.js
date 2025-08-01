import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase';

function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        try {
            await signInWithEmailAndPassword(auth, email, password);
            navigate('/dashboard');
        } catch (err) {
            if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
                setError('Invalid email or password.');
            } else {
                setError('Error during login: ' + err.message);
            }
            console.error("Login error:", err);
        }
    };

    return (
        <div className="card" style={{ maxWidth: '450px', margin: '50px auto', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <img src="/logo.png" alt="Smart Farmer Logo" className="auth-logo" />
            <h2 style={{textAlign: 'center', marginBottom: '20px'}}>Welcome Back!</h2>
            {error && <p className="status-message error" style={{width: '100%'}}>{error}</p>}
            <form onSubmit={handleLogin} style={{width: '100%'}}>
                <div className="form-group">
                    <label>Email Address</label>
                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                </div>
                <div className="form-group">
                    <label>Password</label>
                    <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                </div>
                <div style={{ textAlign: 'right', fontSize: '12px', marginBottom: '15px' }}>
                    <Link to="/forgot-password">Forgot Password?</Link>
                </div>
                <button type="submit" className="btn btn-primary" style={{width: '100%'}}>Login</button>
            </form>
            <p style={{ textAlign: 'center', marginTop: '20px' }}>Don't have an account? <Link to="/signup">Sign Up here</Link></p>
        </div>
    );
}

export default Login;