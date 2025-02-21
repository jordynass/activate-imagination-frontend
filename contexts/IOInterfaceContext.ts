import { createContext } from 'react';

export type Stream = {
  values: string[],
  isActive: boolean,
}

export interface IOInterface {
  emit: (event: string, payload: Record<string, any>) => void;
  stream: Stream;
}

const IOInterfaceContext = createContext<IOInterface|null>(null);

export default IOInterfaceContext;