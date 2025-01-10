import { io } from "socket.io-client";

export function getWebSocketUrl() {
  // TODO: Move to a .env variable using expo-constants
  // and include non-local environments.
  return "ws://192.168.1.194:3000";
}

const socket = io(getWebSocketUrl());
export default socket;