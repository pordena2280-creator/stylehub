import { supabase } from './supabase';
import type { User } from '../types';

export interface AffiliateProgram {
  id: number;
  name: string;
  description?: string;
  commission_type: 'percentage' | 'fixed'; // Percentage of sale or fixed amount
  commission_value: number; // Percentage (e.g., 5 for 5%) or fixed amount
  cookie_duration_days: number; // How long affiliate cookie lasts
  minimum_payout: number; // Minimum earnings before payout
  is_active: boolean;
  created_at: string;
  updated_at?: string;
}

export interface Affiliate {
  id: number;
  user_id: string; // The affiliate (referrer)
  affiliate_code: string; // Unique code for tracking
  commission_earned: number; // Total commission earned
  commission_paid: number; // Total commission paid out
  commission_pending: number; // Commission earned but not yet payable
  referral_count: number; // Number of people referred
  conversion_count: number; // Number of referred people who made a purchase
  is_active: boolean;
  joined_at: string;
  last_active_at?: string;
  created_at: string;
  updated_at?: string;
}

export interface Referral {
  id: number;
  affiliate_id: number; // The affiliate who referred
  referred_user_id: string; // The user who was referred
  referred_email: string; // Email of referred user (for tracking if they don't have account yet)
  referred_at: string; // When the referral happened
  referred_order_id?: number; // Order ID if referral resulted in purchase
  commission_amount: number; // Commission earned from this referral
  commission_status: 'pending' | 'approved' | 'paid' | 'rejected'; // Commission status
  created_at: string;
  updated_at?: string;
}

export const affiliateService = {
  // Get affiliate program settings
  async getAffiliateProgram(): Promise<AffiliateProgram | null> {
    const { data, error } = await supabase
      .from('affiliate_programs')
      .select('*')
      .eq('is_active', true)
      .single();
    
    if (error && error.code !== 'PGRST116') { // No rows found
      throw error;
    }
    return data as AffiliateProgram || null;
  },

  // Get affiliate by user ID
  async getAffiliateByUserId(userId: string): Promise<Affiliate | null> {
    const { data, error } = await supabase
      .from('affiliates')
      .select('*')
      .eq('user_id', userId)
      .single();
    
    if (error && error.code !== 'PGRST116') {
      throw error;
    }
    return data as Affiliate || null;
  },

  // Get affiliate by affiliate code
  async getAffiliateByCode(affiliateCode: string): Promise<Affiliate | null> {
    const { data, error } = await supabase
      .from('affiliates')
      .select('*')
      .eq('affiliate_code', affiliateCode.toUpperCase())
      .single();
    
    if (error && error.code !== 'PGRST116') {
      throw error;
    }
    return data as Affiliate || null;
  },

  // Create affiliate profile for user
  async createAffiliate(userId: string): Promise<Affiliate> {
    const affiliateCode = await this._generateUniqueAffiliateCode();
    const { data, error } = await supabase
      .from('affiliates')
      .insert({
        user_id: userId,
        affiliate_code: affiliateCode,
        commission_earned: 0,
        commission_paid: 0,
        commission_pending: 0,
        referral_count: 0,
        conversion_count: 0,
        is_active: true,
        joined_at: new Date().toISOString(),
        created_at: new Date().toISOString()
      })
      .select()
      .single();
    
    if (error) throw error;
    return data as Affiliate;
  },

  // Generate unique affiliate code (internal helper)
  async _generateUniqueAffiliateCode(): Promise<string> {
    let code = '';
    let isUnique = false;
    
    while (!isUnique) {
      // Generate random 8-character code
      code = Math.random().toString(36).substring(2, 10).toUpperCase();
      
      // Check if code already exists
      const { data, error } = await supabase
        .from('affiliates')
        .select('id')
        .eq('affiliate_code', code)
        .single();
      
      if (error && error.code === 'PGRST116') { // No rows found
        isUnique = true;
      } else if (data) {
        // Code exists, try again
        continue;
      } else if (error) {
        throw error;
      }
    }
    
    return code;
  },

  // Track a referral (when someone visits via affiliate link)
  async trackReferral(affiliateCode: string, referredEmail: string): Promise<Referral> {
    const affiliate = await this.getAffiliateByCode(affiliateCode);
    if (!affiliate) throw new Error('Afiliado no encontrado');
    
    // Check if referral already exists for this email and affiliate
    const { data: existingReferral, error: checkError } = await supabase
      .from('referrals')
      .select('id')
      .eq('affiliate_id', affiliate.id)
      .eq('referred_email', referredEmail)
      .is('referred_order_id', null) // Only count referrals without orders yet
      .single();
    
    if (!checkError && existingReferral) {
      // Referral already exists, return it
      return existingReferral as Referral;
    }
    
    // Create new referral
    const { data, error } = await supabase
      .from('referrals')
      .insert({
        affiliate_id: affiliate.id,
        referred_user_id: null, // Will be updated when user signs up
        referred_email: referredEmail,
        referred_at: new Date().toISOString(),
        commission_amount: 0, // Will be calculated when order is placed
        commission_status: 'pending',
        created_at: new Date().toISOString()
      })
      .select()
      .single();
    
    if (error) throw error;
    return data as Referral;
  },

  // Convert referral to customer (when referred user signs up)
  async convertReferralToCustomer(referredEmail: string, userId: string): Promise<void> {
    const { data, error } = await supabase
      .from('referrals')
      .update({
        referred_user_id: userId
      })
      .eq('referred_email', referredEmail)
      .is('referred_user_id', null)
      .single();
    
    if (error) throw error;
  },

  // Process referral commission when referred user makes a purchase
  async processReferralCommission(referredUserId: string, orderId: number, orderAmount: number): Promise<void> {
    // Find referral for this user that hasn't been converted to commission yet
    const { data: referral, error } = await supabase
      .from('referrals')
      .select(`
        *,
        affiliate:affiliates(*)
      `)
      .eq('referred_user_id', referredUserId)
      .eq('referred_order_id', null)
      .single();
    
    if (error && error.code !== 'PGRST116') {
      throw error;
    }
    
    if (!referral) {
      // No pending referral found
      return;
    }
    
    const affiliate = referral.affiliate;
    if (!affiliate) {
      throw new Error('Afiliado asociado a la referencia no encontrado');
    }
    
    // Get affiliate program to calculate commission
    const program = await this.getAffiliateProgram();
    if (!program) {
      throw new Error('Programa de afiliados no configurado');
    }
    
    let commissionAmount = 0;
    if (program.commission_type === 'percentage') {
      commissionAmount = (orderAmount * program.commission_value) / 100;
    } else { // fixed
      commissionAmount = program.commission_value;
    }
    
    // Update referral with commission info
    const { error: updateError } = await supabase
      .from('referrals')
      .update({
        referred_order_id: orderId,
        commission_amount: commissionAmount,
        commission_status: 'pending', // Still pending until order is confirmed/shipped
        updated_at: new Date().toISOString()
      })
      .eq('id', referral.id);
    
    if (updateError) throw updateError;
    
  // Update affiliate's pending commission (sin supabase.sql)
    const { data: affiliateRow, error: affiliateFetchError } = await supabase
      .from('affiliates')
      .select('commission_pending, conversion_count')
      .eq('id', affiliate.id)
      .maybeSingle();

    if (affiliateFetchError) throw affiliateFetchError;

    const commission_pending = affiliateRow?.commission_pending ?? 0;
    const conversion_count = affiliateRow?.conversion_count ?? 0;

    const { error: affiliateError } = await supabase
      .from('affiliates')
      .update({
        commission_pending: commission_pending + commissionAmount,
        conversion_count: conversion_count + 1,
        last_active_at: new Date().toISOString(),
      })
      .eq('id', affiliate.id);

    if (affiliateError) throw affiliateError;
  },

  // Approve affiliate commission (when order is shipped/delivered)
  async approveAffiliateCommission(referralId: number): Promise<void> {
    const { data, error } = await supabase
      .from('referrals')
      .update({
        commission_status: 'approved',
        updated_at: new Date().toISOString()
      })
      .eq('id', referralId);
    
    if (error) throw error;
    
    // When approved, move from pending to earned in affiliate account
    // This would typically be done via a database trigger or scheduled job
    // For simplicity, we'll update both tables
    const { data: referralData, error: referralError } = await supabase
      .from('referrals')
      .select(`
        commission_amount,
        affiliate_id
      `)
      .eq('id', referralId)
      .single();
    
    if (referralError) throw referralError;
    
    const { error: affiliateError } = await supabase
      .from('affiliates')
      .update({
        commission_earned: Number(referralData.commission_amount ?? 0),
        commission_pending: 0,
        last_active_at: new Date().toISOString()
      })
      .eq('id', referralData.affiliate_id);
    
    if (affiliateError) throw affiliateError;
  },

  // Pay affiliate commission
  async payAffiliateCommission(affiliateId: number, amountToPay: number): Promise<void> {
    const { data: affiliateRow, error: affiliateFetchError } = await supabase
      .from('affiliates')
      .select('commission_paid, commission_earned')
      .eq('id', affiliateId)
      .maybeSingle();

    if (affiliateFetchError) throw affiliateFetchError;

    const commission_paid = affiliateRow?.commission_paid ?? 0;
    const commission_earned = affiliateRow?.commission_earned ?? 0;

    const { error } = await supabase
      .from('affiliates')
      .update({
        commission_paid: commission_paid + amountToPay,
        commission_earned: commission_earned - amountToPay,
        last_active_at: new Date().toISOString()
      })
      .eq('id', affiliateId);
    
    if (error) throw error;
  },

  // Get affiliate referrals
  async getAffiliateReferrals(affiliateId: number, limit = 50): Promise<Referral[]> {
    const { data, error } = await supabase
      .from('referrals')
      .select(`
        *,
        referred_user:profiles(full_name, email)
      `)
      .eq('affiliate_id', affiliateId)
      .order('referred_at', { ascending: false })
      .limit(limit);
    
    if (error) throw error;
    return (data as Referral[]) || [];
  },

  // Get affiliate stats
  async getAffiliateStats(affiliateId: number): Promise<{
    totalReferred: number;
    totalConversions: number;
    totalCommissionEarned: number;
    totalCommissionPaid: number;
    totalCommissionPending: number;
    conversionRate: number;
  }> {
    const { data: referrals, error } = await supabase
      .from('referrals')
      .select(`
        commission_amount,
        commission_status,
        referred_order_id
      `)
      .eq('affiliate_id', affiliateId);
    
    if (error) throw error;
    
    let totalReferred = 0;
    let totalConversions = 0;
    let totalCommissionEarned = 0;
    let totalCommissionPaid = 0;
    let totalCommissionPending = 0;
    
    (referrals || []).forEach(referral => {
      totalReferred++;
      if (referral.referred_order_id) {
        totalConversions++;
        if (referral.commission_status === 'paid') {
          totalCommissionPaid += referral.commission_amount || 0;
        } else if (referral.commission_status === 'approved') {
          totalCommissionEarned += referral.commission_amount || 0;
        } else if (referral.commission_status === 'pending') {
          totalCommissionPending += referral.commission_amount || 0;
        }
      }
    });
    
    const conversionRate = totalReferred > 0 ? (totalConversions / totalReferred) * 100 : 0;
    
    return {
      totalReferred,
      totalConversions,
      totalCommissionEarned,
      totalCommissionPaid,
      totalCommissionPending,
      conversionRate: Number(conversionRate.toFixed(2))
    };
  }
};