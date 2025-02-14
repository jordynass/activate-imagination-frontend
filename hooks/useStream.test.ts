import { renderHook, act, cleanup } from '@testing-library/react';
import useStream from './useStream';

jest.mock('@/hooks/useGameId', () => ({
  useGameId: () => 'game123',
}));

describe('useStream', () => {
  function setup() {
    const SocketMock = require('socket.io-mock');
    const socket = new SocketMock();
    const mockSocketFactory = jest.fn();
    mockSocketFactory.mockReturnValue(socket);
    const { result } = renderHook(() => useStream(mockSocketFactory));
    return { result, socket, mockSocketFactory };
  }

  it('should pass gameId to socket factory', () => {
    const { mockSocketFactory } = setup();

    expect(mockSocketFactory).toHaveBeenCalledWith('game123');
  });

  describe('stream', () => {
    it('should initialize with empty values and inactive state', () => {
      const { result } = setup();

      expect(result.current.stream.values).toEqual([]);
      expect(result.current.stream.isActive).toBe(false);
    });

    it('should activate and add chunks on "output" event', () => {
      const { socket, result } = setup();

      const chunk = { order: 0, content: 'test content' };

      act(() => {
        socket.socketClient.emit('output', chunk);
      });

      expect(result.current.stream.values).toEqual(['test content']);
      expect(result.current.stream.isActive).toBe(true);
    });

    it('should deactivate on "endOutput" event if all chunks were received', () => {
      const { socket, result } = setup();

      const chunk0 = { order: 0, content: 'first content' };
      const chunk1 = { order: 1, content: 'second content' };

      act(() => {
        socket.socketClient.emit('output', chunk0);
        socket.socketClient.emit('output', chunk1);
        socket.socketClient.emit('endOutput', 2);
      });

      expect(result.current.stream.isActive).toBe(false);
    });

    it('should remain active after "endOutput" event if not all chunks were received', () => {
      const { socket, result } = setup();

      const chunk1 =  { order: 1, content: 'second content' };

      act(() => {
        // chunks0 was not received
        socket.socketClient.emit('output', chunk1);
        socket.socketClient.emit('endOutput', 2);
      });

      expect(result.current.stream.isActive).toBe(true);
    });

    it('should deactivate on chunk receipt if count matches capacity', () => {
      const { socket, result } = setup();

      const chunk0 = { order: 0, content: 'first content' };
      const chunk1 = { order: 1, content: 'second content' };

      act(() => {
        socket.socketClient.emit('output', chunk1);
        socket.socketClient.emit('endOutput', 2);
        socket.socketClient.emit('output', chunk0);
      });

      expect(result.current.stream.isActive).toBe(false);
    });

    it('only returns consecutive chunks starting at 0', () => {
      const { socket, result } = setup();

      const chunk0 = { order: 0, content: 'first content' };
      const chunk1 = { order: 1, content: 'second content' };
      const chunk3 = { order: 3, content: 'fourth content (this chunk was received early)' };

      act(() => {
        socket.socketClient.emit('output', chunk0);
        socket.socketClient.emit('output', chunk1);
        socket.socketClient.emit('output', chunk3);
      });

      expect(result.current.stream.values).toEqual(['first content', 'second content']);
    });

    it('should reactivate when a later stream starts', () => {
      const { socket, result } = setup();

      const firstStreamChunk = { order: 0, content: 'first stream content (all one chunk)' };

      act(() => {
        socket.socketClient.emit('output', firstStreamChunk);
        socket.socketClient.emit('endOutput', 1);
      });

      expect(result.current.stream.isActive).toBe(false);

      const secondStreamChunk = { order: 0, content: 'second stream content (all one chunk)' };

      act(() => {
        socket.socketClient.emit('output', secondStreamChunk);
      });

      expect(result.current.stream.isActive).toBe(true);
    });

    it('should reset values when a later stream starts', () => {
      const { socket, result } = setup();

      const firstStreamChunk = { order: 0, content: 'first' };

      act(() => {
        socket.socketClient.emit('output', firstStreamChunk);
        socket.socketClient.emit('endOutput', 1);
      });

      expect(result.current.stream.values).toEqual(['first']);

      const secondStreamChunk = { order: 0, content: 'second' };

      act(() => {
        socket.socketClient.emit('output', secondStreamChunk);
      });

      expect(result.current.stream.values).toEqual(['second']);
    });
  });

  describe('emit', () => {
    it('should decorate payload with gameId', () => {
      const { socket, result } = setup();
      const emitSpy = jest.spyOn(socket, 'emit');

      act(() => {
        result.current.emit('testEvent', { data: 'testData' });
      });

      expect(emitSpy).toHaveBeenCalledWith('testEvent', { data: 'testData', gameId: 'game123' });

      emitSpy.mockRestore();
    });
  });
  


  describe('listenFor', () => {
    afterEach(() => {
      cleanup();
    });

    it('should listen for event with payload', () => {
      const { result, socket } = setup();
      const mockCallback = jest.fn();

      act(() => {
        result.current.listenFor('testEvent', mockCallback);
        socket.socketClient.emit('testEvent', { data: 'testData' });
      });

      expect(mockCallback.mock.calls[0][0]).toEqual({ data: 'testData' });
    });

    it('should clean up event listener on unmount', () => {
      const { result, socket } = setup();
      const mockCallback = jest.fn();

      act(() => {
        result.current.listenFor('testEvent', mockCallback);
      });

      cleanup();

      act(() => {
        socket.socketClient.emit('testEvent', { data: 'testData' });
      });

      expect(mockCallback).not.toHaveBeenCalled();
    });

    it('should handle multiple event listeners correctly', () => {
      const { result, socket } = setup();
      const mockCallback1 = jest.fn();
      const mockCallback2 = jest.fn();

      act(() => {
        result.current.listenFor('event1', mockCallback1);
        result.current.listenFor('event2', mockCallback2);
        socket.socketClient.emit('event1', { data: 'data1' });
        socket.socketClient.emit('event2', { data: 'data2' });
      });

      expect(mockCallback1.mock.calls[0][0]).toEqual({ data: 'data1' });
      expect(mockCallback2.mock.calls[0][0]).toEqual({ data: 'data2' });
    });
  });




});
