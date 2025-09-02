

'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
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
import { Checkbox } from "@/components/ui/checkbox"
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { getAggregatedUsers, grantBadgeToUser, grantBadgeToUsers } from '@/lib/data-service';
import type { Badge, AggregatedUser } from '@/types';
import { getBadges } from '@/lib/data-service';
import { Badge as BadgeIcon, Search, ChevronRight, ArrowUpDown, X } from 'lucide-react';
import { format } from 'date-fns';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { AnimatePresence, motion } from 'framer-motion';


type SortKey = 'name' | 'registrationDate' | 'completedOrders' | 'notSelectedOrders' | 'badgeCount';
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
                <Button variant="outline" size="sm"><BadgeIcon className="mr-2 h-4 w-4" />发放徽章</Button>
            </DialogTrigger>
            <DialogContent>
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

function BulkGrantFloatPanel({
  selectedCount,
  badges,
  onGrant,
  onCancel,
}: {
  selectedCount: number;
  badges: Badge[];
  onGrant: (badgeId: string) => Promise<void>;
  onCancel: () => void;
}) {
  const [selectedBadgeId, setSelectedBadgeId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleGrant = async () => {
    setIsSubmitting(true);
    await onGrant(selectedBadgeId);
    setIsSubmitting(false);
  };

  return (
    <motion.div
        initial={{ opacity: 0, y: 100 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 100 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="fixed bottom-8 right-8 z-50"
    >
      <Card className="w-80 shadow-2xl">
        <CardHeader>
          <CardTitle className="flex justify-between items-center text-lg">
            <span>批量操作</span>
            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={onCancel}>
              <X className="h-4 w-4" />
            </Button>
          </CardTitle>
          <CardDescription>您已选择 {selectedCount} 位用户。</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Select onValueChange={setSelectedBadgeId} value={selectedBadgeId} disabled={isSubmitting}>
            <SelectTrigger>
              <SelectValue placeholder="选择要发放的徽章..." />
            </SelectTrigger>
            <SelectContent>
              {badges.map((badge) => (
                <SelectItem key={badge.id} value={badge.id}>
                  {badge.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            className="w-full"
            onClick={handleGrant}
            disabled={isSubmitting || !selectedBadgeId || selectedCount === 0}
          >
            {isSubmitting ? '发放中...' : '确认发放'}
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
}


export default function UserManagementPage() {
  const { toast } = useToast();
  const [users, setUsers] = useState<AggregatedUser[]>([]);
  const [badges, setBadges] = useState<Badge[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortKey, setSortKey] = useState<SortKey>('registrationDate');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [isSelectionMode, setIsSelectionMode] = useState(false);

  const fetchData = useCallback(async () => {
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
  }, [toast]);

  useEffect(() => {
    setLoading(true);
    fetchData();
  }, [fetchData]);
  
  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDirection('desc');
    }
  };

  const sortedAndFilteredUsers = useMemo(() => {
    return [...users]
      .sort((a, b) => {
        let comparison = 0;
        switch (sortKey) {
          case 'name':
            comparison = (a.name || '').localeCompare(b.name || '');
            break;
          case 'registrationDate':
            comparison = new Date(a.registrationDate).getTime() - new Date(b.registrationDate).getTime();
            break;
          case 'completedOrders':
            comparison = a.completedOrders - b.completedOrders;
            break;
          case 'notSelectedOrders':
            comparison = a.notSelectedOrders - b.notSelectedOrders;
            break;
          case 'badgeCount':
            comparison = a.badgeCount - b.badgeCount;
            break;
        }
        return sortDirection === 'asc' ? comparison : -comparison;
      })
      .filter(user => 
        user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase())
      );
  }, [users, searchTerm, sortKey, sortDirection]);

  const handleSelectAll = useCallback((checked: boolean) => {
    if (checked) {
        setSelectedUserIds(sortedAndFilteredUsers.map(u => u.id));
    } else {
        setSelectedUserIds([]);
    }
  }, [sortedAndFilteredUsers]);

  const handleSelectOne = (userId: string, checked: boolean) => {
    if(checked) {
        setSelectedUserIds(prev => [...prev, userId]);
    } else {
        setSelectedUserIds(prev => prev.filter(id => id !== userId));
    }
  }

  const handleToggleSelectionMode = () => {
    setIsSelectionMode(!isSelectionMode);
    setSelectedUserIds([]); // Clear selections when toggling mode
  };
  
  const handleBulkGrant = async (badgeId: string) => {
    if (!badgeId) {
      toast({ title: '请选择徽章', variant: 'destructive' });
      return;
    }
    try {
      const result = await grantBadgeToUsers(selectedUserIds, badgeId);
      toast({ title: result.message });
      if (result.success) {
        setIsSelectionMode(false);
        setSelectedUserIds([]);
        await fetchData();
      }
    } catch (error) {
      toast({ title: '批量发放失败', description: error instanceof Error ? error.message : '发生未知错误。', variant: 'destructive' });
    }
  };


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
        <div className="flex items-center gap-2">
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input 
                    placeholder="按用户名或邮箱搜索..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 w-full sm:w-64"
                />
            </div>
            <Button onClick={handleToggleSelectionMode} variant={isSelectionMode ? 'secondary' : 'default'}>
                {isSelectionMode ? '取消批量操作' : '批量发放徽章'}
            </Button>
        </div>
      </div>
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              {isSelectionMode && (
                <TableHead className="checkbox">
                  <Checkbox
                    checked={selectedUserIds.length > 0 && selectedUserIds.length === sortedAndFilteredUsers.length}
                    onCheckedChange={(checked) => handleSelectAll(checked as boolean)}
                    aria-label="Select all"
                  />
                </TableHead>
              )}
              <SortableHeader sortKey="name">用户名</SortableHeader>
              <TableHead>邮箱</TableHead>
              <SortableHeader sortKey="registrationDate">注册日期</SortableHeader>
              <SortableHeader sortKey="completedOrders">已完成</SortableHeader>
              <SortableHeader sortKey="notSelectedOrders">未中标</SortableHeader>
              <SortableHeader sortKey="badgeCount">徽章数</SortableHeader>
              <TableHead className="text-right">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedAndFilteredUsers.length > 0 ? (
              sortedAndFilteredUsers.map(user => (
                <TableRow key={user.id} data-state={selectedUserIds.includes(user.id) && "selected"}>
                    {isSelectionMode && (
                      <TableCell className="checkbox">
                          <Checkbox
                            checked={selectedUserIds.includes(user.id)}
                            onCheckedChange={(checked) => handleSelectOne(user.id, checked as boolean)}
                            aria-label="Select row"
                          />
                      </TableCell>
                    )}
                    <TableCell className="font-medium">
                        <Link href={`/admin/users/${user.id}`} className="hover:underline">{user.name || '(未设置)'}</Link>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-xs">{user.email || 'N/A'}</TableCell>
                    <TableCell>{format(new Date(user.registrationDate), 'yyyy-MM-dd')}</TableCell>
                    <TableCell>{user.completedOrders}</TableCell>
                    <TableCell>{user.notSelectedOrders}</TableCell>
                    <TableCell>{user.badgeCount}</TableCell>
                    <TableCell className="text-right">
                       <div className="flex items-center justify-end gap-2">
                         <GrantBadgeDialog user={user} badges={badges} onBadgeGranted={fetchData} />
                          <Link href={`/admin/users/${user.id}`} passHref>
                            <Button variant="ghost" size="icon">
                                <ChevronRight className="h-4 w-4 text-muted-foreground" />
                            </Button>
                          </Link>
                       </div>
                    </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={isSelectionMode ? 8 : 7} className="text-center h-24">
                  沒有找到任何用戶。
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

       <AnimatePresence>
        {isSelectionMode && (
          <BulkGrantFloatPanel
            selectedCount={selectedUserIds.length}
            badges={badges}
            onGrant={handleBulkGrant}
            onCancel={handleToggleSelectionMode}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
