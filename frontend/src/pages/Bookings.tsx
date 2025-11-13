import React, { useState, useEffect, useContext } from "react";
import { Container, Box } from "@mui/material";
import { format, startOfWeek, endOfWeek, addDays } from "date-fns";
import AuthContext from "../context/AuthProvider";
import Mainlayout from "../components/Mainlayout/Mainlayout";
import CustomSnackbar, {
	SnackbarState,
} from "../components/Mainlayout/Snackbar";
import { bookingService } from "../api/BookingAPIEndpoint";
import { workshopService } from "../api/WorkshopAPIEndpoint";
import BookingHeader from "../components/Booking/BookingHeader";
import BookingControls from "../components/Booking/BookingControls";
import BookingTabs from "../components/Booking/BookingTabs";
import BookingFilters from "../components/Booking/BookingFilters";
import BookingContent from "../components/Booking/BookingContent";
import BookingModals from "../components/Booking/BookingModals";
import WorkshopSelector from "../components/common/WorkshopSelector";

const Bookings: React.FC = () => {
	const { auth } = useContext(AuthContext);

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

	const [selectedWorkshop, setSelectedWorkshop] = useState<number | null>(null);

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
		auth.roles?.[0],
		auth.user_id,
		calendarView,
		bookingType,
	]);

	const fetchWorkshops = async () => {
		try {
			await workshopService.getAllWorkshops();
			// Workshop list functionality can be added here if needed
		} catch (err) {}
	};

	const fetchOwnerWorkshop = async () => {
		try {
			const workshopData = await workshopService.getCurrentUserWorkshop();
			if (workshopData) {
				setSelectedWorkshop(workshopData.id);
			}
		} catch (err) {
			showSnackbar("Could not load your workshop information", "error");
		}
	};

	const fetchUserInfo = async () => {
		// User info functionality can be implemented when UserService is available
		setError("Could not load your user information. Please refresh the page.");
	};

	useEffect(() => {
		if (auth.roles?.[0] === "client" && !auth.user_id && !auth.isLoading) {
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
				return;
			}

			if (auth.roles?.[0] === "client") {
				if (!auth.user_id) {
					setError(
						"Your user information is not fully loaded. Please try refreshing the page."
					);
					return;
				}
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
						} catch (clientError: any) {
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
						if (auth.user_id) {
							bookingsData = await bookingService.getMechanicBookings(
								auth.user_id,
								startDate,
								endDate
							);
						}
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
							bookingsData = await bookingService.getWorkshopBookings(
								selectedWorkshop,
								startDate,
								endDate
							);
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
		_event: React.MouseEvent<HTMLElement>,
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

	const handleBookingTypeChange = (
		_event: React.SyntheticEvent,
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

	const handleStatusChange = async (
		bookingId: number,
		newStatus: "scheduled" | "in_progress" | "completed"
	) => {
		try {
			await bookingService.updateBookingStatus(bookingId, newStatus);
			showSnackbar("Status updated successfully", "success");
			loadBookings();
		} catch (error) {
			showSnackbar("Error updating status", "error");
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
				<BookingHeader
					userRole={auth.roles?.[0] || ""}
					selectedWorkshop={selectedWorkshop}
					onAddBooking={() => setIsNewBookingModalOpen(true)}
				/>

				{auth.roles?.[0] === "admin" && (
					<Box sx={{ mb: 4 }}>
						<WorkshopSelector
							value={selectedWorkshop}
							onChange={(workshopId) => {
								setSelectedWorkshop(workshopId);
							}}
							disabled={loading}
						/>
					</Box>
				)}

				{showBookingsUI && (
					<Box sx={{ mt: 2 }}>
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
							userRole={auth.roles?.[0] || ""}
							calendarView={calendarView}
							selectedDate={selectedDate}
							onView={handleViewBooking}
							onEdit={handleEditBooking}
							onDelete={handleDeleteBooking}
							onStatusChange={handleStatusChange}
							onForceLoadingComplete={handleForceLoadingComplete}
							onRefresh={loadBookings}
						/>
					</Box>
				)}
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
