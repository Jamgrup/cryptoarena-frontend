'use client'

import { useState } from 'react'
import { apiClient, NFTCardData } from '@/lib/api'
import Image from 'next/image'
import { getCardImageUrl } from '@/lib/supabase'
import { getRarityColor, getWaveColor, calculateCardPowerRating, CardStats } from '@/lib/heroes'

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
          <div className="relative p-1 rounded-xl bg-gradient-to-b from-gray-400 via-gray-600 to-gray-800 data-[rarity=rare]:from-blue-400 data-[rarity=rare]:via-blue-600 data-[rarity=rare]:to-blue-800 data-[rarity=epic]:from-purple-400 data-[rarity=epic]:via-purple-600 data-[rarity=epic]:to-purple-800 data-[rarity=legendary]:from-yellow-400 data-[rarity=legendary]:via-yellow-600 data-[rarity=legendary]:to-yellow-800" data-rarity={currentCard.rarity}>
            <div className="bg-gray-900 rounded-lg p-4 min-w-[300px]">
              <div className="text-center mb-4">
                <h3 className={`text-lg font-bold ${getRarityColor(currentCard.rarity)} capitalize`}>
                  {currentCard.name}
                </h3>
                <p className="text-sm text-gray-300 mt-1">
                  {currentCard.title}
                </p>
                <div className="flex justify-center items-center gap-2 mt-2">
                  <span className={`text-xs px-2 py-1 rounded ${getRarityColor(currentCard.rarity)} bg-gray-800 border border-current`}>
                    {currentCard.rarity.toUpperCase()}
                  </span>
                  <span className="text-xs text-gray-400">
                    Level {currentCard.level}
                  </span>
                </div>
              </div>
              
              <div className="relative w-full h-48 mb-4 rounded-lg overflow-hidden bg-gray-800">
                <Image
                  src={getCardImageUrl(currentCard, currentCard.rarity)}
                  alt={`${currentCard.name || 'Program'} ${currentCard.rarity}`}
                  fill
                  className="object-cover"
                  unoptimized // Для внешних изображений из Supabase
                />
              </div>

              <div className="grid grid-cols-2 gap-1 text-xs">
                <div className="bg-red-900/30 p-2 rounded text-center border border-red-500/20">
                  <div className="text-red-300 font-bold">⚔️ PHY DMG</div>
                  <div className="text-white text-sm">{currentCard.physical_damage}</div>
                </div>
                <div className="bg-purple-900/30 p-2 rounded text-center border border-purple-500/20">
                  <div className="text-purple-300 font-bold">✨ MAG DMG</div>
                  <div className="text-white text-sm">{currentCard.magic_damage}</div>
                </div>
                <div className="bg-yellow-900/30 p-2 rounded text-center border border-yellow-500/20">
                  <div className="text-yellow-300 font-bold">⚡ SPEED</div>
                  <div className="text-white text-sm">{currentCard.attack_speed}</div>
                </div>
                <div className="bg-green-900/30 p-2 rounded text-center border border-green-500/20">
                  <div className="text-green-300 font-bold">🎯 ACC</div>
                  <div className="text-white text-sm">{currentCard.accuracy}%</div>
                </div>
                <div className="bg-blue-900/30 p-2 rounded text-center border border-blue-500/20">
                  <div className="text-blue-300 font-bold">👻 EVA</div>
                  <div className="text-white text-sm">{currentCard.evasion}%</div>
                </div>
                <div className="bg-gray-700/30 p-2 rounded text-center border border-gray-500/20">
                  <div className="text-gray-300 font-bold">🛡️ P.ARM</div>
                  <div className="text-white text-sm">{currentCard.physical_armor}</div>
                </div>
                <div className="bg-cyan-900/30 p-2 rounded text-center border border-cyan-500/20">
                  <div className="text-cyan-300 font-bold">🔮 M.ARM</div>
                  <div className="text-white text-sm">{currentCard.magic_armor}</div>
                </div>
                <div className="bg-orange-900/30 p-2 rounded text-center border border-orange-500/20">
                  <div className="text-orange-300 font-bold">💥 CRIT</div>
                  <div className="text-white text-sm">{currentCard.crit_chance}%</div>
                </div>
              </div>

              <div className="mt-4 text-center">
                <div className={`inline-block px-3 py-1 rounded-full text-sm font-bold wave-${currentCard.wave} bg-gray-800 border border-current`}>
                  {currentCard.wave.toUpperCase()} WAVE
                </div>
              </div>
            </div>
          </div>

          {/* Program Information */}
          <div className="flex-1">
            <h3 className="text-2xl font-bold text-white mb-4">Program Information</h3>
            
            {/* Description */}
            <div className="bg-white/5 rounded-lg p-4 mb-4">
              <h4 className="text-sm font-bold text-cyan-400 mb-2">DESCRIPTION</h4>
              <p className="text-white/80 text-sm leading-relaxed">
                {currentCard.description}
              </p>
            </div>

            {/* Lore */}
            <div className="bg-white/5 rounded-lg p-4 mb-4">
              <h4 className="text-sm font-bold text-cyan-400 mb-2">PROGRAM LORE</h4>
              <p className="text-white/60 text-sm leading-relaxed">
                {currentCard.lore}
              </p>
            </div>

            {/* Statistics */}
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-white/5 rounded-lg">
                <span className="text-white/80">Wave Frequency:</span>
                <span className={`font-bold capitalize ${getWaveColor(currentCard.wave)}`}>
                  {currentCard.wave.toUpperCase()}
                </span>
              </div>
              <div className="flex justify-between items-center p-3 bg-white/5 rounded-lg">
                <span className="text-white/80">Classification:</span>
                <span className={`font-bold capitalize ${getRarityColor(currentCard.rarity)}`}>
                  {currentCard.rarity}
                </span>
              </div>
              <div className="flex justify-between items-center p-3 bg-white/5 rounded-lg">
                <span className="text-white/80">Power Rating:</span>
                <span className="text-white font-bold">
                  {calculateCardPowerRating(currentCard as CardStats)}
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