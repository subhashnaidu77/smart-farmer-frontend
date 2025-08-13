import React from 'react';
import { auth, db } from '../firebase';
import { EmailAuthProvider, reauthenticateWithCredential, deleteUser } from 'firebase/auth';
import { doc, deleteDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { useModal } from '../context/ModalContext';

const styles = {
    container: { padding: '20px', border: '2px solid #dc3545', borderRadius: '8px', backgroundColor: '#f8d7da' },
    title: { color: '#721c24' },
    text: { color: '#721c24' },
    button: { width: '100%', padding: '15px', marginTop: '20px', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '16px', fontWeight: 'bold' }
};
const { showModal } = useModal(); // Get the showModal function
function DeleteAccount() {
    const navigate = useNavigate();

    const handleDeleteAccount = async () => {
        const confirmation = window.confirm("ARE YOU ABSOLUTELY SURE? This action cannot be undone. All your investments and data will be permanently deleted.");
        if (!confirmation) return;

        const password = prompt("To confirm, please enter your password:");
        if (!password) return;

        const user = auth.currentUser;
        const credential = EmailAuthProvider.credential(user.email, password);

        try {
            // Step 1: Re-authenticate to confirm identity
            await reauthenticateWithCredential(user, credential);

            // Step 2: Delete Firestore document
            const userDocRef = doc(db, 'users', user.uid);
            await deleteDoc(userDocRef);

            // Step 3: Delete user from Firebase Auth
            await deleteUser(user);

            showModal("Your account has been permanently deleted.");
            navigate('/login');

        } catch (error) {
            if (error.code === 'auth/wrong-password') {
                showModal("Incorrect password. Account deletion failed.");
            } else {
                showModal("An error occurred. Could not delete account.");
            }
            console.error("Error deleting account:", error);
        }
    };

    return (
        <div style={styles.container}>
            <h2 style={styles.title}>Delete Account</h2>
            <p style={styles.text}>Once you delete your account, there is no going back. Please be certain.</p>
            <button onClick={handleDeleteAccount} style={styles.button}>Delete My Account Permanently</button>
        </div>
    );
}

export default DeleteAccount;