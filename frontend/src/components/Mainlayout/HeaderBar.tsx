import React, { useContext, useState } from "react";
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
} from "@mui/material";
import EmailIcon from "@mui/icons-material/Email";
import NotificationsIcon from "@mui/icons-material/Notifications";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import SettingsIcon from "@mui/icons-material/Settings";
import LogoutIcon from "@mui/icons-material/Logout";
import { COLOR_PRIMARY } from "../../constants";
import AuthContext from "../../context/AuthProvider";
import { useNavigate } from "react-router-dom";

const HeaderBar = () => {
	const { auth, setAuth } = useContext(AuthContext);
	const navigate = useNavigate();
	const theme = useTheme();
	const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

	// State for profile menu
	const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
	const open = Boolean(anchorEl);

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
		// Logic to logout
		setAuth(null);
		localStorage.removeItem("auth");
		navigate("/login");
		handleClose();
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
						paddingRight: 3, // Dodaj padding z prawej strony
						marginRight: isMobile ? 0 : 1, // Usuń marginRight na urządzeniach mobilnych
					}}
				>
					<IconButton size="small">
						<EmailIcon />
					</IconButton>
					<IconButton size="small">
						<NotificationsIcon />
					</IconButton>

					<Box
						sx={{
							display: "flex",
							alignItems: "center",
							cursor: "pointer",
							position: "relative", // Usuń marginRight: 3, skoro dodajemy padding do rodzica
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

			{/* Profile Menu */}
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
								offset: [0, 10], // [poziomo (ujemne wartości - w lewo), pionowo (dodatnie - w dół)]
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
								marginRight: 2, // Dodaj margines z prawej strony
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

								<MenuItem onClick={() => handleMenuItemClick("/calendar")}>
									<ListItemIcon>
										<CalendarMonthIcon
											fontSize="small"
											sx={{ color: COLOR_PRIMARY }}
										/>
									</ListItemIcon>
									<ListItemText>Calendar</ListItemText>
								</MenuItem>

								<MenuItem onClick={() => handleMenuItemClick("/settings")}>
									<ListItemIcon>
										<SettingsIcon
											fontSize="small"
											sx={{ color: COLOR_PRIMARY }}
										/>
									</ListItemIcon>
									<ListItemText>Settings</ListItemText>
								</MenuItem>

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
