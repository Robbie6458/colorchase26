"use client";

import Link from "next/link";
import { Instagram } from "lucide-react";

export default function Footer() {
  return (
    <footer className="game-footer">
      <div className="footer-bottom">
        <p className="footer-copyright">© 2026 Color Chase. All rights reserved.</p>
        <div className="footer-links">
          <Link href="/about" className="footer-link">
            About
          </Link>
          <Link href="/how-to-play" className="footer-link">
            How to Play
          </Link>
          <Link href="/privacy" className="footer-link">
            Privacy Policy
          </Link>
          <a
            href="https://www.instagram.com/colorchasegame/"
            target="_blank"
            rel="noopener noreferrer"
            className="footer-link footer-social"
            aria-label="Follow us on Instagram"
          >
            <Instagram size={18} />
            <span>Instagram</span>
          </a>
        </div>
      </div>
    </footer>
  );
}
