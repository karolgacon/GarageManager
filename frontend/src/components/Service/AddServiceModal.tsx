import React, { useState, useContext, useEffect } from "react";
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
import { workshopService } from "../../api/WorkshopAPIEndpoint";
import AuthContext from "../../context/AuthProvider";

interface AddServiceModalProps {
	open: boolean;
	onClose: () => void;
	onServiceAdded: (newService: Service) => void;
}

const AddServiceModal: React.FC<AddServiceModalProps> = ({
	open,
	onClose,
	onServiceAdded,
}) => {
	const { auth } = useContext(AuthContext);

	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [workshops, setWorkshops] = useState<any[]>([]);
	const [formData, setFormData] = useState<any>({
		name: "",
		description: "",
		price: 0,
		duration: 60,
		category: "general",
		is_active: true,
		workshop_id: "", // <-- dodaj to pole
	});

	const [validationErrors, setValidationErrors] = useState<
		Record<string, string>
	>({});

	// Pobierz warsztaty przy otwarciu modala
	useEffect(() => {
		if (open) {
			workshopService.getAllWorkshops().then(setWorkshops);
		}
	}, [open]);

	const handleChange = (
		e: React.ChangeEvent<HTMLInputElement | { value: unknown; name?: string }>
	) => {
		const { name, value } = e.target as HTMLInputElement;
		setFormData((prev: any) => ({
			...prev,
			[name as string]: ["price", "duration"].includes(name)
				? parseFloat(value as string) || 0
				: value,
		}));

		// Clear validation error when field is edited
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

		if (!formData.workshop_id) {
			newErrors.workshop_id = "Workshop selection is required";
		}

		setValidationErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!validateForm()) {
			return;
		}

		setLoading(true);
		setError(null);

		try {
			const submitData: any = {
				...formData,
				price: Number(formData.price),
				estimated_duration: Number(formData.duration),
			};
			delete submitData.duration;
			delete submitData.is_active;

			const newService = await serviceService.createService(submitData);
			onServiceAdded(newService);
			onClose();

			// Reset form
			setFormData({
				name: "",
				description: "",
				price: 0,
				duration: 60,
				category: "general",
				is_active: true,
				workshop_id: "",
			});
		} catch (error) {
			console.error("Error adding service:", error);
			setError("Failed to add service. Please try again.");
		} finally {
			setLoading(false);
		}
	};

	const handleClose = () => {
		// Reset form and errors on close
		setValidationErrors({});
		setError(null);
		onClose();
	};

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
					Add New Service
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

						<Grid item xs={12} md={6}>
							<FormControl
								fullWidth
								required
								error={!!validationErrors.workshop_id}
							>
								<InputLabel>Workshop</InputLabel>
								<Select
									label="Workshop"
									name="workshop_id"
									value={formData.workshop_id}
									onChange={handleChange}
									disabled={loading}
								>
									{workshops.map((ws) => (
										<MenuItem key={ws.id} value={ws.id}>
											{ws.name}
										</MenuItem>
									))}
								</Select>
								{validationErrors.workshop_id && (
									<FormHelperText>
										{validationErrors.workshop_id}
									</FormHelperText>
								)}
							</FormControl>
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
						{loading ? "Adding Service..." : "Add Service"}
					</Button>
				</DialogActions>
			</form>
		</Dialog>
	);
};

export default AddServiceModal;
