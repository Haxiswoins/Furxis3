
'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getAggregatedUserById, getOrdersByUserId, getUserBadges } from '@/lib/data-service';
import type { Order, UserBadge, Badge as BadgeType, AggregatedUser } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';
import { format } from 'date-fns';
import { ArrowLeft, Mail, Phone, User, Calendar, Hash } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTheme } from '@/context/ThemeContext';
import Link from 'next/link';

const lightStatusStyles: { [key: string]: string } = {
  '处理中': 'bg-blue-100 text-blue-800 border-blue-200',
  '退养中': 'bg-orange-100 text-orange-800 border-orange-200',
  '已发货': 'bg-yellow-100 text-yellow-800 border-yellow-200',
  '已完成': 'bg-green-100 text-green-800 border-green-200',
  '已取消': 'bg-red-100 text-red-800 border-red-200',
  '待确认': 'bg-purple-100 text-purple-800 border-purple-200',
  '已确认': 'bg-teal-100 text-teal-800 border-teal-200',
  '排队中': 'bg-cyan-100 text-cyan-800 border-cyan-200',
  '制作中': 'bg-indigo-100 text-indigo-800 border-indigo-200',
  '未中标': 'bg-gray-100 text-gray-800 border-gray-200',
};

const darkStatusStyles: { [key: string]: string } = {
  '处理中': 'bg-blue-500/20 text-blue-300 border-blue-500/30',
  '退养中': 'bg-orange-500/20 text-orange-300 border-orange-500/30',
  '已发货': 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
  '已完成': 'bg-green-500/20 text-green-300 border-green-500/30',
  '已取消': 'bg-red-500/20 text-red-300 border-red-500/30',
  '待确认': 'bg-purple-500/20 text-purple-300 border-purple-500/30',
  '已确认': 'bg-teal-500/20 text-teal-300 border-teal-500/30',
  '排队中': 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
  '制作中': 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
  '未中标': 'bg-gray-500/20 text-gray-300 border-gray-500/30',
};

function UserDetailPageSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-10 w-32" />
      <Card>
        <CardHeader>
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-5 w-64 mt-2" />
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}
          </div>
          <Skeleton className="h-20 w-full" />
        </CardContent>
      </Card>
      <Card>
        <CardHeader><Skeleton className="h-8 w-32" /></CardHeader>
        <CardContent>
           <div className="border rounded-lg">
                 <Table>
                    <TableHeader>
                        <TableRow>
                            {[...Array(5)].map((_, i) => <TableHead key={i}><Skeleton className="h-5 w-full" /></TableHead>)}
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {[...Array(2)].map((_, i) => (
                             <TableRow key={i}>
                                {[...Array(5)].map((_, j) => <TableCell key={j}><Skeleton className="h-5 w-full" /></TableCell>)}
                            </TableRow>
                        ))}
                    </TableBody>
                 </Table>
            </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function UserDetailPage() {
  const router = useRouter();
  const params = useParams();
  const userId = params.id as string;
  const { theme } = useTheme();
  
  const [user, setUser] = useState<AggregatedUser | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [badges, setBadges] = useState<(UserBadge & { badge?: BadgeType })[]>([]);
  const [loading, setLoading] = useState(true);

  const statusStyles = theme === 'dark' ? darkStatusStyles : lightStatusStyles;

  useEffect(() => {
    if (!userId) return;

    async function fetchData() {
      setLoading(true);
      try {
        const [userData, ordersData, badgesData] = await Promise.all([
          getAggregatedUserById(userId),
          getOrdersByUserId(userId),
          getUserBadges(userId),
        ]);
        setUser(userData);
        setOrders(ordersData);
        setBadges(badgesData);
      } catch (error) {
        console.error("Failed to fetch user details:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [userId]);

  if (loading) {
    return <UserDetailPageSkeleton />;
  }

  if (!user) {
    return (
      <div className="text-center">
        <h1 className="text-2xl font-bold">用户未找到</h1>
        <p className="text-muted-foreground">无法找到该用户的详细信息。</p>
        <Button onClick={() => router.back()} className="mt-4">返回</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
       <div>
         <Button variant="outline" onClick={() => router.push('/admin/users')}>
           <ArrowLeft className="mr-2 h-4 w-4" /> 返回用户列表
         </Button>
       </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-headline">{user.name}</CardTitle>
          <CardDescription>用户ID: <span className="font-mono text-xs">{user.id}</span></CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div className="flex items-center gap-2"><Mail className="text-muted-foreground" /> <span>{user.email}</span></div>
                <div className="flex items-center gap-2"><User className="text-muted-foreground" /> <span>{user.name}</span></div>
                <div className="flex items-center gap-2"><Calendar className="text-muted-foreground" /> <span>注册于 {format(new Date(user.registrationDate), 'yyyy-MM-dd')}</span></div>
            </div>
             <Card className="bg-muted/50">
                 <CardHeader>
                    <CardTitle className="text-base">订单统计</CardTitle>
                 </CardHeader>
                 <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div><p className="text-2xl font-bold">{user.completedOrders}</p><p className="text-xs text-muted-foreground">已完成订单</p></div>
                    <div><p className="text-2xl font-bold">{user.notSelectedOrders}</p><p className="text-xs text-muted-foreground">未中标订单</p></div>
                    <div><p className="text-2xl font-bold">{user.cancelledOrders}</p><p className="text-xs text-muted-foreground">已取消订单</p></div>
                 </CardContent>
             </Card>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader><CardTitle>持有徽章</CardTitle></CardHeader>
        <CardContent>
          {badges.length > 0 ? (
            <div className="flex flex-wrap gap-4">
              {badges.map(({ badge }) => badge ? (
                <div key={badge.id} className="flex flex-col items-center text-center gap-2 p-2 rounded-lg bg-muted">
                    <div className="relative h-20 w-20">
                        <Image src={badge.imageUrl} alt={badge.name} width={80} height={80} className="object-contain" />
                    </div>
                    <p className="text-xs font-semibold">{badge.name}</p>
                </div>
              ) : null)}
            </div>
          ) : (
            <p className="text-muted-foreground">该用户还没有徽章。</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>订单历史</CardTitle></CardHeader>
        <CardContent>
           <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>订单号</TableHead>
                  <TableHead>产品</TableHead>
                  <TableHead>类型</TableHead>
                  <TableHead>状态</TableHead>
                  <TableHead>日期</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.length > 0 ? orders.map(order => (
                  <Link key={order.id} href={`/admin/orders/edit/${order.id}`} passHref legacyBehavior>
                    <TableRow className="cursor-pointer">
                      <TableCell className="font-mono text-xs">{order.orderNumber}</TableCell>
                      <TableCell className="font-medium">{order.productName}</TableCell>
                      <TableCell>{order.orderType}</TableCell>
                      <TableCell><Badge variant="outline" className={cn("text-xs", statusStyles[order.status])}>{order.status}</Badge></TableCell>
                      <TableCell>{format(new Date(order.orderDate), 'yyyy-MM-dd')}</TableCell>
                    </TableRow>
                  </Link>
                )) : (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center h-24">该用户没有订单记录。</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

    </div>
  );
}
