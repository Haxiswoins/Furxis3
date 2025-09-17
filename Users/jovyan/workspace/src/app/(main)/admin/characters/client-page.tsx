'use client';

import { useState, useMemo } from 'react';
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
import { Plus, Edit, Trash2, Tag, CheckCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { deleteCharacter } from '@/lib/data-service';
import type { Character } from '@/types';
import { useToast } from '@/hooks/use-toast';
import Image from 'next/image';
import { Separator } from '@/components/ui/separator';

function CharactersTable({ characters, isDeleting, handleDelete, router }: {
    characters: Character[];
    isDeleting: string | null;
    handleDelete: (id: string) => void;
    router: any;
}) {
    return (
        <div className="border rounded-lg">
            <Table>
                <TableHeader>
                    <TableRow>
                    <TableHead className="w-[80px]">图片</TableHead>
                    <TableHead>名称</TableHead>
                    <TableHead>物种</TableHead>
                    <TableHead>价格</TableHead>
                    <TableHead className="text-right w-[120px]">操作</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {characters.length > 0 ? (
                    characters.map((char) => (
                        <TableRow key={char.id}>
                        <TableCell>
                            <div className="relative w-16 h-16 rounded-md overflow-hidden">
                                <Image src={char.imageUrl} alt={char.name} width={64} height={64} style={{objectFit: 'cover'}} />
                            </div>
                        </TableCell>
                        <TableCell className="font-medium">{char.name}</TableCell>
                        <TableCell>{char.species}</TableCell>
                        <TableCell>¥{char.price}</TableCell>
                        <TableCell className="text-right">
                            <Button variant="ghost" size="icon" onClick={() => router.push(`/admin/characters/edit/${char.id}`)}>
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
                                    此操作无法撤销。这将永久删除角色 "{char.name}"。
                                </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                <AlertDialogCancel>取消</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDelete(char.id)} disabled={isDeleting === char.id}>
                                    {isDeleting === char.id ? '删除中...' : '确认删除'}
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
                        该分类下没有角色。
                        </TableCell>
                    </TableRow>
                    )}
                </TableBody>
            </Table>
        </div>
    )
}

export function AdminCharactersClient({ characters }: { characters: Character[] }) {
  const router = useRouter();
  const { toast } = useToast();
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  
  const handleDelete = async (id: string) => {
    setIsDeleting(id);
    try {
        await deleteCharacter(id);
        toast({ title: '删除成功', description: '角色已从数据库中移除。' });
        router.refresh();
    } catch (error) {
        toast({ title: '删除失败', description: '操作失败，请稍后重试。', variant: 'destructive' });
    } finally {
        setIsDeleting(null);
    }
  };

  const { availableCharacters, adoptedCharacters } = useMemo(() => {
    const available = characters.filter(c => c.status === '待领养' || !c.status);
    const adopted = characters.filter(c => c.status === '已领养');
    return { availableCharacters: available, adoptedCharacters: adopted };
  }, [characters]);

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-headline">领养角色管理</h1>
      </div>

      <div>
          <div className="flex items-center gap-2 mb-4">
              <Tag className="h-6 w-6 text-muted-foreground" />
              <h2 className="text-2xl font-headline">待领养</h2>
          </div>
          <CharactersTable characters={availableCharacters} isDeleting={isDeleting} handleDelete={handleDelete} router={router} />
      </div>

      <Separator />

       <div>
          <div className="flex items-center gap-2 mb-4">
              <CheckCircle className="h-6 w-6 text-muted-foreground" />
              <h2 className="text-2xl font-headline">已领养</h2>
          </div>
          <CharactersTable characters={adoptedCharacters} isDeleting={isDeleting} handleDelete={handleDelete} router={router} />
      </div>
      
       <Button
        onClick={() => router.push('/admin/characters/new')}
        className="fixed bottom-8 right-8 h-16 w-16 rounded-full shadow-lg"
        size="icon"
      >
        <Plus className="h-8 w-8" />
        <span className="sr-only">新增角色</span>
      </Button>
    </div>
  );
}
