import { createUseStyles } from "react-jss";

// Importuj kolory z constants
const COLOR_SURFACE = "#1A1D23";
const COLOR_PRIMARY = "#3882F6";
const COLOR_SECONDARY = "#22D3EE";
const COLOR_TEXT_PRIMARY = "#E4E6E8";
const COLOR_TEXT_SECONDARY = "#9CA3AF";
const COLOR_ERROR = "#EF4444";
const COLOR_WARNING = "#F59E0B";

const useProfileSetupStyles = createUseStyles({
	container: {
		display: "flex",
		flexDirection: "column",
		alignItems: "center",
		width: "100%",
		maxWidth: "500px",
		margin: "0 auto",
	},
	formCard: {
		backgroundColor: COLOR_SURFACE,
		borderRadius: "16px",
		padding: "50px",
		width: "100%",
		boxShadow: "0 8px 32px rgba(0, 0, 0, 0.3)",
		border: `1px solid rgba(228, 230, 232, 0.1)`,
		minHeight: "500px",
	},
	formTitle: {
		fontSize: "28px",
		fontWeight: "600",
		color: COLOR_TEXT_PRIMARY,
		marginBottom: "8px",
		textAlign: "center",
	},
	formSubtitle: {
		fontSize: "16px",
		color: COLOR_TEXT_SECONDARY,
		textAlign: "center",
		marginBottom: "35px",
	},
	formField: {
		position: "relative",
		marginBottom: "24px",
	},
	input: {
		width: "100%",
		padding: "16px 20px",
		border: `1px solid rgba(228, 230, 232, 0.2)`,
		borderRadius: "12px",
		fontSize: "16px",
		backgroundColor: "rgba(0, 0, 0, 0.2)",
		color: COLOR_TEXT_PRIMARY,
		transition: "all 0.2s ease",
		boxSizing: "border-box",
		minHeight: "52px",
		"&:focus": {
			outline: "none",
			borderColor: COLOR_PRIMARY,
			backgroundColor: "rgba(0, 0, 0, 0.3)",
			boxShadow: `0 0 0 3px ${COLOR_PRIMARY}26`,
		},
		"&::placeholder": {
			color: COLOR_TEXT_SECONDARY,
		},
	},
	buttonGroup: {
		display: "flex",
		gap: "16px",
		marginTop: "40px",
	},
	button: {
		flex: 1,
		padding: "16px 24px",
		borderRadius: "12px",
		fontSize: "16px",
		fontWeight: "600",
		cursor: "pointer",
		transition: "all 0.2s ease",
		border: "none",
		minHeight: "52px",
		"&:disabled": {
			opacity: 0.6,
			cursor: "not-allowed",
		},
	},
	primaryButton: {
		backgroundColor: COLOR_PRIMARY,
		color: COLOR_TEXT_PRIMARY,
		"&:hover:not(:disabled)": {
			backgroundColor: COLOR_SECONDARY,
			transform: "translateY(-1px)",
			boxShadow: `0 4px 12px ${COLOR_PRIMARY}4D`,
		},
	},
	secondaryButton: {
		backgroundColor: "rgba(228, 230, 232, 0.1)",
		color: COLOR_TEXT_PRIMARY,
		border: `2px solid rgba(228, 230, 232, 0.2)`,
		"&:hover": {
			backgroundColor: "rgba(228, 230, 232, 0.2)",
			borderColor: COLOR_TEXT_PRIMARY,
		},
	},
	skipButton: {
		backgroundColor: "transparent",
		color: COLOR_TEXT_SECONDARY,
		border: `2px solid rgba(228, 230, 232, 0.2)`,
		"&:hover": {
			backgroundColor: "rgba(228, 230, 232, 0.1)",
			borderColor: COLOR_TEXT_PRIMARY,
		},
	},
	progressBar: {
		width: "100%",
		height: "6px",
		backgroundColor: "rgba(228, 230, 232, 0.2)",
		borderRadius: "3px",
		marginBottom: "25px",
		overflow: "hidden",
	},
	progressFill: {
		height: "100%",
		backgroundColor: COLOR_PRIMARY,
		borderRadius: "3px",
		transition: "width 0.3s ease",
	},
	stepIndicator: {
		textAlign: "center",
		marginBottom: "25px",
		fontSize: "16px",
		color: COLOR_TEXT_SECONDARY,
		fontWeight: "500",
	},
	errorMessage: {
		backgroundColor: `${COLOR_ERROR}1A`,
		border: `1px solid ${COLOR_ERROR}4D`,
		color: COLOR_ERROR,
		padding: "16px 20px",
		borderRadius: "12px",
		fontSize: "15px",
		marginTop: "25px",
		textAlign: "center",
		fontWeight: "500",
	},
	warningMessage: {
		backgroundColor: `${COLOR_WARNING}1A`,
		border: `1px solid ${COLOR_WARNING}`,
		color: COLOR_WARNING,
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
