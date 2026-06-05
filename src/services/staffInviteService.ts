import { supabase } from './supabase';

export type StaffRole = 'admin' | 'editor' | 'operador';

export interface StaffInvite {
  id: string;
  email: string;
  role: StaffRole;
  invited_by?: string | null;
  accepted_at?: string | null;
  created_at: string;
}

export const staffInviteService = {
  async listInvites(): Promise<StaffInvite[]> {
    const { data, error } = await supabase
      .from('staff_invites')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return (data as StaffInvite[]) || [];
  },

  async createInvite(email: string, role: StaffRole): Promise<StaffInvite> {
    const normalized = email.trim().toLowerCase();
    const { data, error } = await supabase
      .from('staff_invites')
      .upsert({ email: normalized, role }, { onConflict: 'email' })
      .select()
      .single();
    if (error) throw error;
    return data as StaffInvite;
  },

  async deleteInvite(id: string): Promise<void> {
    const { error } = await supabase.from('staff_invites').delete().eq('id', id);
    if (error) throw error;
  },

  async getPendingInviteByEmail(email: string): Promise<StaffInvite | null> {
    const { data, error } = await supabase
      .from('staff_invites')
      .select('*')
      .eq('email', email.trim().toLowerCase())
      .is('accepted_at', null)
      .maybeSingle();
    if (error) throw error;
    return data as StaffInvite | null;
  },

  async applyInviteForUser(userId: string, email: string): Promise<StaffRole | null> {
    const invite = await this.getPendingInviteByEmail(email);
    if (!invite) return null;

    const { error: profileError } = await supabase
      .from('profiles')
      .update({ role: invite.role, updated_at: new Date().toISOString() })
      .eq('id', userId);

    if (profileError) throw profileError;

    await supabase
      .from('staff_invites')
      .update({ accepted_at: new Date().toISOString() })
      .eq('id', invite.id);

    return invite.role;
  },
};
