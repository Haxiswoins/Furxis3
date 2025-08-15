
'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Home, PawPrint, ShoppingCart, LogOut, LayoutDashboard, Settings, Package, Component, Layers, Briefcase, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/admin/dashboard', icon: LayoutDashboard, label: '仪表盘' },
  { href: '/admin/orders', icon: Package, label: '订单管理' },
  { href: '/admin/works', icon: Briefcase, label: '作品管理' },
  { href: '/admin/character-series', icon: Layers, label: '设定系列管理' },
  { href: '/admin/characters', icon: PawPrint, label: '领养角色管理' },
  { href: '/admin/commissions', icon: ShoppingCart, label: '委托选项管理' },
  { href: '/admin/commission-styles', icon: Component, label: '委托样式管理' },
  { href: '/admin/content', icon: Settings, label: '页面内容管理' },
  { href: '/admin/contracts', icon: FileText, label: '合同与邮件管理' },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { logout } = useAuth();
  const { toast } = useToast();

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/login');
       toast({
        title: '已退出登录',
        description: '您已成功退出管理员账户。',
      });
    } catch (error: any) {
      toast({
        title: '退出失败',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  return (
    <aside className="h-full w-64 bg-card border-r flex flex-col">
      <div className="p-6">
        <Link href="/">
           <h1 className="text-2xl font-headline cursor-pointer hover:text-primary transition-colors duration-300">管理后台</h1>
        </Link>
      </div>
      <nav className="flex-1 px-4 space-y-2">
        {navItems.map((item) => (
          <Link key={item.label} href={item.href}>
            <Button
              variant={pathname.startsWith(item.href) ? 'secondary' : 'ghost'}
              className="w-full justify-start"
            >
              <item.icon className="mr-2 h-4 w-4" />
              {item.label}
            </Button>
          </Link>
        ))}
      </nav>
      <div className="p-4 border-t">
        <Button variant="ghost" className="w-full justify-start" onClick={() => router.push('/')}>
          <Home className="mr-2 h-4 w-4" />
          返回网站
        </Button>
        <Button variant="ghost" className="w-full justify-start text-red-500 hover:text-red-500 hover:bg-red-500/10" onClick={handleLogout}>
          <LogOut className="mr-2 h-4 w-4" />
          退出登录
        </Button>
      </div>
    </aside>
  );
}
