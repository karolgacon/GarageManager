import React, {
	useState,
	useEffect,
	forwardRef,
	useImperativeHandle,
} from "react";
import {
	Box,
	TextField,
	MenuItem,
	Grid,
	Button,
	InputAdornment,
	FormHelperText,
	Typography,
	CircularProgress,
} from "@mui/material";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { LocalizationProvider, DatePicker } from "@mui/x-date-pickers";
import {
	Vehicle,
	VEHICLE_FUEL_TYPES,
	VEHICLE_TRANSMISSION_TYPES,
	VEHICLE_STATUS_TYPES,
	defaultVehicle,
} from "../../models/VehicleModel";
import { COLOR_PRIMARY } from "../../constants";

interface VehicleFormProps {
	initialData?: Vehicle;
	onSubmit?: (data: Partial<Vehicle>) => void;
	isLoading?: boolean;
	error?: string | null;
	enableInternalButtons?: boolean;
}

const VehicleForm = forwardRef<
	{ validateAndSubmit: () => boolean },
	VehicleFormProps
>((props, ref) => {
	const {
		initialData = defaultVehicle,
		onSubmit,
		isLoading,
		error,
		enableInternalButtons = false,
	} = props;

	const [formData, setFormData] = useState<Partial<Vehicle>>(initialData);
	const [formErrors, setFormErrors] = useState<Record<string, string>>({});

	useEffect(() => {
		setFormData(initialData);
	}, [initialData]);

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const { name, value } = e.target;
		setFormData({
			...formData,
			[name]: value,
		});

		if (formErrors[name]) {
			setFormErrors({
				...formErrors,
				[name]: "",
			});
		}
	};

	const validateForm = (): boolean => {
		const errors: Record<string, string> = {};

		if (!formData.brand) {
			errors.brand = "Brand is required";
		}

		if (!formData.model) {
			errors.model = "Model is required";
		}

		if (!formData.year) {
			errors.year = "Year is required";
		} else if (
			formData.year < 1900 ||
			formData.year > new Date().getFullYear() + 1
		) {
			errors.year = "Please enter a valid year";
		}

		if (!formData.registration_number) {
			errors.registration_number = "Registration number is required";
		}

		if (!formData.vin) {
			errors.vin = "VIN is required";
		}

		if (formData.mileage === undefined) {
			errors.mileage = "Mileage is required";
		} else if (formData.mileage < 0) {
			errors.mileage = "Mileage cannot be negative";
		}

		setFormErrors(errors);
		return Object.keys(errors).length === 0;
	};

	const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();

		if (validateForm()) {
			onSubmit(formData);
		}
	};

	const validateAndSubmit = () => {
		if (validateForm()) {
			if (onSubmit) {
				onSubmit(formData);
			}
			return true;
		}
		return false;
	};

	useImperativeHandle(ref, () => ({
		validateAndSubmit,
	}));

	return (
		<Box component="form" onSubmit={handleSubmit}>
			<Grid container spacing={2}>
				{" "}
				<Grid item xs={12} sm={6}>
					<TextField
						fullWidth
						label="Brand"
						name="brand"
						value={formData.brand || ""}
						onChange={handleChange}
						error={!!formErrors.brand}
						helperText={formErrors.brand}
						disabled={isLoading}
						required
						InputLabelProps={{
							shrink: true,
						}}
						placeholder="Enter the vehicle brand"
					/>
				</Grid>
				<Grid item xs={12} sm={6}>
					<TextField
						fullWidth
						label="Model"
						name="model"
						value={formData.model || ""}
						onChange={handleChange}
						error={!!formErrors.model}
						helperText={formErrors.model}
						disabled={isLoading}
						required
					/>
				</Grid>
				<Grid item xs={12} sm={6}>
					<TextField
						fullWidth
						label="Year"
						name="year"
						type="number"
						value={formData.year || ""}
						onChange={handleChange}
						error={!!formErrors.year}
						helperText={formErrors.year}
						disabled={isLoading}
						required
						inputProps={{ min: 1900, max: new Date().getFullYear() + 1 }}
					/>
				</Grid>
				<Grid item xs={12} sm={6}>
					<TextField
						fullWidth
						label="Registration Number"
						name="registration_number"
						value={formData.registration_number || ""}
						onChange={handleChange}
						error={!!formErrors.registration_number}
						helperText={formErrors.registration_number}
						disabled={isLoading}
						required
					/>
				</Grid>
				<Grid item xs={12}>
					<TextField
						fullWidth
						label="VIN (Vehicle Identification Number)"
						name="vin"
						value={formData.vin || ""}
						onChange={handleChange}
						error={!!formErrors.vin}
						helperText={formErrors.vin}
						disabled={isLoading}
						required
					/>
				</Grid>
				<Grid item xs={12} sm={6}>
					<TextField
						fullWidth
						label="Color"
						name="color"
						value={formData.color || ""}
						onChange={handleChange}
						disabled={isLoading}
					/>
				</Grid>
				<Grid item xs={12} sm={6}>
					<TextField
						fullWidth
						label="Mileage"
						name="mileage"
						type="number"
						value={formData.mileage === undefined ? "" : formData.mileage}
						onChange={handleChange}
						InputProps={{
							endAdornment: <InputAdornment position="end">km</InputAdornment>,
						}}
						error={!!formErrors.mileage}
						helperText={formErrors.mileage}
						disabled={isLoading}
						required
					/>
				</Grid>
				<Grid item xs={12} sm={4}>
					<TextField
						fullWidth
						select
						label="Fuel Type"
						name="fuel_type"
						value={formData.fuel_type || "petrol"}
						onChange={handleChange}
						disabled={isLoading}
					>
						{VEHICLE_FUEL_TYPES.map((option) => (
							<MenuItem key={option.value} value={option.value}>
								{option.label}
							</MenuItem>
						))}
					</TextField>
				</Grid>
				<Grid item xs={12} sm={4}>
					<TextField
						fullWidth
						select
						label="Transmission"
						name="transmission"
						value={formData.transmission || "manual"}
						onChange={handleChange}
						disabled={isLoading}
					>
						{VEHICLE_TRANSMISSION_TYPES.map((option) => (
							<MenuItem key={option.value} value={option.value}>
								{option.label}
							</MenuItem>
						))}
					</TextField>
				</Grid>
				<Grid item xs={12} sm={4}>
					<TextField
						fullWidth
						select
						label="Status"
						name="status"
						value={formData.status || "active"}
						onChange={handleChange}
						disabled={isLoading}
					>
						{VEHICLE_STATUS_TYPES.map((option) => (
							<MenuItem key={option.value} value={option.value}>
								{option.label}
							</MenuItem>
						))}
					</TextField>
				</Grid>
				<Grid item xs={12}>
					<TextField
						fullWidth
						label="Notes"
						name="notes"
						value={formData.notes || ""}
						onChange={handleChange}
						multiline
						rows={3}
						disabled={isLoading}
						placeholder="Additional information about the vehicle"
					/>
				</Grid>
			</Grid>

			{error && (
				<Box sx={{ mt: 2 }}>
					<FormHelperText error>{error}</FormHelperText>
				</Box>
			)}

			{enableInternalButtons && (
				<Box sx={{ mt: 3, textAlign: "right" }}>
					<Button
						type="submit"
						variant="contained"
						disabled={isLoading}
						sx={{
							bgcolor: COLOR_PRIMARY,
							"&:hover": { bgcolor: "#2563EB" },
						}}
					>
						{isLoading ? (
							<CircularProgress size={24} color="inherit" />
						) : (
							"Next"
						)}
					</Button>
				</Box>
			)}
		</Box>
	);
});

export default VehicleForm;
