import React from "react";
import {
	Dialog,
	DialogTitle,
	DialogContent,
	DialogActions,
	Button,
	Typography,
	Box,
	Grid,
	Chip,
	Divider,
	IconButton,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import DirectionsCarIcon from "@mui/icons-material/DirectionsCar";
import BuildIcon from "@mui/icons-material/Build";
import EventIcon from "@mui/icons-material/Event";
import { Vehicle } from "../../models/VehicleModel";

interface VehicleDetailDialogProps {
	open: boolean;
	onClose: () => void;
	vehicle: Vehicle | null;
}

const VehicleDetailDialog: React.FC<VehicleDetailDialogProps> = ({
	open,
	onClose,
	vehicle,
}) => {
	if (!vehicle) return null;

	// Formatowanie daty do czytelnego formatu
	const formatDate = (dateString?: string) => {
		if (!dateString) return "N/A";
		return new Date(dateString).toLocaleDateString();
	};

	// Funkcja do określania koloru statusu
	const getStatusColor = (status: string | undefined) => {
		if (!status) return "default";

		switch (status.toLowerCase()) {
			case "active":
				return "success";
			case "inactive":
				return "error";
			case "maintenance":
				return "warning";
			default:
				return "default";
		}
	};

	// Sprawdzanie czy pojazd wymaga przeglądu
	const isMaintenanceDue = vehicle.next_service_due
		? new Date(vehicle.next_service_due) <= new Date()
		: false;

	// Add the helper function
	const capitalizeFirstLetter = (text: string | undefined): string => {
		if (!text) return "Unknown";
		return text.charAt(0).toUpperCase() + text.slice(1);
	};

	return (
		<Dialog
			open={open}
			onClose={onClose}
			fullWidth
			maxWidth="md"
			PaperProps={{
				sx: { borderRadius: 2 },
			}}
		>
			<DialogTitle
				sx={{
					bgcolor: "#ff3c4e",
					color: "white",
					display: "flex",
					justifyContent: "space-between",
					alignItems: "center",
				}}
			>
				<Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
					<DirectionsCarIcon />
					<Typography variant="h6">
						{capitalizeFirstLetter(vehicle.brand)} {vehicle.model || ""} (
						{vehicle.year || ""})
					</Typography>
				</Box>
				<IconButton
					edge="end"
					color="inherit"
					onClick={onClose}
					aria-label="close"
				>
					<CloseIcon />
				</IconButton>
			</DialogTitle>

			<DialogContent sx={{ py: 3 }}>
				<Box sx={{ mb: 3, display: "flex", justifyContent: "center" }}>
					{vehicle.image_url ? (
						<img
							src={vehicle.image_url}
							alt={`${vehicle.brand || "Vehicle"} ${vehicle.model || ""}`}
							style={{ maxHeight: 200, maxWidth: "100%", objectFit: "contain" }}
						/>
					) : (
						<DirectionsCarIcon sx={{ fontSize: 100, color: "#ccc" }} />
					)}
				</Box>

				<Box
					sx={{
						mb: 3,
						display: "flex",
						justifyContent: "space-between",
						alignItems: "center",
					}}
				>
					<Typography variant="subtitle1" fontWeight="bold">
						{vehicle.registration_number || "No Registration"}
					</Typography>
					{vehicle.status ? (
						<Chip
							label={
								vehicle.status.charAt(0).toUpperCase() + vehicle.status.slice(1)
							}
							color={getStatusColor(vehicle.status) as any}
						/>
					) : (
						<Chip label="Unknown" color="default" />
					)}
				</Box>

				<Divider sx={{ mb: 3 }} />

				<Grid container spacing={2}>
					<Grid item xs={12} sm={6}>
						<Box sx={{ mb: 2 }}>
							<Typography variant="body2" color="text.secondary">
								Brand
							</Typography>
							<Typography variant="body1" fontWeight="medium">
								{vehicle.brand
									? capitalizeFirstLetter(vehicle.brand)
									: "Unknown"}
							</Typography>
						</Box>
					</Grid>

					<Grid item xs={12} sm={6}>
						<Box sx={{ mb: 2 }}>
							<Typography variant="body2" color="text.secondary">
								Model
							</Typography>
							<Typography variant="body1" fontWeight="medium">
								{vehicle.model}
							</Typography>
						</Box>
					</Grid>

					<Grid item xs={12} sm={6}>
						<Box sx={{ mb: 2 }}>
							<Typography variant="body2" color="text.secondary">
								Year
							</Typography>
							<Typography variant="body1" fontWeight="medium">
								{vehicle.year}
							</Typography>
						</Box>
					</Grid>

					<Grid item xs={12} sm={6}>
						<Box sx={{ mb: 2 }}>
							<Typography variant="body2" color="text.secondary">
								VIN
							</Typography>
							<Typography variant="body1" fontWeight="medium">
								{vehicle.vin}
							</Typography>
						</Box>
					</Grid>

					<Grid item xs={12} sm={6}>
						<Box sx={{ mb: 2 }}>
							<Typography variant="body2" color="text.secondary">
								Engine Type
							</Typography>
							<Typography variant="body1" fontWeight="medium">
								{vehicle.engine_type || "N/A"}
							</Typography>
						</Box>
					</Grid>

					<Grid item xs={12} sm={6}>
						<Box sx={{ mb: 2 }}>
							<Typography variant="body2" color="text.secondary">
								Color
							</Typography>
							<Typography variant="body1" fontWeight="medium">
								{vehicle.color || "N/A"}
							</Typography>
						</Box>
					</Grid>

					<Grid item xs={12} sm={6}>
						<Box sx={{ mb: 2 }}>
							<Typography variant="body2" color="text.secondary">
								Mileage
							</Typography>
							<Typography variant="body1" fontWeight="medium">
								{vehicle.mileage
									? `${vehicle.mileage.toLocaleString()} km`
									: "N/A"}
							</Typography>
						</Box>
					</Grid>

					<Grid item xs={12} sm={6}>
						<Box sx={{ mb: 2 }}>
							<Typography variant="body2" color="text.secondary">
								Fuel Type
							</Typography>
							<Typography variant="body1" fontWeight="medium">
								{vehicle.fuel_type || "N/A"}
							</Typography>
						</Box>
					</Grid>

					<Grid item xs={12} sm={6}>
						<Box sx={{ mb: 2 }}>
							<Typography variant="body2" color="text.secondary">
								Transmission
							</Typography>
							<Typography variant="body1" fontWeight="medium">
								{vehicle.transmission || "N/A"}
							</Typography>
						</Box>
					</Grid>

					<Grid item xs={12} sm={6}>
						<Box sx={{ mb: 2 }}>
							<Typography variant="body2" color="text.secondary">
								Owner
							</Typography>
							<Typography variant="body1" fontWeight="medium">
								{vehicle.owner_name || `Owner ID: ${vehicle.owner_id}`}
							</Typography>
						</Box>
					</Grid>

					<Grid item xs={12} sm={6}>
						<Box sx={{ mb: 2 }}>
							<Typography variant="body2" color="text.secondary">
								Brand
							</Typography>
							<Typography variant="body1" fontWeight="medium">
								{vehicle.brand || "Unknown"}
							</Typography>
						</Box>
					</Grid>
				</Grid>

				<Divider sx={{ my: 3 }} />

				<Box sx={{ mb: 2 }}>
					<Typography
						variant="h6"
						sx={{ mb: 2, display: "flex", alignItems: "center", gap: 1 }}
					>
						<EventIcon color="primary" />
						Maintenance Information
					</Typography>

					<Grid container spacing={2}>
						<Grid item xs={12} sm={6}>
							<Box sx={{ mb: 2 }}>
								<Typography variant="body2" color="text.secondary">
									Last Service Date
								</Typography>
								<Typography variant="body1" fontWeight="medium">
									{formatDate(vehicle.last_service_date)}
								</Typography>
							</Box>
						</Grid>

						<Grid item xs={12} sm={6}>
							<Box sx={{ mb: 2 }}>
								<Typography variant="body2" color="text.secondary">
									Next Service Due
								</Typography>
								<Typography
									variant="body1"
									fontWeight="medium"
									color={isMaintenanceDue ? "error" : "inherit"}
								>
									{formatDate(vehicle.next_service_due)}
									{isMaintenanceDue && (
										<Chip
											size="small"
											color="warning"
											label="Overdue"
											icon={<BuildIcon />}
											sx={{ ml: 1 }}
										/>
									)}
								</Typography>
							</Box>
						</Grid>
					</Grid>
				</Box>

				{vehicle.workshop_id && (
					<Box sx={{ mt: 2, p: 2, bgcolor: "#f5f5f5", borderRadius: 2 }}>
						<Typography variant="subtitle2" color="text.secondary">
							Workshop Information
						</Typography>
						<Typography variant="body1">
							{vehicle.workshop_name || `Workshop ID: ${vehicle.workshop_id}`}
						</Typography>
					</Box>
				)}
			</DialogContent>

			<DialogActions sx={{ p: 2 }}>
				<Button onClick={onClose} variant="outlined">
					Close
				</Button>
			</DialogActions>
		</Dialog>
	);
};

export default VehicleDetailDialog;
