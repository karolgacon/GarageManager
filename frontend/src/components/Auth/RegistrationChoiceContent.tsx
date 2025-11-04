import { useNavigate } from "react-router-dom";
import { Box, Typography, Button, Card, CardContent } from "@mui/material";
import PersonIcon from "@mui/icons-material/Person";
import BusinessIcon from "@mui/icons-material/Business";
import useStyles from "./LoginWrapper.styles.ts";
import {
	COLOR_PRIMARY,
	COLOR_SURFACE,
	COLOR_TEXT_PRIMARY,
	COLOR_TEXT_SECONDARY,
} from "../../constants";

function RegistrationChoice() {
	const navigate = useNavigate();
	const classes = useStyles();

	const handleClientRegistration = () => {
		navigate("/register/client");
	};

	const handleOwnerRegistration = () => {
		navigate("/register/owner");
	};

	const handleBackToLogin = () => {
		navigate("/login");
	};

	return (
		<div className={classes.container}>
			<div className={classes.formCard}>
				<Typography
					variant="h4"
					component="h2"
					sx={{
						fontSize: "28px",
						fontWeight: "700",
						color: COLOR_TEXT_PRIMARY,
						marginBottom: "8px",
						letterSpacing: "-0.02em",
						textAlign: "center",
					}}
				>
					Choose Account Type
				</Typography>
				<Typography
					variant="body1"
					sx={{
						fontSize: "15px",
						color: COLOR_TEXT_SECONDARY,
						marginBottom: "30px",
						lineHeight: "1.5",
						textAlign: "center",
					}}
				>
					Select how you would like to use GarageManager
				</Typography>

				<Box
					sx={{
						display: "flex",
						flexDirection: "column",
						gap: "16px",
						marginBottom: "24px",
					}}
				>
					<Card
						onClick={handleClientRegistration}
						sx={{
							borderRadius: "12px",
							border: `2px solid ${COLOR_TEXT_SECONDARY}`,
							backgroundColor: COLOR_SURFACE,
							transition: "all 0.3s ease",
							cursor: "pointer",
							"&:hover": {
								borderColor: COLOR_PRIMARY,
								backgroundColor: "rgba(56, 130, 246, 0.1)",
								transform: "translateY(-2px)",
								boxShadow: `0 6px 20px rgba(56, 130, 246, 0.15)`,
							},
							"&:active": {
								transform: "translateY(0)",
							},
						}}
					>
						<CardContent
							sx={{
								padding: "20px !important",
								textAlign: "left",
								display: "flex",
								alignItems: "flex-start",
								gap: "16px",
							}}
						>
							<Box
								sx={{
									display: "flex",
									alignItems: "center",
									justifyContent: "center",
									width: "48px",
									height: "48px",
									borderRadius: "12px",
									backgroundColor: "rgba(56, 130, 246, 0.1)",
									color: COLOR_PRIMARY,
									flexShrink: 0,
								}}
							>
								<PersonIcon sx={{ fontSize: 24 }} />
							</Box>
							<Box sx={{ flex: 1 }}>
								<Typography
									variant="h6"
									sx={{
										fontSize: "18px",
										fontWeight: "600",
										color: COLOR_TEXT_PRIMARY,
										marginBottom: "4px",
									}}
								>
									Register as Client
								</Typography>
								<Typography
									variant="body2"
									sx={{
										fontSize: "13px",
										color: COLOR_TEXT_SECONDARY,
										lineHeight: "1.4",
									}}
								>
									I need car maintenance and repair services. I want to book
									appointments and manage my vehicles.
								</Typography>
							</Box>
						</CardContent>
					</Card>

					<Card
						onClick={handleOwnerRegistration}
						sx={{
							borderRadius: "12px",
							border: `2px solid ${COLOR_TEXT_SECONDARY}`,
							backgroundColor: COLOR_SURFACE,
							transition: "all 0.3s ease",
							cursor: "pointer",
							"&:hover": {
								borderColor: COLOR_PRIMARY,
								backgroundColor: "rgba(56, 130, 246, 0.1)",
								transform: "translateY(-2px)",
								boxShadow: `0 6px 20px rgba(56, 130, 246, 0.15)`,
							},
							"&:active": {
								transform: "translateY(0)",
							},
						}}
					>
						<CardContent
							sx={{
								padding: "20px !important",
								textAlign: "left",
								display: "flex",
								alignItems: "flex-start",
								gap: "16px",
							}}
						>
							<Box
								sx={{
									display: "flex",
									alignItems: "center",
									justifyContent: "center",
									width: "48px",
									height: "48px",
									borderRadius: "12px",
									backgroundColor: "rgba(56, 130, 246, 0.1)",
									color: COLOR_PRIMARY,
									flexShrink: 0,
								}}
							>
								<BusinessIcon sx={{ fontSize: 24 }} />
							</Box>
							<Box sx={{ flex: 1 }}>
								<Typography
									variant="h6"
									sx={{
										fontSize: "18px",
										fontWeight: "600",
										color: COLOR_TEXT_PRIMARY,
										marginBottom: "4px",
									}}
								>
									Register as Workshop Owner
								</Typography>
								<Typography
									variant="body2"
									sx={{
										fontSize: "13px",
										color: COLOR_TEXT_SECONDARY,
										lineHeight: "1.4",
									}}
								>
									I own or manage a workshop. I want to manage appointments,
									staff, inventory, and serve clients.
								</Typography>
							</Box>
						</CardContent>
					</Card>
				</Box>

				<Box
					sx={{
						display: "flex",
						alignItems: "center",
						justifyContent: "center",
						gap: "6px",
						marginTop: "40px",
					}}
				>
					<Typography
						sx={{
							fontSize: "14px",
							fontWeight: "500",
							color: COLOR_TEXT_SECONDARY,
						}}
					>
						Already have an account?
					</Typography>
					<Typography
						component="button"
						onClick={handleBackToLogin}
						sx={{
							color: COLOR_PRIMARY,
							fontWeight: "600",
							fontSize: "14px",
							textDecoration: "none",
							background: "none",
							border: "none",
							cursor: "pointer",
							"&:hover": {
								textDecoration: "underline",
								color: "#22D3EE", // COLOR_SECONDARY
							},
						}}
					>
						Sign in
					</Typography>
				</Box>
			</div>
		</div>
	);
}

export default RegistrationChoice;
