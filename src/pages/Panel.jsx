import React, { useState, useEffect } from 'react';
import { Terminal, Send, Search, ShieldAlert, Cpu, Activity, Settings, Info, Zap, Square } from 'lucide-react';

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
  
  const maxConns = 70; // Set to 70 as per user request

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
    if (!target || !method) return;
    
    setIsAttacking(true);
    
    // Simulate API delay for a realistic user experience
    setTimeout(() => {
      const pad = (num) => String(num).padStart(2, '0');
      const d = new Date();
      const formattedDate = `${pad(d.getMonth() + 1)}/${pad(d.getDate())}/${d.getFullYear()}, ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;

      const connsCount = Number(conns) || 1;
      const newTasks = [];
      for (let i = 0; i < connsCount; i++) {
        newTasks.push({
          id: `${Date.now()}-${i}-${Math.random()}`,
          target,
          method: method.toUpperCase(),
          port,
          time: Number(time),
          timeLeft: Number(time),
          conns: 1, // each simulated attack card shows x1
          layer,
          startedAt: formattedDate
        });
      }

      setActiveTasks(prev => [...newTasks, ...prev]);
      setIsAttacking(false);
    }, 800);
  };
  
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', maxWidth: '100%', width: '100%' }}>
      
      <div>
        <h1 className="h1" style={{ marginBottom: '4px' }}>Attack Panel</h1>
        <p className="text-secondary" style={{ fontSize: '0.875rem' }}>Configure and launch network stress tests.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '440px 1fr', gap: '24px' }}>
        
        {/* Left Column: Configuration */}
        <div className="panel" style={{ padding: '24px' }}>
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
                  onClick={() => setLayer('L4')}
                  style={{ borderRadius: '6px', padding: '8px 12px', fontWeight: 600 }}
                >
                  LAYER 4 - UDP
                </button>
                <button 
                  className={`toggle-btn ${layer === 'L7' ? 'active' : ''}`}
                  onClick={() => setLayer('L7')}
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
                  style={{ background: '#000', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '10px 12px' }}
                />
              </div>
            </div>

            {/* Duration Input */}
            <div>
              <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-secondary)', letterSpacing: '0.05em', marginBottom: '8px' }}>DURATION (SECONDS)</label>
              <input 
                type="number" 
                value={time}
                onChange={(e) => setTime(e.target.value)}
                placeholder="010" 
                className="mono"
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
                style={{ background: '#000', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '10px 12px', color: '#fff' }}
              >
                <option value="" disabled>Select attack method...</option>
                {layer === 'L4' ? (
                  <>
                    <option value="TCP-SYN">TCP-SYN</option>
                    <option value="UDP-FLOOD">UDP-FLOOD</option>
                    <option value="Bgmi">Bgmi</option>
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
                <label style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-secondary)', letterSpacing: '0.05em', margin: 0 }}>CONCURRENTS</label>
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
                max={maxConns} 
                value={conns || 1}
                onChange={(e) => setConns(Number(e.target.value))}
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
                opacity: (!target || !method || isAttacking) ? 0.5 : 1,
                transition: 'all 0.2s',
                marginTop: '8px'
              }}
              onClick={handleLaunchAttack}
              disabled={!target || !method || isAttacking}
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
                    <div style={{ 
                      display: 'grid', 
                      gridTemplateColumns: '1.5fr 1.5fr 1fr 2fr', 
                      gap: '20px',
                      padding: '20px'
                    }}>
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
