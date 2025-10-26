import { useState, forwardRef, useImperativeHandle, useContext } from "react";
import axios from "axios";
import { BASE_API_URL } from "../../constants";
import useStyles from "./LoginWrapper.styles.ts";
import AuthContext from "../../context/AuthProvider";
import { setAuthHeader } from "../../authorization/authServices";
import { jwtDecode } from "jwt-decode";
import { CustomJwtPayload } from "../../authorization/CustomJwtPayload";
import { useNavigate } from "react-router-dom";

import CustomSnackbar, { SnackbarState } from "../Mainlayout/Snackbar";

const EyeIcon = () => (
	<svg
		width="20"
		height="20"
		viewBox="0 0 24 24"
		fill="none"
		xmlns="http://www.w3.org/2000/svg"
	>
		<path
			d="M12 5C7 5 2.73 8.11 1 12C2.73 15.89 7 19 12 19C17 19 21.27 15.89 23 12C21.27 8.11 17 5 12 5ZM12 17C9.24 17 7 14.76 7 12C7 9.24 9.24 7 12 7C14.76 7 17 9.24 17 12C17 14.76 14.76 17 12 17ZM12 9C10.34 9 9 10.34 9 12C9 13.66 10.34 15 12 15C13.66 15 15 13.66 15 12C15 10.34 13.66 9 12 9Z"
			fill="#AAAAAA"
		/>
	</svg>
);

const BackIcon = () => (
	<svg
		width="20"
		height="20"
		viewBox="0 0 24 24"
		fill="none"
		xmlns="http://www.w3.org/2000/svg"
	>
		<path
			d="M19 12H5M12 19L5 12L12 5"
			stroke="currentColor"
			strokeWidth="2"
			strokeLinecap="round"
			strokeLinejoin="round"
		/>
	</svg>
);

export interface OwnerRegisterWrapperHandle {
	triggerPendingAction: () => void;
}

interface OwnerRegisterWrapperProps {
	onRegistrationComplete?: (userData: any) => void;
}

const OwnerRegisterWrapper = forwardRef<
	OwnerRegisterWrapperHandle,
	OwnerRegisterWrapperProps
>(({ onRegistrationComplete }, ref) => {
	const classes = useStyles();
	const [formData, setFormData] = useState({
		username: "",
		email: "",
		password: "",
		confirmPassword: "",
		workshopName: "",
		workshopAddress: "",
		workshopPhone: "",
		businessRegistrationNumber: "",
	});
	const [showPassword, setShowPassword] = useState(false);
	const [showConfirmPassword, setShowConfirmPassword] = useState(false);
	const [agreeToTerms, setAgreeToTerms] = useState(false);
	const [currentStep, setCurrentStep] = useState(1);
	const [error, setError] = useState<string | null>(null);
	const [loading, setLoading] = useState(false);
	const [success, setSuccess] = useState(false);
	const [snackbarState, setSnackbarState] = useState<SnackbarState>({
		open: false,
		message: "",
		severity: "success",
	});
	const { setAuth } = useContext(AuthContext);
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

	const handleInputChange = (field: string, value: string) => {
		setFormData((prev) => ({
			...prev,
			[field]: value,
		}));
		if (error) setError(null);
	};

	const validateStep1 = () => {
		if (!formData.username.trim()) {
			setError("Username is required");
			return false;
		}
		if (!formData.email.trim()) {
			setError("Email is required");
			return false;
		}
		if (!formData.password) {
			setError("Password is required");
			return false;
		}
		if (formData.password.length < 8) {
			setError("Password must be at least 8 characters long");
			return false;
		}
		if (formData.password !== formData.confirmPassword) {
			setError("Passwords do not match");
			return false;
		}
		return true;
	};

	const validateStep2 = () => {
		if (!formData.workshopName.trim()) {
			setError("Workshop name is required");
			return false;
		}
		if (!formData.workshopAddress.trim()) {
			setError("Workshop address is required");
			return false;
		}
		if (!formData.workshopPhone.trim()) {
			setError("Workshop phone number is required");
			return false;
		}
		if (!agreeToTerms) {
			showSnackbar(
				"You must agree to the Terms and Conditions to continue",
				"warning"
			);
			return false;
		}
		return true;
	};

	const handleNextStep = () => {
		if (validateStep1()) {
			setError(null);
			setCurrentStep(2);
		}
	};

	const handlePreviousStep = () => {
		setCurrentStep(1);
		setError(null);
	};

	const handleRegister = async (e: React.FormEvent) => {
		e.preventDefault();
		setError(null);

		if (!validateStep2()) {
			return;
		}

		setLoading(true);

		try {
			// Register with explicit role as owner and workshop information
			const registerRes = await axios.post(`${BASE_API_URL}/user/register/`, {
				username: formData.username,
				email: formData.email,
				password: formData.password,
				role: "owner", // Explicitly set role as owner
				workshop_name: formData.workshopName,
				workshop_address: formData.workshopAddress,
				workshop_phone: formData.workshopPhone,
				business_registration_number: formData.businessRegistrationNumber,
			});

			const loginRes = await axios.post(`${BASE_API_URL}/user/login/`, {
				email: formData.email,
				password: formData.password,
			});

			const token = loginRes.data.token;
			const userData = loginRes.data.user;

			if (!token || typeof token !== "string") {
				throw new Error(
					`Invalid token received: ${JSON.stringify(loginRes.data)}`
				);
			}

			setAuth({
				token,
				roles: [userData.role],
				username: userData.username,
				is_active: userData.is_active,
				user_id: userData.id,
				isLoading: false,
			});

			localStorage.setItem("token", token);
			localStorage.setItem("userRole", userData.role);
			localStorage.setItem("username", userData.username);
			localStorage.setItem("userID", userData.id.toString());

			setAuthHeader(token);

			setSuccess(true);

			if (onRegistrationComplete) {
				onRegistrationComplete({
					...registerRes.data,
					token,
					userId: userData.id,
					userData,
				});
			} else {
				setTimeout(() => {
					navigate("/home");
				}, 2000);
			}
		} catch (err: any) {
			handleError(err);
		} finally {
			setLoading(false);
		}
	};

	const handleError = (err: any) => {
		if (axios.isAxiosError(err) && err.response) {
			const backendError =
				err.response.data?.error ||
				err.response.data?.message ||
				err.response.data?.detail ||
				JSON.stringify(err.response.data);
			setError(backendError || "An error occurred during registration.");
		} else {
			setError("An unexpected error occurred. Please try again later.");
		}
	};

	useImperativeHandle(ref, () => ({
		triggerPendingAction: () => {},
	}));

	const togglePasswordVisibility = () => {
		setShowPassword(!showPassword);
	};

	const toggleConfirmPasswordVisibility = () => {
		setShowConfirmPassword(!showConfirmPassword);
	};

	const handleBackToChoice = () => {
		navigate("/register-choice");
	};

	if (success) {
		return (
			<div style={{ textAlign: "center", padding: "20px" }}>
				<h2 className={classes.formTitle}>Registration Successful!</h2>
				<p style={{ color: "#666", marginTop: "20px" }}>
					Your workshop owner account has been created successfully.
					{onRegistrationComplete
						? " Let's complete your profile."
						: " You will be redirected shortly."}
				</p>
				{!onRegistrationComplete && (
					<div style={{ marginTop: "30px" }}>
						<button
							onClick={() => navigate("/home")}
							className={classes.submitButton}
						>
							Go to Dashboard
						</button>
					</div>
				)}
			</div>
		);
	}

	const renderStep1 = () => (
		<>
			<h2 className={classes.formTitle}>Create Workshop Owner Account</h2>
			<p style={{ color: "#666", marginBottom: "30px", textAlign: "center" }}>
				Step 1 of 2: Account Information
			</p>

			<div className={classes.formField}>
				<input
					type="text"
					className={classes.input}
					placeholder="Username"
					value={formData.username}
					onChange={(e) => handleInputChange("username", e.target.value)}
					required
				/>
			</div>

			<div className={classes.formField}>
				<input
					type="email"
					className={classes.input}
					placeholder="Email"
					value={formData.email}
					onChange={(e) => handleInputChange("email", e.target.value)}
					required
				/>
			</div>

			<div className={classes.formField}>
				<input
					type={showPassword ? "text" : "password"}
					className={classes.input}
					placeholder="Password"
					value={formData.password}
					onChange={(e) => handleInputChange("password", e.target.value)}
					required
				/>
				<span
					className={classes.passwordToggle}
					onClick={togglePasswordVisibility}
				>
					<EyeIcon />
				</span>
			</div>

			<div className={classes.formField}>
				<input
					type={showConfirmPassword ? "text" : "password"}
					className={classes.input}
					placeholder="Confirm Password"
					value={formData.confirmPassword}
					onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
					required
				/>
				<span
					className={classes.passwordToggle}
					onClick={toggleConfirmPasswordVisibility}
				>
					<EyeIcon />
				</span>
			</div>

			<button
				type="button"
				className={classes.submitButton}
				onClick={handleNextStep}
				style={{ marginTop: "20px" }}
			>
				Next: Workshop Information
			</button>
		</>
	);

	const renderStep2 = () => (
		<>
			<h2 className={classes.formTitle}>Workshop Information</h2>
			<p style={{ color: "#666", marginBottom: "30px", textAlign: "center" }}>
				Step 2 of 2: Tell us about your workshop
			</p>

			<div className={classes.formField}>
				<input
					type="text"
					className={classes.input}
					placeholder="Workshop Name *"
					value={formData.workshopName}
					onChange={(e) => handleInputChange("workshopName", e.target.value)}
					required
				/>
			</div>

			<div className={classes.formField}>
				<input
					type="text"
					className={classes.input}
					placeholder="Workshop Address *"
					value={formData.workshopAddress}
					onChange={(e) => handleInputChange("workshopAddress", e.target.value)}
					required
				/>
			</div>

			<div className={classes.formField}>
				<input
					type="tel"
					className={classes.input}
					placeholder="Workshop Phone *"
					value={formData.workshopPhone}
					onChange={(e) => handleInputChange("workshopPhone", e.target.value)}
					required
				/>
			</div>

			<div className={classes.formField}>
				<input
					type="text"
					className={classes.input}
					placeholder="Business Registration Number (Optional)"
					value={formData.businessRegistrationNumber}
					onChange={(e) =>
						handleInputChange("businessRegistrationNumber", e.target.value)
					}
				/>
			</div>

			<div className={classes.rememberRow}>
				<label className={classes.checkboxLabel}>
					<div className={classes.checkboxContainer}>
						<input
							type="checkbox"
							className={classes.checkbox}
							checked={agreeToTerms}
							onChange={() => setAgreeToTerms(!agreeToTerms)}
						/>
					</div>
					I agree to the Terms and Conditions
				</label>
			</div>

			<div style={{ display: "flex", gap: "12px", marginTop: "20px" }}>
				<button
					type="button"
					className={classes.submitButton}
					onClick={handlePreviousStep}
					style={{
						backgroundColor: "#F3F4F6",
						color: "#374151",
						flex: "0 0 auto",
						width: "100px",
						padding: "12px 16px",
						fontSize: "14px",
						marginBottom: "0",
					}}
				>
					Previous
				</button>
				<button
					type="submit"
					className={classes.submitButton}
					disabled={loading}
					style={{ flex: 1, marginBottom: "0" }}
				>
					{loading ? "Creating account..." : "Create Workshop Account"}
				</button>
			</div>
		</>
	);

	return (
		<>
			<div className={classes.container}>
				<div
					className={classes.formCard}
					style={{ height: "auto", minHeight: "60vh" }}
				>
					<div
						style={{
							display: "flex",
							alignItems: "center",
							marginBottom: "20px",
							cursor: "pointer",
							color: "#6B7280",
						}}
						onClick={handleBackToChoice}
					>
						<BackIcon />
						<span style={{ marginLeft: "8px", fontSize: "14px" }}>
							Back to account type
						</span>
					</div>

					<form onSubmit={currentStep === 2 ? handleRegister : handleNextStep}>
						{currentStep === 1 ? renderStep1() : renderStep2()}

						{error && (
							<div
								style={{
									backgroundColor: "#FEF2F2",
									border: "1px solid #FECACA",
									color: "#DC2626",
									padding: "16px 20px",
									borderRadius: "12px",
									fontSize: "15px",
									marginTop: "20px",
									marginBottom: "20px",
									textAlign: "center",
									fontWeight: "500",
								}}
							>
								{error}
							</div>
						)}
					</form>

					<div className={classes.registerContainer}>
						<span className={classes.accountText}>
							Already have an account?
						</span>
						<a href="/login" className={classes.registerLink}>
							Sign in
						</a>
					</div>
				</div>
			</div>

			<CustomSnackbar
				snackbarState={snackbarState}
				onClose={handleSnackbarClose}
			/>
		</>
	);
});

export default OwnerRegisterWrapper;
