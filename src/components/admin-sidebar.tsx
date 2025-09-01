

'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Home, PawPrint, ShoppingCart, LogOut, LayoutDashboard, Settings, Package, Component, Layers, Briefcase, FileText, Badge } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';

const navItems = [
  { href: '/admin/dashboard', label: '仪表盘', icon: LayoutDashboard },
  { href: '/admin/orders', label: '订单管理', icon: Package },
  { href: '/admin/works', label: '作品管理', icon: Briefcase },
  { href: '/admin/character-series', label: '设定系列管理', icon: Layers },
  { href: '/admin/characters', label: '领养角色管理', icon: PawPrint },
  { href: '/admin/commissions', label: '各期委托管理', icon: ShoppingCart },
  { href: '/admin/commission-styles', label: '委托样式管理', icon: Component },
  { href: '/admin/badges', label: '徽章管理', icon: Badge },
  { href: '/admin/content', label: '页面内容管理', icon: Settings },
  { href: '/admin/contracts', label: '合同与邮件管理', icon: FileText },
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
        {navItems.map((item) => {
          // Check for an exact match for the dashboard, otherwise check if the path starts with the href
          const isActive = item.href === '/admin/dashboard'
            ? pathname === item.href
            : pathname.startsWith(item.href);

          return (
            <Link key={item.label} href={item.href}>
              <Button
                variant={isActive ? 'secondary' : 'ghost'}
                className="w-full justify-start"
              >
                <item.icon className="mr-2 h-4 w-4" />
                {item.label}
              </Button>
            </Link>
          );
        })}
      </nav>
      <div className="p-4 border-t">
        <Button variant="ghost" className="w-full justify-start" onClick={() => router.push('/home')}>
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
