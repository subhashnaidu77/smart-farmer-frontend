import React, { useState, useEffect } from 'react';
import axios from 'axios';

function TransactionManagement() {
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchTransactions = async () => {
            setLoading(true);
            try {
                const response = await axios.get('http://localhost:4000/admin/transactions');
                setTransactions(response.data);
            } catch (err) {
                setError('Failed to fetch transactions.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchTransactions();
    }, []);

    if (loading) return <p>Loading all transactions...</p>;
    if (error) return <p style={{ color: '#dc3545' }}>{error}</p>;

    return (
        <div>
            <h2 style={{fontWeight: 600, marginTop: '10px'}}>All Platform Transactions</h2>
            <table className="admin-table">
                <thead>
                    <tr>
                        <th>User Email</th>
                        <th>Type</th>
                        <th>Amount</th>
                        <th>Details</th>
                        <th>Date</th>
                        <th>Status</th>
                    </tr>
                </thead>
                <tbody>
                    {transactions.map(tx => (
                        <tr key={tx.id}>
                            <td>{tx.email}</td>
                            <td><span className={`role-badge ${tx.type?.toLowerCase()}`}>{tx.type}</span></td>
                            <td>₹{tx.amount.toLocaleString()}</td>
                            <td>{tx.details}</td>
                            <td>{tx.createdAt ? new Date(tx.createdAt.seconds * 1000).toLocaleString() : 'N/A'}</td>
                            <td><span className={`role-badge ${tx.status?.toLowerCase()}`}>{tx.status}</span></td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export default TransactionManagement;