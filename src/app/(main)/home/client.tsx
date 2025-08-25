
'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ContactInfo } from '@/components/contact-info';
import type { SiteContent } from '@/types';

type HomeClientProps = {
    content: SiteContent | null;
}

export function HomeClient({ content }: HomeClientProps) {
  const router = useRouter();
  const [isExiting, setIsExiting] = useState(false);

  const handleNavigate = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    const href = e.currentTarget.getAttribute('href');
    if (!href) return;

    setIsExiting(true);
    setTimeout(() => {
        router.push(href);
    }, 500); // This duration should match the exit animation duration
  }

  const cardLinkClass = "group block";
  const cardDivClass = "relative rounded-2xl overflow-hidden shadow-2xl transition-all duration-300 ease-in-out hover:shadow-primary/20 aspect-[4/5]";
  
  const cardImageClass = "transition-transform duration-500 ease-in-out group-hover:scale-105";
  const cardTextDivClass = "absolute inset-0 flex flex-col justify-end p-6 md:p-8 text-white bg-gradient-to-t from-black/70 via-black/40 to-transparent transition-all duration-500 ease-in-out";
  const cardTitleClass = "font-headline text-2xl md:text-4xl transition-transform duration-500 ease-in-out group-hover:-translate-y-1";
  const cardDescriptionClass = "mt-2 opacity-0 transition-all duration-500 ease-in-out group-hover:opacity-90 group-hover:-translate-y-1 text-sm md:text-base";

  return (
    <AnimatePresence onExitComplete={() => window.scrollTo(0, 0)}>
      {!isExiting && (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col min-h-[calc(100vh-theme(spacing.24))]"
        >
            <div className="pt-8 md:pt-12">
            <div className="text-center mb-8 md:mb-12">
                <a href="/" onClick={handleNavigate}>
                    <div className="relative inline-block cursor-pointer group">
                        <h1 
                          className="text-4xl md:text-5xl font-headline transition-colors duration-300 relative z-10 group-hover:text-primary drop-shadow-lg"
                        >
                        前行无界
                        </h1>
                        <div
                        className="absolute inset-0 flex items-center justify-center text-primary opacity-80"
                        style={{ zIndex: 5 }}
                        >
                        <span 
                          className="font-body text-3xl md:text-4xl font-extralight tracking-[0.3em] whitespace-nowrap px-4 mt-10 md:mt-12"
                        >
                            FORWARD INFINITY
                        </span>
                        </div>
                    </div>
                </a>
            </div>
            
            <div
              className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 w-full max-w-7xl mx-auto"
            >
              <div>
                <Link href="/commission" className={cardLinkClass} onClick={handleNavigate}>
                  <div className={cardDivClass}>
                      <Image
                      src={content?.commissionImageUrl || "https://placehold.co/800x1000.png"}
                      alt="委托申请"
                      fill
                      priority
                      sizes="(max-width: 768px) 100vw, 33vw"
                      style={{objectFit: "cover"}}
                      className={cardImageClass}
                      data-ai-hint="commission custom"
                      />
                      <div className={cardTextDivClass}>
                      <h2 className={cardTitleClass}>{content?.commissionTitle || '委托申请'}</h2>
                      <p className={cardDescriptionClass}>{content?.commissionDescription || '为您量身定制。'}</p>
                      </div>
                  </div>
                </Link>
              </div>

              <div>
                <Link href="/adoption" className={cardLinkClass} onClick={handleNavigate}>
                  <div className={cardDivClass}>
                      <Image
                      src={content?.adoptionImageUrl || "https://placehold.co/800x1000.png"}
                      alt="设定领养"
                      fill
                      sizes="(max-width: 768px) 100vw, 33vw"
                      style={{objectFit: "cover"}}
                      className={cardImageClass}
                      data-ai-hint="character design"
                      />
                      <div className={cardTextDivClass}>
                      <h2 className={cardTitleClass}>{content?.adoptionTitle || '设定领养'}</h2>
                      <p className={cardDescriptionClass}>{content?.adoptionDescription || '领养一个预先设计的角色。'}</p>
                      </div>
                  </div>
                </Link>
              </div>
              
              <div>
                <Link href="/works" className={cardLinkClass} onClick={handleNavigate}>
                  <div className={cardDivClass}>
                      <Image
                      src={content?.workImageUrl || "https://placehold.co/800x1000.png"}
                      alt="作品一览"
                      fill
                      sizes="(max-width: 768px) 100vw, 33vw"
                      style={{objectFit: "cover"}}
                      className={cardImageClass}
                      data-ai-hint="portfolio gallery"
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
            <div className="w-full py-8 text-center mt-auto">
            <ContactInfo content={content} />
            </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
