import React from "react";
import {
	Box,
	FormControl,
	InputLabel,
	MenuItem,
	Paper,
	Select,
	Typography,
} from "@mui/material";

interface CustomerWorkshopSelectorProps {
	workshops: any[] | undefined;
	selectedWorkshopId: number | null;
	onWorkshopChange: (workshopId: number) => void;
}

const CustomerWorkshopSelector: React.FC<CustomerWorkshopSelectorProps> = ({
	workshops,
	selectedWorkshopId,
	onWorkshopChange,
}) => {
	return (
		<Paper sx={{ p: 3, mb: 3, borderRadius: 2 }}>
			<Typography variant="h6" gutterBottom>
				Select Workshop
			</Typography>
			<Box sx={{ width: "100%" }}>
				<FormControl fullWidth size="small">
					<InputLabel>Workshop</InputLabel>
					<Select
						value={selectedWorkshopId || ""}
						onChange={(e) => onWorkshopChange(Number(e.target.value))}
						label="Workshop"
					>
						<MenuItem value="">
							<em>All Workshops</em>
						</MenuItem>
						{(workshops || []).map((workshop) => (
							<MenuItem key={workshop.id} value={workshop.id}>
								{workshop.name}
							</MenuItem>
						))}
					</Select>
				</FormControl>
			</Box>
		</Paper>
	);
};

export default CustomerWorkshopSelector;
