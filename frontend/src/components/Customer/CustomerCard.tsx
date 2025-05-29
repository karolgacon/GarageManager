import React from "react";
import {
	Card,
	CardContent,
	Typography,
	Box,
	Avatar,
	Chip,
	IconButton,
	Menu,
	MenuItem,
} from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import PersonIcon from "@mui/icons-material/Person";
import EmailIcon from "@mui/icons-material/Email";
import PhoneIcon from "@mui/icons-material/Phone";
import StarsIcon from "@mui/icons-material/Stars";
import { Customer } from "../../models/CustomerModel";

interface CustomerCardProps {
	customer: Customer;
	onView: (customer: Customer) => void; // ✅ Zmienione z (id: number) na (customer: Customer)
	onEdit: (id: number) => void;
	onDelete: (id: number) => void;
	userRole: string;
}

const CustomerCard: React.FC<CustomerCardProps> = ({
	customer,
	onView,
	onEdit,
	onDelete,
	userRole,
}) => {
	const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
	const open = Boolean(anchorEl);

	const handleClick = (event: React.MouseEvent<HTMLElement>) => {
		setAnchorEl(event.currentTarget);
	};

	const handleClose = () => {
		setAnchorEl(null);
	};

	const handleMenuAction = (action: string) => {
		handleClose();
		switch (action) {
			case "view":
				onView(customer); // ✅ Przekazuje cały obiekt customer
				break;
			case "edit":
				onEdit(customer.id);
				break;
			case "delete":
				onDelete(customer.id);
				break;
		}
	};

	const getStatusColor = (status: string) => {
		switch (status) {
			case "active":
				return "success";
			case "blocked":
				return "error";
			case "suspended":
				return "warning";
			default:
				return "default";
		}
	};

	const isVip = customer.loyalty_points && customer.loyalty_points > 100;

	return (
		<Card
			sx={{
				height: "100%",
				display: "flex",
				flexDirection: "column",
				transition: "all 0.2s ease-in-out",
				"&:hover": {
					transform: "translateY(-2px)",
					boxShadow: 3,
				},
				cursor: "pointer",
			}}
			onClick={() => onView(customer)} // ✅ Już prawidłowo przekazuje customer
		>
			<CardContent sx={{ flexGrow: 1, p: 2 }}>
				{/* Header with avatar and menu */}
				<Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
					<Avatar
						src={customer.profile?.photo}
						sx={{
							width: 50,
							height: 50,
							bgcolor: "#ff3c4e",
						}}
					>
						{!customer.profile?.photo && <PersonIcon sx={{ color: "white" }} />}
					</Avatar>

					<Box sx={{ display: "flex", alignItems: "flex-start", gap: 1 }}>
						{isVip && (
							<Chip
								icon={<StarsIcon />}
								label="VIP"
								size="small"
								color="warning"
								variant="outlined"
							/>
						)}

						<IconButton
							size="small"
							onClick={(e) => {
								e.stopPropagation();
								handleClick(e);
							}}
						>
							<MoreVertIcon />
						</IconButton>
					</Box>
				</Box>

				{/* Customer info */}
				<Typography variant="h6" fontWeight="bold" sx={{ mb: 1 }}>
					{customer.first_name} {customer.last_name}
				</Typography>

				<Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
					@{customer.username}
				</Typography>

				{/* Contact info */}
				<Box sx={{ mb: 2 }}>
					<Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
						<EmailIcon fontSize="small" color="action" />
						<Typography variant="body2" color="text.secondary" noWrap>
							{customer.email}
						</Typography>
					</Box>

					{customer.profile?.phone && (
						<Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
							<PhoneIcon fontSize="small" color="action" />
							<Typography variant="body2" color="text.secondary">
								{customer.profile.phone}
							</Typography>
						</Box>
					)}
				</Box>

				{/* Status and loyalty points */}
				<Box
					sx={{
						display: "flex",
						justifyContent: "space-between",
						alignItems: "center",
					}}
				>
					<Chip
						label={customer.status? "Active" : "Inactive"}
						size="small"
						color={getStatusColor(customer.status) as any}
						variant="outlined"
					/>

					{customer.loyalty_points && (
						<Typography variant="body2" color="text.secondary">
							{customer.loyalty_points} pts
						</Typography>
					)}
				</Box>
			</CardContent>

			{/* Action menu */}
			<Menu
				anchorEl={anchorEl}
				open={open}
				onClose={handleClose}
				PaperProps={{
					elevation: 0,
					sx: {
						overflow: "visible",
						filter: "drop-shadow(0px 2px 8px rgba(0,0,0,0.32))",
						mt: 1.5,
					},
				}}
				transformOrigin={{ horizontal: "right", vertical: "top" }}
				anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
			>
				<MenuItem onClick={() => handleMenuAction("view")}>
					View Details
				</MenuItem>
				{(userRole === "admin" || userRole === "owner") && (
					<MenuItem onClick={() => handleMenuAction("edit")}>
						Edit Customer
					</MenuItem>
				)}
				{userRole === "admin" && (
					<MenuItem onClick={() => handleMenuAction("delete")}>
						Delete Customer
					</MenuItem>
				)}
			</Menu>
		</Card>
	);
};

export default CustomerCard;
