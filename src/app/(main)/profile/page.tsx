

'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { ListOrdered, LogOut, Badge } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';

export default function ProfilePage() {
  const router = useRouter();
  const { user, logout, loading } = useAuth();
  const { toast } = useToast();

  const handleLogout = async () => {
    await logout();
    toast({
        title: "已退出登录",
        description: "您已成功退出。",
    });
    router.push('/');
  };
  
  if (loading) {
    return (
       <div className="max-w-2xl mx-auto w-full">
         <Card>
            <CardHeader className="text-center">
               <Skeleton className="w-24 h-24 mx-auto rounded-full" />
               <Skeleton className="h-8 w-32 mx-auto mt-4" />
               <Skeleton className="h-5 w-48 mx-auto mt-2" />
            </CardHeader>
             <CardContent className="mt-4 flex flex-col gap-4">
               <Skeleton className="h-12 w-full" />
               <Skeleton className="h-12 w-full" />
            </CardContent>
         </Card>
       </div>
    )
  }

  if (!user) {
    // This should ideally not happen if AuthProvider redirects, but as a fallback:
    router.push('/login');
    return null; 
  }

  return (
    <div className="max-w-2xl mx-auto w-full">
      <Card>
        <CardHeader className="text-center">
          <Avatar className="w-24 h-24 mx-auto mb-4 border-4 border-primary/50">
            {user.picture && <AvatarImage src={user.picture} alt={user.name || 'User'} />}
            <AvatarFallback>{user.name ? user.name.charAt(0).toUpperCase() : (user.email ? user.email.charAt(0).toUpperCase() : 'U')}</AvatarFallback>
          </Avatar>
          <CardTitle className="text-3xl font-headline">{user.name || '用户'}</CardTitle>
          <CardDescription>{user.email}</CardDescription>
        </CardHeader>
        <CardContent className="mt-4 flex flex-col gap-4">
          <Link href="/orders" passHref>
            <Button className="w-full" size="lg">
              <ListOrdered className="mr-2" />
              我的订单
            </Button>
          </Link>
          <Link href="/my-badges" passHref>
            <Button className="w-full" size="lg" variant="secondary">
              <Badge className="mr-2" />
              我的徽章
            </Button>
          </Link>
           <Button variant="outline" className="w-full" size="lg" onClick={handleLogout}>
              <LogOut className="mr-2" />
              退出登录
            </Button>
        </CardContent>
      </Card>
    </div>
  );
}
