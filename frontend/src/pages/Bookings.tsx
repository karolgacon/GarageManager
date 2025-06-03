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
import { UserService } from "../api/UserAPIEndpoint"; // Import userService

// Import new components
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

	// Snackbar state
	const [snackbarState, setSnackbarState] = useState<SnackbarState>({
		open: false,
		message: "",
		severity: "info",
	});

	// View states
	const [view, setView] = useState<string>("calendar");
	const [calendarView, setCalendarView] = useState<string>("week");
	const [selectedDate, setSelectedDate] = useState<Date>(new Date());
	const [bookings, setBookings] = useState<any[]>([]);
	const [loading, setLoading] = useState<boolean>(true);
	const [error, setError] = useState<string | null>(null);
	const [bookingType, setBookingType] = useState<string>("all");

	// Admin filters
	const [workshops, setWorkshops] = useState<Workshop[]>([]);
	const [mechanics, setMechanics] = useState<Mechanic[]>([]);
	const [selectedWorkshop, setSelectedWorkshop] = useState<number | null>(null);
	const [selectedMechanic, setSelectedMechanic] = useState<number | null>(null);

	// Modal states
	const [isNewBookingModalOpen, setIsNewBookingModalOpen] = useState(false);
	const [isEditBookingModalOpen, setIsEditBookingModalOpen] = useState(false);
	const [isViewBookingModalOpen, setIsViewBookingModalOpen] = useState(false);
	const [selectedBookingId, setSelectedBookingId] = useState<number | null>(
		null
	);
	const [selectedBookingData, setSelectedBookingData] = useState<any>(null);

	// State to control visibility of bookings UI
	const [showBookingsUI, setShowBookingsUI] = useState(false);

	// Function to handle closing the snackbar
	const handleCloseSnackbar = () => {
		setSnackbarState((prev) => ({ ...prev, open: false }));
	};

	// Function to show a snackbar message
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

	// Initial workshop loading
	useEffect(() => {
		if (auth.roles?.[0] === "admin") {
			fetchWorkshops();
		} else if (auth.roles?.[0] === "owner") {
			// Zamiast korzystać z auth.workshop_id, pobierz warsztat właściciela z API
			fetchOwnerWorkshop();
		}
	}, [auth.roles]);

	// Show bookings UI after workshop selection
	useEffect(() => {
		if (auth.roles?.[0] === "admin" && selectedWorkshop) {
			fetchMechanics(selectedWorkshop);
			setShowBookingsUI(true);
		} else if (auth.roles?.[0] !== "admin") {
			setShowBookingsUI(true);
		}
	}, [selectedWorkshop, auth.roles]);

	// Load bookings when filters change
	useEffect(() => {
		// Only load bookings if auth data is ready
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
		auth.user_id, // Make sure user_id changes trigger reload
		calendarView,
		bookingType,
	]);

	// Data fetching functions
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
			// Pobierz warsztat dla zalogowanego właściciela
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

	// Add this function to your component
	const fetchUserInfo = async () => {
		try {
			const userInfo = await userService.getCurrentUser(); // You'll need to create this API service
			if (userInfo && userInfo.id) {
				// Update auth context with user ID
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

	// Add this useEffect to trigger the user info fetch when needed
	useEffect(() => {
		if (auth.roles?.[0] === "client" && !auth.user_id && !auth.isLoading) {
			console.log("Client user detected but no user_id, fetching user info");
			fetchUserInfo();
		}
	}, [auth.roles, auth.user_id, auth.isLoading]);

	// Update the loadBookings function with timeout and better error handling
	const loadBookings = async () => {
		setLoading(true);
		setError(null);

		// Create a timeout promise
		const timeoutPromise = new Promise((_, reject) =>
			setTimeout(() => reject(new Error("Request timed out")), 20000)
		);

		try {
			let bookingsData = [];

			// Ensure auth is loaded
			if (!auth || auth.isLoading) {
				console.log("Auth data still loading");
				return; // Will hit finally block
			}

			// Better client ID check for debugging
			if (auth.roles?.[0] === "client") {
				if (!auth.user_id) {
					console.error("Client user_id is missing:", auth);
					setError(
						"Your user information is not fully loaded. Please try refreshing the page."
					);
					return; // Will hit finally block
				}
				console.log("Loading bookings for client ID:", auth.user_id);
			}

			// Handle special booking types
			if (bookingType === "upcoming") {
				bookingsData = await bookingService.getUpcomingBookings();
			} else if (bookingType === "past") {
				bookingsData = await bookingService.getPastBookings();
			} else {
				let startDate, endDate;

				// Set date range based on calendar view
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

				// Get bookings based on user role
				switch (auth.roles?.[0]) {
					case "client":
						// For client case, use Promise.race to add timeout
						try {
							// Race between the API call and the timeout
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

							// Bardziej informacyjny komunikat błędu dla użytkownika
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

							// Nie wyrzucaj błędu dalej, obsłuż go tu
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
						// Użyj selectedWorkshop zamiast auth.workshop_id
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
								// Admin filters by both workshop and mechanic
								bookingsData = await bookingService.getMechanicBookings(
									selectedMechanic,
									startDate,
									endDate
								);
							} else {
								// Admin filters by workshop only
								bookingsData = await bookingService.getWorkshopBookings(
									selectedWorkshop,
									startDate,
									endDate
								);
							}
						} else {
							// Admin hasn't selected a workshop yet
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
		// Reset booking type when changing calendar view
		setBookingType("all");
	};

	const handleWorkshopChange = (event: any) => {
		const workshopId = event.target.value;
		setSelectedWorkshop(workshopId);
		setSelectedMechanic(null); // Reset mechanic when workshop changes
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

	// Handle booking actions
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
			loadBookings(); // Reload bookings after deletion
		} catch (error) {
			showSnackbar("Error cancelling booking", "error");
		}
	};

	const handleCreateBooking = async (bookingData: any) => {
		try {
			await bookingService.createBooking(bookingData);
			setIsNewBookingModalOpen(false);
			showSnackbar("Booking created successfully", "success");
			loadBookings(); // Reload bookings after creation
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
			loadBookings(); // Reload bookings after update
		} catch (error) {
			showSnackbar("Error updating booking", "error");
		}
	};

	// Helper function to close modal based on type
	const handleModalClose = (modalType: string) => {
		if (modalType === "new") {
			setIsNewBookingModalOpen(false);
		} else if (modalType === "edit") {
			setIsEditBookingModalOpen(false);
		} else if (modalType === "view") {
			setIsViewBookingModalOpen(false);
		}
	};

	// Generate days of the week for calendar header
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
			// For month view, get all days of the month
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

	// Format today's date as "Today, May 29, 2025"
	const formattedToday = format(new Date(), "MMMM dd, yyyy");

	// Add this function to your Bookings component
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
					{/* Header with title and actions */}
					<BookingHeader
						userRole={auth.roles?.[0]}
						selectedWorkshop={selectedWorkshop}
						onAddBooking={() => setIsNewBookingModalOpen(true)}
					/>

					{/* Admin Workshop Selector */}
					{auth.roles?.[0] === "admin" && (
						<WorkshopSelector
							value={selectedWorkshop}
							onChange={(workshopId) => {
								setSelectedWorkshop(workshopId);
							}}
							disabled={loading}
						/>
					)}

					{/* Mechanic Selector - only visible if a workshop is selected */}
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

					{/* Main bookings UI */}
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
							{/* Calendar view controls */}
							<BookingControls
								formattedToday={formattedToday}
								calendarView={calendarView}
								selectedDate={selectedDate}
								onCalendarViewChange={handleCalendarViewChange}
								onDateChange={handleDateChange}
							/>

							{/* Booking type tabs */}
							{(auth.roles?.[0] === "client" ||
								auth.roles?.[0] === "mechanic") && (
								<BookingTabs
									bookingType={bookingType}
									onTabChange={handleBookingTypeChange}
								/>
							)}

							{/* Date picker and filters */}
							<BookingFilters
								bookingType={bookingType}
								calendarView={calendarView}
								selectedDate={selectedDate}
								view={view}
								onDateChange={handleDateChange}
								onViewChange={handleViewChange}
								onRefresh={loadBookings}
							/>

							{/* Booking content - calendar or list view */}
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

			{/* All modals */}
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
				onEditFromView={handleEditBooking} // Dodaj tę linię
			/>
		</Mainlayout>
	);
};

export default Bookings;
