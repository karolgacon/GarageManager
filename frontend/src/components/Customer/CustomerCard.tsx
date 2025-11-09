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
import {
	COLOR_PRIMARY,
	COLOR_SURFACE,
	COLOR_TEXT_PRIMARY,
	COLOR_TEXT_SECONDARY,
} from "../../constants";

interface CustomerCardProps {
	customer: Customer;
	onView: (customer: Customer) => void;
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

	const handleMenuAction = (action: string, event?: React.MouseEvent) => {
		event?.stopPropagation();
		switch (action) {
			case "view":
				onView(customer);
				break;
			case "edit":
				onEdit(customer.id);
				break;
			case "delete":
				onDelete(customer.id);
				break;
		}
		handleClose();
	};

	const isVip = customer.loyalty_points && customer.loyalty_points > 100;

	return (
		<Card
			sx={{
				height: "100%",
				display: "flex",
				flexDirection: "column",
				transition: "all 0.2s ease-in-out",
				backgroundColor: COLOR_SURFACE,
				borderRadius: 2,
				"&:hover": {
					transform: "translateY(-1px)",
					boxShadow: `0 2px 8px rgba(0, 0, 0, 0.15)`,
				},
				cursor: "pointer",
			}}
			onClick={() => onView(customer)}
		>
			<CardContent sx={{ flexGrow: 1, p: 2 }}>
				<Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
					<Avatar
						src={customer.profile?.photo}
						sx={{
							width: 50,
							height: 50,
							bgcolor: COLOR_PRIMARY,
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
								sx={{
									backgroundColor: "#fbbf24",
									color: "#78350f",
									"& .MuiChip-icon": {
										color: "#78350f",
									},
								}}
								variant="outlined"
							/>
						)}

						<IconButton
							size="small"
							sx={{ color: COLOR_TEXT_SECONDARY }}
							onClick={(e) => {
								e.stopPropagation();
								handleClick(e);
							}}
						>
							<MoreVertIcon />
						</IconButton>
					</Box>
				</Box>

				<Typography
					variant="h6"
					fontWeight="bold"
					sx={{ mb: 1, color: COLOR_TEXT_PRIMARY }}
				>
					{customer.first_name} {customer.last_name}
				</Typography>

				<Typography variant="body2" sx={{ mb: 2, color: COLOR_TEXT_SECONDARY }}>
					@{customer.username}
				</Typography>

				<Box sx={{ mb: 2 }}>
					<Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
						<EmailIcon fontSize="small" sx={{ color: COLOR_PRIMARY }} />
						<Typography
							variant="body2"
							sx={{ color: COLOR_TEXT_SECONDARY }}
							noWrap
						>
							{customer.email}
						</Typography>
					</Box>

					{customer.profile?.phone && (
						<Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
							<PhoneIcon fontSize="small" sx={{ color: COLOR_PRIMARY }} />
							<Typography variant="body2" sx={{ color: COLOR_TEXT_SECONDARY }}>
								{customer.profile.phone}
							</Typography>
						</Box>
					)}
				</Box>

				<Box
					sx={{
						display: "flex",
						justifyContent: "space-between",
						alignItems: "center",
					}}
				>
					<Chip
						label={customer.status ? "Active" : "Inactive"}
						size="small"
						sx={{
							backgroundColor:
								customer.status === "active" ? "#22c55e" : "#ef4444",
							color: "white",
						}}
						variant="filled"
					/>

					{customer.loyalty_points && (
						<Typography variant="body2" sx={{ color: COLOR_TEXT_SECONDARY }}>
							{customer.loyalty_points} pts
						</Typography>
					)}
				</Box>
			</CardContent>

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
						backgroundColor: COLOR_SURFACE,
						border: `1px solid ${COLOR_TEXT_SECONDARY}`,
					},
				}}
				transformOrigin={{ horizontal: "right", vertical: "top" }}
				anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
			>
				<MenuItem
					onClick={(e) => handleMenuAction("view", e)}
					sx={{
						color: COLOR_TEXT_PRIMARY,
						"&:hover": {
							backgroundColor: `${COLOR_PRIMARY}20`,
						},
					}}
				>
					View Details
				</MenuItem>
				{(userRole === "admin" || userRole === "owner") && (
					<MenuItem
						onClick={(e) => handleMenuAction("edit", e)}
						sx={{
							color: COLOR_TEXT_PRIMARY,
							"&:hover": {
								backgroundColor: `${COLOR_PRIMARY}20`,
							},
						}}
					>
						Edit Customer
					</MenuItem>
				)}
				{userRole === "admin" && (
					<MenuItem
						onClick={(e) => handleMenuAction("delete", e)}
						sx={{
							color: "#ef4444",
							"&:hover": {
								backgroundColor: "#ef444420",
							},
						}}
					>
						Delete Customer
					</MenuItem>
				)}
			</Menu>
		</Card>
	);
};

export default CustomerCard;
