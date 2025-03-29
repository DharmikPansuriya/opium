'use client';

import { useState } from 'react';
import { format } from 'date-fns';

interface SharedPassword {
  id: number;
  shared_with: {
    email: string;
    full_name: string;
  };
  status: 'active' | 'expired' | 'revoked';
  expires_at: string;
  created_at: string;
}

interface SharedPasswordsListProps {
  sharedPasswords: SharedPassword[];
  onShare: (data: { email: string; expiresInHours: number }) => Promise<void>;
  onRevoke: (shareId: number) => Promise<void>;
}

export default function SharedPasswordsList({
  sharedPasswords,
  onShare,
  onRevoke,
}: SharedPasswordsListProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [expiresInHours, setExpiresInHours] = useState(24);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      await onShare({ email, expiresInHours });
      setIsModalOpen(false);
      setEmail('');
      setExpiresInHours(24);
    } catch (error: unknown) {
      console.error('Share error:', error);
      setError('Failed to share password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Shared With</h3>
        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Share Password
        </button>
      </div>

      {error && (
        <div className="bg-red-500/20 border border-red-500 text-red-400 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {sharedPasswords.length === 0 ? (
        <p className="text-gray-400">No one has access to this password yet.</p>
      ) : (
        <div className="space-y-3">
          {sharedPasswords.map((share) => (
            <div
              key={share.id}
              className="flex items-center justify-between bg-gray-800 rounded-lg p-3"
            >
              <div>
                <p className="font-medium">{share.shared_with.full_name}</p>
                <p className="text-sm text-gray-400">{share.shared_with.email}</p>
                <p className="text-xs text-gray-500">
                  Expires: {format(new Date(share.expires_at), 'MMM d, yyyy')}
                </p>
              </div>
              <div className="flex items-center space-x-3">
                <span
                  className={`px-2 py-1 rounded-full text-xs ${
                    share.status === 'active'
                      ? 'bg-green-500/20 text-green-400'
                      : share.status === 'expired'
                      ? 'bg-gray-500/20 text-gray-400'
                      : 'bg-red-500/20 text-red-400'
                  }`}
                >
                  {share.status.charAt(0).toUpperCase() + share.status.slice(1)}
                </span>
                {share.status === 'active' && (
                  <button
                    onClick={() => onRevoke(share.id)}
                    className="text-red-400 hover:text-red-300 transition-colors"
                  >
                    Revoke
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Share Password Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-gray-900 rounded-lg p-6 w-full max-w-md">
            <h3 className="text-xl font-semibold mb-4">Share Password</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white"
                  placeholder="Enter email address"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">
                  Expires In (Hours)
                </label>
                <select
                  value={expiresInHours}
                  onChange={(e) => setExpiresInHours(Number(e.target.value))}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white"
                >
                  <option value={1}>1 hour</option>
                  <option value={24}>24 hours</option>
                  <option value={72}>3 days</option>
                  <option value={168}>1 week</option>
                </select>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  {isLoading ? 'Sharing...' : 'Share'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}