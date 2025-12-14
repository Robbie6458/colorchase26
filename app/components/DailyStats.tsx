"use client";

import { useEffect, useState } from "react";

interface DailyStatsData {
  collectionCount: number;
  bestGuessCount: number | null;
  bestPlayerNames: string[];
  timeToNextReset: number;
}

export default function DailyStats() {
  const [stats, setStats] = useState<DailyStatsData | null>(null);
  const [countdown, setCountdown] = useState<string>("--:--");
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);

  // Fetch daily stats on mount
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch("/api/palettes/daily-stats");
        if (response.ok) {
          const data = await response.json();
          setStats(data);
        }
      } catch (error) {
        console.error("Error fetching daily stats:", error);
      }
    };

    fetchStats();
  }, []);

  // Update countdown timer every minute
  useEffect(() => {
    if (!stats) return;

    const updateCountdown = () => {
      const timeLeft = stats.timeToNextReset;
      if (timeLeft <= 0) {
        setCountdown("00:00");
        return;
      }

      const hours = Math.floor(timeLeft / 60 / 60);
      const minutes = Math.floor((timeLeft / 60) % 60);
      setCountdown(`${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`);
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 60000); // Update every minute
    return () => clearInterval(interval);
  }, [stats]);

  // Rotate best player names every 2 seconds
  useEffect(() => {
    if (!stats || !stats.bestPlayerNames || stats.bestPlayerNames.length === 0) {
      return;
    }

    const interval = setInterval(() => {
      setCurrentPlayerIndex((prev) => (prev + 1) % stats.bestPlayerNames.length);
    }, 2000);

    return () => clearInterval(interval);
  }, [stats]);

  const currentBestPlayer = stats?.bestPlayerNames[currentPlayerIndex];

  return (
    <footer className="game-footer">
      <div className="footer-stats">
        <div className="stat-item">
          <span className="stat-icon">🎨</span>
          <span className="stat-text"><span>{stats?.collectionCount || 0}</span> collected today</span>
        </div>
        {stats?.bestGuessCount !== null && stats?.bestPlayerNames?.length > 0 && (
          <div className="stat-item">
            <span className="stat-icon">🏆</span>
            <span className="stat-text"><span>{currentBestPlayer || "—"}</span> got it in <span>{stats.bestGuessCount}</span></span>
          </div>
        )}
        <div className="stat-item">
          <span className="stat-icon">⏱️</span>
          <span className="stat-text">New palette in <span>{countdown}</span></span>
        </div>
      </div>
      <div className="footer-bottom">
        <p className="footer-copyright">© 2026 Color Chase. All rights reserved.</p>
        <a href="/privacy" className="footer-link">Privacy Policy</a>
      </div>
    </footer>
  );
}
