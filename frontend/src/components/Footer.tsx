import { Box, Typography } from "@mui/material";
import { COLOR_SECONDARY, COLOR_PRIMARY } from "../constants";

const Footer = () => (
	<Box
		sx={{
			height: "32px",
			padding: "6px",
			textAlign: "center",
			bgcolor: COLOR_PRIMARY,
			color: "white",
			width: "100%",
			position: "fixed",
			bottom: 0,
			left: 0,
			right: 0,
			zIndex: 1300,
			"@media (max-width: 868px)": {
				position: "relative",
				marginTop: "auto",
			},
		}}
	>
		<Typography variant="caption" component="div">
			COPYRIGHT | GARAGEMASTER 2025
		</Typography>
	</Box>
);

export default Footer;
