import { InputKey } from '@/api';
import { createContext, MutableRefObject } from 'react';

export type Stream = {
  values: string[],
  isActive: boolean,
  responseKey: InputKey|null,
}

export interface IOInterface {
  emit: (event: string, payload: Record<string, any>) => void;
  stream: Stream;
}

const IOInterfaceContext = createContext<IOInterface|null>(null);

export default IOInterfaceContext;