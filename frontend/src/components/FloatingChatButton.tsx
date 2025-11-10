import React, { useState, useContext, useEffect } from "react";
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
import {
	COLOR_PRIMARY,
	COLOR_SECONDARY,
	COLOR_SURFACE,
	COLOR_TEXT_PRIMARY,
} from "../constants";
import AuthContext from "../context/AuthProvider";
import axios from "axios";

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
	const [unreadCount, setUnreadCount] = useState(0);
	const theme = useTheme();
	const isMobile = useMediaQuery(theme.breakpoints.down("md"));

	// Get auth state from context
	const { auth } = useContext(AuthContext);
	const isAuthenticated = auth?.token && !auth?.isLoading;

	// Get notifications for badge count (only if authenticated)
	const { notifications } = useChatNotifications();

	// Fetch unread count from API
	useEffect(() => {
		if (!isAuthenticated) {
			setUnreadCount(0);
			return;
		}

		const fetchUnreadCount = async () => {
			console.log("💬 Fetching unread count...");
			try {
				const response = await axios.get(
					"/api/v1/chat/conversations/unread_count/",
					{
						headers: {
							Authorization: `Bearer ${auth?.token}`,
						},
					}
				);
				console.log("💬 Unread count response:", response.data);
				setUnreadCount(response.data.unread_count || 0);
			} catch (error) {
				console.error("❌ Failed to fetch unread count:", error);
				setUnreadCount(0);
			}
		};

		fetchUnreadCount();

		// Refresh count every 30 seconds
		const interval = setInterval(fetchUnreadCount, 30000);
		return () => clearInterval(interval);
	}, [isAuthenticated, auth?.token]);

	// Update count when new chat notifications arrive
	useEffect(() => {
		const chatNotifications = notifications.filter(
			(n) => n.type === "new_message"
		);
		if (chatNotifications.length > 0) {
			// Refresh count when new chat message notifications arrive
			const fetchUnreadCount = async () => {
				try {
					const response = await axios.get(
						"/api/v1/chat/conversations/unread_count/",
						{
							headers: {
								Authorization: `Bearer ${auth?.token}`,
							},
						}
					);
					setUnreadCount(response.data.unread_count || 0);
				} catch (error) {
					console.error("Failed to fetch unread count:", error);
				}
			};
			fetchUnreadCount();
		}
	}, [notifications, auth?.token]);

	const handleToggleChat = () => {
		setIsOpen(!isOpen);
	};

	const handleCloseChat = () => {
		setIsOpen(false);
		// Refresh unread count when chat is closed (in case messages were read)
		if (isAuthenticated) {
			const fetchUnreadCount = async () => {
				try {
					const response = await axios.get(
						"/api/v1/chat/conversations/unread_count/",
						{
							headers: {
								Authorization: `Bearer ${auth?.token}`,
							},
						}
					);
					setUnreadCount(response.data.unread_count || 0);
				} catch (error) {
					console.error("Failed to fetch unread count:", error);
				}
			};
			fetchUnreadCount();
		}
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
						backgroundColor: COLOR_SURFACE,
						color: COLOR_TEXT_PRIMARY,
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
						bgcolor: COLOR_SURFACE,
						color: COLOR_TEXT_PRIMARY,
						boxShadow: 1,
						"&:hover": {
							bgcolor: COLOR_PRIMARY,
							color: "white",
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
