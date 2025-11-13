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
	Avatar,
	Chip,
	FormControl,
	FormControlLabel,
	RadioGroup,
	Radio,
} from "@mui/material";
import {
	Person as PersonIcon,
	CheckCircle as CheckIcon,
} from "@mui/icons-material";
import { workshopService } from "../../../api/WorkshopAPIEndpoint";
import {
	COLOR_PRIMARY,
	COLOR_SURFACE,
	COLOR_TEXT_PRIMARY,
	COLOR_TEXT_SECONDARY,
} from "../../../constants";

interface MechanicSelectionStepProps {
	selectedWorkshop?: any;
	selectedDateTime?: string;
	selectedMechanic?: any;
	onMechanicSelect: (mechanic: any) => void;
	onValidationChange: (isValid: boolean) => void;
}

const MechanicSelectionStep: React.FC<MechanicSelectionStepProps> = ({
	selectedWorkshop,
	selectedDateTime,
	selectedMechanic,
	onMechanicSelect,
	onValidationChange,
}) => {
	const [availableMechanics, setAvailableMechanics] = useState<any[]>([]);
	const [allMechanics, setAllMechanics] = useState<any[]>([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	// Krok mechanika jest opcjonalny - zawsze valid
	useEffect(() => {
		onValidationChange(true);
	}, []); // Usuń onValidationChange z dependencies

	useEffect(() => {
		if (selectedWorkshop) {
			loadWorkshopMechanics();
		}
	}, [selectedWorkshop]);

	useEffect(() => {
		if (selectedWorkshop && selectedDateTime) {
			loadAvailableMechanics();
		}
	}, [selectedWorkshop, selectedDateTime]);

	const loadWorkshopMechanics = async () => {
		if (!selectedWorkshop?.id) return;

		try {
			setLoading(true);
			setError(null);

			// Pobierz wszystkich mechaników w warsztacie
			const response = await workshopService.getWorkshopMechanics(
				selectedWorkshop.id
			);
			setAllMechanics(response.mechanics || []);
		} catch (err) {
			console.error("Error loading workshop mechanics:", err);
			setError("Błąd podczas ładowania listy mechaników");
		} finally {
			setLoading(false);
		}
	};

	const loadAvailableMechanics = async () => {
		if (!selectedWorkshop?.id || !selectedDateTime) return;

		try {
			const dateTime = new Date(selectedDateTime);
			const date = dateTime.toISOString().split("T")[0]; // YYYY-MM-DD
			const time = dateTime.toTimeString().slice(0, 5); // HH:MM

			// Sprawdź dostępność mechaników dla konkretnego terminu
			const response = await workshopService.checkMechanicAvailability(
				selectedWorkshop.id,
				date,
				time,
				60 // 1 hour duration
			);

			// Backend zwraca wszystkich mechaników z flagą is_available
			const allMechanicsWithAvailability = response.mechanics || [];
			const availableMechanicsFiltered = allMechanicsWithAvailability.filter(
				(mechanic: any) => mechanic.is_available
			);
			setAvailableMechanics(availableMechanicsFiltered);
		} catch (err) {
			console.error("Error checking mechanic availability:", err);
			// Nie pokazujemy błędu - to opcjonalne
		}
	};

	const handleMechanicSelect = (mechanic: any) => {
		onMechanicSelect(mechanic);
	};

	const handleSkip = () => {
		onMechanicSelect(null);
	};

	const renderMechanicCard = (mechanic: any, isAvailable: boolean) => {
		const isSelected = selectedMechanic?.id === mechanic.id;

		return (
			<Grid item xs={12} sm={6} md={4} key={mechanic.id}>
				<Card
					sx={{
						cursor: "pointer",
						bgcolor: isSelected ? COLOR_PRIMARY : COLOR_SURFACE,
						border: `2px solid ${
							isSelected ? COLOR_PRIMARY : "rgba(255, 255, 255, 0.1)"
						}`,
						transition: "all 0.3s ease",
						opacity: isAvailable ? 1 : 0.6,
						"&:hover": {
							borderColor: COLOR_PRIMARY,
							transform: "translateY(-2px)",
						},
					}}
					onClick={() => isAvailable && handleMechanicSelect(mechanic)}
				>
					<CardContent sx={{ p: 3 }}>
						<Box display="flex" flexDirection="column" alignItems="center">
							<Avatar
								sx={{
									width: 60,
									height: 60,
									bgcolor: isSelected ? "white" : COLOR_PRIMARY,
									color: isSelected ? COLOR_PRIMARY : "white",
									mb: 2,
								}}
							>
								<PersonIcon fontSize="large" />
							</Avatar>

							<Typography
								variant="h6"
								color={isSelected ? "white" : COLOR_TEXT_PRIMARY}
								gutterBottom
								textAlign="center"
							>
								{mechanic.first_name} {mechanic.last_name}
							</Typography>

							<Box
								display="flex"
								gap={1}
								flexWrap="wrap"
								justifyContent="center"
							>
								{isAvailable ? (
									<Chip
										icon={<CheckIcon />}
										label="Dostępny"
										color="success"
										size="small"
									/>
								) : (
									<Chip label="Niedostępny" color="error" size="small" />
								)}
								{isSelected && (
									<Chip label="Wybrany" color="primary" size="small" />
								)}
							</Box>
						</Box>
					</CardContent>
				</Card>
			</Grid>
		);
	};

	if (!selectedWorkshop) {
		return (
			<Alert severity="warning">
				Najpierw wybierz warsztat, aby zobaczyć dostępnych mechaników.
			</Alert>
		);
	}

	return (
		<Box sx={{ width: "100%" }}>
			<Box textAlign="center" mb={4}>
				<PersonIcon sx={{ fontSize: 48, color: COLOR_PRIMARY, mb: 2 }} />
				<Typography variant="h4" color={COLOR_TEXT_PRIMARY} gutterBottom>
					Wybierz mechanika (opcjonalnie)
				</Typography>
				<Typography variant="body1" color={COLOR_TEXT_SECONDARY}>
					Możesz wybrać konkretnego mechanika lub pozwolić warsztatowi na
					automatyczne przypisanie.
				</Typography>
			</Box>

			{loading ? (
				<Box display="flex" justifyContent="center" py={4}>
					<CircularProgress />
				</Box>
			) : error ? (
				<Alert severity="error" sx={{ mb: 3 }}>
					{error}
				</Alert>
			) : (
				<Box>
					{/* Opcja pominięcia */}
					<Box mb={3}>
						<Button
							variant={selectedMechanic ? "outlined" : "contained"}
							color="primary"
							onClick={handleSkip}
							fullWidth
						>
							Automatyczne przypisanie mechanika
						</Button>
					</Box>

					{allMechanics.length > 0 && (
						<Box>
							<Typography variant="h6" color={COLOR_TEXT_PRIMARY} gutterBottom>
								Mechanicy w warsztacie:
							</Typography>

							{selectedDateTime && (
								<Typography
									variant="body2"
									color={COLOR_TEXT_SECONDARY}
									gutterBottom
								>
									Dostępność na{" "}
									{new Date(selectedDateTime).toLocaleString("pl-PL")}
								</Typography>
							)}

							<Grid container spacing={2} sx={{ mt: 1 }}>
								{allMechanics.map((mechanic) => {
									const isAvailable = availableMechanics.some(
										(available) => available.id === mechanic.id
									);
									return renderMechanicCard(mechanic, isAvailable);
								})}
							</Grid>

							{!selectedDateTime && (
								<Alert severity="info" sx={{ mt: 2 }}>
									Wybierz termin, aby zobaczyć dostępność mechaników.
								</Alert>
							)}
						</Box>
					)}
				</Box>
			)}
		</Box>
	);
};

export default MechanicSelectionStep;
