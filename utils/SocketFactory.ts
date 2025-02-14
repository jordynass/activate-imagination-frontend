import { io, type Socket } from "socket.io-client";

export type SocketFactory = (gameId: string) => Socket;

export const getSocket: SocketFactory = (gameId: string) =>
  io(BackendEndpoint.CLOUD, {
    extraHeaders: {
      'x-game-id': gameId,
    },
  });

enum BackendEndpoint {
  LOCAL_WIFI = "ws://192.168.1.194:3000",
  LOCAL_ETHERNET = "ws://192.168.1.125:3000",
  CLOUD = "https://activate-imagination-backend-605301331241.us-central1.run.app",
}