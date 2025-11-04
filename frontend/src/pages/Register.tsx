import { createUseStyles } from "react-jss";
import RegisterWrapper from "../components/Auth/RegisterWrapper";
import Footer from "../components/Footer";
import { COLOR_BACKGROUND } from "../constants";

const useStyles = createUseStyles({
	container: {
		width: "100vw",
		height: "100vh",
		display: "flex",
		flexDirection: "column",
		justifyContent: "center",
		alignItems: "center",
		backgroundColor: COLOR_BACKGROUND, // Updated to use dark theme background
		overflow: "auto", // Changed from hidden to auto for better mobile experience
		position: "relative",
		"@media (max-width: 868px)": {
			justifyContent: "flex-start",
			paddingTop: "40px",
		},
		"@media (max-width: 480px)": {
			paddingTop: "20px",
			height: "auto",
			minHeight: "100vh",
		},
	},
});

function Register() {
	const classes = useStyles();

	return (
		<div className={classes.container}>
			<RegisterWrapper />
			<Footer />
		</div>
	);
}

export default Register;
