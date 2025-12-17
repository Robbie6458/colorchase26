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
  const [menuOpen, setMenuOpen] = useState(false);

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

      console.log('Palettes for streak calculation:', palettes);

      if (!palettes || palettes.length === 0) {
        setCurrentStreak(0);
        return;
      }

      let streak = 0;
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      // Check if the most recent palette is today or yesterday
      const mostRecentDate = new Date(palettes[0].date);
      mostRecentDate.setHours(0, 0, 0, 0);
      
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      
      // If most recent is not today or yesterday, streak is broken
      if (mostRecentDate.getTime() < yesterday.getTime()) {
        console.log('Streak broken - most recent palette is too old');
        setCurrentStreak(0);
        return;
      }
      
      // Calculate streak from most recent palette backwards
      let checkDate = new Date(mostRecentDate);
      
      for (let i = 0; i < palettes.length; i++) {
        const paletteDate = new Date(palettes[i].date);
        paletteDate.setHours(0, 0, 0, 0);
        
        console.log(`Checking palette ${i}:`, {
          paletteDate: paletteDate.toISOString().split('T')[0],
          expectedDate: checkDate.toISOString().split('T')[0],
          match: paletteDate.getTime() === checkDate.getTime()
        });

        if (paletteDate.getTime() === checkDate.getTime()) {
          streak++;
          checkDate.setDate(checkDate.getDate() - 1);
        } else {
          break;
        }
      }

      console.log('Calculated streak:', streak);
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
          className="header-icon-btn"
          aria-label={isPlayerPage ? "Play game" : "View collection"}
          title={isPlayerPage ? "Play game" : "View collection"}
        >
          {isPlayerPage ? (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
              <circle cx="12" cy="12" r="10" />
            </svg>
          ) : (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="3" width="7" height="7" />
              <rect x="14" y="3" width="7" height="7" />
              <rect x="3" y="14" width="7" height="7" />
              <rect x="14" y="14" width="7" height="7" />
            </svg>
          )}
          <span className="header-text-fallback">{isPlayerPage ? "PLAY" : "COLLECTION"}</span>
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
        
        {/* Desktop navigation */}
        <div className="header-nav-desktop">
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

        {/* Mobile hamburger menu */}
        <button 
          className="hamburger-menu"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Menu"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>
      </div>

      {/* Mobile dropdown menu */}
      {menuOpen && (
        <div className="mobile-dropdown">
          <button 
            onClick={() => { 
              if (game?.openStats) game.openStats(); 
              else window.location.href = '/?open=stats'; 
              setMenuOpen(false);
            }} 
            className="mobile-menu-item"
          >
            📊 STATS
          </button>
          
          {profile ? (
            <button 
              onClick={() => { 
                router.push('/auth/profile'); 
                setMenuOpen(false);
              }} 
              className="mobile-menu-item"
            >
              👤 PROFILE
            </button>
          ) : (
            <button 
              onClick={() => { 
                router.push('/auth/login'); 
                setMenuOpen(false);
              }} 
              className="mobile-menu-item"
            >
              🔐 LOGIN
            </button>
          )}
          
          <button 
            onClick={() => { 
              if (game?.openInfo) game.openInfo(); 
              else window.location.href = '/?open=info'; 
              setMenuOpen(false);
            }} 
            className="mobile-menu-item"
          >
            ❓ HELP
          </button>
        </div>
      )}
    </header>
  );
}