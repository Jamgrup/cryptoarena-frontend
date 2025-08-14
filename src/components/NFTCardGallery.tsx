'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { getCardImageUrl, getWaveImageUrl } from '@/lib/supabase';

interface NFTCard {
  index: number;
  nftAddress: string;
  owner?: string;
  collection: string;
  attributes: {
    wave: string;
    level: number;
    physical_damage: number;
    magic_damage: number;
    health: number;
    mana: number;
    experience: number;
    physical_armor: number;
    magic_armor: number;
    attack_speed: number;
    accuracy: number;
    evasion: number;
    crit_chance: number;
  };
  name: string;
  description: string;
  lore: string;
  rarity: string;
  powerRating: number;
  explorer: string;
  tonviewer: string;
}

interface NFTCardDisplayProps {
  card: NFTCard;
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
            {card.name}
          </h3>
          <div className="flex justify-center items-center gap-2 mt-1">
            <span className={`text-xs px-2 py-1 rounded ${getRarityColor(card.rarity)} bg-gray-800 border border-current`}>
              {card.rarity.toUpperCase()}
            </span>
            <span className="text-xs text-gray-400">
              #{card.index}
            </span>
          </div>
        </div>
        
        {/* Card Image */}
        <div className="relative w-full h-32 mb-3 rounded-lg overflow-hidden bg-gray-800">
          <Image
            src={getCardImageUrl(card.attributes, card.rarity)}
            alt={`${card.name} ${card.rarity}`}
            fill
            className="object-cover"
            unoptimized
          />
          {/* Wave indicator */}
          <div className="absolute top-2 right-2">
            <Image
              src={getWaveImageUrl(card.attributes.wave)}
              alt={card.attributes.wave}
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
            <div className="text-white text-xs">{card.attributes.physical_damage}</div>
          </div>
          <div className="bg-purple-900/30 p-1 rounded text-center border border-purple-500/20">
            <div className="text-purple-300 font-bold">✨</div>
            <div className="text-white text-xs">{card.attributes.magic_damage}</div>
          </div>
          <div className="bg-yellow-900/30 p-1 rounded text-center border border-yellow-500/20">
            <div className="text-yellow-300 font-bold">⚡</div>
            <div className="text-white text-xs">{card.attributes.attack_speed}</div>
          </div>
          <div className="bg-green-900/30 p-1 rounded text-center border border-green-500/20">
            <div className="text-green-300 font-bold">🎯</div>
            <div className="text-white text-xs">{card.attributes.accuracy}%</div>
          </div>
        </div>

        {/* Power Rating */}
        <div className="text-center">
          <div className="text-xs text-gray-400">Power</div>
          <div className="text-white font-bold">{card.powerRating}</div>
        </div>
      </div>
    </div>
  );
}

interface NFTCardGalleryProps {
  className?: string;
}

export function NFTCardGallery({ className = '' }: NFTCardGalleryProps) {
  const [cards, setCards] = useState<NFTCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCard, setSelectedCard] = useState<NFTCard | null>(null);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [loadingMore, setLoadingMore] = useState(false);

  const fetchCards = async (pageNum: number = 0, append: boolean = false) => {
    try {
      if (!append) setLoading(true);
      else setLoadingMore(true);
      setError(null);

      const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'https://cryptoarena-backend.onrender.com';
      const limit = 12;
      const offset = pageNum * limit;
      
      const response = await fetch(`${backendUrl}/api/v1/nft/collection/cards?limit=${limit}&offset=${offset}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        signal: AbortSignal.timeout(10000)
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      if (data.success) {
        if (append) {
          setCards(prev => [...prev, ...data.data.cards]);
        } else {
          setCards(data.data.cards);
        }
        setTotal(data.data.total);
      } else {
        throw new Error(data.error || 'Failed to fetch cards');
      }
    } catch (err: any) {
      console.error('Error fetching cards:', err);
      setError(err.message || 'Failed to load NFT cards');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const fetchCardMetadata = async (cardIndex: number): Promise<NFTCard | null> => {
    try {
      const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'https://cryptoarena-backend.onrender.com';
      
      const response = await fetch(`${backendUrl}/api/v1/nft/card/${cardIndex}/metadata`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        signal: AbortSignal.timeout(10000)
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      if (data.success) {
        return data.data;
      } else {
        throw new Error(data.error || 'Failed to fetch card metadata');
      }
    } catch (err) {
      console.error('Error fetching card metadata:', err);
      return null;
    }
  };

  const handleCardClick = async (card: any) => {
    const metadata = await fetchCardMetadata(card.index);
    if (metadata) {
      setSelectedCard(metadata);
    }
  };

  const loadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchCards(nextPage, true);
  };

  useEffect(() => {
    fetchCards(0, false);
  }, []);

  if (loading && cards.length === 0) {
    return (
      <div className={`bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20 ${className}`}>
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-4">NFT Card Gallery</h2>
          <div className="flex justify-center items-center space-x-2">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
            <span className="text-white">Loading cards...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error && cards.length === 0) {
    return (
      <div className={`bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20 ${className}`}>
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-4">NFT Card Gallery</h2>
          <div className="text-red-400 mb-4">{error}</div>
          <button
            onClick={() => fetchCards(0, false)}
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
          <h2 className="text-2xl font-bold text-white">NFT Card Gallery</h2>
          <div className="text-white/80 text-sm">
            {total} total cards
          </div>
        </div>

        {cards.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-gray-400 mb-4">No NFT cards minted yet</div>
            <div className="text-sm text-gray-500">Create the first card using the mint functionality above</div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-6">
              {cards.map((card) => (
                <NFTCardDisplay
                  key={card.index}
                  card={card as any}
                  onClick={() => handleCardClick(card)}
                />
              ))}
            </div>

            {cards.length < total && (
              <div className="text-center">
                <button
                  onClick={loadMore}
                  disabled={loadingMore}
                  className="bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 text-white px-6 py-2 rounded-lg transition-colors"
                >
                  {loadingMore ? 'Loading...' : `Load More (${cards.length}/${total})`}
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
              <h3 className="text-2xl font-bold text-white">{selectedCard.name}</h3>
              <button
                onClick={() => setSelectedCard(null)}
                className="text-gray-400 hover:text-white text-xl"
              >
                ×
              </button>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Card Visual */}
              <div className={`relative p-1 rounded-xl bg-gradient-to-b ${getRarityColor(selectedCard.rarity).replace('text-', 'from-').replace('border-', '').replace('-400', '-400 via-')}`}>
                <div className="bg-gray-800 rounded-lg p-4">
                  <div className="relative w-full h-48 mb-4 rounded-lg overflow-hidden">
                    <Image
                      src={getCardImageUrl(selectedCard.attributes, selectedCard.rarity)}
                      alt={selectedCard.name}
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="bg-red-900/30 p-2 rounded border border-red-500/20">
                      <div className="text-red-300 font-bold">⚔️ PHY DMG</div>
                      <div className="text-white">{selectedCard.attributes.physical_damage}</div>
                    </div>
                    <div className="bg-purple-900/30 p-2 rounded border border-purple-500/20">
                      <div className="text-purple-300 font-bold">✨ MAG DMG</div>
                      <div className="text-white">{selectedCard.attributes.magic_damage}</div>
                    </div>
                    <div className="bg-yellow-900/30 p-2 rounded border border-yellow-500/20">
                      <div className="text-yellow-300 font-bold">⚡ SPEED</div>
                      <div className="text-white">{selectedCard.attributes.attack_speed}</div>
                    </div>
                    <div className="bg-green-900/30 p-2 rounded border border-green-500/20">
                      <div className="text-green-300 font-bold">🎯 ACC</div>
                      <div className="text-white">{selectedCard.attributes.accuracy}%</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Card Info */}
              <div className="space-y-4">
                <div>
                  <h4 className="text-cyan-400 font-bold mb-2">DESCRIPTION</h4>
                  <p className="text-white/80 text-sm">{selectedCard.description}</p>
                </div>

                <div>
                  <h4 className="text-cyan-400 font-bold mb-2">LORE</h4>
                  <p className="text-white/60 text-sm">{selectedCard.lore}</p>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between p-2 bg-white/5 rounded">
                    <span className="text-white/80">Card #:</span>
                    <span className="text-white font-bold">#{selectedCard.index}</span>
                  </div>
                  <div className="flex justify-between p-2 bg-white/5 rounded">
                    <span className="text-white/80">Rarity:</span>
                    <span className={`font-bold capitalize ${getRarityColor(selectedCard.rarity).split(' ')[0]}`}>
                      {selectedCard.rarity}
                    </span>
                  </div>
                  <div className="flex justify-between p-2 bg-white/5 rounded">
                    <span className="text-white/80">Power Rating:</span>
                    <span className="text-white font-bold">{selectedCard.powerRating}</span>
                  </div>
                  <div className="flex justify-between p-2 bg-white/5 rounded">
                    <span className="text-white/80">Wave:</span>
                    <span className="text-white font-bold capitalize">{selectedCard.attributes.wave}</span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <a
                    href={selectedCard.explorer}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-center py-2 rounded-lg text-sm"
                  >
                    TON Explorer
                  </a>
                  <a
                    href={selectedCard.tonviewer}
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

function getRarityColor(rarity: string) {
  switch (rarity) {
    case 'common': return 'from-gray-400 via-gray-600 to-gray-800';
    case 'rare': return 'from-blue-400 via-blue-600 to-blue-800';
    case 'epic': return 'from-purple-400 via-purple-600 to-purple-800';
    case 'legendary': return 'from-yellow-400 via-yellow-600 to-yellow-800';
    default: return 'from-gray-400 via-gray-600 to-gray-800';
  }
}