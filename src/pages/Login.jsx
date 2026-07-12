import React, { useState, useEffect } from 'react';
import { Zap, ArrowRight, Loader } from 'lucide-react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const isRegister = location.pathname === '/register';

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // If already logged in, redirect to dashboard
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        navigate('/dashboard');
      }
    });
  }, [navigate]);

  const handleAuth = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const cleanUsername = username.toLowerCase().trim();
    if (!/^[a-zA-Z0-9_]{3,15}$/.test(cleanUsername)) {
      setError('Username must be 3-15 alphanumeric characters or underscores.');
      setLoading(false);
      return;
    }

    const email = `${cleanUsername}@lightning.lat`;

    if (isRegister) {
      if (password.length < 6) {
        setError('Password must be at least 6 characters.');
        setLoading(false);
        return;
      }
      if (password !== confirmPassword) {
        setError('Passwords do not match.');
        setLoading(false);
        return;
      }

      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (signUpError) {
        if (signUpError.message.includes('already registered') || signUpError.message.includes('already exists') || signUpError.status === 422) {
          setError('Name already registered! Please choose a different username.');
        } else {
          setError(signUpError.message);
        }
        setLoading(false);
        return;
      }

      if (data.user) {
        // Automatically log in after signup
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (signInError) {
          setError('Registration successful! Please sign in manually.');
          navigate('/login');
        } else if (signInData.session) {
          navigate('/dashboard');
        }
      }
    } else {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        setError('Invalid username or password.');
        setLoading(false);
        return;
      }

      if (data.session) {
        navigate('/dashboard');
      }
    }
    setLoading(false);
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', position: 'relative', padding: '16px' }}>
      <div className="glow-bg" style={{ top: '50%', left: '50%', transform: 'translate(-50%, -50%)', background: 'radial-gradient(circle, rgba(255, 255, 255, 0.05) 0%, transparent 60%)' }}></div>
      
      <div className="glass-panel" style={{ padding: '40px 24px', width: '100%', maxWidth: '420px', zIndex: 10, background: 'var(--panel-bg)', border: '1px solid var(--border-color)', borderRadius: '12px' }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '24px' }}>
          <div style={{ background: 'rgba(255,255,255,0.05)', padding: '16px', borderRadius: '16px', border: '1px solid var(--border-color)' }}>
            <Zap size={32} color="var(--accent-color)" />
          </div>
        </div>
        
        <h1 className="outfit" style={{ textAlign: 'center', fontSize: '2rem', fontWeight: 800, marginBottom: '8px', color: '#fff' }}>
          {isRegister ? 'Create Account' : 'Welcome Back'}
        </h1>
        <p style={{ textAlign: 'center', color: 'var(--text-secondary)', marginBottom: '24px', fontSize: '0.875rem' }}>
          {isRegister ? 'Register your unique Lightning account' : 'Sign in to access your Lightning dashboard'}
        </p>

        {error && (
          <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', color: '#f87171', padding: '12px', borderRadius: '8px', fontSize: '0.875rem', marginBottom: '20px', textAlign: 'center' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleAuth} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '8px', color: 'var(--text-secondary)' }}>Username</label>
            <input 
              type="text" 
              placeholder="Enter username" 
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={loading}
              style={{ width: '100%', padding: '12px 16px', borderRadius: '8px', background: 'rgba(0,0,0,0.5)', border: '1px solid var(--border-color)', color: 'white', outline: 'none' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '8px', color: 'var(--text-secondary)' }}>Password</label>
            <input 
              type="password" 
              placeholder="Enter password" 
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              style={{ width: '100%', padding: '12px 16px', borderRadius: '8px', background: 'rgba(0,0,0,0.5)', border: '1px solid var(--border-color)', color: 'white', outline: 'none' }}
            />
          </div>

          {isRegister && (
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '8px', color: 'var(--text-secondary)' }}>Confirm Password</label>
              <input 
                type="password" 
                placeholder="Confirm password" 
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={loading}
                style={{ width: '100%', padding: '12px 16px', borderRadius: '8px', background: 'rgba(0,0,0,0.5)', border: '1px solid var(--border-color)', color: 'white', outline: 'none' }}
              />
            </div>
          )}
          
          <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: '100%', marginTop: '8px', padding: '12px', height: '44px', borderRadius: '8px', display: 'flex', gap: '8px', justifyContent: 'center', alignItems: 'center' }}>
            {loading ? (
              <Loader className="animate-spin" size={18} />
            ) : (
              <>
                {isRegister ? 'Register' : 'Sign In'} <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>
        
        <p style={{ textAlign: 'center', marginTop: '24px', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
          {isRegister ? (
            <>
              Already have an account? <Link to="/login" style={{ color: 'var(--text-primary)', fontWeight: 600 }}>Sign In</Link>
            </>
          ) : (
            <>
              Don't have an account? <Link to="/register" style={{ color: 'var(--text-primary)', fontWeight: 600 }}>Get Started</Link>
            </>
          )}
        </p>
      </div>
    </div>
  );
}
