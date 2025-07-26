import React, { useState } from 'react';
import { auth } from '../firebase';
import { EmailAuthProvider, reauthenticateWithCredential, updatePassword } from 'firebase/auth';

const styles = {
    form: { display: 'flex', flexDirection: 'column', gap: '20px' },
    inputGroup: { display: 'flex', flexDirection: 'column' },
    label: { marginBottom: '5px', fontSize: '14px', color: '#333' },
    input: { padding: '12px', borderRadius: '4px', border: '1px solid #ccc', fontSize: '16px' },
    button: { padding: '15px', backgroundColor: '#4CAF50', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '16px' }
};

function SecuritySettings() {
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handlePasswordUpdate = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (newPassword !== confirmPassword) {
            setError("New passwords do not match.");
            return;
        }

        const user = auth.currentUser;
        const credential = EmailAuthProvider.credential(user.email, currentPassword);

        try {
            await reauthenticateWithCredential(user, credential);
            await updatePassword(user, newPassword);

            setSuccess("Password updated successfully!");
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');

        } catch (err) {
            if (err.code === 'auth/wrong-password') {
                setError("The current password you entered is incorrect.");
            } else {
                setError("An error occurred. Please try again.");
            }
            console.error("Password update error:", err);
        }
    };

    return (
        <div>
            <h2>Security Settings</h2>
            <p>Update your password here. It's a good idea to use a strong password that you're not using elsewhere.</p>
            {error && <p style={{ color: 'red' }}>{error}</p>}
            {success && <p style={{ color: 'green' }}>{success}</p>}
            <form style={styles.form} onSubmit={handlePasswordUpdate}>
                <div style={styles.inputGroup}>
                    <label style={styles.label}>Current Password</label>
                    <input style={styles.input} type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} placeholder="Enter your current password" required />
                </div>
                <div style={styles.inputGroup}>
                    <label style={styles.label}>New Password</label>
                    <input style={styles.input} type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="Enter a new password" required />
                </div>
                <div style={styles.inputGroup}>
                    <label style={styles.label}>Confirm New Password</label>
                    <input style={styles.input} type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Confirm the new password" required />
                </div>
                <button type="submit" style={styles.button}>Update Password</button>
            </form>
        </div>
    );
}

export default SecuritySettings;