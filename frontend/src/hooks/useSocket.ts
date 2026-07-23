import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export const useSocket = (eventHandlers: { [eventName: string]: (data: any) => void }) => {
  const socketRef = useRef<Socket | null>(null);
  // Store handlers in a ref so the effect never re-runs just because the
  // parent re-rendered with a new object literal (infinite reconnect loop fix)
  const handlersRef = useRef(eventHandlers);
  handlersRef.current = eventHandlers;

  useEffect(() => {
    const token = localStorage.getItem('token');

    // Connect to Socket.io server
    socketRef.current = io(SOCKET_URL, {
      withCredentials: true,
      auth: token ? { token } : {},
    });

    socketRef.current.on('connect', () => {
      console.log('Socket.io connected:', socketRef.current?.id);
    });

    // Attach stable proxy event listeners that delegate to the current handlers ref
    const wrappedHandlers: { [key: string]: (data: any) => void } = {};
    Object.keys(handlersRef.current).forEach((eventName) => {
      wrappedHandlers[eventName] = (data: any) => handlersRef.current[eventName]?.(data);
      socketRef.current?.on(eventName, wrappedHandlers[eventName]);
    });

    socketRef.current.on('connect_error', (error) => {
      console.error('Socket.io connection error:', error.message);
    });

    // Clean up connections on unmount
    return () => {
      if (socketRef.current) {
        Object.keys(wrappedHandlers).forEach((eventName) => {
          socketRef.current?.off(eventName, wrappedHandlers[eventName]);
        });
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Run only once on mount

  const emit = (eventName: string, data: any) => {
    socketRef.current?.emit(eventName, data);
  };

  return { socket: socketRef.current, emit };
};
