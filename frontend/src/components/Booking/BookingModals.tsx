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
	FormControl,
	InputLabel,
	Select,
	MenuItem,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { format, parseISO } from "date-fns";
import BookingForm from "./BookingForm";
import AuthContext from "../../context/AuthProvider";
import { vehicleService } from "../../api/VehicleAPIEndpoint";
import { customerService } from "../../api/CustomerAPIEndpoint";
import { workshopService } from "../../api/WorkshopAPIEndpoint";
import { bookingService } from "../../api/BookingAPIEndpoint";

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
	onEditFromView?: (bookingId: number) => void; // Dodaj ten prop
	onDeleteBooking?: (bookingId: number) => void; // Dodaj ten prop
}

const BookingModals: React.FC<BookingModalsProps> = ({
	modalStates,
	selectedBookingData,
	onClose,
	onCreateBooking,
	onUpdateBooking,
	onEditFromView, // Dodaj ten parametr
	onDeleteBooking, // Dodaj ten parametr
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

	useEffect(() => {
		// Only fetch vehicles for clients
		if (auth.roles?.[0] === "client" && auth.user_id) {
			const fetchClientVehicles = async () => {
				try {
					const vehicles = await vehicleService.getClientVehicles(auth.user_id);
					setClientVehicles(vehicles);
				} catch (error) {
					console.error("Error fetching client vehicles:", error);
				}
			};

			fetchClientVehicles();
		}
	}, [auth.roles, auth.user_id]);

	// Dodaj console.log aby zdiagnozować problem
	useEffect(() => {
		if (isViewBookingModalOpen && selectedBookingData) {
			console.log("Booking data:", selectedBookingData);
		}
	}, [isViewBookingModalOpen, selectedBookingData]);

	// 2. Dodaj nowy stan do przechowywania wzbogaconych danych
	useEffect(() => {
		if (isViewBookingModalOpen && selectedBookingData) {
			console.log("Original booking data:", selectedBookingData);

			// 3. Dodaj funkcję pobierającą wszystkie potrzebne dane
			const fetchAllBookingDetails = async () => {
				setLoadingDetails(true);
				try {
					// Tworzymy kopię oryginalnych danych
					const enriched = { ...selectedBookingData };
					console.log(
						"Starting data enrichment for booking:",
						selectedBookingData.id
					);

					// Pobierz dane klienta
					if (typeof selectedBookingData.client === "number") {
						try {
							console.log(
								"Fetching client data for ID:",
								selectedBookingData.client
							);
							// WAŻNE: Sprawdź czy endpoint jest poprawny!
							const clientData = await customerService.getCustomerById(
								selectedBookingData.client
							);
							console.log("Raw client API response:", clientData);
							enriched.client = clientData;
						} catch (err) {
							console.error("Error loading client data:", err);
							// Pokaż więcej informacji o błędzie
							if (err.response) {
								console.error("API error details:", err.response.data);
								console.error("API error status:", err.response.status);
							}
							enriched.client = { first_name: "Unknown", last_name: "Client" };
						}
					}

					// Pobierz dane pojazdu
					if (typeof selectedBookingData.vehicle === "number") {
						try {
							const vehicleData = await vehicleService.getVehicleById(
								selectedBookingData.vehicle
							);
							enriched.vehicle = vehicleData;
							console.log("Vehicle data loaded:", vehicleData);
						} catch (err) {
							console.error("Error loading vehicle data:", err);
							enriched.vehicle = { brand: "Unknown", model: "Vehicle" };
						}
					}

					// Pobierz dane warsztatu
					if (typeof selectedBookingData.workshop === "number") {
						try {
							const workshopData = await workshopService.getWorkshopById(
								selectedBookingData.workshop
							);
							enriched.workshop = workshopData;
							console.log("Workshop data loaded:", workshopData);
						} catch (err) {
							console.error("Error loading workshop data:", err);
							enriched.workshop = { name: "Unknown Workshop" };
						}
					}

					console.log("Enriched booking data:", enriched);
					setEnrichedBookingData(enriched);
				} catch (err) {
					console.error("Error enriching booking data:", err);
				} finally {
					setLoadingDetails(false);
				}
			};

			fetchAllBookingDetails();
		}
	}, [isViewBookingModalOpen, selectedBookingData]);

	// Dodaj ten useEffect:
	useEffect(() => {
		if (isViewBookingModalOpen && selectedBookingData?.id) {
			const fetchBookingDetails = async () => {
				setLoadingDetails(true);
				try {
					// Użyj nowej funkcji do pobrania pełnych danych
					const details = await bookingService.getBookingDetails(
						selectedBookingData.id
					);
					console.log("Full booking details:", details);
					setEnrichedBookingData(details);
				} catch (error) {
					console.error("Error loading booking details:", error);
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
						<Typography variant="h4" fontWeight="bold">
							Create New Booking
						</Typography>
						<IconButton onClick={() => onClose("new")}>
							<CloseIcon />
						</IconButton>
					</Box>
				</DialogTitle>
				<DialogContent>
					<BookingForm
						id="create-booking-form"
						onSubmit={onCreateBooking}
						clientVehicles={clientVehicles} // Pass the vehicles we already fetched
						userRole={auth.roles?.[0]}
						userId={auth.user_id}
					/>
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
						<Typography variant="h4" fontWeight="bold">
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
							clientVehicles={clientVehicles} // Pass the vehicles we already fetched
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
					{/* Poprawiona hierarchia nagłówków */}
					<Box sx={{ display: "flex", justifyContent: "space-between" }}>
						<Typography variant="h5" component="div">
							Booking Details
						</Typography>
						<IconButton onClick={() => onClose("view")} aria-label="close">
							<CloseIcon />
						</IconButton>
					</Box>
				</DialogTitle>
				<DialogContent>
					{loadingDetails ? (
						<Typography align="center" sx={{ py: 3 }}>
							Loading booking details...
						</Typography>
					) : enrichedBookingData ? (
						<>
							<Box sx={{ pt: 2 }}>
								<Grid container spacing={2}>
									<Grid item xs={6}>
										<Typography variant="subtitle2" color="text.secondary">
											Date
										</Typography>
										<Typography variant="body1">
											{enrichedBookingData.date
												? format(
														new Date(enrichedBookingData.date),
														"dd MMM yyyy"
												  )
												: "Not specified"}
										</Typography>
									</Grid>
									<Grid item xs={6}>
										<Typography variant="subtitle2" color="text.secondary">
											Time
										</Typography>
										<Typography variant="body1">
											{enrichedBookingData.date
												? format(new Date(enrichedBookingData.date), "HH:mm")
												: "Not specified"}
										</Typography>
									</Grid>
									<Grid item xs={6}>
										<Typography variant="subtitle2" color="text.secondary">
											Client
										</Typography>
										<Typography variant="body1">
											{enrichedBookingData.client &&
											typeof enrichedBookingData.client === "object" &&
											enrichedBookingData.client.first_name
												? `${enrichedBookingData.client.first_name} ${enrichedBookingData.client.last_name}`
												: "Not specified"}
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
														: "text.primary",
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
										<Typography variant="subtitle2" color="text.secondary">
											Vehicle
										</Typography>
										<Typography variant="body1">
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
										<Typography variant="subtitle2" color="text.secondary">
											Service Type
										</Typography>
										<Typography variant="body1">
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
										<Typography variant="subtitle2" color="text.secondary">
											Workshop
										</Typography>
										<Typography variant="body1">
											{enrichedBookingData.workshop &&
											typeof enrichedBookingData.workshop === "object"
												? enrichedBookingData.workshop.name
												: "Not specified"}
										</Typography>
									</Grid>

									{/* Pozostałe pola... */}
								</Grid>
							</Box>

							{/* Action buttons section */}
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
						<Typography>No booking data available</Typography>
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
