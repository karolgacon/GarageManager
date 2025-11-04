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
import {
	COLOR_PRIMARY,
	COLOR_SURFACE,
	COLOR_TEXT_PRIMARY,
	COLOR_TEXT_SECONDARY,
} from "../../constants";

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
		workshop_id: "",
	});

	const [validationErrors, setValidationErrors] = useState<
		Record<string, string>
	>({});

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
			setError("Failed to add service. Please try again.");
		} finally {
			setLoading(false);
		}
	};

	const handleClose = () => {
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
				sx: {
					borderRadius: 2,
					backgroundColor: COLOR_SURFACE,
					border: `1px solid ${COLOR_TEXT_SECONDARY}`,
				},
			}}
		>
			<DialogTitle
				sx={{
					display: "flex",
					justifyContent: "space-between",
					alignItems: "center",
					pb: 1,
					backgroundColor: COLOR_SURFACE,
					color: COLOR_TEXT_PRIMARY,
				}}
			>
				<Typography
					variant="h6"
					component="div"
					fontWeight="bold"
					sx={{ color: COLOR_TEXT_PRIMARY }}
				>
					Add New Service
				</Typography>
				<IconButton
					edge="end"
					onClick={handleClose}
					disabled={loading}
					aria-label="close"
					sx={{ color: COLOR_TEXT_SECONDARY }}
				>
					<CloseIcon />
				</IconButton>
			</DialogTitle>

			<form onSubmit={handleSubmit}>
				<DialogContent
					dividers
					sx={{
						backgroundColor: COLOR_SURFACE,
						borderColor: COLOR_TEXT_SECONDARY,
					}}
				>
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
							/>
						</Grid>

						<Grid item xs={12} md={6}>
							<FormControl fullWidth required>
								<InputLabel
									sx={{
										color: COLOR_TEXT_SECONDARY,
										"&.Mui-focused": { color: COLOR_PRIMARY },
									}}
								>
									Category
								</InputLabel>
								<Select
									label="Category"
									name="category"
									value={formData.category}
									onChange={handleChange}
									disabled={loading}
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
										<InputAdornment
											position="start"
											sx={{ color: COLOR_TEXT_SECONDARY }}
										>
											$
										</InputAdornment>
									),
									inputProps: { min: 0, step: 0.01 },
								}}
								disabled={loading}
								variant="outlined"
								error={!!validationErrors.price}
								helperText={validationErrors.price}
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
							/>
						</Grid>

						<Grid item xs={12} md={6}>
							<FormControl
								fullWidth
								required
								error={!!validationErrors.workshop_id}
							>
								<InputLabel
									sx={{
										color: COLOR_TEXT_SECONDARY,
										"&.Mui-focused": { color: COLOR_PRIMARY },
									}}
								>
									Workshop
								</InputLabel>
								<Select
									label="Workshop"
									name="workshop_id"
									value={formData.workshop_id}
									onChange={handleChange}
									disabled={loading}
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
									{workshops.map((ws) => (
										<MenuItem key={ws.id} value={ws.id}>
											{ws.name}
										</MenuItem>
									))}
								</Select>
								{validationErrors.workshop_id && (
									<FormHelperText sx={{ color: COLOR_TEXT_SECONDARY }}>
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
								sx={{ color: COLOR_TEXT_PRIMARY }}
							/>
							<FormHelperText sx={{ color: COLOR_TEXT_SECONDARY }}>
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

				<DialogActions
					sx={{
						px: 3,
						py: 2,
						backgroundColor: COLOR_SURFACE,
						borderTop: `1px solid ${COLOR_TEXT_SECONDARY}`,
					}}
				>
					<Button
						onClick={handleClose}
						disabled={loading}
						variant="text"
						sx={{
							color: COLOR_TEXT_SECONDARY,
							"&:hover": {
								backgroundColor: "rgba(156, 163, 175, 0.1)",
							},
						}}
					>
						Cancel
					</Button>
					<Button
						type="submit"
						variant="contained"
						color="primary"
						disabled={loading}
						sx={{
							bgcolor: COLOR_PRIMARY,
							color: COLOR_TEXT_PRIMARY,
							"&:hover": {
								bgcolor: "rgba(56, 130, 246, 0.8)",
							},
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
