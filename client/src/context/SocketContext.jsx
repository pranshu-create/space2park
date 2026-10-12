import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';

const SocketContext = createContext(null);

export function SocketProvider({ children }) {
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);
  const [latestEvent, setLatestEvent] = useState(null);

  useEffect(() => {
    const s = io(window.location.origin, {
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 5
    });

    s.on('connect', () => {
      setConnected(true);
      console.log('📡 Connected to SPACE2PARK real-time telemetry stream');
    });

    s.on('disconnect', () => {
      setConnected(false);
    });

    // Universal Telemetry Listener
    const handleTelemetry = (name, data) => {
      setLatestEvent({ name, data, timestamp: Date.now() });
    };

    s.on('slot:locked', data => handleTelemetry('slot:locked', data));
    s.on('slot:released', data => handleTelemetry('slot:released', data));
    s.on('slot:booked', data => handleTelemetry('slot:booked', data));
    s.on('occupancy:update', data => handleTelemetry('occupancy:update', data));
    s.on('reallocation', data => handleTelemetry('reallocation', data));
    s.on('allocation:activated', data => handleTelemetry('allocation:activated', data));

    setSocket(s);

    return () => {
      s.disconnect();
    };
  }, []);

  return (
    <SocketContext.Provider value={{ socket, connected, latestEvent }}>
      {children}
    </SocketContext.Provider>
  );
}

export function useSocket() {
  return useContext(SocketContext);
}
