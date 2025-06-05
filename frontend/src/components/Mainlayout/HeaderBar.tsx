import React, { useContext, useState, useEffect } from "react";
import {
	Box,
	Typography,
	IconButton,
	Avatar,
	Paper,
	MenuItem,
	ListItemIcon,
	ListItemText,
	Divider,
	useTheme,
	useMediaQuery,
	Popper,
	ClickAwayListener,
	MenuList,
	Badge,
	List,
	ListItem,
	CircularProgress,
} from "@mui/material";
import EmailIcon from "@mui/icons-material/Email";
import NotificationsIcon from "@mui/icons-material/Notifications";
import DoneAllIcon from "@mui/icons-material/DoneAll";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import LogoutIcon from "@mui/icons-material/Logout";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import { COLOR_PRIMARY } from "../../constants";
import AuthContext from "../../context/AuthProvider";
import { useNavigate } from "react-router-dom";
import axios from "axios";

interface Notification {
	id: number;
	message: string;
	read_status: boolean;
	created_at: string;
	notification_type: string;
	channel: string;
}

const HeaderBar = () => {
	const { auth, logout, isAdmin, isOwner, isClient } = useContext(AuthContext);
	const navigate = useNavigate();
	const theme = useTheme();
	const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

	const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
	const open = Boolean(anchorEl);

	const [notificationAnchorEl, setNotificationAnchorEl] =
		useState<null | HTMLElement>(null);
	const notificationOpen = Boolean(notificationAnchorEl);
	const [notifications, setNotifications] = useState<Notification[]>([]);
	const [notificationsLoading, setNotificationsLoading] = useState(false);

	const [emailAnchorEl, setEmailAnchorEl] = useState<null | HTMLElement>(null);
	const emailOpen = Boolean(emailAnchorEl);
	const [emails, setEmails] = useState<Notification[]>([]);
	const [emailsLoading, setEmailsLoading] = useState(false);

	useEffect(() => {
		fetchNotifications();
		fetchEmails();
	}, []);

	const fetchNotifications = async () => {
		if (!auth?.accessToken) return;

		setNotificationsLoading(true);
		try {
			const response = await axios.get("/api/notifications/", {
				params: {
					channel: "push",
					read_status: false,
				},
				headers: {
					Authorization: `Bearer ${auth.accessToken}`,
				},
			});
			setNotifications(response.data);
		} catch (error) {
			console.error("Error fetching notifications:", error);
		} finally {
			setNotificationsLoading(false);
		}
	};

	const fetchEmails = async () => {
		if (!auth?.accessToken) return;

		setEmailsLoading(true);
		try {
			const response = await axios.get("/api/notifications/", {
				params: {
					channel: "email",
					read_status: false,
				},
				headers: {
					Authorization: `Bearer ${auth.accessToken}`,
				},
			});
			setEmails(response.data);
		} catch (error) {
			console.error("Error fetching emails:", error);
		} finally {
			setEmailsLoading(false);
		}
	};

	const markAsRead = async (
		notificationId: number,
		isEmail: boolean = false
	) => {
		if (!auth?.accessToken) return;

		try {
			await axios.patch(
				`/api/notifications/${notificationId}/`,
				{
					read_status: true,
				},
				{
					headers: {
						Authorization: `Bearer ${auth.accessToken}`,
					},
				}
			);

			if (isEmail) {
				setEmails((prevEmails) =>
					prevEmails.map((email) =>
						email.id === notificationId
							? { ...email, read_status: true }
							: email
					)
				);
			} else {
				setNotifications((prevNotifications) =>
					prevNotifications.map((notification) =>
						notification.id === notificationId
							? { ...notification, read_status: true }
							: notification
					)
				);
			}
		} catch (error) {
			console.error("Error marking notification as read:", error);
		}
	};

	const markAllAsRead = async (isEmail: boolean = false) => {
		if (!auth?.accessToken) return;

		const items = isEmail ? emails : notifications;
		const unreadItems = items.filter((item) => !item.read_status);

		if (unreadItems.length === 0) return;

		try {
			await Promise.all(
				unreadItems.map((item) =>
					axios.patch(
						`/api/notifications/${item.id}/`,
						{
							read_status: true,
						},
						{
							headers: {
								Authorization: `Bearer ${auth.accessToken}`,
							},
						}
					)
				)
			);

			if (isEmail) {
				setEmails((prevEmails) =>
					prevEmails.map((email) => ({ ...email, read_status: true }))
				);
			} else {
				setNotifications((prevNotifications) =>
					prevNotifications.map((notification) => ({
						...notification,
						read_status: true,
					}))
				);
			}
		} catch (error) {
			console.error("Error marking all as read:", error);
		}
	};

	const handleNotificationClick = (event: React.MouseEvent<HTMLElement>) => {
		setNotificationAnchorEl(event.currentTarget);
	};

	const handleEmailClick = (event: React.MouseEvent<HTMLElement>) => {
		setEmailAnchorEl(event.currentTarget);
	};

	const handleNotificationClose = () => {
		setNotificationAnchorEl(null);
	};

	const handleEmailClose = () => {
		setEmailAnchorEl(null);
	};

	const handleProfileClick = (event: React.MouseEvent<HTMLElement>) => {
		setAnchorEl(event.currentTarget);
	};

	const handleClose = () => {
		setAnchorEl(null);
	};

	const handleMenuItemClick = (path: string) => {
		navigate(path);
		handleClose();
	};

	const handleLogout = () => {
		logout();
		handleClose();
	};

	const unreadNotificationsCount = notifications.filter(
		(n) => !n.read_status
	).length;
	const unreadEmailsCount = emails.filter((e) => !e.read_status).length;

	const canAccessInvoices = isAdmin() || isOwner() || isClient();

	const formatDate = (dateString: string) => {
		const date = new Date(dateString);
		return date.toLocaleString();
	};

	return (
		<Paper
			elevation={3}
			sx={{
				p: 2,
				mb: 2,
				borderRadius: { xs: 0, sm: 1 },
				backgroundColor: "#fff",
				position: "sticky",
				top: 0,
				zIndex: 1000,
				boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
			}}
		>
			<Box
				sx={{
					display: "flex",
					justifyContent: "space-between",
					alignItems: "center",
				}}
			>
				<Box sx={{ ml: 2 }}>
					<Typography variant="h6" fontWeight="bold" sx={{ mb: 0 }}>
						Hi, {auth?.username || "Name"}
					</Typography>
					<Typography variant="body2" color="text.secondary">
						Let's check your Garage today
					</Typography>
				</Box>

				<Box
					sx={{
						display: "flex",
						alignItems: "center",
						gap: 3,
						paddingRight: 3,
						marginRight: isMobile ? 0 : 1,
					}}
				>
					<IconButton size="small" onClick={handleEmailClick}>
						<Badge badgeContent={unreadEmailsCount} color="error">
							<EmailIcon />
						</Badge>
					</IconButton>

					<IconButton size="small" onClick={handleNotificationClick}>
						<Badge badgeContent={unreadNotificationsCount} color="error">
							<NotificationsIcon />
						</Badge>
					</IconButton>

					<Box
						sx={{
							display: "flex",
							alignItems: "center",
							cursor: "pointer",
							position: "relative",
						}}
						onClick={handleProfileClick}
					>
						<Avatar
							sx={{
								bgcolor: COLOR_PRIMARY,
								width: 40,
								height: 40,
							}}
						>
							{auth?.username?.charAt(0) || "N"}
						</Avatar>
						<Box sx={{ ml: 1, display: { xs: "none", sm: "block" } }}>
							<Typography variant="subtitle2" fontWeight="bold">
								{auth?.username || "Name"}
							</Typography>
							<Typography variant="caption" color="text.secondary">
								{auth?.roles?.[0]?.charAt(0).toUpperCase() +
									auth?.roles?.[0]?.slice(1) || "Owner"}
							</Typography>
						</Box>
					</Box>
				</Box>
			</Box>

			{emailOpen && (
				<Popper
					open={true}
					anchorEl={emailAnchorEl}
					placement="bottom-end"
					disablePortal={false}
					modifiers={[
						{
							name: "preventOverflow",
							enabled: true,
							options: {
								altAxis: true,
								altBoundary: true,
								tether: true,
								rootBoundary: "document",
								padding: 8,
							},
						},
					]}
					sx={{ zIndex: 1500, width: 320, maxWidth: "90vw" }}
				>
					<ClickAwayListener onClickAway={handleEmailClose}>
						<Paper
							elevation={3}
							sx={{
								overflow: "visible",
								filter: "drop-shadow(0px 2px 8px rgba(0,0,0,0.15))",
								mt: 1.5,
								maxHeight: "70vh",
								overflowY: "auto",
							}}
						>
							<Box
								sx={{
									p: 2,
									display: "flex",
									justifyContent: "space-between",
									alignItems: "center",
									borderBottom: "1px solid #eee",
								}}
							>
								<Typography variant="subtitle1" fontWeight="bold">
									Emails
								</Typography>
								{unreadEmailsCount > 0 && (
									<IconButton
										size="small"
										onClick={() => markAllAsRead(true)}
										title="Mark all as read"
									>
										<DoneAllIcon fontSize="small" />
									</IconButton>
								)}
							</Box>

							{emailsLoading ? (
								<Box sx={{ display: "flex", justifyContent: "center", p: 3 }}>
									<CircularProgress size={24} />
								</Box>
							) : emails.length > 0 ? (
								<List sx={{ p: 0 }}>
									{emails.map((email) => (
										<ListItem
											key={email.id}
											sx={{
												borderBottom: "1px solid #f5f5f5",
												backgroundColor: email.read_status
													? "transparent"
													: "#f0f7ff",
												transition: "background-color 0.2s",
												"&:hover": { backgroundColor: "#f5f5f5" },
											}}
											onClick={() => markAsRead(email.id, true)}
										>
											<Box sx={{ width: "100%" }}>
												<Box
													sx={{
														display: "flex",
														justifyContent: "space-between",
														mb: 0.5,
													}}
												>
													<Typography
														variant="subtitle2"
														fontWeight={email.read_status ? "normal" : "bold"}
													>
														{email.notification_type.replace(/_/g, " ")}
													</Typography>
													<Typography variant="caption" color="text.secondary">
														{formatDate(email.created_at)}
													</Typography>
												</Box>
												<Typography
													variant="body2"
													color="text.secondary"
													sx={{
														overflow: "hidden",
														textOverflow: "ellipsis",
														display: "-webkit-box",
														WebkitLineClamp: 2,
														WebkitBoxOrient: "vertical",
													}}
												>
													{email.message}
												</Typography>
											</Box>
										</ListItem>
									))}
								</List>
							) : (
								<Box sx={{ p: 3, textAlign: "center" }}>
									<Typography variant="body2" color="text.secondary">
										No emails to display
									</Typography>
								</Box>
							)}
						</Paper>
					</ClickAwayListener>
				</Popper>
			)}

			{notificationOpen && (
				<Popper
					open={true}
					anchorEl={notificationAnchorEl}
					placement="bottom-end"
					disablePortal={false}
					modifiers={[
						{
							name: "preventOverflow",
							enabled: true,
							options: {
								altAxis: true,
								altBoundary: true,
								tether: true,
								rootBoundary: "document",
								padding: 8,
							},
						},
					]}
					sx={{ zIndex: 1500, width: 320, maxWidth: "90vw" }}
				>
					<ClickAwayListener onClickAway={handleNotificationClose}>
						<Paper
							elevation={3}
							sx={{
								overflow: "visible",
								filter: "drop-shadow(0px 2px 8px rgba(0,0,0,0.15))",
								mt: 1.5,
								maxHeight: "70vh",
								overflowY: "auto",
							}}
						>
							<Box
								sx={{
									p: 2,
									display: "flex",
									justifyContent: "space-between",
									alignItems: "center",
									borderBottom: "1px solid #eee",
								}}
							>
								<Typography variant="subtitle1" fontWeight="bold">
									Notifications
								</Typography>
								{unreadNotificationsCount > 0 && (
									<IconButton
										size="small"
										onClick={() => markAllAsRead(false)}
										title="Mark all as read"
									>
										<DoneAllIcon fontSize="small" />
									</IconButton>
								)}
							</Box>

							{notificationsLoading ? (
								<Box sx={{ display: "flex", justifyContent: "center", p: 3 }}>
									<CircularProgress size={24} />
								</Box>
							) : notifications.length > 0 ? (
								<List sx={{ p: 0 }}>
									{notifications.map((notification) => (
										<ListItem
											key={notification.id}
											sx={{
												borderBottom: "1px solid #f5f5f5",
												backgroundColor: notification.read_status
													? "transparent"
													: "#f0f7ff",
												transition: "background-color 0.2s",
												"&:hover": { backgroundColor: "#f5f5f5" },
											}}
											onClick={() => markAsRead(notification.id)}
										>
											<Box sx={{ width: "100%" }}>
												<Box
													sx={{
														display: "flex",
														justifyContent: "space-between",
														mb: 0.5,
													}}
												>
													<Typography
														variant="subtitle2"
														fontWeight={
															notification.read_status ? "normal" : "bold"
														}
													>
														{notification.notification_type.replace(/_/g, " ")}
													</Typography>
													<Typography variant="caption" color="text.secondary">
														{formatDate(notification.created_at)}
													</Typography>
												</Box>
												<Typography
													variant="body2"
													color="text.secondary"
													sx={{
														overflow: "hidden",
														textOverflow: "ellipsis",
														display: "-webkit-box",
														WebkitLineClamp: 2,
														WebkitBoxOrient: "vertical",
													}}
												>
													{notification.message}
												</Typography>
											</Box>
										</ListItem>
									))}
								</List>
							) : (
								<Box sx={{ p: 3, textAlign: "center" }}>
									<Typography variant="body2" color="text.secondary">
										No notifications to display
									</Typography>
								</Box>
							)}
						</Paper>
					</ClickAwayListener>
				</Popper>
			)}

			{open && (
				<Popper
					open={true}
					anchorEl={anchorEl}
					placement="bottom-end"
					disablePortal={false}
					modifiers={[
						{
							name: "preventOverflow",
							enabled: true,
							options: {
								altAxis: true,
								altBoundary: true,
								tether: true,
								rootBoundary: "document",
								padding: 8,
							},
						},
						{
							name: "offset",
							options: {
								offset: [0, 10],
							},
						},
					]}
					sx={{ zIndex: 1500 }}
				>
					<ClickAwayListener onClickAway={handleClose}>
						<Paper
							elevation={3}
							sx={{
								overflow: "visible",
								filter: "drop-shadow(0px 2px 8px rgba(0,0,0,0.15))",
								mt: 1.5,
								minWidth: 200,
								marginRight: 2,
							}}
						>
							<MenuList>
								<MenuItem onClick={() => handleMenuItemClick("/profile")}>
									<ListItemIcon>
										<AccountCircleIcon
											fontSize="small"
											sx={{ color: COLOR_PRIMARY }}
										/>
									</ListItemIcon>
									<ListItemText>My Profile</ListItemText>
								</MenuItem>

								<MenuItem onClick={() => handleMenuItemClick("/bookings")}>
									<ListItemIcon>
										<CalendarMonthIcon
											fontSize="small"
											sx={{ color: COLOR_PRIMARY }}
										/>
									</ListItemIcon>
									<ListItemText>Calendar</ListItemText>
								</MenuItem>

								{canAccessInvoices && (
									<MenuItem onClick={() => handleMenuItemClick("/invoices")}>
										<ListItemIcon>
											<ReceiptLongIcon
												fontSize="small"
												sx={{ color: COLOR_PRIMARY }}
											/>
										</ListItemIcon>
										<ListItemText>Invoices</ListItemText>
									</MenuItem>
								)}

								<Divider />

								<MenuItem onClick={handleLogout}>
									<ListItemIcon>
										<LogoutIcon fontSize="small" sx={{ color: "error.main" }} />
									</ListItemIcon>
									<ListItemText>Logout</ListItemText>
								</MenuItem>
							</MenuList>
						</Paper>
					</ClickAwayListener>
				</Popper>
			)}
		</Paper>
	);
};

export default HeaderBar;
