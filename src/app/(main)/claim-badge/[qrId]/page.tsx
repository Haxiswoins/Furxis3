
'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { claimBadgeQRCode } from '@/lib/data-service';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { CheckCircle2, AlertTriangle, XCircle, Loader2 } from 'lucide-react';
import Image from 'next/image';
import type { Badge } from '@/types';

export default function ClaimBadgePage() {
  const { qrId } = useParams();
  const router = useRouter();
  const { user, loading: authLoading, login } = useAuth();
  
  const [claimStatus, setClaimStatus] = useState<'loading' | 'success' | 'already-claimed' | 'already-owned' | 'error'>('loading');
  const [message, setMessage] = useState('');
  const [claimedBadge, setClaimedBadge] = useState<Badge | null>(null);

  const processClaim = useCallback(async () => {
    if (!user || !qrId) return;

    const result = await claimBadgeQRCode(qrId as string, user.uid);
    setMessage(result.message);
    
    if (result.badge) {
      setClaimedBadge(result.badge);
    }
    
    if (result.success) {
      setClaimStatus('success');
    } else {
      if (result.message.includes('已拥有')) {
        setClaimStatus('already-owned');
      } else if (result.message.includes('已被使用') || result.message.includes('已被领取')) {
        setClaimStatus('already-claimed');
      } else {
        setClaimStatus('error');
      }
    }
  }, [qrId, user]);


  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      login(`/claim-badge/${qrId}`);
      return;
    }

    processClaim();
  }, [qrId, user, authLoading, login, processClaim]);

  const renderStatus = () => {
    switch (claimStatus) {
      case 'loading':
        return (
          <>
            <Loader2 className="h-16 w-16 animate-spin text-primary" />
            <CardTitle>正在验证...</CardTitle>
            <CardDescription>请稍候，我们正在为您领取徽章。</CardDescription>
          </>
        );
      case 'success':
        return (
          <>
            <CheckCircle2 className="h-16 w-16 text-green-500" />
            <CardTitle>领取成功！</CardTitle>
            <CardDescription>{message}</CardDescription>
          </>
        );
      case 'already-owned':
         return (
          <>
            <AlertTriangle className="h-16 w-16 text-yellow-500" />
            <CardTitle>操作提醒</CardTitle>
            <CardDescription>{message}</CardDescription>
          </>
        );
      case 'already-claimed':
        return (
          <>
            <XCircle className="h-16 w-16 text-red-500" />
            <CardTitle>领取失败</CardTitle>
            <CardDescription>{message}</CardDescription>
          </>
        );
      case 'error':
        return (
          <>
            <XCircle className="h-16 w-16 text-red-500" />
            <CardTitle>领取失败</CardTitle>
            <CardDescription>{message}</CardDescription>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <div className="max-w-md mx-auto">
      <Card>
        <CardHeader className="items-center text-center space-y-4">
            {renderStatus()}
        </CardHeader>
        <CardContent className="flex flex-col items-center">
          {claimedBadge && (
            <div className="flex flex-col items-center gap-2">
              <Image src={claimedBadge.imageUrl} alt={claimedBadge.name} width={128} height={128} />
              <p className="font-semibold">{claimedBadge.name}</p>
            </div>
          )}
        </CardContent>
        <CardFooter>
          {claimStatus !== 'loading' && (
            <Button className="w-full" onClick={() => router.push('/my-badges')}>
              查看我的徽章
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}
