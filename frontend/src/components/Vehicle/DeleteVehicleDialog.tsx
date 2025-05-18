import React from "react";
import {
	Dialog,
	DialogTitle,
	DialogContent,
	DialogActions,
	Button,
	Typography,
	Box,
	CircularProgress,
} from "@mui/material";

interface DeleteVehicleDialogProps {
	open: boolean;
	onClose: () => void;
	onConfirm: () => void;
	isLoading: boolean;
	vehicleDetails?: {
		make?: string;
		model?: string;
		registration?: string;
	};
}

const DeleteVehicleDialog: React.FC<DeleteVehicleDialogProps> = ({
	open,
	onClose,
	onConfirm,
	isLoading,
	vehicleDetails,
}) => {
	return (
		<Dialog
			open={open}
			onClose={onClose}
			PaperProps={{
				sx: { borderRadius: 2 },
			}}
		>
			<DialogTitle sx={{ bgcolor: "#f5f5f5" }}>Confirm Delete</DialogTitle>

			<DialogContent sx={{ pt: 2, pb: 1 }}>
				<Typography variant="body1" gutterBottom>
					Are you sure you want to delete this vehicle?
				</Typography>

				{vehicleDetails && (
					<Box sx={{ mt: 2, p: 2, bgcolor: "#f5f5f5", borderRadius: 1 }}>
						<Typography variant="body2">
							<strong>
								{vehicleDetails.make} {vehicleDetails.model}
							</strong>
							{vehicleDetails.registration &&
								` (${vehicleDetails.registration})`}
						</Typography>
					</Box>
				)}

				<Typography variant="body2" color="error" sx={{ mt: 2 }}>
					This action cannot be undone.
				</Typography>
			</DialogContent>

			<DialogActions sx={{ p: 2 }}>
				<Button onClick={onClose} disabled={isLoading}>
					Cancel
				</Button>
				<Button
					onClick={onConfirm}
					color="error"
					variant="contained"
					disabled={isLoading}
					startIcon={
						isLoading ? <CircularProgress size={20} color="inherit" /> : null
					}
				>
					{isLoading ? "Deleting..." : "Delete"}
				</Button>
			</DialogActions>
		</Dialog>
	);
};

export default DeleteVehicleDialog;
