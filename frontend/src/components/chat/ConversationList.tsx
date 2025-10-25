import React, { useState } from "react";
import {
	Box,
	List,
	ListItem,
	ListItemButton,
	ListItemText,
	ListItemAvatar,
	Avatar,
	Typography,
	Chip,
	TextField,
	InputAdornment,
	IconButton,
	Button,
	Dialog,
	DialogTitle,
	DialogContent,
	DialogActions,
	FormControl,
	InputLabel,
	Select,
	MenuItem,
	CircularProgress,
	Alert,
	Divider,
	Badge,
} from "@mui/material";
import {
	Search as SearchIcon,
	Add as AddIcon,
	Person as PersonIcon,
	Build as BuildIcon,
} from "@mui/icons-material";
import { formatDistanceToNow } from "date-fns";
import { pl } from "date-fns/locale";
import { Conversation } from "../../models/chat";

interface ConversationListProps {
	conversations: Conversation[];
	selectedConversation: Conversation | null;
	onConversationSelect: (conversation: Conversation) => void;
	onCreateConversation: (
		mechanicId: number,
		workshopId: number,
		subject: string
	) => Promise<Conversation>;
	isLoading: boolean;
	error: string | null;
}

interface CreateConversationDialogProps {
	open: boolean;
	onClose: () => void;
	onSubmit: (
		mechanicId: number,
		workshopId: number,
		subject: string
	) => Promise<void>;
}

const CreateConversationDialog: React.FC<CreateConversationDialogProps> = ({
	open,
	onClose,
	onSubmit,
}) => {
	const [mechanicId, setMechanicId] = useState<number | "">("");
	const [workshopId, setWorkshopId] = useState<number | "">("");
	const [subject, setSubject] = useState("");
	const [isSubmitting, setIsSubmitting] = useState(false);

	const handleSubmit = async () => {
		if (!mechanicId || !workshopId || !subject.trim()) return;

		try {
			setIsSubmitting(true);
			await onSubmit(Number(mechanicId), Number(workshopId), subject);
			setMechanicId("");
			setWorkshopId("");
			setSubject("");
			onClose();
		} catch (error) {
			console.error("Failed to create conversation:", error);
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
			<DialogTitle>Nowa konwersacja</DialogTitle>
			<DialogContent>
				<Box sx={{ pt: 2, display: "flex", flexDirection: "column", gap: 2 }}>
					<FormControl fullWidth>
						<InputLabel>Warsztat</InputLabel>
						<Select
							value={workshopId}
							onChange={(e) => setWorkshopId(e.target.value as number)}
							label="Warsztat"
						>
							<MenuItem value={1}>Warsztat AutoSerwis</MenuItem>
							<MenuItem value={2}>Warsztat Express</MenuItem>
							<MenuItem value={3}>Warsztat Premium</MenuItem>
						</Select>
					</FormControl>

					<FormControl fullWidth>
						<InputLabel>Mechanik</InputLabel>
						<Select
							value={mechanicId}
							onChange={(e) => setMechanicId(e.target.value as number)}
							label="Mechanik"
						>
							<MenuItem value={1}>Jan Kowalski</MenuItem>
							<MenuItem value={2}>Piotr Nowak</MenuItem>
							<MenuItem value={3}>Anna Wiśniewska</MenuItem>
						</Select>
					</FormControl>

					<TextField
						fullWidth
						label="Temat"
						value={subject}
						onChange={(e) => setSubject(e.target.value)}
						placeholder="Opisz problem lub pytanie..."
						multiline
						rows={3}
					/>
				</Box>
			</DialogContent>
			<DialogActions>
				<Button onClick={onClose}>Anuluj</Button>
				<Button
					onClick={handleSubmit}
					variant="contained"
					disabled={
						!mechanicId || !workshopId || !subject.trim() || isSubmitting
					}
				>
					{isSubmitting ? <CircularProgress size={20} /> : "Utwórz"}
				</Button>
			</DialogActions>
		</Dialog>
	);
};

const ConversationList: React.FC<ConversationListProps> = ({
	conversations,
	selectedConversation,
	onConversationSelect,
	onCreateConversation,
	isLoading,
	error,
}) => {
	const [searchQuery, setSearchQuery] = useState("");
	const [showCreateDialog, setShowCreateDialog] = useState(false);

	const filteredConversations = conversations.filter(
		(conversation) =>
			conversation.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
			conversation.participants.some((p) =>
				p.user_name.toLowerCase().includes(searchQuery.toLowerCase())
			)
	);

	const handleCreateConversation = async (
		mechanicId: number,
		workshopId: number,
		subject: string
	) => {
		await onCreateConversation(mechanicId, workshopId, subject);
	};

	const formatLastActivity = (conversation: Conversation) => {
		const lastMessage = conversation.last_message;
		if (!lastMessage) return "Brak wiadomości";

		return formatDistanceToNow(new Date(lastMessage.created_at), {
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
			<Box sx={{ p: 2, borderBottom: 1, borderColor: "divider" }}>
				<Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
					<Typography variant="h6" sx={{ flexGrow: 1 }}>
						Konwersacje
					</Typography>
					<IconButton
						size="small"
						color="primary"
						onClick={() => setShowCreateDialog(true)}
					>
						<AddIcon />
					</IconButton>
				</Box>

				{/* Search */}
				<TextField
					fullWidth
					size="small"
					placeholder="Szukaj konwersacji..."
					value={searchQuery}
					onChange={(e) => setSearchQuery(e.target.value)}
					InputProps={{
						startAdornment: (
							<InputAdornment position="start">
								<SearchIcon fontSize="small" />
							</InputAdornment>
						),
					}}
				/>
			</Box>

			{/* Error Display */}
			{error && (
				<Box sx={{ p: 2 }}>
					<Alert severity="error">{error}</Alert>
				</Box>
			)}

			{/* Loading */}
			{isLoading && (
				<Box sx={{ display: "flex", justifyContent: "center", p: 3 }}>
					<CircularProgress />
				</Box>
			)}

			{/* Conversations List */}
			<Box sx={{ flex: 1, overflow: "auto" }}>
				<List sx={{ p: 0 }}>
					{filteredConversations.map((conversation, index) => (
						<React.Fragment key={conversation.uuid}>
							<ListItem disablePadding>
								<ListItemButton
									selected={selectedConversation?.uuid === conversation.uuid}
									onClick={() => onConversationSelect(conversation)}
									sx={{ py: 2 }}
								>
									<ListItemAvatar>
										<Badge
											badgeContent={conversation.unread_count || 0}
											color="error"
											max={99}
										>
											<Avatar sx={{ bgcolor: "primary.main" }}>
												{conversation.conversation_type === "support" ? (
													<BuildIcon />
												) : (
													<PersonIcon />
												)}
											</Avatar>
										</Badge>
									</ListItemAvatar>

									<ListItemText
										primary={
											<Box
												sx={{ display: "flex", alignItems: "center", gap: 1 }}
											>
												<Typography
													variant="subtitle2"
													sx={{
														fontWeight: conversation.unread_count
															? "bold"
															: "normal",
														flex: 1,
													}}
													noWrap
												>
													{conversation.subject}
												</Typography>
												<Chip
													size="small"
													label={getStatusLabel(conversation.status)}
													color={getStatusColor(conversation.status) as any}
													variant="outlined"
												/>
											</Box>
										}
										secondary={
											<Box>
												<Typography
													variant="body2"
													color="text.secondary"
													noWrap
												>
													{conversation.participants
														.map((p) => p.user_name)
														.join(", ")}
												</Typography>
												{conversation.last_message && (
													<Typography variant="caption" color="text.secondary">
														{conversation.last_message.content.substring(0, 50)}
														{conversation.last_message.content.length > 50
															? "..."
															: ""}
													</Typography>
												)}
												<Typography
													variant="caption"
													color="text.secondary"
													display="block"
												>
													{formatLastActivity(conversation)}
												</Typography>
											</Box>
										}
									/>
								</ListItemButton>
							</ListItem>
							{index < filteredConversations.length - 1 && <Divider />}
						</React.Fragment>
					))}
				</List>

				{/* Empty State */}
				{!isLoading && filteredConversations.length === 0 && (
					<Box
						sx={{
							display: "flex",
							flexDirection: "column",
							alignItems: "center",
							justifyContent: "center",
							p: 4,
							textAlign: "center",
						}}
					>
						<Typography variant="h6" color="text.secondary" gutterBottom>
							{searchQuery ? "Brak wyników" : "Brak konwersacji"}
						</Typography>
						<Typography variant="body2" color="text.secondary" paragraph>
							{searchQuery
								? "Spróbuj użyć innych słów kluczowych"
								: "Rozpocznij nową konwersację z mechanikiem"}
						</Typography>
						{!searchQuery && (
							<Button
								variant="contained"
								startIcon={<AddIcon />}
								onClick={() => setShowCreateDialog(true)}
							>
								Nowa konwersacja
							</Button>
						)}
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

export default ConversationList;
