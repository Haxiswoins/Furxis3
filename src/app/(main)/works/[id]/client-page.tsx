
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
    );
}
