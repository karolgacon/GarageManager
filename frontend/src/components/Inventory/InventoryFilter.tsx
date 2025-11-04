import React, { useState } from "react";
import {
	Box,
	Grid,
	Typography,
	TextField,
	Button,
	FormControl,
	RadioGroup,
	FormControlLabel,
	Radio,
	Slider,
	Select,
	MenuItem,
} from "@mui/material";
import {
	COLOR_PRIMARY,
	COLOR_SURFACE,
	COLOR_TEXT_PRIMARY,
	COLOR_TEXT_SECONDARY,
} from "../../constants";

interface FilterOptions {
	priceRange: [number, number];
	category: string;
	availability: string;
	supplier: string;
}

interface InventoryFilterProps {
	onApplyFilters?: (filters: FilterOptions) => void;
}

const InventoryFilter: React.FC<InventoryFilterProps> = ({
	onApplyFilters,
}) => {
	const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000]);
	const [category, setCategory] = useState<string>("");
	const [availability, setAvailability] = useState<string>("all");
	const [supplier, setSupplier] = useState<string>("");

	const handlePriceChange = (event: Event, newValue: number | number[]) => {
		setPriceRange(newValue as [number, number]);
	};

	const handleMinPriceChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		const min = Number(event.target.value);
		setPriceRange([min, priceRange[1]]);
	};

	const handleMaxPriceChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		const max = Number(event.target.value);
		setPriceRange([priceRange[0], max]);
	};

	const handleCategoryChange = (
		event: React.ChangeEvent<{ value: unknown }>
	) => {
		setCategory(event.target.value as string);
	};

	const handleAvailabilityChange = (
		event: React.ChangeEvent<HTMLInputElement>
	) => {
		setAvailability(event.target.value);
	};

	const handleSupplierChange = (
		event: React.ChangeEvent<{ value: unknown }>
	) => {
		setSupplier(event.target.value as string);
	};

	const handleClearFilters = () => {
		setPriceRange([0, 1000]);
		setCategory("");
		setSupplier("");
		setAvailability("all");
	};

	const handleApplyFilters = () => {
		if (onApplyFilters) {
			onApplyFilters({
				priceRange,
				category,
				availability,
				supplier,
			});
		}
	};

	return (
		<Box
			sx={{
				p: 2,
				mb: 2,
				bgcolor: COLOR_SURFACE,
				borderRadius: 1,
				border: `1px solid ${COLOR_TEXT_SECONDARY}`,
			}}
		>
			<Typography
				variant="subtitle1"
				fontWeight="bold"
				mb={2}
				sx={{ color: COLOR_TEXT_PRIMARY }}
			>
				Filter Options
			</Typography>
			<Grid container spacing={3}>
				<Grid item xs={12} md={3}>
					<FormControl fullWidth>
						<Typography
							variant="body2"
							gutterBottom
							sx={{ color: COLOR_TEXT_PRIMARY }}
						>
							Price Range
						</Typography>
						<Slider
							value={priceRange}
							onChange={handlePriceChange}
							valueLabelDisplay="auto"
							min={0}
							max={1000}
							sx={{
								color: COLOR_PRIMARY,
								"& .MuiSlider-thumb": {
									backgroundColor: COLOR_PRIMARY,
								},
								"& .MuiSlider-track": {
									backgroundColor: COLOR_PRIMARY,
								},
								"& .MuiSlider-rail": {
									backgroundColor: COLOR_TEXT_SECONDARY,
								},
							}}
						/>
						<Box sx={{ display: "flex", justifyContent: "space-between" }}>
							<TextField
								size="small"
								label="Min"
								type="number"
								value={priceRange[0]}
								onChange={handleMinPriceChange}
								sx={{
									width: "48%",
									"& .MuiOutlinedInput-root": {
										backgroundColor: COLOR_SURFACE,
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
									},
									"& .MuiInputLabel-root.Mui-focused": {
										color: COLOR_PRIMARY,
									},
								}}
							/>
							<TextField
								size="small"
								label="Max"
								type="number"
								value={priceRange[1]}
								onChange={handleMaxPriceChange}
								sx={{
									width: "48%",
									"& .MuiOutlinedInput-root": {
										backgroundColor: COLOR_SURFACE,
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
									},
									"& .MuiInputLabel-root.Mui-focused": {
										color: COLOR_PRIMARY,
									},
								}}
							/>
						</Box>
					</FormControl>
				</Grid>
				<Grid item xs={12} md={3}>
					<FormControl fullWidth>
						<Typography
							variant="body2"
							gutterBottom
							sx={{ color: COLOR_TEXT_PRIMARY }}
						>
							Category
						</Typography>
						<Select
							value={category}
							onChange={handleCategoryChange}
							displayEmpty
							size="small"
							sx={{
								backgroundColor: COLOR_SURFACE,
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
							<MenuItem value="">All Categories</MenuItem>
							<MenuItem value="engine">Engine Parts</MenuItem>
							<MenuItem value="brake">Brake System</MenuItem>
							<MenuItem value="suspension">Suspension</MenuItem>
							<MenuItem value="electrical">Electrical</MenuItem>
							<MenuItem value="body">Body Parts</MenuItem>
						</Select>
					</FormControl>
				</Grid>
				<Grid item xs={12} md={3}>
					<FormControl fullWidth>
						<Typography
							variant="body2"
							gutterBottom
							sx={{ color: COLOR_TEXT_PRIMARY }}
						>
							Supplier
						</Typography>
						<Select
							value={supplier}
							onChange={handleSupplierChange}
							displayEmpty
							size="small"
							sx={{
								backgroundColor: COLOR_SURFACE,
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
							<MenuItem value="">All Suppliers</MenuItem>
							<MenuItem value="bosch">Bosch</MenuItem>
							<MenuItem value="continental">Continental</MenuItem>
							<MenuItem value="denso">Denso</MenuItem>
							<MenuItem value="valeo">Valeo</MenuItem>
						</Select>
					</FormControl>
				</Grid>
				<Grid item xs={12} md={3}>
					<FormControl component="fieldset">
						<Typography
							variant="body2"
							gutterBottom
							sx={{ color: COLOR_TEXT_PRIMARY }}
						>
							Availability
						</Typography>
						<RadioGroup
							value={availability}
							onChange={handleAvailabilityChange}
						>
							<FormControlLabel
								value="all"
								control={
									<Radio
										sx={{
											color: COLOR_TEXT_SECONDARY,
											"&.Mui-checked": {
												color: COLOR_PRIMARY,
											},
										}}
									/>
								}
								label={
									<Typography sx={{ color: COLOR_TEXT_PRIMARY }}>
										All
									</Typography>
								}
							/>
							<FormControlLabel
								value="inStock"
								control={
									<Radio
										sx={{
											color: COLOR_TEXT_SECONDARY,
											"&.Mui-checked": {
												color: COLOR_PRIMARY,
											},
										}}
									/>
								}
								label={
									<Typography sx={{ color: COLOR_TEXT_PRIMARY }}>
										In Stock
									</Typography>
								}
							/>
							<FormControlLabel
								value="lowStock"
								control={
									<Radio
										sx={{
											color: COLOR_TEXT_SECONDARY,
											"&.Mui-checked": {
												color: COLOR_PRIMARY,
											},
										}}
									/>
								}
								label={
									<Typography sx={{ color: COLOR_TEXT_PRIMARY }}>
										Low Stock
									</Typography>
								}
							/>
							<FormControlLabel
								value="outOfStock"
								control={
									<Radio
										sx={{
											color: COLOR_TEXT_SECONDARY,
											"&.Mui-checked": {
												color: COLOR_PRIMARY,
											},
										}}
									/>
								}
								label={
									<Typography sx={{ color: COLOR_TEXT_PRIMARY }}>
										Out of Stock
									</Typography>
								}
							/>
						</RadioGroup>
					</FormControl>
				</Grid>
			</Grid>
			<Box sx={{ display: "flex", justifyContent: "flex-end", mt: 2 }}>
				<Button
					variant="outlined"
					onClick={handleClearFilters}
					sx={{
						mr: 1,
						borderColor: COLOR_TEXT_SECONDARY,
						color: COLOR_TEXT_SECONDARY,
						"&:hover": {
							borderColor: COLOR_PRIMARY,
							backgroundColor: "rgba(56, 130, 246, 0.1)",
						},
					}}
				>
					Clear Filters
				</Button>
				<Button
					variant="contained"
					onClick={handleApplyFilters}
					sx={{
						bgcolor: COLOR_PRIMARY,
						"&:hover": { bgcolor: "#2563EB" },
					}}
				>
					Apply Filters
				</Button>
			</Box>
		</Box>
	);
};

export default InventoryFilter;
