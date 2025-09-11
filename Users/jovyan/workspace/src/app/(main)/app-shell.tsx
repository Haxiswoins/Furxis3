
'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/header';
import { usePathname } from 'next/navigation';
import AdminSidebar from '@/components/admin-sidebar';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Menu } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet"
import { Skeleton } from '@/components/ui/skeleton';
import type { SiteContent } from '@/types';
import { PageAnimationWrapper } from '@/components/page-animation-wrapper';

export function AppShell({
  children,
  siteContent
}: {
  children: React.ReactNode;
  siteContent: SiteContent | null;
}) {
  const pathname = usePathname();
  const { user, loading } = useAuth();
  
  const isAdminRoute = pathname.startsWith('/admin');
  const isAuthRoute = ['/login', '/register', '/forgot-password'].includes(pathname) || pathname.startsWith('/api/auth');
  const isHomePage = pathname === '/home';
  
  if (loading) {
    return (
       <div className="flex items-center justify-center min-h-screen bg-background">
         <div className="w-full max-w-md space-y-4 p-4">
           <Skeleton className="h-12 w-full" />
           <Skeleton className="h-20 w-full" />
           <Skeleton className="h-20 w-full" />
         </div>
      </div>
    );
  }

  if (isAdminRoute) {
    if (user?.isAdmin) {
      return (
        <div className="min-h-screen flex bg-background">
          <div className="hidden md:block fixed h-full z-20">
            <AdminSidebar />
          </div>
          <div className="md:hidden fixed top-4 left-4 z-50">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">打开菜单</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="p-0 w-64">
                <AdminSidebar />
              </SheetContent>
            </Sheet>
          </div>
          <main className="flex-1 md:ml-64 max-w-screen-2xl mx-auto w-full">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
              {children}
            </div>
          </main>
        </div>
      );
    } else {
       return (
            <div className="flex flex-col items-center justify-center min-h-screen text-center bg-background">
                <h1 className="text-3xl font-bold">无权访问</h1>
                <p className="mt-2 text-muted-foreground">您必须是管理员才能访问此页面。</p>
            </div>
        )
    }
  }

  if (isAuthRoute) {
      return <>{children}</>;
  }

  // Special handling for the home page to allow the breathing aura to be visible
  if (isHomePage) {
      return (
          <div className="relative flex flex-col min-h-screen">
              <Header />
              <main className="relative z-10 flex flex-col flex-grow pt-24">
                  <PageAnimationWrapper>
                    {children}
                  </PageAnimationWrapper>
              </main>
          </div>
      );
  }

  // All other pages get the main wrapper with header and a solid background
  return (
      <div className="relative flex flex-col min-h-screen bg-background">
          <Header />
          <main className="relative z-10 flex flex-col flex-grow pt-24">
              <PageAnimationWrapper>
                {children}
              </PageAnimationWrapper>
          </main>
      </div>
  );
}
