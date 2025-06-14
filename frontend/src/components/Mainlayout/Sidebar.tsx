import React, { useContext } from "react";
import {
	Box,
	List,
	ListItemButton,
	ListItemIcon,
	ListItemText,
	Typography,
	Drawer,
} from "@mui/material";
import { Link, useLocation, useNavigate } from "react-router-dom";
import DashboardIcon from "@mui/icons-material/Dashboard";
import InventoryIcon from "@mui/icons-material/Inventory";
import BuildIcon from "@mui/icons-material/Build";
import PeopleIcon from "@mui/icons-material/People";
import BookIcon from "@mui/icons-material/Book";
import SettingsIcon from "@mui/icons-material/Settings";
import PersonIcon from "@mui/icons-material/Person";
import DirectionsCarIcon from "@mui/icons-material/DirectionsCar";
import AuthContext from "../../context/AuthProvider";
import {
	COLOR_PRIMARY,
	COLOR_SECONDARY,
	COLOR_DARK,
	COLOR_LIGHT,
} from "../../constants";

interface SidebarProps {
	isMobile: boolean;
	open?: boolean;
	onClose?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({
	isMobile,
	open = false,
	onClose,
}) => {
	const location = useLocation();
	const navigate = useNavigate(); 
	const { auth } = useContext(AuthContext);

	const handleLogoClick = () => {
		navigate("/"); 
		if (isMobile && onClose) {
			onClose();
		}
	};

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
			roles: ["admin", "owner", "mechanic"],
		},
		{
			title: "Services",
			icon: <BuildIcon />,
			path: "/services",
			roles: ["admin", "owner", "mechanic", "client"],
		},
		{
			title: "Vehicles",
			icon: <DirectionsCarIcon />,
			path: "/vehicles",
			roles: ["admin", "owner", "mechanic", "client"],
		},
		{
			title: "Customers",
			icon: <PeopleIcon />,
			path: "/customers",
			roles: ["admin", "owner", "mechanic"],
		},
		{
			title: "Bookings",
			icon: <BookIcon />,
			path: "/bookings",
			roles: ["admin", "owner", "client", "mechanic"],
		},
		{
			title: "Diagnostics",
			icon: <SettingsIcon />,
			path: "/diagnostics",
			roles: ["admin", "mechanic", "owner", "client"],
		},
		{
			title: "Staff Management",
			icon: <PersonIcon />,
			path: "/staff",
			roles: ["admin", "owner"],
		},
	];

	const userRole = auth.roles?.[0];

	const sidebarContent = (
		<Box
			sx={{
				width: 240,
				bgcolor: "#fff",
				height: "100%",
				display: "flex",
				flexDirection: "column",
				overflowY: "auto",
				overflowX: "hidden",
				maxWidth: "100%",
			}}
			onClick={isMobile ? onClose : undefined}
		>
			<Box
				sx={{
					padding: "16px",
					textAlign: "center",
					mb: 2,
					cursor: "pointer", 
				}}
				onClick={(e) => {
					e.stopPropagation(); 
					handleLogoClick();
				}}
			>
				<Box
					sx={{
						display: "flex",
						justifyContent: "center",
						alignItems: "center",
						mb: 1,
					}}
				>
					<Box
						component="img"
						sx={{
							height: 60,
							width: 60,
							transition: "transform 0.2s ease-in-out", 
							"&:hover": {
								transform: "scale(1.05)", 
							},
						}}
						alt="Garage Manager Logo"
						src="/logo.png"
					/>
				</Box>
				<Typography variant="h6" fontWeight="bold" color={COLOR_DARK}>
					GarageManager
				</Typography>
			</Box>

			<List sx={{ flex: 1, px: 1 }}>
				{navItems
					.filter((item) => item.roles.includes(userRole || ""))
					.map((item) => (
						<ListItemButton
							key={item.title}
							component={Link}
							to={item.path}
							selected={location.pathname === item.path}
							sx={{
								my: 0.5,
								borderRadius: 1,
								backgroundColor:
									location.pathname === item.path
										? `${COLOR_PRIMARY} !important`
										: "white",
								color: "#000",
								"&:hover": {
									backgroundColor:
										location.pathname === item.path
											? COLOR_SECONDARY
											: COLOR_LIGHT,
								},
							}}
						>
							<ListItemIcon
								sx={{
									color:
										location.pathname === item.path ? "#000" : COLOR_PRIMARY,
									minWidth: 40,
								}}
							>
								{item.icon}
							</ListItemIcon>
							<ListItemText primary={item.title} />
						</ListItemButton>
					))}
			</List>
		</Box>
	);

	if (isMobile) {
		return (
			<Drawer
				variant="temporary"
				open={open}
				onClose={onClose}
				sx={{
					"& .MuiDrawer-paper": {
						width: 240,
						boxSizing: "border-box",
						borderRight: "none",
					},
				}}
				ModalProps={{
					keepMounted: true,
				}}
			>
				{sidebarContent}
			</Drawer>
		);
	}

	return (
		<Drawer
			variant="permanent"
			sx={{
				width: 240,
				flexShrink: 0,
				"& .MuiDrawer-paper": {
					width: 240,
					boxSizing: "border-box",
					borderRight: "none",
				},
			}}
		>
			{sidebarContent}
		</Drawer>
	);
};

export default Sidebar;
