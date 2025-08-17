
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { getSiteContent } from '@/lib/data-service';
import { ContactInfo } from '@/components/contact-info';
import type { SiteContent } from '@/types';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';

function HomePageSkeleton() {
    return (
        <div className="flex flex-col flex-grow">
             <div className="flex-grow flex flex-col items-center justify-center">
                 <div className="text-center mb-12">
                     <Skeleton className="h-12 w-48" />
                     <Skeleton className="h-8 w-64 mt-4" />
                 </div>
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-7xl">
                    {[...Array(3)].map((_, i) => (
                        <div key={i} className="relative rounded-2xl overflow-hidden aspect-[4/5]">
                            <Skeleton className="h-full w-full" />
                        </div>
                    ))}
                 </div>
             </div>
             <div className="w-full mt-16 pb-8 flex justify-center">
                <Skeleton className="h-10 w-28" />
             </div>
        </div>
    )
}

export default function HomePage() {
  const router = useRouter();
  const [content, setContent] = useState<SiteContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    async function fetchData() {
        setLoading(true);
        try {
            const siteContent = await getSiteContent();
            setContent(siteContent);
        } catch (error) {
            console.error("Failed to fetch site content:", error);
        } finally {
            setLoading(false);
        }
    }
    fetchData();
  }, []);

  const handleNavigate = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    setIsTransitioning(true);
    setTimeout(() => {
        router.push('/');
    }, 500); // Corresponds to the duration of the fade-out animation
  }

  const cardLinkClass = "group block";
  const cardDivClass = "relative rounded-2xl overflow-hidden shadow-2xl transition-all duration-300 ease-in-out hover:shadow-primary/20 aspect-[4/5]";
  
  const cardImageClass = "transition-transform duration-500 ease-in-out group-hover:scale-105";
  const cardTextDivClass = "absolute inset-0 flex flex-col justify-end p-6 md:p-8 text-white bg-gradient-to-t from-black/70 via-black/40 to-transparent transition-all duration-500 ease-in-out";
  const cardTitleClass = "font-headline text-2xl md:text-4xl transition-transform duration-500 ease-in-out group-hover:-translate-y-1";
  const cardDescriptionClass = "mt-2 opacity-0 transition-all duration-500 ease-in-out group-hover:opacity-90 group-hover:-translate-y-1 text-sm md:text-base";

  if (loading) {
      return <HomePageSkeleton />;
  }
  
  return (
    <div className={cn(
        "flex flex-col flex-grow transition-opacity duration-500",
        isTransitioning ? "opacity-0" : "opacity-100"
    )}>
        <div className="flex-grow flex flex-col items-center justify-center">
        <div className="text-center mb-12">
            <a href="/" onClick={handleNavigate}>
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
            </a>
        </div>
        
        <div
          className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-7xl"
        >
          <div>
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
          </div>

          <div>
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
          </div>
          
          <div>
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
          </div>
        </div>

        </div>
        <div className="w-full mt-16 pb-8 text-center">
        <ContactInfo content={content} />
        </div>
    </div>
  );
}
