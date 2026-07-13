import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Users, Trash2, Edit2, ShieldAlert, CheckCircle2, Loader, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Admin() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [search, setSearch] = useState('');
  
  // Edit Modal State
  const [editingUser, setEditingUser] = useState(null);
  const [editPlan, setEditPlan] = useState('');
  const [editBalance, setEditBalance] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      // We will use the custom RPC function we create in Supabase
      const { data, error } = await supabase.rpc('get_all_users_admin');
      
      if (error) throw error;
      setUsers(data || []);
    } catch (err) {
      setError(err.message || 'Failed to fetch users. Ensure you have run the SQL script in Supabase.');
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = (user) => {
    setEditingUser(user);
    setEditPlan(user.active_plan || 'None');
    setEditBalance(user.balance || 0);
  };

  const handleSaveEdit = async () => {
    setIsSaving(true);
    setError('');
    setSuccess('');
    try {
      const { error } = await supabase.rpc('update_user_admin', {
        target_user_id: editingUser.id,
        new_plan: editPlan,
        new_balance: parseFloat(editBalance)
      });

      if (error) throw error;
      
      setSuccess(`User ${editingUser.email.split('@')[0]} updated successfully!`);
      setEditingUser(null);
      fetchUsers(); // Refresh list
    } catch (err) {
      setError(err.message || 'Failed to update user.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteUser = async (userId, username) => {
    if (!window.confirm(`Are you sure you want to completely delete ${username}? This cannot be undone.`)) return;

    setError('');
    setSuccess('');
    try {
      const { error } = await supabase.rpc('delete_user_admin', {
        target_user_id: userId
      });

      if (error) throw error;
      
      setSuccess(`User ${username} deleted successfully.`);
      fetchUsers();
    } catch (err) {
      setError(err.message || 'Failed to delete user.');
    }
  };

  const filteredUsers = users.filter(u => 
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', maxWidth: '1000px', width: '100%', margin: '0 auto' }}>
      <div>
        <h1 className="h1" style={{ marginBottom: '4px' }}>Admin Dashboard</h1>
        <p className="text-secondary" style={{ fontSize: '0.875rem' }}>Manage registered users, balances, and plans.</p>
      </div>

      {(error || success) && (
        <div style={{ 
          background: error ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)', 
          border: `1px solid ${error ? 'rgba(239, 68, 68, 0.2)' : 'rgba(16, 185, 129, 0.2)'}`, 
          color: error ? '#f87171' : '#34d399',
          padding: '16px 20px', 
          borderRadius: '12px', 
          display: 'flex',
          alignItems: 'center',
          gap: '10px'
        }}>
          {error ? <ShieldAlert size={20} /> : <CheckCircle2 size={20} />}
          <span>{error || success}</span>
        </div>
      )}

      {/* User List Panel */}
      <div className="panel" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Users size={18} color="var(--accent-color)" />
            <h2 className="h2" style={{ fontSize: '1rem' }}>Registered Users</h2>
          </div>
          <input 
            type="text" 
            placeholder="Search username..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ width: '250px', padding: '8px 16px', borderRadius: '20px' }}
          />
        </div>

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}>
            <Loader className="animate-spin" size={24} color="var(--accent-color)" />
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-secondary)' }}>
                  <th style={{ padding: '12px 16px', fontWeight: 600 }}>Username</th>
                  <th style={{ padding: '12px 16px', fontWeight: 600 }}>Joined</th>
                  <th style={{ padding: '12px 16px', fontWeight: 600 }}>Balance</th>
                  <th style={{ padding: '12px 16px', fontWeight: 600 }}>Active Plan</th>
                  <th style={{ padding: '12px 16px', fontWeight: 600, textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan="5" style={{ padding: '24px', textAlign: 'center', color: 'var(--text-secondary)' }}>No users found.</td>
                  </tr>
                ) : (
                  filteredUsers.map(user => {
                    const username = user.email.split('@')[0];
                    return (
                      <tr key={user.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.02)' }}>
                        <td style={{ padding: '16px', fontWeight: 500, color: '#fff' }}>{username}</td>
                        <td style={{ padding: '16px', color: 'var(--text-secondary)' }}>{new Date(user.created_at).toLocaleDateString()}</td>
                        <td className="mono" style={{ padding: '16px', color: '#10b981' }}>${(user.balance || 0).toFixed(2)}</td>
                        <td style={{ padding: '16px' }}>
                          <span style={{ 
                            background: user.active_plan && user.active_plan !== 'None' ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.02)', 
                            padding: '4px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600
                          }}>
                            {user.active_plan || 'None'}
                          </span>
                        </td>
                        <td style={{ padding: '16px', textAlign: 'right' }}>
                          <button 
                            onClick={() => handleEditClick(user)}
                            className="btn btn-outline" 
                            style={{ padding: '6px 12px', marginRight: '8px', fontSize: '0.75rem' }}
                          >
                            <Edit2 size={12} style={{ marginRight: '4px' }}/> Edit
                          </button>
                          <button 
                            onClick={() => handleDeleteUser(user.id, username)}
                            className="btn btn-outline" 
                            style={{ padding: '6px 12px', color: '#ef4444', borderColor: 'rgba(239,68,68,0.2)', fontSize: '0.75rem' }}
                          >
                            <Trash2 size={12} />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Edit Modal */}
      <AnimatePresence>
        {editingUser && (
          <div style={{ 
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, 
            background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(4px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 
          }}>
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="panel" style={{ width: '100%', maxWidth: '400px', padding: '24px' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <h3 className="h2" style={{ fontSize: '1.25rem' }}>Edit {editingUser.email.split('@')[0]}</h3>
                <button onClick={() => setEditingUser(null)} style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                  <X size={20} />
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '8px', display: 'block' }}>BALANCE ($)</label>
                  <input 
                    type="number" 
                    value={editBalance} 
                    onChange={(e) => setEditBalance(e.target.value)} 
                    step="0.01"
                  />
                </div>
                
                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '8px', display: 'block' }}>ACTIVE PLAN</label>
                  <select value={editPlan} onChange={(e) => setEditPlan(e.target.value)}>
                    <option value="None">None</option>
                    <option value="STARTER #1">STARTER #1</option>
                    <option value="BASIC #1">BASIC #1</option>
                    <option value="BASIC #2">BASIC #2</option>
                    <option value="ADVANCED #1">ADVANCED #1</option>
                    <option value="ADVANCED #2">ADVANCED #2</option>
                    <option value="PROFESSIONAL #1">PROFESSIONAL #1</option>
                    <option value="PROFESSIONAL #2">PROFESSIONAL #2</option>
                    <option value="BUSINESS #1">BUSINESS #1</option>
                    <option value="BUSINESS #2">BUSINESS #2</option>
                    <option value="ENTERPRISE">ENTERPRISE</option>
                  </select>
                </div>

                <button 
                  onClick={handleSaveEdit}
                  disabled={isSaving}
                  className="btn btn-primary" 
                  style={{ width: '100%', padding: '12px', marginTop: '8px', display: 'flex', justifyContent: 'center' }}
                >
                  {isSaving ? <Loader className="animate-spin" size={18} /> : 'Save Changes'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
