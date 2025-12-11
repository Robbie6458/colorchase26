import Head from "next/head";
import GamePageClient from "./components/GamePageClient";

export default function Home() {
  return (
    <>
      <Head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
        <title>Color Chase: A Daily Color Puzzle</title>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&display=swap" rel="stylesheet" />
        <style>{`body { font-family: 'Inter', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; }`}</style>
      </Head>

      <GamePageClient />

      {/* legacy script.js removed to avoid direct DOM manipulation that conflicts with React components */}
    </>
  );
}
