import React from "react";
import {
	Card,
	CardContent,
	CardActions,
	Typography,
	Box,
	Chip,
	IconButton,
	Tooltip,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import InfoIcon from "@mui/icons-material/Info";
import DirectionsCarIcon from "@mui/icons-material/DirectionsCar";
import BuildIcon from "@mui/icons-material/Build";
import { Vehicle } from "../../models/VehicleModel";

interface VehicleCardProps {
	vehicle: Vehicle;
	onEdit: (id: number) => void;
	onDelete: (id: number) => void;
	onView: (id: number) => void;
	showWorkshopInfo?: boolean;
	userRole?: string;
}

const VehicleCard: React.FC<VehicleCardProps> = ({
	vehicle,
	onEdit,
	onDelete,
	onView,
	showWorkshopInfo = false,
	userRole = "",
}) => {
	const capitalizeFirstLetter = (text: string | undefined): string => {
		if (!text) return "Unknown";
		return text.charAt(0).toUpperCase() + text.slice(1);
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

	const formatStatus = (status: string | undefined) => {
		if (!status) return "Unknown";
		return status.charAt(0).toUpperCase() + status.slice(1);
	};

	const isMaintenanceDue =
		vehicle.next_service_due != null
			? new Date(vehicle.next_service_due) <= new Date()
			: false;

	const canEditDelete =
		["admin", "owner"].includes(userRole) ||
		(userRole === "client" &&
			vehicle.owner_id === parseInt(localStorage.getItem("userId") || "0"));

	const canEdit =
		userRole === "admin" ||
		userRole === "owner" ||
		(userRole === "client" &&
			vehicle.owner_id === parseInt(localStorage.getItem("userId") || "0"));

	const canDelete =
		userRole === "admin" ||
		(userRole === "client" &&
			vehicle.owner_id === parseInt(localStorage.getItem("userId") || "0"));

	return (
		<Card
			sx={{
				height: "100%",
				display: "flex",
				flexDirection: "column",
				borderRadius: 2,
				transition: "all 0.3s",
				"&:hover": {
					boxShadow: "0 8px 16px rgba(0,0,0,0.1)",
					transform: "translateY(-4px)",
				},
			}}
		>
			<Box
				sx={{
					height: 160,
					bgcolor: "#f5f5f5",
					display: "flex",
					alignItems: "center",
					justifyContent: "center",
				}}
			>
				{vehicle.image_url ? (
					<img
						src={vehicle.image_url}
						alt={`${capitalizeFirstLetter(vehicle.brand)} ${vehicle.model}`}
						style={{
							maxHeight: "100%",
							maxWidth: "100%",
							objectFit: "contain",
						}}
					/>
				) : (
					<DirectionsCarIcon sx={{ fontSize: 80, color: "#ccc" }} />
				)}
			</Box>

			<CardContent sx={{ flexGrow: 1 }}>
				<Box
					sx={{
						display: "flex",
						justifyContent: "space-between",
						alignItems: "flex-start",
						mb: 1,
					}}
				>
					<Typography variant="h6" component="div" fontWeight="bold">
						{vehicle.brand ? capitalizeFirstLetter(vehicle.brand) : "Unknown"}{" "}
						{vehicle.model || ""}
					</Typography>
					{vehicle.status !== undefined && (
						<Chip
							label={formatStatus(vehicle.status)}
							size="small"
							color={getStatusColor(vehicle.status) as any}
						/>
					)}
				</Box>

				<Typography color="text.secondary" gutterBottom>
					{vehicle.year || "N/A"} • {vehicle.registration_number || "No Reg"}
				</Typography>

				<Box sx={{ mt: 2 }}>
					<Typography
						variant="body2"
						color="text.secondary"
						sx={{ display: "flex", alignItems: "center", gap: 0.5 }}
					>
						<Box component="span" sx={{ fontWeight: "bold", minWidth: 80 }}>
							VIN:
						</Box>
						{vehicle.vin || "N/A"}
					</Typography>

					{vehicle.engine_type != null && vehicle.engine_type !== "" && (
						<Typography
							variant="body2"
							color="text.secondary"
							sx={{ display: "flex", alignItems: "center", gap: 0.5 }}
						>
							<Box component="span" sx={{ fontWeight: "bold", minWidth: 80 }}>
								Engine:
							</Box>
							{vehicle.engine_type}
						</Typography>
					)}

					{vehicle.mileage != null && ( 
						<Typography
							variant="body2"
							color="text.secondary"
							sx={{ display: "flex", alignItems: "center", gap: 0.5 }}
						>
							<Box component="span" sx={{ fontWeight: "bold", minWidth: 80 }}>
								Mileage:
							</Box>
							{vehicle.mileage.toLocaleString()} km
						</Typography>
					)}
				</Box>

				{showWorkshopInfo && vehicle.workshop_id && (
					<Box sx={{ mt: 1, p: 1, bgcolor: "#f9f9f9", borderRadius: 1 }}>
						<Typography
							variant="caption"
							color="text.secondary"
							display="block"
						>
							Workshop: {vehicle.workshop_name || `ID: ${vehicle.workshop_id}`}
						</Typography>
					</Box>
				)}

				{isMaintenanceDue && (
					<Box
						sx={{
							mt: 2,
							display: "flex",
							alignItems: "center",
							gap: 1,
							p: 1,
							bgcolor: "warning.light",
							borderRadius: 1,
						}}
					>
						<BuildIcon color="warning" fontSize="small" />
						<Typography variant="caption" color="warning.dark">
							Maintenance due
						</Typography>
					</Box>
				)}
			</CardContent>

			<CardActions sx={{ justifyContent: "flex-end", p: 2 }}>
				<Tooltip title="View Details">
					<IconButton size="small" onClick={() => onView(vehicle.id)}>
						<InfoIcon />
					</IconButton>
				</Tooltip>
				{(canEdit || canDelete) && (
					<>
						{canEdit && (
							<Tooltip title="Edit">
								<IconButton
									size="small"
									onClick={(e) => {
										e.stopPropagation();
										onEdit(vehicle.id);
									}}
								>
									<EditIcon fontSize="small" />
								</IconButton>
							</Tooltip>
						)}
						{canDelete && (
							<Tooltip title="Delete">
								<IconButton
									size="small"
									color="error"
									onClick={(e) => {
										e.stopPropagation();
										onDelete(vehicle.id);
									}}
								>
									<DeleteIcon fontSize="small" />
								</IconButton>
							</Tooltip>
						)}
					</>
				)}
			</CardActions>
		</Card>
	);
};

export default VehicleCard;
