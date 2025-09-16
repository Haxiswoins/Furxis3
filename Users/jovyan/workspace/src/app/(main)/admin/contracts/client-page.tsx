
'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { getSiteContent, saveSiteContent } from '@/lib/data-service';
import type { SiteContent } from '@/types';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

const formSchema = z.object({
  privacyPolicyText: z.string().min(1, '隐私政策内容不能为空'),
  adoptionContractText: z.string().min(1, '领养合同内容不能为空'),
  commissionContractText: z.string().min(1, '委托合同内容不能为空'),
  // Commission emails
  confirmationEmailSubject: z.string().min(1, '邮件主题不能为空'),
  confirmationEmailBody: z.string().min(1, '邮件正文不能为空'),
  notSelectedEmailSubject: z.string().min(1, '邮件主题不能为空'),
  notSelectedEmailBody: z.string().min(1, '邮件正文不能为空'),
  // Adoption emails
  adoptionConfirmationEmailSubject: z.string().min(1, '邮件主题不能为空'),
  adoptionConfirmationEmailBody: z.string().min(1, '邮件正文不能为空'),
});

type FormValues = z.infer<typeof formSchema>;

function ContractFormSkeleton() {
  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <Skeleton className="h-7 w-48" />
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-32 w-full" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-32 w-full" />
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <Skeleton className="h-7 w-48" />
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-10 w-full" />
          </div>
           <div className="space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-32 w-full" />
          </div>
        </CardContent>
      </Card>
      <Skeleton className="h-12 w-32" />
    </div>
  );
}

type ContractsClientPageProps = {
  initialContent: SiteContent | null;
}

export function ContractsClientPage({ initialContent }: ContractsClientPageProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      privacyPolicyText: initialContent?.privacyPolicyText || '',
      adoptionContractText: initialContent?.adoptionContractText || '',
      commissionContractText: initialContent?.commissionContractText || '',
      confirmationEmailSubject: initialContent?.confirmationEmailSubject || '',
      confirmationEmailBody: initialContent?.confirmationEmailBody || '',
      notSelectedEmailSubject: initialContent?.notSelectedEmailSubject || '',
      notSelectedEmailBody: initialContent?.notSelectedEmailBody || '',
      adoptionConfirmationEmailSubject: initialContent?.adoptionConfirmationEmailSubject || '',
      adoptionConfirmationEmailBody: initialContent?.adoptionConfirmationEmailBody || '',
    },
  });

  useEffect(() => {
    if (initialContent) {
      setInitialLoading(false);
    }
  }, [initialContent]);

  const handleSave = async (values: FormValues) => {
    setLoading(true);
    try {
      const currentContent = await getSiteContent();
      const updatedContent: SiteContent = {
        ...currentContent!,
        ...values,
      };

      await saveSiteContent(updatedContent);
      toast({
        title: '保存成功！',
        description: '合同与邮件模板已更新。',
      });
    } catch (error) {
      console.error("保存失败:", error);
      toast({
        title: '保存失败',
        description: error instanceof Error ? error.message : '发生未知错误。',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <div>
        <h1 className="text-3xl font-headline mb-6">法律文本与邮件管理</h1>
        <ContractFormSkeleton />
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-headline mb-6">法律文本与邮件管理</h1>
      <p className="text-muted-foreground mb-8">在这里统一管理各类法律文本和系统自动发送的邮件模板。</p>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSave)} className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>法律文本</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <FormField
                control={form.control}
                name="privacyPolicyText"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>隐私政策</FormLabel>
                    <FormControl>
                      <Textarea {...field} rows={15} placeholder="在此输入网站的隐私政策条款..." />
                    </FormControl>
                     <FormDescription>
                       支持 Markdown 格式。这段内容将显示在 /privacy 页面。
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
               <Separator />
              <FormField
                control={form.control}
                name="commissionContractText"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>委托合同</FormLabel>
                    <FormControl>
                      <Textarea {...field} rows={15} placeholder="在此输入委托订单的合同条款..." />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
               <Separator />
              <FormField
                control={form.control}
                name="adoptionContractText"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>领养合同</FormLabel>
                    <FormControl>
                      <Textarea {...field} rows={15} placeholder="在此输入领养订单的合同条款..." />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

           <Card>
            <CardHeader>
              <CardTitle>邮件模板</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-4">委托中标通知</h3>
                <div className="pl-4 border-l-2 border-primary space-y-4">
                  <FormField
                    control={form.control}
                    name="confirmationEmailSubject"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>邮件主题</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="恭喜！您的委托申请已中标！" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="confirmationEmailBody"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>邮件正文</FormLabel>
                        <FormControl>
                          <Textarea {...field} rows={8} />
                        </FormControl>
                        <FormDescription>
                          可用变量: {"{productName}"}, {"{commissionOptionName}"}, {"{total}"}.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
              <Separator />
               <div>
                <h3 className="text-lg font-semibold mb-4">委托未中标通知</h3>
                <div className="pl-4 border-l-2 border-muted-foreground space-y-4">
                  <FormField
                    control={form.control}
                    name="notSelectedEmailSubject"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>邮件主题</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="关于您的委托申请结果" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="notSelectedEmailBody"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>邮件正文</FormLabel>
                        <FormControl>
                          <Textarea {...field} rows={8} />
                        </FormControl>
                        <FormDescription>
                          可用变量: {"{productName}"}, {"{commissionOptionName}"}.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
              <Separator />
              <div>
                <h3 className="text-lg font-semibold mb-4">领养申请通过通知</h3>
                <div className="pl-4 border-l-2 border-primary space-y-4">
                  <FormField
                    control={form.control}
                    name="adoptionConfirmationEmailSubject"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>邮件主题</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="恭喜！您的领养申请已通过！" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="adoptionConfirmationEmailBody"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>邮件正文</FormLabel>
                        <FormControl>
                          <Textarea {...field} rows={8} />
                        </FormControl>
                        <FormDescription>
                          可用变量: {"{productName}"}, {"{total}"}.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Button type="submit" size="lg" disabled={loading}>
            {loading ? '保存中...' : '保存所有更改'}
          </Button>
        </form>
      </Form>
    </div>
  );
}
