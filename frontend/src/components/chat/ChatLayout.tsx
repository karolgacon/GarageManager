import React, { useState, useEffect } from "react";
import {
	Box,
	Grid,
	Paper,
	Typography,
	AppBar,
	Toolbar,
	IconButton,
	Badge,
	Chip,
	Tooltip,
} from "@mui/material";
import {
	Chat as ChatIcon,
	Notifications as NotificationsIcon,
	Settings as SettingsIcon,
	Close as CloseIcon,
	Refresh as RefreshIcon,
} from "@mui/icons-material";
import { Conversation, Message } from "../../models/chat";
import { useChatApi } from "../../api/chatApi";
import {
	useChatWebSocket,
	useChatNotifications,
} from "../../hooks/useChatWebSocket";
import ConversationList from "./ConversationList";
import ChatWindow from "./ChatWindow";

interface ChatLayoutProps {
	onClose?: () => void;
	defaultConversationUuid?: string;
	isEmbedded?: boolean;
}

const ChatLayout: React.FC<ChatLayoutProps> = ({
	onClose,
	defaultConversationUuid,
	isEmbedded = false,
}) => {
	const [selectedConversation, setSelectedConversation] =
		useState<Conversation | null>(null);
	const [showNotifications, setShowNotifications] = useState(false);

	// API hooks
	const {
		conversations,
		messages,
		isLoading,
		error,
		fetchConversations,
		fetchMessages,
		createConversation,
		sendMessage,
		markAsRead,
	} = useChatApi();

	// WebSocket hooks
	const { notifications } = useChatNotifications();

	const {
		sendTypingStatus,
		isConnected: chatConnected,
		reconnect,
	} = useChatWebSocket({
		conversationUuid: selectedConversation?.uuid,
		onMessageReceived: (message: Message) => {
			// Add new message to the current conversation
			if (message.conversation === selectedConversation?.uuid) {
				fetchMessages(selectedConversation.uuid);
			}
			// Update conversation list to show new message
			fetchConversations();
		},
		onConversationUpdate: () => {
			fetchConversations();
		},
	});

	// Load conversations on mount
	useEffect(() => {
		fetchConversations();
	}, []);

	// Select default conversation
	useEffect(() => {
		if (defaultConversationUuid && conversations.length > 0) {
			const conversation = conversations.find(
				(c) => c.uuid === defaultConversationUuid
			);
			if (conversation) {
				setSelectedConversation(conversation);
			}
		}
	}, [defaultConversationUuid, conversations]);

	// Load messages when conversation is selected
	useEffect(() => {
		if (selectedConversation) {
			fetchMessages(selectedConversation.uuid);
			markAsRead(selectedConversation.uuid);
		}
	}, [selectedConversation]);

	const handleConversationSelect = (conversation: Conversation) => {
		setSelectedConversation(conversation);
	};

	const handleSendMessage = async (content: string, attachments?: File[]) => {
		if (!selectedConversation) return;

		try {
			await sendMessage(selectedConversation.uuid, {
				content,
				message_type: "text",
				attachment: attachments?.[0],
			});
		} catch (error) {
			console.error("Failed to send message:", error);
		}
	};

	const handleCreateConversation = async (
		mechanicId: number,
		workshopId: number,
		subject: string
	) => {
		try {
			const conversation = await createConversation({
				mechanic_id: mechanicId,
				workshop_id: workshopId,
				subject,
				priority: "normal",
			});
			setSelectedConversation(conversation);
			return conversation;
		} catch (error) {
			console.error("Failed to create conversation:", error);
			throw error;
		}
	};

	const handleTyping = (isTyping: boolean) => {
		sendTypingStatus(isTyping);
	};

	const ConnectionStatus = () => (
		<Box display="flex" alignItems="center" gap={1}>
			<Chip
				size="small"
				label={chatConnected ? "Połączono" : "Rozłączono"}
				color={chatConnected ? "success" : "error"}
				variant="outlined"
			/>
			{!chatConnected && (
				<Tooltip title="Ponów połączenie">
					<IconButton size="small" onClick={reconnect}>
						<RefreshIcon fontSize="small" />
					</IconButton>
				</Tooltip>
			)}
		</Box>
	);

	const Layout = ({ children }: { children: React.ReactNode }) => {
		if (isEmbedded) {
			return (
				<Paper
					sx={{ height: "100%", display: "flex", flexDirection: "column" }}
				>
					{children}
				</Paper>
			);
		}

		return (
			<Box sx={{ height: "100vh", display: "flex", flexDirection: "column" }}>
				<AppBar position="static" color="default" elevation={1}>
					<Toolbar variant="dense">
						<ChatIcon sx={{ mr: 1 }} />
						<Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
							Chat z Mechanikiem
						</Typography>

						<ConnectionStatus />

						<Tooltip title="Powiadomienia">
							<IconButton
								color="inherit"
								onClick={() => setShowNotifications(!showNotifications)}
							>
								<Badge badgeContent={notifications.length} color="error">
									<NotificationsIcon />
								</Badge>
							</IconButton>
						</Tooltip>

						<Tooltip title="Ustawienia">
							<IconButton color="inherit">
								<SettingsIcon />
							</IconButton>
						</Tooltip>

						{onClose && (
							<Tooltip title="Zamknij">
								<IconButton color="inherit" onClick={onClose}>
									<CloseIcon />
								</IconButton>
							</Tooltip>
						)}
					</Toolbar>
				</AppBar>

				<Box sx={{ flex: 1, overflow: "hidden" }}>{children}</Box>
			</Box>
		);
	};

	return (
		<Layout>
			<Grid container sx={{ height: "100%" }}>
				{/* Conversation List */}
				<Grid
					item
					xs={12}
					md={4}
					lg={3}
					sx={{
						borderRight: 1,
						borderColor: "divider",
						height: "100%",
						display: {
							xs: selectedConversation ? "none" : "block",
							md: "block",
						},
					}}
				>
					<ConversationList
						conversations={conversations}
						selectedConversation={selectedConversation}
						onConversationSelect={handleConversationSelect}
						onCreateConversation={handleCreateConversation}
						isLoading={isLoading}
						error={error}
					/>
				</Grid>

				{/* Chat Window */}
				<Grid
					item
					xs={12}
					md={8}
					lg={9}
					sx={{
						height: "100%",
						display: {
							xs: selectedConversation ? "block" : "none",
							md: "block",
						},
					}}
				>
					{selectedConversation ? (
						<ChatWindow
							conversation={selectedConversation}
							messages={messages}
							onSendMessage={handleSendMessage}
							onTyping={handleTyping}
							onBack={() => setSelectedConversation(null)}
							isLoading={isLoading}
							error={error}
						/>
					) : (
						<Box
							sx={{
								height: "100%",
								display: "flex",
								alignItems: "center",
								justifyContent: "center",
								color: "text.secondary",
							}}
						>
							<Typography variant="h6">
								Wybierz konwersację aby rozpocząć chat
							</Typography>
						</Box>
					)}
				</Grid>
			</Grid>

			{/* Error handling */}
			{error && (
				<Box
					sx={{
						position: "fixed",
						bottom: 16,
						right: 16,
						backgroundColor: "error.main",
						color: "error.contrastText",
						p: 2,
						borderRadius: 1,
					}}
				>
					<Typography variant="body2">{error}</Typography>
				</Box>
			)}
		</Layout>
	);
};

export default ChatLayout;
