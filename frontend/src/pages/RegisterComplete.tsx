import { useState } from "react";
import { createUseStyles } from "react-jss";
import RegisterWrapper from "../components/Auth/RegisterWrapper";
import ProfileSetup from "../components/Auth/ProfileSetup";
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

function RegisterComplete() {
	const classes = useStyles();
	const [registrationComplete, setRegistrationComplete] = useState(false);
	const [userData, setUserData] = useState(null);

	const handleRegistrationComplete = (data: any) => {
		setUserData(data);
		setRegistrationComplete(true);
	};

	return (
		<div className={classes.container}>
			{!registrationComplete ? (
				<RegisterWrapper onRegistrationComplete={handleRegistrationComplete} />
			) : (
				<ProfileSetup userData={userData} />
			)}
			<Footer />
		</div>
	);
}

export default RegisterComplete;
