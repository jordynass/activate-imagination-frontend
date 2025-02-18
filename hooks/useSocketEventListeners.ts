import { useEffect } from "react";
import { getSocket, SocketFactory } from "@/utils/SocketFactory";

export interface SocketEventListener<Payload> {
  event: string;
  callback: (payload: Payload) => void;
}

function useSocketEventListeners(socketEventListeners: SocketEventListener<any>[], socketFactory: SocketFactory = getSocket) {
  useEffect(() => {
    const socket = socketFactory();
    for (const {event, callback} of socketEventListeners) {
      socket.on(event, callback);
    }

    return () => {
      for (const {event, callback} of socketEventListeners) {
        socket.off(event, callback);
      }
      socket.disconnect();
    }
  }, []);
}

export default useSocketEventListeners;