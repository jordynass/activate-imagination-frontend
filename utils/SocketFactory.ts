import { io, type Socket } from "socket.io-client";

export type SocketFactory = (gameId: string) => Socket;

export const getSocket: SocketFactory = (gameId: string) =>
  io(LOCAL_WEBSOCKET, {
    extraHeaders: {
      'x-game-id': gameId,
    },
  });

const LOCAL_WEBSOCKET = "ws://192.168.1.194:3000";
// const LIVE_WEBSOCKET = "https://activate-imagination-backend-605301331241.us-central1.run.app";