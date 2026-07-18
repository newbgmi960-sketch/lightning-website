import { supabase } from './supabaseClient';

const defaultEntitlement = {
  balance: 0,
  activePlan: 'None',
  planExpiry: null,
};

export async function getMyEntitlement() {
  const { data, error } = await supabase.rpc('get_my_entitlement');
  if (error) throw error;

  const row = Array.isArray(data) ? data[0] : data;
  if (!row) return defaultEntitlement;

  return {
    balance: Number(row.balance ?? 0),
    activePlan: row.active_plan || 'None',
    planExpiry: row.plan_expiry || null,
  };
}
