import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "sonner";

import { ThemeProvider } from "@/providers/theme-provider";

import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://algos.sandeepswain.dev"),
  applicationName: "Algoviz",
  manifest: "/manifest.webmanifest",
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/icon-192.svg", sizes: "192x192", type: "image/svg+xml" },
      { url: "/icon-512.svg", sizes: "512x512", type: "image/svg+xml" },
    ],
    apple: [
      { url: "/icon-192.svg", sizes: "192x192", type: "image/svg+xml" },
    ],
    shortcut: ["/icon.svg"],
  },
  title: {
    template: "%s | Algoviz",
    default: "Algoviz -- Interactive Algorithm Visualizer",
  },
  description:
    "Interactive algorithm visualizer with 100+ algorithms across 15 categories. Explore sorting, searching, graph algorithms, dynamic programming, and more with step-by-step animations.",
  openGraph: {
    title: "Algoviz",
    description:
      "100+ algorithms. Visualized. Step-by-step animations across 15 categories.",
    type: "website",
    locale: "en_US",
    siteName: "Algoviz",
  },
  twitter: {
    card: "summary_large_image",
    title: "Algoviz",
    description:
      "100+ algorithms. Visualized. Step-by-step animations across 15 categories.",
  },
  appleWebApp: {
    capable: true,
    title: "Algoviz",
    statusBarStyle: "black-translucent",
  },
  formatDetection: {
    telephone: false,
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "Algoviz",
  url: "https://algos.sandeepswain.dev",
  description:
    "Interactive algorithm visualizer with 100+ algorithms across 15 categories.",
  applicationCategory: "EducationalApplication",
  operatingSystem: "Any",
  offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased`}
      >
        <ThemeProvider>
          {children}
          <Toaster
            theme="dark"
            position="bottom-right"
            toastOptions={{
              style: {
                background: "var(--bg-surface)",
                border: "1px solid var(--border)",
                color: "var(--text-primary)",
              },
            }}
          />
        </ThemeProvider>
      </body>
    </html>
  );
}
