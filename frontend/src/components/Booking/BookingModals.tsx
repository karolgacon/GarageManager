import React, { useContext, useEffect, useState } from "react";
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
import { format } from "date-fns";
import BookingForm from "./BookingForm";
import BookingWizard from "./BookingWizard";
import AuthContext from "../../context/AuthProvider";
import { vehicleService } from "../../api/VehicleAPIEndpoint";
import { customerService } from "../../api/CustomerAPIEndpoint";
import { workshopService } from "../../api/WorkshopAPIEndpoint";
import { bookingService } from "../../api/BookingAPIEndpoint";
import {
	COLOR_PRIMARY,
	COLOR_SURFACE,
	COLOR_TEXT_PRIMARY,
	COLOR_TEXT_SECONDARY,
} from "../../constants";

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
	onEditFromView?: (bookingId: number) => void;
	onDeleteBooking?: (bookingId: number) => void;
}

const BookingModals: React.FC<BookingModalsProps> = ({
	modalStates,
	selectedBookingData,
	onClose,
	onCreateBooking,
	onUpdateBooking,
	onEditFromView,
	onDeleteBooking,
}) => {
	const {
		isNewBookingModalOpen,
		isEditBookingModalOpen,
		isViewBookingModalOpen,
	} = modalStates;

	const { auth } = useContext(AuthContext);
	const [clientVehicles, setClientVehicles] = useState<any[]>([]);
	const [enrichedBookingData, setEnrichedBookingData] = useState<any>(null);
	const [loadingDetails, setLoadingDetails] = useState<boolean>(false);
	const [useWizard, setUseWizard] = useState<boolean>(true); // Domyślnie używaj wizard

	useEffect(() => {
		if (auth.roles?.[0] === "client" && auth.user_id) {
			const fetchClientVehicles = async () => {
				try {
					if (!auth.user_id) return;
					const vehicles = await vehicleService.getClientVehicles(auth.user_id);
					setClientVehicles(vehicles);
				} catch (error) {}
			};

			fetchClientVehicles();
		}
	}, [auth.roles, auth.user_id]);

	useEffect(() => {
		if (isViewBookingModalOpen && selectedBookingData) {
		}
	}, [isViewBookingModalOpen, selectedBookingData]);

	useEffect(() => {
		if (isViewBookingModalOpen && selectedBookingData) {
			const fetchAllBookingDetails = async () => {
				setLoadingDetails(true);
				try {
					const enriched = { ...selectedBookingData };

					if (typeof selectedBookingData.client === "number") {
						try {
							const clientData = await customerService.getCustomerById(
								selectedBookingData.client
							);
							enriched.client = clientData;
						} catch (err: any) {
							if (err.response) {
							}
							enriched.client = { first_name: "Unknown", last_name: "Client" };
						}
					}

					if (typeof selectedBookingData.vehicle === "number") {
						try {
							const vehicleData = await vehicleService.getVehicleById(
								selectedBookingData.vehicle
							);
							enriched.vehicle = vehicleData;
						} catch (err) {
							enriched.vehicle = { brand: "Unknown", model: "Vehicle" };
						}
					}

					if (typeof selectedBookingData.workshop === "number") {
						try {
							const workshopData = await workshopService.getWorkshopById(
								selectedBookingData.workshop
							);
							enriched.workshop = workshopData;
						} catch (err) {
							enriched.workshop = { name: "Unknown Workshop" };
						}
					}

					setEnrichedBookingData(enriched);
				} catch (err) {
					setEnrichedBookingData(null);
				} finally {
					setLoadingDetails(false);
				}
			};

			fetchAllBookingDetails();
		}
	}, [isViewBookingModalOpen, selectedBookingData]);

	useEffect(() => {
		if (isViewBookingModalOpen && selectedBookingData?.id) {
			const fetchBookingDetails = async () => {
				setLoadingDetails(true);
				try {
					const details = await bookingService.getBookingDetails(
						selectedBookingData.id
					);
					setEnrichedBookingData(details);
				} catch (error) {
					setEnrichedBookingData(null);
				} finally {
					setLoadingDetails(false);
				}
			};

			fetchBookingDetails();
		} else {
			setEnrichedBookingData(null);
		}
	}, [isViewBookingModalOpen, selectedBookingData]);

	return (
		<>
			<Dialog
				open={isNewBookingModalOpen}
				onClose={() => onClose("new")}
				maxWidth="lg"
				fullWidth
				sx={{
					"& .MuiDialog-paper": {
						backgroundColor: COLOR_SURFACE,
						color: COLOR_TEXT_PRIMARY,
						border: `1px solid rgba(255, 255, 255, 0.1)`,
						maxHeight: "90vh",
					},
				}}
			>
				<DialogTitle>
					<Box
						sx={{
							display: "flex",
							justifyContent: "space-between",
							alignItems: "center",
						}}
					>
						<Typography
							variant="h4"
							fontWeight="bold"
							color={COLOR_TEXT_PRIMARY}
						>
							Umów wizytę w warsztacie
						</Typography>
						<IconButton
							onClick={() => onClose("new")}
							sx={{ color: COLOR_TEXT_SECONDARY }}
						>
							<CloseIcon />
						</IconButton>
					</Box>
				</DialogTitle>
				<DialogContent
					className={useWizard ? "modal-scrollbar" : ""}
					sx={{
						p: 0,
						overflow: useWizard ? "auto" : "hidden",
						maxHeight: useWizard ? "calc(90vh - 120px)" : "auto",
					}}
				>
					{useWizard ? (
						<BookingWizard
							onComplete={onCreateBooking}
							onCancel={() => onClose("new")}
							userRole={auth.roles?.[0]}
							userId={auth.user_id}
						/>
					) : (
						<Box sx={{ p: 3 }}>
							<BookingForm
								id="create-booking-form"
								onSubmit={onCreateBooking}
								clientVehicles={clientVehicles}
								userRole={auth.roles?.[0]}
								userId={auth.user_id}
							/>
						</Box>
					)}
				</DialogContent>
				{!useWizard && (
					<DialogActions
						sx={{ p: 2, display: "flex", justifyContent: "flex-end", gap: 2 }}
					>
						<Button
							variant="outlined"
							onClick={() => onClose("new")}
							sx={{
								color: COLOR_TEXT_SECONDARY,
								borderColor: `rgba(255, 255, 255, 0.2)`,
								"&:hover": { borderColor: COLOR_PRIMARY, color: COLOR_PRIMARY },
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
								bgcolor: COLOR_PRIMARY,
								"&:hover": { bgcolor: `rgba(56, 130, 246, 0.8)` },
								minWidth: "150px",
							}}
						>
							CREATE BOOKING
						</Button>
					</DialogActions>
				)}
			</Dialog>

			<Dialog
				open={isEditBookingModalOpen}
				onClose={() => onClose("edit")}
				maxWidth="md"
				fullWidth
				sx={{
					"& .MuiDialog-paper": {
						backgroundColor: COLOR_SURFACE,
						color: COLOR_TEXT_PRIMARY,
						border: `1px solid rgba(255, 255, 255, 0.1)`,
					},
				}}
			>
				<DialogTitle>
					<Box
						sx={{
							display: "flex",
							justifyContent: "space-between",
							alignItems: "center",
						}}
					>
						<Typography
							variant="h4"
							fontWeight="bold"
							color={COLOR_TEXT_PRIMARY}
						>
							Edit Booking
						</Typography>
						<IconButton
							onClick={() => onClose("edit")}
							sx={{ color: COLOR_TEXT_SECONDARY }}
						>
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
							clientVehicles={clientVehicles}
							userRole={auth.roles?.[0]}
							userId={auth.user_id}
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
							color: COLOR_TEXT_SECONDARY,
							borderColor: `rgba(255, 255, 255, 0.2)`,
							"&:hover": { borderColor: COLOR_PRIMARY, color: COLOR_PRIMARY },
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
							bgcolor: COLOR_PRIMARY,
							"&:hover": { bgcolor: `rgba(56, 130, 246, 0.8)` },
							minWidth: "150px",
						}}
					>
						SAVE CHANGES
					</Button>
				</DialogActions>
			</Dialog>

			<Dialog
				open={isViewBookingModalOpen}
				onClose={() => onClose("view")}
				maxWidth="sm"
				fullWidth
				sx={{
					"& .MuiDialog-paper": {
						backgroundColor: COLOR_SURFACE,
						color: COLOR_TEXT_PRIMARY,
						border: `1px solid rgba(255, 255, 255, 0.1)`,
					},
				}}
			>
				<DialogTitle>
					<Box sx={{ display: "flex", justifyContent: "space-between" }}>
						<Typography variant="h5" component="div" color={COLOR_TEXT_PRIMARY}>
							Booking Details
						</Typography>
						<IconButton
							onClick={() => onClose("view")}
							aria-label="close"
							sx={{ color: COLOR_TEXT_SECONDARY }}
						>
							<CloseIcon />
						</IconButton>
					</Box>
				</DialogTitle>
				<DialogContent>
					{loadingDetails ? (
						<Typography
							align="center"
							sx={{ py: 3, color: COLOR_TEXT_PRIMARY }}
						>
							Loading booking details...
						</Typography>
					) : enrichedBookingData ? (
						<>
							<Box sx={{ pt: 2 }}>
								<Grid container spacing={2}>
									<Grid item xs={6}>
										<Typography
											variant="subtitle2"
											color={COLOR_TEXT_SECONDARY}
										>
											Date
										</Typography>
										<Typography variant="body1" color={COLOR_TEXT_PRIMARY}>
											{enrichedBookingData.date
												? format(
														new Date(enrichedBookingData.date),
														"dd MMM yyyy"
												  )
												: "Not specified"}
										</Typography>
									</Grid>
									<Grid item xs={6}>
										<Typography
											variant="subtitle2"
											color={COLOR_TEXT_SECONDARY}
										>
											Time
										</Typography>
										<Typography variant="body1" color={COLOR_TEXT_PRIMARY}>
											{enrichedBookingData.date
												? format(new Date(enrichedBookingData.date), "HH:mm")
												: "Not specified"}
										</Typography>
									</Grid>
									<Grid item xs={6}>
										<Typography
											variant="subtitle2"
											color={COLOR_TEXT_SECONDARY}
										>
											Client
										</Typography>
										<Typography variant="body1" color={COLOR_TEXT_PRIMARY}>
											{enrichedBookingData.client &&
											typeof enrichedBookingData.client === "object" &&
											enrichedBookingData.client.first_name
												? `${enrichedBookingData.client.first_name} ${enrichedBookingData.client.last_name}`
												: "Not specified"}
										</Typography>
									</Grid>
									<Grid item xs={6}>
										<Typography
											variant="subtitle2"
											color={COLOR_TEXT_SECONDARY}
										>
											Status
										</Typography>
										<Typography
											variant="body1"
											sx={{
												color:
													enrichedBookingData.status === "confirmed"
														? "success.main"
														: enrichedBookingData.status === "pending"
														? "warning.main"
														: enrichedBookingData.status === "in_progress"
														? "primary.main"
														: enrichedBookingData.status === "completed"
														? "info.main"
														: enrichedBookingData.status === "cancelled"
														? "error.main"
														: COLOR_TEXT_PRIMARY,
											}}
										>
											{enrichedBookingData.status
												? enrichedBookingData.status
														.replace("_", " ")
														.split(" ")
														.map(
															(word: string) =>
																word.charAt(0).toUpperCase() + word.slice(1)
														)
														.join(" ")
												: "Unknown"}
										</Typography>
									</Grid>
									<Grid item xs={12}>
										<Typography
											variant="subtitle2"
											color={COLOR_TEXT_SECONDARY}
										>
											Vehicle
										</Typography>
										<Typography variant="body1" color={COLOR_TEXT_PRIMARY}>
											{enrichedBookingData.vehicle &&
											typeof enrichedBookingData.vehicle === "object"
												? `${enrichedBookingData.vehicle.brand || ""} ${
														enrichedBookingData.vehicle.model || ""
												  } ${
														enrichedBookingData.vehicle.year
															? `(${enrichedBookingData.vehicle.year})`
															: ""
												  }`
												: "Not specified"}
										</Typography>
									</Grid>
									<Grid item xs={12}>
										<Typography
											variant="subtitle2"
											color={COLOR_TEXT_SECONDARY}
										>
											Service Type
										</Typography>
										<Typography variant="body1" color={COLOR_TEXT_PRIMARY}>
											{enrichedBookingData.booking_type
												? enrichedBookingData.booking_type
														.replace("_", " ")
														.split(" ")
														.map(
															(word: string) =>
																word.charAt(0).toUpperCase() + word.slice(1)
														)
														.join(" ")
												: "General Service"}
										</Typography>
									</Grid>
									<Grid item xs={12}>
										<Typography
											variant="subtitle2"
											color={COLOR_TEXT_SECONDARY}
										>
											Workshop
										</Typography>
										<Typography variant="body1" color={COLOR_TEXT_PRIMARY}>
											{enrichedBookingData.workshop &&
											typeof enrichedBookingData.workshop === "object"
												? enrichedBookingData.workshop.name
												: "Not specified"}
										</Typography>
									</Grid>
								</Grid>
							</Box>

							<Divider sx={{ my: 3 }} />
							<Box sx={{ display: "flex", gap: 1, mt: 2 }}>
								<Button
									variant="outlined"
									startIcon={<EditIcon />}
									onClick={() => {
										onClose("view");
										if (onEditFromView && enrichedBookingData?.id) {
											onEditFromView(enrichedBookingData.id);
										}
									}}
									sx={{
										flexGrow: 1,
										color: COLOR_TEXT_SECONDARY,
										borderColor: `rgba(255, 255, 255, 0.2)`,
										"&:hover": {
											borderColor: COLOR_PRIMARY,
											color: COLOR_PRIMARY,
										},
									}}
								>
									Edit Booking
								</Button>
								<Button
									variant="outlined"
									color="error"
									startIcon={<DeleteIcon />}
									onClick={() => {
										onClose("view");
										if (onDeleteBooking && enrichedBookingData?.id) {
											onDeleteBooking(enrichedBookingData.id);
										}
									}}
									sx={{ flexGrow: 1 }}
								>
									Cancel Booking
								</Button>
							</Box>
						</>
					) : (
						<Typography color={COLOR_TEXT_PRIMARY}>
							No booking data available
						</Typography>
					)}
				</DialogContent>
				<DialogActions sx={{ px: 3, pb: 3, justifyContent: "flex-end" }}>
					<Button
						onClick={() => onClose("view")}
						variant="contained"
						sx={{
							bgcolor: COLOR_PRIMARY,
							"&:hover": { bgcolor: `rgba(56, 130, 246, 0.8)` },
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
