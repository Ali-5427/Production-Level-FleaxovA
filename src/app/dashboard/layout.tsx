
'use client';

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
  Bell,
  Briefcase,
  LayoutGrid,
  LogOut,
  Mail,
  Settings,
  User,
  Wallet,
} from 'lucide-react';
import Link from 'next/link';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { usePathname } from 'next/navigation';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, profile, logout } = useAuth();
  const pathname = usePathname();

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
          <div className="flex items-center gap-2">
            <Link href="/dashboard" className="text-xl font-bold text-primary">Fleaxova</Link>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            <SidebarMenuItem>
              <Link href="/dashboard" passHref>
                <SidebarMenuButton asChild tooltip="Dashboard" isActive={pathname === '/dashboard'}>
                  <>
                    <LayoutGrid />
                    Dashboard
                  </>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
            {profile?.isSeller && (
              <SidebarMenuItem>
                <Link href="/dashboard/services" passHref>
                  <SidebarMenuButton asChild tooltip="My Services" isActive={pathname.startsWith('/dashboard/services')}>
                    <>
                      <Briefcase />
                      My Services
                    </>
                  </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>
            )}
            <SidebarMenuItem>
              <Link href="/dashboard/jobs" passHref>
                <SidebarMenuButton asChild tooltip="Find Jobs" isActive={pathname.startsWith('/dashboard/jobs')}>
                  <>
                    <Briefcase />
                    Find Jobs
                  </>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <Link href="/dashboard/messages" passHref>
                <SidebarMenuButton asChild tooltip="Messages" isActive={pathname === '/dashboard/messages'}>
                  <>
                    <Mail />
                    Messages
                  </>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <Link href="/dashboard/wallet" passHref>
                <SidebarMenuButton asChild tooltip="Wallet" isActive={pathname === '/dashboard/wallet'}>
                  <>
                    <Wallet />
                    Wallet
                  </>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter>
          <SidebarMenu>
            <SidebarMenuItem>
              <Link href="/dashboard/profile" passHref>
                <SidebarMenuButton asChild tooltip="Edit Profile" isActive={pathname === '/dashboard/profile'}>
                  <>
                    <User />
                    Edit Profile
                  </>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
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
              <Input
                placeholder="Search..."
                className="pl-8"
              />
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon">
              <Bell className="h-5 w-5" />
              <span className="sr-only">Notifications</span>
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar>
                    <AvatarImage
                      src={user?.photoURL || "https://picsum.photos/seed/user-avatar/100/100"}
                      alt="User Avatar"
                    />
                    <AvatarFallback>{profile?.fullName?.charAt(0) || 'U'}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>{profile?.fullName || 'My Account'}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/dashboard">Dashboard</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/dashboard/profile">Profile</Link>
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
