import React from "react";
import { Box, Tabs, Tab } from "@mui/material";

interface BookingTabsProps {
	bookingType: string;
	onTabChange: (event: React.SyntheticEvent, newValue: string) => void;
}

const BookingTabs: React.FC<BookingTabsProps> = ({
	bookingType,
	onTabChange,
}) => {
	return (
		<Box
			sx={{
				borderBottom: 1,
				borderColor: "divider",
				px: 3,
				pt: 1,
			}}
		>
			<Tabs
				value={bookingType}
				onChange={onTabChange}
				aria-label="booking type tabs"
				sx={{
					"& .MuiTab-root": {
						fontWeight: 500,
						fontSize: "0.875rem",
						color: "#555",
					},
					"& .Mui-selected": {
						color: "#ff3c4e",
						fontWeight: 600,
					},
					"& .MuiTabs-indicator": {
						backgroundColor: "#ff3c4e",
					},
				}}
			>
				<Tab value="all" label="All Bookings" />
				<Tab value="upcoming" label="Upcoming Bookings" />
				<Tab value="past" label="Past Bookings" />
			</Tabs>
		</Box>
	);
};

export default BookingTabs;
