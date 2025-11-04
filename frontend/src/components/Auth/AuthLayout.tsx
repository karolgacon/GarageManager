import React from "react";
import { Box, Container, Grid, Paper } from "@mui/material";
import { styled } from "@mui/material/styles";
import {
	COLOR_BACKGROUND,
	COLOR_SURFACE,
	COLOR_PRIMARY,
	COLOR_SECONDARY,
	COLOR_TEXT_PRIMARY,
	COLOR_TEXT_SECONDARY,
} from "../../constants";
import Footer from "../Footer";

const StyledContainer = styled(Container)({
	height: "100vh",
	display: "flex",
	alignItems: "center",
	justifyContent: "center",
	padding: "0 !important",
	maxWidth: "none !important",
	position: "relative",
	backgroundColor: "transparent",
});

const StyledGrid = styled(Grid)({
	height: "100vh",
	margin: 0,
	width: "100%",
	backgroundColor: "transparent",
});

const StyledLogoSection = styled(Box)({
	backgroundColor: COLOR_SURFACE, // Ciemne tło zamiast białego
	height: "100vh",
	display: "flex",
	flexDirection: "column",
	justifyContent: "center",
	alignItems: "center",
	color: COLOR_TEXT_PRIMARY,
	position: "relative",
});

const StyledLogoContent = styled(Box)({
	position: "relative",
	zIndex: 2,
	textAlign: "center",
});

const StyledFormSection = styled(Box)({
	background: `linear-gradient(135deg, ${COLOR_PRIMARY} 0%, ${COLOR_SECONDARY} 100%)`, // Nowe kolory gradientu
	height: "100vh",
	display: "flex",
	alignItems: "center",
	justifyContent: "center",
	padding: "40px",
});

const StyledFormCard = styled(Paper)({
	backgroundColor: "transparent",
	borderRadius: "0",
	padding: "0",
	width: "100%",
	maxWidth: "600px",
	boxShadow: "none",
	border: "none",
});

const StyledLogo = styled("img")({
	width: "220px",
	height: "auto",
	marginBottom: "28px",
	// Usuń filtr, który powodował biały kwadrat
});

const StyledLogoText = styled("h1")({
	fontFamily: '"Poppins", sans-serif',
	fontSize: "32px",
	fontWeight: "700",
	margin: "0 0 8px",
	letterSpacing: "-0.5px",
	color: COLOR_PRIMARY, // Użyj nowego primary color
});

const StyledTagline = styled("p")({
	fontSize: "14px",
	fontWeight: "400",
	letterSpacing: "1px",
	textTransform: "uppercase",
	margin: 0,
	opacity: 0.7,
	color: COLOR_TEXT_SECONDARY, // Użyj secondary text color
});

interface AuthLayoutProps {
	children: React.ReactNode;
}

const AuthLayout: React.FC<AuthLayoutProps> = ({ children }) => {
	// Ustaw ciemne tło dla body podczas ładowania komponentu
	React.useEffect(() => {
		document.body.style.backgroundColor = COLOR_BACKGROUND;
		return () => {
			document.body.style.backgroundColor = "";
		};
	}, []);

	return (
		<Box
			sx={{
				position: "relative",
				height: "100vh",
				backgroundColor: COLOR_BACKGROUND,
				overflow: "auto",
			}}
		>
			<StyledContainer>
				<StyledGrid
					container
					sx={{ backgroundColor: COLOR_BACKGROUND, minWidth: "1200px" }}
				>
					<Grid item xs={12} md={6} sx={{ minWidth: "600px" }}>
						<StyledLogoSection>
							<StyledLogoContent>
								<StyledLogo src="/logo.png" alt="GarageManager logo" />
								<StyledLogoText>GarageManager</StyledLogoText>
								<StyledTagline>Quality repair as art</StyledTagline>
							</StyledLogoContent>
						</StyledLogoSection>
					</Grid>
					<Grid
						item
						xs={12}
						md={6}
						sx={{
							backgroundColor: COLOR_PRIMARY,
							background: `linear-gradient(135deg, ${COLOR_PRIMARY} 0%, ${COLOR_SECONDARY} 100%)`,
							minWidth: "600px",
						}}
					>
						<StyledFormSection>
							<StyledFormCard elevation={0}>{children}</StyledFormCard>
						</StyledFormSection>
					</Grid>
				</StyledGrid>
			</StyledContainer>
			<Footer />
		</Box>
	);
};

export default AuthLayout;
