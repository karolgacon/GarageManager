import React, { useState } from "react";
import {
	Box,
	TextField,
	FormControl,
	InputLabel,
	Select,
	MenuItem,
	InputAdornment,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import {
	COLOR_PRIMARY,
	COLOR_SURFACE,
	COLOR_TEXT_PRIMARY,
	COLOR_TEXT_SECONDARY,
} from "../../constants";

interface CustomerFiltersProps {
	onFilterChange: (filters: {
		searchTerm: string;
		status: string;
		loyaltyLevel: string;
	}) => void;
}

const CustomerFilters: React.FC<CustomerFiltersProps> = ({
	onFilterChange,
}) => {
	const [searchTerm, setSearchTerm] = useState("");
	const [status, setStatus] = useState("");
	const [loyaltyLevel, setLoyaltyLevel] = useState("");

	const handleFilterChange = (field: string, value: string) => {
		let updatedFilters = { searchTerm, status, loyaltyLevel };

		switch (field) {
			case "searchTerm":
				setSearchTerm(value);
				updatedFilters.searchTerm = value;
				break;
			case "status":
				setStatus(value);
				updatedFilters.status = value;
				break;
			case "loyaltyLevel":
				setLoyaltyLevel(value);
				updatedFilters.loyaltyLevel = value;
				break;
		}

		onFilterChange(updatedFilters);
	};

	return (
		<Box
			sx={{
				p: 3,
				mb: 3,
				borderRadius: 2,
				backgroundColor: COLOR_SURFACE,
			}}
		>
			<Box
				sx={{
					display: "flex",
					gap: 2,
					flexWrap: "wrap",
					alignItems: "center",
				}}
			>
				<TextField
					placeholder="Search customers..."
					value={searchTerm}
					onChange={(e) => handleFilterChange("searchTerm", e.target.value)}
					sx={{
						minWidth: 300,
						flex: 1,
						"& .MuiInputBase-root": {
							color: COLOR_TEXT_PRIMARY,
						},
						"& .MuiOutlinedInput-root": {
							backgroundColor: "rgba(255, 255, 255, 0.05)",
							"& fieldset": {
								borderColor: "rgba(228, 230, 232, 0.2)",
							},
							"&:hover fieldset": {
								borderColor: "rgba(228, 230, 232, 0.3)",
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
					InputProps={{
						startAdornment: (
							<InputAdornment position="start">
								<SearchIcon sx={{ color: COLOR_TEXT_SECONDARY }} />
							</InputAdornment>
						),
					}}
				/>

				<FormControl
					sx={{
						minWidth: 150,
						"& .MuiInputLabel-root": {
							color: COLOR_TEXT_SECONDARY,
							"&.Mui-focused": {
								color: COLOR_PRIMARY,
							},
						},
						"& .MuiOutlinedInput-root": {
							color: COLOR_TEXT_PRIMARY,
							backgroundColor: "rgba(255, 255, 255, 0.05)",
							"& fieldset": {
								borderColor: "rgba(228, 230, 232, 0.2)",
							},
							"&:hover fieldset": {
								borderColor: "rgba(228, 230, 232, 0.3)",
							},
							"&.Mui-focused fieldset": {
								borderColor: COLOR_PRIMARY,
							},
							"& .MuiSelect-icon": {
								color: COLOR_TEXT_SECONDARY,
							},
						},
					}}
				>
					<InputLabel>Status</InputLabel>
					<Select
						value={status}
						label="Status"
						onChange={(e) => handleFilterChange("status", e.target.value)}
						MenuProps={{
							PaperProps: {
								sx: {
									backgroundColor: COLOR_SURFACE,
									"& .MuiMenuItem-root": {
										color: COLOR_TEXT_PRIMARY,
										"&:hover": {
											backgroundColor: `${COLOR_PRIMARY}20`,
										},
										"&.Mui-selected": {
											backgroundColor: `${COLOR_PRIMARY}40`,
											"&:hover": {
												backgroundColor: `${COLOR_PRIMARY}30`,
											},
										},
									},
								},
							},
						}}
					>
						<MenuItem value="">All</MenuItem>
						<MenuItem value="active">Active</MenuItem>
						<MenuItem value="blocked">Blocked</MenuItem>
						<MenuItem value="suspended">Suspended</MenuItem>
					</Select>
				</FormControl>

				<FormControl
					sx={{
						minWidth: 150,
						"& .MuiInputLabel-root": {
							color: COLOR_TEXT_SECONDARY,
							"&.Mui-focused": {
								color: COLOR_PRIMARY,
							},
						},
						"& .MuiOutlinedInput-root": {
							color: COLOR_TEXT_PRIMARY,
							backgroundColor: "rgba(255, 255, 255, 0.05)",
							"& fieldset": {
								borderColor: "rgba(228, 230, 232, 0.2)",
							},
							"&:hover fieldset": {
								borderColor: "rgba(228, 230, 232, 0.3)",
							},
							"&.Mui-focused fieldset": {
								borderColor: COLOR_PRIMARY,
							},
							"& .MuiSelect-icon": {
								color: COLOR_TEXT_SECONDARY,
							},
						},
					}}
				>
					<InputLabel>Loyalty Level</InputLabel>
					<Select
						value={loyaltyLevel}
						label="Loyalty Level"
						onChange={(e) => handleFilterChange("loyaltyLevel", e.target.value)}
						MenuProps={{
							PaperProps: {
								sx: {
									backgroundColor: COLOR_SURFACE,
									"& .MuiMenuItem-root": {
										color: COLOR_TEXT_PRIMARY,
										"&:hover": {
											backgroundColor: `${COLOR_PRIMARY}20`,
										},
										"&.Mui-selected": {
											backgroundColor: `${COLOR_PRIMARY}40`,
											"&:hover": {
												backgroundColor: `${COLOR_PRIMARY}30`,
											},
										},
									},
								},
							},
						}}
					>
						<MenuItem value="">All</MenuItem>
						<MenuItem value="vip">VIP (100+ pts)</MenuItem>
						<MenuItem value="regular">Regular</MenuItem>
					</Select>
				</FormControl>
			</Box>
		</Box>
	);
};

export default CustomerFilters;
