import React from "react";
import { Box, Typography, Button } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import { COLOR_PRIMARY, COLOR_TEXT_PRIMARY } from "../../constants";

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
			<Typography
				variant="h4"
				component="h1"
				fontWeight="bold"
				sx={{ color: COLOR_TEXT_PRIMARY }}
			>
				Bookings
			</Typography>

			{(userRole !== "admin" || (userRole === "admin" && selectedWorkshop)) && (
				<Button
					variant="contained"
					startIcon={<AddIcon />}
					sx={{
						bgcolor: COLOR_PRIMARY,
						"&:hover": { bgcolor: COLOR_PRIMARY, opacity: 0.9 },
						borderRadius: 1,
						px: 3,
						textTransform: "none",
						fontWeight: 600,
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
