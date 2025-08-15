'use client';

import { useState, useEffect } from 'react';
import { useTonAddress } from '@tonconnect/ui-react';

interface UserProfileProps {
  className?: string;
}

interface LocalProfile {
  username: string;
  totalCards: number;
  favoriteWave: string;
  memberSince: string;
}

export function UserProfile({ className = '' }: UserProfileProps) {
  const address = useTonAddress();
  const [isEditing, setIsEditing] = useState(false);
  const [username, setUsername] = useState('');
  const [profile, setProfile] = useState<LocalProfile | null>(null);

  // Load profile from localStorage
  useEffect(() => {
    if (!address) {
      setProfile(null);
      return;
    }

    const savedProfile = localStorage.getItem(`profile_${address}`);
    if (savedProfile) {
      const parsed = JSON.parse(savedProfile);
      setProfile(parsed);
      setUsername(parsed.username);
    } else {
      // Create initial profile
      const newProfile: LocalProfile = {
        username: `User${address.slice(-4)}`,
        totalCards: 0,
        favoriteWave: 'None',
        memberSince: new Date().toISOString()
      };
      setProfile(newProfile);
      setUsername(newProfile.username);
      localStorage.setItem(`profile_${address}`, JSON.stringify(newProfile));
    }
  }, [address]);

  const handleSave = () => {
    if (!address || !profile) return;

    const updatedProfile = {
      ...profile,
      username: username || `User${address.slice(-4)}`
    };
    
    setProfile(updatedProfile);
    localStorage.setItem(`profile_${address}`, JSON.stringify(updatedProfile));
    setIsEditing(false);
  };

  if (!address) {
    return null;
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
              {profile?.totalCards || 0}
            </div>
          </div>
          
          <div>
            <label className="text-white/60 text-xs">Favorite Wave</label>
            <div className="text-white capitalize">
              {profile?.favoriteWave || 'None'}
            </div>
          </div>
        </div>

        {/* Member Since */}
        {profile?.memberSince && (
          <div>
            <label className="text-white/60 text-xs">Member Since</label>
            <div className="text-white text-sm">
              {new Date(profile.memberSince).toLocaleDateString()}
            </div>
          </div>
        )}

        {/* Edit Actions */}
        {isEditing && (
          <div className="flex gap-2 pt-2">
            <button
              onClick={handleSave}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg text-sm transition-colors"
            >
              Save
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