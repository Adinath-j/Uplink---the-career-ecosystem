import type { Metadata, Viewport } from "next";
import { Manrope } from "next/font/google";
import { siteConfig } from "@/config/site";
import { SmoothScrollProvider } from "@/components/animation/SmoothScrollProvider";
import { Header } from "@/components/navigation/Header";
import { Footer } from "@/components/navigation/Footer";
import "./globals.css";

const manrope = Manrope({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-manrope",
  weight: ["400", "500", "600", "700", "800"],
});

export const viewport: Viewport = {
  themeColor: "#135BEC",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: siteConfig.title,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  keywords: [
    "student career platform",
    "campus recruitment ecosystem",
    "student internships",
    "hackathons India",
    "campus placements",
    "student professional profile",
    "alumni mentorship",
    "peer Q&A for students",
    "UPLINK campus",
  ],
  authors: [{ name: "UPLINK Ecosystem Team" }],
  creator: "UPLINK",
  publisher: "UPLINK",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: siteConfig.url,
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteConfig.url,
    title: siteConfig.title,
    description: siteConfig.description,
    siteName: siteConfig.name,
    images: [
      {
        url: `${siteConfig.url}/opengraph-image`,
        width: 1200,
        height: 630,
        alt: "UPLINK — Connecting Potential",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: siteConfig.title,
    description: siteConfig.description,
    images: [`${siteConfig.url}/opengraph-image`],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "UPLINK",
    applicationCategory: "BusinessApplication",
    operatingSystem: "Android",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "INR",
    },
    description: siteConfig.description,
    headline: "Unified Campus Career and Professional Ecosystem",
    url: siteConfig.url,
  };

  return (
    <html lang="en" className={manrope.variable} suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <link rel="icon" href="/brand/logo-icon.svg" type="image/svg+xml" />
      </head>
      <body
        className="font-sans min-h-screen flex flex-col bg-white text-uplink-text selection:bg-uplink-blue selection:text-white"
        suppressHydrationWarning
      >
        <SmoothScrollProvider>
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
        </SmoothScrollProvider>
      </body>
    </html>
  );
}
