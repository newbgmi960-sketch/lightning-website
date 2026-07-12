import React from 'react';
import { Shield, Zap, ArrowRight, Server, Activity, Terminal } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 300, damping: 24 }
  }
};

const Header = () => {
  return (
    <header className="landing-header">
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{ width: '40px', height: '40px', background: 'var(--accent-color)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 20px var(--accent-transparent)' }}>
          <Zap color="var(--bg-color)" size={24} />
        </div>
        <span className="outfit" style={{ fontSize: '1.5rem', fontWeight: 900, letterSpacing: '-0.02em', color: 'white' }}>LightningBot</span>
      </div>
      <nav className="landing-nav">
        <a href="#features" style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase' }}>Features</a>
        <a href="#pricing" style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase' }}>Pricing</a>
        <a href="#faq" style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase' }}>FAQ</a>
      </nav>
      <div className="landing-actions">
        <Link to="/login" className="btn btn-ghost" style={{ padding: '10px 24px', borderRadius: '12px' }}>Log In</Link>
        <Link to="/dashboard" className="btn btn-primary" style={{ padding: '10px 24px', borderRadius: '12px' }}>Dashboard <ArrowRight size={16} /></Link>
      </div>
    </header>
  );
};

export default function Landing() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header />
      
      <main className="landing-main" style={{ flex: 1, paddingTop: '120px' }}>
        {/* Hero Section */}
        <section style={{ padding: '80px 24px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
          {/* Background Glow */}
          <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '800px', height: '800px', background: 'radial-gradient(circle, var(--accent-transparent) 0%, transparent 70%)', zIndex: -1, filter: 'blur(60px)' }}></div>

          <motion.div variants={containerVariants} initial="hidden" animate="visible" style={{ maxWidth: '900px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
            
            <motion.div variants={itemVariants} style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '8px 16px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-color)', borderRadius: '999px', marginBottom: '32px' }}>
              <span style={{ display: 'flex', height: '8px', width: '8px', borderRadius: '50%', background: 'var(--accent-color)', boxShadow: '0 0 10px var(--accent-color)' }}></span>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', letterSpacing: '0.05em', textTransform: 'uppercase' }}>Enterprise Grade Infrastructure</span>
            </motion.div>

            <motion.h1 variants={itemVariants} className="h1 hero-title">
              Next Generation <br/>
              <span style={{ color: 'var(--accent-color)', textShadow: '0 0 40px var(--accent-transparent)' }}>Attack Platform</span>
            </motion.h1>
            
            <motion.p variants={itemVariants} className="text-secondary" style={{ fontSize: '1.25rem', marginBottom: '48px', maxWidth: '600px', margin: '0 auto 48px auto', lineHeight: 1.6 }}>
              Experience the pinnacle of network testing. LightningBot delivers unmatched power, precision, and reliability for your security infrastructure.
            </motion.p>
            
            <motion.div variants={itemVariants} className="hero-buttons">
              <Link to="/register" className="btn btn-primary" style={{ padding: '16px 40px', fontSize: '1.125rem', borderRadius: '16px', gap: '12px' }}>
                Get Started <ArrowRight size={20} />
              </Link>
              <Link to="/login" className="btn btn-outline" style={{ padding: '16px 40px', fontSize: '1.125rem', borderRadius: '16px', gap: '12px' }}>
                <Terminal size={20} /> View Documentation
              </Link>
            </motion.div>
          </motion.div>
        </section>

        {/* Stats Section */}
        <section style={{ padding: '80px 24px' }}>
           <div className="stats-grid">
              {[
                { icon: <Activity size={24} color="var(--accent-color)" />, value: '99.99%', label: 'Network Uptime' },
                { icon: <Server size={24} color="var(--accent-color)" />, value: '500+', label: 'Global Servers' },
                { icon: <Shield size={24} color="var(--accent-color)" />, value: '2.5M+', label: 'Tests Executed' }
              ].map((stat, i) => (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  key={i} 
                  className="panel" 
                  style={{ padding: '40px 32px', textAlign: 'center', background: 'rgba(255,255,255,0.01)' }}
                >
                  <div style={{ width: '64px', height: '64px', borderRadius: '16px', background: 'var(--accent-transparent)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px auto' }}>
                    {stat.icon}
                  </div>
                  <h3 className="outfit" style={{ fontSize: '3rem', fontWeight: 800, marginBottom: '8px' }}>{stat.value}</h3>
                  <p style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{stat.label}</p>
                </motion.div>
              ))}
           </div>
        </section>
      </main>
    </div>
  );
}
