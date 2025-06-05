import React from "react";
import { Box, Typography, Button } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";

interface BookingHeaderProps {
	userRole: string;
	selectedWorkshop: number | null;
	onAddBooking: () => void;
}

const BookingHeader: React.FC<BookingHeaderProps> = ({
	userRole,
	selectedWorkshop,
	onAddBooking,
}) => {
	return (
		<Box
			sx={{
				display: "flex",
				justifyContent: "space-between",
				alignItems: "center",
				mb: 4,
			}}
		>
			<Typography variant="h4" component="h1" fontWeight="bold">
				Bookings
			</Typography>

			{(userRole !== "admin" || (userRole === "admin" && selectedWorkshop)) && (
				<Button
					variant="contained"
					startIcon={<AddIcon />}
					sx={{
						bgcolor: "#ff3c4e",
						"&:hover": { bgcolor: "#d6303f" },
						borderRadius: 1,
						px: 3,
					}}
					onClick={onAddBooking}
				>
					NEW BOOKING
				</Button>
			)}
		</Box>
	);
};

export default BookingHeader;
