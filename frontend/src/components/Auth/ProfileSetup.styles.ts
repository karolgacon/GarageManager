import { createUseStyles } from "react-jss";

const useProfileSetupStyles = createUseStyles({
	container: {
		display: "flex",
		flexDirection: "column",
		alignItems: "center",
		width: "100%",
		maxWidth: "500px", // Zwiększone z 400px
		margin: "0 auto",
	},
	formCard: {
		backgroundColor: "white",
		borderRadius: "16px", // Większy radius
		padding: "50px", // Zwiększone z 40px
		width: "100%",
		boxShadow: "0 8px 32px rgba(0, 0, 0, 0.12)", // Większy cień
		border: "1px solid #E5E7EB",
		minHeight: "500px", // Minimalna wysokość
	},
	formTitle: {
		fontSize: "28px", // Zwiększone z 24px
		fontWeight: "600",
		color: "#1F2937",
		marginBottom: "8px",
		textAlign: "center",
	},
	formSubtitle: {
		fontSize: "16px", // Zwiększone z 14px
		color: "#6B7280",
		textAlign: "center",
		marginBottom: "35px", // Zwiększone z 30px
	},
	formField: {
		position: "relative",
		marginBottom: "24px", // Zwiększone z 20px
	},
	input: {
		width: "100%",
		padding: "16px 20px", // Zwiększone z 12px 16px
		border: "1px solid #D1D5DB",
		borderRadius: "12px", // Zwiększone z 8px
		fontSize: "16px", // Zwiększone z 14px
		backgroundColor: "#F9FAFB",
		transition: "all 0.2s ease",
		boxSizing: "border-box",
		minHeight: "52px", // Dodana minimalna wysokość
		"&:focus": {
			outline: "none",
			borderColor: "#FF3B57",
			backgroundColor: "white",
			boxShadow: "0 0 0 3px rgba(255, 59, 87, 0.1)",
		},
		"&::placeholder": {
			color: "#9CA3AF",
		},
	},
	buttonGroup: {
		display: "flex",
		gap: "16px", // Zwiększone z 12px
		marginTop: "40px", // Zwiększone z 30px
	},
	button: {
		flex: 1,
		padding: "16px 24px", // Zwiększone z 12px 20px
		borderRadius: "12px", // Zwiększone z 8px
		fontSize: "16px", // Zwiększone z 14px
		fontWeight: "600", // Zwiększone z 500
		cursor: "pointer",
		transition: "all 0.2s ease",
		border: "none",
		minHeight: "52px", // Zwiększone z 44px
		"&:disabled": {
			opacity: 0.6,
			cursor: "not-allowed",
		},
	},
	primaryButton: {
		backgroundColor: "#FF3B57",
		color: "white",
		"&:hover:not(:disabled)": {
			backgroundColor: "#E6334A",
			transform: "translateY(-1px)",
			boxShadow: "0 4px 12px rgba(255, 59, 87, 0.3)",
		},
	},
	secondaryButton: {
		backgroundColor: "white",
		color: "#374151",
		border: "2px solid #D1D5DB", // Grubsza ramka
		"&:hover": {
			backgroundColor: "#F9FAFB",
			borderColor: "#9CA3AF",
		},
	},
	skipButton: {
		backgroundColor: "transparent",
		color: "#6B7280",
		border: "2px solid #D1D5DB", // Grubsza ramka
		"&:hover": {
			backgroundColor: "#F9FAFB",
			borderColor: "#9CA3AF",
		},
	},
	progressBar: {
		width: "100%",
		height: "6px", // Zwiększone z 4px
		backgroundColor: "#E5E7EB",
		borderRadius: "3px",
		marginBottom: "25px", // Zwiększone z 20px
		overflow: "hidden",
	},
	progressFill: {
		height: "100%",
		backgroundColor: "#FF3B57",
		borderRadius: "3px",
		transition: "width 0.3s ease",
	},
	stepIndicator: {
		textAlign: "center",
		marginBottom: "25px", // Zwiększone z 20px
		fontSize: "16px", // Zwiększone z 14px
		color: "#6B7280",
		fontWeight: "500",
	},
	errorMessage: {
		backgroundColor: "#FEF2F2",
		border: "1px solid #FECACA",
		color: "#DC2626",
		padding: "16px 20px", // Zwiększone z 12px
		borderRadius: "12px", // Zwiększone z 8px
		fontSize: "15px", // Zwiększone z 14px
		marginTop: "25px", // Zwiększone z 20px
		textAlign: "center",
		fontWeight: "500",
	},
	// Nowy styl dla ostrzeżenia na górze
	warningMessage: {
		backgroundColor: "#FEF3C7",
		border: "1px solid #F59E0B",
		color: "#92400E",
		padding: "16px 20px",
		borderRadius: "12px",
		fontSize: "15px",
		marginBottom: "25px",
		textAlign: "center",
		fontWeight: "500",
		display: "flex",
		alignItems: "center",
		justifyContent: "center",
		gap: "8px",
	},
});

export default useProfileSetupStyles;
