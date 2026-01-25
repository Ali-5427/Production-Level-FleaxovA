
'use client';

import { useAuth } from '@/hooks/use-auth';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect } from 'react';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import {
  Loader2,
  LayoutGrid,
  Users,
  Briefcase,
  LogOut,
  Building,
  Bell,
  Search,
  DollarSign,
  Landmark,
  ShieldCheck,
} from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';


export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, profile, loading, logout } = useAuth();
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

  const getIsActive = (path: string) => {
    if (path === '/admin') return pathname === path;
    return pathname.startsWith(path);
  };

  const navLinks = [
    { href: "/admin", label: "Dashboard", icon: <LayoutGrid /> },
    { href: "/admin/users", label: "User Management", icon: <Users /> },
    { href: "/admin/services", label: "Service Moderation", icon: <Briefcase /> },
    { href: "/admin/revenue", label: "Revenue", icon: <DollarSign /> },
    { href: "/admin/withdrawals", label: "Withdrawals", icon: <Landmark /> },
    { href: "/admin/payment-verifications", label: "Payment Verifications", icon: <ShieldCheck /> },
  ];

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
          <div className="flex items-center gap-2">
            <Building />
            <Link href="/admin" className="text-xl font-bold text-primary">
              Admin
            </Link>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            {navLinks.map((link) => (
              <SidebarMenuItem key={link.href}>
                <SidebarMenuButton
                  asChild
                  tooltip={link.label}
                  isActive={getIsActive(link.href)}
                >
                  <Link href={link.href}>
                    {link.icon}
                    {link.label}
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton tooltip="Logout" onClick={logout}>
                <LogOut />
                Logout
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <header className="flex h-16 items-center justify-between border-b bg-background px-4">
          <div className="flex items-center gap-4">
            <SidebarTrigger />
            <div className="relative hidden md:block">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search..." className="pl-8" />
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon">
              <Bell className="h-5 w-5" />
              <span className="sr-only">Notifications</span>
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="relative h-8 w-8 rounded-full"
                >
                  <Avatar>
                    <AvatarImage
                      src={
                        profile?.avatarUrl ||
                        user?.photoURL ||
                        'https://picsum.photos/seed/user-avatar/100/100'
                      }
                      alt="Admin Avatar"
                    />
                    <AvatarFallback>
                      {profile?.fullName?.charAt(0) || 'A'}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>
                  {profile?.fullName || 'Admin Account'}
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/admin">Dashboard</Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout}>Logout</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
