import React, { useState, useEffect } from "react";
import {
	Box,
	Typography,
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableRow,
	Paper,
	Button,
	Chip,
	IconButton,
	TextField,
	InputAdornment,
	Tooltip,
	Dialog,
	DialogTitle,
	DialogContent,
	DialogActions,
} from "@mui/material";
import {
	Add as AddIcon,
	Edit as EditIcon,
	Delete as DeleteIcon,
	Search as SearchIcon,
	Email as EmailIcon,
	Phone as PhoneIcon,
	LocationOn as LocationIcon,
} from "@mui/icons-material";
import axios from "axios";
import { BASE_API_URL } from "../../constants";

interface Supplier {
	id: number;
	name: string;
	contact_person: string;
	email: string;
	phone: string;
	address: string;
	city: string;
	country: string;
	website?: string;
	rating: number;
	delivery_time_days: number;
	minimum_order_value: number;
	payment_terms: string;
	is_active: boolean;
	created_at: string;
}

interface SupplierListProps {
	onEditSupplier?: (supplier: Supplier) => void;
	onAddSupplier?: () => void;
}

const SupplierList: React.FC<SupplierListProps> = ({
	onEditSupplier,
	onAddSupplier,
}) => {
	const [suppliers, setSuppliers] = useState<Supplier[]>([]);
	const [loading, setLoading] = useState(true);
	const [searchQuery, setSearchQuery] = useState("");
	const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
	const [supplierToDelete, setSupplierToDelete] = useState<Supplier | null>(
		null
	);

	useEffect(() => {
		fetchSuppliers();
	}, []);

	const fetchSuppliers = async () => {
		try {
			const token = localStorage.getItem("access_token");
			const response = await axios.get(`${BASE_API_URL}/api/v1/suppliers/`, {
				headers: { Authorization: `Bearer ${token}` },
			});
			setSuppliers(response.data);
		} catch (error) {
			console.error("Error fetching suppliers:", error);
		} finally {
			setLoading(false);
		}
	};

	const handleSearch = async () => {
		if (!searchQuery.trim()) {
			fetchSuppliers();
			return;
		}

		try {
			const token = localStorage.getItem("access_token");
			const response = await axios.get(
				`${BASE_API_URL}/api/v1/suppliers/search/?q=${searchQuery}`,
				{
					headers: { Authorization: `Bearer ${token}` },
				}
			);
			setSuppliers(response.data);
		} catch (error) {
			console.error("Error searching suppliers:", error);
		}
	};

	const handleDeleteClick = (supplier: Supplier) => {
		setSupplierToDelete(supplier);
		setDeleteDialogOpen(true);
	};

	const handleDeleteConfirm = async () => {
		if (!supplierToDelete) return;

		try {
			const token = localStorage.getItem("access_token");
			await axios.delete(
				`${BASE_API_URL}/api/v1/suppliers/${supplierToDelete.id}/`,
				{
					headers: { Authorization: `Bearer ${token}` },
				}
			);

			setSuppliers(suppliers.filter((s) => s.id !== supplierToDelete.id));
			setDeleteDialogOpen(false);
			setSupplierToDelete(null);
		} catch (error) {
			console.error("Error deleting supplier:", error);
		}
	};

	const formatRating = (rating: number) => {
		return (
			<Chip
				label={`${rating}/5`}
				color={rating >= 4 ? "success" : rating >= 3 ? "warning" : "error"}
				size="small"
			/>
		);
	};

	if (loading) {
		return (
			<Box
				display="flex"
				justifyContent="center"
				alignItems="center"
				minHeight="400px"
			>
				<Typography>Ładowanie dostawców...</Typography>
			</Box>
		);
	}

	return (
		<Box>
			{/* Header */}
			<Box
				display="flex"
				justifyContent="space-between"
				alignItems="center"
				mb={3}
			>
				<Typography variant="h4" component="h1">
					Dostawcy części
				</Typography>
				<Button
					variant="contained"
					startIcon={<AddIcon />}
					onClick={onAddSupplier}
				>
					Dodaj dostawcę
				</Button>
			</Box>

			{/* Search */}
			<Box mb={3}>
				<TextField
					fullWidth
					placeholder="Szukaj dostawców..."
					value={searchQuery}
					onChange={(e) => setSearchQuery(e.target.value)}
					onKeyPress={(e) => e.key === "Enter" && handleSearch()}
					InputProps={{
						startAdornment: (
							<InputAdornment position="start">
								<SearchIcon />
							</InputAdornment>
						),
						endAdornment: (
							<InputAdornment position="end">
								<Button onClick={handleSearch}>Szukaj</Button>
							</InputAdornment>
						),
					}}
				/>
			</Box>

			{/* Table */}
			<TableContainer component={Paper}>
				<Table>
					<TableHead>
						<TableRow>
							<TableCell>Nazwa</TableCell>
							<TableCell>Kontakt</TableCell>
							<TableCell>Lokalizacja</TableCell>
							<TableCell>Ocena</TableCell>
							<TableCell>Dostawa</TableCell>
							<TableCell>Status</TableCell>
							<TableCell align="center">Akcje</TableCell>
						</TableRow>
					</TableHead>
					<TableBody>
						{suppliers.map((supplier) => (
							<TableRow key={supplier.id} hover>
								<TableCell>
									<Box>
										<Typography variant="subtitle2" fontWeight="bold">
											{supplier.name}
										</Typography>
										{supplier.contact_person && (
											<Typography variant="body2" color="text.secondary">
												{supplier.contact_person}
											</Typography>
										)}
									</Box>
								</TableCell>
								<TableCell>
									<Box display="flex" flexDirection="column" gap={0.5}>
										<Box display="flex" alignItems="center" gap={1}>
											<EmailIcon fontSize="small" color="action" />
											<Typography variant="body2">{supplier.email}</Typography>
										</Box>
										<Box display="flex" alignItems="center" gap={1}>
											<PhoneIcon fontSize="small" color="action" />
											<Typography variant="body2">{supplier.phone}</Typography>
										</Box>
									</Box>
								</TableCell>
								<TableCell>
									<Box display="flex" alignItems="center" gap={1}>
										<LocationIcon fontSize="small" color="action" />
										<Box>
											<Typography variant="body2">{supplier.city}</Typography>
											<Typography variant="caption" color="text.secondary">
												{supplier.country}
											</Typography>
										</Box>
									</Box>
								</TableCell>
								<TableCell>{formatRating(supplier.rating)}</TableCell>
								<TableCell>
									<Typography variant="body2">
										{supplier.delivery_time_days} dni
									</Typography>
									<Typography variant="caption" color="text.secondary">
										Min. zamówienie: {supplier.minimum_order_value} zł
									</Typography>
								</TableCell>
								<TableCell>
									<Chip
										label={supplier.is_active ? "Aktywny" : "Nieaktywny"}
										color={supplier.is_active ? "success" : "default"}
										size="small"
									/>
								</TableCell>
								<TableCell align="center">
									<Tooltip title="Edytuj">
										<IconButton
											size="small"
											onClick={() => onEditSupplier?.(supplier)}
										>
											<EditIcon />
										</IconButton>
									</Tooltip>
									<Tooltip title="Usuń">
										<IconButton
											size="small"
											color="error"
											onClick={() => handleDeleteClick(supplier)}
										>
											<DeleteIcon />
										</IconButton>
									</Tooltip>
								</TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>
			</TableContainer>

			{suppliers.length === 0 && (
				<Box textAlign="center" py={4}>
					<Typography variant="body1" color="text.secondary">
						{searchQuery ? "Brak wyników wyszukiwania" : "Brak dostawców"}
					</Typography>
				</Box>
			)}

			{/* Delete Confirmation Dialog */}
			<Dialog
				open={deleteDialogOpen}
				onClose={() => setDeleteDialogOpen(false)}
			>
				<DialogTitle>Potwierdź usunięcie</DialogTitle>
				<DialogContent>
					<Typography>
						Czy na pewno chcesz usunąć dostawcę "{supplierToDelete?.name}"? Ta
						akcja jest nieodwracalna.
					</Typography>
				</DialogContent>
				<DialogActions>
					<Button onClick={() => setDeleteDialogOpen(false)}>Anuluj</Button>
					<Button
						onClick={handleDeleteConfirm}
						color="error"
						variant="contained"
					>
						Usuń
					</Button>
				</DialogActions>
			</Dialog>
		</Box>
	);
};

export default SupplierList;
