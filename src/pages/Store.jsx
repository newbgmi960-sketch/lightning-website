import React, { useState } from 'react';
import { Check } from 'lucide-react';

export default function Store() {
  const [activeTab, setActiveTab] = useState('normal');

  const normalPlans = [
    {
      name: 'Starter #1',
      price: '$10.00',
      features: ['Up to 1 concurrent', 'Max 60s attack', 'API Access', 'Fast Support', '1 Month Access']
    },
    {
      name: 'BASIC #1',
      price: '$28.00',
      features: ['Up to 2 concurrent', '1200 seconds max time', 'Basic Layer 4 Methods', 'Basic Layer 7 Methods', 'Normal Network priority']
    },
    {
      name: 'BASIC #2',
      price: '$44.00',
      features: ['Up to 3 concurrent', '1200 seconds max time', 'Basic Layer 4 Methods', 'Basic Layer 7 Methods', 'Normal Network priority']
    },
    {
      name: 'ADVANCED #1',
      price: '$69.00',
      features: ['Up to 5 concurrent', '1200 seconds max time', 'Premium Layer 4 Methods', 'Premium Layer 7 Methods', 'High Network priority', 'API Access']
    },
    {
      name: 'ADVANCED #2',
      price: '$110.00',
      features: ['Up to 8 concurrent', 'Max 800s attack', 'API Access', 'Fast Support', '1 Month Access']
    },
    {
      name: 'PROFESSIONAL #1',
      price: '$149.00',
      features: ['Up to 10 concurrent', 'Max 1,200s attack', 'API Access', 'Fast Support', '1 Month Access']
    },
    {
      name: 'PROFESSIONAL #2',
      price: '$190.00',
      features: ['Up to 13 concurrent', 'Max 1,500s attack', 'API Access', 'Fast Support', '1 Month Access']
    },
    {
      name: 'BUSINESS #1',
      price: '$229.00',
      features: ['Up to 16 concurrent', 'Max 2,200s attack', 'API Access', 'Fast Support', '1 Month Access']
    },
    {
      name: 'BUSINESS #2',
      price: '$300.00',
      features: ['Up to 20 concurrent', 'Max 2,500s attack', 'API Access', 'Fast Support', '1 Month Access']
    },
    {
      name: 'ENTERPRISE',
      price: '$600.00',
      features: ['Up to 40 concurrent', 'Max 2,100s attack', 'API Access', 'Fast Support', '1 Month Access']
    },
    {
      name: 'test123',
      price: '$600.00',
      features: ['Up to 40 concurrent', 'Max 2,100s attack', 'API Access', 'Fast Support', '1 Month Access']
    },
    {
      name: 'contact @satanswrath',
      price: '$990.00',
      features: ['Up to 1 concurrent', 'Max 1s attack', 'Fast Support', '1 Month Access']
    }
  ];

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
      <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', marginBottom: '48px', textAlign: 'center' }}>
        Choose the plan that fits your needs — normal, L7 only, or fully custom.
      </p>

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
          style={{ flex: 1, background: '#0a0a0a', borderRadius: '8px' }}
        />
        <button className="btn" style={{ background: '#333', color: '#fff', padding: '8px 24px', borderRadius: '8px' }}>
          Apply
        </button>
      </div>

      {/* Pricing Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px', width: '100%' }}>
        {normalPlans.map((plan, idx) => (
          <div key={idx} className="panel" style={{ padding: '32px', display: 'flex', flexDirection: 'column' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#fff', marginBottom: '16px' }}>{plan.name}</h3>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginBottom: '32px' }}>
              <span className="mono" style={{ fontSize: '2.5rem', fontWeight: 700, color: '#fff', letterSpacing: '-0.025em' }}>{plan.price}</span>
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

            <button className="btn btn-primary" style={{ width: '100%', marginTop: '32px', padding: '12px', borderRadius: '8px', fontWeight: 600 }}>
              Purchase
            </button>
          </div>
        ))}
      </div>

    </div>
  );
}
