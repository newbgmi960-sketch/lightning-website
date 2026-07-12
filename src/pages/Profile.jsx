import React from 'react';
import { Send, CheckCircle2 } from 'lucide-react';

export default function Profile() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', maxWidth: '800px', margin: '0 auto', paddingTop: '40px', paddingBottom: '80px', gap: '24px' }}>
      
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '16px' }}>
        <h1 style={{
          fontSize: '3rem',
          fontWeight: 800,
          background: 'linear-gradient(180deg, #ffffff 0%, #a1a1aa 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          marginBottom: '12px',
          letterSpacing: '-0.05em'
        }}>
          Profile
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
          Update your password and manage account security settings.
        </p>
      </div>

      {/* Plan Details */}
      <div className="panel" style={{ width: '100%', padding: '24px' }}>
        <h3 style={{ fontSize: '1.125rem', fontWeight: 600, color: '#fff', marginBottom: '24px' }}>Plan Details</h3>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '8px' }}>PLAN</div>
            <div style={{ fontWeight: 600, color: '#fff', fontSize: '1rem' }}>PROFESSIONAL #1</div>
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '8px' }}>CONCURRENTS</div>
            <div className="mono" style={{ fontWeight: 600, color: '#fff', fontSize: '1rem' }}>12</div>
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '8px' }}>MAX DURATION</div>
            <div className="mono" style={{ fontWeight: 600, color: '#fff', fontSize: '1rem' }}>1200s</div>
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '8px' }}>EXPIRES</div>
            <div className="mono" style={{ fontWeight: 600, color: '#fff', fontSize: '1rem' }}>7/12/2026</div>
          </div>
        </div>
      </div>

      {/* Telegram */}
      <div className="panel" style={{ width: '100%', padding: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
          <Send size={18} color="#fff" />
          <h3 style={{ fontSize: '1.125rem', fontWeight: 600, color: '#fff' }}>Telegram</h3>
        </div>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '24px' }}>
          Link your Telegram so we can reach you about your plan, account, and important updates.
        </p>

        <div style={{ 
          background: 'rgba(16, 185, 129, 0.1)', 
          border: '1px solid rgba(16, 185, 129, 0.2)', 
          borderRadius: '8px', 
          padding: '16px 20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'rgba(16, 185, 129, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <CheckCircle2 size={18} color="#10b981" />
            </div>
            <div>
              <div style={{ fontWeight: 500, color: '#fff', fontSize: '0.875rem' }}>Connected</div>
              <div className="mono" style={{ color: '#10b981', fontSize: '0.875rem' }}>@ppslegend</div>
            </div>
          </div>
          
          <button className="btn btn-outline" style={{ background: 'rgba(239, 68, 68, 0.1)', borderColor: 'rgba(239, 68, 68, 0.2)', color: '#ef4444' }}>
            Disconnect
          </button>
        </div>
      </div>

      {/* Bottom Grid: Password & Danger Zone */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', width: '100%' }}>
        
        {/* Change Password */}
        <div className="panel" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '1.125rem', fontWeight: 600, color: '#fff', marginBottom: '8px' }}>Change Password</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '24px' }}>
            Password changes require a security check before they are submitted.
          </p>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <input type="password" placeholder="Current Password" />
            <input type="password" placeholder="New Password" />
            <input type="password" placeholder="Confirm New Password" />
            <button className="btn btn-primary" style={{ marginTop: '8px' }}>Update Password</button>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="panel" style={{ padding: '24px', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
          <h3 style={{ fontSize: '1.125rem', fontWeight: 600, color: '#ef4444', marginBottom: '8px' }}>Danger Zone</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '24px' }}>
            Account deletion is permanent and removes all data associated with it. This action cannot be undone.
          </p>
          
          <button className="btn btn-outline" style={{ background: 'rgba(239, 68, 68, 0.1)', borderColor: 'rgba(239, 68, 68, 0.2)', color: '#ef4444', width: '100%' }}>
            Delete Account
          </button>
        </div>

      </div>

    </div>
  );
}
