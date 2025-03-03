'use client';

import React, { Suspense } from 'react';
import dynamic from 'next/dynamic';
import { LoadingFallback } from '../../../components/LoadingFallback';

const AdvancedSearch = dynamic(() => import('../../../../pages/AdvancedSearch'), {
  loading: () => <LoadingFallback />,
  ssr: false
});

export default function AdvancedSearchPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <AdvancedSearch />
    </Suspense>
  );
}