
import { getCommissionOptions, getSiteContent } from '@/lib/data-service';
import { CommissionClientPage } from './client-page';
import { motion } from 'framer-motion';

export default async function CommissionPage() {
  const [fetchedOptions, content] = await Promise.all([
    getCommissionOptions(),
    getSiteContent(),
  ]);

  const sortedOptions = fetchedOptions.sort((a, b) => {
    const timeA = parseInt(a.id.split('_')[1] || '0');
    const timeB = parseInt(b.id.split('_')[1] || '0');
    return timeB - timeA;
  });

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      <div className="text-center mb-12">
        <h1 className="text-4xl font-headline">委托申请</h1>
        <p className="mt-2 text-lg text-muted-foreground">
          {content?.commissionPageDescription || '选择一个基础套餐开始您的定制兽装之旅。'}
        </p>
      </div>
      <CommissionClientPage commissionOptions={sortedOptions} />
    </motion.div>
  );
}
