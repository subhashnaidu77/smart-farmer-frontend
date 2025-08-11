import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

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
    const [status, setStatus] = useState('Thank you for your payment. We are processing it now.');
    const navigate = useNavigate();

    useEffect(() => {
        // This page now just waits and then redirects.
        // The actual wallet update happens in the background via the webhook.
        setStatus('Your wallet will be updated in a few moments. Redirecting you to the dashboard...');

        setTimeout(() => {
            navigate('/dashboard');
        }, 4000); // Wait 4 seconds before redirecting
    }, [navigate]);

    return (
        <div style={styles.container}>
            <h2 style={styles.message}>{status}</h2>
        </div>
    );
}

export default PaymentCallback;