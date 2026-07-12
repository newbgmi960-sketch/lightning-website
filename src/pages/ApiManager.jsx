import React, { useState } from 'react';
import { Shield, Settings, Server, Plus, Trash2, Copy, Check } from 'lucide-react';

export default function ApiManager() {
  const [ip, setIp] = useState('165.22.52.126');
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', maxWidth: '1000px', margin: '0 auto', width: '100%' }}>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 className="h1" style={{ marginBottom: '4px' }}>API Manager</h1>
          <p className="text-secondary" style={{ fontSize: '0.875rem' }}>Manage your developer API access and whitelisted IP addresses.</p>
        </div>
        <button className="btn btn-primary">
           <Plus size={14} /> Create Key
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        
        {/* Left: Whitelist */}
        <div className="panel" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px', fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-primary)' }}>
            <Shield size={16} /> IP Whitelist
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
              Only IP addresses listed here will be able to make requests to the API using your key.
            </p>
            
            <div style={{ display: 'flex', gap: '8px' }}>
              <input 
                type="text" 
                value={ip} 
                onChange={(e) => setIp(e.target.value)} 
                style={{ flex: 1 }}
              />
              <button className="btn btn-outline">Save</button>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px', background: '#111', borderRadius: '6px', border: '1px solid var(--border-color)', marginTop: '8px' }}>
               <Server size={14} color="var(--text-muted)" />
               <span className="mono" style={{ fontSize: '0.875rem', flex: 1 }}>165.22.52.126</span>
               <button className="btn btn-ghost" style={{ padding: '4px' }}>
                 <Trash2 size={14} />
               </button>
            </div>
          </div>
        </div>

        {/* Right: API Keys */}
        <div className="panel" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px', fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-primary)' }}>
            <Settings size={16} /> Active Keys
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
              Your secret API keys. Do not share these with anyone.
            </p>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px', background: '#111', borderRadius: '6px', border: '1px solid var(--border-color)' }}>
               <span className="mono" style={{ fontSize: '0.875rem', flex: 1, color: 'var(--text-muted)' }}>••••••••••••••••••••••••••••</span>
               <button className="btn btn-ghost" style={{ padding: '4px' }} onClick={handleCopy}>
                 {copied ? <Check size={14} color="#10b981" /> : <Copy size={14} />}
               </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
