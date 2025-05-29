import React, { useEffect, useState } from "react";
import {
	Dialog,
	DialogTitle,
	DialogContent,
	DialogActions,
	Button,
	Typography,
	Box,
	Avatar,
	Chip,
	Divider,
	Grid,
} from "@mui/material";
import PersonIcon from "@mui/icons-material/Person";
import EmailIcon from "@mui/icons-material/Email";
import PhoneIcon from "@mui/icons-material/Phone";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import StarsIcon from "@mui/icons-material/Stars";
import DirectionsCarIcon from "@mui/icons-material/DirectionsCar";
import { Customer } from "../../models/CustomerModel";
import { customerService } from "../../api/CustomerAPIEndpoint";

interface CustomerDetailDialogProps {
	open: boolean;
	onClose: () => void;
	customer: Customer | null;
	userRole: string;
}

const CustomerDetailDialog: React.FC<CustomerDetailDialogProps> = ({
	open,
	onClose,
	customer,
	userRole,
}) => {
	// Dodaj debugging
	console.log("CustomerDetailDialog - customer data:", customer);
	console.log("CustomerDetailDialog - open:", open);

	if (!customer) {
		console.log("No customer data available");
		return null;
	}

	const [vehicles, setVehicles] = useState([]);

	useEffect(() => {
		if (customer?.id) {
			customerService
				.getCustomerVehicles(customer.id)
				.then((allVehicles) => {
					// Przefiltruj w frontend jako backup
					const customerVehicles = allVehicles.filter(
						(vehicle) =>
							vehicle.owner === customer.id ||
							vehicle.owner_id === customer.id ||
							vehicle.client === customer.id ||
							vehicle.client_id === customer.id
					);
					console.log(
						`Filtered vehicles for customer ${customer.id}:`,
						customerVehicles
					);
					setVehicles(customerVehicles);
				})
				.catch(console.error);
		}
	}, [customer?.id]);

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
		<Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
			<DialogTitle>
				<Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
					<Avatar
						src={customer.profile?.photo}
						sx={{ width: 60, height: 60, bgcolor: "#ff3c4e" }}
					>
						{!customer.profile?.photo && <PersonIcon sx={{ color: "white" }} />}
					</Avatar>
					<Box>
						<Typography variant="h5" fontWeight="bold">
							{customer.first_name} {customer.last_name}
						</Typography>
						<Typography variant="body2" color="text.secondary">
							@{customer.username}
						</Typography>
					</Box>
					{isVip && (
						<Chip
							icon={<StarsIcon />}
							label="VIP Customer"
							color="warning"
							variant="outlined"
						/>
					)}
				</Box>
			</DialogTitle>

			<DialogContent>
				<Grid container spacing={3}>
					{/* Basic Information */}
					<Grid item xs={12} md={6}>
						<Typography variant="h6" gutterBottom>
							Basic Information
						</Typography>
						<Box sx={{ mb: 2 }}>
							<Box
								sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}
							>
								<EmailIcon fontSize="small" color="action" />
								<Typography variant="body2">
									<strong>Email:</strong> {customer.email}
								</Typography>
							</Box>
							{customer.profile?.phone && (
								<Box
									sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}
								>
									<PhoneIcon fontSize="small" color="action" />
									<Typography variant="body2">
										<strong>Phone:</strong> {customer.profile.phone}
									</Typography>
								</Box>
							)}
							{customer.profile?.address && (
								<Box
									sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}
								>
									<LocationOnIcon fontSize="small" color="action" />
									<Typography variant="body2">
										<strong>Address:</strong> {customer.profile.address}
									</Typography>
								</Box>
							)}
						</Box>

						<Box sx={{ display: "flex", gap: 1, mb: 2 }}>
							<Chip
								label={customer.is_active ? "Active" : "Inactive"}
								size="small"
								color={customer.is_active ? "success" : "error"}
								variant="outlined"
							/>
						</Box>
					</Grid>

					{/* Account Information */}
					<Grid item xs={12} md={6}>
						<Typography variant="h6" gutterBottom>
							Account Information
						</Typography>
						<Box sx={{ mb: 2 }}>
							<Typography variant="body2" sx={{ mb: 1 }}>
								<strong>Role:</strong> {customer.role}
							</Typography>
							<Box
								sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}
							>
								<CalendarTodayIcon fontSize="small" color="action" />
								<Typography variant="body2">
									<strong>Joined:</strong>{" "}
									{new Date(customer.date_joined).toLocaleDateString()}
								</Typography>
							</Box>
							{customer.last_login && (
								<Box
									sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}
								>
									<CalendarTodayIcon fontSize="small" color="action" />
									<Typography variant="body2">
										<strong>Last Login:</strong>{" "}
										{new Date(customer.last_login).toLocaleDateString()}
									</Typography>
								</Box>
							)}
						</Box>
					</Grid>

					{/* Loyalty Information */}
					{customer.loyalty_points !== undefined && (
						<Grid item xs={12}>
							<Divider sx={{ my: 2 }} />
							<Typography variant="h6" gutterBottom>
								Loyalty Program
							</Typography>
							<Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
								<StarsIcon color="warning" />
								<Typography variant="body1">
									<strong>{customer.loyalty_points} loyalty points</strong>
								</Typography>
								{isVip && (
									<Chip label="VIP Status" color="warning" size="small" />
								)}
							</Box>
						</Grid>
					)}

					{/* Workshop Information */}
					{customer.workshop_name && (
						<Grid item xs={12}>
							<Divider sx={{ my: 2 }} />
							<Typography variant="h6" gutterBottom>
								Workshop
							</Typography>
							<Typography variant="body2">
								<strong>Workshop:</strong> {customer.workshop_name}
							</Typography>
						</Grid>
					)}

					{/* Contact Preferences */}
					{customer.profile?.preferred_contact_method && (
						<Grid item xs={12}>
							<Divider sx={{ my: 2 }} />
							<Typography variant="h6" gutterBottom>
								Contact Preferences
							</Typography>
							<Typography variant="body2">
								<strong>Preferred Contact Method:</strong>{" "}
								{customer.profile.preferred_contact_method}
							</Typography>
						</Grid>
					)}

					{/* Vehicles Information */}
					{vehicles.length > 0 && (
						<Grid item xs={12}>
							<Divider sx={{ my: 2 }} />
							<Typography variant="h6" gutterBottom>
								Vehicles
							</Typography>
							{vehicles.map((vehicle) => (
								<Box
									key={vehicle.id}
									sx={{ display: "flex", alignItems: "center", gap: 2, mb: 1 }}
								>
									<Avatar sx={{ bgcolor: "#1976d2", width: 24, height: 24 }}>
										<DirectionsCarIcon sx={{ fontSize: 16, color: "white" }} />
									</Avatar>
									<Typography variant="body2">
										{vehicle.brand} {vehicle.model} ({vehicle.year})
									</Typography>
								</Box>
							))}
						</Grid>
					)}
				</Grid>
			</DialogContent>

			<DialogActions>
				<Button onClick={onClose}>Close</Button>
			</DialogActions>
		</Dialog>
	);
};

export default CustomerDetailDialog;
