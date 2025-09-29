
'use client';

import { useState } from 'react';
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
import { deleteCommissionOption } from '@/lib/data-service';
import type { CommissionOption } from '@/types';
import { useToast } from '@/hooks/use-toast';
import Image from 'next/image';

type AdminCommissionsClientProps = {
    commissionOptions: CommissionOption[];
}

export function AdminCommissionsClient({ commissionOptions: initialCommissionOptions }: AdminCommissionsClientProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [commissionOptions, setCommissionOptions] = useState<CommissionOption[]>(initialCommissionOptions);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    setIsDeleting(id);
    try {
      await deleteCommissionOption(id);
      setCommissionOptions(prevOptions => prevOptions.filter(o => o.id !== id));
      toast({ title: '删除成功', description: '委托选项已从数据库中移除。' });
    } catch (error) {
      toast({ title: '删除失败', description: '操作失败，请稍后重试。', variant: 'destructive' });
    } finally {
      setIsDeleting(null);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-headline">各期委托管理</h1>
      </div>
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[80px]">图片</TableHead>
              <TableHead>名称</TableHead>
              <TableHead>类别</TableHead>
              <TableHead>状态</TableHead>
              <TableHead className="text-right w-[120px]">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {commissionOptions.length > 0 ? (
              commissionOptions.map((option) => (
                <TableRow key={option.id}>
                  <TableCell>
                    <div className="relative w-16 h-16 rounded-md overflow-hidden">
                      <Image src={option.imageUrl} alt={option.name} width={64} height={64} style={{objectFit: 'cover'}} />
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">{option.name}</TableCell>
                  <TableCell>{option.category}</TableCell>
                  <TableCell>{option.status}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => router.push(`/admin/commissions/edit/${option.id}`)}>
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
                            此操作无法撤销。这将永久删除选项 &quot;{option.name}&quot;。
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>取消</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDelete(option.id)} disabled={isDeleting === option.id}>
                            {isDeleting === option.id ? '删除中...' : '确认删除'}
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
                  没有找到任何委托选项。
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

       <Button
        onClick={() => router.push('/admin/commissions/new')}
        className="fixed bottom-8 right-8 h-16 w-16 rounded-full shadow-lg"
        size="icon"
      >
        <Plus className="h-8 w-8" />
        <span className="sr-only">新增选项</span>
      </Button>
    </div>
  );
}
