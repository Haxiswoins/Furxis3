
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
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
import { Badge } from '@/components/ui/badge';
import { Edit, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { deleteOrder, getAllOrders } from '@/lib/data-service';
import type { Order } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { useTheme } from '@/context/ThemeContext';
import { Skeleton } from '@/components/ui/skeleton';

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
};

function AdminOrdersPageSkeleton() {
    return (
         <div>
            <div className="flex justify-between items-center mb-6">
                <Skeleton className="h-9 w-48" />
            </div>
            <div className="border rounded-lg">
                 <Table>
                    <TableHeader>
                        <TableRow>
                            {[...Array(7)].map((_, i) => <TableHead key={i}><Skeleton className="h-5 w-full" /></TableHead>)}
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {[...Array(5)].map((_, i) => (
                             <TableRow key={i}>
                                {[...Array(6)].map((_, j) => <TableCell key={j}><Skeleton className="h-5 w-full" /></TableCell>)}
                                <TableCell className="text-right">
                                    <div className="flex justify-end gap-2">
                                        <Skeleton className="h-8 w-8" />
                                        <Skeleton className="h-8 w-8" />
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                 </Table>
            </div>
        </div>
    )
}

export default function AdminOrdersPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { theme } = useTheme();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  const statusStyles = theme === 'dark' ? darkStatusStyles : lightStatusStyles;

  useEffect(() => {
    async function fetchOrders() {
        setLoading(true);
        try {
            const data = await getAllOrders();
            setOrders(data);
        } catch (error) {
            toast({ title: '加载订单失败', description: '无法从服务器获取数据。', variant: 'destructive' });
        } finally {
            setLoading(false);
        }
    }
    fetchOrders();
  }, [toast]);
  
  const handleDelete = async (id: string) => {
    setIsDeleting(id);
    try {
        await deleteOrder(id);
        setOrders(prevOrders => prevOrders.filter(o => o.id !== id));
        toast({ title: '删除成功', description: '订单已从数据库中移除。' });
    } catch (error) {
        toast({ title: '删除失败', description: '操作失败，请稍后重试。', variant: 'destructive' });
    } finally {
        setIsDeleting(null);
    }
  };

  if (loading) {
      return <AdminOrdersPageSkeleton />;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-headline">所有订单管理</h1>
      </div>
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>订单号</TableHead>
              <TableHead>产品名称</TableHead>
              <TableHead>类型</TableHead>
              <TableHead>状态</TableHead>
              <TableHead>总价</TableHead>
              <TableHead>下单日期</TableHead>
              <TableHead className="text-right">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.length > 0 ? (
              orders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-mono text-xs">{order.orderNumber}</TableCell>
                  <TableCell className="font-medium">{order.productName}</TableCell>
                  <TableCell>{order.orderType}</TableCell>
                  <TableCell>
                      <Badge variant="outline" className={cn("text-xs", statusStyles[order.status])}>{order.status}</Badge>
                  </TableCell>
                  <TableCell>¥{order.total}</TableCell>
                  <TableCell>{new Date(order.orderDate).toLocaleDateString()}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => router.push(`/admin/orders/edit/${order.id}`)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                         <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-500" disabled={!!isDeleting}>
                           <Trash2 className="h-4 w-4" />
                         </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>确定要删除吗?</AlertDialogTitle>
                          <AlertDialogDescription>
                            此操作无法撤销。这将永久删除订单 "{order.orderNumber}"。
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>取消</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDelete(order.id)} disabled={isDeleting === order.id}>
                            {isDeleting === order.id ? '删除中...' : '确认删除'}
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="text-center h-24">
                  没有找到任何订单。
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
