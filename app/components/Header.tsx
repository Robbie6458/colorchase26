"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/app/lib/auth-context";
import { useRouter } from "next/navigation";

type GameAny = any;

export default function Header({ game, title, isPlayerPage }: { game?: GameAny, title?: string, isPlayerPage?: boolean }) {
  const router = useRouter();
  const { profile, session } = useAuth();

  const handleCollectionClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    // If not logged in, prompt to log in instead of navigating to collection
    if (!session && !isPlayerPage) {
      e.preventDefault();
      router.push('/auth/login');
      return;
    }
  };

  useEffect(() => {
    const els = Array.from(document.querySelectorAll<HTMLElement>(".header-icon-btn, .icon-btn"));
    if (!els.length) return;
    const rand = () => `hsl(${Math.floor(Math.random()*360)}, 80%, 60%)`;
    const enter = (e: Event) => {
      const t = e.currentTarget as HTMLElement;
      const c = rand();
      t.dataset.__origColor = t.style.color || "";
      t.style.color = c;
      // also set -webkit-text-fill-color for font-based Material Symbols
      try { t.style.setProperty('-webkit-text-fill-color', c); } catch (err) {}
      // explicitly set svg stroke/fill to the same color so they always match
      const svgs = t.querySelectorAll<SVGElement>('svg');
      svgs.forEach(s => { s.style.stroke = c; s.style.fill = c; });
    };
    const leave = (e: Event) => {
      const t = e.currentTarget as HTMLElement;
      const orig = t.dataset.__origColor || "";
      t.style.color = orig;
      try { t.style.setProperty('-webkit-text-fill-color', orig); } catch (err) {}
      const svgs = t.querySelectorAll<SVGElement>('svg');
      svgs.forEach(s => { s.style.stroke = orig; s.style.fill = orig; });
    };
    els.forEach(el => { el.addEventListener('mouseenter', enter); el.addEventListener('mouseleave', leave); });
    return () => els.forEach(el => { el.removeEventListener('mouseenter', enter); el.removeEventListener('mouseleave', leave); });
  }, []);

  return (
    <header className="game-header">
      {/* left: switch between game and player */}
      <a href={isPlayerPage ? "/" : "/player"} onClick={handleCollectionClick} className="nav-link" id="player-link" aria-label={isPlayerPage ? "Open game" : "Open collection"}>
        {isPlayerPage ? (
          <span className="material-symbols-outlined icon-btn" aria-hidden="true">colorize</span>
        ) : (
          <span className="material-symbols-outlined icon-btn" aria-hidden="true">palette</span>
        )}
      </a>
      {/* center username display */}
      {profile?.username && (
        <div className="header-username">/{profile.username}</div>
      )}
      {title ? <h1 className="player-title">{title}</h1> : null}
      <div className="header-right">
        <div id="streak-display" className="streak-badge hidden">
          <span className="streak-icon">🔥</span>
          <span id="streak-count">0</span>
        </div>
        <button onClick={() => { if (game?.openStats) game.openStats(); else window.location.href = '/?open=stats'; }} id="stats-btn" className="header-icon-btn" aria-label="Statistics">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="20" x2="18" y2="10" />
            <line x1="12" y1="20" x2="12" y2="4" />
            <line x1="6" y1="20" x2="6" y2="14" />
          </svg>
        </button>
        {profile ? (
          <button onClick={() => router.push('/auth/profile')} id="logout-btn" className="header-icon-btn" aria-label="Logout">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
          </button>
        ) : (
          <button onClick={() => router.push('/auth/login')} id="login-btn" className="header-icon-btn" aria-label="Login">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
              <polyline points="10 17 15 12 10 7" />
              <line x1="15" y1="12" x2="3" y2="12" />
            </svg>
          </button>
        )}
        <button onClick={() => { if (game?.openInfo) game.openInfo(); else window.location.href = '/?open=info'; }} id="info-btn" aria-label="How to play" className="header-icon-btn">
          <svg viewBox="0 0 24 24\" fill=\"none\" stroke=\"currentColor\" strokeWidth={2.5} strokeLinecap=\"round\" strokeLinejoin=\"round\">
            <circle cx=\"12\" cy=\"12\" r=\"9\" />
            <path d=\"M9.5 9a2.5 2.5 0 0 1 5 0c0 1.5-2.5 2.5-2.5 3.5\" />
            <circle cx=\"12\" cy=\"17\" r=\"0.5\" fill=\"currentColor\" />
          </svg>
        </button>
      </div>
    </header>
  );}