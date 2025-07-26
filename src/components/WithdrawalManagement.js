import React, { useState, useEffect } from 'react';
import apiClient from '../axiosConfig'; 
import { FiCheckCircle, FiXCircle } from 'react-icons/fi';

function WithdrawalManagement() {
    const [withdrawals, setWithdrawals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const fetchWithdrawals = async () => {
        setLoading(true);
        try {
            const response = await apiClient.get('/admin/withdrawals');
            setWithdrawals(response.data);
        } catch (err) {
            setError('Failed to fetch withdrawal requests.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchWithdrawals();
    }, []);

    const handleUpdateStatus = async (id, status) => {
        if (!window.confirm(`Are you sure you want to mark this request as '${status}'?`)) return;
        try {
            await apiClient.post('/admin/withdrawals/update', { id, status });
            alert(`Request successfully marked as ${status}.`);
            fetchWithdrawals(); // Refresh the list
        } catch (error) {
            alert('Failed to update status.');
        }
    };

    if (loading) return <p>Loading withdrawal requests...</p>;
    if (error) return <p style={{ color: '#dc3545' }}>{error}</p>;

    return (
        <div>
            <h2 style={{fontWeight: 600, marginTop: '10px'}}>Manage Withdrawal Requests</h2>
            <table className="admin-table">
                <thead>
                    <tr>
                        <th>User Email</th>
                        <th>Amount</th>
                        <th>Bank Details</th>
                        <th>Requested On</th>
                        <th>Status</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {withdrawals.map(req => (
                        <tr key={req.id}>
                            <td>{req.email}</td>
                            <td>₹{req.amount.toLocaleString()}</td>
                            <td>{req.bankDetails?.bankName} - {req.bankDetails?.accountNumber}</td>
                            <td>{req.createdAt ? new Date(req.createdAt.seconds * 1000).toLocaleString() : 'N/A'}</td>
                            <td><span className={`role-badge ${req.status}`}>{req.status}</span></td>
                            <td>
                                {req.status === 'pending' && (
                                    <>
                                        <button onClick={() => handleUpdateStatus(req.id, 'approved')} className="btn-icon btn-approve" title="Approve"><FiCheckCircle /></button>
                                        <button onClick={() => handleUpdateStatus(req.id, 'rejected')} className="btn-icon btn-delete" title="Reject"><FiXCircle /></button>
                                    </>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export default WithdrawalManagement;