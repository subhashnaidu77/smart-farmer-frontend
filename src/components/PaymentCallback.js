import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

function PaymentCallback() {
    const [status, setStatus] = useState('Thank you for your payment. We are processing it now.');
    const navigate = useNavigate();

    useEffect(() => {
        // This page just waits and then redirects.
        // The actual wallet update happens in the background via the webhook.
        setStatus('Your wallet will be updated in a few moments. Redirecting you to the dashboard...');

        setTimeout(() => {
            navigate('/dashboard');
        }, 4000); // Wait 4 seconds before redirecting
    }, [navigate]);

    return (
        <div className="page-container" style={{textAlign: 'center', paddingTop: '100px'}}>
            <h2>{status}</h2>
        </div>
    );
}

export default PaymentCallback;