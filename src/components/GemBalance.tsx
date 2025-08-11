'use client';

import { useState, useEffect } from 'react';
import { useTonConnectUI } from '@tonconnect/ui-react';
import { Address } from '@ton/core';

interface GemBalanceData {
  userAddress: string;
  walletAddress: string;
  balance: string;
  decimals: number;
  formatted: string;
}

export function GemBalance() {
  const [tonConnectUI] = useTonConnectUI();
  const [balance, setBalance] = useState<GemBalanceData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const userWallet = tonConnectUI.wallet;
  const isConnected = !!userWallet;
  const userAddress = userWallet?.account?.address;

  const fetchBalance = async () => {
    if (!userAddress) return;

    setLoading(true);
    setError(null);

    try {
      // Convert address to user-friendly format
      const address = Address.parse(userAddress).toString();
      
      const response = await fetch(`/api/gem/balance/${address}`);
      const data = await response.json();

      if (data.success) {
        setBalance(data.data);
      } else {
        setError(data.error || 'Failed to fetch balance');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Network error');
    } finally {
      setLoading(false);
    }
  };

  const refreshBalance = () => {
    fetchBalance();
  };

  useEffect(() => {
    if (isConnected && userAddress) {
      fetchBalance();
    } else {
      setBalance(null);
      setError(null);
    }
  }, [isConnected, userAddress]);

  if (!isConnected) {
    return (
      <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4 text-center">
        <p className="text-gray-600 dark:text-gray-400">
          Connect your wallet to see GEM balance
        </p>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-r from-yellow-400 to-orange-500 rounded-lg p-6 text-white">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold mb-2">💎 GEM Balance</h3>
          
          {loading ? (
            <div className="flex items-center space-x-2">
              <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
              <span>Loading...</span>
            </div>
          ) : error ? (
            <div className="text-red-200">
              <p className="text-sm">❌ {error}</p>
              <button 
                onClick={refreshBalance}
                className="mt-2 text-xs underline hover:no-underline"
              >
                Retry
              </button>
            </div>
          ) : balance ? (
            <div>
              <div className="text-2xl font-bold">
                {balance.formatted}
              </div>
              <div className="text-sm opacity-80">
                Raw: {balance.balance} units
              </div>
              <div className="text-xs opacity-60 mt-1">
                Wallet: {balance.walletAddress.slice(0, 6)}...{balance.walletAddress.slice(-4)}
              </div>
            </div>
          ) : (
            <div className="text-yellow-200">
              <p>No balance data</p>
            </div>
          )}
        </div>
        
        <div className="flex flex-col space-y-2">
          <button
            onClick={refreshBalance}
            disabled={loading}
            className="bg-white bg-opacity-20 hover:bg-opacity-30 px-3 py-1 rounded text-sm transition-colors disabled:opacity-50"
          >
            🔄 Refresh
          </button>
          
          {balance && (
            <div className="text-right text-xs">
              <div>Network: Testnet</div>
              <div>Decimals: {balance.decimals}</div>
            </div>
          )}
        </div>
      </div>

      {/* Contract Info */}
      <div className="mt-4 pt-4 border-t border-white border-opacity-20">
        <div className="text-xs opacity-80">
          <div>GEM Token Contract:</div>
          <div className="font-mono text-xs break-all">
            EQBpuui3XPoorUc45MNZ9809LCa3nz9YTqDhMOgCNBvkJYeg
          </div>
          <a 
            href="https://testnet.tonscan.org/address/EQBpuui3XPoorUc45MNZ9809LCa3nz9YTqDhMOgCNBvkJYeg"
            target="_blank"
            rel="noopener noreferrer"
            className="text-yellow-200 hover:text-white underline"
          >
            View in Explorer →
          </a>
        </div>
      </div>
    </div>
  );
}