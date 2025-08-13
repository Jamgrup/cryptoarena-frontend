'use client'

import { useState } from 'react'
import Image from 'next/image'
import { getWaveImageUrl } from '@/lib/supabase'

const waves = [
  { name: 'red', color: 'text-red-500', bgColor: 'bg-red-900/20', fileName: 'Color=RED.png' },
  { name: 'orange', color: 'text-orange-500', bgColor: 'bg-orange-900/20', fileName: 'Color=Orange.png' },
  { name: 'yellow', color: 'text-yellow-500', bgColor: 'bg-yellow-900/20', fileName: 'Color=Yellow.png' },
  { name: 'green', color: 'text-green-500', bgColor: 'bg-green-900/20', fileName: 'Color=Green.png' },
  { name: 'blue', color: 'text-blue-500', bgColor: 'bg-blue-900/20', fileName: 'Color=Blue.png' },
  { name: 'pink', color: 'text-pink-500', bgColor: 'bg-pink-900/20', fileName: 'Color=Pink.png' }
]

export function WaveDisplay() {
  const [selectedWave, setSelectedWave] = useState<string>('red')

  return (
    <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
      <h2 className="text-2xl font-bold text-white mb-6 text-center">Wave System</h2>
      
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
        {waves.map((wave) => (
          <button
            key={wave.name}
            onClick={() => setSelectedWave(wave.name)}
            className={`p-4 rounded-lg border-2 transition-all duration-200 transform hover:scale-105 ${
              selectedWave === wave.name 
                ? `border-current ${wave.color} ${wave.bgColor}` 
                : 'border-white/20 bg-white/5 hover:bg-white/10'
            }`}
          >
            <div className="text-center">
              <div className={`text-2xl mb-2 ${wave.color} font-bold`}>
                {wave.name.toUpperCase()}
              </div>
              <div className="w-9 h-9 mx-auto relative">
                <div className={`w-full h-full rounded-full ${wave.bgColor} border border-current ${wave.color}`} />
              </div>
            </div>
          </button>
        ))}
      </div>

      {selectedWave && (
        <div className="text-center">
          <h3 className={`text-xl font-bold mb-4 capitalize ${waves.find(w => w.name === selectedWave)?.color}`}>
            {selectedWave} Wave
          </h3>
          
          <div className="relative w-64 h-64 mx-auto rounded-xl overflow-hidden bg-gray-800 border-2 border-current">
            <Image
              src={getWaveImageUrl(selectedWave)}
              alt={`${selectedWave} wave`}
              fill
              className="object-cover"
              unoptimized // Для внешних изображений из Supabase
            />
          </div>
          
          <p className="text-white/80 mt-4 max-w-md mx-auto">
            Each wave represents a different element and strategy in CryptoArena. 
            Cards from the same wave have special synergies when battling together.
          </p>
        </div>
      )}
    </div>
  )
}