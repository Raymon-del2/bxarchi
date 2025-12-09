'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import Navbar from '@/components/layout/Navbar';
import { updateExistingUsersWithLocation } from '@/lib/utils/updateUserLocations';
import Loader from '@/components/ui/Loader';

// Admin user IDs
const ADMIN_USERS = ['FaLWjIwujeghy34NGelI0rrB7Vk2'];

export default function UpdateLocationsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ updatedCount: number; errorCount: number } | null>(null);
  const [error, setError] = useState('');

  const isAdmin = user && ADMIN_USERS.includes(user.uid);

  useEffect(() => {
    if (!isAdmin) {
      router.push('/');
      return;
    }
  }, [isAdmin, router]);

  const handleUpdateLocations = async () => {
    setLoading(true);
    setError('');
    setResult(null);

    try {
      const updateResult = await updateExistingUsersWithLocation();
      setResult(updateResult);
    } catch (err: any) {
      setError(err.message || 'Failed to update user locations');
    } finally {
      setLoading(false);
    }
  };

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">🌍 Update User Locations</h1>
          <p className="text-gray-600">
            Update existing users with location data for those who don&apos;t have it set
          </p>
        </div>

        {/* Warning Card */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-8">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-6 w-6 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">
                Important Notice
              </h3>
              <div className="mt-2 text-sm text-yellow-700">
                <p>This will attempt to detect and update location data for all existing users who don&apos;t have location information.</p>
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li>Uses IP-based geolocation (less accurate than GPS)</li>
                  <li>Takes time due to rate limiting (1 second per user)</li>
                  <li>Only updates users without existing location data</li>
                  <li>May not work for all users due to privacy settings</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Update Button */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <button
            onClick={handleUpdateLocations}
            disabled={loading}
            className="w-full sm:w-auto bg-indigo-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? (
              <>
                <div className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Updating Locations...
              </>
            ) : (
              '🌍 Update All User Locations'
            )}
          </button>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md mb-8">
            {error}
          </div>
        )}

        {/* Results Display */}
        {result && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Update Results</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center">
                  <svg className="h-8 w-8 text-green-600 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <div className="text-2xl font-bold text-green-600">{result.updatedCount}</div>
                    <div className="text-sm text-green-800">Users Updated</div>
                  </div>
                </div>
              </div>
              
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center">
                  <svg className="h-8 w-8 text-red-600 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <div className="text-2xl font-bold text-red-600">{result.errorCount}</div>
                    <div className="text-sm text-red-800">Errors Encountered</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>Note:</strong> Users will also get their location updated automatically when they next log in to the site. This manual update helps populate data for inactive users.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
