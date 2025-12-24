'use client';

import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import Navbar from '@/components/layout/Navbar';
import Link from 'next/link';
import { generateBookPlaceholder } from '@/lib/utils/placeholderGenerator';

export const dynamic = 'force-dynamic';

function GutendexBookContent() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const gutendexId = params.id as string;
  
  // Get book info from URL params (passed from browse page)
  const title = searchParams.get('title') || 'Classic Literature';
  const author = searchParams.get('author') || 'Unknown Author';
  const cover = searchParams.get('cover') || '';
  const genre = searchParams.get('genre') || 'literature';
  const subjects = searchParams.get('subjects') || '';
  
  // Use the cover from URL or generate a placeholder
  const coverImage = cover || generateBookPlaceholder(title, author);
  
  // Generate a short description based on available info
  const generateDescription = () => {
    const subjectList = subjects ? subjects.split(',').slice(0, 3) : [];
    
    if (subjectList.length > 0) {
      return `A classic work exploring themes of ${subjectList.join(', ').toLowerCase()}. This timeless piece of ${genre} literature has captivated readers for generations.`;
    }
    
    const descriptions: Record<string, string> = {
      fiction: `An engaging work of fiction with compelling characters and vivid storytelling. This classic novel showcases the timeless art of narrative craft.`,
      fantasy: `A magical tale that transports readers to extraordinary worlds filled with wonder and adventure.`,
      thriller: `A gripping tale of suspense and intrigue that keeps readers on the edge of their seats.`,
      history: `A fascinating exploration of historical events and figures that shaped our world.`,
      poetry: `A beautiful collection of verse that captures the essence of human emotion and experience.`,
      drama: `A powerful dramatic work that explores the depths of human nature and relationships.`,
      biography: `An intimate portrait of a remarkable life, offering insights into experiences and achievements.`,
      philosophy: `A thought-provoking exploration of fundamental questions about existence and ethics.`,
      science: `An illuminating work that makes complex scientific concepts accessible and engaging.`,
      literature: `A masterpiece of world literature that offers profound insights into the human condition.`,
    };
    
    return descriptions[genre] || descriptions.literature;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 py-8">
        <button onClick={() => router.back()} className="flex items-center text-gray-600 hover:text-indigo-600 mb-6">
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back
        </button>

        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="md:flex">
            <div className="md:w-1/3 bg-gradient-to-br from-purple-100 to-indigo-100 p-8 flex items-center justify-center">
              <img src={coverImage} alt={title} className="w-56 h-80 object-cover rounded-lg shadow-xl"
                onError={(e) => { (e.target as HTMLImageElement).src = generateBookPlaceholder(title, author); }} />
            </div>
            <div className="md:w-2/3 p-8">
              <span className="inline-flex items-center px-3 py-1 text-sm font-bold bg-purple-100 text-purple-700 rounded-full mb-4">📚 Open Library</span>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{title}</h1>
              <p className="text-xl text-gray-600 mb-4">by {author}</p>
              <span className="inline-block px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm font-medium mb-4 capitalize">{genre}</span>
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <h3 className="font-semibold text-gray-800 mb-2">About this book</h3>
                <p className="text-gray-600 leading-relaxed">{generateDescription()}</p>
              </div>
              {subjects && (
                <div className="mb-4">
                  <h3 className="text-sm font-semibold text-gray-700 mb-2">Topics:</h3>
                  <div className="flex flex-wrap gap-2">
                    {subjects.split(',').slice(0, 5).map((s, i) => (
                      <span key={i} className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-sm">{s.trim()}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
          <div className="border-t bg-amber-50 px-8 py-5">
            <div className="flex items-center gap-3">
              <span className="text-2xl">🚧</span>
              <div>
                <p className="font-bold text-amber-800">In-App Reading Coming Soon!</p>
                <p className="text-amber-700 text-sm">For now, read this book on Open Library.</p>
              </div>
            </div>
          </div>
          <div className="px-8 py-5 bg-gray-50 flex flex-col sm:flex-row gap-3">
            <a href={`https://openlibrary.org/works/${gutendexId}`} target="_blank" rel="noopener noreferrer"
              className="flex-1 flex items-center justify-center gap-2 px-5 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 font-medium">
              📖 Read on Open Library
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
            <Link href="/browse" className="flex-1 flex items-center justify-center gap-2 px-5 py-3 bg-white border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-100 font-medium">
              🔍 Browse More
            </Link>
          </div>
          <div className="bg-green-50 border-t border-green-200 px-8 py-3">
            <p className="text-sm text-green-700 text-center">✨ <strong>Public Domain:</strong> Free to read and share.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function GutendexBookPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50 flex items-center justify-center">Loading...</div>}>
      <GutendexBookContent />
    </Suspense>
  );
}
