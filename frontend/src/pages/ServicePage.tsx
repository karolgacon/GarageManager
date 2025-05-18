import React, { useState, useEffect } from "react";
import {
	Box,
	Container,
	Typography,
	TextField,
	InputAdornment,
	Grid,
	Paper,
	Tab,
	Tabs,
	CircularProgress,
	Button,
	Alert,
	Divider,
	IconButton,
	Menu,
    MenuItem,
    Dialog,
    DialogActions,
    DialogTitle,
    DialogContent,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import BuildIcon from "@mui/icons-material/Build";
import WarningIcon from "@mui/icons-material/Warning";
import AddIcon from "@mui/icons-material/Add";
import SettingsIcon from "@mui/icons-material/Settings";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import Mainlayout from "../components/Mainlayout/Mainlayout";

// Komponenty
import IssueCard from "../components/Service/IssueCard";
import IssueDetailDialog from "../components/Service/IssueDetailDialog";
import ServiceTable from "../components/Service/ServiceTable";
import AddServiceModal from "../components/Service/AddServiceModal";
import EditServiceModal from "../components/Service/EditServiceModal";
import CustomSnackbar, {
	SnackbarState,
} from "../components/Mainlayout/Snackbar";

// Modele
import { DiagnosisIssue } from "../models/DiagnosisModel";
import { Service } from "../models/ServiceModel";
import { MaintenanceSchedule } from "../models/MaintenanceScheduleModel";

// API Services
import { diagnosticsService } from "../api/DiagnosticsAPIEndpoint";
import { serviceService } from "../api/ServiceAPIEndpoint";
import { maintenanceScheduleService } from "../api/MaintenanceScheduleAPIEndpoint";

const Services: React.FC = () => {
	// Stan dla zakładek
	const [activeTab, setActiveTab] = useState<number>(0);

	// Stany dla usług warsztatowych
	const [services, setServices] = useState<Service[]>([]);
	const [loadingServices, setLoadingServices] = useState(false);

	// Stany dla diagnostyki
	const [diagnosticIssues, setDiagnosticIssues] = useState<DiagnosisIssue[]>(
		[]
	);
	const [loadingDiagnostics, setLoadingDiagnostics] = useState(false);
	const [selectedIssue, setSelectedIssue] = useState<DiagnosisIssue | null>(
		null
	);
	const [detailDialogOpen, setDetailDialogOpen] = useState(false);
	const [issueCategoryFilter, setIssueCategoryFilter] = useState<string>("all");

	// Stany dla harmonogramów przeglądów
	const [maintenanceSchedules, setMaintenanceSchedules] = useState<
		MaintenanceSchedule[]
	>([]);
	const [loadingSchedules, setLoadingSchedules] = useState(false);

	// Stany wspólne
	const [error, setError] = useState<string | null>(null);
	const [searchTerm, setSearchTerm] = useState("");

	// Stany dla modali i akcji
	const [isAddModalOpen, setIsAddModalOpen] = useState(false);
	const [isEditModalOpen, setIsEditModalOpen] = useState(false);
	const [serviceToEdit, setServiceToEdit] = useState<Service | null>(null);
	const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
	const [servicesToDelete, setServicesToDelete] = useState<number[]>([]);

	// Stan dla powiadomień
	const [snackbar, setSnackbar] = useState<SnackbarState>({
		open: false,
		message: "",
		severity: "success",
	});

	// Pobranie danych po załadowaniu komponentu i przy zmianie aktywnej zakładki
	useEffect(() => {
		if (activeTab === 0) {
			fetchDiagnosticIssues();
		} else if (activeTab === 1) {
			fetchServices();
		} else if (activeTab === 2) {
			fetchMaintenanceSchedules();
		}
	}, [activeTab]);

	// Funkcja do pobierania problemów diagnostycznych
	const fetchDiagnosticIssues = async () => {
		try {
			setLoadingDiagnostics(true);
			setError(null);

			let issues;
			if (issueCategoryFilter === "all") {
				issues = await diagnosticsService.getAllDiagnostics();
			} else if (issueCategoryFilter === "critical") {
				issues = await diagnosticsService.getCriticalDiagnostics();
			} else {
				issues = await diagnosticsService.getDiagnosticsByCategory(
					issueCategoryFilter
				);
			}

			setDiagnosticIssues(issues);
		} catch (error) {
			console.error("Error fetching diagnostic issues:", error);
			setError("Failed to load diagnostic issues. Please try again.");
		} finally {
			setLoadingDiagnostics(false);
		}
	};

	// Funkcja do pobierania usług warsztatowych
	const fetchServices = async () => {
		try {
			setLoadingServices(true);
			setError(null);

			const data = await serviceService.getAllServices();
			setServices(data);
		} catch (error) {
			console.error("Error fetching services:", error);
			setError("Failed to load services. Please try again.");
		} finally {
			setLoadingServices(false);
		}
	};

	// Funkcja do pobierania harmonogramów przeglądów
	const fetchMaintenanceSchedules = async () => {
		try {
			setLoadingSchedules(true);
			setError(null);

			const data = await maintenanceScheduleService.getDueSchedules();
			setMaintenanceSchedules(data);
		} catch (error) {
			console.error("Error fetching maintenance schedules:", error);
			setError("Failed to load maintenance schedules. Please try again.");
		} finally {
			setLoadingSchedules(false);
		}
	};

	// Obsługa usuwania usług
	const handleDeleteServices = (ids: number[]) => {
		setServicesToDelete(ids);
		setDeleteDialogOpen(true);
	};

	// Potwierdzenie usunięcia usług
	const confirmDeleteServices = async () => {
		try {
			setLoadingServices(true);
			for (const id of servicesToDelete) {
				await serviceService.deleteService(id);
			}

			// Usunięcie usług z lokalnego stanu
			setServices(
				services.filter((service) => !servicesToDelete.includes(service.id!))
			);

			setSnackbar({
				open: true,
				message: `Successfully deleted ${servicesToDelete.length} service(s)`,
				severity: "success",
			});
		} catch (error) {
			console.error("Error deleting services:", error);
			setSnackbar({
				open: true,
				message: "Failed to delete services. Please try again.",
				severity: "error",
			});
		} finally {
			setDeleteDialogOpen(false);
			setServicesToDelete([]);
			setLoadingServices(false);
		}
	};

	// Obsługa edycji usługi
	const handleEditService = (service: Service) => {
		setServiceToEdit(service);
		setIsEditModalOpen(true);
	};

	// Aktualizacja usługi po edycji
	const handleServiceUpdated = (updatedService: Service) => {
		setServices((prevServices) =>
			prevServices.map((service) =>
				service.id === updatedService.id ? updatedService : service
			)
		);

		setSnackbar({
			open: true,
			message: "Service updated successfully!",
			severity: "success",
		});
	};

	// Dodanie nowej usługi
	const handleServiceAdded = (newService: Service) => {
		setServices([...services, newService]);
		setSnackbar({
			open: true,
			message: "Service added successfully!",
			severity: "success",
		});
	};

	// Obsługa zmiany statusu usługi
	const handleToggleServiceStatus = async (id: number, newStatus: boolean) => {
		try {
			setLoadingServices(true);
			const updatedService = await serviceService.toggleServiceStatus(
				id,
				newStatus
			);

			setServices((prevServices) =>
				prevServices.map((service) =>
					service.id === id ? updatedService : service
				)
			);

			setSnackbar({
				open: true,
				message: `Service status updated to ${
					newStatus ? "Active" : "Inactive"
				}`,
				severity: "success",
			});
		} catch (error) {
			console.error("Error updating service status:", error);
			setSnackbar({
				open: true,
				message: "Failed to update service status. Please try again.",
				severity: "error",
			});
		} finally {
			setLoadingServices(false);
		}
	};

	// Obsługa wyświetlenia szczegółów problemu diagnostycznego
	const handleViewIssueDetails = (issue: DiagnosisIssue) => {
		setSelectedIssue(issue);
		setDetailDialogOpen(true);
	};

	// Filtrowanie diagnostycznych problemów na podstawie wyszukiwania
	const filteredDiagnosticIssues = diagnosticIssues.filter((issue) => {
		const matchesSearch =
			issue.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
			issue.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
			issue.symptoms?.some((symptom) =>
				symptom.toLowerCase().includes(searchTerm.toLowerCase())
			) ||
			issue.causes?.some((cause) =>
				cause.toLowerCase().includes(searchTerm.toLowerCase())
			) ||
			issue.solutions?.some((solution) =>
				solution.toLowerCase().includes(searchTerm.toLowerCase())
			);

		return matchesSearch;
	});

	// Filtrowanie usług warsztatowych na podstawie wyszukiwania
	const filteredServices = services.filter((service) => {
		const matchesSearch =
			service.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
			service.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
			service.category?.toLowerCase().includes(searchTerm.toLowerCase());

		return matchesSearch;
	});

	// Filtrowanie harmonogramów przeglądów na podstawie wyszukiwania
	const filteredSchedules = maintenanceSchedules.filter((schedule) => {
		const matchesSearch =
			schedule.service_type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
			schedule.notes?.toLowerCase().includes(searchTerm.toLowerCase()) ||
			schedule.vehicle_details?.make
				.toLowerCase()
				.includes(searchTerm.toLowerCase()) ||
			schedule.vehicle_details?.model
				.toLowerCase()
				.includes(searchTerm.toLowerCase()) ||
			schedule.vehicle_details?.registration_number
				.toLowerCase()
				.includes(searchTerm.toLowerCase());

		return matchesSearch;
	});

	// Podział problemów diagnostycznych na lewą i prawą kolumnę
	const engineIssues = filteredDiagnosticIssues.filter(
		(issue) => issue.category === "engine"
	);
	const brakeIssues = filteredDiagnosticIssues.filter(
		(issue) => issue.category === "brakes"
	);
	const electricalIssues = filteredDiagnosticIssues.filter(
		(issue) => issue.category === "electrical"
	);
	const otherIssues = filteredDiagnosticIssues.filter(
		(issue) => !["engine", "brakes", "electrical"].includes(issue.category)
	);

	// Obsługa zmiany aktywnej zakładki
	const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
		setActiveTab(newValue);
	};

	// Funkcja zamknięcia powiadomienia
	const handleSnackbarClose = () => {
		setSnackbar({ ...snackbar, open: false });
	};

	return (
		<Mainlayout>
			<Container maxWidth="xl">
				<Box sx={{ py: 3 }}>
					<Box
						sx={{
							display: "flex",
							justifyContent: "space-between",
							alignItems: "center",
							mb: 2,
						}}
					>
						<Typography variant="h4" fontWeight="bold">
							Service & Workshop
						</Typography>

						{activeTab === 1 && (
							<Button
								variant="contained"
								startIcon={<AddIcon />}
								onClick={() => setIsAddModalOpen(true)}
								sx={{
									bgcolor: "#ff3c4e",
									"&:hover": { bgcolor: "#d6303f" },
								}}
							>
								Add Service
							</Button>
						)}
					</Box>

					{/* Zakładki */}
					<Box sx={{ borderBottom: 1, borderColor: "divider", mb: 3 }}>
						<Tabs
							value={activeTab}
							onChange={handleTabChange}
							aria-label="service tabs"
							sx={{
								"& .MuiTab-root": {
									textTransform: "none",
									fontSize: "1rem",
									fontWeight: "medium",
									px: 3,
								},
							}}
						>
							<Tab
								icon={<WarningIcon />}
								iconPosition="start"
								label="Diagnostics & Issues"
							/>
							<Tab
								icon={<BuildIcon />}
								iconPosition="start"
								label="Workshop Services"
							/>
							<Tab
								icon={<CalendarTodayIcon />}
								iconPosition="start"
								label="Due Maintenance"
							/>
						</Tabs>
					</Box>

					{/* Pole wyszukiwania */}
					<Box sx={{ mb: 3 }}>
						<TextField
							fullWidth
							variant="outlined"
							placeholder="Search..."
							value={searchTerm}
							onChange={(e) => setSearchTerm(e.target.value)}
							InputProps={{
								startAdornment: (
									<InputAdornment position="start">
										<SearchIcon />
									</InputAdornment>
								),
							}}
						/>
					</Box>

					{/* Zakładka diagnostyki i problemów */}
					{activeTab === 0 && (
						<>
							{/* Filtry kategorii dla problemów diagnostycznych */}
							<Box sx={{ mb: 3 }}>
								<Tabs
									value={issueCategoryFilter}
									onChange={(e, value) => setIssueCategoryFilter(value)}
									variant="scrollable"
									scrollButtons="auto"
									sx={{
										"& .MuiTab-root": {
											textTransform: "none",
											minWidth: "auto",
											px: 3,
										},
									}}
								>
									<Tab label="All Issues" value="all" />
									<Tab label="Critical" value="critical" />
									<Tab label="Engine" value="engine" />
									<Tab label="Brakes" value="brakes" />
									<Tab label="Electrical" value="electrical" />
									<Tab label="Other" value="other" />
								</Tabs>
							</Box>

							{loadingDiagnostics ? (
								<Box sx={{ textAlign: "center", py: 5 }}>
									<CircularProgress color="error" />
								</Box>
							) : error ? (
								<Alert severity="error" sx={{ mb: 2 }}>
									{error}
									<Button
										variant="outlined"
										color="error"
										size="small"
										sx={{ ml: 2 }}
										onClick={fetchDiagnosticIssues}
									>
										Retry
									</Button>
								</Alert>
							) : filteredDiagnosticIssues.length === 0 ? (
								<Alert severity="info">
									No diagnostic issues found matching your search criteria.
								</Alert>
							) : (
								<Grid container spacing={3}>
									{/* Kolumna problemów */}
									<Grid item xs={12} md={6}>
										<Paper sx={{ p: 3, borderRadius: 2 }}>
											<Box
												sx={{ display: "flex", alignItems: "center", mb: 2 }}
											>
												<WarningIcon color="error" sx={{ mr: 1 }} />
												<Typography variant="h6" fontWeight="bold">
													Issues
												</Typography>
											</Box>
											{engineIssues.map((issue) => (
												<IssueCard
													key={issue.id}
													title={issue.title}
													description={issue.description}
													onViewDetails={() => handleViewIssueDetails(issue)}
												/>
											))}
											{brakeIssues.map((issue) => (
												<IssueCard
													key={issue.id}
													title={issue.title}
													description={issue.description}
													onViewDetails={() => handleViewIssueDetails(issue)}
												/>
											))}
										</Paper>
									</Grid>

									{/* Kolumna rozwiązań */}
									<Grid item xs={12} md={6}>
										<Paper sx={{ p: 3, borderRadius: 2 }}>
											<Box
												sx={{ display: "flex", alignItems: "center", mb: 2 }}
											>
												<BuildIcon color="primary" sx={{ mr: 1 }} />
												<Typography variant="h6" fontWeight="bold">
													Fixes
												</Typography>
											</Box>
											{electricalIssues.map((issue) => (
												<IssueCard
													key={issue.id}
													title={issue.title}
													description={issue.description}
													onViewDetails={() => handleViewIssueDetails(issue)}
												/>
											))}
											{otherIssues.map((issue) => (
												<IssueCard
													key={issue.id}
													title={issue.title}
													description={issue.description}
													onViewDetails={() => handleViewIssueDetails(issue)}
												/>
											))}
										</Paper>
									</Grid>
								</Grid>
							)}
						</>
					)}

					{/* Zakładka usług warsztatowych */}
					{activeTab === 1 && (
						<Paper sx={{ p: 3, borderRadius: 2 }}>
							{loadingServices ? (
								<Box sx={{ textAlign: "center", py: 5 }}>
									<CircularProgress color="error" />
								</Box>
							) : error ? (
								<Alert severity="error" sx={{ mb: 2 }}>
									{error}
									<Button
										variant="outlined"
										color="error"
										size="small"
										sx={{ ml: 2 }}
										onClick={fetchServices}
									>
										Retry
									</Button>
								</Alert>
							) : filteredServices.length === 0 ? (
								<Alert severity="info">
									No services found matching your search criteria.
								</Alert>
							) : (
								<ServiceTable
									services={filteredServices}
									onDeleteServices={handleDeleteServices}
									onEditService={handleEditService}
									onToggleStatus={handleToggleServiceStatus}
								/>
							)}
						</Paper>
					)}

					{/* Zakładka harmonogramów przeglądów */}
					{activeTab === 2 && (
						<Paper sx={{ p: 3, borderRadius: 2 }}>
							{loadingSchedules ? (
								<Box sx={{ textAlign: "center", py: 5 }}>
									<CircularProgress color="error" />
								</Box>
							) : error ? (
								<Alert severity="error" sx={{ mb: 2 }}>
									{error}
									<Button
										variant="outlined"
										color="error"
										size="small"
										sx={{ ml: 2 }}
										onClick={fetchMaintenanceSchedules}
									>
										Retry
									</Button>
								</Alert>
							) : filteredSchedules.length === 0 ? (
								<Alert severity="info">
									No maintenance schedules found matching your search criteria.
								</Alert>
							) : (
								<Box>
									<Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
										Due Maintenance Schedules
									</Typography>

									{filteredSchedules.map((schedule) => (
										<Paper
											key={schedule.id}
											elevation={0}
											sx={{
												p: 2,
												mb: 2,
												border: "1px solid",
												borderColor:
													schedule.status === "overdue"
														? "error.light"
														: schedule.status === "pending"
														? "warning.light"
														: "success.light",
												borderRadius: 2,
											}}
										>
											<Box
												sx={{
													display: "flex",
													justifyContent: "space-between",
													alignItems: "flex-start",
												}}
											>
												<Box>
													<Typography variant="body1" fontWeight="bold">
														{schedule.service_type}
													</Typography>
													<Typography variant="body2" color="text.secondary">
														{schedule.vehicle_details?.make}{" "}
														{schedule.vehicle_details?.model} (
														{schedule.vehicle_details?.year})
													</Typography>
													<Typography variant="body2" color="text.secondary">
														Reg: {schedule.vehicle_details?.registration_number}
													</Typography>
													<Box sx={{ mt: 1 }}>
														<Typography
															variant="caption"
															sx={{
																p: 0.5,
																borderRadius: 1,
																bgcolor:
																	schedule.status === "overdue"
																		? "error.light"
																		: schedule.status === "pending"
																		? "warning.light"
																		: "success.light",
																color:
																	schedule.status === "overdue"
																		? "error.dark"
																		: schedule.status === "pending"
																		? "warning.dark"
																		: "success.dark",
															}}
														>
															{schedule.status.toUpperCase()}
														</Typography>
													</Box>
												</Box>
												<Box>
													<Typography variant="body2" align="right">
														Due:{" "}
														{new Date(schedule.due_date).toLocaleDateString()}
													</Typography>
													{schedule.last_maintenance_date && (
														<Typography
															variant="caption"
															color="text.secondary"
														>
															Last Maintenance:{" "}
															{new Date(
																schedule.last_maintenance_date
															).toLocaleDateString()}
														</Typography>
													)}
												</Box>
											</Box>
											{schedule.notes && (
												<Box sx={{ mt: 1 }}>
													<Typography variant="body2">
														{schedule.notes}
													</Typography>
												</Box>
											)}
										</Paper>
									))}
								</Box>
							)}
						</Paper>
					)}
				</Box>

				{/* Dialog z szczegółami problemu diagnostycznego */}
				<IssueDetailDialog
					open={detailDialogOpen}
					onClose={() => setDetailDialogOpen(false)}
					issue={selectedIssue}
				/>

				{/* Modal dodawania usługi */}
				<AddServiceModal
					open={isAddModalOpen}
					onClose={() => setIsAddModalOpen(false)}
					onServiceAdded={handleServiceAdded}
				/>

				{/* Modal edycji usługi */}
				<EditServiceModal
					open={isEditModalOpen}
					onClose={() => setIsEditModalOpen(false)}
					onServiceUpdated={handleServiceUpdated}
					service={serviceToEdit}
				/>

				{/* Dialog potwierdzenia usunięcia */}
				<Dialog
					open={deleteDialogOpen}
					onClose={() => setDeleteDialogOpen(false)}
				>
					<Typography variant="h6" sx={{ p: 3 }}>
						Confirm Delete
					</Typography>
					<Divider />
					<Box sx={{ p: 3 }}>
						<Typography variant="body1">
							{servicesToDelete.length === 1
								? "Are you sure you want to delete this service?"
								: `Are you sure you want to delete ${servicesToDelete.length} services?`}
						</Typography>
						<Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
							This action cannot be undone.
						</Typography>
					</Box>
					<Box sx={{ display: "flex", justifyContent: "flex-end", p: 2 }}>
						<Button onClick={() => setDeleteDialogOpen(false)} sx={{ mr: 1 }}>
							Cancel
						</Button>
						<Button
							variant="contained"
							color="error"
							onClick={confirmDeleteServices}
						>
							Delete
						</Button>
					</Box>
				</Dialog>

				{/* Powiadomienia */}
				<CustomSnackbar
					snackbarState={snackbar}
					onClose={handleSnackbarClose}
				/>
			</Container>
		</Mainlayout>
	);
};

export default Services;
