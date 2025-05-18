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

// Lista popularnych marek samochodów
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
			{/* Search bar */}
			<TextField
				fullWidth
				variant="outlined"
				placeholder="Search vehicles by make, model or registration number..."
				value={filters.searchTerm}
				onChange={handleSearchChange}
				sx={{ mb: 2 }}
				InputProps={{
					startAdornment: (
						<InputAdornment position="start">
							<SearchIcon />
						</InputAdornment>
					),
					endAdornment: (
						<InputAdornment position="end">
							<Button
								onClick={() => setExpanded(!expanded)}
								startIcon={<FilterListIcon />}
								color="inherit"
							>
								{expanded ? "Hide Filters" : "Show Filters"}
							</Button>
						</InputAdornment>
					),
				}}
			/>

			{/* Advanced filters */}
			{expanded && (
				<Box sx={{ p: 2, bgcolor: "#f5f5f5", borderRadius: 1, mb: 2 }}>
					<Grid container spacing={2}>
						<Grid item xs={12} sm={6} md={3}>
							<TextField
								select
								label="Brand"
								value={filters.brand}
								onChange={(e) => handleFilterChange("brand", e.target.value)}
								fullWidth
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
								<InputLabel id="status-filter-label">Status</InputLabel>
								<Select
									labelId="status-filter-label"
									value={filters.status}
									label="Status"
									onChange={(e) => handleFilterChange("status", e.target.value)}
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
								<InputLabel id="fuel-filter-label">Fuel Type</InputLabel>
								<Select
									labelId="fuel-filter-label"
									value={filters.fuelType}
									label="Fuel Type"
									onChange={(e) =>
										handleFilterChange("fuelType", e.target.value)
									}
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
								<InputLabel id="maintenance-filter-label">
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
							<Button onClick={handleReset}>Reset Filters</Button>
						</Grid>
					</Grid>
				</Box>
			)}
		</Box>
	);
};

export default VehicleFilters;
