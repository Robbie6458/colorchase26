"use client";

import React from "react";

type Props = {
  colors: string[];
  eliminated?: Set<string>;
  onSelect?: (color: string) => void;
};

export default function ColorWheel({ colors = [], eliminated = new Set(), onSelect }: Props) {
  return (
    <div id="color-wheel">
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
            onClick={() => onSelect && onSelect(color)}
          />
        );
      })}
    </div>
  );
}
