'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Loader from '@/components/ui/Loader';

export default function ExternalReadPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  
  // Redirect to browse page since OpenLibrary reader is deprecated
  useEffect(() => {
    router.push('/browse');
  }, [router]);

  return <Loader />;
}

