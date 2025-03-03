'use client';

import React, { Suspense } from 'react';
import dynamic from 'next/dynamic';
import { useTranslation } from 'react-i18next';
import { LoadingFallback } from '../components/LoadingFallback';

// Dynamic import for the Home component
const Home = dynamic(() => import('../../pages/Home'), {
  loading: () => <LoadingFallback />,
  ssr: false // Disable SSR for components that rely on browser APIs
});

export default function HomePage() {
  const { t } = useTranslation();
  
  return (
    <Suspense fallback={<LoadingFallback />}>
      <Home />
    </Suspense>
  );
}