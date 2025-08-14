import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://dkukyfkinwpldnztoqhk.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database types
export interface CardTemplate {
  id: number;
  name: string;
  description: string;
  lore: string;
  wave: string;
  rarity: string;
  level: number;
  created_at: string;
}

export interface CardInstance {
  id: number;
  nft_address: string;
  owner_address: string;
  card_index: number;
  wave: string;
  level: number;
  physical_damage: number;
  magic_damage: number;
  physical_armor: number;
  magic_armor: number;
  attack_speed: number;
  accuracy: number;
  evasion: number;
  crit_chance: number;
  name?: string;
  description?: string;
  lore?: string;
  rarity: string;
  power_rating: number;
  created_at: string;
}

export interface UserProfile {
  id: string;
  wallet_address: string;
  username?: string;
  avatar_url?: string;
  total_cards: number;
  favorite_wave?: string;
  created_at: string;
  last_login: string;
}

// Supabase helper functions
export const supabaseHelpers = {
  // Card Templates
  async getCardTemplates(filters?: { wave?: string; rarity?: string; limit?: number }) {
    let query = supabase.from('card_templates').select('*');
    
    if (filters?.wave) {
      query = query.eq('wave', filters.wave);
    }
    
    if (filters?.rarity) {
      query = query.eq('rarity', filters.rarity);
    }
    
    if (filters?.limit) {
      query = query.limit(filters.limit);
    }
    
    const { data, error } = await query.order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching card templates:', error);
      return [];
    }
    
    return data as CardTemplate[];
  },

  // Card Instances
  async getCardInstances(filters?: { owner?: string; limit?: number; offset?: number }) {
    let query = supabase.from('card_instances').select('*');
    
    if (filters?.owner) {
      query = query.eq('owner_address', filters.owner);
    }
    
    if (filters?.limit) {
      query = query.limit(filters.limit);
    }
    
    if (filters?.offset) {
      query = query.range(filters.offset, filters.offset + (filters.limit || 10) - 1);
    }
    
    const { data, error } = await query.order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching card instances:', error);
      return [];
    }
    
    return data as CardInstance[];
  },

  async getCardByNFTAddress(nftAddress: string) {
    const { data, error } = await supabase
      .from('card_instances')
      .select('*')
      .eq('nft_address', nftAddress)
      .single();
    
    if (error) {
      console.error('Error fetching card by NFT address:', error);
      return null;
    }
    
    return data as CardInstance;
  },

  async saveCardInstance(cardData: Omit<CardInstance, 'id' | 'created_at'>) {
    const { data, error } = await supabase
      .from('card_instances')
      .insert(cardData)
      .select()
      .single();
    
    if (error) {
      console.error('Error saving card instance:', error);
      return null;
    }
    
    return data as CardInstance;
  },

  // User Profiles
  async getUserProfile(walletAddress: string) {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('wallet_address', walletAddress)
      .single();
    
    if (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }
    
    return data as UserProfile;
  },

  async createOrUpdateUserProfile(profileData: Omit<UserProfile, 'id' | 'created_at'>) {
    const { data, error } = await supabase
      .from('user_profiles')
      .upsert(profileData, { onConflict: 'wallet_address' })
      .select()
      .single();
    
    if (error) {
      console.error('Error saving user profile:', error);
      return null;
    }
    
    return data as UserProfile;
  },

  // Analytics
  async getCollectionStats() {
    const { data: totalCards } = await supabase
      .from('card_instances')
      .select('id', { count: 'exact', head: true });

    const { data: rarityStats } = await supabase
      .from('card_instances')
      .select('rarity')
      .order('rarity');

    const { data: waveStats } = await supabase
      .from('card_instances')
      .select('wave')
      .order('wave');

    const rarityDistribution = rarityStats?.reduce((acc: Record<string, number>, card) => {
      acc[card.rarity] = (acc[card.rarity] || 0) + 1;
      return acc;
    }, {}) || {};

    const waveDistribution = waveStats?.reduce((acc: Record<string, number>, card) => {
      acc[card.wave] = (acc[card.wave] || 0) + 1;
      return acc;
    }, {}) || {};

    return {
      totalCards: totalCards?.length || 0,
      rarityDistribution,
      waveDistribution
    };
  },

  // Real-time subscriptions
  subscribeToCardChanges(callback: (payload: any) => void) {
    return supabase
      .channel('card_instances_changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'card_instances' }, 
        callback
      )
      .subscribe();
  },

  subscribeToUserCards(walletAddress: string, callback: (payload: any) => void) {
    return supabase
      .channel(`user_cards_${walletAddress}`)
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'card_instances',
          filter: `owner_address=eq.${walletAddress}`
        }, 
        callback
      )
      .subscribe();
  }
};

// Export default client
export default supabase;