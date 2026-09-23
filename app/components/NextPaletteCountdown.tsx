"use client";

import { useEffect, useState } from "react";
import { getNextReset, getTodaySeed } from "@/app/lib/palette";

export default function NextPaletteCountdown({ puzzleDate }: { puzzleDate: string }) {
  const [label, setLabel] = useState("Calculating next palette…");

  useEffect(() => {
    const update = () => {
      const now = new Date();
      if (puzzleDate && getTodaySeed(now) !== puzzleDate) {
        setLabel("The next palette is ready. Refresh to play!");
        return;
      }

      const seconds = Math.max(0, Math.ceil((getNextReset(now).getTime() - now.getTime()) / 1000));
      const hours = Math.floor(seconds / 3600);
      const minutes = Math.floor((seconds % 3600) / 60);
      const remainingSeconds = seconds % 60;
      setLabel(`Next palette in ${[hours, minutes, remainingSeconds].map(n => String(n).padStart(2, "0")).join(":")}`);
    };

    update();
    const interval = window.setInterval(update, 1000);
    return () => window.clearInterval(interval);
  }, [puzzleDate]);

  return <p className="next-palette-countdown" role="timer" aria-live="off">{label}</p>;
}
