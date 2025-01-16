/** This hook is factored out mostly for ease of mocking */

import { useState } from "react";
import { nanoid } from "nanoid/non-secure";

export function useGameId(): string {
  const [gameId] = useState(nanoid());
  return gameId;
}