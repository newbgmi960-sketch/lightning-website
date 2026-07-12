import React, { useState, useEffect } from 'react';
import { Send, CheckCircle2, Loader, ShieldAlert } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';

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

export default function Profile() {
  const [activePlan, setActivePlan] = useState('None');
  const [expiry, setExpiry] = useState('N/A');
  const [loading, setLoading] = useState(true);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [updateLoading, setUpdateLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setActivePlan(session.user.user_metadata?.active_plan ?? 'None');
        const rawExpiry = session.user.user_metadata?.plan_expiry;
        if (rawExpiry) {
          setExpiry(new Date(rawExpiry).toLocaleDateString());
        }
      }
      setLoading(false);
    });
  }, []);

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    setMessage({ text: '', type: '' });

    if (newPassword.length < 6) {
      setMessage({ text: 'New password must be at least 6 characters.', type: 'error' });
      return;
    }

    if (newPassword !== confirmPassword) {
      setMessage({ text: 'Passwords do not match.', type: 'error' });
      return;
    }

    setUpdateLoading(true);

    const { error } = await supabase.auth.updateUser({
      password: newPassword
    });

    if (error) {
      setMessage({ text: error.message, type: 'error' });
    } else {
      setMessage({ text: 'Password updated successfully!', type: 'success' });
      setNewPassword('');
      setConfirmPassword('');
    }
    setUpdateLoading(false);
  };

  const planInfo = getPlanDetails(activePlan);

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', width: '100%', minHeight: '300px' }}>
        <Loader className="animate-spin" size={24} color="var(--accent-color)" />
      </div>
    );
  }

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

      {message.text && (
        <div style={{ 
          background: message.type === 'success' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)', 
          border: message.type === 'success' ? '1px solid rgba(16, 185, 129, 0.2)' : '1px solid rgba(239, 68, 68, 0.2)', 
          color: message.type === 'success' ? '#34d399' : '#f87171',
          padding: '16px 20px', 
          borderRadius: '12px', 
          fontSize: '0.9rem', 
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          width: '100%',
          boxSizing: 'border-box'
        }}>
          <span>{message.text}</span>
        </div>
      )}

      {/* Plan Details */}
      <div className="panel" style={{ width: '100%', padding: '24px' }}>
        <h3 style={{ fontSize: '1.125rem', fontWeight: 600, color: '#fff', marginBottom: '24px' }}>Plan Details</h3>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }} className="dashboard-stats-grid">
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '8px' }}>PLAN</div>
            <div style={{ fontWeight: 600, color: '#fff', fontSize: '1rem' }}>{planInfo.name}</div>
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '8px' }}>CONCURRENTS</div>
            <div className="mono" style={{ fontWeight: 600, color: '#fff', fontSize: '1rem' }}>{planInfo.concurrents}</div>
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '8px' }}>MAX DURATION</div>
            <div className="mono" style={{ fontWeight: 600, color: '#fff', fontSize: '1rem' }}>{planInfo.duration}s</div>
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '8px' }}>EXPIRES</div>
            <div className="mono" style={{ fontWeight: 600, color: '#fff', fontSize: '1rem' }}>{expiry}</div>
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
        <form onSubmit={handleUpdatePassword} className="panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column' }}>
          <h3 style={{ fontSize: '1.125rem', fontWeight: 600, color: '#fff', marginBottom: '8px' }}>Change Password</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '24px' }}>
            Enter your new password below to update it.
          </p>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', flex: 1 }}>
            <input 
              type="password" 
              placeholder="New Password" 
              required
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              disabled={updateLoading}
              style={{ background: '#000', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '10px 12px', color: '#fff', outline: 'none' }}
            />
            <input 
              type="password" 
              placeholder="Confirm New Password" 
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              disabled={updateLoading}
              style={{ background: '#000', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '10px 12px', color: '#fff', outline: 'none' }}
            />
            <button type="submit" disabled={updateLoading} className="btn btn-primary" style={{ marginTop: 'auto', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              {updateLoading ? <Loader className="animate-spin" size={16} /> : 'Update Password'}
            </button>
          </div>
        </form>

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
