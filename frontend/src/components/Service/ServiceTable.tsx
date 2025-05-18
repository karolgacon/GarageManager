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
} from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import BuildIcon from "@mui/icons-material/Build";
import { Service } from "../../models/ServiceModel";

interface ServiceTableProps {
	services: Service[];
	onDeleteServices?: (ids: number[]) => void;
	onEditService?: (service: Service) => void;
	onToggleStatus?: (id: number, newStatus: boolean) => void;
}

const ServiceTable: React.FC<ServiceTableProps> = ({
	services,
	onDeleteServices,
	onEditService,
	onToggleStatus,
}) => {
	const [sortColumn, setSortColumn] = useState<string | null>(null);
	const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
	const [selectedServices, setSelectedServices] = useState<number[]>([]);
	const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);
	const [activeServiceId, setActiveServiceId] = useState<number | null>(null);

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
			setSelectedServices(services.map((service) => service.id!));
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

	// Menu akcji
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

	// Usuwanie pojedynczej usługi
	const handleDeleteService = () => {
		if (activeServiceId !== null && onDeleteServices) {
			onDeleteServices([activeServiceId]);
		}
		handleMenuClose();
	};

	// Edycja usługi
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

	// Przełączanie statusu aktywności
	const handleToggleStatus = () => {
		if (activeServiceId !== null && onToggleStatus) {
			const service = services.find((s) => s.id === activeServiceId);
			if (service) {
				onToggleStatus(activeServiceId, !service.is_active);
			}
		}
		handleMenuClose();
	};

	// Usuwanie wybranych usług
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

	// Sortowanie usług
	const sortedServices = [...services];
	if (sortColumn) {
		sortedServices.sort((a, b) => {
			const aValue = a[sortColumn as keyof Service];
			const bValue = b[sortColumn as keyof Service];

			if (aValue === bValue) return 0;

			if (aValue === null || aValue === undefined) return 1;
			if (bValue === null || bValue === undefined) return -1;

			const comparison = aValue < bValue ? -1 : 1;
			return sortDirection === "asc" ? comparison : -comparison;
		});
	}

	// Format ceny
	const formatPrice = (price: number | string) => {
		const numPrice =
			typeof price === "number" ? price : parseFloat(price || "0");
		return `$${numPrice.toFixed(2)}`;
	};

	// Format czasu trwania
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
			{selectedServices.length > 0 && (
				<Box
					sx={{
						display: "flex",
						justifyContent: "flex-end",
						mb: 2,
						alignItems: "center",
					}}
				>
					<Typography variant="body2" sx={{ mr: 2 }}>
						{selectedServices.length} service(s) selected
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
										selectedServices.length > 0 &&
										selectedServices.length < services.length
									}
									checked={
										services.length > 0 &&
										selectedServices.length === services.length
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
						{sortedServices.length === 0 ? (
							<TableRow>
								<TableCell colSpan={columns.length + 1}>
									<Box sx={{ textAlign: "center", p: 3 }}>
										<Typography variant="body1">No services found</Typography>
									</Box>
								</TableCell>
							</TableRow>
						) : (
							sortedServices.map((service) => {
								const isItemSelected = isSelected(service.id!);

								return (
									<TableRow
										key={service.id}
										hover
										selected={isItemSelected}
										onClick={(event) => event.stopPropagation()}
									>
										<TableCell padding="checkbox">
											<Checkbox
												checked={isItemSelected}
												onChange={() => handleSelectService(service.id!)}
											/>
										</TableCell>
										<TableCell>{service.id || "N/A"}</TableCell>
										<TableCell>
											<Box sx={{ display: "flex", alignItems: "center" }}>
												<Avatar
													sx={{
														bgcolor: "#660000",
														width: 35,
														height: 35,
														mr: 2,
													}}
												>
													<BuildIcon />
												</Avatar>
												{service.name || "Unknown Service"}
											</Box>
										</TableCell>
										<TableCell>
											{service.category.charAt(0).toUpperCase() +
												service.category.slice(1) || "No Category"}
										</TableCell>
										<TableCell>{formatPrice(service.price)}</TableCell>
										<TableCell>{formatDuration(service.duration)}</TableCell>
										<TableCell>
											<Chip
												label={service.is_active ? "Active" : "Inactive"}
												color={service.is_active ? "success" : "default"}
												size="small"
											/>
										</TableCell>
										<TableCell>
											<IconButton
												size="small"
												onClick={(e) => handleMenuOpen(e, service.id!)}
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

			{/* Menu kontekstowe dla akcji na pojedynczej usłudze */}
			<Menu
				anchorEl={menuAnchorEl}
				open={Boolean(menuAnchorEl)}
				onClose={handleMenuClose}
				transformOrigin={{ horizontal: "right", vertical: "top" }}
				anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
			>
				<MenuItem onClick={handleEditService}>
					<EditIcon fontSize="small" sx={{ mr: 1 }} />
					Edit
				</MenuItem>
				<MenuItem onClick={handleToggleStatus}>
					{services.find((s) => s.id === activeServiceId)?.is_active ? (
						<>
							<Chip
								label="Set Inactive"
								size="small"
								color="default"
								sx={{ mr: 1 }}
							/>
						</>
					) : (
						<>
							<Chip
								label="Set Active"
								size="small"
								color="success"
								sx={{ mr: 1 }}
							/>
						</>
					)}
				</MenuItem>
				<MenuItem onClick={handleDeleteService} sx={{ color: "error.main" }}>
					<DeleteIcon fontSize="small" sx={{ mr: 1 }} />
					Delete
				</MenuItem>
			</Menu>
		</>
	);
};

export default ServiceTable;
