'use client'

import { useState } from 'react'
import { useTonAddress } from '@tonconnect/ui-react'
import { WalletConnector } from '@/components/WalletConnector'
import { NFTCardCreator } from '@/components/NFTCardCreator'
import { WaveDisplay } from '@/components/WaveDisplay'
import { GemBalance } from '@/components/GemBalance'
import { CardCreation } from '@/components/CardCreation'
import { NFTCardGallery } from '@/components/NFTCardGallery'
import { SupabaseCardGallery } from '@/components/SupabaseCardGallery'
import { UserNFTCollection } from '@/components/UserNFTCollection'
import { UserProfile } from '@/components/UserProfile'
import { ContractInfo } from '@/components/ContractInfo'

export default function Home() {
  const [isWalletConnected, setIsWalletConnected] = useState(false)
  const [activeTab, setActiveTab] = useState<'my-cards' | 'blockchain' | 'supabase'>('my-cards')
  const address = useTonAddress()

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
              <div className="grid md:grid-cols-3 gap-6 mb-8">
                <div className="md:col-span-2">
                  <GemBalance />
                </div>
                <div>
                  <UserProfile />
                </div>
              </div>

              <CardCreation className="mb-8" />

              {/* Gallery Tabs */}
              <div className="mb-8">
                <div className="flex space-x-1 bg-white/10 rounded-lg p-1 mb-6">
                  <button
                    onClick={() => setActiveTab('my-cards')}
                    className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
                      activeTab === 'my-cards'
                        ? 'bg-white text-gray-900'
                        : 'text-white hover:text-gray-300'
                    }`}
                  >
                    🎴 My Cards
                  </button>
                  <button
                    onClick={() => setActiveTab('blockchain')}
                    className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
                      activeTab === 'blockchain'
                        ? 'bg-white text-gray-900'
                        : 'text-white hover:text-gray-300'
                    }`}
                  >
                    📡 Collection
                  </button>
                  <button
                    onClick={() => setActiveTab('supabase')}
                    className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
                      activeTab === 'supabase'
                        ? 'bg-white text-gray-900'
                        : 'text-white hover:text-gray-300'
                    }`}
                  >
                    🗄️ Database
                  </button>
                </div>

                {activeTab === 'my-cards' ? (
                  <UserNFTCollection />
                ) : activeTab === 'blockchain' ? (
                  <NFTCardGallery />
                ) : (
                  <SupabaseCardGallery walletAddress={address} />
                )}
              </div>

              <WaveDisplay />
              <NFTCardCreator />
              <ContractInfo className="mt-8" />
            </>
          )}
        </div>
      </div>
    </main>
  )
}