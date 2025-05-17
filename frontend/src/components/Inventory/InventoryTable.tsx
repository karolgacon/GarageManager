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
} from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import { Part } from "../../models/PartModel";

interface InventoryTableProps {
	parts: Part[];
}

const InventoryTable: React.FC<InventoryTableProps> = ({ parts }) => {
	const [sortColumn, setSortColumn] = useState<string | null>(null);
	const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
	const [selectedParts, setSelectedParts] = useState<number[]>([]);

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

	const columns = [
		{ id: "name", label: "Product name", sortable: true },
		{ id: "product_id", label: "Producent ID", sortable: true },
		{ id: "description", label: "Description", sortable: true },
		{ id: "quantity", label: "Quantity", sortable: true },
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
									<TableCell>{part.product_id || "No ID"}</TableCell>
									<TableCell>{part.description || "No description"}</TableCell>
									<TableCell>
										{part.quantity !== undefined ? part.quantity : "N/A"}
									</TableCell>
									<TableCell>
										{part.price !== undefined
											? `$${part.price.toFixed(2)}`
											: "N/A"}
									</TableCell>
									<TableCell>
										<IconButton size="small">
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
	);
};

export default InventoryTable;
