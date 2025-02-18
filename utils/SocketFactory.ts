import { io, type Socket } from "socket.io-client";

export type SocketFactory = () => Socket;

export const getSocket: SocketFactory = () => io(BackendEndpoint.CLOUD);

enum BackendEndpoint {
  LOCAL_WIFI = "ws://192.168.1.194:3000",
  LOCAL_ETHERNET = "ws://192.168.1.125:3000",
  CLOUD = "https://activate-imagination-backend-605301331241.us-central1.run.app",
}