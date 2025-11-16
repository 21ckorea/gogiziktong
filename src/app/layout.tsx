import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import dynamic from "next/dynamic";
import "./globals.css";
import { Providers } from "@/providers";
import { Navbar } from "@/components/navbar";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const InAppBrowserGuard = dynamic(() => import("@/components/in-app-browser-guard").then((mod) => mod.InAppBrowserGuard), {
  ssr: false,
});

export const metadata: Metadata = {
  title: "고기직통 - 신선한 정육 직거래 플랫폼",
  description: "생산자에서 소비자로 직접 연결되는 신선한 정육 직거래 플랫폼",
  keywords: ["정육", "고기", "직거래", "신선한 고기", "소고기", "돼지고기", "닭고기"],
  authors: [{ name: "GogiZiktong" }],
  creator: "GogiZiktong",
  publisher: "GogiZiktong",
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
  openGraph: {
    type: 'website',
    locale: 'ko_KR',
    url: '/',
    title: '고기직통 - 신선한 정육 직거래 플랫폼',
    description: '생산자에서 소비자로 직접 연결되는 신선한 정육 직거래 플랫폼',
    siteName: '고기직통',
  },
  twitter: {
    card: 'summary_large_image',
    title: '고기직통 - 신선한 정육 직거래 플랫폼',
    description: '생산자에서 소비자로 직접 연결되는 신선한 정육 직거래 플랫폼',
    creator: '@gogiziktong',
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: 'white' },
    { media: '(prefers-color-scheme: dark)', color: 'black' },
  ],
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <body className={`${inter.variable} antialiased min-h-screen bg-background`}>
        <Providers>
          <div className="relative flex min-h-screen flex-col">
            <InAppBrowserGuard />
            <Navbar />
            <main className="flex-1">
              {children}
            </main>
          </div>
        </Providers>
      </body>
    </html>
  );
}
