
import type {Metadata} from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from '@/context/AuthContext';
import { ThemeProvider } from '@/context/ThemeContext';
import { Playfair_Display, Noto_Serif_SC, Source_Code_Pro } from 'next/font/google';
import { cn } from '@/lib/utils';
// import { UserProvider } from '@authing/nextjs';

export const metadata: Metadata = {
  title: 'Suitopia',
  description: 'A platform for Fursuit commissions and adoptions.',
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

const fontBody = Source_Code_Pro({
  subsets: ['latin'],
  weight: ['200', '300', '400'],
  variable: '--font-body',
  display: 'swap',
})

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={cn(
        "font-headline antialiased",
        fontHeadline.variable,
        fontSerifSC.variable,
        fontBody.variable
      )}>
        {/* <UserProvider> */}
          <ThemeProvider>
            <AuthProvider>
              {children}
            </AuthProvider>
            <Toaster />
          </ThemeProvider>
        {/* </UserProvider> */}
      </body>
    </html>
  );
}
