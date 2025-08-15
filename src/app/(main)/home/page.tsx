import Link from 'next/link';
import Image from 'next/image';
import { getSiteContent } from '@/lib/data-service';
import { Skeleton } from '@/components/ui/skeleton';
import { ContactInfo } from '@/components/contact-info';

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

export default async function HomePage() {
  const content = await getSiteContent();

  const primaryCardLinkClass = "group w-full";
  const primaryCardDivClass = "relative aspect-[16/7] rounded-2xl overflow-hidden shadow-2xl";

  const secondaryCardLinkClass = "group w-full md:w-[calc(50%-1rem)]";
  const secondaryCardDivClass = "relative aspect-[4/3] rounded-2xl overflow-hidden shadow-2xl";
  
  const cardImageClass = "transition-transform duration-500 ease-in-out group-hover:scale-105";
  const cardTextDivClass = "absolute inset-0 flex flex-col justify-end p-6 md:p-8 text-white bg-gradient-to-t from-black/70 via-black/40 to-transparent transition-all duration-500 ease-in-out";
  const cardTitleClass = "font-headline text-3xl md:text-4xl transition-transform duration-500 ease-in-out group-hover:-translate-y-1";
  const cardDescriptionClass = "mt-2 opacity-0 transition-all duration-500 ease-in-out group-hover:opacity-90 group-hover:-translate-y-1 text-sm md:text-base";


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
        
        <div className="flex flex-col items-center justify-center gap-8 w-full max-w-6xl">
            
            {!content ? <HomeCardSkeleton className="aspect-[16/7]" /> : (
              <Link href="/commission" className={primaryCardLinkClass}>
                <div className={primaryCardDivClass}>
                  <Image
                    src={content?.commissionImageUrl || "https://placehold.co/1600x700.png"}
                    alt="委托申请"
                    fill
                    priority
                    sizes="(max-width: 768px) 100vw, 66vw"
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

            <div className="flex flex-col md:flex-row items-center justify-center gap-8 w-full">
              {!content ? <HomeCardSkeleton className="aspect-[4/3] w-full md:w-[calc(50%-1rem)]" /> : (
                <Link href="/adoption" className={secondaryCardLinkClass}>
                  <div className={secondaryCardDivClass}>
                    <Image
                      src={content?.adoptionImageUrl || "https://placehold.co/800x600.png"}
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

              {!content ? <HomeCardSkeleton className="aspect-[4/3] w-full md:w-[calc(50%-1rem)]" /> : (
                <Link href="/works" className={secondaryCardLinkClass}>
                  <div className={secondaryCardDivClass}>
                    <Image
                      src={content?.workImageUrl || "https://placehold.co/800x600.png"}
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
      </div>
      <div className="w-full mt-16 pb-8 text-center">
        <ContactInfo content={content} />
      </div>
    </div>
  );
}
