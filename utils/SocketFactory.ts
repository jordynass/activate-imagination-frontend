import { io, type Socket } from "socket.io-client";

export type SocketFactory = () => Socket;

let socket: Socket|null = null;

/**
 * Lazily generates single socket instance. I thought io()
 * took care of this internally, but I was getting bugs from
 * multiple connections when I switched to a pattern that called
 * getSocket() more than once, i.e. with the migration to
 * useSocketEventListener().
 */
export const getSocket: SocketFactory = () => {
  if (!socket) {
    socket = io(BackendEndpoint.CLOUD);
  }
  return socket;
};

enum BackendEndpoint {
  LOCAL_WIFI = "ws://192.168.1.194:3000",
  LOCAL_ETHERNET = "ws://192.168.1.125:3000",
  CLOUD = "https://activate-imagination-backend-605301331241.us-central1.run.app",
}