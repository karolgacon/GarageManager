import React from "react";
import {
	Dialog,
	DialogTitle,
	DialogContent,
	DialogActions,
	Button,
	Typography,
	Box,
	Avatar,
	CircularProgress,
} from "@mui/material";
import PersonIcon from "@mui/icons-material/Person";
import WarningIcon from "@mui/icons-material/Warning";
import { Customer } from "../../models/CustomerModel";
import {
	COLOR_PRIMARY,
	COLOR_SURFACE,
	COLOR_TEXT_PRIMARY,
	COLOR_TEXT_SECONDARY,
} from "../../constants";

interface DeleteCustomerDialogProps {
	open: boolean;
	onClose: () => void;
	customer: Customer | null;
	onConfirm: () => void;
	loading?: boolean;
}

const DeleteCustomerDialog: React.FC<DeleteCustomerDialogProps> = ({
	open,
	onClose,
	customer,
	onConfirm,
	loading = false,
}) => {
	if (!customer) return null;

	return (
		<Dialog
			open={open}
			onClose={onClose}
			maxWidth="sm"
			fullWidth
			PaperProps={{
				sx: {
					backgroundColor: COLOR_SURFACE,
					color: COLOR_TEXT_PRIMARY,
					borderRadius: 2,
					border: `1px solid rgba(228, 230, 232, 0.1)`,
				},
			}}
		>
			<DialogTitle sx={{ backgroundColor: COLOR_SURFACE }}>
				<Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
					<WarningIcon sx={{ color: "#ff6b6b" }} />
					<Typography
						variant="h6"
						fontWeight="bold"
						sx={{ color: COLOR_TEXT_PRIMARY }}
					>
						Delete Customer
					</Typography>
				</Box>
			</DialogTitle>

			<DialogContent sx={{ backgroundColor: COLOR_SURFACE }}>
				<Box sx={{ textAlign: "center", py: 2 }}>
					<Avatar
						src={customer.profile?.photo}
						sx={{
							width: 80,
							height: 80,
							bgcolor: COLOR_PRIMARY,
							margin: "0 auto",
							mb: 2,
							border: `2px solid rgba(228, 230, 232, 0.1)`,
						}}
					>
						{!customer.profile?.photo && (
							<PersonIcon sx={{ color: "white", fontSize: 40 }} />
						)}
					</Avatar>

					<Typography
						variant="h6"
						gutterBottom
						sx={{ color: COLOR_TEXT_PRIMARY }}
					>
						{customer.first_name} {customer.last_name}
					</Typography>

					<Typography
						variant="body2"
						gutterBottom
						sx={{ color: COLOR_TEXT_SECONDARY }}
					>
						@{customer.username} • {customer.email}
					</Typography>

					<Typography
						variant="body1"
						sx={{
							mt: 3,
							mb: 2,
							color: COLOR_TEXT_PRIMARY,
						}}
					>
						Are you sure you want to delete this customer?
					</Typography>

					<Typography
						variant="body2"
						sx={{
							color: "#ff6b6b",
							backgroundColor: "rgba(244, 67, 54, 0.1)",
							padding: 2,
							borderRadius: 1,
							border: "1px solid rgba(244, 67, 54, 0.2)",
						}}
					>
						<strong>Warning:</strong> This action cannot be undone. All customer
						data, including their vehicles, appointments, and history will be
						permanently deleted.
					</Typography>
				</Box>
			</DialogContent>

			<DialogActions
				sx={{
					backgroundColor: COLOR_SURFACE,
					borderTop: `1px solid rgba(228, 230, 232, 0.1)`,
					px: 3,
					py: 2,
				}}
			>
				<Button
					onClick={onClose}
					disabled={loading}
					sx={{
						color: COLOR_TEXT_SECONDARY,
						"&:hover": {
							backgroundColor: "rgba(156, 163, 175, 0.1)",
							color: COLOR_TEXT_PRIMARY,
						},
						"&:disabled": {
							color: "rgba(156, 163, 175, 0.5)",
						},
					}}
				>
					Cancel
				</Button>
				<Button
					onClick={onConfirm}
					variant="contained"
					disabled={loading}
					startIcon={
						loading ? (
							<CircularProgress size={16} sx={{ color: "#fff" }} />
						) : null
					}
					sx={{
						bgcolor: "#ff6b6b",
						color: "#fff",
						"&:hover": {
							bgcolor: "rgba(255, 107, 107, 0.8)",
						},
						"&:disabled": {
							bgcolor: "rgba(255, 107, 107, 0.3)",
							color: "rgba(255, 255, 255, 0.5)",
						},
					}}
				>
					{loading ? "Deleting..." : "Delete Customer"}
				</Button>
			</DialogActions>
		</Dialog>
	);
};

export default DeleteCustomerDialog;
