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
	Chip,
	TextField,
	InputAdornment,
	Button,
} from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import BuildIcon from "@mui/icons-material/Build";
import SearchIcon from "@mui/icons-material/Search";
import AddIcon from "@mui/icons-material/Add";
import { Service } from "../../models/ServiceModel";
import {
	COLOR_PRIMARY,
	COLOR_BACKGROUND,
	COLOR_SURFACE,
	COLOR_TEXT_PRIMARY,
	COLOR_TEXT_SECONDARY,
} from "../../constants";

interface ServiceTableProps {
	services: Service[];
	onDeleteServices?: (ids: number[]) => void;
	onEditService?: (service: Service) => void;
	onToggleStatus?: (id: number, newStatus: boolean) => void;
	onAddService?: () => void;
	showAddButton?: boolean;
}

const ServiceTable: React.FC<ServiceTableProps> = ({
	services,
	onDeleteServices,
	onEditService,
	onToggleStatus,
	onAddService,
	showAddButton = false,
}) => {
	const [sortColumn, setSortColumn] = useState<string | null>(null);
	const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
	const [selectedServices, setSelectedServices] = useState<number[]>([]);
	const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);
	const [activeServiceId, setActiveServiceId] = useState<number | null>(null);
	const [searchTerm, setSearchTerm] = useState("");

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
			setSelectedServices(filteredServices.map((service) => service.id!));
		} else {
			setSelectedServices([]);
		}
	};

	const handleSelectService = (id: number) => {
		const selectedIndex = selectedServices.indexOf(id);
		let newSelected: number[] = [];

		if (selectedIndex === -1) {
			newSelected = [...selectedServices, id];
		} else {
			newSelected = selectedServices.filter((serviceId) => serviceId !== id);
		}

		setSelectedServices(newSelected);
	};

	const isSelected = (id: number) => selectedServices.indexOf(id) !== -1;

	const handleMenuOpen = (
		event: React.MouseEvent<HTMLElement>,
		serviceId: number
	) => {
		event.stopPropagation();
		setActiveServiceId(serviceId);
		setMenuAnchorEl(event.currentTarget);
	};

	const handleMenuClose = () => {
		setMenuAnchorEl(null);
	};

	const handleDeleteService = () => {
		if (activeServiceId !== null && onDeleteServices) {
			onDeleteServices([activeServiceId]);
		}
		handleMenuClose();
	};

	const handleEditService = () => {
		if (activeServiceId !== null && onEditService) {
			const serviceToEdit = services.find(
				(service) => service.id === activeServiceId
			);
			if (serviceToEdit) {
				onEditService(serviceToEdit);
			}
		}
		handleMenuClose();
	};

	const handleToggleStatus = () => {
		if (activeServiceId !== null && onToggleStatus) {
			const service = services.find((s) => s.id === activeServiceId);
			if (service) {
				onToggleStatus(activeServiceId, !service.is_active);
			}
		}
		handleMenuClose();
	};

	const handleDeleteSelected = () => {
		if (selectedServices.length > 0 && onDeleteServices) {
			onDeleteServices(selectedServices);
			setSelectedServices([]);
		}
	};

	const columns = [
		{ id: "id", label: "ID", sortable: true },
		{ id: "name", label: "Service Name", sortable: true },
		{ id: "category", label: "Category", sortable: true },
		{ id: "price", label: "Price", sortable: true },
		{ id: "duration", label: "Duration (min)", sortable: true },
		{ id: "is_active", label: "Status", sortable: true },
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

	const sortedServices = [...services];

	// Filter services based on search term
	const filteredServices = sortedServices.filter((service) => {
		const matchesSearch =
			service.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
			service.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
			service.category?.toLowerCase().includes(searchTerm.toLowerCase());

		return matchesSearch;
	});

	// Sort filtered services
	if (sortColumn) {
		filteredServices.sort((a, b) => {
			const aValue = a[sortColumn as keyof Service];
			const bValue = b[sortColumn as keyof Service];

			if (aValue === bValue) return 0;

			if (aValue === null || aValue === undefined) return 1;
			if (bValue === null || bValue === undefined) return -1;

			const comparison = aValue < bValue ? -1 : 1;
			return sortDirection === "asc" ? comparison : -comparison;
		});
	}

	const formatPrice = (price: number | string) => {
		const numPrice =
			typeof price === "number" ? price : parseFloat(price || "0");
		return `$${numPrice.toFixed(2)}`;
	};

	const formatDuration = (minutes: number) => {
		const hours = Math.floor(minutes / 60);
		const mins = minutes % 60;

		if (hours > 0) {
			return `${hours}h ${mins > 0 ? mins + "m" : ""}`;
		}
		return `${mins}m`;
	};

	return (
		<>
			{/* Search Field and Add Button */}
			<Box sx={{ mb: 3, display: "flex", gap: 2, alignItems: "center" }}>
				<TextField
					fullWidth
					variant="outlined"
					placeholder="Search services..."
					value={searchTerm}
					onChange={(e) => setSearchTerm(e.target.value)}
					sx={{
						backgroundColor: COLOR_SURFACE,
						borderRadius: 1,
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
						"& .MuiInputBase-input::placeholder": {
							color: COLOR_TEXT_SECONDARY,
							opacity: 1,
						},
					}}
					InputProps={{
						startAdornment: (
							<InputAdornment position="start">
								<SearchIcon sx={{ color: COLOR_TEXT_SECONDARY }} />
							</InputAdornment>
						),
					}}
				/>
				{showAddButton && (
					<Button
						variant="contained"
						color="primary"
						onClick={onAddService}
						startIcon={<AddIcon />}
						sx={{
							bgcolor: COLOR_PRIMARY,
							color: "white",
							"&:hover": { bgcolor: "#2563EB" },
							borderRadius: 1,
							width: { xs: "100%", sm: "auto" },
							fontSize: "0.875rem", // Smaller font size
							whiteSpace: "nowrap", // Prevent text wrapping
						}}
					>
						Add Service
					</Button>
				)}
			</Box>

			<TableContainer
				sx={{ backgroundColor: COLOR_SURFACE, position: "relative" }}
			>
				{selectedServices.length > 0 && (
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
							{selectedServices.length} selected
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
							<TableCell padding="checkbox" sx={{ borderBottom: "none" }}>
								<Checkbox
									indeterminate={
										selectedServices.length > 0 &&
										selectedServices.length < filteredServices.length
									}
									checked={
										filteredServices.length > 0 &&
										selectedServices.length === filteredServices.length
									}
									onChange={handleSelectAll}
									sx={{
										color: "white",
										"&.Mui-checked": { color: "white" },
										"&.MuiCheckbox-indeterminate": { color: "white" },
									}}
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
										borderBottom: "none",
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
						{filteredServices.length === 0 ? (
							<TableRow>
								<TableCell
									colSpan={columns.length + 1}
									sx={{ borderBottom: "none" }}
								>
									<Box sx={{ textAlign: "center", p: 3 }}>
										<Typography
											variant="body1"
											sx={{ color: COLOR_TEXT_PRIMARY }}
										>
											No services found
										</Typography>
									</Box>
								</TableCell>
							</TableRow>
						) : (
							filteredServices.map((service) => {
								const isItemSelected = isSelected(service.id!);

								return (
									<TableRow
										key={service.id}
										hover
										selected={isItemSelected}
										onClick={(event) => event.stopPropagation()}
										sx={{
											backgroundColor: isItemSelected
												? "rgba(56, 130, 246, 0.1)"
												: "transparent",
											"&:hover": {
												backgroundColor: isItemSelected
													? "rgba(56, 130, 246, 0.2)"
													: "rgba(156, 163, 175, 0.1)",
											},
										}}
									>
										<TableCell
											padding="checkbox"
											sx={{ borderBottom: `1px solid ${COLOR_TEXT_SECONDARY}` }}
										>
											<Checkbox
												checked={isItemSelected}
												onChange={() => handleSelectService(service.id!)}
												sx={{
													color: COLOR_TEXT_SECONDARY,
													"&.Mui-checked": { color: COLOR_PRIMARY },
												}}
											/>
										</TableCell>
										<TableCell
											sx={{
												borderBottom: `1px solid ${COLOR_TEXT_SECONDARY}`,
												color: COLOR_TEXT_PRIMARY,
											}}
										>
											{service.id || "N/A"}
										</TableCell>
										<TableCell
											sx={{ borderBottom: `1px solid ${COLOR_TEXT_SECONDARY}` }}
										>
											<Box sx={{ display: "flex", alignItems: "center" }}>
												<Avatar
													sx={{
														bgcolor: COLOR_PRIMARY,
														width: 35,
														height: 35,
														mr: 2,
													}}
												>
													<BuildIcon />
												</Avatar>
												<Typography sx={{ color: COLOR_TEXT_PRIMARY }}>
													{service.name || "Unknown Service"}
												</Typography>
											</Box>
										</TableCell>
										<TableCell
											sx={{
												borderBottom: `1px solid ${COLOR_TEXT_SECONDARY}`,
												color: COLOR_TEXT_PRIMARY,
											}}
										>
											{service.category.charAt(0).toUpperCase() +
												service.category.slice(1) || "No Category"}
										</TableCell>
										<TableCell
											sx={{
												borderBottom: `1px solid ${COLOR_TEXT_SECONDARY}`,
												color: COLOR_TEXT_PRIMARY,
											}}
										>
											{formatPrice(service.price)}
										</TableCell>
										<TableCell
											sx={{
												borderBottom: `1px solid ${COLOR_TEXT_SECONDARY}`,
												color: COLOR_TEXT_PRIMARY,
											}}
										>
											{formatDuration(service.duration)}
										</TableCell>
										<TableCell
											sx={{ borderBottom: `1px solid ${COLOR_TEXT_SECONDARY}` }}
										>
											<Chip
												label={service.is_active ? "Active" : "Inactive"}
												color={service.is_active ? "success" : "default"}
												size="small"
												sx={{
													backgroundColor: service.is_active
														? "#10B981"
														: COLOR_TEXT_SECONDARY,
													color: "white",
												}}
											/>
										</TableCell>
										<TableCell
											sx={{ borderBottom: `1px solid ${COLOR_TEXT_SECONDARY}` }}
										>
											<IconButton
												size="small"
												onClick={(e) => handleMenuOpen(e, service.id!)}
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
					onClick={handleEditService}
					sx={{
						color: COLOR_TEXT_PRIMARY,
						"&:hover": { backgroundColor: "rgba(56, 130, 246, 0.1)" },
					}}
				>
					<EditIcon fontSize="small" sx={{ mr: 1, color: COLOR_PRIMARY }} />
					Edit
				</MenuItem>
				<MenuItem
					onClick={handleToggleStatus}
					sx={{
						color: COLOR_TEXT_PRIMARY,
						"&:hover": { backgroundColor: "rgba(56, 130, 246, 0.1)" },
					}}
				>
					{services.find((s) => s.id === activeServiceId)?.is_active ? (
						<>
							<Chip
								label="Set Inactive"
								size="small"
								sx={{
									mr: 1,
									backgroundColor: COLOR_TEXT_SECONDARY,
									color: "white",
								}}
							/>
						</>
					) : (
						<>
							<Chip
								label="Set Active"
								size="small"
								sx={{
									mr: 1,
									backgroundColor: "#10B981",
									color: "white",
								}}
							/>
						</>
					)}
				</MenuItem>
				<MenuItem
					onClick={handleDeleteService}
					sx={{
						color: "#EF4444",
						"&:hover": { backgroundColor: "rgba(239, 68, 68, 0.1)" },
					}}
				>
					<DeleteIcon fontSize="small" sx={{ mr: 1, color: "#EF4444" }} />
					Delete
				</MenuItem>
			</Menu>
		</>
	);
};

export default ServiceTable;
