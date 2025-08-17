import { notFound } from 'next/navigation';
import { getCommissionOptionByName, getCommissionStylesByOptionId } from '@/lib/data-service';
import { CommissionStylePageClient } from './client-page';

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
    <CommissionStylePageClient 
      styles={styles} 
      commissionOption={commissionOption} 
      commissionName={commissionName} 
    />
  );
}
