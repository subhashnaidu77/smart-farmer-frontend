import React from 'react';
import { NavLink } from 'react-router-dom';
import { FiHome, FiTrendingUp, FiCreditCard, FiUser } from 'react-icons/fi'; // Changed FiRepeat to FiCreditCard
import './Navigation.css';

function Navigation() {
    return (
        <nav className="main-nav">
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
        </nav>
    );
}

export default Navigation;