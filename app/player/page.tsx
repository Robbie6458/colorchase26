import React from "react";
import PlayerClient from "./PlayerClient";

export const metadata = {
  title: "My Collection - Color Chase",
};

export default function PlayerPage() {
  return (
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body>
        <PlayerClient />
      </body>
    </html>
  );
}
