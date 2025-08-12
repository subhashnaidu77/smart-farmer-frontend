// import React, { useState } from 'react';
// import { auth } from '../firebase';
// import apiClient from '../axiosConfig';
// import { FiClipboard, FiSend } from 'react-icons/fi';

// function AddMoneyPage() {
//     const [amount, setAmount] = useState('');
//     const [senderName, setSenderName] = useState('');
//     const [loading, setLoading] = useState(false);
//     const [status, setStatus] = useState({ message: '', type: '' });
//     const currentUser = auth.currentUser;

//     const companyAccount = {
//         bankName: "VFD Microfinance Bank",
//         accountNumber: "1040594549",
//         accountName: "Smart Farmer Inc."
//     };

//     const handleCopy = (text) => {
//         navigator.clipboard.writeText(text);
//         alert(`${text} copied to clipboard!`);
//     };

//     const handleSubmitClaim = async (e) => {
//         e.preventDefault();
//         setLoading(true);
//         setStatus({ message: '', type: '' });
//         try {
//             await apiClient.post('/deposits/request', {
//                 userId: currentUser.uid,
//                 amount: amount,
//                 senderName: senderName
//             });
//             setStatus({ message: 'Your deposit claim has been submitted! It will be reviewed by an admin shortly.', type: 'success' });
//             setAmount('');
//             setSenderName('');
//         } catch (error) {
//             setStatus({ message: 'Failed to submit claim. Please try again.', type: 'error' });
//         } finally {
//             setLoading(false);
//         }
//     };

//     return (
//         <div className="page-container">
//             <h1 style={{ marginBottom: '30px' }}>Add Money Manually</h1>
//             <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>
//                 <div className="card">
//                     <h3 style={{ marginTop: 0 }}>Step 1: Make Your Transfer</h3>
//                     <p>Please make a bank transfer to the following account details.</p>
//                     <div className="form-group">
//                         <label>Bank Name</label>
//                         <div className="info-box">{companyAccount.bankName}</div>
//                     </div>
//                     <div className="form-group">
//                         <label>Account Number</label>
//                         <div className="info-box">
//                             {companyAccount.accountNumber}
//                             <button onClick={() => handleCopy(companyAccount.accountNumber)} className="copy-btn"><FiClipboard /></button>
//                         </div>
//                     </div>
//                     <div className="form-group">
//                         <label>Account Name</label>
//                         <div className="info-box">{companyAccount.accountName}</div>
//                     </div>
//                 </div>
//                 <div className="card">
//                     <h3 style={{ marginTop: 0 }}>Step 2: Submit Your Claim</h3>
//                     <p>After you have made the transfer, please fill this form so we can verify and credit your wallet.</p>
//                     <form onSubmit={handleSubmitClaim}>
//                         <div className="form-group">
//                             <label htmlFor="amount">Amount Sent (₦)</label>
//                             <input id="amount" type="number" value={amount} onChange={(e) => setAmount(e.target.value)} required />
//                         </div>
//                         <div className="form-group">
//                             <label htmlFor="senderName">Sender's Account Name</label>
//                             <input id="senderName" type="text" value={senderName} onChange={(e) => setSenderName(e.target.value)} required />
//                         </div>
//                         {status.message && <div className={`status-box ${status.type}`}>{status.message}</div>}
//                         <button type="submit" className="btn btn-primary" style={{width: '100%'}} disabled={loading}>
//                             <FiSend /> {loading ? 'Submitting...' : 'Submit Claim'}
//                         </button>
//                     </form>
//                 </div>
//             </div>
//         </div>
//     );
// }

// export default AddMoneyPage;