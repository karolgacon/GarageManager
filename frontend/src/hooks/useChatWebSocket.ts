import { useEffect, useRef, useCallback, useState } from "react";
import useWebSocket, { ReadyState } from "react-use-websocket";
import {
	WebSocketMessage,
	MessageCreateRequest,
	ConversationUpdate,
	TypingStatusMessage,
	NotificationMessage,
	ConnectionInfo,
	Message,
} from "../models/chat";

interface UseChatWebSocketOptions {
	conversationUuid?: string;
	onMessageReceived?: (message: Message) => void;
	onConversationUpdate?: (update: ConversationUpdate) => void;
	onTypingStatus?: (status: TypingStatusMessage) => void;
	onNotification?: (notification: NotificationMessage) => void;
	autoConnect?: boolean;
}

interface UseChatWebSocketReturn {
	sendMessage: (message: MessageCreateRequest) => void;
	sendTypingStatus: (isTyping: boolean) => void;
	connectionState: ReadyState;
	isConnected: boolean;
	lastMessage: WebSocketMessage | null;
	connectionInfo: ConnectionInfo | null;
	reconnect: () => void;
	disconnect: () => void;
}

const WS_BASE_URL = import.meta.env.VITE_WS_URL || "ws://localhost:8000";

export const useChatWebSocket = (
	options: UseChatWebSocketOptions = {}
): UseChatWebSocketReturn => {
	const {
		conversationUuid,
		onMessageReceived,
		onConversationUpdate,
		onTypingStatus,
		onNotification,
		autoConnect = true,
	} = options;

	const [lastMessage, setLastMessage] = useState<WebSocketMessage | null>(null);
	const [connectionInfo, setConnectionInfo] = useState<ConnectionInfo | null>(
		null
	);
	const typingTimeoutRef = useRef<number>();

	// Get auth token
	const getAuthToken = useCallback(() => {
		return localStorage.getItem("token"); // Zmieniono z "authToken" na "token"
	}, []);

	// Build WebSocket URL
	const getWebSocketUrl = useCallback(() => {
		const token = getAuthToken();
		if (!token) {
			throw new Error("No auth token available");
		}

		let wsUrl = `${WS_BASE_URL}/ws/chat/`;
		if (conversationUuid) {
			wsUrl += `${conversationUuid}/`;
		} else {
			wsUrl += `notifications/`;
		}
		wsUrl += `?token=${encodeURIComponent(token)}`;

		return wsUrl;
	}, [conversationUuid]);

	// WebSocket connection
	const { sendJsonMessage, lastJsonMessage, readyState, getWebSocket } =
		useWebSocket(autoConnect ? getWebSocketUrl() : null, {
			onOpen: () => {
				console.log("WebSocket connected");
				setConnectionInfo({
					connected: true,
					conversation_uuid: conversationUuid || null,
					user_id: null, // Will be updated from server
				});
			},
			onClose: () => {
				console.log("WebSocket disconnected");
				setConnectionInfo(null);
			},
			onError: (event: Event) => {
				console.error("WebSocket error:", event);
			},
			shouldReconnect: (closeEvent: CloseEvent) => {
				// Reconnect unless it's an authentication error
				return closeEvent.code !== 4001;
			},
			reconnectAttempts: 5,
			reconnectInterval: 3000,
		});

	// Handle incoming messages
	useEffect(() => {
		if (lastJsonMessage) {
			const message = lastJsonMessage as WebSocketMessage;
			setLastMessage(message);

			switch (message.type) {
				case "message":
					if (onMessageReceived && message.data) {
						onMessageReceived(message.data as Message);
					}
					break;

				case "conversation_update":
					if (onConversationUpdate && message.data) {
						onConversationUpdate(message.data as ConversationUpdate);
					}
					break;

				case "typing_status":
					if (onTypingStatus && message.data) {
						onTypingStatus(message.data as TypingStatusMessage);
					}
					break;

				case "notification":
					if (onNotification && message.data) {
						onNotification(message.data as NotificationMessage);
					}
					break;

				case "connection_info":
					if (message.data) {
						setConnectionInfo(message.data as ConnectionInfo);
					}
					break;

				case "error":
					console.error("WebSocket error message:", message.data);
					break;

				default:
					console.warn("Unknown WebSocket message type:", message.type);
			}
		}
	}, [
		lastJsonMessage,
		onMessageReceived,
		onConversationUpdate,
		onTypingStatus,
		onNotification,
	]);

	// Send message
	const sendMessage = useCallback(
		(messageData: MessageCreateRequest) => {
			if (readyState === ReadyState.OPEN) {
				const wsMessage: WebSocketMessage = {
					type: "send_message",
					data: messageData,
				};
				sendJsonMessage(wsMessage);
			} else {
				console.error("WebSocket is not connected");
			}
		},
		[readyState, sendJsonMessage]
	);

	// Send typing status
	const sendTypingStatus = useCallback(
		(isTyping: boolean) => {
			if (readyState === ReadyState.OPEN && conversationUuid) {
				// Clear existing timeout
				if (typingTimeoutRef.current) {
					window.clearTimeout(typingTimeoutRef.current);
				}

				const wsMessage: WebSocketMessage = {
					type: "typing_status",
					data: {
						conversation_uuid: conversationUuid,
						is_typing: isTyping,
					},
				};
				sendJsonMessage(wsMessage);

				// Auto-stop typing after 3 seconds
				if (isTyping) {
					typingTimeoutRef.current = window.setTimeout(() => {
						const stopTypingMessage: WebSocketMessage = {
							type: "typing_status",
							data: {
								conversation_uuid: conversationUuid,
								is_typing: false,
							},
						};
						sendJsonMessage(stopTypingMessage);
					}, 3000);
				}
			}
		},
		[readyState, conversationUuid, sendJsonMessage]
	);

	// Manual reconnect
	const reconnect = useCallback(() => {
		const ws = getWebSocket();
		if (ws) {
			ws.close();
			// useWebSocket will automatically reconnect
		}
	}, [getWebSocket]);

	// Manual disconnect
	const disconnect = useCallback(() => {
		const ws = getWebSocket();
		if (ws) {
			ws.close(1000, "Manual disconnect");
		}
	}, [getWebSocket]);

	// Cleanup typing timeout on unmount
	useEffect(() => {
		return () => {
			if (typingTimeoutRef.current) {
				window.clearTimeout(typingTimeoutRef.current);
			}
		};
	}, []);

	const isConnected = readyState === ReadyState.OPEN;

	return {
		sendMessage,
		sendTypingStatus,
		connectionState: readyState,
		isConnected,
		lastMessage,
		connectionInfo,
		reconnect,
		disconnect,
	};
};

// Hook for global chat notifications (not tied to specific conversation)
export const useChatNotifications = () => {
	const [notifications, setNotifications] = useState<NotificationMessage[]>([]);

	// Check if user is authenticated
	const isAuthenticated = useCallback(() => {
		const token = localStorage.getItem("token"); // Zmieniono z "authToken" na "token"
		return !!token;
	}, []);

	const { isConnected } = useChatWebSocket({
		autoConnect: isAuthenticated(),
		onNotification: (notification) => {
			setNotifications((prev) => [notification, ...prev.slice(0, 99)]); // Keep last 100
		},
	});

	const clearNotifications = useCallback(() => {
		setNotifications([]);
	}, []);

	const removeNotification = useCallback((id: string) => {
		setNotifications((prev) => prev.filter((n) => n.id !== id));
	}, []);

	return {
		notifications,
		isConnected,
		clearNotifications,
		removeNotification,
	};
};

export default useChatWebSocket;
