
'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import { getUserBadges } from '@/lib/data-service';
import type { UserBadge, Badge as BadgeType } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import Image from 'next/image';
import { format } from 'date-fns';
import { Camera, FileUp, Sparkles, X } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import jsQR from 'jsqr';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

function BadgeScanner({ onScanSuccess }: { onScanSuccess: (data: string) => void }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    let stream: MediaStream | null = null;
    const getCameraPermission = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
        setHasCameraPermission(true);
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (error) {
        console.error('Error accessing camera:', error);
        setHasCameraPermission(false);
        toast({
          variant: 'destructive',
          title: '相机访问被拒绝',
          description: '请在浏览器设置中启用相机权限。',
        });
      }
    };
    getCameraPermission();

    return () => {
      stream?.getTracks().forEach(track => track.stop());
    }
  }, [toast]);

  useEffect(() => {
    if (!hasCameraPermission) return;
    
    let animationFrameId: number;

    const tick = () => {
      if (videoRef.current && videoRef.current.readyState === videoRef.current.HAVE_ENOUGH_DATA) {
        const canvas = canvasRef.current;
        const video = videoRef.current;
        if (canvas && video) {
            const context = canvas.getContext('2d', { willReadFrequently: true });
            if (context) {
                canvas.height = video.videoHeight;
                canvas.width = video.videoWidth;
                context.drawImage(video, 0, 0, canvas.width, canvas.height);
                const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
                const code = jsQR(imageData.data, imageData.width, imageData.height, {
                    inversionAttempts: "dontInvert",
                });
                if (code) {
                    onScanSuccess(code.data);
                    return; // Stop scanning
                }
            }
        }
      }
      animationFrameId = requestAnimationFrame(tick);
    };

    animationFrameId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animationFrameId);
  }, [hasCameraPermission, onScanSuccess]);

  return (
    <div className="relative w-full aspect-square bg-muted rounded-lg overflow-hidden">
      <video ref={videoRef} className="w-full h-full object-cover" autoPlay playsInline muted />
      <canvas ref={canvasRef} className="hidden" />
      {hasCameraPermission === false && (
         <div className="absolute inset-0 flex items-center justify-center p-4">
            <Alert variant="destructive">
                <AlertTitle>需要相机权限</AlertTitle>
                <AlertDescription>
                    请允许浏览器访问您的相机以扫描二维码。
                </AlertDescription>
            </Alert>
         </div>
      )}
       <div className="absolute inset-0 border-4 border-white/50 rounded-lg pointer-events-none" />
    </div>
  );
}


function FileScanner({ onScanSuccess }: { onScanSuccess: (data: string) => void }) {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { toast } = useToast();

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const img = document.createElement('img');
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    canvas.width = img.width;
                    canvas.height = img.height;
                    const context = canvas.getContext('2d');
                    if (context) {
                        context.drawImage(img, 0, 0, img.width, img.height);
                        const imageData = context.getImageData(0, 0, img.width, img.height);
                        const code = jsQR(imageData.data, imageData.width, imageData.height);
                        if (code) {
                            onScanSuccess(code.data);
                        } else {
                            toast({ title: '识别失败', description: '未能在图片中找到二维码。', variant: 'destructive' });
                        }
                    }
                };
                img.src = e.target?.result as string;
            };
            reader.readAsDataURL(file);
        }
    };

    return (
        <div>
            <Button onClick={() => fileInputRef.current?.click()} className="w-full" size="lg">
                <FileUp className="mr-2" />
                从文件中选择二维码
            </Button>
            <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                onChange={handleFileChange}
            />
        </div>
    );
}

export function MyBadgesClientPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [badges, setBadges] = useState<(UserBadge & { badge?: BadgeType })[]>([]);
  const [loading, setLoading] = useState(true);
  const [isScannerOpen, setIsScannerOpen] = useState(false);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.push('/login');
      return;
    }
    
    async function fetchUserBadges() {
      setLoading(true);
      const userBadgesData = await getUserBadges(user!.uid);
      setBadges(userBadgesData);
      setLoading(false);
    }
    
    fetchUserBadges();
  }, [user, authLoading, router]);

  const handleScanSuccess = (data: string) => {
    setIsScannerOpen(false);
    try {
        const url = new URL(data);
        const pathSegments = url.pathname.split('/');
        const claimId = pathSegments.pop();

        if (claimId && pathSegments.pop() === 'claim-badge') {
             router.push(`/claim-badge/${claimId}`);
        } else {
            throw new Error('Invalid QR code format');
        }
    } catch (error) {
        toast({
            title: '二维码无效',
            description: '这不是一个有效的徽章二维码。',
            variant: 'destructive',
        });
    }
  };

  if (loading || authLoading) {
    return (
      <div className="container mx-auto max-w-4xl">
        <Card>
          <CardHeader>
            <Skeleton className="h-9 w-40" />
            <Skeleton className="h-5 w-64 mt-2" />
          </CardHeader>
          <CardContent className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex flex-col items-center gap-2">
                <Skeleton className="h-24 w-24 rounded-full" />
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-3 w-20" />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-4xl">
      <Card>
        <CardHeader className="flex flex-row justify-between items-start">
          <div>
            <CardTitle className="text-3xl font-headline">我的徽章</CardTitle>
            <CardDescription>您已收集的所有荣誉与成就。</CardDescription>
          </div>
           <Dialog open={isScannerOpen} onOpenChange={setIsScannerOpen}>
             <DialogTrigger asChild>
                <Button>
                    <Sparkles className="mr-2" />
                    获取徽章
                </Button>
             </DialogTrigger>
             <DialogContent>
                 <DialogHeader>
                    <DialogTitle>获取新徽章</DialogTitle>
                     <DialogDescription>
                        将摄像头对准徽章二维码，或从文件中上传。
                    </DialogDescription>
                 </DialogHeader>
                 <div className="space-y-4">
                     <BadgeScanner onScanSuccess={handleScanSuccess} />
                     <FileScanner onScanSuccess={handleScanSuccess} />
                 </div>
             </DialogContent>
           </Dialog>
        </CardHeader>
        <CardContent>
          {badges.length > 0 ? (
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4">
              {badges.map(({ id, badge, claimedAt }) => badge ? (
                <Dialog key={id}>
                    <DialogTrigger asChild>
                        <div className="flex flex-col items-center text-center gap-2 cursor-pointer p-2 rounded-lg hover:bg-muted transition-colors">
                            <div className="relative h-24 w-24">
                                <Image src={badge.imageUrl} alt={badge.name} width={96} height={96} className="object-contain" />
                            </div>
                            <p className="text-sm font-headline">{badge.name}</p>
                            <p className="text-xs text-muted-foreground">{format(new Date(claimedAt), 'yyyy-MM-dd')}</p>
                        </div>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader className="items-center text-center">
                             <div className="relative h-32 w-32 mb-4">
                                <Image src={badge.imageUrl} alt={badge.name} width={128} height={128} className="object-contain" />
                            </div>
                            <DialogTitle className="text-2xl font-headline">{badge.name}</DialogTitle>
                        </DialogHeader>
                         <div className="my-4 text-center text-sm text-muted-foreground">
                            {badge.description}
                        </div>
                    </DialogContent>
                </Dialog>
              ) : null)}
            </div>
          ) : (
            <div className="text-center py-16 text-muted-foreground">
              <p>您还没有收集任何徽章。</p>
              <p className="text-sm mt-2">快去参加活动，扫描二维码来获取吧！</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
