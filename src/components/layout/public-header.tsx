
'use client';

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
import { useAuth } from '@/hooks/use-auth';
import Link from 'next/link';

export function PublicHeader() {
  const { user, profile, logout } = useAuth();

  return (
    <header className="container mx-auto flex h-20 items-center justify-between px-4 md:px-6">
      <Link href="/" className="text-2xl font-bold text-primary">
        Fleaxova
      </Link>
      <nav className="hidden items-center gap-6 md:flex">
        <Link href="/services" className="text-sm font-medium hover:text-primary">
          Find Talent
        </Link>
        <Link href="/jobs" className="text-sm font-medium hover:text-primary">
          Find Work
        </Link>
        <Link href="/#why-fleaxova" className="text-sm font-medium hover:text-primary">
          Why Fleaxova
        </Link>
      </nav>
      <div className="flex items-center gap-4">
        {user ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                <Avatar>
                  <AvatarImage
                    src={
                      user.photoURL || 'https://picsum.photos/seed/user-avatar/100/100'
                    }
                    alt="User Avatar"
                  />
                  <AvatarFallback>
                    {profile?.fullName?.charAt(0) || 'U'}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/dashboard">Dashboard</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/profile">Profile</Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={logout}>Logout</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <>
            <Button variant="ghost" asChild>
              <Link href="/login">Log In</Link>
            </Button>
            <Button asChild>
              <Link href="/register">Sign Up</Link>
            </Button>
          </>
        )}
      </div>
    </header>
  );
}
