import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, serverTimestamp } from 'firebase/firestore';
import { FiPlus, FiEdit, FiTrash2 } from 'react-icons/fi';

function ProjectManagement() {
    const [projects, setProjects] = useState([]);
    const [formData, setFormData] = useState({
        name: '', description: '', pricePerUnit: '', availableUnits: '', returnPercentage: '', durationDays: '', riskLevel: 'Low'
    });
    const [isEditing, setIsEditing] = useState(false);
    const [currentProjectId, setCurrentProjectId] = useState(null);
    const projectsCollectionRef = collection(db, 'projects');

    const getProjects = async () => {
        const data = await getDocs(projectsCollectionRef);
        setProjects(data.docs.map(doc => ({ ...doc.data(), id: doc.id })));
    };

    useEffect(() => { getProjects(); }, []);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const clearForm = () => {
        setFormData({ name: '', description: '', pricePerUnit: '', availableUnits: '', returnPercentage: '', durationDays: '', riskLevel: 'Low' });
        setIsEditing(false);
        setCurrentProjectId(null);
    };

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        const dataToSubmit = {
            name: formData.name,
            description: formData.description,
            pricePerUnit: Number(formData.pricePerUnit),
            availableUnits: Number(formData.availableUnits),
            returnPercentage: Number(formData.returnPercentage),
            durationDays: Number(formData.durationDays),
            riskLevel: formData.riskLevel,
            imageUrl: '',
            targetAmount: Number(formData.pricePerUnit) * Number(formData.availableUnits)
        };

        if (isEditing) {
            const projectDoc = doc(db, "projects", currentProjectId);
            try { await updateDoc(projectDoc, dataToSubmit); alert('Project updated!'); clearForm(); getProjects(); } catch (err) { alert('Error: ' + err.message); }
        } else {
            try { await addDoc(projectsCollectionRef, { ...dataToSubmit, currentAmount: 0, status: 'Open', createdAt: serverTimestamp() }); alert('Project added!'); clearForm(); getProjects(); } catch (err) { alert('Error: ' + err.message); }
        }
    };

    const handleEditClick = (project) => {
        setIsEditing(true);
        setCurrentProjectId(project.id);
        setFormData({ name: project.name, description: project.description, pricePerUnit: project.pricePerUnit || '', availableUnits: project.availableUnits || '', returnPercentage: project.returnPercentage, durationDays: project.durationDays, riskLevel: project.riskLevel || 'Low' });
        window.scrollTo(0, 0);
    };

    const handleDeleteProject = async (id) => {
        if (window.confirm("Are you sure?")) {
            const projectDoc = doc(db, "projects", id);
            try { await deleteDoc(projectDoc); alert('Project deleted!'); getProjects(); } catch (err) { alert('Error: ' + err.message); }
        }
    };

    const calculatedTarget = Number(formData.pricePerUnit) * Number(formData.availableUnits);

    return (
        <div>
            <h2 style={{fontWeight: 600, marginBottom: '20px'}}>{isEditing ? 'Edit Project' : 'Add New Project'}</h2>
            <form onSubmit={handleFormSubmit}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                    <div className="form-group" style={{gridColumn: '1 / -1'}}><label>Project Name</label><input name="name" value={formData.name} onChange={handleInputChange} required /></div>
                    <div className="form-group"><label>Price Per Unit (₦)</label><input type="number" name="pricePerUnit" value={formData.pricePerUnit} onChange={handleInputChange} required /></div>
                    <div className="form-group"><label>Available Units</label><input type="number" name="availableUnits" value={formData.availableUnits} onChange={handleInputChange} required /></div>
                    <div className="form-group"><label>Calculated Target</label><input type="text" value={`₦${calculatedTarget.toLocaleString()}`} readOnly disabled /></div>
                    <div className="form-group"><label>Return (%)</label><input type="number" name="returnPercentage" value={formData.returnPercentage} onChange={handleInputChange} required /></div>
                    <div className="form-group"><label>Duration (Days)</label><input type="number" name="durationDays" value={formData.durationDays} onChange={handleInputChange} required /></div>
                    <div className="form-group"><label>Risk Level</label>
                        <select name="riskLevel" value={formData.riskLevel} onChange={handleInputChange}>
                            <option value="Low">Low</option>
                            <option value="Medium">Medium</option>
                            <option value="High">High</option>
                        </select>
                    </div>
                    <div className="form-group" style={{gridColumn: '1 / -1'}}><label>Description</label><textarea name="description" value={formData.description} onChange={handleInputChange} required rows="3"></textarea></div>
                </div>
                <div style={{display: 'flex', gap: '10px'}}>
                    <button type="submit" className="btn btn-primary">{isEditing ? <><FiEdit /> Update Project</> : <><FiPlus /> Add Project</>}</button>
                    {isEditing && <button type="button" onClick={clearForm} className="btn btn-secondary">Cancel Edit</button>}
                </div>
            </form>

            <h2 style={{fontWeight: 600, marginTop: '40px', borderTop: '1px solid var(--border-color)', paddingTop: '30px'}}>Existing Projects</h2>
            <table className="admin-table">
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Price/Unit</th>
                        <th>Available Units</th>
                        <th>Target</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {projects.map(project => (
                        <tr key={project.id}>
                            <td>{project.name}</td>
                            <td>₦{project.pricePerUnit?.toLocaleString()}</td>
                            <td>{project.availableUnits?.toLocaleString()}</td>
                            <td>₦{project.targetAmount?.toLocaleString()}</td>
                            <td>
                                <button onClick={() => handleEditClick(project)} className="btn-icon btn-edit"><FiEdit /></button>
                                <button onClick={() => handleDeleteProject(project.id)} className="btn-icon btn-delete"><FiTrash2 /></button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
export default ProjectManagement;