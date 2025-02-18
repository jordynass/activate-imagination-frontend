import { useEffect, useState, useRef } from "react";
import { useRealTimeState } from "./useRealTimeState";
import { Socket } from "socket.io-client";
import { type IOInterface } from "@/contexts/IOInterfaceContext";
import { getSocket, SocketFactory } from "@/utils/SocketFactory";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";

interface Chunk {
  order: number;
  content: string;
}

interface SocketEventListener<Payload> {
  event: string;
  callback: (payload: Payload) => void;
}

function useStream(socketFactory: SocketFactory = getSocket): IOInterface {
  const [allChunks, setAllChunks] = useState(new Map<number, Chunk>());
  const [capacity, setCapacity] = useState(Infinity);
  const [isActive, setIsActive, getIsActiveNow] = useRealTimeState(false);
  const gameId = useSelector((state: RootState) => state.game.gameId);
  const socket = useRef<Socket>();
  const socketEventListeners = useRef<SocketEventListener<any>[]>([]);

  useEffect(() => {
    socket.current = socketFactory();

    function addChunk(chunk: Chunk) {
      setAllChunks(prevChunks => {
        if (!getIsActiveNow()) {
          setIsActive(true);
          return new Map<number, Chunk>([[chunk.order, chunk]]);
        }
        const newChunks = new Map(prevChunks);
        newChunks.set(chunk.order, chunk);
        return newChunks;
      });
    }
    const handleEndOutput = (cap: number) => setCapacity(cap);
    
    socket.current.on("output", addChunk);
    socket.current.on("endOutput", handleEndOutput);

    return () => {
      socket.current?.off("output", addChunk);
      socket.current?.off("endOutput", handleEndOutput);
      socket.current?.disconnect();
      for (const {event, callback} of socketEventListeners.current) {
        socket.current?.off(event, callback);
      }
    }
    // TODO: Switch the last value of getRealTimeState to a ref or useCallback and add isActiveRef or
    // getIsActiveNow (resp) to the dep list.
  }, [setAllChunks, setCapacity, setIsActive]); 

  useEffect(() => {
    if (allChunks.size === capacity) {
      setIsActive(false);
      setCapacity(Infinity);
    }
  }, [allChunks, capacity, setIsActive, setCapacity]);


  // TODO: Migrate to a more declarative pattern like useSocketEventListeners()
  // This pattern works alright but it expects the caller to wrap it in a useEffect
  // hook, which is pretty round about by comparison to a hook
  // useSocketEventListeners(listeners) that completely handles setup and cleanup
  // for the caller.
  /**
   * Example usage:
   * listenFor('drive', (hopOns: Person[]) => stairCar.getSomeHopOns(hopOns));
   */
  function listenFor<Payload>(event: string, callback: (payload: Payload) => void) {
    socket.current?.on(event, callback);
    socketEventListeners.current.push({event, callback})
  }

  /**
   * Example usage:
   * emit('sale', {amount: 50, location: 'Banana Stand'});
   */
  function emit(event: string, payload: Record<string, any>) {
    if (!socket.current) {
      console.log('Socket has not yet been defined so emission failed');
    }
    socket.current?.emit(event, {...payload, gameId});
  };

  const values: string[] = [];
  for (let i = 0; i < allChunks.size; i++) {
    const nextChunk = allChunks.get(i);
    if (nextChunk) {
      values.push(nextChunk.content);
    } else {
      break;
    }
  }
  
  return {stream: {values, isActive}, emit, listenFor};
}

export default useStream;