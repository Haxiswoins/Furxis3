
'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { getWorks } from '@/lib/data-service';
import type { Work } from '@/types';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';

function WorkCardSkeleton() {
  return (
    <Card className="overflow-hidden shadow-lg flex flex-col text-sm">
      <CardHeader className="p-0">
        <div className="relative aspect-[3/4] bg-muted">
          <Skeleton className="h-full w-full" />
        </div>
      </CardHeader>
      <CardContent className="p-3 flex-grow">
        <Skeleton className="h-6 w-3/4 mb-1" />
        <Skeleton className="h-4 w-1/2 mb-2" />
      </CardContent>
    </Card>
  );
}

export default function WorksPage() {
  const [worksByYear, setWorksByYear] = useState<Record<string, Work[]>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const worksData = await getWorks();
        const groupedWorks = worksData.reduce((acc, work) => {
          const year = new Date(work.completionDate).getFullYear().toString();
          if (!acc[year]) {
            acc[year] = [];
          }
          acc[year].push(work);
          return acc;
        }, {} as Record<string, Work[]>);
        
        setWorksByYear(groupedWorks);
      } catch (error) {
        console.error("Failed to fetch works:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const sortedYears = Object.keys(worksByYear).sort((a, b) => parseInt(b) - parseInt(a));

  return (
    <div>
      <div className="text-center mb-12">
        <h1 className="text-4xl font-headline">作品一览</h1>
        <p className="mt-2 text-lg text-muted-foreground">
          这里是我们过往的精彩作品集锦。
        </p>
      </div>

      {loading ? (
        <div className="space-y-12">
            {[...Array(2)].map((_, i) => (
                <div key={i}>
                    <Skeleton className="h-10 w-32 mb-6" />
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                        {[...Array(5)].map((_, j) => <WorkCardSkeleton key={j} />)}
                    </div>
                </div>
            ))}
        </div>
      ) : sortedYears.length > 0 ? (
        <div className="space-y-12">
          {sortedYears.map(year => (
            <div key={year}>
              <h2 className="text-3xl font-headline mb-6 pl-4 border-l-4 border-primary">{year}</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {worksByYear[year].map((work) => (
                  <Link key={work.id} href={`/works/${work.id}`} passHref>
                    <Card className="overflow-hidden shadow-lg hover:shadow-2xl transition-shadow duration-300 flex flex-col text-sm h-full group">
                      <CardHeader className="p-0">
                        <div className="relative aspect-[3/4]">
                            <Image
                              src={work.imageUrls[0]}
                              alt={work.workName}
                              fill
                              sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw"
                              style={{objectFit: 'cover'}}
                              className="transition-transform duration-300 group-hover:scale-105"
                            />
                        </div>
                      </CardHeader>
                      <CardContent className="p-3 flex-grow">
                        <CardTitle className="text-base font-headline mb-1 truncate">{work.workName}</CardTitle>
                        <CardDescription className="text-xs text-muted-foreground">{work.clientName}</CardDescription>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-10">
          <p className="text-muted-foreground">暂无已完成的作品。</p>
        </div>
      )}
    </div>
  );
}
