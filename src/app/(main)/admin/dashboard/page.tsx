
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PawPrint, ShoppingCart, ListOrdered, Briefcase } from 'lucide-react';
import { getCharacters, getCommissionOptions, getAllOrders, getWorks } from '@/lib/data-service';
import type { Character, CommissionOption, Order, Work } from '@/types';
import { Skeleton } from '@/components/ui/skeleton';

function AdminDashboardSkeleton() {
    return (
        <div>
            <Skeleton className="h-9 w-32 mb-6" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[...Array(4)].map((_, i) => (
                    <Card key={i}>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <Skeleton className="h-5 w-24" />
                            <Skeleton className="h-4 w-4" />
                        </CardHeader>
                        <CardContent>
                            <Skeleton className="h-8 w-12" />
                            <Skeleton className="h-4 w-32 mt-1" />
                        </CardContent>
                    </Card>
                ))}
            </div>
             <div className="mt-8">
                <Card>
                    <CardHeader>
                        <Skeleton className="h-7 w-48" />
                    </CardHeader>
                    <CardContent>
                        <Skeleton className="h-5 w-full" />
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}

export default function AdminDashboardPage() {
    const [characters, setCharacters] = useState<Character[]>([]);
    const [commissionOptions, setCommissionOptions] = useState<CommissionOption[]>([]);
    const [orders, setOrders] = useState<Order[]>([]);
    const [works, setWorks] = useState<Work[]>([]);
    const [loading, setLoading] = useState(true);
    
    useEffect(() => {
        async function fetchData() {
            setLoading(true);
            try {
                 const [charactersData, commissionOptionsData, ordersData, worksData] = await Promise.all([
                    getCharacters(),
                    getCommissionOptions(),
                    getAllOrders(),
                    getWorks()
                ]);
                setCharacters(charactersData);
                setCommissionOptions(commissionOptionsData);
                setOrders(ordersData);
                setWorks(worksData);
            } catch (error) {
                console.error("Failed to fetch dashboard data", error);
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, []);


    if (loading) {
        return <AdminDashboardSkeleton />;
    }

    const pendingOrders = orders.filter(o => o.status === '处理中' || o.status === '待确认' || o.status === '已确认').length;

    return (
        <div>
            <h1 className="text-3xl font-headline mb-6">仪表盘</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">作品总数</CardTitle>
                    <Briefcase className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{works.length}</div>
                    <p className="text-xs text-muted-foreground">已完成并展示的作品</p>
                </CardContent>
                </Card>
                <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">领养角色总数</CardTitle>
                    <PawPrint className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{characters.length}</div>
                    <p className="text-xs text-muted-foreground">当前在库的角色数量</p>
                </CardContent>
                </Card>
                <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">委托选项总数</CardTitle>
                    <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{commissionOptions.length}</div>
                    <p className="text-xs text-muted-foreground">当前可用的委托套餐</p>
                </CardContent>
                </Card>
                <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">待处理订单</CardTitle>
                    <ListOrdered className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">+{pendingOrders}</div>
                    <p className="text-xs text-muted-foreground">需要您处理的新订单</p>
                </CardContent>
                </Card>
            </div>
            <div className="mt-8">
                    <Card>
                        <CardHeader>
                            <CardTitle>欢迎回来, 管理员!</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p>您可以在左侧的导航栏中选择要管理的内容。请定期检查新的订单并更新它们的状态。</p>
                        </CardContent>
                    </Card>
                </div>
        </div>
    );
}
