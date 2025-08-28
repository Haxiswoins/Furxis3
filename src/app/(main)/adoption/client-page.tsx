
'use client';

import Image from 'next/image';
import Link from 'next/link';
import type { CharacterSeries, SiteContent } from '@/types';


type AdoptionSeriesClientPageProps = {
  seriesData: CharacterSeries[];
  content: SiteContent | null;
}

export function AdoptionSeriesClientPage({ seriesData, content }: AdoptionSeriesClientPageProps) {
  return (
    <div>
      <div className="text-center mb-12">
        <h1 className="text-3xl sm:text-4xl font-headline">设定领养</h1>
        <p className="mt-2 text-base sm:text-lg text-muted-foreground">
        {content?.adoptionPageDescription || '给这些预先设计的角色一个家。'}
        </p>
      </div>

      <div 
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
      >
          {seriesData.length > 0 ? (
          seriesData.map((s) => (
              <div key={s.id}>
                  <Link href={`/adoption/${encodeURIComponent(s.name)}`} className="group">
                  <div className="relative aspect-[3/4] rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
                      <Image
                      src={s.imageUrl}
                      alt={s.name}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                      style={{objectFit: 'cover'}}
                      className="transition-transform duration-500 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 flex flex-col justify-end p-6 text-white bg-gradient-to-t from-black/60 to-transparent">
                      <h3 className="font-headline text-2xl" style={{textShadow: '1px 1px 4px rgba(0,0,0,0.8)'}}>{s.name}</h3>
                      <p className="text-sm opacity-90 mt-1 line-clamp-2" style={{textShadow: '1px 1px 3px rgba(0,0,0,0.7)'}}>{s.description}</p>
                      </div>
                  </div>
                  </Link>
              </div>
          ))
          ) : (
          <div className="col-span-full text-center py-10">
              <p className="text-muted-foreground">暂无设定系列。</p>
          </div>
          )}
      </div>
    </div>
  );
}
