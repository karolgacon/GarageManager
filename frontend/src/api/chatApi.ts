import React from "react";
import axios, { AxiosResponse } from "axios";
import {
	Conversation,
	Message,
	ConversationCreateRequest,
	MessageCreateRequest,
	ConversationListResponse,
	MessageListResponse,
	UseChatApiReturn,
} from "../models/chat";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";
const CHAT_API_URL = `${API_BASE_URL}/api/v1/chat`;

// Create axios instance with auth interceptor
const createChatApiClient = () => {
	const client = axios.create({
		baseURL: CHAT_API_URL,
		headers: {
			"Content-Type": "application/json",
		},
	});

	// Add auth token to requests
	client.interceptors.request.use((config) => {
		const token = localStorage.getItem("token"); // Zmieniono z "authToken" na "token"
		if (token) {
			config.headers.Authorization = `Bearer ${token}`;
		}
		return config;
	});

	// Handle response errors
	client.interceptors.response.use(
		(response) => response,
		(error) => {
			if (error.response?.status === 401) {
				// Token expired or invalid
				localStorage.removeItem("authToken");
				window.location.href = "/login";
			}
			return Promise.reject(error);
		}
	);

	return client;
};

export class ChatApiClient {
	private client = createChatApiClient();

	// Conversations
	async getConversations(
		page = 1,
		pageSize = 20
	): Promise<ConversationListResponse> {
		const response: AxiosResponse<ConversationListResponse> =
			await this.client.get("/conversations/", {
				params: { page, page_size: pageSize },
			});
		return response.data;
	}

	async getConversation(uuid: string): Promise<Conversation> {
		const response: AxiosResponse<Conversation> = await this.client.get(
			`/conversations/${uuid}/`
		);
		return response.data;
	}

	async createConversation(
		data: ConversationCreateRequest
	): Promise<Conversation> {
		const response: AxiosResponse<Conversation> = await this.client.post(
			"/conversations/",
			data
		);
		return response.data;
	}

	async closeConversation(uuid: string): Promise<void> {
		await this.client.post(`/conversations/${uuid}/close/`);
	}

	async markConversationAsRead(
		uuid: string
	): Promise<{ marked_count: number }> {
		const response = await this.client.post(
			`/conversations/${uuid}/mark_read/`
		);
		return response.data;
	}

	async searchConversations(
		query: string,
		page = 1,
		pageSize = 20
	): Promise<ConversationListResponse> {
		const response: AxiosResponse<ConversationListResponse> =
			await this.client.get("/conversations/search/", {
				params: { q: query, page, page_size: pageSize },
			});
		return response.data;
	}

	async getUnreadCount(): Promise<{ unread_count: number }> {
		const response = await this.client.get("/conversations/unread_count/");
		return response.data;
	}

	// Messages
	async getMessages(
		conversationUuid: string,
		page = 1,
		pageSize = 50
	): Promise<MessageListResponse> {
		const response: AxiosResponse<MessageListResponse> = await this.client.get(
			`/conversations/${conversationUuid}/messages/`,
			{ params: { page, page_size: pageSize } }
		);
		return response.data;
	}

	async sendMessage(
		conversationUuid: string,
		data: MessageCreateRequest
	): Promise<Message> {
		const formData = new FormData();
		formData.append("content", data.content);
		if (data.message_type) {
			formData.append("message_type", data.message_type);
		}
		if (data.attachment) {
			formData.append("attachment", data.attachment);
		}
		if (data.quote_data) {
			formData.append("quote_data", JSON.stringify(data.quote_data));
		}

		const response: AxiosResponse<Message> = await this.client.post(
			`/conversations/${conversationUuid}/messages/`,
			formData,
			{
				headers: {
					"Content-Type": "multipart/form-data",
				},
			}
		);
		return response.data;
	}

	async getMessageHistory(
		conversationUuid: string,
		dateFrom?: string,
		dateTo?: string,
		messageType?: string,
		page = 1,
		pageSize = 50
	): Promise<MessageListResponse> {
		const params: any = { page, page_size: pageSize };
		if (dateFrom) params.date_from = dateFrom;
		if (dateTo) params.date_to = dateTo;
		if (messageType) params.type = messageType;

		const response: AxiosResponse<MessageListResponse> = await this.client.get(
			`/conversations/${conversationUuid}/messages/history/`,
			{ params }
		);
		return response.data;
	}
}

// Create singleton instance
export const chatApiClient = new ChatApiClient();

// Custom hook for chat API
export const useChatApi = (): UseChatApiReturn => {
	const [conversations, setConversations] = React.useState<Conversation[]>([]);
	const [messages, setMessages] = React.useState<Message[]>([]);
	const [isLoading, setIsLoading] = React.useState(false);
	const [error, setError] = React.useState<string | null>(null);

	const fetchConversations = async () => {
		try {
			setIsLoading(true);
			setError(null);
			const response = await chatApiClient.getConversations();
			setConversations(response.results);
		} catch (err) {
			setError(
				err instanceof Error ? err.message : "Failed to fetch conversations"
			);
		} finally {
			setIsLoading(false);
		}
	};

	const fetchMessages = async (conversationUuid: string) => {
		try {
			setIsLoading(true);
			setError(null);
			const response = await chatApiClient.getMessages(conversationUuid);
			setMessages(response.results.reverse()); // Show newest at bottom
		} catch (err) {
			setError(err instanceof Error ? err.message : "Failed to fetch messages");
		} finally {
			setIsLoading(false);
		}
	};

	const createConversation = async (
		data: ConversationCreateRequest
	): Promise<Conversation> => {
		try {
			setError(null);
			const conversation = await chatApiClient.createConversation(data);
			setConversations((prev) => [conversation, ...prev]);
			return conversation;
		} catch (err) {
			const errorMessage =
				err instanceof Error ? err.message : "Failed to create conversation";
			setError(errorMessage);
			throw new Error(errorMessage);
		}
	};

	const sendMessage = async (
		conversationUuid: string,
		data: MessageCreateRequest
	): Promise<Message> => {
		try {
			setError(null);
			const message = await chatApiClient.sendMessage(conversationUuid, data);
			setMessages((prev) => [...prev, message]);
			return message;
		} catch (err) {
			const errorMessage =
				err instanceof Error ? err.message : "Failed to send message";
			setError(errorMessage);
			throw new Error(errorMessage);
		}
	};

	const markAsRead = async (conversationUuid: string): Promise<void> => {
		try {
			await chatApiClient.markConversationAsRead(conversationUuid);
			// Update conversation unread count
			setConversations((prev) =>
				prev.map((conv) =>
					conv.uuid === conversationUuid ? { ...conv, unread_count: 0 } : conv
				)
			);
		} catch (err) {
			console.error("Failed to mark as read:", err);
		}
	};

	const searchConversations = async (
		query: string
	): Promise<Conversation[]> => {
		try {
			setError(null);
			const response = await chatApiClient.searchConversations(query);
			return response.results;
		} catch (err) {
			setError(
				err instanceof Error ? err.message : "Failed to search conversations"
			);
			return [];
		}
	};

	return {
		conversations,
		messages,
		isLoading,
		error,
		fetchConversations,
		fetchMessages,
		createConversation,
		sendMessage,
		markAsRead,
		searchConversations,
	};
};

export default chatApiClient;
