
'use client';

import Link from 'next/link';
import Image from 'next/image';
import { getSiteContent } from '@/lib/data-service';
import { Skeleton } from '@/components/ui/skeleton';
import { ContactInfo } from '@/components/contact-info';
import { useEffect, useState } from 'react';
import type { SiteContent } from '@/types';
import { cn } from '@/lib/utils';

function HomeCardSkeleton({ className }: { className?: string }) {
  return (
     <div className={`relative rounded-2xl overflow-hidden shadow-2xl bg-muted ${className}`}>
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
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    getSiteContent().then(data => {
      setContent(data);
      setLoading(false);
    });
  }, []);

  const cardLinkClass = "group block";
  const cardDivClass = "relative rounded-2xl overflow-hidden shadow-2xl transition-all duration-300 ease-in-out hover:shadow-primary/20 aspect-[4/5]";
  
  const cardImageClass = "transition-transform duration-500 ease-in-out group-hover:scale-105";
  const cardTextDivClass = "absolute inset-0 flex flex-col justify-end p-6 md:p-8 text-white bg-gradient-to-t from-black/70 via-black/40 to-transparent transition-all duration-500 ease-in-out";
  const cardTitleClass = "font-headline text-2xl md:text-4xl transition-transform duration-500 ease-in-out group-hover:-translate-y-1";
  const cardDescriptionClass = "mt-2 opacity-0 transition-all duration-500 ease-in-out group-hover:opacity-90 group-hover:-translate-y-1 text-sm md:text-base";

  return (
    <div className={cn(
      "flex flex-col min-h-[calc(100vh-8rem)] transition-opacity duration-1000 ease-in",
      isMounted ? "opacity-100" : "opacity-0"
    )}>
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
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-7xl">
            
            {loading ? <HomeCardSkeleton /> : (
              <Link href="/commission" className={cardLinkClass}>
                <div className={cardDivClass}>
                  <Image
                    src={content?.commissionImageUrl || "https://placehold.co/800x1000.png"}
                    alt="委托申请"
                    fill
                    priority
                    sizes="(max-width: 768px) 100vw, 33vw"
                    style={{objectFit: "cover"}}
                    className={cardImageClass}
                  />
                  <div className={cardTextDivClass}>
                    <h2 className={cardTitleClass}>{content?.commissionTitle || '委托申请'}</h2>
                    <p className={cardDescriptionClass}>{content?.commissionDescription || '为您量身定制。'}</p>
                  </div>
                </div>
              </Link>
            )}

            {loading ? <HomeCardSkeleton /> : (
              <Link href="/adoption" className={cardLinkClass}>
                <div className={cardDivClass}>
                  <Image
                    src={content?.adoptionImageUrl || "https://placehold.co/800x1000.png"}
                    alt="设定领养"
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    style={{objectFit: "cover"}}
                    className={cardImageClass}
                  />
                  <div className={cardTextDivClass}>
                    <h2 className={cardTitleClass}>{content?.adoptionTitle || '设定领养'}</h2>
                    <p className={cardDescriptionClass}>{content?.adoptionDescription || '领养一个预先设计的角色。'}</p>
                  </div>
                </div>
              </Link>
            )}

            {loading ? <HomeCardSkeleton /> : (
              <Link href="/works" className={cardLinkClass}>
                <div className={cardDivClass}>
                  <Image
                    src={content?.workImageUrl || "https://placehold.co/800x1000.png"}
                    alt="作品一览"
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    style={{objectFit: "cover"}}
                    className={cardImageClass}
                  />
                  <div className={cardTextDivClass}>
                    <h2 className={cardTitleClass}>{content?.workTitle || '作品一览'}</h2>
                    <p className={cardDescriptionClass}>{content?.workDescription || '查看我们过往的精彩作品。'}</p>
                  </div>
                </div>
              </Link>
            )}
        </div>
      </div>
      <div className="w-full mt-16 pb-8 text-center">
        <ContactInfo content={content} />
      </div>
    </div>
  );
}
