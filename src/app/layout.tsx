
import type {Metadata} from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from '@/context/AuthContext';
import { ThemeProvider } from '@/context/ThemeContext';
import { Playfair_Display, Noto_Serif_SC, Noto_Sans_SC } from 'next/font/google';
import { cn } from '@/lib/utils';
import { getSiteContent } from '@/lib/data-service';

export const metadata: Metadata = {
  title: {
    template: '%s - 前行无界',
    default: '前行无界',
  },
  description: '前行无界工作室 (FORWARD INFINITY) - 兽装定制与设计。',
};

const fontHeadline = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-headline',
  display: 'swap',
});

const fontSerifSC = Noto_Serif_SC({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-serif-sc',
  display: 'swap',
});

const fontBody = Noto_Sans_SC({
  subsets: ['latin'],
  weight: ['100', '300', '400', '500', '700'],
  variable: '--font-body',
  display: 'swap',
})

// This inline script is crucial for preventing theme flash.
// It runs before React hydrates, setting the correct theme class on the HTML element.
const ThemeInitializer = ({ sunriseHour, sunsetHour }: { sunriseHour: number; sunsetHour: number; }) => {
  const scriptTxt = `
    (function() {
      try {
        const sunrise = ${sunriseHour};
        const sunset = ${sunsetHour};
        const currentHour = new Date().getHours();
        const theme = (currentHour >= sunrise && currentHour < sunset) ? 'light' : 'dark';
        document.documentElement.classList.add(theme);
      } catch (e) {
        // Fallback to a default theme in case of any errors
        console.error('Failed to set initial theme:', e);
        document.documentElement.classList.add('dark');
      }
    })();
  `;
  return <script dangerouslySetInnerHTML={{ __html: scriptTxt }} />;
};


export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const siteContent = await getSiteContent();
  const sunriseHour = siteContent?.sunriseHour ?? 6;
  const sunsetHour = siteContent?.sunsetHour ?? 18;
  
  return (
    <html lang="en" suppressHydrationWarning>
       <body className={cn(fontHeadline.variable, fontSerifSC.variable, fontBody.variable)}>
          <ThemeInitializer sunriseHour={sunriseHour} sunsetHour={sunsetHour} />
          <ThemeProvider>
            <AuthProvider>
              {children}
            </AuthProvider>
            <Toaster />
          </ThemeProvider>
      </body>
    </html>
  );
}
