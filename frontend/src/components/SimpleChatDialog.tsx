import React from "react";
import {
	Box,
	Typography,
	List,
	ListItem,
	ListItemText,
	TextField,
	Button,
	Paper,
} from "@mui/material";
import { Chat as ChatIcon, Send as SendIcon } from "@mui/icons-material";
import { COLOR_PRIMARY } from "../constants";
import { COLOR_SURFACE } from "../constants";

interface SimpleChatDialogProps {
	onClose?: () => void;
}

const SimpleChatDialog: React.FC<SimpleChatDialogProps> = ({ onClose }) => {
	const [message, setMessage] = React.useState("");

	// Mock conversations for testing
	const mockConversations = [
		{
			id: 1,
			mechanic: "Jan Kowalski",
			subject: "Wymiana oleju",
			lastMessage: "Proszę przywieźć auto na 14:00",
			unreadCount: 2,
			timestamp: "10:30",
		},
		{
			id: 2,
			mechanic: "Anna Nowak",
			subject: "Przegląd techniczny",
			lastMessage: "Wszystko gotowe do odbioru",
			unreadCount: 0,
			timestamp: "Wczoraj",
		},
	];

	const [selectedConversation, setSelectedConversation] = React.useState(
		mockConversations[0]
	);

	const mockMessages = [
		{
			id: 1,
			sender: "mechanic",
			content: "Dzień dobry! Sprawdziłem Pana auto.",
			timestamp: "10:15",
		},
		{
			id: 2,
			sender: "client",
			content: "Dzień dobry, co z olejem?",
			timestamp: "10:20",
		},
		{
			id: 3,
			sender: "mechanic",
			content: "Olej wymieniony, wszystko w porządku. Może Pan odbierać.",
			timestamp: "10:25",
		},
	];

	const handleSendMessage = () => {
		if (message.trim()) {
			console.log("Wysyłanie wiadomości:", message);
			setMessage("");
		}
	};

	return (
		<Box sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
			{/* Header */}
			<Box
				sx={{
					p: 2,
					bgcolor: COLOR_PRIMARY,
					color: "white",
					display: "flex",
					alignItems: "center",
					gap: 1,
				}}
			>
				<ChatIcon />
				<Typography variant="h6">Chat z Mechanikiem</Typography>
				<Box sx={{ flexGrow: 1 }} />
				{onClose && (
					<Button onClick={onClose} sx={{ color: "white", minWidth: "auto" }}>
						✕
					</Button>
				)}
			</Box>

			<Box sx={{ flex: 1, display: "flex", overflow: "hidden" }}>
				{/* Conversations List */}
				<Paper
					sx={{
						width: 300,
						borderRadius: 0,
						borderRight: 1,
						borderColor: "divider",
						overflow: "auto",
					}}
				>
					<Typography variant="h6" sx={{ p: 2, bgcolor: "grey.100" }}>
						Konwersacje
					</Typography>
					<List dense>
						{mockConversations.map((conv) => (
							<ListItem
								key={conv.id}
								button
								selected={selectedConversation.id === conv.id}
								onClick={() => setSelectedConversation(conv)}
								sx={{
									borderBottom: 1,
									borderColor: "divider",
								}}
							>
								<ListItemText
									primary={
										<Box
											sx={{ display: "flex", justifyContent: "space-between" }}
										>
											<Typography variant="subtitle2">
												{conv.mechanic}
											</Typography>
											<Typography variant="caption" color="text.secondary">
												{conv.timestamp}
											</Typography>
										</Box>
									}
									secondary={
										<Box>
											<Typography variant="body2" color="text.secondary">
												{conv.subject}
											</Typography>
											<Typography variant="caption" noWrap>
												{conv.lastMessage}
											</Typography>
										</Box>
									}
								/>
								{conv.unreadCount > 0 && (
									<Box
										sx={{
											bgcolor: COLOR_PRIMARY,
											color: "white",
											borderRadius: "50%",
											width: 20,
											height: 20,
											display: "flex",
											alignItems: "center",
											justifyContent: "center",
											fontSize: 12,
											ml: 1,
										}}
									>
										{conv.unreadCount}
									</Box>
								)}
							</ListItem>
						))}
					</List>
				</Paper>

				{/* Chat Window */}
				<Box sx={{ flex: 1, display: "flex", flexDirection: "column" }}>
					{/* Chat Header */}
					<Box
						sx={{
							p: 2,
							borderBottom: 1,
							borderColor: "divider",
							bgcolor: "grey.50",
						}}
					>
						<Typography variant="h6">
							{selectedConversation.mechanic}
						</Typography>
						<Typography variant="body2" color="text.secondary">
							{selectedConversation.subject}
						</Typography>
					</Box>

					{/* Messages */}
					<Box
						sx={{
							flex: 1,
							overflow: "auto",
							p: 1,
							bgcolor: "grey.25",
						}}
					>
						{mockMessages.map((msg) => (
							<Box
								key={msg.id}
								sx={{
									display: "flex",
									justifyContent:
										msg.sender === "client" ? "flex-end" : "flex-start",
									mb: 1,
								}}
							>
								<Paper
									sx={{
										p: 2,
										maxWidth: "70%",
										bgcolor:
											msg.sender === "client" ? COLOR_PRIMARY : COLOR_SURFACE,
										color: msg.sender === "client" ? "white" : "black",
									}}
								>
									<Typography variant="body2">{msg.content}</Typography>
									<Typography
										variant="caption"
										sx={{
											opacity: 0.7,
											display: "block",
											textAlign: "right",
											mt: 0.5,
										}}
									>
										{msg.timestamp}
									</Typography>
								</Paper>
							</Box>
						))}
					</Box>

					{/* Message Input */}
					<Box
						sx={{
							p: 2,
							borderTop: 1,
							borderColor: "divider",
							display: "flex",
							gap: 1,
						}}
					>
						<TextField
							fullWidth
							placeholder="Napisz wiadomość..."
							value={message}
							onChange={(e) => setMessage(e.target.value)}
							onKeyPress={(e) => {
								if (e.key === "Enter" && !e.shiftKey) {
									e.preventDefault();
									handleSendMessage();
								}
							}}
							multiline
							maxRows={3}
							variant="outlined"
							size="small"
						/>
						<Button
							variant="contained"
							onClick={handleSendMessage}
							disabled={!message.trim()}
							sx={{
								bgcolor: COLOR_PRIMARY,
								"&:hover": {
									bgcolor: COLOR_PRIMARY,
									opacity: 0.9,
								},
							}}
						>
							<SendIcon />
						</Button>
					</Box>
				</Box>
			</Box>
		</Box>
	);
};

export default SimpleChatDialog;
