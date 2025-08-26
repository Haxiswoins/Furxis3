

'use client';

import Image from 'next/image';
import { Dialog, DialogContent, DialogTrigger, DialogClose } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { X } from 'lucide-react';
import type { Work } from '@/types';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

type WorkImagesProps = {
    work: Work;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
    },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      duration: 0.5,
      ease: 'easeOut',
    },
  },
};


function WorkImages({ work }: WorkImagesProps) {
    // Using a multi-column layout for a masonry/pinterest-style effect.
    // This is a simpler CSS-only approach.
    return (
        <motion.div 
            className="columns-1 sm:columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            whileInView="visible"
            viewport={{ once: true, amount: 0.1 }}
        >
            {work.imageUrls.map((imgSrc, index) => (
            <Dialog key={index}>
                <DialogTrigger asChild>
                    <motion.div 
                        className="break-inside-avoid rounded-lg overflow-hidden cursor-pointer shadow-md hover:shadow-xl transition-all duration-300 hover:scale-[1.02] block"
                        variants={itemVariants}
                    >
                        <Image
                            src={imgSrc}
                            alt={`${work.workName} - 视图 ${index + 1}`}
                            width={500} // Provide a base width, height will be auto
                            height={0} // Height is auto to maintain aspect ratio
                            sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, 33vw"
                            className="w-full h-auto"
                        />
                    </motion.div>
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
        </motion.div>
    );
}

type WorkDetailPageClientProps = {
    work: Work;
}

export function WorkDetailPageClient({ work }: WorkDetailPageClientProps) {
    return (
        <div
            className="max-w-6xl mx-auto space-y-8"
        >
        <div className="text-center space-y-2">
            <h1 className="text-5xl font-headline font-bold">{work.workName}</h1>
            <p className="text-muted-foreground">
            委托人: {work.clientName}
            {work.makerName && ` | 装师: ${work.makerName}`}
            {' | '}完成于: {new Date(work.completionDate).toLocaleDateString()}
            </p>
            {work.description && (
                <p className="text-lg text-foreground/80 max-w-3xl mx-auto pt-2">
                    {work.description}
                </p>
            )}
        </div>

        <Separator />

        <WorkImages work={work} />
        </div>
    );
}
