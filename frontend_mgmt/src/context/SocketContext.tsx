import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SOCKET_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  emit: (eventName: string, data?: any) => void;
}

const SocketContext = createContext<SocketContextType>({
  socket: null,
  isConnected: false,
  emit: () => {},
});

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { token } = useAuth();
  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!token) {
      if (socketRef.current) {
        console.log('User logged out — disconnecting Socket.io');
        socketRef.current.disconnect();
        socketRef.current = null;
        setIsConnected(false);
      }
      return;
    }

    // Reuse existing socket connection if already active
    if (socketRef.current && socketRef.current.connected) {
      return;
    }

    // Create persistent WebSocket connection across all pages
    const socket = io(SOCKET_URL, {
      withCredentials: true,
      auth: { token },
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
    });

    socket.on('connect', () => {
      console.log('🟢 Socket.io persistent connection active:', socket.id);
      setIsConnected(true);
    });

    socket.on('disconnect', (reason) => {
      console.log('🔴 Socket.io disconnected:', reason);
      setIsConnected(false);
    });

    socket.on('connect_error', (error) => {
      console.warn('⚠️ Socket.io connection error:', error.message);
    });

    socketRef.current = socket;

    return () => {
      // Don't disconnect on minor component re-renders — only clean up when app unmounts
    };
  }, [token]);

  const emit = (eventName: string, data?: any) => {
    socketRef.current?.emit(eventName, data);
  };

  return (
    <SocketContext.Provider value={{ socket: socketRef.current, isConnected, emit }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocketContext = () => useContext(SocketContext);
