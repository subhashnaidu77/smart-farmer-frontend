import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import ProjectManagement from './ProjectManagement';
import UserManagement from './UserManagement';
import WithdrawalManagement from './WithdrawalManagement';
import SystemActions from './SystemActions';
import TransactionManagement from './TransactionManagement'; // Import the new component
import { FiArrowLeft, FiBox, FiUsers, FiCreditCard, FiCpu, FiList } from 'react-icons/fi'; // Import new icon

function AdminDashboard() {
    const [activeTab, setActiveTab] = useState('projects');

    return (
        <div className="page-container">
            <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
                <div>
                    <h1 style={{ margin: 0, fontWeight: 700 }}>Admin Panel</h1>
                    <p style={{ margin: '4px '
                    }}>Manage your platform data.</p>
                </div>
                <Link to="/dashboard" className="btn btn-secondary">
                    <FiArrowLeft /> Back to User Dashboard
                </Link>
            </header>
            
            <div className="card">
                <div className="admin-tabs">
                    <button className={`admin-tab-btn ${activeTab === 'projects' ? 'active' : ''}`} onClick={() => setActiveTab('projects')}><FiBox /> Project Management</button>
                    <button className={`admin-tab-btn ${activeTab === 'users' ? 'active' : ''}`} onClick={() => setActiveTab('users')}><FiUsers /> User Management</button>
                    <button className={`admin-tab-btn ${activeTab === 'withdrawals' ? 'active' : ''}`} onClick={() => setActiveTab('withdrawals')}><FiCreditCard /> Withdrawal Management</button>
                    <button className={`admin-tab-btn ${activeTab === 'transactions' ? 'active' : ''}`} onClick={() => setActiveTab('transactions')}><FiList /> Transaction Management</button>
                    <button className={`admin-tab-btn ${activeTab === 'system' ? 'active' : ''}`} onClick={() => setActiveTab('system')}><FiCpu /> System Actions</button>
                </div>

                <div className="admin-tab-content">
                    {activeTab === 'projects' && <ProjectManagement />}
                    {activeTab === 'users' && <UserManagement />}
                    {activeTab === 'withdrawals' && <WithdrawalManagement />}
                    {activeTab === 'transactions' && <TransactionManagement />}
                    {activeTab === 'system' && <SystemActions />}
                </div>
            </div>
        </div>
    );
}

export default AdminDashboard;