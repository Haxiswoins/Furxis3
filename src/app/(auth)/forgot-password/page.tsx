
'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ChevronLeft } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function ForgotPasswordPage() {
  const router = useRouter();
  
  // Note: Authing handles password reset via its hosted pages.
  // This page can now link to it or be removed.
  // For now, it will just be a placeholder.

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
        <div className="absolute top-4 left-4">
             <Button variant="ghost" size="icon" onClick={() => router.back()} className="h-12 w-12 rounded-full">
                <ChevronLeft className="h-6 w-6" />
             </Button>
        </div>
        <Card className="w-full max-w-md shadow-2xl">
            <CardHeader className="text-center">
                <CardTitle className="text-3xl font-headline">找回密码</CardTitle>
                <CardDescription>
                  密码重置功能已由 Authing 托管。请在登录页面点击“忘记密码”。
                </CardDescription>
            </CardHeader>
            <CardContent>
                <p className="text-center text-muted-foreground">
                    如果您需要找回密码，请返回登录页面，并使用登录框下方的“忘记密码”链接。
                </p>
            </CardContent>
            <CardFooter className="flex flex-col gap-4">
                <Link href="/api/auth/authing/login" passHref className="w-full">
                    <Button className="w-full" size="lg">
                        返回登录页面
                    </Button>
                </Link>
            </CardFooter>
        </Card>
    </div>
  );
}
