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
  const [countdown, setCountdown] = useState<string>("--:--:--");
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
  const [remainingTime, setRemainingTime] = useState<number>(0);

  // Fetch daily stats on mount
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch("/api/palettes/daily-stats");
        if (response.ok) {
          const data = await response.json();
          setStats(data);
          setRemainingTime(data.timeToNextReset);
        }
      } catch (error) {
        console.error("Error fetching daily stats:", error);
      }
    };

    fetchStats();
    // Refetch stats every minute to keep them fresh
    const statsInterval = setInterval(fetchStats, 60000);
    return () => clearInterval(statsInterval);
  }, []);

  // Update countdown timer every second
  useEffect(() => {
    if (!stats) return;

    const updateCountdown = () => {
      setRemainingTime((prev) => {
        const newTime = Math.max(0, prev - 1);
        
        const hours = Math.floor(newTime / 3600);
        const minutes = Math.floor((newTime % 3600) / 60);
        const seconds = newTime % 60;
        
        setCountdown(
          `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
        );
        
        return newTime;
      });
    };

    // Set initial countdown
    const hours = Math.floor(stats.timeToNextReset / 3600);
    const minutes = Math.floor((stats.timeToNextReset % 3600) / 60);
    const seconds = stats.timeToNextReset % 60;
    setCountdown(
      `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
    );
    setRemainingTime(stats.timeToNextReset);

    const interval = setInterval(updateCountdown, 1000); // Update every second
    return () => clearInterval(interval);
  }, [stats]);

  // Rotate best player names every 3 seconds
  useEffect(() => {
    if (!stats || !stats.bestPlayerNames || stats.bestPlayerNames.length === 0) {
      return;
    }

    const interval = setInterval(() => {
      setCurrentPlayerIndex((prev) => (prev + 1) % stats.bestPlayerNames.length);
    }, 3000); // Changed from 2000 to 3000 (3 seconds)

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
        {stats && stats.bestGuessCount !== null && stats.bestPlayerNames?.length > 0 && (
          <div className="stat-item">
            <span className="stat-icon">🏆</span>
            <span className="stat-text"><span>{currentBestPlayer || "—"}</span> got it in <span>{stats?.bestGuessCount}</span></span>
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
