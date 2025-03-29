'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import PasswordField from '../../components/PasswordField';
import { format } from 'date-fns';

interface SharedPassword {
  id: number;
  password_id: number;
  password: {
    title: string;
    username: string;
    encrypted_password: string;
    description: string;
    owner: {
      full_name: string;
    };
  };
  shared_with: {
    email: string;
    full_name: string;
  };
  status: 'active' | 'expired' | 'revoked';
  expires_at: string;
  created_at: string;
}

export default function SharedPasswordsPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [sharedPasswords, setSharedPasswords] = useState<SharedPassword[]>([]);
  const [selectedPassword, setSelectedPassword] = useState<SharedPassword | null>(null);
  const [decryptedPassword, setDecryptedPassword] = useState('');

  const fetchSharedPasswords = useCallback(async (token: string) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/shared-passwords/received`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem('token');
          router.push('/login');
          return;
        }
        throw new Error('Failed to fetch shared passwords');
      }

      const data = await response.json();
      console.log('Received shared passwords:', data);
      setSharedPasswords(data);
    } catch (err) {
      setError('Failed to load shared passwords');
      console.error('Error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const expirationTime = payload.exp * 1000;
      if (Date.now() >= expirationTime) {
        localStorage.removeItem('token');
        router.push('/login');
        return;
      }
    } catch (error) {
      console.error('Error checking token:', error);
      localStorage.removeItem('token');
      router.push('/login');
      return;
    }

    fetchSharedPasswords(token);
  }, [router, fetchSharedPasswords]);

  const handleRevoke = async (shareId: number) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/shared-passwords/${shareId}/revoke`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to revoke access');
      }

      setSharedPasswords(prev => prev.filter(p => p.id !== shareId));
    } catch (err) {
      setError('Failed to revoke access');
      console.error('Error:', err);
    }
  };

  const handleDecryptPassword = async (password: SharedPassword) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/passwords/${password.password_id}/decrypt`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to decrypt password');
      }

      const data = await response.json();
      setDecryptedPassword(data.decrypted_password);
      setSelectedPassword(password);
    } catch (err) {
      setError('Failed to decrypt password');
      console.error('Error:', err);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl font-bold mb-8">Shared Passwords</h1>

        {error && (
          <div className="bg-red-500/20 border border-red-500 text-red-400 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-6">
            <h2 className="text-lg font-semibold">Passwords Shared With You</h2>
            {sharedPasswords.length === 0 ? (
              <div className="text-gray-400">
                No passwords have been shared with you yet.
              </div>
            ) : (
              <div className="space-y-4">
                {sharedPasswords.map((password) => (
                  <div key={password.id} className="bg-gray-900 border border-gray-800 rounded-lg p-4">
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-medium">{password.password?.title || "Untitled Password"}</h3>
                          <p className="text-sm text-gray-500">{password.password?.username || "No username"}</p>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleDecryptPassword(password)}
                            className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
                          >
                            View
                          </button>
                          <button
                            onClick={() => handleRevoke(password.id)}
                            className="px-3 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600"
                          >
                            Revoke
                          </button>
                        </div>
                      </div>
                      <div className="text-sm text-gray-500">
                        <p>Shared by {password.password?.owner?.full_name || "Unknown"}</p>
                        <p>Expires: {format(new Date(password.expires_at), "MMM d, yyyy h:mm a")}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-6">
            {selectedPassword ? (
              <>
                <h2 className="text-lg font-semibold">Password Details</h2>
                <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
                  <h3 className="text-xl font-semibold mb-4">{selectedPassword.password?.title || 'Untitled Password'}</h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-1">
                        Username
                      </label>
                      <p className="text-white">{selectedPassword.password?.username || 'No username'}</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-1">
                        Password
                      </label>
                      <PasswordField
                        value={decryptedPassword || ''}
                        onChange={() => {}}
                        label="Password"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-1">
                        Description
                      </label>
                      <p className="text-white">{selectedPassword.password?.description || 'No description'}</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-1">
                        Shared By
                      </label>
                      <p className="text-white">{selectedPassword.password?.owner?.full_name || 'Unknown'}</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-1">
                        Expires At
                      </label>
                      <p className="text-white">{format(new Date(selectedPassword.expires_at), 'MMM d, yyyy h:mm a')}</p>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="text-gray-400 text-center py-12">
                Select a password to view details
              </div>
            )}
          </div>
        </div>
      </div>

      {selectedPassword && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-900 rounded-xl p-6 w-full max-w-md border border-gray-800">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-semibold">Password Details</h2>
              <button
                onClick={() => setSelectedPassword(null)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
              <h3 className="text-xl font-semibold mb-4">{selectedPassword.password?.title || 'Untitled Password'}</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">
                    Username
                  </label>
                  <p className="text-white">{selectedPassword.password?.username || 'No username'}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">
                    Password
                  </label>
                  <PasswordField
                    value={decryptedPassword || ''}
                    onChange={() => {}}
                    label="Password"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">
                    Description
                  </label>
                  <p className="text-white">{selectedPassword.password?.description || 'No description'}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">
                    Shared By
                  </label>
                  <p className="text-white">{selectedPassword.password?.owner?.full_name || 'Unknown'}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">
                    Expires At
                  </label>
                  <p className="text-white">{format(new Date(selectedPassword.expires_at), 'MMM d, yyyy h:mm a')}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}