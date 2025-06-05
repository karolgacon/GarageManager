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
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { Part, CATEGORY_OPTIONS } from "../../models/PartModel";
import { inventoryService } from "../../api/PartAPIEndpoint";

interface EditItemModalProps {
	open: boolean;
	onClose: () => void;
	onItemUpdated: (updatedItem: Part) => void;
	part: Part | null;
}

const EditItemModal: React.FC<EditItemModalProps> = ({
	open,
	onClose,
	onItemUpdated,
	part,
}) => {
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [formData, setFormData] = useState<Part>({
		id: 0,
		name: "",
		manufacturer: "",
		price: 0,
		stock_quantity: 0,
		minimum_stock_level: 5,
		category: "body",
		supplier: "",
	});

	useEffect(() => {
		if (part) {
			setFormData({
				...part,
			});
		}
	}, [part]);

	const handleChange = (
		e: React.ChangeEvent<HTMLInputElement | { value: unknown; name?: string }>
	) => {
		const { name, value } = e.target as HTMLInputElement;
		setFormData((prev) => ({
			...prev,
			[name as string]: [
				"stock_quantity",
				"price",
				"minimum_stock_level",
			].includes(name)
				? parseFloat(value as string) || 0
				: value,
		}));
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!formData.id) return;

		setLoading(true);
		setError(null);

		try {
			const submitData = {
				...formData,
				price: Number(formData.price),
				stock_quantity: Number(formData.stock_quantity),
				minimum_stock_level: Number(formData.minimum_stock_level),
			};

			const updatedPart = await inventoryService.updatePart(
				formData.id,
				submitData
			);
			onItemUpdated(updatedPart);
			onClose();
		} catch (error) {
			setError("Failed to update item. Please try again.");
		} finally {
			setLoading(false);
		}
	};

	const manufacturers = [
		{ value: "autopartner", label: "AutoPartner" },
		{ value: "intercars", label: "InterCars" },
		{ value: "bosch", label: "Bosch" },
		{ value: "continental", label: "Continental" },
		{ value: "denso", label: "Denso" },
		{ value: "valeo", label: "Valeo" },
		{ value: "trw", label: "TRW" },
		{ value: "febi", label: "Febi Bilstein" },
		{ value: "sachs", label: "Sachs" },
		{ value: "monroe", label: "Monroe" },
		{ value: "hella", label: "Hella" },
		{ value: "brembo", label: "Brembo" },
		{ value: "mahle", label: "Mahle" },
		{ value: "delphi", label: "Delphi" },
		{ value: "ngk", label: "NGK" },
		{ value: "other", label: "Other" },
	];

	const suppliers = [
		"AutoPartner",
		"InterCars",
		"APMotors",
		"Gordon",
		"Moto-Profil",
		"Local supplier",
		"Other",
	];

	if (!part) {
		return null;
	}

	return (
		<Dialog
			open={open}
			onClose={!loading ? onClose : undefined}
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
					Edit Inventory Item
				</Typography>
				<IconButton
					edge="end"
					color="inherit"
					onClick={onClose}
					disabled={loading}
					aria-label="close"
				>
					<CloseIcon />
				</IconButton>
			</DialogTitle>

			<form onSubmit={handleSubmit}>
				<DialogContent dividers>
					<Grid container spacing={2}>
						<Grid item xs={12}>
							<TextField
								required
								fullWidth
								label="Product Name"
								name="name"
								value={formData.name}
								onChange={handleChange}
								disabled={loading}
								variant="outlined"
							/>
						</Grid>

						<Grid item xs={12} md={6}>
							<FormControl fullWidth required>
								<InputLabel>Manufacturer</InputLabel>
								<Select
									label="Manufacturer"
									name="manufacturer"
									value={formData.manufacturer}
									onChange={handleChange}
									disabled={loading}
								>
									{manufacturers.map((manufacturer) => (
										<MenuItem
											key={manufacturer.value}
											value={manufacturer.value}
										>
											{manufacturer.label}
										</MenuItem>
									))}
								</Select>
							</FormControl>
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
									{CATEGORY_OPTIONS.map((category) => (
										<MenuItem key={category.value} value={category.value}>
											{category.label}
										</MenuItem>
									))}
								</Select>
							</FormControl>
						</Grid>

						<Grid item xs={12} md={4}>
							<TextField
								required
								fullWidth
								type="number"
								label="Stock Quantity"
								name="stock_quantity"
								value={formData.stock_quantity}
								onChange={handleChange}
								InputProps={{
									inputProps: { min: 0 },
								}}
								disabled={loading}
								variant="outlined"
							/>
						</Grid>

						<Grid item xs={12} md={4}>
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
							/>
						</Grid>

						<Grid item xs={12} md={4}>
							<TextField
								fullWidth
								type="number"
								label="Minimum Stock Level"
								name="minimum_stock_level"
								value={formData.minimum_stock_level}
								onChange={handleChange}
								InputProps={{
									inputProps: { min: 0 },
								}}
								disabled={loading}
								variant="outlined"
							/>
						</Grid>

						<Grid item xs={12}>
							<FormControl fullWidth>
								<InputLabel>Supplier</InputLabel>
								<Select
									label="Supplier"
									name="supplier"
									value={formData.supplier || ""}
									onChange={handleChange}
									disabled={loading}
								>
									{suppliers.map((supplier) => (
										<MenuItem key={supplier} value={supplier.toLowerCase()}>
											{supplier}
										</MenuItem>
									))}
								</Select>
							</FormControl>
						</Grid>
					</Grid>

					{error && (
						<Typography color="error" variant="body2" sx={{ mt: 2 }}>
							{error}
						</Typography>
					)}
				</DialogContent>

				<DialogActions sx={{ px: 3, py: 2 }}>
					<Button onClick={onClose} disabled={loading} variant="text">
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
						{loading ? "Updating Item..." : "Update Item"}
					</Button>
				</DialogActions>
			</form>
		</Dialog>
	);
};

export default EditItemModal;
