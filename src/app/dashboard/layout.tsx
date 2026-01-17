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
  FileText,
  LayoutGrid,
  LogOut,
  Mail,
  Settings,
  User,
  Wallet,
  Search,
  Loader2
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
import { useAuth } from '@/hooks/use-auth';
import { usePathname } from 'next/navigation';
import { MessageProvider } from '@/context/MessageContext';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, profile, logout, loading } = useAuth();
  const pathname = usePathname();

  const getIsActive = (path: string) => {
    if (path === '/dashboard') return pathname === path;
    return pathname.startsWith(path);
  }

  const navLinks = [
    { href: "/dashboard", label: "Dashboard", icon: <LayoutGrid />, roles: ["client", "freelancer", "admin"] },
    { href: "/dashboard/services", label: "My Services", icon: <Briefcase />, roles: ["freelancer"] },
    { href: "/dashboard/my-applications", label: "My Applications", icon: <FileText />, roles: ["freelancer"] },
    { href: "/dashboard/my-jobs", label: "My Jobs", icon: <Briefcase />, roles: ["client"] },
    { href: "/dashboard/jobs", label: "Find Jobs", icon: <Search />, roles: ["client", "freelancer"] },
    { href: "/dashboard/messages", label: "Messages", icon: <Mail />, roles: ["client", "freelancer"] },
    { href: "/dashboard/wallet", label: "Wallet", icon: <Wallet />, roles: ["client", "freelancer"] },
  ];

  return (
    <MessageProvider>
      <SidebarProvider>
        <Sidebar>
          <SidebarHeader>
            <div className="flex items-center gap-2">
              <Link href="/dashboard" className="text-xl font-bold text-primary">Fleaxova</Link>
            </div>
          </SidebarHeader>
          <SidebarContent>
            <SidebarMenu>
              {navLinks.map((link) => {
                if (!profile || !link.roles.includes(profile.role)) return null;
                return (
                  <SidebarMenuItem key={link.href}>
                    <SidebarMenuButton asChild tooltip={link.label} isActive={getIsActive(link.href)}>
                      <Link href={link.href}>
                        {link.icon}
                        {link.label}
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarContent>
          <SidebarFooter>
            <SidebarMenu>
              <SidebarMenuItem>
                 <SidebarMenuButton asChild tooltip="Edit Profile" isActive={getIsActive('/dashboard/profile')}>
                    <Link href="/dashboard/profile">
                      <User />
                      Edit Profile
                    </Link>
                  </SidebarMenuButton>
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
                        src={profile?.avatarUrl || user?.photoURL || "https://picsum.photos/seed/user-avatar/100/100"}
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
            {loading ? (
              <div className="flex items-center justify-center h-full">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (
              children
            )}
          </main>
        </SidebarInset>
      </SidebarProvider>
    </MessageProvider>
  );
}
