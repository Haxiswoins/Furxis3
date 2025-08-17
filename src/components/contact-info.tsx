'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from '@/components/ui/dialog';
import type { SiteContent } from '@/types';
import { Button } from './ui/button';

type ContactInfoProps = {
  content: SiteContent | null;
};

export function ContactInfo({ content }: ContactInfoProps) {
  const infoText = content?.contactInfo 
    ? content.contactInfo 
    : "联系方式暂未设置。管理员请前往后台“页面内容管理”页面进行配置。";
  
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="secondary">联系我们</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>联系方式</DialogTitle>
          <DialogDescription>
            {infoText}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose asChild>
            <Button type="button">好的</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
