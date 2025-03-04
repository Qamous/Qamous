import React from 'react';
import { Metadata } from 'next';
import { SpeedInsights } from "@vercel/speed-insights/react";
import { Analytics } from "@vercel/analytics/react";
import { Providers } from './providers';
import Header from '../components/Header';
import Footer from '../components/Footer';
import '../styles/globals.scss';

export const metadata: Metadata = {
  title: 'Qamous - Arabic Slang Dictionary',
  description: 'Explore Qamous, your go-to platform for learning Arabic slang and colloquial phrases. Discover a comprehensive Arabic dictionary for various dialects.',
  keywords: 'arabic slang, arabic dictionary, colloquial arabic, arabic phrases, arabic dialects, dictionary'
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <div className="app">
            <SpeedInsights />
            <Analytics />
            <div className="grain-texture"></div>
            <Header />
            <main className="content">
              {children}
            </main>
            <Footer />
          </div>
        </Providers>
      </body>
    </html>
  );
}