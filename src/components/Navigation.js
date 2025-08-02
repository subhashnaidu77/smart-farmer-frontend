import React from 'react';
import { Link, NavLink } from 'react-router-dom';
import { FiHome, FiTrendingUp, FiCreditCard, FiUser, FiSettings, FiLogOut, FiGrid } from 'react-icons/fi';
import './Navigation.css';

function Navigation({ handleLogout, userData }) {
    return (
        <nav className="top-nav">
            <Link to="/dashboard" className="nav-logo-link">
                <img src="/logo.png" alt="Smart Farmer Logo" className="nav-logo-img" />
                <span>Smart Farmer</span>
            </Link>
            <div className="nav-actions">
                <NavLink to="/dashboard" className="nav-link">
                    <FiHome />
                    <span>Home</span>
                </NavLink>
                <NavLink to="/invest" className="nav-link">
                    <FiTrendingUp />
                    <span>Invest</span>
                </NavLink>
                <NavLink to="/withdraw" className="nav-link">
                    <FiCreditCard />
                    <span>Withdraw</span>
                </NavLink>
                <NavLink to="/settings" className="nav-link">
                    <FiUser />
                    <span>Profile</span>
                </NavLink>
                {userData && userData.role === 'admin' && (
                    <Link to="/admin" className="btn btn-admin"><FiGrid /> Admin</Link>
                )}
                <button onClick={handleLogout} className="btn btn-danger"><FiLogOut /> Logout</button>
            </div>
        </nav>
    );
}

export default Navigation;