'use client';

import { useState, useEffect } from 'react';
import { useTonAddress, useTonConnectUI } from '@tonconnect/ui-react';
import { Address } from '@ton/core';
import { supabaseHelpers, User } from '@/lib/supabaseClient';

interface UserProfileProps {
  className?: string;
}

interface GemBalanceData {
  userAddress: string;
  walletAddress: string;
  balance: string;
  decimals: number;
  formatted: string;
}

export function UserProfileDB({ className = '' }: UserProfileProps) {
  const address = useTonAddress();
  const [tonConnectUI] = useTonConnectUI();
  const [isEditing, setIsEditing] = useState(false);
  const [username, setUsername] = useState('');
  const [profile, setProfile] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // GEM Balance state
  const [gemBalance, setGemBalance] = useState<GemBalanceData | null>(null);
  const [gemLoading, setGemLoading] = useState(false);
  const [gemError, setGemError] = useState<string | null>(null);

  // Load profile from database
  useEffect(() => {
    if (!address) {
      setProfile(null);
      return;
    }

    loadProfile();
  }, [address]);

  const loadProfile = async () => {
    if (!address) return;

    try {
      setLoading(true);
      setError(null);

      let userProfile = await supabaseHelpers.getUserProfile(address);
      
      if (!userProfile) {
        // Create new profile if doesn't exist
        userProfile = await supabaseHelpers.createOrUpdateUserProfile({
          wallet_address: address,
          username: `User${address.slice(-4)}`
        });
      }

      if (userProfile) {
        setProfile(userProfile);
        setUsername(userProfile.username || `User${address.slice(-4)}`);
      }
    } catch (error) {
      console.error('Error loading profile:', error);
      setError('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!address || !profile) return;

    try {
      setLoading(true);
      setError(null);

      const updatedProfile = await supabaseHelpers.createOrUpdateUserProfile({
        wallet_address: address,
        username: username || `User${address.slice(-4)}`
      });

      if (updatedProfile) {
        setProfile(updatedProfile);
        setIsEditing(false);
      } else {
        throw new Error('Failed to update profile');
      }
    } catch (error) {
      console.error('Error saving profile:', error);
      setError('Failed to save profile');
    } finally {
      setLoading(false);
    }
  };

  // Load GEM balance
  const fetchGemBalance = async () => {
    if (!address) return;

    setGemLoading(true);
    setGemError(null);

    try {
      // Convert address to user-friendly format
      const userFriendlyAddress = Address.parse(address).toString();
      
      const response = await fetch(`/api/gem/balance/${userFriendlyAddress}`);
      const data = await response.json();

      if (data.success) {
        setGemBalance(data.data);
      } else {
        setGemError(data.error || 'Failed to fetch GEM balance');
      }
    } catch (err) {
      setGemError(err instanceof Error ? err.message : 'Network error');
    } finally {
      setGemLoading(false);
    }
  };

  // Refresh GEM balance
  const refreshGemBalance = () => {
    fetchGemBalance();
  };

  // Load GEM balance when address changes
  useEffect(() => {
    if (address) {
      fetchGemBalance();
    } else {
      setGemBalance(null);
      setGemError(null);
    }
  }, [address]);

  // Real-time subscription to profile changes
  useEffect(() => {
    if (!address) return;

    const subscription = supabaseHelpers.subscribeToUserProfile(address, (payload) => {
      console.log('Profile changed:', payload);
      // Refresh profile when changes detected
      loadProfile();
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [address]);

  if (!address) {
    return null;
  }

  if (loading && !profile) {
    return (
      <div className={`bg-white/10 backdrop-blur-lg rounded-xl p-4 border border-white/20 ${className}`}>
        <div className="animate-pulse">
          <div className="h-4 bg-white/20 rounded mb-2"></div>
          <div className="h-8 bg-white/20 rounded mb-4"></div>
          <div className="space-y-2">
            <div className="h-4 bg-white/20 rounded"></div>
            <div className="h-4 bg-white/20 rounded w-3/4"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white/10 backdrop-blur-lg rounded-xl p-4 border border-white/20 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white">Profile</h3>
        {!isEditing && !loading && (
          <button
            onClick={() => setIsEditing(true)}
            className="text-blue-400 hover:text-blue-300 text-sm"
          >
            Edit
          </button>
        )}
      </div>

      {error && (
        <div className="mb-4 p-2 bg-red-500/20 border border-red-500/40 rounded text-red-200 text-sm">
          {error}
        </div>
      )}

      <div className="space-y-3">
        {/* Username */}
        <div>
          <label className="text-white/60 text-xs">Username</label>
          {isEditing ? (
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full mt-1 px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white text-sm focus:border-blue-500 focus:outline-none"
              placeholder="Enter username"
              disabled={loading}
            />
          ) : (
            <div className="text-white font-medium">
              {profile?.username || 'Anonymous'}
            </div>
          )}
        </div>

        {/* Wallet Address */}
        <div>
          <label className="text-white/60 text-xs">Wallet Address</label>
          <div className="text-white font-mono text-sm">
            {address.slice(0, 8)}...{address.slice(-8)}
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-white/60 text-xs">Cards Owned</label>
            <div className="text-white font-bold text-lg">
              {profile?.cards_owned || 0}
            </div>
          </div>
          
          <div>
            <label className="text-white/60 text-xs">Level</label>
            <div className="text-white font-bold text-lg">
              {profile?.level || 1}
            </div>
          </div>
        </div>

        {/* Enhanced GEM Balance Section */}
        <div className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 rounded-lg p-3 border border-yellow-500/30">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-bold text-yellow-400">💎 GEM Balance</h4>
            <button
              onClick={refreshGemBalance}
              disabled={gemLoading}
              className="text-yellow-400 hover:text-yellow-300 text-xs disabled:opacity-50"
            >
              {gemLoading ? '⏳' : '🔄'}
            </button>
          </div>
          
          {gemLoading ? (
            <div className="flex items-center space-x-2">
              <div className="animate-spin h-3 w-3 border border-yellow-400 border-t-transparent rounded-full"></div>
              <span className="text-yellow-300 text-sm">Loading...</span>
            </div>
          ) : gemError ? (
            <div className="text-red-300">
              <p className="text-xs">❌ {gemError}</p>
              <button 
                onClick={refreshGemBalance}
                className="mt-1 text-xs underline hover:no-underline text-yellow-400"
              >
                Retry
              </button>
            </div>
          ) : gemBalance ? (
            <div>
              <div className="text-xl font-bold text-white">
                {gemBalance.formatted}
              </div>
              <div className="text-xs text-yellow-300/80">
                Raw: {gemBalance.balance} units
              </div>
              <div className="text-xs text-yellow-300/60 mt-1">
                Network: Testnet • Decimals: {gemBalance.decimals}
              </div>
            </div>
          ) : (
            <div className="text-yellow-300">
              <p className="text-sm">No balance data</p>
              <p className="text-xs text-yellow-300/60">Database: {profile?.gems_balance ? 
                (parseFloat(profile.gems_balance) / 1e9).toFixed(2) + ' GEM' : 
                '0 GEM'
              }</p>
            </div>
          )}
          
          {/* GEM Contract Info */}
          <div className="mt-3 pt-2 border-t border-yellow-500/20">
            <div className="text-xs text-yellow-300/80">
              <div>Contract: EQBpuui3XPoorUc45MNZ9809LCa3nz9YTqDhMOgCNBvkJYeg</div>
              <a 
                href="https://testnet.tonscan.org/address/EQBpuui3XPoorUc45MNZ9809LCa3nz9YTqDhMOgCNBvkJYeg"
                target="_blank"
                rel="noopener noreferrer"
                className="text-yellow-400 hover:text-yellow-300 underline"
              >
                View in Explorer →
              </a>
            </div>
          </div>
        </div>

        {/* Experience */}
        <div>
          <label className="text-white/60 text-xs">Experience</label>
          <div className="text-white">
            {profile?.experience || 0} XP
          </div>
        </div>

        {/* Member Since */}
        {profile?.created_at && (
          <div>
            <label className="text-white/60 text-xs">Member Since</label>
            <div className="text-white text-sm">
              {new Date(profile.created_at).toLocaleDateString()}
            </div>
          </div>
        )}

        {/* Last Login */}
        {profile?.last_login && (
          <div>
            <label className="text-white/60 text-xs">Last Login</label>
            <div className="text-white text-sm">
              {new Date(profile.last_login).toLocaleDateString()}
            </div>
          </div>
        )}

        {/* Edit Actions */}
        {isEditing && (
          <div className="flex gap-2 pt-2">
            <button
              onClick={handleSave}
              disabled={loading}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg text-sm transition-colors disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Save'}
            </button>
            <button
              onClick={() => {
                setIsEditing(false);
                setUsername(profile?.username || '');
                setError(null);
              }}
              disabled={loading}
              className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-2 rounded-lg text-sm transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
          </div>
        )}
      </div>
    </div>
  );
}