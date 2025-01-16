import IOInterfaceContext from "@/contexts/IOInterfaceContext";
import useStream from "@/hooks/useStream";
import { type ReactNode } from "react";

type Props = {
  children: ReactNode
}

export default function IOInterfaceProvider({children}: Props) {
  const ioInterface = useStream();
  return (
    <IOInterfaceContext.Provider value={ioInterface}>{children}</IOInterfaceContext.Provider>
  )
}