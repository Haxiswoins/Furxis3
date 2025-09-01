
'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { getBadges, saveBadge, generateBadgeQRCode, deleteBadge } from '@/lib/data-service';
import type { Badge, BadgeQRCode } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import Image from 'next/image';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import QRCodeComponent from 'qrcode.react';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Trash2 } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';

const formSchema = z.object({
  name: z.string().min(1, '徽章名称不能为空'),
  description: z.string().min(1, '徽章说明不能为空'),
  imageUrl: z.string().url('请输入有效的URL'),
});

type FormValues = z.infer<typeof formSchema>;

export default function BadgesPage() {
  const { toast } = useToast();
  const [badges, setBadges] = useState<Badge[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [generatedQR, setGeneratedQR] = useState<BadgeQRCode | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { name: '', description: '', imageUrl: '' },
  });

  useEffect(() => {
    fetchBadges();
  }, []);

  async function fetchBadges() {
    setLoading(true);
    try {
        const badgesData = await getBadges();
        setBadges(badgesData);
    } catch (error) {
        toast({ title: '加载失败', description: '无法获取徽章列表。', variant: 'destructive' });
    } finally {
        setLoading(false);
    }
  }

  async function handleSave(values: FormValues) {
    setSubmitting(true);
    try {
      await saveBadge(values);
      toast({ title: '保存成功！', description: `徽章 "${values.name}" 已添加。` });
      form.reset();
      fetchBadges();
    } catch (error) {
      toast({ title: '保存失败', description: '操作失败，请稍后重试。', variant: 'destructive' });
    } finally {
      setSubmitting(false);
    }
  }

  async function handleGenerateQR(badgeId: string) {
    setGenerating(true);
    setGeneratedQR(null);
    try {
      const qrCodeData = await generateBadgeQRCode(badgeId);
      setGeneratedQR(qrCodeData);
    } catch (error) {
      toast({ title: '生成失败', description: '无法生成二维码，请重试。', variant: 'destructive' });
    } finally {
      setGenerating(false);
    }
  }

  async function handleDelete(badgeId: string) {
    setDeletingId(badgeId);
    try {
      await deleteBadge(badgeId);
      toast({ title: '删除成功', description: '徽章及其关联数据已删除。' });
      fetchBadges();
    } catch (error) {
       toast({ title: '删除失败', description: '操作失败，请稍后重试。', variant: 'destructive' });
    } finally {
        setDeletingId(null);
    }
  }

  function getQRCodeUrl(qrId: string) {
    if (typeof window !== 'undefined') {
        return `${window.location.origin}/claim-badge/${qrId}`;
    }
    return '';
  }

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-headline">徽章管理</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>创建新徽章</CardTitle>
          <CardDescription>在此处上传新的徽章，请确保图片为透明背景的PNG文件。</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSave)} className="space-y-4">
              <FormField control={form.control} name="name" render={({ field }) => ( <FormItem> <FormLabel>徽章名称</FormLabel> <FormControl><Input {...field} placeholder="例如：创始成员" /></FormControl> <FormMessage /> </FormItem> )}/>
              <FormField control={form.control} name="description" render={({ field }) => ( <FormItem> <FormLabel>徽章说明</FormLabel> <FormControl><Textarea {...field} placeholder="关于这个徽章的描述..." /></FormControl> <FormMessage /> </FormItem> )}/>
              <FormField control={form.control} name="imageUrl" render={({ field }) => ( <FormItem> <FormLabel>图片URL</FormLabel> <FormControl><Input {...field} placeholder="https://example.com/badge.png" /></FormControl> <FormMessage /> </FormItem> )}/>
              <Button type="submit" disabled={submitting}>{submitting ? '保存中...' : '创建徽章'}</Button>
            </form>
          </Form>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>已创建的徽章</CardTitle>
          <CardDescription>点击徽章可为其生成一个新的一次性领取二维码。点击垃圾桶图标可删除徽章。</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="flex flex-col items-center gap-2">
                    <Skeleton className="h-24 w-24 rounded-full" />
                    <Skeleton className="h-4 w-16" />
                </div>
              ))}
            </div>
          ) : badges.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4">
              {badges.map((badge) => (
                <div key={badge.id} className="group relative flex flex-col items-center gap-2 p-2 rounded-lg hover:bg-muted transition-colors">
                    <Dialog onOpenChange={() => setGeneratedQR(null)}>
                        <DialogTrigger asChild>
                            <div className="cursor-pointer text-center">
                                <Image src={badge.imageUrl} alt={badge.name} width={96} height={96} className="h-24 w-24 object-contain" />
                                <p className="text-sm font-medium mt-2">{badge.name}</p>
                            </div>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                            <DialogTitle>为“{badge.name}”生成二维码</DialogTitle>
                            <DialogDescription>
                                每次生成的二维码都是全新的、唯一的，且只能被领取一次。
                            </DialogDescription>
                            </DialogHeader>
                            <div className="flex justify-center py-4">
                            {generatedQR ? (
                                <div className="flex flex-col items-center gap-4">
                                <QRCodeComponent value={getQRCodeUrl(generatedQR.id)} size={256} />
                                <p className="text-xs text-muted-foreground break-all max-w-[256px]">扫码方式：个人信息-我的徽章-获取徽章</p>
                                </div>
                            ) : generating ? (
                                <div className="flex flex-col items-center gap-4">
                                    <Skeleton className="h-64 w-64" />
                                    <p className="text-sm text-muted-foreground">生成中...</p>
                                </div>
                            ) : (
                                <div className="h-64 w-64 flex items-center justify-center bg-muted rounded-md">
                                <p className="text-muted-foreground">点击下方按钮生成</p>
                                </div>
                            )}
                            </div>
                            <Button onClick={() => handleGenerateQR(badge.id)} disabled={generating}>
                            {generating ? '生成中...' : '生成新二维码'}
                            </Button>
                        </DialogContent>
                    </Dialog>
                    <div className="absolute top-0 right-0 opacity-0 group-hover:opacity-100 transition-opacity">
                         <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 hover:text-red-600">
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                <AlertDialogTitle>确定要删除吗?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    此操作无法撤销。这将永久删除徽章“{badge.name}”及其所有相关的二维码和用户领取记录。
                                </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                <AlertDialogCancel>取消</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDelete(badge.id)} disabled={deletingId === badge.id}>
                                    {deletingId === badge.id ? '删除中...' : '确认删除'}
                                </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-center py-8">尚未创建任何徽章。</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
