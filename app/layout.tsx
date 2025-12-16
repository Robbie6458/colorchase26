import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { AuthProvider } from "./lib/auth-context";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Color Chase",
  description: "Guess the hidden 5-color palette in 5 tries. Collect daily palettes and build your collection.",
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
      </body>
    </html>
  );
}
