// Chat types
export interface User {
	id: number;
	username: string;
	email: string;
	first_name?: string;
	last_name?: string;
	role: "client" | "mechanic" | "admin" | "owner";
}

export interface Workshop {
	id: number;
	name: string;
	contact_email?: string;
	contact_phone?: string;
	location?: string;
}

export interface Appointment {
	id: number;
	client: number;
	workshop: number;
	scheduled_date: string;
	status: string;
	description?: string;
}

export interface Conversation {
	uuid: string;
	client: number;
	client_name: string;
	mechanic: number;
	mechanic_name: string;
	workshop: number;
	workshop_name: string;
	subject: string;
	status:
		| "active"
		| "waiting_client"
		| "waiting_mechanic"
		| "resolved"
		| "closed";
	priority: "low" | "normal" | "high" | "urgent";
	appointment?: number;
	created_at: string;
	last_message_at: string;
	closed_at?: string;
	unread_count: number;
	conversation_type?: string;
	participants: ConversationParticipant[];
	last_message?: {
		id: number;
		content: string;
		sender_name: string;
		created_at: string;
		message_type: string;
	};
}

export interface Message {
	id: number;
	uuid: string;
	conversation: string;
	sender: number;
	sender_name: string;
	sender_username: string;
	sender_type?: string;
	content: string;
	message_type: "text" | "image" | "file" | "system" | "quote";
	attachment?: string;
	is_read: boolean;
	read_at?: string;
	status: "sent" | "delivered" | "read";
	created_at: string;
	edited_at?: string;
	quote_data?: any;
}

export interface ConversationParticipant {
	id: number;
	user: number;
	user_name: string;
	user_username: string;
	joined_at: string;
	last_seen_at?: string;
	is_typing: boolean;
	notifications_enabled: boolean;
}

// WebSocket message types
export interface WebSocketMessage {
	type:
		| "chat_message"
		| "typing_status"
		| "mark_read"
		| "ping"
		| "error"
		| "connection_established"
		| "messages_marked_read"
		| "user_joined"
		| "user_left"
		| "send_message"
		| "message"
		| "conversation_update"
		| "notification"
		| "connection_info";
	content?: string;
	message_type?: string;
	quote_data?: any;
	is_typing?: boolean;
	conversation_uuid?: string;
	message?: string;
	count?: number;
	user_id?: number;
	user_name?: string;
	data?: any;
}

export interface MessageReceived {
	message: Message;
	conversation_uuid: string;
}

export interface ConversationUpdate {
	conversation_uuid: string;
	action: "updated" | "closed" | "participant_added" | "participant_removed";
	data?: any;
}

export interface MessageStatusUpdate {
	message_uuid: string;
	conversation_uuid: string;
	status: "sent" | "delivered" | "read";
	timestamp: string;
}

export interface TypingStatusMessage {
	conversation_uuid: string;
	user_id: number;
	user_name?: string;
	is_typing: boolean;
	timestamp: string;
}

export interface NotificationMessage {
	id: string;
	type: "new_message" | "new_conversation" | "mention" | "system";
	title: string;
	message: string;
	conversation_uuid?: string;
	user_id?: number;
	timestamp: string;
	data?: any;
}

export interface ConnectionInfo {
	connected: boolean;
	conversation_uuid: string | null;
	user_id: number | null;
}

// API request/response types
export interface ConversationCreateRequest {
	vehicle_id: number;
	subject: string;
	priority?: "low" | "normal" | "high" | "urgent";
	appointment?: number;
}

export interface MessageCreateRequest {
	content: string;
	message_type?: "text" | "image" | "file" | "quote";
	attachment?: File;
	quote_data?: any;
}

export interface ConversationListResponse {
	count: number;
	next?: string;
	previous?: string;
	results: Conversation[];
}

export interface MessageListResponse {
	count: number;
	next?: string;
	previous?: string;
	results: Message[];
}

// Chat context types
export interface ChatContextType {
	conversations: Conversation[];
	activeConversation?: Conversation;
	messages: Message[];
	isLoading: boolean;
	isConnected: boolean;
	typingUsers: User[];
	unreadCount: number;

	// Actions
	setActiveConversation: (conversation: Conversation | undefined) => void;
	sendMessage: (content: string, messageType?: string, quoteData?: any) => void;
	markAsRead: () => void;
	startTyping: () => void;
	stopTyping: () => void;
	createConversation: (
		data: ConversationCreateRequest
	) => Promise<Conversation>;
	loadMoreMessages: () => void;
	refreshConversations: () => void;
}

// Hook types
export interface UseWebSocketReturn {
	sendMessage: (message: WebSocketMessage) => void;
	lastMessage: WebSocketMessage | null;
	readyState: number;
	isConnected: boolean;
}

export interface UseChatApiReturn {
	conversations: Conversation[];
	messages: Message[];
	isLoading: boolean;
	error: string | null;

	fetchConversations: () => Promise<void>;
	fetchMessages: (conversationUuid: string) => Promise<void>;
	createConversation: (
		data: ConversationCreateRequest
	) => Promise<Conversation>;
	sendMessage: (
		conversationUuid: string,
		data: MessageCreateRequest
	) => Promise<Message>;
	markAsRead: (conversationUuid: string) => Promise<void>;
	searchConversations: (query: string) => Promise<Conversation[]>;
	updateConversationStatus: (
		conversationUuid: string,
		status: string
	) => Promise<void>;
}

// Component props types
export interface ChatLayoutProps {
	children: React.ReactNode;
}

export interface ConversationListProps {
	conversations: Conversation[];
	activeConversation?: Conversation;
	onConversationSelect: (conversation: Conversation) => void;
	onConversationCreate: () => void;
	isLoading?: boolean;
}

export interface MessageListProps {
	messages: Message[];
	isLoading?: boolean;
	onLoadMore?: () => void;
	hasMore?: boolean;
}

export interface MessageInputProps {
	onSendMessage: (
		content: string,
		messageType?: string,
		quoteData?: any
	) => void;
	disabled?: boolean;
	placeholder?: string;
}

export interface TypingIndicatorProps {
	typingUsers: User[];
}

export interface MessageBubbleProps {
	message: Message;
	isOwn: boolean;
	showAvatar?: boolean;
	showTimestamp?: boolean;
}

export interface ConversationHeaderProps {
	conversation: Conversation;
	onClose?: () => void;
	onUserInfo?: () => void;
}

export interface EmojiPickerProps {
	onEmojiSelect: (emoji: string) => void;
	isOpen: boolean;
	onClose: () => void;
}

export interface FileUploadProps {
	onFileSelect: (file: File) => void;
	accept?: string;
	maxSize?: number;
}

export interface QuoteMessageProps {
	message: Message;
	onQuote: (message: Message) => void;
}

export interface NewConversationModalProps {
	isOpen: boolean;
	onClose: () => void;
	onSubmit: (data: ConversationCreateRequest) => void;
	mechanics: User[];
	workshops: Workshop[];
}

export interface ChatSearchProps {
	onSearch: (query: string) => void;
	placeholder?: string;
	isLoading?: boolean;
}

export interface OnlineStatusProps {
	userId: number;
	lastSeen?: string;
}

export interface NotificationBadgeProps {
	count: number;
	max?: number;
}
