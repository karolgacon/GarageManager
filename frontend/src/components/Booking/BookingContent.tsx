import React from "react";
import { Box, Typography, CircularProgress, Alert } from "@mui/material";
import BookingCalendarView from "./BookingCalendarView";
import BookingListView from "./BookingListView";

interface BookingContentProps {
	loading: boolean;
	error: string | null;
	view: string;
	bookingType: string;
	bookings: any[];
	daysOfWeek: any[];
	userRole?: string;
	calendarView: string;
	selectedDate: Date;
	onView: (id: number) => void;
	onEdit: (id: number) => void;
	onDelete: (id: number) => void;
}

const BookingContent: React.FC<BookingContentProps> = ({
	loading,
	error,
	view,
	bookingType,
	bookings,
	daysOfWeek,
	userRole,
	calendarView,
	selectedDate,
	onView,
	onEdit,
	onDelete,
}) => {
	return (
		<>
			{/* Error message */}
			{error && (
				<Alert severity="error" sx={{ mx: 3, mt: 2, borderRadius: 1 }}>
					{error}
				</Alert>
			)}

			{/* Calendar or list view */}
			<Box sx={{ bgcolor: "white", p: 3 }}>
				{loading ? (
					<Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
						<CircularProgress sx={{ color: "#ff3c4e" }} />
					</Box>
				) : (
					<>
						{view === "calendar" ? (
							<BookingCalendarView
								bookings={bookings}
								daysOfWeek={daysOfWeek}
								userRole={userRole || ""}
								calendarView={calendarView}
								onView={onView}
								onEdit={onEdit}
								onDelete={onDelete}
							/>
						) : (
							<BookingListView
								bookings={bookings}
								userRole={userRole}
								onView={onView}
								onEdit={onEdit}
								onDelete={onDelete}
							/>
						)}
					</>
				)}
			</Box>
		</>
	);
};

export default BookingContent;
