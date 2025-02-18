import { renderHook, act, cleanup } from '@testing-library/react';
import useSocketEventListeners, { SocketEventListener } from './useSocketEventListeners';


describe('useSocketEventListeners', () => {
  function setup(socketEventListeners: SocketEventListener<any>[]) {
    const SocketMock = require('socket.io-mock');
    const socket = new SocketMock();
    const mockSocketFactory = jest.fn();
    mockSocketFactory.mockReturnValue(socket);
    renderHook(() => useSocketEventListeners(socketEventListeners, mockSocketFactory));
    return { socket };
  }

  afterEach(() => {
    cleanup();
  });

  it('should listen for event with payload', () => {
    const callback = jest.fn();
    const { socket } = setup([{ event: 'testEvent', callback }]);

    act(() => {
      socket.socketClient.emit('testEvent', { data: 'testData' });
    });

    expect(callback).toHaveBeenCalledTimes(1);
    expect(callback.mock.calls[0][0]).toEqual({ data: 'testData' });
  });

  it('should listen for event with empty payload', () => {
    const callback = jest.fn();
    const { socket } = setup([{ event: 'testEvent', callback }]);

    act(() => {
      socket.socketClient.emit('testEvent');
    });

    expect(callback).toHaveBeenCalledTimes(1);
    expect(callback.mock.calls[0][0]).toBeUndefined();
  });

  it('should handle multiple event listeners independently', () => {
    const callback1 = jest.fn();
    const callback2 = jest.fn();
    const { socket } = setup([
      { event: 'event1', callback: callback1 },
      { event: 'event2', callback: callback2 },
    ]);

    expect(callback1).not.toHaveBeenCalled();
    expect(callback2).not.toHaveBeenCalled();

    act(() => {
      socket.socketClient.emit('event1', { data: 'data1' });
    });

    expect(callback1).toHaveBeenCalledTimes(1);
    expect(callback1.mock.calls[0][0]).toEqual({ data: 'data1' });
    expect(callback2).not.toHaveBeenCalled();

    act(() => {
      socket.socketClient.emit('event2', { data: 'data2' });
    });
    
    expect(callback2).toHaveBeenCalledTimes(1);
    expect(callback2.mock.calls[0][0]).toEqual({ data: 'data2' });
  });

  it('should clean up event listeners on unmount', () => {
    const callback1 = jest.fn();
    const callback2 = jest.fn();
    const { socket } = setup([
      { event: 'event1', callback: callback1 },
      { event: 'event2', callback: callback2 },
    ]);

    cleanup();

    act(() => {
      socket.socketClient.emit('event1', { data: 'data1' });
      socket.socketClient.emit('event2', { data: 'data2' });
    });

    expect(callback1).not.toHaveBeenCalled();
    expect(callback2).not.toHaveBeenCalled();
  });
});
