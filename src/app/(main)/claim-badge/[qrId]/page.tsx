
'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { validateBadgeQRCode, confirmAndGrantBadge } from '@/lib/data-service';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { CheckCircle2, AlertTriangle, XCircle, Loader2, HelpCircle } from 'lucide-react';
import Image from 'next/image';
import type { Badge } from '@/types';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';


export default function ClaimBadgePage() {
  const { qrId } = useParams();
  const router = useRouter();
  const { user, loading: authLoading, login } = useAuth();

  const [pageState, setPageState] = useState<'loading' | 'error' | 'confirmation' | 'submitting'>('loading');
  const [errorMessage, setErrorMessage] = useState('');
  const [badgeToClaim, setBadgeToClaim] = useState<Badge | null>(null);

  const processValidation = useCallback(async (userId: string, codeId: string) => {
    try {
      const result = await validateBadgeQRCode(codeId, userId);
      if (result.success && result.badge) {
        setBadgeToClaim(result.badge);
        setPageState('confirmation');
      } else {
        setErrorMessage(result.message);
        setPageState('error');
      }
    } catch (e) {
      setPageState('error');
      setErrorMessage(e instanceof Error ? e.message : "发生未知错误。");
    }
  }, []);

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      login(`/claim-badge/${qrId}`);
      return;
    }
    
    if (pageState === 'loading' && user && qrId) {
        processValidation(user.uid, qrId as string);
    }
  }, [user, qrId, authLoading, login, pageState, processValidation]);
  
  const handleConfirmClaim = async () => {
    if (!user || !qrId) return;
    
    setPageState('submitting');
    
    try {
      const result = await confirmAndGrantBadge(qrId as string, user.uid);
      if(result.success) {
        // On success, redirect without a toast and replace history
        router.replace('/my-badges');
      } else {
        // If confirmation fails for some reason (e.g. race condition), show error
        setErrorMessage(result.message);
        setPageState('error');
      }
    } catch(e) {
       setErrorMessage(e instanceof Error ? e.message : "发生未知错误。");
       setPageState('error');
    }
  }


  const renderLoading = () => (
    <Card>
      <CardHeader className="items-center text-center space-y-4">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
        <CardTitle>正在验证...</CardTitle>
        <CardDescription>请稍候，我们正在检查您的徽章信息。</CardDescription>
      </CardHeader>
    </Card>
  );

  const renderError = () => (
     <Card>
        <CardHeader className="items-center text-center space-y-4">
            <XCircle className="h-16 w-16 text-red-500" />
            <CardTitle>操作失败</CardTitle>
            <CardDescription>{errorMessage}</CardDescription>
        </CardHeader>
        <CardFooter>
            <Button className="w-full" onClick={() => router.push('/my-badges')}>
              返回我的徽章
            </Button>
        </CardFooter>
      </Card>
  );
  
  const renderConfirmation = () => {
    if (!badgeToClaim) return renderError();
    
    return (
        <AlertDialog open={true}>
            <AlertDialogContent>
                <AlertDialogHeader className="items-center text-center">
                    <div className="relative h-32 w-32 mb-4">
                        <Image src={badgeToClaim.imageUrl} alt={badgeToClaim.name} width={128} height={128} className="object-contain" />
                    </div>
                    <AlertDialogTitle className="text-2xl font-headline">{badgeToClaim.name}</AlertDialogTitle>
                    <AlertDialogDescription className="text-center">
                        {badgeToClaim.description}
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter className="!flex-col !space-x-0 sm:!flex-col sm:!space-x-0 gap-2">
                     <AlertDialogAction onClick={handleConfirmClaim}>确认添加</AlertDialogAction>
                     <AlertDialogCancel onClick={() => router.push('/my-badges')}>取消</AlertDialogCancel>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
  };
  
   const renderSubmitting = () => (
     <Card>
      <CardHeader className="items-center text-center space-y-4">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
        <CardTitle>正在添加...</CardTitle>
        <CardDescription>正在将新徽章加入您的收藏。</CardDescription>
      </CardHeader>
    </Card>
  );
  

  const renderContent = () => {
    switch (pageState) {
      case 'loading':
        return renderLoading();
      case 'error':
        return renderError();
      case 'confirmation':
        return renderConfirmation();
      case 'submitting':
          return renderSubmitting();
      default:
        return null;
    }
  };

  return (
    <div className="max-w-md mx-auto">
      {renderContent()}
    </div>
  );
}
