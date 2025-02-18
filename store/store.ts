import { configureStore } from "@reduxjs/toolkit";

import gameReducer from './slices/game-slice';

export const store = configureStore({
  reducer: {
    game: gameReducer,
  }
});

export type AppStore = typeof store
export type AppDispatch = typeof store.dispatch
export type RootState = ReturnType<typeof store.getState>