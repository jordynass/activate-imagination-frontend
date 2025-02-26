export enum InputKey {
  ACTION = 'action',
  NEW_SCENE = 'newScene',
}

export interface EndStreamPayload {
  length: number,
  responseKey: InputKey,
}