import React, { useState, useRef, useEffect } from "react";
import {
	Box,
	Paper,
	Typography,
	TextField,
	IconButton,
	Avatar,
	Chip,
	Toolbar,
	InputAdornment,
	Menu,
	MenuItem,
	Tooltip,
	CircularProgress,
	Alert,
	Divider,
} from "@mui/material";
import {
	Send as SendIcon,
	AttachFile as AttachFileIcon,
	EmojiEmotions as EmojiIcon,
	MoreVert as MoreVertIcon,
	ArrowBack as ArrowBackIcon,
	Person as PersonIcon,
} from "@mui/icons-material";
import { formatDistanceToNow, format } from "date-fns";
import { pl } from "date-fns/locale";
import { Conversation, Message } from "../../models/chat";
import MessageList from "./MessageList";
import TypingIndicator from "./TypingIndicator";

interface ChatWindowProps {
	conversation: Conversation;
	messages: Message[];
	onSendMessage: (content: string, attachments?: File[]) => Promise<void>;
	onTyping: (isTyping: boolean) => void;
	onBack?: () => void;
	isLoading: boolean;
	error: string | null;
}

const ChatWindow: React.FC<ChatWindowProps> = ({
	conversation,
	messages,
	onSendMessage,
	onTyping,
	onBack,
	isLoading,
	error,
}) => {
	const [messageContent, setMessageContent] = useState("");
	const [isSending, setIsSending] = useState(false);
	const [attachments, setAttachments] = useState<File[]>([]);
	const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);

	const fileInputRef = useRef<HTMLInputElement>(null);
	const messageInputRef = useRef<HTMLTextAreaElement>(null);
	const typingTimeoutRef = useRef<number>();

	// Handle typing indicator
	const handleInputChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
		const value = event.target.value;
		setMessageContent(value);

		// Send typing indicator
		onTyping(true);

		// Clear existing timeout
		if (typingTimeoutRef.current) {
			window.clearTimeout(typingTimeoutRef.current);
		}

		// Stop typing after 1 second of inactivity
		typingTimeoutRef.current = window.setTimeout(() => {
			onTyping(false);
		}, 1000);
	};

	// Send message
	const handleSendMessage = async () => {
		if (!messageContent.trim() && attachments.length === 0) return;

		try {
			setIsSending(true);
			await onSendMessage(messageContent, attachments);
			setMessageContent("");
			setAttachments([]);
			onTyping(false);

			// Focus back to input
			if (messageInputRef.current) {
				messageInputRef.current.focus();
			}
		} catch (error) {
			console.error("Failed to send message:", error);
		} finally {
			setIsSending(false);
		}
	};

	// Handle file attachment
	const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
		const files = Array.from(event.target.files || []);
		setAttachments((prev) => [...prev, ...files]);

		// Clear input
		if (fileInputRef.current) {
			fileInputRef.current.value = "";
		}
	};

	// Remove attachment
	const removeAttachment = (index: number) => {
		setAttachments((prev) => prev.filter((_, i) => i !== index));
	};

	// Handle Enter key
	const handleKeyPress = (event: React.KeyboardEvent) => {
		if (event.key === "Enter" && !event.shiftKey) {
			event.preventDefault();
			handleSendMessage();
		}
	};

	// Cleanup typing timeout
	useEffect(() => {
		return () => {
			if (typingTimeoutRef.current) {
				window.clearTimeout(typingTimeoutRef.current);
			}
		};
	}, []);

	const getConversationTitle = () => {
		const participants = conversation.participants
			.map((p) => p.user_name)
			.join(", ");
		return participants || "Chat";
	};

	const getLastActivity = () => {
		if (conversation.last_message) {
			return formatDistanceToNow(
				new Date(conversation.last_message.created_at),
				{
					addSuffix: true,
					locale: pl,
				}
			);
		}
		return formatDistanceToNow(new Date(conversation.created_at), {
			addSuffix: true,
			locale: pl,
		});
	};

	const getStatusColor = (status: string) => {
		switch (status) {
			case "active":
				return "success";
			case "closed":
				return "default";
			case "pending":
				return "warning";
			default:
				return "default";
		}
	};

	const getStatusLabel = (status: string) => {
		switch (status) {
			case "active":
				return "Aktywna";
			case "closed":
				return "Zamknięta";
			case "pending":
				return "Oczekująca";
			default:
				return status;
		}
	};

	return (
		<Box sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
			{/* Header */}
			<Paper elevation={1} sx={{ zIndex: 1 }}>
				<Toolbar variant="dense">
					{onBack && (
						<IconButton
							edge="start"
							onClick={onBack}
							sx={{ mr: 1, display: { md: "none" } }}
						>
							<ArrowBackIcon />
						</IconButton>
					)}

					<Avatar sx={{ mr: 2, bgcolor: "primary.main" }}>
						<PersonIcon />
					</Avatar>

					<Box sx={{ flexGrow: 1 }}>
						<Typography variant="subtitle1" noWrap>
							{conversation.subject}
						</Typography>
						<Typography variant="caption" color="text.secondary">
							{getConversationTitle()} • {getLastActivity()}
						</Typography>
					</Box>

					<Chip
						size="small"
						label={getStatusLabel(conversation.status)}
						color={getStatusColor(conversation.status) as any}
						variant="outlined"
						sx={{ mr: 1 }}
					/>

					<IconButton onClick={(e) => setMenuAnchor(e.currentTarget)}>
						<MoreVertIcon />
					</IconButton>

					<Menu
						anchorEl={menuAnchor}
						open={Boolean(menuAnchor)}
						onClose={() => setMenuAnchor(null)}
					>
						<MenuItem onClick={() => setMenuAnchor(null)}>
							Informacje o konwersacji
						</MenuItem>
						<MenuItem onClick={() => setMenuAnchor(null)}>
							Historia wiadomości
						</MenuItem>
						<Divider />
						<MenuItem onClick={() => setMenuAnchor(null)}>
							Zamknij konwersację
						</MenuItem>
					</Menu>
				</Toolbar>
			</Paper>

			{/* Messages Area */}
			<Box sx={{ flex: 1, overflow: "hidden", position: "relative" }}>
				{error && (
					<Box sx={{ p: 2 }}>
						<Alert severity="error">{error}</Alert>
					</Box>
				)}

				{isLoading ? (
					<Box sx={{ display: "flex", justifyContent: "center", p: 3 }}>
						<CircularProgress />
					</Box>
				) : (
					<MessageList messages={messages} />
				)}

				{/* Typing Indicator */}
				<TypingIndicator
					conversation={conversation}
					visible={conversation.participants.some((p) => p.is_typing)}
				/>
			</Box>

			{/* Message Input */}
			<Paper elevation={3} sx={{ p: 2 }}>
				{/* Attachments Preview */}
				{attachments.length > 0 && (
					<Box sx={{ mb: 2 }}>
						{attachments.map((file, index) => (
							<Chip
								key={index}
								label={file.name}
								onDelete={() => removeAttachment(index)}
								sx={{ mr: 1, mb: 1 }}
							/>
						))}
					</Box>
				)}

				<Box sx={{ display: "flex", alignItems: "flex-end", gap: 1 }}>
					{/* File Attachment */}
					<input
						ref={fileInputRef}
						type="file"
						hidden
						multiple
						onChange={handleFileSelect}
					/>
					<Tooltip title="Załącz plik">
						<IconButton
							onClick={() => fileInputRef.current?.click()}
							disabled={isSending}
						>
							<AttachFileIcon />
						</IconButton>
					</Tooltip>

					{/* Message Input */}
					<TextField
						inputRef={messageInputRef}
						fullWidth
						multiline
						maxRows={4}
						placeholder="Napisz wiadomość..."
						value={messageContent}
						onChange={handleInputChange}
						onKeyPress={handleKeyPress}
						disabled={isSending || conversation.status === "closed"}
						InputProps={{
							endAdornment: (
								<InputAdornment position="end">
									<Tooltip title="Emoji">
										<IconButton size="small" disabled={isSending}>
											<EmojiIcon />
										</IconButton>
									</Tooltip>
								</InputAdornment>
							),
						}}
					/>

					{/* Send Button */}
					<Tooltip title="Wyślij">
						<span>
							<IconButton
								color="primary"
								onClick={handleSendMessage}
								disabled={
									isSending ||
									(!messageContent.trim() && attachments.length === 0) ||
									conversation.status === "closed"
								}
							>
								{isSending ? <CircularProgress size={24} /> : <SendIcon />}
							</IconButton>
						</span>
					</Tooltip>
				</Box>

				{conversation.status === "closed" && (
					<Typography
						variant="caption"
						color="text.secondary"
						sx={{ display: "block", mt: 1, textAlign: "center" }}
					>
						Ta konwersacja została zamknięta
					</Typography>
				)}
			</Paper>
		</Box>
	);
};

export default ChatWindow;
