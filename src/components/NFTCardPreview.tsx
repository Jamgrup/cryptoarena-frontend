'use client';

import { useState, useEffect } from 'react';
import { CardStats, generateHeroData, calculateCardPowerRating, getRarityColor, getWaveColor } from '@/lib/heroes';

interface CardAttributes {
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
}

interface GeneratedCardMetadata {
  name: string;
  description: string;
  lore: string;
  rarity: string;
  powerRating: number;
  dominantStat: string;
  imageUrl: string;
}

interface PreviewResponse {
  success: boolean;
  data: {
    attributes: CardAttributes;
    metadata: GeneratedCardMetadata;
    timestamp: string;
  };
}

interface NFTCardPreviewProps {
  onPreviewGenerated?: (attributes: CardAttributes, metadata: GeneratedCardMetadata) => void;
  className?: string;
}

export function NFTCardPreview({ onPreviewGenerated, className = '' }: NFTCardPreviewProps) {
  const [attributes, setAttributes] = useState<CardAttributes>({
    wave: 'blue',
    level: 1,
    physical_damage: 50,
    magic_damage: 30,
    physical_armor: 25,
    magic_armor: 20,
    attack_speed: 15,
    accuracy: 60,
    evasion: 40,
    crit_chance: 10
  });

  const [metadata, setMetadata] = useState<GeneratedCardMetadata | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [autoPreview, setAutoPreview] = useState(true);

  // Generate random attributes
  const generateRandomAttributes = (): CardAttributes => {
    const waves: Array<'red' | 'orange' | 'yellow' | 'green' | 'blue' | 'purple'> = 
      ['red', 'orange', 'yellow', 'green', 'blue', 'purple'];
    
    return {
      wave: waves[Math.floor(Math.random() * waves.length)],
      level: Math.floor(Math.random() * 10) + 1, // 1-10
      physical_damage: Math.floor(Math.random() * 100) + 1, // 1-100
      magic_damage: Math.floor(Math.random() * 100) + 1, // 1-100
      physical_armor: Math.floor(Math.random() * 50) + 1, // 1-50
      magic_armor: Math.floor(Math.random() * 50) + 1, // 1-50
      attack_speed: Math.floor(Math.random() * 50) + 1, // 1-50
      accuracy: Math.floor(Math.random() * 100), // 0-100
      evasion: Math.floor(Math.random() * 100), // 0-100
      crit_chance: Math.floor(Math.random() * 25) // 0-25
    };
  };

  // Call backend preview API
  const generatePreview = async (cardAttributes?: CardAttributes) => {
    const attrs = cardAttributes || attributes;
    
    try {
      setLoading(true);
      setError(null);

      const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'https://cryptoarena-backend.onrender.com';
      const response = await fetch(`${backendUrl}/api/v1/nft/preview`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ attributes: attrs }),
        signal: AbortSignal.timeout(15000) // 15 second timeout
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data: PreviewResponse = await response.json();
      
      if (data.success) {
        setMetadata(data.data.metadata);
        onPreviewGenerated?.(attrs, data.data.metadata);
      } else {
        throw new Error('Preview generation failed');
      }
    } catch (err: any) {
      console.error('Preview generation error:', err);
      
      let errorMessage = 'Failed to generate preview';
      if (err.name === 'AbortError') {
        errorMessage = 'Preview request timed out. Backend may be sleeping - please wait and try again.';
      } else if (err.message) {
        errorMessage = `Preview failed: ${err.message}`;
      }
      
      setError(errorMessage);
      
      // Fallback to frontend generation if backend fails
      try {
        const powerRating = calculateCardPowerRating(attrs);
        let rarity: 'common' | 'rare' | 'epic' | 'legendary' = 'common';
        if (powerRating >= 600) rarity = 'legendary';
        else if (powerRating >= 450) rarity = 'epic';
        else if (powerRating >= 300) rarity = 'rare';
        
        const heroData = generateHeroData(attrs, rarity, attrs.wave);
        
        const fallbackMetadata: GeneratedCardMetadata = {
          name: heroData.name,
          description: heroData.description,
          lore: heroData.lore,
          rarity,
          powerRating,
          dominantStat: 'physical_damage', // simplified
          imageUrl: '/placeholder-card.svg'
        };
        
        setMetadata(fallbackMetadata);
        onPreviewGenerated?.(attrs, fallbackMetadata);
      } catch (fallbackError) {
        console.error('Fallback generation failed:', fallbackError);
      }
    } finally {
      setLoading(false);
    }
  };

  // Auto-generate preview when attributes change
  useEffect(() => {
    if (autoPreview) {
      const debounceTimer = setTimeout(() => {
        generatePreview();
      }, 500);
      
      return () => clearTimeout(debounceTimer);
    }
  }, [attributes, autoPreview]);

  // Initial preview generation
  useEffect(() => {
    generatePreview();
  }, []);

  const handleRandomize = () => {
    const randomAttrs = generateRandomAttributes();
    setAttributes(randomAttrs);
    generatePreview(randomAttrs);
  };

  const handleAttributeChange = (key: keyof CardAttributes, value: number | string) => {
    setAttributes(prev => ({
      ...prev,
      [key]: value
    }));
  };

  return (
    <div className={`p-6 bg-white border border-gray-200 rounded-lg shadow-sm ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">🎮 NFT Card Preview</h3>
        <div className="flex items-center gap-2">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={autoPreview}
              onChange={(e) => setAutoPreview(e.target.checked)}
              className="rounded"
            />
            Auto Preview
          </label>
          <button
            onClick={handleRandomize}
            disabled={loading}
            className="px-3 py-1 text-sm bg-purple-100 hover:bg-purple-200 text-purple-700 rounded disabled:opacity-50"
          >
            🎲 Random
          </button>
          {!autoPreview && (
            <button
              onClick={() => generatePreview()}
              disabled={loading}
              className="px-3 py-1 text-sm bg-blue-100 hover:bg-blue-200 text-blue-700 rounded disabled:opacity-50"
            >
              {loading ? '⏳' : '🔄'} Preview
            </button>
          )}
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Attributes Panel */}
        <div className="space-y-4">
          <h4 className="font-medium text-gray-900">Card Attributes</h4>
          
          {/* Wave Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Wave</label>
            <select
              value={attributes.wave}
              onChange={(e) => handleAttributeChange('wave', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
            >
              <option value="red">🔴 Red</option>
              <option value="orange">🟠 Orange</option>
              <option value="yellow">🟡 Yellow</option>
              <option value="green">🟢 Green</option>
              <option value="blue">🔵 Blue</option>
              <option value="purple">🟣 Purple</option>
            </select>
          </div>

          {/* Level */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Level: {attributes.level}
            </label>
            <input
              type="range"
              min="1"
              max="10"
              value={attributes.level}
              onChange={(e) => handleAttributeChange('level', parseInt(e.target.value))}
              className="w-full"
            />
          </div>

          {/* Combat Stats */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Physical Damage: {attributes.physical_damage}
              </label>
              <input
                type="range"
                min="1"
                max="100"
                value={attributes.physical_damage}
                onChange={(e) => handleAttributeChange('physical_damage', parseInt(e.target.value))}
                className="w-full"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Magic Damage: {attributes.magic_damage}
              </label>
              <input
                type="range"
                min="1"
                max="100"
                value={attributes.magic_damage}
                onChange={(e) => handleAttributeChange('magic_damage', parseInt(e.target.value))}
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Physical Armor: {attributes.physical_armor}
              </label>
              <input
                type="range"
                min="0"
                max="50"
                value={attributes.physical_armor}
                onChange={(e) => handleAttributeChange('physical_armor', parseInt(e.target.value))}
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Magic Armor: {attributes.magic_armor}
              </label>
              <input
                type="range"
                min="0"
                max="50"
                value={attributes.magic_armor}
                onChange={(e) => handleAttributeChange('magic_armor', parseInt(e.target.value))}
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Attack Speed: {attributes.attack_speed}
              </label>
              <input
                type="range"
                min="1"
                max="50"
                value={attributes.attack_speed}
                onChange={(e) => handleAttributeChange('attack_speed', parseInt(e.target.value))}
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Accuracy: {attributes.accuracy}
              </label>
              <input
                type="range"
                min="0"
                max="100"
                value={attributes.accuracy}
                onChange={(e) => handleAttributeChange('accuracy', parseInt(e.target.value))}
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Evasion: {attributes.evasion}
              </label>
              <input
                type="range"
                min="0"
                max="100"
                value={attributes.evasion}
                onChange={(e) => handleAttributeChange('evasion', parseInt(e.target.value))}
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Crit Chance: {attributes.crit_chance}
              </label>
              <input
                type="range"
                min="0"
                max="25"
                value={attributes.crit_chance}
                onChange={(e) => handleAttributeChange('crit_chance', parseInt(e.target.value))}
                className="w-full"
              />
            </div>
          </div>
        </div>

        {/* Preview Panel */}
        <div className="space-y-4">
          <h4 className="font-medium text-gray-900">Generated Preview</h4>
          
          {loading && (
            <div className="flex items-center justify-center h-64 bg-gray-50 border border-gray-200 rounded-lg">
              <div className="text-center">
                <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-2"></div>
                <p className="text-sm text-gray-600">Generating preview...</p>
              </div>
            </div>
          )}

          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-800 text-sm">{error}</p>
            </div>
          )}

          {metadata && !loading && (
            <div className="space-y-4">
              {/* Card Image */}
              <div className="relative">
                <img
                  src={metadata.imageUrl}
                  alt={metadata.name}
                  className="w-full h-48 object-cover rounded-lg border border-gray-300"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/placeholder-card.svg';
                  }}
                />
                <div className="absolute top-2 right-2 flex gap-1">
                  <span className={`px-2 py-1 text-xs font-medium rounded ${getRarityColor(metadata.rarity as any)} bg-white bg-opacity-90`}>
                    {metadata.rarity.toUpperCase()}
                  </span>
                  <span className={`px-2 py-1 text-xs font-medium rounded ${getWaveColor(attributes.wave)} bg-white bg-opacity-90`}>
                    {attributes.wave.toUpperCase()}
                  </span>
                </div>
              </div>

              {/* Card Info */}
              <div className="space-y-2">
                <h5 className="font-bold text-lg text-gray-900">{metadata.name}</h5>
                
                <div className="flex items-center gap-4 text-sm">
                  <span className="text-gray-600">Level {attributes.level}</span>
                  <span className="text-gray-600">Power: {metadata.powerRating}</span>
                  <span className="text-gray-600">Focus: {metadata.dominantStat.replace('_', ' ')}</span>
                </div>

                <p className="text-sm text-gray-700 leading-relaxed">
                  {metadata.description}
                </p>

                <div className="p-3 bg-gray-50 border border-gray-200 rounded">
                  <p className="text-xs text-gray-600 italic">
                    "{metadata.lore}"
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}