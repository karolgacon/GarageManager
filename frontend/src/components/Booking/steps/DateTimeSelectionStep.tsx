import React, { useState, useEffect, useCallback } from "react";
import {
	Box,
	Grid,
	Card,
	CardContent,
	Typography,
	Button,
	CircularProgress,
	Alert,
	Chip,
	Skeleton,
} from "@mui/material";
import {
	CalendarToday as CalendarIcon,
	Schedule as TimeIcon,
	CheckCircle as CheckIcon,
} from "@mui/icons-material";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { DateCalendar } from "@mui/x-date-pickers/DateCalendar";
import { format, addDays, parseISO } from "date-fns";
import { pl } from "date-fns/locale";
import { workshopService } from "../../../api/WorkshopAPIEndpoint";
import {
	COLOR_PRIMARY,
	COLOR_SURFACE,
	COLOR_TEXT_PRIMARY,
	COLOR_TEXT_SECONDARY,
} from "../../../constants";

interface DateTimeSelectionStepProps {
	selectedWorkshop?: any;
	selectedDateTime?: string;
	onDateTimeSelect: (datetime: string) => void;
	onValidationChange: (isValid: boolean) => void;
}

const DateTimeSelectionStep: React.FC<DateTimeSelectionStepProps> = ({
	selectedWorkshop,
	selectedDateTime,
	onDateTimeSelect,
	onValidationChange,
}) => {
	const [selectedDate, setSelectedDate] = useState<Date | null>(null);
	const [selectedTime, setSelectedTime] = useState<string | null>(null);
	const [availableSlots, setAvailableSlots] = useState<string[]>([]);
	const [availableDates, setAvailableDates] = useState<string[]>([]);
	const [loading, setLoading] = useState(false);
	const [loadingSlots, setLoadingSlots] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [workingHours, setWorkingHours] = useState<{
		start: string;
		end: string;
		slot_duration: number;
	} | null>(null);

	// Zakres dat do sprawdzenia (30 dni od dzisiaj)
	const startDate = new Date();
	const endDate = addDays(new Date(), 30);

	useEffect(() => {
		if (selectedWorkshop) {
			loadAvailableDates();
		}
	}, [selectedWorkshop]);

	useEffect(() => {
		if (selectedDate && selectedWorkshop) {
			loadAvailableSlots();
		} else {
			setAvailableSlots([]);
			setSelectedTime(null);
		}
	}, [selectedDate, selectedWorkshop]);

	useEffect(() => {
		// Parsuj już wybraną datę/czas jeśli istnieje
		if (selectedDateTime) {
			const datetime = parseISO(selectedDateTime);
			setSelectedDate(datetime);
			setSelectedTime(format(datetime, "HH:mm"));
		}
	}, [selectedDateTime]);

	useEffect(() => {
		const isValid = !!(selectedDate && selectedTime && selectedWorkshop);
		onValidationChange(isValid);

		if (isValid && selectedDate && selectedTime) {
			const datetime = new Date(selectedDate);
			const [hours, minutes] = selectedTime.split(":").map(Number);
			datetime.setHours(hours, minutes);
			onDateTimeSelect(datetime.toISOString());
		}
	}, [selectedDate, selectedTime, selectedWorkshop]);

	const loadAvailableDates = async () => {
		if (!selectedWorkshop) return;

		setLoading(true);
		setError(null);

		try {
			const response = await workshopService.getAvailableDates(
				selectedWorkshop.id,
				format(startDate, "yyyy-MM-dd"),
				format(endDate, "yyyy-MM-dd")
			);
			setAvailableDates(response.available_dates);
		} catch (error) {
			setError("Nie można pobrać dostępnych dat");
			console.error("Error loading available dates:", error);
		} finally {
			setLoading(false);
		}
	};

	const loadAvailableSlots = async () => {
		if (!selectedDate || !selectedWorkshop) return;

		setLoadingSlots(true);

		try {
			const response = await workshopService.checkAvailability(
				selectedWorkshop.id,
				format(selectedDate, "yyyy-MM-dd")
			);

			if (response.available) {
				setAvailableSlots(response.slots);
				setWorkingHours(response.working_hours || null);
				setError(null);
			} else {
				setAvailableSlots([]);
				setWorkingHours(null);
				setError(response.message);
			}
		} catch (error) {
			setError("Nie można pobrać dostępnych godzin");
			console.error("Error loading available slots:", error);
			setAvailableSlots([]);
		} finally {
			setLoadingSlots(false);
		}
	};

	const isDateAvailable = (date: Date) => {
		const dateStr = format(date, "yyyy-MM-dd");
		return availableDates.includes(dateStr);
	};

	const shouldDisableDate = (date: Date) => {
		if (date < startDate || date > endDate) return true;
		if (loading) return true;
		return !isDateAvailable(date);
	};

	const handleDateSelect = (date: Date | null) => {
		setSelectedDate(date);
		setSelectedTime(null);
	};

	const handleTimeSelect = (time: string) => {
		setSelectedTime(time);
	};

	if (!selectedWorkshop) {
		return (
			<Alert severity="warning" sx={{ mt: 2 }}>
				Najpierw wybierz warsztat, aby zobaczyć dostępne terminy.
			</Alert>
		);
	}

	return (
		<Box>
			<Grid container spacing={4}>
				{/* Calendar Section */}
				<Grid item xs={12} md={6}>
					<Card
						sx={{
							backgroundColor: COLOR_SURFACE,
							border: "1px solid rgba(255, 255, 255, 0.1)",
						}}
					>
						<CardContent>
							<Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
								<CalendarIcon sx={{ color: COLOR_PRIMARY, mr: 1 }} />
								<Typography variant="h6" sx={{ color: COLOR_TEXT_PRIMARY }}>
									Wybierz datę
								</Typography>
							</Box>

							{loading ? (
								<Box sx={{ p: 2 }}>
									<Skeleton variant="rectangular" width="100%" height={300} />
								</Box>
							) : (
								<LocalizationProvider
									dateAdapter={AdapterDateFns}
									adapterLocale={pl}
								>
									<DateCalendar
										value={selectedDate}
										onChange={handleDateSelect}
										shouldDisableDate={shouldDisableDate}
										minDate={startDate}
										maxDate={endDate}
										sx={{
											width: "100%",
											"& .MuiPickersDay-root": {
												color: COLOR_TEXT_PRIMARY,
												backgroundColor: "transparent",
												fontWeight: 500,
												"&.Mui-selected": {
													backgroundColor: `${COLOR_PRIMARY} !important`,
													color: "white !important",
													fontWeight: "bold",
												},
												"&.MuiPickersDay-today": {
													backgroundColor: "rgba(56, 130, 246, 0.3) !important",
													color: COLOR_TEXT_PRIMARY,
													fontWeight: "bold",
													border: `2px solid ${COLOR_PRIMARY}`,
												},
												"&.MuiPickersDay-today.Mui-selected": {
													backgroundColor: `${COLOR_PRIMARY} !important`,
													color: "white !important",
													border: `2px solid white`,
												},
												"&:hover": {
													backgroundColor: "rgba(56, 130, 246, 0.2)",
													color: COLOR_TEXT_PRIMARY,
												},
												"&.Mui-disabled": {
													color: "rgba(255, 255, 255, 0.6)",
													backgroundColor: "rgba(255, 255, 255, 0.05)",
													opacity: 0.7,
												},
											},
											"& .MuiPickersCalendarHeader-root": {
												color: COLOR_TEXT_PRIMARY,
												marginBottom: "16px",
											},
											"& .MuiPickersCalendarHeader-label": {
												color: COLOR_TEXT_PRIMARY,
												fontSize: "1.1rem",
												fontWeight: "bold",
											},
											"& .MuiPickersArrowSwitcher-button": {
												color: COLOR_TEXT_PRIMARY,
												"&:hover": {
													backgroundColor: "rgba(56, 130, 246, 0.1)",
												},
											},
											"& .MuiDayCalendar-weekDayLabel": {
												color: COLOR_TEXT_SECONDARY,
												fontWeight: "bold",
												fontSize: "0.9rem",
											},
											"& .MuiPickersSlideTransition-root": {
												minHeight: "240px",
											},
										}}
									/>
								</LocalizationProvider>
							)}

							{selectedDate && (
								<Box
									sx={{
										mt: 2,
										p: 2,
										backgroundColor: "rgba(56, 130, 246, 0.1)",
										borderRadius: 1,
									}}
								>
									<Typography
										variant="body2"
										sx={{ color: COLOR_PRIMARY, fontWeight: 600 }}
									>
										Wybrana data:{" "}
										{format(selectedDate, "dd MMMM yyyy", { locale: pl })}
									</Typography>
								</Box>
							)}
						</CardContent>
					</Card>
				</Grid>

				{/* Time Slots Section */}
				<Grid item xs={12} md={6}>
					<Card
						sx={{
							backgroundColor: COLOR_SURFACE,
							border: "1px solid rgba(255, 255, 255, 0.1)",
						}}
					>
						<CardContent>
							<Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
								<TimeIcon sx={{ color: COLOR_PRIMARY, mr: 1 }} />
								<Typography variant="h6" sx={{ color: COLOR_TEXT_PRIMARY }}>
									Wybierz godzinę
								</Typography>
							</Box>

							{!selectedDate ? (
								<Alert severity="info">
									Wybierz datę, aby zobaczyć dostępne godziny.
								</Alert>
							) : loadingSlots ? (
								<Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
									<CircularProgress sx={{ color: COLOR_PRIMARY }} />
								</Box>
							) : error ? (
								<Alert severity="warning">{error}</Alert>
							) : availableSlots.length === 0 ? (
								<Alert severity="warning">
									Brak dostępnych terminów w wybranym dniu.
								</Alert>
							) : (
								<Box>
									{workingHours && (
										<Box
											sx={{
												mb: 3,
												p: 2,
												backgroundColor: "rgba(255, 255, 255, 0.05)",
												borderRadius: 1,
											}}
										>
											<Typography
												variant="body2"
												sx={{ color: COLOR_TEXT_SECONDARY }}
											>
												Godziny pracy: {workingHours.start} - {workingHours.end}
											</Typography>
											<Typography
												variant="caption"
												sx={{ color: COLOR_TEXT_SECONDARY }}
											>
												Czas wizyty: {workingHours.slot_duration} minut
											</Typography>
										</Box>
									)}

									<Grid container spacing={2}>
										{availableSlots.map((slot) => (
											<Grid item xs={6} sm={4} key={slot}>
												<Button
													fullWidth
													variant={
														selectedTime === slot ? "contained" : "outlined"
													}
													onClick={() => handleTimeSelect(slot)}
													sx={{
														color:
															selectedTime === slot
																? "white"
																: COLOR_TEXT_PRIMARY,
														backgroundColor:
															selectedTime === slot
																? COLOR_PRIMARY
																: "transparent",
														borderColor:
															selectedTime === slot
																? COLOR_PRIMARY
																: "rgba(255, 255, 255, 0.3)",
														"&:hover": {
															borderColor: COLOR_PRIMARY,
															backgroundColor:
																selectedTime === slot
																	? COLOR_PRIMARY
																	: "rgba(56, 130, 246, 0.1)",
														},
													}}
												>
													{slot}
												</Button>
											</Grid>
										))}
									</Grid>
								</Box>
							)}
						</CardContent>
					</Card>
				</Grid>
			</Grid>

			{/* Selection Summary */}
			{selectedDate && selectedTime && (
				<Card
					sx={{
						mt: 4,
						backgroundColor: "rgba(56, 130, 246, 0.1)",
						border: `1px solid ${COLOR_PRIMARY}`,
					}}
				>
					<CardContent>
						<Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
							<CheckIcon sx={{ color: COLOR_PRIMARY, mr: 1 }} />
							<Typography variant="h6" sx={{ color: COLOR_PRIMARY }}>
								Wybrany termin
							</Typography>
						</Box>

						<Grid container spacing={2}>
							<Grid item xs={12} sm={6}>
								<Chip
									icon={<CalendarIcon />}
									label={format(selectedDate, "dd MMMM yyyy (EEEE)", {
										locale: pl,
									})}
									sx={{
										backgroundColor: COLOR_PRIMARY,
										color: "white",
										"& .MuiChip-icon": { color: "white" },
									}}
								/>
							</Grid>
							<Grid item xs={12} sm={6}>
								<Chip
									icon={<TimeIcon />}
									label={selectedTime}
									sx={{
										backgroundColor: COLOR_PRIMARY,
										color: "white",
										"& .MuiChip-icon": { color: "white" },
									}}
								/>
							</Grid>
						</Grid>

						<Typography
							variant="body2"
							sx={{ color: COLOR_TEXT_SECONDARY, mt: 2 }}
						>
							Warsztat: {selectedWorkshop.name}
						</Typography>
					</CardContent>
				</Card>
			)}
		</Box>
	);
};

export default DateTimeSelectionStep;
