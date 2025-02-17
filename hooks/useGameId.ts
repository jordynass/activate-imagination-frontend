/** This hook is factored out mostly for ease of mocking */

import { useState } from "react";
import { nanoid } from "nanoid/non-secure";

// TODO: Move to Redux store and support resetting when the user requests to play again.
export function useGameId(): string {
  const [gameId] = useState(nanoid());
  return gameId;
}