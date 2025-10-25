import React, { useEffect, useRef } from "react";
import {
	Box,
	List,
	ListItem,
	Avatar,
	Typography,
	Paper,
	Chip,
	IconButton,
	Tooltip,
} from "@mui/material";
import {
	Reply as ReplyIcon,
	MoreVert as MoreVertIcon,
	Download as DownloadIcon,
	Person as PersonIcon,
	Build as BuildIcon,
} from "@mui/icons-material";
import { format, isSameDay } from "date-fns";
import { pl } from "date-fns/locale";
import { Message } from "../../models/chat";

interface MessageListProps {
	messages: Message[];
}

interface MessageItemProps {
	message: Message;
	isOwn: boolean;
	showAvatar: boolean;
	showTimestamp: boolean;
}

const MessageItem: React.FC<MessageItemProps> = ({
	message,
	isOwn,
	showAvatar,
	showTimestamp,
}) => {
	const formatMessageTime = (timestamp: string) => {
		return format(new Date(timestamp), "HH:mm", { locale: pl });
	};

	const getMessageStatusIcon = (status: string) => {
		switch (status) {
			case "sent":
				return "✓";
			case "delivered":
				return "✓✓";
			case "read":
				return "✓✓";
			default:
				return "";
		}
	};

	const getStatusColor = (status: string) => {
		switch (status) {
			case "read":
				return "primary.main";
			case "delivered":
				return "text.secondary";
			case "sent":
				return "text.disabled";
			default:
				return "text.disabled";
		}
	};

	const renderAttachment = () => {
		if (!message.attachment) return null;

		const fileName = message.attachment.split("/").pop() || "attachment";
		const isImage = /\.(jpg|jpeg|png|gif|webp)$/i.test(fileName);

		return (
			<Box sx={{ mt: 1 }}>
				{isImage ? (
					<img
						src={message.attachment}
						alt="Załącznik"
						style={{
							maxWidth: "200px",
							maxHeight: "200px",
							borderRadius: "8px",
							cursor: "pointer",
						}}
						onClick={() => window.open(message.attachment, "_blank")}
					/>
				) : (
					<Paper
						variant="outlined"
						sx={{
							p: 1,
							display: "flex",
							alignItems: "center",
							gap: 1,
							cursor: "pointer",
							maxWidth: "250px",
						}}
						onClick={() => window.open(message.attachment, "_blank")}
					>
						<DownloadIcon fontSize="small" />
						<Typography variant="body2" noWrap>
							{fileName}
						</Typography>
					</Paper>
				)}
			</Box>
		);
	};

	const renderQuote = () => {
		if (!message.quote_data) return null;

		return (
			<Box
				sx={{
					borderLeft: 3,
					borderColor: "primary.main",
					pl: 1,
					mb: 1,
					bgcolor: "action.hover",
					borderRadius: 1,
					p: 1,
				}}
			>
				<Typography variant="caption" color="primary.main" fontWeight="bold">
					Odpowiedź na:
				</Typography>
				<Typography variant="body2" color="text.secondary">
					{message.quote_data.content?.substring(0, 100)}
					{(message.quote_data.content?.length || 0) > 100 ? "..." : ""}
				</Typography>
			</Box>
		);
	};

	return (
		<ListItem
			sx={{
				display: "flex",
				flexDirection: "column",
				alignItems: isOwn ? "flex-end" : "flex-start",
				px: 2,
				py: 0.5,
			}}
		>
			{/* Date Separator */}
			{showTimestamp && (
				<Box sx={{ alignSelf: "center", my: 2 }}>
					<Chip
						label={format(new Date(message.created_at), "dd MMMM yyyy", {
							locale: pl,
						})}
						size="small"
						variant="outlined"
					/>
				</Box>
			)}

			<Box
				sx={{
					display: "flex",
					flexDirection: isOwn ? "row-reverse" : "row",
					alignItems: "flex-end",
					gap: 1,
					maxWidth: "70%",
					width: "100%",
				}}
			>
				{/* Avatar */}
				{showAvatar && !isOwn && (
					<Avatar sx={{ width: 32, height: 32, bgcolor: "primary.main" }}>
						{message.sender_type === "mechanic" ? (
							<BuildIcon />
						) : (
							<PersonIcon />
						)}
					</Avatar>
				)}
				{isOwn && <Box sx={{ width: 32 }} />} {/* Spacer for own messages */}
				{/* Message Content */}
				<Paper
					elevation={1}
					sx={{
						p: 1.5,
						bgcolor: isOwn ? "primary.main" : "background.paper",
						color: isOwn ? "primary.contrastText" : "text.primary",
						borderRadius: 2,
						borderTopLeftRadius: isOwn ? 2 : showAvatar ? 0.5 : 2,
						borderTopRightRadius: isOwn && showAvatar ? 0.5 : 2,
						position: "relative",
						minWidth: "100px",
						maxWidth: "100%",
					}}
				>
					{/* Sender Name (for group chats) */}
					{!isOwn && showAvatar && (
						<Typography
							variant="caption"
							sx={{
								fontWeight: "bold",
								color: "primary.main",
								display: "block",
								mb: 0.5,
							}}
						>
							{message.sender_name}
						</Typography>
					)}

					{/* Quote */}
					{renderQuote()}

					{/* Message Content */}
					<Typography
						variant="body2"
						sx={{
							wordBreak: "break-word",
							whiteSpace: "pre-wrap",
						}}
					>
						{message.content}
					</Typography>

					{/* Attachment */}
					{renderAttachment()}

					{/* Message Info */}
					<Box
						sx={{
							display: "flex",
							alignItems: "center",
							justifyContent: "space-between",
							mt: 0.5,
							gap: 1,
						}}
					>
						<Typography
							variant="caption"
							sx={{
								color: isOwn ? "primary.contrastText" : "text.secondary",
								opacity: 0.7,
							}}
						>
							{formatMessageTime(message.created_at)}
							{message.edited_at && " (edytowana)"}
						</Typography>

						{isOwn && (
							<Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
								<Typography
									variant="caption"
									sx={{
										color: getStatusColor(message.status),
										fontSize: "0.75rem",
									}}
								>
									{getMessageStatusIcon(message.status)}
								</Typography>
							</Box>
						)}
					</Box>

					{/* Message Actions */}
					<Box
						sx={{
							position: "absolute",
							top: -8,
							right: isOwn ? "auto" : -8,
							left: isOwn ? -8 : "auto",
							opacity: 0,
							transition: "opacity 0.2s",
							"&:hover": { opacity: 1 },
							".message-item:hover &": { opacity: 1 },
						}}
					>
						<Paper sx={{ display: "flex", borderRadius: 3 }}>
							<Tooltip title="Odpowiedz">
								<IconButton size="small">
									<ReplyIcon fontSize="small" />
								</IconButton>
							</Tooltip>
							<Tooltip title="Więcej">
								<IconButton size="small">
									<MoreVertIcon fontSize="small" />
								</IconButton>
							</Tooltip>
						</Paper>
					</Box>
				</Paper>
			</Box>
		</ListItem>
	);
};

const MessageList: React.FC<MessageListProps> = ({ messages }) => {
	const listRef = useRef<HTMLDivElement>(null);
	const currentUserId = 1; // TODO: Get from auth context

	// Auto-scroll to bottom when new messages arrive
	useEffect(() => {
		if (listRef.current) {
			listRef.current.scrollTop = listRef.current.scrollHeight;
		}
	}, [messages]);

	// Group messages by date and determine display logic
	const processedMessages = messages.map((message, index) => {
		const prevMessage = index > 0 ? messages[index - 1] : null;
		const nextMessage =
			index < messages.length - 1 ? messages[index + 1] : null;

		const isOwn = message.sender === currentUserId;

		// Show avatar if:
		// - It's not own message AND
		// - (It's first message OR previous message is from different sender OR previous message is own)
		const showAvatar =
			!isOwn &&
			(!prevMessage ||
				prevMessage.sender !== message.sender ||
				prevMessage.sender === currentUserId);

		// Show timestamp if it's a different day from previous message
		const showTimestamp =
			!prevMessage ||
			!isSameDay(
				new Date(message.created_at),
				new Date(prevMessage.created_at)
			);

		return {
			...message,
			isOwn,
			showAvatar,
			showTimestamp,
		};
	});

	if (messages.length === 0) {
		return (
			<Box
				sx={{
					display: "flex",
					alignItems: "center",
					justifyContent: "center",
					height: "100%",
					color: "text.secondary",
				}}
			>
				<Typography variant="body1">
					Brak wiadomości. Napisz pierwszą wiadomość!
				</Typography>
			</Box>
		);
	}

	return (
		<Box
			ref={listRef}
			sx={{
				height: "100%",
				overflow: "auto",
				scrollBehavior: "smooth",
			}}
		>
			<List sx={{ py: 1 }}>
				{processedMessages.map((message) => (
					<div key={message.uuid} className="message-item">
						<MessageItem
							message={message}
							isOwn={message.isOwn}
							showAvatar={message.showAvatar}
							showTimestamp={message.showTimestamp}
						/>
					</div>
				))}
			</List>
		</Box>
	);
};

export default MessageList;
