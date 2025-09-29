
'use client';

import { useState, useRef, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { saveWork } from '@/lib/data-service';
import { uploadImage } from '@/lib/upload-service';
import type { Work } from '@/types';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { cn } from '@/lib/utils';
import { Upload, X } from 'lucide-react';
import Image from 'next/image';
import { Textarea } from './ui/textarea';
import { CustomDatePicker } from '@/components/ui/date-picker';
import { ImageCropper } from './image-cropper';

const formSchema = z.object({
  workName: z.string().min(1, '作品名称不能为空'),
  clientName: z.string().min(1, '委托人名称不能为空'),
  clientCity: z.string().min(1, '委托人城市不能为空'),
  makerName: z.string().optional(),
  completionDate: z.date({ required_error: '必须选择一个完成日期' }),
  description: z.string().optional(),
  avatarUrl: z.string().optional(),
  imageUrls: z.array(z.string()).default([]),
});

type FormValues = z.infer<typeof formSchema>;

type AdminWorkFormProps = {
  work?: Work;
};

export function AdminWorkForm({ work }: AdminWorkFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  
  const [imageFiles, setImageFiles] = useState<(File | null)[]>(Array(5).fill(null));
  const [avatarFile, setAvatarFile] = useState<File | null>(null);

  const [cropperOpen, setCropperOpen] = useState(false);
  const [imageToCrop, setImageToCrop] = useState<string | null>(null);

  const fileInputRefs = useMemo(() => Array(5).fill(null).map(() => React.createRef<HTMLInputElement>()), []);
  const avatarInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      workName: work?.workName || '',
      clientName: work?.clientName || '',
      clientCity: work?.clientCity || '',
      makerName: work?.makerName || '',
      completionDate: work ? new Date(work.completionDate) : new Date(),
      description: work?.description || '',
      avatarUrl: work?.avatarUrl || '',
      imageUrls: work?.imageUrls ? [...work.imageUrls, ...Array(5 - work.imageUrls.length).fill('')].slice(0, 5) : Array(5).fill(''),
    },
  });

  const watchedImageUrls = form.watch('imageUrls');
  const watchedAvatarUrl = form.watch('avatarUrl');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const file = e.target.files?.[0];
    if (file) {
      const newImageFiles = [...imageFiles];
      newImageFiles[index] = file;
      setImageFiles(newImageFiles);
      
      const newUrls = [...form.getValues('imageUrls')];
      newUrls[index] = URL.createObjectURL(file);
      form.setValue('imageUrls', newUrls, { shouldValidate: true });
    }
  };
  
  const handleAvatarFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageToCrop(reader.result as string);
        setCropperOpen(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCropComplete = (croppedImageBlob: Blob) => {
      const croppedFile = new File([croppedImageBlob], 'avatar.png', { type: 'image/png' });
      setAvatarFile(croppedFile);
      form.setValue('avatarUrl', URL.createObjectURL(croppedFile));
      setCropperOpen(false);
      setImageToCrop(null);
  };


  const clearImage = (index: number) => {
    const newImageFiles = [...imageFiles];
    newImageFiles[index] = null;
    setImageFiles(newImageFiles);
    
    const newUrls = [...form.getValues('imageUrls')];
    newUrls[index] = '';
    form.setValue('imageUrls', newUrls, { shouldValidate: true });

    if (fileInputRefs[index].current) {
        fileInputRefs[index].current!.value = '';
    }
  };
  
  const clearAvatar = () => {
    setAvatarFile(null);
    form.setValue('avatarUrl', '');
     if (avatarInputRef.current) {
        avatarInputRef.current!.value = '';
    }
  }

  const handleSave = async (values: FormValues) => {
    setIsUploading(true);
    setLoading(true);

    try {
        let finalAvatarUrl = work?.avatarUrl;
        if (avatarFile && watchedAvatarUrl?.startsWith('blob:')) {
            finalAvatarUrl = await uploadImage(avatarFile, `works/${values.workName}_avatar_${Date.now()}`);
        } else if (watchedAvatarUrl) {
            finalAvatarUrl = watchedAvatarUrl;
        }

        const finalImageUrls: string[] = [];

        for (let i = 0; i < values.imageUrls.length; i++) {
            const file = imageFiles[i];
            const url = values.imageUrls[i];
            if (file && url?.startsWith('blob:')) {
                const uploadedUrl = await uploadImage(file, `works/${values.workName}_${i}_${Date.now()}`);
                finalImageUrls.push(uploadedUrl);
            } else if (url && url.trim() !== '') {
                finalImageUrls.push(url.trim());
            }
        }
        
        setIsUploading(false);

        if (finalImageUrls.length === 0) {
            toast({ title: '图片缺失', description: '新增作品必须上传至少一张图片或提供URL。', variant: 'destructive' });
            setLoading(false);
            return;
        }

        const workData: Omit<Work, 'id'> = {
            workName: values.workName,
            clientName: values.clientName,
            clientCity: values.clientCity,
            makerName: values.makerName,
            completionDate: values.completionDate.toISOString(),
            description: values.description || '',
            avatarUrl: finalAvatarUrl,
            imageUrls: finalImageUrls,
        };
      
        await saveWork(workData, work?.id);
        
        toast({
            title: '保存成功！',
            description: `作品 "${values.workName}" 已成功保存。`,
        });
        router.push('/admin/works');
        router.refresh();
    } catch (error) {
       console.error("保存失败:", error);
      toast({
        title: '保存失败',
        description: error instanceof Error ? error.message : '发生未知错误。',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
      setIsUploading(false);
    }
  }

  return (
    <>
    {cropperOpen && imageToCrop && (
      <ImageCropper 
        imageSrc={imageToCrop}
        onCropComplete={handleCropComplete}
        onClose={() => setCropperOpen(false)}
      />
    )}
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSave)} className="space-y-8 max-w-2xl">
        <FormField control={form.control} name="workName" render={({ field }) => ( <FormItem> <FormLabel>作品名称</FormLabel> <FormControl><Input placeholder="例如：青风" {...field} /></FormControl> <FormMessage /> </FormItem> )}/>
        <FormField control={form.control} name="clientName" render={({ field }) => ( <FormItem> <FormLabel>委托人名称</FormLabel> <FormControl><Input placeholder="例如：匿名委托人" {...field} /></FormControl> <FormMessage /> </FormItem> )}/>
        <FormField control={form.control} name="clientCity" render={({ field }) => ( <FormItem> <FormLabel>委托人城市</FormLabel> <FormControl><Input placeholder="例如：上海" {...field} /></FormControl> <FormMessage /> </FormItem> )}/>
        <FormField control={form.control} name="makerName" render={({ field }) => ( <FormItem> <FormLabel>装师名称</FormLabel> <FormControl><Input placeholder="例如：工作室A" {...field} /></FormControl> <FormDescription>选填，如果填写会在作品卡片上展示。</FormDescription><FormMessage /> </FormItem> )}/>
        
        <FormField
          control={form.control}
          name="completionDate"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>完成日期</FormLabel>
                <FormControl>
                    <CustomDatePicker
                        date={field.value}
                        setDate={field.onChange}
                    />
                </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>作品描述</FormLabel>
              <FormControl>
                <Textarea placeholder="输入关于这个作品的简介或故事..." {...field} />
              </FormControl>
              <FormDescription>
                这段描述将显示在作品详情页。如果留空，则不显示。
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
            control={form.control}
            name="avatarUrl"
            render={({ field }) => (
                <FormItem className="space-y-2 p-4 border rounded-md">
                    <FormLabel>作品头像</FormLabel>
                     <FormDescription>这张图片将用于作品一览的“头像模式”。</FormDescription>
                    <div className="flex items-center gap-4">
                        <div className="w-32 h-32 relative rounded-full border bg-muted flex-shrink-0">
                            { watchedAvatarUrl ? (
                                <>
                                    <Image src={watchedAvatarUrl} alt="头像预览" fill style={{objectFit:'cover'}} className="rounded-full" />
                                    <Button type="button" variant="ghost" size="icon" className="absolute top-0 right-0 bg-black/50 hover:bg-black/70 text-white rounded-full h-6 w-6" onClick={clearAvatar}>
                                        <X className="h-4 w-4" />
                                    </Button>
                                </>
                            ) : null }
                        </div>
                        <div className="space-y-2">
                            <Button type="button" variant="outline" onClick={() => avatarInputRef.current?.click()}>
                                <Upload className="mr-2 h-4 w-4" />
                                {watchedAvatarUrl ? '更换头像' : '本地上传'}
                            </Button>
                            <Input 
                                type="file" 
                                accept="image/*"
                                onChange={handleAvatarFileSelect}
                                className="hidden"
                                ref={avatarInputRef}
                                id="avatar-file-input"
                            />
                            <FormControl>
                                <Input placeholder="或在此处粘贴图片URL" {...field} value={field.value ?? ''} onChange={(e) => {
                                    field.onChange(e);
                                    if (e.target.value) {
                                       setAvatarFile(null);
                                       setImageToCrop(null);
                                    }
                                }}/>
                            </FormControl>
                        </div>
                    </div>
                </FormItem>
            )}
        />
        
        <div className="space-y-4">
            <FormLabel>作品图片 (最多5张)</FormLabel>
            <FormDescription>新增作品必须提供至少一张图片。优先使用URL。</FormDescription>
            {Array.from({ length: 5 }).map((_, index) => (
                <FormField
                    key={index}
                    control={form.control}
                    name={`imageUrls.${index}`}
                    render={({ field }) => (
                        <FormItem className="space-y-2 p-4 border rounded-md">
                            <FormLabel className="text-xs text-muted-foreground">图片 {index + 1} {index === 0 && "(主图)"}</FormLabel>
                            <div className="flex items-center gap-4">
                                <div className="w-32 h-32 relative rounded-md border bg-muted flex-shrink-0">
                                    { (watchedImageUrls?.[index]) ? (
                                        <>
                                            <Image src={watchedImageUrls[index]} alt={`图片 ${index+1} 预览`} fill style={{objectFit:'cover'}} className="rounded-md" />
                                            <Button type="button" variant="ghost" size="icon" className="absolute top-0 right-0 bg-black/50 hover:bg-black/70 text-white rounded-full h-6 w-6" onClick={() => clearImage(index)}>
                                                <X className="h-4 w-4" />
                                            </Button>
                                        </>
                                     ) : null }
                                </div>
                                <div className="space-y-2">
                                    <Button type="button" variant="outline" onClick={() => fileInputRefs[index].current?.click()}>
                                        <Upload className="mr-2 h-4 w-4" />
                                        {(watchedImageUrls?.[index]) ? '更换图片' : '本地上传'}
                                    </Button>
                                    <Input 
                                        type="file" 
                                        accept="image/*"
                                        onChange={(e) => handleFileChange(e, index)}
                                        className="hidden"
                                        ref={fileInputRefs[index]}
                                        id={`file-input-${index}`}
                                    />
                                    <FormControl>
                                        <Input placeholder="或在此处粘贴图片URL" {...field} value={field.value ?? ''} onChange={(e) => {
                                            field.onChange(e);
                                            if (e.target.value) {
                                                const newImageFiles = [...imageFiles];
                                                newImageFiles[index] = null;
                                                setImageFiles(newImageFiles);
                                            }
                                        }}/>
                                    </FormControl>
                                </div>
                            </div>
                        </FormItem>
                    )}
                />
            ))}
        </div>
        
        <div className="flex items-center gap-4">
          <Button type="submit" disabled={loading}>
            {loading ? (isUploading ? '图片上传中...' : '保存作品') : '保存作品'}
          </Button>
          <Button type="button" variant="outline" onClick={() => router.back()}>
            返回
          </Button>
        </div>
      </form>
    </Form>
    </>
  );
}
