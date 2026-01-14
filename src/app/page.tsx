
"use client";

import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { ArrowRight, Briefcase, Search, Star, Zap, Users, ShieldCheck } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { useAuth } from '@/hooks/use-auth';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export default function Home() {
  const { user, logout } = useAuth();

  return (
    <div className="bg-background text-foreground">
      {/* Header */}
      <header className="container mx-auto flex h-20 items-center justify-between px-4 md:px-6">
        <Link href="/" className="text-2xl font-bold text-primary">
          Fleaxova
        </Link>
        <nav className="hidden items-center gap-6 md:flex">
          <Link
            href="/services"
            className="text-sm font-medium hover:text-primary"
          >
            Find Talent
          </Link>
          <Link
            href="/jobs"
            className="text-sm font-medium hover:text-primary"
          >
            Find Work
          </Link>
          <Link href="#why-fleaxova" className="text-sm font-medium hover:text-primary">
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
                      src={user.photoURL || "https://picsum.photos/seed/user-avatar/100/100"}
                      alt="User Avatar"
                    />
                    <AvatarFallback>{user.displayName?.charAt(0) || 'U'}</AvatarFallback>
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

      {/* Hero Section */}
      <main>
        <section className="container mx-auto grid grid-cols-1 items-center gap-8 px-4 py-16 text-center md:grid-cols-2 md:py-24 md:text-left">
          <div className="space-y-6">
            <h1 className="text-4xl font-bold tracking-tight md:text-5xl lg:text-6xl">
              Find & Hire Expert Freelancers for Any Job
            </h1>
            <p className="text-lg text-muted-foreground">
              Unlock your project’s potential with our global network of skilled professionals.
              Post a job, get proposals, and collaborate with ease.
            </p>
            <div className="flex flex-col gap-4 sm:flex-row sm:justify-center md:justify-start">
              <Button size="lg" className="bg-accent hover:bg-accent/90" asChild>
                <Link href="/register">
                  Get Started <ArrowRight className="ml-2" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/services">Browse Services</Link>
              </Button>
            </div>
          </div>
          <div className="relative h-80 w-full md:h-96">
            <Image
              src="https://picsum.photos/seed/hero/600/400"
              alt="Freelancers collaborating"
              fill
              className="rounded-lg object-cover"
              data-ai-hint="collaboration team"
            />
          </div>
        </section>

        {/* How it works */}
        <section id="how-it-works" className="bg-secondary py-20">
          <div className="container mx-auto px-4 md:px-6">
            <h2 className="mb-12 text-center text-3xl font-bold">How It Works</h2>
            <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-4">
                    <div className="rounded-full bg-primary/10 p-3">
                      <Briefcase className="h-6 w-6 text-primary" />
                    </div>
                    <CardTitle>1. Post a Job</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Describe your project and the skills you need. Our system will match you with
                    the right talent.
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-4">
                    <div className="rounded-full bg-primary/10 p-3">
                      <Search className="h-6 w-6 text-primary" />
                    </div>
                    <CardTitle>2. Hire Freelancers</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Browse proposals, review profiles, and interview your top candidates to find the
                    perfect fit.
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-4">
                    <div className="rounded-full bg-primary/10 p-3">
                      <Star className="h-6 w-6 text-primary" />
                    </div>
                    <CardTitle>3. Collaborate & Pay</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Use our platform to track progress, communicate, and pay securely upon project
                    completion.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
        
        {/* Why Fleaxova Section */}
        <section id="why-fleaxova" className="py-20">
          <div className="container mx-auto px-4 md:px-6">
            <h2 className="mb-12 text-center text-3xl font-bold">Why Fleaxova?</h2>
            <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
              <Card className="text-center">
                <CardHeader>
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                    <Zap className="h-6 w-6 text-primary" />
                  </div>
                </CardHeader>
                <CardContent>
                  <h3 className="text-xl font-bold mb-2">Fast & Efficient</h3>
                  <p className="text-muted-foreground">
                    Connect with top talent quickly and streamline your workflow with our intuitive platform.
                  </p>
                </CardContent>
              </Card>
              <Card className="text-center">
                <CardHeader>
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                    <Users className="h-6 w-6 text-primary" />
                  </div>
                </CardHeader>
                <CardContent>
                  <h3 className="text-xl font-bold mb-2">Global Talent Pool</h3>
                  <p className="text-muted-foreground">
                    Access a diverse network of skilled professionals from around the world, ready to tackle any project.
                  </p>
                </CardContent>
              </Card>
              <Card className="text-center">
                <CardHeader>
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                    <ShieldCheck className="h-6 w-6 text-primary" />
                  </div>
                </CardHeader>
                <CardContent>
                  <h3 className="text-xl font-bold mb-2">Secure & Reliable</h3>
                  <p className="text-muted-foreground">
                    Collaborate with confidence using our secure payment system and transparent review process.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-muted py-12">
        <div className="container mx-auto flex flex-col items-center justify-between gap-6 px-4 text-center md:flex-row md:text-left">
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} Fleaxova. All rights reserved.
          </p>
          <div className="flex gap-6">
            <Link href="#" className="text-sm hover:text-primary">
              Terms of Service
            </Link>
            <Link href="#" className="text-sm hover:text-primary">
              Privacy Policy
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
