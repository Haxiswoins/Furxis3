import Image from 'next/image';
import { notFound } from 'next/navigation';
import { Separator } from '@/components/ui/separator';
import { getWorkById } from '@/lib/data-service';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { WorkImages } from './client-page';

async function WorkDetailPage({ params }: { params: { id: string }}) {
  const work = await getWorkById(params.id);

  if (!work) {
    notFound();
  }

  return (
    <div className="max-w-5xl mx-auto">
      <Card>
        <CardContent className="p-4 md:p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
            {/* Details Column */}
            <div className="sticky top-24">
              <CardHeader className="px-0 pt-0">
                <CardTitle className="text-4xl font-headline">{work.workName}</CardTitle>
              </CardHeader>
              <Separator className="my-4" />
              <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                      <p className="text-muted-foreground">委托人</p>
                      <p className="font-semibold">{work.clientName}</p>
                  </div>
                  <div>
                      <p className="text-muted-foreground">城市</p>
                      <p className="font-semibold">{work.clientCity}</p>
                  </div>
                  <div className="col-span-2">
                      <p className="text-muted-foreground">完成日期</p>
                      <p className="font-semibold">{new Date(work.completionDate).toLocaleDateString()}</p>
                  </div>
              </div>
               {work.description && (
                <>
                  <Separator className="my-4" />
                  <div>
                      <p className="text-muted-foreground text-sm">作品描述</p>
                      <p className="mt-1 whitespace-pre-wrap">{work.description}</p>
                  </div>
                </>
              )}
            </div>

            {/* Image Column */}
            <WorkImages work={work} />

          </div>
        </CardContent>
      </Card>
    </div>
  );
}


export default WorkDetailPage;
