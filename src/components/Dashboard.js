// src/components/Dashboard.jsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { auth, db } from '../firebase';
import { doc, getDoc, collection, getDocs, query, where } from 'firebase/firestore';
import {
  FiSettings,
  FiLogOut,
  FiTrendingUp,
  FiTarget,
  FiBriefcase,
  FiPlusCircle,
  FiGrid,
  FiSearch,
  FiClock,
  FiEdit,
  FiArrowLeft
} from 'react-icons/fi';
import EmailVerificationBanner from './EmailVerificationBanner';
import apiClient from '../axiosConfig';
import CircularProgress from './CircularProgress';
import { useTheme } from '../context/ThemeContext';
import { useModal } from '../context/ModalContext';

const ProgressBar = ({ current, target }) => {
  const percentage = target > 0 ? (current / target) * 100 : 0;
  return (
    <div className="progress-bar-container">
      <div className="progress-bar-filled" style={{ width: `${percentage}%` }}></div>
    </div>
  );
};

function Dashboard({ handleLogout, userData }) {
  const { theme } = useTheme();
  const { showModal } = useModal();
  const navigate = useNavigate();

  const logoSrc = theme === 'light' ? '/logo-light-theme.png' : '/logo-dark-theme.png';
  const currentUser = auth.currentUser;

  const [projects, setProjects] = useState([]);
  const [myInvestments, setMyInvestments] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (!currentUser) return;

    const fetchData = async () => {
      // Projects
      const projectsCollectionRef = collection(db, 'projects');
      const projectsData = await getDocs(projectsCollectionRef);
      const projectsList = projectsData.docs.map(d => ({ ...d.data(), id: d.id }));
      setProjects(projectsList);

      // User investments (active only)
      const investmentsQuery = query(
        collection(db, 'investments'),
        where('userId', '==', currentUser.uid),
        where('status', '==', 'active')
      );
      const investmentsSnapshot = await getDocs(investmentsQuery);
      const userInvestments = investmentsSnapshot.docs.map(d => ({ ...d.data(), id: d.id }));

      // Join with project details
      const myInvestmentsWithDetails = userInvestments.map(investment => {
        const projectDetails = projectsList.find(p => p.id === investment.projectId);
        return { ...investment, ...projectDetails };
      });
      setMyInvestments(myInvestmentsWithDetails);
    };

    fetchData();
  }, [currentUser]);

  const handleAddMoney = async () => {
    if (!currentUser) return showModal('Please log in.');
    const amountStr = prompt('Enter amount:', '1000');
    if (!amountStr || isNaN(amountStr) || Number(amountStr) <= 0) return showModal('Please enter a valid amount.');
    const amount = Number(amountStr);

    try {
      const response = await apiClient.post('/payment/initialize', {
        email: currentUser.email,
        amount,
        callbackUrl: `${window.location.origin}/payment/callback`,
        metadata: { userId: currentUser.uid } // 🔹 for webhook correlation
      });
      window.location.href = response.data.data.authorization_url;
    } catch (error) {
      console.error('Error initializing payment:', error);
      showModal('Failed to start payment.');
    }
  };

  const filteredProjects = projects.filter(p =>
    (p.name || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="page-container">
      {/* Optional top notice */}
      {currentUser && !currentUser.emailVerified && <EmailVerificationBanner />}

      {/* Header */}
      <header
        style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}
      >
        {/* Left: Back + Brand */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          {/* Back to Landing (programmatic) */}
          <button
            onClick={() => navigate('/')}
            className="btn btn-secondary"
            aria-label="Back to Landing"
            style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}
          >
            <FiArrowLeft /> Home
          </button>

          {/* Logo links to LandingPage */}
          <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 12, textDecoration: 'none' }}>
            <img src={logoSrc} alt="Smart Farmer Logo" className="header-logo" />
          </Link>

          <div>
            <h1 style={{ margin: 0, fontWeight: 700 }}>
              Welcome, {userData?.firstName || userData?.email?.split('@')[0] || 'User'}!
            </h1>
            <p style={{ margin: '4px 0 0', color: 'var(--text-secondary)' }}>
              Let&apos;s make some green investments today.
            </p>
          </div>
        </div>

        {/* Right: Actions */}
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          {/* Redundant Home via Link (kept for mouse users who prefer anchor semantics) */}
          <Link to="/" className="btn btn-ghost">
            <FiTarget /> Landing
          </Link>

          {userData && userData.role === 'admin' && (
            <Link to="/admin" className="btn btn-admin">
              <FiGrid /> Admin Panel
            </Link>
          )}

          <Link to="/settings" className="btn btn-secondary">
            <FiSettings /> Settings
          </Link>

          <button onClick={handleLogout} className="btn btn-danger">
            <FiLogOut /> Logout
          </button>
        </div>
      </header>

      {/* Account summary */}
      <div className="card" style={{ marginBottom: '40px' }}>
        <h3 style={{ marginTop: 0 }}>
          <FiBriefcase /> Your Account Summary
        </h3>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <p style={{ margin: 0 }}>Available Wallet Balance</p>
            <p
              style={{
                margin: '4px 0 0',
                fontSize: '28px',
                fontWeight: 700,
                color: 'var(--accent-color)'
              }}
            >
              ₦{userData?.walletBalance?.toLocaleString() || 0}
            </p>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <Link to="/add-money" className="btn btn-primary">
              <FiPlusCircle /> Fund Wallet
            </Link>

            {/* If you prefer inline payment start, uncomment this and remove the Link above.
            <button onClick={handleAddMoney} className="btn btn-primary">
              <FiPlusCircle /> Add Money
            </button>
            */}
          </div>
        </div>
      </div>

      {/* Active investments */}
      {myInvestments.length > 0 && (
        <div className="your-investments-section">
          <h2 style={{ textAlign: 'left', margin: 0, marginBottom: '20px' }}>Your Active Investments</h2>
          <div className="investment-carousel">
            {myInvestments.map(investment => {
              // Guard if createdAt is a Firestore Timestamp
              const investmentDate =
                typeof investment.createdAt?.toDate === 'function'
                  ? investment.createdAt.toDate()
                  : new Date(investment.createdAt || Date.now());

              const maturityDate = new Date(investmentDate);
              maturityDate.setDate(maturityDate.getDate() + (investment.durationDays || 0));

              const totalDuration = Math.max(maturityDate - investmentDate, 1);
              const timeElapsed = Math.max(new Date() - investmentDate, 0);
              const percentage = Math.min((timeElapsed / totalDuration) * 100, 100);
              const daysLeft = Math.ceil((maturityDate - new Date()) / (1000 * 60 * 60 * 24));

              return (
                <Link to={`/project/${investment.projectId}`} key={investment.id} className="carousel-card-link">
                  <div className="card carousel-card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <p className="carousel-card-title">{investment.name}</p>
                      <CircularProgress percentage={percentage} />
                    </div>

                    <div style={{ marginTop: '15px' }}>
                      <p className="carousel-card-label">Amount Invested</p>
                      <p className="carousel-card-value">₦{Number(investment.amount || 0).toLocaleString()}</p>

                      <p className="carousel-card-label" style={{ marginTop: '10px' }}>
                        Days Left
                      </p>
                      <p className="carousel-card-value" style={{ color: 'var(--text-color)' }}>
                        {daysLeft > 0 ? `${daysLeft} days` : 'Matured'}
                      </p>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {/* Projects list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginTop: '40px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ textAlign: 'left', margin: 0 }}>Top Crops to Invest In</h2>

          <div className="search-bar-container">
            <FiSearch className="search-bar-icon" />
            <input
              type="text"
              placeholder="Search..."
              className="search-bar-input"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              aria-label="Search projects"
            />
          </div>
        </div>

        {filteredProjects.map(project => (
          <Link to={`/project/${project.id}`} key={project.id} className="project-link">
            <div className="card project-card-hover">
              <div className="project-card-header">
                <div className="project-card-info">
                  <h4 className="project-card-title">{project.name}</h4>
                  <p className="project-card-subtitle">
                    Risk Level: <b>{project.riskLevel}</b>
                  </p>
                </div>
              </div>

              <div className="project-card-stats">
                <span>
                  <FiTrendingUp className="accent-icon" /> {project.returnPercentage}% Return
                </span>
                <span>
                  <FiClock className="accent-icon" /> {project.durationDays} Days
                </span>
              </div>

              <ProgressBar current={Number(project.currentAmount || 0)} target={Number(project.targetAmount || 0)} />
              <p className="project-card-funding">
                ₦{Number(project.currentAmount || 0).toLocaleString()} / ₦
                {Number(project.targetAmount || 0).toLocaleString()}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

export default Dashboard;
