# Color Chase

A daily color palette guessing game built with Next.js and React. Guess the hidden 5-color palette in 5 tries, collect palettes daily, and build your personal collection.

## 🎮 How to Play

Color Chase is inspired by Wordle, but with color instead of words. Each day you get a new palette to guess:

1. **Start with a blank palette** - You have 5 attempts to guess today's 5-color palette
2. **Click colors on the color wheel** - Select colors and click to place them in your guessing row
3. **Get visual feedback**:
   - 🟢 **Green border** = Right color in the right position
   - 🟠 **Orange border** = Right color in the wrong position  
   - ✕ **X mark** = Color not in today's palette
4. **Solve it or learn tomorrow** - Win and collect the palette, or lose and see the correct answer
5. **Build your collection** - Every palette you guess (win or lose) is saved to your collection

### Example Gameplay
- The hidden palette today might be: `#FF6B35 #004E89 #1FA8AC #F5A623 #9B59B6`
- You guess: `#FF6B35 #F5A623 #1FA8AC #004E89 #FFFFFF`
  - Position 1: Green (correct!)
  - Position 2: Orange (right color, wrong spot)
  - Position 3: Green (correct!)
  - Position 4: Green (correct!)
  - Position 5: X (not in palette)
- Adjust and try again!

## ✨ Features

- **Daily Challenge** - New palette every day at 9 AM (resets at that time)
- **Seeded RNG** - Same palette for all players on the same day
- **Color Wheel Selector** - Beautiful, intuitive color picker with Material Symbols icons
- **Collection Tracking** - Save and view all palettes you've guessed
- **Palette Themes** - Palettes come from various color families:
  - Warm Sunset, Cool Ocean, Soft Pastel
  - Jewel Tones, Earth & Clay, Vibrant Pop
  - Muted Modern, Forest Grove, Golden Hour
  - Deep Sea, Berry Harvest, Citrus Burst
- **Statistics** - Track your performance (games played, win %, streaks)
- **Audio & Confetti** - Visual and audio feedback on wins
- **Responsive Design** - Play on desktop, tablet, or mobile
- **Privacy Policy** - Clear data handling practices

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/colorchase26.git
cd colorchase26

# Install dependencies
npm install
```

### Running Locally

```bash
# Start the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to play.

The app auto-updates as you make code changes - hot reload is enabled.

### Production Build

```bash
# Create optimized production build
npm run build

# Start production server
npm start
```

## 📁 Project Structure

```
colorchase26/
├── app/
│   ├── components/
│   │   ├── Header.tsx           # Shared header with icon navigation
│   │   ├── GamePageClient.tsx   # Game page wrapper
│   │   ├── GameArea.tsx         # Main game container
│   │   ├── GameGrid.tsx         # Guess grid display
│   │   ├── ColorWheel.tsx       # Color picker component
│   │   ├── Overlays.tsx         # Win/loss/info modals
│   │   └── DailyStats.tsx       # Footer with stats
│   ├── hooks/
│   │   ├── useGame.ts           # Core game logic & state management
│   │   └── useAudio.ts          # Audio context & controls
│   ├── lib/
│   │   ├── game.ts              # Game rules & guess validation
│   │   └── palette.ts           # Palette generation & seeding
│   ├── player/
│   │   ├── PlayerClient.tsx     # Collection page component
│   │   └── page.tsx             # Collection page route
│   ├── privacy/
│   │   └── page.tsx             # Privacy policy page
│   ├── layout.tsx               # Root layout with metadata
│   ├── globals.css              # Global styles & Tailwind
│   └── page.tsx                 # Game page route
├── public/
│   └── favicon.ico              # App icon
├── next.config.ts               # Next.js configuration
├── tsconfig.json                # TypeScript configuration
├── tailwind.config.ts           # Tailwind CSS configuration
├── package.json                 # Dependencies & scripts
└── README.md                    # This file
```

## 🛠 Technologies Used

- **Frontend Framework**: [Next.js 16.0.8](https://nextjs.org) - React with server-side rendering and static generation
- **Language**: [TypeScript 5](https://www.typescriptlang.org) - Type-safe JavaScript
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com) - Utility-first CSS framework
- **React**: [19.2.1](https://react.dev) - UI library with hooks
- **Icons**: [Material Symbols](https://fonts.google.com/icons) - Google's icon library via Google Fonts
- **State Management**: React hooks (`useState`, `useContext`, `useEffect`)
- **Storage**: Browser `localStorage` for palette collection persistence

## 🎨 Color Palette Generation

Palettes are generated using seeded randomization to ensure consistency across all players:

- **Seed Format**: `YYYY-MM-DD` (reset at 9 AM daily)
- **Palette Families**: 12 themed color categories with HSL-based generation
- **Randomization**: Seeded LCG (Linear Congruential Generator) for deterministic results
- **Variations**: Each palette uses tone treatments (tint, tone, shade, vivid) for visual diversity

See `app/lib/palette.ts` for the palette generation algorithm.

## 📱 Game States

- **Playing** - Guessing the palette with feedback
- **Won** - Successfully matched all 5 colors in 5 or fewer tries
- **Lost** - Used all 5 tries without solving (solution revealed)
- **Info Overlay** - Accessible game rules and explanation
- **Stats Overlay** - Personal performance statistics (planned feature)

## 🔮 Future Features

- User authentication with Google & email
- Persistent user profiles to save collection across devices
- Social sharing of puzzle results
- Leaderboards & achievements
- Daily statistics dashboard
- Custom color wheel themes

## 🧪 Testing

```bash
# Run ESLint to check code quality
npm run lint
```

The project uses Next.js's built-in TypeScript checking and ESLint configuration.

## 📄 License

This project is open source. Feel free to use, modify, and distribute as needed.

## 🤝 Contributing

Contributions are welcome! To contribute:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📞 Support

For issues, questions, or suggestions, please open a GitHub issue or reach out to the maintainers.

---

**Enjoy the game and happy color guessing! 🎨**
