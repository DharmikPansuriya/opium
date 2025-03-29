'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import PasswordField from '../../components/PasswordField';
import AddPasswordModal from '../../components/AddPasswordModal';
import SharePasswordModal from '../../components/SharePasswordModal';

interface Password {
  id: number;
  title: string;
  username: string;
  encrypted_password: string;
  description: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string | null;
}

export default function PasswordsPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [passwords, setPasswords] = useState<Password[]>([]);
  const [selectedPassword, setSelectedPassword] = useState<Password | null>(null);
  const [decryptedPassword, setDecryptedPassword] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [sharedPasswordsCount, setSharedPasswordsCount] = useState(0);
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    fetchPasswords(token);
  }, [router]);

  const fetchPasswords = async (token: string) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/passwords`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch passwords');
      }

      const data = await response.json();
      setPasswords(data);
    } catch (err) {
      setError('Failed to load passwords');
      console.error('Error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDecryptPassword = async (password: Password) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/passwords/${password.id}/decrypt`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to decrypt password');
      }

      const data = await response.json();
      setDecryptedPassword(data.password);
      setSelectedPassword(password);
    } catch (err) {
      setError('Failed to decrypt password');
      console.error('Error:', err);
    }
  };

  const handleAddPassword = async (data: { title: string; username: string; password: string; description?: string }) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/passwords`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Failed to add password');
      }

      const newPassword = await response.json();
      setPasswords(prev => [...prev, newPassword]);
      setIsAddModalOpen(false);
    } catch (err) {
      setError('Failed to add password');
      console.error('Error:', err);
    }
  };

  const handleDeletePassword = async (passwordId: number) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/passwords/${passwordId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to delete password');
      }

      setPasswords(prev => prev.filter(p => p.id !== passwordId));
      setSelectedPassword(null);
      setDecryptedPassword('');
    } catch (err) {
      setError('Failed to delete password');
      console.error('Error:', err);
    }
  };

  const handleShare = async (data: { email: string; expiresInHours: number }) => {
    if (!selectedPassword) return;

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      // First, get the user ID from the email
      const userResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/by-email/${data.email}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!userResponse.ok) {
        if (userResponse.status === 403) {
          throw new Error('You need admin privileges to share passwords');
        }
        if (userResponse.status === 404) {
          throw new Error('User not found. Please make sure the email address is correct.');
        }
        throw new Error('Failed to get user information');
      }

      const userData = await userResponse.json();

      // Then share the password with the user
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/shared-passwords`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          password_id: selectedPassword.id,
          shared_with_id: userData.id,
          expires_in_hours: data.expiresInHours,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to share password');
      }

      // Close the modal and show success message
      setIsShareModalOpen(false);
      setError(''); // Clear any previous errors
    } catch (error) {
      console.error('Error sharing password:', error);
      setError(error instanceof Error ? error.message : 'Failed to share password. Please try again.');
      throw error;
    }
  };

  const filteredPasswords = passwords.filter(password =>
    password.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    password.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (password.description?.toLowerCase() || '').includes(searchQuery.toLowerCase())
  );

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
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold">Passwords</h1>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Add New Password
          </button>
        </div>

        {error && (
          <div className="bg-red-500/20 border border-red-500 text-red-400 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        <div className="mb-6">
          <input
            type="text"
            placeholder="Search passwords..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-gray-900 border border-gray-800 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* List of passwords */}
          <div className="space-y-6">
            {filteredPasswords.length === 0 ? (
              <div className="text-gray-400">
                {searchQuery ? 'No passwords found matching your search.' : 'No passwords yet. Add your first password!'}
              </div>
            ) : (
              <div className="space-y-4">
                {filteredPasswords.map((password) => (
                  <div
                    key={password.id}
                    className="bg-gray-900 rounded-lg p-4 border border-gray-800 hover:border-blue-500 transition-colors cursor-pointer"
                    onClick={() => handleDecryptPassword(password)}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium">{password.title}</h3>
                        <p className="text-sm text-gray-400">{password.username}</p>
                        {password.description && (
                          <p className="text-sm text-gray-500 mt-1">{password.description}</p>
                        )}
                      </div>
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${
                          password.is_active
                            ? 'bg-green-500/20 text-green-400'
                            : 'bg-red-500/20 text-red-400'
                        }`}
                      >
                        {password.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Selected password details */}
          <div className="space-y-6">
            {selectedPassword ? (
              <>
                <h2 className="text-lg font-semibold">Password Details</h2>
                <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-xl font-semibold">{selectedPassword.title}</h3>
                    <div className="flex space-x-3">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setIsShareModalOpen(true);
                        }}
                        className="text-blue-400 hover:text-blue-300 transition-colors"
                      >
                        Share
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeletePassword(selectedPassword.id);
                        }}
                        className="text-red-400 hover:text-red-300 transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-1">
                        Username
                      </label>
                      <input
                        type="text"
                        value={selectedPassword.username}
                        readOnly
                        className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white"
                      />
                    </div>

                    <PasswordField
                      value={decryptedPassword}
                      onChange={() => {}}
                      label="Password"
                    />

                    {selectedPassword.description && (
                      <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">
                          Description
                        </label>
                        <input
                          type="text"
                          value={selectedPassword.description}
                          readOnly
                          className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white"
                        />
                      </div>
                    )}
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

      <AddPasswordModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={handleAddPassword}
      />

      <SharePasswordModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        onShare={handleShare}
        passwordTitle={selectedPassword?.title || ''}
      />
    </div>
  );
} 