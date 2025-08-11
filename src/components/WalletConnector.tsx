'use client'

import { useEffect } from 'react'
import { TonConnectButton, useTonConnectUI, useTonWallet } from '@tonconnect/ui-react'

interface WalletConnectorProps {
  onConnectionChange: (connected: boolean) => void
}

export function WalletConnector({ onConnectionChange }: WalletConnectorProps) {
  const [tonConnectUI] = useTonConnectUI()
  const wallet = useTonWallet()

  useEffect(() => {
    onConnectionChange(!!wallet)
  }, [wallet, onConnectionChange])

  return (
    <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">
            Connect Wallet
          </h2>
          <p className="text-white/70">
            {wallet 
              ? `Connected: ${wallet.account.address.slice(0, 8)}...${wallet.account.address.slice(-8)}`
              : 'Connect your TON wallet to start creating NFT cards'
            }
          </p>
        </div>
        <div className="ml-4">
          <TonConnectButton />
        </div>
      </div>
      
      {wallet && (
        <div className="mt-4 p-4 bg-green-500/20 rounded-lg border border-green-500/30">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-green-400 font-medium">Wallet Connected</span>
          </div>
        </div>
      )}
    </div>
  )
}