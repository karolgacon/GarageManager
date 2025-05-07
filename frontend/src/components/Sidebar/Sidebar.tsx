import React, { useContext } from "react";
import {
	Box,
	List,
	ListItemButton,
	ListItemIcon,
	ListItemText,
	Typography,
} from "@mui/material";
import { Link, useLocation } from "react-router-dom";
import DashboardIcon from "@mui/icons-material/Dashboard";
import InventoryIcon from "@mui/icons-material/Inventory";
import BuildIcon from "@mui/icons-material/Build";
import PeopleIcon from "@mui/icons-material/People";
import BookIcon from "@mui/icons-material/Book";
import SettingsIcon from "@mui/icons-material/Settings";
import AuthContext from "../../context/AuthProvider";

const Sidebar: React.FC = () => {
	const location = useLocation();
	const { auth } = useContext(AuthContext);

	const navItems = [
		{
			title: "Dashboard",
			icon: <DashboardIcon />,
			path: "/",
			roles: ["admin", "owner", "mechanic", "client"],
		},
		{
			title: "Inventory",
			icon: <InventoryIcon />,
			path: "/inventory",
			roles: ["admin", "owner"],
		},
		{
			title: "Services",
			icon: <BuildIcon />,
			path: "/services",
			roles: ["admin", "owner", "mechanic"],
		},
		{
			title: "Customers",
			icon: <PeopleIcon />,
			path: "/customers",
			roles: ["admin", "owner"],
		},
		{
			title: "Bookings",
			icon: <BookIcon />,
			path: "/bookings",
			roles: ["admin", "owner", "client"],
		},
		{
			title: "Diagnostics",
			icon: <SettingsIcon />,
			path: "/diagnostics",
			roles: ["admin", "mechanic"],
		},
	];

	const userRole = auth.roles?.[0];

	return (
		<Box
			sx={{
				width: 240,
				bgcolor: "#F5F5F5",
				height: "100vh",
				display: "flex",
				flexDirection: "column",
				borderRight: "1px solid #E0E0E0",
			}}
		>
			<Box
				sx={{
					padding: "16px",
					textAlign: "center",
					bgcolor: "#FF4C60",
					color: "white",
				}}
			>
				<Typography variant="h6" fontWeight="bold">
					Garage Manager
				</Typography>
				<Typography variant="caption">Making repairs easy</Typography>
			</Box>

			<List sx={{ flex: 1 }}>
				{navItems
					.filter((item) => item.roles.includes(userRole || ""))
					.map((item) => (
						<ListItemButton
							key={item.title}
							component={Link}
							to={item.path}
							selected={location.pathname === item.path}
							sx={{
								color: location.pathname === item.path ? "#FF4C60" : "#333",
								"&:hover": { bgcolor: "#FFEBEE" },
							}}
						>
							<ListItemIcon
								sx={{
									color: location.pathname === item.path ? "#FF4C60" : "#333",
								}}
							>
								{item.icon}
							</ListItemIcon>
							<ListItemText primary={item.title} />
						</ListItemButton>
					))}
			</List>

			<Box
				sx={{
					padding: "16px",
					textAlign: "center",
					bgcolor: "#FF4C60",
					color: "white",
				}}
			>
				<Typography variant="caption">COPYRIGHT | GARAGEMASTER 2025</Typography>
			</Box>
		</Box>
	);
};

export default Sidebar;
