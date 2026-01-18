
'use client';

import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Loader2, LayoutGrid, Users, Briefcase, LogOut, Building } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { usePathname } from 'next/navigation';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { profile, loading, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && profile?.role !== 'admin') {
      router.push('/dashboard');
    }
  }, [profile, loading, router]);

  if (loading || !profile || profile.role !== 'admin') {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Verifying admin access...</p>
        </div>
      </div>
    );
  }

  const navLinks = [
      { href: "/admin", label: "Dashboard", icon: <LayoutGrid className="h-4 w-4"/> },
      { href: "/admin/users", label: "User Management", icon: <Users className="h-4 w-4"/> },
      { href: "/admin/services", label: "Service Moderation", icon: <Briefcase className="h-4 w-4"/> },
  ];

  return (
    <div className="flex min-h-screen bg-muted/30">
        <aside className="w-64 flex-shrink-0 border-r bg-background hidden md:flex md:flex-col">
            <div className="flex h-full flex-col">
                <div className="p-4 border-b h-20 flex items-center">
                    <h1 className="text-2xl font-bold text-primary flex items-center gap-2"><Building /> Admin</h1>
                </div>
                <nav className="flex-1 space-y-1 p-2">
                    {navLinks.map(link => (
                        <Link key={link.href} href={link.href} passHref>
                            <Button variant={pathname === link.href ? "secondary" : "ghost"} className="w-full justify-start gap-3">
                                {link.icon}
                                {link.label}
                            </Button>
                        </Link>
                    ))}
                </nav>
                <div className="mt-auto p-2 border-t">
                    <Button variant="ghost" className="w-full justify-start gap-3" onClick={logout}>
                        <LogOut className="h-4 w-4" />
                        Logout
                    </Button>
                </div>
            </div>
        </aside>
        <div className="flex-1 flex flex-col">
          <header className="h-20 border-b bg-background flex items-center px-6 md:hidden">
              <h1 className="text-2xl font-bold text-primary flex items-center gap-2"><Building /> Admin</h1>
          </header>
          <main className="flex-1 overflow-y-auto p-4 md:p-8">
              {children}
          </main>
        </div>
    </div>
  );
}
