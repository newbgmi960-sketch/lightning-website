import React, { useState, useEffect } from 'react';
import { Terminal, Send, Search, ShieldAlert, Cpu, Activity, Settings, Info, Zap, Square, Loader, ChevronDown } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';

export default function Panel() {
  const [layer, setLayer] = useState('L4');
  const [method, setMethod] = useState('');
  const [port, setPort] = useState(80);
  const [time, setTime] = useState(60);
  const [conns, setConns] = useState(1);
  const [target, setTarget] = useState('');
  const [subnet, setSubnet] = useState('/32 — Host (1)');
  const [isAttacking, setIsAttacking] = useState(false);
  const [activeTasks, setActiveTasks] = useState([]);
  const [apiError, setApiError] = useState(null);
  const [activePlan, setActivePlan] = useState('None');
  const [loadingPlan, setLoadingPlan] = useState(true);
  const [isMethodDropdownOpen, setIsMethodDropdownOpen] = useState(false);
  const [isSubnetDropdownOpen, setIsSubnetDropdownOpen] = useState(false);
  const [reqMethod, setReqMethod] = useState('GET');
  const [homehold, setHomehold] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setActivePlan(session.user.user_metadata?.active_plan ?? 'None');
      }
      setLoadingPlan(false);
    });
  }, []);

  const getPlanLimits = (planName) => {
    const name = (planName || 'None').toUpperCase();
    if (name.includes('STARTER')) return { name: 'Starter #1', concurrents: 1, duration: 180 };
    if (name.includes('BASIC #1')) return { name: 'Basic #1', concurrents: 2, duration: 180 };
    if (name.includes('BASIC #2')) return { name: 'Basic #2', concurrents: 3, duration: 180 };
    if (name.includes('ADVANCED #1')) return { name: 'Advanced #1', concurrents: 5, duration: 180 };
    if (name.includes('ADVANCED #2')) return { name: 'Advanced #2', concurrents: 8, duration: 180 };
    if (name.includes('PROFESSIONAL #1')) return { name: 'Professional #1', concurrents: 10, duration: 180 };
    if (name.includes('PROFESSIONAL #2')) return { name: 'Professional #2', concurrents: 13, duration: 180 };
    if (name.includes('BUSINESS #1')) return { name: 'Business #1', concurrents: 16, duration: 180 };
    if (name.includes('BUSINESS #2')) return { name: 'Business #2', concurrents: 20, duration: 180 };
    if (name.includes('ENTERPRISE')) return { name: 'Enterprise', concurrents: 40, duration: 180 };
    if (name.includes('BRONZE') || name.includes('SILVER') || name.includes('GOLD') || name.includes('PLATINUM') || name.includes('DIAMOND')) return { name: planName, concurrents: 2, duration: 180 };
    if (name.includes('OWNER') || name.includes('LIGHTNING OWNER')) return { name: 'Lightning Owner', concurrents: 40, duration: 2600 };
    return { name: 'None', concurrents: 0, duration: 0 };
  };

  const planLimits = getPlanLimits(activePlan);
  const maxConns = planLimits.concurrents;
  const concurrentProgress = maxConns > 1
    ? Math.min(100, Math.max(0, ((Number(conns) - 1) / (maxConns - 1)) * 100))
    : (maxConns === 1 ? 100 : 0);
  const maxDuration = planLimits.duration;
  const hasPlan = planLimits.name !== 'None';

  // Keep homehold ref to avoid timer closure capture staleness
  const homeholdRef = React.useRef(homehold);
  useEffect(() => {
    homeholdRef.current = homehold;
  }, [homehold]);

  // Helper: fire attack restart via secure Edge Function (no credentials in browser)
  const fireRestartApi = React.useCallback(async (task) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      await supabase.functions.invoke('launch-attack', {
        body: {
          layer: task.layer,
          method: task.method,
          target: task.target,
          port: task.port || 80,
          time: task.time,
          conns: task.conns || 1,
          reqMethod: task.reqMethod || 'GET',
        },
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
    } catch (err) {
      console.error('Homehold restart failed', err);
    }
  }, []);

  // Helper to re-sync tasks based on wall-clock time (fixes background tab throttling)
  const syncTasksWithTime = React.useCallback((prevTasks) => {
    const now = Date.now();
    const pad = (num) => String(num).padStart(2, '0');

    const updated = prevTasks.map(task => {
      const elapsed = Math.floor((now - task.startTimestamp) / 1000);
      const remaining = task.time - elapsed;

      if (remaining <= 0 && homeholdRef.current) {
        // Expired while in background — trigger homehold restart
        fireRestartApi(task);
        const d = new Date();
        return {
          ...task,
          timeLeft: task.time,
          startTimestamp: now,
          startedAt: `${pad(d.getMonth() + 1)}/${pad(d.getDate())}/${d.getFullYear()}, ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`
        };
      }

      if (remaining <= 0) return null; // expired, remove
      return { ...task, timeLeft: remaining };
    }).filter(Boolean);

    return updated;
  }, [fireRestartApi]);

  // Interval-based timer using wall-clock for accurate countdown
  useEffect(() => {
    if (activeTasks.length > 0) {
      const timer = setInterval(() => {
        setActiveTasks(prev => {
          const now = Date.now();
          const pad = (num) => String(num).padStart(2, '0');

          return prev.map(task => {
            const elapsed = Math.floor((now - task.startTimestamp) / 1000);
            const remaining = task.time - elapsed;

            if (remaining <= 1 && homeholdRef.current) {
              // About to expire with homehold ON — restart
              fireRestartApi(task);
              const d = new Date();
              return {
                ...task,
                timeLeft: task.time,
                startTimestamp: now,
                startedAt: `${pad(d.getMonth() + 1)}/${pad(d.getDate())}/${d.getFullYear()}, ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`
              };
            }

            return { ...task, timeLeft: Math.max(0, remaining) };
          }).filter(task => task.timeLeft > 0);
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [activeTasks.length]);

  // Page Visibility API — sync timers when tab comes back to foreground
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        setActiveTasks(prev => syncTasksWithTime(prev));
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [syncTasksWithTime]);

  const formatTimeLeft = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const getLayerLabel = (task) => {
    const methodUpper = task.method.toUpperCase();
    let protocol = methodUpper;
    if (task.layer === 'L7') protocol = 'HTTP';
    else if (methodUpper.includes('UDP')) protocol = 'UDP';
    else if (methodUpper.includes('TCP')) protocol = 'TCP';
    return `${task.layer} • ${protocol}`;
  };

  const handleStopAttack = (id) => {
    setActiveTasks(prev => prev.filter(task => task.id !== id));
  };

  const handleLaunchAttack = async () => {
    if (!target || !method || !hasPlan) return;

    setIsAttacking(true);
    setApiError(null);

    // Enforce limits
    const finalConns = Math.min(Number(conns) || 1, maxConns);
    const finalDuration = Math.min(Number(time) || 10, maxDuration);

    // All API calls go through our secure Edge Function — no credentials in browser
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setApiError('Session expired. Please sign in again.');
        setIsAttacking(false);
        return;
      }

      const { data: fnData, error: fnError } = await supabase.functions.invoke('launch-attack', {
        body: {
          layer,
          method,
          target,
          port: port || 80,
          time: finalDuration,
          conns: finalConns,
          reqMethod: layer === 'L7' ? reqMethod : 'GET',
        },
        headers: { Authorization: `Bearer ${session.access_token}` },
      });

      if (fnError) {
        if (method !== 'UDP-BOTNET') {
          // Try to extract a human-readable message from the error body
          let msg = 'Attack failed. Check target details.';
          try {
            const body = typeof fnError.context?.json === 'function'
              ? await fnError.context.json()
              : fnError.context;
            if (body?.error) msg = body.error;
            else if (body?.upstream) msg = `API Error: ${body.upstream}`;
          } catch (_) { /* use default msg */ }
          setApiError(msg);
          setIsAttacking(false);
          return;
        }
      }

      // Show upstream API error if returned (e.g. bad token, invalid target)
      if (fnData && !fnData.success && fnData.error) {
        setApiError(`API Error: ${fnData.error}`);
        setIsAttacking(false);
        return;
      }

      // Show upstream API message if it indicates an error
      if (fnData?.upstream && typeof fnData.upstream === 'string') {
        const up = fnData.upstream.toLowerCase();
        if (up.includes('error') || up.includes('invalid') || up.includes('fail') || up.includes('unauthorized')) {
          setApiError(`API: ${fnData.upstream}`);
          setIsAttacking(false);
          return;
        }
      }
    } catch (err) {
      console.error('Launch error:', err);
      setApiError('Network error. Please try again.');
      setIsAttacking(false);
      return;
    }

    // Add tasks immediately — no artificial delay needed
    const pad = (num) => String(num).padStart(2, '0');
    const d = new Date();
    const formattedDate = `${pad(d.getMonth() + 1)}/${pad(d.getDate())}/${d.getFullYear()}, ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;

    const newTasks = [];
    const launchTime = Date.now();
    for (let i = 0; i < finalConns; i++) {
      newTasks.push({
        id: `${launchTime}-${i}-${Math.random()}`,
        target,
        method: method.toUpperCase(),
        port,
        time: finalDuration,
        timeLeft: finalDuration,
        startTimestamp: launchTime,
        conns: 1,
        layer,
        reqMethod: layer === 'L7' ? reqMethod : null,
        startedAt: formattedDate
      });
    }

    setActiveTasks(prev => [...newTasks, ...prev]);
    setIsAttacking(false);
  };
  
  if (loadingPlan) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', width: '100%', minHeight: '300px' }}>
        <Loader className="animate-spin" size={24} color="var(--accent-color)" />
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', maxWidth: '100%', width: '100%' }}>
      
      <div>
        <h1 className="h1" style={{ marginBottom: '4px' }}>Attack Panel</h1>
        <p className="text-secondary" style={{ fontSize: '0.875rem' }}>Configure and launch network stress tests.</p>
      </div>

      {apiError && (
        <div style={{ 
          background: 'rgba(239, 68, 68, 0.1)', 
          border: '1px solid rgba(239, 68, 68, 0.2)', 
          color: '#f87171',
          padding: '16px 20px', 
          borderRadius: '12px', 
          fontSize: '0.9rem', 
          display: 'flex',
          alignItems: 'center',
          gap: '10px'
        }}>
          <ShieldAlert size={20} />
          <span><strong>Attack Failed:</strong> {apiError}</span>
        </div>
      )}

      <div className="panel-container-grid">
        
        {/* Banner if no plan */}
        {!hasPlan && (
          <div style={{ 
            background: 'rgba(239, 68, 68, 0.1)', 
            border: '1px solid rgba(239, 68, 68, 0.2)', 
            borderRadius: '12px', 
            padding: '16px 20px', 
            display: 'flex', 
            alignItems: 'center', 
            gap: '12px',
            color: '#f87171',
            gridColumn: 'span 2'
          }}>
            <ShieldAlert size={24} />
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: '2px', textTransform: 'uppercase' }}>No Active Plan</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                You do not have an active subscription. Please visit the <Link to="/store" style={{ color: '#fff', textDecoration: 'underline', fontWeight: 600 }}>Store</Link> to purchase a plan before launching attacks.
              </div>
            </div>
          </div>
        )}

        {/* Left Column: Configuration */}
        <div className="panel" style={{ padding: '24px', opacity: hasPlan ? 1 : 0.6 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <Settings size={18} color="var(--text-secondary)" style={{ transform: 'rotate(0deg)' }} />
            <h2 style={{ fontSize: '0.875rem', fontWeight: 700, color: '#fff', letterSpacing: '0.05em', textTransform: 'uppercase', margin: 0 }}>Configuration</h2>
          </div>
          
          <div style={{ height: '1px', background: 'var(--border-color)', marginBottom: '24px' }}></div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Layer Toggle */}
            <div>
              <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-secondary)', letterSpacing: '0.05em', marginBottom: '8px' }}>ATTACK LAYER</label>
              <div className="toggle-group" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', background: '#000', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '4px', gap: '4px' }}>
                <button 
                  className={`toggle-btn ${layer === 'L4' ? 'active' : ''}`}
                  onClick={() => { if(hasPlan) { setLayer('L4'); setMethod(''); } }}
                  disabled={!hasPlan}
                  style={{ borderRadius: '6px', padding: '8px 12px', fontWeight: 600 }}
                >
                  LAYER 4
                </button>
                <button 
                  className={`toggle-btn ${layer === 'L7' ? 'active' : ''}`}
                  onClick={() => { if(hasPlan) { setLayer('L7'); setMethod(''); } }}
                  disabled={!hasPlan}
                  style={{ borderRadius: '6px', padding: '8px 12px', fontWeight: 600 }}
                >
                  LAYER 7
                </button>
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-secondary)', letterSpacing: '0.05em', marginBottom: '8px' }}>{layer === 'L4' ? 'TARGET IP' : 'TARGET URL'}</label>
              <input 
                type="text" 
                value={target}
                onChange={(e) => setTarget(e.target.value)}
                placeholder={layer === 'L4' ? "20.204.231.11" : "https://example.com"} 
                disabled={!hasPlan}
                style={{ background: '#000', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '10px 12px', width: '100%', boxSizing: 'border-box' }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '16px' }}>
              {layer === 'L4' ? (
                <div>
                  <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-secondary)', letterSpacing: '0.05em', marginBottom: '8px' }}>SUBNET</label>
                  <div style={{ position: 'relative' }}>
                    <div 
                      onClick={() => hasPlan && setIsSubnetDropdownOpen(!isSubnetDropdownOpen)}
                      style={{ 
                        background: '#0a0a0a', 
                        border: '1px solid var(--border-color)', 
                        borderRadius: '12px', 
                        padding: '10px 12px', 
                        color: subnet ? '#fff' : 'var(--text-secondary)',
                        cursor: hasPlan ? 'pointer' : 'not-allowed',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        userSelect: 'none',
                        width: '100%'
                      }}
                    >
                      {subnet}
                      <ChevronDown size={16} color="var(--text-secondary)" style={{ transform: isSubnetDropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }} />
                    </div>

                    {isSubnetDropdownOpen && (
                      <>
                        <div 
                          style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 10 }}
                          onClick={() => setIsSubnetDropdownOpen(false)}
                        ></div>
                        <div style={{
                          position: 'absolute',
                          top: '100%',
                          left: 0,
                          right: 0,
                          marginTop: '4px',
                          background: 'rgba(10, 10, 10, 0.95)',
                          backdropFilter: 'blur(12px)',
                          border: '1px solid rgba(255, 255, 255, 0.1)',
                          borderRadius: '12px',
                          overflowY: 'auto',
                          maxHeight: '200px',
                          zIndex: 20,
                          boxShadow: '0 4px 20px rgba(0,0,0,0.5)'
                        }}>
                          {['/32 — Host (1)', '/24 — Subnet (256)', '/16 — Subnet (65536)'].map((s) => (
                            <div 
                              key={s}
                              onClick={() => {
                                setSubnet(s);
                                setIsSubnetDropdownOpen(false);
                              }}
                              style={{
                                padding: '10px 12px',
                                color: '#fff',
                                cursor: 'pointer',
                                background: subnet === s ? 'rgba(255,255,255,0.05)' : 'transparent',
                                borderBottom: '1px solid rgba(255,255,255,0.02)'
                              }}
                              onMouseEnter={(e) => { if(subnet !== s) e.currentTarget.style.background = 'rgba(255,255,255,0.02)' }}
                              onMouseLeave={(e) => { if(subnet !== s) e.currentTarget.style.background = 'transparent' }}
                            >
                              {s}
                            </div>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                </div>
              ) : (
                <div>
                  <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-secondary)', letterSpacing: '0.05em', marginBottom: '8px' }}>REQUEST METHOD</label>
                  <div className="toggle-group" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', background: '#000', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '4px', gap: '4px' }}>
                    <button 
                      className={`toggle-btn ${reqMethod === 'GET' ? 'active' : ''}`}
                      onClick={() => hasPlan && setReqMethod('GET')}
                      disabled={!hasPlan}
                      style={{ borderRadius: '6px', padding: '8px 12px', fontWeight: 600 }}
                    >
                      GET
                    </button>
                    <button 
                      className={`toggle-btn ${reqMethod === 'POST' ? 'active' : ''}`}
                      onClick={() => hasPlan && setReqMethod('POST')}
                      disabled={!hasPlan}
                      style={{ borderRadius: '6px', padding: '8px 12px', fontWeight: 600 }}
                    >
                      POST
                    </button>
                  </div>
                </div>
              )}
              <div>
                <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-secondary)', letterSpacing: '0.05em', marginBottom: '8px' }}>PORT</label>
                <input
                  type="number" 
                  value={port}
                  onChange={(e) => setPort(e.target.value)}
                  placeholder="80" 
                  className="mono"
                  disabled={!hasPlan}
                  style={{ background: '#000', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '10px 12px', width: '100%', boxSizing: 'border-box' }}
                />
              </div>
            </div>

            <div style={{
                background: '#030303',
                border: '1px solid var(--border-color)',
                borderRadius: '8px',
                padding: '12px 16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginTop: '4px'
              }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.8rem', color: '#fff', textTransform: 'uppercase', marginBottom: '2px', letterSpacing: '0.05em' }}>Homehold</div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Auto-restart running {layer} job when timer ends</div>
                </div>
                <div 
                  onClick={() => hasPlan && setHomehold(!homehold)}
                  style={{
                    width: '40px',
                    height: '22px',
                    borderRadius: '11px',
                    background: homehold ? 'var(--accent-color)' : '#111',
                    border: '1px solid var(--border-color)',
                    padding: '2px',
                    cursor: hasPlan ? 'pointer' : 'not-allowed',
                    transition: 'all 0.2s ease',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: homehold ? 'flex-end' : 'flex-start'
                  }}
                >
                  <div style={{
                    width: '16px',
                    height: '16px',
                    borderRadius: '50%',
                    background: homehold ? '#000' : '#fff',
                    transition: 'all 0.2s ease',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.4)'
                  }}></div>
                </div>
              </div>

            {/* Duration Input */}
            <div>
              <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-secondary)', letterSpacing: '0.05em', marginBottom: '8px' }}>DURATION (MAX {maxDuration}s)</label>
              <input 
                type="number" 
                value={time}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  setTime(val > maxDuration ? maxDuration : val);
                }}
                placeholder="60" 
                className="mono"
                disabled={!hasPlan}
                style={{ background: '#000', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '10px 12px' }}
              />
            </div>

            {/* Method Select */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                <label style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-secondary)', letterSpacing: '0.05em', margin: 0 }}>ATTACK METHOD</label>
                <Info size={12} color="var(--text-muted)" style={{ cursor: 'pointer' }} />
              </div>
              <div style={{ position: 'relative' }}>
                <div 
                  onClick={() => hasPlan && setIsMethodDropdownOpen(!isMethodDropdownOpen)}
                  style={{ 
                    background: '#000', 
                    border: '1px solid var(--border-color)', 
                    borderRadius: '8px', 
                    padding: '10px 12px', 
                    color: method ? '#fff' : 'var(--text-secondary)',
                    cursor: hasPlan ? 'pointer' : 'not-allowed',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    userSelect: 'none'
                  }}
                >
                  {method || 'Select attack method...'}
                  <ChevronDown size={16} color="var(--text-secondary)" style={{ transform: isMethodDropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }} />
                </div>

                {isMethodDropdownOpen && (
                  <>
                    <div 
                      style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 10 }}
                      onClick={() => setIsMethodDropdownOpen(false)}
                    ></div>
                    <div style={{
                      position: 'absolute',
                      top: '100%',
                      left: 0,
                      right: 0,
                      marginTop: '4px',
                      background: 'rgba(10, 10, 10, 0.95)',
                      backdropFilter: 'blur(12px)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: '12px',
                      overflowY: 'auto',
                      maxHeight: '200px',
                      zIndex: 20,
                      boxShadow: '0 4px 20px rgba(0,0,0,0.5)'
                    }}>
                      {layer === 'L4' ? (
                        <>
                          <div style={{ padding: '8px 12px 4px 12px', fontSize: '0.65rem', color: '#666', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase' }}>GAME METHODS</div>
                          {['BGMI-V2', 'BGMI'].map((m) => (
                            <div 
                              key={m}
                              onClick={() => {
                                setMethod(m);
                                setIsMethodDropdownOpen(false);
                              }}
                              style={{
                                padding: '10px 12px',
                                color: '#fff',
                                cursor: 'pointer',
                                background: method === m ? 'rgba(255,255,255,0.05)' : 'transparent',
                                borderBottom: '1px solid rgba(255,255,255,0.02)'
                              }}
                              onMouseEnter={(e) => { if(method !== m) e.currentTarget.style.background = 'rgba(255,255,255,0.02)' }}
                              onMouseLeave={(e) => { if(method !== m) e.currentTarget.style.background = 'transparent' }}
                            >
                              {m}
                            </div>
                          ))}
                          <div style={{ padding: '8px 12px 4px 12px', fontSize: '0.65rem', color: '#666', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', borderTop: '1px solid rgba(255,255,255,0.05)', marginTop: '4px' }}>BOOTNET-METHODS</div>
                          {['UDP-BOTNET'].map((m) => (
                            <div 
                              key={m}
                              onClick={() => {
                                setMethod(m);
                                setIsMethodDropdownOpen(false);
                              }}
                              style={{
                                padding: '10px 12px',
                                color: '#fff',
                                cursor: 'pointer',
                                background: method === m ? 'rgba(255,255,255,0.05)' : 'transparent',
                                borderBottom: '1px solid rgba(255,255,255,0.02)'
                              }}
                              onMouseEnter={(e) => { if(method !== m) e.currentTarget.style.background = 'rgba(255,255,255,0.02)' }}
                              onMouseLeave={(e) => { if(method !== m) e.currentTarget.style.background = 'transparent' }}
                            >
                              {m}
                            </div>
                          ))}
                        </>
                      ) : (
                        ['priv-flood', 'httpbypass', 'HTTP-LOADBALANCE', 'TLS-FREE'].map((m) => (
                          <div 
                            key={m}
                            onClick={() => {
                              setMethod(m);
                              setIsMethodDropdownOpen(false);
                            }}
                            style={{
                              padding: '10px 12px',
                              color: '#fff',
                              cursor: 'pointer',
                              background: method === m ? 'rgba(255,255,255,0.05)' : 'transparent',
                              borderBottom: '1px solid rgba(255,255,255,0.02)'
                            }}
                            onMouseEnter={(e) => { if(method !== m) e.currentTarget.style.background = 'rgba(255,255,255,0.02)' }}
                            onMouseLeave={(e) => { if(method !== m) e.currentTarget.style.background = 'transparent' }}
                          >
                            {m}
                          </div>
                        ))
                      )}
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Concurrents Input & Slider */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <label style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-secondary)', letterSpacing: '0.05em', margin: 0 }}>CONCURRENTS (MAX {maxConns})</label>
                <input 
                  type="number" 
                  min="1"
                  max={maxConns}
                  value={conns}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val === '') {
                      setConns('');
                    } else {
                      const num = parseInt(val, 10);
                      if (!isNaN(num)) {
                        setConns(Math.max(1, Math.min(maxConns, num)));
                      }
                    }
                  }}
                  placeholder="1"
                  className="mono"
                  disabled={!hasPlan}
                  style={{ 
                    background: '#000', 
                    border: '1px solid var(--border-color)', 
                    borderRadius: '6px', 
                    padding: '4px 8px', 
                    width: '60px',
                    textAlign: 'center',
                    fontSize: '0.8rem'
                  }}
                />
              </div>
              <div className="concurrency-slider" style={{ '--concurrent-progress': `${concurrentProgress}%` }}>
                <div className="concurrency-slider-fill" aria-hidden="true" />
                <input 
                  className="concurrency-range"
                  type="range"
                  min="1"
                  max={maxConns || 1}
                  value={conns || 1}
                  onChange={(e) => setConns(Number(e.target.value))}
                  disabled={!hasPlan}
                  aria-label="Concurrent operations"
                />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>
                <span>1</span>
                <span>{maxConns}</span>
              </div>
            </div>

            <button 
              className="btn btn-primary" 
              style={{ 
                width: '100%', 
                padding: '12px', 
                borderRadius: '8px', 
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                color: '#fff',
                fontWeight: 600,
                opacity: (!target || !method || isAttacking || !hasPlan) ? 0.5 : 1,
                transition: 'all 0.2s',
                marginTop: '8px'
              }}
              onClick={handleLaunchAttack}
              disabled={!target || !method || isAttacking || !hasPlan}
            >
              <Send size={14} /> {isAttacking ? 'Launching...' : 'Launch Attack'}
            </button>
          </div>
        </div>

        {/* Right Column: Status & Info */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Active Attacks Panel */}
          <div className="panel" style={{ padding: '24px', flex: 1, display: 'flex', flexDirection: 'column', gap: '20px' }}>
            
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  width: '40px', 
                  height: '40px', 
                  borderRadius: '50%', 
                  background: 'rgba(255, 255, 255, 0.05)', 
                  border: '1px solid rgba(255, 255, 255, 0.1)' 
                }}>
                  <Activity size={20} color="#fff" />
                </div>
                <div>
                  <h2 style={{ fontSize: '1rem', fontWeight: 600, color: '#fff', margin: 0 }}>Active Attacks</h2>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                    {activeTasks.length} concurrent
                  </span>
                </div>
              </div>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '6px', 
                background: 'rgba(16, 185, 129, 0.05)', 
                border: '1px solid rgba(16, 185, 129, 0.2)', 
                padding: '4px 10px', 
                borderRadius: '12px',
                fontSize: '0.75rem',
                fontWeight: 600,
                color: '#10b981'
              }}>
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10b981', display: 'inline-block' }}></span>
                LIVE
              </div>
            </div>

            {/* Filters */}
            <div className="task-filters" aria-label="Task filters">
              <span className="task-filter"><span>All layers</span><ChevronDown size={14} /></span>
              <span className="task-filter"><span>Time remaining</span><ChevronDown size={14} /></span>
            </div>

            {/* Cards List wrapper */}
            {activeTasks.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', overflowY: 'auto', maxHeight: '600px', paddingRight: '4px' }}>
                {activeTasks.map((task) => (
                  <div key={task.id} style={{ 
                    background: '#080808', 
                    border: '1px solid rgba(255, 255, 255, 0.06)', 
                    borderRadius: '8px', 
                    display: 'flex',
                    flexDirection: 'column'
                  }}>
                    {/* Card Header */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.875rem', fontWeight: 600, color: '#fff' }}>
                        <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#fff', boxShadow: '0 0 8px 2px rgba(255, 255, 255, 0.8)', display: 'inline-block' }}></span>
                        {getLayerLabel(task)}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <span style={{ 
                          background: 'rgba(255, 255, 255, 0.08)', 
                          color: '#fff', 
                          padding: '4px 10px', 
                          borderRadius: '20px', 
                          fontSize: '0.65rem', 
                          fontWeight: 700,
                          border: '1px solid rgba(255, 255, 255, 0.1)',
                          letterSpacing: '0.05em'
                        }}>
                          RUNNING
                        </span>
                        <span className="mono" style={{ color: '#fff', fontWeight: 700, fontSize: '0.95rem' }}>
                          {formatTimeLeft(task.timeLeft)}
                        </span>
                      </div>
                    </div>

                    {/* Separator Line */}
                    <div style={{ height: '1px', background: 'rgba(255, 255, 255, 0.06)' }}></div>

                    {/* Card Content Grid */}
                    <div className="panel-card-content-grid">
                      {/* Column 1 */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        <div>
                          <div style={{ fontSize: '0.65rem', color: '#666', marginBottom: '4px', fontWeight: 600, letterSpacing: '0.05em' }}>TARGET</div>
                          <div className="mono" style={{ fontSize: '0.875rem', color: '#fff', fontWeight: 700, wordBreak: 'break-all' }}>
                            {task.target}{task.port ? `:${task.port}` : ''}
                          </div>
                        </div>
                        <div>
                          <div style={{ fontSize: '0.65rem', color: '#666', marginBottom: '4px', fontWeight: 600, letterSpacing: '0.05em' }}>PROXY TYPE</div>
                          <div style={{ fontSize: '0.875rem', color: '#fff', fontWeight: 700 }}>Global</div>
                        </div>
                      </div>

                      {/* Column 2 */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        <div>
                          <div style={{ fontSize: '0.65rem', color: '#666', marginBottom: '4px', fontWeight: 600, letterSpacing: '0.05em' }}>METHOD</div>
                          <div className="mono" style={{ fontSize: '0.875rem', color: '#fff', fontWeight: 700 }}>
                            {task.method}
                          </div>
                        </div>
                        <div>
                          <div style={{ fontSize: '0.65rem', color: '#666', marginBottom: '4px', fontWeight: 600, letterSpacing: '0.05em' }}>TIME LEFT</div>
                          <div className="mono" style={{ fontSize: '0.875rem', color: '#fff', fontWeight: 700 }}>
                            {formatTimeLeft(task.timeLeft)}
                          </div>
                        </div>
                      </div>

                      {/* Column 3 */}
                      <div>
                        <div style={{ fontSize: '0.65rem', color: '#666', marginBottom: '4px', fontWeight: 600, letterSpacing: '0.05em' }}>CONC</div>
                        <div className="mono" style={{ fontSize: '0.875rem', color: '#fff', fontWeight: 700 }}>
                          x{task.conns}
                        </div>
                      </div>

                      {/* Column 4 */}
                      <div>
                        <div style={{ fontSize: '0.65rem', color: '#666', marginBottom: '4px', fontWeight: 600, letterSpacing: '0.05em' }}>SENT AT</div>
                        <div style={{ fontSize: '0.8rem', color: '#fff', fontWeight: 700, wordBreak: 'break-word' }}>
                          {task.startedAt}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1, minHeight: '240px', textAlign: 'center' }}>
                 <div style={{ 
                   width: '48px', 
                   height: '48px', 
                   borderRadius: '8px', 
                   background: '#000000', 
                   border: '1px solid var(--border-color)', 
                   display: 'flex', 
                   alignItems: 'center', 
                   justifyContent: 'center',
                   marginBottom: '16px'
                 }}>
                   <Zap size={20} color="var(--text-muted)" />
                 </div>
                 <h3 style={{ fontSize: '0.95rem', fontWeight: 600, color: '#fff', marginBottom: '6px' }}>No Active Attacks</h3>
                 <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Launch an attack to see real-time statistics</p>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
