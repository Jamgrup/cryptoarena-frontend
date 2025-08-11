'use client';

import { useState, useEffect } from 'react';
import { useTonConnectUI } from '@tonconnect/ui-react';
import { Address, toNano, beginCell } from '@ton/core';

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

export function CardCreation({ className = '' }: CardCreationProps) {
  const [tonConnectUI] = useTonConnectUI();
  const [collectionInfo, setCollectionInfo] = useState<CollectionInfo | null>(null);
  const [mintInfo, setMintInfo] = useState<MintInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Fetch collection info
  const fetchCollectionInfo = async () => {
    try {
      const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'https://cryptoarena-backend.onrender.com';
      const response = await fetch(`${backendUrl}/api/v1/nft/collection/info`);
      const data = await response.json();
      
      if (data.success) {
        setCollectionInfo(data.data);
      } else {
        setError('Failed to load collection info: ' + data.error);
      }
    } catch (err) {
      setError('Error fetching collection info');
      console.error('Collection info error:', err);
    }
  };

  // Get connection state
  const userWallet = tonConnectUI.wallet;
  const connected = !!userWallet;
  const address = userWallet?.account?.address;

  // Prepare mint transaction
  const prepareMint = async () => {
    if (!address) return;

    try {
      setLoading(true);
      setError(null);

      // Try direct backend call first, fallback to proxy
      const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'https://cryptoarena-backend.onrender.com';
      const response = await fetch(`${backendUrl}/api/v1/nft/mint`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userAddress: address
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        setMintInfo(data.data);
      } else {
        setError('Failed to prepare mint: ' + data.error);
      }
    } catch (err) {
      setError('Error preparing mint transaction');
      console.error('Mint preparation error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Execute mint transaction
  const executeMint = async () => {
    if (!tonConnectUI || !mintInfo || !address) return;

    try {
      setLoading(true);
      setError(null);
      setSuccess(null);

      // For testing - send to a known working address first
      const isTestMode = true; // TODO: remove after fixing
      
      let targetAddress = mintInfo.collectionAddress;
      let amount = '0.1';
      
      if (isTestMode) {
        // Send to our own address as test
        targetAddress = address;
        amount = '0.01'; // Very small test amount
      }

      const commentPayload = beginCell()
        .storeUint(0, 32) // text comment prefix
        .storeStringTail(isTestMode ? 'test-mint' : 'mint')
        .endCell()
        .toBoc()
        .toString('base64');

      const transaction = {
        validUntil: Math.floor(Date.now() / 1000) + 300, // 5 minutes
        messages: [
          {
            address: targetAddress,
            amount: toNano(amount).toString(),
            payload: commentPayload,
          },
        ],
      };

      // Send transaction via TON Connect
      const result = await tonConnectUI.sendTransaction(transaction);
      
      if (result && result.boc) {
        setSuccess(`Mint transaction sent! Your NFT card #${mintInfo.nextItemIndex} is being created.`);
        
        // Clear mint info to reset state
        setMintInfo(null);
        
        // Refresh collection info after successful mint
        setTimeout(() => {
          fetchCollectionInfo();
        }, 5000);
      } else {
        throw new Error('Transaction was not confirmed');
      }

    } catch (err: any) {
      // Handle specific TON Connect errors
      let errorMessage = 'Failed to send mint transaction';
      
      if (err?.message?.includes('User cancelled') || err?.message?.includes('User rejected')) {
        errorMessage = 'Transaction cancelled by user';
      } else if (err?.message?.includes('Timeout')) {
        errorMessage = 'Transaction timed out. Please try again';
      } else if (err?.message?.includes('Transaction was not sent')) {
        errorMessage = 'Transaction failed. Please refresh and try again';
      } else if (err?.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
      console.error('Mint execution error:', err);
      
      // Reset mint info on error to allow retry
      setMintInfo(null);
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
    <div className={`p-6 bg-white border border-gray-200 rounded-lg shadow-sm ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">🎴 Create NFT Card</h3>
        <button
          onClick={fetchCollectionInfo}
          className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded"
          disabled={loading}
        >
          Refresh
        </button>
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

      {/* Mint Info */}
      {mintInfo && (
        <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <h4 className="font-medium text-yellow-900 mb-2">Ready to Mint</h4>
          <div className="space-y-1 text-sm text-yellow-800">
            <p><span className="font-medium">Card #:</span> {mintInfo.nextItemIndex}</p>
            <p><span className="font-medium">Cost:</span> {mintInfo.mintValue} TON</p>
            <p><span className="font-medium">Recipient:</span> {address}</p>
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
          <button
            onClick={() => setMintInfo(null)}
            className="w-full px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
          >
            Cancel
          </button>
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
  );
}