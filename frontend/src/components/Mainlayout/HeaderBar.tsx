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
import {
	COLOR_PRIMARY,
	COLOR_SURFACE,
	COLOR_TEXT_PRIMARY,
	COLOR_TEXT_SECONDARY,
} from "../../constants";
import AuthContext from "../../context/AuthProvider";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { set } from "date-fns";

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
			setNotifications([]);
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
			setEmails([]);
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
			setNotifications((prevNotifications) =>
				prevNotifications.map((notification) =>
					notification.id === notificationId
						? { ...notification, read_status: false }
						: notification
				)
			);
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
			if (isEmail) {
				setEmails((prevEmails) =>
					prevEmails.map((email) => ({
						...email,
						read_status: false,
					}))
				);
			}
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
				p: { xs: 1.5, sm: 2 }, // Mniejszy padding na mobile
				mb: { xs: 0, sm: 2 }, // Brak marginesu dolnego na mobile
				mt: { xs: 0, sm: 0 }, // Brak marginesu górnego
				borderRadius: { xs: 0, sm: 1 },
				backgroundColor: COLOR_SURFACE, // Ciemne tło headerbar
				color: COLOR_TEXT_PRIMARY, // Jasny tekst
				position: { xs: "fixed", sm: "static" }, // Fixed na mobile, static na desktop
				top: { xs: 56, sm: "auto" }, // Pod AppBar na mobile
				left: { xs: 0, sm: "auto" }, // Pełna szerokość na mobile
				right: { xs: 0, sm: "auto" },
				zIndex: { xs: 1200, sm: "auto" }, // Wyższy z-index tylko na mobile
				boxShadow: "0 2px 10px rgba(0,0,0,0.3)",
				border: `1px solid rgba(228, 230, 232, 0.1)`,
				width: { xs: "100%", sm: "100%" }, // Pełna szerokość na obu
				maxWidth: "100%",
				overflowX: "hidden",
			}}
		>
			<Box
				sx={{
					display: "flex",
					justifyContent: "space-between",
					alignItems: "center",
					width: "100%",
					maxWidth: "100%",
					overflowX: "hidden", // Zapobiegnie poziomemu overflow
				}}
			>
				<Box sx={{ ml: { xs: 1, sm: 2 } }}>
					<Typography
						variant="h6"
						fontWeight="bold"
						sx={{
							mb: 0,
							color: COLOR_TEXT_PRIMARY,
						}}
					>
						Hi, {auth?.username || "Name"}
					</Typography>
					<Typography variant="body2" sx={{ color: COLOR_TEXT_SECONDARY }}>
						Let's check your Garage today
					</Typography>
				</Box>

				<Box
					sx={{
						display: "flex",
						alignItems: "center",
						gap: { xs: 1.5, sm: 3 }, // Mniejszy gap na mobile
						paddingRight: { xs: 1, sm: 3 }, // Mniejszy padding na mobile
						marginRight: isMobile ? 0 : 1,
						minWidth: 0, // Pozwoli na flex shrink
						flex: "0 0 auto", // Nie będzie się rozciągać
					}}
				>
					<IconButton
						size="small"
						onClick={handleEmailClick}
						sx={{ color: COLOR_TEXT_PRIMARY }}
					>
						<Badge badgeContent={unreadEmailsCount} color="error">
							<EmailIcon sx={{ color: COLOR_TEXT_PRIMARY }} />
						</Badge>
					</IconButton>

					<IconButton
						size="small"
						onClick={handleNotificationClick}
						sx={{ color: COLOR_TEXT_PRIMARY }}
					>
						<Badge badgeContent={unreadNotificationsCount} color="error">
							<NotificationsIcon sx={{ color: COLOR_TEXT_PRIMARY }} />
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
							<Typography
								variant="subtitle2"
								fontWeight="bold"
								sx={{ color: COLOR_TEXT_PRIMARY }}
							>
								{auth?.username || "Name"}
							</Typography>
							<Typography
								variant="caption"
								sx={{ color: COLOR_TEXT_SECONDARY }}
							>
								{(auth?.roles?.[0]?.charAt(0).toUpperCase() || "") +
									(auth?.roles?.[0]?.slice(1) || "Owner")}
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
					sx={{ zIndex: 1600, width: 320, maxWidth: "90vw" }}
				>
					<ClickAwayListener onClickAway={handleEmailClose}>
						<Paper
							elevation={3}
							sx={{
								overflow: "visible",
								filter: "drop-shadow(0px 2px 8px rgba(0,0,0,0.3))",
								mt: 1.5,
								maxHeight: "70vh",
								overflowY: "auto",
								backgroundColor: COLOR_SURFACE,
								color: COLOR_TEXT_PRIMARY,
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
								<Typography
									variant="subtitle1"
									fontWeight="bold"
									sx={{ color: COLOR_TEXT_PRIMARY }}
								>
									Emails
								</Typography>
								{unreadEmailsCount > 0 && (
									<IconButton
										size="small"
										onClick={() => markAllAsRead(true)}
										title="Mark all as read"
										sx={{ color: COLOR_TEXT_PRIMARY }}
									>
										<DoneAllIcon
											fontSize="small"
											sx={{ color: COLOR_TEXT_PRIMARY }}
										/>
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
												borderBottom: `1px solid ${COLOR_TEXT_SECONDARY}40`,
												backgroundColor: email.read_status
													? "transparent"
													: `${COLOR_PRIMARY}20`,
												transition: "background-color 0.2s",
												"&:hover": {
													backgroundColor: `${COLOR_SURFACE}80`,
												},
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
														sx={{ color: COLOR_TEXT_PRIMARY }}
													>
														{email.notification_type.replace(/_/g, " ")}
													</Typography>
													<Typography
														variant="caption"
														sx={{ color: COLOR_TEXT_SECONDARY }}
													>
														{formatDate(email.created_at)}
													</Typography>
												</Box>
												<Typography
													variant="body2"
													sx={{
														overflow: "hidden",
														textOverflow: "ellipsis",
														display: "-webkit-box",
														WebkitLineClamp: 2,
														WebkitBoxOrient: "vertical",
														color: COLOR_TEXT_SECONDARY,
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
									<Typography
										variant="body2"
										sx={{ color: COLOR_TEXT_SECONDARY }}
									>
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
					sx={{ zIndex: 1600, width: 320, maxWidth: "90vw" }}
				>
					<ClickAwayListener onClickAway={handleNotificationClose}>
						<Paper
							elevation={3}
							sx={{
								overflow: "visible",
								filter: "drop-shadow(0px 2px 8px rgba(0,0,0,0.3))",
								mt: 1.5,
								maxHeight: "70vh",
								overflowY: "auto",
								backgroundColor: COLOR_SURFACE,
								color: COLOR_TEXT_PRIMARY,
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
								<Typography
									variant="subtitle1"
									fontWeight="bold"
									sx={{ color: COLOR_TEXT_PRIMARY }}
								>
									Notifications
								</Typography>
								{unreadNotificationsCount > 0 && (
									<IconButton
										size="small"
										onClick={() => markAllAsRead(false)}
										title="Mark all as read"
										sx={{ color: COLOR_TEXT_PRIMARY }}
									>
										<DoneAllIcon
											fontSize="small"
											sx={{ color: COLOR_TEXT_PRIMARY }}
										/>
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
												borderBottom: `1px solid ${COLOR_TEXT_SECONDARY}40`,
												backgroundColor: notification.read_status
													? "transparent"
													: `${COLOR_PRIMARY}20`,
												transition: "background-color 0.2s",
												"&:hover": {
													backgroundColor: `${COLOR_SURFACE}80`,
												},
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
														sx={{ color: COLOR_TEXT_PRIMARY }}
													>
														{notification.notification_type.replace(/_/g, " ")}
													</Typography>
													<Typography
														variant="caption"
														sx={{ color: COLOR_TEXT_SECONDARY }}
													>
														{formatDate(notification.created_at)}
													</Typography>
												</Box>
												<Typography
													variant="body2"
													sx={{
														overflow: "hidden",
														textOverflow: "ellipsis",
														display: "-webkit-box",
														WebkitLineClamp: 2,
														WebkitBoxOrient: "vertical",
														color: COLOR_TEXT_SECONDARY,
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
									<Typography
										variant="body2"
										sx={{ color: COLOR_TEXT_SECONDARY }}
									>
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
					placement="bottom-start"
					disablePortal={false}
					modifiers={[
						{
							name: "preventOverflow",
							enabled: true,
							options: {
								altAxis: true,
								altBoundary: true,
								tether: false, // Wyłączenie tether żeby menu nie było przesuwane
								rootBoundary: "viewport", // Zmiana na viewport
								padding: 8,
							},
						},
						{
							name: "offset",
							options: {
								offset: [0, 15], // Zwiększenie offsetu żeby menu było niżej
							},
						},
					]}
					sx={{ zIndex: 1600 }}
				>
					<ClickAwayListener onClickAway={handleClose}>
						<Paper
							elevation={3}
							sx={{
								overflow: "visible",
								filter: "drop-shadow(0px 2px 8px rgba(0,0,0,0.3))",
								mt: 0.5, // Zmniejszony margines top
								minWidth: 200,
								marginRight: 2,
								backgroundColor: COLOR_SURFACE,
								color: COLOR_TEXT_PRIMARY,
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
									<ListItemText
										primary="My Profile"
										sx={{ color: COLOR_TEXT_PRIMARY }}
									/>
								</MenuItem>

								<MenuItem onClick={() => handleMenuItemClick("/bookings")}>
									<ListItemIcon>
										<CalendarMonthIcon
											fontSize="small"
											sx={{ color: COLOR_PRIMARY }}
										/>
									</ListItemIcon>
									<ListItemText
										primary="Calendar"
										sx={{ color: COLOR_TEXT_PRIMARY }}
									/>
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
										<LogoutIcon
											fontSize="small"
											sx={{ color: COLOR_PRIMARY }}
										/>
									</ListItemIcon>
									<ListItemText
										primary="Logout"
										sx={{ color: COLOR_TEXT_PRIMARY }}
									/>
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
