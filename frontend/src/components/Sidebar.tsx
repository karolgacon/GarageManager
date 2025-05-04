import React from "react";
import {
	Box,
	List,
	ListItem,
	ListItemIcon,
	ListItemText,
	Typography,
	styled,
} from "@mui/material";
import { Link, useLocation } from "react-router-dom";
import DashboardIcon from "@mui/icons-material/Dashboard";
import InventoryIcon from "@mui/icons-material/Inventory";
import BuildIcon from "@mui/icons-material/Build";
import PeopleIcon from "@mui/icons-material/People";
import BookOnlineIcon from "@mui/icons-material/BookOnline";
import BiotechIcon from "@mui/icons-material/Biotech";
import BadgeIcon from "@mui/icons-material/Badge";

const Logo = styled(Box)({
	display: "flex",
	alignItems: "center",
	justifyContent: "center",
	padding: "20px 0",
	"& img": {
		width: 70,
		height: 70,
	},
});

interface NavItemProps {
	active: boolean;
}

const NavItem = styled(ListItem, {
	shouldForwardProp: (prop) => prop !== "active",
})<NavItemProps>(({ theme, active }) => ({
	borderRadius: "8px",
	margin: "8px 16px",
	backgroundColor: active ? "rgba(255, 56, 80, 0.1)" : "transparent",
	color: active ? "#ff3850" : "#666",
	"&:hover": {
		backgroundColor: "rgba(255, 56, 80, 0.05)",
	},
	"& .MuiListItemIcon-root": {
		color: active ? "#ff3850" : "#666",
	},
}));

const Sidebar: React.FC = () => {
	const location = useLocation();

	const navItems = [
		{ title: "Dashboard", icon: <DashboardIcon />, path: "/" },
		{ title: "Inventory", icon: <InventoryIcon />, path: "/inventory" },
		{ title: "Services", icon: <BuildIcon />, path: "/services" },
		{ title: "Customers", icon: <PeopleIcon />, path: "/customers" },
		{ title: "Bookings", icon: <BookOnlineIcon />, path: "/bookings" },
		{ title: "Diagnostics", icon: <BiotechIcon />, path: "/diagnostics" },
		{ title: "Staff Management", icon: <BadgeIcon />, path: "/staff" },
	];

	return (
		<Box
			sx={{
				width: 200,
				bgcolor: "white",
				height: "100vh",
				borderRight: "1px solid #f0f0f0",
				display: "flex",
				flexDirection: "column",
			}}
		>
			<Logo>
				<Box>
					<img src="/logo.png" alt="Garage Manager" />
					<Typography
						variant="h6"
						align="center"
						sx={{
							fontWeight: "bold",
							fontSize: "1rem",
							color: "#333",
						}}
					>
						GarageManager
					</Typography>
					<Typography
						variant="caption"
						display="block"
						align="center"
						sx={{ color: "#666" }}
					>
						REPAIR TODAY BE OK
					</Typography>
				</Box>
			</Logo>

			<List sx={{ py: 2 }}>
				{navItems.map((item) => (
					<NavItem
						key={item.title}
						component={Link}
						to={item.path}
						active={location.pathname === item.path}
						disablePadding
					>
						<ListItemIcon>{item.icon}</ListItemIcon>
						<ListItemText primary={item.title} />
					</NavItem>
				))}
			</List>
		</Box>
	);
};

export default Sidebar;
