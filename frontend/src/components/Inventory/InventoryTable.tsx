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
import {
	COLOR_PRIMARY,
	COLOR_SURFACE,
	COLOR_TEXT_PRIMARY,
	COLOR_TEXT_SECONDARY,
} from "../../constants";

interface InventoryTableProps {
	parts: Part[];
	onDeleteParts?: (ids: number[]) => void;
	onEditPart?: (part: Part) => void;
}

const InventoryTable: React.FC<InventoryTableProps> = ({
	parts,
	onDeleteParts,
	onEditPart,
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

	const handleDeletePart = () => {
		if (activePartId !== null && onDeleteParts) {
			onDeleteParts([activePartId]);
		}
		handleMenuClose();
	};

	const handleDeleteSelected = () => {
		if (selectedParts.length > 0 && onDeleteParts) {
			onDeleteParts(selectedParts);
			setSelectedParts([]);
		}
	};

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
			<ArrowUpwardIcon fontSize="small" sx={{ color: "white" }} />
		) : (
			<ArrowDownwardIcon fontSize="small" sx={{ color: "white" }} />
		);
	};

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
			<TableContainer
				sx={{ backgroundColor: COLOR_SURFACE, position: "relative" }}
			>
				{selectedParts.length > 0 && (
					<Box
						sx={{
							position: "absolute",
							top: 8,
							right: 8,
							zIndex: 10,
							display: "flex",
							alignItems: "center",
							gap: 1,
							backgroundColor: COLOR_SURFACE,
							padding: "4px 8px",
							borderRadius: 1,
							border: `1px solid ${COLOR_TEXT_SECONDARY}`,
						}}
					>
						<Typography
							variant="body2"
							sx={{
								color: COLOR_TEXT_PRIMARY,
								fontSize: "0.75rem",
							}}
						>
							{selectedParts.length} selected
						</Typography>
						<Tooltip title="Delete selected">
							<IconButton
								size="small"
								sx={{
									color: "#dc2626",
									"&:hover": {
										backgroundColor: "rgba(220, 38, 38, 0.1)",
									},
								}}
								onClick={handleDeleteSelected}
							>
								<DeleteIcon fontSize="small" />
							</IconButton>
						</Tooltip>
					</Box>
				)}
				<Table>
					<TableHead>
						<TableRow sx={{ backgroundColor: COLOR_PRIMARY }}>
							<TableCell
								padding="checkbox"
								sx={{
									borderBottom: `1px solid ${COLOR_TEXT_SECONDARY}`,
									backgroundColor: COLOR_PRIMARY,
								}}
							>
								<Checkbox
									sx={{
										color: "white",
										"&.Mui-checked": {
											color: "white",
										},
										"&.MuiCheckbox-indeterminate": {
											color: "white",
										},
									}}
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
										color: "white",
										borderBottom: `1px solid ${COLOR_TEXT_SECONDARY}`,
										backgroundColor: COLOR_PRIMARY,
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
								<TableCell
									colSpan={columns.length + 1}
									sx={{
										borderBottom: `1px solid ${COLOR_TEXT_SECONDARY}`,
										backgroundColor: COLOR_SURFACE,
									}}
								>
									<Box sx={{ textAlign: "center", p: 3 }}>
										<Typography
											variant="body1"
											sx={{ color: COLOR_TEXT_SECONDARY }}
										>
											No parts found
										</Typography>
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
										sx={{
											backgroundColor: isItemSelected
												? "rgba(56, 130, 246, 0.1)"
												: COLOR_SURFACE,
											"&:hover": {
												backgroundColor: isItemSelected
													? "rgba(56, 130, 246, 0.2)"
													: "rgba(56, 130, 246, 0.05)",
											},
										}}
									>
										<TableCell
											padding="checkbox"
											sx={{
												borderBottom: `1px solid ${COLOR_TEXT_SECONDARY}`,
											}}
										>
											<Checkbox
												sx={{
													color: COLOR_TEXT_SECONDARY,
													"&.Mui-checked": {
														color: COLOR_PRIMARY,
													},
												}}
												checked={isItemSelected}
												onChange={() => handleSelectPart(part.id)}
											/>
										</TableCell>
										<TableCell
											sx={{
												color: COLOR_TEXT_PRIMARY,
												borderBottom: `1px solid ${COLOR_TEXT_SECONDARY}`,
											}}
										>
											{part.id || "N/A"}
										</TableCell>
										<TableCell
											sx={{
												borderBottom: `1px solid ${COLOR_TEXT_SECONDARY}`,
											}}
										>
											<Box sx={{ display: "flex", alignItems: "center" }}>
												<Avatar
													sx={{
														bgcolor: COLOR_PRIMARY,
														width: 35,
														height: 35,
														mr: 2,
													}}
													src={undefined}
												/>
												<Typography sx={{ color: COLOR_TEXT_PRIMARY }}>
													{part.name || "Unknown Product"}
												</Typography>
											</Box>
										</TableCell>
										<TableCell
											sx={{
												color: COLOR_TEXT_PRIMARY,
												borderBottom: `1px solid ${COLOR_TEXT_SECONDARY}`,
											}}
										>
											{part.manufacturer || "No Manufacturer"}
										</TableCell>
										<TableCell
											sx={{
												color: COLOR_TEXT_PRIMARY,
												borderBottom: `1px solid ${COLOR_TEXT_SECONDARY}`,
											}}
										>
											{part.category || "No category"}
										</TableCell>
										<TableCell
											sx={{
												color: COLOR_TEXT_PRIMARY,
												borderBottom: `1px solid ${COLOR_TEXT_SECONDARY}`,
											}}
										>
											{part.stock_quantity !== undefined
												? part.stock_quantity
												: "N/A"}
										</TableCell>
										<TableCell
											sx={{
												color: COLOR_TEXT_PRIMARY,
												borderBottom: `1px solid ${COLOR_TEXT_SECONDARY}`,
											}}
										>
											{part.price !== undefined && part.price !== null
												? `$${Number(part.price).toFixed(2)}`
												: "N/A"}
										</TableCell>
										<TableCell
											sx={{
												borderBottom: `1px solid ${COLOR_TEXT_SECONDARY}`,
											}}
										>
											<IconButton
												size="small"
												onClick={(e) => handleMenuOpen(e, part.id)}
												sx={{ color: COLOR_TEXT_SECONDARY }}
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

			<Menu
				anchorEl={menuAnchorEl}
				open={Boolean(menuAnchorEl)}
				onClose={handleMenuClose}
				transformOrigin={{ horizontal: "right", vertical: "top" }}
				anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
				PaperProps={{
					sx: {
						backgroundColor: COLOR_SURFACE,
						border: `1px solid ${COLOR_TEXT_SECONDARY}`,
					},
				}}
			>
				<MenuItem
					onClick={() => {
						const partToEdit = parts.find((p) => p.id === activePartId);
						if (partToEdit && onEditPart) {
							onEditPart(partToEdit);
						}
						handleMenuClose();
					}}
					sx={{ color: COLOR_TEXT_PRIMARY }}
				>
					<EditIcon fontSize="small" sx={{ mr: 1, color: COLOR_PRIMARY }} />
					Edit
				</MenuItem>
				<MenuItem onClick={handleDeletePart} sx={{ color: COLOR_PRIMARY }}>
					<DeleteIcon fontSize="small" sx={{ mr: 1, color: COLOR_PRIMARY }} />
					Delete
				</MenuItem>
			</Menu>
		</>
	);
};

export default InventoryTable;
