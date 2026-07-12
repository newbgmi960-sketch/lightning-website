import React, { useState, useEffect } from 'react';
import { Check, Loader, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';

export default function Store() {
  const [activeTab, setActiveTab] = useState('normal');
  const [balance, setBalance] = useState(0.00);
  const [activePlan, setActivePlan] = useState('None');
  const [loading, setLoading] = useState(true);
  const [purchaseLoading, setPurchaseLoading] = useState(null); // stores plan idx when purchasing
  const [promoCode, setPromoCode] = useState('');
  const [promoLoading, setPromoLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' }); // {text: '', type: 'success' | 'error'}

  const normalPlans = [
    {
      name: 'Starter #1',
      price: 10.00,
      features: ['Up to 1 concurrent', 'Max 60s attack', 'API Access', 'Fast Support', '1 Month Access']
    },
    {
      name: 'BASIC #1',
      price: 28.00,
      features: ['Up to 2 concurrent', '1200 seconds max time', 'Basic Layer 4 Methods', 'Basic Layer 7 Methods', 'Normal Network priority']
    },
    {
      name: 'BASIC #2',
      price: 44.00,
      features: ['Up to 3 concurrent', '1200 seconds max time', 'Basic Layer 4 Methods', 'Basic Layer 7 Methods', 'Normal Network priority']
    },
    {
      name: 'ADVANCED #1',
      price: 69.00,
      features: ['Up to 5 concurrent', '1200 seconds max time', 'Premium Layer 4 Methods', 'Premium Layer 7 Methods', 'High Network priority', 'API Access']
    },
    {
      name: 'ADVANCED #2',
      price: 110.00,
      features: ['Up to 8 concurrent', 'Max 800s attack', 'API Access', 'Fast Support', '1 Month Access']
    },
    {
      name: 'PROFESSIONAL #1',
      price: 149.00,
      features: ['Up to 10 concurrent', 'Max 1,200s attack', 'API Access', 'Fast Support', '1 Month Access']
    },
    {
      name: 'PROFESSIONAL #2',
      price: 190.00,
      features: ['Up to 13 concurrent', 'Max 1,500s attack', 'API Access', 'Fast Support', '1 Month Access']
    },
    {
      name: 'BUSINESS #1',
      price: 229.00,
      features: ['Up to 16 concurrent', 'Max 2,200s attack', 'API Access', 'Fast Support', '1 Month Access']
    },
    {
      name: 'BUSINESS #2',
      price: 300.00,
      features: ['Up to 20 concurrent', 'Max 2,500s attack', 'API Access', 'Fast Support', '1 Month Access']
    },
    {
      name: 'ENTERPRISE',
      price: 600.00,
      features: ['Up to 40 concurrent', 'Max 2,100s attack', 'API Access', 'Fast Support', '1 Month Access']
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
    if (cleanCode === 'TEST100') {
      const newBalance = balance + 100.00;
      const { data, error } = await supabase.auth.updateUser({
        data: { balance: newBalance }
      });

      if (error) {
        setMessage({ text: error.message, type: 'error' });
      } else {
        setBalance(newBalance);
        setMessage({ text: 'Promo code applied! $100.00 added to your balance.', type: 'success' });
        setPromoCode('');
      }
    } else {
      setMessage({ text: 'Invalid promo code.', type: 'error' });
    }
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
    const { data, error } = await supabase.auth.updateUser({
      data: { 
        balance: newBalance,
        active_plan: plan.name
      }
    });

    if (error) {
      setMessage({ text: error.message, type: 'error' });
    } else {
      setBalance(newBalance);
      setActivePlan(plan.name);
      setMessage({ text: `Success! Purchased ${plan.name}. Your active plan has been updated.`, type: 'success' });
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
      <h1 style={{
        fontSize: '4rem',
        fontWeight: 800,
        background: 'linear-gradient(180deg, #ffffff 0%, #a1a1aa 100%)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        marginBottom: '16px',
        letterSpacing: '-0.05em'
      }}>
        Pricing
      </h1>
      <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', marginBottom: '32px', textAlign: 'center' }}>
        Choose the plan that fits your needs — normal, L7 only, or fully custom.
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
          <div className="mono" style={{ fontSize: '1.5rem', fontWeight: 700, color: '#fff' }}>${balance.toFixed(2)}</div>
        </div>
        <div style={{ width: '1px', height: '32px', background: 'var(--border-color)' }}></div>
        <div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>Active Plan</div>
          <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--accent-color)' }}>{activePlan}</div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', background: '#0a0a0a', border: '1px solid var(--border-color)', borderRadius: '32px', padding: '4px', marginBottom: '32px' }}>
        <button 
          onClick={() => setActiveTab('normal')}
          style={{
            padding: '8px 24px', borderRadius: '28px', border: 'none', 
            background: activeTab === 'normal' ? 'rgba(255,255,255,0.1)' : 'transparent',
            color: activeTab === 'normal' ? '#fff' : 'var(--text-secondary)',
            fontWeight: 600, fontSize: '0.875rem', cursor: 'pointer', transition: 'all 0.2s ease'
          }}
        >
          Normal Plans
        </button>
        <button 
          onClick={() => setActiveTab('l7')}
          style={{
            padding: '8px 24px', borderRadius: '28px', border: 'none', 
            background: activeTab === 'l7' ? 'rgba(255,255,255,0.1)' : 'transparent',
            color: activeTab === 'l7' ? '#fff' : 'var(--text-secondary)',
            fontWeight: 600, fontSize: '0.875rem', cursor: 'pointer', transition: 'all 0.2s ease'
          }}
        >
          L7 Plans
        </button>
        <button 
          onClick={() => setActiveTab('custom')}
          style={{
            padding: '8px 24px', borderRadius: '28px', border: 'none', 
            background: activeTab === 'custom' ? 'rgba(255,255,255,0.1)' : 'transparent',
            color: activeTab === 'custom' ? '#fff' : 'var(--text-secondary)',
            fontWeight: 600, fontSize: '0.875rem', cursor: 'pointer', transition: 'all 0.2s ease'
          }}
        >
          Custom Plan
        </button>
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
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px', width: '100%' }}>
        {normalPlans.map((plan, idx) => (
          <div key={idx} className="panel" style={{ padding: '32px', display: 'flex', flexDirection: 'column', border: activePlan === plan.name ? '1px solid var(--accent-color)' : '1px solid var(--border-color)' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#fff', marginBottom: '16px' }}>{plan.name}</h3>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginBottom: '32px' }}>
              <span className="mono" style={{ fontSize: '2.5rem', fontWeight: 700, color: '#fff', letterSpacing: '-0.025em' }}>${plan.price.toFixed(2)}</span>
              <span style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>/ month</span>
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
