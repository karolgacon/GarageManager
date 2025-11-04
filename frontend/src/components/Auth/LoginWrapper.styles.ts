import { createUseStyles } from "react-jss";

const useStyles = createUseStyles({
	container: {
		display: "flex",
		flexDirection: "column",
		alignItems: "center",
		justifyContent: "center",
		width: "100%",
		height: "100vh",
		minWidth: "600px",
		padding: "30px 20px",
		boxSizing: "border-box",
		fontFamily: "'Outfit','Poppins', 'Roboto', sans-serif",
	},
	formCard: {
		backgroundColor: "#1A1D23", // COLOR_SURFACE
		borderRadius: "12px",
		boxShadow: "0 4px 20px rgba(0, 0, 0, 0.3)",
		border: "1px solid rgba(228, 230, 232, 0.1)", // COLOR_TEXT_PRIMARY with opacity
		padding: "50px 40px",
		width: "500px",
		minWidth: "500px",
		height: "auto",
		minHeight: "500px",
		textAlign: "center",
		marginBottom: "100px",
		position: "relative",
		overflow: "visible",
		display: "flex",
		flexDirection: "column",
		justifyContent: "space-between",
	},
	formTitle: {
		fontSize: "28px",
		fontWeight: "700",
		marginBottom: "40px",
		color: "#E4E6E8", // COLOR_TEXT_PRIMARY
		textAlign: "center",
	},
	formField: {
		width: "100%",
		marginBottom: "25px",
		position: "relative",
	},
	input: {
		width: "100%",
		padding: "18px",
		fontSize: "16px",
		fontWeight: "500",
		border: "1px solid rgba(228, 230, 232, 0.2)", // COLOR_TEXT_PRIMARY with opacity
		borderRadius: "4px",
		boxSizing: "border-box",
		color: "#E4E6E8", // COLOR_TEXT_PRIMARY
		backgroundColor: "rgba(0, 0, 0, 0.2)",
		"&::placeholder": {
			color: "#9CA3AF", // COLOR_TEXT_SECONDARY
		},
		"&:focus": {
			outline: "none",
			borderColor: "#3882F6", // COLOR_PRIMARY
		},
	},
	passwordToggle: {
		position: "absolute",
		right: "15px",
		top: "50%",
		transform: "translateY(-50%)",
		cursor: "pointer",
		color: "#9CA3AF", // COLOR_TEXT_SECONDARY
	},
	rememberRow: {
		display: "flex",
		justifyContent: "space-between",
		alignItems: "center",
		width: "100%",
		marginBottom: "35px",
		marginTop: "10px",
	},
	checkboxLabel: {
		display: "flex",
		alignItems: "center",
		fontSize: "14px",
		fontWeight: "500",
		color: "#E4E6E8", // COLOR_TEXT_PRIMARY
	},
	checkboxContainer: {
		position: "relative",
		display: "flex",
		alignItems: "center",
	},
	checkbox: {
		appearance: "none",
		width: "18px",
		height: "18px",
		border: "1px solid rgba(228, 230, 232, 0.3)", // COLOR_TEXT_PRIMARY with opacity
		borderRadius: "50%",
		marginRight: "8px",
		cursor: "pointer",
		position: "relative",
		backgroundColor: "rgba(0, 0, 0, 0.2)",
		"&:checked": {
			backgroundColor: "#3882F6", // COLOR_PRIMARY
			borderColor: "#3882F6", // COLOR_PRIMARY
		},
		"&:checked:after": {
			content: '""',
			position: "absolute",
			top: "5px",
			left: "5px",
			width: "6px",
			height: "6px",
			borderRadius: "50%",
			backgroundColor: "white",
		},
	},
	forgotLink: {
		fontSize: "14px",
		color: "#3882F6", // COLOR_PRIMARY
		textDecoration: "none",
		fontWeight: "500",
		"&:hover": {
			textDecoration: "underline",
			color: "#22D3EE", // COLOR_SECONDARY
		},
	},
	submitButton: {
		width: "100%",
		padding: "18px",
		backgroundColor: "#3882F6", // COLOR_PRIMARY
		color: "#E4E6E8", // COLOR_TEXT_PRIMARY
		fontSize: "17px",
		fontWeight: "600",
		border: "none",
		borderRadius: "4px",
		cursor: "pointer",
		marginBottom: "40px",
		transition: "background-color 0.2s",
		"&:hover": {
			backgroundColor: "#22D3EE", // COLOR_SECONDARY
		},
		"&:disabled": {
			backgroundColor: "rgba(56, 130, 246, 0.5)", // COLOR_PRIMARY with opacity
			cursor: "not-allowed",
		},
	},
	registerContainer: {
		display: "flex",
		alignItems: "center",
		justifyContent: "center",
		gap: "6px",
		margin: "0",
	},
	accountText: {
		fontSize: "14px",
		fontWeight: "500",
		color: "#9CA3AF", // COLOR_TEXT_SECONDARY
	},
	registerLink: {
		color: "#3882F6", // COLOR_PRIMARY
		fontWeight: "600",
		fontSize: "14px",
		textDecoration: "none",
		"&:hover": {
			textDecoration: "underline",
			color: "#22D3EE", // COLOR_SECONDARY
		},
	},
	hugeInfo: {
		marginTop: "15px",
		textAlign: "center",
		fontSize: "12px",
		color: "#3882F6", // COLOR_PRIMARY
		fontWeight: "500",
	},
	errorMessage: {
		color: "#EF4444", // COLOR_ERROR
		fontSize: "14px",
		marginTop: "10px",
		textAlign: "left",
	},
	"@media (max-width: 1200px)": {
		formCard: {
			width: "450px",
			minWidth: "450px",
			padding: "35px",
		},
	},
	"@media (max-width: 800px)": {
		formCard: {
			width: "400px",
			minWidth: "400px",
			padding: "30px",
		},
		container: {
			minWidth: "500px",
		},
	},
	"@media (max-width: 480px)": {
		formCard: {
			width: "100vw",
			minWidth: "0",
			padding: "10vw 2vw",
			boxShadow: "none",
			borderRadius: "0",
			marginBottom: "0",
		},
		container: {
			minWidth: "0",
			padding: "0",
			height: "100vh",
			justifyContent: "flex-start",
		},
		registerContainer: {
			display: "none !important",
		},
		rememberRow: {
			display: "none !important",
		},
		forgotLink: {
			display: "none !important",
		},
		hugeInfo: {
			display: "none !important",
		},
	},
});

export default useStyles;
