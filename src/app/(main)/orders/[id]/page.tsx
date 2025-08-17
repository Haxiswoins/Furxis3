'use client';

import { useState, useEffect, useCallback } from 'react';
import { notFound, useRouter, useParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';
import { Separator } from '@/components/ui/separator';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useAuth } from '@/context/AuthContext';
import { getOrderById, reinstateOrder, getSiteContent, updateOrder } from '@/lib/data-service';
import type { Order, SiteContent } from '@/types';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from "@/hooks/use-toast";
import { useTheme } from '@/context/ThemeContext';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';

const lightStatusStyles: { [key: string]: string } = {
  '处理中': 'bg-blue-100 text-blue-800 border-blue-200',
  '待确认': 'bg-purple-100 text-purple-800 border-purple-200',
  '已确认': 'bg-teal-100 text-teal-800 border-teal-200',
  '排队中': 'bg-cyan-100 text-cyan-800 border-cyan-200',
  '制作中': 'bg-indigo-100 text-indigo-800 border-indigo-200',
  '退养中': 'bg-orange-100 text-orange-800 border-orange-200',
  '已发货': 'bg-yellow-100 text-yellow-800 border-yellow-200',
  '已完成': 'bg-green-100 text-green-800 border-green-200',
  '已取消': 'bg-red-100 text-red-800 border-red-200',
};

const darkStatusStyles: { [key: string]: string } = {
  '处理中': 'bg-blue-500/20 text-blue-300 border-blue-500/30',
  '待确认': 'bg-purple-500/20 text-purple-300 border-purple-500/30',
  '已确认': 'bg-teal-500/20 text-teal-300 border-teal-500/30',
  '排队中': 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
  '制作中': 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
  '退养中': 'bg-orange-500/20 text-orange-300 border-orange-500/30',
  '已发货': 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
  '已完成': 'bg-green-500/20 text-green-300 border-green-500/30',
  '已取消': 'bg-red-500/20 text-red-300 border-red-500/30',
};

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const orderId = params.id as string;
  const { theme } = useTheme();
  
  const [order, setOrder] = useState<Order | null>(null);
  const [siteContent, setSiteContent] = useState<SiteContent | null>(null);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);
  const [isPageLoading, setIsPageLoading] = useState(true);

  const statusStyles = theme === 'dark' ? darkStatusStyles : lightStatusStyles;

  const fetchOrderAndContent = useCallback(async () => {
    setIsPageLoading(true);
    try {
      const [orderData, contentData] = await Promise.all([
        getOrderById(orderId),
        getSiteContent()
      ]);

      if (orderData && orderData.userId === user!.uid) {
        setOrder(orderData);
        setSiteContent(contentData);
      } else {
        notFound();
      }
    } catch (error) {
      console.error("Failed to fetch order:", error);
      notFound();
    } finally {
      setIsPageLoading(false);
    }
  }, [orderId, user]);


  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.push('/login');
      return;
    }
    fetchOrderAndContent();
  }, [authLoading, user, router, fetchOrderAndContent]);

  const handleConfirmOrder = async () => {
    if (!order) return;
    setIsConfirming(true);
    try {
      await updateOrder(order.id, { status: '已确认' });
      toast({
        title: "确认成功！",
        description: "您的订单已确认，我们会尽快开始制作。",
      });
      fetchOrderAndContent(); // Refresh order details
    } catch (error) {
       console.error("确认失败:", error);
      toast({
        title: "确认失败",
        description: error instanceof Error ? error.message : "发生未知错误，请稍后重试。",
        variant: "destructive",
      });
    } finally {
      setIsConfirming(false);
    }
  };


  if (isPageLoading || authLoading) {
    return (
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <Skeleton className="h-9 w-48 mb-2" />
                <Skeleton className="h-5 w-64" />
              </div>
              <Skeleton className="h-7 w-20" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-8">
              <div className="md:w-1/3">
                <div className="relative aspect-[3/4] rounded-lg overflow-hidden bg-muted">
                  <Skeleton className="h-full w-full" />
                </div>
              </div>
              <div className="md:w-2/3 space-y-4">
                <Skeleton className="h-8 w-3/4" />
                <Skeleton className="h-6 w-24" />
                <Separator />
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <Skeleton className="h-5 w-1/2 mb-2" />
                    <Skeleton className="h-5 w-3/4" />
                  </div>
                  <div>
                    <Skeleton className="h-5 w-1/2 mb-2" />
                    <Skeleton className="h-5 w-3/4" />
                  </div>
                </div>
                <div>
                  <Skeleton className="h-5 w-1/4 mb-2" />
                  <Skeleton className="h-5 w-full" />
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-end gap-2">
            <Skeleton className="h-10 w-28" />
            <Skeleton className="h-10 w-28" />
          </CardFooter>
        </Card>
      </div>
    )
  }

  if (!order) {
    // This case handles after loading is complete but order is still null
    notFound();
    return null;
  }

  const handleCancelClick = () => {
    if (order.status === '处理中' || order.status === '已确认' || order.status === '待确认' || order.status === '排队中' || order.status === '制作中') {
      router.push(`/orders/${order.id}/cancel`);
    }
  };

  const handleUndoCancel = async () => {
    try {
      await reinstateOrder(order.id);
      fetchOrderAndContent(); // Refetch order to get latest state
      toast({ title: "操作成功", description: "订单已恢复处理中状态。" });
    } catch (error) {
      toast({ title: "操作失败", description: "恢复订单时出错，请稍后再试。", variant: 'destructive' });
    }
  };
  
  const renderCancelButton = () => {
    if (order.status === '处理中' || order.status === '已确认' || order.status === '待确认' || order.status === '排队中' || order.status === '制作中') {
      return (
        <Button variant="destructive" onClick={handleCancelClick}>申请退养/取消</Button>
      );
    }
    if (order.status === '退养中') {
      return (
        <>
           <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline">我不想退养了</Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>确定吗？</AlertDialogTitle>
                <AlertDialogDescription>
                  您确定要撤销退养申请吗？您的订单将恢复为“处理中”状态。
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>点错了</AlertDialogCancel>
                <AlertDialogAction onClick={handleUndoCancel}>确定</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
          <Button variant="destructive" disabled>申请退养/取消</Button>
        </>
      );
    }
    return (
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button variant="destructive">申请退养/取消</Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>无法取消</AlertDialogTitle>
            <AlertDialogDescription>
              订单已开始制作或已完成，无法在线取消。如有需要，请联系管理员处理。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction>好的</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    );
  };
  
  const contractText = order.orderType === '委托订单' 
      ? siteContent?.commissionContractText 
      : siteContent?.adoptionContractText;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-3xl font-headline">订单详情</CardTitle>
              <CardDescription>订单号: {order.orderNumber}</CardDescription>
            </div>
            <Badge variant="outline" className={statusStyles[order.status]}>{order.status}</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-8">
            <div className="md:w-1/3">
              <div className="relative aspect-[3/4] rounded-lg overflow-hidden bg-muted">
                {order.imageUrl ? (
                    <Image
                      src={order.imageUrl}
                      alt={order.productName}
                      fill
                      style={{ objectFit: 'cover' }}
                    />
                ) : (
                    <div className="flex items-center justify-center h-full text-muted-foreground">
                        无图
                    </div>
                )}
              </div>
            </div>
            <div className="md:w-2/3 space-y-4">
              <h2 className="text-2xl font-bold">{order.productName}</h2>
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-sm ${order.orderType === '领养订单' ? 'bg-orange-400' : 'bg-blue-400'}`}></div>
                <span>{order.orderType}</span>
              </div>
              <Separator />
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">下单日期</p>
                  <p>{new Date(order.orderDate).toLocaleDateString()}</p>
                </div>
                 <div>
                  <p className="text-muted-foreground">总计</p>
                  <p className="font-semibold">{order.total}</p>
                </div>
              </div>
              <div>
                  <p className="text-muted-foreground">收货地址</p>
                  <p>{order.shippingAddress}</p>
              </div>
              {order.shippingTrackingId && (
                 <div>
                  <p className="font-semibold">物流单号</p>
                  <p className="font-mono text-muted-foreground">{order.shippingTrackingId}</p>
                </div>
              )}
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-end gap-2">
           {renderCancelButton()}
          <AlertDialog>
            <AlertDialogTrigger asChild>
               <Button variant="outline">联系客服</Button>
            </AlertDialogTrigger>
             <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>联系客服</AlertDialogTitle>
                  <AlertDialogDescription>
                    {siteContent?.contactInfo || '管理员尚未设置联系方式。'}
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogAction>好的</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
          </AlertDialog>
        </CardFooter>
      </Card>
      
      {order.status === '待确认' && (
        <Card>
            <CardHeader>
                <CardTitle>订单确认</CardTitle>
                <CardDescription>请仔细阅读服务条款，并确认您的订单。</CardDescription>
            </CardHeader>
            <CardContent>
                 <div className="space-y-2 pt-2">
                    <div className="flex items-start space-x-2">
                        <Checkbox id="terms" checked={agreedToTerms} onCheckedChange={(checked) => setAgreedToTerms(checked as boolean)} className="mt-1" />
                        <div className="grid gap-1.5 leading-none">
                             <Dialog>
                                <DialogTrigger asChild>
                                   <label
                                      htmlFor="terms"
                                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                    >
                                     我已阅读并同意 <span className="text-primary hover:underline cursor-pointer">服务条款</span>
                                  </label>
                                </DialogTrigger>
                                <DialogContent className="max-w-3xl">
                                    <DialogHeader>
                                        <DialogTitle className="text-xl">服务条款</DialogTitle>
                                    </DialogHeader>
                                    <ScrollArea className="h-[60vh] pr-6">
                                        <div className="prose dark:prose-invert whitespace-pre-wrap text-sm text-muted-foreground">
                                            {contractText || "合同条款暂未配置，请联系管理员。"}
                                        </div>
                                    </ScrollArea>
                                </DialogContent>
                            </Dialog>
                        </div>
                    </div>
                </div>
            </CardContent>
            <CardFooter>
                <Button onClick={handleConfirmOrder} disabled={!agreedToTerms || isConfirming}>
                    {isConfirming ? '确认中...' : '确认委托'}
                </Button>
            </CardFooter>
        </Card>
      )}

    </div>
  );
}
