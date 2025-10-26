import { useNavigate } from "react-router-dom";
import { Box, Typography, Button, Card, CardContent } from "@mui/material";
import { styled } from "@mui/material/styles";
import PersonIcon from "@mui/icons-material/Person";
import BusinessIcon from "@mui/icons-material/Business";
import useStyles from "./LoginWrapper.styles.ts";

const StyledChoiceCard = styled(Card)({
	borderRadius: "12px",
	border: "2px solid #E5E7EB",
	transition: "all 0.3s ease",
	cursor: "pointer",
	"&:hover": {
		borderColor: "#FF3B57",
		backgroundColor: "#FFF8F9",
		transform: "translateY(-2px)",
		boxShadow: "0 6px 20px rgba(255, 59, 87, 0.15)",
	},
	"&:active": {
		transform: "translateY(0)",
	},
});

const StyledCardContent = styled(CardContent)({
	padding: "20px !important",
	textAlign: "left",
	display: "flex",
	alignItems: "flex-start",
	gap: "16px",
});

const StyledIconContainer = styled(Box)({
	display: "flex",
	alignItems: "center",
	justifyContent: "center",
	width: "48px",
	height: "48px",
	borderRadius: "12px",
	backgroundColor: "#F3F4F6",
	color: "#FF3B57",
	flexShrink: 0,
});

const StyledBackButton = styled(Button)({
	marginTop: "20px",
	color: "#6B7280",
	borderColor: "#D1D5DB",
	"&:hover": {
		backgroundColor: "#F9FAFB",
		borderColor: "#9CA3AF",
	},
});

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
						color: "#1F2937",
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
						color: "#6B7280",
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
					<StyledChoiceCard onClick={handleClientRegistration}>
						<StyledCardContent>
							<StyledIconContainer>
								<PersonIcon sx={{ fontSize: 24 }} />
							</StyledIconContainer>
							<Box sx={{ flex: 1 }}>
								<Typography
									variant="h6"
									sx={{
										fontSize: "18px",
										fontWeight: "600",
										color: "#1F2937",
										marginBottom: "4px",
									}}
								>
									Register as Client
								</Typography>
								<Typography
									variant="body2"
									sx={{
										fontSize: "13px",
										color: "#6B7280",
										lineHeight: "1.4",
									}}
								>
									I need car maintenance and repair services. I want to book
									appointments and manage my vehicles.
								</Typography>
							</Box>
						</StyledCardContent>
					</StyledChoiceCard>

					<StyledChoiceCard onClick={handleOwnerRegistration}>
						<StyledCardContent>
							<StyledIconContainer>
								<BusinessIcon sx={{ fontSize: 24 }} />
							</StyledIconContainer>
							<Box sx={{ flex: 1 }}>
								<Typography
									variant="h6"
									sx={{
										fontSize: "18px",
										fontWeight: "600",
										color: "#1F2937",
										marginBottom: "4px",
									}}
								>
									Register as Workshop Owner
								</Typography>
								<Typography
									variant="body2"
									sx={{
										fontSize: "13px",
										color: "#6B7280",
										lineHeight: "1.4",
									}}
								>
									I own or manage a workshop. I want to manage appointments,
									staff, inventory, and serve clients.
								</Typography>
							</Box>
						</StyledCardContent>
					</StyledChoiceCard>
				</Box>

				<StyledBackButton variant="outlined" onClick={handleBackToLogin}>
					Back to Login
				</StyledBackButton>
			</div>
		</div>
	);
}

export default RegistrationChoice;
