
'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ChevronLeft, Send } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useToast } from "@/hooks/use-toast";
import { useAuth } from '@/context/AuthContext';
import { useState } from 'react';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { resetPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await resetPassword(email);
      // For security reasons, we don't await the result and show a generic message.
    } catch (error: any) {
      // Even on error, we show a generic message to the user for security.
      // We can log the specific error for debugging if needed.
      console.error("Password reset attempt for", email, "resulted in client-side error:", error.code);
    } finally {
      // Always show a generic success message to prevent user enumeration attacks.
       toast({
        title: "重置链接已发送",
        description: "如果该邮箱已注册，您将收到一封邮件。",
      });
      setLoading(false);
      router.push('/login');
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
        <div className="absolute top-4 left-4">
             <Button variant="ghost" size="icon" onClick={() => router.back()} className="h-12 w-12 rounded-full">
                <ChevronLeft className="h-6 w-6" />
             </Button>
        </div>
        <Card className="w-full max-w-md shadow-2xl">
            <form onSubmit={handleResetPassword}>
            <CardHeader className="text-center">
                <CardTitle className="text-3xl font-headline">找回密码</CardTitle>
                <CardDescription>请输入您的邮箱以接收重置链接。</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="space-y-2">
                <Label htmlFor="email">邮箱</Label>
                <Input 
                  id="email" 
                  type="email" 
                  placeholder="you@example.com" 
                  required 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-4">
                <Button type="submit" className="w-full" size="lg" disabled={loading}>
                    {loading ? '发送中...' : <> <Send className="mr-2"/> 发送重置链接</>}
                </Button>
                <p className="text-xs text-muted-foreground">
                记起来了？{' '}
                <Link href="/login" className="text-primary hover:underline">
                    返回登录
                </Link>
                </p>
            </CardFooter>
            </form>
        </Card>
    </div>
  );
}
