"use client";

import useGame from "../hooks/useGame";
import Header from "./Header";
import GameArea from "./GameArea";
import Overlays from "./Overlays";
import DailyStats from "./DailyStats";

export default function GamePageClient() {
  const game = useGame();
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Header game={game} title="Rbrt" />
      <GameArea game={game} />
      <Overlays game={game} />
      <DailyStats />
    </div>
  );
}
