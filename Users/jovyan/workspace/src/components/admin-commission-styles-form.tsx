
'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { getCommissionOptions, saveCommissionStyle } from '@/lib/data-service';
import { uploadImage } from '@/lib/upload-service';
import type { CommissionStyle, CommissionOption } from '@/types';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Image from 'next/image';
import { Upload } from 'lucide-react';

const formSchema = z.object({
  commissionOptionId: z.string().min(1, '必须选择一个所属委托'),
  name: z.string().min(2, { message: '名称至少需要2个字符。' }),
  price: z.string().min(1, { message: '价格不能为空。' }),
  description: z.string().min(10, { message: '描述至少需要10个字符。' }),
  tags: z.string(),
  imageUrl: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

type AdminCommissionStyleFormProps = {
  commissionStyle?: CommissionStyle;
};

export function AdminCommissionStyleForm({ commissionStyle }: AdminCommissionStyleFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(commissionStyle?.imageUrl || null);
  const [commissionOptions, setCommissionOptions] = useState<CommissionOption[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      commissionOptionId: '',
      name: '',
      price: '',
      description: '',
      tags: '',
      imageUrl: '',
    },
  });
  
  useEffect(() => {
    getCommissionOptions().then(setCommissionOptions);
  }, []);

  useEffect(() => {
    if (commissionStyle) {
      form.reset({
        commissionOptionId: commissionStyle.commissionOptionId || '',
        name: commissionStyle.name || '',
        price: commissionStyle.price || '',
        description: commissionStyle.description || '',
        tags: commissionStyle.tags.join(', ') || '',
        imageUrl: commissionStyle.imageUrl || '',
      });
      setImagePreview(commissionStyle.imageUrl || null);
    }
  }, [commissionStyle, form]);

  const imageUrlValue = form.watch('imageUrl');

  async function handleSave(values: FormValues) {
    setLoading(true);
    try {
      let finalImageUrl = values.imageUrl || commissionStyle?.imageUrl;

      if (imageFile && !values.imageUrl) {
        finalImageUrl = await uploadImage(imageFile, `commission-styles/${values.name}_${Date.now()}`);
      }

      const styleData: Omit<CommissionStyle, 'id'> = {
        commissionOptionId: values.commissionOptionId,
        name: values.name,
        price: values.price,
        description: values.description,
        tags: values.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
        imageUrl: finalImageUrl,
      };
      
      await saveCommissionStyle(styleData, commissionStyle?.id);
      
      toast({
        title: '保存成功！',
        description: `委托样式 "${values.name}" 已被成功保存。`,
      });
      router.push('/admin/commission-styles');
      router.refresh(); 
    } catch (error) {
       console.error("保存委托样式失败:", error);
      toast({
        title: '保存失败',
        description: error instanceof Error ? error.message : '发生未知错误，请检查控制台获取更多信息。',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
        setImageFile(file);
        setImagePreview(URL.createObjectURL(file));
        form.setValue('imageUrl', '');
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSave)} className="space-y-8 max-w-2xl">
        <FormField
            control={form.control}
            name="commissionOptionId"
            render={({ field }) => (
            <FormItem>
                <FormLabel>所属委托</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                        <SelectTrigger>
                            <SelectValue placeholder="选择一个所属的委托类型" />
                        </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                        {commissionOptions.map(option => (
                             <SelectItem key={option.id} value={option.id}>{option.name}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                <FormDescription>此样式属于哪个大的委托类别？</FormDescription>
                <FormMessage />
            </FormItem>
            )}
        />
        <FormField control={form.control} name="name" render={({ field }) => ( <FormItem> <FormLabel>样式名称</FormLabel> <FormControl><Input placeholder="例如：标准全身" {...field} /></FormControl> <FormMessage /> </FormItem> )}/>
        <FormField control={form.control} name="price" render={({ field }) => ( <FormItem> <FormLabel>价格 (元)</FormLabel> <FormControl><Input placeholder="例如：15000" {...field} /></FormControl> <FormDescription>价格将以“￥{'{price}'}”的格式显示。如果价格不固定，可填写“起”或“需估价”，展示时会自动拼接。</FormDescription> <FormMessage /> </FormItem> )}/>
        <FormField control={form.control} name="description" render={({ field }) => ( <FormItem> <FormLabel>描述</FormLabel> <FormControl><Textarea placeholder="关于这个样式的详细说明..." {...field} rows={5} /></FormControl> <FormMessage /> </FormItem> )}/>
        <FormField control={form.control} name="tags" render={({ field }) => ( <FormItem> <FormLabel>标签</FormLabel> <FormControl><Input placeholder="例如：标准, 全包" {...field} /></FormControl> <FormDescription>使用逗号分隔不同的标签。</FormDescription> <FormMessage /> </FormItem> )}/>
        
        <div className="space-y-2">
            <FormLabel>图片</FormLabel>
            <div className="flex items-center gap-4">
                <div className="w-32 h-32 relative rounded-md border bg-muted flex-shrink-0">
                    <Image src={imageUrlValue || imagePreview || "https://placehold.co/600x800.png"} alt="图片预览" fill style={{objectFit:'cover'}} className="rounded-md" />
                </div>
                <div className="space-y-2">
                    <Button type="button" variant="outline" onClick={() => fileInputRef.current?.click()}>
                        <Upload className="mr-2 h-4 w-4" />
                        本地上传
                    </Button>
                    <Input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                    />
                    <FormField
                        control={form.control}
                        name="imageUrl"
                        render={({ field }) => (
                            <FormItem>
                                <FormControl>
                                    <Input placeholder="或在此处粘贴图片URL" {...field} onChange={(e) => {
                                        field.onChange(e);
                                        if(e.target.value) setImageFile(null);
                                    }}/>
                                </FormControl>
                            </FormItem>
                        )}
                    />
                </div>
            </div>
             <FormDescription>优先使用URL。</FormDescription>
        </div>
        
        <div className="flex items-center gap-4">
          <Button type="submit" disabled={loading}>
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
