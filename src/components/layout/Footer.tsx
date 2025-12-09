'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function Footer() {
  const [year, setYear] = useState<number>(new Date().getFullYear());

  // Keep year updated in case the site stays open across New Year
  useEffect(() => {
    const interval = setInterval(() => {
      const currentYear = new Date().getFullYear();
      setYear(currentYear);
    }, 1000 * 60 * 60); // check hourly
    return () => clearInterval(interval);
  }, []);

  return (
    <footer className="bg-gray-800 text-white py-12 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-xl font-bold mb-4">BXARCHI</h3>
            <p className="text-gray-400">A platform for writers and readers to connect and share stories.</p>
          </div>
          <div>
            <h4 className="font-semibold mb-4">For Writers</h4>
            <ul className="space-y-2">
              <li><Link href="/write" className="text-gray-400 hover:text-white">Publish Your Book</Link></li>
              <li><Link href="/resources" className="text-gray-400 hover:text-white">Writer Resources</Link></li>
              <li><Link href="/community" className="text-gray-400 hover:text-white">Community</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">For Readers</h4>
            <ul className="space-y-2">
              <li><Link href="/browse" className="text-gray-400 hover:text-white">Browse Books</Link></li>
              <li><Link href="/browse" className="text-gray-400 hover:text-white">Book Clubs</Link></li>
              <li><Link href="/browse" className="text-gray-400 hover:text-white">Recommendations</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Company</h4>
            <ul className="space-y-2">
              <li><Link href="/about" className="text-gray-400 hover:text-white">About Us</Link></li>
              <li><Link href="/contact" className="text-gray-400 hover:text-white">Contact</Link></li>
              <li><Link href="/privacy" className="text-gray-400 hover:text-white">Privacy Policy</Link></li>
              <li><Link href="/terms" className="text-gray-400 hover:text-white">Terms of Service</Link></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-700 mt-12 pt-8 text-center text-gray-400">
          <p>© {year} BXARCHI. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
