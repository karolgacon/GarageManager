import React from "react";
import {
	Dialog,
	DialogTitle,
	DialogContent,
	DialogActions,
	Box,
	Typography,
	Button,
	IconButton,
	Grid,
	Divider,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { format, parseISO } from "date-fns";
import BookingForm from "./BookingForm";

interface BookingModalsProps {
	modalStates: {
		isNewBookingModalOpen: boolean;
		isEditBookingModalOpen: boolean;
		isViewBookingModalOpen: boolean;
	};
	selectedBookingData: any;
	onClose: (modalType: string) => void;
	onCreateBooking: (data: any) => void;
	onUpdateBooking: (data: any) => void;
}

const BookingModals: React.FC<BookingModalsProps> = ({
	modalStates,
	selectedBookingData,
	onClose,
	onCreateBooking,
	onUpdateBooking,
}) => {
	const {
		isNewBookingModalOpen,
		isEditBookingModalOpen,
		isViewBookingModalOpen,
	} = modalStates;

	return (
		<>
			{/* Create Booking Modal */}
			<Dialog
				open={isNewBookingModalOpen}
				onClose={() => onClose("new")}
				maxWidth="md"
				fullWidth
			>
				<DialogTitle>
					<Box
						sx={{
							display: "flex",
							justifyContent: "space-between",
							alignItems: "center",
						}}
					>
						<Typography variant="h5" fontWeight="bold">
							Create New Booking
						</Typography>
						<IconButton onClick={() => onClose("new")}>
							<CloseIcon />
						</IconButton>
					</Box>
				</DialogTitle>
				<DialogContent>
					<BookingForm id="create-booking-form" onSubmit={onCreateBooking} />
				</DialogContent>
				<DialogActions
					sx={{ p: 2, display: "flex", justifyContent: "flex-end", gap: 2 }}
				>
					<Button
						variant="outlined"
						onClick={() => onClose("new")}
						sx={{
							color: "#555",
							borderColor: "#ddd",
							"&:hover": { borderColor: "#ff3c4e", color: "#ff3c4e" },
							minWidth: "100px",
						}}
					>
						CANCEL
					</Button>
					<Button
						variant="contained"
						type="submit"
						form="create-booking-form"
						sx={{
							bgcolor: "#ff3c4e",
							"&:hover": { bgcolor: "#d6303f" },
							minWidth: "150px",
						}}
					>
						CREATE BOOKING
					</Button>
				</DialogActions>
			</Dialog>

			{/* Edit Booking Modal */}
			<Dialog
				open={isEditBookingModalOpen}
				onClose={() => onClose("edit")}
				maxWidth="md"
				fullWidth
			>
				<DialogTitle>
					<Box
						sx={{
							display: "flex",
							justifyContent: "space-between",
							alignItems: "center",
						}}
					>
						<Typography variant="h5" fontWeight="bold">
							Edit Booking
						</Typography>
						<IconButton onClick={() => onClose("edit")}>
							<CloseIcon />
						</IconButton>
					</Box>
				</DialogTitle>
				<DialogContent>
					{selectedBookingData && (
						<BookingForm
							id="edit-booking-form"
							initialData={selectedBookingData}
							onSubmit={onUpdateBooking}
						/>
					)}
				</DialogContent>
				<DialogActions
					sx={{ p: 2, display: "flex", justifyContent: "flex-end", gap: 2 }}
				>
					<Button
						variant="outlined"
						onClick={() => onClose("edit")}
						sx={{
							color: "#555",
							borderColor: "#ddd",
							"&:hover": { borderColor: "#ff3c4e", color: "#ff3c4e" },
							minWidth: "100px",
						}}
					>
						CANCEL
					</Button>
					<Button
						variant="contained"
						type="submit"
						form="edit-booking-form"
						sx={{
							bgcolor: "#ff3c4e",
							"&:hover": { bgcolor: "#d6303f" },
							minWidth: "150px",
						}}
					>
						SAVE CHANGES
					</Button>
				</DialogActions>
			</Dialog>

			{/* View Booking Modal */}
			<Dialog
				open={isViewBookingModalOpen}
				onClose={() => onClose("view")}
				maxWidth="sm"
				fullWidth
			>
				<DialogTitle>
					<Typography variant="h5" fontWeight="bold">
						Booking Details
					</Typography>
				</DialogTitle>
				<DialogContent>
					{selectedBookingData && (
						<>
							<Box sx={{ pt: 2 }}>
								<Grid container spacing={2}>
									<Grid item xs={6}>
										<Typography variant="subtitle2" color="text.secondary">
											Date
										</Typography>
										<Typography variant="body1">
											{format(
												parseISO(selectedBookingData.date),
												"dd MMM yyyy"
											)}
										</Typography>
									</Grid>
									<Grid item xs={6}>
										<Typography variant="subtitle2" color="text.secondary">
											Time
										</Typography>
										<Typography variant="body1">
											{format(parseISO(selectedBookingData.date), "HH:mm")}
										</Typography>
									</Grid>
									<Grid item xs={6}>
										<Typography variant="subtitle2" color="text.secondary">
											Client
										</Typography>
										<Typography variant="body1">
											{selectedBookingData.client?.first_name}{" "}
											{selectedBookingData.client?.last_name}
										</Typography>
									</Grid>
									<Grid item xs={6}>
										<Typography variant="subtitle2" color="text.secondary">
											Status
										</Typography>
										<Typography
											variant="body1"
											sx={{
												color:
													selectedBookingData.status === "confirmed"
														? "success.main"
														: selectedBookingData.status === "pending"
														? "warning.main"
														: selectedBookingData.status === "completed"
														? "info.main"
														: selectedBookingData.status === "cancelled"
														? "error.main"
														: "text.primary",
											}}
										>
											{selectedBookingData.status.charAt(0).toUpperCase() +
												selectedBookingData.status.slice(1)}
										</Typography>
									</Grid>
									<Grid item xs={12}>
										<Typography variant="subtitle2" color="text.secondary">
											Vehicle
										</Typography>
										<Typography variant="body1">
											{selectedBookingData.vehicle?.brand}{" "}
											{selectedBookingData.vehicle?.model} (
											{selectedBookingData.vehicle?.year})
										</Typography>
									</Grid>
									<Grid item xs={12}>
										<Typography variant="subtitle2" color="text.secondary">
											Service Type
										</Typography>
										<Typography variant="body1">
											{selectedBookingData.service_type || "General Service"}
										</Typography>
									</Grid>
									<Grid item xs={12}>
										<Typography variant="subtitle2" color="text.secondary">
											Workshop
										</Typography>
										<Typography variant="body1">
											{selectedBookingData.workshop?.name}
										</Typography>
									</Grid>
									<Grid item xs={12}>
										<Typography variant="subtitle2" color="text.secondary">
											Assigned Mechanic
										</Typography>
										{selectedBookingData.mechanic ? (
											<Typography variant="body1">
												{selectedBookingData.mechanic.first_name}{" "}
												{selectedBookingData.mechanic.last_name}
											</Typography>
										) : (
											<Typography variant="body2" color="text.secondary">
												Not assigned
											</Typography>
										)}
									</Grid>
									{selectedBookingData.note && (
										<Grid item xs={12}>
											<Typography variant="subtitle2" color="text.secondary">
												Notes
											</Typography>
											<Typography variant="body1">
												{selectedBookingData.note}
											</Typography>
										</Grid>
									)}
								</Grid>
							</Box>

							{/* Action buttons section */}
							<Divider sx={{ my: 3 }} />
							<Box sx={{ display: "flex", gap: 1, mt: 2 }}>
								<Button
									variant="outlined"
									onClick={() => {
										onClose("view");
										onUpdateBooking(selectedBookingData.id);
									}}
									sx={{
										flexGrow: 1,
										color: "#555",
										borderColor: "#ddd",
										"&:hover": { borderColor: "#ff3c4e", color: "#ff3c4e" },
									}}
								>
									Edit Booking
								</Button>
								<Button
									variant="outlined"
									color="error"
									onClick={() => {
										onClose("view");
										onCreateBooking(selectedBookingData.id);
									}}
									sx={{ flexGrow: 1 }}
								>
									Cancel Booking
								</Button>
							</Box>
						</>
					)}
				</DialogContent>
				<DialogActions sx={{ px: 3, pb: 3, justifyContent: "flex-end" }}>
					<Button
						onClick={() => onClose("view")}
						variant="contained"
						sx={{
							bgcolor: "#ff3c4e",
							"&:hover": { bgcolor: "#d6303f" },
							minWidth: "120px",
						}}
					>
						CLOSE
					</Button>
				</DialogActions>
			</Dialog>
		</>
	);
};

export default BookingModals;
