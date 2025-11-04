import { createUseStyles } from "react-jss";
import { COLOR_PRIMARY, COLOR_TEXT_PRIMARY } from "../../constants";

const useStyles = createUseStyles({
	logoContainer: {
		display: "flex",
		flexDirection: "column",
		alignItems: "center",
		marginBottom: "20px",
		"@media (max-width: 868px)": {
			marginBottom: "16px",
		},
		"@media (max-width: 480px)": {
			marginBottom: "12px",
		},
	},
	logo: {
		width: "200px",
		height: "auto",
		marginBottom: "1px",
		"@media (max-width: 868px)": {
			width: "160px",
		},
		"@media (max-width: 480px)": {
			width: "120px",
		},
	},
	logoText: {
		fontFamily: '"Poppins", sans-serif',
		fontSize: "24px",
		fontWeight: "600",
		margin: "5px 0 3px",
		letterSpacing: "0.5px",
		color: COLOR_TEXT_PRIMARY, // Updated to use dark theme text color
		"@media (max-width: 868px)": {
			fontSize: "20px",
		},
		"@media (max-width: 480px)": {
			fontSize: "18px",
		},
	},
	tagline: {
		fontSize: "12px",
		color: COLOR_PRIMARY, // Updated to use COLOR_PRIMARY
		fontWeight: "500",
		letterSpacing: "1px",
		textTransform: "uppercase",
		margin: 0,
		"@media (max-width: 480px)": {
			fontSize: "11px",
		},
	},
});

const GarageLogo = () => {
	const classes = useStyles();

	return (
		<div className={classes.logoContainer}>
			<img className={classes.logo} src="/logo.png" alt="GarageManager logo" />
			<h1 className={classes.logoText}>GarageManager</h1>
			<p className={classes.tagline}>Quality repair as art</p>
		</div>
	);
};

export default GarageLogo;
