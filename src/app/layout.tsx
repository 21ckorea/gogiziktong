import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "@/providers";
import { Navbar } from "@/components/navbar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
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
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen bg-background`}>
        <Providers>
          <div className="relative flex min-h-screen flex-col">
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
