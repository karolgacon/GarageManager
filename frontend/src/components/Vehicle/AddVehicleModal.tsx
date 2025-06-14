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
			backgroundImage: "linear-gradient(95deg, #ff3c4e 0%, #ff8086 100%)",
		},
	},
	[`&.${stepConnectorClasses.completed}`]: {
		[`& .${stepConnectorClasses.line}`]: {
			backgroundImage: "linear-gradient(95deg, #ff3c4e 0%, #ff8086 100%)",
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
}>(({ theme, ownerState }) => ({
	backgroundColor:
		theme.palette.mode === "dark" ? theme.palette.grey[700] : "#ccc",
	zIndex: 1,
	color: "#fff",
	width: 50,
	height: 50,
	display: "flex",
	borderRadius: "50%",
	justifyContent: "center",
	alignItems: "center",
	...(ownerState.active && {
		backgroundImage: "linear-gradient(136deg, #ff3c4e 0%, #ff8086 100%)",
		boxShadow: "0 4px 10px 0 rgba(0,0,0,.25)",
	}),
	...(ownerState.completed && {
		backgroundImage: "linear-gradient(136deg, #ff3c4e 0%, #ff8086 100%)",
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
								<Avatar sx={{ bgcolor: "#ff3c4e" }}>
									<PersonIcon />
								</Avatar>
								<Typography variant="h6" fontWeight="bold">
									Select Client
								</Typography>
							</Box>
							<Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
								Choose a client who will be the owner of this vehicle.
							</Typography>
							<ClientSelector
								value={selectedClientId}
								onChange={(clientId) => setSelectedClientId(clientId)}
								disabled={loading}
								error={error}
							/>
						</Box>
					);
				case 1:
					return (
						<Box>
							<Box
								sx={{ mb: 3, display: "flex", alignItems: "center", gap: 1 }}
							>
								<Avatar sx={{ bgcolor: "#ff3c4e" }}>
									<DirectionsCarIcon />
								</Avatar>
								<Typography variant="h6" fontWeight="bold">
									Vehicle Details
								</Typography>
							</Box>
							<VehicleForm
								ref={vehicleFormRef}
								onSubmit={setVehicleData} 
								isLoading={loading}
								error={error}
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
								<Avatar sx={{ bgcolor: "#ff3c4e" }}>
									<BuildIcon />
								</Avatar>
								<Typography variant="h6" fontWeight="bold">
									Select Workshop
								</Typography>
							</Box>
							<Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
								Assign this vehicle to a workshop for maintenance and servicing.
							</Typography>
							<WorkshopSelector
								value={selectedWorkshopId}
								onChange={(workshopId) => setSelectedWorkshopId(workshopId)}
								disabled={loading}
								error={error}
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
								<Avatar sx={{ bgcolor: "#ff3c4e" }}>
									<PersonIcon />
								</Avatar>
								<Typography variant="h6" fontWeight="bold">
									Select Client
								</Typography>
							</Box>
							<Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
								Choose a client who will be the owner of this vehicle.
							</Typography>
							<ClientSelector
								value={selectedClientId}
								onChange={(clientId) => setSelectedClientId(clientId)}
								disabled={loading}
								error={error}
							/>
						</Box>
					);
				case 1:
					return (
						<Box>
							<Box
								sx={{ mb: 3, display: "flex", alignItems: "center", gap: 1 }}
							>
								<Avatar sx={{ bgcolor: "#ff3c4e" }}>
									<DirectionsCarIcon />
								</Avatar>
								<Typography variant="h6" fontWeight="bold">
									Vehicle Details
								</Typography>
							</Box>
							<VehicleForm
								ref={vehicleFormRef}
								onSubmit={setVehicleData} 
								isLoading={loading}
								error={error}
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
								<Avatar sx={{ bgcolor: "#ff3c4e" }}>
									<DirectionsCarIcon />
								</Avatar>
								<Typography variant="h6" fontWeight="bold">
									Vehicle Details
								</Typography>
							</Box>
							<Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
								Enter the details of your vehicle.
							</Typography>
							<VehicleForm
								ref={vehicleFormRef}
								onSubmit={setVehicleData} 
								isLoading={loading}
								error={error}
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
								<Avatar sx={{ bgcolor: "#ff3c4e" }}>
									<BuildIcon />
								</Avatar>
								<Typography variant="h6" fontWeight="bold">
									Select Workshop
								</Typography>
							</Box>
							<Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
								Choose a workshop for your vehicle maintenance and servicing.
								You can change this selection later if needed.
							</Typography>
							<WorkshopSelector
								value={selectedWorkshopId}
								onChange={(workshopId) => setSelectedWorkshopId(workshopId)}
								disabled={loading}
								error={error}
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
					<Avatar sx={{ bgcolor: "#ff3c4e" }}>
						<CheckCircleIcon />
					</Avatar>
					<Typography variant="h6" fontWeight="bold">
						Review & Confirm
					</Typography>
				</Box>
				<Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
					Please review all information before submitting.
				</Typography>

				<Paper
					variant="outlined"
					sx={{
						p: 2, 
						mb: 2, 
						borderRadius: 2,
						boxShadow: "0 2px 10px rgba(0,0,0,0.08)",
					}}
				>
					<Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
						<DirectionsCarIcon sx={{ color: "#ff3c4e", mr: 1 }} />
						<Typography
							variant="subtitle1"
							fontWeight="bold"
							sx={{ color: "#ff3c4e" }}
						>
							Vehicle Information
						</Typography>
					</Box>
					<Divider sx={{ my: 1.5 }} />
					<Box
						sx={{
							display: "grid",
							gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
							gap: 2,
						}}
					>
						<Box>
							<Typography variant="body2" color="text.secondary">
								Brand
							</Typography>
							<Typography variant="body1" fontWeight="medium">
								{vehicleData.brand || "Not specified"}
							</Typography>
						</Box>
						<Box>
							<Typography variant="body2" color="text.secondary">
								Model
							</Typography>
							<Typography variant="body1" fontWeight="medium">
								{vehicleData.model || "Not specified"}
							</Typography>
						</Box>
						<Box>
							<Typography variant="body2" color="text.secondary">
								Year
							</Typography>
							<Typography variant="body1" fontWeight="medium">
								{vehicleData.year || "Not specified"}
							</Typography>
						</Box>
						<Box>
							<Typography variant="body2" color="text.secondary">
								Registration
							</Typography>
							<Typography variant="body1" fontWeight="medium">
								{vehicleData.registration_number || "Not specified"}
							</Typography>
						</Box>
						<Box>
							<Typography variant="body2" color="text.secondary">
								VIN
							</Typography>
							<Typography variant="body1" fontWeight="medium">
								{vehicleData.vin || "Not specified"}
							</Typography>
						</Box>
						<Box>
							<Typography variant="body2" color="text.secondary">
								Mileage
							</Typography>
							<Typography variant="body1" fontWeight="medium">
								{vehicleData.mileage
									? `${vehicleData.mileage.toLocaleString()} km`
									: "Not specified"}
							</Typography>
						</Box>
						<Box>
							<Typography variant="body2" color="text.secondary">
								Fuel Type
							</Typography>
							<Typography variant="body1" fontWeight="medium">
								{vehicleData.fuel_type || "Not specified"}
							</Typography>
						</Box>
						<Box>
							<Typography variant="body2" color="text.secondary">
								Status
							</Typography>
							<Typography variant="body1" fontWeight="medium">
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
							boxShadow: "0 2px 10px rgba(0,0,0,0.08)",
						}}
					>
						<Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
							<PersonIcon sx={{ color: "#ff3c4e", mr: 1 }} />
							<Typography
								variant="subtitle1"
								fontWeight="bold"
								sx={{ color: "#ff3c4e" }}
							>
								Client Information
							</Typography>
						</Box>
						<Divider sx={{ my: 1.5 }} />
						<Box sx={{ display: "flex", alignItems: "center" }}>
							<Avatar sx={{ mr: 2, bgcolor: "#ff3c4e" }}>
								<PersonIcon />
							</Avatar>
							<Typography variant="body1" fontWeight="medium">
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
						boxShadow: "0 2px 10px rgba(0,0,0,0.08)",
					}}
				>
					<Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
						<BuildIcon sx={{ color: "#ff3c4e", mr: 1 }} />
						<Typography
							variant="subtitle1"
							fontWeight="bold"
							sx={{ color: "#ff3c4e" }}
						>
							Workshop Assignment
						</Typography>
					</Box>
					<Divider sx={{ my: 1.5 }} />
					<Box sx={{ display: "flex", alignItems: "center" }}>
						<Avatar sx={{ mr: 2, bgcolor: "#ff3c4e" }}>
							<BuildIcon />
						</Avatar>
						{userRole === "owner" || userRole === "mechanic" ? (
							<Typography variant="body1" fontWeight="medium">
								Your workshop (ID: {currentWorkshopId || "Not assigned"})
							</Typography>
						) : (
							<Typography variant="body1" fontWeight="medium">
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
				},
			}}
		>
			<DialogTitle
				sx={{
					display: "flex",
					justifyContent: "space-between",
					alignItems: "center",
					bgcolor: "#ff3c4e",
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

			<DialogContent sx={{ p: 0 }}>
				<Box sx={{ bgcolor: "#f8f8f8", px: 3, py: 2 }}>
					<Stepper
						alternativeLabel
						activeStep={activeStep}
						connector={<ColorlibConnector />}
						sx={{
							my: 1,
							"& .MuiStepLabel-label": {
								mt: 1,
								fontWeight: "medium",
							},
						}}
					>
						{steps.map((label, index) => (
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
							bgcolor: "rgba(255,255,255,0.8)",
							zIndex: 10,
						}}
					>
						<CircularProgress sx={{ color: "#ff3c4e" }} />
					</Box>
				)}
			</DialogContent>

			<DialogActions
				sx={{
					p: 3,
					justifyContent: "space-between",
					borderTop: "1px solid rgba(0,0,0,0.1)",
					bgcolor: "#f8f8f8",
				}}
			>
				<Box>
					{activeStep > 0 && (
						<Button
							onClick={handleBack}
							startIcon={<ArrowBackIcon />}
							disabled={loading}
							sx={{
								color: "#555",
								"&:hover": {
									bgcolor: "rgba(0,0,0,0.05)",
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
							borderColor: "#ccc",
							color: "#555",
							"&:hover": {
								borderColor: "#999",
								bgcolor: "rgba(0,0,0,0.05)",
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
								bgcolor: "#ff3c4e",
								"&:hover": {
									bgcolor: "#d6303f",
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
								bgcolor: "#ff3c4e",
								"&:hover": {
									bgcolor: "#d6303f",
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
