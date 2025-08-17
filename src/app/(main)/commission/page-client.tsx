'use client';

import { CommissionClientPage } from './client-page';
import { motion } from 'framer-motion';
import type { CommissionOption, SiteContent } from '@/types';

type CommissionPageClientProps = {
  options: CommissionOption[];
  content: SiteContent | null;
}

export function CommissionPageClient({ options, content }: CommissionPageClientProps) {
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
      <CommissionClientPage commissionOptions={options} />
    </motion.div>
  );
}
