import React from 'react';
import { Activity, Users, Zap, Server, ChevronRight } from 'lucide-react';
import { AreaChart, Area, XAxis, Tooltip, ResponsiveContainer } from 'recharts';

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

export default function Dashboard() {
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
          <div className="mono" style={{ fontSize: '2rem', fontWeight: 500, color: '#fff' }}>48</div>
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
              <span style={{ color: '#fff' }}>Professional #1</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '12px', borderBottom: '1px solid #222' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Concurrents</span>
              <span className="mono" style={{ color: '#fff' }}>12</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '12px', borderBottom: '1px solid #222' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Max Duration</span>
              <span className="mono" style={{ color: '#fff' }}>1200s</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '12px', borderBottom: '1px solid #222' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Status</span>
              <span style={{ color: '#fff', display: 'flex', alignItems: 'center', gap: '6px' }}>
                 <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10b981' }}></div> Active
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '4px' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Balance</span>
              <span className="mono" style={{ color: '#fff' }}>$4,700.00</span>
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
                <div className="mono" style={{ fontSize: '0.75rem', color: '#fff' }}>41 / 100</div>
              </div>
              <div style={{ height: '4px', background: '#222', borderRadius: '2px', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: '41%', background: '#fff', borderRadius: '2px' }}></div>
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Layer 4 Network</div>
                <div className="mono" style={{ fontSize: '0.75rem', color: '#fff' }}>9 / 40</div>
              </div>
              <div style={{ height: '4px', background: '#222', borderRadius: '2px', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: '23%', background: '#fff', borderRadius: '2px' }}></div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
