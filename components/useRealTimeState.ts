import { useRef, useState } from "react";

/**
 * Provides a real time value like useRef so it can be effectively used in async callbacks,
 * but it includes a state variable for templates that will cause a rerender some time
 * shortly after the getFieldNow() return value changes.
 * @param initialValue 
 * @returns [field, setField, getFieldNow]
 */
export function useRealTimeState<T>(initialValue: T): [T, (value: T) => void, () => T] {
  const [field, setField] = useState(initialValue);
  const fieldRef = useRef(initialValue);
  
  return [
    field,
    (value: T) => {
      fieldRef.current = value;
      setField(value)
    },
    () => fieldRef.current,
  ];
}