"use client";

import React from "react";
import { useAuth } from "@/app/lib/auth-context";
import { useRouter } from "next/navigation";

type GameAny = any;

export default function Header({ game, title, isPlayerPage }: { game?: GameAny, title?: string, isPlayerPage?: boolean }) {
  const router = useRouter();
  const { profile, session } = useAuth();

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