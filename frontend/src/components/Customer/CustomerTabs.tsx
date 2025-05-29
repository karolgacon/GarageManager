import React from "react";
import { Box, Tabs, Tab } from "@mui/material";
import PersonIcon from "@mui/icons-material/Person";
import StarsIcon from "@mui/icons-material/Stars";

interface CustomerTabsProps {
	activeTab: string;
	onTabChange: (event: React.SyntheticEvent, newValue: string) => void;
}

const CustomerTabs: React.FC<CustomerTabsProps> = ({
	activeTab,
	onTabChange,
}) => {
	return (
		<Box sx={{ mb: 2 }}>
			<Tabs
				value={activeTab}
				onChange={onTabChange}
				variant="scrollable"
				scrollButtons="auto"
				sx={{
					mb: 2,
					"& .MuiTab-root": {
						textTransform: "none",
						minWidth: "auto",
						px: 3,
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
