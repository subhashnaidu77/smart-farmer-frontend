import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { FiCopy } from 'react-icons/fi';
import { useModal } from '../context/ModalContext';

function Referrals({ userData }) {
    const [referredUsers, setReferredUsers] = useState([]);
    const [loading, setLoading] = useState(true);
const { showModal } = useModal(); // Get the showModal function
    useEffect(() => {
        const fetchReferredUsers = async () => {
            if (userData && userData.referralCode) {
                setLoading(true);
                try {
                    // Query the 'users' collection to find anyone who signed up with the current user's referral code
                    const usersRef = collection(db, "users");
                    const q = query(usersRef, where("referredBy", "==", userData.referralCode));
                    
                    const querySnapshot = await getDocs(q);
                    const usersList = querySnapshot.docs.map(doc => doc.data());
                    setReferredUsers(usersList);
                } catch (error) {
                    console.error("Error fetching referred users: ", error);
                    // This error might indicate that a Firestore index is needed.
                    // The browser console will have a link to create it.
                }
                setLoading(false);
            }
        };

        fetchReferredUsers();
    }, [userData]);


    const handleCopy = () => {
        if (userData && userData.referralCode) {
            navigator.clipboard.writeText(userData.referralCode);
            showModal('Referral code copied to clipboard!');
        }
    };

    return (
        <div>
            <h2>Referrals</h2>
            <p>Share your code with friends. When they sign up using your code, you get rewarded! (Rewards coming soon)</p>
            
            <div className="form-group">
                <label>Your Unique Referral Code</label>
                <div style={{display: 'flex', gap: '10px'}}>
                    <input 
                        type="text" 
                        value={userData?.referralCode || 'Loading...'} 
                        readOnly 
                        style={{backgroundColor: 'var(--bg-color)', fontWeight: 'bold', fontSize: '18px', textAlign: 'center'}}
                    />
                    <button className="btn btn-secondary" onClick={handleCopy}><FiCopy/> Copy</button>
                </div>
            </div>

            <div className="card" style={{marginTop: '30px'}}>
                <h3 style={{marginTop: 0}}>Users You've Referred</h3>
                {loading ? (
                    <p>Loading referrals...</p>
                ) : referredUsers.length > 0 ? (
                    <ul style={{listStyle: 'none', padding: 0, margin: 0}}>
                        {referredUsers.map((user, index) => (
                            <li key={index} style={{display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--border-color)'}}>
                                <span>{user.email}</span>
                                <span style={{color: 'var(--text-secondary)'}}>Joined on: {new Date(user.createdAt.seconds * 1000).toLocaleDateString()}</span>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p>You haven't referred anyone yet. Share your code to get started!</p>
                )}
            </div>
        </div>
    );
}

export default Referrals;