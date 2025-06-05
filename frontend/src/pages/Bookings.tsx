import React, { useState, useEffect, useContext } from "react";
import {
	Container,
	Box,
	Paper,
	Typography,
	FormControl,
	InputLabel,
	Select,
	MenuItem,
} from "@mui/material";
import { format, startOfWeek, endOfWeek, parseISO, addDays } from "date-fns";
import AuthContext from "../context/AuthProvider";
import Mainlayout from "../components/Mainlayout/Mainlayout";
import CustomSnackbar, {
	SnackbarState,
} from "../components/Mainlayout/Snackbar";
import { bookingService } from "../api/BookingAPIEndpoint";
import { workshopService } from "../api/WorkshopAPIEndpoint";
import { UserService } from "../api/UserAPIEndpoint"; 

import BookingHeader from "../components/Booking/BookingHeader";
import BookingWorkshopSelector from "../components/Booking/BookingWorkshopSelector";
import BookingControls from "../components/Booking/BookingControls";
import BookingTabs from "../components/Booking/BookingTabs";
import BookingFilters from "../components/Booking/BookingFilters";
import BookingContent from "../components/Booking/BookingContent";
import BookingModals from "../components/Booking/BookingModals";
import WorkshopSelector from "../components/Common/WorkshopSelector";

interface Workshop {
	id: number;
	name: string;
}

interface Mechanic {
	id: number;
	first_name: string;
	last_name: string;
}

const Bookings: React.FC = () => {
	const { auth, setAuth } = useContext(AuthContext);

	const [snackbarState, setSnackbarState] = useState<SnackbarState>({
		open: false,
		message: "",
		severity: "info",
	});

	const [view, setView] = useState<string>("calendar");
	const [calendarView, setCalendarView] = useState<string>("week");
	const [selectedDate, setSelectedDate] = useState<Date>(new Date());
	const [bookings, setBookings] = useState<any[]>([]);
	const [loading, setLoading] = useState<boolean>(true);
	const [error, setError] = useState<string | null>(null);
	const [bookingType, setBookingType] = useState<string>("all");

	const [workshops, setWorkshops] = useState<Workshop[]>([]);
	const [mechanics, setMechanics] = useState<Mechanic[]>([]);
	const [selectedWorkshop, setSelectedWorkshop] = useState<number | null>(null);
	const [selectedMechanic, setSelectedMechanic] = useState<number | null>(null);

	const [isNewBookingModalOpen, setIsNewBookingModalOpen] = useState(false);
	const [isEditBookingModalOpen, setIsEditBookingModalOpen] = useState(false);
	const [isViewBookingModalOpen, setIsViewBookingModalOpen] = useState(false);
	const [selectedBookingId, setSelectedBookingId] = useState<number | null>(
		null
	);
	const [selectedBookingData, setSelectedBookingData] = useState<any>(null);

	const [showBookingsUI, setShowBookingsUI] = useState(false);

	const handleCloseSnackbar = () => {
		setSnackbarState((prev) => ({ ...prev, open: false }));
	};

	const showSnackbar = (
		message: string,
		severity: "success" | "error" | "warning" | "info"
	) => {
		setSnackbarState({
			open: true,
			message,
			severity,
		});
	};

	useEffect(() => {
		if (auth.roles?.[0] === "admin") {
			fetchWorkshops();
		} else if (auth.roles?.[0] === "owner") {
			fetchOwnerWorkshop();
		}
	}, [auth.roles]);

	useEffect(() => {
		if (auth.roles?.[0] === "admin" && selectedWorkshop) {
			fetchMechanics(selectedWorkshop);
			setShowBookingsUI(true);
		} else if (auth.roles?.[0] !== "admin") {
			setShowBookingsUI(true);
		}
	}, [selectedWorkshop, auth.roles]);

	useEffect(() => {
		if (
			(auth.roles?.[0] !== "client" && auth.roles?.[0] !== "mechanic") ||
			(auth.roles?.[0] === "client" && auth.user_id) ||
			(auth.roles?.[0] === "mechanic" && auth.user_id)
		) {
			loadBookings();
		}
	}, [
		selectedDate,
		selectedWorkshop,
		selectedMechanic,
		auth.roles?.[0],
		auth.user_id, 
		calendarView,
		bookingType,
	]);

	const fetchWorkshops = async () => {
		try {
			const response = await workshopService.getAllWorkshops();
			setWorkshops(response);
		} catch (err) {
			console.error("Error fetching workshops:", err);
		}
	};

	const fetchMechanics = async (workshopId: number) => {
		try {
			const response = await workshopService.getWorkshopMechanics(workshopId);
			setMechanics(response);
		} catch (err) {
			console.error("Error fetching mechanics:", err);
		}
	};

	const fetchOwnerWorkshop = async () => {
		try {
			const workshopData = await workshopService.getCurrentUserWorkshop();
			if (workshopData) {
				setWorkshops([workshopData]);
				setSelectedWorkshop(workshopData.id);
			}
		} catch (err) {
			console.error("Error fetching owner's workshop:", err);
			showSnackbar("Could not load your workshop information", "error");
		}
	};

	const fetchUserInfo = async () => {
		try {
			const userInfo = await userService.getCurrentUser();
			if (userInfo && userInfo.id) {
				setAuth((prev) => ({
					...prev,
					user_id: userInfo.id,
				}));
			}
		} catch (error) {
			console.error("Error fetching user info:", error);
			setError(
				"Could not load your user information. Please refresh the page."
			);
		}
	};

	useEffect(() => {
		if (auth.roles?.[0] === "client" && !auth.user_id && !auth.isLoading) {
			console.log("Client user detected but no user_id, fetching user info");
			fetchUserInfo();
		}
	}, [auth.roles, auth.user_id, auth.isLoading]);

	const loadBookings = async () => {
		setLoading(true);
		setError(null);

		const timeoutPromise = new Promise((_, reject) =>
			setTimeout(() => reject(new Error("Request timed out")), 20000)
		);

		try {
			let bookingsData = [];

			if (!auth || auth.isLoading) {
				console.log("Auth data still loading");
				return; 
			}

			if (auth.roles?.[0] === "client") {
				if (!auth.user_id) {
					console.error("Client user_id is missing:", auth);
					setError(
						"Your user information is not fully loaded. Please try refreshing the page."
					);
					return; 
				}
				console.log("Loading bookings for client ID:", auth.user_id);
			}

			if (bookingType === "upcoming") {
				bookingsData = await bookingService.getUpcomingBookings();
			} else if (bookingType === "past") {
				bookingsData = await bookingService.getPastBookings();
			} else {
				let startDate, endDate;

				if (calendarView === "day") {
					startDate = format(selectedDate, "yyyy-MM-dd");
					endDate = format(selectedDate, "yyyy-MM-dd");
				} else if (calendarView === "week") {
					startDate = format(startOfWeek(selectedDate), "yyyy-MM-dd");
					endDate = format(endOfWeek(selectedDate), "yyyy-MM-dd");
				} else if (calendarView === "month") {
					const firstDayOfMonth = new Date(
						selectedDate.getFullYear(),
						selectedDate.getMonth(),
						1
					);
					const lastDayOfMonth = new Date(
						selectedDate.getFullYear(),
						selectedDate.getMonth() + 1,
						0
					);
					startDate = format(firstDayOfMonth, "yyyy-MM-dd");
					endDate = format(lastDayOfMonth, "yyyy-MM-dd");
				}

				switch (auth.roles?.[0]) {
					case "client":
						try {
							bookingsData = await Promise.race([
								bookingService.getClientBookings(
									auth.user_id,
									startDate,
									endDate
								),
								timeoutPromise,
							]);
						} catch (clientError) {
							console.error("Error loading bookings:", clientError);

							if (clientError.message === "Request timed out") {
								setError(
									"Server response took too long. Please try again later."
								);
							} else {
								setError(
									"Failed to load bookings: " +
										(clientError.message || "Unknown error")
								);
							}

							bookingsData = [];
						}
						break;
					case "mechanic":
						bookingsData = await bookingService.getMechanicBookings(
							auth.user_id,
							startDate,
							endDate
						);
						break;
					case "owner":
						if (selectedWorkshop) {
							bookingsData = await bookingService.getWorkshopBookings(
								selectedWorkshop,
								startDate,
								endDate
							);
						} else {
							bookingsData = [];
						}
						break;
					case "admin":
						if (selectedWorkshop) {
							if (selectedMechanic) {
								bookingsData = await bookingService.getMechanicBookings(
									selectedMechanic,
									startDate,
									endDate
								);
							} else {
								bookingsData = await bookingService.getWorkshopBookings(
									selectedWorkshop,
									startDate,
									endDate
								);
							}
						} else {
							bookingsData = [];
						}
						break;
					default:
						bookingsData = [];
						break;
				}
			}

			setBookings(bookingsData || []);
		} catch (err: any) {
			console.error("Error loading bookings:", err);
			setError(err.message || "Failed to load bookings");
			setBookings([]);
		} finally {
			setLoading(false);
		}
	};

	const handleDateChange = (date: Date | null) => {
		if (date) {
			setSelectedDate(date);
		}
	};

	const handleViewChange = (
		event: React.MouseEvent<HTMLElement>,
		newView: string | null
	) => {
		if (newView !== null) {
			setView(newView);
		}
	};

	const handleCalendarViewChange = (view: string) => {
		setCalendarView(view);
		setBookingType("all");
	};

	const handleWorkshopChange = (event: any) => {
		const workshopId = event.target.value;
		setSelectedWorkshop(workshopId);
		setSelectedMechanic(null);
	};

	const handleMechanicChange = (event: any) => {
		setSelectedMechanic(event.target.value);
	};

	const handleBookingTypeChange = (
		event: React.SyntheticEvent,
		newValue: string
	) => {
		setBookingType(newValue);
	};

	const handleViewBooking = async (bookingId: number) => {
		try {
			const bookingData = await bookingService.getBooking(bookingId);
			setSelectedBookingData(bookingData);
			setIsViewBookingModalOpen(true);
		} catch (error) {
			showSnackbar("Error fetching booking details", "error");
		}
	};

	const handleEditBooking = async (bookingId: number) => {
		setSelectedBookingId(bookingId);
		try {
			const bookingData = await bookingService.getBooking(bookingId);
			setSelectedBookingData(bookingData);
			setIsEditBookingModalOpen(true);
		} catch (error) {
			showSnackbar("Error fetching booking details", "error");
		}
	};

	const handleDeleteBooking = async (bookingId: number) => {
		try {
			await bookingService.deleteBooking(bookingId);
			showSnackbar("Booking cancelled successfully", "success");
			loadBookings();
		} catch (error) {
			showSnackbar("Error cancelling booking", "error");
		}
	};

	const handleCreateBooking = async (bookingData: any) => {
		try {
			await bookingService.createBooking(bookingData);
			setIsNewBookingModalOpen(false);
			showSnackbar("Booking created successfully", "success");
			loadBookings();
		} catch (error) {
			showSnackbar("Error creating booking", "error");
		}
	};

	const handleUpdateBooking = async (bookingData: any) => {
		if (!selectedBookingId) return;

		try {
			await bookingService.updateBooking(selectedBookingId, bookingData);
			setIsEditBookingModalOpen(false);
			showSnackbar("Booking updated successfully", "success");
			loadBookings(); 
		} catch (error) {
			showSnackbar("Error updating booking", "error");
		}
	};

	const handleModalClose = (modalType: string) => {
		if (modalType === "new") {
			setIsNewBookingModalOpen(false);
		} else if (modalType === "edit") {
			setIsEditBookingModalOpen(false);
		} else if (modalType === "view") {
			setIsViewBookingModalOpen(false);
		}
	};

	const getDaysForView = () => {
		if (calendarView === "day") {
			return [
				{
					date: selectedDate,
					dayName: format(selectedDate, "EEE"),
					dayNumber: format(selectedDate, "d"),
				},
			];
		} else if (calendarView === "week") {
			return Array.from({ length: 7 }, (_, i) => {
				const day = addDays(startOfWeek(selectedDate), i);
				return {
					date: day,
					dayName: format(day, "EEE"),
					dayNumber: format(day, "d"),
				};
			});
		} else {
			const firstDay = new Date(
				selectedDate.getFullYear(),
				selectedDate.getMonth(),
				1
			);
			const lastDay = new Date(
				selectedDate.getFullYear(),
				selectedDate.getMonth() + 1,
				0
			);
			const daysInMonth = lastDay.getDate();

			return Array.from({ length: daysInMonth }, (_, i) => {
				const day = new Date(
					selectedDate.getFullYear(),
					selectedDate.getMonth(),
					i + 1
				);
				return {
					date: day,
					dayName: format(day, "EEE"),
					dayNumber: format(day, "d"),
				};
			});
		}
	};

	const daysOfWeek = getDaysForView();

	const formattedToday = format(new Date(), "MMMM dd, yyyy");

	const handleForceLoadingComplete = () => {
		setLoading(false);
		setError("Loading took too long. Please try refreshing the page.");
	};

	return (
		<Mainlayout>
			<CustomSnackbar
				snackbarState={snackbarState}
				onClose={handleCloseSnackbar}
			/>
			<Container maxWidth="xl" sx={{ py: 4 }}>
				<Box sx={{ mb: 4, bgcolor: "#f0f3f5", borderRadius: 2, p: 4 }}>
					<BookingHeader
						userRole={auth.roles?.[0]}
						selectedWorkshop={selectedWorkshop}
						onAddBooking={() => setIsNewBookingModalOpen(true)}
					/>

					{auth.roles?.[0] === "admin" && (
						<WorkshopSelector
							value={selectedWorkshop}
							onChange={(workshopId) => {
								setSelectedWorkshop(workshopId);
							}}
							disabled={loading}
						/>
					)}

					{auth.roles?.[0] === "admin" && selectedWorkshop && (
						<Paper sx={{ p: 3, mb: 3, borderRadius: 2 }}>
							<Typography variant="h6" fontWeight="bold" gutterBottom>
								Select Mechanic (Optional)
							</Typography>
							<Box sx={{ width: "100%" }}>
								<FormControl fullWidth size="small">
									<InputLabel id="mechanic-select-label">Mechanic</InputLabel>
									<Select
										labelId="mechanic-select-label"
										id="mechanic-select"
										value={selectedMechanic || ""}
										label="Mechanic"
										onChange={handleMechanicChange}
										disabled={loading}
									>
										<MenuItem value="">
											<em>All Mechanics</em>
										</MenuItem>
										{mechanics.map((mechanic) => (
											<MenuItem key={mechanic.id} value={mechanic.id}>
												{mechanic.first_name} {mechanic.last_name}
											</MenuItem>
										))}
									</Select>
								</FormControl>
							</Box>
						</Paper>
					)}

					{showBookingsUI && (
						<Paper
							elevation={0}
							sx={{
								borderRadius: 2,
								overflow: "hidden",
								mb: 3,
								bgcolor: "#ffffff",
							}}
						>
							<BookingControls
								formattedToday={formattedToday}
								calendarView={calendarView}
								selectedDate={selectedDate}
								onCalendarViewChange={handleCalendarViewChange}
								onDateChange={handleDateChange}
							/>

							{(auth.roles?.[0] === "client" ||
								auth.roles?.[0] === "mechanic") && (
								<BookingTabs
									bookingType={bookingType}
									onTabChange={handleBookingTypeChange}
								/>
							)}

							<BookingFilters
								bookingType={bookingType}
								calendarView={calendarView}
								selectedDate={selectedDate}
								view={view}
								onDateChange={handleDateChange}
								onViewChange={handleViewChange}
								onRefresh={loadBookings}
							/>

							<BookingContent
								loading={loading}
								error={error}
								view={view}
								bookingType={bookingType}
								bookings={bookings}
								daysOfWeek={daysOfWeek}
								userRole={auth.roles?.[0]}
								calendarView={calendarView}
								selectedDate={selectedDate}
								onView={handleViewBooking}
								onEdit={handleEditBooking}
								onDelete={handleDeleteBooking}
								onForceLoadingComplete={handleForceLoadingComplete}
								onRefresh={loadBookings}
							/>
						</Paper>
					)}
				</Box>
			</Container>

			<BookingModals
				modalStates={{
					isNewBookingModalOpen,
					isEditBookingModalOpen,
					isViewBookingModalOpen,
				}}
				selectedBookingData={selectedBookingData}
				onClose={handleModalClose}
				onCreateBooking={handleCreateBooking}
				onUpdateBooking={handleUpdateBooking}
				onEditFromView={handleEditBooking} 
			/>
		</Mainlayout>
	);
};

export default Bookings;
