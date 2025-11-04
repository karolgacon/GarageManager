import React, { useState, useEffect } from "react";
import {
	Box,
	Container,
	Typography,
	Button,
	TextField,
	Paper,
	IconButton,
	Select,
	MenuItem,
	FormControl,
	InputLabel,
	InputAdornment,
	Pagination,
	CircularProgress,
	Grid,
	Dialog,
	DialogTitle,
	DialogContent,
	DialogContentText,
	DialogActions,
	Snackbar,
	Alert,
	Card,
	CardContent,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import FilterListIcon from "@mui/icons-material/FilterList";
import AddIcon from "@mui/icons-material/Add";
import Mainlayout from "../components/Mainlayout/Mainlayout";
import InventoryTable from "../components/Inventory/InventoryTable";
import InventoryFilter from "../components/Inventory/InventoryFilter";
import AddItemModal from "../components/Inventory/AddItemModal";
import { inventoryService } from "../api/PartAPIEndpoint";
import { Part } from "../models/PartModel";
import CustomSnackbar, {
	SnackbarState,
} from "../components/Mainlayout/Snackbar";
import EditItemModal from "../components/Inventory/EditItemModal";
import AuthContext from "../context/AuthProvider";
import { workshopService } from "../api/WorkshopAPIEndpoint";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useTheme } from "@mui/material/styles";
import {
	COLOR_PRIMARY,
	COLOR_BACKGROUND,
	COLOR_SURFACE,
	COLOR_TEXT_PRIMARY,
	COLOR_TEXT_SECONDARY,
} from "../constants";

const Inventory = () => {
	const { isAdmin, isOwner, isMechanic } = React.useContext(AuthContext);
	const theme = useTheme();
	const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

	const [parts, setParts] = useState<Part[]>([]);
	const [loading, setLoading] = useState(true);
	const [searchTerm, setSearchTerm] = useState("");
	const [filter, setFilter] = useState("All Orders");
	const [page, setPage] = useState(1);
	const [rowsPerPage, setRowsPerPage] = useState(4);
	const [showFilters, setShowFilters] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [isAddModalOpen, setIsAddModalOpen] = useState(false);
	const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
	const [partsToDelete, setPartsToDelete] = useState<number[]>([]);
	const [snackbar, setSnackbar] = useState<SnackbarState>({
		open: false,
		message: "",
		severity: "success",
	});
	const [isEditModalOpen, setIsEditModalOpen] = useState(false);
	const [partToEdit, setPartToEdit] = useState<Part | null>(null);

	useEffect(() => {
		fetchParts();
	}, []);

	const fetchParts = async () => {
		try {
			setLoading(true);
			setError(null);

			if (isAdmin()) {
				try {
					const data = await inventoryService.getAllParts();
					setParts(data);
				} catch (err) {
					if (err.response?.status === 500) {
						setError(
							"Server error: The inventory system is currently experiencing technical difficulties. Our team has been notified."
						);
					} else {
						setError("Failed to load inventory items. Please try again.");
					}
					setParts([]);
				}
			} else if (isOwner() || isMechanic()) {
				try {
					const userWorkshop = await workshopService
						.getCurrentUserWorkshop()
						.catch((error) => {
							if (error?.response?.status === 404) {
								throw new Error(
									"You are not assigned to any workshop. Please contact an administrator."
								);
							}
							throw error;
						});

					if (userWorkshop && userWorkshop.id) {
						const workshopParts = await inventoryService.getPartsByWorkshop(
							userWorkshop.id
						);
						setParts(workshopParts);
					} else {
						throw new Error(
							"Workshop information is incomplete. Please contact an administrator."
						);
					}
				} catch (error) {
					if (
						error.message &&
						error.message.includes("not assigned to any workshop")
					) {
						setError(error.message);
					} else {
						setError(
							"Failed to load workshop inventory. Please try again later."
						);
					}

					setParts([]);
				}
			} else {
				setParts([]);
			}
		} catch (error) {
			setError("Failed to load inventory items. Please try again.");
			setParts([]);
		} finally {
			setLoading(false);
		}
	};

	const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		setSearchTerm(event.target.value);
		setPage(1);
	};

	const handleFilterChange = (event: React.ChangeEvent<{ value: unknown }>) => {
		setFilter(event.target.value as string);
		setPage(1);
	};

	const handlePageChange = (
		event: React.ChangeEvent<unknown>,
		newPage: number
	) => {
		setPage(newPage);
	};

	const handleRowsPerPageChange = (
		event: React.ChangeEvent<{ value: unknown }>
	) => {
		setRowsPerPage(parseInt(event.target.value as string, 10));
		setPage(1);
	};

	const toggleFilters = () => {
		setShowFilters(!showFilters);
	};

	const handleAddItem = () => {
		setIsAddModalOpen(true);
	};

	const handleAddModalClose = () => {
		setIsAddModalOpen(false);
	};

	const handleItemAdded = (newItem: Part) => {
		setParts((prevParts) => [newItem, ...prevParts]);
		setSnackbar({
			open: true,
			message: "Item added successfully!",
			severity: "success",
		});
	};

	const handleDeleteParts = (ids: number[]) => {
		setPartsToDelete(ids);
		setDeleteDialogOpen(true);
	};

	const confirmDelete = async () => {
		try {
			setLoading(true);
			for (const id of partsToDelete) {
				await inventoryService.deletePart(id);
			}

			setParts(parts.filter((part) => !partsToDelete.includes(part.id)));

			setSnackbar({
				open: true,
				message: `Successfully deleted ${partsToDelete.length} item(s)`,
				severity: "success",
			});
		} catch (error) {
			setSnackbar({
				open: true,
				message: "Failed to delete items. Please try again.",
				severity: "error",
			});
		} finally {
			setDeleteDialogOpen(false);
			setPartsToDelete([]);
			setLoading(false);
		}
	};

	const handleEditPart = (part: Part) => {
		setPartToEdit(part);
		setIsEditModalOpen(true);
	};

	const handleItemUpdated = (updatedItem: Part) => {
		setParts((prevParts) =>
			prevParts.map((part) => (part.id === updatedItem.id ? updatedItem : part))
		);
		setSnackbar({
			open: true,
			message: "Item updated successfully!",
			severity: "success",
		});
	};

	const handleSnackbarClose = () => {
		setSnackbar({ ...snackbar, open: false });
	};

	const filteredParts = parts.filter((part) => {
		const matchesSearch =
			part.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
			part.manufacturer?.toLowerCase().includes(searchTerm.toLowerCase()) ||
			part.supplier?.toLowerCase().includes(searchTerm.toLowerCase());

		if (filter === "All Orders") return matchesSearch;
		if (filter === "In Stock") return matchesSearch && part.stock_quantity > 0;
		if (filter === "Low Stock") {
			const minStock = part.minimum_stock_level || 5;
			return (
				matchesSearch &&
				part.stock_quantity > 0 &&
				part.stock_quantity <= minStock
			);
		}
		if (filter === "Out of Stock")
			return matchesSearch && part.stock_quantity <= 0;

		return matchesSearch;
	});

	const indexOfLastPart = page * rowsPerPage;
	const indexOfFirstPart = indexOfLastPart - rowsPerPage;
	const currentParts = filteredParts.slice(indexOfFirstPart, indexOfLastPart);
	const pageCount = Math.ceil(filteredParts.length / rowsPerPage);

	const renderMobilePartCard = (part: Part) => {
		return (
			<Card
				key={part.id}
				sx={{
					mb: 2,
					backgroundColor: COLOR_SURFACE,
					borderLeft: "4px solid",
					borderLeftColor:
						part.stock_quantity <= 0
							? "error.main"
							: part.stock_quantity <= (part.minimum_stock_level || 5)
							? "warning.main"
							: "success.main",
				}}
			>
				<CardContent>
					<Typography
						variant="subtitle1"
						fontWeight="bold"
						gutterBottom
						sx={{ color: COLOR_TEXT_PRIMARY }}
					>
						{part.name}
					</Typography>

					<Grid container spacing={1}>
						<Grid item xs={6}>
							<Typography variant="body2" sx={{ color: COLOR_TEXT_SECONDARY }}>
								ID: {part.id}
							</Typography>
						</Grid>
						<Grid item xs={6}>
							<Typography variant="body2" sx={{ color: COLOR_TEXT_SECONDARY }}>
								Quantity: {part.stock_quantity}
							</Typography>
						</Grid>
						<Grid item xs={6}>
							<Typography variant="body2" sx={{ color: COLOR_TEXT_SECONDARY }}>
								Manufacturer: {part.manufacturer}
							</Typography>
						</Grid>
						<Grid item xs={6}>
							<Typography variant="body2" sx={{ color: COLOR_TEXT_SECONDARY }}>
								Category: {part.category}
							</Typography>
						</Grid>
					</Grid>

					<Box
						sx={{
							mt: 2,
							display: "flex",
							justifyContent: "space-between",
						}}
					>
						<Button
							size="small"
							onClick={() => handleEditPart(part)}
							variant="outlined"
							sx={{
								borderColor: COLOR_PRIMARY,
								color: COLOR_PRIMARY,
								"&:hover": {
									borderColor: "#2563EB",
									backgroundColor: "rgba(56, 130, 246, 0.1)",
								},
							}}
						>
							Edit
						</Button>
						<Button
							size="small"
							onClick={() => handleDeleteParts([part.id])}
							variant="outlined"
							sx={{
								borderColor: "#dc2626",
								color: "#dc2626",
								"&:hover": {
									borderColor: "#b91c1c",
									backgroundColor: "rgba(220, 38, 38, 0.1)",
								},
							}}
						>
							Delete
						</Button>
					</Box>
				</CardContent>
			</Card>
		);
	};

	return (
		<Mainlayout>
			<Container
				maxWidth="xl"
				sx={{
					backgroundColor: COLOR_BACKGROUND,
					minHeight: "100vh",
					overflow: "hidden",
					px: { xs: 1, sm: 2, md: 3 },
				}}
			>
				<Box sx={{ width: "100%", py: { xs: 2, sm: 3 } }}>
					<Box
						sx={{
							display: "flex",
							justifyContent: "space-between",
							mb: 3,
							flexDirection: { xs: "column", sm: "row" },
							gap: { xs: 2, sm: 0 },
						}}
					>
						<Button
							variant="contained"
							startIcon={<AddIcon />}
							onClick={handleAddItem}
							sx={{
								bgcolor: COLOR_PRIMARY,
								"&:hover": { bgcolor: "#2563EB" },
								borderRadius: 1,
								width: { xs: "100%", sm: "auto" },
							}}
						>
							Add Item
						</Button>
					</Box>

					<Paper
						sx={{
							p: { xs: 1, sm: 2 },
							mb: 2,
							borderRadius: 1,
							maxWidth: "100%",
							backgroundColor: COLOR_SURFACE,
						}}
					>
						<Box
							sx={{
								display: "flex",
								flexDirection: { xs: "column", sm: "row" },
								justifyContent: "space-between",
								gap: 2,
								mb: 2,
							}}
						>
							<FormControl
								sx={{
									minWidth: { xs: "100%", sm: 200 },
								}}
							>
								<Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
									<Typography
										variant="body2"
										sx={{
											color: COLOR_TEXT_SECONDARY,
											whiteSpace: "nowrap",
										}}
									>
										Show:
									</Typography>
									<Select
										value={filter}
										onChange={handleFilterChange}
										displayEmpty
										size="small"
										sx={{
											borderRadius: 1,
											backgroundColor: COLOR_SURFACE,
											color: COLOR_TEXT_PRIMARY,
											minWidth: 150,
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
										<MenuItem value="All Orders">All Orders</MenuItem>
										<MenuItem value="In Stock">In Stock</MenuItem>
										<MenuItem value="Low Stock">Low Stock</MenuItem>
										<MenuItem value="Out of Stock">Out of Stock</MenuItem>
									</Select>
								</Box>
							</FormControl>

							<Box
								sx={{
									display: "flex",
									gap: 1,
									width: { xs: "100%", sm: "auto" },
									flexDirection: { xs: "column", sm: "row" },
								}}
							>
								<TextField
									placeholder="Search..."
									size="small"
									value={searchTerm}
									onChange={handleSearchChange}
									sx={{
										width: { xs: "100%", sm: 300 },
										minWidth: { xs: "auto", sm: 200 },
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
										"& .MuiInputBase-input::placeholder": {
											color: COLOR_TEXT_SECONDARY,
											opacity: 1,
										},
									}}
									InputProps={{
										startAdornment: (
											<InputAdornment
												position="start"
												sx={{ color: COLOR_TEXT_SECONDARY }}
											>
												<SearchIcon />
											</InputAdornment>
										),
									}}
								/>

								<Button
									variant="outlined"
									startIcon={<FilterListIcon />}
									onClick={toggleFilters}
									sx={{
										borderRadius: 1,
										width: { xs: "100%", sm: "auto" },
										borderColor: COLOR_TEXT_SECONDARY,
										color: COLOR_TEXT_PRIMARY,
										"&:hover": {
											borderColor: COLOR_PRIMARY,
											backgroundColor: "rgba(56, 130, 246, 0.1)",
										},
									}}
								>
									Filters
								</Button>
							</Box>
						</Box>

						{showFilters && <InventoryFilter />}

						{error && (
							<Paper
								elevation={1}
								sx={{
									p: 3,
									mb: 3,
									textAlign: "center",
									bgcolor: error.includes("not assigned")
										? "warning.light"
										: "error.light",
									color: error.includes("not assigned")
										? "warning.contrastText"
										: "error.contrastText",
									borderRadius: 2,
								}}
							>
								<Typography
									variant="h6"
									gutterBottom
									sx={{ fontWeight: "medium" }}
								>
									{error.includes("not assigned")
										? "Workshop Assignment Missing"
										: "Error"}
								</Typography>
								<Typography variant="body1">{error}</Typography>

								{error.includes("not assigned") && (
									<Button
										variant="contained"
										color="primary"
										sx={{ mt: 2 }}
										onClick={() => (window.location.href = "/profile")}
									>
										Go to Profile
									</Button>
								)}
							</Paper>
						)}

						{!loading && !error && parts.length === 0 && (
							<Paper
								elevation={1}
								sx={{
									p: 3,
									textAlign: "center",
									bgcolor: COLOR_SURFACE,
									borderRadius: 2,
									border: `1px solid ${COLOR_TEXT_SECONDARY}`,
								}}
							>
								<Typography variant="h6" sx={{ color: COLOR_TEXT_PRIMARY }}>
									No Parts Available
								</Typography>
								<Typography
									variant="body1"
									sx={{ color: COLOR_TEXT_SECONDARY }}
								>
									{isAdmin()
										? "No parts have been added to the inventory yet."
										: "No parts are available in your workshop inventory."}
								</Typography>
							</Paper>
						)}

						{loading ? (
							<Box sx={{ display: "flex", justifyContent: "center", p: 3 }}>
								<CircularProgress sx={{ color: COLOR_PRIMARY }} />
							</Box>
						) : isMobile ? (
							<Box>
								{currentParts.map((part) => renderMobilePartCard(part))}
							</Box>
						) : (
							<Box sx={{ overflowX: "auto" }}>
								<InventoryTable
									parts={currentParts}
									onDeleteParts={handleDeleteParts}
									onEditPart={handleEditPart}
								/>
							</Box>
						)}

						<Box
							sx={{
								display: "flex",
								flexDirection: { xs: "column", sm: "row" },
								justifyContent: "space-between",
								alignItems: { xs: "flex-start", sm: "center" },
								mt: 2,
								gap: 2,
							}}
						>
							<FormControl
								sx={{
									minWidth: { xs: "100%", sm: 80 },
									width: { xs: "100%", sm: "auto" },
								}}
							>
								<Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
									<Typography
										variant="body2"
										sx={{
											color: COLOR_TEXT_SECONDARY,
											whiteSpace: "nowrap",
										}}
									>
										Show result:
									</Typography>
									<Select
										value={rowsPerPage}
										onChange={handleRowsPerPageChange}
										displayEmpty
										size="small"
										sx={{
											borderRadius: 1,
											backgroundColor: COLOR_SURFACE,
											color: COLOR_TEXT_PRIMARY,
											minWidth: 60,
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
										<MenuItem value={4}>4</MenuItem>
										<MenuItem value={8}>8</MenuItem>
										<MenuItem value={12}>12</MenuItem>
										<MenuItem value={20}>20</MenuItem>
									</Select>
								</Box>
							</FormControl>

							<Box
								sx={{
									width: { xs: "100%", sm: "auto" },
									display: "flex",
									justifyContent: { xs: "center", sm: "flex-end" },
								}}
							>
								<Pagination
									count={pageCount}
									page={page}
									onChange={handlePageChange}
									color="primary"
									size="small"
									sx={{
										"& .MuiPaginationItem-root": {
											minWidth: { xs: "30px", sm: "auto" },
											color: COLOR_TEXT_PRIMARY,
											borderColor: COLOR_TEXT_SECONDARY,
											"&:hover": {
												backgroundColor: "rgba(56, 130, 246, 0.1)",
											},
											"&.Mui-selected": {
												backgroundColor: COLOR_PRIMARY,
												color: "white",
												"&:hover": {
													backgroundColor: "#2563EB",
												},
											},
										},
									}}
								/>
							</Box>
						</Box>
					</Paper>
				</Box>

				<AddItemModal
					open={isAddModalOpen}
					onClose={handleAddModalClose}
					onItemAdded={handleItemAdded}
				/>

				<EditItemModal
					open={isEditModalOpen}
					onClose={() => setIsEditModalOpen(false)}
					onItemUpdated={handleItemUpdated}
					part={partToEdit}
				/>

				<Dialog
					open={deleteDialogOpen}
					onClose={() => setDeleteDialogOpen(false)}
					fullWidth={isMobile}
					maxWidth="xs"
					PaperProps={{
						sx: {
							backgroundColor: COLOR_SURFACE,
						},
					}}
				>
					<DialogTitle sx={{ color: COLOR_TEXT_PRIMARY }}>
						Confirm Delete
					</DialogTitle>
					<DialogContent>
						<DialogContentText sx={{ color: COLOR_TEXT_SECONDARY }}>
							{partsToDelete.length === 1
								? "Are you sure you want to delete this item?"
								: `Are you sure you want to delete ${partsToDelete.length} items?`}
							<br />
							This action cannot be undone.
						</DialogContentText>
					</DialogContent>
					<DialogActions sx={{ backgroundColor: COLOR_SURFACE }}>
						<Button
							onClick={() => setDeleteDialogOpen(false)}
							disabled={loading}
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
							onClick={confirmDelete}
							disabled={loading}
							variant="contained"
							sx={{
								bgcolor: "#dc2626",
								"&:hover": { bgcolor: "#b91c1c" },
							}}
						>
							{loading ? "Deleting..." : "Delete"}
						</Button>
					</DialogActions>
				</Dialog>

				<CustomSnackbar
					snackbarState={snackbar}
					onClose={handleSnackbarClose}
				/>
			</Container>
		</Mainlayout>
	);
};

export default Inventory;
