import { createUseStyles } from "react-jss";

const useStyles = createUseStyles({
	container: {
		display: "flex",
		flexDirection: "column",
		alignItems: "center",
		justifyContent: "space-between",
		width: "100%",
		height: "100vh",
		maxWidth: "480px", // Slightly wider to match screenshot
		padding: "30px 20px",
		boxSizing: "border-box",
		fontFamily: "'Outfit','Poppins', 'Roboto', sans-serif",
	},
	formCard: {
		backgroundColor: "#FFFFFF",
		borderRadius: "12px", // More rounded corners
		boxShadow: "0 4px 20px rgba(0, 0, 0, 0.08)", // Softer shadow
		padding: "40px",
		width: "100%",
		height: "55vh",
		textAlign: "center",
		marginBottom: "100px",
	},
	formTitle: {
		fontSize: "24px",
		fontWeight: "700",
		marginBottom: "30px",
		color: "#333",
		textAlign: "center", // Left-aligned title
	},
	formField: {
		width: "100%",
		marginBottom: "20px",
		position: "relative",
	},
	input: {
		width: "100%",
		padding: "15px",
		fontSize: "15px",
		fontWeight: "500",
		border: "1px dashed #ccc", // Dashed border as shown in screenshot
		borderRadius: "4px",
		boxSizing: "border-box",
		color: "#000", // Lighter color to match the image
		backgroundColor: "transparent", // Ensure background is transparent
		"&::placeholder": {
			color: "#aaaaaa", // Also lighten placeholder text
		},
		"&:focus": {
			outline: "none",
			borderColor: "#999",
		},
	},
	passwordToggle: {
		position: "absolute",
		right: "15px",
		top: "50%",
		transform: "translateY(-50%)",
		cursor: "pointer",
		color: "#aaa",
	},
	rememberRow: {
		display: "flex",
		justifyContent: "space-between",
		alignItems: "center",
		width: "100%",
		marginBottom: "25px",
		marginTop: "5px",
	},
	checkboxLabel: {
		display: "flex",
		alignItems: "center",
		fontSize: "14px",
		fontWeight: "500",
		color: "#333",
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
		border: "1px solid #ccc",
		borderRadius: "50%", // Circular checkbox as in the screenshot
		marginRight: "8px",
		cursor: "pointer",
		position: "relative",
		"&:checked": {
			backgroundColor: "#FF3B57",
			borderColor: "#FF3B57",
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
		color: "#FF3B57",
		textDecoration: "none",
		fontWeight: "500",
		"&:hover": {
			textDecoration: "underline",
		},
	},
	submitButton: {
		width: "100%",
		padding: "15px",
		backgroundColor: "#FF3B57",
		color: "white",
		fontSize: "16px",
		fontWeight: "600",
		border: "none",
		borderRadius: "4px",
		cursor: "pointer",
		marginBottom: "30px",
		transition: "background-color 0.2s",
		"&:hover": {
			backgroundColor: "#E42D48",
		},
		"&:disabled": {
			backgroundColor: "#ff6b82",
			cursor: "not-allowed",
		},
	},
	registerContainer: {
		display: "flex",
		alignItems: "center",
		justifyContent: "center",
		gap: "6px",
		margin: "20px 0 10px",
	},
	accountText: {
		fontSize: "14px",
		fontWeight: "500",
		color: "#666",
	},
	registerLink: {
		color: "#FF3B57",
		fontWeight: "600",
		fontSize: "14px",
		textDecoration: "none",
		"&:hover": {
			textDecoration: "underline",
		},
	},
	hugeInfo: {
		marginTop: "15px",
		textAlign: "center",
		fontSize: "12px",
		color: "#3399FF",
		fontWeight: "500",
	},
	errorMessage: {
		color: "#FF3B57",
		fontSize: "14px",
		marginTop: "10px",
		textAlign: "left",
	},
	"@media (max-width: 480px)": {
		formCard: {
			padding: "30px 20px",
		},
	},
});

export default useStyles;
