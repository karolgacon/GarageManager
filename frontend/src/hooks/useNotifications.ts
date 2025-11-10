import { useEffect, useState, useCallback } from "react";
import useWebSocket, { ReadyState } from "react-use-websocket";

interface NotificationData {
	id: number;
	message: string;
	notification_type: string;
	channel: string;
	read_status: boolean;
	created_at: string;
	priority?: string;
	action_url?: string;
}

interface WebSocketNotification {
	type: string;
	notification?: NotificationData;
	notifications?: NotificationData[];
	count?: number;
}

interface UseNotificationsReturn {
	notifications: NotificationData[];
	unreadCount: number;
	isConnected: boolean;
	markAsRead: (notificationId: number) => void;
	markAllAsRead: () => void;
	refreshNotifications: () => void;
}

const WS_BASE_URL = import.meta.env.VITE_WS_URL || "ws://localhost:8000";

export const useNotifications = (): UseNotificationsReturn => {
	const [notifications, setNotifications] = useState<NotificationData[]>([]);
	const [unreadCount, setUnreadCount] = useState(0);

	// Get auth token and user ID
	const getAuthInfo = useCallback(() => {
		const token = localStorage.getItem("token");
		const userStr = localStorage.getItem("user");

		if (!token || !userStr) {
			return null;
		}

		try {
			const user = JSON.parse(userStr);
			return {
				token,
				userId: user.id,
			};
		} catch {
			return null;
		}
	}, []);

	// Build WebSocket URL for notifications
	const getWebSocketUrl = useCallback(() => {
		const authInfo = getAuthInfo();
		if (!authInfo) {
			throw new Error("No authentication info available");
		}

		return `${WS_BASE_URL}/ws/notifications/${
			authInfo.userId
		}/?token=${encodeURIComponent(authInfo.token)}`;
	}, [getAuthInfo]);

	// Check if user is authenticated
	const isAuthenticated = useCallback(() => {
		return getAuthInfo() !== null;
	}, [getAuthInfo]);

	// WebSocket connection for general notifications
	const { sendJsonMessage, lastJsonMessage, readyState } = useWebSocket(
		isAuthenticated() ? getWebSocketUrl : null,
		{
			onOpen: () => {
				console.log("🔔 Notifications WebSocket connected");
			},
			onClose: () => {
				console.log("🔔 Notifications WebSocket disconnected");
			},
			onError: (error) => {
				console.error("🔔 Notifications WebSocket error:", error);
			},
			shouldReconnect: () => isAuthenticated(),
			reconnectAttempts: 5,
			reconnectInterval: 3000,
		}
	);

	// Handle incoming notification messages
	useEffect(() => {
		if (lastJsonMessage) {
			const message = lastJsonMessage as WebSocketNotification;

			switch (message.type) {
				case "notification":
					if (message.notification) {
						console.log("🔔 New notification received:", message.notification);
						setNotifications((prev) => [
							message.notification!,
							...prev.slice(0, 99),
						]);
						setUnreadCount((prev) => prev + 1);
					}
					break;

				case "unread_notifications":
					if (message.notifications) {
						console.log(
							"🔔 Unread notifications loaded:",
							message.notifications.length
						);
						setNotifications(message.notifications);
						setUnreadCount(message.count || message.notifications.length);
					}
					break;

				case "unread_count":
					if (typeof message.count === "number") {
						console.log("🔔 Unread count updated:", message.count);
						setUnreadCount(message.count);
					}
					break;

				default:
					console.log("🔔 Unknown notification message type:", message.type);
			}
		}
	}, [lastJsonMessage]);

	// Mark notification as read
	const markAsRead = useCallback(
		(notificationId: number) => {
			if (readyState === ReadyState.OPEN) {
				sendJsonMessage({
					type: "mark_as_read",
					notification_id: notificationId,
				});

				// Optimistically update local state
				setNotifications((prev) =>
					prev.map((n) =>
						n.id === notificationId ? { ...n, read_status: true } : n
					)
				);
				setUnreadCount((prev) => Math.max(0, prev - 1));
			}
		},
		[sendJsonMessage, readyState]
	);

	// Mark all notifications as read
	const markAllAsRead = useCallback(() => {
		if (readyState === ReadyState.OPEN) {
			sendJsonMessage({
				type: "mark_all_as_read",
			});

			// Optimistically update local state
			setNotifications((prev) =>
				prev.map((n) => ({ ...n, read_status: true }))
			);
			setUnreadCount(0);
		}
	}, [sendJsonMessage, readyState]);

	// Refresh notifications (request fresh data from server)
	const refreshNotifications = useCallback(() => {
		if (readyState === ReadyState.OPEN) {
			sendJsonMessage({
				type: "get_unread_notifications",
			});
		}
	}, [sendJsonMessage, readyState]);

	// Auto-refresh notifications when connection is established
	useEffect(() => {
		if (readyState === ReadyState.OPEN) {
			refreshNotifications();
		}
	}, [readyState, refreshNotifications]);

	const isConnected = readyState === ReadyState.OPEN;

	return {
		notifications,
		unreadCount,
		isConnected,
		markAsRead,
		markAllAsRead,
		refreshNotifications,
	};
};

export default useNotifications;
