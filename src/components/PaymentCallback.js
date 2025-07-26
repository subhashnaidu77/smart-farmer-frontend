import React, { useEffect, useState, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';

const styles = {
    container: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '80vh',
        textAlign: 'center'
    },
    message: {
        fontSize: '1.5em',
        fontWeight: '500',
        marginBottom: '20px'
    }
};

function PaymentCallback() {
    const [status, setStatus] = useState('Verifying your payment, please wait...');
    const location = useLocation();
    const navigate = useNavigate();
    const effectRan = useRef(false); // This ref tracks if the verification has already run

    useEffect(() => {
        // This check ensures the verification runs only ONCE,
        // preventing the double-payment issue in React's development mode.
        if (effectRan.current === false) {
            const verifyPayment = async () => {
                const searchParams = new URLSearchParams(location.search);
                const reference = searchParams.get('reference');

                if (!reference) {
                    setStatus('Payment reference not found. Redirecting...');
                    setTimeout(() => navigate('/dashboard'), 3000);
                    return;
                }

                try {
                    // Call our backend to verify the payment
                    await axios.get(`http://localhost:4000/payment/verify/${reference}`);
                    setStatus('Payment successful! Your wallet has been updated. Redirecting...');
                } catch (error) {
                    console.error("Payment verification failed:", error);
                    setStatus('Payment verification failed. Please contact support. Redirecting...');
                } finally {
                    // Redirect back to the dashboard after a few seconds
                    setTimeout(() => navigate('/dashboard'), 3000);
                }
            };

            verifyPayment();

            // Mark that the effect has run so it doesn't run again
            return () => {
                effectRan.current = true;
            };
        }
    }, [location, navigate]);

    return (
        <div style={styles.container}>
            <h2 style={styles.message}>{status}</h2>
        </div>
    );
}

export default PaymentCallback;