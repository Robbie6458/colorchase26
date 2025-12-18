import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "About ColorChase | Daily Color Theory Puzzle Game",
  description: "ColorChase is a free daily color guessing game like Wordle. Learn color theory while playing! Guess color palettes, improve your design eye, and compete with players worldwide.",
  keywords: [
    "wordle for colors",
    "color palette game",
    "color theory puzzle game",
    "games like wordle but with colors",
    "what is a color palette guessing game",
    "hues and cues online alternative",
    "chromatic wordle",
    "learn color theory",
  ],
  openGraph: {
    title: "About ColorChase | Daily Color Theory Puzzle Game",
    description: "Learn about ColorChase, the free daily color guessing game that helps you improve your design eye while having fun.",
    url: "https://colorchase.vercel.app/about",
    type: "website",
  },
};

export default function AboutPage() {
  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "What is ColorChase?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "ColorChase is a free daily color palette guessing game where players try to guess a hidden 5-color palette in 6 attempts. Each day features a new palette, and all players worldwide get the same palette, making it a shared daily challenge.",
        },
      },
      {
        "@type": "Question",
        name: "How is ColorChase different from Wordle?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "While Wordle challenges you to guess words, ColorChase challenges you to guess colors. Instead of letters, you select colors from a color wheel. The game provides visual feedback showing how close your guessed colors are to the target palette, helping you refine your guesses with each attempt.",
        },
      },
      {
        "@type": "Question",
        name: "Do I need to know color theory to play?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "No! ColorChase is designed for everyone, from complete beginners to professional designers. The game naturally teaches color perception and theory through gameplay. You'll develop your color eye over time, learning to distinguish subtle hue, saturation, and brightness differences.",
        },
      },
      {
        "@type": "Question",
        name: "Is ColorChase really free?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes, ColorChase is 100% free to play with no ads, no subscriptions, and no hidden costs. We believe in making color education and entertainment accessible to everyone.",
        },
      },
      {
        "@type": "Question",
        name: "Can I play previous days' palettes?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Currently, ColorChase focuses on the daily challenge model where everyone plays the same palette each day. Your collection page shows all the palettes you've successfully guessed, creating a personal color archive over time.",
        },
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900 text-white">
        <div className="max-w-4xl mx-auto px-6 py-12">
          <Link
            href="/"
            className="inline-block mb-8 text-purple-300 hover:text-purple-200 transition-colors"
          >
            ← Back to Game
          </Link>

          <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-pink-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
            About ColorChase
          </h1>

          <div className="prose prose-invert prose-lg max-w-none">
            <section className="mb-12">
              <h2 className="text-3xl font-semibold mb-4 text-purple-300">
                What is ColorChase?
              </h2>
              <p className="text-gray-200 leading-relaxed mb-4">
                ColorChase is a free daily color palette guessing game that
                challenges your color perception and visual memory. Inspired by
                the global phenomenon of daily word games, we created ColorChase
                to bring the same addictive, brain-teasing fun to the world of
                colors. Every day at 9 AM, a new 5-color palette is generated,
                and players worldwide have 6 chances to guess it correctly.
              </p>
              <p className="text-gray-200 leading-relaxed mb-4">
                Whether you're a graphic designer looking to sharpen your color
                eye, an artist exploring color relationships, or simply someone
                who enjoys a good daily puzzle, ColorChase offers an engaging way
                to develop your chromatic intuition. The game combines the
                satisfaction of puzzle-solving with the educational benefits of
                color theory practice.
              </p>
              <p className="text-gray-200 leading-relaxed">
                Unlike traditional color matching games, ColorChase doesn't just
                test your ability to see differences—it teaches you to think
                about colors systematically. With each guess, you'll learn to
                break down colors into their component parts: hue (the color
                family), saturation (intensity), and brightness (lightness or
                darkness). This analytical approach to color makes the game both
                challenging and educational.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-3xl font-semibold mb-4 text-purple-300">
                How ColorChase Compares to Similar Games
              </h2>
              <p className="text-gray-200 leading-relaxed mb-4">
                If you love Wordle, you'll appreciate ColorChase's familiar daily
                challenge structure. But instead of guessing letters, you're
                selecting colors from an interactive color wheel. The game
                provides immediate visual feedback, showing you exactly how close
                each of your guessed colors is to the target palette.
              </p>
              <p className="text-gray-200 leading-relaxed mb-4">
                Compared to games like Hues and Cues or other color-based party
                games, ColorChase is designed for solo play with a focus on skill
                development. There's no randomness—success comes from developing
                your color perception abilities. The daily format creates a shared
                experience where you can compare your results with friends,
                family, and players around the world.
              </p>
              <p className="text-gray-200 leading-relaxed">
                What makes ColorChase unique is its progressive difficulty. Early
                in your ColorChase journey, you might struggle to distinguish
                similar shades. But within weeks of daily play, you'll notice your
                color perception dramatically improving. Many players report
                becoming more confident in their design work, better at choosing
                paint colors, and more aware of the colors in their everyday
                environment.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-3xl font-semibold mb-4 text-purple-300">
                The Educational Benefits of Playing ColorChase
              </h2>
              <p className="text-gray-200 leading-relaxed mb-4">
                ColorChase isn't just entertainment—it's a powerful learning tool
                disguised as a game. By playing daily, you're essentially giving
                yourself a micro-lesson in color theory without the formal
                instruction. Here's what you'll develop:
              </p>
              <ul className="text-gray-200 leading-relaxed mb-4 space-y-2">
                <li>
                  <strong className="text-purple-300">Color Perception:</strong>{" "}
                  Train your eyes to distinguish subtle differences in hue,
                  saturation, and brightness. This is the foundation of all color
                  work in design, art, and photography.
                </li>
                <li>
                  <strong className="text-purple-300">Visual Memory:</strong>{" "}
                  Improve your ability to remember and recall colors accurately—a
                  crucial skill for designers who need to maintain color
                  consistency across projects.
                </li>
                <li>
                  <strong className="text-purple-300">Color Relationships:</strong>{" "}
                  Learn how colors interact with each other by seeing which
                  combinations work in the daily palettes. You'll develop an
                  intuitive understanding of complementary, analogous, and
                  triadic color schemes.
                </li>
                <li>
                  <strong className="text-purple-300">
                    Systematic Thinking:
                  </strong>{" "}
                  Develop a methodical approach to color selection rather than
                  relying on guesswork. This analytical mindset transfers to other
                  creative and problem-solving tasks.
                </li>
              </ul>
              <p className="text-gray-200 leading-relaxed">
                Professional designers, photographers, and artists have told us
                that ColorChase has become part of their morning routine—a fun way
                to "warm up" their creative brain before starting work. Teachers
                have introduced it in art and design classes as an engaging way to
                teach color theory concepts that students actually enjoy
                practicing.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-3xl font-semibold mb-4 text-purple-300">
                Why We Built ColorChase
              </h2>
              <p className="text-gray-200 leading-relaxed mb-4">
                As designers and developers, we've always been fascinated by the
                intersection of games and education. When daily word puzzle games
                took the world by storm, we saw an opportunity to create something
                similar for the visual community. Colors are universal—they
                transcend language barriers and connect with everyone differently.
              </p>
              <p className="text-gray-200 leading-relaxed mb-4">
                We wanted to create a game that was immediately accessible to
                beginners yet endlessly challenging for experts. A game that you
                could play in under two minutes during your coffee break, but that
                would genuinely improve your skills over time. Most importantly,
                we wanted it to be completely free, with no ads or paywalls—just
                pure, daily color fun.
              </p>
              <p className="text-gray-200 leading-relaxed">
                ColorChase represents our belief that learning should be playful
                and that games can be genuinely educational without feeling like
                homework. Every palette is carefully generated to be challenging
                yet achievable, offering a perfect balance of difficulty that
                keeps you coming back day after day.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-3xl font-semibold mb-4 text-purple-300">
                Join the ColorChase Community
              </h2>
              <p className="text-gray-200 leading-relaxed mb-4">
                When you play ColorChase, you're joining thousands of players
                worldwide who tackle the same palette every day. Share your
                results on social media, challenge your designer friends, or
                simply enjoy the personal satisfaction of building your palette
                collection. Every day offers a fresh challenge and a new
                opportunity to improve.
              </p>
              <p className="text-gray-200 leading-relaxed">
                Follow us on{" "}
                <a
                  href="https://www.instagram.com/colorchasegame/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-purple-300 hover:text-purple-200 underline"
                >
                  Instagram
                </a>{" "}
                to see daily palette reveals, player highlights, and color theory
                tips. We love seeing how our community uses ColorChase, whether
                it's as a morning brain teaser, a design warm-up, or a friendly
                competition with colleagues.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-3xl font-semibold mb-4 text-purple-300">
                Frequently Asked Questions
              </h2>

              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-semibold mb-2 text-purple-200">
                    What is ColorChase?
                  </h3>
                  <p className="text-gray-200 leading-relaxed">
                    ColorChase is a free daily color palette guessing game where
                    players try to guess a hidden 5-color palette in 6 attempts.
                    Each day features a new palette, and all players worldwide get
                    the same palette, making it a shared daily challenge.
                  </p>
                </div>

                <div>
                  <h3 className="text-xl font-semibold mb-2 text-purple-200">
                    How is ColorChase different from Wordle?
                  </h3>
                  <p className="text-gray-200 leading-relaxed">
                    While Wordle challenges you to guess words, ColorChase
                    challenges you to guess colors. Instead of letters, you select
                    colors from a color wheel. The game provides visual feedback
                    showing how close your guessed colors are to the target
                    palette, helping you refine your guesses with each attempt.
                  </p>
                </div>

                <div>
                  <h3 className="text-xl font-semibold mb-2 text-purple-200">
                    Do I need to know color theory to play?
                  </h3>
                  <p className="text-gray-200 leading-relaxed">
                    No! ColorChase is designed for everyone, from complete
                    beginners to professional designers. The game naturally teaches
                    color perception and theory through gameplay. You'll develop
                    your color eye over time, learning to distinguish subtle hue,
                    saturation, and brightness differences.
                  </p>
                </div>

                <div>
                  <h3 className="text-xl font-semibold mb-2 text-purple-200">
                    Is ColorChase really free?
                  </h3>
                  <p className="text-gray-200 leading-relaxed">
                    Yes, ColorChase is 100% free to play with no ads, no
                    subscriptions, and no hidden costs. We believe in making color
                    education and entertainment accessible to everyone.
                  </p>
                </div>

                <div>
                  <h3 className="text-xl font-semibold mb-2 text-purple-200">
                    Can I play previous days' palettes?
                  </h3>
                  <p className="text-gray-200 leading-relaxed">
                    Currently, ColorChase focuses on the daily challenge model
                    where everyone plays the same palette each day. Your collection
                    page shows all the palettes you've successfully guessed,
                    creating a personal color archive over time.
                  </p>
                </div>

                <div>
                  <h3 className="text-xl font-semibold mb-2 text-purple-200">
                    What happens if I don't guess the palette?
                  </h3>
                  <p className="text-gray-200 leading-relaxed">
                    If you use all 6 attempts without guessing correctly, the
                    palette is revealed and you can try again tomorrow! Your stats
                    track both wins and attempts, so you can see your improvement
                    over time.
                  </p>
                </div>

                <div>
                  <h3 className="text-xl font-semibold mb-2 text-purple-200">
                    How are the daily palettes generated?
                  </h3>
                  <p className="text-gray-200 leading-relaxed">
                    Each palette is algorithmically generated using a seeded random
                    number generator based on the date. This ensures every player
                    worldwide gets the same palette on the same day, creating a
                    shared experience while maintaining variety and challenge.
                  </p>
                </div>
              </div>
            </section>

            <section className="mb-12">
              <h2 className="text-3xl font-semibold mb-4 text-purple-300">
                Ready to Play?
              </h2>
              <p className="text-gray-200 leading-relaxed mb-6">
                Start your ColorChase journey today! Challenge yourself with the
                daily palette, track your progress, and watch your color
                perception skills grow. Whether you play for fun, education, or
                professional development, there's a new color adventure waiting
                every day.
              </p>
              <Link
                href="/"
                className="inline-block px-8 py-3 bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-500 text-white font-semibold rounded-lg hover:from-pink-600 hover:via-purple-600 hover:to-cyan-600 transition-all shadow-lg hover:shadow-xl"
              >
                Play Today's Palette
              </Link>
            </section>
          </div>
        </div>
      </div>
    </>
  );
}
