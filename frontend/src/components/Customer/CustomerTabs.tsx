import React from "react";
import { Box, Tabs, Tab } from "@mui/material";
import PersonIcon from "@mui/icons-material/Person";
import StarsIcon from "@mui/icons-material/Stars";
import {
	COLOR_PRIMARY,
	COLOR_SURFACE,
	COLOR_TEXT_PRIMARY,
	COLOR_TEXT_SECONDARY,
} from "../../constants";

interface CustomerTabsProps {
	activeTab: string;
	onTabChange: (event: React.SyntheticEvent, newValue: string) => void;
}

const CustomerTabs: React.FC<CustomerTabsProps> = ({
	activeTab,
	onTabChange,
}) => {
	return (
		<Box sx={{ mb: 3 }}>
			<Tabs
				value={activeTab}
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
				<Tab value="all" label="All Customers" />
				<Tab
					value="active"
					label="Active Customers"
					icon={<PersonIcon fontSize="small" />}
					iconPosition="start"
				/>
				<Tab
					value="vip"
					label="VIP Customers"
					icon={<StarsIcon fontSize="small" />}
					iconPosition="start"
				/>
			</Tabs>
		</Box>
	);
};

export default CustomerTabs;
