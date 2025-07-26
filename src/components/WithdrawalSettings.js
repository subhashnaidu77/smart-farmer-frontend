import React, { useState, useEffect } from 'react';
import { auth, db } from '../firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';

const styles = {
    form: { display: 'flex', flexDirection: 'column', gap: '20px', marginTop: '20px' },
    inputGroup: { display: 'flex', flexDirection: 'column' },
    label: { marginBottom: '5px', fontSize: '14px' },
    input: { padding: '12px', borderRadius: '4px', border: '1px solid var(--border-color)', fontSize: '16px' },
    button: { padding: '15px', backgroundColor: 'var(--accent-color)', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '16px' }
};

function WithdrawalSettings() {
    const [settings, setSettings] = useState({ bankName: '', accountNumber: '', accountName: '' });
    const currentUser = auth.currentUser;

    useEffect(() => {
        const fetchSettings = async () => {
            if (currentUser) {
                const userDocRef = doc(db, 'users', currentUser.uid);
                const docSnap = await getDoc(userDocRef);
                if (docSnap.exists() && docSnap.data().withdrawalSettings) {
                    setSettings(docSnap.data().withdrawalSettings);
                }
            }
        };
        fetchSettings();
    }, [currentUser]);

    const handleInputChange = (e) => setSettings({ ...settings, [e.target.name]: e.target.value });

    const handleSave = async (e) => {
        e.preventDefault();
        const userDocRef = doc(db, 'users', currentUser.uid);
        try {
            await updateDoc(userDocRef, { withdrawalSettings: settings });
            alert('Withdrawal settings saved successfully!');
        } catch (error) {
            alert('Error saving settings: ' + error.message);
        }
    };

    return (
        <div>
            <h2>Withdrawal Settings</h2>
            <p>Manage your bank account for withdrawals. This information is kept secure.</p>
            <form style={styles.form} onSubmit={handleSave}>
                <div style={styles.inputGroup}>
                    <label style={styles.label}>Bank Name</label>
                    <input style={styles.input} name="bankName" value={settings.bankName} onChange={handleInputChange} placeholder="e.g., State Bank of India" required />
                </div>
                <div style={styles.inputGroup}>
                    <label style={styles.label}>Account Number</label>
                    <input style={styles.input} name="accountNumber" value={settings.accountNumber} onChange={handleInputChange} placeholder="Enter your bank account number" required />
                </div>
                <div style={styles.inputGroup}>
                    <label style={styles.label}>Account Holder Name</label>
                    <input style={styles.input} name="accountName" value={settings.accountName} onChange={handleInputChange} placeholder="Enter name as per bank records" required />
                </div>
                <button type="submit" style={styles.button}>Save Withdrawal Info</button>
            </form>
        </div>
    );
}

export default WithdrawalSettings;