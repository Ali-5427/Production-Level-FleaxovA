
'use client';

import { PublicHeader } from './public-header';

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <PublicHeader />
      <main className="flex-grow">{children}</main>
    </div>
  );
}
