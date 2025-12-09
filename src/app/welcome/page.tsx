'use client';

import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import Link from 'next/link';

export default function WelcomePage() {
  const bullets = [
    'Beautiful book pages with unique styles and effects',
    'Old-paper, modern-glass, and animated themes',
    'A personal library that grows with you',
    'A simple, clean reading experience',
    'A world built for readers who love aesthetic books',
  ];

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-indigo-50 to-blue-100">
      <Navbar />

      <main className="flex-1">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <h1 className="text-4xl md:text-5xl font-extrabold text-center text-gray-900 mb-8">
            Welcome to <span className="text-indigo-600">BxArchi</span>
          </h1>
          <p className="text-xl text-center text-gray-700 mb-10">
            Where stories open like doors, and every page feels alive.
          </p>
          <p className="text-lg text-gray-700 leading-relaxed mb-8">
            BxArchi is your quiet corner of the internet — a place to read, collect, and explore books with style.
            Here you’ll find:
          </p>

          <ul className="list-disc list-inside space-y-2 text-gray-800 mb-8">
            {bullets.map((b,i)=>(<li key={i}>{b}</li>))}
          </ul>

          <p className="text-lg text-gray-700 leading-relaxed mb-16 italic text-center max-w-2xl mx-auto">
            “Books aren’t just pages — they’re portals.”
          </p>

          <div className="flex justify-center space-x-6">
            <Link href="/browse" className="px-6 py-3 bg-indigo-600 text-white rounded shadow hover:bg-indigo-700 transition">
              Start reading
            </Link>
            <Link href="/register" className="px-6 py-3 bg-white border border-gray-300 text-gray-700 rounded shadow hover:bg-gray-50 transition">
              Join &amp; collect
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
