import { useNavigate } from "react-router-dom";
import { Box, Typography, Button, Card, CardContent } from "@mui/material";
import { styled } from "@mui/material/styles";
import PersonIcon from "@mui/icons-material/Person";
import BusinessIcon from "@mui/icons-material/Business";
import useStyles from "./LoginWrapper.styles.ts";

const StyledChoiceCard = styled(Card)({
	borderRadius: "12px",
	border: "2px solid rgba(228, 230, 232, 0.2)", // Ciemniejszy border
	backgroundColor: "#1A1D23", // Ciemne tło jak w formularzu
	color: "#E4E6E8", // Jasny tekst
	transition: "all 0.3s ease",
	cursor: "pointer",
	"&:hover": {
		borderColor: "#3882F6", // Updated to use COLOR_PRIMARY
		backgroundColor: "#242832", // Ciemniejsze przy hover
		transform: "translateY(-2px)",
		boxShadow: "0 6px 20px rgba(56, 130, 246, 0.25)", // Większy cień przy hover
	},
	"&:active": {
		transform: "translateY(0)",
	},
	"@media (max-width: 868px)": {
		borderRadius: "8px",
	},
	"@media (max-width: 480px)": {
		borderRadius: "6px",
		"&:hover": {
			transform: "none",
		},
	},
});

const StyledCardContent = styled(CardContent)({
	padding: "20px !important",
	textAlign: "left",
	display: "flex",
	alignItems: "flex-start",
	gap: "16px",
	"@media (max-width: 868px)": {
		padding: "18px !important",
		gap: "14px",
	},
	"@media (max-width: 480px)": {
		padding: "16px !important",
		gap: "12px",
		flexDirection: "column",
		alignItems: "center",
		textAlign: "center",
	},
});

const StyledIconContainer = styled(Box)({
	display: "flex",
	alignItems: "center",
	justifyContent: "center",
	width: "48px",
	height: "48px",
	borderRadius: "12px",
	backgroundColor: "rgba(56, 130, 246, 0.15)", // Ciemniejsze tło z kolorem primary
	color: "#3882F6", // Updated to use COLOR_PRIMARY
	flexShrink: 0,
	"@media (max-width: 480px)": {
		width: "40px",
		height: "40px",
		borderRadius: "8px",
	},
});

const StyledBackButton = styled(Button)({
	marginTop: "20px",
	width: "100%",
	padding: "14px",
	backgroundColor: "#3882F6", // COLOR_PRIMARY jak w Sign in
	color: "#E4E6E8", // COLOR_TEXT_PRIMARY
	fontSize: "16px",
	fontWeight: "600",
	border: "none",
	borderRadius: "4px",
	cursor: "pointer",
	transition: "background-color 0.2s",
	textTransform: "none", // Wyłączamy uppercase
	"&:hover": {
		backgroundColor: "#22D3EE", // COLOR_SECONDARY jak w Sign in
	},
	"@media (max-width: 480px)": {
		fontSize: "14px",
		padding: "12px",
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
			{/* Mobile logo - pokazuje się tylko na małych ekranach */}
			<div className={classes.mobileLogoHidden}>
				<img
					src="/logo.png"
					alt="GarageManager"
					style={{
						width: "60px",
						height: "auto",
						marginBottom: "6px",
					}}
				/>
				<Typography
					variant="h6"
					sx={{
						color: "#E4E6E8",
						fontSize: "16px",
						fontWeight: "600",
						margin: "0",
					}}
				>
					GarageManager
				</Typography>
			</div>

			<div className={classes.formCard} style={{ maxWidth: "600px" }}>
				<Typography
					variant="h4"
					component="h2"
					sx={{
						fontSize: { xs: "24px", sm: "26px", md: "28px" },
						fontWeight: "700",
						color: "#E4E6E8", // Updated to match dark theme
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
						fontSize: { xs: "14px", sm: "15px" },
						color: "#9CA3AF", // Updated to use COLOR_TEXT_SECONDARY
						marginBottom: { xs: "24px", sm: "30px" },
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
						gap: { xs: "12px", sm: "16px" },
						marginBottom: { xs: "20px", sm: "24px" },
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
										fontSize: { xs: "16px", sm: "18px" },
										fontWeight: "600",
										color: "#E4E6E8", // Updated to match dark theme
										marginBottom: "4px",
									}}
								>
									Register as Client
								</Typography>
								<Typography
									variant="body2"
									sx={{
										fontSize: { xs: "12px", sm: "13px" },
										color: "#9CA3AF", // Updated to use COLOR_TEXT_SECONDARY
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
										fontSize: { xs: "16px", sm: "18px" },
										fontWeight: "600",
										color: "#E4E6E8", // Updated to match dark theme
										marginBottom: "4px",
									}}
								>
									Register as Workshop Owner
								</Typography>
								<Typography
									variant="body2"
									sx={{
										fontSize: { xs: "12px", sm: "13px" },
										color: "#9CA3AF", // Updated to use COLOR_TEXT_SECONDARY
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

				<StyledBackButton onClick={handleBackToLogin}>
					Back to Login
				</StyledBackButton>
			</div>
		</div>
	);
}

export default RegistrationChoice;
