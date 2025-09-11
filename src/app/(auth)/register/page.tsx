
'use client';

import { Suspense, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { ChevronLeft } from 'lucide-react';
import Link from 'next/link';


function RegisterPageContent() {
  const router = useRouter();
  const { user, loading, login } = useAuth();
  const searchParams = useSearchParams();
  const returnTo = searchParams.get('returnTo') || '/home';
  
  useEffect(() => {
    if (user && !loading) {
      router.replace(returnTo);
    }
  }, [user, loading, router, returnTo]);
  
  const handleRegister = () => {
    login(returnTo);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
       <div className="absolute top-4 left-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()} className="h-12 w-12 rounded-full">
            <ChevronLeft className="h-6 w-6" />
          </Button>
      </div>
      <Card className="w-full max-w-md shadow-2xl text-center">
          <CardHeader>
            <CardTitle className="text-3xl font-headline">创建账户</CardTitle>
            <CardDescription>加入我们，开启您的新旅程。</CardDescription>
          </CardHeader>
          <CardContent>
             <p className="text-muted-foreground">
                我们的注册和登录流程由 Authing 提供支持。点击下方按钮前往安全页面进行注册。
             </p>
          </CardContent>
          <CardFooter className="flex-col gap-4">
            <Button onClick={handleRegister} className="w-full" size="lg" disabled={loading}>
              {loading ? '加载中...' : '前往注册或登录'}
            </Button>
            <p className="text-xs text-muted-foreground px-4">
              继续操作即表示您已阅读并同意我们的{' '}
              <Link href="/privacy" className="underline hover:text-primary" target="_blank">
                《隐私政策》
              </Link>
              。
            </p>
          </CardFooter>
      </Card>
    </div>
  );
}

export default function RegisterPage() {
    return (
        <Suspense fallback={<div>加载中...</div>}>
            <RegisterPageContent />
        </Suspense>
    )
}
