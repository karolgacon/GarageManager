import React, { useState, useContext } from "react";
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
} from "@mui/material";
import { Chat as ChatIcon, Close as CloseIcon } from "@mui/icons-material";
import RealChatDialog from "./RealChatDialog";
import { useChatNotifications } from "../hooks/useChatWebSocket";
import { COLOR_PRIMARY, COLOR_SECONDARY } from "../constants";
import AuthContext from "../context/AuthProvider";

interface FloatingChatButtonProps {
	position?: {
		bottom?: number;
		right?: number;
	};
}

const FloatingChatButton: React.FC<FloatingChatButtonProps> = ({
	position = { bottom: 24, right: 24 },
}) => {
	const [isOpen, setIsOpen] = useState(false);
	const theme = useTheme();
	const isMobile = useMediaQuery(theme.breakpoints.down("md"));

	// Get auth state from context
	const { auth } = useContext(AuthContext);
	const isAuthenticated = auth?.token && !auth?.isLoading;

	// Get notifications for badge count (only if authenticated)
	const { notifications } = useChatNotifications();
	const unreadCount = isAuthenticated
		? notifications.filter((n) => n.type === "new_message").length
		: 0;
	const handleToggleChat = () => {
		setIsOpen(!isOpen);
	};

	const handleCloseChat = () => {
		setIsOpen(false);
	};

	// Don't render if user is not authenticated
	if (!isAuthenticated) {
		return null;
	}

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
							color: "white",
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

			{/* Chat Dialog */}
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

				<DialogContent sx={{ p: 0, height: "100%", overflow: "hidden" }}>
					<Box sx={{ height: "100%", width: "100%" }}>
						<RealChatDialog onClose={handleCloseChat} />
					</Box>
				</DialogContent>
			</Dialog>
		</>
	);
};

export default FloatingChatButton;
