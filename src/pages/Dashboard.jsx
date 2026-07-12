import React, { useState, useEffect } from 'react';
import { Activity, Users, Zap, Server, ChevronRight } from 'lucide-react';
import { AreaChart, Area, XAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { supabase } from '../lib/supabaseClient';

const data = [
  { time: '0:00', load: 32 }, { time: '1:00', load: 33 }, { time: '2:00', load: 32.5 },
  { time: '3:00', load: 35 }, { time: '4:00', load: 34.5 }, { time: '5:00', load: 36 },
  { time: '6:00', load: 35.5 }, { time: '7:00', load: 38 }, { time: '8:00', load: 42 },
  { time: '9:00', load: 39 }, { time: '10:00', load: 38.5 }, { time: '11:00', load: 41 },
  { time: '12:00', load: 45 }, { time: '13:00', load: 47 }, { time: '14:00', load: 44 },
  { time: '15:00', load: 43.5 }, { time: '16:00', load: 42 }, { time: '17:00', load: 40 },
  { time: '18:00', load: 38 }, { time: '19:00', load: 36 }, { time: '20:00', load: 35 },
  { time: '21:00', load: 34.5 }, { time: '22:00', load: 34 }, { time: '23:00', load: 33.8 }
];

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

const getPlanDetails = (planName) => {
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

export default function Dashboard() {
  const [balance, setBalance] = useState(0.00);
  const [activePlan, setActivePlan] = useState('None');

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setBalance(session.user.user_metadata?.balance ?? 0.00);
        setActivePlan(session.user.user_metadata?.active_plan ?? 'None');
      }
    });
  }, []);

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
          <div className="mono" style={{ fontSize: '2rem', fontWeight: 500, color: '#fff' }}>0</div>
        </div>
        
        <div className="panel" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <span style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-secondary)' }}>Total Attacks</span>
            <Activity size={16} color="var(--text-muted)" />
          </div>
          <div className="mono" style={{ fontSize: '2rem', fontWeight: 500, color: '#fff' }}>2,619,455</div>
        </div>
        
        <div className="panel" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <span style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-secondary)' }}>Total Users</span>
            <Users size={16} color="var(--text-muted)" />
          </div>
          <div className="mono" style={{ fontSize: '2rem', fontWeight: 500, color: '#fff' }}>747</div>
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
            34.3%
          </div>
        </div>

        <div style={{ height: '240px', width: '100%' }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
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
              <span style={{ color: 'var(--text-secondary)' }}>Status</span>
              <span style={{ color: '#fff', display: 'flex', alignItems: 'center', gap: '6px' }}>
                 <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: planInfo.name !== 'None' ? '#10b981' : '#6b7280' }}></div> 
                 {planInfo.name !== 'None' ? 'Active' : 'Inactive'}
              </span>
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
                <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Layer 7 Network</div>
                <div className="mono" style={{ fontSize: '0.75rem', color: '#fff' }}>0 / {planInfo.name !== 'None' ? '100' : '0'}</div>
              </div>
              <div style={{ height: '4px', background: '#222', borderRadius: '2px', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: '0%', background: '#fff', borderRadius: '2px' }}></div>
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Layer 4 Network</div>
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
