import React, { useState, useEffect } from "react";
import {
	Dialog,
	DialogTitle,
	DialogContent,
	DialogActions,
	TextField,
	Button,
	Grid,
	FormControlLabel,
	Switch,
	Box,
	Chip,
	Typography,
	Alert,
} from "@mui/material";
import axios from "axios";
import { BASE_API_URL } from "../../constants";

interface Supplier {
	id?: number;
	name: string;
	contact_person: string;
	email: string;
	phone: string;
	address: string;
	city: string;
	postal_code: string;
	country: string;
	website?: string;
	tax_id?: string;
	rating: number;
	delivery_time_days: number;
	minimum_order_value: number;
	payment_terms: string;
	is_active: boolean;
}

interface SupplierFormProps {
	open: boolean;
	onClose: () => void;
	onSubmit: (supplier: Supplier) => void;
	supplier?: Supplier;
	mode: "add" | "edit";
}

const SupplierForm: React.FC<SupplierFormProps> = ({
	open,
	onClose,
	onSubmit,
	supplier,
	mode,
}) => {
	const [formData, setFormData] = useState<Supplier>({
		name: "",
		contact_person: "",
		email: "",
		phone: "",
		address: "",
		city: "",
		postal_code: "",
		country: "Polska",
		website: "",
		tax_id: "",
		rating: 0,
		delivery_time_days: 7,
		minimum_order_value: 0,
		payment_terms: "30 dni",
		is_active: true,
	});
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		if (supplier && mode === "edit") {
			setFormData(supplier);
		} else {
			// Reset form for add mode
			setFormData({
				name: "",
				contact_person: "",
				email: "",
				phone: "",
				address: "",
				city: "",
				postal_code: "",
				country: "Polska",
				website: "",
				tax_id: "",
				rating: 0,
				delivery_time_days: 7,
				minimum_order_value: 0,
				payment_terms: "30 dni",
				is_active: true,
			});
		}
		setError(null);
	}, [supplier, mode, open]);

	const handleChange = (field: keyof Supplier, value: any) => {
		setFormData((prev) => ({
			...prev,
			[field]: value,
		}));
	};

	const validateForm = (): boolean => {
		if (!formData.name.trim()) {
			setError("Nazwa dostawcy jest wymagana");
			return false;
		}
		if (!formData.email.trim()) {
			setError("Email jest wymagany");
			return false;
		}
		if (!formData.phone.trim()) {
			setError("Telefon jest wymagany");
			return false;
		}
		if (!formData.address.trim()) {
			setError("Adres jest wymagany");
			return false;
		}
		if (!formData.city.trim()) {
			setError("Miasto jest wymagane");
			return false;
		}
		return true;
	};

	const handleSubmit = async () => {
		if (!validateForm()) return;

		setLoading(true);
		setError(null);

		try {
			const token = localStorage.getItem("access_token");
			const config = {
				headers: { Authorization: `Bearer ${token}` },
			};

			let response;
			if (mode === "edit" && supplier?.id) {
				response = await axios.put(
					`${BASE_API_URL}/api/v1/suppliers/${supplier.id}/`,
					formData,
					config
				);
			} else {
				response = await axios.post(
					`${BASE_API_URL}/api/v1/suppliers/`,
					formData,
					config
				);
			}

			onSubmit(response.data);
			onClose();
		} catch (error: any) {
			if (error.response?.data?.detail) {
				setError(error.response.data.detail);
			} else if (error.response?.data) {
				const errorMessages = Object.values(error.response.data).flat();
				setError(errorMessages.join(", "));
			} else {
				setError("Wystąpił błąd podczas zapisywania dostawcy");
			}
		} finally {
			setLoading(false);
		}
	};

	return (
		<Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
			<DialogTitle>
				{mode === "edit" ? "Edytuj dostawcę" : "Dodaj nowego dostawcę"}
			</DialogTitle>

			<DialogContent>
				{error && (
					<Alert severity="error" sx={{ mb: 2 }}>
						{error}
					</Alert>
				)}

				<Grid container spacing={2} sx={{ mt: 1 }}>
					{/* Podstawowe informacje */}
					<Grid item xs={12}>
						<Typography variant="h6" gutterBottom>
							Podstawowe informacje
						</Typography>
					</Grid>

					<Grid item xs={12} md={8}>
						<TextField
							fullWidth
							label="Nazwa dostawcy *"
							value={formData.name}
							onChange={(e) => handleChange("name", e.target.value)}
							required
						/>
					</Grid>

					<Grid item xs={12} md={4}>
						<FormControlLabel
							control={
								<Switch
									checked={formData.is_active}
									onChange={(e) => handleChange("is_active", e.target.checked)}
								/>
							}
							label="Aktywny"
						/>
					</Grid>

					<Grid item xs={12} md={6}>
						<TextField
							fullWidth
							label="Osoba kontaktowa"
							value={formData.contact_person}
							onChange={(e) => handleChange("contact_person", e.target.value)}
						/>
					</Grid>

					<Grid item xs={12} md={6}>
						<TextField
							fullWidth
							label="Email *"
							type="email"
							value={formData.email}
							onChange={(e) => handleChange("email", e.target.value)}
							required
						/>
					</Grid>

					<Grid item xs={12} md={6}>
						<TextField
							fullWidth
							label="Telefon *"
							value={formData.phone}
							onChange={(e) => handleChange("phone", e.target.value)}
							required
						/>
					</Grid>

					<Grid item xs={12} md={6}>
						<TextField
							fullWidth
							label="Strona WWW"
							value={formData.website}
							onChange={(e) => handleChange("website", e.target.value)}
						/>
					</Grid>

					{/* Adres */}
					<Grid item xs={12}>
						<Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
							Adres
						</Typography>
					</Grid>

					<Grid item xs={12}>
						<TextField
							fullWidth
							label="Adres *"
							multiline
							rows={2}
							value={formData.address}
							onChange={(e) => handleChange("address", e.target.value)}
							required
						/>
					</Grid>

					<Grid item xs={12} md={4}>
						<TextField
							fullWidth
							label="Miasto *"
							value={formData.city}
							onChange={(e) => handleChange("city", e.target.value)}
							required
						/>
					</Grid>

					<Grid item xs={12} md={4}>
						<TextField
							fullWidth
							label="Kod pocztowy"
							value={formData.postal_code}
							onChange={(e) => handleChange("postal_code", e.target.value)}
						/>
					</Grid>

					<Grid item xs={12} md={4}>
						<TextField
							fullWidth
							label="Kraj"
							value={formData.country}
							onChange={(e) => handleChange("country", e.target.value)}
						/>
					</Grid>

					{/* Dane biznesowe */}
					<Grid item xs={12}>
						<Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
							Dane biznesowe
						</Typography>
					</Grid>

					<Grid item xs={12} md={6}>
						<TextField
							fullWidth
							label="NIP"
							value={formData.tax_id}
							onChange={(e) => handleChange("tax_id", e.target.value)}
						/>
					</Grid>

					<Grid item xs={12} md={6}>
						<TextField
							fullWidth
							label="Ocena (0-5)"
							type="number"
							inputProps={{ min: 0, max: 5, step: 0.1 }}
							value={formData.rating}
							onChange={(e) =>
								handleChange("rating", parseFloat(e.target.value) || 0)
							}
						/>
					</Grid>

					<Grid item xs={12} md={4}>
						<TextField
							fullWidth
							label="Czas dostawy (dni)"
							type="number"
							inputProps={{ min: 1 }}
							value={formData.delivery_time_days}
							onChange={(e) =>
								handleChange(
									"delivery_time_days",
									parseInt(e.target.value) || 1
								)
							}
						/>
					</Grid>

					<Grid item xs={12} md={4}>
						<TextField
							fullWidth
							label="Min. wartość zamówienia (zł)"
							type="number"
							inputProps={{ min: 0 }}
							value={formData.minimum_order_value}
							onChange={(e) =>
								handleChange(
									"minimum_order_value",
									parseFloat(e.target.value) || 0
								)
							}
						/>
					</Grid>

					<Grid item xs={12} md={4}>
						<TextField
							fullWidth
							label="Warunki płatności"
							value={formData.payment_terms}
							onChange={(e) => handleChange("payment_terms", e.target.value)}
						/>
					</Grid>
				</Grid>
			</DialogContent>

			<DialogActions>
				<Button onClick={onClose} disabled={loading}>
					Anuluj
				</Button>
				<Button onClick={handleSubmit} variant="contained" disabled={loading}>
					{loading
						? "Zapisywanie..."
						: mode === "edit"
						? "Zapisz zmiany"
						: "Dodaj dostawcę"}
				</Button>
			</DialogActions>
		</Dialog>
	);
};

export default SupplierForm;
