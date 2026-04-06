import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import { Toaster } from "sonner";
import { Analytics } from "@vercel/analytics/react";
import Sidebar from "@/components/layout/Sidebar";
import MainLayout from "@/components/layout/MainLayout";
import { SidebarLayoutProvider } from "@/components/layout/SidebarLayoutContext";
import { validateEnv } from "@/lib/env";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
  display: "swap",
});

validateEnv();

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#0C4A6E",
};

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "https://keepstrong.app"),
  title: {
    default: "KeepStrong - GLP-1 Fitness Tracker",
    template: "%s | KeepStrong",
  },
  description: "Track your fitness journey with GLP-1 medication support. Preserve muscle, hit protein goals, and achieve lasting results.",
  keywords: ["GLP-1", "fitness", "protein tracking", "weight loss", "muscle preservation", "Ozempic", "Wegovy", "Mounjaro"],
  authors: [{ name: "KeepStrong" }],
  manifest: "/manifest.json",
  applicationName: "KeepStrong",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "KeepStrong",
  },
  icons: {
    apple: [
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/",
    siteName: "KeepStrong",
    title: "KeepStrong - GLP-1 Fitness Tracker",
    description: "Track your fitness journey with GLP-1 medication support. Preserve muscle, hit protein goals, and achieve lasting results.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "KeepStrong - GLP-1 Fitness Tracker",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "KeepStrong - GLP-1 Fitness Tracker",
    description: "Track your fitness journey with GLP-1 medication support.",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${jetbrainsMono.variable}`}>
      <body className="font-sans antialiased">
        <SidebarLayoutProvider>
          <Sidebar />
          <MainLayout>{children}</MainLayout>
        </SidebarLayoutProvider>
        <Toaster position="top-right" richColors />
        <Analytics />
      </body>
    </html>
  );
}
