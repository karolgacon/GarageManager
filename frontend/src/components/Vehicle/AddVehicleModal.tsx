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
	Step,
	StepLabel,
	Stepper,
	Paper,
	Avatar,
	useTheme,
	useMediaQuery,
	StepConnector,
	stepConnectorClasses,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import CloseIcon from "@mui/icons-material/Close";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import CheckIcon from "@mui/icons-material/Check";
import DirectionsCarIcon from "@mui/icons-material/DirectionsCar";
import PersonIcon from "@mui/icons-material/Person";
import BuildIcon from "@mui/icons-material/Build";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";

import VehicleForm from "./VehicleForm";
import { Vehicle } from "../../models/VehicleModel";
import { vehicleService } from "../../api/VehicleAPIEndpoint";
import ClientSelector from "../common/ClientSelector";
import WorkshopSelector from "../common/WorkshopSelector";
import {
	COLOR_PRIMARY,
	COLOR_SURFACE,
	COLOR_TEXT_PRIMARY,
	COLOR_TEXT_SECONDARY,
} from "../../constants";

interface AddVehicleModalProps {
	open: boolean;
	onClose: () => void;
	onVehicleAdded: (vehicle: Vehicle) => void;
	userRole: string;
	currentWorkshopId?: number | null;
}

const ColorlibConnector = styled(StepConnector)(({ theme }) => ({
	[`&.${stepConnectorClasses.alternativeLabel}`]: {
		top: 22,
	},
	[`&.${stepConnectorClasses.active}`]: {
		[`& .${stepConnectorClasses.line}`]: {
			backgroundColor: COLOR_PRIMARY,
		},
	},
	[`&.${stepConnectorClasses.completed}`]: {
		[`& .${stepConnectorClasses.line}`]: {
			backgroundColor: COLOR_PRIMARY,
		},
	},
	[`& .${stepConnectorClasses.line}`]: {
		height: 3,
		border: 0,
		backgroundColor:
			theme.palette.mode === "dark" ? theme.palette.grey[800] : "#eaeaf0",
		borderRadius: 1,
	},
}));

const ColorlibStepIconRoot = styled("div")<{
	ownerState: { completed?: boolean; active?: boolean };
}>(({ ownerState }) => ({
	backgroundColor: COLOR_SURFACE,
	zIndex: 1,
	color: COLOR_TEXT_PRIMARY,
	width: 50,
	height: 50,
	display: "flex",
	borderRadius: "50%",
	justifyContent: "center",
	alignItems: "center",
	...(ownerState.active && {
		backgroundColor: COLOR_PRIMARY,
		color: "#fff",
		boxShadow: "0 4px 10px 0 rgba(0,0,0,.25)",
	}),
	...(ownerState.completed && {
		backgroundColor: COLOR_PRIMARY,
		color: "#fff",
	}),
}));

function ColorlibStepIcon(props: any) {
	const { active, completed, className, icon, userRole } = props;

	const icons: { [index: string]: React.ReactElement } =
		userRole === "admin"
			? {
					1: <PersonIcon />,
					2: <DirectionsCarIcon />,
					3: <BuildIcon />,
					4: <CheckCircleIcon />,
			  }
			: userRole === "client"
			? {
					1: <DirectionsCarIcon />,
					2: <BuildIcon />,
					3: <CheckCircleIcon />,
			  }
			: {
					1: <PersonIcon />,
					2: <DirectionsCarIcon />,
					3: <CheckCircleIcon />,
			  };

	return (
		<ColorlibStepIconRoot
			ownerState={{ completed, active }}
			className={className}
		>
			{icons[String(icon)]}
		</ColorlibStepIconRoot>
	);
}

const AddVehicleModal: React.FC<AddVehicleModalProps> = ({
	open,
	onClose,
	onVehicleAdded,
	userRole,
	currentWorkshopId,
}) => {
	const theme = useTheme();
	const fullScreen = useMediaQuery(theme.breakpoints.down("md"));

	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [selectedClientId, setSelectedClientId] = useState<number | null>(null);
	const [selectedWorkshopId, setSelectedWorkshopId] = useState<number | null>(
		currentWorkshopId || null
	);

	const [activeStep, setActiveStep] = useState(0);
	const [vehicleData, setVehicleData] = useState<Partial<Vehicle>>({});

	const vehicleFormRef = useRef<{ validateAndSubmit: () => boolean }>(null);

	const steps =
		userRole === "admin"
			? [
					"Select Client",
					"Vehicle Details",
					"Select Workshop",
					"Review & Submit",
			  ]
			: userRole === "client"
			? ["Vehicle Details", "Select Workshop", "Review & Submit"]
			: ["Select Client", "Vehicle Details", "Review & Submit"];

	useEffect(() => {
		if (userRole !== "client") {
			setSelectedWorkshopId(currentWorkshopId || null);
		}
	}, [currentWorkshopId, userRole]);

	useEffect(() => {
		if (open) {
			setActiveStep(0);
			setVehicleData({});
			setSelectedClientId(null);
			if (userRole !== "client") {
				setSelectedWorkshopId(currentWorkshopId || null);
			}
			setError(null);
		}
	}, [open, currentWorkshopId, userRole]);

	const handleNext = () => {
		if (activeStep === 0) {
			if (userRole !== "client" && !selectedClientId) {
				setError("Please select a client before proceeding");
				return;
			}
		}

		if (activeStep === 1 && userRole === "client") {
			if (!selectedWorkshopId) {
				setError("Please select a workshop for your vehicle");
				return;
			}
		}

		if (userRole === "admin" && activeStep === 2 && !selectedWorkshopId) {
			setError("Please select a workshop for this vehicle");
			return;
		}

		setActiveStep((prevStep) => prevStep + 1);
		setError(null);
	};

	const handleBack = () => {
		setActiveStep((prevStep) => prevStep - 1);
		setError(null);
	};

	const handleVehicleDataSave = () => {
		if (vehicleFormRef.current && vehicleFormRef.current.validateAndSubmit()) {
			handleNext();
		}
	};

	const validateForm = (): boolean => {
		const finalErrors: string[] = [];

		if (!vehicleData.brand || vehicleData.brand.trim() === "") {
			finalErrors.push("Brand is required");
		}
		if (!vehicleData.model || vehicleData.model.trim() === "") {
			finalErrors.push("Model is required");
		}
		if (
			!vehicleData.registration_number ||
			vehicleData.registration_number.trim() === ""
		) {
			finalErrors.push("Registration number is required");
		}

		if (userRole !== "client" && !selectedClientId) {
			finalErrors.push("Client selection is required");
		}

		if (
			(userRole === "admin" || userRole === "client") &&
			!selectedWorkshopId
		) {
			finalErrors.push("Workshop selection is required");
		}

		if (finalErrors.length > 0) {
			setError(finalErrors.join(", "));
			return false;
		}

		const updatedData = { ...vehicleData };

		if (userRole !== "client" && selectedClientId) {
			updatedData.owner_id = selectedClientId;
		}

		if (selectedWorkshopId) {
			updatedData.workshop_id = selectedWorkshopId;
		}

		setVehicleData(updatedData);
		return true;
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!validateForm()) return;

		setLoading(true);
		setError(null);

		try {
			const submitData = { ...vehicleData };

			if ("id" in submitData) delete submitData.id;
			const newVehicle = await vehicleService.createVehicle(submitData);
			onVehicleAdded(newVehicle);
			onClose();
		} catch (error) {
			setError("Nie udało się dodać pojazdu. Spróbuj ponownie.");
		} finally {
			setLoading(false);
		}
	};

	const renderStepContent = () => {
		if (userRole === "admin") {
			switch (activeStep) {
				case 0:
					return (
						<Box>
							<Box
								sx={{ mb: 3, display: "flex", alignItems: "center", gap: 1 }}
							>
								<Avatar sx={{ bgcolor: COLOR_PRIMARY }}>
									<PersonIcon />
								</Avatar>
								<Typography
									variant="h6"
									fontWeight="bold"
									sx={{ color: COLOR_TEXT_PRIMARY }}
								>
									Select Client
								</Typography>
							</Box>
							<Typography
								variant="body2"
								color={COLOR_TEXT_SECONDARY}
								sx={{ mb: 2 }}
							>
								Choose a client who will be the owner of this vehicle.
							</Typography>
							<ClientSelector
								value={selectedClientId}
								onChange={(clientId) => setSelectedClientId(clientId)}
								disabled={loading}
								error={error || undefined}
							/>
						</Box>
					);
				case 1:
					return (
						<Box>
							<Box
								sx={{ mb: 3, display: "flex", alignItems: "center", gap: 1 }}
							>
								<Avatar sx={{ bgcolor: COLOR_PRIMARY }}>
									<DirectionsCarIcon />
								</Avatar>
								<Typography
									variant="h6"
									fontWeight="bold"
									sx={{ color: COLOR_TEXT_PRIMARY }}
								>
									Vehicle Details
								</Typography>
							</Box>
							<VehicleForm
								ref={vehicleFormRef}
								onSubmit={setVehicleData}
								isLoading={loading}
								error={error || undefined}
								enableInternalButtons={false}
							/>
						</Box>
					);
				case 2:
					return (
						<Box>
							<Box
								sx={{ mb: 3, display: "flex", alignItems: "center", gap: 1 }}
							>
								<Avatar sx={{ bgcolor: COLOR_PRIMARY }}>
									<BuildIcon />
								</Avatar>
								<Typography
									variant="h6"
									fontWeight="bold"
									sx={{ color: COLOR_TEXT_PRIMARY }}
								>
									Select Workshop
								</Typography>
							</Box>
							<Typography
								variant="body2"
								color={COLOR_TEXT_SECONDARY}
								sx={{ mb: 3 }}
							>
								Assign this vehicle to a workshop for maintenance and servicing.
							</Typography>
							<WorkshopSelector
								value={selectedWorkshopId}
								onChange={(workshopId) => setSelectedWorkshopId(workshopId)}
								disabled={loading}
								error={error || undefined}
							/>
						</Box>
					);
				case 3:
					return renderReviewStep();
				default:
					return null;
			}
		} else if (userRole !== "client") {
			switch (activeStep) {
				case 0:
					return (
						<Box>
							<Box
								sx={{ mb: 3, display: "flex", alignItems: "center", gap: 1 }}
							>
								<Avatar sx={{ bgcolor: COLOR_PRIMARY }}>
									<PersonIcon />
								</Avatar>
								<Typography
									variant="h6"
									fontWeight="bold"
									sx={{ color: COLOR_TEXT_PRIMARY }}
								>
									Select Client
								</Typography>
							</Box>
							<Typography
								variant="body2"
								color={COLOR_TEXT_SECONDARY}
								sx={{ mb: 2 }}
							>
								Choose a client who will be the owner of this vehicle.
							</Typography>
							<ClientSelector
								value={selectedClientId}
								onChange={(clientId) => setSelectedClientId(clientId)}
								disabled={loading}
								error={error || undefined}
							/>
						</Box>
					);
				case 1:
					return (
						<Box>
							<Box
								sx={{ mb: 3, display: "flex", alignItems: "center", gap: 1 }}
							>
								<Avatar sx={{ bgcolor: COLOR_PRIMARY }}>
									<DirectionsCarIcon />
								</Avatar>
								<Typography
									variant="h6"
									fontWeight="bold"
									sx={{ color: COLOR_TEXT_PRIMARY }}
								>
									Vehicle Details
								</Typography>
							</Box>
							<VehicleForm
								ref={vehicleFormRef}
								onSubmit={setVehicleData}
								isLoading={loading}
								error={error || undefined}
								enableInternalButtons={false}
							/>
						</Box>
					);
				case 2:
					return renderReviewStep();
				default:
					return null;
			}
		} else {
			switch (activeStep) {
				case 0:
					return (
						<Box>
							<Box
								sx={{ mb: 3, display: "flex", alignItems: "center", gap: 1 }}
							>
								<Avatar sx={{ bgcolor: COLOR_PRIMARY }}>
									<DirectionsCarIcon />
								</Avatar>
								<Typography
									variant="h6"
									fontWeight="bold"
									sx={{ color: COLOR_TEXT_PRIMARY }}
								>
									Vehicle Details
								</Typography>
							</Box>
							<Typography
								variant="body2"
								color={COLOR_TEXT_SECONDARY}
								sx={{ mb: 2 }}
							>
								Enter the details of your vehicle.
							</Typography>
							<VehicleForm
								ref={vehicleFormRef}
								onSubmit={setVehicleData}
								isLoading={loading}
								error={error || undefined}
								enableInternalButtons={false}
							/>
						</Box>
					);
				case 1:
					return (
						<Box>
							<Box
								sx={{ mb: 3, display: "flex", alignItems: "center", gap: 1 }}
							>
								<Avatar sx={{ bgcolor: COLOR_PRIMARY }}>
									<BuildIcon />
								</Avatar>
								<Typography
									variant="h6"
									fontWeight="bold"
									sx={{ color: COLOR_TEXT_PRIMARY }}
								>
									Select Workshop
								</Typography>
							</Box>
							<Typography
								variant="body2"
								color={COLOR_TEXT_SECONDARY}
								sx={{ mb: 3 }}
							>
								Choose a workshop for your vehicle maintenance and servicing.
								You can change this selection later if needed.
							</Typography>
							<WorkshopSelector
								value={selectedWorkshopId}
								onChange={(workshopId) => setSelectedWorkshopId(workshopId)}
								disabled={loading}
								error={error || undefined}
							/>
						</Box>
					);
				case 2:
					return renderReviewStep();
				default:
					return null;
			}
		}
	};

	const renderReviewStep = () => {
		return (
			<Box>
				<Box sx={{ mb: 3, display: "flex", alignItems: "center", gap: 1 }}>
					<Avatar sx={{ bgcolor: COLOR_PRIMARY }}>
						<CheckCircleIcon />
					</Avatar>
					<Typography
						variant="h6"
						fontWeight="bold"
						sx={{ color: COLOR_TEXT_PRIMARY }}
					>
						Review & Confirm
					</Typography>
				</Box>
				<Typography variant="body2" color={COLOR_TEXT_SECONDARY} sx={{ mb: 3 }}>
					Please review all information before submitting.
				</Typography>

				<Paper
					variant="outlined"
					sx={{
						p: 2,
						mb: 2,
						borderRadius: 2,
						backgroundColor: COLOR_SURFACE,
						borderColor: COLOR_TEXT_SECONDARY,
					}}
				>
					<Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
						<DirectionsCarIcon sx={{ color: COLOR_PRIMARY, mr: 1 }} />
						<Typography
							variant="subtitle1"
							fontWeight="bold"
							sx={{ color: COLOR_PRIMARY }}
						>
							Vehicle Information
						</Typography>
					</Box>
					<Divider sx={{ my: 1.5, backgroundColor: COLOR_TEXT_SECONDARY }} />
					<Box
						sx={{
							display: "grid",
							gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
							gap: 2,
						}}
					>
						<Box>
							<Typography variant="body2" color={COLOR_TEXT_SECONDARY}>
								Brand
							</Typography>
							<Typography
								variant="body1"
								fontWeight="medium"
								sx={{ color: COLOR_TEXT_PRIMARY }}
							>
								{vehicleData.brand || "Not specified"}
							</Typography>
						</Box>
						<Box>
							<Typography variant="body2" color={COLOR_TEXT_SECONDARY}>
								Model
							</Typography>
							<Typography
								variant="body1"
								fontWeight="medium"
								sx={{ color: COLOR_TEXT_PRIMARY }}
							>
								{vehicleData.model || "Not specified"}
							</Typography>
						</Box>
						<Box>
							<Typography variant="body2" color={COLOR_TEXT_SECONDARY}>
								Year
							</Typography>
							<Typography
								variant="body1"
								fontWeight="medium"
								sx={{ color: COLOR_TEXT_PRIMARY }}
							>
								{vehicleData.year || "Not specified"}
							</Typography>
						</Box>
						<Box>
							<Typography variant="body2" color={COLOR_TEXT_SECONDARY}>
								Registration
							</Typography>
							<Typography
								variant="body1"
								fontWeight="medium"
								sx={{ color: COLOR_TEXT_PRIMARY }}
							>
								{vehicleData.registration_number || "Not specified"}
							</Typography>
						</Box>
						<Box>
							<Typography variant="body2" color={COLOR_TEXT_SECONDARY}>
								VIN
							</Typography>
							<Typography
								variant="body1"
								fontWeight="medium"
								sx={{ color: COLOR_TEXT_PRIMARY }}
							>
								{vehicleData.vin || "Not specified"}
							</Typography>
						</Box>
						<Box>
							<Typography variant="body2" color={COLOR_TEXT_SECONDARY}>
								Mileage
							</Typography>
							<Typography
								variant="body1"
								fontWeight="medium"
								sx={{ color: COLOR_TEXT_PRIMARY }}
							>
								{vehicleData.mileage
									? `${vehicleData.mileage.toLocaleString()} km`
									: "Not specified"}
							</Typography>
						</Box>
						<Box>
							<Typography variant="body2" color={COLOR_TEXT_SECONDARY}>
								Fuel Type
							</Typography>
							<Typography
								variant="body1"
								fontWeight="medium"
								sx={{ color: COLOR_TEXT_PRIMARY }}
							>
								{vehicleData.fuel_type || "Not specified"}
							</Typography>
						</Box>
						<Box>
							<Typography variant="body2" color={COLOR_TEXT_SECONDARY}>
								Status
							</Typography>
							<Typography
								variant="body1"
								fontWeight="medium"
								sx={{ color: COLOR_TEXT_PRIMARY }}
							>
								{vehicleData.status || "Not specified"}
							</Typography>
						</Box>
					</Box>
				</Paper>

				{userRole !== "client" && selectedClientId && (
					<Paper
						variant="outlined"
						sx={{
							p: 2,
							mb: 2,
							borderRadius: 2,
							backgroundColor: COLOR_SURFACE,
							borderColor: COLOR_TEXT_SECONDARY,
						}}
					>
						<Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
							<PersonIcon sx={{ color: COLOR_PRIMARY, mr: 1 }} />
							<Typography
								variant="subtitle1"
								fontWeight="bold"
								sx={{ color: COLOR_PRIMARY }}
							>
								Client Information
							</Typography>
						</Box>
						<Divider sx={{ my: 1.5, backgroundColor: COLOR_TEXT_SECONDARY }} />
						<Box sx={{ display: "flex", alignItems: "center" }}>
							<Avatar sx={{ mr: 2, bgcolor: COLOR_PRIMARY }}>
								<PersonIcon />
							</Avatar>
							<Typography
								variant="body1"
								fontWeight="medium"
								sx={{ color: COLOR_TEXT_PRIMARY }}
							>
								Client ID: {selectedClientId}
							</Typography>
						</Box>
					</Paper>
				)}

				<Paper
					variant="outlined"
					sx={{
						p: 2,
						mb: 2,
						borderRadius: 2,
						backgroundColor: COLOR_SURFACE,
						borderColor: COLOR_TEXT_SECONDARY,
					}}
				>
					<Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
						<BuildIcon sx={{ color: COLOR_PRIMARY, mr: 1 }} />
						<Typography
							variant="subtitle1"
							fontWeight="bold"
							sx={{ color: COLOR_PRIMARY }}
						>
							Workshop Assignment
						</Typography>
					</Box>
					<Divider sx={{ my: 1.5, backgroundColor: COLOR_TEXT_SECONDARY }} />
					<Box sx={{ display: "flex", alignItems: "center" }}>
						<Avatar sx={{ mr: 2, bgcolor: COLOR_PRIMARY }}>
							<BuildIcon />
						</Avatar>
						{userRole === "owner" || userRole === "mechanic" ? (
							<Typography
								variant="body1"
								fontWeight="medium"
								sx={{ color: COLOR_TEXT_PRIMARY }}
							>
								Your workshop (ID: {currentWorkshopId || "Not assigned"})
							</Typography>
						) : (
							<Typography
								variant="body1"
								fontWeight="medium"
								sx={{ color: COLOR_TEXT_PRIMARY }}
							>
								{selectedWorkshopId
									? `Selected workshop (ID: ${selectedWorkshopId})`
									: "No workshop selected"}
							</Typography>
						)}
					</Box>
				</Paper>
			</Box>
		);
	};

	return (
		<Dialog
			open={open}
			onClose={loading ? undefined : onClose}
			fullWidth
			fullScreen={fullScreen}
			maxWidth="md"
			scroll="paper"
			PaperProps={{
				sx: {
					borderRadius: { xs: 0, sm: 2 },
					maxHeight: "90vh",
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
					px: 3,
					py: { xs: 2, md: 3 },
				}}
			>
				<Typography variant="h5" component="div" fontWeight="bold">
					Add New Vehicle
				</Typography>
				<IconButton
					edge="end"
					color="inherit"
					onClick={onClose}
					disabled={loading}
					aria-label="close"
					sx={{
						"&:hover": {
							bgcolor: "rgba(255,255,255,0.2)",
						},
					}}
				>
					<CloseIcon />
				</IconButton>
			</DialogTitle>

			<DialogContent
				sx={{
					p: 0,
					backgroundColor: COLOR_SURFACE,
				}}
			>
				<Box sx={{ bgcolor: COLOR_SURFACE, px: 3, py: 2 }}>
					<Stepper
						alternativeLabel
						activeStep={activeStep}
						connector={<ColorlibConnector />}
						sx={{
							my: 1,
							"& .MuiStepLabel-label": {
								mt: 1,
								fontWeight: "medium",
								color: COLOR_TEXT_SECONDARY,
								"&.Mui-active": {
									color: COLOR_PRIMARY,
								},
								"&.Mui-completed": {
									color: COLOR_PRIMARY,
								},
							},
						}}
					>
						{steps.map((label) => (
							<Step key={label}>
								<StepLabel
									StepIconComponent={(props) => (
										<ColorlibStepIcon {...props} userRole={userRole} />
									)}
								>
									{label}
								</StepLabel>
							</Step>
						))}
					</Stepper>
				</Box>

				{error && (
					<Alert
						severity="error"
						sx={{
							m: 3,
							borderRadius: 2,
							"& .MuiAlert-icon": {
								alignItems: "center",
							},
						}}
						onClose={() => setError(null)}
					>
						{error}
					</Alert>
				)}

				<Box
					sx={{
						px: 3,
						py: 3,
					}}
				>
					{renderStepContent()}
				</Box>

				{loading && (
					<Box
						sx={{
							display: "flex",
							justifyContent: "center",
							alignItems: "center",
							position: "absolute",
							top: 0,
							left: 0,
							right: 0,
							bottom: 0,
							bgcolor: "rgba(26, 29, 35, 0.8)",
							zIndex: 10,
						}}
					>
						<CircularProgress sx={{ color: COLOR_PRIMARY }} />
					</Box>
				)}
			</DialogContent>

			<DialogActions
				sx={{
					p: 3,
					justifyContent: "space-between",
					borderTop: "1px solid rgba(228, 230, 232, 0.1)",
					bgcolor: COLOR_SURFACE,
				}}
			>
				<Box>
					{activeStep > 0 && (
						<Button
							onClick={handleBack}
							startIcon={<ArrowBackIcon />}
							disabled={loading}
							sx={{
								color: COLOR_TEXT_SECONDARY,
								"&:hover": {
									bgcolor: "rgba(56, 130, 246, 0.1)",
								},
							}}
						>
							Back
						</Button>
					)}
				</Box>
				<Box>
					<Button
						onClick={onClose}
						variant="outlined"
						color="inherit"
						disabled={loading}
						sx={{
							mr: 1,
							borderColor: COLOR_TEXT_SECONDARY,
							color: COLOR_TEXT_SECONDARY,
							"&:hover": {
								borderColor: COLOR_PRIMARY,
								bgcolor: "rgba(56, 130, 246, 0.1)",
							},
						}}
					>
						Cancel
					</Button>
					{activeStep < steps.length - 1 ? (
						<Button
							variant="contained"
							onClick={() => {
								if (
									(activeStep === 1 &&
										userRole !== "client" &&
										userRole !== "admin") ||
									(activeStep === 0 && userRole === "client") ||
									(activeStep === 1 && userRole === "admin")
								) {
									handleVehicleDataSave();
								} else {
									handleNext();
								}
							}}
							endIcon={<ArrowForwardIcon />}
							disabled={loading}
							sx={{
								bgcolor: COLOR_PRIMARY,
								"&:hover": {
									bgcolor: "#2563EB",
								},
							}}
						>
							Next
						</Button>
					) : (
						<Button
							variant="contained"
							onClick={handleSubmit}
							endIcon={<CheckIcon />}
							disabled={loading}
							sx={{
								bgcolor: COLOR_PRIMARY,
								"&:hover": {
									bgcolor: "#2563EB",
								},
							}}
						>
							Submit
						</Button>
					)}
				</Box>
			</DialogActions>
		</Dialog>
	);
};

export default AddVehicleModal;
