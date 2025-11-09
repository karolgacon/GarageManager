import React, { useState, useEffect, useRef } from "react";
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
import {
	COLOR_PRIMARY,
	COLOR_SURFACE,
	COLOR_TEXT_PRIMARY,
} from "../../constants";
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
	const [fetchLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [vehicle, setVehicle] = useState<Vehicle | null>(null);
	const [selectedClientId, setSelectedClientId] = useState<number | null>(null);
	const [selectedWorkshopId, setSelectedWorkshopId] = useState<number | null>(
		null
	);
	const vehicleFormRef = useRef<{ validateAndSubmit: () => boolean }>(null);

	useEffect(() => {
		if (open) {
			const fixAriaHidden = () => {
				document.getElementById("root")?.removeAttribute("aria-hidden");
			};

			fixAriaHidden();

			const timer = setTimeout(fixAriaHidden, 100);
			return () => clearTimeout(timer);
		}
	}, [open]);

	useEffect(() => {
		let isMounted = true;

		const fetchVehicleData = async () => {
			try {
				setLoading(true);
				setError(null);

				const data = await vehicleService.getVehicleById(vehicleId);

				if (!data || !data.id) {
					throw new Error("Pobrano niepełne dane pojazdu");
				}

				setVehicle(data);
				setSelectedClientId(data.owner_id || null);
				setSelectedWorkshopId(data.workshop_id || null);
				setLoading(false);
			} catch (err) {
				setError("Nie udało się pobrać danych pojazdu");
			} finally {
				setLoading(false);
			}
		};

		if (open && vehicleId) {
			fetchVehicleData();
		}

		return () => {
			isMounted = false;
		};
	}, [open, vehicleId]);

	const handleSubmit = async (updatedVehicleData: Partial<Vehicle>) => {
		setLoading(true);
		setError(null);

		try {
			const cleanData = { ...updatedVehicleData };
			delete cleanData.owner_name;
			delete cleanData.workshop_name;

			if (userRole !== "client" && selectedClientId) {
				cleanData.owner_id = selectedClientId;
			}

			if (selectedWorkshopId) {
				cleanData.workshop_id = selectedWorkshopId;
			}

			const response = await vehicleService.updateVehicle(
				vehicleId!,
				cleanData
			);
			onVehicleUpdated(response);
			onClose();
		} catch (err: any) {
			if (err.response) {
				const errorMessage =
					err.response.data?.detail || "Nie udało się zaktualizować pojazdu.";
				setError(errorMessage);
			} else {
				setError("Failed to update the vehicle. Please try again.");
			}
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		if (!vehicleId) {
			onClose();
		}
	}, [vehicleId]);

	return (
		<Dialog
			open={open}
			onClose={onClose}
			onClick={(e) => e.stopPropagation()}
			disableEnforceFocus
			keepMounted
			TransitionProps={{
				onEnter: () => {
					document.getElementById("root")?.removeAttribute("aria-hidden");
				},
			}}
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
					display: "flex",
					justifyContent: "space-between",
					alignItems: "center",
					bgcolor: COLOR_PRIMARY,
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

			<DialogContent
				sx={{
					py: 3,
					backgroundColor: COLOR_SURFACE,
					color: COLOR_TEXT_PRIMARY,
				}}
			>
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
								ref={vehicleFormRef}
								initialData={vehicle}
								onSubmit={handleSubmit}
								isLoading={loading}
								error={error}
							/>
						</>
					)
				)}
			</DialogContent>

			<DialogActions
				sx={{
					px: 3,
					pb: 3,
					backgroundColor: COLOR_SURFACE,
				}}
			>
				<Button
					onClick={onClose}
					color="inherit"
					disabled={loading || fetchLoading}
				>
					Cancel
				</Button>
				<Button
					onClick={() => {
						if (vehicleFormRef.current) {
							vehicleFormRef.current.validateAndSubmit();
						}
					}}
					variant="contained"
					color="primary"
					disabled={loading || fetchLoading}
					startIcon={
						loading ? <CircularProgress size={20} color="inherit" /> : null
					}
					sx={{
						bgcolor: COLOR_PRIMARY,
						"&:hover": {
							bgcolor: "#2563EB",
						},
					}}
				>
					{loading ? "Saving..." : "Save Changes"}
				</Button>
			</DialogActions>
		</Dialog>
	);
};

export default EditVehicleModal;
