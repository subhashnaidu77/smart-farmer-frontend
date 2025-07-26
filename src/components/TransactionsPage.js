import React, { useState, useEffect, useCallback } from 'react';
import { auth, db } from '../firebase';
import { collection, query, where, orderBy, getDocs } from 'firebase/firestore';
import { FiArrowDownCircle, FiArrowUpCircle, FiTrendingUp } from 'react-icons/fi';

const TransactionIcon = ({ type }) => {
    const iconStyle = { fontSize: '24px', marginRight: '20px' };
    switch (type) {
        case 'Deposit':
            return <FiArrowDownCircle style={{ ...iconStyle, color: '#28a745' }} />;
        case 'Withdrawal':
            return <FiArrowUpCircle style={{ ...iconStyle, color: '#dc3545' }} />;
        case 'Investment':
            return <FiTrendingUp style={{ ...iconStyle, color: '#007bff' }} />;
        default:
            return null;
    }
};

function TransactionsPage() {
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('All');
    const currentUser = auth.currentUser;

    const fetchTransactions = useCallback(async () => {
        if (!currentUser) {
            setLoading(false);
            return;
        }
        setLoading(true);
        try {
            const transactionsQuery = query(
                collection(db, "transactions"),
                where("userId", "==", currentUser.uid),
                orderBy("createdAt", "desc")
            );
            const querySnapshot = await getDocs(transactionsQuery);
            const transactionsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setTransactions(transactionsData);
        } catch (err) {
            console.error("Error fetching transactions: This might be due to a missing Firestore index. Please check the browser console for an error message with a link to create the index.", err);
        } finally {
            setLoading(false);
        }
    }, [currentUser]);

    useEffect(() => {
        fetchTransactions();
    }, [fetchTransactions]);

    const filteredTransactions = transactions.filter(tx => {
        if (filter === 'All') return true;
        return tx.type === filter;
    });

    return (
        <div className="page-container">
            <h1 style={{ marginBottom: '30px' }}>Transaction History</h1>
            <div className="card">
                <div style={{ marginBottom: '30px', display: 'flex', gap: '10px', borderBottom: '1px solid var(--border-color)', paddingBottom: '20px' }}>
                    <button className={`btn ${filter === 'All' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setFilter('All')}>All</button>
                    <button className={`btn ${filter === 'Deposit' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setFilter('Deposit')}>Deposits</button>
                    <button className={`btn ${filter === 'Investment' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setFilter('Investment')}>Investments</button>
                </div>

                {loading && <p>Loading transactions...</p>}
                {!loading && filteredTransactions.length === 0 && (
                    <div style={{ textAlign: 'center', padding: '40px' }}>
                        <p style={{fontSize: '1.2em', fontWeight: '500'}}>No transactions found.</p>
                        <p>Your transaction history will appear here once you make a deposit or investment.</p>
                    </div>
                )}
                <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                    {filteredTransactions.map(tx => (
                        <li key={tx.id} style={{ display: 'flex', alignItems: 'center', padding: '15px 5px', borderBottom: '1px solid var(--border-color)' }}>
                            <TransactionIcon type={tx.type} />
                            <div style={{ flex: 1 }}>
                                <p style={{ fontWeight: '600', margin: 0, color: 'var(--text-color)' }}>{tx.details || tx.type}</p>
                                <p style={{ fontSize: '14px', margin: '4px 0 0' }}>
                                    {tx.createdAt ? new Date(tx.createdAt.seconds * 1000).toLocaleString() : 'Date not available'}
                                </p>
                            </div>
                            <span style={{ fontSize: '1.1em', fontWeight: '600', color: tx.type === 'Deposit' ? '#28a745' : 'var(--text-color)' }}>
                                {tx.type === 'Deposit' ? '+' : '-'}₹{tx.amount.toLocaleString()}
                            </span>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
}

export default TransactionsPage;