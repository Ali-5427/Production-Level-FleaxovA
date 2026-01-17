
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
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetClose,
  SheetTitle,
} from '@/components/ui/sheet';
import { Menu } from 'lucide-react';
import { Separator } from '../ui/separator';

export function PublicHeader() {
  const { user, profile, logout } = useAuth();

  const navLinks = (
    <>
      <SheetClose asChild>
        <Link
          href="/services"
          className="text-sm font-medium hover:text-primary transition-colors"
        >
          Find Talent
        </Link>
      </SheetClose>
      <SheetClose asChild>
        <Link
          href="/jobs"
          className="text-sm font-medium hover:text-primary transition-colors"
        >
          Find Work
        </Link>
      </SheetClose>
      <SheetClose asChild>
        <Link
          href="/#why-fleaxova"
          className="text-sm font-medium hover:text-primary transition-colors"
        >
          Why Fleaxova
        </Link>
      </SheetClose>
    </>
  );

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur-sm">
      <div className="container mx-auto flex h-20 items-center justify-between px-4 md:px-6">
        <Link href="/" className="text-2xl font-bold text-primary">
          Fleaxova
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden items-center gap-6 md:flex">
          <Link
            href="/services"
            className="text-sm font-medium hover:text-primary transition-colors"
          >
            Find Talent
          </Link>
          <Link
            href="/jobs"
            className="text-sm font-medium hover:text-primary transition-colors"
          >
            Find Work
          </Link>
          <Link
            href="/#why-fleaxova"
            className="text-sm font-medium hover:text-primary transition-colors"
          >
            Why Fleaxova
          </Link>
        </nav>

        <div className="flex items-center gap-2">
          <div className="hidden items-center gap-4 md:flex">
            {user ? (
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
                          user.photoURL ||
                          'https://picsum.photos/seed/user-avatar/100/100'
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
            ) : (
              <>
                <Button variant="ghost" asChild>
                  <Link href="/signin">Log In</Link>
                </Button>
                <Button asChild>
                  <Link href="/register">Sign Up</Link>
                </Button>
              </>
            )}
          </div>

          {/* Mobile Navigation */}
          <div className="md:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-6 w-6" />
                  <span className="sr-only">Open menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right">
                <SheetTitle className="sr-only">Mobile Navigation</SheetTitle>
                <SheetClose asChild>
                  <Link href="/" className="text-2xl font-bold text-primary">
                    Fleaxova
                  </Link>
                </SheetClose>
                <div className="mt-8 flex flex-col gap-6">
                  {navLinks}
                  <Separator />
                  {user ? (
                    <>
                      <SheetClose asChild>
                        <Link href="/dashboard" className="font-medium">Dashboard</Link>
                      </SheetClose>
                       <SheetClose asChild>
                        <Link href="/dashboard/profile" className="font-medium">Profile</Link>
                      </SheetClose>
                      <SheetClose asChild>
                        <button onClick={() => { logout(); }} className="text-left font-medium">
                          Logout
                        </button>
                      </SheetClose>
                    </>
                  ) : (
                    <>
                      <SheetClose asChild>
                        <Button variant="ghost" asChild className="justify-start">
                          <Link href="/signin">Log In</Link>
                        </Button>
                      </SheetClose>
                      <SheetClose asChild>
                        <Button asChild>
                          <Link href="/register">Sign Up</Link>
                        </Button>
                      </SheetClose>
                    </>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}

    