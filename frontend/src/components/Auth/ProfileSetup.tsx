import React, { useState, useContext } from "react";
import {
	Box,
	TextField,
	Button,
	Typography,
	Paper,
	LinearProgress,
	Alert,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import axios from "axios";
import { BASE_API_URL, COLOR_PRIMARY } from "../../constants";
import AuthContext from "../../context/AuthProvider";
import { useNavigate } from "react-router-dom";
import GarageLogo from "./GarageLogo";
import CustomSnackbar, { SnackbarState } from "../Mainlayout/Snackbar";

interface ProfileSetupProps {
	userData: any;
}

interface ProfileData {
	firstName: string;
	lastName: string;
	phone: string;
	address: string;
	city: string;
	postalCode: string;
	country: string;
	dateOfBirth: string;
}

const StyledContainer = styled(Box)({
	display: "flex",
	flexDirection: "column",
	alignItems: "center",
	width: "100%",
	maxWidth: "650px",
	margin: "0 auto",
});

const StyledFormCard = styled(Paper)({
	backgroundColor: "white",
	borderRadius: "16px",
	padding: "40px 60px",
	width: "100%",
	boxShadow: "0 8px 32px rgba(0, 0, 0, 0.12)",
	border: "1px solid #E5E7EB",
	minHeight: "400px",
});

const StyledFormTitle = styled(Typography)({
	fontSize: "26px",
	fontWeight: "600",
	color: "#1F2937",
	marginBottom: "6px",
	textAlign: "center",
});

const StyledFormSubtitle = styled(Typography)({
	fontSize: "15px",
	color: "#6B7280",
	textAlign: "center",
	marginBottom: "30px",
});

const StyledTextField = styled(TextField)({
	width: "100%",
	marginBottom: "20px",
	"& .MuiOutlinedInput-root": {
		padding: "0",
		borderRadius: "12px",
		backgroundColor: "#F9FAFB",
		"& input": {
			padding: "14px 20px",
			fontSize: "16px",
			minHeight: "16px",
		},
		"& fieldset": {
			border: "1px solid #D1D5DB",
		},
		"&:hover fieldset": {
			border: "1px solid #D1D5DB",
		},
		"&.Mui-focused": {
			backgroundColor: "white",
			"& fieldset": {
				borderColor: "#FF3B57",
				boxShadow: "0 0 0 3px rgba(255, 59, 87, 0.1)",
			},
		},
	},
	"& .MuiInputLabel-root": {
		display: "none",
	},
	"& .MuiOutlinedInput-input::placeholder": {
		color: "#9CA3AF",
		opacity: 1,
	},
});

const StyledButtonGroup = styled(Box)({
	display: "flex",
	gap: "16px",
	marginTop: "30px",
});

const StyledButton = styled(Button)({
	flex: 1,
	padding: "14px 24px",
	borderRadius: "12px",
	fontSize: "16px",
	fontWeight: "600",
	textTransform: "none",
	minHeight: "48px",
	transition: "all 0.2s ease",
});

const StyledPrimaryButton = styled(StyledButton)({
	backgroundColor: "#FF3B57",
	color: "white",
	border: "none",
	"&:hover": {
		backgroundColor: "#E6334A",
		transform: "translateY(-1px)",
		boxShadow: "0 4px 12px rgba(255, 59, 87, 0.3)",
	},
	"&:disabled": {
		opacity: 0.6,
		backgroundColor: "#FF3B57",
	},
});

const StyledSecondaryButton = styled(StyledButton)({
	backgroundColor: "white",
	color: "#374151",
	border: "2px solid #D1D5DB",
	"&:hover": {
		backgroundColor: "#F9FAFB",
		borderColor: "#9CA3AF",
	},
});

const StyledSkipButton = styled(StyledButton)({
	backgroundColor: "transparent",
	color: "#6B7280",
	border: "2px solid #D1D5DB",
	"&:hover": {
		backgroundColor: "#F9FAFB",
		borderColor: "#9CA3AF",
	},
});

const StyledProgressBar = styled(LinearProgress)({
	width: "100%",
	height: "6px",
	backgroundColor: "#E5E7EB",
	borderRadius: "3px",
	marginBottom: "20px",
	"& .MuiLinearProgress-bar": {
		backgroundColor: "#FF3B57",
		borderRadius: "3px",
	},
});

const StyledStepIndicator = styled(Typography)({
	textAlign: "center",
	marginBottom: "20px",
	fontSize: "15px",
	color: "#6B7280",
	fontWeight: "500",
});

const StyledErrorAlert = styled(Alert)({
	backgroundColor: "#FEF2F2",
	border: "1px solid #FECACA",
	color: "#DC2626",
	borderRadius: "12px",
	fontSize: "14px",
	marginTop: "20px",
	fontWeight: "500",
	"& .MuiAlert-icon": {
		display: "none",
	},
});

const ProfileSetup: React.FC<ProfileSetupProps> = ({ userData }) => {
	const [currentStep, setCurrentStep] = useState(1);
	const [profileData, setProfileData] = useState<ProfileData>({
		firstName: "",
		lastName: "",
		phone: "",
		address: "",
		city: "",
		postalCode: "",
		country: "",
		dateOfBirth: "",
	});
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [snackbarState, setSnackbarState] = useState<SnackbarState>({
		open: false,
		message: "",
		severity: "success",
	});
	const navigate = useNavigate();

	const showSnackbar = (
		message: string,
		severity: "success" | "error" | "warning" | "info"
	) => {
		setSnackbarState({ open: true, message, severity });
	};

	const handleSnackbarClose = () => {
		setSnackbarState((prev) => ({ ...prev, open: false }));
	};

	const handleInputChange = (field: keyof ProfileData, value: string) => {
		setProfileData((prev) => ({
			...prev,
			[field]: value,
		}));
		if (error) setError(null);
	};

	const validateStep = (step: number) => {
		switch (step) {
			case 1:
				if (!profileData.firstName.trim()) {
					setError("First name is required");
					return false;
				}
				if (!profileData.lastName.trim()) {
					setError("Last name is required");
					return false;
				}
				return true;
			case 2:
				if (!profileData.phone.trim()) {
					setError("Phone number is required");
					return false;
				}
				if (!profileData.dateOfBirth) {
					setError("Date of birth is required");
					return false;
				}
				return true;
			case 3:
				if (!profileData.address.trim()) {
					setError("Address is required");
					return false;
				}
				if (!profileData.city.trim()) {
					setError("City is required");
					return false;
				}
				if (!profileData.postalCode.trim()) {
					setError("Postal code is required");
					return false;
				}
				if (!profileData.country.trim()) {
					setError("Country is required");
					return false;
				}
				return true;
			default:
				return true;
		}
	};

	const handleNext = () => {
		if (validateStep(currentStep)) {
			setError(null);
			setCurrentStep((prev) => prev + 1);
		}
	};

	const handlePrevious = () => {
		setCurrentStep((prev) => prev - 1);
		setError(null);
	};

	const handleSkip = () => {
		showSnackbar(
			"Profile setup skipped. You can complete it later in your profile settings.",
			"info"
		);
		setTimeout(() => {
			navigate("/home");
		}, 2000);
	};

	const handleSubmit = async () => {
		if (!validateStep(currentStep)) {
			return;
		}

		setLoading(true);
		setError(null);

		// Move token declaration to function scope
		const token = localStorage.getItem("token");

		if (!token) {
			showSnackbar("Authentication error. Please log in again.", "error");
			setTimeout(() => {
				navigate("/login");
			}, 2000);
			return;
		}

		try {
			const response = await axios.post(
				`${BASE_API_URL}/users/profile/`,
				{
					first_name: profileData.firstName,
					last_name: profileData.lastName,
					phone: profileData.phone,
					address: profileData.address,
					city: profileData.city,
					postal_code: profileData.postalCode,
					country: profileData.country,
					date_of_birth: profileData.dateOfBirth,
				},
				{
					headers: {
						Authorization: `Bearer ${token}`,
						"Content-Type": "application/json",
					},
				}
			);

			showSnackbar(
				"Profile completed successfully! Welcome to GarageManager!",
				"success"
			);
			setTimeout(() => {
				navigate("/home");
			}, 2000);
		} catch (err: any) {
			if (axios.isAxiosError(err)) {
				if (err.response?.status === 401) {
					showSnackbar("Session expired. Please log in again.", "error");
					setTimeout(() => {
						navigate("/login");
					}, 2000);
				} else if (err.response?.status === 500) {
					setError(
						"Server error occurred. Please check the console and try again."
					);
				} else if (err.response?.status === 409) {
					try {
						const updateResponse = await axios.put(
							`${BASE_API_URL}/users/update_profile/`,
							{
								first_name: profileData.firstName,
								last_name: profileData.lastName,
								phone: profileData.phone,
								address: profileData.address,
								city: profileData.city,
								postal_code: profileData.postalCode,
								country: profileData.country,
								date_of_birth: profileData.dateOfBirth,
							},
							{
								headers: {
									Authorization: `Bearer ${token}`,
									"Content-Type": "application/json",
								},
							}
						);

						showSnackbar(
							"Profile updated successfully! Welcome to GarageManager!",
							"success"
						);
						setTimeout(() => {
							navigate("/home");
						}, 2000);
					} catch (updateErr: any) {
						const backendError =
							updateErr.response?.data?.error ||
							updateErr.response?.data?.message ||
							updateErr.response?.data?.detail ||
							"Failed to update profile";
						setError(backendError);
					}
				} else {
					const backendError =
						err.response?.data?.error ||
						err.response?.data?.message ||
						err.response?.data?.detail ||
						"An error occurred while setting up profile.";
					setError(backendError);
				}
			} else {
				setError("An unexpected error occurred. Please try again later.");
			}
		} finally {
			setLoading(false);
		}
	};

	const renderStep = () => {
		switch (currentStep) {
			case 1:
				return (
					<>
						<StyledFormTitle>Personal Information</StyledFormTitle>
						<StyledFormSubtitle>
							Let's start with your basic details
						</StyledFormSubtitle>
						<StyledTextField
							placeholder="First Name *"
							value={profileData.firstName}
							onChange={(e) => handleInputChange("firstName", e.target.value)}
							required
						/>
						<StyledTextField
							placeholder="Last Name *"
							value={profileData.lastName}
							onChange={(e) => handleInputChange("lastName", e.target.value)}
							required
						/>
					</>
				);
			case 2:
				return (
					<>
						<StyledFormTitle>Contact Information</StyledFormTitle>
						<StyledFormSubtitle>How can we reach you?</StyledFormSubtitle>
						<StyledTextField
							type="tel"
							placeholder="Phone Number *"
							value={profileData.phone}
							onChange={(e) => handleInputChange("phone", e.target.value)}
							required
						/>
						<StyledTextField
							type="date"
							placeholder="Date of Birth *"
							value={profileData.dateOfBirth}
							onChange={(e) => handleInputChange("dateOfBirth", e.target.value)}
							required
							InputLabelProps={{ shrink: true }}
						/>
					</>
				);
			case 3:
				return (
					<>
						<StyledFormTitle>Address Information</StyledFormTitle>
						<StyledFormSubtitle>Where are you located?</StyledFormSubtitle>
						<StyledTextField
							placeholder="Street Address *"
							value={profileData.address}
							onChange={(e) => handleInputChange("address", e.target.value)}
							required
						/>
						<StyledTextField
							placeholder="City *"
							value={profileData.city}
							onChange={(e) => handleInputChange("city", e.target.value)}
							required
						/>
						<StyledTextField
							placeholder="Postal Code *"
							value={profileData.postalCode}
							onChange={(e) => handleInputChange("postalCode", e.target.value)}
							required
						/>
						<StyledTextField
							placeholder="Country *"
							value={profileData.country}
							onChange={(e) => handleInputChange("country", e.target.value)}
							required
						/>
					</>
				);
			default:
				return null;
		}
	};

	const progressPercentage = (currentStep / 3) * 100;

	return (
		<>
			<StyledContainer>
				<GarageLogo />

				<StyledFormCard elevation={0}>
					<StyledProgressBar variant="determinate" value={progressPercentage} />

					<StyledStepIndicator>Step {currentStep} of 3</StyledStepIndicator>

					{renderStep()}

					{error && (
						<StyledErrorAlert severity="error">{error}</StyledErrorAlert>
					)}

					<StyledButtonGroup>
						{currentStep > 1 && (
							<StyledSecondaryButton onClick={handlePrevious}>
								Previous
							</StyledSecondaryButton>
						)}

						<StyledSkipButton onClick={handleSkip}>
							Skip for now
						</StyledSkipButton>

						{currentStep < 3 ? (
							<StyledPrimaryButton onClick={handleNext}>
								Next
							</StyledPrimaryButton>
						) : (
							<StyledPrimaryButton onClick={handleSubmit} disabled={loading}>
								{loading ? "Saving..." : "Complete Setup"}
							</StyledPrimaryButton>
						)}
					</StyledButtonGroup>
				</StyledFormCard>
			</StyledContainer>

			<CustomSnackbar
				snackbarState={snackbarState}
				onClose={handleSnackbarClose}
			/>
		</>
	);
};

export default ProfileSetup;
