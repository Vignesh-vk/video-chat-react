import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import "./Dashboard.css";

const Dashboard = () => {
  const { auth, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!auth.isAuthenticated) {
      navigate('/');
    }
  }, [auth, navigate]);

  return (
    <div className="dashboard-container">
      <div className="dashboard-card">
        <h2>Welcome to your Dashboard, {auth.email}</h2>
        <div className="button-group">
          <button className="dashboard-button chat-button" onClick={() => navigate('/chat')}>Go to Chat</button>
          <button className="dashboard-button logout-button" onClick={logout}>Logout</button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
