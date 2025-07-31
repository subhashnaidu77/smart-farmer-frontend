import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { doc, getDoc, runTransaction, collection, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { FiArrowLeft, FiTrendingUp, FiClock, FiTarget, FiPackage, FiDollarSign } from 'react-icons/fi';
import ROICalculator from './ROICalculator';

const StatCard = ({ icon, label, value }) => (
    <div className="stat-card">
        <div className="stat-card-icon">{icon}</div>
        <div>
            <p className="stat-card-label">{label}</p>
            <p className="stat-card-value">{value}</p>
        </div>
    </div>
);

function ProjectDetail() {
    const { projectId } = useParams();
    const [project, setProject] = useState(null);
    const [units, setUnits] = useState('');
    const [loading, setLoading] = useState(true);
    const [investing, setInvesting] = useState(false);
    const [statusMessage, setStatusMessage] = useState({ text: '', type: '' });
    const [walletBalance, setWalletBalance] = useState(0);
    const currentUser = auth.currentUser;

    useEffect(() => {
        const fetchProjectAndUser = async () => {
            if (currentUser) {
                const userRef = doc(db, 'users', currentUser.uid);
                const userSnap = await getDoc(userRef);
                if (userSnap.exists()) {
                    setWalletBalance(userSnap.data().walletBalance);
                }
            }
            const docRef = doc(db, 'projects', projectId);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                setProject({ id: docSnap.id, ...docSnap.data() });
            }
            setLoading(false);
        };
        fetchProjectAndUser();
    }, [projectId, currentUser]);

    const handleInvestNow = async () => {
        if (!project) return;
        const numberOfUnits = parseInt(units, 10);
        if (isNaN(numberOfUnits) || numberOfUnits <= 0) {
            setStatusMessage({ text: 'Please enter a valid number of units.', type: 'error' });
            return;
        }
        const investmentAmount = numberOfUnits * project.pricePerUnit;
        if (numberOfUnits > project.availableUnits) {
            setStatusMessage({ text: 'Number of units exceeds available units.', type: 'error' });
            return;
        }
        if (investmentAmount > walletBalance) {
            setStatusMessage({ text: 'Insufficient wallet balance for this number of units.', type: 'error' });
            return;
        }
        setInvesting(true);
        setStatusMessage({ text: 'Processing...', type: 'info' });
        try {
            await runTransaction(db, async (transaction) => {
                const projectRef = doc(db, 'projects', projectId);
                const userRef = doc(db, 'users', currentUser.uid);
                const projectDoc = await transaction.get(projectRef);
                const userDoc = await transaction.get(userRef);
                if (!projectDoc.exists() || !userDoc.exists()) throw new Error("Document not found");
                const newProjectAmount = projectDoc.data().currentAmount + investmentAmount;
                const newUserBalance = userDoc.data().walletBalance - investmentAmount;
                const newAvailableUnits = projectDoc.data().availableUnits - numberOfUnits;
                if (newUserBalance < 0) throw new Error("Insufficient funds.");
                if (newAvailableUnits < 0) throw new Error("Units no longer available.");
                transaction.update(projectRef, { currentAmount: newProjectAmount, availableUnits: newAvailableUnits });
                transaction.update(userRef, { walletBalance: newUserBalance });
                const newInvestmentRef = doc(collection(db, "investments"));
                transaction.set(newInvestmentRef, { projectId, userId: currentUser.uid, amount: investmentAmount, units: numberOfUnits, createdAt: serverTimestamp(), status: 'active' });
                const newTransactionRef = doc(collection(db, "transactions"));
                transaction.set(newTransactionRef, { userId: currentUser.uid, type: 'Investment', amount: investmentAmount, status: 'Completed', createdAt: serverTimestamp(), details: `${numberOfUnits} units in ${projectDoc.data().name}` });
            });
            setProject(prev => ({ ...prev, currentAmount: prev.currentAmount + investmentAmount, availableUnits: prev.availableUnits - numberOfUnits }));
            setWalletBalance(prev => prev - investmentAmount);
            setUnits('');
            setStatusMessage({ text: 'Investment successful!', type: 'success' });
        } catch (error) {
            console.error("Error investing:", error);
            setStatusMessage({ text: `Failed to invest: ${error.message}`, type: 'error' });
        } finally {
            setInvesting(false);
            setTimeout(() => setStatusMessage({ text: '', type: '' }), 5000);
        }
    };
    
    if (loading) return <div className="page-container"><h2>Loading Project...</h2></div>;
    if (!project) return <div className="page-container"><h2>Project Not Found</h2></div>;

    const fundingPercentage = project.targetAmount > 0 ? (project.currentAmount / project.targetAmount) * 100 : 0;

    return (
        <div className="page-container project-detail-page">
            <Link to="/invest" className="back-link"><FiArrowLeft /> Back to Investments</Link>
            <div className="project-detail-header">
                <div className="header-info">
                    <h1 className="project-title">{project.name}</h1>
                    <p className="project-description">{project.description}</p>
                </div>
            </div>
            <div className="project-detail-layout">
                <div className="project-main-content">
                    <h3 className="section-title">Project Statistics</h3>
                    <div className="stats-grid">
                        <StatCard icon={<FiTrendingUp />} label="Expected Return" value={`${project.returnPercentage}%`} />
                        <StatCard icon={<FiClock />} label="Duration" value={`${project.durationDays} Days`} />
                        <StatCard icon={<FiPackage />} label="Available Units" value={project.availableUnits?.toLocaleString()} />
                        <StatCard icon={<FiDollarSign />} label="Price Per Unit" value={`₦${project.pricePerUnit?.toLocaleString()}`} />
                    </div>
                </div>
                <aside className="project-action-card card">
                    <h3 className="section-title">Invest in this Project</h3>
                    <div className="funding-progress">
                        <div className="funding-text"><span>{fundingPercentage.toFixed(0)}% Funded</span><span><b>{project.availableUnits?.toLocaleString()}</b> units left</span></div>
                        <div className="progress-bar-container"><div className="progress-bar-filled" style={{ width: `${fundingPercentage}%` }}></div></div>
                    </div>
                    <div className="form-group"><label>Your Wallet Balance</label><p className="wallet-balance-display">₦{walletBalance.toLocaleString()}</p></div>
                    <div className="form-group">
                        <label htmlFor="units">Enter number of units</label>
                        <input id="units" type="number" placeholder="e.g., 10" value={units} onChange={(e) => setUnits(e.target.value)} />
                    </div>
                    <ROICalculator units={units} project={project} />
                    {statusMessage.text && (<div className={`status-box ${statusMessage.type}`}>{statusMessage.text}</div>)}
                    <button className="btn btn-primary" style={{width: '100%', marginTop: '20px'}} onClick={handleInvestNow} disabled={investing}>{investing ? 'Processing...' : 'Buy Units Now'}</button>
                </aside>
            </div>
        </div>
    );
}
export default ProjectDetail;