import React from 'react';
import { Navigate } from 'react-router-dom';

// This component will check if the user is an admin.
// For now, we are passing the userData as a prop.
const AdminRoute = ({ userData, children }) => {
    // If user data is still loading, you might want to show a loader
    if (!userData) {
        return <div>Loading user details...</div>; 
    }

    // If user has the role 'admin', show the component.
    // Otherwise, redirect them to the main dashboard.
    if (userData.role === 'admin') {
        return children;
    } else {
        return <Navigate to="/dashboard" />;
    }
};

export default AdminRoute;