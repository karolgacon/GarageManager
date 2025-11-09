import React from "react";
import {
	Box,
	FormControl,
	InputLabel,
	MenuItem,
	Select,
	Typography,
} from "@mui/material";
import {
	COLOR_PRIMARY,
	COLOR_SURFACE,
	COLOR_TEXT_PRIMARY,
	COLOR_TEXT_SECONDARY,
} from "../../constants";

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
		<Box
			sx={{
				p: 3,
				mb: 3,
				borderRadius: 2,
				backgroundColor: COLOR_SURFACE,
			}}
		>
			<Typography variant="h6" gutterBottom sx={{ color: COLOR_TEXT_PRIMARY }}>
				Select Workshop
			</Typography>
			<Box sx={{ width: "100%" }}>
				<FormControl
					fullWidth
					size="small"
					sx={{
						"& .MuiOutlinedInput-root": {
							backgroundColor: COLOR_SURFACE,
							color: COLOR_TEXT_PRIMARY,
							"& fieldset": {
								borderColor: "rgba(228, 230, 232, 0.3)",
							},
							"&:hover fieldset": {
								borderColor: COLOR_TEXT_SECONDARY,
							},
							"&.Mui-focused fieldset": {
								borderColor: COLOR_PRIMARY,
							},
						},
						"& .MuiInputLabel-root": {
							color: COLOR_TEXT_SECONDARY,
							"&.Mui-focused": {
								color: COLOR_PRIMARY,
							},
						},
					}}
				>
					<InputLabel>Workshop</InputLabel>
					<Select
						value={selectedWorkshopId || ""}
						onChange={(e) => onWorkshopChange(Number(e.target.value))}
						label="Workshop"
						MenuProps={{
							PaperProps: {
								sx: {
									backgroundColor: COLOR_SURFACE,
									border: `1px solid rgba(228, 230, 232, 0.2)`,
									"& .MuiMenuItem-root": {
										color: COLOR_TEXT_PRIMARY,
										"&:hover": {
											backgroundColor: "rgba(56, 130, 246, 0.1)",
										},
										"&.Mui-selected": {
											backgroundColor: COLOR_PRIMARY,
											color: "#fff",
											"&:hover": {
												backgroundColor: COLOR_PRIMARY,
											},
										},
									},
								},
							},
						}}
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
		</Box>
	);
};

export default CustomerWorkshopSelector;
