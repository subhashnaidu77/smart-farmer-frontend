import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import ProjectManagement from './ProjectManagement';
import UserManagement from './UserManagement';
import WithdrawalManagement from './WithdrawalManagement';
import SystemActions from './SystemActions';
import TransactionManagement from './TransactionManagement'; // Import the new component
import { FiArrowLeft, FiBox, FiUsers, FiCreditCard, FiCpu, FiList } from 'react-icons/fi'; // Import new icon
import { useTheme } from '../context/ThemeContext';
function AdminDashboard() {
    const [activeTab, setActiveTab] = useState('projects');
     const { theme } = useTheme();
const logoSrc = theme === 'light' ? '/logo-light-theme.png' : '/logo-dark-theme.png'; // Choose logo based on theme
    return (
        <div className="page-container">
            <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
               <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    {/* --- LOGO ADDED HERE --- */}
                    <img src={logoSrc} alt="Smart Farmer Logo" className="header-logo" />
                    <div>
                        <h1 style={{ margin: 0, fontWeight: 700 }}>Admin Panel</h1>
                        <p style={{ margin: '4px 0 0', color: 'var(--text-secondary)' }}>Manage your platform data.</p>
                    </div>
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