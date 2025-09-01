
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { deleteCommissionStyle, getAllCommissionStyles, getCommissionOptions } from '@/lib/data-service';
import type { CommissionStyle, CommissionOption } from '@/types';
import { useToast } from '@/hooks/use-toast';
import Image from 'next/image';
import { Skeleton } from '@/components/ui/skeleton';

function AdminCommissionStylesPageSkeleton() {
    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <Skeleton className="h-9 w-48" />
            </div>
            <div className="border rounded-lg">
                 <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[80px]"><Skeleton className="h-5 w-full" /></TableHead>
                            <TableHead><Skeleton className="h-5 w-full" /></TableHead>
                            <TableHead><Skeleton className="h-5 w-full" /></TableHead>
                            <TableHead><Skeleton className="h-5 w-full" /></TableHead>
                            <TableHead className="text-right w-[120px]"><Skeleton className="h-5 w-full" /></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {[...Array(3)].map((_, i) => (
                             <TableRow key={i}>
                                <TableCell><Skeleton className="h-16 w-16 rounded-md" /></TableCell>
                                <TableCell><Skeleton className="h-5 w-3/4" /></TableCell>
                                <TableCell><Skeleton className="h-5 w-full" /></TableCell>
                                <TableCell><Skeleton className="h-5 w-2/4" /></TableCell>
                                <TableCell className="text-right">
                                    <div className="flex justify-end gap-2">
                                        <Skeleton className="h-8 w-8" />
                                        <Skeleton className="h-8 w-8" />
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                 </Table>
            </div>
        </div>
    )
}

export default function AdminCommissionStylesPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [styles, setStyles] = useState<CommissionStyle[]>([]);
  const [options, setOptions] = useState<CommissionOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const [stylesData, optionsData] = await Promise.all([
          getAllCommissionStyles(),
          getCommissionOptions(),
        ]);
        setStyles(stylesData);
        setOptions(optionsData);
      } catch (error) {
        toast({ title: '加载失败', description: '无法从服务器获取数据。', variant: 'destructive' });
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [toast]);

  const handleDelete = async (id: string) => {
    setIsDeleting(id);
    try {
      await deleteCommissionStyle(id);
      setStyles(prevStyles => prevStyles.filter(s => s.id !== id));
      toast({ title: '删除成功', description: '委托样式已从数据库中移除。' });
    } catch (error) {
      toast({ title: '删除失败', description: '操作失败，请稍后重试。', variant: 'destructive' });
    } finally {
        setIsDeleting(null);
    }
  };

  const getOptionName = (optionId: string) => {
    const option = options.find(opt => opt.id === optionId);
    return option?.name || '未关联';
  }

  if (loading) {
      return <AdminCommissionStylesPageSkeleton />;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-headline">委托样式管理</h1>
      </div>
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[80px]">图片</TableHead>
              <TableHead>样式名称</TableHead>
              <TableHead>所属委托</TableHead>
              <TableHead>价格</TableHead>
              <TableHead className="text-right w-[120px]">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {styles.length > 0 ? (
              styles.map((style) => (
                <TableRow key={style.id}>
                  <TableCell>
                    <div className="relative w-16 h-16 rounded-md overflow-hidden">
                      <Image src={style.imageUrl} alt={style.name} width={64} height={64} style={{objectFit: 'cover'}} />
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">{style.name}</TableCell>
                  <TableCell>{getOptionName(style.commissionOptionId)}</TableCell>
                  <TableCell>¥{style.price}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => router.push(`/admin/commission-styles/edit/${style.id}`)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-500" disabled={!!isDeleting}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>确定要删除吗?</AlertDialogTitle>
                          <AlertDialogDescription>
                            此操作无法撤销。这将永久删除样式 "{style.name}"。
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>取消</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDelete(style.id)} disabled={isDeleting === style.id}>
                            {isDeleting === style.id ? '删除中...' : '确认删除'}
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="text-center h-24">
                  没有找到任何委托样式。
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <Button
        onClick={() => router.push('/admin/commission-styles/new')}
        className="fixed bottom-8 right-8 h-16 w-16 rounded-full shadow-lg"
        size="icon"
      >
        <Plus className="h-8 w-8" />
        <span className="sr-only">新增样式</span>
      </Button>
    </div>
  );
}
