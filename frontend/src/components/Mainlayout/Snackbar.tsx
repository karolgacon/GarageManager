import React from "react";
import { Snackbar, Alert } from "@mui/material";

export interface SnackbarState {
	open: boolean;
	message: string;
	severity: "success" | "error" | "warning" | "info";
}

interface CustomSnackbarProps {
	snackbarState: SnackbarState;
	onClose: () => void;
}

const CustomSnackbar: React.FC<CustomSnackbarProps> = ({
	snackbarState,
	onClose,
}) => {
	const { open, message, severity } = snackbarState;

	return (
		<Snackbar
			open={open}
			autoHideDuration={5000}
			onClose={onClose}
			anchorOrigin={{ vertical: "top", horizontal: "center" }}
			sx={{
				width: "100%",
				maxWidth: "600px",
				"& .MuiAlert-root": {
					width: "100%",
					fontSize: "1rem",
					padding: "12px 16px",
				},
			}}
		>
			<Alert
				onClose={onClose}
				severity={severity}
				variant="filled"
				sx={{
					width: "100%",
					alignItems: "center",
					"& .MuiAlert-icon": {
						fontSize: "1.5rem",
					},
				}}
			>
				{message}
			</Alert>
		</Snackbar>
	);
};

export default CustomSnackbar;
