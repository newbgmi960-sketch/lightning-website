import React, { useEffect, useRef, useState } from 'react';
import { Activity, ArrowRight, Check, ChevronRight, CircleGauge, Cloud, Command, LockKeyhole, Menu, Network, ShieldCheck, Sparkles, Terminal, X, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import Hls from 'hls.js';

const rise = { hidden: { opacity: 0, y: 22 }, visible: { opacity: 1, y: 0 } };
const metrics = [['99.99%', 'Network uptime'], ['500+', 'Global nodes'], ['2.5M+', 'Operations completed']];
const features = [
  { icon: <Network />, title: 'Global by default', text: 'Route work through a resilient worldwide network with intelligent failover.' },
  { icon: <CircleGauge />, title: 'Real-time visibility', text: 'See activity, performance, and usage from one focused command center.' },
  { icon: <LockKeyhole />, title: 'Built for control', text: 'Role-aware access, clear audit trails, and enterprise-ready safeguards.' },
];
const scrollToSection = (id) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });

function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  return <header className="landing-header">
    <Link to="/" className="brand" aria-label="LightningBot home"><span className="brand-mark"><Zap size={17} fill="currentColor" /></span><span>lightning<b>bot</b></span></Link>
    <nav className="landing-nav" aria-label="Main navigation"><button onClick={() => scrollToSection('platform')}>Platform</button><button onClick={() => scrollToSection('features')}>Features</button><button onClick={() => scrollToSection('pricing')}>Pricing</button></nav>
    <div className="landing-actions"><Link to="/login" className="header-login">Log in</Link><Link to="/register" className="header-cta">Get started <ArrowRight size={15} /></Link><button className="landing-menu-toggle" onClick={() => setIsMenuOpen(open => !open)} aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}>{isMenuOpen ? <X size={21} /> : <Menu size={21} />}</button></div>
    {isMenuOpen && <div className="landing-mobile-menu"><button onClick={() => { scrollToSection('platform'); setIsMenuOpen(false); }}>Platform</button><button onClick={() => { scrollToSection('features'); setIsMenuOpen(false); }}>Features</button><button onClick={() => { scrollToSection('pricing'); setIsMenuOpen(false); }}>Pricing</button><Link to="/login">Log in</Link><Link to="/register" className="button button-bright">Get started <ArrowRight size={16} /></Link></div>}
  </header>;
}

export default function Landing() {
  const videoRef = useRef(null);
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return undefined;
    const stream = 'https://stream.mux.com/tLkHO1qZoaaQOUeVWo8hEBeGQfySP02EPS02BmnNFyXys.m3u8';
    let hls;
    if (Hls.isSupported()) {
      hls = new Hls({ enableWorker: false });
      hls.loadSource(stream);
      hls.attachMedia(video);
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = stream;
    }
    video.play().catch(() => {});
    return () => hls?.destroy();
  }, []);

  return <div className="landing-page"><Header /><main>
    <section className="hero-section" id="platform">
      <video ref={videoRef} className="landing-video" autoPlay muted loop playsInline aria-hidden="true" />
      <div className="video-overlay" aria-hidden="true" />
      <div className="hero-lines" aria-hidden="true"><i /><i /><i /></div>
      <div className="hero-grid" aria-hidden="true" /><div className="hero-orb hero-orb-one" aria-hidden="true" /><div className="hero-orb hero-orb-two" aria-hidden="true" />
      <div className="hero-split">
        <motion.div className="hero-content" initial="hidden" animate="visible" transition={{ staggerChildren: 0.11 }}>
          <motion.div variants={rise} transition={{ duration: 0.55 }} className="eyebrow"><span className="live-dot" /> Lightning mode: live</motion.div>
          <motion.h1 variants={rise} transition={{ duration: 0.6 }}>Move with<br /><em>lightning.</em></motion.h1>
          <motion.p variants={rise} transition={{ duration: 0.6 }} className="hero-copy">A sharp, electric workspace for teams who want every signal, workflow, and insight in one beautiful place.</motion.p>
          <motion.div variants={rise} transition={{ duration: 0.6 }} className="hero-buttons"><Link to="/register" className="button button-bright">Enter workspace <ArrowRight size={18} /></Link><button type="button" className="button button-quiet" onClick={() => scrollToSection('features')}><Terminal size={17} /> See the system</button></motion.div>
          <motion.div variants={rise} transition={{ duration: 0.6 }} className="hero-proof"><span><Check size={14} /> Real-time clarity</span><span><Check size={14} /> Built to scale</span><span><Check size={14} /> Always visible</span></motion.div>
        </motion.div>
        <motion.div className="signal-scene" initial={{ opacity: 0, scale: .9, rotate: -5 }} animate={{ opacity: 1, scale: 1, rotate: 0 }} transition={{ delay: .25, duration: .85, ease: 'easeOut' }} aria-label="Live lightning signal visualization">
          <span className="scene-label scene-label-top">LIVE SIGNAL</span><span className="scene-label scene-label-bottom">LIGHTNING ENGINE</span>
          <div className="orbit orbit-one" /><div className="orbit orbit-two" /><div className="orbit orbit-three" />
          <div className="signal-core"><Zap size={42} fill="currentColor" /></div>
          <div className="scene-chip chip-one"><b>42ms</b><span>response</span></div><div className="scene-chip chip-two"><b>99.99%</b><span>uptime</span></div><div className="scene-index">01</div>
        </motion.div>
      </div>
      <motion.div className="hero-console" initial={{ opacity: 0, y: 40, rotateX: 7 }} animate={{ opacity: 1, y: 0, rotateX: 0 }} transition={{ delay: 0.25, duration: 0.8, ease: 'easeOut' }}>
        <div className="console-topbar"><div className="window-dots"><i /><i /><i /></div><span>live overview</span><span className="console-status"><b /> All systems operational</span></div>
        <div className="console-body"><aside className="console-sidebar"><span className="active"><Command size={15} /></span><span><Activity size={15} /></span><span><Cloud size={15} /></span><span><ShieldCheck size={15} /></span></aside><div className="console-main">
          <div className="console-heading"><div><small>NETWORK OVERVIEW</small><strong>Infrastructure is looking healthy.</strong></div><span className="period">Last 24 hours <ChevronRight size={14} /></span></div>
          <div className="console-cards"><div><small>REQUESTS</small><b>1.2M</b><em>+14.8%</em></div><div><small>AVG. LATENCY</small><b>42<span>ms</span></b><em>−8.2%</em></div><div><small>AVAILABILITY</small><b>99.99<span>%</span></b><em>Stable</em></div></div>
          <div className="chart"><div className="chart-label"><span>Traffic volume</span><b>Peak 84.2k/min</b></div><svg viewBox="0 0 620 160" preserveAspectRatio="none" aria-label="Traffic line chart"><defs><linearGradient id="chartFill" x1="0" x2="0" y1="0" y2="1"><stop stopColor="#b7ff35" stopOpacity=".4" /><stop offset="1" stopColor="#b7ff35" stopOpacity="0" /></linearGradient></defs><path className="chart-grid-lines" d="M0 35H620M0 80H620M0 125H620" /><path fill="url(#chartFill)" d="M0 132 L42 116 L83 122 L125 83 L166 96 L207 58 L248 74 L290 39 L331 65 L372 51 L414 92 L455 62 L496 77 L538 29 L579 46 L620 15 V160 H0Z" /><path className="chart-line" d="M0 132 L42 116 L83 122 L125 83 L166 96 L207 58 L248 74 L290 39 L331 65 L372 51 L414 92 L455 62 L496 77 L538 29 L579 46 L620 15" /></svg></div>
        </div></div>
      </motion.div>
    </section>
    <section className="metrics-section"><p>TRUSTED PERFORMANCE, MEASURABLE RESULTS</p><div className="metrics-grid">{metrics.map(([value, label]) => <div key={label}><strong>{value}</strong><span>{label}</span></div>)}</div></section>
    <section className="features-section" id="features"><div className="section-intro"><span className="section-kicker"><Sparkles size={15} /> BUILT DIFFERENT</span><h2>Powerful underneath.<br /><em>Effortless on top.</em></h2><p>Everything you need to keep critical infrastructure healthy—without getting buried in the details.</p></div><div className="feature-grid">{features.map((feature, index) => <motion.article className="feature-card" key={feature.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.1 }}><span className="feature-icon">{feature.icon}</span><span className="feature-number">0{index + 1}</span><h3>{feature.title}</h3><p>{feature.text}</p><button type="button" onClick={() => scrollToSection('pricing')}>Discover more <ArrowRight size={15} /></button></motion.article>)}</div></section>
    <section className="closing-section" id="pricing"><div><span className="section-kicker"><Zap size={15} /> READY WHEN YOU ARE</span><h2>Move at the<br /><em>speed of lightning.</em></h2></div><div className="closing-action"><p>Start with the tools your team needs today, then scale without changing your workflow.</p><Link to="/register" className="button button-bright">Create your account <ArrowRight size={18} /></Link></div></section>
  </main><footer className="landing-footer"><Link to="/" className="brand"><span className="brand-mark"><Zap size={15} fill="currentColor" /></span><span>lightning<b>bot</b></span></Link><span>© 2026 LightningBot. Built for uptime.</span><div><button onClick={() => scrollToSection('platform')}>Platform</button><button onClick={() => scrollToSection('features')}>Features</button><Link to="/login">Log in</Link></div></footer></div>;
}
