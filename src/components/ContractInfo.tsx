'use client';

import { useState } from 'react';

interface ContractInfoProps {
  className?: string;
}

export function ContractInfo({ className = '' }: ContractInfoProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const contractAddresses = {
    cardCollection: process.env.NEXT_PUBLIC_CARD_COLLECTION_ADDRESS || 'EQAmF_vjlPeNFlFVo3lH4iDW9nMIk0dO6B5vraws49glCRzT',
    gemToken: process.env.NEXT_PUBLIC_GEM_TOKEN_ADDRESS || 'EQBpuui3XPoorUc45MNZ9809LCa3nz9YTqDhMOgCNBvkJYeg',
  };

  const network = process.env.NEXT_PUBLIC_TON_NETWORK || 'testnet';
  const explorerUrl = process.env.NEXT_PUBLIC_TON_EXPLORER_URL || 'https://testnet.tonscan.org';

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className={`bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 ${className}`}>
      <div 
        className="p-4 cursor-pointer flex justify-between items-center"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <h3 className="text-lg font-semibold text-white">Contract Information</h3>
        <span className={`text-white transition-transform ${isExpanded ? 'rotate-180' : ''}`}>
          ▼
        </span>
      </div>

      {isExpanded && (
        <div className="px-4 pb-4 space-y-4">
          {/* Network Info */}
          <div className="bg-white/5 rounded-lg p-3">
            <div className="text-cyan-400 font-bold text-sm mb-2">NETWORK</div>
            <div className="flex items-center justify-between">
              <span className="text-white capitalize">{network}</span>
              <span className={`px-2 py-1 rounded text-xs ${
                network === 'mainnet' ? 'bg-green-600' : 'bg-yellow-600'
              } text-white`}>
                {network === 'mainnet' ? 'LIVE' : 'TEST'}
              </span>
            </div>
          </div>

          {/* Contract Addresses */}
          <div className="space-y-3">
            <div className="bg-white/5 rounded-lg p-3">
              <div className="text-cyan-400 font-bold text-sm mb-2">CARD COLLECTION V8</div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-white font-mono text-xs">
                    {contractAddresses.cardCollection.slice(0, 12)}...{contractAddresses.cardCollection.slice(-8)}
                  </span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => copyToClipboard(contractAddresses.cardCollection)}
                      className="text-blue-400 hover:text-blue-300 text-xs"
                    >
                      📋
                    </button>
                    <a
                      href={`${explorerUrl}/address/${contractAddresses.cardCollection}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-400 hover:text-blue-300 text-xs"
                    >
                      🔗
                    </a>
                  </div>
                </div>
                <div className="text-white/60 text-xs">
                  • Mint Cost: 0.445 TON (31% optimized)
                  <br />
                  • Base Cost: 0.4 TON + Platform Fee: 25%
                </div>
              </div>
            </div>

            <div className="bg-white/5 rounded-lg p-3">
              <div className="text-cyan-400 font-bold text-sm mb-2">GEM TOKEN</div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-white font-mono text-xs">
                    {contractAddresses.gemToken.slice(0, 12)}...{contractAddresses.gemToken.slice(-8)}
                  </span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => copyToClipboard(contractAddresses.gemToken)}
                      className="text-blue-400 hover:text-blue-300 text-xs"
                    >
                      📋
                    </button>
                    <a
                      href={`${explorerUrl}/address/${contractAddresses.gemToken}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-400 hover:text-blue-300 text-xs"
                    >
                      🔗
                    </a>
                  </div>
                </div>
                <div className="text-white/60 text-xs">
                  In-game currency for upgrades and purchases
                </div>
              </div>
            </div>
          </div>

          {/* Features */}
          <div className="bg-white/5 rounded-lg p-3">
            <div className="text-cyan-400 font-bold text-sm mb-2">FEATURES</div>
            <div className="space-y-1 text-white/80 text-xs">
              <div>✅ NFT Card Creation & Trading</div>
              <div>✅ Dynamic Images System (14+ images)</div>
              <div>✅ Add Images Without Contract Changes</div>
              <div>✅ Automatic Image Selection by Hash</div>
              <div>✅ Real-time Card Updates</div>
              <div>✅ User Profile Management</div>
              <div>✅ Gas Optimized Contracts</div>
              <div>🚧 Marketplace (Coming Soon)</div>
              <div>🚧 Staking & Raids (Coming Soon)</div>
            </div>
          </div>

          {/* Version Info */}
          <div className="bg-white/5 rounded-lg p-3">
            <div className="text-cyan-400 font-bold text-sm mb-2">VERSION INFO</div>
            <div className="space-y-1 text-white/80 text-xs">
              <div>Contract Version: V8 (Dynamic Images System)</div>
              <div>Frontend: Next.js 14 + Supabase</div>
              <div>Backend: Express.js + TON Integration</div>
              <div>Images: Dynamic loading from Storage</div>
              <div>Deployed: {new Date('2025-08-15').toLocaleDateString()}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}