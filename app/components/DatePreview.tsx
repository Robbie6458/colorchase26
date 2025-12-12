"use client";

import React, { useState } from "react";
import { getTodaySeed, generateDailyColorWheel, generatePaletteByScheme } from "../lib/palette";

interface DatePreviewProps {
  onClose: () => void;
}

export default function DatePreview({ onClose }: DatePreviewProps) {
  const [offset, setOffset] = useState(0);

  // Generate a date based on offset days
  const getDateByOffset = (days: number) => {
    const today = new Date();
    const date = new Date(today);
    date.setDate(date.getDate() + days);
    return date;
  };

  const currentDate = getDateByOffset(offset);
  const dateString = currentDate.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  // Generate seed for the offset date
  const resetHour = 9;
  let seedDate = new Date(currentDate);
  if (currentDate.getHours() < resetHour) {
    seedDate.setDate(seedDate.getDate() - 1);
  }
  const seed = `${seedDate.getFullYear()}-${String(seedDate.getMonth() + 1).padStart(2, "0")}-${String(seedDate.getDate()).padStart(2, "0")}`;

  // Generate wheel and palette
  const wheelData = generateDailyColorWheel(seed);
  const schemeNames = [
    "complementary",
    "triadic",
    "analogous",
    "split-complementary",
    "tetradic",
    "square",
    "rectangular",
    "accent",
  ];
  const scheme = schemeNames[Math.floor(Math.random() * schemeNames.length)];
  const palette = generatePaletteByScheme(scheme, wheelData.colors, seed);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-gradient-to-r from-purple-500 to-pink-500 text-white p-4 flex justify-between items-center">
          <h2 className="text-xl font-bold">Date Preview</h2>
          <button
            onClick={onClose}
            className="text-2xl font-bold hover:opacity-75 transition"
          >
            ✕
          </button>
        </div>

        <div className="p-6">
          {/* Date Navigation */}
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={() => setOffset(offset - 1)}
              className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 transition"
            >
              ← Previous
            </button>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-800">{dateString}</div>
              <div className="text-sm text-gray-600">Seed: {seed}</div>
            </div>
            <button
              onClick={() => setOffset(offset + 1)}
              className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 transition"
            >
              Next →
            </button>
          </div>

          {/* Metadata */}
          <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
            <div className="bg-blue-50 p-3 rounded">
              <div className="font-semibold text-gray-700">Palette Family</div>
              <div className="text-gray-600">{wheelData.familyName}</div>
            </div>
            <div className="bg-green-50 p-3 rounded">
              <div className="font-semibold text-gray-700">Tone Treatment</div>
              <div className="text-gray-600">{wheelData.treatmentName}</div>
            </div>
            <div className="bg-purple-50 p-3 rounded col-span-2">
              <div className="font-semibold text-gray-700">Color Harmony Scheme</div>
              <div className="text-gray-600">{scheme}</div>
            </div>
          </div>

          {/* Color Wheel (12 colors) */}
          <div className="mb-8">
            <h3 className="text-lg font-bold mb-3 text-gray-800">Color Wheel (12 colors)</h3>
            <div className="grid grid-cols-6 gap-2">
              {wheelData.colors.map((color, idx) => (
                <div key={idx} className="flex flex-col items-center">
                  <div
                    className="w-12 h-12 rounded border-2 border-gray-300 shadow-md transition hover:scale-110"
                    style={{ backgroundColor: color }}
                    title={color}
                  />
                  <span className="text-xs font-mono text-gray-600 mt-1">{color.slice(1)}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Hidden Palette (5 colors) */}
          <div>
            <h3 className="text-lg font-bold mb-3 text-gray-800">Hidden Palette (Today's Answer)</h3>
            <div className="grid grid-cols-5 gap-3">
              {palette.map((color, idx) => (
                <div key={idx} className="flex flex-col items-center">
                  <div
                    className="w-20 h-20 rounded border-2 border-gray-400 shadow-lg transition hover:scale-105"
                    style={{ backgroundColor: color }}
                    title={color}
                  />
                  <span className="text-sm font-mono text-gray-600 mt-2 font-bold">{color.slice(1)}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div className="mt-8 p-4 bg-gray-50 rounded text-sm text-gray-600">
            <p>💡 <strong>Tip:</strong> Use arrow buttons to browse future and past dates to see how the algorithm generates different palettes over time.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
