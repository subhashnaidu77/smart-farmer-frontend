import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { auth, db } from '../firebase';
import { doc, getDoc, collection, getDocs, query, where, orderBy } from 'firebase/firestore';
import { FiSettings, FiLogOut, FiTrendingUp, FiTarget, FiBriefcase, FiPlusCircle, FiGrid, FiSearch, FiClock } from 'react-icons/fi';
import EmailVerificationBanner from './EmailVerificationBanner';
import apiClient from '../axiosConfig';
import CircularProgress from './CircularProgress';
import { useTheme } from '../context/ThemeContext'; 

const ProgressBar = ({ current, target }) => {
    const percentage = target > 0 ? (current / target) * 100 : 0;
    return ( <div className="progress-bar-container"><div className="progress-bar-filled" style={{ width: `${percentage}%` }}></div></div> );
};

function Dashboard({ handleLogout, userData }) {
    const { theme } = useTheme();
    const logoSrc = theme === 'light' ? '/logo-light-theme.png' : '/logo-dark-theme.png';
    const currentUser = auth.currentUser;
    const [projects, setProjects] = useState([]);
    const [myInvestments, setMyInvestments] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        if (!currentUser) return;
        const fetchData = async () => {
            const projectsCollectionRef = collection(db, "projects");
            const projectsData = await getDocs(projectsCollectionRef);
            const projectsList = projectsData.docs.map(doc => ({ ...doc.data(), id: doc.id }));
            setProjects(projectsList);
            
            const investmentsQuery = query(collection(db, "investments"), where("userId", "==", currentUser.uid), where("status", "==", "active"));
            const investmentsSnapshot = await getDocs(investmentsQuery);
            const userInvestments = investmentsSnapshot.docs.map(doc => ({...doc.data(), id: doc.id}));
            
            const myInvestmentsWithDetails = userInvestments.map(investment => {
                const projectDetails = projectsList.find(p => p.id === investment.projectId);
                return { ...investment, ...projectDetails };
            });
            setMyInvestments(myInvestmentsWithDetails);
        };
        fetchData();
    }, [currentUser]);

    const handleAddMoney = async () => {
        if (!currentUser) return alert("Please log in.");
        const amountStr = prompt("Enter amount:", "1000");
        if (!amountStr || isNaN(amountStr) || Number(amountStr) <= 0) return alert("Please enter a valid amount.");
        const amount = Number(amountStr);
        try {
            const response = await apiClient.post('/payment/initialize', {
                email: currentUser.email,
                amount: amount,
                callbackUrl: `${window.location.origin}/payment/callback`,
                metadata: {
                    userId: currentUser.uid // 🔹 Added userId for webhook
                }
            });
            window.location.href = response.data.data.authorization_url;
        } catch (error) {
            console.error("Error initializing payment:", error);
            alert("Failed to start payment.");
        }
    };

    const filteredProjects = projects.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));

    return (
        <div className="page-container">
            {currentUser && !currentUser.emailVerified && <EmailVerificationBanner />}
            <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
               <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <img src={logoSrc} alt="Smart Farmer Logo" className="header-logo" />
                <div>
                    <h1 style={{ margin: 0, fontWeight: 700 }}>Welcome, {userData?.firstName || userData?.email?.split('@')[0] || 'User'}!</h1>
                    <p style={{ margin: '4px 0 0', color: 'var(--text-secondary)' }}>Let's make some green investments today.</p>
                </div>
                </div>
                <div style={{ display: 'flex', gap: '15px' }}>
                    {userData && userData.role === 'admin' && (<Link to="/admin" className="btn btn-admin"><FiGrid /> Admin Panel</Link>)}
                    <Link to="/settings" className="btn btn-secondary"><FiSettings /> Settings</Link>
                    <button onClick={handleLogout} className="btn btn-danger"><FiLogOut /> Logout</button>
                </div>
            </header>
            
            <div className="card" style={{ marginBottom: '40px' }}>
                <h3 style={{ marginTop: 0 }}><FiBriefcase/> Your Account Summary</h3>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div>
                        <p style={{ margin: 0 }}>Available Wallet Balance</p>
                        <p style={{ margin: '4px 0 0', fontSize: '28px', fontWeight: '700', color: 'var(--accent-color)' }}>₦{userData?.walletBalance?.toLocaleString() || 0}</p>
                    </div>
                    <div style={{display: 'flex', gap: '10px'}}>
                     <Link to="/add-money" className="btn btn-secondary">
                            <FiEdit /> Add Manually
                        </Link>
                    <button onClick={handleAddMoney} className="btn btn-primary"><FiPlusCircle /> Add Money</button>
             
               </div>
                </div>
            </div>

            {myInvestments.length > 0 && (
                <div className="your-investments-section">
                    <h2 style={{ textAlign: 'left', margin: 0, marginBottom: '20px' }}>Your Active Investments</h2>
                    <div className="investment-carousel">
                        {myInvestments.map(investment => {
                            const investmentDate = investment.createdAt.toDate();
                            const maturityDate = new Date(investmentDate);
                            maturityDate.setDate(maturityDate.getDate() + investment.durationDays);
                            const totalDuration = maturityDate - investmentDate;
                            const timeElapsed = new Date() - investmentDate;
                            const percentage = Math.min((timeElapsed / totalDuration) * 100, 100);
                            const daysLeft = Math.ceil((maturityDate - new Date()) / (1000 * 60 * 60 * 24));

                            return (
                                <Link to={`/project/${investment.projectId}`} key={investment.id} className="carousel-card-link">
                                    <div className="card carousel-card">
                                        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                                            <p className="carousel-card-title">{investment.name}</p>
                                            <CircularProgress percentage={percentage} />
                                        </div>
                                        <div style={{marginTop: '15px'}}>
                                            <p className="carousel-card-label">Amount Invested</p>
                                            <p className="carousel-card-value">₦{investment.amount.toLocaleString()}</p>
                                            <p className="carousel-card-label" style={{marginTop: '10px'}}>Days Left</p>
                                            <p className="carousel-card-value" style={{color: 'var(--text-color)'}}>{daysLeft > 0 ? `${daysLeft} days` : 'Matured'}</p>
                                        </div>
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginTop: '40px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h2 style={{ textAlign: 'left', margin: 0 }}>Top Crops to Invest In</h2>
                    <div className="search-bar-container">
                        <FiSearch className="search-bar-icon" />
                        <input type="text" placeholder="Search..." className="search-bar-input" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                    </div>
                </div>
                {filteredProjects.map(project => (
                    <Link to={`/project/${project.id}`} key={project.id} className="project-link">
                       <div className="card project-card-hover">
                            <div className="project-card-header">
                                <div className="project-card-info">
                                    <h4 className="project-card-title">{project.name}</h4>
                                    <p className="project-card-subtitle">Risk Level: <b>{project.riskLevel}</b></p>
                                </div>
                            </div>
                            <div className="project-card-stats">
                                <span><FiTrendingUp className="accent-icon" /> {project.returnPercentage}% Return</span>
                                <span><FiClock className="accent-icon" /> {project.durationDays} Days</span>
                            </div>
                            <ProgressBar current={project.currentAmount} target={project.targetAmount} />
                            <p className="project-card-funding">₦{project.currentAmount?.toLocaleString()} / ₦{project.targetAmount?.toLocaleString()}</p>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
}

export default Dashboard;