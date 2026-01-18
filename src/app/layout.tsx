
'use client';

import { Inter } from 'next/font/google';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { AuthProvider } from '@/context/AuthContext';
import { PublicHeader } from '@/components/layout/public-header';
import { usePathname } from 'next/navigation';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { Analytics } from '@vercel/analytics/react';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
});


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  const isDashboardArea = pathname.startsWith('/dashboard');
  const isAdminArea = pathname.startsWith('/admin');

  const showPublicHeader = !isDashboardArea && !isAdminArea;

  return (
    <html lang="en" className={inter.variable}>
      <head />
      <body className="font-sans antialiased">
        <AuthProvider>
            <div className="flex min-h-screen flex-col">
                {showPublicHeader && <PublicHeader />}
                <main className="flex-grow">{children}</main>
            </div>
            <Toaster />
        </AuthProvider>
        <SpeedInsights />
        <Analytics />
      </body>
    </html>
  );
}
