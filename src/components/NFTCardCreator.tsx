'use client'

import { useState } from 'react'
import { apiClient, NFTCardData } from '@/lib/api'
import Image from 'next/image'

export function NFTCardCreator() {
  const [isGenerating, setIsGenerating] = useState(false)
  const [currentCard, setCurrentCard] = useState<NFTCardData | null>(null)
  const [error, setError] = useState<string | null>(null)

  const generateCard = async () => {
    setIsGenerating(true)
    setError(null)
    
    try {
      const cardData = await apiClient.generateRandomCard()
      setCurrentCard(cardData)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate card')
    } finally {
      setIsGenerating(false)
    }
  }

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'rarity-common'
      case 'rare': return 'rarity-rare' 
      case 'epic': return 'rarity-epic'
      case 'legendary': return 'rarity-legendary'
      default: return 'rarity-common'
    }
  }

  const getImageUrl = (type: string, rarity: string) => {
    return `https://aahhwipuqqttfcqkdqdb.supabase.co/storage/v1/object/public/nft-images/${type}_${rarity}.svg`
  }

  return (
    <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
      <div className="text-center mb-6">
        <h2 className="text-3xl font-bold text-white mb-4">Create NFT Card</h2>
        <button
          onClick={generateCard}
          disabled={isGenerating}
          className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 disabled:from-gray-500 disabled:to-gray-600 text-white font-bold py-3 px-8 rounded-lg transition-all duration-200 transform hover:scale-105 disabled:scale-100"
        >
          {isGenerating ? 'Generating...' : 'Generate Random Card'}
        </button>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-500/20 border border-red-500/30 rounded-lg">
          <p className="text-red-400">{error}</p>
        </div>
      )}

      {currentCard && (
        <div className="flex flex-col lg:flex-row gap-6 items-center">
          {/* Card Preview */}
          <div className={`relative bg-gradient-to-b from-${getRarityColor(currentCard.rarity)} to-gray-800 p-1 rounded-xl`}>
            <div className="bg-gray-900 rounded-lg p-4 min-w-[300px]">
              <div className="text-center mb-4">
                <h3 className={`text-xl font-bold text-${getRarityColor(currentCard.rarity)} capitalize`}>
                  {currentCard.rarity} {currentCard.type}
                </h3>
              </div>
              
              <div className="relative w-full h-48 mb-4 rounded-lg overflow-hidden bg-gray-800">
                <Image
                  src={getImageUrl(currentCard.type, currentCard.rarity)}
                  alt={`${currentCard.type} ${currentCard.rarity}`}
                  fill
                  className="object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement
                    target.src = '/placeholder-card.svg'
                  }}
                />
              </div>

              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="bg-red-900/50 p-2 rounded text-center">
                  <div className="text-red-300 font-bold">⚔️ ATK</div>
                  <div className="text-white text-lg">{currentCard.attack}</div>
                </div>
                <div className="bg-blue-900/50 p-2 rounded text-center">
                  <div className="text-blue-300 font-bold">🛡️ DEF</div>
                  <div className="text-white text-lg">{currentCard.defense}</div>
                </div>
                <div className="bg-green-900/50 p-2 rounded text-center">
                  <div className="text-green-300 font-bold">💚 HP</div>
                  <div className="text-white text-lg">{currentCard.health}</div>
                </div>
                <div className="bg-yellow-900/50 p-2 rounded text-center">
                  <div className="text-yellow-300 font-bold">⚡ SPD</div>
                  <div className="text-white text-lg">{currentCard.speed}</div>
                </div>
              </div>

              <div className="mt-4 text-center">
                <div className={`inline-block px-3 py-1 rounded-full text-sm font-bold wave-${currentCard.wave} bg-gray-800 border border-current`}>
                  {currentCard.wave.toUpperCase()} WAVE
                </div>
              </div>
            </div>
          </div>

          {/* Card Stats */}
          <div className="flex-1">
            <h3 className="text-2xl font-bold text-white mb-4">Card Statistics</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-white/5 rounded-lg">
                <span className="text-white/80">Type:</span>
                <span className="text-white font-bold capitalize">{currentCard.type}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-white/5 rounded-lg">
                <span className="text-white/80">Rarity:</span>
                <span className={`font-bold capitalize text-${getRarityColor(currentCard.rarity)}`}>
                  {currentCard.rarity}
                </span>
              </div>
              <div className="flex justify-between items-center p-3 bg-white/5 rounded-lg">
                <span className="text-white/80">Wave:</span>
                <span className={`font-bold capitalize wave-${currentCard.wave}`}>
                  {currentCard.wave}
                </span>
              </div>
              <div className="flex justify-between items-center p-3 bg-white/5 rounded-lg">
                <span className="text-white/80">Total Power:</span>
                <span className="text-white font-bold">
                  {currentCard.attack + currentCard.defense + Math.floor(currentCard.health / 10) + currentCard.speed}
                </span>
              </div>
            </div>

            <div className="mt-6">
              <button
                className="w-full bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white font-bold py-3 px-6 rounded-lg transition-all duration-200 transform hover:scale-105"
                onClick={() => alert('NFT minting will be implemented with TON smart contracts!')}
              >
                Mint as NFT (Coming Soon)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}