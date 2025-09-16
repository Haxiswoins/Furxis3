
'use client';

import { useState, useEffect } from 'react';
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


// The form schema now ONLY includes fields that the admin can/should directly modify.
// Sensitive user application data is handled separately.
const formSchema = z.object({
  total: z.string().min(1, { message: '总价不能为空。' }),
  status: z.enum(['处理中', '待确认', '已确认', '排队中', '制作中', '退养中', '已发货', '已完成', '已取消', '未中标']),
  shippingTrackingId: z.string().optional(),
});

type AdminOrderFormProps = {
  order: Order;
};

export function AdminOrderForm({ order }: AdminOrderFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  // The form now only manages a subset of the order data.
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
      // The updated data only contains the fields from the form.
      // The sensitive `applicationData` is NOT part of the submission from the client.
      const updatedData: Partial<Order> = {
          total: values.total,
          status: values.status,
          shippingTrackingId: values.shippingTrackingId || null,
      };
      
      await updateOrder(order.id, updatedData);
      
      toast({
        title: '保存成功！',
        description: `订单 "${order.orderNumber}" 的状态和价格信息已被成功更新。`,
      });
      // Force a re-fetch of the page data by fully refreshing
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

  // Displaying user data directly from the `order` prop, not from the form state.
  const appData = order.applicationData;

  return (
    <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <Card>
                <CardHeader>
                    <CardTitle>申请详情</CardTitle>
                    <CardDescription>此处显示用户提交的原始申请信息，此部分信息不可通过此表单修改。</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    {/* User Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div><Label>用户名称</Label><p className="text-sm text-foreground pt-2">{appData?.userName || '未提供'}</p></div>
                        <div><Label>邮箱</Label><p className="text-sm text-foreground pt-2">{appData?.email || '未提供'}</p></div>
                        <div><Label>电话</Label><p className="text-sm text-foreground pt-2">{appData?.phone || '未提供'}</p></div>
                        <div><Label>QQ号</Label><p className="text-sm text-foreground pt-2">{appData?.qq || '未提供'}</p></div>
                    </div>

                    <Separator />
                    
                    {/* Physical Info */}
                     <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div><Label>年龄</Label><p className="text-sm text-foreground pt-2">{appData?.age || '未提供'}</p></div>
                        <div><Label>身高 (cm)</Label><p className="text-sm text-foreground pt-2">{appData?.height || '未提供'}</p></div>
                        <div><Label>体重 (kg)</Label><p className="text-sm text-foreground pt-2">{appData?.weight || '未提供'}</p></div>
                    </div>
                    
                    <Separator />

                    {/* Address Info */}
                    <div className="space-y-4">
                      <Label>地址</Label>
                      <p className="text-sm text-foreground">{order.shippingAddress || '未提供'}</p>
                    </div>
                     <Separator />

                    {/* Additional Info */}
                    <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <p className="font-semibold">是否安装头内风扇模块</p>
                                <p className="text-muted-foreground">{order.hasFan ? "是" : "否"}</p>
                            </div>
                            {order.magneticEyes && (
                               <div className="space-y-1">
                                <p className="font-semibold">是否需要磁吸可替换眼</p>
                                <p className="text-muted-foreground">{`是 (${order.magneticEyesCount || 0} 双)`}</p>
                               </div>
                            )}
                        </div>

                        {order.cancellationReason && (
                            <div className="p-4 rounded-md bg-destructive/10 border border-destructive/30">
                                <p className="font-semibold text-destructive">退养/取消理由</p>
                                <p className="text-destructive/90 mt-1">{order.cancellationReason}</p>
                            </div>
                        )}
                         <div className="flex flex-wrap gap-4">
                            {appData?.referenceImageUrl && (
                                <div className="space-y-2">
                                    <p className="font-semibold">用户设定图 1</p>
                                    <Dialog>
                                        <DialogTrigger asChild>
                                            <div className="relative w-48 h-48 rounded-md overflow-hidden cursor-pointer border">
                                                <Image src={appData.referenceImageUrl} alt="用户设定图 1" fill style={{ objectFit: 'cover'}} />
                                            </div>
                                        </DialogTrigger>
                                        <DialogContent className="max-w-[90vw] md:max-w-4xl h-auto p-2 bg-transparent border-none shadow-none">
                                            <div className="relative aspect-video w-full h-full">
                                                <Image src={appData.referenceImageUrl} alt="用户设定图 1" fill style={{ objectFit: 'contain' }} />
                                            </div>
                                        </DialogContent>
                                    </Dialog>
                                </div>
                            )}
                            {appData?.referenceImageUrl2 && (
                                <div className="space-y-2">
                                    <p className="font-semibold">用户设定图 2</p>
                                    <Dialog>
                                        <DialogTrigger asChild>
                                            <div className="relative w-48 h-48 rounded-md overflow-hidden cursor-pointer border">
                                                <Image src={appData.referenceImageUrl2} alt="用户设定图 2" fill style={{ objectFit: 'cover'}} />
                                            </div>
                                        </DialogTrigger>
                                        <DialogContent className="max-w-[90vw] md:max-w-4xl h-auto p-2 bg-transparent border-none shadow-none">
                                            <div className="relative aspect-video w-full h-full">
                                                <Image src={appData.referenceImageUrl2} alt="用户设定图 2" fill style={{ objectFit: 'contain' }} />
                                            </div>
                                        </DialogContent>
                                    </Dialog>
                                </div>
                            )}
                         </div>
                        <div>
                            <p className="font-semibold">用户ID</p>
                            <p className="text-muted-foreground break-all text-xs">{order.userId}</p>
                        </div>
                    </div>
                </CardContent>
            </Card>

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
                                    <SelectItem value="未中标">未中标</SelectItem>
                                    <SelectItem value="已确认">已确认</SelectItem>
                                    <SelectItem value="排队中">排队中</SelectItem>
                                    <SelectItem value="制作中">制作中</SelectItem>
                                    <SelectItem value="退养中">退养中</SelectItem>
                                    <SelectItem value="已发货">已发货</SelectItem>
                                    <SelectItem value="已完成">已完成</SelectItem>
                                    <SelectItem value="已取消">已取消</SelectItem>
                                </SelectContent>
                            </Select>
                            <FormDescription>将状态改为“待确认”或“未中标”会自动向用户发送邮件。</FormDescription>
                            <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField control={form.control} name="shippingTrackingId" render={({ field }) => ( <FormItem> <FormLabel>物流单号</FormLabel> <FormControl><Input placeholder="例如：SF123456789" {...field} /></FormControl> <FormDescription>如果订单已发货，请填写此项。</FormDescription> <FormMessage /> </FormItem> )}/>
                </CardContent>
            </Card>
            
            <div className="flex items-center gap-2">
                 <Button type="submit" disabled={loading} size="lg">
                    {loading ? '保存中...' : '保存更改'}
                </Button>
                 <Button type="button" variant="outline" onClick={() => router.back()}>
                    返回
                </Button>
            </div>
        </form>
    </Form>
  );
}
