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
    const [selectedAccountIndex, setSelectedAccountIndex] = useState(0); // For the toggle
    const currentUser = auth.currentUser;

    const companyAccounts = [
        { bankName: "Vfd Bank", accountNumber: "1040594549", accountName: "Smart Farmer" },
        { bankName: "Kolomoni", accountNumber: "0990028382", accountName: "Smart Farmer" }
    ];

    const selectedAccount = companyAccounts[selectedAccountIndex];

    const handleCopy = (text) => {
        navigator.clipboard.writeText(text);
        alert(`'${text}' copied to clipboard!`);
    };

    const handleSubmitClaim = async (e) => {
        e.preventDefault();
        if (!currentUser) return;
        setLoading(true);
        setStatus({ message: '', type: '' });
        try {
            await addDoc(collection(db, "manual_deposits"), {
                userId: currentUser.uid,
                email: currentUser.email,
                amount: Number(amount),
                senderName,
                status: 'pending',
                createdAt: serverTimestamp(),
                transferredTo: selectedAccount.bankName // Store which bank they used
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
             <Link to="/dashboard" className="back-link" style={{ marginBottom: '30px' ,textDecoration:'none'}}><FiArrowLeft /> Back to Dashboard</Link>
            <h1 style={{ marginBottom: '30px', textAlign: 'center' ,textDecoration:'none'}}>Add Money Manually</h1>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '30px', alignItems: 'flex-start' }}>
                <div className="card">
                    <h3 style={{ marginTop: 0 }}>Step 1: Make Your Transfer</h3>
                    <p>Please select a bank and make a direct transfer to the details shown.</p>
                    
                    {/* --- THIS IS THE NEW TOGGLE SWITCH --- */}
                    <div className="account-toggle">
                        {companyAccounts.map((account, index) => (
                            <button
                                key={index}
                                className={`toggle-btn ${selectedAccountIndex === index ? 'active' : ''}`}
                                onClick={() => setSelectedAccountIndex(index)}
                            >
                                {account.bankName}
                            </button>
                        ))}
                    </div>

                    <div style={{ marginTop: '20px' }}>
                        <div className="form-group">
                            <label>Account Number</label>
                            <div className="info-box">
                                <span>{selectedAccount.accountNumber}</span>
                                <button onClick={() => handleCopy(selectedAccount.accountNumber)} className="copy-btn" title="Copy"><FiClipboard /></button>
                            </div>
                        </div>
                        <div className="form-group">
                            <label>Account Name</label>
                            <div className="info-box">{selectedAccount.accountName}</div>
                        </div>
                    </div>
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