import React from 'react';
import { Activity, ArrowRight, Check, ChevronRight, CircleGauge, Cloud, Command, LockKeyhole, Network, ShieldCheck, Sparkles, Terminal, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const rise = { hidden: { opacity: 0, y: 22 }, visible: { opacity: 1, y: 0 } };
const metrics = [['99.99%', 'Network uptime'], ['500+', 'Global nodes'], ['2.5M+', 'Operations completed']];
const features = [
  { icon: <Network />, title: 'Global by default', text: 'Route work through a resilient worldwide network with intelligent failover.' },
  { icon: <CircleGauge />, title: 'Real-time visibility', text: 'See activity, performance, and usage from one focused command center.' },
  { icon: <LockKeyhole />, title: 'Built for control', text: 'Role-aware access, clear audit trails, and enterprise-ready safeguards.' },
];

function Header() {
  return <header className="landing-header">
    <Link to="/" className="brand" aria-label="LightningBot home"><span className="brand-mark"><Zap size={17} fill="currentColor" /></span><span>lightning<b>bot</b></span></Link>
    <nav className="landing-nav" aria-label="Main navigation"><a href="#platform">Platform</a><a href="#features">Features</a><a href="#pricing">Pricing</a></nav>
    <div className="landing-actions"><Link to="/login" className="header-login">Log in</Link><Link to="/register" className="header-cta">Get started <ArrowRight size={15} /></Link></div>
  </header>;
}

export default function Landing() {
  return <div className="landing-page"><Header /><main>
    <section className="hero-section" id="platform">
      <div className="hero-grid" aria-hidden="true" /><div className="hero-orb hero-orb-one" aria-hidden="true" /><div className="hero-orb hero-orb-two" aria-hidden="true" />
      <motion.div className="hero-content" initial="hidden" animate="visible" transition={{ staggerChildren: 0.11 }}>
        <motion.div variants={rise} transition={{ duration: 0.55 }} className="eyebrow"><span className="live-dot" /> Built for serious infrastructure</motion.div>
        <motion.h1 variants={rise} transition={{ duration: 0.6 }}>The control plane<br />for a <em>faster internet.</em></motion.h1>
        <motion.p variants={rise} transition={{ duration: 0.6 }} className="hero-copy">LightningBot gives modern teams the clarity, speed, and confidence to operate dependable network infrastructure at scale.</motion.p>
        <motion.div variants={rise} transition={{ duration: 0.6 }} className="hero-buttons"><Link to="/register" className="button button-bright">Launch your workspace <ArrowRight size={18} /></Link><a className="button button-quiet" href="#features"><Terminal size={17} /> Explore the platform</a></motion.div>
        <motion.div variants={rise} transition={{ duration: 0.6 }} className="hero-proof"><span><Check size={14} /> No card required</span><span><Check size={14} /> Set up in minutes</span><span><Check size={14} /> 24/7 monitoring</span></motion.div>
      </motion.div>
      <motion.div className="hero-console" initial={{ opacity: 0, y: 40, rotateX: 7 }} animate={{ opacity: 1, y: 0, rotateX: 0 }} transition={{ delay: 0.25, duration: 0.8, ease: 'easeOut' }}>
        <div className="console-topbar"><div className="window-dots"><i /><i /><i /></div><span>live overview</span><span className="console-status"><b /> All systems operational</span></div>
        <div className="console-body"><aside className="console-sidebar"><span className="active"><Command size={15} /></span><span><Activity size={15} /></span><span><Cloud size={15} /></span><span><ShieldCheck size={15} /></span></aside><div className="console-main">
          <div className="console-heading"><div><small>NETWORK OVERVIEW</small><strong>Good evening, Sagar.</strong></div><span className="period">Last 24 hours <ChevronRight size={14} /></span></div>
          <div className="console-cards"><div><small>REQUESTS</small><b>1.2M</b><em>+14.8%</em></div><div><small>AVG. LATENCY</small><b>42<span>ms</span></b><em>−8.2%</em></div><div><small>AVAILABILITY</small><b>99.99<span>%</span></b><em>Stable</em></div></div>
          <div className="chart"><div className="chart-label"><span>Traffic volume</span><b>Peak 84.2k/min</b></div><svg viewBox="0 0 620 160" preserveAspectRatio="none" aria-label="Traffic line chart"><defs><linearGradient id="chartFill" x1="0" x2="0" y1="0" y2="1"><stop stopColor="#b7ff35" stopOpacity=".4" /><stop offset="1" stopColor="#b7ff35" stopOpacity="0" /></linearGradient></defs><path className="chart-grid-lines" d="M0 35H620M0 80H620M0 125H620" /><path fill="url(#chartFill)" d="M0 132 L42 116 L83 122 L125 83 L166 96 L207 58 L248 74 L290 39 L331 65 L372 51 L414 92 L455 62 L496 77 L538 29 L579 46 L620 15 V160 H0Z" /><path className="chart-line" d="M0 132 L42 116 L83 122 L125 83 L166 96 L207 58 L248 74 L290 39 L331 65 L372 51 L414 92 L455 62 L496 77 L538 29 L579 46 L620 15" /></svg></div>
        </div></div>
      </motion.div>
    </section>
    <section className="metrics-section"><p>TRUSTED PERFORMANCE, MEASURABLE RESULTS</p><div className="metrics-grid">{metrics.map(([value, label]) => <div key={label}><strong>{value}</strong><span>{label}</span></div>)}</div></section>
    <section className="features-section" id="features"><div className="section-intro"><span className="section-kicker"><Sparkles size={15} /> WHY LIGHTNINGBOT</span><h2>Powerful underneath.<br /><em>Effortless on top.</em></h2><p>Everything you need to keep critical infrastructure healthy—without getting buried in the details.</p></div><div className="feature-grid">{features.map((feature, index) => <motion.article className="feature-card" key={feature.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.1 }}><span className="feature-icon">{feature.icon}</span><h3>{feature.title}</h3><p>{feature.text}</p><a href="#pricing">Learn more <ArrowRight size={15} /></a></motion.article>)}</div></section>
    <section className="closing-section" id="pricing"><div><span className="section-kicker"><Zap size={15} /> READY WHEN YOU ARE</span><h2>Move at the<br /><em>speed of lightning.</em></h2></div><div className="closing-action"><p>Start with the tools your team needs today, then scale without changing your workflow.</p><Link to="/register" className="button button-bright">Create your account <ArrowRight size={18} /></Link></div></section>
  </main><footer className="landing-footer"><Link to="/" className="brand"><span className="brand-mark"><Zap size={15} fill="currentColor" /></span><span>lightning<b>bot</b></span></Link><span>© 2026 LightningBot. Built for uptime.</span><div><a href="#platform">Platform</a><a href="#features">Features</a><Link to="/login">Log in</Link></div></footer></div>;
}
