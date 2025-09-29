
'use client';

import { Suspense, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ChevronLeft, LogIn } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';

function LoginPageContent() {
  const router = useRouter();
  const { user, loading, login } = useAuth();
  const searchParams = useSearchParams();
  const returnTo = searchParams.get('returnTo') || '/home';

  useEffect(() => {
    // If the user is somehow logged in, redirect them away.
    if (user && !loading) {
      router.replace(user.isAdmin ? '/admin/dashboard' : returnTo);
    }
  }, [user, loading, router, returnTo]);

  const handleLogin = () => {
    login(returnTo);
  };
  
  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="absolute top-4 left-4">
          <Button variant="ghost" size="icon" onClick={() => router.push('/')} className="h-12 w-12 rounded-full">
            <ChevronLeft className="h-6 w-6" />
          </Button>
      </div>
      <Card className="w-full max-w-md shadow-2xl text-center">
          <CardHeader>
            <CardTitle className="text-3xl font-headline">需要登录</CardTitle>
            <CardDescription>请登录或注册以继续。</CardDescription>
          </CardHeader>
          <CardContent>
              <p className="text-muted-foreground">
                  您需要一个账户才能访问此页面。点击下方按钮前往登录或注册。
              </p>
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button onClick={handleLogin} className="w-full" size="lg" disabled={loading}>
                {loading ? '加载中...' : <><LogIn className="mr-2" /> 前往登录</>}
            </Button>
            <p className="text-xs text-muted-foreground px-4">
              继续操作即表示您已阅读并同意我们的{' '}
              <Link href="/privacy" className="underline hover:text-primary" target="_blank" rel="noopener noreferrer">
                《隐私政策》
              </Link>
              。
            </p>
          </CardFooter>
      </Card>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div>加载中...</div>}>
      <LoginPageContent />
    </Suspense>
  );
}
