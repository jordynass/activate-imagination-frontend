import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { useRouter } from 'expo-router';
import HeroLogScreen, { ACTION_INPUT_PLACEHOLDER } from '../hero-log-screen';
import IOInterfaceContext, { type Stream } from "@/contexts/IOInterfaceContext";
import { SocketEventListener } from '@/hooks/useSocketEventListeners';

jest.mock('expo-router', () => ({
  useRouter: jest.fn(),
}));

describe('HeroLogScreen', () => {
  function setup(stream: Stream) {
    const emit = jest.fn();
    const mockRouter = { push: jest.fn() };
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
    jest.clearAllMocks();
    const harness = render(
      <IOInterfaceContext.Provider value={{stream, emit}}>
        <HeroLogScreen />
      </IOInterfaceContext.Provider>);
    return { emit, harness, mockRouter }
  }

  it('renders correctly when stream is inactive', () => {
    const {harness: { getByText, queryByText }} = setup({ values: [], isActive: false });

    expect(getByText('')).toBeTruthy();
    expect(queryByText('Take Action')).toBeNull();
  });

  it('renders content when stream has values', () => {
    const {harness: { getByText }} = setup({ values: ['message1', 'message2'], isActive: false });

    expect(getByText('message1message2')).toBeTruthy();
  });

  it('renders input and button when stream is inactive and not waiting', () => {
    const {harness: { getByText, getByPlaceholderText }} = setup({ values: ['message1'], isActive: false });
    
    expect(getByText('Take Action')).toBeTruthy();
    expect(getByPlaceholderText(ACTION_INPUT_PLACEHOLDER)).toBeTruthy();
  });

  it('emits action on button press', () => {
    const {emit, harness: { getByText, getByPlaceholderText }} = setup({ values: ['message1'], isActive: false });

    const input = getByPlaceholderText(ACTION_INPUT_PLACEHOLDER);
    fireEvent.changeText(input, 'test response');
    fireEvent.press(getByText('Take Action'));

    expect(emit).toHaveBeenCalledWith('action', {text: 'test response'});
  });

  it('renders ActivityIndicator when isWaiting is true', async () => {
    const {harness: { getByText, getByPlaceholderText, queryByTestId }} = setup({ values: ['message1'], isActive: false });

    const input = getByPlaceholderText(ACTION_INPUT_PLACEHOLDER);
    fireEvent.changeText(input, 'test response');
    fireEvent.press(getByText('Take Action'));

    await waitFor(() => {
      expect(queryByTestId('activity-indicator')).toBeTruthy();
    });
  });
  
  it('hides ActivityIndicator when stream resumes', async () => {
    const {emit, harness: { getByText, getByPlaceholderText, queryByTestId, rerender }} = setup({ values: ['message1'], isActive: false });

    const input = getByPlaceholderText(ACTION_INPUT_PLACEHOLDER);
    fireEvent.changeText(input, 'test response');
    fireEvent.press(getByText('Take Action'));

    await waitFor(() => {
      expect(queryByTestId('activity-indicator')).toBeTruthy();
    });

    rerender(
      <IOInterfaceContext.Provider value={{emit, stream: { values: ['message2'], isActive: true }}}>
        <HeroLogScreen />
      </IOInterfaceContext.Provider>);
    
    await waitFor(() => {
      expect(queryByTestId('activity-indicator')).toBeFalsy();
    });
  });

  it('routes to goodbye page on exit event', () => {
    const spy = jest.spyOn(require('@/hooks/useSocketEventListeners'), 'default');
    const { mockRouter } = setup({ values: [], isActive: false });

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