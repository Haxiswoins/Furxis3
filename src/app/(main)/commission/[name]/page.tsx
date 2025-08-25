
import { notFound } from 'next/navigation';
import { getCommissionOptionByName, getCommissionStylesByOptionId } from '@/lib/data-service';
import { CommissionStylePageClient } from './client-page';
import type { CommissionOption, CommissionStyle } from '@/types';

export const dynamic = 'force-dynamic';

export default async function CommissionStylePage({ params }: { params: { name: string } }) {
  const commissionName = decodeURIComponent(params.name as string);

  if (!commissionName) {
    notFound();
  }
  
  const commissionOption = await getCommissionOptionByName(commissionName);
  
  if (!commissionOption) {
      notFound();
  }

  const styles = await getCommissionStylesByOptionId(commissionOption.id);

  return (
    <div className="container mx-auto">
        <CommissionStylePageClient 
            styles={styles} 
            commissionOption={commissionOption} 
            commissionName={commissionName} 
        />
    </div>
  );
}
