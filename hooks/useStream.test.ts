jest.mock('@/utils/network', () => {
  const SocketMock = require('socket.io-mock');
  return new SocketMock();
});

import { renderHook, act } from '@testing-library/react';
import useStream from './useStream';
import typedSocket from '@/utils/network';

// Note: The SocketMock library is very useful but is not TS compatible
const socket = typedSocket as any;

describe('useStream', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should initialize with empty values and inactive state', () => {
    const { result } = renderHook(() => useStream());

    expect(result.current.values).toEqual([]);
    expect(result.current.isActive).toBe(false);
  });

  it('should activate and add chunks on "output" event', () => {
    const { result } = renderHook(() => useStream());

    const chunk = { order: 0, content: 'test content' };

    act(() => {
      socket.socketClient.emit('output', chunk);
    });

    expect(result.current.values).toEqual(['test content']);
    expect(result.current.isActive).toBe(true);
  });

  it('should deactivate on "endOutput" event if all chunks were received', () => {
    const { result } = renderHook(() => useStream());

    const chunk0 = { order: 0, content: 'first content' };
    const chunk1 = { order: 1, content: 'second content' };

    act(() => {
      socket.socketClient.emit('output', chunk0);
      socket.socketClient.emit('output', chunk1);
      socket.socketClient.emit('endOutput', 2);
    });

    expect(result.current.isActive).toBe(false);
  });

  it('should remain active after "endOutput" event if not all chunks were received', () => {
    const { result } = renderHook(() => useStream());

    const chunk0 = { order: 0, content: 'first content' };
    const chunk1 =  { order: 1, content: 'second content' };

    act(() => {
      // chunks[0] was not received
      socket.socketClient.emit('output', chunk1);
      socket.socketClient.emit('endOutput', 2);
    });

    expect(result.current.isActive).toBe(true);
  });

  it('should deactivate on chunk receipt if count matches capacity', () => {
    const { result } = renderHook(() => useStream());

    const chunk0 = { order: 0, content: 'first content' };
    const chunk1 = { order: 1, content: 'second content' };

    act(() => {
      socket.socketClient.emit('output', chunk1);
      socket.socketClient.emit('endOutput', 2);
      socket.socketClient.emit('output', chunk0);
    });

    expect(result.current.isActive).toBe(false);
  });

  it('only returns consecutive chunks starting at 0', () => {
    const { result } = renderHook(() => useStream());

    const chunk0 = { order: 0, content: 'first content' };
    const chunk1 = { order: 1, content: 'second content' };
    const chunk3 = { order: 3, content: 'fourth content (this chunk was received early)' };

    act(() => {
      socket.socketClient.emit('output', chunk0);
      socket.socketClient.emit('output', chunk1);
      socket.socketClient.emit('output', chunk3);
    });

    expect(result.current.values).toEqual(['first content', 'second content']);
  });

  it('should reactivate when a later stream starts', () => {
    const { result } = renderHook(() => useStream());

    const firstStreamChunk = { order: 0, content: 'first stream content (all one chunk)' };

    act(() => {
      socket.socketClient.emit('output', firstStreamChunk);
      socket.socketClient.emit('endOutput', 1);
    });

    expect(result.current.isActive).toBe(false);

    const secondStreamChunk = { order: 0, content: 'second stream content (all one chunk)' };

    act(() => {
      socket.socketClient.emit('output', secondStreamChunk);
    });

    expect(result.current.isActive).toBe(true);
  });

  it('should reset values when a later stream starts', () => {
    const { result } = renderHook(() => useStream());

    const firstStreamChunk = { order: 0, content: 'first' };

    act(() => {
      socket.socketClient.emit('output', firstStreamChunk);
      socket.socketClient.emit('endOutput', 1);
    });

    expect(result.current.values).toEqual(['first']);

    const secondStreamChunk = { order: 0, content: 'second' };

    act(() => {
      socket.socketClient.emit('output', secondStreamChunk);
    });

    expect(result.current.values).toEqual(['second']);
  });
});
