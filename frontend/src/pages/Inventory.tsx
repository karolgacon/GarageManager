import React, { useState, useEffect } from "react";
import {
	Box,
	Typography,
	Button,
	TextField,
	InputAdornment,
	Paper,
	IconButton,
	Select,
	MenuItem,
	FormControl,
	InputLabel,
	Pagination,
	CircularProgress,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import FilterListIcon from "@mui/icons-material/FilterList";
import AddIcon from "@mui/icons-material/Add";
import Mainlayout from "../components/Mainlayout/Mainlayout";
import InventoryTable from "../components/Inventory/InventoryTable";
import InventoryFilter from "../components/Inventory/InventoryFilter";
import { inventoryService } from "../api/PartAPIEndpoint";
import { Part } from "../models/PartModel";

const Inventory = () => {
	const [parts, setParts] = useState<Part[]>([]);
	const [loading, setLoading] = useState(true);
	const [searchTerm, setSearchTerm] = useState("");
	const [filter, setFilter] = useState("All Orders");
	const [page, setPage] = useState(1);
	const [rowsPerPage, setRowsPerPage] = useState(4);
	const [showFilters, setShowFilters] = useState(false);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		const fetchParts = async () => {
			try {
				setLoading(true);
				setError(null);
				const data = await inventoryService.getAllParts();
				setParts(data);
			} catch (error) {
				console.error("Error fetching parts:", error);
				setError("Failed to load inventory items. Please try again later.");
			} finally {
				setLoading(false);
			}
		};

		fetchParts();
	}, []);

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

	// Filter parts based on search term and selected filter
	const filteredParts = parts.filter((part) => {
		// First apply text search
		const matchesSearch =
			part.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
			part.product_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
			part.description?.toLowerCase().includes(searchTerm.toLowerCase());

		// Then apply dropdown filter
		if (filter === "All Orders") return matchesSearch;
		if (filter === "In Stock") return matchesSearch && part.quantity > 0;
		if (filter === "Low Stock") {
			const minStock = part.minimum_stock || 5; // Default minimum stock level if not specified
			return matchesSearch && part.quantity > 0 && part.quantity <= minStock;
		}
		if (filter === "Out of Stock") return matchesSearch && part.quantity <= 0;

		return matchesSearch;
	});

	// Calculate pagination
	const indexOfLastPart = page * rowsPerPage;
	const indexOfFirstPart = indexOfLastPart - rowsPerPage;
	const currentParts = filteredParts.slice(indexOfFirstPart, indexOfLastPart);
	const pageCount = Math.ceil(filteredParts.length / rowsPerPage);

	const handleAddItem = () => {
		// Implement your add item functionality here
		console.log("Add item clicked");
		// You could navigate to a new page or open a modal
	};

	return (
		<Mainlayout>
			<Box sx={{ width: "100%" }}>
				<Box sx={{ display: "flex", justifyContent: "space-between", mb: 3 }}>
					<Button
						variant="contained"
						startIcon={<AddIcon />}
						onClick={handleAddItem}
						sx={{
							bgcolor: "#ff3c4e",
							"&:hover": { bgcolor: "#d6303f" },
							borderRadius: 1,
						}}
					>
						+ Add Item
					</Button>
				</Box>

				<Paper sx={{ p: 2, mb: 2, borderRadius: 1 }}>
					<Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
						<FormControl sx={{ minWidth: 200 }}>
							<Select
								value={filter}
								onChange={handleFilterChange}
								displayEmpty
								size="small"
								sx={{ borderRadius: 1 }}
								startAdornment={
									<InputAdornment position="start">Show:</InputAdornment>
								}
							>
								<MenuItem value="All Orders">All Orders</MenuItem>
								<MenuItem value="In Stock">In Stock</MenuItem>
								<MenuItem value="Low Stock">Low Stock</MenuItem>
								<MenuItem value="Out of Stock">Out of Stock</MenuItem>
							</Select>
						</FormControl>

						<Box sx={{ display: "flex", gap: 1 }}>
							<TextField
								placeholder="Search by name, producent ID or other..."
								size="small"
								value={searchTerm}
								onChange={handleSearchChange}
								sx={{ minWidth: 300 }}
								InputProps={{
									startAdornment: (
										<InputAdornment position="start">
											<SearchIcon />
										</InputAdornment>
									),
								}}
							/>

							<Button
								variant="outlined"
								startIcon={<FilterListIcon />}
								onClick={toggleFilters}
								sx={{ borderRadius: 1 }}
							>
								Filters
							</Button>
						</Box>
					</Box>

					{showFilters && <InventoryFilter />}

					{error && (
						<Box sx={{ p: 2, textAlign: "center", color: "error.main" }}>
							<Typography>{error}</Typography>
						</Box>
					)}

					{loading ? (
						<Box sx={{ display: "flex", justifyContent: "center", p: 3 }}>
							<CircularProgress />
						</Box>
					) : (
						<InventoryTable parts={currentParts} />
					)}

					<Box
						sx={{
							display: "flex",
							justifyContent: "space-between",
							alignItems: "center",
							mt: 2,
						}}
					>
						<FormControl sx={{ minWidth: 80 }}>
							<Select
								value={rowsPerPage}
								onChange={handleRowsPerPageChange}
								displayEmpty
								size="small"
								sx={{ borderRadius: 1 }}
								startAdornment={
									<InputAdornment position="start">Show result:</InputAdornment>
								}
							>
								<MenuItem value={4}>4</MenuItem>
								<MenuItem value={8}>8</MenuItem>
								<MenuItem value={12}>12</MenuItem>
								<MenuItem value={20}>20</MenuItem>
							</Select>
						</FormControl>

						<Pagination
							count={pageCount}
							page={page}
							onChange={handlePageChange}
							color="primary"
						/>
					</Box>
				</Paper>
			</Box>
		</Mainlayout>
	);
};

export default Inventory;
