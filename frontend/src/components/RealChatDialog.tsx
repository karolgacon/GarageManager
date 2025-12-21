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
	Dialog,
	DialogTitle,
	DialogContent,
	DialogActions,
	FormControl,
	InputLabel,
	Select,
	MenuItem,
} from "@mui/material";
import {
	Chat as ChatIcon,
	Send as SendIcon,
	Build as BuildIcon,
	Add as AddIcon,
} from "@mui/icons-material";
import {
	COLOR_PRIMARY,
	COLOR_SURFACE,
	COLOR_BACKGROUND,
	COLOR_TEXT_PRIMARY,
	COLOR_TEXT_SECONDARY,
	COLOR_SUCCESS,
	COLOR_WARNING,
} from "../constants";
import { useChatApi } from "../api/chatApi";
import { useChatWebSocket } from "../hooks/useChatWebSocket";
import { resourcesApiClient, VehicleInService } from "../api/resourcesApi";
import { Conversation, Message } from "../models/chat";

interface RealChatDialogProps {
	onClose?: () => void;
}

interface CreateConversationDialogProps {
	open: boolean;
	onClose: () => void;
	onSubmit: (vehicleId: number, subject: string) => Promise<void>;
}

const CreateConversationDialog: React.FC<CreateConversationDialogProps> = ({
	open,
	onClose,
	onSubmit,
}) => {
	const [vehicleId, setVehicleId] = useState<number | "">("");
	const [subject, setSubject] = useState("");
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [vehicles, setVehicles] = useState<VehicleInService[]>([]);
	const [loading, setLoading] = useState(true);
	const [selectedVehicle, setSelectedVehicle] =
		useState<VehicleInService | null>(null);

	// Load mechanics and workshops when dialog opens
	useEffect(() => {
		if (open) {
			loadResources();
		}
	}, [open]);

	const loadResources = async () => {
		try {
			setLoading(true);
			const vehiclesData = await resourcesApiClient.getVehiclesInService();
			setVehicles(vehiclesData);
		} catch (error) {
			console.error("Failed to load vehicles in service:", error);
		} finally {
			setLoading(false);
		}
	};

	const handleSubmit = async () => {
		if (!vehicleId || !subject.trim()) return;

		try {
			setIsSubmitting(true);
			await onSubmit(Number(vehicleId), subject);
			setVehicleId("");
			setSubject("");
			setSelectedVehicle(null);
		} catch (error) {
			console.error("Failed to create conversation:", error);
		} finally {
			setIsSubmitting(false);
		}
	};

	const handleVehicleSelect = (selectedVehicleId: number) => {
		setVehicleId(selectedVehicleId);
		const vehicle = vehicles.find((v) => v.id === selectedVehicleId);
		setSelectedVehicle(vehicle || null);
	};

	return (
		<Dialog
			open={open}
			onClose={onClose}
			maxWidth="sm"
			fullWidth
			PaperProps={{
				sx: {
					backgroundColor: COLOR_SURFACE,
					color: COLOR_TEXT_PRIMARY,
					border: `1px solid ${COLOR_TEXT_SECONDARY}30`,
					borderRadius: 2,
				},
			}}
		>
			<DialogTitle
				sx={{
					backgroundColor: COLOR_PRIMARY,
					color: "white",
					borderBottom: `1px solid ${COLOR_TEXT_SECONDARY}30`,
				}}
			>
				New Conversation
			</DialogTitle>
			<DialogContent sx={{ backgroundColor: COLOR_SURFACE }}>
				{loading ? (
					<Box sx={{ display: "flex", justifyContent: "center", p: 3 }}>
						<CircularProgress sx={{ color: COLOR_PRIMARY }} />
					</Box>
				) : (
					<Box sx={{ pt: 2, display: "flex", flexDirection: "column", gap: 2 }}>
						{vehicles.length === 0 ? (
							<Alert
								severity="info"
								sx={{
									backgroundColor: "rgba(33, 150, 243, 0.1)",
									color: COLOR_TEXT_PRIMARY,
									border: "1px solid rgba(33, 150, 243, 0.3)",
								}}
							>
								No vehicles in service. New chat can only be created for a
								vehicle that is currently in the workshop.
							</Alert>
						) : (
							<>
								<FormControl fullWidth>
									<InputLabel sx={{ color: COLOR_TEXT_SECONDARY }}>
										Vehicle
									</InputLabel>
									<Select
										value={vehicleId}
										onChange={(e) =>
											handleVehicleSelect(e.target.value as number)
										}
										label="Vehicle"
										sx={{
											"& .MuiOutlinedInput-notchedOutline": {
												borderColor: COLOR_TEXT_SECONDARY + "50",
											},
											"&:hover .MuiOutlinedInput-notchedOutline": {
												borderColor: COLOR_PRIMARY + "80",
											},
											"&.Mui-focused .MuiOutlinedInput-notchedOutline": {
												borderColor: COLOR_PRIMARY,
											},
											"& .MuiSelect-select": {
												color: COLOR_TEXT_PRIMARY,
											},
										}}
										MenuProps={{
											PaperProps: {
												sx: {
													backgroundColor: COLOR_SURFACE,
													border: `1px solid ${COLOR_TEXT_SECONDARY}30`,
												},
											},
										}}
									>
										{vehicles.map((vehicle) => (
											<MenuItem
												key={vehicle.id}
												value={vehicle.id}
												sx={{
													color: COLOR_TEXT_PRIMARY,
													"&:hover": {
														backgroundColor: COLOR_PRIMARY + "20",
													},
													"&.Mui-selected": {
														backgroundColor: COLOR_PRIMARY + "30",
													},
												}}
											>
												{vehicle.brand} {vehicle.model} (
												{vehicle.registration_number})
												<Typography
													variant="caption"
													sx={{ ml: 1, color: COLOR_TEXT_SECONDARY }}
												>
													- {vehicle.current_workshop_name}
												</Typography>
											</MenuItem>
										))}
									</Select>
								</FormControl>

								{selectedVehicle && (
									<Paper
										sx={{
											p: 2,
											backgroundColor: COLOR_SURFACE + "80",
											border: `1px solid ${COLOR_PRIMARY}30`,
										}}
									>
										<Typography
											variant="subtitle2"
											sx={{ color: COLOR_TEXT_PRIMARY, mb: 1 }}
										>
											Informacje o serwisie:
										</Typography>
										<Typography
											variant="body2"
											sx={{ color: COLOR_TEXT_SECONDARY }}
										>
											<strong>Warsztat:</strong>{" "}
											{selectedVehicle.current_workshop_name}
										</Typography>
										<Typography
											variant="body2"
											sx={{ color: COLOR_TEXT_SECONDARY }}
										>
											<strong>Mechanik:</strong>{" "}
											{selectedVehicle.current_mechanic_name}
										</Typography>
										<Typography
											variant="body2"
											sx={{ color: COLOR_TEXT_SECONDARY }}
										>
											<strong>Status:</strong>{" "}
											{selectedVehicle.appointment_status === "confirmed"
												? "Potwierdzony"
												: selectedVehicle.appointment_status === "in_progress"
												? "W trakcie"
												: selectedVehicle.appointment_status}
										</Typography>
									</Paper>
								)}
							</>
						)}

						<TextField
							fullWidth
							label="Temat"
							value={subject}
							onChange={(e) => setSubject(e.target.value)}
							placeholder="Opisz problem lub pytanie..."
							multiline
							rows={3}
							sx={{
								"& .MuiOutlinedInput-root": {
									"& fieldset": {
										borderColor: COLOR_TEXT_SECONDARY + "50",
									},
									"&:hover fieldset": {
										borderColor: COLOR_PRIMARY + "80",
									},
									"&.Mui-focused fieldset": {
										borderColor: COLOR_PRIMARY,
									},
									"& textarea": {
										color: COLOR_TEXT_PRIMARY,
									},
								},
								"& .MuiInputLabel-root": {
									color: COLOR_TEXT_SECONDARY,
								},
							}}
						/>
					</Box>
				)}
			</DialogContent>
			<DialogActions
				sx={{
					backgroundColor: COLOR_SURFACE,
					borderTop: `1px solid ${COLOR_TEXT_SECONDARY}30`,
					gap: 1,
				}}
			>
				<Button
					onClick={onClose}
					sx={{
						color: COLOR_TEXT_SECONDARY,
						"&:hover": {
							backgroundColor: COLOR_TEXT_SECONDARY + "10",
						},
					}}
				>
					Anuluj
				</Button>
				<Button
					onClick={handleSubmit}
					variant="contained"
					disabled={!vehicleId || !subject.trim() || isSubmitting || loading}
					sx={{
						backgroundColor: COLOR_PRIMARY,
						color: "white",
						"&:hover": {
							backgroundColor: COLOR_PRIMARY + "CC",
						},
						"&.Mui-disabled": {
							backgroundColor: COLOR_TEXT_SECONDARY + "30",
							color: COLOR_TEXT_SECONDARY + "60",
						},
					}}
				>
					{isSubmitting ? (
						<CircularProgress size={20} sx={{ color: "white" }} />
					) : (
						"Create"
					)}
				</Button>
			</DialogActions>
		</Dialog>
	);
};

const RealChatDialog: React.FC<RealChatDialogProps> = ({ onClose }) => {
	const [message, setMessage] = useState("");
	const [selectedConversation, setSelectedConversation] =
		useState<Conversation | null>(null);
	const [showCreateDialog, setShowCreateDialog] = useState(false);

	// Chat API hook
	const {
		conversations,
		messages,
		isLoading,
		error,
		fetchConversations,
		fetchMessages,
		sendMessage: apiSendMessage,
		markAsRead,
		createConversation,
	} = useChatApi();

	// WebSocket - włączamy komunikację real-time
	const { isConnected } = useChatWebSocket({
		conversationUuid: selectedConversation?.uuid,
		onMessageReceived: (newMessage: Message) => {
			console.log("Otrzymano nową wiadomość:", newMessage);
			// Automatycznie odśwież wiadomości
			if (selectedConversation) {
				fetchMessages(selectedConversation.uuid);
			}
		},
		autoConnect: true,
	});

	// Load conversations on mount
	useEffect(() => {
		console.log("🚀 RealChatDialog: Loading conversations...");
		fetchConversations()
			.then(() => {
				console.log("✅ Conversations loaded:", conversations.length);
			})
			.catch((err) => {
				console.error("❌ Error loading conversations:", err);
			});
	}, [fetchConversations]);

	// Load messages when conversation is selected
	useEffect(() => {
		if (selectedConversation) {
			console.log(
				"🚀 Loading messages for conversation:",
				selectedConversation.uuid
			);
			fetchMessages(selectedConversation.uuid)
				.then(() => {
					console.log("✅ Messages loaded:", messages.length);
					// Mark conversation as read when opening it
					return markAsRead(selectedConversation.uuid);
				})
				.then(() => {
					console.log("✅ Conversation marked as read");
				})
				.catch((err) => {
					console.error("❌ Error loading messages or marking as read:", err);
				});
		}
	}, [selectedConversation?.uuid]); // Tylko UUID konwersacji

	// Select first conversation by default
	useEffect(() => {
		if (conversations.length > 0 && !selectedConversation) {
			setSelectedConversation(conversations[0]);
		}
	}, [conversations.length, selectedConversation?.uuid]); // Bardziej konkretne dependencies

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

	const handleCreateConversation = async (
		vehicleId: number,
		subject: string
	) => {
		try {
			const newConversation = await createConversation({
				vehicle_id: vehicleId,
				subject,
				priority: "normal",
			});
			setSelectedConversation(newConversation);
			setShowCreateDialog(false);
		} catch (error) {
			console.error("Failed to create conversation:", error);
			alert("Nie udało się utworzyć konwersacji");
		}
	};

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
					backgroundColor: COLOR_BACKGROUND,
				}}
			>
				<CircularProgress sx={{ color: COLOR_PRIMARY }} />
				<Typography sx={{ ml: 2, color: COLOR_TEXT_PRIMARY }}>
					Loading conversations...
				</Typography>
			</Box>
		);
	}

	if (error) {
		return (
			<Box sx={{ height: "100%", p: 2, backgroundColor: COLOR_BACKGROUND }}>
				<Alert
					severity="error"
					sx={{
						backgroundColor: "rgba(239, 68, 68, 0.1)",
						color: COLOR_TEXT_PRIMARY,
						border: "1px solid rgba(239, 68, 68, 0.3)",
					}}
				>
					Chat loading error: {error}
				</Alert>
				<Button
					onClick={() => fetchConversations()}
					sx={{
						mt: 2,
						backgroundColor: COLOR_PRIMARY,
						color: "white",
						"&:hover": {
							backgroundColor: COLOR_PRIMARY + "CC",
						},
					}}
				>
					Try again
				</Button>
			</Box>
		);
	}

	return (
		<Box
			sx={{
				height: "100%",
				display: "flex",
				flexDirection: "column",
				backgroundColor: COLOR_BACKGROUND,
				color: COLOR_TEXT_PRIMARY,
			}}
		>
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
				<Typography variant="h6">Chat with mechanic</Typography>
				<Box sx={{ flexGrow: 1 }} />

				{/* Connection status */}
				<Chip
					size="small"
					label={isConnected ? "Connected" : "HTTP API only"}
					sx={{
						bgcolor: isConnected ? COLOR_SUCCESS : COLOR_WARNING + "80",
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
						borderColor: COLOR_TEXT_SECONDARY + "30",
						backgroundColor: COLOR_SURFACE,
						overflow: "auto",
					}}
				>
					<Typography
						variant="h6"
						sx={{
							p: 2,
							bgcolor: COLOR_SURFACE,
							color: COLOR_TEXT_PRIMARY,
							borderBottom: 1,
							borderColor: COLOR_TEXT_SECONDARY + "20",
						}}
					>
						<Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
							Conversations ({conversations.length})
							{isLoading && (
								<CircularProgress
									size={16}
									sx={{ color: COLOR_TEXT_PRIMARY }}
								/>
							)}
						</Box>
						{error && " - connection error"}
					</Typography>

					{conversations.length === 0 ? (
<<<<<<< HEAD
						<>
							<Box sx={{ p: 2, textAlign: "center" }}>
								<Typography sx={{ color: COLOR_TEXT_SECONDARY }}>
									Brak aktywnych konwersacji
								</Typography>
								<Typography
									variant="caption"
									sx={{ color: COLOR_TEXT_SECONDARY }}
								>
									Rozpocznij nową rozmowę z mechanikiem
								</Typography>
							</Box>

							{/* Kafelek nowej konwersacji gdy brak konwersacji */}
							<ListItem
								button
								onClick={() => setShowCreateDialog(true)}
								sx={{
									backgroundColor: COLOR_SURFACE + "80",
									"&:hover": {
										backgroundColor: COLOR_PRIMARY + "15",
									},
									py: 2,
									px: 2,
									borderTop: 1,
									borderColor: COLOR_TEXT_SECONDARY + "20",
								}}
							>
								<Avatar
									sx={{
										mr: 2,
										bgcolor: COLOR_PRIMARY + "30",
										border: `2px dashed ${COLOR_PRIMARY}80`,
										color: COLOR_PRIMARY,
									}}
								>
									<AddIcon />
								</Avatar>
								<ListItemText
									primary={
										<Typography
											variant="subtitle2"
											sx={{
												color: COLOR_PRIMARY,
												fontWeight: 500,
											}}
										>
											Nowa konwersacja
										</Typography>
									}
									secondary={
										<Typography
											variant="body2"
											sx={{ color: COLOR_TEXT_SECONDARY }}
										>
											Rozpocznij rozmowę z mechanikiem
										</Typography>
									}
								/>
							</ListItem>
						</>
=======
						<Box sx={{ p: 2, textAlign: "center" }}>
							<Typography sx={{ color: COLOR_TEXT_SECONDARY }}>
								No active conversations
							</Typography>
							<Typography
								variant="caption"
								sx={{ color: COLOR_TEXT_SECONDARY }}
							>
								Start a conversation below
							</Typography>
						</Box>
>>>>>>> 7840ee9 (final touches)
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
										borderColor: COLOR_TEXT_SECONDARY + "20",
										"&:hover": {
											backgroundColor: COLOR_BACKGROUND + "80",
										},
										"&.Mui-selected": {
											backgroundColor: COLOR_PRIMARY + "20",
											"&:hover": {
												backgroundColor: COLOR_PRIMARY + "30",
											},
										},
									}}
								>
									<Avatar sx={{ mr: 2, bgcolor: COLOR_PRIMARY }}>
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
												<Typography
													variant="subtitle2"
													sx={{ color: COLOR_TEXT_PRIMARY }}
												>
													{conv.mechanic_name}
												</Typography>
												<Typography
													variant="caption"
													sx={{ color: COLOR_TEXT_SECONDARY }}
												>
													{formatTime(conv.last_message_at)}
												</Typography>
											</Box>
										}
										secondary={
											<Box>
												<Typography
													variant="body2"
													sx={{ color: COLOR_TEXT_SECONDARY }}
												>
													{conv.subject}
												</Typography>
												<Chip
													size="small"
													label={
														conv.status === "active"
															? "Active"
															: conv.status === "waiting_client"
															? "Waiting for reply"
															: conv.status === "waiting_mechanic"
															? "Mechanic will reply"
															: conv.status === "resolved"
															? "Resolved"
															: conv.status === "closed"
															? "Closed"
															: conv.status
													}
													sx={{
														mt: 0.5,
														height: 22,
														fontSize: "0.7rem",
														bgcolor:
															conv.status === "active"
																? COLOR_SUCCESS + "20"
																: conv.status === "waiting_client"
																? COLOR_WARNING + "20"
																: conv.status === "waiting_mechanic"
																? COLOR_PRIMARY + "20"
																: conv.status === "resolved"
																? COLOR_TEXT_SECONDARY + "20"
																: conv.status === "closed"
																? COLOR_TEXT_SECONDARY + "20"
																: COLOR_TEXT_SECONDARY + "20",
														color:
															conv.status === "active"
																? COLOR_SUCCESS
																: conv.status === "waiting_client"
																? COLOR_WARNING
																: conv.status === "waiting_mechanic"
																? COLOR_PRIMARY
																: conv.status === "resolved"
																? COLOR_TEXT_SECONDARY
																: conv.status === "closed"
																? COLOR_TEXT_SECONDARY
																: COLOR_TEXT_SECONDARY,
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

							{/* New conversation tile */}
							<ListItem
								button
								onClick={() => setShowCreateDialog(true)}
								sx={{
									borderTop: conversations.length > 0 ? 1 : 0,
									borderColor: COLOR_TEXT_SECONDARY + "20",
									backgroundColor: COLOR_SURFACE + "80",
									"&:hover": {
										backgroundColor: COLOR_PRIMARY + "15",
									},
									py: 2,
									px: 2,
								}}
							>
								<Avatar
									sx={{
										mr: 2,
										bgcolor: COLOR_PRIMARY + "30",
										border: `2px dashed ${COLOR_PRIMARY}80`,
										color: COLOR_PRIMARY,
									}}
								>
									<AddIcon />
								</Avatar>
								<ListItemText
									primary={
										<Typography
											variant="subtitle2"
											sx={{
												color: COLOR_PRIMARY,
												fontWeight: 500,
											}}
										>
											New Conversation
										</Typography>
									}
									secondary={
										<Typography
											variant="body2"
											sx={{ color: COLOR_TEXT_SECONDARY }}
										>
											Start a conversation with a mechanic
										</Typography>
									}
								/>
							</ListItem>
						</List>
					)}
				</Paper>

				{/* Chat Window */}
				{selectedConversation ? (
					<Box
						sx={{
							flex: 1,
							display: "flex",
							flexDirection: "column",
							backgroundColor: COLOR_BACKGROUND,
						}}
					>
						{/* Chat Header */}
						<Box
							sx={{
								p: 2,
								borderBottom: 1,
								borderColor: COLOR_TEXT_SECONDARY + "30",
								bgcolor: COLOR_SURFACE,
								display: "flex",
								alignItems: "center",
								gap: 2,
							}}
						>
							<Avatar sx={{ bgcolor: COLOR_PRIMARY }}>
								<BuildIcon />
							</Avatar>
							<Box>
								<Typography variant="h6" sx={{ color: COLOR_TEXT_PRIMARY }}>
									{selectedConversation.mechanic_name}
								</Typography>
								<Typography
									variant="body2"
									sx={{ color: COLOR_TEXT_SECONDARY }}
								>
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
								bgcolor: COLOR_BACKGROUND,
							}}
						>
							{isLoading && messages.length === 0 ? (
								<Box sx={{ display: "flex", justifyContent: "center", p: 2 }}>
									<CircularProgress size={24} sx={{ color: COLOR_PRIMARY }} />
									<Typography sx={{ ml: 1, color: COLOR_TEXT_PRIMARY }}>
										Loading messages...
									</Typography>
								</Box>
							) : messages.length === 0 ? (
								<Box sx={{ textAlign: "center", p: 4 }}>
									<Typography sx={{ color: COLOR_TEXT_SECONDARY }}>
										No messages in this conversation
									</Typography>
									<Typography
										variant="caption"
										sx={{ color: COLOR_TEXT_SECONDARY }}
									>
										Start a conversation below
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
													color: isClient ? "white" : COLOR_TEXT_PRIMARY,
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
								borderColor: COLOR_TEXT_SECONDARY + "30",
								backgroundColor: COLOR_SURFACE,
								display: "flex",
								gap: 1,
							}}
						>
							<TextField
								fullWidth
								placeholder="Type a message..."
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
								sx={{
									"& .MuiInputBase-input": {
										color: COLOR_TEXT_PRIMARY,
									},
									"& .MuiOutlinedInput-root": {
										backgroundColor: COLOR_BACKGROUND,
										"& fieldset": {
											borderColor: COLOR_TEXT_SECONDARY + "40",
										},
										"&:hover fieldset": {
											borderColor: COLOR_PRIMARY,
										},
										"&.Mui-focused fieldset": {
											borderColor: COLOR_PRIMARY,
										},
									},
									"& .MuiInputBase-input::placeholder": {
										color: COLOR_TEXT_SECONDARY,
									},
								}}
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
							backgroundColor: COLOR_BACKGROUND,
						}}
					>
						<ChatIcon sx={{ fontSize: 64, color: COLOR_TEXT_SECONDARY }} />
						<Typography sx={{ color: COLOR_TEXT_SECONDARY }}>
								Select a conversation to start chatting
						</Typography>
					</Box>
				)}
			</Box>

			{/* Create Conversation Dialog */}
			<CreateConversationDialog
				open={showCreateDialog}
				onClose={() => setShowCreateDialog(false)}
				onSubmit={handleCreateConversation}
			/>
		</Box>
	);
};

export default React.memo(RealChatDialog);
