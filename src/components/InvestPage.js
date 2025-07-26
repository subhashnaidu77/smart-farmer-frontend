import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { db, auth } from '../firebase';
import { collection, getDocs, query, where, orderBy } from 'firebase/firestore';
import { FiTrendingUp, FiTarget, FiSearch } from 'react-icons/fi';

const ProgressBar = ({ current, target }) => {
    const percentage = target > 0 ? (current / target) * 100 : 0;
    return (
        <div className="progress-bar-container">
            <div className="progress-bar-filled" style={{ width: `${percentage}%` }}></div>
        </div>
    );
};

function InvestPage() {
    const [allProjects, setAllProjects] = useState([]);
    const [myInvestments, setMyInvestments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeTab, setActiveTab] = useState('all'); // 'all' or 'my'
    const currentUser = auth.currentUser;

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            
            // Fetch all projects
            const projectsCollectionRef = collection(db, "projects");
            const projectsData = await getDocs(projectsCollectionRef);
            const projectsList = projectsData.docs.map(doc => ({ ...doc.data(), id: doc.id }));
            setAllProjects(projectsList);

            // Fetch user's investments if logged in
            if (currentUser) {
                const investmentsQuery = query(
                    collection(db, "investments"),
                    where("userId", "==", currentUser.uid)
                );
                const investmentsSnapshot = await getDocs(investmentsQuery);
                const userInvestments = investmentsSnapshot.docs.map(doc => doc.data());
                
                // Combine investment data with project details
                const myInvestmentsWithDetails = userInvestments.map(investment => {
                    const projectDetails = projectsList.find(p => p.id === investment.projectId);
                    return { ...investment, ...projectDetails };
                });
                setMyInvestments(myInvestmentsWithDetails);
            }
            
            setLoading(false);
        };
        fetchData();
    }, [currentUser]);

    const filteredProjects = allProjects.filter(project =>
        project.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const renderContent = () => {
        if (loading) {
            return <p>Loading...</p>;
        }
        
        if (activeTab === 'all') {
            return (
                <div className="investments-grid">
                    {filteredProjects.map(project => (
                        <Link to={`/project/${project.id}`} key={project.id} className="project-link">
                           <div className="card project-card-hover">
                                <div className="project-card-header">
                                    {/* <img src={project.imageUrl} alt={project.name} className="project-card-image" /> */}
                                    <div className="project-card-info">
                                        <h4 className="project-card-title">{project.name}</h4>
                                        <p className="project-card-subtitle">Risk Level: <b>{project.riskLevel}</b></p>
                                    </div>
                                </div>
                                <div className="project-card-stats">
                                    <span><FiTrendingUp className="accent-icon" /> {project.returnPercentage}% Return</span>
                                    <span><FiTarget className="accent-icon" /> {project.durationDays} Days</span>
                                </div>
                                <ProgressBar current={project.currentAmount} target={project.targetAmount} />
                                <p className="project-card-funding">₹{project.currentAmount?.toLocaleString()} / ₹{project.targetAmount?.toLocaleString()}</p>
                            </div>
                        </Link>
                    ))}
                </div>
            );
        }

        if (activeTab === 'my') {
            return myInvestments.length > 0 ? (
                <div className="investments-grid">
                    {myInvestments.map(investment => (
                        <Link to={`/project/${investment.projectId}`} key={investment.projectId} className="project-link">
                           <div className="card project-card-hover">
                                <div className="project-card-header">
                                    {/* <img src={investment.imageUrl} alt={investment.name} className="project-card-image" /> */}
                                    <div className="project-card-info">
                                        <h4 className="project-card-title">{investment.name}</h4>
                                        <p className="project-card-subtitle">You Invested: <b>₹{investment.amount.toLocaleString()}</b></p>
                                    </div>
                                </div>
                                <div className="project-card-stats">
                                    <span><FiTrendingUp className="accent-icon" /> {investment.returnPercentage}% Return</span>
                                    <span><FiTarget className="accent-icon" /> {investment.durationDays} Days</span>
                                </div>
                                <ProgressBar current={investment.currentAmount} target={investment.targetAmount} />
                                <p className="project-card-funding">{((investment.currentAmount / investment.targetAmount) * 100).toFixed(0)}% Funded</p>
                            </div>
                        </Link>
                    ))}
                </div>
            ) : (
                <div className="empty-state">
                    <h3>You haven't made any investments yet.</h3>
                    <p>Explore the "All Investment Opportunities" to get started.</p>
                </div>
            );
        }
    };

    return (
        <div className="page-container">
            <div className="invest-page-header">
                <div className="admin-tabs">
                    <button 
                        className={`admin-tab-btn ${activeTab === 'all' ? 'active' : ''}`}
                        onClick={() => setActiveTab('all')}
                    >
                        All Investment Opportunities
                    </button>
                    <button 
                        className={`admin-tab-btn ${activeTab === 'my' ? 'active' : ''}`}
                        onClick={() => setActiveTab('my')}
                    >
                        My Investments
                    </button>
                </div>
                <div className="search-bar-container">
                    <FiSearch className="search-bar-icon" />
                    <input 
                        type="text"
                        placeholder="Search for projects..."
                        className="search-bar-input"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {renderContent()}
        </div>
    );
}

export default InvestPage;