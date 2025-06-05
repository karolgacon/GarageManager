import { useState, forwardRef, useImperativeHandle, useContext } from "react";
import axios from "axios";
import { BASE_API_URL } from "../../constants";
import useStyles from "./LoginWrapper.styles.ts";
import AuthContext from "../../context/AuthProvider";
import { setAuthHeader } from "../../authorization/authServices";
import { jwtDecode } from "jwt-decode";
import { CustomJwtPayload } from "../../authorization/CustomJwtPayload";
import { useNavigate } from "react-router-dom";
import GarageLogo from "./GarageLogo";
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

export interface LoginWrapperHandle {
	triggerPendingAction: () => void;
}

interface LoginWrapperProps {}

const LoginWrapper = forwardRef<LoginWrapperHandle, LoginWrapperProps>(
	(props, ref) => {
		const classes = useStyles();
		const [email, setEmail] = useState("");
		const [password, setPassword] = useState("");
		const [showPassword, setShowPassword] = useState(false);
		const [rememberMe, setRememberMe] = useState(false);
		const [error, setError] = useState<string | null>(null);
		const [loading, setLoading] = useState(false);
		const { setAuth } = useContext(AuthContext);
		const navigate = useNavigate();

		const handleSignIn = async (e: React.FormEvent) => {
			e.preventDefault();
			setLoading(true);
			setError(null);

			try {
				const res = await axios.post(`${BASE_API_URL}/user/login/`, {
					email,
					password,
				});

				const data = res.data;
				const jwtToken = data.token;

				const decoded = jwtDecode<CustomJwtPayload>(jwtToken);

				try {
					const userDetailsRes = await axios.get(
						`${BASE_API_URL}/user/${decoded.user_id}/`
					);
					const userDetails = userDetailsRes.data;

					setAuthHeader(jwtToken);

					localStorage.setItem("userRole", userDetails.role);
					localStorage.setItem("userID", decoded.user_id.toString());

					setAuth({
						token: jwtToken,
						roles: [userDetails.role],
						username: userDetails.username,
						is_active: userDetails.is_active,
						user_id: decoded.user_id, 
						isLoading: false,
					});

					if (!userDetails.is_active) {
						setError("Your account has not been activated yet.");
					} else {
						redirectBasedOnRole(userDetails.role);
					}
				} catch (fetchErr) {
					setError("Could not fetch user data.");
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
					err.response.data?.error || err.response.data?.message;
				setError(backendError || "An error occurred while logging in.");
			} else {
				setError("An unexpected error occurred. Please try again later.");
			}
		};

		useImperativeHandle(ref, () => ({
			triggerPendingAction: () => {
			},
		}));
		const redirectBasedOnRole = (role: string) => {
			switch (role) {
				case "admin":
					navigate("/home");
					break;
				case "owner":
					navigate("/home");
					break;
				case "mechanic":
					navigate("/home");
					break;
				case "client":
				default:
					navigate("/home");
					break;
			}
		};

		const togglePasswordVisibility = () => {
			setShowPassword(!showPassword);
		};

		return (
			<div className={classes.container}>
				<GarageLogo />

				<div className={classes.formCard}>
					<h2 className={classes.formTitle}>Login to your account</h2>

					<form onSubmit={handleSignIn}>
						<div className={classes.formField}>
							<input
								type="email"
								className={classes.input}
								placeholder="Email"
								value={email}
								onChange={(e) => setEmail(e.target.value)}
								required
							/>
						</div>

						<div className={classes.formField}>
							<input
								type={showPassword ? "text" : "password"}
								className={classes.input}
								placeholder="Password"
								value={password}
								onChange={(e) => setPassword(e.target.value)}
								required
							/>
							<span
								className={classes.passwordToggle}
								onClick={togglePasswordVisibility}
							>
								<EyeIcon />
							</span>
						</div>

						<div className={classes.rememberRow}>
							<label className={classes.checkboxLabel}>
								<div className={classes.checkboxContainer}>
									<input
										type="checkbox"
										className={classes.checkbox}
										checked={rememberMe}
										onChange={() => setRememberMe(!rememberMe)}
									/>
								</div>
								Remember me
							</label>
							<a href="#" className={classes.forgotLink}>
								Forgot Password?
							</a>
						</div>

						<button
							type="submit"
							className={classes.submitButton}
							disabled={loading}
						>
							{loading ? "Signing in..." : "Sign in with email"}
						</button>
					</form>

					<div className={classes.registerContainer}>
						<span className={classes.accountText}>Don't have an account?</span>
						<a href="/register" className={classes.registerLink}>
							Get Started
						</a>
					</div>

					{error && <div className={classes.errorMessage}>{error}</div>}
				</div>
			</div>
		);
	}
);

export default LoginWrapper;
