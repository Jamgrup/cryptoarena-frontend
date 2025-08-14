'use client';

import { useState, useEffect } from 'react';
import { supabaseHelpers, CardInstance, CardTemplate, UserProfile } from '@/lib/supabaseClient';

// Hook for fetching card instances
export function useCardInstances(filters?: { 
  owner?: string; 
  limit?: number; 
  offset?: number;
  realtime?: boolean;
}) {
  const [cards, setCards] = useState<CardInstance[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCards = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await supabaseHelpers.getCardInstances(filters);
      setCards(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch cards');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCards();

    // Setup real-time subscription if enabled
    let subscription: any;
    if (filters?.realtime) {
      if (filters.owner) {
        subscription = supabaseHelpers.subscribeToUserCards(filters.owner, (payload) => {
          console.log('Card change detected:', payload);
          fetchCards(); // Refetch data on changes
        });
      } else {
        subscription = supabaseHelpers.subscribeToCardChanges((payload) => {
          console.log('Card change detected:', payload);
          fetchCards(); // Refetch data on changes
        });
      }
    }

    return () => {
      if (subscription) {
        subscription.unsubscribe();
      }
    };
  }, [filters?.owner, filters?.limit, filters?.offset, filters?.realtime]);

  return { cards, loading, error, refetch: fetchCards };
}

// Hook for fetching card templates
export function useCardTemplates(filters?: { 
  wave?: string; 
  rarity?: string; 
  limit?: number;
}) {
  const [templates, setTemplates] = useState<CardTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchTemplates() {
      try {
        setLoading(true);
        setError(null);
        const data = await supabaseHelpers.getCardTemplates(filters);
        setTemplates(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch templates');
      } finally {
        setLoading(false);
      }
    }

    fetchTemplates();
  }, [filters?.wave, filters?.rarity, filters?.limit]);

  return { templates, loading, error };
}

// Hook for user profile
export function useUserProfile(walletAddress?: string) {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!walletAddress) {
      setProfile(null);
      return;
    }

    async function fetchProfile() {
      if (!walletAddress) return;
      
      try {
        setLoading(true);
        setError(null);
        const data = await supabaseHelpers.getUserProfile(walletAddress);
        setProfile(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch profile');
      } finally {
        setLoading(false);
      }
    }

    fetchProfile();
  }, [walletAddress]);

  const updateProfile = async (profileData: Omit<UserProfile, 'id' | 'created_at'>) => {
    try {
      setLoading(true);
      setError(null);
      const updatedProfile = await supabaseHelpers.createOrUpdateUserProfile(profileData);
      setProfile(updatedProfile);
      return updatedProfile;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update profile');
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { profile, loading, error, updateProfile };
}

// Hook for collection statistics
export function useCollectionStats() {
  const [stats, setStats] = useState<{
    totalCards: number;
    rarityDistribution: Record<string, number>;
    waveDistribution: Record<string, number>;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchStats() {
      try {
        setLoading(true);
        setError(null);
        const data = await supabaseHelpers.getCollectionStats();
        setStats(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch stats');
      } finally {
        setLoading(false);
      }
    }

    fetchStats();
  }, []);

  return { stats, loading, error };
}

// Hook for specific card by NFT address
export function useCard(nftAddress?: string) {
  const [card, setCard] = useState<CardInstance | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!nftAddress) {
      setCard(null);
      return;
    }

    async function fetchCard() {
      if (!nftAddress) return;
      
      try {
        setLoading(true);
        setError(null);
        const data = await supabaseHelpers.getCardByNFTAddress(nftAddress);
        setCard(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch card');
      } finally {
        setLoading(false);
      }
    }

    fetchCard();
  }, [nftAddress]);

  return { card, loading, error };
}

// Hook for saving card instance
export function useSaveCard() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const saveCard = async (cardData: Omit<CardInstance, 'id' | 'created_at'>) => {
    try {
      setLoading(true);
      setError(null);
      const savedCard = await supabaseHelpers.saveCardInstance(cardData);
      return savedCard;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save card');
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { saveCard, loading, error };
}