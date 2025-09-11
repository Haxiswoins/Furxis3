
"use client";

import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft, User, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { ShareButton } from './share-button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

export default function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const { user, login } = useAuth();
  const isLoggedIn = !!user;
  const isAdmin = user?.isAdmin || false;

  // Show back button on all pages except for the main landing page and home.
  const showBackButton = !['/', '/home'].includes(pathname) && !pathname.startsWith('/admin');

  const renderUserButton = () => {
    if (isLoggedIn) {
      return (
         <Button
            variant="ghost"
            size="icon"
            className="rounded-full h-12 w-12 bg-card/30 backdrop-blur-md hover:bg-card/50"
            aria-label="个人资料"
            onClick={() => router.push('/profile')}
        >
            <User className="h-6 w-6" />
        </Button>
      )
    }

    return (
      <AlertDialog>
        <AlertDialogTrigger asChild>
           <Button
              variant="ghost"
              size="icon"
              className="rounded-full h-12 w-12 bg-card/30 backdrop-blur-md hover:bg-card/50"
              aria-label="登录或注册"
          >
              <User className="h-6 w-6" />
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>服务条款确认</AlertDialogTitle>
            <AlertDialogDescription>
              进行登录或注册操作即表示您已阅读并同意我们的{' '}
              <Link href="/privacy" className="underline hover:text-primary" target="_blank">
                《隐私政策》
              </Link>
              。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction onClick={() => login()}>
              确认并继续
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    )
  }

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
        {renderUserButton()}
      </div>
    </header>
  );
}
