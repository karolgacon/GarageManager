import React from "react";
import { Box, Typography, Button } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";

interface CustomerHeaderProps {
	userRole?: string;
	selectedWorkshopId: number | null;
	onAddCustomer: () => void;
}

const CustomerHeader: React.FC<CustomerHeaderProps> = ({
	userRole,
	selectedWorkshopId,
	onAddCustomer,
}) => {
	const getSectionTitle = () => {
		switch (userRole) {
			case "admin":
				return "All Customers";
			case "owner":
				return "Workshop Customers";
			case "mechanic":
				return "My Customers";
			default:
				return "Customers";
		}
	};

	return (
		<Box
			sx={{
				display: "flex",
				justifyContent: "space-between",
				alignItems: "center",
				mb: 3,
				flexWrap: "wrap",
				gap: 2,
			}}
		>
			<Typography variant="h4" fontWeight="bold">
				{getSectionTitle()}
			</Typography>

			{(selectedWorkshopId || userRole !== "admin") && (
				<Button
					variant="contained"
					startIcon={<AddIcon />}
					onClick={onAddCustomer}
					sx={{
						bgcolor: "#ff3c4e",
						"&:hover": { bgcolor: "#d6303f" },
					}}
				>
					Add Customer
				</Button>
			)}
		</Box>
	);
};

export default CustomerHeader;
