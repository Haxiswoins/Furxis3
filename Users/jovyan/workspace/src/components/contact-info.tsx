
'use client';

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import type { SiteContent } from '@/types';
import { Button } from '@/components/ui/button';
import QRCode from 'qrcode.react';
import { Separator } from '@/components/ui/separator';

type ContactInfoProps = {
  content: SiteContent | null;
};

export function ContactInfo({ content }: ContactInfoProps) {
  const infoText = content?.contactInfo 
    ? content.contactInfo 
    : "当前暂未提供即时联系方式，如有需要您可通过邮件与我们沟通。";
  
  const qqGroupLink = "https://qm.qq.com/q/wOsUFLlZL2";
  const qqGroupNumber = "805909541";

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="link" className="text-xs text-muted-foreground hover:text-primary">联系我们</Button>
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <div className="grid gap-4">
          <div className="space-y-2">
            <h4 className="font-medium leading-none">联系方式</h4>
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">
               {infoText}
            </p>
          </div>

          <Separator />

          <div className="space-y-3 text-center">
            <h4 className="font-medium leading-none">加入QQ交流群</h4>
            <div className="flex justify-center">
                <div className="p-2 border rounded-md bg-white">
                    <QRCode value={qqGroupLink} size={128} />
                </div>
            </div>
            <p className="text-sm text-muted-foreground">
                群号: {qqGroupNumber}
            </p>
          </div>

        </div>
      </PopoverContent>
    </Popover>
  );
}

    

    