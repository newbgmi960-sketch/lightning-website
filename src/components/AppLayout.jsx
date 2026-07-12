import React, { useState, useEffect } from 'react';
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, Terminal, Globe, ShoppingCart, Wallet, HelpCircle, Send, LogOut, User, Command, Loader } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../lib/supabaseClient';

export default function AppLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [balance, setBalance] = useState(0.00);
  const [activePlan, setActivePlan] = useState('None');

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard size={14} /> },
    { name: 'Panel', path: '/panel', icon: <Terminal size={14} /> },
    { name: 'API', path: '/apis', icon: <Globe size={14} /> },
    { name: 'Store', path: '/store', icon: <ShoppingCart size={14} /> },
    { name: 'Deposit', path: '/deposit', icon: <Wallet size={14} /> },
    { name: 'FAQ', path: '/faq', icon: <HelpCircle size={14} /> },
  ];

  useEffect(() => {
    let mounted = true;

    // Check session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!mounted) return;
      if (!session) {
        navigate('/login');
      } else {
        setUser(session.user);
        setBalance(session.user.user_metadata?.balance ?? 0.00);
        setActivePlan(session.user.user_metadata?.active_plan ?? 'None');
        setLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!mounted) return;
      if (!session) {
        navigate('/login');
      } else {
        setUser(session.user);
        setBalance(session.user.user_metadata?.balance ?? 0.00);
        setActivePlan(session.user.user_metadata?.active_plan ?? 'None');
        setLoading(false);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [navigate]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-color)' }}>
        <Loader className="animate-spin" size={32} color="var(--accent-color)" />
      </div>
    );
  }

  const username = user?.user_metadata?.username || user?.email?.split('@')[0] || 'User';
  const initials = username.slice(0, 2).toUpperCase();

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Top Header */}
      <header className="dashboard-header">
        
        {/* Left: Brand & Nav */}
        <div className="dashboard-left">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }} onClick={() => navigate('/dashboard')}>
            <div style={{ width: '24px', height: '24px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
               <Command size={14} color="#fff" />
            </div>
            <span style={{ fontWeight: 700, fontSize: '1rem', color: '#fff', letterSpacing: '-0.025em' }}>Lightning</span>
          </div>

          <nav className="dashboard-nav">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <NavLink 
                  key={item.name} 
                  to={item.path}
                  style={{ 
                    position: 'relative', 
                    padding: '8px 12px', 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '8px',
                    fontSize: '0.875rem',
                    fontWeight: 500,
                    color: isActive ? '#fff' : 'var(--text-secondary)',
                    textDecoration: 'none',
                    borderRadius: '8px',
                    transition: 'color 0.2s ease',
                    zIndex: 1
                  }}
                >
                  {isActive && (
                    <motion.div
                      layoutId="nav-active-pill"
                      style={{
                        position: 'absolute',
                        inset: 0,
                        background: 'rgba(255,255,255,0.08)',
                        borderRadius: '8px',
                        zIndex: -1
                      }}
                      transition={{ type: "spring", stiffness: 350, damping: 30 }}
                    />
                  )}
                  {item.icon} {item.name}
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Right: Actions & Profile */}
        <div className="dashboard-right">
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
            <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10b981' }}></div>
            3 online
          </div>

          <div style={{ width: '1px', height: '20px', background: 'var(--border-color)', margin: '0 8px' }}></div>

          <a href="https://t.me/incanativating" target="_blank" rel="noopener noreferrer" className="btn btn-outline" style={{ padding: '6px 12px' }}>
            <Send size={14} /> @incanativating
          </a>
          
          <button className="btn btn-primary" style={{ padding: '6px 12px', gap: '6px' }}>
            <Wallet size={14} /> ${balance.toFixed(2)}
          </button>

          {/* Profile Dropdown */}
          <div style={{ position: 'relative' }}>
            <button 
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              style={{ 
                width: '32px', height: '32px', borderRadius: '50%', 
                background: '#222', border: '1px solid var(--border-color)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#fff', fontSize: '0.875rem', fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              {initials}
            </button>
            
            {isProfileOpen && (
              <div style={{ 
                position: 'absolute', top: '100%', right: 0, marginTop: '8px',
                width: '200px', background: 'var(--panel-bg)', border: '1px solid var(--border-color)',
                borderRadius: '8px', overflow: 'hidden', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.5)',
                zIndex: 100
              }}>
                <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border-color)' }}>
                  <div style={{ fontWeight: 600, color: '#fff', fontSize: '0.875rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{username}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{activePlan}</div>
                </div>
                <div style={{ padding: '4px' }}>
                  <button className="nav-link" style={{ width: '100%', border: 'none', background: 'transparent', textAlign: 'left', display: 'flex', alignItems: 'center', gap: '8px' }} onClick={() => navigate('/profile')}>
                    <User size={14} /> Profile Settings
                  </button>
                  <button className="nav-link" style={{ width: '100%', border: 'none', background: 'transparent', color: '#ef4444', textAlign: 'left', display: 'flex', alignItems: 'center', gap: '8px' }} onClick={handleSignOut}>
                    <LogOut size={14} /> Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main style={{ flex: 1, padding: '40px 24px', overflowY: 'auto' }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            style={{ width: '100%', height: '100%' }}
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}
