import React, { useState, useEffect } from "react";
import {
	Dialog,
	DialogTitle,
	DialogContent,
	DialogActions,
	Button,
	Typography,
	Box,
	CircularProgress,
	IconButton,
	Divider,
	Alert,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import VehicleForm from "./VehicleForm";
import { Vehicle } from "../../models/VehicleModel";
import { vehicleService } from "../../api/VehicleAPIEndpoint";
import ClientSelector from "../common/ClientSelector";
import WorkshopSelector from "../common/WorkshopSelector";

interface EditVehicleModalProps {
	open: boolean;
	onClose: () => void;
	vehicleId: number | null;
	onVehicleUpdated: (vehicle: Vehicle) => void;
	userRole: string;
	currentWorkshopId?: number | null;
}

const EditVehicleModal: React.FC<EditVehicleModalProps> = ({
	open,
	onClose,
	vehicleId,
	onVehicleUpdated,
	userRole,
	currentWorkshopId,
}) => {
	const [loading, setLoading] = useState(false);
	const [fetchLoading, setFetchLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [vehicle, setVehicle] = useState<Vehicle | null>(null);
	const [selectedClientId, setSelectedClientId] = useState<number | null>(null);
	const [selectedWorkshopId, setSelectedWorkshopId] = useState<number | null>(
		null
	);

	// Pobierz dane pojazdu po otwarciu modalu
	useEffect(() => {
		if (open && vehicleId) {
			fetchVehicleDetails(vehicleId);
		}
	}, [open, vehicleId]);

	const fetchVehicleDetails = async (id: number) => {
		try {
			setFetchLoading(true);
			setError(null);
			const vehicleData = await vehicleService.getVehicleById(id);
			setVehicle(vehicleData);
			setSelectedClientId(vehicleData.owner_id || null);
			setSelectedWorkshopId(vehicleData.workshop_id || null);
		} catch (err) {
			console.error("Error fetching vehicle details:", err);
			setError("Failed to load vehicle details");
		} finally {
			setFetchLoading(false);
		}
	};

	const handleSubmit = async (vehicleData: Partial<Vehicle>) => {
		if (!vehicleId) return;

		try {
			setLoading(true);
			setError(null);

			// Określenie warsztatu w zależności od roli
			let workshopIdToUse = vehicle?.workshop_id; // Domyślnie zachowujemy aktualny warsztat

			if (userRole === "admin") {
				// Admin może zmienić warsztat
				workshopIdToUse = selectedWorkshopId;
			} else if (userRole === "owner" || userRole === "mechanic") {
				// Owner i mechanic mogą przypisać tylko do swojego warsztatu
				workshopIdToUse = currentWorkshopId;
			}
			// Client nie może zmienić przypisania do warsztatu

			// Określenie właściciela w zależności od roli
			const ownerIdToUse =
				userRole === "client"
					? vehicle?.owner_id // Klient nie może zmienić właściciela
					: selectedClientId;

			// Przygotowanie danych do aktualizacji
			const updatedVehicle: Partial<Vehicle> = {
				...vehicleData,
				owner_id: ownerIdToUse,
				workshop_id: workshopIdToUse,
			};

			const response = await vehicleService.updateVehicle(
				vehicleId,
				updatedVehicle
			);
			onVehicleUpdated(response);
			onClose();
		} catch (err) {
			console.error("Error updating vehicle:", err);
			setError("Failed to update the vehicle. Please try again.");
		} finally {
			setLoading(false);
		}
	};

	// Zamknij modal, gdy zmieni się vehicleId (po usunięciu pojazdu)
	useEffect(() => {
		if (!vehicleId) {
			onClose();
		}
	}, [vehicleId]);

	return (
		<Dialog
			open={open}
			onClose={loading || fetchLoading ? undefined : onClose}
			fullWidth
			maxWidth="md"
			PaperProps={{ sx: { borderRadius: 2 } }}
		>
			<DialogTitle
				sx={{
					display: "flex",
					justifyContent: "space-between",
					alignItems: "center",
					bgcolor: "#ff3c4e",
					color: "white",
				}}
			>
				<Typography variant="h6">Edit Vehicle</Typography>
				<IconButton
					edge="end"
					color="inherit"
					onClick={onClose}
					disabled={loading || fetchLoading}
					aria-label="close"
				>
					<CloseIcon />
				</IconButton>
			</DialogTitle>

			<DialogContent sx={{ py: 3 }}>
				{error && (
					<Alert severity="error" sx={{ mb: 3 }}>
						{error}
					</Alert>
				)}

				{fetchLoading ? (
					<Box sx={{ display: "flex", justifyContent: "center", py: 5 }}>
						<CircularProgress color="error" />
					</Box>
				) : (
					vehicle && (
						<>
							{/* Wybór klienta - widoczny tylko dla admin, owner i mechanic */}
							{userRole !== "client" && (
								<Box sx={{ mb: 3 }}>
									<Typography
										variant="subtitle1"
										fontWeight="bold"
										gutterBottom
									>
										Select Client
									</Typography>
									<ClientSelector
										value={selectedClientId}
										onChange={(clientId) => setSelectedClientId(clientId)}
										disabled={loading}
									/>
								</Box>
							)}

							{/* Wybór warsztatu - widoczny tylko dla admina */}
							{userRole === "admin" && (
								<Box sx={{ mb: 3 }}>
									<Typography
										variant="subtitle1"
										fontWeight="bold"
										gutterBottom
									>
										Select Workshop
									</Typography>
									<WorkshopSelector
										value={selectedWorkshopId}
										onChange={(workshopId) => setSelectedWorkshopId(workshopId)}
										disabled={loading}
									/>
								</Box>
							)}

							{/* Dla owner i mechanic - tylko informacja o przypisaniu do ich warsztatu */}
							{(userRole === "owner" || userRole === "mechanic") &&
								currentWorkshopId && (
									<Box sx={{ mb: 3 }}>
										<Typography
											variant="subtitle1"
											fontWeight="bold"
											gutterBottom
										>
											Workshop
										</Typography>
										<Typography variant="body1">
											This vehicle is assigned to your workshop.
										</Typography>
									</Box>
								)}

							<Divider sx={{ my: 2 }} />

							<Typography variant="subtitle1" fontWeight="bold" gutterBottom>
								Vehicle Information
							</Typography>
							<VehicleForm
								initialData={vehicle}
								onSubmit={handleSubmit}
								isLoading={loading}
								error={error}
							/>
						</>
					)
				)}
			</DialogContent>

			<DialogActions sx={{ px: 3, pb: 3 }}>
				<Button
					onClick={onClose}
					color="inherit"
					disabled={loading || fetchLoading}
				>
					Cancel
				</Button>
			</DialogActions>
		</Dialog>
	);
};

export default EditVehicleModal;
