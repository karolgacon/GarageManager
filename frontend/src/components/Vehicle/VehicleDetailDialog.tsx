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
import {
	COLOR_PRIMARY,
	COLOR_SURFACE,
	COLOR_TEXT_PRIMARY,
	COLOR_TEXT_SECONDARY,
} from "../../constants";

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

	const formatDate = (dateString?: string) => {
		if (!dateString) return "N/A";
		return new Date(dateString).toLocaleDateString();
	};

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

	const isMaintenanceDue = vehicle.next_service_due
		? new Date(vehicle.next_service_due) <= new Date()
		: false;

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
				sx: {
					borderRadius: 2,
					backgroundColor: COLOR_SURFACE,
					color: COLOR_TEXT_PRIMARY,
				},
			}}
		>
			<DialogTitle
				sx={{
					bgcolor: COLOR_PRIMARY,
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

			<DialogContent
				sx={{
					py: 3,
					backgroundColor: COLOR_SURFACE,
					color: COLOR_TEXT_PRIMARY,
				}}
			>
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
						<Typography
							variant="body2"
							sx={{ color: COLOR_TEXT_SECONDARY, display: "inline", mr: 1 }}
						>
							Brand:
						</Typography>
						<Typography
							variant="body1"
							fontWeight="medium"
							sx={{ color: COLOR_TEXT_PRIMARY, display: "inline" }}
						>
							{vehicle.brand ? capitalizeFirstLetter(vehicle.brand) : "Unknown"}
						</Typography>
					</Grid>

					<Grid item xs={12} sm={6}>
						<Typography
							variant="body2"
							sx={{ color: COLOR_TEXT_SECONDARY, display: "inline", mr: 1 }}
						>
							Model:
						</Typography>
						<Typography
							variant="body1"
							fontWeight="medium"
							sx={{ color: COLOR_TEXT_PRIMARY, display: "inline" }}
						>
							{vehicle.model || "Unknown"}
						</Typography>
					</Grid>

					<Grid item xs={12} sm={6}>
						<Typography
							variant="body2"
							sx={{ color: COLOR_TEXT_SECONDARY, display: "inline", mr: 1 }}
						>
							Year:
						</Typography>
						<Typography
							variant="body1"
							fontWeight="medium"
							sx={{ color: COLOR_TEXT_PRIMARY, display: "inline" }}
						>
							{vehicle.year}
						</Typography>
					</Grid>

					<Grid item xs={12} sm={6}>
						<Typography
							variant="body2"
							sx={{ color: COLOR_TEXT_SECONDARY, display: "inline", mr: 1 }}
						>
							VIN:
						</Typography>
						<Typography
							variant="body1"
							fontWeight="medium"
							sx={{ color: COLOR_TEXT_PRIMARY, display: "inline" }}
						>
							{vehicle.vin}
						</Typography>
					</Grid>

					<Grid item xs={12} sm={6}>
						<Typography
							variant="body2"
							sx={{ color: COLOR_TEXT_SECONDARY, display: "inline", mr: 1 }}
						>
							Engine:
						</Typography>
						<Typography
							variant="body1"
							fontWeight="medium"
							sx={{ color: COLOR_TEXT_PRIMARY, display: "inline" }}
						>
							{vehicle.engine_type || "N/A"}
						</Typography>
					</Grid>

					<Grid item xs={12} sm={6}>
						<Typography
							variant="body2"
							sx={{ color: COLOR_TEXT_SECONDARY, display: "inline", mr: 1 }}
						>
							Color:
						</Typography>
						<Typography
							variant="body1"
							fontWeight="medium"
							sx={{ color: COLOR_TEXT_PRIMARY, display: "inline" }}
						>
							{vehicle.color || "N/A"}
						</Typography>
					</Grid>

					<Grid item xs={12} sm={6}>
						<Typography
							variant="body2"
							sx={{ color: COLOR_TEXT_SECONDARY, display: "inline", mr: 1 }}
						>
							Mileage:
						</Typography>
						<Typography
							variant="body1"
							fontWeight="medium"
							sx={{ color: COLOR_TEXT_PRIMARY, display: "inline" }}
						>
							{vehicle.mileage
								? `${vehicle.mileage.toLocaleString()} km`
								: "N/A"}
						</Typography>
					</Grid>

					<Grid item xs={12} sm={6}>
						<Typography
							variant="body2"
							sx={{ color: COLOR_TEXT_SECONDARY, display: "inline", mr: 1 }}
						>
							Fuel Type:
						</Typography>
						<Typography
							variant="body1"
							fontWeight="medium"
							sx={{ color: COLOR_TEXT_PRIMARY, display: "inline" }}
						>
							{vehicle.fuel_type || "N/A"}
						</Typography>
					</Grid>

					<Grid item xs={12} sm={6}>
						<Typography
							variant="body2"
							sx={{ color: COLOR_TEXT_SECONDARY, display: "inline", mr: 1 }}
						>
							Transmission:
						</Typography>
						<Typography
							variant="body1"
							fontWeight="medium"
							sx={{ color: COLOR_TEXT_PRIMARY, display: "inline" }}
						>
							{vehicle.transmission || "N/A"}
						</Typography>
					</Grid>

					<Grid item xs={12} sm={6}>
						<Typography
							variant="body2"
							sx={{ color: COLOR_TEXT_SECONDARY, display: "inline", mr: 1 }}
						>
							Owner:
						</Typography>
						<Typography
							variant="body1"
							fontWeight="medium"
							sx={{ color: COLOR_TEXT_PRIMARY, display: "inline" }}
						>
							{vehicle.owner_name || `Owner ID: ${vehicle.owner_id}`}
						</Typography>
					</Grid>
				</Grid>

				<Divider sx={{ my: 3, borderColor: "rgba(228, 230, 232, 0.2)" }} />

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
								<Typography
									variant="body2"
									sx={{ color: COLOR_TEXT_SECONDARY, display: "inline", mr: 1 }}
								>
									Last Service:
								</Typography>
								<Typography
									variant="body1"
									fontWeight="medium"
									sx={{ color: COLOR_TEXT_PRIMARY, display: "inline" }}
								>
									{formatDate(vehicle.last_service_date)}
								</Typography>
							</Box>
						</Grid>

						<Grid item xs={12} sm={6}>
							<Box sx={{ mb: 2 }}>
								<Typography
									variant="body2"
									sx={{ color: COLOR_TEXT_SECONDARY, display: "inline", mr: 1 }}
								>
									Next Service:
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
					<Box sx={{ mt: 2, p: 2, bgcolor: COLOR_SURFACE, borderRadius: 2 }}>
						<Typography
							variant="subtitle2"
							sx={{ color: COLOR_TEXT_SECONDARY }}
						>
							Workshop Information
						</Typography>
						<Typography variant="body1">
							{vehicle.workshop_name || `Workshop ID: ${vehicle.workshop_id}`}
						</Typography>
					</Box>
				)}
			</DialogContent>

			<DialogActions
				sx={{
					p: 2,
					backgroundColor: COLOR_SURFACE,
				}}
			>
				<Button onClick={onClose} variant="outlined">
					Close
				</Button>
			</DialogActions>
		</Dialog>
	);
};

export default VehicleDetailDialog;
