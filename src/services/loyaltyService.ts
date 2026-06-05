import { supabase } from './supabase';
import type { User } from '../types';

export interface LoyaltyProgram {
  id: number;
  name: string;
  description?: string;
  points_per_purchase: number; // Points earned per unit of currency spent
  points_per_social_share: number;
  points_per_review: number;
  points_per_referral: number;
  points_expiry_days: number; // 0 = never expire
  minimum_points_for_redemption: number;
  redemption_rate: number; // Points needed for 1 unit of currency (e.g., 100 points = $1)
  is_active: boolean;
  created_at: string;
  updated_at?: string;
}

export interface UserLoyalty {
  id: number;
  user_id: string;
  points_balance: number;
  points_pending: number; // Points earned but not yet available (e.g., for return period)
  points_lifetime_earned: number;
  points_lifetime_redeemed: number;
  last_activity_date: string;
  created_at: string;
  updated_at?: string;
}

export interface LoyaltyTransaction {
  id: number;
  user_id: string;
  points: number; // Positive for earning, negative for redemption
  transaction_type: 'purchase' | 'social_share' | 'review' | 'referral' | 'redemption' | 'adjustment' | 'expiry';
  description: string;
  related_id?: number; // ID of related entity (order, review, etc.)
  related_type?: string; // Type of related entity
  expires_at?: string; // Points expiration date
  created_at: string;
}

export const loyaltyService = {
  // Get loyalty program settings
  async getLoyaltyProgram(): Promise<LoyaltyProgram | null> {
    const { data, error } = await supabase
      .from('loyalty_programs')
      .select('*')
      .eq('is_active', true)
      .single();
    
    if (error && error.code !== 'PGRST116') { // No rows found
      throw error;
    }
    return data as LoyaltyProgram || null;
  },

  // Get user loyalty info
  async getUserLoyalty(userId: string): Promise<UserLoyalty | null> {
    const { data, error } = await supabase
      .from('user_loyalty')
      .select('*')
      .eq('user_id', userId)
      .single();
    
    if (error && error.code !== 'PGRST116') {
      throw error;
    }
    return data as UserLoyalty || null;
  },

  // Initialize user loyalty if not exists
  async initializeUserLoyalty(userId: string): Promise<UserLoyalty> {
    const { data, error } = await supabase
      .from('user_loyalty')
      .upsert({
        user_id: userId,
        points_balance: 0,
        points_pending: 0,
        points_lifetime_earned: 0,
        points_lifetime_redeemed: 0,
        last_activity_date: new Date().toISOString(),
        created_at: new Date().toISOString()
      }, { onConflict: 'user_id' })
      .select()
      .single();
    
    if (error) throw error;
    return data as UserLoyalty;
  },

  // Get loyalty transactions for user
  async getLoyaltyTransactions(userId: string, limit = 50): Promise<LoyaltyTransaction[]> {
    const { data, error } = await supabase
      .from('loyalty_transactions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);
    
    if (error) throw error;
    return (data as LoyaltyTransaction[]) || [];
  },

  // Add loyalty points for purchase
  async addPointsForPurchase(userId: string, orderId: number, orderAmount: number): Promise<void> {
    const loyaltyProgram = await this.getLoyaltyProgram();
    if (!loyaltyProgram) return;

    const pointsEarned = Math.floor(orderAmount * loyaltyProgram.points_per_purchase);
    const { error } = await supabase
      .from('loyalty_transactions')
      .insert({
        user_id: userId,
        points: pointsEarned,
        transaction_type: 'purchase',
        description: `Puntos ganados por compra #${orderId}`,
        related_id: orderId,
        related_type: 'order',
        created_at: new Date().toISOString()
      });

    if (error) throw error;

    // Update user loyalty balance
    await this.updateUserPoints(userId, pointsEarned, 'purchase');
  },

  // Add loyalty points for review
  async addPointsForReview(userId: string, reviewId: number): Promise<void> {
    const loyaltyProgram = await this.getLoyaltyProgram();
    if (!loyaltyProgram) return;

    const pointsEarned = loyaltyProgram.points_per_review;
    const { error } = await supabase
      .from('loyalty_transactions')
      .insert({
        user_id: userId,
        points: pointsEarned,
        transaction_type: 'review',
        description: `Puntos ganados por dejar una reseña`,
        related_id: reviewId,
        related_type: 'review',
        created_at: new Date().toISOString()
      });

    if (error) throw error;

    // Update user loyalty balance
    await this.updateUserPoints(userId, pointsEarned, 'review');
  },

  // Add loyalty points for social share
  async addPointsForSocialShare(userId: string, platform: string): Promise<void> {
    const loyaltyProgram = await this.getLoyaltyProgram();
    if (!loyaltyProgram) return;

    const pointsEarned = loyaltyProgram.points_per_social_share;
    const { error } = await supabase
      .from('loyalty_transactions')
      .insert({
        user_id: userId,
        points: pointsEarned,
        transaction_type: 'social_share',
        description: `Puntos ganados por compartir en ${platform}`,
        created_at: new Date().toISOString()
      });

    if (error) throw error;

    // Update user loyalty balance
    await this.updateUserPoints(userId, pointsEarned, 'social_share');
  },

  // Redeem loyalty points
  async redeemPoints(userId: string, pointsToRedeem: number, description: string = 'Redención de puntos'): Promise<void> {
    const loyaltyProgram = await this.getLoyaltyProgram();
    if (!loyaltyProgram) throw new Error('Programa de lealtad no configurado');

    const userLoyalty = await this.getUserLoyalty(userId);
    if (!userLoyalty) throw new Error('Información de lealtad de usuario no encontrada');

    if (userLoyalty.points_balance < pointsToRedeem) {
      throw new Error('Puntos insuficientes');
    }

    const monetaryValue = pointsToRedeem / loyaltyProgram.redemption_rate;

    const { error } = await supabase
      .from('loyalty_transactions')
      .insert({
        user_id: userId,
        points: -pointsToRedeem, // Negative for redemption
        transaction_type: 'redemption',
        description: description,
        created_at: new Date().toISOString()
      });

    if (error) throw error;

    // Update user loyalty balance
    await this.updateUserPoints(userId, -pointsToRedeem, 'redemption');
  },

  // Update user loyalty points
  async updateUserPoints(userId: string, pointsChange: number, transactionType: string): Promise<void> {
    const { error } = await supabase
      .rpc('update_user_loyalty_points', {
        p_user_id: userId,
        p_points_change: pointsChange,
        p_last_activity: new Date().toISOString()
      });

    if (error) throw error;
  },

  // Process points expiry (would typically be run as a cron job)
  async processPointsExpiry(): Promise<void> {
    const loyaltyProgram = await this.getLoyaltyProgram();
    if (!loyaltyProgram || loyaltyProgram.points_expiry_days === 0) return;

    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() - loyaltyProgram.points_expiry_days);

    const { error } = await supabase
      .from('loyalty_transactions')
      .update({
        points: 0, // Mark as expired
        transaction_type: 'expiry'
      })
      .eq('points', true) // Only positive (earning) points
      .lt('created_at', expiryDate.toISOString())
      .gt('points', 0);

    if (error) throw error;
  }
};