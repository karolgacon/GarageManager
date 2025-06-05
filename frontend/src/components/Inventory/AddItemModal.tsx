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
	CircularProgress,
	Alert,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { Part, CATEGORY_OPTIONS } from "../../models/PartModel";
import { inventoryService } from "../../api/PartAPIEndpoint";
import { workshopService, Workshop } from "../../api/WorkshopAPIEndpoint";
import AuthContext from "../../context/AuthProvider";

interface AddItemModalProps {
	open: boolean;
	onClose: () => void;
	onItemAdded: (newItem: Part) => void;
}

const AddItemModal: React.FC<AddItemModalProps> = ({
	open,
	onClose,
	onItemAdded,
}) => {
	const { isAdmin, isOwner, isMechanic } = React.useContext(AuthContext);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [workshops, setWorkshops] = useState<Workshop[]>([]);
	const [loadingWorkshops, setLoadingWorkshops] = useState(false);

	const [formData, setFormData] = useState<Omit<Part, "id">>({
		name: "",
		manufacturer: "",
		price: 0,
		stock_quantity: 0,
		minimum_stock_level: 5,
		category: "body",
		supplier: "",
		workshop_id: undefined, 
	});

	useEffect(() => {
		if (!open) return;

		const fetchWorkshopData = async () => {
			try {
				setLoadingWorkshops(true);

				const workshopList = await workshopService.getAllWorkshops();
				setWorkshops(workshopList);

				if (workshopList.length === 0) {
					setError(
						"No workshops found in the system. Please add a workshop first."
					);
					return;
				}

				if (!isAdmin()) {
					try {
						const userWorkshop = await workshopService.getCurrentUserWorkshop();
						setFormData((prev) => ({ ...prev, workshop_id: userWorkshop.id }));
					} catch (error) {
						setFormData((prev) => ({
							...prev,
							workshop_id: workshopList[0].id,
						}));
					}
				} else {
					setFormData((prev) => ({ ...prev, workshop_id: workshopList[0].id }));
				}
			} catch (error) {
				setError("Failed to load workshop information. Please try again.");
			} finally {
				setLoadingWorkshops(false);
			}
		};

		fetchWorkshopData();
	}, [open, isAdmin, isOwner, isMechanic]);

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
				"workshop_id",
			].includes(name)
				? parseFloat(value as string) || 0
				: value,
		}));
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setLoading(true);
		setError(null);

		try {
			if (!formData.workshop_id) {
				throw new Error("Workshop selection is required");
			}

			const dataToSend = {
				...formData,
				price: Number(formData.price),
				stock_quantity: Number(formData.stock_quantity),
				minimum_stock_level: Number(formData.minimum_stock_level),
			};

			const newPart = await inventoryService.createPart(dataToSend);
			onItemAdded(newPart);
			onClose();
		} catch (error) {

			let errorMessage = "Failed to add inventory item. Please try again.";
			if (error.response && error.response.data) {
				const errorData = error.response.data;
				if (typeof errorData === "string") {
					errorMessage = errorData;
				} else if (typeof errorData === "object") {
					const firstErrorKey = Object.keys(errorData)[0];
					if (firstErrorKey) {
						errorMessage = `${firstErrorKey}: ${errorData[firstErrorKey]}`;
					}
				}
			} else if (error.message) {
				errorMessage = error.message;
			}

			setError(errorMessage);
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
					Add New Inventory Item
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
					{error && (
						<Alert severity="error" sx={{ mb: 2 }}>
							{error}
						</Alert>
					)}

					{!isAdmin() && workshops.length > 0 && formData.workshop_id && (
						<Alert severity="info" sx={{ mb: 2 }}>
							This item will be added to the workshop:{" "}
							<strong>
								{workshops.find((w) => w.id === formData.workshop_id)?.name ||
									"Unknown"}
							</strong>
						</Alert>
					)}

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

						<Grid item xs={12}>
							<FormControl fullWidth required>
								<InputLabel>Workshop</InputLabel>
								<Select
									label="Workshop"
									name="workshop_id"
									value={formData.workshop_id || ""}
									onChange={handleChange}
									disabled={
										loading ||
										loadingWorkshops ||
										(!isAdmin() && workshops.length === 1)
									}
									startAdornment={
										loadingWorkshops ? (
											<InputAdornment position="start">
												<CircularProgress size={20} />
											</InputAdornment>
										) : null
									}
								>
									{workshops.map((workshop) => (
										<MenuItem key={workshop.id} value={workshop.id}>
											{workshop.name}
										</MenuItem>
									))}
								</Select>
							</FormControl>
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
				</DialogContent>

				<DialogActions sx={{ px: 3, py: 2 }}>
					<Button onClick={onClose} disabled={loading} variant="text">
						Cancel
					</Button>
					<Button
						type="submit"
						variant="contained"
						color="primary"
						disabled={loading || loadingWorkshops}
						sx={{
							bgcolor: "#ff3c4e",
							"&:hover": { bgcolor: "#d6303f" },
						}}
					>
						{loading ? "Adding Item..." : "Add Item"}
					</Button>
				</DialogActions>
			</form>
		</Dialog>
	);
};

export default AddItemModal;
