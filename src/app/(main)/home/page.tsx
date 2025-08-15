
'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { getSiteContent } from '@/lib/data-service';
import type { SiteContent } from '@/types';
import { Skeleton } from '@/components/ui/skeleton';
import { ContactInfo } from '@/components/contact-info';

function HomeCardSkeleton() {
  return (
     <div className="relative aspect-[3/4] rounded-2xl overflow-hidden shadow-2xl bg-muted">
       <Skeleton className="w-full h-full" />
       <div className="absolute inset-0 flex flex-col justify-end p-8">
           <Skeleton className="h-10 w-3/4" />
           <Skeleton className="h-6 w-1/2 mt-3" />
       </div>
    </div>
  )
}


export default function HomePage() {
  const [content, setContent] = useState<SiteContent | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getSiteContent()
      .then(data => {
        if (data) {
          setContent(data);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const cardLinkClass = "group w-full md:w-[30%]";
  const cardDivClass = "relative aspect-[3/4] rounded-2xl overflow-hidden shadow-2xl";
  const cardImageClass = "transition-transform duration-500 group-hover:scale-110";
  const cardTextDivClass = "absolute inset-0 flex flex-col justify-end p-8 text-white bg-gradient-to-t from-black/60 to-transparent transition-transform duration-500 group-hover:-translate-y-2 group-hover:scale-105";

  return (
    <div className="flex flex-col min-h-[calc(100vh-8rem)]">
      <div className="flex-grow flex flex-col items-center justify-center">
        <div className="text-center mb-12">
          <Link href="/">
            <div className="relative inline-block cursor-pointer group">
              <h1 className="text-5xl font-headline transition-colors duration-300 relative z-10 group-hover:text-primary">
                前行无界
              </h1>
              <div
                className="absolute inset-0 flex items-center justify-center text-primary opacity-80"
                style={{ zIndex: 5 }}
              >
                <span className="font-body text-4xl font-extralight tracking-[0.3em] whitespace-nowrap px-4 mt-12">
                  FORWARD INFINITY
                </span>
              </div>
            </div>
          </Link>
        </div>
        <div className="flex flex-col md:flex-row items-center justify-center gap-8 w-full max-w-6xl">
            
            {loading ? <HomeCardSkeleton /> : (
              <Link href="/commission" className={cardLinkClass}>
                <div className={cardDivClass}>
                  <Image
                    src={content?.commissionImageUrl || "https://placehold.co/600x800.png"}
                    alt="委托申请"
                    fill
                    sizes="(max-width: 768px) 100vw, 30vw"
                    style={{objectFit: "cover"}}
                    className={cardImageClass}
                  />
                  <div className={cardTextDivClass} style={{textShadow: '2px 2px 8px rgba(0,0,0,0.7)'}}>
                    <h2 className="font-headline text-4xl">{content?.commissionTitle || '委托申请'}</h2>
                    <p className="mt-2 opacity-90">{content?.commissionDescription || '为您量身定制。'}</p>
                  </div>
                </div>
              </Link>
            )}

            {loading ? <HomeCardSkeleton /> : (
              <Link href="/adoption" className={cardLinkClass}>
                <div className={cardDivClass}>
                  <Image
                    src={content?.adoptionImageUrl || "https://placehold.co/600x800.png"}
                    alt="设定领养"
                    fill
                    sizes="(max-width: 768px) 100vw, 30vw"
                    style={{objectFit: "cover"}}
                    className={cardImageClass}
                  />
                  <div className={cardTextDivClass} style={{textShadow: '2px 2px 8px rgba(0,0,0,0.7)'}}>
                    <h2 className="font-headline text-4xl">{content?.adoptionTitle || '设定领养'}</h2>
                    <p className="mt-2 opacity-90">{content?.adoptionDescription || '领养一个预先设计的角色。'}</p>
                  </div>
                </div>
              </Link>
            )}

            {loading ? <HomeCardSkeleton /> : (
              <Link href="/works" className={cardLinkClass}>
                <div className={cardDivClass}>
                  <Image
                    src={content?.workImageUrl || "https://placehold.co/600x800.png"}
                    alt="作品一览"
                    fill
                    sizes="(max-width: 768px) 100vw, 30vw"
                    style={{objectFit: "cover"}}
                    className={cardImageClass}
                  />
                  <div className={cardTextDivClass} style={{textShadow: '2px 2px 8px rgba(0,0,0,0.7)'}}>
                    <h2 className="font-headline text-4xl">{content?.workTitle || '作品一览'}</h2>
                    <p className="mt-2 opacity-90">{content?.workDescription || '查看我们过往的精彩作品。'}</p>
                  </div>
                </div>
              </Link>
            )}
        </div>
      </div>
      <div className="w-full mt-12 pb-8 text-center">
        <ContactInfo content={content} />
      </div>
    </div>
  );
}
