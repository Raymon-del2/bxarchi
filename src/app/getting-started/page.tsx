'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/layout/Navbar';
import Image from 'next/image';

export default function GettingStartedPage() {
  const { user } = useAuth();
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-6xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Getting Started with BXARCHI
          </h1>
          <p className="text-xl text-gray-600">
            Follow these simple steps to start your writing journey
          </p>
        </div>

        {/* Visual Step-by-Step Guide */}
        <div className="space-y-12">
          {/* Step 1: Click Get Started */}
          <div className="bg-white rounded-lg shadow-sm p-8">
            <div className="flex items-start space-x-4 mb-6">
              <div className="flex-shrink-0 w-12 h-12 bg-indigo-600 text-white rounded-full flex items-center justify-center font-bold text-xl">
                1
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Click the &quot;Get Started&quot; button at the top right
                </h2>
                <p className="text-gray-600 text-lg mb-4">
                  Look for the purple &quot;Get Started&quot; button in the navigation bar to create your account.
                </p>
                <button
                  onClick={() => router.push('/register')}
                  className="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
                >
                  Get Started
                </button>
              </div>
            </div>
            
            {/* Screenshot */}
            <div className="bg-white rounded-lg border-2 border-gray-200 overflow-hidden">
              <Image 
                src="/screenshots/get-started-button.png" 
                alt="Get Started button in navigation bar"
                width={1200}
                height={400}
                className="w-full h-auto"
              />
            </div>
          </div>

          {/* Step 2: Create Account */}
          <div className="bg-white rounded-lg shadow-sm p-8">
            <div className="flex items-start space-x-4 mb-6">
              <div className="flex-shrink-0 w-12 h-12 bg-indigo-600 text-white rounded-full flex items-center justify-center font-bold text-xl">
                2
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Create your account
                </h2>
                <p className="text-gray-600 text-lg">
                  Sign up with your email or use Google to create your writer account.
                </p>
              </div>
            </div>
            
            {/* Screenshot */}
            <div className="bg-white rounded-lg border-2 border-gray-200 overflow-hidden">
              <Image 
                src="/screenshots/Registration.png" 
                alt="Registration page"
                width={1200}
                height={800}
                className="w-full h-auto"
              />
            </div>
          </div>

          {/* Step 3: Set Up Profile */}
          <div className="bg-white rounded-lg shadow-sm p-8">
            <div className="flex items-start space-x-4 mb-6">
              <div className="flex-shrink-0 w-12 h-12 bg-indigo-600 text-white rounded-full flex items-center justify-center font-bold text-xl">
                3
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Set up your writer profile
                </h2>
                <p className="text-gray-600 text-lg">
                  Add a profile picture, choose a unique nickname, and write a bio about yourself.
                </p>
              </div>
            </div>
            
            {/* Screenshot with blur overlay */}
            <div className="bg-white rounded-lg border-2 border-gray-200 overflow-hidden relative">
              <Image 
                src="/screenshots/Profile setup.png" 
                alt="Profile setup page"
                width={1200}
                height={800}
                className="w-full h-auto"
              />
              {/* Blur overlay for email - adjust position as needed */}
              <div 
                className="absolute bg-white/90 backdrop-blur-lg rounded-md"
                style={{
                  top: '20%',
                  left: '30%',
                  width: '40%',
                  height: '6%',
                  zIndex: 10,
                }}
              >
                <div className="flex items-center justify-center h-full text-gray-600 text-xs font-semibold">
                  📧 Email Hidden for Privacy
                </div>
              </div>
            </div>
          </div>

          {/* Step 4: Write About Your Book */}
          <div className="bg-white rounded-lg shadow-sm p-8">
            <div className="flex items-start space-x-4 mb-6">
              <div className="flex-shrink-0 w-12 h-12 bg-indigo-600 text-white rounded-full flex items-center justify-center font-bold text-xl">
                4
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Fill in your book details
                </h2>
                <p className="text-gray-600 text-lg">
                  Add your book title, description, genre, and upload a cover image to make it stand out.
                </p>
              </div>
            </div>
            
            {/* Screenshot */}
            <div className="bg-white rounded-lg border-2 border-gray-200 overflow-hidden">
              <Image 
                src="/screenshots/Write about book.png" 
                alt="Book details form"
                width={1200}
                height={800}
                className="w-full h-auto"
              />
            </div>
          </div>

          {/* Step 5: Write Your Content */}
          <div className="bg-white rounded-lg shadow-sm p-8">
            <div className="flex items-start space-x-4 mb-6">
              <div className="flex-shrink-0 w-12 h-12 bg-indigo-600 text-white rounded-full flex items-center justify-center font-bold text-xl">
                5
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Write your book content
                </h2>
                <p className="text-gray-600 text-lg">
                  Start writing the pages of your book. Add chapters, paragraphs, and bring your story to life.
                </p>
              </div>
            </div>
            
            {/* Screenshot */}
            <div className="bg-white rounded-lg border-2 border-gray-200 overflow-hidden">
              <Image 
                src="/screenshots/Contents in book..png" 
                alt="Book content editor"
                width={1200}
                height={800}
                className="w-full h-auto"
              />
            </div>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Feature 1 */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Easy Editor</h3>
            <p className="text-gray-600">
              Simple and intuitive writing interface. Focus on your content without distractions.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Custom Covers</h3>
            <p className="text-gray-600">
              Upload your own book covers to make your books visually appealing.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Build Your Audience</h3>
            <p className="text-gray-600">
              Connect with readers who love your genre. Get likes, comments, and views.
            </p>
          </div>

          {/* Feature 4 */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Free Publishing</h3>
            <p className="text-gray-600">
              Publish unlimited books for free. No hidden costs or subscription fees.
            </p>
          </div>
        </div>

        {/* Tips Section */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg shadow-sm p-8 text-white">
          <h2 className="text-2xl font-bold mb-4">Pro Tips for Success</h2>
          <ul className="space-y-3">
            <li className="flex items-start">
              <svg className="w-6 h-6 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>Write a compelling description to attract readers</span>
            </li>
            <li className="flex items-start">
              <svg className="w-6 h-6 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>Choose an eye-catching cover image</span>
            </li>
            <li className="flex items-start">
              <svg className="w-6 h-6 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>Select the right genre to help readers find your book</span>
            </li>
            <li className="flex items-start">
              <svg className="w-6 h-6 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>Engage with readers by responding to comments</span>
            </li>
            <li className="flex items-start">
              <svg className="w-6 h-6 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>Update your profile with a photo and bio to build credibility</span>
            </li>
          </ul>
        </div>

        {/* CTA */}
        <div className="text-center mt-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Ready to Start Your Writing Journey?
          </h2>
          <button
            onClick={() => router.push('/write')}
            className="px-8 py-3 bg-indigo-600 text-white text-lg rounded-md hover:bg-indigo-700 transition-colors font-semibold"
          >
            Create Your First Book
          </button>
        </div>
      </div>
    </div>
  );
}
