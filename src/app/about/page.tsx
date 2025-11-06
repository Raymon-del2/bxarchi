'use client';

import Navbar from '@/components/layout/Navbar';
import Link from 'next/link';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">About BXARCHI</h1>

        <div className="bg-white rounded-lg shadow-sm p-8 space-y-6">
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Our Mission</h2>
            <p className="text-gray-700 leading-relaxed">
              BXARCHI is a platform dedicated to empowering writers and connecting them with readers worldwide. 
              We believe that everyone has a story to tell, and we&apos;re here to make it easy for you to share yours 
              with the world.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">What We Offer</h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">For Writers</h3>
                <ul className="list-disc list-inside text-gray-700 space-y-2">
                  <li>Easy-to-use book publishing platform</li>
                  <li>Beautiful book presentation with custom covers</li>
                  <li>Connect directly with your readers</li>
                  <li>Track your book&apos;s views and engagement</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">For Readers</h3>
                <ul className="list-disc list-inside text-gray-700 space-y-2">
                  <li>Discover new books across multiple genres</li>
                  <li>Read books for free online</li>
                  <li>Support your favorite authors</li>
                  <li>Build your personal reading library</li>
                </ul>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Our Story</h2>
            <p className="text-gray-700 leading-relaxed">
              Founded in 2025, BXARCHI was created to democratize book publishing and make literature 
              accessible to everyone. We started with a simple idea: what if anyone could publish their 
              book and reach readers around the world without barriers?
            </p>
            <p className="text-gray-700 leading-relaxed mt-4">
              Today, we&apos;re proud to be a growing community of writers and readers who share a passion 
              for storytelling and the written word.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Join Our Community</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Whether you&apos;re a writer looking to share your work or a reader searching for your next 
              favorite book, BXARCHI is here for you.
            </p>
            <div className="flex space-x-4">
              <Link 
                href="/register" 
                className="px-6 py-3 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 font-medium"
              >
                Get Started
              </Link>
              <Link 
                href="/browse" 
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 font-medium"
              >
                Browse Books
              </Link>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
