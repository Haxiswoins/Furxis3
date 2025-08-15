
import { notFound } from 'next/navigation';
import { Separator } from '@/components/ui/separator';
import { getWorkById } from '@/lib/data-service';
import { Card, CardContent } from '@/components/ui/card';
import { WorkImages } from './client-page';

async function WorkDetailPage({ params }: { params: { id: string }}) {
  const work = await getWorkById(params.id);

  if (!work) {
    notFound();
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header Section */}
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

      {/* Image Grid Section */}
      <WorkImages work={work} />
    </div>
  );
}

export default WorkDetailPage;
