
'use client';

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import type { SiteContent } from '@/types';
import { Button } from './ui/button';

type ContactInfoProps = {
  content: SiteContent | null;
};

export function ContactInfo({ content }: ContactInfoProps) {
  const infoText = content?.contactInfo 
    ? content.contactInfo 
    : "当前暂未提供即时联系方式，如有需要您可通过邮件与我们沟通。";
  
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="secondary">联系我们</Button>
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <div className="grid gap-4">
          <div className="space-y-2">
            <h4 className="font-medium leading-none">联系方式</h4>
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">
               {infoText}
            </p>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
