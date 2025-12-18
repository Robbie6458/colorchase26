import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "How to Play ColorChase | Color Guessing Game Rules & Strategy",
  description: "Learn how to play ColorChase! Master the daily color palette puzzle with tips on color theory, guessing strategies, and improving your chromatic perception. Perfect for designers and gamers.",
  keywords: [
    "how to guess color palettes",
    "color theory puzzle game",
    "learn color theory through games",
    "hex color guessing challenge",
    "color harmony game",
    "color guessing strategies",
    "improve color perception",
    "color matching tips",
  ],
  openGraph: {
    title: "How to Play ColorChase | Color Guessing Game Rules & Strategy",
    description: "Master ColorChase with our complete guide to rules, strategies, and color theory tips.",
    url: "https://colorchase.vercel.app/how-to-play",
    type: "website",
  },
};

export default function HowToPlayPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900 text-white">
      <div className="max-w-4xl mx-auto px-6 py-12">
        <Link
          href="/"
          className="inline-block mb-8 text-purple-300 hover:text-purple-200 transition-colors"
        >
          ← Back to Game
        </Link>

        <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-pink-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
          How to Play ColorChase
        </h1>

        <div className="prose prose-invert prose-lg max-w-none">
          <section className="mb-12">
            <h2 className="text-3xl font-semibold mb-4 text-purple-300">
              The Basic Rules
            </h2>
            <p className="text-gray-200 leading-relaxed mb-4">
              ColorChase is a daily color palette guessing game that challenges
              you to identify five hidden colors in six attempts or fewer. Every
              day at 9 AM, a new palette is generated, and your goal is to
              recreate it as accurately as possible. Think of it like Wordle, but
              instead of guessing letters, you're selecting colors from an
              interactive color wheel.
            </p>
            <p className="text-gray-200 leading-relaxed mb-4">
              Here's how each game works:
            </p>
            <ol className="text-gray-200 leading-relaxed mb-4 space-y-2 list-decimal list-inside">
              <li>
                You start with a blank palette showing five empty color slots.
              </li>
              <li>
                Click on any slot to open the color wheel selector, where you can
                choose any color by adjusting hue, saturation, and brightness.
              </li>
              <li>
                Once you've selected all five colors for your guess, submit your
                attempt.
              </li>
              <li>
                The game shows you visual feedback indicating how close each of
                your colors is to the target palette.
              </li>
              <li>
                Use this feedback to refine your next guess, adjusting your colors
                based on what you learned.
              </li>
              <li>
                Continue until you've correctly identified all five colors or
                you've used all six attempts.
              </li>
            </ol>
            <p className="text-gray-200 leading-relaxed">
              The challenge lies in interpreting the feedback accurately and
              making strategic color adjustments. With practice, you'll develop
              an intuitive understanding of how colors relate to each other and
              how to navigate the color space efficiently.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-3xl font-semibold mb-4 text-purple-300">
              Understanding the Color Wheel
            </h2>
            <p className="text-gray-200 leading-relaxed mb-4">
              The color wheel in ColorChase is your primary tool for selecting
              colors. Understanding how it works is crucial to improving your
              game. The wheel is organized around three fundamental properties of
              color:
            </p>
            <div className="mb-6">
              <h3 className="text-xl font-semibold mb-2 text-purple-200">
                Hue (Color Family)
              </h3>
              <p className="text-gray-200 leading-relaxed mb-4">
                Hue is what we typically think of as "color"—red, orange, yellow,
                green, blue, purple, and everything in between. On the color
                wheel, hue is represented by the circular ring. Moving around the
                wheel changes the basic color family. For example, starting at
                red and moving clockwise takes you through orange, yellow, green,
                blue, and purple before returning to red.
              </p>
              <p className="text-gray-200 leading-relaxed">
                Pro tip: Hues directly across from each other on the wheel are
                called complementary colors. They create maximum contrast and can
                be useful reference points when making educated guesses about
                palette composition.
              </p>
            </div>
            <div className="mb-6">
              <h3 className="text-xl font-semibold mb-2 text-purple-200">
                Saturation (Color Intensity)
              </h3>
              <p className="text-gray-200 leading-relaxed mb-4">
                Saturation controls how vivid or muted a color appears. On most
                color wheels, saturation increases as you move from the center
                toward the edge. A fully saturated color is vibrant and
                pure—think of a bright red fire truck. A desaturated version of
                the same hue appears grayish and muted—like a dusty rose pink.
              </p>
              <p className="text-gray-200 leading-relaxed">
                Many beginning players overlook saturation, focusing only on hue.
                However, getting the saturation right is often the difference
                between a close guess and a perfect match. If your feedback
                suggests you have the right general color but something's off,
                try adjusting the saturation.
              </p>
            </div>
            <div className="mb-6">
              <h3 className="text-xl font-semibold mb-2 text-purple-200">
                Brightness (Lightness/Value)
              </h3>
              <p className="text-gray-200 leading-relaxed mb-4">
                Brightness, sometimes called value or lightness, determines how
                light or dark a color appears. This is typically controlled by a
                separate slider in the color picker. At maximum brightness, colors
                appear light and luminous. At minimum brightness, all colors
                become black regardless of their hue or saturation.
              </p>
              <p className="text-gray-200 leading-relaxed">
                Understanding brightness is essential for distinguishing between
                colors that might look similar at first glance. For instance, a
                dark blue and a light purple might seem like the same color
                family, but they differ significantly in both hue and brightness.
              </p>
            </div>
          </section>

          <section className="mb-12">
            <h2 className="text-3xl font-semibold mb-4 text-purple-300">
              Beginner Strategies: Your First Week
            </h2>
            <p className="text-gray-200 leading-relaxed mb-4">
              If you're new to ColorChase, here are some strategies to help you
              get started and avoid common pitfalls:
            </p>

            <div className="mb-6">
              <h3 className="text-xl font-semibold mb-2 text-purple-200">
                Start with Distinct Colors
              </h3>
              <p className="text-gray-200 leading-relaxed">
                For your first guess, choose five colors that are clearly
                different from each other. For example, you might select red,
                yellow, green, blue, and purple—colors evenly distributed around
                the color wheel. This approach helps you quickly identify which
                general hue families are present in the target palette. Think of
                it as "sampling the color space" to narrow down possibilities.
              </p>
            </div>

            <div className="mb-6">
              <h3 className="text-xl font-semibold mb-2 text-purple-200">
                Pay Attention to Color Relationships
              </h3>
              <p className="text-gray-200 leading-relaxed">
                Daily palettes aren't random collections of colors—they're
                usually designed with some harmony or relationship in mind. Look
                for patterns like analogous colors (neighbors on the color wheel),
                complementary pairs (opposites), or monochromatic variations
                (same hue, different brightness/saturation). Recognizing these
                relationships can help you predict what other colors might be in
                the palette.
              </p>
            </div>

            <div className="mb-6">
              <h3 className="text-xl font-semibold mb-2 text-purple-200">
                Make Incremental Adjustments
              </h3>
              <p className="text-gray-200 leading-relaxed">
                After your first guess, don't make wild changes. If a color feels
                close, make small adjustments to hue, saturation, or brightness
                one at a time. This methodical approach helps you isolate which
                property needs changing. Dramatic changes make it harder to learn
                from your previous guess.
              </p>
            </div>

            <div className="mb-6">
              <h3 className="text-xl font-semibold mb-2 text-purple-200">
                Focus on One Color at a Time
              </h3>
              <p className="text-gray-200 leading-relaxed">
                Rather than trying to adjust all five colors simultaneously,
                consider perfecting one or two colors per attempt. This focused
                approach is less overwhelming and helps you build confidence as
                you see individual colors "lock in" with each successful match.
              </p>
            </div>

            <div className="mb-6">
              <h3 className="text-xl font-semibold mb-2 text-purple-200">
                Trust Your Eyes, Not Your Screen
              </h3>
              <p className="text-gray-200 leading-relaxed">
                Different screens display colors slightly differently. Don't worry
                about getting colors "perfectly" accurate in absolute terms. The
                game is consistent for all players, so everyone is working with
                the same relative color relationships. Focus on making your
                guesses better relative to the feedback, not achieving
                pixel-perfect accuracy.
              </p>
            </div>
          </section>

          <section className="mb-12">
            <h2 className="text-3xl font-semibold mb-4 text-purple-300">
              Advanced Strategies: Leveling Up Your Game
            </h2>
            <p className="text-gray-200 leading-relaxed mb-4">
              Once you've played for a few weeks and feel comfortable with the
              basics, these advanced techniques can help you improve your success
              rate and lower your average number of guesses:
            </p>

            <div className="mb-6">
              <h3 className="text-xl font-semibold mb-2 text-purple-200">
                Understand Common Palette Structures
              </h3>
              <p className="text-gray-200 leading-relaxed mb-4">
                Professional designers often create palettes using established
                color harmony principles. Familiarize yourself with these common
                structures:
              </p>
              <ul className="text-gray-200 leading-relaxed mb-4 space-y-2 list-disc list-inside pl-4">
                <li>
                  <strong>Analogous:</strong> Three to five colors that sit next
                  to each other on the color wheel (e.g., yellow, yellow-green,
                  green, blue-green, blue).
                </li>
                <li>
                  <strong>Complementary:</strong> Colors from opposite sides of
                  the wheel, often with variations in brightness/saturation.
                </li>
                <li>
                  <strong>Triadic:</strong> Three colors equally spaced around the
                  wheel (e.g., red, yellow, blue).
                </li>
                <li>
                  <strong>Monochromatic:</strong> Variations of a single hue with
                  different saturation and brightness levels.
                </li>
                <li>
                  <strong>Split Complementary:</strong> A base color plus the two
                  colors adjacent to its complement.
                </li>
              </ul>
              <p className="text-gray-200 leading-relaxed">
                When you identify one or two colors in the palette, consider what
                harmony structure they might belong to, then test colors that fit
                that pattern.
              </p>
            </div>

            <div className="mb-6">
              <h3 className="text-xl font-semibold mb-2 text-purple-200">
                Use the Process of Elimination
              </h3>
              <p className="text-gray-200 leading-relaxed">
                After a few guesses, you'll have learned what the colors are NOT.
                Use this negative knowledge strategically. If you've tried several
                warm colors (reds, oranges, yellows) without success, the palette
                likely favors cool colors (blues, greens, purples). This
                elimination process helps you narrow the search space faster.
              </p>
            </div>

            <div className="mb-6">
              <h3 className="text-xl font-semibold mb-2 text-purple-200">
                Develop Your Color Memory
              </h3>
              <p className="text-gray-200 leading-relaxed">
                Advanced players develop the ability to remember and recreate
                specific colors they've seen before. Practice this skill in daily
                life: try to memorize a color from your environment and then
                recreate it on the color wheel. This strengthens your color memory
                and makes you faster at dial in specific shades during gameplay.
              </p>
            </div>

            <div className="mb-6">
              <h3 className="text-xl font-semibold mb-2 text-purple-200">
                Think in RGB/Hex Values
              </h3>
              <p className="text-gray-200 leading-relaxed">
                For designers comfortable with digital color formats, thinking in
                RGB (Red, Green, Blue) or hex codes can provide a more analytical
                approach. Each color is composed of red, green, and blue light in
                varying intensities. Understanding this can help you make more
                precise adjustments. For instance, if a color feels too purple,
                you need to reduce blue or increase red and green.
              </p>
            </div>

            <div className="mb-6">
              <h3 className="text-xl font-semibold mb-2 text-purple-200">
                Practice Outside the Game
              </h3>
              <p className="text-gray-200 leading-relaxed">
                Improve your ColorChase skills by practicing color perception in
                your daily environment. Try to identify the hue, saturation, and
                brightness of objects around you. Use design tools or color
                pickers to test your estimates. This real-world practice
                translates directly to better performance in the game.
              </p>
            </div>
          </section>

          <section className="mb-12">
            <h2 className="text-3xl font-semibold mb-4 text-purple-300">
              Color Theory Essentials for ColorChase
            </h2>
            <p className="text-gray-200 leading-relaxed mb-4">
              While you don't need formal color theory knowledge to enjoy
              ColorChase, understanding a few key concepts can significantly
              improve your gameplay and deepen your appreciation for color:
            </p>

            <div className="mb-6">
              <h3 className="text-xl font-semibold mb-2 text-purple-200">
                Warm vs. Cool Colors
              </h3>
              <p className="text-gray-200 leading-relaxed">
                Colors are often described as warm (reds, oranges, yellows) or
                cool (blues, greens, purples). This temperature quality affects
                how colors feel and interact. Warm colors tend to advance visually
                and feel energetic, while cool colors recede and feel calming.
                Many palettes balance warm and cool colors for visual interest.
              </p>
            </div>

            <div className="mb-6">
              <h3 className="text-xl font-semibold mb-2 text-purple-200">
                Color Context and Relativity
              </h3>
              <p className="text-gray-200 leading-relaxed">
                Colors don't exist in isolation—they're always perceived in
                relation to surrounding colors. The same gray can appear warm when
                surrounded by cool colors or cool when surrounded by warm colors.
                This principle, called simultaneous contrast, means you should
                always evaluate your color guesses in relation to the other colors
                in your palette, not in absolute terms.
              </p>
            </div>

            <div className="mb-6">
              <h3 className="text-xl font-semibold mb-2 text-purple-200">
                The Role of Neutral Colors
              </h3>
              <p className="text-gray-200 leading-relaxed">
                Don't overlook grays, browns, and desaturated colors. These
                neutrals are often the hardest to guess because they require
                precise control of both saturation and brightness. A "gray" might
                actually be a highly desaturated blue, green, or purple. When
                working with neutrals, pay special attention to subtle color casts
                or undertones.
              </p>
            </div>

            <div className="mb-6">
              <h3 className="text-xl font-semibold mb-2 text-purple-200">
                Tints, Shades, and Tones
              </h3>
              <p className="text-gray-200 leading-relaxed">
                These terms describe variations of a base hue. A tint is created
                by adding white (increasing brightness), a shade by adding black
                (decreasing brightness), and a tone by adding gray (decreasing
                saturation). Understanding these concepts helps you make more
                targeted adjustments when a color is close but not quite right.
              </p>
            </div>
          </section>

          <section className="mb-12">
            <h2 className="text-3xl font-semibold mb-4 text-purple-300">
              Common Mistakes to Avoid
            </h2>
            <p className="text-gray-200 leading-relaxed mb-4">
              Even experienced players can fall into these traps. Being aware of
              them can help you progress faster:
            </p>

            <ul className="text-gray-200 leading-relaxed mb-4 space-y-3">
              <li>
                <strong className="text-purple-300">
                  Ignoring Saturation Changes:
                </strong>{" "}
                Many players focus only on hue and brightness, forgetting that
                saturation can make a huge difference. A slightly desaturated blue
                can look completely different from a fully saturated one.
              </li>
              <li>
                <strong className="text-purple-300">
                  Making Random Guesses:
                </strong>{" "}
                When frustrated, it's tempting to try random colors. Resist this
                urge. Every guess should be informed by previous feedback.
                Strategic, incremental changes always perform better than random
                attempts.
              </li>
              <li>
                <strong className="text-purple-300">
                  Overthinking Early Guesses:
                </strong>{" "}
                Don't spend 10 minutes perfecting your first guess. Use early
                attempts to gather information broadly, then refine in later
                guesses. Speed in early guesses gives you more attempts to perfect
                the details.
              </li>
              <li>
                <strong className="text-purple-300">
                  Neglecting Color Order:
                </strong>{" "}
                While the position of colors in the palette doesn't affect
                scoring, arranging your guesses in a logical order (like grouping
                similar colors) can help you spot patterns and relationships more
                easily.
              </li>
              <li>
                <strong className="text-purple-300">
                  Comparing to Previous Days:
                </strong>{" "}
                Each daily palette is unique. Don't assume today's palette will
                follow the same structure or color scheme as yesterday's. Approach
                each day fresh.
              </li>
            </ul>
          </section>

          <section className="mb-12">
            <h2 className="text-3xl font-semibold mb-4 text-purple-300">
              Tracking Your Progress
            </h2>
            <p className="text-gray-200 leading-relaxed mb-4">
              ColorChase automatically tracks your performance over time. Your
              stats include:
            </p>
            <ul className="text-gray-200 leading-relaxed mb-4 space-y-2 list-disc list-inside pl-4">
              <li>
                <strong>Games Played:</strong> Total number of daily challenges
                you've attempted
              </li>
              <li>
                <strong>Win Percentage:</strong> The percentage of games you've
                successfully completed
              </li>
              <li>
                <strong>Current Streak:</strong> Consecutive days you've won
              </li>
              <li>
                <strong>Best Streak:</strong> Your longest winning streak ever
              </li>
              <li>
                <strong>Guess Distribution:</strong> How many guesses you
                typically need to win
              </li>
            </ul>
            <p className="text-gray-200 leading-relaxed mb-4">
              Most players see significant improvement within their first month of
              daily play. Your guess distribution should gradually shift toward
              lower numbers as your color perception skills develop. Don't be
              discouraged by early struggles—every professional designer had to
              start somewhere, and ColorChase provides a fun, low-pressure way to
              develop these skills.
            </p>
            <p className="text-gray-200 leading-relaxed">
              Your collection page shows all the palettes you've successfully
              guessed, creating a beautiful, growing archive of your ColorChase
              journey. Many players find inspiration in their collections,
              sometimes even using past palettes in their design work.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-3xl font-semibold mb-4 text-purple-300">
              Ready to Master ColorChase?
            </h2>
            <p className="text-gray-200 leading-relaxed mb-6">
              Now that you understand the rules, strategies, and color theory
              behind ColorChase, it's time to put your knowledge into practice.
              Remember: improvement comes from consistent daily play, careful
              observation, and learning from each attempt. Every guess teaches you
              something new about color perception.
            </p>
            <p className="text-gray-200 leading-relaxed mb-6">
              The most important tip of all? Have fun! ColorChase is designed to
              be enjoyable whether you win in one guess or use all six attempts.
              Each day brings a new challenge and a new opportunity to train your
              eye for color.
            </p>
            <Link
              href="/"
              className="inline-block px-8 py-3 bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-500 text-white font-semibold rounded-lg hover:from-pink-600 hover:via-purple-600 hover:to-cyan-600 transition-all shadow-lg hover:shadow-xl"
            >
              Start Playing Now
            </Link>
          </section>
        </div>
      </div>
    </div>
  );
}
