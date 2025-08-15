
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
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import Image from 'next/image';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from './ui/textarea';
import { Separator } from './ui/separator';
import { Label } from '@/components/ui/label';

const formSchema = z.object({
  // Order status fields
  total: z.string().min(1, { message: '总价不能为空。' }),
  status: z.enum(['处理中', '待确认', '已确认', '退养中', '已发货', '已完成', '已取消']),
  shippingTrackingId: z.string().optional(),
  
  // Application data fields
  userName: z.string().min(1, '用户姓名不能为空。'),
  age: z.string(),
  phone: z.string().min(1, '电话不能为空。'),
  qq: z.string().optional(),
  email: z.string().email('请输入有效的邮箱地址。'),
  height: z.string(),
  weight: z.string(),
  addressDetail: z.string().min(1, '详细地址不能为空。'),
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
      userName: order?.applicationData?.userName || '',
      age: order?.applicationData?.age || '',
      phone: order?.applicationData?.phone || '',
      qq: order?.applicationData?.qq || '',
      email: order?.applicationData?.email || '',
      height: order?.applicationData?.height || '',
      weight: order?.applicationData?.weight || '',
      addressDetail: order?.applicationData?.addressDetail || '',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setLoading(true);
    try {
        const { total, status, shippingTrackingId, ...appData } = values;

        // Reconstruct applicationData and shippingAddress
        const updatedApplicationData = {
            ...order.applicationData!, // Keep original non-editable fields
            ...appData, // Add all editable fields from form
        };
        
        const updatedShippingAddress = `${order.applicationData?.province} ${order.applicationData?.city} ${order.applicationData?.district} ${values.addressDetail}`;

        const updatedData: Partial<Order> = {
            total,
            status,
            shippingTrackingId: shippingTrackingId || null,
            applicationData: updatedApplicationData,
            shippingAddress: updatedShippingAddress,
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
    <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            
            {/* Application Details Section */}
            <Card>
                <CardHeader>
                    <CardTitle>申请详情</CardTitle>
                    <CardDescription>管理员可在此处修改用户的申请信息。</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    {/* User Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField control={form.control} name="userName" render={({ field }) => ( <FormItem> <FormLabel>用户姓名</FormLabel> <FormControl><Input {...field} /></FormControl> <FormMessage /> </FormItem> )}/>
                        <FormField control={form.control} name="email" render={({ field }) => ( <FormItem> <FormLabel>邮箱</FormLabel> <FormControl><Input {...field} /></FormControl> <FormMessage /> </FormItem> )}/>
                        <FormField control={form.control} name="phone" render={({ field }) => ( <FormItem> <FormLabel>电话</FormLabel> <FormControl><Input {...field} /></FormControl> <FormMessage /> </FormItem> )}/>
                        <FormField control={form.control} name="qq" render={({ field }) => ( <FormItem> <FormLabel>QQ号</FormLabel> <FormControl><Input {...field} /></FormControl> <FormMessage /> </FormItem> )}/>
                    </div>

                    <Separator />
                    
                    {/* Physical Info */}
                     <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <FormField control={form.control} name="age" render={({ field }) => ( <FormItem> <FormLabel>年龄</FormLabel> <FormControl><Input type="number" {...field} /></FormControl> <FormMessage /> </FormItem> )}/>
                        <FormField control={form.control} name="height" render={({ field }) => ( <FormItem> <FormLabel>身高 (cm)</FormLabel> <FormControl><Input type="number" {...field} /></FormControl> <FormMessage /> </FormItem> )}/>
                        <FormField control={form.control} name="weight" render={({ field }) => ( <FormItem> <FormLabel>体重 (kg)</FormLabel> <FormControl><Input type="number" {...field} /></FormControl> <FormMessage /> </FormItem> )}/>
                    </div>
                    
                    <Separator />

                    {/* Address Info */}
                    <div>
                        <Label>地址（省/市/区不可更改）</Label>
                        <div className="flex items-center gap-2 mt-2">
                            <Input disabled value={order.applicationData?.province} />
                            <Input disabled value={order.applicationData?.city} />
                            <Input disabled value={order.applicationData?.district} />
                        </div>
                         <FormField
                            control={form.control}
                            name="addressDetail"
                            render={({ field }) => (
                                <FormItem className="mt-4">
                                <FormLabel>详细地址</FormLabel>
                                <FormControl><Textarea {...field} /></FormControl>
                                <FormMessage />
                                </FormItem>
                            )}
                            />
                    </div>
                     <Separator />

                    {/* Additional Info */}
                    <div className="space-y-4">
                        {order.cancellationReason && (
                            <div className="p-4 rounded-md bg-destructive/10 border border-destructive/30">
                                <p className="font-semibold text-destructive">退养/取消理由</p>
                                <p className="text-destructive/90 mt-1">{order.cancellationReason}</p>
                            </div>
                        )}
                        {order.applicationData?.referenceImageUrl && (
                            <div className="space-y-2">
                                <p className="font-semibold">用户设定图</p>
                                <Dialog>
                                    <DialogTrigger asChild>
                                        <div className="relative w-48 h-48 rounded-md overflow-hidden cursor-pointer border">
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
                            <p className="font-semibold">用户ID (不可修改)</p>
                            <p className="text-muted-foreground break-all text-xs">{order.userId}</p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Order Management Section */}
            <Card>
                <CardHeader>
                    <CardTitle>订单管理</CardTitle>
                    <CardDescription>修改订单的核心状态和信息。</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <FormField control={form.control} name="total" render={({ field }) => ( <FormItem> <FormLabel>总价</FormLabel> <FormControl><Input placeholder="例如：5200.00" {...field} /></FormControl> <FormDescription>最终确定的订单价格。如果是估价，请保留文字说明。</FormDescription> <FormMessage /> </FormItem> )}/>
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
                    <FormField control={form.control} name="shippingTrackingId" render={({ field }) => ( <FormItem> <FormLabel>物流单号</FormLabel> <FormControl><Input placeholder="例如：SF123456789" {...field} /></FormControl> <FormDescription>如果订单已发货，请填写此项。</FormDescription> <FormMessage /> </FormItem> )}/>
                </CardContent>
            </Card>
            
            <div className="flex items-center gap-2">
                 <Button type="submit" disabled={loading} size="lg">
                    {loading ? '保存中...' : '保存所有更改'}
                </Button>
                 <Button type="button" variant="outline" onClick={() => router.back()}>
                    返回
                </Button>
            </div>
        </form>
    </Form>
  );
}
