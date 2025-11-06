'use client';

import Navbar from '@/components/layout/Navbar';
import Link from 'next/link';

export default function WriterResourcesPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Writer Resources</h1>
        <p className="text-xl text-gray-600 mb-12">
          Everything you need to succeed as a writer on BXARCHI
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {/* Getting Started */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Getting Started</h3>
            <p className="text-gray-600 mb-4">
              Learn how to create your account, set up your profile, and publish your first book.
            </p>
            <Link href="/getting-started" className="text-indigo-600 hover:text-indigo-700 font-medium">
              Start Now →
            </Link>
          </div>

          {/* Writing Tips */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Writing Tips</h3>
            <p className="text-gray-600 mb-4">
              Improve your craft with tips on storytelling, character development, and plot structure.
            </p>
            <a href="#writing-tips" className="text-green-600 hover:text-green-700 font-medium">
              Learn More →
            </a>
          </div>

          {/* Publishing Guide */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Publishing Guide</h3>
            <p className="text-gray-600 mb-4">
              Step-by-step guide to formatting, uploading, and promoting your book on BXARCHI.
            </p>
            <Link href="/books/new" className="text-purple-600 hover:text-purple-700 font-medium">
              Publish Now →
            </Link>
          </div>

          {/* Marketing Your Book */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Marketing Your Book</h3>
            <p className="text-gray-600 mb-4">
              Strategies to reach more readers, build your audience, and grow your following.
            </p>
            <a href="#marketing" className="text-yellow-600 hover:text-yellow-700 font-medium">
              Learn More →
            </a>
          </div>

          {/* Community Guidelines */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Community Guidelines</h3>
            <p className="text-gray-600 mb-4">
              Learn about our community standards and how to engage respectfully with readers.
            </p>
            <Link href="/terms" className="text-red-600 hover:text-red-700 font-medium">
              Read Guidelines →
            </Link>
          </div>

          {/* Support */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Get Support</h3>
            <p className="text-gray-600 mb-4">
              Need help? Contact our support team or browse our FAQ for quick answers.
            </p>
            <Link href="/contact" className="text-blue-600 hover:text-blue-700 font-medium">
              Contact Support →
            </Link>
          </div>
        </div>

        {/* Detailed Sections */}
        <div className="space-y-12">
          {/* Writing Tips Section */}
          <section id="writing-tips" className="bg-white rounded-lg shadow-sm p-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Writing Tips</h2>
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">1. Start with an Outline</h3>
                <p className="text-gray-700 leading-relaxed">
                  Plan your story structure before you begin writing. An outline helps you stay focused 
                  and ensures your plot flows logically from beginning to end.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">2. Develop Compelling Characters</h3>
                <p className="text-gray-700 leading-relaxed">
                  Create characters with depth, motivations, and flaws. Readers connect with characters 
                  who feel real and relatable.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">3. Show, Don&apos;t Tell</h3>
                <p className="text-gray-700 leading-relaxed">
                  Instead of telling readers how a character feels, show it through their actions, 
                  dialogue, and body language.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">4. Write Regularly</h3>
                <p className="text-gray-700 leading-relaxed">
                  Establish a writing routine. Even 15-30 minutes a day can lead to significant progress 
                  over time.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">5. Edit and Revise</h3>
                <p className="text-gray-700 leading-relaxed">
                  Your first draft is just the beginning. Take time to revise, polish, and refine your 
                  work before publishing.
                </p>
              </div>
            </div>
          </section>

          {/* Marketing Section */}
          <section id="marketing" className="bg-white rounded-lg shadow-sm p-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Marketing Strategies</h2>
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">1. Create an Engaging Cover</h3>
                <p className="text-gray-700 leading-relaxed">
                  Your book cover is the first thing readers see. Make it professional, eye-catching, 
                  and relevant to your genre.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">2. Write a Compelling Description</h3>
                <p className="text-gray-700 leading-relaxed">
                  Hook readers with a description that highlights what makes your book unique and why 
                  they should read it.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">3. Engage with Readers</h3>
                <p className="text-gray-700 leading-relaxed">
                  Respond to comments and feedback. Building relationships with readers creates loyal fans.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">4. Share on Social Media</h3>
                <p className="text-gray-700 leading-relaxed">
                  Promote your book on social media platforms. Share excerpts, behind-the-scenes content, 
                  and updates about your writing journey.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">5. Write Consistently</h3>
                <p className="text-gray-700 leading-relaxed">
                  Publishing regularly keeps readers engaged and coming back for more. Consider writing 
                  a series or multiple books in your genre.
                </p>
              </div>
            </div>
          </section>
        </div>

        {/* CTA Section */}
        <div className="mt-12 bg-indigo-600 rounded-lg p-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Ready to Start Writing?</h2>
          <p className="text-indigo-100 mb-6 text-lg">
            Join thousands of writers sharing their stories on BXARCHI
          </p>
          <Link 
            href="/books/new" 
            className="inline-block px-8 py-3 bg-white text-indigo-600 rounded-md hover:bg-gray-100 font-medium text-lg"
          >
            Publish Your Book
          </Link>
        </div>
      </div>
    </div>
  );
}
