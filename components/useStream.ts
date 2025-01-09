import { useEffect, useRef, useState } from "react";
import socket from "@/utils/network";
import { useRealTimeState } from "./useRealTimeState";

type Emission = {
  order: number,
  content: string,
}

function useStream() {
  const [allEmissions, setAllEmissions] = useState(new Map<number, Emission>());
  const [capacity, setCapacity] = useState(Infinity);
  const [isActive, setIsActive, getIsActiveNow] = useRealTimeState(false);

  useEffect(() => {
    function addEmission(emission: Emission) {
      setAllEmissions(prevEmissions => {
        if (!getIsActiveNow()) {
          setIsActive(true);
          return new Map<number, Emission>([[emission.order, emission]]);
        }
        const newEmissions = new Map(prevEmissions);
        newEmissions.set(emission.order, emission);
        return newEmissions;
      });
    }
    const handleEndOutput = (cap: number) => setCapacity(cap);
    
    socket.on("output", addEmission);
    socket.on("endOutput", handleEndOutput);

    return () => {
      socket.off("output", addEmission);
      socket.off("endOutput", handleEndOutput);
    }
  }, [setAllEmissions, setCapacity, getIsActiveNow, setIsActive]);

  useEffect(() => {
    if (allEmissions.size === capacity) {
      setIsActive(false);
      setCapacity(Infinity);
    }
  }, [allEmissions, capacity, setIsActive, setCapacity])

  const values: string[] = [];
  for (let i = 0; i < allEmissions.size; i++) {
    const nextEmission = allEmissions.get(i);
    if (nextEmission) {
      values.push(nextEmission.content);
    } else {
      break;
    }
  }
  
  return {values, isActive};
}

export default useStream;