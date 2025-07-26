import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { auth, db } from '../firebase';
import { doc, getDoc, collection, getDocs, query, where, orderBy, addDoc, serverTimestamp, updateDoc, increment } from 'firebase/firestore';
import { FiSettings, FiLogOut, FiTrendingUp, FiTarget, FiBriefcase, FiPlusCircle, FiGrid, FiSearch } from 'react-icons/fi';
import EmailVerificationBanner from './EmailVerificationBanner';
import apiClient from '../axiosConfig';

const ProgressBar = ({ current, target }) => {
    const percentage = target > 0 ? (current / target) * 100 : 0;
    return ( <div className="progress-bar-container"><div className="progress-bar-filled" style={{ width: `${percentage}%` }}></div></div> );
};

// We receive handleLogout and userData as props here
function Dashboard({ handleLogout, userData }) {
    const currentUser = auth.currentUser;
    const [projects, setProjects] = useState([]);
    const [myInvestments, setMyInvestments] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        if (!currentUser) return;
        const projectsCollectionRef = collection(db, "projects");
        const getProjects = async () => {
            const data = await getDocs(projectsCollectionRef);
            setProjects(data.docs.map(doc => ({ ...doc.data(), id: doc.id })));
        };
        const fetchMyInvestments = async () => {
            const investmentsQuery = query(
                collection(db, "investments"),
                where("userId", "==", currentUser.uid),
                orderBy("createdAt", "desc")
            );
            const querySnapshot = await getDocs(investmentsQuery);
            setMyInvestments(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        };
        getProjects();
        fetchMyInvestments();
    }, [currentUser]);

    const handleAddMoney = async () => {
        if (!currentUser) return alert("Please log in to add money.");
        const amountStr = prompt("Please enter the amount you want to deposit:", "1000");
        if (!amountStr || isNaN(amountStr) || Number(amountStr) <= 0) return alert("Please enter a valid amount.");
        const amount = Number(amountStr);
        try {
            const response = await apiClient.post('/payment/initialize', {
                email: currentUser.email,
                amount: amount,
            });
            const { authorization_url } = response.data.data;
            window.location.href = authorization_url;
        } catch (error) {
            console.error("Error initializing payment:", error);
            alert("Failed to start payment. Please ensure the backend is running.");
        }
    };

    const getProjectName = (projectId) => {
        const project = projects.find(p => p.id === projectId);
        return project ? project.name : 'Unknown Project';
    };

    const filteredProjects = projects.filter(project =>
        project.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="page-container">
            {currentUser && !currentUser.emailVerified && <EmailVerificationBanner />}
            <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
                <div>
                    <h1 style={{ margin: 0, fontWeight: 700 }}>Welcome, {userData?.firstName || userData?.email?.split('@')[0] || 'User'}!</h1>
                    <p style={{ margin: '4px 0 0', color: 'var(--text-secondary)' }}>Let's make some green investments today.</p>
                </div>
                <div style={{ display: 'flex', gap: '15px' }}>
                    {userData && userData.role === 'admin' && (
                        <Link to="/admin" className="btn btn-admin"><FiGrid /> Admin Panel</Link>
                    )}
                    <Link to="/settings" className="btn btn-secondary"><FiSettings /> Settings</Link>
                    {/* The onClick here uses the handleLogout function passed from App.js */}
                    <button onClick={handleLogout} className="btn btn-danger"><FiLogOut /> Logout</button>
                </div>
            </header>
            <div className="card" style={{ marginBottom: '30px' }}>
                <h3 style={{ marginTop: 0, display: 'flex', alignItems: 'center', gap: '10px' }}><FiBriefcase/> Your Account Summary</h3>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div>
                        <p style={{ margin: 0, color: 'var(--text-secondary)' }}>Available Wallet Balance</p>
                        <p style={{ margin: '4px 0 0', fontSize: '28px', fontWeight: '700', color: 'var(--accent-color)' }}>₹{userData?.walletBalance?.toLocaleString() || 0}</p>
                    </div>
                    <button onClick={handleAddMoney} className="btn btn-primary"><FiPlusCircle /> Add Money</button>
                </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '30px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h2 style={{ textAlign: 'left', margin: 0 }}>Available Projects to Invest In</h2>
                        <div className="search-bar-container">
                            <FiSearch className="search-bar-icon" />
                            <input type="text" placeholder="Search for projects..." className="search-bar-input" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                        </div>
                    </div>
                    {filteredProjects.map(project => (
                        <Link to={`/project/${project.id}`} key={project.id} style={{ textDecoration: 'none', color: 'inherit' }}>
                           <div className="card project-card-hover">
                                <div style={{ display: 'flex', gap: '20px', alignItems: 'center', marginBottom: '15px' }}>
                                    {/* <img src={project.imageUrl} alt={project.name} style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '8px' }} /> */}
                                    <div style={{ flex: 1 }}>
                                        <h4 style={{ margin: 0 }}>{project.name}</h4>
                                        <p style={{ fontSize: '14px', margin: '4px 0 0', color: 'var(--text-secondary)' }}>Risk Level: <b>{project.riskLevel}</b></p>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', marginBottom: '15px' }}>
                                    <span><FiTrendingUp style={{ color: 'var(--accent-color)' }} /> {project.returnPercentage}% Return</span>
                                    <span><FiTarget style={{ color: 'var(--accent-color)' }} /> {project.durationDays} Days</span>
                                </div>
                                <ProgressBar current={project.currentAmount} target={project.targetAmount} />
                                <p style={{ fontSize: '12px', textAlign: 'right', margin: '4px 0 0', color: 'var(--text-secondary)' }}>₹{project.currentAmount?.toLocaleString()} / ₹{project.targetAmount?.toLocaleString()}</p>
                            </div>
                        </Link>
                    ))}
                </div>
                <div className="card">
                    <h3 style={{ marginTop: 0 }}>My Recent Investments</h3>
                    <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '15px' }}>
                        {myInvestments.length > 0 ? myInvestments.map(inv => (
                            <li key={inv.id} style={{ paddingBottom: '15px', borderBottom: '1px solid var(--border-color)' }}>
                                <p style={{ margin: 0, fontWeight: '500' }}>{getProjectName(inv.projectId)}</p>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{new Date(inv.createdAt.seconds * 1000).toLocaleDateString()}</span>
                                    <span style={{ fontWeight: '600', color: 'var(--accent-color)' }}>₹{inv.amount.toLocaleString()}</span>
                                </div>
                            </li>
                        )) : <p>You haven't made any investments yet.</p>}
                    </ul>
                </div>
            </div>
        </div>
    );
}

export default Dashboard;