import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "@/app/providers";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const jetBrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    template: '%s | Apex Intel',
    default: 'Apex Intel — Investment Intelligence Platform',
  },
  description: 'AI-powered investment intelligence and due diligence reports for venture capital and private equity professionals.',
  keywords: ['Investment Intelligence', 'Due Diligence', 'Startup Analysis', 'Venture Capital', 'AI Analysis', 'Market Intelligence'],
  openGraph: {
    title: 'Apex Intel — Investment Intelligence Platform',
    description: 'AI-powered investment intelligence and due diligence reports for venture capital and private equity professionals.',
    url: 'https://apexintel.app',
    siteName: 'Apex Intel',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Apex Intel',
    description: 'AI-powered investment intelligence',
  },
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${jetBrainsMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
