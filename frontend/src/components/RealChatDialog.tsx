import React, { useState, useEffect, useCallback } from "react";
import {
	Box,
	Typography,
	List,
	ListItem,
	ListItemText,
	TextField,
	Button,
	Paper,
	CircularProgress,
	Alert,
	Avatar,
	Chip,
} from "@mui/material";
import {
	Chat as ChatIcon,
	Send as SendIcon,
	Build as BuildIcon,
} from "@mui/icons-material";
import { COLOR_PRIMARY } from "../constants";
import { COLOR_SURFACE } from "../constants";
import { useChatApi } from "../api/chatApi";
import { Conversation } from "../models/chat";

interface RealChatDialogProps {
	onClose?: () => void;
}

const RealChatDialog: React.FC<RealChatDialogProps> = ({ onClose }) => {
	const [message, setMessage] = useState("");
	const [selectedConversation, setSelectedConversation] =
		useState<Conversation | null>(null);

	// Chat API hook (bez WebSocket na razie)
	const {
		conversations,
		messages,
		isLoading,
		error,
		fetchConversations,
		fetchMessages,
		sendMessage: apiSendMessage,
	} = useChatApi();

	// Tymczasowo wyłączamy WebSocket - używamy tylko HTTP API
	// const { sendMessage: wsSendMessage, isConnected } = useChatWebSocket({
	// 	conversationUuid: selectedConversation?.uuid,
	// 	onMessageReceived: (newMessage: Message) => {
	// 		console.log("Otrzymano nową wiadomość:", newMessage);
	// 		// Automatycznie odśwież wiadomości
	// 		if (selectedConversation) {
	// 			fetchMessages(selectedConversation.uuid);
	// 		}
	// 	},
	// 	autoConnect: true,
	// });

	// Mock status - brak WebSocket
	const isConnected = false;

	// Load conversations on mount
	useEffect(() => {
		fetchConversations();
	}, [fetchConversations]);

	// Load messages when conversation is selected
	useEffect(() => {
		if (selectedConversation) {
			fetchMessages(selectedConversation.uuid);
		}
	}, [selectedConversation, fetchMessages]);

	// Select first conversation by default
	useEffect(() => {
		if (conversations.length > 0 && !selectedConversation) {
			setSelectedConversation(conversations[0]);
		}
	}, [conversations, selectedConversation]);

	const handleSendMessage = useCallback(async () => {
		if (!message.trim() || !selectedConversation) {
			console.log("Nie można wysłać - brak wiadomości lub konwersacji");
			return;
		}

		const messageData = {
			conversation_uuid: selectedConversation.uuid,
			content: message.trim(),
			message_type: "text" as const,
		};

		console.log("Wysyłanie wiadomości:", messageData);
		console.log("UUID konwersacji:", selectedConversation.uuid);

		try {
			// Używamy tylko API (bez WebSocket na razie)
			const sentMessage = await apiSendMessage(
				selectedConversation.uuid,
				messageData
			);
			console.log("Wiadomość wysłana pomyślnie:", sentMessage);

			// Odśwież wiadomości po wysłaniu
			await fetchMessages(selectedConversation.uuid);
			setMessage("");
		} catch (error) {
			console.error("Błąd wysyłania wiadomości:", error);
			alert(
				"Nie udało się wysłać wiadomości: " +
					(error instanceof Error ? error.message : "Nieznany błąd")
			);
		}
	}, [message, selectedConversation, apiSendMessage, fetchMessages]);

	const formatTime = (dateString: string) => {
		const date = new Date(dateString);
		const now = new Date();
		const diffHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

		if (diffHours < 24) {
			return date.toLocaleTimeString("pl-PL", {
				hour: "2-digit",
				minute: "2-digit",
			});
		} else {
			return date.toLocaleDateString("pl-PL", {
				day: "2-digit",
				month: "2-digit",
			});
		}
	};

	if (isLoading && conversations.length === 0) {
		return (
			<Box
				sx={{
					height: "100%",
					display: "flex",
					alignItems: "center",
					justifyContent: "center",
				}}
			>
				<CircularProgress />
				<Typography sx={{ ml: 2 }}>Ładowanie konwersacji...</Typography>
			</Box>
		);
	}

	if (error) {
		return (
			<Box sx={{ height: "100%", p: 2 }}>
				<Alert severity="error">Błąd ładowania czatu: {error}</Alert>
				<Button onClick={() => fetchConversations()} sx={{ mt: 2 }}>
					Spróbuj ponownie
				</Button>
			</Box>
		);
	}

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

				{/* Connection status */}
				<Chip
					size="small"
					label={isConnected ? "Połączony" : "Tylko odczyt"}
					sx={{
						bgcolor: isConnected ? "success.main" : "grey.600",
						color: "white",
						fontSize: "0.75rem",
						height: 24,
						"& .MuiChip-label": {
							px: 1,
							fontWeight: 500,
						},
					}}
				/>

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
						Konwersacje ({conversations.length})
					</Typography>

					{conversations.length === 0 ? (
						<Box sx={{ p: 2, textAlign: "center" }}>
							<Typography color="text.secondary">
								Brak aktywnych konwersacji
							</Typography>
							<Typography variant="caption" color="text.secondary">
								Rozpocznij nową rozmowę z mechanikiem
							</Typography>
						</Box>
					) : (
						<List dense>
							{conversations.map((conv) => (
								<ListItem
									key={conv.uuid}
									button
									selected={selectedConversation?.uuid === conv.uuid}
									onClick={() => setSelectedConversation(conv)}
									sx={{
										borderBottom: 1,
										borderColor: "divider",
									}}
								>
									<Avatar sx={{ mr: 2, bgcolor: COLOR_SECONDARY }}>
										<BuildIcon />
									</Avatar>
									<ListItemText
										primary={
											<Box
												sx={{
													display: "flex",
													justifyContent: "space-between",
												}}
											>
												<Typography variant="subtitle2">
													{conv.mechanic_name}
												</Typography>
												<Typography variant="caption" color="text.secondary">
													{formatTime(conv.last_message_at)}
												</Typography>
											</Box>
										}
										secondary={
											<Box>
												<Typography variant="body2" color="text.secondary">
													{conv.subject}
												</Typography>
												<Chip
													size="small"
													label={
														conv.status === "active"
															? "Aktywny"
															: conv.status === "waiting_client"
															? "Oczekuje odpowiedzi"
															: conv.status === "waiting_mechanic"
															? "Mechanik odpowie"
															: conv.status === "resolved"
															? "Rozwiązany"
															: conv.status === "closed"
															? "Zamknięty"
															: conv.status
													}
													sx={{
														mt: 0.5,
														height: 22,
														fontSize: "0.7rem",
														bgcolor:
															conv.status === "active"
																? "success.light"
																: conv.status === "waiting_client"
																? "warning.light"
																: conv.status === "waiting_mechanic"
																? "info.light"
																: conv.status === "resolved"
																? "grey.300"
																: conv.status === "closed"
																? "grey.400"
																: "grey.200",
														color:
															conv.status === "active"
																? "success.dark"
																: conv.status === "waiting_client"
																? "warning.dark"
																: conv.status === "waiting_mechanic"
																? "info.dark"
																: conv.status === "resolved"
																? "grey.700"
																: conv.status === "closed"
																? "grey.700"
																: "grey.700",
														"& .MuiChip-label": {
															fontWeight: 600,
														},
													}}
												/>
											</Box>
										}
									/>
									{conv.unread_count > 0 && (
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
											{conv.unread_count}
										</Box>
									)}
								</ListItem>
							))}
						</List>
					)}
				</Paper>

				{/* Chat Window */}
				{selectedConversation ? (
					<Box sx={{ flex: 1, display: "flex", flexDirection: "column" }}>
						{/* Chat Header */}
						<Box
							sx={{
								p: 2,
								borderBottom: 1,
								borderColor: "divider",
								bgcolor: "grey.50",
								display: "flex",
								alignItems: "center",
								gap: 2,
							}}
						>
							<Avatar sx={{ bgcolor: COLOR_SECONDARY }}>
								<BuildIcon />
							</Avatar>
							<Box>
								<Typography variant="h6">
									{selectedConversation.mechanic_name}
								</Typography>
								<Typography variant="body2" color="text.secondary">
									{selectedConversation.subject}
								</Typography>
							</Box>
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
							{isLoading && messages.length === 0 ? (
								<Box sx={{ display: "flex", justifyContent: "center", p: 2 }}>
									<CircularProgress size={24} />
									<Typography sx={{ ml: 1 }}>
										Ładowanie wiadomości...
									</Typography>
								</Box>
							) : messages.length === 0 ? (
								<Box sx={{ textAlign: "center", p: 4 }}>
									<Typography color="text.secondary">
										Brak wiadomości w tej konwersacji
									</Typography>
									<Typography variant="caption" color="text.secondary">
										Rozpocznij rozmowę poniżej
									</Typography>
								</Box>
							) : (
								messages.map((msg) => {
									const isClient = msg.sender === selectedConversation.client;
									return (
										<Box
											key={msg.id}
											sx={{
												display: "flex",
												justifyContent: isClient ? "flex-end" : "flex-start",
												mb: 1,
											}}
										>
											<Paper
												sx={{
													p: 2,
													maxWidth: "70%",
													bgcolor: isClient ? COLOR_PRIMARY : COLOR_SURFACE,
													color: isClient ? "white" : "black",
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
													{formatTime(msg.created_at)}
												</Typography>
											</Paper>
										</Box>
									);
								})
							)}
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
								disabled={!selectedConversation}
							/>
							<Button
								variant="contained"
								onClick={handleSendMessage}
								disabled={!message.trim() || !selectedConversation}
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
				) : (
					<Box
						sx={{
							flex: 1,
							display: "flex",
							alignItems: "center",
							justifyContent: "center",
							flexDirection: "column",
							gap: 2,
						}}
					>
						<ChatIcon sx={{ fontSize: 64, color: "grey.400" }} />
						<Typography color="text.secondary">
							Wybierz konwersację aby rozpocząć czat
						</Typography>
					</Box>
				)}
			</Box>
		</Box>
	);
};

export default RealChatDialog;
