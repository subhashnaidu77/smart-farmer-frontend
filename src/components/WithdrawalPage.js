import React, { useState } from 'react';
import { auth, db } from '../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { FiCreditCard } from 'react-icons/fi';
import { useTheme } from '../context/ThemeContext';
function WithdrawalPage({ userData }) {
    const [amount, setAmount] = useState('');
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState({ message: '', type: '' });
    const currentUser = auth.currentUser;
const { theme } = useTheme(); // Get the current theme
    const logoSrc = theme === 'light' ? '/logo-light-theme.png' : '/logo-dark-theme.png'; // Choose logo

    const handleWithdrawalRequest = async (e) => {
        e.preventDefault();
        const withdrawalAmount = parseFloat(amount);

        if (isNaN(withdrawalAmount) || withdrawalAmount <= 0) {
            setStatus({ message: 'Please enter a valid amount.', type: 'error' });
            return;
        }

        if (withdrawalAmount > userData.walletBalance) {
            setStatus({ message: 'Withdrawal amount exceeds your wallet balance.', type: 'error' });
            return;
        }

        if (!userData.withdrawalSettings?.accountNumber) {
            setStatus({ message: 'Please add your bank account details in Settings before making a withdrawal.', type: 'error' });
            return;
        }

        setLoading(true);
        setStatus({ message: 'Submitting your request...', type: 'info' });

        try {
            const withdrawalsCollectionRef = collection(db, "withdrawals");
            await addDoc(withdrawalsCollectionRef, {
                userId: currentUser.uid,
                email: currentUser.email,
                amount: withdrawalAmount,
                status: 'pending',
                createdAt: serverTimestamp(),
                bankDetails: userData.withdrawalSettings
            });

            setStatus({ message: 'Withdrawal request submitted successfully! It will be processed shortly.', type: 'success' });
            setAmount('');
        } catch (error) {
            console.error("Error submitting withdrawal request:", error);
            setStatus({ message: 'Failed to submit request. Please try again.', type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="page-container" style={{display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
            <img src={logoSrc} alt="Smart Farmer Logo" className="auth-logo" />
            <div className="card" style={{width: '100%', maxWidth: '500px'}}>
                <h1 style={{ textAlign: 'center', marginBottom: '30px' }}>Make a Withdrawal</h1>
                <div className="form-group">
                    <label>Your Current Wallet Balance</label>
                    <p className="wallet-balance-display">₦{userData?.walletBalance?.toLocaleString() || 0}</p>
                </div>
                <form onSubmit={handleWithdrawalRequest}>
                    <div className="form-group">
                        <label htmlFor="amount">Amount to Withdraw (₦)</label>
                        <input id="amount" type="number" placeholder="e.g., 5000" value={amount} onChange={(e) => setAmount(e.target.value)} required />
                    </div>
                    {status.message && (<div className={`status-box ${status.type}`}>{status.message}</div>)}
                    <button type="submit" className="btn btn-primary" style={{width: '100%', marginTop: '10px'}} disabled={loading}>
                        <FiCreditCard /> {loading ? 'Submitting...' : 'Request Withdrawal'}
                    </button>
                </form>
            </div>
        </div>
    );
}

export default WithdrawalPage;