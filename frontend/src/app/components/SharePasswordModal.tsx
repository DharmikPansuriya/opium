'use client';

import { useState } from 'react'; // Remove useEffect since it's not used

interface SharePasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onShare: (data: { email: string; expiresInHours: number }) => Promise<void>;
  passwordTitle: string;
}

export default function SharePasswordModal({
  isOpen,
  onClose,
  onShare,
  passwordTitle,
}: SharePasswordModalProps) {
  const [formData, setFormData] = useState({
    email: '',
    expiresInHours: 24, // Default to 24 hours
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess(false);

    try {
      await onShare(formData);
      setSuccess(true);
      setFormData({ email: '', expiresInHours: 24 });
    } catch (error: unknown) { // Type the error properly
      console.error('Share password error:', error);
      setError('Failed to share password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-900 rounded-xl p-6 w-full max-w-md border border-gray-800">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">Share Password</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="mb-6">
          <h3 className="text-sm font-medium text-gray-400">Sharing password for:</h3>
          <p className="text-lg font-semibold text-white mt-1">{passwordTitle}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">
              Recipient Email
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
              placeholder="Enter recipient's email"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">
              Expires In
            </label>
            <select
              value={formData.expiresInHours}
              onChange={(e) => setFormData({ ...formData, expiresInHours: Number(e.target.value) })}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="1">1 hour</option>
              <option value="24">24 hours</option>
              <option value="72">3 days</option>
              <option value="168">1 week</option>
              <option value="720">30 days</option>
            </select>
          </div>

          {error && (
            <div className="text-red-500 text-sm">{error}</div>
          )}

          {success && (
            <div className="text-green-500 text-sm">
              Password shared successfully! The recipient will receive an email with instructions.
            </div>
          )}

          <div className="flex justify-end space-x-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Sharing...' : 'Share Password'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}