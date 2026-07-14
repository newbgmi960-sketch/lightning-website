import React, { useState, useEffect } from 'react';
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, Terminal, Globe, ShoppingCart, Wallet, HelpCircle, Send, LogOut, User, Zap, Loader, Shield, Menu, X } from 'lucide-react';
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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [onlineCount, setOnlineCount] = useState(15);

  useEffect(() => {
    setOnlineCount(Math.floor(Math.random() * 20) + 15);
    const interval = setInterval(() => {
      setOnlineCount(prev => {
        const change = Math.floor(Math.random() * 5) - 2;
        const newCount = prev + change;
        if (newCount < 10) return 10 + Math.floor(Math.random() * 3);
        if (newCount > 45) return 45 - Math.floor(Math.random() * 3);
        return newCount;
      });
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  let navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard size={14} /> },
    { name: 'Panel', path: '/panel', icon: <Terminal size={14} /> },
    { name: 'Store', path: '/store', icon: <ShoppingCart size={14} /> },
    { name: 'Deposit', path: '/deposit', icon: <Wallet size={14} /> },
  ];

  if (user && user.email === 'sagar@lightning.lat') {
    navItems.push({ name: 'Admin', path: '/admin', icon: <Shield size={14} /> });
  }

  useEffect(() => {
    let mounted = true;

    // Check session and force refresh to get latest metadata from DB
    supabase.auth.refreshSession().then(({ data: { session } }) => {
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
    <div className="app-shell" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Top Header */}
      <header className="dashboard-header">
        
        {/* Left: Brand & Nav */}
        <div className="dashboard-left">
          <div className="app-brand" onClick={() => navigate('/dashboard')} role="button" tabIndex={0} onKeyDown={(event) => event.key === 'Enter' && navigate('/dashboard')}>
            <div className="app-brand-mark"><Zap size={15} fill="currentColor" /></div>
            <span>lightning<b>bot</b></span>
          </div>

          <nav className="dashboard-nav desktop-only">
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
          <div className="desktop-only" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
              <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10b981' }}></div>
              {onlineCount} online
            </div>

            <div style={{ width: '1px', height: '20px', background: 'var(--border-color)', margin: '0 8px' }}></div>

            <a href="https://t.me/incarnativating" target="_blank" rel="noopener noreferrer" className="btn btn-outline" style={{ padding: '6px 12px' }}>
              <Send size={14} /> @incarnativating
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
          
          <button 
            className="mobile-menu-btn"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            style={{ 
              background: 'transparent', 
              border: 'none', 
              color: '#fff', 
              cursor: 'pointer',
              padding: '4px'
            }}
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            className="mobile-menu"
            style={{
              position: 'fixed',
              top: '64px', // height of header
              left: 0,
              right: 0,
              background: 'rgba(10, 10, 10, 0.98)',
              backdropFilter: 'blur(12px)',
              borderBottom: '1px solid var(--border-color)',
              padding: '24px',
              zIndex: 40,
              display: 'flex',
              flexDirection: 'column',
              gap: '24px'
            }}
          >
            {/* Mobile Nav */}
            <nav style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {navItems.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <NavLink 
                    key={item.name} 
                    to={item.path}
                    style={{ 
                      padding: '12px 16px', 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '12px',
                      fontSize: '1rem',
                      fontWeight: 600,
                      color: isActive ? '#fff' : 'var(--text-secondary)',
                      textDecoration: 'none',
                      borderRadius: '12px',
                      background: isActive ? 'rgba(255,255,255,0.05)' : 'transparent',
                      border: isActive ? '1px solid rgba(255,255,255,0.1)' : '1px solid transparent',
                    }}
                  >
                    {item.icon} {item.name}
                  </NavLink>
                );
              })}
            </nav>

            <div style={{ height: '1px', background: 'var(--border-color)' }}></div>

            {/* Mobile Actions */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.875rem', color: 'var(--text-secondary)', padding: '0 8px' }}>
                <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10b981' }}></div>
                {onlineCount} online
              </div>
              
              <button className="btn btn-primary" style={{ padding: '12px', width: '100%', justifyContent: 'center' }}>
                <Wallet size={16} /> Balance: ${balance.toFixed(2)}
              </button>

              <a href="https://t.me/incarnativating" target="_blank" rel="noopener noreferrer" className="btn btn-outline" style={{ padding: '12px', width: '100%', justifyContent: 'center' }}>
                <Send size={16} /> Contact @incarnativating
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content Area */}
      <main className="app-content" style={{ flex: 1, padding: '40px 24px', overflowY: 'auto' }}>
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
