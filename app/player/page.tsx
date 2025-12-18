import type { Metadata } from "next";
import PlayerClient from "./PlayerClient";

export const metadata: Metadata = {
  title: "My Collection - ColorChase | Your Palette Archive",
  description: "View your ColorChase palette collection. Browse all the color palettes you've successfully guessed and track your color guessing journey.",
  robots: {
    index: false,
    follow: true,
  },
};

export default function PlayerPage() {
  return <PlayerClient />;
}
