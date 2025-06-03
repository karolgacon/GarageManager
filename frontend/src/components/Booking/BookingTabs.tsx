import React from "react";
import { Tabs, Tab, Box } from "@mui/material";
import { COLOR_PRIMARY } from "../../constants"; // Import your theme color

interface BookingTabsProps {
	bookingType: string;
	onTabChange: (event: React.SyntheticEvent, newValue: string) => void;
}

const BookingTabs: React.FC<BookingTabsProps> = ({
	bookingType,
	onTabChange,
}) => {
	return (
		<Box sx={{ borderBottom: 1, borderColor: "divider" }}>
			<Tabs
				value={bookingType}
				onChange={onTabChange}
				sx={{
					"& .MuiTabs-indicator": {
						backgroundColor: COLOR_PRIMARY,
					},
					"& .Mui-selected": {
						color: COLOR_PRIMARY,
						fontWeight: "bold",
					},
				}}
			>
				<Tab
					label="All Bookings"
					value="all"
					sx={{
						textTransform: "none",
						"&.Mui-selected": {
							color: COLOR_PRIMARY,
						},
					}}
				/>
				<Tab
					label="Upcoming Bookings"
					value="upcoming"
					sx={{
						textTransform: "none",
						"&.Mui-selected": {
							color: COLOR_PRIMARY,
						},
					}}
				/>
				<Tab
					label="Past Bookings"
					value="past"
					sx={{
						textTransform: "none",
						"&.Mui-selected": {
							color: COLOR_PRIMARY,
						},
					}}
				/>
			</Tabs>
		</Box>
	);
};

export default BookingTabs;
