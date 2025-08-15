
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { updateOrder } from '@/lib/data-service';
import type { Order } from '@/types';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Image from 'next/image';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';

const formSchema = z.object({
  total: z.string().min(1, { message: '总价不能为空。' }),
  status: z.enum(['处理中', '待确认', '已确认', '退养中', '已发货', '已完成', '已取消']),
  shippingTrackingId: z.string().optional(),
});

type AdminOrderFormProps = {
  order: Order;
};

export function AdminOrderForm({ order }: AdminOrderFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      total: order?.total || '',
      status: order?.status || '处理中',
      shippingTrackingId: order?.shippingTrackingId || '',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setLoading(true);
    try {
      const updatedData: Partial<Order> = {
        total: values.total,
        status: values.status,
        shippingTrackingId: values.shippingTrackingId || null, // Ensure it's null if empty
      };
      
      await updateOrder(order.id, updatedData);
      
      toast({
        title: '保存成功！',
        description: `订单 "${order.orderNumber}" 已被成功更新。`,
      });
      router.push('/admin/orders');
      router.refresh();
    } catch (error) {
       console.error("保存失败:", error);
      toast({
        title: '保存失败',
        description: error instanceof Error ? error.message : '发生未知错误，请稍后重试。',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2">
            <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <FormField
                control={form.control}
                name="total"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>总价</FormLabel>
                    <FormControl><Input placeholder="例如：5200.00" {...field} /></FormControl>
                    <FormDescription>最终确定的订单价格。如果是估价，请保留文字说明。</FormDescription>
                    <FormMessage />
                    </FormItem>
                )}
                />
                <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>订单状态</FormLabel>
                     <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                        <SelectTrigger>
                            <SelectValue placeholder="选择一个状态" />
                        </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                            <SelectItem value="处理中">处理中</SelectItem>
                            <SelectItem value="待确认">待确认</SelectItem>
                            <SelectItem value="已确认">已确认</SelectItem>
                            <SelectItem value="退养中">退养中</SelectItem>
                            <SelectItem value="已发货">已发货</SelectItem>
                            <SelectItem value="已完成">已完成</SelectItem>
                             <SelectItem value="已取消">已取消</SelectItem>
                        </SelectContent>
                    </Select>
                    <FormMessage />
                    </FormItem>
                )}
                />
                <FormField
                control={form.control}
                name="shippingTrackingId"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>物流单号</FormLabel>
                    <FormControl><Input placeholder="例如：SF123456789" {...field} /></FormControl>
                    <FormDescription>如果订单已发货，请填写此项。</FormDescription>
                    <FormMessage />
                    </FormItem>
                )}
                />

                <Button type="submit" disabled={loading} size="lg">
                {loading ? '保存中...' : '保存订单'}
                </Button>
            </form>
            </Form>
        </div>
         <div className="md:col-span-1">
             <Card>
                <CardHeader>
                    <CardTitle>申请详情</CardTitle>
                </CardHeader>
                 <CardContent className="text-sm space-y-4">
                     {order.cancellationReason && (
                        <Card className="bg-destructive/10 border-destructive/30">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-base">退养/取消理由</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-destructive/90">{order.cancellationReason}</p>
                            </CardContent>
                        </Card>
                     )}
                     {order.applicationData?.referenceImageUrl && (
                        <div className="space-y-2">
                            <p className="font-semibold">用户设定图</p>
                            <Dialog>
                                <DialogTrigger asChild>
                                    <div className="relative w-full aspect-square rounded-md overflow-hidden cursor-pointer">
                                        <Image src={order.applicationData.referenceImageUrl} alt="用户设定图" fill style={{ objectFit: 'cover'}} />
                                    </div>
                                </DialogTrigger>
                                <DialogContent className="max-w-[90vw] md:max-w-4xl h-auto p-2 bg-transparent border-none shadow-none">
                                    <div className="relative aspect-video w-full h-full">
                                        <Image src={order.applicationData.referenceImageUrl} alt="用户设定图" fill style={{ objectFit: 'contain' }} />
                                    </div>
                                </DialogContent>
                            </Dialog>
                        </div>
                     )}
                     <div>
                        <p className="font-semibold">用户ID</p>
                        <p className="text-muted-foreground break-all">{order.userId}</p>
                     </div>
                      <div>
                        <p className="font-semibold">产品</p>
                        <p className="text-muted-foreground">{order.productName}</p>
                     </div>
                      <div>
                        <p className="font-semibold">姓名</p>
                        <p className="text-muted-foreground">{order.applicationData?.userName}</p>
                     </div>
                     <div>
                        <p className="font-semibold">邮箱</p>
                        <p className="text-muted-foreground">{order.applicationData?.email}</p>
                     </div>
                     <div>
                        <p className="font-semibold">电话</p>
                        <p className="text-muted-foreground">{order.applicationData?.phone}</p>
                     </div>
                      <div>
                        <p className="font-semibold">地址</p>
                        <p className="text-muted-foreground">{order.shippingAddress}</p>
                     </div>
                 </CardContent>
             </Card>
        </div>
    </div>
  );
}
