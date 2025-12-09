import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { AuthProvider } from '@/contexts/AuthContext';
import { UnreadProvider } from '@/contexts/UnreadContext';
import { ThemeProvider } from '@/contexts/ThemeContext';
import Footer from '@/components/layout/Footer';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'BXARCHI - Share and Discover Amazing Books',
  description: 'A platform for authors to publish their books and readers to discover and review them.',
  icons: {
    icon: '/favicon.png',
    shortcut: '/favicon.png',
    apple: '/favicon.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider><UnreadProvider>
          <ThemeProvider>
            <main className="min-h-screen">
              {children}
            </main>
            <Footer />
          </ThemeProvider>
        </UnreadProvider></AuthProvider>
      </body>
    </html>
  );
}
