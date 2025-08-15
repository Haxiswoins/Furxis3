'use client';

import Image from 'next/image';
import { Dialog, DialogContent, DialogTrigger, DialogClose } from '@/components/ui/dialog';
import { X } from 'lucide-react';
import type { Work } from '@/types';
import { cn } from '@/lib/utils';

type WorkImagesProps = {
    work: Work;
}

export function WorkImages({ work }: WorkImagesProps) {
    const imageCount = work.imageUrls.length;

    // Dynamically determine grid layout based on image count
    const gridClasses = cn('grid gap-4', {
      'grid-cols-1': imageCount === 1,
      'grid-cols-2': imageCount === 2,
      'grid-cols-1 md:grid-cols-3': imageCount === 3,
      'grid-cols-1 sm:grid-cols-2': imageCount >= 4,
    });

    return (
        <div className={gridClasses}>
            {work.imageUrls.map((imgSrc, index) => (
            <Dialog key={index}>
                <DialogTrigger asChild>
                    <div className={cn(
                        "relative aspect-video rounded-lg overflow-hidden cursor-pointer shadow-md hover:shadow-xl transition-all duration-300 hover:scale-[1.02]",
                        {
                            "md:col-span-2 md:row-span-2 aspect-square": imageCount === 3 && index === 0, // Make first image larger for 3-image layout
                             "col-span-1": imageCount !== 1,
                        }
                    )}>
                        <Image
                            src={imgSrc}
                            alt={`${work.workName} - 视图 ${index + 1}`}
                            fill
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                            className="object-cover"
                        />
                    </div>
                </DialogTrigger>
                <DialogContent className="max-w-[90vw] md:max-w-4xl h-auto p-2 bg-transparent border-none shadow-none">
                    <DialogClose className="absolute -top-2 -right-2 z-50 bg-background/50 rounded-full p-1 text-foreground hover:bg-background/80">
                        <X className="h-5 w-5" />
                    </DialogClose>
                    <div className="relative aspect-video w-full h-full">
                        <Image src={imgSrc} alt={`${work.workName} - 视图 ${index + 1}`} fill style={{ objectFit: 'contain' }} />
                    </div>
                </DialogContent>
            </Dialog>
            ))}
        </div>
    );
}
