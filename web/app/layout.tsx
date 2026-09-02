import type { Metadata } from 'next';
import { DM_Sans, Sora } from 'next/font/google';
import { ThemeProvider, THEME_INIT_SCRIPT } from '@/components/theme-provider';
import { AuthProvider } from '@/components/auth-provider';
import { CartProvider } from '@/components/cart-provider';
import { VoucherProvider } from '@/components/voucher-provider';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { CartDrawer, CartToast } from '@/components/cart-drawer';
import { CheckoutModal } from '@/components/checkout/checkout-modal';
import { siteConfig } from '@/lib/config';
import { getLayoutConfig } from '@/lib/website-config';
import './globals.css';

const dmSans = DM_Sans({
  variable: '--font-dm-sans',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  display: 'swap',
});

const sora = Sora({
  variable: '--font-sora',
  subsets: ['latin'],
  weight: ['300', '400', '500', '600'],
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.siteUrl),
  title: {
    default: siteConfig.defaultTitle,
    absolute: siteConfig.defaultTitle,
  },
  description: siteConfig.defaultDescription,
  icons: {
    icon: [
      { url: '/favicon-32x32.png?v=circle1', type: 'image/png', sizes: '32x32' },
      { url: '/favicon.ico?v=circle1', sizes: 'any' },
      { url: '/favicon-16x16.png?v=circle1', type: 'image/png', sizes: '16x16' },
    ],
    shortcut: '/favicon.ico?v=circle1',
    apple: '/apple-touch-icon.png?v=circle1',
  },
  openGraph: {
    type: 'website',
    siteName: siteConfig.name,
    title: siteConfig.defaultTitle,
    description: siteConfig.defaultDescription,
    url: siteConfig.siteUrl,
  },
  twitter: {
    card: 'summary_large_image',
    title: siteConfig.defaultTitle,
    description: siteConfig.defaultDescription,
  },
};

export default async function RootLayout({ children }: LayoutProps<'/'>) {
  const config = await getLayoutConfig();

  return (
    <html
      lang="en"
      className={`${dmSans.variable} ${sora.variable}`}
      data-scroll-behavior="smooth"
      suppressHydrationWarning
    >
      <head>
        <link rel="icon" href="/favicon-32x32.png?v=circle1" type="image/png" sizes="32x32" />
        <link rel="icon" href="/favicon.ico?v=circle1" sizes="any" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png?v=circle1" />
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
      </head>
      <body className="antialiased min-h-screen flex flex-col">
        <ThemeProvider>
          <AuthProvider>
            <CartProvider>
              <VoucherProvider>
                <Navbar
                  supportPhone={config.footerSettings.phone}
                  supportEmail={config.footerSettings.email}
                  announcementText={config.announcementSettings.text}
                  announcementEnabled={config.announcementSettings.enabled !== false}
                />
                <CartToast />
                <main className="flex-1">{children}</main>
                <Footer
                  description={config.footerSettings.description}
                  phone={config.footerSettings.phone}
                  email={config.footerSettings.email}
                  copyright={config.footerSettings.copyright}
                />
                <CartDrawer />
                <CheckoutModal />
              </VoucherProvider>
            </CartProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
