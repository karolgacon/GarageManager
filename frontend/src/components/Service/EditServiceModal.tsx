import React, { useState, useEffect } from "react";
import {
	Dialog,
	DialogTitle,
	DialogContent,
	DialogActions,
	Button,
	TextField,
	Grid,
	FormControl,
	InputLabel,
	Select,
	MenuItem,
	Typography,
	IconButton,
	InputAdornment,
	FormHelperText,
	Switch,
	FormControlLabel,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { Service, SERVICE_CATEGORY_OPTIONS } from "../../models/ServiceModel";
import { serviceService } from "../../api/ServiceAPIEndpoint";

interface EditServiceModalProps {
	open: boolean;
	onClose: () => void;
	onServiceUpdated: (updatedService: Service) => void;
	service: Service | null;
}

const EditServiceModal: React.FC<EditServiceModalProps> = ({
	open,
	onClose,
	onServiceUpdated,
	service,
}) => {
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [formData, setFormData] = useState<Service>({
		id: 0,
		name: "",
		description: "",
		price: 0,
		duration: 60,
		category: "general",
		is_active: true,
	});
	const [validationErrors, setValidationErrors] = useState<
		Record<string, string>
	>({});

	useEffect(() => {
		if (service) {
			setFormData({
				...service,
			});
		}
	}, [service]);

	const handleChange = (
		e: React.ChangeEvent<HTMLInputElement | { value: unknown; name?: string }>
	) => {
		const { name, value } = e.target as HTMLInputElement;
		setFormData((prev) => ({
			...prev,
			[name as string]: ["price", "duration"].includes(name)
				? parseFloat(value as string) || 0
				: value,
		}));

		if (validationErrors[name]) {
			setValidationErrors((prev) => {
				const newErrors = { ...prev };
				delete newErrors[name];
				return newErrors;
			});
		}
	};

	const handleSwitchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setFormData((prev) => ({
			...prev,
			is_active: e.target.checked,
		}));
	};

	const validateForm = (): boolean => {
		const newErrors: Record<string, string> = {};

		if (!formData.name.trim()) {
			newErrors.name = "Service name is required";
		}

		if (formData.price < 0) {
			newErrors.price = "Price cannot be negative";
		}

		if (formData.duration <= 0) {
			newErrors.duration = "Duration must be greater than 0";
		}

		setValidationErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!service || !formData.id) return;

		if (!validateForm()) {
			return;
		}

		setLoading(true);
		setError(null);

		try {
			const submitData = {
				...formData,
				price: Number(formData.price),
				duration: Number(formData.duration),
			};

			const updatedService = await serviceService.updateService(
				formData.id,
				submitData
			);
			onServiceUpdated(updatedService);
			onClose();
		} catch (error) {
			setError("Failed to update service. Please try again.");
		} finally {
			setLoading(false);
		}
	};

	const handleClose = () => {
		setValidationErrors({});
		setError(null);
		onClose();
	};

	if (!service) {
		return null;
	}

	return (
		<Dialog
			open={open}
			onClose={!loading ? handleClose : undefined}
			maxWidth="md"
			fullWidth
			PaperProps={{
				sx: { borderRadius: 2 },
			}}
		>
			<DialogTitle
				sx={{
					display: "flex",
					justifyContent: "space-between",
					alignItems: "center",
					pb: 1,
				}}
			>
				<Typography variant="h6" component="div" fontWeight="bold">
					Edit Service
				</Typography>
				<IconButton
					edge="end"
					color="inherit"
					onClick={handleClose}
					disabled={loading}
					aria-label="close"
				>
					<CloseIcon />
				</IconButton>
			</DialogTitle>

			<form onSubmit={handleSubmit}>
				<DialogContent dividers>
					<Grid container spacing={2}>
						<Grid item xs={12} md={6}>
							<TextField
								required
								fullWidth
								label="Service Name"
								name="name"
								value={formData.name}
								onChange={handleChange}
								disabled={loading}
								variant="outlined"
								error={!!validationErrors.name}
								helperText={validationErrors.name}
							/>
						</Grid>

						<Grid item xs={12} md={6}>
							<FormControl fullWidth required>
								<InputLabel>Category</InputLabel>
								<Select
									label="Category"
									name="category"
									value={formData.category}
									onChange={handleChange}
									disabled={loading}
								>
									{SERVICE_CATEGORY_OPTIONS.map((category) => (
										<MenuItem key={category.value} value={category.value}>
											{category.label}
										</MenuItem>
									))}
								</Select>
							</FormControl>
						</Grid>

						<Grid item xs={12} md={6}>
							<TextField
								required
								fullWidth
								type="number"
								label="Price"
								name="price"
								value={formData.price}
								onChange={handleChange}
								InputProps={{
									startAdornment: (
										<InputAdornment position="start">$</InputAdornment>
									),
									inputProps: { min: 0, step: 0.01 },
								}}
								disabled={loading}
								variant="outlined"
								error={!!validationErrors.price}
								helperText={validationErrors.price}
							/>
						</Grid>

						<Grid item xs={12} md={6}>
							<TextField
								required
								fullWidth
								type="number"
								label="Duration (minutes)"
								name="duration"
								value={formData.duration}
								onChange={handleChange}
								InputProps={{
									inputProps: { min: 1 },
								}}
								disabled={loading}
								variant="outlined"
								error={!!validationErrors.duration}
								helperText={validationErrors.duration}
							/>
						</Grid>

						<Grid item xs={12}>
							<TextField
								fullWidth
								label="Description"
								name="description"
								value={formData.description}
								onChange={handleChange}
								disabled={loading}
								variant="outlined"
								multiline
								rows={3}
							/>
						</Grid>

						<Grid item xs={12}>
							<FormControlLabel
								control={
									<Switch
										checked={formData.is_active}
										onChange={handleSwitchChange}
										name="is_active"
										color="primary"
									/>
								}
								label="Service Active"
							/>
							<FormHelperText>
								Inactive services won't be available for selection in
								appointments
							</FormHelperText>
						</Grid>
					</Grid>

					{error && (
						<Typography color="error" variant="body2" sx={{ mt: 2 }}>
							{error}
						</Typography>
					)}
				</DialogContent>

				<DialogActions sx={{ px: 3, py: 2 }}>
					<Button onClick={handleClose} disabled={loading} variant="text">
						Cancel
					</Button>
					<Button
						type="submit"
						variant="contained"
						color="primary"
						disabled={loading}
						sx={{
							bgcolor: "#ff3c4e",
							"&:hover": { bgcolor: "#d6303f" },
						}}
					>
						{loading ? "Updating Service..." : "Update Service"}
					</Button>
				</DialogActions>
			</form>
		</Dialog>
	);
};

export default EditServiceModal;
