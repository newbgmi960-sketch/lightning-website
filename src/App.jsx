import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Panel from './pages/Panel';
import ApiManager from './pages/ApiManager';
import Store from './pages/Store';
import Profile from './pages/Profile';
import Deposit from './pages/Deposit';
import AppLayout from './components/AppLayout';
import './index.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Login />} />
        
        {/* Protected Routes Wrapper */}
        <Route element={<AppLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/panel" element={<Panel />} />
          <Route path="/apis" element={<ApiManager />} />
          <Route path="/store" element={<Store />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/deposit" element={<Deposit />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
