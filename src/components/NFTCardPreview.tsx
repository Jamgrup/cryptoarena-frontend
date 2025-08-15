'use client';

import { useState, useEffect } from 'react';
import { generateHeroData, getWaveColor } from '@/lib/heroes';
import { getWaveImageUrl, getRandomCardImageUrl } from '@/lib/supabase';

type WaveType = 'red' | 'orange' | 'yellow' | 'green' | 'blue' | 'purple';

interface GeneratedCardMetadata {
  name: string;
  description: string;
  lore: string;
  imageUrl: string;
  waveImageUrl: string;
}

interface NFTCardPreviewProps {
  onPreviewGenerated?: (wave: WaveType, metadata: GeneratedCardMetadata) => void;
  className?: string;
}

export function NFTCardPreview({ onPreviewGenerated, className = '' }: NFTCardPreviewProps) {
  const [currentWave, setCurrentWave] = useState<WaveType>('blue');
  const [metadata, setMetadata] = useState<GeneratedCardMetadata | null>(null);
  const [loading, setLoading] = useState(false);

  // Generate completely random preview (wave + metadata)
  const generateRandomPreview = async () => {
    try {
      setLoading(true);

      // All data is random - wave, characteristics, rarity
      const randomWave: WaveType = ['red', 'orange', 'yellow', 'green', 'blue', 'purple'][
        Math.floor(Math.random() * 6)
      ] as WaveType;

      // Mock attributes for name generation only (real stats generated in contract)
      const mockAttributes = {
        wave: randomWave,
        level: Math.floor(Math.random() * 10) + 1,
        physical_damage: Math.floor(Math.random() * 100) + 1,
        magic_damage: Math.floor(Math.random() * 100) + 1,
        physical_armor: Math.floor(Math.random() * 50),
        magic_armor: Math.floor(Math.random() * 50),
        attack_speed: Math.floor(Math.random() * 50) + 1,
        accuracy: Math.floor(Math.random() * 100),
        evasion: Math.floor(Math.random() * 100),
        crit_chance: Math.floor(Math.random() * 25)
      };

      // Random rarity for preview
      const randomRarity: 'common' | 'rare' | 'epic' | 'legendary' = 
        ['common', 'rare', 'epic', 'legendary'][Math.floor(Math.random() * 4)] as any;
      
      const heroData = generateHeroData(mockAttributes, randomRarity, randomWave);
      
      const previewMetadata: GeneratedCardMetadata = {
        name: heroData.name,
        description: heroData.description,
        lore: heroData.lore,
        imageUrl: getRandomCardImageUrl(),
        waveImageUrl: getWaveImageUrl(randomWave)
      };
      
      setCurrentWave(randomWave);
      setMetadata(previewMetadata);
      onPreviewGenerated?.(randomWave, previewMetadata);
    } catch (error) {
      console.error('Preview generation failed:', error);
    } finally {
      setLoading(false);
    }
  };

  // Initial preview generation
  useEffect(() => {
    generateRandomPreview();
  }, []);

  return (
    <div className={`p-6 bg-white border border-gray-200 rounded-lg shadow-sm ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">🎮 NFT Card Preview</h3>
        <button
          onClick={generateRandomPreview}
          disabled={loading}
          className="px-4 py-2 bg-purple-100 hover:bg-purple-200 text-purple-700 rounded disabled:opacity-50 transition-colors"
        >
          {loading ? '⏳ Generating...' : '🎲 Generate Random Preview'}
        </button>
      </div>

      {/* Important Notice */}
      <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex items-start gap-2">
          <span className="text-blue-600 text-lg">ℹ️</span>
          <div className="text-sm text-blue-800">
            <p className="font-medium mb-1">Preview Only</p>
            <p>This is a visual preview showing random Tron-style names and images. <strong>Real card characteristics, wave, and rarity will be generated randomly by the smart contract</strong> when you mint the NFT.</p>
          </div>
        </div>
      </div>

      {loading && (
        <div className="flex items-center justify-center h-64 bg-gray-50 border border-gray-200 rounded-lg">
          <div className="text-center">
            <div className="animate-spin w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full mx-auto mb-2"></div>
            <p className="text-sm text-gray-600">Generating preview...</p>
          </div>
        </div>
      )}

      {metadata && !loading && (
        <div className="space-y-4">
          {/* Card Image */}
          <div className="relative max-w-md mx-auto">
            <img
              src={metadata.imageUrl}
              alt={metadata.name}
              className="w-full h-64 object-cover rounded-lg border border-gray-300"
              onError={(e) => {
                (e.target as HTMLImageElement).src = '/placeholder-card.svg';
              }}
            />
            <div className="absolute top-2 right-2 flex items-center gap-1">
              <img
                src={metadata.waveImageUrl}
                alt={`${currentWave} wave`}
                className="w-8 h-8 rounded border bg-white"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
              <span className={`px-2 py-1 text-xs font-medium rounded ${getWaveColor(currentWave)} bg-white bg-opacity-90`}>
                {currentWave.toUpperCase()}
              </span>
            </div>
          </div>

          {/* Card Info */}
          <div className="space-y-3 text-center">
            <h4 className="font-bold text-xl text-gray-900">{metadata.name}</h4>
            
            <p className="text-sm text-gray-700 leading-relaxed max-w-lg mx-auto">
              {metadata.description}
            </p>

            <div className="p-3 bg-gray-50 border border-gray-200 rounded max-w-lg mx-auto">
              <p className="text-xs text-gray-600 italic">
                "{metadata.lore}"
              </p>
            </div>
          </div>

          {/* Characteristics Notice */}
          <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <h5 className="font-medium text-yellow-900 mb-2">📊 Actual Card Stats (Generated in Contract)</h5>
            <div className="grid grid-cols-2 gap-2 text-sm text-yellow-800">
              <div>• Physical Damage: 1-100</div>
              <div>• Magic Damage: 1-100</div>
              <div>• Attack Speed: 1-50</div>
              <div>• Accuracy: 0-100</div>
              <div>• Evasion: 0-100</div>
              <div>• Physical Armor: 0-50</div>
              <div>• Magic Armor: 0-50</div>
              <div>• Crit Chance: 0-25</div>
              <div>• Level: 1-10</div>
              <div>• Wave: Random Color</div>
            </div>
            <p className="text-xs text-yellow-700 mt-2">
              <strong>All stats will be randomly generated by the smart contract when you mint the NFT!</strong>
            </p>
          </div>
        </div>
      )}
    </div>
  );
}