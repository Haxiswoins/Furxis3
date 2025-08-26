
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

function MainContentWrapper({
  children,
  siteContent
}: {
  children: React.ReactNode;
  siteContent: SiteContent | null;
}) {
  return (
    <>
      <Header />
      <div className="relative z-10 flex flex-col min-h-screen bg-transparent">
        <main className="flex-1 flex flex-col justify-center">
          {children}
        </main>
      </div>
    </>
  );
}


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
  
  // This is a special case since the root page (/) is now the landing page, and should not have the shell
  const isLandingPage = pathname === '/';

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

  // The root path "/" is now handled by its own page component entirely.
  // We check if the route is NOT the root page to apply the shell.
  if (isLandingPage) {
      return <>{children}</>;
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
          <main className="flex-1 md:ml-64">
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

  // All other pages get the main wrapper with header and background
  return (
      <div className="bg-background">
          <MainContentWrapper siteContent={siteContent}>
              {children}
          </MainContentWrapper>
      </div>
  );
}
