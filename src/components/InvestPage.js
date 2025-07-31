import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { db, auth } from '../firebase';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { FiTrendingUp, FiTarget, FiSearch, FiClock } from 'react-icons/fi';
import CircularProgress from './CircularProgress';

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
    const [activeTab, setActiveTab] = useState('all');
    const currentUser = auth.currentUser;

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            const projectsCollectionRef = collection(db, "projects");
            const projectsData = await getDocs(projectsCollectionRef);
            const projectsList = projectsData.docs.map(doc => ({ ...doc.data(), id: doc.id }));
            setAllProjects(projectsList);

            if (currentUser) {
                const investmentsQuery = query(collection(db, "investments"), where("userId", "==", currentUser.uid), where("status", "==", "active"));
                const investmentsSnapshot = await getDocs(investmentsQuery);
                const userInvestments = investmentsSnapshot.docs.map(doc => ({...doc.data(), id: doc.id}));
                
                const myInvestmentsWithDetails = userInvestments
                    .map(investment => {
                        const projectDetails = projectsList.find(p => p.id === investment.projectId);
                        // If projectDetails are found, combine them
                        if (projectDetails) {
                            return { ...investment, ...projectDetails };
                        }
                        // If the project was deleted, return null
                        return null;
                    })
                    .filter(Boolean); // This line removes any null entries

                setMyInvestments(myInvestmentsWithDetails);
            }
            setLoading(false);
        };
        fetchData();
    }, [currentUser]);

    const filteredProjects = (activeTab === 'all' ? allProjects : myInvestments).filter(project =>
        project && project.name && project.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const renderContent = () => {
        if (loading) return <p>Loading...</p>;

        const projectsToDisplay = filteredProjects;

        if (projectsToDisplay.length === 0) {
            return (
                <div className="empty-state">
                    <h3>{activeTab === 'all' ? "No Projects Found" : "You have no active investments."}</h3>
                    <p>{activeTab === 'all' ? "Check back later for new opportunities." : 'Explore the "All Opportunities" tab to get started.'}</p>
                </div>
            );
        }

        return (
            <div className="investments-grid">
                {projectsToDisplay.map(project => (
                    <Link to={`/project/${project.id}`} key={project.id} className="project-link">
                       <div className="card project-card-hover">
                            <div className="project-card-header">
                                <div className="project-card-info">
                                    <h4 className="project-card-title">{project.name}</h4>
                                    <p className="project-card-subtitle">
                                        {activeTab === 'my' ? `You Invested: ₦${project.amount.toLocaleString()}` : `Risk Level: ${project.riskLevel}`}
                                    </p>
                                </div>
                                <CircularProgress percentage={(project.currentAmount / project.targetAmount) * 100} />
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
        );
    };

    return (
        <div className="page-container">
            <div className="invest-page-header">
                <div className="admin-tabs">
                    <button className={`admin-tab-btn ${activeTab === 'all' ? 'active' : ''}`} onClick={() => setActiveTab('all')}>All Opportunities</button>
                    <button className={`admin-tab-btn ${activeTab === 'my' ? 'active' : ''}`} onClick={() => setActiveTab('my')}>My Active Investments</button>
                </div>
                <div className="search-bar-container">
                    <FiSearch className="search-bar-icon" />
                    <input type="text" placeholder="Search..." className="search-bar-input" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                </div>
            </div>
            {renderContent()}
        </div>
    );
}
export default InvestPage;