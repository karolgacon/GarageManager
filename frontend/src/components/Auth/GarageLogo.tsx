import { createUseStyles } from "react-jss";

const useStyles = createUseStyles({
	logoContainer: {
		display: "flex",
		flexDirection: "column",
		alignItems: "center",
		marginBottom: "20px",
	},
	logo: {
		width: "200px", // Increased size from 60px to 80px
		height: "auto",
		marginBottom: "1px",
	},
	logoText: {
		fontFamily: '"Poppins", sans-serif', // Changed to a more geometric font
		fontSize: "24px", // Larger font size
		fontWeight: "600",
		margin: "5px 0 3px",
		letterSpacing: "0.5px",
	},
	tagline: {
		fontSize: "12px",
		color: "#FF3B57", // Accent red color for tagline
		fontWeight: "500",
		letterSpacing: "1px",
		textTransform: "uppercase",
		margin: 0,
	},
});

const GarageLogo = () => {
	const classes = useStyles();

	return (
		<div className={classes.logoContainer}>
			<img className={classes.logo} src="/logo.png" alt="GarageManager logo" />
		</div>
	);
};

export default GarageLogo;
