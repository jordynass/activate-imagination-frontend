import { useEffect, useState } from "react";
import socket from "@/utils/network";
import { useRealTimeState } from "./useRealTimeState";

type Chunk = {
  order: number,
  content: string,
}

function useStream() {
  const [allChunks, setAllChunks] = useState(new Map<number, Chunk>());
  const [capacity, setCapacity] = useState(Infinity);
  const [isActive, setIsActive, getIsActiveNow] = useRealTimeState(false);

  useEffect(() => {
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
    
    socket.on("output", addChunk);
    socket.on("endOutput", handleEndOutput);

    return () => {
      socket.off("output", addChunk);
      socket.off("endOutput", handleEndOutput);
    }
  }, [setAllChunks, setCapacity, getIsActiveNow, setIsActive]);

  useEffect(() => {
    if (allChunks.size === capacity) {
      setIsActive(false);
      setCapacity(Infinity);
    }
  }, [allChunks, capacity, setIsActive, setCapacity])

  const values: string[] = [];
  for (let i = 0; i < allChunks.size; i++) {
    const nextChunk = allChunks.get(i);
    if (nextChunk) {
      values.push(nextChunk.content);
    } else {
      break;
    }
  }
  
  return {values, isActive};
}

export default useStream;