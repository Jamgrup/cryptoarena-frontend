'use client'

import { useState } from 'react'
import { WalletConnector } from '@/components/WalletConnector'
import { NFTCardCreator } from '@/components/NFTCardCreator'
import { WaveDisplay } from '@/components/WaveDisplay'

export default function Home() {
  const [isWalletConnected, setIsWalletConnected] = useState(false)

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-black p-4">
      <div className="container mx-auto max-w-4xl">
        <header className="text-center py-8">
          <h1 className="text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500 mb-4">
            CryptoArena
          </h1>
          <p className="text-xl text-white/80">
            Create and battle with NFT cards on TON blockchain
          </p>
        </header>

        <div className="space-y-8">
          <WalletConnector 
            onConnectionChange={setIsWalletConnected}
          />

          {isWalletConnected && (
            <>
              <WaveDisplay />
              <NFTCardCreator />
            </>
          )}
        </div>
      </div>
    </main>
  )
}