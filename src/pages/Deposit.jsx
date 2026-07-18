import React, { useState, useEffect } from 'react';
import { Wallet, Send, Info, CheckCircle2, ShieldAlert, Coins } from 'lucide-react';
import { getMyEntitlement } from '../lib/entitlements';

export default function Deposit() {
  const [balance, setBalance] = useState(0.00);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMyEntitlement()
      .then((entitlement) => setBalance(entitlement.balance))
      .catch(() => setBalance(0))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', maxWidth: '800px', margin: '0 auto', width: '100%', paddingTop: '40px', paddingBottom: '80px' }}>
      
      <div>
        <h1 className="h1" style={{ marginBottom: '4px' }}>Deposit Funds</h1>
        <p className="text-secondary" style={{ fontSize: '0.875rem' }}>Add funds to your balance to purchase subscription plans.</p>
      </div>

      {/* Balance Summary Card */}
      <div className="panel deposit-balance-card" style={{ padding: '32px', background: 'rgba(255,255,255,0.01)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'var(--accent-transparent)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Wallet size={24} color="var(--accent-color)" />
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>Current Balance</div>
            <h2 className="mono" style={{ fontSize: '2rem', fontWeight: 800, margin: 0, color: '#fff' }}>${balance.toFixed(2)}</h2>
          </div>
        </div>
      </div>

      {/* Grid options */}
      <div className="dashboard-bottom-grid">
        
        {/* Automatic gateways */}
        <div className="panel" style={{ padding: '28px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '1rem', fontWeight: 600, color: '#fff' }}>
            <Coins size={18} /> Automatic Deposit
          </div>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.5, margin: 0 }}>
            Configure standard automated payment gateways like Crypto (BTC, USDT, LTC) or Credit Card.
          </p>

          <div style={{ 
            background: 'rgba(239, 68, 68, 0.1)', 
            border: '1px solid rgba(239, 68, 68, 0.2)', 
            color: '#f87171',
            padding: '16px', 
            borderRadius: '8px', 
            fontSize: '0.8rem',
            marginTop: 'auto',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '8px'
          }}>
            <ShieldAlert size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
            <span>Automated gateways are currently undergoing security maintenance. Please use manual deposit.</span>
          </div>
        </div>

        {/* Manual Deposit via Telegram */}
        <div className="panel" style={{ padding: '28px', display: 'flex', flexDirection: 'column', gap: '16px', border: '1px solid var(--accent-transparent)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '1rem', fontWeight: 600, color: '#fff' }}>
            <Send size={18} color="var(--accent-color)" /> Manual Deposit (Telegram)
          </div>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.5, margin: 0 }}>
            Add funds instantly using direct transfer (UPI, Crypto, Cards). 
          </p>
          
          <div style={{ background: 'rgba(255, 255, 255, 0.02)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '12px 16px', fontSize: '0.8rem', color: 'var(--text-primary)', lineHeight: 1.5 }}>
            Agar aapko balance <strong>deposit</strong> karna hai, koi plan <strong>buy</strong> karna hai, ya koi <strong>query / doubt</strong> hai, to direct Telegram par contact karein.
          </div>

          <a 
            href="https://t.me/incarnativating" 
            target="_blank" 
            rel="noopener noreferrer"
            className="btn btn-primary" 
            style={{ 
              width: '100%', 
              marginTop: 'auto', 
              padding: '12px', 
              borderRadius: '8px', 
              fontWeight: 600, 
              display: 'flex', 
              justifyContent: 'center', 
              alignItems: 'center', 
              gap: '8px',
              textDecoration: 'none'
            }}
          >
            <Send size={16} /> Contact Admin @incarnativating
          </a>
        </div>

      </div>

    </div>
  );
}
