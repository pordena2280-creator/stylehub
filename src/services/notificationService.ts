import { supabase } from './supabase';
import type { User } from '../types';

export interface NotificationTemplate {
  id: number;
  name: string;
  description?: string;
  subject: string; // For email/SMS
  body: string; // Template content with placeholders
  type: 'email' | 'sms' | 'push' | 'in_app';
  is_active: boolean;
  variables: string[]; // List of available template variables (e.g., ['{customer_name}', '{order_number}'])
  created_at: string;
  updated_at?: string;
}

export interface Notification {
  id: number;
  user_id: string;
  template_id: number;
  recipient: string; // Email, phone number, or device token
  subject?: string; // For email notifications
  body: string; // Rendered content
  type: 'email' | 'sms' | 'push' | 'in_app';
  status: 'pending' | 'sent' | 'failed' | 'delivered' | 'read';
  sent_at?: string;
  delivered_at?: string;
  read_at?: string;
  error_message?: string;
  metadata: Record<string, any>; // Additional data (order ID, etc.)
  created_at: string;
}

export interface NotificationSettings {
  id: number;
  email_from: string;
  email_from_name: string;
  smtp_host?: string;
  smtp_port?: number;
  smtp_user?: string;
  smtp_pass?: string;
  sms_provider?: string; // 'twilio', 'nexmo', etc.
  sms_from?: string;
  push_provider?: string; // 'firebase', 'onesignal', etc.
  push_config?: Record<string, any>;
  is_email_enabled: boolean;
  is_sms_enabled: boolean;
  is_push_enabled: boolean;
  created_at: string;
  updated_at?: string;
}

export const notificationService = {
  // Get all notification templates
  async getNotificationTemplates(): Promise<NotificationTemplate[]> {
    const { data, error } = await supabase
      .from('notification_templates')
      .select('*')
      .order('name', { ascending: true });
    
    if (error) throw error;
    return (data as NotificationTemplate[]) || [];
  },

  // Get notification template by ID
  async getNotificationTemplateById(id: number): Promise<NotificationTemplate | null> {
    const { data, error } = await supabase
      .from('notification_templates')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) return null;
    return data as NotificationTemplate;
  },

  // Create notification template
  async createNotificationTemplate(template: Omit<NotificationTemplate, 'id' | 'created_at' | 'updated_at'>): Promise<NotificationTemplate> {
    const { data, error } = await supabase
      .from('notification_templates')
      .insert({
        ...template,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();
    
    if (error) throw error;
    return data as NotificationTemplate;
  },

  // Update notification template
  async updateNotificationTemplate(id: number, updates: Partial<NotificationTemplate>): Promise<NotificationTemplate> {
    const { data, error } = await supabase
      .from('notification_templates')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data as NotificationTemplate;
  },

  // Delete notification template
  async deleteNotificationTemplate(id: number): Promise<void> {
    const { error } = await supabase
      .from('notification_templates')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  },

  // Get notification settings
  async getNotificationSettings(): Promise<NotificationSettings | null> {
    const { data, error } = await supabase
      .from('notification_settings')
      .select('*')
      .single();
    
    if (error && error.code !== 'PGRST116') { // No rows found
      throw error;
    }
    return data as NotificationSettings || null;
  },

  // Update notification settings
  async updateNotificationSettings(settings: Partial<NotificationSettings>): Promise<NotificationSettings> {
    const { data, error } = await supabase
      .from('notification_settings')
      .upsert({
        ...settings,
        updated_at: new Date().toISOString()
      }, { onConflict: 'id' })
      .select()
      .single();
    
    if (error) throw error;
    return data as NotificationSettings;
  },

  // Send notification (queue for delivery)
  async sendNotification(notification: Omit<Notification, 'id' | 'created_at'>): Promise<Notification> {
    const { data, error } = await supabase
      .from('notifications')
      .insert({
        ...notification,
        status: 'pending',
        created_at: new Date().toISOString()
      })
      .select()
      .single();
    
    if (error) throw error;
    return data as Notification;
  },

  // Get notifications for user
  async getUserNotifications(userId: string, limit = 50): Promise<Notification[]> {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);
    
    if (error) throw error;
    return (data as Notification[]) || [];
  },

  // Mark notification as read
  async markAsRead(notificationId: number): Promise<void> {
    const { error } = await supabase
      .from('notifications')
      .update({
        status: 'read',
        read_at: new Date().toISOString()
      })
      .eq('id', notificationId);
    
    if (error) throw error;
  },

  // Get notification statistics
  async getNotificationStats(): Promise<{
    total: number;
    pending: number;
    sent: number;
    failed: number;
    delivered: number;
    read: number;
  }> {
    const { data, error } = await supabase
      .from('notifications')
      .select('status')
      .not('status', 'is', null);
    
    if (error) throw error;
    
    const stats = {
      total: 0,
      pending: 0,
      sent: 0,
      failed: 0,
      delivered: 0,
      read: 0
    };
    
    (data || []).forEach(notification => {
      stats.total++;
      if (notification.status === 'pending') stats.pending++;
      if (notification.status === 'sent') stats.sent++;
      if (notification.status === 'failed') stats.failed++;
      if (notification.status === 'delivered') stats.delivered++;
      if (notification.status === 'read') stats.read++;
    });
    
    return stats;
  },

  // Render template with variables
  renderTemplate(template: NotificationTemplate, variables: Record<string, string>): { subject: string; body: string } {
    let subject = template.subject;
    let body = template.body;
    
    Object.keys(variables).forEach(key => {
      const placeholder = `{${key}}`;
      const value = variables[key] || '';
      subject = subject.split(placeholder).join(value);
      body = body.split(placeholder).join(value);
    });
    
    return { subject, body };
  }
};