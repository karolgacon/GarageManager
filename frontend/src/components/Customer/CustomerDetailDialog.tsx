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
import VehicleDetailDialog from "../Vehicle/VehicleDetailDialog";

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
	const [vehicles, setVehicles] = useState([]);
	const [selectedVehicle, setSelectedVehicle] = useState(null);
	const [vehicleDialogOpen, setVehicleDialogOpen] = useState(false);

	useEffect(() => {
		if (customer?.id) {
			customerService
				.getCustomerVehicles(customer.id)
				.then((allVehicles) => {
					const customerVehicles = allVehicles.filter(
						(vehicle) =>
							vehicle.owner === customer.id ||
							vehicle.owner_id === customer.id ||
							vehicle.client === customer.id ||
							vehicle.client_id === customer.id
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

	const isVip = customer?.loyalty_points && customer.loyalty_points > 100;

	const handleVehicleClick = (vehicle) => {
		setSelectedVehicle(vehicle);
		setVehicleDialogOpen(true);
	};

	const capitalizeFirstLetter = (text: string | undefined): string => {
		if (!text) return "";
		return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
	};

	if (!customer) return null;

	return (
		<>
			<Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
				<DialogTitle>
					<Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
						<Avatar
							src={customer.profile?.photo}
							sx={{ width: 60, height: 60, bgcolor: "#ff3c4e" }}
						>
							{!customer.profile?.photo && (
								<PersonIcon sx={{ color: "white" }} />
							)}
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
										sx={{
											display: "flex",
											alignItems: "center",
											gap: 1,
											mb: 1,
										}}
									>
										<PhoneIcon fontSize="small" color="action" />
										<Typography variant="body2">
											<strong>Phone:</strong> {customer.profile.phone}
										</Typography>
									</Box>
								)}
								{customer.profile?.address && (
									<Box
										sx={{
											display: "flex",
											alignItems: "center",
											gap: 1,
											mb: 1,
										}}
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

						<Grid item xs={12} md={6}>
							<Typography variant="h6" gutterBottom>
								Account Information
							</Typography>
							<Box sx={{ mb: 2 }}>
								<Typography variant="body2" sx={{ mb: 1 }}>
									<strong>Role:</strong> {capitalizeFirstLetter(customer.role)}
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
										sx={{
											display: "flex",
											alignItems: "center",
											gap: 1,
											mb: 1,
										}}
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

						{customer.profile?.preferred_contact_method && (
							<Grid item xs={12}>
								<Divider sx={{ my: 2 }} />
								<Typography variant="h6" gutterBottom>
									Contact Preferences
								</Typography>
								<Typography variant="body2">
									<strong>Preferred Contact Method:</strong>{" "}
									{capitalizeFirstLetter(
										customer.profile.preferred_contact_method
									)}
								</Typography>
							</Grid>
						)}

						{vehicles.length > 0 && (
							<Grid item xs={12}>
								<Divider sx={{ my: 2 }} />
								<Typography variant="h6" gutterBottom>
									Vehicles
								</Typography>
								{vehicles.map((vehicle) => (
									<Box
										key={vehicle.id}
										sx={{
											display: "flex",
											alignItems: "center",
											gap: 2,
											mb: 1,
											cursor: "pointer",
											"&:hover": {
												bgcolor: "rgba(0, 0, 0, 0.04)",
												borderRadius: 1,
											},
											p: 1,
										}}
										onClick={() => handleVehicleClick(vehicle)}
									>
										<Avatar sx={{ bgcolor: "#1976d2", width: 24, height: 24 }}>
											<DirectionsCarIcon
												sx={{ fontSize: 16, color: "white" }}
											/>
										</Avatar>
										<Typography
											variant="body2"
											sx={{
												fontWeight: "medium",
											}}
										>
											{capitalizeFirstLetter(vehicle.brand)}{" "}
											{capitalizeFirstLetter(vehicle.model)} ({vehicle.year})
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

			{selectedVehicle && (
				<VehicleDetailDialog
					open={vehicleDialogOpen}
					onClose={() => setVehicleDialogOpen(false)}
					vehicle={selectedVehicle}
				/>
			)}
		</>
	);
};

export default CustomerDetailDialog;
