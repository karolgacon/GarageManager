import React, { useState } from "react";
import {
	Fab,
	Dialog,
	DialogContent,
	Badge,
	Zoom,
	Tooltip,
	Box,
	IconButton,
	useMediaQuery,
	useTheme,
	Typography,
} from "@mui/material";
import { Chat as ChatIcon, Close as CloseIcon } from "@mui/icons-material";
import {
	COLOR_PRIMARY,
	COLOR_SECONDARY,
	COLOR_TEXT_PRIMARY,
} from "../constants";

interface SimpleChatButtonProps {
	position?: {
		bottom?: number;
		right?: number;
	};
}

const SimpleChatButton: React.FC<SimpleChatButtonProps> = ({
	position = { bottom: 24, right: 24 },
}) => {
	const [isOpen, setIsOpen] = useState(false);
	const theme = useTheme();
	const isMobile = useMediaQuery(theme.breakpoints.down("md"));

	// Mock notifications count for testing
	const unreadCount = 3;

	const handleToggleChat = () => {
		setIsOpen(!isOpen);
	};

	const handleCloseChat = () => {
		setIsOpen(false);
	};

	return (
		<>
			{/* Floating Action Button */}
			<Zoom in={!isOpen}>
				<Tooltip title="Chat z Mechanikiem" placement="left">
					<Fab
						onClick={handleToggleChat}
						sx={{
							position: "fixed",
							bottom: position.bottom,
							right: position.right,
							zIndex: 1300,
							backgroundColor: COLOR_PRIMARY,
							color: COLOR_TEXT_PRIMARY,
							boxShadow: 3,
							"&:hover": {
								backgroundColor: COLOR_SECONDARY,
								boxShadow: 6,
								transform: "scale(1.05)",
							},
							transition: "all 0.2s ease-in-out",
						}}
					>
						<Badge badgeContent={unreadCount} color="error" max={99}>
							<ChatIcon />
						</Badge>
					</Fab>
				</Tooltip>
			</Zoom>

			{/* Simple Chat Dialog */}
			<Dialog
				open={isOpen}
				onClose={handleCloseChat}
				maxWidth={false}
				PaperProps={{
					sx: {
						width: isMobile ? "100vw" : "80vw",
						height: isMobile ? "100vh" : "80vh",
						maxWidth: isMobile ? "100vw" : 1200,
						maxHeight: isMobile ? "100vh" : 800,
						margin: isMobile ? 0 : 2,
						borderRadius: isMobile ? 0 : 2,
						position: "relative",
					},
				}}
				sx={{
					"& .MuiDialog-container": {
						alignItems: isMobile ? "stretch" : "center",
						justifyContent: isMobile ? "stretch" : "center",
					},
				}}
			>
				{/* Close Button */}
				<IconButton
					onClick={handleCloseChat}
					sx={{
						position: "absolute",
						top: 8,
						right: 8,
						zIndex: 1,
						bgcolor: "background.paper",
						boxShadow: 1,
						"&:hover": {
							bgcolor: "grey.100",
						},
					}}
				>
					<CloseIcon />
				</IconButton>

				<DialogContent sx={{ p: 3, height: "100%", overflow: "hidden" }}>
					<Box
						sx={{
							height: "100%",
							width: "100%",
							display: "flex",
							flexDirection: "column",
							alignItems: "center",
							justifyContent: "center",
							textAlign: "center",
						}}
					>
						<ChatIcon
							sx={{
								fontSize: 80,
								color: COLOR_PRIMARY,
								mb: 2,
							}}
						/>
						<Typography variant="h4" gutterBottom>
							Chat z Mechanikiem
						</Typography>
						<Typography variant="body1" color="text.secondary">
							Funkcjonalność czatu jest w trakcie implementacji.
						</Typography>
						<Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
							Będziesz mógł tutaj rozmawiać z mechanikami w czasie rzeczywistym,
							wysyłać załączniki i otrzymywać powiadomienia.
						</Typography>
					</Box>
				</DialogContent>
			</Dialog>
		</>
	);
};

export default SimpleChatButton;
