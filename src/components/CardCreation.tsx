'use client';

import { useState, useEffect } from 'react';
import { useTonConnectUI, useTonAddress, useTonWallet } from '@tonconnect/ui-react';
import { Address, toNano, beginCell } from '@ton/core';
import { NFTCardPreview } from './NFTCardPreview';

interface CardCreationProps {
  className?: string;
}

interface CollectionInfo {
  address: string;
  name: string;
  nextItemIndex: string;
  totalMinted: string;
  state: string;
}

interface MintInfo {
  collectionAddress: string;
  recipientAddress: string;
  nextItemIndex: string;
  mintValue: string;
  instructions: string[];
}

type WaveType = 'red' | 'orange' | 'yellow' | 'green' | 'blue' | 'purple';

interface GeneratedCardMetadata {
  name: string;
  description: string;
  lore: string;
  rarity: string;
  powerRating: number;
  dominantStat: string;
  imageUrl: string;
  waveImageUrl: string;
}

interface RealNFTData {
  index: string;
  address: string;
  attributes: {
    wave: WaveType;
    level: number;
    physical_damage: number;
    magic_damage: number;
    physical_armor: number;
    magic_armor: number;
    attack_speed: number;
    accuracy: number;
    evasion: number;
    crit_chance: number;
  };
  metadata: {
    name: string;
    description: string;
    lore: string;
    rarity: string;
    powerRating: number;
  };
}

export function CardCreation({ className = '' }: CardCreationProps) {
  const [tonConnectUI] = useTonConnectUI();
  const wallet = useTonWallet();
  const address = useTonAddress();
  const [collectionInfo, setCollectionInfo] = useState<CollectionInfo | null>(null);
  const [mintInfo, setMintInfo] = useState<MintInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // Preview state
  const [previewWave, setPreviewWave] = useState<WaveType | null>(null);
  const [previewMetadata, setPreviewMetadata] = useState<GeneratedCardMetadata | null>(null);
  const [showPreview, setShowPreview] = useState(true);
  
  // Real NFT state
  const [realNFT, setRealNFT] = useState<RealNFTData | null>(null);
  const [loadingRealNFT, setLoadingRealNFT] = useState(false);

  // Fetch collection info with retry logic
  const fetchCollectionInfo = async (retryCount = 0) => {
    try {
      const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'https://cryptoarena-backend.onrender.com';
      console.log('Fetching collection info from:', `${backendUrl}/api/v1/nft/collection/info`);
      
      const response = await fetch(`${backendUrl}/api/v1/nft/collection/info`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        // Add timeout
        signal: AbortSignal.timeout(10000) // 10 second timeout
      });
      
      console.log('Collection response status:', response.status);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('Collection response data:', data);
      
      if (data.success) {
        setCollectionInfo(data.data);
        setError(null); // Clear any previous errors
      } else {
        throw new Error(data.error || 'Unknown backend error');
      }
    } catch (err: any) {
      console.error('Collection info error:', err);
      
      // Retry logic for network errors
      if (retryCount < 2 && (err.name === 'AbortError' || err.message.includes('fetch'))) {
        console.log(`Retrying collection info fetch... (attempt ${retryCount + 2}/3)`);
        setTimeout(() => fetchCollectionInfo(retryCount + 1), 2000);
        return;
      }
      
      // Set user-friendly error message
      let errorMessage = 'Failed to load collection info';
      if (err.name === 'AbortError') {
        errorMessage = 'Request timed out. Backend may be sleeping - please wait 30 seconds and try again.';
      } else if (err.message.includes('500')) {
        errorMessage = 'Backend server error. Please try again in a moment.';
      } else if (err.message) {
        errorMessage = `Failed to load collection info: ${err.message}`;
      }
      
      setError(errorMessage);
    }
  };

  // Get connection state using recommended hooks
  const connected = !!wallet;

  // Handle preview generation
  const handlePreviewGenerated = (wave: WaveType, metadata: GeneratedCardMetadata) => {
    setPreviewWave(wave);
    setPreviewMetadata(metadata);
  };

  // Fetch real NFT data after minting
  const fetchRealNFTData = async (cardIndex: string) => {
    try {
      setLoadingRealNFT(true);
      
      const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'https://cryptoarena-backend.onrender.com';
      const response = await fetch(`${backendUrl}/api/v1/nft/card/${cardIndex}/metadata`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        signal: AbortSignal.timeout(15000)
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      if (data.success) {
        const realData: RealNFTData = {
          index: cardIndex,
          address: data.data.nftAddress,
          attributes: data.data.attributes,
          metadata: {
            name: data.data.name,
            description: data.data.description,
            lore: data.data.lore,
            rarity: data.data.rarity,
            powerRating: data.data.powerRating
          }
        };
        
        setRealNFT(realData);
        return realData;
      } else {
        throw new Error(data.error || 'Failed to fetch NFT data');
      }
    } catch (error) {
      console.error('Error fetching real NFT data:', error);
      return null;
    } finally {
      setLoadingRealNFT(false);
    }
  };

  // Prepare mint transaction
  const prepareMint = async () => {
    if (!address) return;

    try {
      setLoading(true);
      setError(null);

      // Try direct backend call
      const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'https://cryptoarena-backend.onrender.com';
      const mintUrl = `${backendUrl}/api/v1/nft/mint`;
      console.log('Preparing mint for:', address);
      console.log('Mint URL:', mintUrl);
      
      const response = await fetch(mintUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userAddress: address
        }),
        // Add timeout
        signal: AbortSignal.timeout(15000) // 15 second timeout
      });

      console.log('Mint response status:', response.status);
      console.log('Mint response headers:', Object.fromEntries(response.headers.entries()));
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('Mint response data:', data);
      
      if (data.success) {
        setMintInfo(data.data);
      } else {
        setError('Failed to prepare mint: ' + (data.error || 'Unknown error'));
      }
    } catch (err: any) {
      console.error('Mint preparation error:', err);
      
      let errorMessage = 'Error preparing mint transaction';
      if (err.name === 'AbortError') {
        errorMessage = 'Mint request timed out. Backend may be sleeping - please wait 30 seconds and try again.';
      } else if (err.message.includes('500')) {
        errorMessage = 'Backend server error during mint preparation.';
      } else if (err.message.includes('CORS')) {
        errorMessage = 'Network access issue. Please try again.';
      } else if (err.message) {
        errorMessage = `Mint preparation failed: ${err.message}`;
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Execute mint transaction with fallback methods
  const executeMint = async () => {
    if (!tonConnectUI || !mintInfo || !address) return;

    try {
      setLoading(true);
      setError(null);
      setSuccess(null);

      // Create proper mint payload for Card Collection contract
      const mintPayload = beginCell()
        .storeUint(0x2001, 32) // op::mint_card operation
        .storeUint(0, 64) // query_id
        .storeAddress(Address.parse(address)) // recipient address
        .endCell()
        .toBoc()
        .toString('base64');

      const transaction = {
        validUntil: Date.now() + 5 * 60 * 1000, // 5 minutes in milliseconds (official format)
        messages: [
          {
            address: mintInfo.collectionAddress,
            amount: toNano(mintInfo.mintValue).toString(),
            payload: mintPayload,
          },
        ],
      };

      // Try TON Connect with timeout to avoid hanging
      try {
        console.log('Attempting TON Connect transaction with timeout...');
        
        // Create timeout promise
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => {
            reject(new Error('TON Connect transaction timeout after 20 seconds'));
          }, 20000); // 20 second timeout
        });
        
        // Race between transaction and timeout
        const result = await Promise.race([
          tonConnectUI.sendTransaction(transaction),
          timeoutPromise
        ]) as any;
        
        if (result && result.boc) {
          setSuccess(`✅ Mint transaction sent! Your NFT card #${mintInfo.nextItemIndex} is being created.`);
          setMintInfo(null);
          
          // Fetch real NFT data after a delay
          setTimeout(async () => {
            await fetchCollectionInfo();
            await fetchRealNFTData(mintInfo.nextItemIndex);
          }, 8000); // 8 seconds delay for contract processing
          return;
        }
      } catch (tonConnectError) {
        console.warn('TON Connect failed (timeout or error), using fallback:', tonConnectError);
        
        // Fallback: Create ton:// deep link with simple payload
        const tonAmount = toNano(mintInfo.mintValue).toString();
        
        // Try simple comment-based transaction for testnet
        const simpleTonLink = `ton://transfer/${mintInfo.collectionAddress}?amount=${tonAmount}&text=mint`;
        
        setSuccess(
          `⚠️ TON Connect timed out, using direct wallet method...\n\n` +
          `💎 Minting Card #${mintInfo.nextItemIndex}\n` +
          `💰 Cost: ${mintInfo.mintValue} TON\n\n` +
          `🔗 Opening Tonkeeper with simplified transaction...\n` +
          `If it doesn't work, use manual method below.`
        );
        
        // Try to open the simplified link
        try {
          window.open(simpleTonLink, '_blank');
          console.log('Opening simplified ton:// link:', simpleTonLink);
        } catch (linkError) {
          console.warn('Failed to open ton:// link:', linkError);
        }
        
        // Reset state after user has time to complete transaction
        setTimeout(() => {
          setMintInfo(null);
          fetchCollectionInfo();
        }, 20000);
        
        return;
      }

      throw new Error('Transaction was not confirmed');

    } catch (err: any) {
      // Handle errors
      let errorMessage = 'Failed to prepare mint transaction';
      
      if (err?.message?.includes('User cancelled') || err?.message?.includes('User rejected')) {
        errorMessage = 'Transaction cancelled by user';
      } else if (err?.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage + '. Please try the manual method below.');
      console.error('Mint execution error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Load collection info on component mount
  useEffect(() => {
    fetchCollectionInfo();
  }, []);

  if (!connected) {
    return (
      <div className={`p-6 bg-gray-50 border border-gray-200 rounded-lg ${className}`}>
        <div className="text-center">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Create NFT Card</h3>
          <p className="text-gray-600 mb-4">Connect your wallet to create NFT cards</p>
          <button
            disabled
            className="px-4 py-2 bg-gray-300 text-gray-500 rounded-lg cursor-not-allowed"
          >
            Connect Wallet First
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* NFT Card Preview */}
      {showPreview && (
        <NFTCardPreview 
          onPreviewGenerated={handlePreviewGenerated}
          className="mb-6"
        />
      )}

      {/* Card Creation Panel */}
      <div className="p-6 bg-white border border-gray-200 rounded-lg shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">🎴 Create NFT Card</h3>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowPreview(!showPreview)}
              className="px-3 py-1 text-sm bg-purple-100 hover:bg-purple-200 text-purple-700 rounded"
            >
              {showPreview ? 'Hide' : 'Show'} Preview
            </button>
            <button
              onClick={() => fetchCollectionInfo()}
              className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded"
              disabled={loading}
            >
              Refresh
            </button>
          </div>
        </div>

      {/* Collection Info */}
      {collectionInfo && (
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h4 className="font-medium text-blue-900 mb-2">Collection Status</h4>
          <div className="space-y-1 text-sm text-blue-800">
            <p><span className="font-medium">Name:</span> {collectionInfo.name}</p>
            <p><span className="font-medium">Total Minted:</span> {collectionInfo.totalMinted}</p>
            <p><span className="font-medium">Next Card #:</span> {collectionInfo.nextItemIndex}</p>
            <p><span className="font-medium">Status:</span> 
              <span className={`ml-1 px-2 py-0.5 rounded text-xs ${
                collectionInfo.state === 'active' 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              }`}>
                {collectionInfo.state}
              </span>
            </p>
          </div>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-800 text-sm">{error}</p>
        </div>
      )}

      {/* Success Display */}
      {success && (
        <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-green-800 text-sm">{success}</p>
        </div>
      )}

      {/* Preview Info */}
      {previewMetadata && !realNFT && (
        <div className="mb-6 p-4 bg-purple-50 border border-purple-200 rounded-lg">
          <h4 className="font-medium text-purple-900 mb-2">💎 Preview (Random)</h4>
          <div className="flex items-center gap-4">
            <img
              src={previewMetadata.imageUrl}
              alt={previewMetadata.name}
              className="w-16 h-16 object-cover rounded border"
              onError={(e) => {
                (e.target as HTMLImageElement).src = '/placeholder-card.svg';
              }}
            />
            <div className="space-y-1 text-sm text-purple-800 flex-1">
              <p><span className="font-medium">Name:</span> {previewMetadata.name}</p>
              <div className="flex items-center gap-2">
                <span className={`px-2 py-0.5 text-xs rounded font-medium ${
                  previewMetadata.rarity === 'legendary' ? 'bg-yellow-100 text-yellow-700' :
                  previewMetadata.rarity === 'epic' ? 'bg-purple-100 text-purple-700' :
                  previewMetadata.rarity === 'rare' ? 'bg-blue-100 text-blue-700' :
                  'bg-gray-100 text-gray-700'
                }`}>
                  {previewMetadata.rarity?.toUpperCase() || 'UNKNOWN'}
                </span>
                {previewMetadata.powerRating > 0 && (
                  <span className="px-2 py-0.5 text-xs bg-green-100 text-green-700 rounded font-medium">
                    Power: {previewMetadata.powerRating}
                  </span>
                )}
              </div>
              <p className="text-xs text-purple-600 italic">Preview only - real stats generated in contract</p>
              {previewWave && (
                <p><span className="font-medium">Wave:</span> {previewWave}</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Real NFT Data */}
      {realNFT && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <h4 className="font-medium text-green-900 mb-2">🎉 Your New NFT Card!</h4>
          <div className="space-y-3">
            <div className="flex items-center gap-4">
              <div className="relative">
                <img
                  src={previewMetadata?.waveImageUrl || '/placeholder-card.svg'}
                  alt="Card"
                  className="w-16 h-16 object-cover rounded border"
                />
                <span className="absolute -top-1 -right-1 text-xs bg-green-600 text-white px-1 rounded">
                  #{realNFT.index}
                </span>
              </div>
              <div className="space-y-1 text-sm text-green-800 flex-1">
                <p><span className="font-medium">Name:</span> {realNFT.metadata.name}</p>
                <p><span className="font-medium">Rarity:</span> {realNFT.metadata.rarity}</p>
                <p><span className="font-medium">Power:</span> {realNFT.metadata.powerRating}</p>
                <p><span className="font-medium">Wave:</span> {realNFT.attributes.wave} • <span className="font-medium">Level:</span> {realNFT.attributes.level}</p>
              </div>
            </div>
            
            {/* Real Stats */}
            <div className="bg-green-100 p-3 rounded">
              <h5 className="font-medium text-green-900 mb-2">📊 Actual Stats</h5>
              <div className="grid grid-cols-2 gap-2 text-xs text-green-800">
                <div>Phys Damage: {realNFT.attributes.physical_damage}</div>
                <div>Magic Damage: {realNFT.attributes.magic_damage}</div>
                <div>Attack Speed: {realNFT.attributes.attack_speed}</div>
                <div>Accuracy: {realNFT.attributes.accuracy}</div>
                <div>Evasion: {realNFT.attributes.evasion}</div>
                <div>Phys Armor: {realNFT.attributes.physical_armor}</div>
                <div>Magic Armor: {realNFT.attributes.magic_armor}</div>
                <div>Crit Chance: {realNFT.attributes.crit_chance}</div>
              </div>
            </div>
            
            <div className="flex gap-2">
              <a 
                href={`https://testnet.tonscan.org/address/${realNFT.address}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700"
              >
                View on Explorer
              </a>
              <button
                onClick={() => setRealNFT(null)}
                className="px-3 py-1 bg-gray-200 text-gray-700 text-xs rounded hover:bg-gray-300"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Loading Real NFT */}
      {loadingRealNFT && (
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center gap-3">
            <div className="animate-spin w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full"></div>
            <span className="text-blue-800 text-sm">Loading your NFT data from blockchain...</span>
          </div>
        </div>
      )}

      {/* Mint Info */}
      {mintInfo && (
        <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <h4 className="font-medium text-yellow-900 mb-2">Ready to Mint</h4>
          <div className="space-y-1 text-sm text-yellow-800">
            <p><span className="font-medium">Card #:</span> {mintInfo.nextItemIndex}</p>
            <p><span className="font-medium">Cost:</span> {mintInfo.mintValue} TON</p>
            <p><span className="font-medium">Recipient:</span> {address}</p>
            <p className="text-xs text-yellow-600 italic">Real stats and wave will be generated randomly in smart contract</p>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="space-y-3">
        {!mintInfo ? (
          <button
            onClick={prepareMint}
            disabled={loading || !collectionInfo || collectionInfo.state !== 'active'}
            className="w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors"
          >
            {loading ? 'Preparing...' : 'Prepare NFT Mint'}
          </button>
        ) : (
          <button
            onClick={executeMint}
            disabled={loading}
            className="w-full px-4 py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors"
          >
            {loading ? 'Sending...' : `Mint Card #${mintInfo.nextItemIndex} (${mintInfo.mintValue} TON)`}
          </button>
        )}

        {mintInfo && (
          <div className="space-y-2">
            <button
              onClick={() => setMintInfo(null)}
              className="w-full px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                const simpleTonLink = `ton://transfer/${mintInfo.collectionAddress}?amount=${toNano(mintInfo.mintValue).toString()}&text=mint`;
                window.open(simpleTonLink, '_blank');
                setSuccess(`🔗 Opening transaction in Tonkeeper...`);
              }}
              className="w-full px-4 py-2 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg transition-colors text-sm"
            >
              🚀 Try Direct Link (if hanging)
            </button>
          </div>
        )}
        
        {error && (
          <button
            onClick={() => {
              setError(null);
              setMintInfo(null);
              fetchCollectionInfo();
            }}
            className="w-full px-4 py-2 bg-yellow-100 hover:bg-yellow-200 text-yellow-700 rounded-lg transition-colors"
          >
            Retry Mint Process
          </button>
        )}
      </div>

      {/* Instructions */}
      {mintInfo && (
        <div className="mt-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
          <h4 className="font-medium text-gray-900 mb-2">Instructions:</h4>
          <ol className="list-decimal list-inside space-y-1 text-sm text-gray-700">
            {mintInfo.instructions.map((instruction, index) => (
              <li key={index}>{instruction}</li>
            ))}
          </ol>
        </div>
      )}

      {/* Manual Mint Method */}
      {mintInfo && (
        <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <h4 className="font-medium text-yellow-900 mb-2">🛠️ Manual Mint Method (if automatic fails):</h4>
          <div className="space-y-2 text-sm text-yellow-800">
            <p><span className="font-medium">1. Open Tonkeeper manually</span></p>
            <p><span className="font-medium">2. Send transaction:</span></p>
            <div className="bg-yellow-100 p-2 rounded text-xs font-mono break-all">
              <p><span className="font-medium">To:</span> {mintInfo.collectionAddress}</p>
              <p><span className="font-medium">Amount:</span> {mintInfo.mintValue} TON</p>
              <p><span className="font-medium">Comment:</span> mint</p>
            </div>
            <p><span className="font-medium">3. Wait 1-2 minutes for processing</span></p>
            <p><span className="font-medium">4. Check your wallet for new NFT card</span></p>
          </div>
        </div>
      )}

      {/* Developer Info */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <details className="text-sm text-gray-600">
          <summary className="cursor-pointer font-medium">Developer Info</summary>
          <div className="mt-2 space-y-1">
            <p><span className="font-medium">Connected:</span> {connected ? 'Yes' : 'No'}</p>
            <p><span className="font-medium">Wallet:</span> {address || 'None'}</p>
            {collectionInfo && (
              <p><span className="font-medium">Collection:</span> 
                <a 
                  href={`https://testnet.tonscan.org/address/${collectionInfo.address}`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="ml-1 text-blue-600 hover:underline"
                >
                  View on Explorer
                </a>
              </p>
            )}
          </div>
        </details>
      </div>
      </div>
    </div>
  );
}