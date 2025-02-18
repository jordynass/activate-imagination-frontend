import { createSlice } from "@reduxjs/toolkit";
import { nanoid } from "nanoid/non-secure";

export type GameState = {
  gameId: string;
}

const initialState = { gameId: nanoid() };

const gameSlice = createSlice({
  name: 'game',
  initialState,
  reducers: {
    newGame(state: GameState) {
      state.gameId = nanoid();
    },
  }
})

export const {newGame} = gameSlice.actions;
export default gameSlice.reducer;