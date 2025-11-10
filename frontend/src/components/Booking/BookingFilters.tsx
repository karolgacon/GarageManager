import React from "react";
import {
	Box,
	Grid,
	Typography,
	Button,
	ToggleButtonGroup,
	ToggleButton,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import ViewListIcon from "@mui/icons-material/ViewList";
import CalendarViewWeekIcon from "@mui/icons-material/CalendarViewWeek";
import RefreshIcon from "@mui/icons-material/Refresh";
import {
	COLOR_PRIMARY,
	COLOR_SURFACE,
	COLOR_TEXT_PRIMARY,
	COLOR_TEXT_SECONDARY,
} from "../../constants";

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
	return (
		<Box
			sx={{
				p: 3,
				mb: 3,
				borderRadius: 2,
				backgroundColor: COLOR_SURFACE,
				display: "flex",
				flexDirection: { xs: "column", sm: "row" },
				alignItems: { xs: "stretch", sm: "center" },
				justifyContent: "space-between",
				gap: 2,
			}}
		>
			<Grid container spacing={3} alignItems="center">
				{bookingType === "all" && (
					<Grid item xs={12} md={12}>
						<Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
							<Typography
								variant="body1"
								sx={{
									whiteSpace: "nowrap",
									fontWeight: "medium",
									color: COLOR_TEXT_PRIMARY,
									opacity: 0.9,
								}}
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
												"& .MuiPickersDay-root": {
													color: COLOR_TEXT_PRIMARY,
													"&.Mui-selected": {
														bgcolor: COLOR_PRIMARY + " !important",
														color: COLOR_TEXT_PRIMARY + " !important",
														"&:hover": {
															bgcolor: COLOR_PRIMARY + " !important",
															opacity: 0.9,
														},
														"&:focus": {
															bgcolor: COLOR_PRIMARY + " !important",
															opacity: 0.9,
														},
													},
													"&:hover": {
														bgcolor: "rgba(56, 130, 246, 0.1)",
													},
												},
												"& .MuiPickersCalendarHeader-label": {
													color: COLOR_TEXT_PRIMARY,
												},
												"& .MuiPickersArrowSwitcher-button": {
													color: COLOR_TEXT_PRIMARY,
													"&:hover": {
														bgcolor: "rgba(56, 130, 246, 0.1)",
													},
												},
												"& .MuiDayCalendar-weekDayLabel": {
													color: COLOR_TEXT_SECONDARY,
												},
												bgcolor: COLOR_SURFACE,
												color: COLOR_TEXT_PRIMARY,
											},
										},
										popper: {
											sx: {
												"& .MuiPaper-root": {
													bgcolor: COLOR_SURFACE,
													border: `1px solid ${COLOR_TEXT_SECONDARY}`,
												},
											},
										},
									}}
									sx={{
										"& .MuiOutlinedInput-root": {
											"& fieldset": {
												borderColor: COLOR_TEXT_SECONDARY,
												borderRadius: 1,
											},
											"&:hover fieldset": {
												borderColor: COLOR_PRIMARY,
											},
											"&.Mui-focused fieldset": {
												borderColor: COLOR_PRIMARY,
											},
											"& .MuiInputBase-input": {
												color: COLOR_TEXT_PRIMARY,
											},
											"& .MuiInputAdornment-root": {
												color: COLOR_TEXT_SECONDARY,
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
								color: COLOR_TEXT_SECONDARY,
								borderColor: "rgba(255, 255, 255, 0.1)",
								"&:hover": {
									borderColor: COLOR_PRIMARY,
									color: COLOR_PRIMARY,
									backgroundColor: "rgba(56, 130, 246, 0.08)",
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
									bgcolor: COLOR_PRIMARY,
									color: COLOR_TEXT_PRIMARY,
									"&:hover": { bgcolor: COLOR_PRIMARY, opacity: 0.9 },
								},
								"& .MuiToggleButton-root": {
									color: COLOR_TEXT_SECONDARY,
									borderColor: "rgba(255, 255, 255, 0.1)",
									"&:hover": {
										backgroundColor: "rgba(56, 130, 246, 0.08)",
										borderColor: COLOR_PRIMARY,
										color: COLOR_PRIMARY,
									},
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
