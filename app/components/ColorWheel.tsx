"use client";

import React, { useState, useEffect } from "react";

type Props = {
  colors: string[];
  eliminated?: Set<string>;
  onSelect?: (color: string) => void;
};

export default function ColorWheel({ colors = [], eliminated = new Set(), onSelect }: Props) {
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  useEffect(() => {
    // Remove the spin animation after it completes
    const timer = setTimeout(() => {
      setIsInitialLoad(false);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div id="color-wheel" className={isInitialLoad ? "spin-wheel" : ""}>
      {colors.map((color, index) => {
        if (eliminated.has(color)) return null;
        const angle = index * 30 - 15;
        const style: React.CSSProperties = {
          backgroundColor: color,
          transform: `rotate(${angle}deg) skewY(-60deg)`,
        };
        return (
          <div
            key={color + index}
            className="wedge"
            style={style}
            onClick={() => {
              onSelect && onSelect(color);
            }}
          />
        );
      })}
    </div>
  );
}
