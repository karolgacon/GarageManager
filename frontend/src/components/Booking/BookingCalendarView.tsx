import React from "react";
import {
	Box,
	Typography,
	Avatar,
	Tooltip,
	Paper,
	IconButton,
} from "@mui/material";
import DirectionsCarIcon from "@mui/icons-material/DirectionsCar";
import {
	Info as InfoIcon,
	Edit as EditIcon,
	Delete as DeleteIcon,
} from "@mui/icons-material";
import { format, startOfWeek, endOfWeek, addDays } from "date-fns";

interface BookingCalendarViewProps {
	bookings: any[];
	daysOfWeek: {
		date: Date;
		dayName: string;
		dayNumber: string;
	}[];
	userRole: string;
	calendarView: string;
	onView: (id: number) => void;
	onEdit: (id: number) => void;
	onDelete: (id: number) => void;
}

const BookingCalendarView: React.FC<BookingCalendarViewProps> = ({
	bookings,
	daysOfWeek,
	userRole,
	calendarView,
	onView,
	onEdit,
	onDelete,
}) => {
	// Generate time slots (7AM to 7PM)
	const timeSlots = [
		"07:00 am",
		"08:00 am",
		"09:00 am",
		"10:00 am",
		"11:00 am",
		"12:00 pm",
		"01:00 pm",
		"02:00 pm",
		"03:00 pm",
		"04:00 pm",
		"05:00 pm",
		"06:00 pm",
		"07:00 pm",
	];

	// Funkcja renderująca tytuł kalendarza
	const renderCalendarTitle = () => {
		if (calendarView === "day" && daysOfWeek.length > 0) {
			return (
				<Typography variant="h6" sx={{ p: 2, fontWeight: 500 }}>
					{format(daysOfWeek[0].date, "EEEE, MMMM d, yyyy")}
				</Typography>
			);
		} else if (calendarView === "week" && daysOfWeek.length > 0) {
			const startDate = daysOfWeek[0].date;
			const endDate = daysOfWeek[daysOfWeek.length - 1].date;
			return (
				<Typography variant="h6" sx={{ p: 2, fontWeight: 500 }}>
					{format(startDate, "MMMM d")} - {format(endDate, "MMMM d, yyyy")}
				</Typography>
			);
		} else if (calendarView === "month" && daysOfWeek.length > 0) {
			return (
				<Typography variant="h6" sx={{ p: 2, fontWeight: 500 }}>
					{format(daysOfWeek[0].date, "MMMM yyyy")}
				</Typography>
			);
		}
		return null;
	};

	// Helper to get bookings for a specific time and day
	const getBookingsForTimeAndDay = (timeStr: string, date: Date) => {
		const hour = parseInt(timeStr.split(":")[0]);
		const isPm = timeStr.includes("pm");
		const adjustedHour =
			isPm && hour !== 12 ? hour + 12 : !isPm && hour === 12 ? 0 : hour;
		const formattedDate = format(date, "yyyy-MM-dd");

		return bookings.filter((booking) => {
			if (!booking.date) return false;

			// Utwórz datę ze string'a i ustaw czas lokalny
			const bookingDate = new Date(booking.date);
			const bookingDateStr = format(bookingDate, "yyyy-MM-dd");
			const bookingHour = bookingDate.getHours();

			return bookingDateStr === formattedDate && bookingHour === adjustedHour;
		});
	};

	if (bookings.length === 0 && userRole === "admin") {
		return (
			<Box sx={{ textAlign: "center", py: 5 }}>
				<Typography variant="body1" color="text.secondary" fontWeight={400}>
					Select a workshop to view bookings
				</Typography>
			</Box>
		);
	}

	if (bookings.length === 0) {
		return (
			<Box sx={{ textAlign: "center", py: 5 }}>
				<Typography variant="body1" color="text.secondary" fontWeight={400}>
					No bookings found for this period
				</Typography>
			</Box>
		);
	}

	// W funkcji renderującej widok miesiąca:
	const renderMonthCalendar = () => {
		// Najpierw sprawdzamy, na jaki dzień tygodnia przypada pierwszy dzień
		// w zestawie daysOfWeek i odpowiednio układamy grid

		// Potrzebujemy wiedzieć, jaki dzień tygodnia jest pierwszy w naszym zestawie
		const firstDayOfWeekIndex = daysOfWeek[0].date.getDay(); // 0 = niedziela, 1 = poniedziałek, itd.

		// Podziel dni na tygodnie, zaczynając od niedzieli
		const weeks = [];
		let currentWeek = Array(firstDayOfWeekIndex).fill(null); // Wypełnij pustymi miejscami dni przed pierwszym dniem

		daysOfWeek.forEach((day) => {
			const dayOfWeek = day.date.getDay(); // 0 = niedziela, 1 = poniedziałek, itd.

			// Jeśli to niedziela, a mamy już jakieś dni w obecnym tygodniie,
			// dodaj aktualny tydzień do tablicy tygodni i zacznij nowy tydzień
			if (dayOfWeek === 0 && currentWeek.length > 0) {
				// Uzupełnij brakujące dni do końca tygodnia
				while (currentWeek.length < 7) {
					currentWeek.push(null);
				}
				weeks.push(currentWeek);
				currentWeek = [];
			}

			// Dodaj dzień do obecnego tygodnia
			currentWeek.push(day);
		});

		// Dodaj ostatni tydzień (jeśli jest niepełny, uzupełnij nullami)
		if (currentWeek.length > 0) {
			while (currentWeek.length < 7) {
				currentWeek.push(null);
			}
			weeks.push(currentWeek);
		}

		return (
			<Box sx={{ width: "100%", p: 1 }}>
				{/* Nagłówki dni tygodnia */}
				<Box sx={{ display: "flex", mb: 1 }}>
					{["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
						<Box
							key={day}
							sx={{
								flex: "1 0 14.28%", // Dokładnie 1/7 szerokości (z niewielkim marginesem bezpieczeństwa)
								maxWidth: "14.28%", // Maksymalna szerokość
								textAlign: "center",
								p: 1,
								fontWeight: "bold",
								bgcolor: "#f5f5f5",
								border: "1px solid #e0e0e0",
								borderBottom: "2px solid #e0e0e0",
							}}
						>
							<Typography variant="subtitle2">{day}</Typography>
						</Box>
					))}
				</Box>

				{/* Siatka kalendarza */}
				{weeks.map((week, weekIndex) => (
					<Box key={weekIndex} sx={{ display: "flex", mb: 1 }}>
						{week.map((day, dayIndex) => {
							if (day === null) {
								// Pusta komórka dla dni poza miesiącem
								return (
									<Box
										key={`empty-${dayIndex}`}
										sx={{
											flex: "1 0 14.28%",
											maxWidth: "14.28%",
											height: 120,
											border: "1px solid #e0e0e0",
											bgcolor: "#f5f5f5",
										}}
									/>
								);
							}

							const isToday =
								format(day.date, "yyyy-MM-dd") ===
								format(new Date(), "yyyy-MM-dd");
							const isWeekend = dayIndex === 0 || dayIndex === 6; // niedziela lub sobota

							const dayBookings = bookings.filter((booking) => {
								const bookingDate = format(
									new Date(booking.date),
									"yyyy-MM-dd"
								);
								const currentDate = format(day.date, "yyyy-MM-dd");
								return bookingDate === currentDate;
							});

							return (
								<Box
									key={dayIndex}
									sx={{
										flex: "1 0 14.28%",
										maxWidth: "14.28%",
										height: 120,
										border: "1px solid #e0e0e0",
										p: 1,
										overflow: "auto",
										bgcolor: isToday
											? "rgba(255,60,78,0.05)"
											: isWeekend
											? "rgba(0,0,0,0.02)"
											: "white",
										position: "relative",
										"&:hover": {
											bgcolor: "rgba(0,0,0,0.02)",
										},
									}}
								>
									<Typography
										variant="caption"
										sx={{
											display: "block",
											textAlign: "right",
											fontWeight: isToday ? "bold" : "normal",
											color: isToday ? "#ff3c4e" : "text.secondary",
											mb: 1,
										}}
									>
										{day.dayNumber}
									</Typography>

									<Box
										sx={{ maxHeight: "calc(100% - 24px)", overflow: "auto" }}
									>
										{dayBookings.slice(0, 3).map((booking) => (
											<Paper
												key={booking.id}
												elevation={0}
												sx={{
													p: 0.5,
													mb: 0.5,
													bgcolor: "#ff3c4e",
													color: "white",
													borderRadius: 1,
													fontSize: "0.75rem",
													whiteSpace: "nowrap",
													overflow: "hidden",
													textOverflow: "ellipsis",
													cursor: "pointer",
													"&:hover": {
														boxShadow: 1,
														bgcolor: "#e0354b",
													},
													display: "flex",
													alignItems: "center",
												}}
												onClick={() => onView(booking.id)}
											>
												<Avatar
													sx={{
														width: 16,
														height: 16,
														bgcolor: "rgba(255,255,255,0.3)",
														mr: 0.5,
														fontSize: "0.7rem",
													}}
												>
													<DirectionsCarIcon sx={{ fontSize: 10 }} />
												</Avatar>
												<Typography
													variant="caption"
													sx={{
														fontSize: "0.7rem",
														flexGrow: 1,
														overflow: "hidden",
														textOverflow: "ellipsis",
													}}
												>
													{format(new Date(booking.date), "HH:mm")} -{" "}
													{booking.service_type || "Service"}
												</Typography>
											</Paper>
										))}

										{dayBookings.length > 3 && (
											<Typography
												variant="caption"
												sx={{
													color: "text.secondary",
													display: "block",
													mt: 0.5,
												}}
											>
												+{dayBookings.length - 3} more
											</Typography>
										)}
									</Box>
								</Box>
							);
						})}

						{/* Dodaj puste komórki, jeśli tydzień ma mniej niż 7 dni */}
						{Array.from({ length: Math.max(0, 7 - week.length) }).map(
							(_, i) => (
								<Box
									key={`empty-${i}`}
									sx={{
										flex: "1 0 14.28%", // Dokładnie 1/7 szerokości
										maxWidth: "14.28%", // Maksymalna szerokość
										height: 120,
										border: "1px solid #e0e0e0",
										bgcolor: "#f5f5f5",
									}}
								/>
							)
						)}
					</Box>
				))}
			</Box>
		);
	};

	// Usunąć podwójną implementację widoku miesiąca i wykorzystać funkcję renderMonthCalendar

	if (calendarView === "month" && daysOfWeek.length > 0) {
		return (
			<Box sx={{ width: "100%" }}>
				<Box
					sx={{
						borderBottom: "1px solid #e0e0e0",
						bgcolor: "#f8f8f8",
						py: 2,
						px: 3,
					}}
				>
					{renderCalendarTitle()}
				</Box>
				{renderMonthCalendar()}
			</Box>
		);
	}

	return (
		<Box
			sx={{
				display: "flex",
				flexDirection: "column",
				width: "100%",
				overflowX: "auto",
			}}
		>
			{/* Dodano renderCalendarTitle dla widoków dnia i tygodnia */}
			<Box
				sx={{
					borderBottom: "1px solid #e0e0e0",
					bgcolor: "#f8f8f8",
					py: 2,
					px: 3,
				}}
			>
				{renderCalendarTitle()}
			</Box>

			{/* Header row with days */}
			<Box sx={{ display: "flex", borderBottom: "1px solid #eeeeee" }}>
				{/* Empty cell for time column */}
				<Box
					sx={{
						width: 80, // Zmniejszone z 100
						flexShrink: 0,
						p: 1.5, // Zmniejszone z 2
						display: "flex",
						alignItems: "center",
						justifyContent: "center",
						borderRight: "1px solid #eeeeee",
					}}
				></Box>

				{/* Day columns */}
				{daysOfWeek.map((day, index) => (
					<Box
						key={index}
						sx={{
							flex: 1,
							p: 1,
							textAlign: "center",
							borderRight:
								index < daysOfWeek.length - 1 ? "1px solid #eeeeee" : "none",
							bgcolor:
								format(day.date, "yyyy-MM-dd") ===
								format(new Date(), "yyyy-MM-dd")
									? "rgba(255,60,78,0.05)"
									: "transparent",
						}}
					>
						<Typography
							variant="subtitle2"
							sx={{
								color: "text.secondary",
								fontWeight: 500,
								fontSize: "0.85rem",
							}}
						>
							{day.dayName}
						</Typography>
						<Typography variant="h6" fontWeight="medium">
							{day.dayNumber}
						</Typography>
					</Box>
				))}
			</Box>

			{/* Time rows */}
			{timeSlots.map((time, timeIndex) => (
				<Box
					key={time}
					sx={{
						display: "flex",
						borderBottom:
							timeIndex < timeSlots.length - 1 ? "1px solid #eeeeee" : "none",
						height: 80,
					}}
				>
					{/* Time column */}
					<Box
						sx={{
							width: 80, // Zmniejszone z 100
							flexShrink: 0,
							p: 1.5, // Zmniejszone z 2
							display: "flex",
							alignItems: "center",
							justifyContent: "center",
							borderRight: "1px solid #eeeeee",
						}}
					>
						<Typography
							variant="body2"
							sx={{
								color: "text.secondary",
								fontWeight: 400,
								fontSize: "0.75rem", // Zmniejszone z 0.8rem
							}}
						>
							{time}
						</Typography>
					</Box>

					{/* Day columns with bookings */}
					{daysOfWeek.map((day, dayIndex) => {
						const dayBookings = getBookingsForTimeAndDay(time, day.date);

						return (
							<Box
								key={dayIndex}
								sx={{
									flex: 1,
									p: 0.5,
									position: "relative",
									borderRight:
										dayIndex < daysOfWeek.length - 1
											? "1px solid #eeeeee"
											: "none",
									bgcolor:
										format(day.date, "yyyy-MM-dd") ===
										format(new Date(), "yyyy-MM-dd")
											? "rgba(255,60,78,0.05)"
											: "transparent",
								}}
							>
								{dayBookings.map((booking) => (
									<Paper
										key={booking.id}
										sx={{
											p: 0.75,
											height: "100%",
											bgcolor: "#ff3c4e",
											color: "white",
											borderRadius: 1,
											boxShadow: 1,
											display: "flex",
											flexDirection: "column",
											justifyContent: "center",
											cursor: "pointer",
											overflow: "hidden", // Zapobiega wystawaniu treści
											width: "100%", // Ustaw pełną szerokość
											"&:hover": {
												boxShadow: 3,
												bgcolor: "#e0354b",
											},
										}}
										onClick={() => onView(booking.id)}
									>
										{/* Jedna linia z ikoną i tytułem - zmniejszone marginesy i padding */}
										<Box
											sx={{
												display: "flex",
												alignItems: "center",
												width: "100%",
												overflow: "hidden",
											}}
										>
											<Avatar
												sx={{
													width: 18,
													height: 18,
													bgcolor: "rgba(255,255,255,0.3)",
													mr: 0.5,
													minWidth: 18, // Zapobiega zmniejszeniu ikony
												}}
											>
												<DirectionsCarIcon sx={{ fontSize: 12 }} />
											</Avatar>
											<Typography
												variant="body2"
												sx={{
													fontWeight: 500,
													fontSize: "0.8rem",
													whiteSpace: "nowrap",
													overflow: "hidden",
													textOverflow: "ellipsis",
													flexGrow: 1,
													flexShrink: 1, // Pozwala na zmniejszenie, jeśli potrzeba
												}}
											>
												{booking.service_type || "Vehicle Maintenance"}
											</Typography>
										</Box>

										{/* Drugi wiersz z nazwiskiem klienta - tylko jeśli jest miejsce */}
										{booking.client && (
											<Typography
												variant="caption"
												sx={{
													pl: 3,
													whiteSpace: "nowrap",
													overflow: "hidden",
													textOverflow: "ellipsis",
													fontWeight: 400,
													fontSize: "0.65rem",
													opacity: 0.9,
												}}
											>
												{booking.client?.first_name} {booking.client?.last_name}
											</Typography>
										)}
									</Paper>
								))}
							</Box>
						);
					})}
				</Box>
			))}
		</Box>
	);
};

export default BookingCalendarView;
