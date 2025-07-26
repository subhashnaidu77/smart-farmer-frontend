import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import EditProfile from './EditProfile';
import SecuritySettings from './SecuritySettings';
import AppearanceSettings from './AppearanceSettings';
import NotificationsSettings from './NotificationsSettings';
import WithdrawalSettings from './WithdrawalSettings';
import DeleteAccount from './DeleteAccount';
import Referrals from './Referrals'; // Import the new component
import { FiUser, FiShield, FiEye, FiBell, FiCreditCard, FiTrash2, FiGift, FiArrowLeft } from 'react-icons/fi';

function Settings({ userData, refreshUserData }) {
    const [activeTab, setActiveTab] = useState('profile');

    const menuItems = [
        { id: 'profile', label: 'Edit Profile', icon: <FiUser /> },
        { id: 'security', label: 'Security', icon: <FiShield /> },
        { id: 'appearance', label: 'Appearance', icon: <FiEye /> },
        { id: 'notifications', label: 'Notifications', icon: <FiBell /> },
        { id: 'withdrawals', label: 'Withdrawals', icon: <FiCreditCard /> },
        { id: 'referrals', label: 'Referrals', icon: <FiGift /> }, // Added new menu item
        { id: 'deleteAccount', label: 'Delete Account', icon: <FiTrash2 />, className: 'danger-zone' },
    ];

    const renderContent = () => {
        switch (activeTab) {
            case 'profile': return <EditProfile refreshUserData={refreshUserData} />;
            case 'security': return <SecuritySettings />;
            case 'appearance': return <AppearanceSettings />;
            case 'notifications': return <NotificationsSettings />;
            case 'withdrawals': return <WithdrawalSettings />;
            case 'referrals': return <Referrals userData={userData} />; // Added new case
            case 'deleteAccount': return <DeleteAccount />;
            default: return <EditProfile refreshUserData={refreshUserData} />;
        }
    };

    return (
        <div className="page-container settings-container">
            <div className="settings-top-bar">
                <Link to="/dashboard" className="btn btn-secondary"><FiArrowLeft /> Back to Dashboard</Link>
                <div>
                    <h1 style={{margin: 0}}>Account Settings</h1>
                    {userData && <p style={{margin: '4px 0 0', color: 'var(--text-secondary)'}}>{userData.email}</p>}
                </div>
            </div>
            <div className="settings-content-wrapper">
                <aside className="settings-nav">
                    {menuItems.map(item => (
                        <button 
                            key={item.id} 
                            className={`settings-nav-btn ${activeTab === item.id ? 'active' : ''} ${item.className || ''}`} 
                            onClick={() => setActiveTab(item.id)}
                        >
                            {item.icon} {item.label}
                        </button>
                    ))}
                </aside>
                <main className="card settings-main-content">
                    {renderContent()}
                </main>
            </div>
        </div>
    );
}

export default Settings;