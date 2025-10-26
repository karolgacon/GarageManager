import { Box, Typography } from "@mui/material";
import { COLOR_SECONDARY } from "../constants";

const Footer = () => (
	<Box
		sx={{
			height: "32px",
			padding: "6px",
			textAlign: "center",
			bgcolor: COLOR_SECONDARY,
			color: "white",
			width: "100%",
			position: "fixed",
			bottom: 0,
			left: 0,
			right: 0,
			zIndex: 1300,
		}}
	>
		<Typography variant="caption" component="div">
			COPYRIGHT | GARAGEMASTER 2025
		</Typography>
	</Box>
);

export default Footer;
