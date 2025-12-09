'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import HeroCarousel from '@/components/home/HeroCarousel';

export default function Home() {
  const { user } = useAuth();
  const router = useRouter();
  const [showSignInModal, setShowSignInModal] = useState(false);

  const handleStartWriting = () => {
    if (user) {
      router.push('/write');
    } else {
      setShowSignInModal(true);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Navigation */}
      <Navbar />

      {/* Sign In Modal */}
      {showSignInModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-8 animate-scale-in">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Sign In Required</h3>
              <p className="text-gray-600">
                You need to sign in to start writing your book on BXARCHI
              </p>
            </div>
            
            <div className="space-y-3">
              <button
                onClick={() => router.push('/login')}
                className="w-full px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium transition-colors"
              >
                Sign In
              </button>
              <button
                onClick={() => router.push('/register')}
                className="w-full px-6 py-3 bg-white text-indigo-600 border-2 border-indigo-600 rounded-lg hover:bg-indigo-50 font-medium transition-colors"
              >
                Create Account
              </button>
              <button
                onClick={() => setShowSignInModal(false)}
                className="w-full px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Hero Section with Carousel Background */}
      <div className="relative h-[600px] overflow-hidden">
        {/* Carousel Background */}
        <HeroCarousel />
        
        {/* Hero Content */}
        <div className="relative z-10 h-full flex items-center justify-center">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 drop-shadow-lg">
              Share Your Stories with the World
            </h1>
            <p className="text-xl md:text-2xl text-white mb-8 max-w-3xl mx-auto drop-shadow-md">
              Publish your books, connect with readers, and build your audience on BXARCHI - the platform for writers and readers alike.
            </p>
            <div className="flex justify-center space-x-4">
              <button 
                onClick={handleStartWriting}
                className="bg-indigo-600 text-white px-8 py-4 rounded-md text-lg font-medium hover:bg-indigo-700 shadow-lg transition-all hover:scale-105"
              >
                Start Writing
              </button>
              <Link 
                href="/browse" 
                className="bg-white text-indigo-600 border-2 border-white px-8 py-4 rounded-md text-lg font-medium hover:bg-gray-100 shadow-lg transition-all hover:scale-105"
              >
                Browse Books
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Why Choose BXARCHI?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: 'Easy Publishing',
                description: 'Publish your work with our simple and intuitive editor. No technical skills required.',
                icon: '📝',
              },
              {
                title: 'Engage with Readers',
                description: 'Get feedback, comments, and build a community around your writing.',
                icon: '💬',
              },
              {
                title: 'Discover New Books',
                description: 'Find your next favorite book from our growing collection of stories.',
                icon: '🔍',
              },
            ].map((feature, index) => (
              <div key={index} className="p-6 bg-gray-50 rounded-lg text-center">
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      </div>
  );
}
