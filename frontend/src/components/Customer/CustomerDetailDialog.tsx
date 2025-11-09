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
import {
	COLOR_PRIMARY,
	COLOR_SURFACE,
	COLOR_TEXT_PRIMARY,
	COLOR_TEXT_SECONDARY,
} from "../../constants";

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
			<Dialog
				open={open}
				onClose={onClose}
				maxWidth="md"
				fullWidth
				PaperProps={{
					sx: {
						backgroundColor: COLOR_SURFACE,
						color: COLOR_TEXT_PRIMARY,
						borderRadius: 2,
						border: `1px solid rgba(228, 230, 232, 0.1)`,
					},
				}}
			>
				<DialogTitle sx={{ backgroundColor: COLOR_SURFACE }}>
					<Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
						<Avatar
							src={customer.profile?.photo}
							sx={{
								width: 60,
								height: 60,
								bgcolor: COLOR_PRIMARY,
								border: `2px solid rgba(228, 230, 232, 0.1)`,
							}}
						>
							{!customer.profile?.photo && (
								<PersonIcon sx={{ color: "white" }} />
							)}
						</Avatar>
						<Box>
							<Typography
								variant="h5"
								fontWeight="bold"
								sx={{ color: COLOR_TEXT_PRIMARY }}
							>
								{customer.first_name} {customer.last_name}
							</Typography>
							<Typography variant="body2" sx={{ color: COLOR_TEXT_SECONDARY }}>
								@{customer.username}
							</Typography>
						</Box>
						{isVip && (
							<Chip
								icon={<StarsIcon />}
								label="VIP Customer"
								variant="outlined"
								sx={{
									color: "#ffd700",
									borderColor: "#ffd700",
									backgroundColor: "rgba(255, 215, 0, 0.1)",
									"& .MuiChip-icon": {
										color: "#ffd700",
									},
								}}
							/>
						)}
					</Box>
				</DialogTitle>

				<DialogContent sx={{ backgroundColor: COLOR_SURFACE }}>
					<Grid container spacing={3}>
						<Grid item xs={12} md={6}>
							<Typography
								variant="h6"
								gutterBottom
								sx={{ color: COLOR_TEXT_PRIMARY }}
							>
								Basic Information
							</Typography>
							<Box sx={{ mb: 2 }}>
								<Box
									sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}
								>
									<EmailIcon
										fontSize="small"
										sx={{ color: COLOR_TEXT_SECONDARY }}
									/>
									<Typography
										variant="body2"
										sx={{ color: COLOR_TEXT_PRIMARY }}
									>
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
										<PhoneIcon
											fontSize="small"
											sx={{ color: COLOR_TEXT_SECONDARY }}
										/>
										<Typography
											variant="body2"
											sx={{ color: COLOR_TEXT_PRIMARY }}
										>
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
										<LocationOnIcon
											fontSize="small"
											sx={{ color: COLOR_TEXT_SECONDARY }}
										/>
										<Typography
											variant="body2"
											sx={{ color: COLOR_TEXT_PRIMARY }}
										>
											<strong>Address:</strong> {customer.profile.address}
										</Typography>
									</Box>
								)}
							</Box>

							<Box sx={{ display: "flex", gap: 1, mb: 2 }}>
								<Chip
									label={customer.is_active ? "Active" : "Inactive"}
									size="small"
									variant="outlined"
									sx={{
										color: customer.is_active ? "#4caf50" : "#ff6b6b",
										borderColor: customer.is_active ? "#4caf50" : "#ff6b6b",
										backgroundColor: customer.is_active
											? "rgba(76, 175, 80, 0.1)"
											: "rgba(255, 107, 107, 0.1)",
									}}
								/>
							</Box>
						</Grid>

						<Grid item xs={12} md={6}>
							<Typography
								variant="h6"
								gutterBottom
								sx={{ color: COLOR_TEXT_PRIMARY }}
							>
								Account Information
							</Typography>
							<Box sx={{ mb: 2 }}>
								<Typography
									variant="body2"
									sx={{
										mb: 1,
										color: COLOR_TEXT_PRIMARY,
									}}
								>
									<strong>Role:</strong> {capitalizeFirstLetter(customer.role)}
								</Typography>
								<Box
									sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}
								>
									<CalendarTodayIcon
										fontSize="small"
										sx={{ color: COLOR_TEXT_SECONDARY }}
									/>
									<Typography
										variant="body2"
										sx={{ color: COLOR_TEXT_PRIMARY }}
									>
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
										<CalendarTodayIcon
											fontSize="small"
											sx={{ color: COLOR_TEXT_SECONDARY }}
										/>
										<Typography
											variant="body2"
											sx={{ color: COLOR_TEXT_PRIMARY }}
										>
											<strong>Last Login:</strong>{" "}
											{new Date(customer.last_login).toLocaleDateString()}
										</Typography>
									</Box>
								)}
							</Box>
						</Grid>

						{customer.loyalty_points !== undefined && (
							<Grid item xs={12}>
								<Divider
									sx={{
										my: 2,
										borderColor: "rgba(228, 230, 232, 0.1)",
									}}
								/>
								<Typography
									variant="h6"
									gutterBottom
									sx={{ color: COLOR_TEXT_PRIMARY }}
								>
									Loyalty Program
								</Typography>
								<Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
									<StarsIcon sx={{ color: "#ffd700" }} />
									<Typography
										variant="body1"
										sx={{ color: COLOR_TEXT_PRIMARY }}
									>
										<strong>{customer.loyalty_points} loyalty points</strong>
									</Typography>
									{isVip && (
										<Chip
											label="VIP Status"
											size="small"
											sx={{
												color: "#ffd700",
												borderColor: "#ffd700",
												backgroundColor: "rgba(255, 215, 0, 0.1)",
											}}
										/>
									)}
								</Box>
							</Grid>
						)}

						{customer.workshop_name && (
							<Grid item xs={12}>
								<Divider
									sx={{
										my: 2,
										borderColor: "rgba(228, 230, 232, 0.1)",
									}}
								/>
								<Typography
									variant="h6"
									gutterBottom
									sx={{ color: COLOR_TEXT_PRIMARY }}
								>
									Workshop
								</Typography>
								<Typography variant="body2" sx={{ color: COLOR_TEXT_PRIMARY }}>
									<strong>Workshop:</strong> {customer.workshop_name}
								</Typography>
							</Grid>
						)}

						{customer.profile?.preferred_contact_method && (
							<Grid item xs={12}>
								<Divider
									sx={{
										my: 2,
										borderColor: "rgba(228, 230, 232, 0.1)",
									}}
								/>
								<Typography
									variant="h6"
									gutterBottom
									sx={{ color: COLOR_TEXT_PRIMARY }}
								>
									Contact Preferences
								</Typography>
								<Typography variant="body2" sx={{ color: COLOR_TEXT_PRIMARY }}>
									<strong>Preferred Contact Method:</strong>{" "}
									{capitalizeFirstLetter(
										customer.profile.preferred_contact_method
									)}
								</Typography>
							</Grid>
						)}

						{vehicles.length > 0 && (
							<Grid item xs={12}>
								<Divider
									sx={{
										my: 2,
										borderColor: "rgba(228, 230, 232, 0.1)",
									}}
								/>
								<Typography
									variant="h6"
									gutterBottom
									sx={{ color: COLOR_TEXT_PRIMARY }}
								>
									Vehicles
								</Typography>
								{vehicles.map((vehicle: any) => (
									<Box
										key={vehicle.id}
										sx={{
											display: "flex",
											alignItems: "center",
											gap: 2,
											mb: 1,
											cursor: "pointer",
											"&:hover": {
												bgcolor: "rgba(56, 130, 246, 0.1)",
												borderRadius: 1,
											},
											p: 1,
											borderRadius: 1,
											border: `1px solid rgba(228, 230, 232, 0.1)`,
											backgroundColor: "rgba(26, 29, 35, 0.5)",
										}}
										onClick={() => handleVehicleClick(vehicle)}
									>
										<Avatar
											sx={{
												bgcolor: COLOR_PRIMARY,
												width: 24,
												height: 24,
											}}
										>
											<DirectionsCarIcon
												sx={{ fontSize: 16, color: "white" }}
											/>
										</Avatar>
										<Typography
											variant="body2"
											sx={{
												fontWeight: "medium",
												color: COLOR_TEXT_PRIMARY,
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

				<DialogActions
					sx={{
						backgroundColor: COLOR_SURFACE,
						borderTop: `1px solid rgba(228, 230, 232, 0.1)`,
						px: 3,
						py: 2,
					}}
				>
					<Button
						onClick={onClose}
						sx={{
							color: COLOR_TEXT_SECONDARY,
							"&:hover": {
								backgroundColor: "rgba(156, 163, 175, 0.1)",
								color: COLOR_TEXT_PRIMARY,
							},
						}}
					>
						Close
					</Button>
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
