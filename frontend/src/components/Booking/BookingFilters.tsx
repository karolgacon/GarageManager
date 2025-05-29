import React from "react";
import {
	Box,
	Grid,
	Typography,
	Button,
	ToggleButtonGroup,
	ToggleButton,
	Select,
	MenuItem,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import ViewListIcon from "@mui/icons-material/ViewList";
import CalendarViewWeekIcon from "@mui/icons-material/CalendarViewWeek";
import RefreshIcon from "@mui/icons-material/Refresh";

interface BookingFiltersProps {
	bookingType: string;
	calendarView: string;
	selectedDate: Date;
	view: string;
	onDateChange: (date: Date | null) => void;
	onViewChange: (
		event: React.MouseEvent<HTMLElement>,
		newView: string | null
	) => void;
	onRefresh: () => void;
}

const BookingFilters: React.FC<BookingFiltersProps> = ({
	bookingType,
	calendarView,
	selectedDate,
	view,
	onDateChange,
	onViewChange,
	onRefresh,
}) => {
	// Konfiguracja dla wszystkich komponentów Select
	const selectMenuProps = {
		disableScrollLock: true,
		anchorOrigin: {
			vertical: "bottom",
			horizontal: "left",
		},
		transformOrigin: {
			vertical: "top",
			horizontal: "left",
		},
		PaperProps: {
			style: {
				maxHeight: 224,
			},
		},
	};

	return (
		<Box
			sx={{
				p: 3,
				borderBottom: "1px solid #eeeeee",
				display: "flex",
				flexDirection: { xs: "column", sm: "row" },
				alignItems: { xs: "stretch", sm: "center" },
				justifyContent: "space-between",
				gap: 2,
			}}
		>
			<Grid container spacing={3} alignItems="center">
				{/* Only show date picker for "all" view */}
				{bookingType === "all" && (
					<Grid item xs={12} md={12}>
						<Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
							<Typography
								variant="body1"
								sx={{ whiteSpace: "nowrap", fontWeight: "medium" }}
							>
								Select{" "}
								{calendarView === "month"
									? "Month"
									: calendarView === "day"
									? "Day"
									: "Week"}
								:
							</Typography>
							<LocalizationProvider dateAdapter={AdapterDateFns}>
								<DatePicker
									value={selectedDate}
									onChange={onDateChange}
									slotProps={{
										textField: {
											size: "small",
											fullWidth: true,
										},
										layout: {
											sx: {
												"& .MuiPickersDay-root.Mui-selected": {
													bgcolor: "#ff3c4e",
													"&:hover": { bgcolor: "#d6303f" },
													"&:focus": { bgcolor: "#d6303f" },
												},
											},
										},
									}}
									sx={{
										"& .MuiOutlinedInput-root": {
											"& fieldset": {
												borderColor: "#ddd",
											},
											"&:hover fieldset": {
												borderColor: "#ff3c4e",
											},
											"&.Mui-focused fieldset": {
												borderColor: "#ff3c4e",
											},
										},
									}}
									closeOnSelect={true}
									showDaysOutsideCurrentMonth={false}
									format="dd/MM/yyyy"
								/>
							</LocalizationProvider>
						</Box>
					</Grid>
				)}

				{/* Refresh button and view toggle */}
				<Grid item xs={12}>
					<Box
						sx={{
							display: "flex",
							justifyContent: { xs: "flex-start", md: "flex-end" },
							gap: 2,
						}}
					>
						<Button
							variant="outlined"
							startIcon={<RefreshIcon />}
							onClick={onRefresh}
							size="small"
							sx={{
								color: "#555",
								borderColor: "#ddd",
								"&:hover": {
									borderColor: "#ff3c4e",
									color: "#ff3c4e",
								},
							}}
						>
							Refresh
						</Button>

						<ToggleButtonGroup
							value={view}
							exclusive
							onChange={onViewChange}
							aria-label="view mode"
							size="small"
							sx={{
								"& .MuiToggleButton-root.Mui-selected": {
									bgcolor: "#ff3c4e",
									color: "white",
									"&:hover": { bgcolor: "#d6303f" },
								},
								"& .MuiToggleButton-root": {
									"&:hover": { bgcolor: "rgba(255, 60, 78, 0.08)" },
								},
							}}
						>
							<ToggleButton value="calendar" aria-label="calendar view">
								<CalendarViewWeekIcon />
							</ToggleButton>
							<ToggleButton value="list" aria-label="list view">
								<ViewListIcon />
							</ToggleButton>
						</ToggleButtonGroup>
					</Box>
				</Grid>
			</Grid>
		</Box>
	);
};

export default BookingFilters;
