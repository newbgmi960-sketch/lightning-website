import React, { useState, useEffect } from 'react';
import { Activity, Users, Zap, Server } from 'lucide-react';
import { AreaChart, Area, XAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { supabase } from '../lib/supabaseClient';

const getPlanDetails = (planName) => {
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

export default function Dashboard() {
  const [balance, setBalance] = useState(0.00);
  const [activePlan, setActivePlan] = useState('None');
  const [expiry, setExpiry] = useState('N/A');
  const [totalUsers, setTotalUsers] = useState(0);

  // Realistic changing live numbers
  const [runningAttacks, setRunningAttacks] = useState(0);
  const [totalAttacks, setTotalAttacks] = useState(0);
  const [liveLoad, setLiveLoad] = useState(0.0);
  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setBalance(session.user.user_metadata?.balance ?? 0.00);
        setActivePlan(session.user.user_metadata?.active_plan ?? 'None');
        const rawExpiry = session.user.user_metadata?.plan_expiry;
        if (rawExpiry) {
          setExpiry(new Date(rawExpiry).toLocaleDateString());
        }
      }
    });

    // Fetch real user count from DB
    supabase.rpc('get_total_users_count').then(({ data, error }) => {
      if (!error && data !== null) {
        setTotalUsers(data);
      }
    });
  }, []);

  // Set up live updating metrics (attacks & load load simulation)
  useEffect(() => {
    // Generate initial 24 hour chart data with low metrics starting around 0
    const initialData = Array.from({ length: 24 }).map((_, i) => ({
      time: `${i}:00`,
      load: Math.random() * 5 // Keep initial load values very low (0% to 5%)
    }));
    setChartData(initialData);

    const interval = setInterval(() => {
      // Simulate random fluctuations of small scale
      const currentActive = Math.floor(Math.random() * 3); // 0 to 2 running attacks
      setRunningAttacks(currentActive);

      // Randomly increment total attacks slightly over time
      setTotalAttacks(prev => prev + Math.floor(Math.random() * 2));

      const newLoad = Math.max(0.0, +(Math.random() * 8).toFixed(1)); // 0% to 8% live load
      setLiveLoad(newLoad);

      // Update chart dynamically
      setChartData(prev => {
        const next = [...prev.slice(1)];
        const nextTime = new Date();
        next.push({
          time: `${nextTime.getHours()}:${nextTime.getMinutes()}`,
          load: newLoad
        });
        return next;
      });
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div style={{ background: '#0a0a0a', border: '1px solid #333', borderRadius: '6px', padding: '8px 12px', boxShadow: '0 4px 6px rgba(0,0,0,0.3)' }}>
          <p style={{ color: '#a1a1aa', fontSize: '0.75rem', marginBottom: '2px' }}>Network Load</p>
          <p className="mono" style={{ color: '#fff', fontSize: '0.875rem' }}>{payload[0].value.toFixed(1)}%</p>
        </div>
      );
    }
    return null;
  };

  const planInfo = getPlanDetails(activePlan);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', maxWidth: '1000px', margin: '0 auto', width: '100%' }}>
      
      <div>
        <h1 className="h1" style={{ marginBottom: '4px' }}>Overview</h1>
        <p className="text-secondary" style={{ fontSize: '0.875rem' }}>Monitor your attack infrastructure and resources.</p>
      </div>

      {/* Top Stats Cards */}
      <div className="dashboard-stats-grid">
        <div className="panel" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <span style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-secondary)' }}>Running Attacks</span>
            <Zap size={16} color="var(--text-muted)" />
          </div>
          <div className="mono" style={{ fontSize: '2rem', fontWeight: 500, color: '#fff' }}>{runningAttacks}</div>
        </div>
        
        <div className="panel" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <span style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-secondary)' }}>Total Attacks</span>
            <Activity size={16} color="var(--text-muted)" />
          </div>
          <div className="mono" style={{ fontSize: '2rem', fontWeight: 500, color: '#fff' }}>{totalAttacks}</div>
        </div>
        
        <div className="panel" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <span style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-secondary)' }}>Total Users</span>
            <Users size={16} color="var(--text-muted)" />
          </div>
          <div className="mono" style={{ fontSize: '2rem', fontWeight: 500, color: '#fff' }}>{totalUsers}</div>
        </div>
      </div>

      {/* Live Metrics Chart */}
      <div className="panel" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#fff' }}></div>
              <span style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-primary)' }}>Live Metrics</span>
            </div>
            <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Global Network Load</div>
          </div>
          <div className="mono" style={{ fontSize: '0.875rem', color: '#fff' }}>
            {liveLoad.toFixed(1)}%
          </div>
        </div>

        <div style={{ height: '240px', width: '100%' }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorLoad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#fff" stopOpacity={0.1}/>
                  <stop offset="100%" stopColor="#fff" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis dataKey="time" hide />
              <Tooltip 
                content={<CustomTooltip />}
                cursor={{ stroke: '#333', strokeWidth: 1, strokeDasharray: '4 4' }}
              />
              <Area 
                type="monotone" 
                dataKey="load" 
                stroke="#fff" 
                strokeWidth={1.5} 
                fillOpacity={1} 
                fill="url(#colorLoad)" 
                activeDot={{ r: 4, fill: '#000', stroke: '#fff', strokeWidth: 2 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Bottom Grid */}
      <div className="dashboard-bottom-grid">
        
        {/* Plan Details */}
        <div className="panel" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px', fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-primary)' }}>
            <Server size={16} /> Plan Details
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.875rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '12px', borderBottom: '1px solid #222' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Current Plan</span>
              <span style={{ color: '#fff', fontWeight: 600 }}>{planInfo.name}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '12px', borderBottom: '1px solid #222' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Concurrents</span>
              <span className="mono" style={{ color: '#fff' }}>{planInfo.concurrents}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '12px', borderBottom: '1px solid #222' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Max Duration</span>
              <span className="mono" style={{ color: '#fff' }}>{planInfo.duration}s</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '12px', borderBottom: '1px solid #222' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Expires</span>
              <span className="mono" style={{ color: '#fff' }}>{expiry}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '4px' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Balance</span>
              <span className="mono" style={{ color: '#fff' }}>${balance.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Resource Usage */}
        <div className="panel" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px', fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-primary)' }}>
             <Activity size={16} /> Resource Usage
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Layer 4 Network</div>
                <div className="mono" style={{ fontSize: '0.75rem', color: '#fff' }}>0 / {planInfo.name !== 'None' ? '40' : '0'}</div>
              </div>
              <div style={{ height: '4px', background: '#222', borderRadius: '2px', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: '0%', background: '#fff', borderRadius: '2px' }}></div>
              </div>
            </div>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Layer 7 Network</div>
                <div className="mono" style={{ fontSize: '0.75rem', color: '#fff' }}>0 / {planInfo.name !== 'None' ? '40' : '0'}</div>
              </div>
              <div style={{ height: '4px', background: '#222', borderRadius: '2px', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: '0%', background: '#fff', borderRadius: '2px' }}></div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
