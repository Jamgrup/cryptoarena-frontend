'use client'

import { useState, useEffect } from 'react'
import { useTonConnectUI, useTonAddress, useTonWallet } from '@tonconnect/ui-react'
import { Address, toNano, beginCell } from '@ton/core'
import Image from 'next/image'
import { getCardImageUrl, getWaveImageUrl, getRandomCardPreview } from '@/lib/supabase'
import { getRarityColor, getWaveColor, calculateCardPowerRating, CardStats } from '@/lib/heroes'

interface CollectionInfo {
  address: string
  name: string
  nextItemIndex: string
  totalMinted: string
  state: string
}

interface MintInfo {
  collectionAddress: string
  recipientAddress: string
  nextItemIndex: string
  mintValue: string
  instructions: string[]
}

interface GeneratedCardMetadata {
  name: string
  description: string
  lore: string
  rarity: string
  powerRating: number
  dominantStat: string
  imageUrl: string
}

type WaveType = 'red' | 'orange' | 'yellow' | 'green' | 'blue' | 'purple'

export function NFTMintCard() {
  const [tonConnectUI] = useTonConnectUI()
  const wallet = useTonWallet()
  const address = useTonAddress()
  const [collectionInfo, setCollectionInfo] = useState<CollectionInfo | null>(null)
  const [mintInfo, setMintInfo] = useState<MintInfo | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [currentCard, setCurrentCard] = useState<GeneratedCardMetadata | null>(null)
  const [currentWave, setCurrentWave] = useState<WaveType>('blue')
  const connected = !!wallet

  // Generate random card preview
  const generateCard = async () => {
    setIsGenerating(true)
    setError(null)
    
    try {
      const preview = await getRandomCardPreview()
      
      if (preview) {
        setCurrentCard(preview)
        // Extract wave from description
        const waveMatch = preview.description.match(/(red|orange|yellow|green|blue|purple) wave/i)
        const wave = waveMatch ? waveMatch[1].toLowerCase() as WaveType : 
          ['red', 'orange', 'yellow', 'green', 'blue', 'purple'][Math.floor(Math.random() * 6)] as WaveType
        setCurrentWave(wave)
      } else {
        // Fallback preview
        setCurrentCard({
          name: 'Random Program',
          description: 'A randomly generated program from the digital realm.',
          lore: 'This program awaits minting to reveal its true nature.',
          rarity: 'common',
          powerRating: 0,
          dominantStat: 'unknown',
          imageUrl: '/placeholder-card.svg'
        })
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate card')
    } finally {
      setIsGenerating(false)
    }
  }

  // Fetch collection info
  const fetchCollectionInfo = async (retryCount = 0) => {
    try {
      const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'https://cryptoarena-backend.onrender.com'
      const response = await fetch(`${backendUrl}/api/v1/nft/collection/info`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        signal: AbortSignal.timeout(10000)
      })
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }
      
      const data = await response.json()
      
      if (data.success) {
        setCollectionInfo(data.data)
        setError(null)
      } else {
        throw new Error(data.error || 'Unknown backend error')
      }
    } catch (err: any) {
      console.error('Collection info error:', err)
      
      if (retryCount < 2 && (err.name === 'AbortError' || err.message.includes('fetch'))) {
        setTimeout(() => fetchCollectionInfo(retryCount + 1), 2000)
        return
      }
      
      let errorMessage = 'Failed to load collection info'
      if (err.name === 'AbortError') {
        errorMessage = 'Request timed out. Backend may be sleeping - please wait 30 seconds and try again.'
      } else if (err.message) {
        errorMessage = `Failed to load collection: ${err.message}`
      }
      
      setError(errorMessage)
    }
  }

  // Prepare mint transaction
  const prepareMint = async () => {
    if (!address) return

    try {
      setLoading(true)
      setError(null)

      const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'https://cryptoarena-backend.onrender.com'
      const response = await fetch(`${backendUrl}/api/v1/nft/mint`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userAddress: address }),
        signal: AbortSignal.timeout(15000)
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()
      
      if (data.success) {
        setMintInfo(data.data)
      } else {
        setError('Failed to prepare mint: ' + (data.error || 'Unknown error'))
      }
    } catch (err: any) {
      console.error('Mint preparation error:', err)
      
      let errorMessage = 'Error preparing mint transaction'
      if (err.name === 'AbortError') {
        errorMessage = 'Mint request timed out. Backend may be sleeping - please wait 30 seconds and try again.'
      } else if (err.message) {
        errorMessage = `Mint preparation failed: ${err.message}`
      }
      
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  // Execute mint transaction
  const executeMint = async () => {
    if (!tonConnectUI || !mintInfo || !address) return

    try {
      setLoading(true)
      setError(null)
      setSuccess(null)

      const mintPayload = beginCell()
        .storeUint(0x2001, 32) // op::mint_card operation
        .storeUint(0, 64) // query_id
        .storeAddress(Address.parse(address)) // recipient address
        .endCell()
        .toBoc()
        .toString('base64')

      const transaction = {
        validUntil: Date.now() + 5 * 60 * 1000,
        messages: [
          {
            address: mintInfo.collectionAddress,
            amount: toNano(mintInfo.mintValue).toString(),
            payload: mintPayload,
          },
        ],
      }

      try {
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => {
            reject(new Error('TON Connect transaction timeout after 20 seconds'))
          }, 20000)
        })
        
        const result = await Promise.race([
          tonConnectUI.sendTransaction(transaction),
          timeoutPromise
        ]) as any
        
        if (result && result.boc) {
          setSuccess(`✅ Mint transaction sent! Your NFT card #${mintInfo.nextItemIndex} is being created.`)
          setMintInfo(null)
          
          // Save NFT to Supabase after successful minting
          setTimeout(async () => {
            await fetchCollectionInfo()
            
            // Sync NFT to database
            try {
              const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'https://cryptoarena-backend.onrender.com'
              const syncResponse = await fetch(`${backendUrl}/api/v1/nft/sync/${mintInfo.nextItemIndex}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' }
              })
              
              if (syncResponse.ok) {
                const syncData = await syncResponse.json()
                if (syncData.success) {
                  console.log('NFT synced to database:', syncData.data)
                }
              }
            } catch (syncError) {
              console.error('Failed to sync NFT to database:', syncError)
            }
          }, 8000)
          return
        }
      } catch (tonConnectError) {
        console.warn('TON Connect failed:', tonConnectError)
        
        const tonAmount = toNano(mintInfo.mintValue).toString()
        const simpleTonLink = `ton://transfer/${mintInfo.collectionAddress}?amount=${tonAmount}&text=mint`
        
        setSuccess(
          `⚠️ TON Connect timed out, use direct wallet method:\n` +
          `💎 Card #${mintInfo.nextItemIndex} • 💰 ${mintInfo.mintValue} TON`
        )
        
        window.open(simpleTonLink, '_blank')
        
        setTimeout(() => {
          setMintInfo(null)
          fetchCollectionInfo()
        }, 20000)
        
        return
      }

      throw new Error('Transaction was not confirmed')

    } catch (err: any) {
      let errorMessage = 'Failed to prepare mint transaction'
      
      if (err?.message?.includes('User cancelled') || err?.message?.includes('User rejected')) {
        errorMessage = 'Transaction cancelled by user'
      } else if (err?.message) {
        errorMessage = err.message
      }
      
      setError(errorMessage)
      console.error('Mint execution error:', err)
    } finally {
      setLoading(false)
    }
  }

  // Load initial data
  useEffect(() => {
    fetchCollectionInfo()
    generateCard()
  }, [])

  const getRarityColorClass = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'from-gray-400 via-gray-600 to-gray-800'
      case 'rare': return 'from-blue-400 via-blue-600 to-blue-800'
      case 'epic': return 'from-purple-400 via-purple-600 to-purple-800'
      case 'legendary': return 'from-yellow-400 via-yellow-600 to-yellow-800'
      default: return 'from-gray-400 via-gray-600 to-gray-800'
    }
  }

  if (!connected) {
    return (
      <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Create NFT Card</h2>
          <p className="text-white/80 mb-4">Connect your wallet to create NFT cards</p>
          <button
            disabled
            className="px-4 py-2 bg-gray-600 text-gray-400 rounded-lg cursor-not-allowed"
          >
            Connect Wallet First
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
      <div className="text-center mb-6">
        <h2 className="text-3xl font-bold text-white mb-4">Create NFT Card</h2>
        
        {/* Collection Status */}
        {collectionInfo && (
          <div className="inline-flex items-center gap-4 text-sm text-white/80 mb-4">
            <span>Total Minted: <span className="font-bold text-white">{collectionInfo.totalMinted}</span></span>
            <span>Next Card: <span className="font-bold text-white">#{collectionInfo.nextItemIndex}</span></span>
            <span className={`px-2 py-1 rounded ${
              collectionInfo.state === 'active' 
                ? 'bg-green-500/20 text-green-300' 
                : 'bg-red-500/20 text-red-300'
            }`}>
              {collectionInfo.state}
            </span>
          </div>
        )}
        
        <button
          onClick={generateCard}
          disabled={isGenerating}
          className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 disabled:from-gray-500 disabled:to-gray-600 text-white font-bold py-3 px-8 rounded-lg transition-all duration-200 transform hover:scale-105 disabled:scale-100"
        >
          {isGenerating ? 'Generating...' : '🎲 Generate Random Preview'}
        </button>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-500/20 border border-red-500/30 rounded-lg">
          <p className="text-red-400">{error}</p>
        </div>
      )}

      {success && (
        <div className="mb-6 p-4 bg-green-500/20 border border-green-500/30 rounded-lg">
          <p className="text-green-400 whitespace-pre-line">{success}</p>
        </div>
      )}

      {currentCard && (
        <div className="flex flex-col lg:flex-row gap-6 items-center">
          {/* Card Preview */}
          <div className={`relative p-1 rounded-xl bg-gradient-to-b ${getRarityColorClass(currentCard.rarity)}`}>
            <div className="bg-gray-900 rounded-lg p-4 min-w-[300px]">
              <div className="text-center mb-4">
                <h3 className={`text-lg font-bold ${getRarityColor(currentCard.rarity)} capitalize`}>
                  {currentCard.name}
                </h3>
                <div className="flex justify-center items-center gap-2 mt-2">
                  <span className={`text-xs px-2 py-1 rounded ${getRarityColor(currentCard.rarity)} bg-gray-800 border border-current`}>
                    {currentCard.rarity.toUpperCase()}
                  </span>
                  <span className="text-xs text-gray-400">
                    Power: {currentCard.powerRating}
                  </span>
                </div>
              </div>
              
              <div className="relative w-full h-48 mb-4 rounded-lg overflow-hidden bg-gray-800">
                <Image
                  src={currentCard.imageUrl}
                  alt={currentCard.name}
                  fill
                  className="object-cover"
                  unoptimized
                />
                {/* Wave indicator */}
                <div className="absolute top-2 right-2">
                  <Image
                    src={getWaveImageUrl(currentWave)}
                    alt={currentWave}
                    width={24}
                    height={24}
                    className="rounded-full border border-white/30"
                  />
                </div>
              </div>

              <div className="mt-4 text-center">
                <div className={`inline-block px-3 py-1 rounded-full text-sm font-bold ${getWaveColor(currentWave)} bg-gray-800 border border-current`}>
                  {currentWave.toUpperCase()} WAVE
                </div>
              </div>

              <div className="mt-4 p-3 bg-yellow-900/20 border border-yellow-500/30 rounded">
                <p className="text-yellow-400 text-xs text-center">
                  ⚠️ Preview Only - Real stats generated in contract
                </p>
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

            {/* Mint Info */}
            {mintInfo && (
              <div className="bg-yellow-500/20 border border-yellow-500/30 rounded-lg p-4 mb-4">
                <h4 className="text-sm font-bold text-yellow-400 mb-2">READY TO MINT</h4>
                <div className="space-y-1 text-sm text-yellow-300">
                  <p>Card #: <span className="font-bold">{mintInfo.nextItemIndex}</span></p>
                  <p>Cost: <span className="font-bold">{mintInfo.mintValue} TON</span></p>
                  <p>Recipient: <span className="font-mono text-xs">{address.slice(0, 8)}...{address.slice(-8)}</span></p>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="mt-6 space-y-3">
              {!mintInfo ? (
                <button
                  onClick={prepareMint}
                  disabled={loading || !collectionInfo || collectionInfo.state !== 'active'}
                  className="w-full bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 disabled:from-gray-500 disabled:to-gray-600 text-white font-bold py-3 px-6 rounded-lg transition-all duration-200 transform hover:scale-105 disabled:scale-100"
                >
                  {loading ? '⏳ Preparing...' : '🚀 Prepare NFT Mint'}
                </button>
              ) : (
                <>
                  <button
                    onClick={executeMint}
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 disabled:from-gray-500 disabled:to-gray-600 text-white font-bold py-3 px-6 rounded-lg transition-all duration-200 transform hover:scale-105 disabled:scale-100"
                  >
                    {loading ? '⏳ Sending...' : `💎 Mint Card #${mintInfo.nextItemIndex} (${mintInfo.mintValue} TON)`}
                  </button>
                  <button
                    onClick={() => setMintInfo(null)}
                    className="w-full bg-gray-600 hover:bg-gray-700 text-white py-2 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                </>
              )}
            </div>

            {/* Manual Method */}
            {mintInfo && (
              <div className="mt-4 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                <h4 className="text-sm font-bold text-yellow-400 mb-2">🛠️ Manual Method (if automatic fails):</h4>
                <div className="space-y-1 text-xs text-yellow-300">
                  <p>1. Open Tonkeeper</p>
                  <p>2. Send to: <span className="font-mono">{mintInfo.collectionAddress.slice(0, 10)}...</span></p>
                  <p>3. Amount: {mintInfo.mintValue} TON</p>
                  <p>4. Comment: mint</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}