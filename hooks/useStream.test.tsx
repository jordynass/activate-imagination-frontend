import { renderHook, act, cleanup } from '@testing-library/react';
import { Provider as ReduxProvider } from 'react-redux';
import { store } from '@/store/store';
import useStream from './useStream';
import { type ReactNode } from 'react';
import { InputKey } from '@/api';

jest.mock('nanoid/non-secure', () => ({
  nanoid: () => 'game123',
}));
const wrapper = ({children}: {children: ReactNode}) => (
  <ReduxProvider store={store}>{children}</ReduxProvider>
);

describe('useStream', () => {
  function setup() {
    const SocketMock = require('socket.io-mock');
    const socket = new SocketMock();
    const mockSocketFactory = jest.fn();
    mockSocketFactory.mockReturnValue(socket);
    const { result } = renderHook(
      () => useStream(mockSocketFactory),
      { wrapper },
    );
    return { result, socket };
  }

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
        socket.socketClient.emit('endOutput', {length: 2, responseKey: InputKey.ACTION});
      });

      expect(result.current.stream.isActive).toBe(false);
    });

    it('should set response key on "endOutput" event', () => {
      const { socket, result } = setup();

      const chunk0 = { order: 0, content: 'first content' };
      const chunk1 = { order: 1, content: 'second content' };

      expect(result.current.stream.responseKey).toBe(null);

      act(() => {
        socket.socketClient.emit('output', chunk0);
        socket.socketClient.emit('endOutput', {length: 2, responseKey: InputKey.ACTION});
        socket.socketClient.emit('output', chunk1);
      });

      expect(result.current.stream.responseKey).toBe(InputKey.ACTION);
    });

    it('should remain active after "endOutput" event if not all chunks were received', () => {
      const { socket, result } = setup();

      const chunk1 =  { order: 1, content: 'second content' };

      act(() => {
        // chunks0 was not received
        socket.socketClient.emit('output', chunk1);
        socket.socketClient.emit('endOutput', {length: 2, responseKey: InputKey.ACTION});
      });

      expect(result.current.stream.isActive).toBe(true);
    });

    it('should deactivate on chunk receipt if count matches capacity', () => {
      const { socket, result } = setup();

      const chunk0 = { order: 0, content: 'first content' };
      const chunk1 = { order: 1, content: 'second content' };

      act(() => {
        socket.socketClient.emit('output', chunk1);
        socket.socketClient.emit('endOutput', {length: 2, responseKey: InputKey.ACTION});
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
        socket.socketClient.emit('endOutput', {length: 1, responseKey: InputKey.ACTION});
      });

      expect(result.current.stream.isActive).toBe(false);

      const secondStreamChunk = { order: 0, content: 'second stream content (all one chunk)' };

      act(() => {
        socket.socketClient.emit('output', secondStreamChunk);
      });

      expect(result.current.stream.isActive).toBe(true);
    });

    it('should reset values and responseKey when a later stream starts', () => {
      const { socket, result } = setup();

      const firstStreamChunk = { order: 0, content: 'first' };

      act(() => {
        socket.socketClient.emit('output', firstStreamChunk);
        socket.socketClient.emit('endOutput', {length: 1, responseKey: InputKey.ACTION});
      });

      expect(result.current.stream.values).toEqual(['first']);
      expect(result.current.stream.responseKey).toBe(InputKey.ACTION);

      const secondStreamChunk = { order: 0, content: 'second' };

      act(() => {
        socket.socketClient.emit('output', secondStreamChunk);
        socket.socketClient.emit('endOutput', {length: 1, responseKey: InputKey.NEW_SCENE});
      });

      expect(result.current.stream.values).toEqual(['second']);
      expect(result.current.stream.responseKey).toBe(InputKey.NEW_SCENE);
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
});
