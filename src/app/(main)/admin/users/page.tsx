

'use client';

import { useState, useEffect, useMemo } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { getAggregatedUsers, grantBadgeToUser, AggregatedUser } from '@/lib/data-service';
import type { Badge } from '@/types';
import { getBadges } from '@/lib/data-service';
import { Badge as BadgeIcon, Search, ChevronRight, ArrowUpDown } from 'lucide-react';
import { format } from 'date-fns';
import Link from 'next/link';
import { cn } from '@/lib/utils';


type SortKey = 'name' | 'registrationDate' | 'totalOrders' | 'badgeCount';
type SortDirection = 'asc' | 'desc';

function UserManagementPageSkeleton() {
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <Skeleton className="h-9 w-48" />
        <Skeleton className="h-10 w-64" />
      </div>
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              {[...Array(6)].map((_, i) => (
                <TableHead key={i}>
                  <Skeleton className="h-5 w-full" />
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {[...Array(5)].map((_, i) => (
              <TableRow key={i}>
                {[...Array(5)].map((_, j) => (
                  <TableCell key={j}>
                    <Skeleton className="h-5 w-full" />
                  </TableCell>
                ))}
                <TableCell>
                  <Skeleton className="h-8 w-20" />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

function GrantBadgeDialog({ user, badges, onBadgeGranted }: { user: AggregatedUser; badges: Badge[], onBadgeGranted: () => void }) {
    const { toast } = useToast();
    const [open, setOpen] = useState(false);
    const [selectedBadgeId, setSelectedBadgeId] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleGrantBadge = async () => {
        if (!selectedBadgeId) {
            toast({ title: '请选择徽章', description: '您需要选择一个徽章才能发放。', variant: 'destructive' });
            return;
        }
        setIsSubmitting(true);
        try {
            await grantBadgeToUser(user.id, selectedBadgeId);
            toast({ title: '发放成功', description: `已将徽章发放给用户 ${user.name}。` });
            onBadgeGranted();
            setOpen(false);
        } catch (error) {
            toast({ title: '发放失败', description: error instanceof Error ? error.message : '发生未知错误。', variant: 'destructive' });
        } finally {
            setIsSubmitting(false);
        }
    };
    
    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm" onClick={(e) => e.stopPropagation()}><BadgeIcon className="mr-2 h-4 w-4" />发放徽章</Button>
            </DialogTrigger>
            <DialogContent onClick={(e) => e.stopPropagation()}>
                <DialogHeader>
                    <DialogTitle>为 {user.name} 发放徽章</DialogTitle>
                    <DialogDescription>
                        从下方选择一个徽章授予该用户。如果用户已拥有该徽章，操作将不会重复。
                    </DialogDescription>
                </DialogHeader>
                <div className="py-4">
                    <Select onValueChange={setSelectedBadgeId} value={selectedBadgeId}>
                        <SelectTrigger>
                            <SelectValue placeholder="选择一个徽章..." />
                        </SelectTrigger>
                        <SelectContent>
                            {badges.map(badge => (
                                <SelectItem key={badge.id} value={badge.id}>
                                    {badge.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => setOpen(false)}>取消</Button>
                    <Button onClick={handleGrantBadge} disabled={isSubmitting || !selectedBadgeId}>
                        {isSubmitting ? '发放中...' : '确认发放'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

export default function UserManagementPage() {
  const { toast } = useToast();
  const [users, setUsers] = useState<AggregatedUser[]>([]);
  const [badges, setBadges] = useState<Badge[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortKey, setSortKey] = useState<SortKey>('registrationDate');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  const fetchData = async () => {
    setLoading(true);
    try {
      const [userData, badgeData] = await Promise.all([
        getAggregatedUsers(),
        getBadges()
      ]);
      setUsers(userData);
      setBadges(badgeData);
    } catch (error) {
      toast({
        title: '加载数据失败',
        description: '无法获取用户或徽章列表。',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  
  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDirection('desc'); // Default to descending for new columns
    }
  };

  const sortedAndFilteredUsers = useMemo(() => {
    let sortedUsers = [...users];

    sortedUsers.sort((a, b) => {
      let comparison = 0;
      switch (sortKey) {
        case 'name':
          comparison = (a.name || '').localeCompare(b.name || '');
          break;
        case 'registrationDate':
          comparison = new Date(a.registrationDate).getTime() - new Date(b.registrationDate).getTime();
          break;
        case 'totalOrders':
          comparison = a.totalOrders - b.totalOrders;
          break;
        case 'badgeCount':
          comparison = a.badgeCount - b.badgeCount;
          break;
      }
      return sortDirection === 'asc' ? comparison : -comparison;
    });

    if (!searchTerm) return sortedUsers;
    
    return sortedUsers.filter(user => 
        user.name?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [users, searchTerm, sortKey, sortDirection]);

  if (loading) {
    return <UserManagementPageSkeleton />;
  }

  const SortableHeader = ({ sortKey: key, children }: { sortKey: SortKey, children: React.ReactNode }) => (
    <TableHead>
        <Button variant="ghost" onClick={() => handleSort(key)} className="px-0 hover:bg-transparent">
            {children}
            <ArrowUpDown className={cn("ml-2 h-4 w-4", sortKey === key ? "text-foreground" : "text-muted-foreground")} />
        </Button>
    </TableHead>
  );

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
        <h1 className="text-3xl font-headline">用户管理</h1>
        <div className="relative w-full sm:w-auto">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input 
                placeholder="按用户名搜索..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-full sm:w-64"
            />
        </div>
      </div>
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <SortableHeader sortKey="name">用户名</SortableHeader>
              <TableHead>邮箱</TableHead>
              <SortableHeader sortKey="registrationDate">注册日期</SortableHeader>
              <SortableHeader sortKey="totalOrders">订单总数</SortableHeader>
              <SortableHeader sortKey="badgeCount">徽章数</SortableHeader>
              <TableHead className="text-right">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedAndFilteredUsers.length > 0 ? (
              sortedAndFilteredUsers.map(user => (
                <Link key={user.id} href={`/admin/users/${user.id}`} passHref legacyBehavior>
                    <TableRow className="cursor-pointer">
                        <TableCell className="font-medium">{user.name || '(未设置)'}</TableCell>
                        <TableCell className="text-muted-foreground text-xs">{user.email || 'N/A'}</TableCell>
                        <TableCell>{format(new Date(user.registrationDate), 'yyyy-MM-dd')}</TableCell>
                        <TableCell>{user.totalOrders}</TableCell>
                        <TableCell>{user.badgeCount}</TableCell>
                        <TableCell className="text-right">
                           <div className="flex items-center justify-end gap-2">
                             <GrantBadgeDialog user={user} badges={badges} onBadgeGranted={fetchData} />
                             <ChevronRight className="h-4 w-4 text-muted-foreground" />
                           </div>
                        </TableCell>
                    </TableRow>
                </Link>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="text-center h-24">
                  没有找到任何用户。
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
