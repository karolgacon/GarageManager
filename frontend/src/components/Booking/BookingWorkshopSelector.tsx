import React from "react";
import {
	Paper,
	Typography,
	FormControl,
	InputLabel,
	Select,
	MenuItem,
	Alert,
} from "@mui/material";

interface Workshop {
	id: number;
	name: string;
}

interface Mechanic {
	id: number;
	first_name: string;
	last_name: string;
}

interface BookingWorkshopSelectorProps {
	workshops: Workshop[];
	mechanics: Mechanic[];
	selectedWorkshop: number | null;
	selectedMechanic: number | null;
	onWorkshopChange: (event: any) => void;
	onMechanicChange: (event: any) => void;
}

const BookingWorkshopSelector: React.FC<BookingWorkshopSelectorProps> = ({
	workshops,
	mechanics,
	selectedWorkshop,
	selectedMechanic,
	onWorkshopChange,
	onMechanicChange,
}) => {
	// Konfiguracja dla wszystkich komponentów Select
	const selectMenuProps = {
		// Prevent scrollbar shift
		disableScrollLock: true,
		// Control positioning of the dropdown to prevent layout shift
		anchorOrigin: {
			vertical: "bottom",
			horizontal: "left",
		},
		transformOrigin: {
			vertical: "top",
			horizontal: "left",
		},
		// Set a fixed height to prevent content jumping
		PaperProps: {
			style: {
				maxHeight: 224,
			},
		},
	};

	return (
		<Paper
			elevation={0}
			sx={{
				borderRadius: 2,
				p: 4,
				mb: 3,
				bgcolor: "#ffffff",
			}}
		>
			<Typography variant="h6" sx={{ mb: 2, fontWeight: 500 }}>
				Select Workshop
			</Typography>
			<FormControl fullWidth size="medium" sx={{ mb: 2 }}>
				<InputLabel>Workshop</InputLabel>
				<Select
					value={selectedWorkshop || ""}
					label="Workshop"
					onChange={onWorkshopChange}
					MenuProps={selectMenuProps}
					sx={{
						"& .MuiOutlinedInput-notchedOutline": {
							borderColor: "#ddd",
						},
						"&:hover .MuiOutlinedInput-notchedOutline": {
							borderColor: "#ff3c4e",
						},
						"&.Mui-focused .MuiOutlinedInput-notchedOutline": {
							borderColor: "#ff3c4e",
						},
					}}
				>
					{workshops.map((workshop) => (
						<MenuItem key={workshop.id} value={workshop.id}>
							{workshop.name}
						</MenuItem>
					))}
				</Select>
			</FormControl>

			{selectedWorkshop && (
				<FormControl fullWidth size="medium">
					<InputLabel>Mechanic (Optional)</InputLabel>
					<Select
						value={selectedMechanic || ""}
						label="Mechanic (Optional)"
						onChange={onMechanicChange}
						MenuProps={selectMenuProps}
						sx={{
							"& .MuiOutlinedInput-notchedOutline": {
								borderColor: "#ddd",
							},
							"&:hover .MuiOutlinedInput-notchedOutline": {
								borderColor: "#ff3c4e",
							},
							"&.Mui-focused .MuiOutlinedInput-notchedOutline": {
								borderColor: "#ff3c4e",
							},
						}}
					>
						<MenuItem value="">All Mechanics</MenuItem>
						{mechanics.map((mechanic) => (
							<MenuItem key={mechanic.id} value={mechanic.id}>
								{mechanic.first_name} {mechanic.last_name}
							</MenuItem>
						))}
					</Select>
				</FormControl>
			)}

			{!selectedWorkshop && (
				<Alert severity="info" sx={{ mt: 2 }}>
					Please select a workshop to view bookings
				</Alert>
			)}
		</Paper>
	);
};

export default BookingWorkshopSelector;
