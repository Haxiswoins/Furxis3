
import { notFound } from 'next/navigation';
import { getCommissionOptionByName, getCommissionStylesByOptionId, getSiteContent } from '@/lib/data-service';
import { CommissionApplicationFormClient } from './form-client';

export default async function CommissionApplicationPage({ params }: { params: { name: string, style: string } }) {
  const commissionName = decodeURIComponent(params.name as string);
  const styleName = decodeURIComponent(params.style as string);

  if (!commissionName || !styleName) {
    notFound();
  }
    
  const [commissionOption, siteContent] = await Promise.all([
    getCommissionOptionByName(commissionName),
    getSiteContent()
  ]);

  if (!commissionOption) {
    notFound();
  }
  
  const styles = await getCommissionStylesByOptionId(commissionOption.id);
  const commissionStyle = styles.find(s => s.name === styleName);

  if (!commissionStyle) {
    notFound();
  }

  return (
    <div className="w-full max-w-4xl mx-auto">
        <CommissionApplicationFormClient
            commissionOption={commissionOption}
            commissionStyle={commissionStyle}
            siteContent={siteContent}
        />
    </div>
  );
}
