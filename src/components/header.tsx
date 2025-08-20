
"use client";

import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft, User, ShieldCheck, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import QRCode from 'qrcode.react';
import { useEffect, useState } from 'react';

function ShareButton() {
    const [baseUrl, setBaseUrl] = useState('');

    useEffect(() => {
        // Ensure this runs only on the client
        setBaseUrl(window.location.origin);
    }, []);

    if (!baseUrl) {
        return null; // Or a disabled button
    }

    return (
         <Popover>
            <PopoverTrigger asChild>
                 <Button
                    variant="ghost"
                    size="icon"
                    className="rounded-full h-12 w-12 bg-card/30 backdrop-blur-md hover:bg-card/50"
                    aria-label="分享网站"
                >
                    <Share2 className="h-6 w-6" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto">
                <div className="p-4 flex flex-col items-center gap-4">
                     <p className="font-semibold text-center">扫描二维码分享网站</p>
                    <div className="p-2 bg-white rounded-md">
                        <QRCode value={baseUrl} size={128} />
                    </div>
                     <p className="text-xs text-muted-foreground text-center">{baseUrl}</p>
                </div>
            </PopoverContent>
        </Popover>
    )
}

export default function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const { user } = useAuth();
  const isLoggedIn = !!user;
  const isAdmin = user?.isAdmin || false;

  // Show back button on all pages except for the main landing page and home.
  const showBackButton = !['/', '/home'].includes(pathname) && !pathname.startsWith('/admin');

  return (
    <header className="fixed top-4 left-4 right-4 z-50 flex justify-between items-center">
      <div>
        {showBackButton && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.back()}
            className="rounded-full h-12 w-12 bg-card/30 backdrop-blur-md hover:bg-card/50"
            aria-label="返回"
          >
            <ChevronLeft className="h-6 w-6" />
          </Button>
        )}
      </div>
      <div className="flex items-center gap-2">
        <ShareButton />
        {isAdmin && (
           <Link href="/admin/dashboard" passHref>
             <Button
                variant="ghost"
                size="icon"
                className="rounded-full h-12 w-12 bg-card/30 backdrop-blur-md hover:bg-card/50"
                aria-label="后台管理"
              >
                <ShieldCheck className="h-6 w-6" />
              </Button>
          </Link>
        )}
        <Link href={isLoggedIn ? "/profile" : "/login"} passHref>
           <Button
              variant="ghost"
              size="icon"
              className="rounded-full h-12 w-12 bg-card/30 backdrop-blur-md hover:bg-card/50"
              aria-label="个人资料"
            >
              <User className="h-6 w-6" />
            </Button>
        </Link>
      </div>
    </header>
  );
}
