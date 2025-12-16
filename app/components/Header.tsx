"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/app/lib/auth-context";
import { useRouter } from "next/navigation";
import { supabase } from "@/app/lib/supabase";

type GameAny = any;

export default function Header({ game, title, isPlayerPage }: { game?: GameAny, title?: string, isPlayerPage?: boolean }) {
  const router = useRouter();
  const { profile, session } = useAuth();
  const [currentStreak, setCurrentStreak] = useState(0);

  useEffect(() => {
    if (session) {
      calculateStreak();
    }
  }, [session]);

  // Re-calculate streak when user returns to page (after saving palette)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && session) {
        calculateStreak();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [session]);

  const calculateStreak = async () => {
    if (!session) return;

    try {
      const { data: palettes } = await supabase
        .from('palettes')
        .select('date, won')
        .eq('user_id', session.user.id)
        .eq('won', true)
        .order('date', { ascending: false });

      if (!palettes || palettes.length === 0) {
        setCurrentStreak(0);
        return;
      }

      let streak = 0;
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      for (let i = 0; i < palettes.length; i++) {
        const paletteDate = new Date(palettes[i].date);
        paletteDate.setHours(0, 0, 0, 0);
        
        const expectedDate = new Date(today);
        expectedDate.setDate(today.getDate() - i);
        expectedDate.setHours(0, 0, 0, 0);

        if (paletteDate.getTime() === expectedDate.getTime()) {
          streak++;
        } else {
          break;
        }
      }

      setCurrentStreak(streak);
    } catch (error) {
      console.error('Error calculating streak:', error);
    }
  };

  const handleCollectionClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (!session && !isPlayerPage) {
      e.preventDefault();
      router.push('/auth/login');
      return;
    }
  };

  return (
    <header className="site-header">
      <div className="header-left">
        <a 
          href={isPlayerPage ? "/" : "/player"} 
          onClick={handleCollectionClick} 
          className="header-link"
          aria-label={isPlayerPage ? "Play game" : "View collection"}
        >
          {isPlayerPage ? "PLAY" : "COLLECTION"}
        </a>
      </div>

      <div className="header-center">
        {title && <h1 className="header-title">{title}</h1>}
        {profile?.username && !title && (
          <div className="header-username">/{profile.username}</div>
        )}
      </div>

      <div className="header-right">
        {profile && currentStreak > 0 && (
          <div className="streak-display" title={`${currentStreak} day streak`}>
            <span className="streak-fire">🔥</span>
            <span className="streak-count">{currentStreak}</span>
          </div>
        )}
        
        <button 
          onClick={() => { if (game?.openStats) game.openStats(); else window.location.href = '/?open=stats'; }} 
          className="header-link"
          aria-label="Statistics"
        >
          STATS
        </button>
        
        {profile ? (
          <button 
            onClick={() => router.push('/auth/profile')} 
            className="header-link"
            aria-label="Profile"
          >
            PROFILE
          </button>
        ) : (
          <button 
            onClick={() => router.push('/auth/login')} 
            className="header-link"
            aria-label="Login"
          >
            LOGIN
          </button>
        )}
        
        <button 
          onClick={() => { if (game?.openInfo) game.openInfo(); else window.location.href = '/?open=info'; }} 
          className="header-link"
          aria-label="How to play"
        >
          HELP
        </button>
      </div>
    </header>
  );
}