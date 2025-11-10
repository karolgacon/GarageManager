import React from "react";
import { Tabs, Tab, Box } from "@mui/material";
import { COLOR_PRIMARY, COLOR_TEXT_SECONDARY } from "../../constants";

interface BookingTabsProps {
	bookingType: string;
	onTabChange: (event: React.SyntheticEvent, newValue: string) => void;
}

const BookingTabs: React.FC<BookingTabsProps> = ({
	bookingType,
	onTabChange,
}) => {
	return (
		<Box sx={{ mb: 3 }}>
			<Tabs
				value={bookingType}
				onChange={onTabChange}
				variant="scrollable"
				scrollButtons="auto"
				sx={{
					backgroundColor: "rgba(255, 255, 255, 0.03)",
					borderRadius: 1,
					"& .MuiTab-root": {
						textTransform: "none",
						minWidth: "auto",
						px: 3,
						py: 1.5,
						color: COLOR_TEXT_SECONDARY,
						fontWeight: 500,
						"&.Mui-selected": {
							color: COLOR_PRIMARY,
							fontWeight: 600,
						},
						"&:hover": {
							color: COLOR_PRIMARY,
							opacity: 0.8,
						},
					},
					"& .MuiTabs-indicator": {
						backgroundColor: COLOR_PRIMARY,
						height: 3,
						borderRadius: 1,
					},
				}}
			>
				<Tab label="All Bookings" value="all" />
				<Tab label="Upcoming Bookings" value="upcoming" />
				<Tab label="Past Bookings" value="past" />
			</Tabs>
		</Box>
	);
};

export default BookingTabs;
