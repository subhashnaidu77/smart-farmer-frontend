import React, { useState } from 'react';
import apiClient from '../axiosConfig'; 

function SystemActions() {
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');

    const handleProcessPayouts = async () => {
        if (!window.confirm("Are you sure you want to run the payout process? This will pay out all matured investments.")) return;
        setLoading(true);
        setMessage('');
        try {
            const response = await apiClient.post('/system/process-payouts');
            setMessage(response.data.message);
        } catch (error) {
            setMessage(error.response?.data?.message || 'An error occurred.');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <h2 style={{fontWeight: 600}}>System Actions</h2>
            <p>These actions should be run with caution. They affect the entire system.</p>
            <div className="card">
                <h4 style={{marginTop: 0}}>Process Investment Payouts</h4>
                <p>Find all investments that have completed their duration and pay the returns to the user's wallet.</p>
                <button className="btn btn-danger" onClick={handleProcessPayouts} disabled={loading}>
                    {loading ? 'Processing...' : 'Run Payout Process'}
                </button>
                {message && <p style={{marginTop: '15px', fontWeight: '500'}}>{message}</p>}
            </div>
        </div>
    );
}

export default SystemActions;