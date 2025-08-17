
import { notFound } from 'next/navigation';
import { Separator } from '@/components/ui/separator';
import { getWorkById } from '@/lib/data-service';
import { WorkImages } from './client-page';
import { motion } from 'framer-motion';

export default async function WorkDetailPage({ params }: { params: { id: string } }) {
  const workId = params.id as string;
  
  if (!workId) {
    notFound();
  }

  const work = await getWorkById(workId);
  
  if (!work) {
    notFound();
  }

  return (
    <motion.div 
        className="max-w-6xl mx-auto space-y-8"
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
    >
      <div className="text-center space-y-2">
        <h1 className="text-5xl font-headline font-bold">{work.workName}</h1>
        <p className="text-muted-foreground">
          委托人: {work.clientName} | 完成于: {new Date(work.completionDate).toLocaleDateString()}
        </p>
        {work.description && (
            <p className="text-lg text-foreground/80 max-w-3xl mx-auto pt-2">
                {work.description}
            </p>
        )}
      </div>

      <Separator />

      <WorkImages work={work} />
    </motion.div>
  );
}
