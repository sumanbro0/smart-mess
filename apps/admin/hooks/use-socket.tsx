"use client";
import { useEffect, useRef, useCallback, useState } from "react";
import { io, Socket } from "socket.io-client";

interface UseSocketConnectionOptions {
  url?: string;
  roomType: "admin_table" | "admin_order";
  roomId: string | number | undefined;
  autoConnect?: boolean;
}

export function useSocketConnection({
  url = "http://localhost:8000",
  roomType,
  roomId,
  autoConnect = true,
}: UseSocketConnectionOptions): {
  connect: () => void;
  disconnect: () => void;
  emit: (eventName: string, data?: any) => void;
  isConnected: boolean;
  socket: Socket | null;
} {
  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const currentRoomRef = useRef<{ roomType: string; roomId: string } | null>(
    null
  );

  const joinRoom = useCallback(
    (socket: Socket, roomType: string, roomId: string) => {
      console.log(`Joining room: ${roomType}:${roomId}`);
      socket.emit("join_room", {
        room_type: roomType,
        room_id: roomId.toString(),
      });
      currentRoomRef.current = { roomType, roomId };
    },
    []
  );

  const connect = useCallback(() => {
    // Don't connect if already connected or no roomId
    if (socketRef.current?.connected || !roomId) return;

    // Clear any pending reconnection
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }

    console.log(`Connecting to socket for ${roomType}:${roomId}`);

    socketRef.current = io("http://127.0.0.1:8000", {
      path: "/socket.io/",
      transports: ["websocket", "polling"],
      autoConnect: false, // We'll manage connection manually
      reconnection: true, // Enable auto-reconnection
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      timeout: 10000,
    });

    const socket = socketRef.current;

    socket.on("connect", () => {
      console.log(`Socket connected for ${roomType}:${roomId}`);
      setIsConnected(true);

      // Join the room
      if (roomId) {
        joinRoom(socket, roomType, roomId.toString());
      }
    });

    socket.on("disconnect", (reason) => {
      console.log("Socket disconnected:", reason);
      setIsConnected(false);
      currentRoomRef.current = null;

      // Auto-reconnect for certain disconnect reasons
      if (reason === "io server disconnect" || reason === "transport close") {
        console.log("Attempting to reconnect...");
        reconnectTimeoutRef.current = setTimeout(() => {
          if (roomId && autoConnect) {
            connect();
          }
        }, 2000);
      }
    });

    socket.on("reconnect", (attemptNumber) => {
      console.log(`Reconnected after ${attemptNumber} attempts`);
      setIsConnected(true);

      // Rejoin room after reconnection
      if (roomId) {
        joinRoom(socket, roomType, roomId.toString());
      }
    });

    socket.on("reconnect_error", (error) => {
      console.error("Reconnection failed:", error);
    });

    socket.on("connect_error", (error) => {
      console.error("Connection error:", error);
      setIsConnected(false);
    });

    // Connect the socket
    socket.connect();
  }, [roomType, roomId, autoConnect, joinRoom]);

  const disconnect = useCallback(() => {
    console.log("Manually disconnecting socket");

    // Clear any pending reconnection
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }

    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
      setIsConnected(false);
      currentRoomRef.current = null;
    }
  }, []);

  const emit = useCallback((eventName: string, data?: any) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit(eventName, data);
    } else {
      console.warn("Cannot emit: socket not connected");
    }
  }, []);

  // Handle initial connection
  useEffect(() => {
    if (autoConnect && roomId) {
      connect();
    }

    return () => {
      // Cleanup on unmount
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      disconnect();
    };
  }, []); // Only run on mount/unmount

  // Handle room changes (disconnect and reconnect with new room)
  useEffect(() => {
    const currentRoom = currentRoomRef.current;
    const newRoom = roomId ? { roomType, roomId: roomId.toString() } : null;

    // Check if room actually changed
    const roomChanged =
      currentRoom?.roomType !== newRoom?.roomType ||
      currentRoom?.roomId !== newRoom?.roomId;

    if (roomChanged) {
      console.log("Room changed, reconnecting...", {
        from: currentRoom,
        to: newRoom,
      });

      if (socketRef.current?.connected) {
        disconnect();
      }

      if (newRoom && autoConnect) {
        // Small delay to ensure clean disconnect
        setTimeout(() => {
          connect();
        }, 100);
      }
    }
  }, [roomType, roomId, autoConnect, connect, disconnect]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, []);

  return {
    connect,
    disconnect,
    emit,
    isConnected,
    socket: socketRef.current,
  };
}

interface UseSocketListenerOptions<T> {
  socket: Socket | null;
  event: string;
  onData: (data: T) => void;
  enabled?: boolean;
}

export function useSocketListener<T>({
  socket,
  event,
  onData,
  enabled = true,
}: UseSocketListenerOptions<T>) {
  useEffect(() => {
    if (!socket || !enabled) return;

    socket.on(event, (data: T) => {
      console.log("Socket event", event, data);
      onData(data);
    });

    return () => {
      socket.off(event, onData);
    };
  }, [socket, event, onData, enabled]);
}
