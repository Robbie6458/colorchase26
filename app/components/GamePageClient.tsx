"use client";

import { useState } from "react";
import useGame from "../hooks/useGame";
import Header from "./Header";
import GameArea from "./GameArea";
import Overlays from "./Overlays";
import DailyStats from "./DailyStats";
import DatePreview from "./DatePreview";

export default function GamePageClient() {
  const game = useGame();
  const [showDatePreview, setShowDatePreview] = useState(false);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Header game={game} />
      <GameArea game={game} />
      <Overlays game={game} />
      <DailyStats />
      
      {/* Temporary preview button for development */}
      <button
        onClick={() => setShowDatePreview(true)}
        className="fixed bottom-4 right-4 px-3 py-2 bg-gradient-to-r from-orange-400 to-red-500 text-white text-xs font-bold rounded-full shadow-lg hover:shadow-xl transition z-40"
        title="Click to preview different dates and color palettes"
      >
        🎨 Preview
      </button>

      {showDatePreview && <DatePreview onClose={() => setShowDatePreview(false)} />}
    </div>
  );
}
