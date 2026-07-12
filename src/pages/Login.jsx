import React from 'react';
import { Zap, ArrowRight } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

export default function Login() {
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    // Mock login, redirect directly to dashboard
    navigate('/dashboard');
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
      <div className="glow-bg" style={{ top: '50%', left: '50%', transform: 'translate(-50%, -50%)', background: 'radial-gradient(circle, rgba(59, 130, 246, 0.2) 0%, transparent 60%)' }}></div>
      
      <div className="glass-panel animate-fade-in-up" style={{ padding: '48px', width: '100%', maxWidth: '420px', zIndex: 10 }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '32px' }}>
          <div style={{ background: 'rgba(255,255,255,0.1)', padding: '16px', borderRadius: '50%' }}>
            <Zap size={32} color="var(--accent-color)" fill="var(--accent-color)" />
          </div>
        </div>
        
        <h1 style={{ textAlign: 'center', fontSize: '2rem', marginBottom: '8px' }}>Welcome Back</h1>
        <p style={{ textAlign: 'center', color: 'var(--text-secondary)', marginBottom: '32px' }}>Sign in to your Lightning account.</p>

        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '8px', color: 'var(--text-secondary)' }}>Username</label>
            <input 
              type="text" 
              placeholder="Enter your username" 
              required
              style={{ width: '100%', padding: '12px 16px', borderRadius: '8px', background: 'rgba(0,0,0,0.5)', border: '1px solid var(--glass-border)', color: 'white', outline: 'none' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '8px', color: 'var(--text-secondary)' }}>Password</label>
            <input 
              type="password" 
              placeholder="Enter your password" 
              required
              style={{ width: '100%', padding: '12px 16px', borderRadius: '8px', background: 'rgba(0,0,0,0.5)', border: '1px solid var(--glass-border)', color: 'white', outline: 'none' }}
            />
          </div>
          
          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '8px' }}>
            Sign In <ArrowRight size={18} />
          </button>
        </form>
        
        <p style={{ textAlign: 'center', marginTop: '32px', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
          Don't have an account? <Link to="/register" style={{ color: 'var(--text-primary)', fontWeight: 600 }}>Get Started</Link>
        </p>
      </div>
    </div>
  );
}
