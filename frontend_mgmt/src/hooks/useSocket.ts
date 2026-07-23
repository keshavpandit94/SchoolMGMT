import { useEffect, useRef } from 'react';
import { useSocketContext } from '../context/SocketContext';

export const useSocket = (eventHandlers: { [eventName: string]: (data: any) => void }) => {
  const { socket, emit } = useSocketContext();
  const handlersRef = useRef(eventHandlers);
  handlersRef.current = eventHandlers;

  useEffect(() => {
    if (!socket) return;

    // Attach event listeners to persistent socket
    const activeListeners: { eventName: string; handler: (data: any) => void }[] = [];

    Object.keys(handlersRef.current).forEach((eventName) => {
      const handler = (data: any) => handlersRef.current[eventName]?.(data);
      socket.on(eventName, handler);
      activeListeners.push({ eventName, handler });
    });

    // Clean up event listeners on page change WITHOUT disconnecting the socket
    return () => {
      activeListeners.forEach(({ eventName, handler }) => {
        socket.off(eventName, handler);
      });
    };
  }, [socket]);

  return { socket, emit };
};
