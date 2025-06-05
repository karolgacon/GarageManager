import React, { useState, useEffect } from "react";
import {
	Box,
	Typography,
	CircularProgress,
	Alert,
	Button,
} from "@mui/material";
import BookingCalendarView from "./BookingCalendarView";
import BookingListView from "./BookingListView";
import { COLOR_PRIMARY } from "../../constants";

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
	onForceLoadingComplete?: () => void;
	onRefresh?: () => void;
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
	onForceLoadingComplete,
	onRefresh,
}) => {
	const [loadingDuration, setLoadingDuration] = useState(0);

	useEffect(() => {
		let intervalId: NodeJS.Timeout | null = null;

		if (loading) {
			setLoadingDuration(0);

			intervalId = setInterval(() => {
				setLoadingDuration((prev) => prev + 1);
			}, 1000);
		} else {
			setLoadingDuration(0);
		}

		return () => {
			if (intervalId) clearInterval(intervalId);
		};
	}, [loading]);

	useEffect(() => {
		let timeoutId: NodeJS.Timeout | null = null;

		if (loading && loadingDuration >= 15) {
			console.log("Loading timeout reached");
			if (onForceLoadingComplete) onForceLoadingComplete();
		}

		return () => {
			if (timeoutId) clearTimeout(timeoutId);
		};
	}, [loading, loadingDuration, onForceLoadingComplete]);

	if (loading) {
		return (
			<Box
				sx={{
					display: "flex",
					flexDirection: "column",
					alignItems: "center",
					justifyContent: "center",
					p: 5,
				}}
			>
				<CircularProgress sx={{ color: COLOR_PRIMARY, mb: 2 }} />
				<Typography variant="body2" color="text.secondary">
					{loadingDuration > 5
						? "This is taking longer than expected..."
						: "Loading bookings..."}
				</Typography>
				{loadingDuration > 8 && (
					<Button
						variant="outlined"
						size="small"
						onClick={onRefresh}
						sx={{
							mt: 2,
							color: COLOR_PRIMARY,
							borderColor: COLOR_PRIMARY,
						}}
					>
						Retry
					</Button>
				)}
			</Box>
		);
	}

	if (error) {
		return (
			<Box sx={{ p: 3, textAlign: "center" }}>
				<Typography color="error" gutterBottom>
					{error}
				</Typography>
				<Button
					variant="contained"
					color="primary"
					onClick={onRefresh}
					sx={{
						mt: 2,
						bgcolor: COLOR_PRIMARY,
						"&:hover": { bgcolor: "#d6303f" },
					}}
				>
					Retry Loading
				</Button>
			</Box>
		);
	}

	if (bookings.length === 0) {
		return (
			<Box sx={{ p: 5, textAlign: "center" }}>
				<Typography variant="h6" gutterBottom>
					No bookings found
				</Typography>
				<Typography variant="body2" color="text.secondary" paragraph>
					{bookingType === "upcoming"
						? "You don't have any upcoming bookings."
						: bookingType === "past"
						? "You don't have any past bookings."
						: "No bookings found for the selected period."}
				</Typography>
			</Box>
		);
	}

	return (
		<>
			<Box sx={{ bgcolor: "white", p: 3 }}>
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
			</Box>
		</>
	);
};

export default BookingContent;
