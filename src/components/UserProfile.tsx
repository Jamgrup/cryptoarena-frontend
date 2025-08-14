'use client';

import { useState, useEffect } from 'react';
import { useTonAddress } from '@tonconnect/ui-react';
import { useUserProfile } from '@/hooks/useSupabase';

interface UserProfileProps {
  className?: string;
}

export function UserProfile({ className = '' }: UserProfileProps) {
  const address = useTonAddress();
  const { profile, loading, error, updateProfile } = useUserProfile(address);
  const [isEditing, setIsEditing] = useState(false);
  const [username, setUsername] = useState('');

  useEffect(() => {
    if (profile) {
      setUsername(profile.username || '');
    }
  }, [profile]);

  // Auto-create profile when wallet connects
  useEffect(() => {
    if (address && !profile && !loading) {
      const createInitialProfile = async () => {
        await updateProfile({
          wallet_address: address,
          username: `User${address.slice(-4)}`,
          total_cards: 0,
          last_login: new Date().toISOString()
        });
      };
      createInitialProfile();
    }
  }, [address, profile, loading, updateProfile]);

  const handleSave = async () => {
    if (!address) return;

    const updated = await updateProfile({
      wallet_address: address,
      username: username || `User${address.slice(-4)}`,
      total_cards: profile?.total_cards || 0,
      favorite_wave: profile?.favorite_wave,
      last_login: new Date().toISOString()
    });

    if (updated) {
      setIsEditing(false);
    }
  };

  if (!address) {
    return null;
  }

  if (loading) {
    return (
      <div className={`bg-white/10 backdrop-blur-lg rounded-xl p-4 border border-white/20 ${className}`}>
        <div className="flex items-center space-x-2">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
          <span className="text-white/80">Loading profile...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`bg-white/10 backdrop-blur-lg rounded-xl p-4 border border-white/20 ${className}`}>
        <div className="text-red-400 text-sm">Profile error: {error}</div>
      </div>
    );
  }

  return (
    <div className={`bg-white/10 backdrop-blur-lg rounded-xl p-4 border border-white/20 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white">Profile</h3>
        {!isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="text-blue-400 hover:text-blue-300 text-sm"
          >
            Edit
          </button>
        )}
      </div>

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
            <label className="text-white/60 text-xs">Total Cards</label>
            <div className="text-white font-bold text-lg">
              {profile?.total_cards || 0}
            </div>
          </div>
          
          <div>
            <label className="text-white/60 text-xs">Favorite Wave</label>
            <div className="text-white capitalize">
              {profile?.favorite_wave || 'None'}
            </div>
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
            <label className="text-white/60 text-xs">Last Active</label>
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
              className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white py-2 rounded-lg text-sm transition-colors"
            >
              {loading ? 'Saving...' : 'Save'}
            </button>
            <button
              onClick={() => {
                setIsEditing(false);
                setUsername(profile?.username || '');
              }}
              className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-2 rounded-lg text-sm transition-colors"
            >
              Cancel
            </button>
          </div>
        )}
      </div>
    </div>
  );
}