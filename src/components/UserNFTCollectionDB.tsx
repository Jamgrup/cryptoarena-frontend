'use client';

import { useState, useEffect } from 'react';
import { useTonAddress } from '@tonconnect/ui-react';
import { getWaveImageUrl, getCardImageUrl } from '@/lib/supabase';
import { getRarityColor, getWaveColor } from '@/lib/heroes';
import { supabaseHelpers } from '@/lib/supabaseClient';

interface NFTCard {
  index: string;
  address: string;
  owner?: string;
  attributes: {
    wave: 'red' | 'orange' | 'yellow' | 'green' | 'blue' | 'purple';
    level: number;
    physical_damage: number;
    magic_damage: number;
    physical_armor: number;
    magic_armor: number;
    attack_speed: number;
    accuracy: number;
    evasion: number;
    crit_chance: number;
  };
  metadata: {
    name: string;
    description: string;
    lore: string;
    rarity: string;
    powerRating: number;
  };
  explorer: string;
  tonviewer: string;
}

interface UserNFTCollectionProps {
  className?: string;
}

export function UserNFTCollectionDB({ className = '' }: UserNFTCollectionProps) {
  const address = useTonAddress();
  const [cards, setCards] = useState<NFTCard[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedCard, setSelectedCard] = useState<NFTCard | null>(null);

  // Sync blockchain data with database
  const syncWithBlockchain = async () => {
    if (!address) return;

    try {
      console.log('Syncing blockchain data with database...');
      const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'https://cryptoarena-backend.onrender.com';
      
      // Trigger sync endpoint
      const response = await fetch(`${backendUrl}/api/v1/nft/user/${address}/sync`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        mode: 'cors',
        credentials: 'omit',
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Sync completed:', data);
        
        // Show success feedback to user
        if (data.success) {
          const syncedCount = data.data?.syncedCards || 0;
          if (syncedCount > 0) {
            console.log(`Successfully synced ${syncedCount} NFT cards from blockchain`);
          } else {
            console.log('No new cards found to sync');
          }
        }
      } else {
        const errorText = await response.text();
        console.error('Sync response error:', errorText);
        throw new Error(`Sync failed: ${response.status} ${response.statusText}`);
      }
    } catch (error) {
      console.error('Sync failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown sync error';
      setError(`Sync failed: ${errorMessage}`);
    }
  };

  // Fetch user's NFT cards from database only
  const fetchUserCards = async () => {
    if (!address) {
      setCards([]);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Get user's cards from database via backend API
      const userCards = await supabaseHelpers.getUserCards(address);
      
      // Transform database cards to UI format
      const transformedCards: NFTCard[] = userCards.map((card: any) => ({
        index: card.card_id,
        address: card.card_id,
        owner: card.owner_address,
        attributes: card.metadata.attributes,
        metadata: {
          name: card.metadata.name,
          description: card.metadata.description,
          lore: card.metadata.lore,
          rarity: card.metadata.rarity,
          powerRating: card.metadata.powerRating
        },
        explorer: `https://testnet.tonscan.org/address/${card.card_id}`,
        tonviewer: `https://testnet.tonviewer.com/${card.card_id}`
      }));

      setCards(transformedCards);
      
      // If no cards found, show helpful message
      if (transformedCards.length === 0) {
        setError('No NFT cards found. Try syncing with blockchain or minting some cards first!');
      }
    } catch (error) {
      console.error('Error fetching user cards:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to load your NFT cards';
      
      if (errorMessage.includes('Failed to fetch') || errorMessage.includes('network')) {
        setError('Unable to connect to backend server. Please check your internet connection and try again.');
      } else if (errorMessage.includes('CORS')) {
        setError('Connection blocked by browser security. Please try refreshing the page.');
      } else {
        setError(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserCards();
  }, [address]);

  // Real-time subscription to cards changes
  useEffect(() => {
    if (!address) return;

    const subscription = supabaseHelpers.subscribeToUserCards(address, (payload) => {
      console.log('Cards changed:', payload);
      // Refresh cards when changes detected
      fetchUserCards();
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [address]);

  if (!address) {
    return (
      <div className={`p-6 bg-gray-50 border border-gray-200 rounded-lg ${className}`}>
        <div className="text-center">
          <h3 className="text-lg font-medium text-gray-900 mb-2">🎴 Your NFT Collection</h3>
          <p className="text-gray-600">Connect your wallet to view your NFT cards</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`p-6 bg-white border border-gray-200 rounded-lg shadow-sm ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">🎴 Your NFT Collection (Database)</h3>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">{cards.length} cards</span>
          <button
            onClick={async () => {
              await syncWithBlockchain();
              await fetchUserCards();
            }}
            disabled={loading}
            className="px-3 py-1 text-sm bg-purple-100 hover:bg-purple-200 text-purple-700 rounded disabled:opacity-50"
          >
            {loading ? '⏳' : '⛓️'} Sync Blockchain
          </button>
          <button
            onClick={fetchUserCards}
            disabled={loading}
            className="px-3 py-1 text-sm bg-blue-100 hover:bg-blue-200 text-blue-700 rounded disabled:opacity-50"
          >
            {loading ? '⏳' : '🔄'} Refresh
          </button>
        </div>
      </div>

      {loading && (
        <div className="flex items-center justify-center h-32">
          <div className="text-center">
            <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-2"></div>
            <p className="text-sm text-gray-600">Loading your NFT cards from database...</p>
          </div>
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg mb-4">
          <p className="text-red-800 text-sm">{error}</p>
        </div>
      )}

      {!loading && !error && cards.length === 0 && (
        <div className="text-center py-8">
          <div className="text-gray-400 text-6xl mb-4">🎴</div>
          <h4 className="text-lg font-medium text-gray-900 mb-2">No NFT Cards Found in Database</h4>
          <p className="text-gray-600 mb-4">Your NFT cards haven't been synced to the database yet.</p>
          <p className="text-sm text-gray-500">Mint a new card or sync existing ones to see them here!</p>
        </div>
      )}

      {!loading && cards.length > 0 && (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {cards.map((card) => (
            <div
              key={card.index}
              className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => setSelectedCard(card)}
            >
              {/* Card Header */}
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                  #{card.index.slice(-8)}
                </span>
                <div className="flex items-center gap-1">
                  <img
                    src={getWaveImageUrl(card.attributes.wave)}
                    alt={`${card.attributes.wave} wave`}
                    className="w-6 h-6 rounded"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                  <span className={`text-xs font-medium ${getRarityColor(card.metadata.rarity as any)}`}>
                    {card.metadata.rarity.toUpperCase()}
                  </span>
                </div>
              </div>

              {/* Card Image */}
              <div className="relative mb-3">
                <img
                  src={getCardImageUrl(card.attributes, card.metadata.rarity)}
                  alt={card.metadata.name}
                  className="w-full h-32 object-cover rounded border"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/placeholder-card.svg';
                  }}
                />
                <div className="absolute top-1 right-1">
                  <span className={`px-1 py-0.5 text-xs font-medium rounded ${getWaveColor(card.attributes.wave)} bg-white bg-opacity-90`}>
                    {card.attributes.wave.toUpperCase()}
                  </span>
                </div>
              </div>

              {/* Card Info */}
              <div className="space-y-1">
                <h4 className="font-bold text-sm text-gray-900 truncate">{card.metadata.name}</h4>
                <div className="flex items-center justify-between text-xs text-gray-600">
                  <span>Level {card.attributes.level}</span>
                  <span>Power: {card.metadata.powerRating}</span>
                </div>
                <p className="text-xs text-gray-500 line-clamp-2">{card.metadata.description}</p>
              </div>

              {/* Quick Stats */}
              <div className="mt-3 pt-2 border-t border-gray-100">
                <div className="grid grid-cols-2 gap-1 text-xs">
                  <div className="text-gray-600">Phys: {card.attributes.physical_damage}</div>
                  <div className="text-gray-600">Magic: {card.attributes.magic_damage}</div>
                  <div className="text-gray-600">Speed: {card.attributes.attack_speed}</div>
                  <div className="text-gray-600">Crit: {card.attributes.crit_chance}%</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Card Detail Modal */}
      {selectedCard && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              {/* Modal Header */}
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-900">NFT Card Details</h3>
                <button
                  onClick={() => setSelectedCard(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>

              {/* Card Image */}
              <div className="relative mb-4">
                <img
                  src={getCardImageUrl(selectedCard.attributes, selectedCard.metadata.rarity)}
                  alt={selectedCard.metadata.name}
                  className="w-full h-48 object-cover rounded border"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/placeholder-card.svg';
                  }}
                />
                <div className="absolute top-2 right-2 flex items-center gap-1">
                  <img
                    src={getWaveImageUrl(selectedCard.attributes.wave)}
                    alt={`${selectedCard.attributes.wave} wave`}
                    className="w-8 h-8 rounded border bg-white"
                  />
                  <span className={`px-2 py-1 text-xs font-medium rounded ${getRarityColor(selectedCard.metadata.rarity as any)} bg-white bg-opacity-90`}>
                    {selectedCard.metadata.rarity.toUpperCase()}
                  </span>
                </div>
              </div>

              {/* Card Details */}
              <div className="space-y-4">
                <div>
                  <h4 className="font-bold text-lg text-gray-900">{selectedCard.metadata.name}</h4>
                  <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                    <span>Level {selectedCard.attributes.level}</span>
                    <span>Power: {selectedCard.metadata.powerRating}</span>
                    <span className={getWaveColor(selectedCard.attributes.wave)}>
                      {selectedCard.attributes.wave} wave
                    </span>
                  </div>
                </div>

                <div>
                  <p className="text-sm text-gray-700">{selectedCard.metadata.description}</p>
                </div>

                <div className="p-3 bg-gray-50 rounded">
                  <p className="text-xs text-gray-600 italic">"{selectedCard.metadata.lore}"</p>
                </div>

                {/* Full Stats */}
                <div>
                  <h5 className="font-medium text-gray-900 mb-2">📊 Complete Statistics</h5>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Physical Damage:</span>
                      <span className="font-medium">{selectedCard.attributes.physical_damage}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Magic Damage:</span>
                      <span className="font-medium">{selectedCard.attributes.magic_damage}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Attack Speed:</span>
                      <span className="font-medium">{selectedCard.attributes.attack_speed}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Accuracy:</span>
                      <span className="font-medium">{selectedCard.attributes.accuracy}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Evasion:</span>
                      <span className="font-medium">{selectedCard.attributes.evasion}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Physical Armor:</span>
                      <span className="font-medium">{selectedCard.attributes.physical_armor}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Magic Armor:</span>
                      <span className="font-medium">{selectedCard.attributes.magic_armor}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Crit Chance:</span>
                      <span className="font-medium">{selectedCard.attributes.crit_chance}%</span>
                    </div>
                  </div>
                </div>

                {/* Links */}
                <div className="flex gap-2">
                  <a
                    href={selectedCard.explorer}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 px-3 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 text-center"
                  >
                    TON Explorer
                  </a>
                  <a
                    href={selectedCard.tonviewer}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 px-3 py-2 bg-purple-600 text-white text-sm rounded hover:bg-purple-700 text-center"
                  >
                    TON Viewer
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}