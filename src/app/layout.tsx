import type { Metadata } from 'next';
import { Inter, Playfair_Display } from 'next/font/google';
import './globals.css';
import { Providers } from '@/components/Providers';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const playfair = Playfair_Display({ subsets: ['latin'], variable: '--font-playfair' });

export const metadata: Metadata = {
  title: 'Feed Flow – Panoul tău de știri RSS din România',
  description: 'Feed Flow îți aduce cele mai noi articole din Sport, Știri TV, Investigații și Ziare, toate într-un singur tablou de bord.',
  authors: [{ name: 'Claudiu Marinescu' }],
  manifest: '/manifest.json',
  themeColor: '#3b82f6',
  colorScheme: 'dark light',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'FeedFlow',
  },
  openGraph: {
    title: 'Feed Flow – Panoul tău de știri RSS din România',
    description: 'Cele mai importante surse din Sport, TV și Investigații într-un singur loc. Filtrează și caută rapid noutățile din România.',
    url: 'https://feed-flow-pi.vercel.app/',
    siteName: 'Feed Flow',
    locale: 'ro_RO',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Feed Flow – Panoul tău de știri RSS din România',
    description: 'Cele mai importante surse din Sport, TV și Investigații într-un singur loc. Filtrează și caută rapid noutățile din România.',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ro" suppressHydrationWarning>
      <body className={`${inter.variable} ${playfair.variable} font-sans`}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
