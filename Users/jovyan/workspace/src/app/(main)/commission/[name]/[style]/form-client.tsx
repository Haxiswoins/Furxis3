

'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { chinaDivisions } from '@/lib/china-divisions';
import { useAuth } from '@/context/AuthContext';
import { createCommissionApplication } from '@/lib/data-service';
import type { CommissionStyle, CommissionOption, SiteContent, ApplicationData } from '@/types';
import { uploadImage } from '@/lib/upload-service';
import { Upload, X } from 'lucide-react';
import Image from 'next/image';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';

const formSchema = z.object({
  name: z.string().min(1, '姓名不能为空'),
  age: z.string().min(1, '年龄不能为空'),
  phone: z.string().min(1, '电话不能为空'),
  qq: z.string().optional(),
  email: z.string().email('请输入有效的邮箱地址'),
  height: z.string().min(1, '身高不能为空'),
  weight: z.string().min(1, '体重不能为空'),
  province: z.string().min(1, '请选择省份'),
  city: z.string().min(1, '请选择城市'),
  district: z.string().min(1, '请选择地区'),
  addressDetail: z.string().min(1, '详细地址不能为空'),
  referenceImage: z.instanceof(File).optional(),
  referenceImage2: z.instanceof(File).optional(),
  hasFan: z.boolean().default(false),
  magneticEyes: z.boolean().default(false),
  magneticEyesCount: z.string().default('0'),
  agreedToContract: z.boolean().refine(val => val === true, { message: '您必须同意服务条款' }),
  agreedToPrivacy: z.boolean().refine(val => val === true, { message: '您必须同意隐私政策' }),
});

type FormValues = z.infer<typeof formSchema>;


type CommissionApplicationFormClientProps = {
  commissionOption: CommissionOption;
  commissionStyle: CommissionStyle;
  siteContent: SiteContent | null;
}

export function CommissionApplicationFormClient({ commissionOption, commissionStyle, siteContent }: CommissionApplicationFormClientProps) {
  const router = useRouter();
  const { toast } = useToast();
  const { user, login } = useAuth();
  const isLoggedIn = !!user;

  const [formSubmitting, setFormSubmitting] = useState(false);
  
  const fanPrice = siteContent?.fanPrice ?? 150;
  const magneticEyePrice = siteContent?.magneticEyePrice ?? 200;
  
  const [timeLeft, setTimeLeft] = useState<string | null>(null);
  const [isCommissionOpen, setIsCommissionOpen] = useState(commissionOption.status !== '即将开放');

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      age: '',
      phone: '',
      qq: '',
      email: user?.email || '',
      height: '',
      weight: '',
      province: '',
      city: '',
      district: '',
      addressDetail: '',
      hasFan: false,
      magneticEyes: false,
      magneticEyesCount: '1',
      agreedToContract: false,
      agreedToPrivacy: false,
    },
  });

  const watchProvince = form.watch('province');
  const watchCity = form.watch('city');
  const watchMagneticEyes = form.watch('magneticEyes');
  
  const cities = useMemo(() => {
    const province = chinaDivisions.find(p => p.name === watchProvince);
    return province ? province.cities.map(c => c.name) : [];
  }, [watchProvince]);
  
  const districts = useMemo(() => {
    const province = chinaDivisions.find(p => p.name === watchProvince);
    const city = province?.cities.find(c => c.name === watchCity);
    return city ? city.districts : [];
  }, [watchProvince, watchCity]);
  
  useEffect(() => {
    if (!cities.includes(watchCity)) {
        form.setValue('city', '');
    }
  }, [cities, watchCity, form]);

  useEffect(() => {
    if (!districts.includes(form.getValues('district'))) {
        form.setValue('district', '');
    }
  }, [districts, form]);


  useEffect(() => {
    if (commissionOption.status !== '即将开放' || !commissionOption.commissionDate) {
      setIsCommissionOpen(commissionOption.status === '开放中');
      return;
    }

    const calculateTimeLeft = () => {
      const difference = +new Date(commissionOption.commissionDate) - +new Date();
      
      if (difference > 0) {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
        const minutes = Math.floor((difference / 1000 / 60) % 60);
        
        setTimeLeft(`剩余 ${days}天 ${hours}小时 ${minutes}分`);
        setIsCommissionOpen(false);
      } else {
        setTimeLeft(null);
        setIsCommissionOpen(true);
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 60000); // Update every minute

    return () => clearInterval(timer);
  }, [commissionOption]);

  
  const handleFormSubmit = async (values: FormValues) => {
    if (!user || !commissionStyle || !commissionOption) return;

    if (!isCommissionOpen) {
      toast({
        title: "委托尚未开放",
        description: "请等待倒计时结束后再提交。",
        variant: "destructive",
      });
      return;
    }

    setFormSubmitting(true);
    let uploadedUrls: (string | null)[] = [null, null];
    
    try {
        if (values.referenceImage) {
            uploadedUrls[0] = await uploadImage(values.referenceImage, `references/${user.uid}_${Date.now()}_0`);
        }
        if (values.referenceImage2) {
            uploadedUrls[1] = await uploadImage(values.referenceImage2, `references/${user.uid}_${Date.now()}_1`);
        }

      const applicationData: ApplicationData = {
        userName: values.name,
        age: values.age,
        phone: values.phone,
        qq: values.qq,
        email: values.email,
        height: values.height,
        weight: values.weight,
        province: values.province,
        city: values.city,
        district: values.district,
        addressDetail: values.addressDetail,
        referenceImageUrl: uploadedUrls[0],
        referenceImageUrl2: uploadedUrls[1],
        hasFan: values.hasFan,
        magneticEyes: values.magneticEyes,
        magneticEyesCount: Number(values.magneticEyesCount) || 0,
      };
      
      const commissionInfo = {
        styleName: commissionStyle.name,
        optionName: commissionOption.name,
        imageUrl: commissionStyle.imageUrl || '',
        price: commissionStyle.price,
      };

      await createCommissionApplication(user.uid, commissionInfo, applicationData, fanPrice, magneticEyePrice);
      toast({
        title: "申请已提交！",
        description: "我们的团队将审核您的信息并与您联系。",
      });
      router.push('/orders');
    } catch (error) {
      console.error("申请失败:", error);
      toast({
        title: "申请失败",
        description: error instanceof Error ? error.message : "提交申请时发生错误，请稍后再试。",
        variant: "destructive",
      });
    } finally {
        setFormSubmitting(false);
    }
  };

  const renderLoginDialog = () => (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button size="lg" className="w-full">申请估价</Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>需要登录</AlertDialogTitle>
          <AlertDialogDescription>
            您需要登录后才能申请估价。
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>取消</AlertDialogCancel>
          <AlertDialogAction onClick={() => login()}>
            登录
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );

  const renderSubmitButton = () => {
    if (!isCommissionOpen) {
      return (
        <Button size="lg" className="w-full" type="submit" disabled>
          {timeLeft || '即将开放...'}
        </Button>
      );
    }

    return (
      <Button size="lg" className="w-full" type="submit" disabled={formSubmitting || !form.formState.isValid}>
        {formSubmitting ? '提交中...' : '申请估价'}
      </Button>
    )
  };
  
  const contractText = siteContent?.commissionContractText;
  const privacyPolicyText = siteContent?.privacyPolicyText;

  return (
    <Card className="w-full">
      <CardHeader>
          <CardTitle className="text-3xl font-headline">{commissionOption.name} - {commissionStyle.name}</CardTitle>
          <CardDescription className="mt-2 text-base">{commissionStyle.description}</CardDescription>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleFormSubmit)}>
          <CardContent className="space-y-4">

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[ 'referenceImage', 'referenceImage2' ].map((fieldName, index) => (
                <FormField
                  key={fieldName}
                  control={form.control}
                  name={fieldName as 'referenceImage' | 'referenceImage2'}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>设定参考图 {index + 1} (可选)</FormLabel>
                      <FormControl>
                        <div className="flex items-center gap-4">
                           <div className="w-32 h-32 relative rounded-md border bg-muted flex-shrink-0">
                             {field.value ? (
                                <>
                                  <Image src={URL.createObjectURL(field.value)} alt={`预览 ${index + 1}`} fill style={{objectFit:'cover'}} className="rounded-md"/>
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    className="absolute top-0 right-0 bg-black/50 hover:bg-black/70 text-white rounded-full h-6 w-6"
                                    onClick={() => field.onChange(undefined)}
                                  >
                                    <X className="h-4 w-4" />
                                  </Button>
                                </>
                             ) : <Upload className="h-8 w-8 text-muted-foreground mx-auto my-auto" />}
                           </div>
                           <Label htmlFor={fieldName} className="cursor-pointer">
                              <Button type="button" variant="outline" asChild>
                                <span>{field.value ? '更换图片' : '选择图片'}</span>
                              </Button>
                           </Label>
                           <Input
                             id={fieldName}
                             type="file"
                             accept="image/*"
                             className="hidden"
                             onBlur={field.onBlur}
                             name={field.name}
                             onChange={(e) => field.onChange(e.target.files?.[0])}
                           />
                        </div>
                      </FormControl>
                      <FormDescription>大小不超过5MB。</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField control={form.control} name="name" render={({ field }) => (<FormItem><FormLabel>您的姓名</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
              <FormField control={form.control} name="age" render={({ field }) => (<FormItem><FormLabel>年龄</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>)} />
              <FormField control={form.control} name="phone" render={({ field }) => (<FormItem><FormLabel>电话</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
              <FormField control={form.control} name="qq" render={({ field }) => (<FormItem><FormLabel>QQ</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
              <FormField control={form.control} name="email" render={({ field }) => (<FormItem><FormLabel>邮箱地址</FormLabel><FormControl><Input type="email" {...field} /></FormControl><FormMessage /></FormItem>)} />
              <FormField control={form.control} name="height" render={({ field }) => (<FormItem><FormLabel>身高 (cm)</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>)} />
              <FormField control={form.control} name="weight" render={({ field }) => (<FormItem><FormLabel>体重 (kg)</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>)} />
            </div>

            <div className="space-y-1">
              <Label>地址</Label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <FormField control={form.control} name="province" render={({ field }) => (<FormItem><Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger><SelectValue placeholder="选择省份" /></SelectTrigger></FormControl><SelectContent>{chinaDivisions.map(p => <SelectItem key={p.name} value={p.name}>{p.name}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem>)} />
                <FormField control={form.control} name="city" render={({ field }) => (<FormItem><Select onValueChange={field.onChange} value={field.value} disabled={cities.length === 0}><FormControl><SelectTrigger><SelectValue placeholder="选择城市" /></SelectTrigger></FormControl><SelectContent>{cities.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem>)} />
                <FormField control={form.control} name="district" render={({ field }) => (<FormItem><Select onValueChange={field.onChange} value={field.value} disabled={districts.length === 0}><FormControl><SelectTrigger><SelectValue placeholder="选择区/县" /></SelectTrigger></FormControl><SelectContent>{districts.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem>)} />
              </div>
            </div>
            <FormField control={form.control} name="addressDetail" render={({ field }) => (<FormItem><FormLabel>详细地址</FormLabel><FormControl><Textarea {...field} /></FormControl><FormMessage /></FormItem>)} />

            <div className="space-y-4 pt-2">
                <FormField control={form.control} name="hasFan" render={({ field }) => (<FormItem className="flex flex-row items-start space-x-3 space-y-0"><FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl><div className="space-y-1 leading-none"><FormLabel>是否安装头内风扇模块 (+￥{fanPrice})</FormLabel></div></FormItem>)} />
                <FormField control={form.control} name="magneticEyes" render={({ field }) => (<FormItem className="flex flex-row items-start space-x-3 space-y-0"><FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl><div className="space-y-1 leading-none"><FormLabel>是否需要磁吸可替换眼 (+￥{magneticEyePrice}/双)</FormLabel></div></FormItem>)} />
                {watchMagneticEyes && (
                    <div className="pl-6">
                        <FormField control={form.control} name="magneticEyesCount" render={({ field }) => (
                            <FormItem>
                                <FormLabel>选择数量</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl><SelectTrigger className="w-[180px]"><SelectValue /></SelectTrigger></FormControl>
                                    <SelectContent>
                                        <SelectItem value="1">1 双</SelectItem>
                                        <SelectItem value="2">2 双</SelectItem>
                                        <SelectItem value="3">3 双</SelectItem>
                                    </SelectContent>
                                </Select>
                            </FormItem>
                        )}/>
                    </div>
                )}
            </div>

            <div className="space-y-4 pt-2">
              <FormField control={form.control} name="agreedToContract" render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                  <FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} id="agreedToContract" /></FormControl>
                  <div className="space-y-1 leading-none">
                     <Label htmlFor="agreedToContract" className="text-sm font-medium">我已阅读并同意</Label>{' '}
                      <Dialog>
                        <DialogTrigger asChild>
                           <Button variant="link" className="p-0 h-auto -translate-y-1" type="button"><span className="text-primary hover:underline cursor-pointer">《委托服务条款》</span></Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-3xl">
                          <DialogHeader>
                            <DialogTitle className="text-xl">委托服务条款</DialogTitle>
                            <DialogDescription>请仔细阅读以下条款。</DialogDescription>
                          </DialogHeader>
                          <ScrollArea className="h-[60vh] pr-6">
                            <div className="prose dark:prose-invert whitespace-pre-wrap text-sm text-muted-foreground">{contractText || "合同条款正在加载中..."}</div>
                          </ScrollArea>
                        </DialogContent>
                      </Dialog>
                    <FormMessage />
                  </div>
                </FormItem>
              )}/>
              <FormField control={form.control} name="agreedToPrivacy" render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                  <FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} id="agreedToPrivacy" /></FormControl>
                   <div className="space-y-1 leading-none">
                     <Label htmlFor="agreedToPrivacy" className="text-sm font-medium">我已阅读并同意</Label>{' '}
                      <Dialog>
                        <DialogTrigger asChild>
                           <Button variant="link" className="p-0 h-auto -translate-y-1" type="button"><span className="text-primary hover:underline cursor-pointer">《隐私政策》</span></Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-3xl">
                          <DialogHeader>
                            <DialogTitle className="text-xl">隐私政策</DialogTitle>
                             <DialogDescription>请仔细阅读以下条款。</DialogDescription>
                          </DialogHeader>
                          <ScrollArea className="h-[60vh] pr-6">
                            <div className="prose dark:prose-invert whitespace-pre-wrap text-sm text-muted-foreground">{privacyPolicyText || "隐私政策正在加载中..."}</div>
                          </ScrollArea>
                        </DialogContent>
                      </Dialog>
                       <Label htmlFor="agreedToPrivacy" className="text-sm font-medium">
                        ，并授权网站为履行订单处理我的个人信息。
                       </Label>
                    <FormMessage />
                  </div>
                </FormItem>
              )}/>
            </div>
          </CardContent>

          <CardFooter>
            {isLoggedIn ? renderSubmitButton() : renderLoginDialog()}
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
