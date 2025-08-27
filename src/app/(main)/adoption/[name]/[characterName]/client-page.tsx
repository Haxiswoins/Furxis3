

'use client';

import Image from 'next/image';
import { useRouter, usePathname } from 'next/navigation';
import { Dialog, DialogContent, DialogTrigger, DialogClose } from '@/components/ui/dialog';
import { PawPrint, X } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import type { Character } from '@/types';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';


export function CharacterDetailClient({ character }: { character: Character }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user } = useAuth();
  const isLoggedIn = !!user;

  const handleApplyClick = () => {
    router.push(`${pathname}/apply`);
  };

  const renderLoginDialog = () => (
    <AlertDialog>
      <AlertDialogTrigger asChild>
          <Button size="lg" className="w-full">
            <PawPrint className="mr-2" />
            申请领养
          </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>需要登录</AlertDialogTitle>
          <AlertDialogDescription>
            您需要登录后才能申请领养。
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>取消</AlertDialogCancel>
          <AlertDialogAction onClick={() => router.push(`/api/auth/authing/login?returnTo=${pathname}`)}>
            登录
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );

  return isLoggedIn ? (
    <Button size="lg" className="w-full" onClick={handleApplyClick}>
        <PawPrint className="mr-2" />
        申请领养
    </Button>
  ) : (
    renderLoginDialog()
  );
}

export function Images({ images, name }: { images: string[]; name: string }) {
  return (
    <div className="max-h-[80vh] overflow-y-auto space-y-4 pr-2">
      {images.map((imgSrc, index) => (
        <Dialog key={index}>
          <DialogTrigger asChild>
            <div className="relative aspect-[4/3] rounded-lg overflow-hidden cursor-pointer shadow-md hover:shadow-xl transition-shadow">
              <Image
                src={imgSrc}
                alt={`${name} - 视图 ${index + 1}`}
                fill
                priority={index === 0}
                sizes="(max-width: 768px) 90vw, 45vw"
                style={{ objectFit: 'cover' }}
              />
            </div>
          </DialogTrigger>
          <DialogContent className="max-w-[90vw] md:max-w-4xl h-auto p-0 bg-transparent border-none shadow-none" showCloseButton={false}>
             <DialogClose className="absolute top-4 right-4 z-50 bg-background/50 rounded-full p-1 text-foreground hover:bg-background/80">
                <X className="h-5 w-5" />
            </DialogClose>
             <div className="relative aspect-video w-full h-full">
                <Image src={imgSrc} alt={`${name} - 视图 ${index + 1}`} fill style={{ objectFit: 'contain' }} />
             </div>
          </DialogContent>
        </Dialog>
      ))}
    </div>
  );
}
