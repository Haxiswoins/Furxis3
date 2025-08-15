
'use client';

import { useState, useRef, useEffect } from 'react';
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
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { CalendarIcon, Upload } from 'lucide-react';
import { format } from 'date-fns';
import Image from 'next/image';
import { Textarea } from './ui/textarea';

const formSchema = z.object({
  workName: z.string().min(1, '作品名称不能为空'),
  clientName: z.string().min(1, '委托人名称不能为空'),
  clientCity: z.string().min(1, '委托人城市不能为空'),
  completionDate: z.date({ required_error: '必须选择一个完成日期' }),
  description: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

type AdminWorkFormProps = {
  work?: Work;
};

type ImageState = {
    file: File | null;
    preview: string | null;
}

export function AdminWorkForm({ work }: AdminWorkFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  
  const initialImages: ImageState[] = Array(5).fill({ file: null, preview: null });
  if (work?.imageUrls) {
      work.imageUrls.forEach((url, index) => {
          if (index < 5) initialImages[index] = { file: null, preview: url };
      });
  }

  const [images, setImages] = useState<ImageState[]>(initialImages);
  const fileInputRefs = [useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null)];

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      workName: work?.workName || '',
      clientName: work?.clientName || '',
      clientCity: work?.clientCity || '',
      completionDate: work ? new Date(work.completionDate) : new Date(),
      description: work?.description || '',
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const file = e.target.files?.[0];
    if (file) {
        const newImages = [...images];
        newImages[index] = { file, preview: URL.createObjectURL(file) };
        setImages(newImages);
    }
  };

  const handleSave = async (values: FormValues) => {
    if (!images[0].file && !work) {
        toast({ title: '图片缺失', description: '新增作品必须上传至少一张图片。', variant: 'destructive' });
        return;
    }
    
    setLoading(true);
    try {
      const uploadedImageUrls = await Promise.all(
        images.map(async (img, index) => {
          if (img.file) {
            return await uploadImage(img.file, `works/${values.workName}_${index}_${Date.now()}`);
          }
          return img.preview; // Keep existing URL if no new file
        })
      );
      
      const workData: Omit<Work, 'id'> = {
        ...values,
        completionDate: values.completionDate.toISOString(),
        imageUrls: uploadedImageUrls.filter((url): url is string => !!url),
        description: values.description || '',
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
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSave)} className="space-y-8 max-w-2xl">
        <FormField control={form.control} name="workName" render={({ field }) => ( <FormItem> <FormLabel>作品名称</FormLabel> <FormControl><Input placeholder="例如：青风" {...field} /></FormControl> <FormMessage /> </FormItem> )}/>
        <FormField control={form.control} name="clientName" render={({ field }) => ( <FormItem> <FormLabel>委托人名称</FormLabel> <FormControl><Input placeholder="例如：匿名委托人" {...field} /></FormControl> <FormMessage /> </FormItem> )}/>
        <FormField control={form.control} name="clientCity" render={({ field }) => ( <FormItem> <FormLabel>委托人城市</FormLabel> <FormControl><Input placeholder="例如：上海" {...field} /></FormControl> <FormMessage /> </FormItem> )}/>
        
        <FormField
          control={form.control}
          name="completionDate"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>完成日期</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-[240px] pl-3 text-left font-normal",
                        !field.value && "text-muted-foreground"
                      )}
                    >
                      {field.value ? format(field.value, "PPP") : <span>选择日期</span>}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus />
                </PopoverContent>
              </Popover>
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
                <Textarea placeholder="输入关于这个作品的简介或故事..." {...field} rows={4} />
              </FormControl>
              <FormDescription>
                这段描述将显示在作品详情页。如果留空，则不显示。
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="space-y-4">
            <FormLabel>作品图片 (最多5张)</FormLabel>
            {images.map((img, index) => (
                <div key={index} className="space-y-2 p-4 border rounded-md">
                    <FormLabel className="text-xs text-muted-foreground">图片 {index + 1} {index === 0 && "(主图)"}</FormLabel>
                    <div className="flex items-center gap-4">
                        <div className="w-32 h-32 relative rounded-md border bg-muted flex-shrink-0">
                            {img.preview && (
                                <Image src={img.preview} alt={`图片 ${index+1} 预览`} fill style={{objectFit:'cover'}} className="rounded-md" />
                            )}
                        </div>
                        <Input 
                            type="file" 
                            accept="image/*"
                            onChange={(e) => handleFileChange(e, index)}
                            className="hidden"
                            ref={fileInputRefs[index]}
                            id={`file-input-${index}`}
                        />
                        <Button type="button" variant="outline" onClick={() => fileInputRefs[index].current?.click()}>
                            <Upload className="mr-2 h-4 w-4" />
                            {img.preview ? '更换图片' : '选择图片'}
                        </Button>
                    </div>
                </div>
            ))}
        </div>
        
        <div className="flex items-center gap-4">
          <Button type="submit" disabled={loading}>
            {loading ? '保存中...' : '保存作品'}
          </Button>
          <Button type="button" variant="outline" onClick={() => router.back()}>
            返回
          </Button>
        </div>
      </form>
    </Form>
  );
}
