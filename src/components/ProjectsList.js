// src/components/ProjectsList.js

import React, { useState, useEffect } from 'react';
import { db } from '../firebase/firebase'; // Adjust path if firebase.js is elsewhere
import { collection, getDocs } from "firebase/firestore";

// Basic styling for the component (can be improved later)
const styles = {
    container: {
        padding: '20px',
        fontFamily: 'Arial, sans-serif'
    },
    title: {
        fontSize: '24px',
        marginBottom: '20px'
    },
    projectsGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
        gap: '20px'
    },
    projectCard: {
        border: '1px solid #ddd',
        borderRadius: '8px',
        padding: '16px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
    },
    projectImage: {
        width: '100%',
        height: '150px',
        objectFit: 'cover',
        borderRadius: '4px',
        marginBottom: '12px'
    },
    projectName: {
        fontSize: '18px',
        fontWeight: 'bold',
    },
    projectDesc: {
        fontSize: '14px',
        color: '#666',
        marginTop: '8px'
    },
    projectStats: {
        marginTop: '16px',
        fontSize: '14px',
    },
    loading: {
        fontSize: '18px',
        textAlign: 'center',
        padding: '50px'
    }
};

const ProjectsList = () => {
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProjects = async () => {
            try {
                const projectsCollectionRef = collection(db, "projects");
                const querySnapshot = await getDocs(projectsCollectionRef);
                const projectsData = querySnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));
                setProjects(projectsData);
            } catch (error) {
                console.error("Error fetching projects: ", error);
            } finally {
                setLoading(false);
            }
        };

        fetchProjects();
    }, []); // Empty dependency array means this runs once on component mount

    if (loading) {
        return <div style={styles.loading}>Loading available projects...</div>;
    }

    return (
        <div style={styles.container}>
            <h2 style={styles.title}>Available Projects to Invest In</h2>
            <div style={styles.projectsGrid}>
                {projects.map(project => (
                    <div key={project.id} style={styles.projectCard}>
                        <img src={project.imageUrl} alt={project.name} style={styles.projectImage} />
                        <h3 style={styles.projectName}>{project.name}</h3>
                        <p style={styles.projectDesc}>{project.description}</p>
                        <div style={styles.projectStats}>
                            <p><strong>Return:</strong> {project.returnPercentage}% in {project.durationDays} days</p>
                            <p><strong>Funding:</strong> ₹{project.currentAmount} / ₹{project.targetAmount}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ProjectsList;