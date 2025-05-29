import React from "react";
import {
	Paper,
	Typography,
	FormControl,
	InputLabel,
	Select,
	MenuItem,
	Box,
} from "@mui/material";
import BusinessIcon from "@mui/icons-material/Business";
import { Workshop } from "../../models/WorkshopModel";

interface CustomerWorkshopSelectorProps {
	workshops: Workshop[];
	selectedWorkshopId: number | null;
	onWorkshopChange: (workshopId: number) => void;
}

const CustomerWorkshopSelector: React.FC<CustomerWorkshopSelectorProps> = ({
	workshops,
	selectedWorkshopId,
	onWorkshopChange,
}) => {
	if (!selectedWorkshopId) {
		return (
			<Paper sx={{ p: 3, textAlign: "center", borderRadius: 2, mb: 3 }}>
				<BusinessIcon sx={{ fontSize: 48, color: "text.secondary", mb: 2 }} />
				<Typography variant="h6" color="text.secondary">
					Select a workshop to view customers
				</Typography>
				<Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
					Choose a workshop from the dropdown below to see its customers.
				</Typography>

				<Box sx={{ display: "flex", justifyContent: "center" }}>
					<FormControl sx={{ minWidth: 300 }}>
						<InputLabel>Select Workshop</InputLabel>
						<Select
							value={selectedWorkshopId || ""}
							label="Select Workshop"
							onChange={(e) => onWorkshopChange(Number(e.target.value))}
						>
							{workshops.map((workshop) => (
								<MenuItem key={workshop.id} value={workshop.id}>
									{workshop.name}
								</MenuItem>
							))}
						</Select>
					</FormControl>
				</Box>
			</Paper>
		);
	}

	return (
		<Box sx={{ mb: 3 }}>
			<FormControl sx={{ minWidth: 300 }}>
				<InputLabel>Selected Workshop</InputLabel>
				<Select
					value={selectedWorkshopId}
					label="Selected Workshop"
					onChange={(e) => onWorkshopChange(Number(e.target.value))}
				>
					{workshops.map((workshop) => (
						<MenuItem key={workshop.id} value={workshop.id}>
							{workshop.name}
						</MenuItem>
					))}
				</Select>
			</FormControl>
		</Box>
	);
};

export default CustomerWorkshopSelector;
