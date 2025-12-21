import api from "../api";
import { BASE_API_URL } from "../constants";

export interface NotificationData {
	id: number;
	message: string;
	notification_type: string;
	channel: string;
	read_status: boolean;
	created_at: string;
	priority?: string;
	action_url?: string;
}

export const notificationService = {
	// Pobierz powiadomienia przez HTTP API
	getNotifications: async (
		channel?: string,
		readStatus?: boolean
	): Promise<NotificationData[]> => {
		try {
			const params: Record<string, any> = {};
			if (channel) params.channel = channel;
			if (readStatus !== undefined) params.read_status = readStatus;

			const response = await api.get(`${BASE_API_URL}/notifications/`, {
				params,
			});
			return Array.isArray(response.data) ? response.data : [];
		} catch (error) {
			console.error("❌ Error fetching notifications:", error);
			return [];
		}
	},

	// Oznacz powiadomienie jako przeczytane
	markAsRead: async (notificationId: number): Promise<void> => {
		try {
			await api.post(
				`${BASE_API_URL}/notifications/${notificationId}/mark_as_read/`
			);
		} catch (error) {
			console.error("❌ Error marking notification as read:", error);
			throw error;
		}
	},

	// Oznacz wszystkie powiadomienia jako przeczytane
	markAllAsRead: async (channel?: string): Promise<void> => {
		try {
			const data: Record<string, any> = {};
			if (channel) data.channel = channel;

			await api.post(`${BASE_API_URL}/notifications/mark_all_as_read/`, data);
		} catch (error) {
			console.error("❌ Error marking all notifications as read:", error);
			throw error;
		}
	},
};
