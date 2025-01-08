import { useEffect, useRef, useState } from "react";
import socket from "@/utils/network";

type Emission = {
  order: number,
  content: string,
}

function useStream() {
  const [allEmissions, setAllEmissions] = useState(new Map<number, Emission>());
  const [capacity, setCapacity] = useState(Infinity);
  const isActiveRef = useRef(false);

  useEffect(() => {
    function addEmission(emission: Emission) {
      setAllEmissions(prevEmissions => {
        if (!isActiveRef.current) {
          isActiveRef.current = true;;
          return new Map<number, Emission>([[emission.order, emission]]);
        }
        const newEmissions = new Map(prevEmissions);
        newEmissions.set(emission.order, emission);
        if (allEmissions.size === capacity) {
          isActiveRef.current = false;
          setCapacity(Infinity);
        }
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
  }, [setAllEmissions, setCapacity, isActiveRef]);

  const values: string[] = [];
  for (let i = 0; i < allEmissions.size; i++) {
    const nextEmission = allEmissions.get(i);
    if (nextEmission) {
      values.push(nextEmission.content);
    } else {
      break;
    }
  }
  
  return {values, isActive: isActiveRef.current};
}

export default useStream;