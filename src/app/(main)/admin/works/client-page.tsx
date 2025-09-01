
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
import { deleteWork } from '@/lib/data-service';
import type { Work } from '@/types';
import { useToast } from '@/hooks/use-toast';
import Image from 'next/image';

type AdminWorksClientProps = {
    works: Work[];
}

export function AdminWorksClient({ works: initialWorks }: AdminWorksClientProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [works, setWorks] = useState<Work[]>(initialWorks);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  
  const handleDelete = async (id: string) => {
    setIsDeleting(id);
    try {
        await deleteWork(id);
        setWorks(prevWorks => prevWorks.filter(w => w.id !== id));
        toast({ title: '删除成功', description: '作品已从数据库中移除。' });
    } catch (error) {
        toast({ title: '删除失败', description: '操作失败，请稍后重试。', variant: 'destructive' });
    } finally {
        setIsDeleting(null);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-headline">作品管理</h1>
      </div>
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[80px]">主图</TableHead>
              <TableHead>作品名称</TableHead>
              <TableHead>委托人</TableHead>
              <TableHead>完成日期</TableHead>
              <TableHead className="text-right w-[120px]">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {works.length > 0 ? (
              works.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>
                     <div className="relative w-16 h-16 rounded-md overflow-hidden">
                        <Image src={item.imageUrls[0]} alt={item.workName} width={64} height={64} style={{objectFit: 'cover'}} />
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">{item.workName}</TableCell>
                  <TableCell>{item.clientName}</TableCell>
                  <TableCell>{new Date(item.completionDate).toLocaleDateString()}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => router.push(`/admin/works/edit/${item.id}`)}>
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
                            此操作无法撤销。这将永久删除作品 "{item.workName}"。
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>取消</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDelete(item.id)} disabled={isDeleting === item.id}>
                            {isDeleting === item.id ? '删除中...' : '确认删除'}
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
                  没有找到任何作品。
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

       <Button
        onClick={() => router.push('/admin/works/new')}
        className="fixed bottom-8 right-8 h-16 w-16 rounded-full shadow-lg"
        size="icon"
      >
        <Plus className="h-8 w-8" />
        <span className="sr-only">新增作品</span>
      </Button>
    </div>
  );
}
