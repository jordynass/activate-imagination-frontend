import { io } from "socket.io-client";

export function getWebSocketUrl() {
  // TODO: Move to a .env variable using expo-constants
  // and include local environment.
  return "https://activate-imagination-backend-605301331241.us-central1.run.app";
}

const socket = io(getWebSocketUrl());
export default socket;