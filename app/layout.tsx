import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { AuthProvider } from "./lib/auth-context";
import { Analytics } from "@vercel/analytics/react";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Color Chase",
  description: "Guess the hidden 5-color palette in 5 tries. Collect daily palettes and build your collection.",
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
  },
  twitter: {
    card: "summary_large_image",
    title: "Color Chase",
    description: "Guess the hidden 5-color palette in 5 tries. Collect daily palettes and build your collection.",
    images: ["https://colorchase.vercel.app/og"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
      </head>
      <body
        className={`${geistSans.variable} antialiased`}
      >
        <AuthProvider>
          {children}
        </AuthProvider>
        <Analytics />
      </body>
    </html>
  );
}
