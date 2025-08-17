'use client';

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
  PopoverClose,
} from '@/components/ui/popover';
import type { SiteContent } from '@/types';
import { Button } from './ui/button';
import { DialogHeader, DialogTitle, DialogDescription, DialogFooter } from './ui/dialog';
import { X } from 'lucide-react';

type ContactInfoProps = {
  content: SiteContent | null;
};

export function ContactInfo({ content }: ContactInfoProps) {
  const infoText = content?.contactInfo 
    ? content.contactInfo 
    : "联系方式暂未设置。管理员请前往后台“页面内容管理”页面进行配置。";
  
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="secondary">联系我们</Button>
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <div className="grid gap-4">
          <DialogHeader>
            <DialogTitle>联系方式</DialogTitle>
            <DialogDescription>
              {infoText}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <PopoverClose asChild>
              <Button type="button">好的</Button>
            </PopoverClose>
          </DialogFooter>
        </div>
      </PopoverContent>
    </Popover>
  );
}
