import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import HeroCarousel from '@/components/home/HeroCarousel';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Navigation */}
      <Navbar />

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
              <Link 
                href="/books/new" 
                className="bg-indigo-600 text-white px-8 py-4 rounded-md text-lg font-medium hover:bg-indigo-700 shadow-lg transition-all hover:scale-105"
              >
                Start Writing
              </Link>
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

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-4">BXARCHI</h3>
              <p className="text-gray-400">A platform for writers and readers to connect and share stories.</p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">For Writers</h4>
              <ul className="space-y-2">
                <li><Link href="/books/new" className="text-gray-400 hover:text-white">Publish Your Book</Link></li>
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
            <p>© {new Date().getFullYear()} BXARCHI. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
