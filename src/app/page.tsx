'use client'

import { useState } from 'react'
import { useTonAddress } from '@tonconnect/ui-react'
import { WalletConnector } from '@/components/WalletConnector'
import { NFTMintCard } from '@/components/NFTMintCard'
import { WaveDisplay } from '@/components/WaveDisplay'
import { GemBalance } from '@/components/GemBalance'
import { NFTCardGallery } from '@/components/NFTCardGallery'
import { SupabaseCardGallery } from '@/components/SupabaseCardGallery'
import { UserNFTCollectionDB } from '@/components/UserNFTCollectionDB'
import { UserProfileDB } from '@/components/UserProfileDB'
import { ContractInfo } from '@/components/ContractInfo'

export default function Home() {
  const [isWalletConnected, setIsWalletConnected] = useState(false)
  const [activeTab, setActiveTab] = useState<'my-cards' | 'all-cards'>('my-cards')
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
                  <UserProfileDB />
                </div>
              </div>

              <NFTMintCard />

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
                    🎴 My NFT Cards
                  </button>
                  <button
                    onClick={() => setActiveTab('all-cards')}
                    className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
                      activeTab === 'all-cards'
                        ? 'bg-white text-gray-900'
                        : 'text-white hover:text-gray-300'
                    }`}
                  >
                    🗄️ All Cards
                  </button>
                </div>

                {activeTab === 'my-cards' ? (
                  <UserNFTCollectionDB />
                ) : (
                  <SupabaseCardGallery />
                )}
              </div>

              <ContractInfo className="mt-8" />
            </>
          )}
        </div>
      </div>
    </main>
  )
}