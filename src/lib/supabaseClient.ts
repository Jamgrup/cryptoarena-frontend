import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://dkukyfkinwpldnztoqhk.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database types (updated to match new schema)
export interface User {
  id: string;
  wallet_address: string;
  username?: string;
  avatar_url?: string;
  cards_owned: number;
  gems_balance: string;
  level: number;
  experience: number;
  created_at: string;
  updated_at: string;
  last_login: string;
}

export interface Card {
  id: string;
  card_id: string;
  owner_address: string;
  rarity: number;
  level: number;
  experience: string;
  metadata: {
    name: string;
    description: string;
    lore: string;
    rarity: string;
    powerRating: number;
    dominantStat: string;
    imageUrl: string;
    attributes: {
      wave: string;
      physical_damage: number;
      magic_damage: number;
      physical_armor: number;
      magic_armor: number;
      attack_speed: number;
      accuracy: number;
      evasion: number;
      crit_chance: number;
    };
  };
  transaction_hash: string;
  block_number?: number;
  created_at: string;
  updated_at: string;
}

// Legacy interface for backward compatibility
export interface CardInstance {
  id: string;
  card_index: number;
  nft_address: string;
  owner_address: string;
  name: string;
  description: string;
  lore: string;
  rarity: string;
  wave: string;
  physical_damage: number;
  magic_damage: number;
  physical_armor: number;
  magic_armor: number;
  attack_speed: number;
  accuracy: number;
  evasion: number;
  crit_chance: number;
  power_rating: number;
  created_at: string;
  updated_at: string;
}

export interface Transaction {
  id: string;
  hash: string;
  type: string;
  from_address: string;
  to_address?: string;
  amount?: string;
  card_id?: string;
  block_number?: number;
  gas_used?: number;
  status: string;
  metadata?: any;
  error_message?: string;
  created_at: string;
  updated_at: string;
}

// New API integration functions (using backend API instead of direct DB access)
export const supabaseHelpers = {
  // Get user's NFT cards from backend API
  async getUserCards(walletAddress: string): Promise<Card[]> {
    try {
      const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'https://cryptoarena-backend.onrender.com';
      const response = await fetch(`${backendUrl}/api/v1/nft/user/${walletAddress}/cards`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch user cards');
      }
      
      const data = await response.json();
      return data.success ? data.data.cards : [];
    } catch (error) {
      console.error('Error fetching user cards:', error);
      return [];
    }
  },

  // Get user profile from database
  async getUserProfile(walletAddress: string): Promise<User | null> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('wallet_address', walletAddress)
        .single();
      
      if (error) {
        if (error.code === 'PGRST116') {
          // User not found
          return null;
        }
        console.error('Error fetching user profile:', error);
        return null;
      }
      
      return data as User;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }
  },

  // Create or update user profile
  async createOrUpdateUserProfile(profileData: {
    wallet_address: string;
    username?: string;
    avatar_url?: string;
  }): Promise<User | null> {
    try {
      const { data, error } = await supabase
        .from('users')
        .upsert({
          ...profileData,
          last_login: new Date().toISOString()
        }, { onConflict: 'wallet_address' })
        .select()
        .single();
      
      if (error) {
        console.error('Error saving user profile:', error);
        return null;
      }
      
      return data as User;
    } catch (error) {
      console.error('Error saving user profile:', error);
      return null;
    }
  },

  // Sync NFT card from blockchain
  async syncNFTCard(cardId: string): Promise<boolean> {
    try {
      const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'https://cryptoarena-backend.onrender.com';
      const response = await fetch(`${backendUrl}/api/v1/nft/sync/${cardId}`, {
        method: 'POST'
      });
      
      if (!response.ok) {
        throw new Error('Failed to sync NFT card');
      }
      
      const data = await response.json();
      return data.success;
    } catch (error) {
      console.error('Error syncing NFT card:', error);
      return false;
    }
  },

  // Get collection statistics
  async getCollectionStats(): Promise<{
    totalCards: number;
    totalUsers: number;
    rarityDistribution: Record<string, number>;
    waveDistribution: Record<string, number>;
  }> {
    try {
      // Get total cards
      const { count: totalCards } = await supabase
        .from('cards')
        .select('*', { count: 'exact', head: true });

      // Get total users
      const { count: totalUsers } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true });

      // Get cards for distribution analysis
      const { data: cardsData } = await supabase
        .from('cards')
        .select('rarity, metadata');

      const rarityDistribution: Record<string, number> = {};
      const waveDistribution: Record<string, number> = {};

      cardsData?.forEach(card => {
        const rarity = ['common', 'uncommon', 'rare', 'epic', 'legendary'][card.rarity] || 'unknown';
        rarityDistribution[rarity] = (rarityDistribution[rarity] || 0) + 1;

        const wave = card.metadata?.attributes?.wave || 'unknown';
        waveDistribution[wave] = (waveDistribution[wave] || 0) + 1;
      });

      return {
        totalCards: totalCards || 0,
        totalUsers: totalUsers || 0,
        rarityDistribution,
        waveDistribution
      };
    } catch (error) {
      console.error('Error getting collection stats:', error);
      return {
        totalCards: 0,
        totalUsers: 0,
        rarityDistribution: {},
        waveDistribution: {}
      };
    }
  },

  // Real-time subscriptions to cards table
  subscribeToCardChanges(callback: (payload: any) => void) {
    return supabase
      .channel('cards_changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'cards' }, 
        callback
      )
      .subscribe();
  },

  // Subscribe to user's cards changes
  subscribeToUserCards(walletAddress: string, callback: (payload: any) => void) {
    return supabase
      .channel(`user_cards_${walletAddress}`)
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'cards',
          filter: `owner_address=eq.${walletAddress}`
        }, 
        callback
      )
      .subscribe();
  },

  // Subscribe to user profile changes
  subscribeToUserProfile(walletAddress: string, callback: (payload: any) => void) {
    return supabase
      .channel(`user_profile_${walletAddress}`)
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'users',
          filter: `wallet_address=eq.${walletAddress}`
        }, 
        callback
      )
      .subscribe();
  }
};

// Export default client
export default supabase;