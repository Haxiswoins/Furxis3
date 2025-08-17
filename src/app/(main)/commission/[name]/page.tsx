
import { notFound } from 'next/navigation';
import { getCommissionOptionByName, getCommissionStylesByOptionId } from '@/lib/data-service';
import { CommissionStyleClientPage } from './client-page';
import { motion } from 'framer-motion';

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
    <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
    >
      <div className="text-center mb-12">
        <h1 className="text-4xl font-headline">样式选择</h1>
        <p className="mt-2 text-lg text-muted-foreground">
          {`请为 “${commissionOption.name}” 选择您感兴趣的具体样式`}
        </p>
      </div>

      <CommissionStyleClientPage 
        styles={styles} 
        commissionOption={commissionOption} 
        commissionName={commissionName} 
      />
    </motion.div>
  );
}

