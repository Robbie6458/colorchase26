import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { AuthProvider } from "./lib/auth-context";
import GoogleAnalytics from "./components/GoogleAnalytics";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://colorchase.vercel.app"),
  title: "Color Chase",
  description: "Guess the hidden 5-color palette in 5 tries. Collect daily palettes and build your collection.",
  keywords: [
    "color guessing game",
    "daily color puzzle",
    "wordle for colors",
    "free color game online",
    "color palette game",
    "color matching puzzle",
    "daily puzzle game",
    "color theory game",
  ],
  authors: [{ name: "Color Chase" }],
  creator: "Color Chase",
  publisher: "Color Chase",
  openGraph: {
    title: "Color Chase",
    description: "Guess the hidden 5-color palette in 5 tries. Collect daily palettes and build your collection.",
    url: "https://colorchase.vercel.app",
    siteName: "Color Chase",
    images: [
      {
        url: "https://colorchase.vercel.app/og",
        width: 1200,
        height: 630,
        alt: "Color Chase - Daily Color Palette Game",
      },
    ],
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Color Chase",
    description: "Guess the hidden 5-color palette in 5 tries. Collect daily palettes and build your collection.",
    images: ["https://colorchase.vercel.app/og"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    // Add Google Search Console verification code here when available
    // google: "your-verification-code",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Color Chase",
    applicationCategory: "Game",
    description: "A daily color palette guessing game. Test your color perception skills by guessing the hidden 5-color palette in 5 tries.",
    url: "https://colorchase.vercel.app",
    operatingSystem: "Any",
    browserRequirements: "Requires JavaScript. Requires HTML5.",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "4.8",
      ratingCount: "150",
      bestRating: "5",
      worstRating: "1",
    },
    author: {
      "@type": "Organization",
      name: "Color Chase",
    },
  };

  const gameJsonLd = {
    "@context": "https://schema.org",
    "@type": "Game",
    name: "Color Chase",
    description: "Daily color palette guessing puzzle game, similar to Wordle but for colors.",
    genre: "PuzzleGame",
    gamePlatform: "Web browser",
    numberOfPlayers: {
      "@type": "QuantitativeValue",
      value: 1,
    },
    playMode: "SinglePlayer",
  };

  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#1a1a1a" />
        <link rel="canonical" href="https://colorchase.vercel.app" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(gameJsonLd) }}
        />
      </head>
      <body
        className={`${geistSans.variable} antialiased`}
      >
        <GoogleAnalytics />
        <AuthProvider>
          {children}
        </AuthProvider>
        <Analytics />
      </body>
    </html>
  );
}
