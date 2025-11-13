import React, { useState } from "react";
import {
	Box,
	Stepper,
	Step,
	StepLabel,
	Button,
	Paper,
	Typography,
	useTheme,
	useMediaQuery,
} from "@mui/material";
import {
	Build as WorkshopIcon,
	Schedule as ScheduleIcon,
	DirectionsCar as VehicleIcon,
	Description as ServiceIcon,
	Person as PersonIcon,
} from "@mui/icons-material";
import {
	COLOR_PRIMARY,
	COLOR_SURFACE,
	COLOR_TEXT_PRIMARY,
} from "../../constants";

// Import komponentów poszczególnych kroków
import WorkshopSelectionStep from "./steps/WorkshopSelectionStep";
import DateTimeSelectionStep from "./steps/DateTimeSelectionStep";
import MechanicSelectionStep from "./steps/MechanicSelectionStep";
import VehicleSelectionStep from "./steps/VehicleSelectionStep";
import ServiceDescriptionStep from "./steps/ServiceDescriptionStep";

interface BookingWizardProps {
	onComplete: (bookingData: any) => void;
	onCancel: () => void;
	userRole?: string;
	userId?: number;
}

interface BookingFormData {
	workshop?: any;
	dateTime?: string;
	vehicle?: any;
	appointmentType?: string;
	serviceDescription?: string;
	priority?: string;
	selectedMechanic?: any; // Opcjonalny mechanik
}

const steps = [
	{
		label: "Wybierz warsztat",
		description: "Znajdź warsztat w pobliżu",
		icon: <WorkshopIcon />,
	},
	{
		label: "Wybierz termin",
		description: "Data i godzina wizyty",
		icon: <ScheduleIcon />,
	},
	{
		label: "Wybierz mechanika",
		description: "Opcjonalny wybór mechanika",
		icon: <PersonIcon />,
	},
	{
		label: "Wybierz pojazd",
		description: "Pojazd do serwisu",
		icon: <VehicleIcon />,
	},
	{
		label: "Opis usługi",
		description: "Rodzaj i opis problemu",
		icon: <ServiceIcon />,
	},
];

const BookingWizard: React.FC<BookingWizardProps> = ({
	onComplete,
	onCancel,
	userRole,
	userId,
}) => {
	const theme = useTheme();
	const isMobile = useMediaQuery(theme.breakpoints.down("md"));

	const [activeStep, setActiveStep] = useState(0);
	const [formData, setFormData] = useState<BookingFormData>({});
	const [stepValidation, setStepValidation] = useState<boolean[]>([
		false,
		false,
		false, // Mechanik (opcjonalny - będzie zawsze true)
		false,
		false,
	]);

	const handleNext = () => {
		if (activeStep < steps.length - 1) {
			setActiveStep(activeStep + 1);
		} else {
			handleComplete();
		}
	};

	const handleBack = () => {
		setActiveStep(activeStep - 1);
	};

	const handleComplete = () => {
		// Przekształć dane do formatu API zgodnego z Django/DRF
		const bookingData = {
			workshop: formData.workshop?.id,
			date: formData.dateTime,
			vehicle: formData.vehicle?.id,
			appointment_type: formData.appointmentType,
			service_description: formData.serviceDescription,
			priority: formData.priority || "medium",
			status: "scheduled", // Używaj nowego statusu
			client: userId,
			assigned_mechanic: formData.selectedMechanic?.id || null, // Opcjonalny mechanik
		};

		console.log("[DEBUG] Booking data prepared:", bookingData);
		onComplete(bookingData);
	};

	const updateFormData = (stepData: Partial<BookingFormData>) => {
		setFormData((prev) => ({ ...prev, ...stepData }));
	};

	const updateStepValidation = (stepIndex: number, isValid: boolean) => {
		setStepValidation((prev) => {
			const newValidation = [...prev];
			newValidation[stepIndex] = isValid;
			return newValidation;
		});
	};

	const renderStepContent = () => {
		switch (activeStep) {
			case 0:
				return (
					<WorkshopSelectionStep
						selectedWorkshop={formData.workshop}
						onWorkshopSelect={(workshop: any) => updateFormData({ workshop })}
						onValidationChange={(isValid: boolean) =>
							updateStepValidation(0, isValid)
						}
					/>
				);
			case 1:
				return (
					<DateTimeSelectionStep
						selectedWorkshop={formData.workshop}
						selectedDateTime={formData.dateTime}
						onDateTimeSelect={(dateTime: string) =>
							updateFormData({ dateTime })
						}
						onValidationChange={(isValid: boolean) =>
							updateStepValidation(1, isValid)
						}
					/>
				);
			case 2:
				return (
					<MechanicSelectionStep
						selectedWorkshop={formData.workshop}
						selectedDateTime={formData.dateTime}
						selectedMechanic={formData.selectedMechanic}
						onMechanicSelect={(mechanic: any) =>
							updateFormData({ selectedMechanic: mechanic })
						}
						onValidationChange={(isValid: boolean) =>
							updateStepValidation(2, isValid)
						}
					/>
				);
			case 3:
				return (
					<VehicleSelectionStep
						selectedVehicle={formData.vehicle}
						onVehicleSelect={(vehicle: any) => updateFormData({ vehicle })}
						onValidationChange={(isValid: boolean) =>
							updateStepValidation(3, isValid)
						}
						userId={userId}
						userRole={userRole}
					/>
				);
			case 4:
				return (
					<ServiceDescriptionStep
						appointmentType={formData.appointmentType}
						serviceDescription={formData.serviceDescription}
						priority={formData.priority}
						onDataChange={(data: any) => updateFormData(data)}
						onValidationChange={(isValid: boolean) =>
							updateStepValidation(4, isValid)
						}
					/>
				);
			default:
				return null;
		}
	};

	return (
		<Box sx={{ width: "100%", maxWidth: 1200, mx: "auto", p: 3 }}>
			{/* Progress Stepper */}
			<Paper
				sx={{
					p: 3,
					mb: 3,
					backgroundColor: COLOR_SURFACE,
					border: "1px solid rgba(255, 255, 255, 0.1)",
				}}
			>
				<Stepper
					activeStep={activeStep}
					alternativeLabel={isMobile}
					sx={{
						"& .MuiStepLabel-label": {
							color: COLOR_TEXT_PRIMARY,
							"&.Mui-active": {
								color: COLOR_PRIMARY,
								fontWeight: 600,
							},
							"&.Mui-completed": {
								color: COLOR_PRIMARY,
							},
						},
						"& .MuiStepIcon-root": {
							color: "rgba(255, 255, 255, 0.3)",
							"&.Mui-active": {
								color: COLOR_PRIMARY,
							},
							"&.Mui-completed": {
								color: COLOR_PRIMARY,
							},
						},
					}}
				>
					{steps.map((step) => (
						<Step key={step.label}>
							<StepLabel
								optional={
									!isMobile && (
										<Typography
											variant="caption"
											sx={{ color: "rgba(255, 255, 255, 0.6)" }}
										>
											{step.description}
										</Typography>
									)
								}
							>
								{step.label}
							</StepLabel>
						</Step>
					))}
				</Stepper>
			</Paper>

			{/* Step Content */}
			<Paper
				sx={{
					p: 4,
					mb: 3,
					backgroundColor: COLOR_SURFACE,
					border: "1px solid rgba(255, 255, 255, 0.1)",
					minHeight: "auto",
				}}
			>
				<Box sx={{ mb: 3 }}>
					<Typography variant="h5" sx={{ color: COLOR_TEXT_PRIMARY, mb: 1 }}>
						{steps[activeStep].label}
					</Typography>
					<Typography
						variant="body2"
						sx={{ color: "rgba(255, 255, 255, 0.6)" }}
					>
						{steps[activeStep].description}
					</Typography>
				</Box>

				{renderStepContent()}
			</Paper>

			{/* Navigation Buttons */}
			<Paper
				sx={{
					p: 3,
					backgroundColor: COLOR_SURFACE,
					border: "1px solid rgba(255, 255, 255, 0.1)",
					display: "flex",
					justifyContent: "space-between",
					alignItems: "center",
				}}
			>
				<Button
					variant="outlined"
					onClick={activeStep === 0 ? onCancel : handleBack}
					sx={{
						color: COLOR_TEXT_PRIMARY,
						borderColor: "rgba(255, 255, 255, 0.3)",
						"&:hover": {
							borderColor: COLOR_PRIMARY,
							backgroundColor: "rgba(56, 130, 246, 0.1)",
						},
					}}
				>
					{activeStep === 0 ? "Anuluj" : "Wstecz"}
				</Button>

				<Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
					<Typography
						variant="body2"
						sx={{ color: "rgba(255, 255, 255, 0.6)" }}
					>
						Krok {activeStep + 1} z {steps.length}
					</Typography>

					<Button
						variant="contained"
						onClick={handleNext}
						disabled={!stepValidation[activeStep]}
						sx={{
							backgroundColor: COLOR_PRIMARY,
							color: "white",
							"&:hover": {
								backgroundColor: "rgba(56, 130, 246, 0.8)",
							},
							"&:disabled": {
								backgroundColor: "rgba(255, 255, 255, 0.1)",
								color: "rgba(255, 255, 255, 0.3)",
							},
						}}
					>
						{activeStep === steps.length - 1 ? "Umów wizytę" : "Dalej"}
					</Button>
				</Box>
			</Paper>
		</Box>
	);
};

export default BookingWizard;
