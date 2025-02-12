import { useEffect, useState, useRef } from "react";
import { useRealTimeState } from "./useRealTimeState";
import { Socket } from "socket.io-client";
import { type IOInterface } from "@/contexts/IOInterfaceContext";
import { getSocket, SocketFactory } from "@/utils/SocketFactory";
import { useGameId } from "./useGameId";

type Chunk = {
  order: number,
  content: string,
}

function useStream(socketFactory: SocketFactory = getSocket): IOInterface {
  const [allChunks, setAllChunks] = useState(new Map<number, Chunk>());
  const [capacity, setCapacity] = useState(Infinity);
  const [isActive, setIsActive, getIsActiveNow] = useRealTimeState(false);
  const gameId = useGameId();
  const socket = useRef<Socket>();

  useEffect(() => {
    socket.current = socketFactory(gameId);

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

  function emit(event: string, payload: Record<string, any>) {
    if (!socket.current) {
      console.log('Socket has not yet been defined so emission failed')
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
  
  return {stream: {values, isActive}, emit};
}

export default useStream;