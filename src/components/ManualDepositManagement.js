import React, { useState, useEffect } from 'react';
import apiClient from '../axiosConfig';
import { FiCheckCircle, FiXCircle } from 'react-icons/fi';

function ManualDepositManagement() {
    const [deposits, setDeposits] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const fetchDeposits = async () => {
        setLoading(true);
        try {
            const response = await apiClient.get('/admin/manual-deposits');
            setDeposits(response.data);
        } catch (err) {
            setError('Failed to fetch deposit requests.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDeposits();
    }, []);

    const handleUpdateStatus = async (id, status, userId, amount) => {
        if (!window.confirm(`Are you sure you want to ${status} this request?`)) return;
        try {
            await apiClient.post('/admin/manual-deposits/update', { id, status, userId, amount });
            alert(`Request successfully marked as ${status}.`);
            fetchDeposits(); // Refresh the list
        } catch (error) {
            alert('Failed to update status.');
        }
    };

    if (loading) return <p>Loading pending deposit requests...</p>;
    if (error) return <p style={{ color: '#dc3545' }}>{error}</p>;

    return (
        <div>
            <h2 style={{fontWeight: 600, marginTop: '10px'}}>Manage Manual Deposit Requests</h2>
            {deposits.length === 0 ? (
                <p>No pending manual deposit requests found.</p>
            ) : (
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>User Email</th>
                            <th>Amount Sent</th>
                            <th>Sender's Name</th>
                            <th>Requested On</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {deposits.map(req => (
                            <tr key={req.id}>
                                <td>{req.email}</td>
                                <td>₦{req.amount.toLocaleString()}</td>
                                <td>{req.senderName}</td>
                                <td>{new Date(req.createdAt.seconds * 1000).toLocaleString()}</td>
                                <td>
                                    <button onClick={() => handleUpdateStatus(req.id, 'approved', req.userId, req.amount)} className="btn-icon btn-approve" title="Approve"><FiCheckCircle /></button>
                                    <button onClick={() => handleUpdateStatus(req.id, 'rejected', req.userId, req.amount)} className="btn-icon btn-delete" title="Reject"><FiXCircle /></button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
}

export default ManualDepositManagement;