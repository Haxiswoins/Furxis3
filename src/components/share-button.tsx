
'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Share2, Copy } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import QRCode from 'qrcode.react';

export function ShareButton() {
  const pathname = usePathname();
  const { toast } = useToast();
  const [url, setUrl] = useState('');

  useEffect(() => {
    setUrl(window.location.origin + pathname);
  }, [pathname]);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(url).then(() => {
      toast({ title: '已复制!', description: '链接已成功复制到剪贴板。' });
    }, (err) => {
      toast({ title: '复制失败', description: '无法将链接复制到剪贴板。', variant: 'destructive' });
      console.error('Could not copy text: ', err);
    });
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
            variant="ghost"
            size="icon"
            className="rounded-full h-12 w-12 bg-card/30 backdrop-blur-md hover:bg-card/50"
            aria-label="分享"
        >
          <Share2 className="h-6 w-6" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-4">
        <div className="flex flex-col items-center gap-4">
          <h4 className="font-medium text-center">分享此页面</h4>
          <div className="p-2 border rounded-md bg-white">
            <QRCode value={url} size={128} />
          </div>
          <p className="text-xs text-muted-foreground text-center max-w-[128px] break-all">{url}</p>
          <Button onClick={copyToClipboard} size="sm" className="w-full">
            <Copy className="mr-2 h-4 w-4" /> 复制链接
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
