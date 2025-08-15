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

// Card template interface for mint options
export interface CardTemplate {
  id: string;
  name: string;
  description: string;
  wave: string;
  rarity: string;
  base_stats: {
    physical_damage: number;
    magic_damage: number;
    physical_armor: number;
    magic_armor: number;
    attack_speed: number;
    accuracy: number;
    evasion: number;
    crit_chance: number;
  };
  created_at: string;
}

// User profile interface
export interface UserProfile {
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

  // Get user profile from backend API (avoiding RLS issues)
  async getUserProfile(walletAddress: string): Promise<User | null> {
    try {
      const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'https://cryptoarena-backend.onrender.com';
      const response = await fetch(`${backendUrl}/api/v1/user/${walletAddress}/profile`);
      
      if (!response.ok) {
        if (response.status === 404) {
          return null; // User not found
        }
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      return data.success ? data.data : null;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }
  },

  // Create or update user profile via backend API
  async createOrUpdateUserProfile(profileData: {
    wallet_address: string;
    username?: string;
    avatar_url?: string;
  }): Promise<User | null> {
    try {
      const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'https://cryptoarena-backend.onrender.com';
      const response = await fetch(`${backendUrl}/api/v1/user/${profileData.wallet_address}/profile`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(profileData),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      return data.success ? data.data : null;
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
  },

  // Get card instances (for legacy compatibility)
  async getCardInstances(filters?: { 
    owner?: string; 
    limit?: number; 
    offset?: number;
  }): Promise<CardInstance[]> {
    try {
      const userCards = await this.getUserCards(filters?.owner || '');
      
      // Transform Card[] to CardInstance[] format
      return userCards.map(card => ({
        id: card.id,
        card_index: parseInt(card.card_id.slice(-3)) || 0, // Extract index from card_id
        nft_address: card.card_id,
        owner_address: card.owner_address,
        name: card.metadata.name,
        description: card.metadata.description,
        lore: card.metadata.lore,
        rarity: card.metadata.rarity,
        wave: card.metadata.attributes.wave,
        physical_damage: card.metadata.attributes.physical_damage,
        magic_damage: card.metadata.attributes.magic_damage,
        physical_armor: card.metadata.attributes.physical_armor,
        magic_armor: card.metadata.attributes.magic_armor,
        attack_speed: card.metadata.attributes.attack_speed,
        accuracy: card.metadata.attributes.accuracy,
        evasion: card.metadata.attributes.evasion,
        crit_chance: card.metadata.attributes.crit_chance,
        power_rating: card.metadata.powerRating,
        created_at: card.created_at,
        updated_at: card.updated_at
      }));
    } catch (error) {
      console.error('Error getting card instances:', error);
      return [];
    }
  },

  // Get card templates (mock for now)
  async getCardTemplates(filters?: { 
    wave?: string; 
    rarity?: string; 
    limit?: number;
  }): Promise<CardTemplate[]> {
    // This would typically fetch from a card_templates table
    // For now, return mock data
    return [
      {
        id: '1',
        name: 'Fire Warrior Template',
        description: 'A basic fire warrior template',
        wave: 'red',
        rarity: 'common',
        base_stats: {
          physical_damage: 100,
          magic_damage: 50,
          physical_armor: 80,
          magic_armor: 40,
          attack_speed: 120,
          accuracy: 85,
          evasion: 30,
          crit_chance: 10
        },
        created_at: new Date().toISOString()
      }
    ];
  },

  // Get card by NFT address
  async getCardByNFTAddress(nftAddress: string): Promise<CardInstance | null> {
    try {
      const { data, error } = await supabase
        .from('cards')
        .select('*')
        .eq('card_id', nftAddress)
        .single();
      
      if (error || !data) {
        return null;
      }

      return {
        id: data.id,
        card_index: parseInt(data.card_id.slice(-3)) || 0,
        nft_address: data.card_id,
        owner_address: data.owner_address,
        name: data.metadata.name,
        description: data.metadata.description,
        lore: data.metadata.lore,
        rarity: data.metadata.rarity,
        wave: data.metadata.attributes.wave,
        physical_damage: data.metadata.attributes.physical_damage,
        magic_damage: data.metadata.attributes.magic_damage,
        physical_armor: data.metadata.attributes.physical_armor,
        magic_armor: data.metadata.attributes.magic_armor,
        attack_speed: data.metadata.attributes.attack_speed,
        accuracy: data.metadata.attributes.accuracy,
        evasion: data.metadata.attributes.evasion,
        crit_chance: data.metadata.attributes.crit_chance,
        power_rating: data.metadata.powerRating,
        created_at: data.created_at,
        updated_at: data.updated_at
      };
    } catch (error) {
      console.error('Error getting card by NFT address:', error);
      return null;
    }
  },

  // Save card instance (transform and save as Card)
  async saveCardInstance(cardData: Omit<CardInstance, 'id' | 'created_at'>): Promise<CardInstance | null> {
    try {
      // Transform CardInstance to Card format
      const cardToSave = {
        card_id: cardData.nft_address,
        owner_address: cardData.owner_address,
        rarity: ['common', 'uncommon', 'rare', 'epic', 'legendary'].indexOf(cardData.rarity),
        level: 1,
        experience: '0',
        metadata: {
          name: cardData.name,
          description: cardData.description,
          lore: cardData.lore,
          rarity: cardData.rarity,
          powerRating: cardData.power_rating,
          dominantStat: 'physical_damage',
          imageUrl: '',
          attributes: {
            wave: cardData.wave,
            physical_damage: cardData.physical_damage,
            magic_damage: cardData.magic_damage,
            physical_armor: cardData.physical_armor,
            magic_armor: cardData.magic_armor,
            attack_speed: cardData.attack_speed,
            accuracy: cardData.accuracy,
            evasion: cardData.evasion,
            crit_chance: cardData.crit_chance
          }
        },
        transaction_hash: '',
        block_number: 0
      };

      const { data, error } = await supabase
        .from('cards')
        .insert(cardToSave)
        .select()
        .single();

      if (error) {
        throw error;
      }

      // Transform back to CardInstance
      return {
        id: data.id,
        card_index: cardData.card_index,
        nft_address: data.card_id,
        owner_address: data.owner_address,
        name: data.metadata.name,
        description: data.metadata.description,
        lore: data.metadata.lore,
        rarity: data.metadata.rarity,
        wave: data.metadata.attributes.wave,
        physical_damage: data.metadata.attributes.physical_damage,
        magic_damage: data.metadata.attributes.magic_damage,
        physical_armor: data.metadata.attributes.physical_armor,
        magic_armor: data.metadata.attributes.magic_armor,
        attack_speed: data.metadata.attributes.attack_speed,
        accuracy: data.metadata.attributes.accuracy,
        evasion: data.metadata.attributes.evasion,
        crit_chance: data.metadata.attributes.crit_chance,
        power_rating: data.metadata.powerRating,
        created_at: data.created_at,
        updated_at: data.updated_at
      };
    } catch (error) {
      console.error('Error saving card instance:', error);
      return null;
    }
  }
};

// Export default client
export default supabase;