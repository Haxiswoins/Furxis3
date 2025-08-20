
'use client';

import { Suspense, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ChevronLeft, LogIn } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';

function LoginPageContent() {
  const router = useRouter();
  const { user, loading, login } = useAuth();

  useEffect(() => {
    // If the user is already logged in, redirect them away from the login page.
    if (user && !loading) {
      router.replace(user.isAdmin ? '/admin/dashboard' : '/home');
    }
  }, [user, loading, router]);


  const handleLogin = async () => {
    // This will redirect to the Authing hosted login page
    await login();
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
            <CardTitle className="text-3xl font-headline">欢迎回来</CardTitle>
            <CardDescription>登录以继续您的旅程。</CardDescription>
          </CardHeader>
          <CardContent>
              <p className="text-muted-foreground">
                  我们的登录系统由 Authing 提供。点击下方按钮将跳转到安全的登录页面。
              </p>
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button onClick={handleLogin} className="w-full" size="lg" disabled={loading}>
                {loading ? '加载中...' : <><LogIn className="mr-2" /> 前往登录</>}
            </Button>
            <p className="text-xs text-muted-foreground">
              还没有账户？{' '}
              <Link href="/register" className="text-primary hover:underline">
                注册
              </Link>
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
