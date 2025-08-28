
'use client';

import { useRouter } from 'next/navigation';
import { Card, CardContent, CardFooter, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChevronRight } from 'lucide-react';
import type { CommissionOption, CommissionStyle } from '@/types';

type CommissionStylePageClientProps = {
    styles: CommissionStyle[];
    commissionOption: CommissionOption;
    commissionName: string;
}

export function CommissionStylePageClient({ styles, commissionOption, commissionName }: CommissionStylePageClientProps) {
  const router = useRouter();
  const canApply = commissionOption?.status === '开放中' || commissionOption?.status === '即将开放';

  return (
    <div>
      <div className="text-center mb-12">
        <h1 className="text-3xl sm:text-4xl font-headline">样式选择</h1>
        <p className="mt-2 text-base sm:text-lg text-muted-foreground">
          {`请为 “${commissionOption.name}” 选择您感兴趣的具体样式`}
        </p>
      </div>

      <div 
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        {styles.length > 0 ? (
          styles.map((style) => (
            <div key={style.id}>
              <Card className="overflow-hidden shadow-lg hover:shadow-2xl transition-shadow duration-300 flex flex-col h-full group hover:-translate-y-1">
                <CardContent className="p-4 flex-grow flex flex-col">
                  <CardTitle className="text-xl font-headline mb-2">{style.name}</CardTitle>
                  <p className="text-foreground/90 mb-4 text-sm line-clamp-3 flex-grow">{style.description}</p>
                  <div className="flex flex-wrap gap-1.5 mt-auto">
                    {style.tags.map(tag => <Badge key={tag} variant="secondary" className="text-xs">{tag}</Badge>)}
                  </div>
                </CardContent>
                <CardFooter className="p-4 bg-muted/50 flex justify-between items-center">
                  <p className="text-lg font-bold text-primary">¥{style.price}</p>
                  <Button asChild size="sm" disabled={!canApply} aria-disabled={!canApply}>
                    <a href={`/commission/${encodeURIComponent(commissionName)}/${encodeURIComponent(style.name)}`}>
                      选择此样式 <ChevronRight className="h-4 w-4" />
                    </a>
                  </Button>
                </CardFooter>
              </Card>
            </div>
          ))
        ) : (
          <div className="col-span-full text-center py-10">
            <p className="text-muted-foreground">暂无此委托类型下的细分样式。</p>
            <Button variant="outline" className="mt-4" onClick={() => router.back()}>返回上一页</Button>
          </div>
        )}
      </div>
    </div>
  );
}
