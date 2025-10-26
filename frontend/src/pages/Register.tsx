import { createUseStyles } from "react-jss";
import RegisterWrapper from "../components/Auth/RegisterWrapper";
import Footer from "../components/Footer";

const useStyles = createUseStyles({
	container: {
		width: "100vw",
		height: "100vh",
		display: "flex",
		flexDirection: "column",
		justifyContent: "center",
		alignItems: "center",
		backgroundColor: "#F2F4F7",
		overflow: "hidden",
		position: "relative",
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
