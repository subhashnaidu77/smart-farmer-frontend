import React, { useState, useEffect } from 'react';
import apiClient from '../axiosConfig'; 
import { FiEdit, FiTrash2 } from 'react-icons/fi';

function UserManagement() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const response = await apiClient.get('http://localhost:4000/admin/users');
            setUsers(response.data);
            setError('');
        } catch (err) {
            setError('Failed to fetch users. Is the backend server running?');
            console.error("Error fetching users:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleSetRole = async (uid, email, currentRole) => {
        const newRole = currentRole === 'admin' ? 'user' : 'admin';
        if (!window.confirm(`Are you sure you want to change ${email}'s role to ${newRole}?`)) return;
        try {
            await apiClient.post('http://localhost:4000/admin/users/setrole', { uid, role: newRole });
            alert('User role updated successfully!');
            fetchUsers();
        } catch (error) {
            alert('Failed to update user role.');
            console.error("Role update error:", error);
        }
    };

    const handleDeleteUser = async (uid, email) => {
        if (!window.confirm(`Are you sure you want to PERMANENTLY delete the user ${email}? This cannot be undone.`)) return;
        try {
            await apiClient.delete(`http://localhost:4000/admin/users/${uid}`);
            alert('User deleted successfully!');
            fetchUsers();
        } catch (error) {
            alert('Failed to delete user.');
            console.error("Delete user error:", error);
        }
    };

    if (loading) return <p>Loading users...</p>;
    if (error) return <p style={{ color: '#dc3545', fontWeight: '500' }}>{error}</p>;

    return (
        <div>
            <h2 style={{fontWeight: 600, marginTop: '10px'}}>Manage All Users</h2>
            <table className="admin-table">
                <thead>
                    <tr>
                        <th>Email</th>
                        <th>Role</th>
                        <th>Account Created</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {users.map(user => (
                        <tr key={user.uid}>
                            <td>{user.email}</td>
                            <td>
                                <span className={`role-badge ${user.role === 'admin' ? 'admin' : 'user'}`}>
                                    {user.role || 'user'}
                                </span>
                            </td>
                            <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                            <td>
                                <button onClick={() => handleSetRole(user.uid, user.email, user.role)} className="btn-icon btn-edit" title={`Change role to ${user.role === 'admin' ? 'user' : 'admin'}`}><FiEdit /></button>
                                <button onClick={() => handleDeleteUser(user.uid, user.email)} className="btn-icon btn-delete" title="Delete User"><FiTrash2 /></button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export default UserManagement;