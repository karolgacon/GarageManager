import React, { useContext } from "react";
import { Box, Typography, IconButton, Avatar, Paper } from "@mui/material";
import EmailIcon from "@mui/icons-material/Email";
import NotificationsIcon from "@mui/icons-material/Notifications";
import { COLOR_PRIMARY } from "../../constants";
import AuthContext from "../../context/AuthProvider";

const HeaderBar = () => {
	const { auth } = useContext(AuthContext);

	return (
		<Paper
			elevation={0}
			sx={{
				p: 2,
				mb: 2, // Zmieniono z mb: 2 na mb: 0, aby usunąć dodatkowy margines na dole
				borderRadius: 1, // Zmieniono z 1 na 0, aby usunąć zaokrąglenie
				backgroundColor: "#fff",
			}}
		>
			<Box
				sx={{
					display: "flex",
					justifyContent: "space-between",
					alignItems: "center",
				}}
			>
				<Box sx={{ ml:2 }}>
					<Typography variant="h6" fontWeight="bold" sx={{ mb: 0 }}>
						Hi, {auth?.user?.name || "Name"}
					</Typography>
					<Typography variant="body2" color="text.secondary">
						Let's check your Garage today
					</Typography>
				</Box>

				<Box sx={{ display: "flex", alignItems: "center", gap: 3 }}>
					<IconButton size="small">
						<EmailIcon />
					</IconButton>
					<IconButton size="small">
						<NotificationsIcon />
					</IconButton>

					<Box sx={{ display: "flex", alignItems: "center", marginRight: 3 }}>
						<Avatar
							sx={{
								bgcolor: COLOR_PRIMARY,
								width: 40,
								height: 40,
							}}
						>
							{auth?.user?.name?.charAt(0) || "N"}
						</Avatar>
						<Box sx={{ ml: 1, display: { xs: "none", sm: "block" } }}>
							<Typography variant="subtitle2" fontWeight="bold">
								{auth?.user?.name || "Name"}
							</Typography>
							<Typography variant="caption" color="text.secondary">
								{auth?.roles?.[0]?.charAt(0).toUpperCase() +
									auth?.roles?.[0]?.slice(1) || "Owner"}
							</Typography>
						</Box>
					</Box>
				</Box>
			</Box>
		</Paper>
	);
};

export default HeaderBar;
