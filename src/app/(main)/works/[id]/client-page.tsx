
'use client';

import Image from 'next/image';
import { Dialog, DialogContent, DialogTrigger, DialogClose } from '@/components/ui/dialog';
import { X } from 'lucide-react';
import type { Work } from '@/types';

type WorkImagesProps = {
    work: Work;
}

export function WorkImages({ work }: WorkImagesProps) {
    return (
        <div className="columns-1 sm:columns-2 md:columns-3 gap-4 space-y-4">
            {work.imageUrls.map((imgSrc, index) => (
            <Dialog key={index}>
                <DialogTrigger asChild>
                    <div className="break-inside-avoid rounded-lg overflow-hidden cursor-pointer shadow-md hover:shadow-xl transition-all duration-300 hover:scale-[1.02]">
                        <Image
                            src={imgSrc}
                            alt={`${work.workName} - 视图 ${index + 1}`}
                            width={0}
                            height={0}
                            sizes="100vw"
                            className="w-full h-auto"
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
