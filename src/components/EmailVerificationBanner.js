import React, { useState } from 'react';
import { auth } from '../firebase';
import { sendEmailVerification } from 'firebase/auth';
import { useModal } from '../context/ModalContext';

const styles = {
    banner: {
        backgroundColor: '#fff3cd',
        color: '#856404',
        padding: '15px',
        textAlign: 'center',
        width: '100%',
        maxWidth: '1200px',
        margin: '0 auto 20px auto',
        borderRadius: '8px',
        border: '1px solid #ffeeba'
    },
    button: {
        marginLeft: '15px',
        padding: '5px 10px',
        border: '1px solid #856404',
        borderRadius: '5px',
        backgroundColor: 'transparent',
        color: '#856404',
        fontWeight: 'bold',
        cursor: 'pointer'
    }
};
const { showModal } = useModal(); // Get the showModal function
function EmailVerificationBanner() {
    const [emailSent, setEmailSent] = useState(false);

    const handleSendVerification = async () => {
        try {
            await sendEmailVerification(auth.currentUser);
            setEmailSent(true);
            showModal('Verification email sent! Please check your inbox (and spam folder).');
        } catch (error) {
            console.error("Error sending verification email:", error);
            showModal('Failed to send verification email. Please try again later.');
        }
    };

    return (
        <div style={styles.banner}>
            Your email address is not verified.
            <button onClick={handleSendVerification} disabled={emailSent} style={styles.button}>
                {emailSent ? 'Email Sent' : 'Resend Verification Email'}
            </button>
        </div>
    );
}

export default EmailVerificationBanner;