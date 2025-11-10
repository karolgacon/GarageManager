import React from "react";
import {
	Box,
	Typography,
	ToggleButtonGroup,
	ToggleButton,
	IconButton,
	useTheme,
	useMediaQuery,
} from "@mui/material";
import {
	CalendarMonth,
	ViewWeek,
	ViewDay,
	ChevronLeft,
	ChevronRight,
} from "@mui/icons-material";
import { addDays, addWeeks, addMonths, format } from "date-fns";
import {
	COLOR_PRIMARY,
	COLOR_SURFACE,
	COLOR_TEXT_PRIMARY,
	COLOR_TEXT_SECONDARY,
} from "../../constants";

interface BookingControlsProps {
	formattedToday: string;
	calendarView: string;
	selectedDate: Date;
	onCalendarViewChange: (view: string) => void;
	onDateChange: (date: Date) => void;
}

const BookingControls: React.FC<BookingControlsProps> = ({
	formattedToday,
	calendarView,
	selectedDate,
	onCalendarViewChange,
	onDateChange,
}) => {
	const theme = useTheme();
	const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

	const handleNavigatePrevious = () => {
		if (calendarView === "day") {
			onDateChange(addDays(selectedDate, -1));
		} else if (calendarView === "week") {
			onDateChange(addWeeks(selectedDate, -1));
		} else if (calendarView === "month") {
			onDateChange(addMonths(selectedDate, -1));
		}
	};

	const handleNavigateNext = () => {
		if (calendarView === "day") {
			onDateChange(addDays(selectedDate, 1));
		} else if (calendarView === "week") {
			onDateChange(addWeeks(selectedDate, 1));
		} else if (calendarView === "month") {
			onDateChange(addMonths(selectedDate, 1));
		}
	};

	const getFormattedPeriod = () => {
		if (calendarView === "day") {
			return format(selectedDate, "MMMM d, yyyy");
		} else if (calendarView === "week") {
			const startOfWeekDate = addDays(selectedDate, -selectedDate.getDay());
			const endOfWeekDate = addDays(startOfWeekDate, 6);
			return `${format(startOfWeekDate, "MMM d")} - ${format(
				endOfWeekDate,
				"MMM d, yyyy"
			)}`;
		} else {
			return format(selectedDate, "MMMM yyyy");
		}
	};

	const handleViewChange = (newView: string) => {
		if (newView === calendarView) return;

		onCalendarViewChange(newView);
	};

	return (
		<Box
			sx={{
				display: "flex",
				flexDirection: { xs: "column", md: "row" },
				justifyContent: "space-between",
				alignItems: { xs: "center", md: "center" },
				p: 3,
				bgcolor: COLOR_SURFACE,
				borderRadius: 1,
				mb: 2,
				position: "relative",
			}}
		>
			<Typography
				variant="h6"
				sx={{
					fontWeight: 500,
					mb: { xs: 2, md: 0 },
					color: COLOR_TEXT_PRIMARY,
					display: { xs: "none", md: "block" },
				}}
			>
				{formattedToday}
			</Typography>

			<Box
				sx={{
					display: "flex",
					alignItems: "center",
					justifyContent: "center",
					position: { xs: "relative", md: "absolute" },
					left: { xs: "auto", md: "50%" },
					transform: { xs: "none", md: "translateX(-50%)" },
				}}
			>
				<IconButton
					onClick={handleNavigatePrevious}
					size="small"
					sx={{
						mx: 1,
						color: COLOR_TEXT_SECONDARY,
						"&:hover": {
							backgroundColor: "rgba(56, 130, 246, 0.08)",
							color: COLOR_PRIMARY,
						},
					}}
				>
					<ChevronLeft />
				</IconButton>

				<Typography
					variant="subtitle1"
					sx={{
						fontWeight: "medium",
						minWidth: isMobile ? "auto" : "200px",
						textAlign: "center",
						color: COLOR_TEXT_PRIMARY,
					}}
				>
					{getFormattedPeriod()}
				</Typography>

				<IconButton
					onClick={handleNavigateNext}
					size="small"
					sx={{
						mx: 1,
						color: COLOR_TEXT_SECONDARY,
						"&:hover": {
							backgroundColor: "rgba(56, 130, 246, 0.08)",
							color: COLOR_PRIMARY,
						},
					}}
				>
					<ChevronRight />
				</IconButton>
			</Box>

			<ToggleButtonGroup
				value={calendarView}
				exclusive
				onChange={(_e, newView) => {
					if (newView !== null) {
						handleViewChange(newView);
					}
				}}
				aria-label="calendar view"
				size="small"
				sx={{
					mt: { xs: 2, md: 0 },
					borderRadius: 1,
					"& .MuiToggleButton-root": {
						px: 2,
						py: 0.5,
						transition: "all 0.2s ease-in-out",
						color: COLOR_TEXT_PRIMARY,
						borderColor: "rgba(255, 255, 255, 0.2)",
						backgroundColor: "rgba(255, 255, 255, 0.05)",
						"&.Mui-selected": {
							bgcolor: COLOR_PRIMARY,
							color: "#FFFFFF",
							borderColor: COLOR_PRIMARY,
							"&:hover": {
								bgcolor: COLOR_PRIMARY,
								opacity: 0.9,
							},
						},
						"&:hover": {
							backgroundColor: "rgba(56, 130, 246, 0.1)",
							borderColor: COLOR_PRIMARY,
							color: COLOR_PRIMARY,
						},
						"&:first-of-type": {
							borderTopLeftRadius: 4,
							borderBottomLeftRadius: 4,
						},
						"&:last-of-type": {
							borderTopRightRadius: 4,
							borderBottomRightRadius: 4,
						},
					},
				}}
			>
				<ToggleButton value="day" aria-label="day view">
					<ViewDay sx={{ mr: 1 }} />
					Day
				</ToggleButton>
				<ToggleButton value="week" aria-label="week view">
					<ViewWeek sx={{ mr: 1 }} />
					Week
				</ToggleButton>
				<ToggleButton value="month" aria-label="month view">
					<CalendarMonth sx={{ mr: 1 }} />
					Month
				</ToggleButton>
			</ToggleButtonGroup>
		</Box>
	);
};

export default BookingControls;
