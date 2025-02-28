import React, { ReactElement } from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { useRouter } from 'expo-router';
import HeroLogScreen, { ACTION_INPUT_PLACEHOLDER, ACTION_BUTTON, START_SCENE_BUTTON } from '../hero-log-screen';
import IOInterfaceContext, { type Stream } from "@/contexts/IOInterfaceContext";
import { SocketEventListener } from '@/hooks/useSocketEventListeners';
import { InputKey } from '@/api';
import deepEqual from 'fast-deep-equal';

jest.mock('expo-router', () => ({
  useRouter: jest.fn(),
}));
jest.mock('@/components/Camera', () => {
  const { View } = require('react-native');
  return {
    __esModule: true,
    default: () => <View testID="camera" />
  };
});

describe('HeroLogScreen', () => {
  function setup(streamMods: Partial<Stream> = {}) {
    const emit = jest.fn();
    const mockRouter = { push: jest.fn() };
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
    jest.clearAllMocks();
    const stream = {
      values: [],
      isActive: true,
      responseKey: null,
      ...streamMods,
    }
    const harness = render(
      <IOInterfaceContext.Provider value={{stream, emit}}>
        <HeroLogScreen />
      </IOInterfaceContext.Provider>);
    return { stream, emit, harness, mockRouter }
  }

  it('renders correctly when stream is inactive', () => {
    const {harness: { queryByTestId, queryByText }} = setup();

    expect(queryByTestId('card-content')).toBeNull();
    expect(queryByText(ACTION_BUTTON)).toBeNull();
  });

  it('renders content when stream has values', () => {
    const {harness: { getByText }} = setup({ values: ['message1', 'message2'] });

    expect(getByText('message1message2')).toBeTruthy();
  });

  it('renders action controls when stream finishes with ACTION InputKey', () => {
    const {emit, stream, harness: { queryByText, getByPlaceholderText, rerender, queryByTestId }} = setup({ values: ['message1'] });
    updateStream(rerender, stream, { isActive: false, responseKey: InputKey.ACTION }, emit);

    expect(queryByText(ACTION_BUTTON)).toBeTruthy();
    expect(getByPlaceholderText(ACTION_INPUT_PLACEHOLDER)).toBeTruthy();

    expect(queryByText(START_SCENE_BUTTON)).toBeNull();
    expect(queryByTestId('camera')).toBeNull();
  });

  it('renders camera controls when stream finishes with NEW_SCENE InputKey', () => {
    const {emit, stream, harness: { queryByText, queryByPlaceholderText, getByTestId, rerender }} = setup({ values: ['message1'] });
    updateStream(rerender, stream, { isActive: false, responseKey: InputKey.NEW_SCENE }, emit);

    expect(queryByText(START_SCENE_BUTTON)).toBeTruthy();
    expect(getByTestId('camera')).toBeTruthy();

    expect(queryByText(ACTION_BUTTON)).toBeNull();
    expect(queryByPlaceholderText(ACTION_INPUT_PLACEHOLDER)).toBeNull();
  });

  it('emits action on button press', () => {
    const {emit, stream, harness: { getByText, getByPlaceholderText, rerender }} = setup({ values: ['message1'] });
    updateStream(rerender, stream, { isActive: false, responseKey: InputKey.ACTION }, emit);

    const input = getByPlaceholderText(ACTION_INPUT_PLACEHOLDER);
    fireEvent.changeText(input, 'test response');
    fireEvent.press(getByText(ACTION_BUTTON));

    expect(emit).toHaveBeenCalledWith('action', {text: 'test response'});
  });

  it('renders ActivityIndicator while waiting', async () => {
    const {emit, stream, harness: { getByText, getByPlaceholderText, queryByTestId, rerender }} = setup({ values: ['message1'] });
    updateStream(rerender, stream, { isActive: false, responseKey: InputKey.ACTION }, emit);

    const input = getByPlaceholderText(ACTION_INPUT_PLACEHOLDER);
    fireEvent.changeText(input, 'test response');
    fireEvent.press(getByText(ACTION_BUTTON));

    await waitFor(() => {
      expect(queryByTestId('activity-indicator')).toBeTruthy();
    });
  });
  
  it('hides ActivityIndicator when stream resumes', async () => {
    const {emit, stream, harness: { getByText, getByPlaceholderText, queryByTestId, rerender }} = setup({ values: ['message1'] });
    const currentStream = updateStream(rerender, stream, { isActive: false, responseKey: InputKey.ACTION }, emit);

    const input = getByPlaceholderText(ACTION_INPUT_PLACEHOLDER);
    fireEvent.changeText(input, 'test response');
    fireEvent.press(getByText(ACTION_BUTTON));

    await waitFor(() => {
      expect(queryByTestId('activity-indicator')).toBeTruthy();
    });

    updateStream(rerender, currentStream, { values: [], isActive: true }, emit);
    
    await waitFor(() => {
      expect(queryByTestId('activity-indicator')).toBeFalsy();
    });
  });

  it('updates controls based on latest stream\' response key', () => {
    const {emit, stream, harness: { queryByText, queryByPlaceholderText, getByTestId, rerender }} = setup({ values: ['message1'] });
    updateStream(rerender, stream, { isActive: false, responseKey: InputKey.ACTION }, emit);

    expect(queryByText(ACTION_BUTTON)).toBeTruthy();
    expect(queryByPlaceholderText(ACTION_INPUT_PLACEHOLDER)).toBeTruthy();
    
    updateStream(rerender, stream, { isActive: false, responseKey: InputKey.NEW_SCENE }, emit);

    expect(queryByText(START_SCENE_BUTTON)).toBeTruthy();
    expect(getByTestId('camera')).toBeTruthy();

  });

  it('routes to goodbye page on exit event', () => {
    const spy = jest.spyOn(require('@/hooks/useSocketEventListeners'), 'default');
    const { mockRouter } = setup();

    expect(spy).toHaveBeenCalledWith([
      {event: 'exit', callback: expect.any(Function)}
    ]);
    const socketEventListeners = spy.mock.calls[0][0] as SocketEventListener<any>[];
    const exitCallback = (socketEventListeners[0]).callback as Function;
    exitCallback();

    expect(mockRouter.push).toHaveBeenCalledWith('/goodbye-screen');

    spy.mockRestore();
  });
});

function updateStream(rerender: (component: ReactElement) => void, oldStream: Stream, streamMods: Partial<Stream>, emit: () => void): Stream {
  const stream = {...oldStream, ...streamMods};
  if (!deepEqual(oldStream, stream)) {
    rerender(
      <IOInterfaceContext.Provider value={{stream, emit}}>
        <HeroLogScreen />
      </IOInterfaceContext.Provider>
    );
  }
  return stream;
}