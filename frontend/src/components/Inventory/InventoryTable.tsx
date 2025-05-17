import React, { useState } from "react";
import {
	Box,
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableRow,
	Typography,
	Checkbox,
	IconButton,
	Avatar,
	Menu,
	MenuItem,
	Tooltip,
} from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import { Part } from "../../models/PartModel";

interface InventoryTableProps {
	parts: Part[];
	onDeleteParts?: (ids: number[]) => void; // Callback dla usuwania wielu części
	onEditPart?: (part: Part) => void; // Nowa prop dla edycji
}

const InventoryTable: React.FC<InventoryTableProps> = ({
	parts,
	onDeleteParts,
	onEditPart, // Dodaj nową prop
}) => {
	const [sortColumn, setSortColumn] = useState<string | null>(null);
	const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
	const [selectedParts, setSelectedParts] = useState<number[]>([]);
	const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);
	const [activePartId, setActivePartId] = useState<number | null>(null);

	const handleSort = (column: string) => {
		if (sortColumn === column) {
			setSortDirection(sortDirection === "asc" ? "desc" : "asc");
		} else {
			setSortColumn(column);
			setSortDirection("asc");
		}
	};

	const handleSelectAll = (event: React.ChangeEvent<HTMLInputElement>) => {
		if (event.target.checked) {
			setSelectedParts(parts.map((part) => part.id));
		} else {
			setSelectedParts([]);
		}
	};

	const handleSelectPart = (id: number) => {
		const selectedIndex = selectedParts.indexOf(id);
		let newSelected: number[] = [];

		if (selectedIndex === -1) {
			newSelected = [...selectedParts, id];
		} else {
			newSelected = selectedParts.filter((partId) => partId !== id);
		}

		setSelectedParts(newSelected);
	};

	const isSelected = (id: number) => selectedParts.indexOf(id) !== -1;

	// Obsługa menu akcji
	const handleMenuOpen = (
		event: React.MouseEvent<HTMLElement>,
		partId: number
	) => {
		event.stopPropagation();
		setActivePartId(partId);
		setMenuAnchorEl(event.currentTarget);
	};

	const handleMenuClose = () => {
		setMenuAnchorEl(null);
	};

	// Obsługa usuwania pojedynczej części
	const handleDeletePart = () => {
		if (activePartId !== null && onDeleteParts) {
			onDeleteParts([activePartId]);
		}
		handleMenuClose();
	};

	// Obsługa usuwania wielu części
	const handleDeleteSelected = () => {
		if (selectedParts.length > 0 && onDeleteParts) {
			onDeleteParts(selectedParts);
			setSelectedParts([]);
		}
	};

	// Zaktualizuj kolumny, aby odpowiadały danym z backendu:
	const columns = [
		{ id: "id", label: "ID", sortable: true },
		{ id: "name", label: "Product name", sortable: true },
		{ id: "manufacturer", label: "Manufacturer", sortable: true },
		{ id: "category", label: "Category", sortable: true },
		{ id: "stock_quantity", label: "Quantity", sortable: true },
		{ id: "price", label: "Cost", sortable: true },
		{ id: "actions", label: "", sortable: false },
	];

	const renderSortIcon = (column: { id: string; sortable: boolean }) => {
		if (!column.sortable) return null;
		if (sortColumn !== column.id) return null;

		return sortDirection === "asc" ? (
			<ArrowUpwardIcon fontSize="small" />
		) : (
			<ArrowDownwardIcon fontSize="small" />
		);
	};

	// Apply sorting to the parts if a sort column is selected
	const sortedParts = [...parts];
	if (sortColumn) {
		sortedParts.sort((a, b) => {
			const aValue = a[sortColumn as keyof Part];
			const bValue = b[sortColumn as keyof Part];

			if (aValue === bValue) return 0;

			if (aValue === null || aValue === undefined) return 1;
			if (bValue === null || bValue === undefined) return -1;

			const comparison = aValue < bValue ? -1 : 1;
			return sortDirection === "asc" ? comparison : -comparison;
		});
	}

	return (
		<>
			{selectedParts.length > 0 && (
				<Box
					sx={{
						display: "flex",
						justifyContent: "flex-end",
						mb: 2,
						alignItems: "center",
					}}
				>
					<Typography variant="body2" sx={{ mr: 2 }}>
						{selectedParts.length} item(s) selected
					</Typography>
					<Tooltip title="Delete selected">
						<IconButton
							color="error"
							onClick={handleDeleteSelected}
							sx={{ border: "1px solid rgba(211, 47, 47, 0.5)" }}
						>
							<DeleteIcon />
						</IconButton>
					</Tooltip>
				</Box>
			)}
			<TableContainer>
				<Table>
					<TableHead>
						<TableRow>
							<TableCell padding="checkbox">
								<Checkbox
									indeterminate={
										selectedParts.length > 0 &&
										selectedParts.length < parts.length
									}
									checked={
										parts.length > 0 && selectedParts.length === parts.length
									}
									onChange={handleSelectAll}
								/>
							</TableCell>
							{columns.map((column) => (
								<TableCell
									key={column.id}
									onClick={() => column.sortable && handleSort(column.id)}
									sx={{
										cursor: column.sortable ? "pointer" : "default",
										fontWeight: "bold",
									}}
								>
									<Box sx={{ display: "flex", alignItems: "center" }}>
										{column.label}
										{renderSortIcon(column)}
									</Box>
								</TableCell>
							))}
						</TableRow>
					</TableHead>
					<TableBody>
						{sortedParts.length === 0 ? (
							<TableRow>
								<TableCell colSpan={columns.length + 1}>
									<Box sx={{ textAlign: "center", p: 3 }}>
										<Typography variant="body1">No parts found</Typography>
									</Box>
								</TableCell>
							</TableRow>
						) : (
							sortedParts.map((part) => {
								const isItemSelected = isSelected(part.id);

								return (
									<TableRow
										key={part.id}
										hover
										selected={isItemSelected}
										onClick={(event) => event.stopPropagation()}
									>
										<TableCell padding="checkbox">
											<Checkbox
												checked={isItemSelected}
												onChange={() => handleSelectPart(part.id)}
											/>
										</TableCell>
										<TableCell>{part.id || "N/A"}</TableCell>
										<TableCell>
											<Box sx={{ display: "flex", alignItems: "center" }}>
												<Avatar
													sx={{
														bgcolor: "#660000",
														width: 35,
														height: 35,
														mr: 2,
													}}
													src={part.image_url || undefined}
												/>
												{part.name || "Unknown Product"}
											</Box>
										</TableCell>
										<TableCell>
											{part.manufacturer || "No Manufacturer"}
										</TableCell>
										<TableCell>{part.category || "No category"}</TableCell>
										<TableCell>
											{part.stock_quantity !== undefined
												? part.stock_quantity
												: "N/A"}
										</TableCell>
										<TableCell>
											{part.price !== undefined && part.price !== null
												? `$${Number(part.price).toFixed(2)}`
												: "N/A"}
										</TableCell>
										<TableCell>
											<IconButton
												size="small"
												onClick={(e) => handleMenuOpen(e, part.id)}
											>
												<MoreVertIcon />
											</IconButton>
										</TableCell>
									</TableRow>
								);
							})
						)}
					</TableBody>
				</Table>
			</TableContainer>

			{/* Menu kontekstowe dla akcji na pojedynczej części */}
			<Menu
				anchorEl={menuAnchorEl}
				open={Boolean(menuAnchorEl)}
				onClose={handleMenuClose}
				transformOrigin={{ horizontal: "right", vertical: "top" }}
				anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
			>
				<MenuItem
					onClick={() => {
						const partToEdit = parts.find((p) => p.id === activePartId);
						if (partToEdit && onEditPart) {
							onEditPart(partToEdit);
						}
						handleMenuClose();
					}}
				>
					<EditIcon fontSize="small" sx={{ mr: 1 }} />
					Edit
				</MenuItem>
				<MenuItem onClick={handleDeletePart} sx={{ color: "error.main" }}>
					<DeleteIcon fontSize="small" sx={{ mr: 1 }} />
					Delete
				</MenuItem>
			</Menu>
		</>
	);
};

export default InventoryTable;
