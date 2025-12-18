import type { Metadata } from "next";
import GamePageClient from "./components/GamePageClient";

export const metadata: Metadata = {
  title: "ColorChase - Daily Color Palette Guessing Game | Free Color Wordle",
  description: "Play ColorChase, the daily color guessing game! Test your color perception with a new palette puzzle every day. Like Wordle, but for colors. 100% free to play online.",
  keywords: [
    "color guessing game",
    "daily color puzzle",
    "wordle for colors",
    "free color game online",
    "color palette game",
    "color matching puzzle",
    "daily puzzle game",
    "chromatic game",
    "color perception test",
  ],
  openGraph: {
    title: "ColorChase - Daily Color Palette Guessing Game",
    description: "Test your color perception with a new palette puzzle every day. Like Wordle, but for colors. Free to play!",
    url: "https://colorchase.vercel.app",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "ColorChase - Daily Color Palette Guessing Game",
    description: "Test your color perception with a new palette puzzle every day. Like Wordle, but for colors. Free to play!",
  },
};

export default function Home() {
  return <GamePageClient />;
}
