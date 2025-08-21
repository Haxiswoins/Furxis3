
'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { saveCharacter, getCharacterSeries } from '@/lib/data-service';
import { uploadImage } from '@/lib/upload-service';
import type { Character, CharacterSeries } from '@/types';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import Image from 'next/image';
import { Upload, X } from 'lucide-react';

const formSchema = z.object({
  seriesId: z.string().min(1, '必须选择一个系列'),
  name: z.string().min(2, { message: '名称至少需要2个字符。' }),
  species: z.string().min(1, { message: '物种不能为空。' }),
  price: z.string().regex(/^\d+(\.\d{1,2})?$/, { message: '请输入有效的价格。' }),
  description: z.string().min(10, { message: '描述至少需要10个字符。' }),
  tags: z.string(),
  applicants: z.number().int().nonnegative(),
  imageUrl: z.string().optional(),
  imageUrl1: z.string().optional(),
  imageUrl2: z.string().optional(),
  imageUrl3: z.string().optional(),
  imageUrl4: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

type AdminCharacterFormProps = {
  character?: Character;
};

type ImageState = {
    file: File | null;
    preview: string | null;
}

export function AdminCharacterForm({ character }: AdminCharacterFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [series, setSeries] = useState<CharacterSeries[]>([]);
  
  const [imageFiles, setImageFiles] = useState<(File | null)[]>(Array(5).fill(null));

  useEffect(() => {
    getCharacterSeries().then(setSeries);
  }, []);

  const fileInputRefs = [
      useRef<HTMLInputElement>(null),
      useRef<HTMLInputElement>(null),
      useRef<HTMLInputElement>(null),
      useRef<HTMLInputElement>(null),
      useRef<HTMLInputElement>(null),
  ];

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      seriesId: character?.seriesId || '',
      name: character?.name || '',
      species: character?.species || '',
      price: character?.price || '',
      description: character?.description || '',
      tags: character?.tags.join(', ') || '',
      applicants: character?.applicants || 0,
      imageUrl: character?.imageUrl || '',
      imageUrl1: character?.imageUrl1 || '',
      imageUrl2: character?.imageUrl2 || '',
      imageUrl3: character?.imageUrl3 || '',
      imageUrl4: character?.imageUrl4 || '',
    },
  });

  const watchImageUrls = [
      form.watch('imageUrl'),
      form.watch('imageUrl1'),
      form.watch('imageUrl2'),
      form.watch('imageUrl3'),
      form.watch('imageUrl4'),
  ];
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const file = e.target.files?.[0];
    if (file) {
      const newImageFiles = [...imageFiles];
      newImageFiles[index] = file;
      setImageFiles(newImageFiles);
      
      const fieldName = `imageUrl${index === 0 ? '' : index}` as keyof FormValues;
      form.setValue(fieldName, URL.createObjectURL(file));
    }
  };

  const clearImage = (index: number) => {
    const newImageFiles = [...imageFiles];
    newImageFiles[index] = null;
    setImageFiles(newImageFiles);
    
    const fieldName = `imageUrl${index === 0 ? '' : index}` as keyof FormValues;
    form.setValue(fieldName, '');

    if (fileInputRefs[index].current) {
        fileInputRefs[index].current!.value = '';
    }
  }

  const handleSave = async (values: FormValues) => {
    const allImageUrls = [values.imageUrl, values.imageUrl1, values.imageUrl2, values.imageUrl3, values.imageUrl4];
    
    if (!character && (!allImageUrls[0] || !allImageUrls[1])) {
        toast({ title: '图片缺失', description: '新增角色必须提供主图和至少一张详情图 (可通过上传或URL)。', variant: 'destructive' });
        return;
    }

    setLoading(true);
    setIsUploading(true);

    try {
      const uploadedUrls = await Promise.all(
        imageFiles.map(async (file, index) => {
          if (file) {
            return await uploadImage(file, `characters/${values.name}_${index}_${Date.now()}`);
          }
          // If no file, use the URL from the form (which might be the original or a pasted one)
          return allImageUrls[index];
        })
      );
      
      setIsUploading(false);

      const finalImageUrls = uploadedUrls.filter((url): url is string => !!url);

      if (finalImageUrls.length < 2 && !character) {
        throw new Error("主图和至少一张详情图是必须的。");
      }

      const characterData: Omit<Character, 'id'> = {
        seriesId: values.seriesId,
        name: values.name,
        species: values.species,
        price: values.price,
        description: values.description,
        tags: values.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
        applicants: values.applicants,
        imageUrl: finalImageUrls[0] || '',
        imageUrl1: finalImageUrls[1] || '',
        imageUrl2: finalImageUrls[2],
        imageUrl3: finalImageUrls[3],
        imageUrl4: finalImageUrls[4],
      };
      
      await saveCharacter(characterData, character?.id);
      
      toast({
        title: '保存成功！',
        description: `角色 "${values.name}" 已被成功保存。`,
      });
      router.push('/admin/characters');
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
      setIsUploading(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSave)} className="space-y-8 max-w-2xl">
        <FormField
          control={form.control}
          name="seriesId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>所属系列</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="选择一个系列" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {series.map(s => (
                    <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormDescription>该角色属于哪个主题系列？</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField control={form.control} name="name" render={({ field }) => ( <FormItem> <FormLabel>名称</FormLabel> <FormControl><Input placeholder="例如：星尘" {...field} /></FormControl> <FormMessage /> </FormItem> )}/>
        <FormField control={form.control} name="species" render={({ field }) => ( <FormItem> <FormLabel>物种</FormLabel> <FormControl><Input placeholder="例如：龙" {...field} /></FormControl> <FormMessage /> </FormItem> )}/>
        <FormField control={form.control} name="price" render={({ field }) => ( <FormItem> <FormLabel>价格 (元)</FormLabel> <FormControl><Input placeholder="例如：5000.00" {...field} /></FormControl> <FormMessage /> </FormItem> )}/>
        <FormField control={form.control} name="description" render={({ field }) => ( <FormItem> <FormLabel>描述</FormLabel> <FormControl><Textarea placeholder="角色的详细背景故事和设定..." {...field} rows={5} /></FormControl> <FormMessage /> </FormItem> )}/>
        <FormField control={form.control} name="tags" render={({ field }) => ( <FormItem> <FormLabel>标签</FormLabel> <FormControl><Input placeholder="例如：可爱, 幻想, 蓝色" {...field} /></FormControl> <FormDescription>使用逗号分隔不同的标签。</FormDescription> <FormMessage /> </FormItem> )}/>
        
         <div className="space-y-4">
            <FormLabel>作品图片 (最多5张)</FormLabel>
            <FormDescription>新增角色必须上传主图和至少一张详情图。优先使用URL。</FormDescription>
            {watchImageUrls.map((preview, index) => {
                 const fieldName = `imageUrl${index === 0 ? '' : index}` as keyof FormValues;
                 return (
                    <div key={index} className="space-y-2 p-4 border rounded-md">
                        <FormLabel className="text-xs text-muted-foreground">图片 {index + 1} {index === 0 && "(主图)"} {index >= 1 && `(详情图 ${index})`}</FormLabel>
                        <div className="flex items-center gap-4">
                            <div className="w-32 h-32 relative rounded-md border bg-muted flex-shrink-0">
                                {preview && (
                                   <>
                                    <Image src={preview} alt={`图片 ${index+1} 预览`} fill style={{objectFit:'cover'}} className="rounded-md" />
                                     <Button type="button" variant="ghost" size="icon" className="absolute top-0 right-0 bg-black/50 hover:bg-black/70 text-white rounded-full h-6 w-6" onClick={() => clearImage(index)}>
                                        <X className="h-4 w-4" />
                                    </Button>
                                   </>
                                )}
                            </div>
                            <div className='space-y-2'>
                                <Button type="button" variant="outline" onClick={() => fileInputRefs[index]?.current?.click()}>
                                    <Upload className="mr-2 h-4 w-4" />
                                    {preview ? '更换图片' : '本地上传'}
                                </Button>
                                <Input 
                                    type="file" 
                                    accept="image/*"
                                    onChange={(e) => handleFileChange(e, index)}
                                    className="hidden"
                                    ref={fileInputRefs[index]}
                                    id={`file-input-${index}`}
                                />
                                 <FormField
                                    control={form.control}
                                    name={fieldName}
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormControl>
                                                <Input placeholder="或在此处粘贴图片URL" {...field} onChange={(e) => {
                                                    field.onChange(e);
                                                    if (e.target.value) {
                                                        const newImageFiles = [...imageFiles];
                                                        newImageFiles[index] = null;
                                                        setImageFiles(newImageFiles);
                                                    }
                                                }}/>
                                            </FormControl>
                                        </FormItem>
                                    )}
                                />
                            </div>
                        </div>
                    </div>
                )
             })}
        </div>
        
         <FormField
          control={form.control}
          name="applicants"
          render={({ field }) => (
            <FormItem>
              <FormLabel>申请人数</FormLabel>
              <FormControl><Input type="number" {...field} onChange={e => field.onChange(parseInt(e.target.value, 10) || 0)} /></FormControl>
              <FormDescription>初始申请人数。</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex items-center gap-4">
          <Button type="submit" disabled={loading}>
            {loading ? (isUploading ? '图片上传中...' : '保存中...') : '保存更改'}
          </Button>
          <Button type="button" variant="outline" onClick={() => router.back()}>
            返回
          </Button>
        </div>
      </form>
    </Form>
  );
}
