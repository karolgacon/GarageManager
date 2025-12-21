import { useEffect, useState, useCallback } from "react";
import useWebSocket, { ReadyState } from "react-use-websocket";
import {
	notificationService,
	type NotificationData,
} from "../api/NotificationAPIEndpoint";

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

const WS_BASE_URL =
	import.meta.env.VITE_WS_URL ||
	import.meta.env.VITE_API_URL?.replace(/^http/, "ws").replace("/api/v1", "") ||
	"ws://localhost:8000";

export const useNotifications = (): UseNotificationsReturn => {
	const [notifications, setNotifications] = useState<NotificationData[]>([]);
	const [unreadCount, setUnreadCount] = useState(0);
	const [lastHttpFetch, setLastHttpFetch] = useState<number>(0);

	// Get auth token and user ID
	const getAuthInfo = useCallback(() => {
		const token = localStorage.getItem("token");
		const userIdStr =
			localStorage.getItem("user_id") || localStorage.getItem("userID");

		console.log("🔔 Auth check - token:", !!token, "userId:", userIdStr);

		if (!token || !userIdStr) {
			return null;
		}

		try {
			const userId = parseInt(userIdStr);
			if (isNaN(userId)) {
				console.log("🔔 Auth check - invalid userId:", userIdStr);
				return null;
			}

			return {
				token,
				userId,
			};
		} catch {
			return null;
		}
	}, []);

	// HTTP API fallback - fetch notifications when WebSocket is not connected
	const fetchNotificationsHttp = useCallback(async () => {
		const now = Date.now();
		// Nie ładuj częściej niż co 10 sekund (dla debugowania)
		if (now - lastHttpFetch < 10000) {
			console.log(
				"🔔 HTTP: Skipping fetch - too recent, last fetch:",
				new Date(lastHttpFetch)
			);
			return;
		}

		try {
			console.log("🔔 HTTP: Fetching notifications...");
			const allNotifications = await notificationService.getNotifications();
			const unreadNotifications = allNotifications.filter(
				(n) => !n.read_status
			);

			console.log(
				"🔔 HTTP Fallback: Loaded",
				allNotifications.length,
				"notifications,",
				unreadNotifications.length,
				"unread"
			);
			setNotifications(allNotifications.slice(0, 50)); // Limit to 50 most recent
			setUnreadCount(unreadNotifications.length);
			setLastHttpFetch(now);
		} catch (error) {
			console.error("🔔 HTTP Fallback: Error fetching notifications:", error);
		}
	}, [lastHttpFetch]);

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
		async (notificationId: number) => {
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
			} else {
				// HTTP API fallback
				try {
					await notificationService.markAsRead(notificationId);

					// Update local state
					setNotifications((prev) =>
						prev.map((n) =>
							n.id === notificationId ? { ...n, read_status: true } : n
						)
					);
					setUnreadCount((prev) => Math.max(0, prev - 1));
				} catch (error) {
					console.error("❌ Failed to mark notification as read:", error);
				}
			}
		},
		[sendJsonMessage, readyState]
	);

	// Mark all notifications as read
	const markAllAsRead = useCallback(async () => {
		if (readyState === ReadyState.OPEN) {
			sendJsonMessage({
				type: "mark_all_as_read",
			});

			// Optimistically update local state
			setNotifications((prev) =>
				prev.map((n) => ({ ...n, read_status: true }))
			);
			setUnreadCount(0);
		} else {
			// HTTP API fallback
			try {
				await notificationService.markAllAsRead();

				// Update local state
				setNotifications((prev) =>
					prev.map((n) => ({ ...n, read_status: true }))
				);
				setUnreadCount(0);
			} catch (error) {
				console.error("❌ Failed to mark all notifications as read:", error);
			}
		}
	}, [sendJsonMessage, readyState]);

	// Refresh notifications (request fresh data from server)
	const refreshNotifications = useCallback(async () => {
		if (readyState === ReadyState.OPEN) {
			sendJsonMessage({
				type: "get_unread_notifications",
			});
		} else {
			// HTTP API fallback
			await fetchNotificationsHttp();
		}
	}, [sendJsonMessage, readyState, fetchNotificationsHttp]);

	// Auto-refresh notifications when connection is established
	useEffect(() => {
		if (readyState === ReadyState.OPEN) {
			refreshNotifications();
		}
	}, [readyState, refreshNotifications]);

	// Fallback: Load notifications via HTTP if WebSocket fails
	useEffect(() => {
		const authInfo = getAuthInfo();
		if (authInfo && readyState === ReadyState.CLOSED) {
			// Opóźnienie 2s przed użyciem HTTP fallback
			const timer = setTimeout(() => {
				if (readyState === ReadyState.CLOSED) {
					console.log("🔔 WebSocket not connected, using HTTP fallback");
					fetchNotificationsHttp();
				}
			}, 2000);

			return () => clearTimeout(timer);
		}
	}, [readyState, getAuthInfo, fetchNotificationsHttp]);

	// Initial load - zawsze załaduj powiadomienia przez HTTP przy starcie
	useEffect(() => {
		const authInfo = getAuthInfo();
		console.log("🔔 Initial load: checking auth info:", !!authInfo);
		if (authInfo) {
			console.log(
				"🔔 Initial notification load via HTTP for user:",
				authInfo.userId
			);
			fetchNotificationsHttp();
		}
	}, []); // Uruchom tylko raz przy mounted

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
