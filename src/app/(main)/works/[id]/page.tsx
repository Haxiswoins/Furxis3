
'use client';

import { useState, useEffect } from 'react';
import { useParams, notFound } from 'next/navigation';
import Image from 'next/image';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { getWorkById } from '@/lib/data-service';
import type { Work } from '@/types';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogTrigger, DialogClose } from '@/components/ui/dialog';
import { X } from 'lucide-react';

export default function WorkDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const [work, setWork] = useState<Work | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    getWorkById(id)
      .then(data => {
        if (data) {
          setWork(data);
        } else {
          notFound();
        }
      })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading || !work) {
    return (
      <div className="max-w-5xl mx-auto">
        <Card className="overflow-hidden">
          <CardContent className="p-4 md:p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-6">
                <Skeleton className="h-10 w-2/3" />
                <Skeleton className="h-7 w-1/3" />
                <Separator />
                <div className="grid grid-cols-2 gap-4">
                  <Skeleton className="h-5 w-full" />
                  <Skeleton className="h-5 w-full" />
                  <Skeleton className="h-5 w-full" />
                  <Skeleton className="h-5 w-full" />
                </div>
                 <Skeleton className="h-20 w-full mt-4" />
              </div>
              <div className="space-y-4">
                <Skeleton className="w-full aspect-square" />
                <Skeleton className="w-full aspect-square" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto">
      <Card>
        <CardContent className="p-4 md:p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
            {/* Details Column */}
            <div className="sticky top-24">
              <CardHeader className="px-0 pt-0">
                <CardTitle className="text-4xl font-headline">{work.workName}</CardTitle>
              </CardHeader>
              <Separator className="my-4" />
              <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                      <p className="text-muted-foreground">委托人</p>
                      <p className="font-semibold">{work.clientName}</p>
                  </div>
                  <div>
                      <p className="text-muted-foreground">城市</p>
                      <p className="font-semibold">{work.clientCity}</p>
                  </div>
                  <div className="col-span-2">
                      <p className="text-muted-foreground">完成日期</p>
                      <p className="font-semibold">{new Date(work.completionDate).toLocaleDateString()}</p>
                  </div>
              </div>
               {work.description && (
                <>
                  <Separator className="my-4" />
                  <div>
                      <p className="text-muted-foreground text-sm">作品描述</p>
                      <p className="mt-1 whitespace-pre-wrap">{work.description}</p>
                  </div>
                </>
              )}
            </div>

            {/* Image Column */}
            <div className="max-h-[80vh] overflow-y-auto space-y-4 pr-2">
              {work.imageUrls.map((imgSrc, index) => (
                <Dialog key={index}>
                  <DialogTrigger asChild>
                    <div className="relative aspect-square rounded-lg overflow-hidden cursor-pointer shadow-md hover:shadow-xl transition-shadow">
                      <Image
                        src={imgSrc}
                        alt={`${work.workName} - 视图 ${index + 1}`}
                        fill
                        sizes="(max-width: 768px) 90vw, 45vw"
                        style={{ objectFit: 'cover' }}
                      />
                    </div>
                  </DialogTrigger>
                  <DialogContent className="max-w-[90vw] md:max-w-4xl h-auto p-2 bg-transparent border-none shadow-none">
                     <DialogClose className="absolute -top-2 -right-2 z-50 bg-background/50 rounded-full p-1 text-foreground">
                        <X className="h-5 w-5" />
                     </DialogClose>
                     <div className="relative aspect-video w-full h-full">
                        <Image src={imgSrc} alt={`${work.workName} - 视图 ${index + 1}`} fill style={{ objectFit: 'contain' }} />
                     </div>
                  </DialogContent>
                </Dialog>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
