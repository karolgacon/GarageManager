import React, { useState, useEffect } from "react";
import {
	Box,
	Grid,
	Card,
	CardContent,
	Typography,
	Button,
	CircularProgress,
	Alert,
	Chip,
	Dialog,
	DialogTitle,
	DialogContent,
	DialogActions,
	IconButton,
} from "@mui/material";
import {
	DirectionsCar as CarIcon,
	Add as AddIcon,
	CheckCircle as CheckIcon,
	Close as CloseIcon,
	CalendarToday as YearIcon,
	Build as EngineIcon,
} from "@mui/icons-material";
import { customerService } from "../../../api/CustomerAPIEndpoint";
import {
	COLOR_PRIMARY,
	COLOR_SURFACE,
	COLOR_TEXT_PRIMARY,
	COLOR_TEXT_SECONDARY,
} from "../../../constants";

interface Vehicle {
	id: number;
	brand: string;
	model: string;
	year: number;
	registration_number: string;
	vin?: string;
	engine_type?: string;
	fuel_type?: string;
	mileage?: number;
}

interface VehicleSelectionStepProps {
	selectedVehicle?: Vehicle;
	onVehicleSelect: (vehicle: Vehicle) => void;
	onValidationChange: (isValid: boolean) => void;
	userId?: number;
	userRole?: string;
}

const VehicleSelectionStep: React.FC<VehicleSelectionStepProps> = ({
	selectedVehicle,
	onVehicleSelect,
	onValidationChange,
	userId,
	userRole,
}) => {
	const [vehicles, setVehicles] = useState<Vehicle[]>([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [showAddVehicleDialog, setShowAddVehicleDialog] = useState(false);

	useEffect(() => {
		if (userId && userRole === "client") {
			loadUserVehicles();
		}
	}, [userId, userRole]);

	useEffect(() => {
		onValidationChange(!!selectedVehicle);
	}, [selectedVehicle]);

	const loadUserVehicles = async () => {
		if (!userId) {
			console.log("VehicleSelectionStep: Brak userId!", { userId, userRole });
			return;
		}

		console.log("VehicleSelectionStep: Ładowanie pojazdów dla userId:", userId);
		setLoading(true);
		setError(null);

		try {
			const userVehicles = await customerService.getCustomerVehicles(userId);
			console.log("VehicleSelectionStep: Pobrane pojazdy:", userVehicles);
			console.log(
				"VehicleSelectionStep: Liczba pojazdów:",
				userVehicles?.length || 0
			);

			// Sprawdź czy pojazdy należą do tego użytkownika
			if (userVehicles && userVehicles.length > 0) {
				userVehicles.forEach((vehicle: any) => {
					console.log(
						`Pojazd ID: ${vehicle.id}, Owner ID: ${vehicle.owner_id}, Brand: ${vehicle.brand}, Model: ${vehicle.model}`
					);
				});
			}

			setVehicles(userVehicles || []);
		} catch (error) {
			setError("Nie można pobrać listy pojazdów");
			console.error("Error loading vehicles:", error);
			setVehicles([]);
		} finally {
			setLoading(false);
		}
	};

	const handleVehicleSelect = (vehicle: Vehicle) => {
		onVehicleSelect(vehicle);
	};

	const renderVehicleCard = (vehicle: Vehicle) => (
		<Card
			key={vehicle.id}
			sx={{
				backgroundColor:
					selectedVehicle?.id === vehicle.id
						? "rgba(56, 130, 246, 0.1)"
						: COLOR_SURFACE,
				border:
					selectedVehicle?.id === vehicle.id
						? `2px solid ${COLOR_PRIMARY}`
						: "1px solid rgba(255, 255, 255, 0.1)",
				cursor: "pointer",
				transition: "all 0.2s ease",
				"&:hover": {
					borderColor: COLOR_PRIMARY,
					transform: "translateY(-2px)",
				},
			}}
			onClick={() => handleVehicleSelect(vehicle)}
		>
			<CardContent sx={{ p: 3 }}>
				<Box
					sx={{
						display: "flex",
						alignItems: "flex-start",
						justifyContent: "space-between",
						mb: 2,
					}}
				>
					<Box sx={{ display: "flex", alignItems: "center" }}>
						<CarIcon sx={{ color: COLOR_PRIMARY, fontSize: 32, mr: 2 }} />
						<Box>
							<Typography
								variant="h6"
								sx={{ color: COLOR_TEXT_PRIMARY, fontWeight: 600 }}
							>
								{vehicle.brand} {vehicle.model}
							</Typography>
							<Typography variant="body2" sx={{ color: COLOR_TEXT_SECONDARY }}>
								{vehicle.registration_number}
							</Typography>
						</Box>
					</Box>

					{selectedVehicle?.id === vehicle.id && (
						<CheckIcon sx={{ color: COLOR_PRIMARY, fontSize: 24 }} />
					)}
				</Box>

				<Grid container spacing={2} sx={{ mb: 2 }}>
					<Grid item xs={6}>
						<Box sx={{ display: "flex", alignItems: "center" }}>
							<YearIcon
								sx={{ fontSize: 16, color: COLOR_TEXT_SECONDARY, mr: 0.5 }}
							/>
							<Typography variant="body2" sx={{ color: COLOR_TEXT_SECONDARY }}>
								Rok: {vehicle.year}
							</Typography>
						</Box>
					</Grid>
					{vehicle.engine_type && (
						<Grid item xs={6}>
							<Box sx={{ display: "flex", alignItems: "center" }}>
								<EngineIcon
									sx={{ fontSize: 16, color: COLOR_TEXT_SECONDARY, mr: 0.5 }}
								/>
								<Typography
									variant="body2"
									sx={{ color: COLOR_TEXT_SECONDARY }}
								>
									{vehicle.engine_type}
								</Typography>
							</Box>
						</Grid>
					)}
				</Grid>

				<Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
					{vehicle.fuel_type && (
						<Chip
							label={vehicle.fuel_type}
							size="small"
							sx={{
								backgroundColor: "rgba(56, 130, 246, 0.2)",
								color: COLOR_PRIMARY,
								border: `1px solid ${COLOR_PRIMARY}`,
							}}
						/>
					)}
					{vehicle.mileage && (
						<Chip
							label={`${vehicle.mileage.toLocaleString()} km`}
							size="small"
							sx={{
								backgroundColor: "rgba(255, 255, 255, 0.1)",
								color: COLOR_TEXT_SECONDARY,
							}}
						/>
					)}
				</Box>

				{vehicle.vin && (
					<Typography
						variant="caption"
						sx={{ color: COLOR_TEXT_SECONDARY, mt: 1, display: "block" }}
					>
						VIN: {vehicle.vin}
					</Typography>
				)}
			</CardContent>
		</Card>
	);

	if (userRole !== "client") {
		return (
			<Alert severity="info">
				Wybór pojazdu jest dostępny tylko dla klientów.
			</Alert>
		);
	}

	return (
		<Box>
			{/* Header */}
			<Box
				sx={{
					display: "flex",
					justifyContent: "space-between",
					alignItems: "center",
					mb: 3,
				}}
			>
				<Typography variant="h6" sx={{ color: COLOR_TEXT_PRIMARY }}>
					Wybierz pojazd do serwisu
				</Typography>

				<Button
					variant="outlined"
					startIcon={<AddIcon />}
					onClick={() => setShowAddVehicleDialog(true)}
					sx={{
						color: COLOR_TEXT_PRIMARY,
						borderColor: "rgba(255, 255, 255, 0.3)",
						"&:hover": {
							borderColor: COLOR_PRIMARY,
							backgroundColor: "rgba(56, 130, 246, 0.1)",
						},
					}}
				>
					Dodaj pojazd
				</Button>
			</Box>

			{/* Loading State */}
			{loading ? (
				<Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
					<CircularProgress sx={{ color: COLOR_PRIMARY }} />
				</Box>
			) : error ? (
				<Alert severity="error" sx={{ mb: 3 }}>
					{error}
					<Button
						onClick={loadUserVehicles}
						sx={{ ml: 2, color: COLOR_PRIMARY }}
						size="small"
					>
						Spróbuj ponownie
					</Button>
				</Alert>
			) : vehicles.length === 0 ? (
				<Card
					sx={{
						backgroundColor: COLOR_SURFACE,
						border: "1px solid rgba(255, 255, 255, 0.1)",
					}}
				>
					<CardContent sx={{ textAlign: "center", py: 6 }}>
						<CarIcon
							sx={{ fontSize: 64, color: COLOR_TEXT_SECONDARY, mb: 2 }}
						/>
						<Typography variant="h6" sx={{ color: COLOR_TEXT_PRIMARY, mb: 1 }}>
							Nie masz jeszcze żadnych pojazdów
						</Typography>
						<Typography
							variant="body2"
							sx={{ color: COLOR_TEXT_SECONDARY, mb: 3 }}
						>
							Dodaj swój pierwszy pojazd, aby móc umówić wizytę w warsztacie.
						</Typography>
						<Button
							variant="contained"
							startIcon={<AddIcon />}
							onClick={() => setShowAddVehicleDialog(true)}
							sx={{
								backgroundColor: COLOR_PRIMARY,
								"&:hover": {
									backgroundColor: "rgba(56, 130, 246, 0.8)",
								},
							}}
						>
							Dodaj pojazd
						</Button>
					</CardContent>
				</Card>
			) : (
				<Grid container spacing={3}>
					{vehicles.map((vehicle) => (
						<Grid item xs={12} md={6} key={vehicle.id}>
							{renderVehicleCard(vehicle)}
						</Grid>
					))}
				</Grid>
			)}

			{/* Selection Summary */}
			{selectedVehicle && (
				<Card
					sx={{
						mt: 4,
						backgroundColor: "rgba(56, 130, 246, 0.1)",
						border: `1px solid ${COLOR_PRIMARY}`,
					}}
				>
					<CardContent>
						<Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
							<CheckIcon sx={{ color: COLOR_PRIMARY, mr: 1 }} />
							<Typography variant="h6" sx={{ color: COLOR_PRIMARY }}>
								Wybrany pojazd
							</Typography>
						</Box>

						<Typography
							variant="body1"
							sx={{ color: COLOR_TEXT_PRIMARY, fontWeight: 600 }}
						>
							{selectedVehicle.brand} {selectedVehicle.model}
						</Typography>
						<Typography variant="body2" sx={{ color: COLOR_TEXT_SECONDARY }}>
							{selectedVehicle.registration_number} • Rok:{" "}
							{selectedVehicle.year}
							{selectedVehicle.fuel_type && ` • ${selectedVehicle.fuel_type}`}
						</Typography>
					</CardContent>
				</Card>
			)}

			{/* Add Vehicle Dialog */}
			<Dialog
				open={showAddVehicleDialog}
				onClose={() => setShowAddVehicleDialog(false)}
				maxWidth="sm"
				fullWidth
				PaperProps={{
					sx: {
						backgroundColor: COLOR_SURFACE,
						border: "1px solid rgba(255, 255, 255, 0.1)",
					},
				}}
			>
				<DialogTitle sx={{ color: COLOR_TEXT_PRIMARY }}>
					<Box
						sx={{
							display: "flex",
							justifyContent: "space-between",
							alignItems: "center",
						}}
					>
						Dodaj nowy pojazd
						<IconButton
							onClick={() => setShowAddVehicleDialog(false)}
							sx={{ color: COLOR_TEXT_SECONDARY }}
						>
							<CloseIcon />
						</IconButton>
					</Box>
				</DialogTitle>

				<DialogContent>
					<Alert severity="info" sx={{ mb: 2 }}>
						Aby dodać pojazd, przejdź do sekcji "Pojazdy" w menu głównym.
					</Alert>
					<Typography variant="body2" sx={{ color: COLOR_TEXT_SECONDARY }}>
						Po dodaniu pojazdu wróć do tego kroku, aby go wybrać.
					</Typography>
				</DialogContent>

				<DialogActions>
					<Button
						onClick={() => setShowAddVehicleDialog(false)}
						sx={{ color: COLOR_TEXT_PRIMARY }}
					>
						Zamknij
					</Button>
					<Button
						onClick={() => {
							setShowAddVehicleDialog(false);
							// Tu można dodać nawigację do sekcji pojazdów
							window.open("/vehicles", "_blank");
						}}
						sx={{ color: COLOR_PRIMARY }}
					>
						Przejdź do Pojazdów
					</Button>
				</DialogActions>
			</Dialog>
		</Box>
	);
};

export default VehicleSelectionStep;
