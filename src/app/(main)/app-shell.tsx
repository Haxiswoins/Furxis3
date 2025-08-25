
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
import Image from 'next/image';
import type { SiteContent } from '@/types';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { AestheticFluidBackground } from '@/components/aesthetic-fluid-background';


function MainContentWrapper({
  children,
  siteContent
}: {
  children: React.ReactNode;
  siteContent: SiteContent | null;
}) {
  const pathname = usePathname();
  const isHomePage = pathname === '/home';
  const hasHomeBg = isHomePage && siteContent?.homeBackgroundImageUrl;

  return (
    <>
      {/* Background Effects Layer */}
      <div className="fixed inset-0 z-0 overflow-hidden">
         {isHomePage && <AestheticFluidBackground />}
        {hasHomeBg && (
          <div className="absolute inset-0 z-5">
              <Image
                  src={siteContent.homeBackgroundImageUrl!}
                  alt="Homepage Background"
                  fill
                  style={{ objectFit: 'cover' }}
                  className="opacity-20"
              />
              <div className="absolute inset-0 bg-background/50"></div>
          </div>
        )}
      </div>

      {/* Content Layer */}
      <main className={cn(
          "relative z-20 flex-1 flex flex-col px-4 py-8 pt-24 min-h-[calc(100vh-theme(spacing.24))]"
        )}>
          {children}
        </main>
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

  if (isLandingPage || isAuthRoute) {
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

  return (
      <motion.div
          key={pathname}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: 'easeInOut' }}
      >
          <Header />
          <MainContentWrapper siteContent={siteContent}>
              {children}
          </MainContentWrapper>
      </motion.div>
  );
}
