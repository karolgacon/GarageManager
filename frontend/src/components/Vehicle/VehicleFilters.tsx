import React, { useState } from "react";
import {
	Box,
	TextField,
	InputAdornment,
	Grid,
	MenuItem,
	FormControl,
	InputLabel,
	Select,
	Button,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import FilterListIcon from "@mui/icons-material/FilterList";
import {
	VEHICLE_FUEL_TYPES,
	VEHICLE_STATUS_TYPES,
} from "../../models/VehicleModel";
import {
	COLOR_SURFACE,
	COLOR_PRIMARY,
	COLOR_TEXT_PRIMARY,
	COLOR_TEXT_SECONDARY,
} from "../../constants";

const POPULAR_CAR_BRANDS = [
	{ value: "", label: "All Brands" },
	{ value: "toyota", label: "Toyota" },
	{ value: "volkswagen", label: "Volkswagen" },
	{ value: "ford", label: "Ford" },
	{ value: "bmw", label: "BMW" },
	{ value: "mercedes", label: "Mercedes" },
	{ value: "honda", label: "Honda" },
	{ value: "audi", label: "Audi" },
	{ value: "hyundai", label: "Hyundai" },
	{ value: "kia", label: "Kia" },
];

interface FilterOptions {
	searchTerm: string;
	brand: string;
	status: string;
	fuelType: string;
	maintenanceDue: boolean;
}

interface VehicleFiltersProps {
	onFilterChange: (filters: FilterOptions) => void;
}

const VehicleFilters: React.FC<VehicleFiltersProps> = ({ onFilterChange }) => {
	const [expanded, setExpanded] = useState(false);
	const [filters, setFilters] = useState<FilterOptions>({
		searchTerm: "",
		brand: "",
		status: "",
		fuelType: "",
		maintenanceDue: false,
	});

	const handleFilterChange = (name: string, value: any) => {
		const newFilters = {
			...filters,
			[name]: value,
		};

		setFilters(newFilters);
		onFilterChange(newFilters);
	};

	const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		handleFilterChange("searchTerm", e.target.value);
	};

	const handleReset = () => {
		const resetFilters = {
			searchTerm: "",
			brand: "",
			status: "",
			fuelType: "",
			maintenanceDue: false,
		};

		setFilters(resetFilters);
		onFilterChange(resetFilters);
	};

	return (
		<Box sx={{ mb: 3 }}>
			<TextField
				fullWidth
				variant="outlined"
				placeholder="Search vehicles by make, model or registration number..."
				value={filters.searchTerm}
				onChange={handleSearchChange}
				sx={{
					mb: 2,
					backgroundColor: COLOR_SURFACE,
					borderRadius: 1,
					"& .MuiOutlinedInput-root": {
						color: COLOR_TEXT_PRIMARY,
						"& fieldset": {
							borderColor: COLOR_TEXT_SECONDARY,
						},
						"&:hover fieldset": {
							borderColor: COLOR_PRIMARY,
						},
						"&.Mui-focused fieldset": {
							borderColor: COLOR_PRIMARY,
						},
					},
					"& .MuiInputBase-input::placeholder": {
						color: COLOR_TEXT_SECONDARY,
						opacity: 1,
					},
				}}
				InputProps={{
					startAdornment: (
						<InputAdornment position="start">
							<SearchIcon sx={{ color: COLOR_TEXT_SECONDARY }} />
						</InputAdornment>
					),
					endAdornment: (
						<InputAdornment position="end">
							<Button
								onClick={() => setExpanded(!expanded)}
								startIcon={<FilterListIcon />}
								sx={{
									color: COLOR_TEXT_SECONDARY,
									"&:hover": {
										backgroundColor: "rgba(56, 130, 246, 0.1)",
										color: COLOR_PRIMARY,
									},
								}}
							>
								{expanded ? "Hide Filters" : "Show Filters"}
							</Button>
						</InputAdornment>
					),
				}}
			/>

			{expanded && (
				<Box
					sx={{
						p: 2,
						bgcolor: COLOR_SURFACE,
						borderRadius: 1,
						mb: 2,
						border: `1px solid ${COLOR_TEXT_SECONDARY}`,
					}}
				>
					<Grid container spacing={2}>
						<Grid item xs={12} sm={6} md={3}>
							<TextField
								select
								label="Brand"
								value={filters.brand}
								onChange={(e) => handleFilterChange("brand", e.target.value)}
								fullWidth
								sx={{
									"& .MuiOutlinedInput-root": {
										color: COLOR_TEXT_PRIMARY,
										"& fieldset": {
											borderColor: COLOR_TEXT_SECONDARY,
										},
										"&:hover fieldset": {
											borderColor: COLOR_PRIMARY,
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
								MenuProps={{
									PaperProps: {
										sx: {
											backgroundColor: COLOR_SURFACE,
											"& .MuiMenuItem-root": {
												color: COLOR_TEXT_PRIMARY,
												"&:hover": {
													backgroundColor: "rgba(56, 130, 246, 0.1)",
												},
											},
										},
									},
								}}
							>
								<MenuItem value="">All Brands</MenuItem>
								{POPULAR_CAR_BRANDS.map((brand) => (
									<MenuItem key={brand.value} value={brand.value}>
										{brand.label}
									</MenuItem>
								))}
							</TextField>
						</Grid>

						<Grid item xs={12} sm={6} md={3}>
							<FormControl fullWidth size="small">
								<InputLabel
									id="status-filter-label"
									sx={{
										color: COLOR_TEXT_SECONDARY,
										"&.Mui-focused": { color: COLOR_PRIMARY },
									}}
								>
									Status
								</InputLabel>
								<Select
									labelId="status-filter-label"
									value={filters.status}
									label="Status"
									onChange={(e) => handleFilterChange("status", e.target.value)}
									sx={{
										color: COLOR_TEXT_PRIMARY,
										"& .MuiOutlinedInput-notchedOutline": {
											borderColor: COLOR_TEXT_SECONDARY,
										},
										"&:hover .MuiOutlinedInput-notchedOutline": {
											borderColor: COLOR_PRIMARY,
										},
										"&.Mui-focused .MuiOutlinedInput-notchedOutline": {
											borderColor: COLOR_PRIMARY,
										},
									}}
									MenuProps={{
										PaperProps: {
											sx: {
												backgroundColor: COLOR_SURFACE,
												"& .MuiMenuItem-root": {
													color: COLOR_TEXT_PRIMARY,
													"&:hover": {
														backgroundColor: "rgba(56, 130, 246, 0.1)",
													},
												},
											},
										},
									}}
								>
									<MenuItem value="">All Statuses</MenuItem>
									{VEHICLE_STATUS_TYPES.map((status) => (
										<MenuItem key={status.value} value={status.value}>
											{status.label}
										</MenuItem>
									))}
								</Select>
							</FormControl>
						</Grid>

						<Grid item xs={12} sm={6} md={3}>
							<FormControl fullWidth size="small">
								<InputLabel
									id="fuel-filter-label"
									sx={{
										color: COLOR_TEXT_SECONDARY,
										"&.Mui-focused": { color: COLOR_PRIMARY },
									}}
								>
									Fuel Type
								</InputLabel>
								<Select
									labelId="fuel-filter-label"
									value={filters.fuelType}
									label="Fuel Type"
									onChange={(e) =>
										handleFilterChange("fuelType", e.target.value)
									}
									sx={{
										color: COLOR_TEXT_PRIMARY,
										"& .MuiOutlinedInput-notchedOutline": {
											borderColor: COLOR_TEXT_SECONDARY,
										},
										"&:hover .MuiOutlinedInput-notchedOutline": {
											borderColor: COLOR_PRIMARY,
										},
										"&.Mui-focused .MuiOutlinedInput-notchedOutline": {
											borderColor: COLOR_PRIMARY,
										},
									}}
									MenuProps={{
										PaperProps: {
											sx: {
												backgroundColor: COLOR_SURFACE,
												"& .MuiMenuItem-root": {
													color: COLOR_TEXT_PRIMARY,
													"&:hover": {
														backgroundColor: "rgba(56, 130, 246, 0.1)",
													},
												},
											},
										},
									}}
								>
									<MenuItem value="">All Fuel Types</MenuItem>
									{VEHICLE_FUEL_TYPES.map((fuel) => (
										<MenuItem key={fuel.value} value={fuel.value}>
											{fuel.label}
										</MenuItem>
									))}
								</Select>
							</FormControl>
						</Grid>

						<Grid item xs={12} sm={6} md={3}>
							<FormControl fullWidth size="small">
								<InputLabel
									id="maintenance-filter-label"
									sx={{
										color: COLOR_TEXT_SECONDARY,
										"&.Mui-focused": { color: COLOR_PRIMARY },
									}}
								>
									Maintenance
								</InputLabel>
								<Select
									labelId="maintenance-filter-label"
									value={filters.maintenanceDue ? "due" : "all"}
									label="Maintenance"
									onChange={(e) =>
										handleFilterChange(
											"maintenanceDue",
											e.target.value === "due"
										)
									}
									sx={{
										color: COLOR_TEXT_PRIMARY,
										"& .MuiOutlinedInput-notchedOutline": {
											borderColor: COLOR_TEXT_SECONDARY,
										},
										"&:hover .MuiOutlinedInput-notchedOutline": {
											borderColor: COLOR_PRIMARY,
										},
										"&.Mui-focused .MuiOutlinedInput-notchedOutline": {
											borderColor: COLOR_PRIMARY,
										},
									}}
									MenuProps={{
										PaperProps: {
											sx: {
												backgroundColor: COLOR_SURFACE,
												"& .MuiMenuItem-root": {
													color: COLOR_TEXT_PRIMARY,
													"&:hover": {
														backgroundColor: "rgba(56, 130, 246, 0.1)",
													},
												},
											},
										},
									}}
								>
									<MenuItem value="all">All Vehicles</MenuItem>
									<MenuItem value="due">Maintenance Due</MenuItem>
								</Select>
							</FormControl>
						</Grid>

						<Grid
							item
							xs={12}
							sx={{ display: "flex", justifyContent: "flex-end" }}
						>
							<Button
								onClick={handleReset}
								sx={{
									color: COLOR_TEXT_SECONDARY,
									"&:hover": {
										color: COLOR_PRIMARY,
										backgroundColor: "rgba(56, 130, 246, 0.1)",
									},
								}}
							>
								Reset Filters
							</Button>
						</Grid>
					</Grid>
				</Box>
			)}
		</Box>
	);
};

export default VehicleFilters;
