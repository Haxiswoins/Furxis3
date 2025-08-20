
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
    // If the user is somehow logged in, redirect them away.
    if (user && !loading) {
      router.replace(user.isAdmin ? '/admin/dashboard' : '/home');
    }
  }, [user, loading, router]);


  const handleLogin = async () => {
    // This now shows a toast message that the feature is disabled
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
            <CardTitle className="text-3xl font-headline">登录/注册</CardTitle>
            <CardDescription>用户认证功能当前已临时禁用。</CardDescription>
          </CardHeader>
          <CardContent>
              <p className="text-muted-foreground">
                  由于一个持续存在的依赖项安装问题，用户认证系统已被临时禁用。我们正在努力解决这个问题。
              </p>
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button onClick={handleLogin} className="w-full" size="lg" disabled={loading}>
                {loading ? '加载中...' : <><LogIn className="mr-2" /> 尝试登录</>}
            </Button>
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
