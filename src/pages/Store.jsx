import React, { useState, useEffect } from 'react';
import { Check, Loader, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';

export default function Store() {
  const [balance, setBalance] = useState(0.00);
  const [activePlan, setActivePlan] = useState('None');
  const [loading, setLoading] = useState(true);
  const [purchaseLoading, setPurchaseLoading] = useState(null); // stores plan idx when purchasing
  const [promoCode, setPromoCode] = useState('');
  const [promoLoading, setPromoLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' }); // {text: '', type: 'success' | 'error'}

  const monitorPlans = [
    {
      name: 'Lightning Bronze',
      price: 200,
      days: 1,
      endpoints: 2,
      features: ['2 monitored endpoints', '1 day workspace access', 'Live health dashboard', 'Email alerts']
    },
    {
      name: 'Lightning Silver',
      price: 450,
      days: 3,
      endpoints: 2,
      features: ['2 monitored endpoints', '3 days workspace access', 'Live health dashboard', 'Email alerts']
    },
    {
      name: 'Lightning Gold',
      price: 900,
      days: 7,
      endpoints: 2,
      features: ['2 monitored endpoints', '7 days workspace access', 'Live health dashboard', 'Priority support']
    },
    {
      name: 'Lightning Platinum',
      price: 1600,
      days: 14,
      endpoints: 2,
      features: ['2 monitored endpoints', '14 days workspace access', 'Weekly insights', 'Priority support']
    },
    {
      name: 'Lightning Diamond',
      price: 3000,
      days: 30,
      endpoints: 2,
      features: ['2 monitored endpoints', '30 days workspace access', 'Weekly insights', 'Priority support']
    }
  ];

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setBalance(session.user.user_metadata?.balance ?? 0.00);
        setActivePlan(session.user.user_metadata?.active_plan ?? 'None');
      }
      setLoading(false);
    });
  }, []);

  const handleApplyPromo = async () => {
    if (!promoCode) return;
    setPromoLoading(true);
    setMessage({ text: '', type: '' });

    const cleanCode = promoCode.trim().toUpperCase();
    // No active promo codes currently
    setMessage({ text: 'Invalid promo code.', type: 'error' });
    setPromoLoading(false);
  };

  const handlePurchase = async (plan, idx) => {
    setMessage({ text: '', type: '' });
    setPurchaseLoading(idx);

    if (balance < plan.price) {
      setMessage({ text: 'Insufficient balance! Please contact @satanswrath to deposit funds.', type: 'error' });
      setPurchaseLoading(null);
      return;
    }

    const newBalance = balance - plan.price;
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + plan.days);
    
    const { data, error } = await supabase.auth.updateUser({
      data: { 
        balance: newBalance,
        active_plan: plan.name,
        plan_expiry: expiryDate.toISOString()
      }
    });

    if (error) {
      setMessage({ text: error.message, type: 'error' });
    } else {
      setBalance(newBalance);
      setActivePlan(plan.name);
      setMessage({ text: `Success! Purchased ${plan.name}. Your active plan expires on ${expiryDate.toLocaleDateString()}.`, type: 'success' });
    }
    setPurchaseLoading(null);
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', width: '100%', minHeight: '300px' }}>
        <Loader className="animate-spin" size={24} color="var(--accent-color)" />
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', maxWidth: '1000px', margin: '0 auto', paddingTop: '40px', paddingBottom: '80px' }}>
      
      {/* Header */}
        <h1 className="store-title" style={{
        background: 'linear-gradient(180deg, #ffffff 0%, #a1a1aa 100%)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        marginBottom: '16px',
        letterSpacing: '-0.05em'
      }}>
          Infrastructure monitoring
      </h1>
      <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', marginBottom: '32px', textAlign: 'center' }}>
        Pick your rank. Every plan includes monitoring for two endpoints; longer access unlocks better value.
      </p>

      {message.text && (
        <div style={{ 
          background: message.type === 'success' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)', 
          border: message.type === 'success' ? '1px solid rgba(16, 185, 129, 0.2)' : '1px solid rgba(239, 68, 68, 0.2)', 
          color: message.type === 'success' ? '#34d399' : '#f87171',
          padding: '16px 24px', 
          borderRadius: '12px', 
          fontSize: '0.9rem', 
          marginBottom: '32px', 
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          width: '100%',
          maxWidth: '600px',
          boxSizing: 'border-box'
        }}>
          {message.type === 'success' ? <CheckCircle2 size={20} /> : <ShieldAlert size={20} />}
          <span>{message.text}</span>
        </div>
      )}

      {/* User Status Bar */}
      <div style={{ display: 'flex', gap: '24px', justifyContent: 'center', alignItems: 'center', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', borderRadius: '16px', padding: '16px 32px', marginBottom: '40px', width: '100%', maxWidth: '600px', boxSizing: 'border-box' }}>
        <div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>Your Balance</div>
          <div className="mono" style={{ fontSize: '1.5rem', fontWeight: 700, color: '#fff' }}>₹{balance.toFixed(0)}</div>
        </div>
        <div style={{ width: '1px', height: '32px', background: 'var(--border-color)' }}></div>
        <div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>Active Plan</div>
          <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--accent-color)' }}>{activePlan}</div>
        </div>
      </div>

      {/* Promo Code */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '64px', width: '100%', maxWidth: '400px' }}>
        <input 
          type="text" 
          placeholder="Promo code" 
          value={promoCode}
          onChange={(e) => setPromoCode(e.target.value)}
          disabled={promoLoading}
          style={{ flex: 1, background: '#0a0a0a', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '10px 16px', color: '#fff', outline: 'none' }}
        />
        <button 
          onClick={handleApplyPromo}
          disabled={promoLoading || !promoCode}
          className="btn" 
          style={{ background: '#333', color: '#fff', padding: '8px 24px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
        >
          {promoLoading ? <Loader className="animate-spin" size={14} /> : 'Apply'}
        </button>
      </div>

      {/* Pricing Grid */}
      <div className="store-pricing-grid">
        {monitorPlans.map((plan, idx) => (
          <div key={idx} className="panel" style={{ padding: '32px', display: 'flex', flexDirection: 'column', border: activePlan === plan.name ? '1px solid var(--accent-color)' : '1px solid var(--border-color)' }}>
            <div style={{ color: 'var(--lime)', fontSize: '0.7rem', fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '10px' }}>{plan.days} day access · {plan.endpoints} endpoints</div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#fff', marginBottom: '16px' }}>{plan.name}</h3>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginBottom: '32px' }}>
              <span className="mono" style={{ fontSize: '2.5rem', fontWeight: 700, color: '#fff', letterSpacing: '-0.025em' }}>₹{plan.price.toLocaleString('en-IN')}</span>
              <span style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>/{plan.days} day{plan.days > 1 ? 's' : ''}</span>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', flex: 1 }}>
              {plan.features.map((feature, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '18px', height: '18px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)' }}>
                    <Check size={12} color="#a1a1aa" />
                  </div>
                  <span style={{ fontSize: '0.875rem', color: 'var(--text-primary)' }}>{feature}</span>
                </div>
              ))}
            </div>

            <button 
              onClick={() => handlePurchase(plan, idx)}
              disabled={purchaseLoading !== null || activePlan === plan.name}
              className="btn btn-primary" 
              style={{ width: '100%', marginTop: '32px', padding: '12px', borderRadius: '8px', fontWeight: 600, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '6px' }}
            >
              {purchaseLoading === idx ? (
                <Loader className="animate-spin" size={16} />
              ) : activePlan === plan.name ? (
                'Active Plan'
              ) : (
                'Purchase'
              )}
            </button>
          </div>
        ))}
      </div>

    </div>
  );
}
