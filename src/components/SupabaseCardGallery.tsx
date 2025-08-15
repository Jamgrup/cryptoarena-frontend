'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useCardInstances, useCollectionStats } from '@/hooks/useSupabase';
import { CardInstance } from '@/lib/supabaseClient';
import { getCardImageUrl, getWaveImageUrl } from '@/lib/supabase';

interface SupabaseCardGalleryProps {
  walletAddress?: string;
  className?: string;
}

interface NFTCardDisplayProps {
  card: CardInstance;
  onClick?: () => void;
}

function NFTCardDisplay({ card, onClick }: NFTCardDisplayProps) {
  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'text-gray-400 border-gray-400';
      case 'rare': return 'text-blue-400 border-blue-400';
      case 'epic': return 'text-purple-400 border-purple-400';
      case 'legendary': return 'text-yellow-400 border-yellow-400';
      default: return 'text-gray-400 border-gray-400';
    }
  };

  const getRarityGradient = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'from-gray-400 via-gray-600 to-gray-800';
      case 'rare': return 'from-blue-400 via-blue-600 to-blue-800';
      case 'epic': return 'from-purple-400 via-purple-600 to-purple-800';
      case 'legendary': return 'from-yellow-400 via-yellow-600 to-yellow-800';
      default: return 'from-gray-400 via-gray-600 to-gray-800';
    }
  };

  return (
    <div 
      className={`relative p-1 rounded-xl bg-gradient-to-b ${getRarityGradient(card.rarity)} cursor-pointer hover:scale-105 transition-transform duration-200`}
      onClick={onClick}
    >
      <div className="bg-gray-900 rounded-lg p-4 h-full">
        {/* Header */}
        <div className="text-center mb-3">
          <h3 className={`text-lg font-bold ${getRarityColor(card.rarity).split(' ')[0]} truncate`}>
            {card.name || `Card #${card.card_index}`}
          </h3>
          <div className="flex justify-center items-center gap-2 mt-1">
            <span className={`text-xs px-2 py-1 rounded ${getRarityColor(card.rarity)} bg-gray-800 border border-current`}>
              {card.rarity?.toUpperCase() || 'UNKNOWN'}
            </span>
            <span className="text-xs text-gray-400">
              #{card.card_index}
            </span>
          </div>
        </div>
        
        {/* Card Image */}
        <div className="relative w-full h-32 mb-3 rounded-lg overflow-hidden bg-gray-800">
          <Image
            src={getCardImageUrl({
              physical_damage: card.physical_damage,
              magic_damage: card.magic_damage,
              physical_armor: card.physical_armor,
              magic_armor: card.magic_armor,
              attack_speed: card.attack_speed,
              accuracy: card.accuracy,
              evasion: card.evasion,
              crit_chance: card.crit_chance
            }, card.rarity)}
            alt={`${card.name || 'Card'} ${card.rarity}`}
            fill
            className="object-cover"
            unoptimized
          />
          {/* Wave indicator */}
          <div className="absolute top-2 right-2">
            <Image
              src={getWaveImageUrl(card.wave)}
              alt={card.wave}
              width={24}
              height={24}
              className="rounded-full border border-white/30"
            />
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-1 text-xs mb-3">
          <div className="bg-red-900/30 p-1 rounded text-center border border-red-500/20">
            <div className="text-red-300 font-bold">⚔️</div>
            <div className="text-white text-xs">{card.physical_damage}</div>
          </div>
          <div className="bg-purple-900/30 p-1 rounded text-center border border-purple-500/20">
            <div className="text-purple-300 font-bold">✨</div>
            <div className="text-white text-xs">{card.magic_damage}</div>
          </div>
          <div className="bg-yellow-900/30 p-1 rounded text-center border border-yellow-500/20">
            <div className="text-yellow-300 font-bold">⚡</div>
            <div className="text-white text-xs">{card.attack_speed}</div>
          </div>
          <div className="bg-green-900/30 p-1 rounded text-center border border-green-500/20">
            <div className="text-green-300 font-bold">🎯</div>
            <div className="text-white text-xs">{card.accuracy}%</div>
          </div>
        </div>

        {/* Power Rating */}
        <div className="text-center">
          <div className="text-xs text-gray-400">Power</div>
          <div className="text-white font-bold">{card.power_rating}</div>
        </div>
      </div>
    </div>
  );
}

export function SupabaseCardGallery({ walletAddress, className = '' }: SupabaseCardGalleryProps) {
  const [selectedCard, setSelectedCard] = useState<CardInstance | null>(null);
  const [page, setPage] = useState(0);
  const limit = 12;

  // Fetch cards with real-time updates
  const { cards, loading, error, refetch } = useCardInstances({
    owner: walletAddress,
    limit,
    offset: page * limit,
    realtime: true // Enable real-time updates
  });

  // Fetch collection statistics
  const { stats } = useCollectionStats();

  const handleCardClick = (card: CardInstance) => {
    setSelectedCard(card);
  };

  const loadMore = () => {
    setPage(prev => prev + 1);
  };

  if (loading && cards.length === 0) {
    return (
      <div className={`bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20 ${className}`}>
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-4">
            {walletAddress ? 'My NFT Cards' : 'Supabase Card Gallery'}
          </h2>
          <div className="flex justify-center items-center space-x-2">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
            <span className="text-white">Loading cards from Supabase...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error && cards.length === 0) {
    return (
      <div className={`bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20 ${className}`}>
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-4">
            {walletAddress ? 'My NFT Cards' : 'Supabase Card Gallery'}
          </h2>
          <div className="text-red-400 mb-4">{error}</div>
          <button
            onClick={refetch}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className={`bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20 ${className}`}>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white">
            {walletAddress ? 'My NFT Cards' : 'Supabase Card Gallery'}
          </h2>
          <div className="text-white/80 text-sm">
            {stats && (
              <>
                {stats.totalCards} total cards
                {walletAddress && ` | ${cards.length} owned`}
              </>
            )}
          </div>
        </div>

        {/* Collection Stats */}
        {stats && !walletAddress && (
          <div className="mb-6 grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white/5 rounded-lg p-3">
              <div className="text-white/60 text-xs">Total Cards</div>
              <div className="text-white font-bold text-lg">{stats.totalCards}</div>
            </div>
            
            <div className="bg-white/5 rounded-lg p-3">
              <div className="text-white/60 text-xs">Rarest</div>
              <div className="text-yellow-400 font-bold text-sm">
                {Object.entries(stats.rarityDistribution).find(([rarity]) => rarity === 'legendary')?.[1] || 0} Legendary
              </div>
            </div>
            
            <div className="bg-white/5 rounded-lg p-3">
              <div className="text-white/60 text-xs">Most Popular Wave</div>
              <div className="text-white font-bold text-sm capitalize">
                {Object.entries(stats.waveDistribution).sort(([,a], [,b]) => b - a)[0]?.[0] || 'N/A'}
              </div>
            </div>
            
            <div className="bg-white/5 rounded-lg p-3">
              <div className="text-white/60 text-xs">Epic+ Cards</div>
              <div className="text-purple-400 font-bold text-sm">
                {(stats.rarityDistribution.epic || 0) + (stats.rarityDistribution.legendary || 0)}
              </div>
            </div>
          </div>
        )}

        {cards.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-gray-400 mb-4">
              {walletAddress ? 'No NFT cards found in your wallet' : 'No NFT cards in Supabase database yet'}
            </div>
            <div className="text-sm text-gray-500">
              {walletAddress 
                ? 'Create cards using the mint functionality above' 
                : 'Cards will appear here as they are minted and saved to Supabase'
              }
            </div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-6">
              {cards.map((card) => (
                <NFTCardDisplay
                  key={card.id}
                  card={card}
                  onClick={() => handleCardClick(card)}
                />
              ))}
            </div>

            {cards.length >= limit && (
              <div className="text-center">
                <button
                  onClick={loadMore}
                  disabled={loading}
                  className="bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 text-white px-6 py-2 rounded-lg transition-colors"
                >
                  {loading ? 'Loading...' : 'Load More'}
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Card Detail Modal */}
      {selectedCard && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-gray-900 rounded-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-2xl font-bold text-white">
                {selectedCard.name || `Card #${selectedCard.card_index}`}
              </h3>
              <button
                onClick={() => setSelectedCard(null)}
                className="text-gray-400 hover:text-white text-xl"
              >
                ×
              </button>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Card Visual */}
              <div className={`relative p-1 rounded-xl bg-gradient-to-b ${getRarityGradient(selectedCard.rarity)}`}>
                <div className="bg-gray-800 rounded-lg p-4">
                  <div className="relative w-full h-48 mb-4 rounded-lg overflow-hidden">
                    <Image
                      src={getCardImageUrl({
                        physical_damage: selectedCard.physical_damage,
                        magic_damage: selectedCard.magic_damage,
                        physical_armor: selectedCard.physical_armor,
                        magic_armor: selectedCard.magic_armor,
                        attack_speed: selectedCard.attack_speed,
                        accuracy: selectedCard.accuracy,
                        evasion: selectedCard.evasion,
                        crit_chance: selectedCard.crit_chance
                      }, selectedCard.rarity)}
                      alt={selectedCard.name || `Card #${selectedCard.card_index}`}
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="bg-red-900/30 p-2 rounded border border-red-500/20">
                      <div className="text-red-300 font-bold">⚔️ PHY DMG</div>
                      <div className="text-white">{selectedCard.physical_damage}</div>
                    </div>
                    <div className="bg-purple-900/30 p-2 rounded border border-purple-500/20">
                      <div className="text-purple-300 font-bold">✨ MAG DMG</div>
                      <div className="text-white">{selectedCard.magic_damage}</div>
                    </div>
                    <div className="bg-yellow-900/30 p-2 rounded border border-yellow-500/20">
                      <div className="text-yellow-300 font-bold">⚡ SPEED</div>
                      <div className="text-white">{selectedCard.attack_speed}</div>
                    </div>
                    <div className="bg-green-900/30 p-2 rounded border border-green-500/20">
                      <div className="text-green-300 font-bold">🎯 ACC</div>
                      <div className="text-white">{selectedCard.accuracy}%</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Card Info */}
              <div className="space-y-4">
                {selectedCard.description && (
                  <div>
                    <h4 className="text-cyan-400 font-bold mb-2">DESCRIPTION</h4>
                    <p className="text-white/80 text-sm">{selectedCard.description}</p>
                  </div>
                )}

                {selectedCard.lore && (
                  <div>
                    <h4 className="text-cyan-400 font-bold mb-2">LORE</h4>
                    <p className="text-white/60 text-sm">{selectedCard.lore}</p>
                  </div>
                )}

                <div className="space-y-2">
                  <div className="flex justify-between p-2 bg-white/5 rounded">
                    <span className="text-white/80">NFT Address:</span>
                    <span className="text-white font-mono text-xs">
                      {selectedCard.nft_address.slice(0, 6)}...{selectedCard.nft_address.slice(-4)}
                    </span>
                  </div>
                  <div className="flex justify-between p-2 bg-white/5 rounded">
                    <span className="text-white/80">Owner:</span>
                    <span className="text-white font-mono text-xs">
                      {selectedCard.owner_address.slice(0, 6)}...{selectedCard.owner_address.slice(-4)}
                    </span>
                  </div>
                  <div className="flex justify-between p-2 bg-white/5 rounded">
                    <span className="text-white/80">Power Rating:</span>
                    <span className="text-white font-bold">{selectedCard.power_rating}</span>
                  </div>
                  <div className="flex justify-between p-2 bg-white/5 rounded">
                    <span className="text-white/80">Created:</span>
                    <span className="text-white text-sm">
                      {new Date(selectedCard.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <a
                    href={`https://testnet.tonscan.org/address/${selectedCard.nft_address}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-center py-2 rounded-lg text-sm"
                  >
                    TON Explorer
                  </a>
                  <a
                    href={`https://testnet.tonviewer.com/${selectedCard.nft_address}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white text-center py-2 rounded-lg text-sm"
                  >
                    TonViewer
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function getRarityGradient(rarity: string) {
  switch (rarity) {
    case 'common': return 'from-gray-400 via-gray-600 to-gray-800';
    case 'rare': return 'from-blue-400 via-blue-600 to-blue-800';
    case 'epic': return 'from-purple-400 via-purple-600 to-purple-800';
    case 'legendary': return 'from-yellow-400 via-yellow-600 to-yellow-800';
    default: return 'from-gray-400 via-gray-600 to-gray-800';
  }
}