import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { auth, db } from '../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { FiClipboard, FiSend, FiArrowLeft } from 'react-icons/fi';

function AddMoneyManually() {
    const [amount, setAmount] = useState('');
    const [senderName, setSenderName] = useState('');
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState({ message: '', type: '' });
    const currentUser = auth.currentUser;

    // --- THIS IS THE UPDATE ---
    // We now have an array of two bank accounts
    const companyAccounts = [
        {
            bankName: "Vfd Bank",
            accountNumber: "1040594549",
            accountName: "Smart Farmer"
        },
        {
            bankName: "Kolomoni",
            accountNumber: "0990028382",
            accountName: "Smart Farmer"
        }
    ];

    const handleCopy = (text) => {
        navigator.clipboard.writeText(text);
        alert(`'${text}' copied to clipboard!`);
    };

    const handleSubmitClaim = async (e) => {
        e.preventDefault();
        if (!currentUser) {
            setStatus({ message: 'You must be logged in to submit a claim.', type: 'error' });
            return;
        }
        setLoading(true);
        setStatus({ message: '', type: '' });
        try {
            const depositsCollectionRef = collection(db, "manual_deposits");
            await addDoc(depositsCollectionRef, {
                userId: currentUser.uid,
                email: currentUser.email,
                amount: Number(amount),
                senderName: senderName,
                status: 'pending',
                createdAt: serverTimestamp()
            });
            setStatus({ message: 'Your deposit claim has been submitted! It will be reviewed by an admin within 24 hours.', type: 'success' });
            setAmount('');
            setSenderName('');
        } catch (error) {
            setStatus({ message: 'Failed to submit claim. Please try again.', type: 'error' });
            console.error("Error submitting deposit claim:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="page-container">
             <Link to="/dashboard" className="back-link" style={{ marginBottom: '30px' }}><FiArrowLeft /> Back to Dashboard</Link>
            <h1 style={{ marginBottom: '30px', textAlign: 'center' }}>Add Money Manually</h1>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '30px', alignItems: 'flex-start' }}>
                <div className="card">
                    <h3 style={{ marginTop: 0 }}>Step 1: Make Your Transfer</h3>
                    <p>Please make a direct bank transfer to **either** of the following account details.</p>
                    
                    {/* We now map over the accounts array to display both */}
                    {companyAccounts.map((account, index) => (
                        <div key={index} style={{ border: '1px solid var(--border-color)', borderRadius: '8px', padding: '15px', marginBottom: '20px' }}>
                            <h4 style={{marginTop: 0, color: 'var(--accent-color)'}}>{account.bankName}</h4>
                            <div className="form-group">
                                <label>Account Number</label>
                                <div className="info-box">
                                    <span>{account.accountNumber}</span>
                                    <button onClick={() => handleCopy(account.accountNumber)} className="copy-btn" title="Copy"><FiClipboard /></button>
                                </div>
                            </div>
                            <div className="form-group">
                                <label>Account Name</label>
                                <div className="info-box">{account.accountName}</div>
                            </div>
                        </div>
                    ))}
                </div>
                <div className="card">
                    <h3 style={{ marginTop: 0 }}>Step 2: Submit Your Claim</h3>
                    <p>After you have made the transfer, please fill this form so we can verify and credit your wallet.</p>
                    <form onSubmit={handleSubmitClaim}>
                        <div className="form-group">
                            <label htmlFor="amount">Amount Sent (₦)</label>
                            <input id="amount" type="number" placeholder="e.g., 5000" value={amount} onChange={(e) => setAmount(e.target.value)} required />
                        </div>
                        <div className="form-group">
                            <label htmlFor="senderName">The Name on the Account You Sent From</label>
                            <input id="senderName" type="text" placeholder="e.g., John Doe" value={senderName} onChange={(e) => setSenderName(e.target.value)} required />
                        </div>
                        {status.message && <div className={`status-box ${status.type}`}>{status.message}</div>}
                        <button type="submit" className="btn btn-primary" style={{width: '100%'}} disabled={loading}>
                            <FiSend /> {loading ? 'Submitting...' : 'Submit Deposit Claim'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default AddMoneyManually;