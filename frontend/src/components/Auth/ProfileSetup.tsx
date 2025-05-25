import { useState, useContext } from "react";
import axios from "axios";
import { BASE_API_URL } from "../../constants";
import useProfileSetupStyles from "./ProfileSetup.styles";
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

const ProfileSetup: React.FC<ProfileSetupProps> = ({ userData }) => {
	const classes = useProfileSetupStyles();
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
		// Clear error when user starts typing
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

		try {
			const token = localStorage.getItem("token");

			if (!token) {
				showSnackbar("Authentication error. Please log in again.", "error");
				setTimeout(() => {
					navigate("/login");
				}, 2000);
				return;
			}

			console.log("Attempting to create profile with data:", {
				first_name: profileData.firstName,
				last_name: profileData.lastName,
				phone: profileData.phone,
				address: profileData.address,
				city: profileData.city,
				postal_code: profileData.postalCode,
				country: profileData.country,
				date_of_birth: profileData.dateOfBirth,
			});

			// Używaj prawidłowego endpointu z URL patterns
			const response = await axios.post(
				`${BASE_API_URL}/users/profile/`, // Prawidłowy endpoint
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

			console.log("Profile created successfully:", response.data);

			// Success - show snackbar and redirect
			showSnackbar(
				"Profile completed successfully! Welcome to GarageManager!",
				"success"
			);
			setTimeout(() => {
				navigate("/home");
			}, 2000);
		} catch (err: any) {
			console.error("Profile setup error:", err);
			console.error("Error response data:", err.response?.data);
			console.error("Error status:", err.response?.status);

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
					// Profile już istnieje - spróbuj update
					try {
						const updateResponse = await axios.put(
							`${BASE_API_URL}/users/update_profile/`, // Endpoint do update
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
					<div>
						<h2 className={classes.formTitle}>Personal Information</h2>
						<p className={classes.formSubtitle}>
							Let's start with your basic details
						</p>
						<div className={classes.formField}>
							<input
								type="text"
								className={classes.input}
								placeholder="First Name *"
								value={profileData.firstName}
								onChange={(e) => handleInputChange("firstName", e.target.value)}
								required
							/>
						</div>
						<div className={classes.formField}>
							<input
								type="text"
								className={classes.input}
								placeholder="Last Name *"
								value={profileData.lastName}
								onChange={(e) => handleInputChange("lastName", e.target.value)}
								required
							/>
						</div>
					</div>
				);
			case 2:
				return (
					<div>
						<h2 className={classes.formTitle}>Contact Information</h2>
						<p className={classes.formSubtitle}>How can we reach you?</p>
						<div className={classes.formField}>
							<input
								type="tel"
								className={classes.input}
								placeholder="Phone Number *"
								value={profileData.phone}
								onChange={(e) => handleInputChange("phone", e.target.value)}
								required
							/>
						</div>
						<div className={classes.formField}>
							<input
								type="date"
								className={classes.input}
								placeholder="Date of Birth *"
								value={profileData.dateOfBirth}
								onChange={(e) =>
									handleInputChange("dateOfBirth", e.target.value)
								}
								required
							/>
						</div>
					</div>
				);
			case 3:
				return (
					<div>
						<h2 className={classes.formTitle}>Address Information</h2>
						<p className={classes.formSubtitle}>Where are you located?</p>
						<div className={classes.formField}>
							<input
								type="text"
								className={classes.input}
								placeholder="Street Address *"
								value={profileData.address}
								onChange={(e) => handleInputChange("address", e.target.value)}
								required
							/>
						</div>
						<div className={classes.formField}>
							<input
								type="text"
								className={classes.input}
								placeholder="City *"
								value={profileData.city}
								onChange={(e) => handleInputChange("city", e.target.value)}
								required
							/>
						</div>
						<div className={classes.formField}>
							<input
								type="text"
								className={classes.input}
								placeholder="Postal Code *"
								value={profileData.postalCode}
								onChange={(e) =>
									handleInputChange("postalCode", e.target.value)
								}
								required
							/>
						</div>
						<div className={classes.formField}>
							<input
								type="text"
								className={classes.input}
								placeholder="Country *"
								value={profileData.country}
								onChange={(e) => handleInputChange("country", e.target.value)}
								required
							/>
						</div>
					</div>
				);
			default:
				return null;
		}
	};

	const progressPercentage = (currentStep / 3) * 100;

	return (
		<>
			<div className={classes.container}>
				<GarageLogo />

				<div className={classes.formCard}>
					{/* Progress bar */}
					<div className={classes.progressBar}>
						<div
							className={classes.progressFill}
							style={{ width: `${progressPercentage}%` }}
						/>
					</div>

					<div className={classes.stepIndicator}>Step {currentStep} of 3</div>

					{renderStep()}

					{/* Error message - positioned better */}
					{error && <div className={classes.errorMessage}>{error}</div>}

					{/* Button group */}
					<div className={classes.buttonGroup}>
						{currentStep > 1 && (
							<button
								type="button"
								onClick={handlePrevious}
								className={`${classes.button} ${classes.secondaryButton}`}
							>
								Previous
							</button>
						)}

						<button
							type="button"
							onClick={handleSkip}
							className={`${classes.button} ${classes.skipButton}`}
						>
							Skip for now
						</button>

						{currentStep < 3 ? (
							<button
								type="button"
								onClick={handleNext}
								className={`${classes.button} ${classes.primaryButton}`}
							>
								Next
							</button>
						) : (
							<button
								type="button"
								onClick={handleSubmit}
								className={`${classes.button} ${classes.primaryButton}`}
								disabled={loading}
							>
								{loading ? "Saving..." : "Complete Setup"}
							</button>
						)}
					</div>
				</div>
			</div>

			<CustomSnackbar
				snackbarState={snackbarState}
				onClose={handleSnackbarClose}
			/>
		</>
	);
};

export default ProfileSetup;
