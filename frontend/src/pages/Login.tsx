import { createUseStyles } from "react-jss";
import LoginWrapper from "../components/Auth/LoginWrapper";

const useStyles = createUseStyles({
	container: {
		width: "100vw",
		height: "100vh",
		display: "flex",
		flexDirection: "column",
		justifyContent: "center",
		alignItems: "center",
		backgroundColor: "#F2F4F7", // Light gray background from screenshot
		overflow: "hidden",
		position: "relative",
		// padding: "20px",
	},
	footer: {
		position: "absolute",
		bottom: 0,
		left: 0,
		right: 0,
		padding: "12px 0",
		textAlign: "center",
		fontSize: "12px",
		fontWeight: "500",
		letterSpacing: "1px",
		backgroundColor: "#FF3B57", // Red footer
		color: "black",
	},
});

function Login() {
	const classes = useStyles();

	return (
		<div className={classes.container}>
			<LoginWrapper />
			<div className={classes.footer}>COPYRIGHT | GARAGEMASTER 2025</div>
		</div>
	);
}

export default Login;
