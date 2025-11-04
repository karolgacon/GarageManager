import React, { useState, useEffect, useContext } from "react";
import {
	Box,
	Container,
	Typography,
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
	Chip,
} from "@mui/material";
import { Link } from "react-router-dom";
import BuildIcon from "@mui/icons-material/Build";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import RefreshIcon from "@mui/icons-material/Refresh";
import Mainlayout from "../components/Mainlayout/Mainlayout";

import ServiceTable from "../components/Service/ServiceTable";
import CustomSnackbar, {
	SnackbarState,
} from "../components/Mainlayout/Snackbar";
import AddServiceModal from "../components/Service/AddServiceModal";
import EditServiceModal from "../components/Service/EditServiceModal";

import { Service } from "../models/ServiceModel";
import { MaintenanceSchedule } from "../models/MaintenanceScheduleModel";

import { serviceService } from "../api/ServiceAPIEndpoint";
import { maintenanceScheduleService } from "../api/MaintenanceScheduleAPIEndpoint";
import { vehicleService } from "../api/VehicleAPIEndpoint";
import AuthContext from "../context/AuthProvider";
import {
	COLOR_PRIMARY,
	COLOR_BACKGROUND,
	COLOR_SURFACE,
	COLOR_TEXT_PRIMARY,
	COLOR_TEXT_SECONDARY,
} from "../constants";

const transformServiceData = (serviceData: any[]): Service[] => {
	return serviceData.map((service) => ({
		id: service.id,
		name: service.name,
		category: service.category,
		price: service.price,
		duration: service.estimated_duration,
		description: service.description,
		is_active: service.is_active ?? true,
		vehicle: null,
		_original: service,
	}));
};

const Services: React.FC = () => {
	const { auth } = useContext(AuthContext);

	const isAdmin = () => {
		return auth.roles?.includes("admin") || auth.roles?.[0] === "admin";
	};

	const [activeTab, setActiveTab] = useState<number>(0);

	const [services, setServices] = useState<Service[]>([]);
	const [loadingServices, setLoadingServices] = useState(false);

	const [maintenanceSchedules, setMaintenanceSchedules] = useState<
		MaintenanceSchedule[]
	>([]);
	const [loadingSchedules, setLoadingSchedules] = useState(false);

	const [error, setError] = useState<string | null>(null);
	const [userVehicles, setUserVehicles] = useState<any[]>([]);
	const [loadingVehicles, setLoadingVehicles] = useState(false);

	const [snackbar, setSnackbar] = useState<SnackbarState>({
		open: false,
		message: "",
		severity: "success",
	});

	const [addModalOpen, setAddModalOpen] = useState(false);
	const [editModalOpen, setEditModalOpen] = useState(false);
	const [serviceToEdit, setServiceToEdit] = useState<Service | null>(null);

	useEffect(() => {
		if (auth.user_id) {
			if (isAdmin()) {
				fetchAllServices();
				fetchAllMaintenanceSchedules();
			} else {
				fetchUserVehicles();
			}
		}
	}, [auth.user_id]);

	useEffect(() => {
		let isMounted = true;

		const loadData = async () => {
			if (!isAdmin() && auth.user_id) {
				if (activeTab === 0) {
					await fetchClientServices();
				} else if (activeTab === 1) {
					await fetchClientMaintenanceSchedules();
				}
			}
		};

		loadData();

		return () => {
			isMounted = false;
		};
	}, [activeTab, auth.user_id]);

	const fetchUserVehicles = async () => {
		try {
			setLoadingVehicles(true);
			setError(null);

			if (!auth.user_id) {
				setError("User information not available");
				return;
			}

			const vehicles = await vehicleService.getClientVehicles(auth.user_id);
			setUserVehicles(vehicles);

			if (vehicles.length === 0) {
				setError(
					"You don't have any vehicles registered. Please add a vehicle to view services."
				);
			}
		} catch (error) {
			setError("Failed to load your vehicles. Please try again.");
		} finally {
			setLoadingVehicles(false);
		}
	};

	const fetchClientServices = async () => {
		try {
			setLoadingServices(true);
			setError(null);

			if (!auth.user_id) {
				setError("User information not available");
				setLoadingServices(false);
				return;
			}

			const clientServices = await serviceService.getClientServices(
				auth.user_id
			);

			const servicesChanged =
				JSON.stringify(clientServices) !== JSON.stringify(services);

			if (servicesChanged) {
				setServices(clientServices || []);
			}
		} catch (error) {
			setError("Failed to load your service history. Please try again.");
		} finally {
			setLoadingServices(false);
		}
	};

	const fetchClientMaintenanceSchedules = async () => {
		try {
			setLoadingSchedules(true);
			setError(null);

			if (!auth.user_id) {
				setError("User information not available");
				return;
			}

			const clientSchedules =
				await maintenanceScheduleService.getClientSchedules(auth.user_id);

			if (clientSchedules && Array.isArray(clientSchedules)) {
				setMaintenanceSchedules(clientSchedules);
			} else {
				setMaintenanceSchedules([]);
			}
		} catch (error) {
			setError("Failed to load maintenance schedules. Please try again.");
		} finally {
			setLoadingSchedules(false);
		}
	};

	const fetchDueMaintenanceSchedules = async () => {
		try {
			setLoadingSchedules(true);
			setError(null);

			const dueSchedules = await maintenanceScheduleService.getDueSchedules(
				auth.user_id
			);

			const updatedSchedules = [...maintenanceSchedules];

			dueSchedules.forEach((dueSchedule) => {
				const index = updatedSchedules.findIndex(
					(s) => s.id === dueSchedule.id
				);
				if (index >= 0) {
					updatedSchedules[index] = {
						...updatedSchedules[index],
						status: "overdue",
					};
				} else {
					updatedSchedules.push({
						...dueSchedule,
						status: "overdue",
					});
				}
			});

			setMaintenanceSchedules(updatedSchedules);
		} catch (error) {
			setError("Failed to load due maintenance schedules. Please try again.");
		} finally {
			setLoadingSchedules(false);
		}
	};

	const fetchAllServices = async () => {
		try {
			setLoadingServices(true);
			setError(null);

			const allServices = await serviceService.getAllServices();

			const transformedServices = transformServiceData(allServices);

			setServices(transformedServices);
		} catch (error) {
			setError("Failed to load all services. Please try again.");
		} finally {
			setLoadingServices(false);
		}
	};

	const fetchAllMaintenanceSchedules = async () => {
		try {
			setLoadingSchedules(true);
			setError(null);

			const allSchedules = await maintenanceScheduleService.getAllSchedules();
			setMaintenanceSchedules(allSchedules);
		} catch (error) {
			setError("Failed to load all maintenance schedules. Please try again.");
		} finally {
			setLoadingSchedules(false);
		}
	};

	const filteredSchedules = maintenanceSchedules.filter((schedule) => {
		const matchesSearch =
			schedule.service_type?.toLowerCase().includes("") ||
			schedule.notes?.toLowerCase().includes("") ||
			schedule.vehicle_details?.make.toLowerCase().includes("") ||
			schedule.vehicle_details?.model.toLowerCase().includes("") ||
			schedule.vehicle_details?.registration_number.toLowerCase().includes("");

		return matchesSearch;
	});

	const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
		setActiveTab(newValue);
	};

	const handleSnackbarClose = () => {
		setSnackbar({ ...snackbar, open: false });
	};

	const handleOpenAddModal = () => setAddModalOpen(true);
	const handleCloseAddModal = () => setAddModalOpen(false);

	const handleOpenEditModal = (service: Service) => {
		setServiceToEdit(service);
		setEditModalOpen(true);
	};
	const handleCloseEditModal = () => {
		setEditModalOpen(false);
		setServiceToEdit(null);
	};

	const handleServiceAdded = (newService: Service) => {
		setSnackbar({
			open: true,
			message: "Service added successfully!",
			severity: "success",
		});
		fetchAllServices();
	};

	const handleServiceUpdated = (updatedService: Service) => {
		setSnackbar({
			open: true,
			message: "Service updated successfully!",
			severity: "success",
		});
		fetchAllServices();
	};

	const handleDeleteServices = async (ids: number[]) => {
		try {
			for (const id of ids) {
				await serviceService.deleteService(id);
			}
			setSnackbar({
				open: true,
				message: "Service(s) deleted successfully!",
				severity: "success",
			});
			fetchAllServices();
		} catch (error) {
			setSnackbar({
				open: true,
				message: "Failed to delete service(s).",
				severity: "error",
			});
		}
	};

	return (
		<Mainlayout>
			<Container
				maxWidth="xl"
				sx={{ backgroundColor: COLOR_BACKGROUND, minHeight: "100vh" }}
			>
				<Box sx={{ py: 3 }}>
					<Box
						sx={{
							display: "flex",
							justifyContent: "space-between",
							alignItems: "center",
							mb: 2,
						}}
					>
						<Typography
							variant="h4"
							fontWeight="bold"
							sx={{ color: COLOR_TEXT_PRIMARY }}
						>
							{isAdmin() ? "All Vehicle Services" : "Your Vehicle Services"}
						</Typography>
						{isAdmin() && (
							<Button
								variant="contained"
								color="primary"
								onClick={fetchAllServices}
								startIcon={<RefreshIcon />}
								sx={{
									bgcolor: COLOR_PRIMARY,
									color: "white",
									"&:hover": { bgcolor: "#2563EB" },
								}}
							>
								Refresh Data
							</Button>
						)}
					</Box>

					<Box
						sx={{ borderBottom: 1, borderColor: COLOR_TEXT_SECONDARY, mb: 3 }}
					>
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
									color: COLOR_TEXT_SECONDARY,
								},
								"& .Mui-selected": {
									color: COLOR_PRIMARY,
								},
								"& .MuiTabs-indicator": {
									backgroundColor: COLOR_PRIMARY,
								},
							}}
						>
							<Tab
								icon={<BuildIcon />}
								iconPosition="start"
								label="Service History"
							/>
							<Tab
								icon={<CalendarTodayIcon />}
								iconPosition="start"
								label="Maintenance Schedule"
							/>
						</Tabs>
					</Box>

					{isAdmin() && activeTab === 0 && (
						<Paper
							sx={{
								p: 3,
								borderRadius: 2,
								backgroundColor: COLOR_SURFACE,
								border: `1px solid ${COLOR_TEXT_SECONDARY}`,
							}}
						>
							<ServiceTable
								services={services}
								onEditService={handleOpenEditModal}
								onDeleteServices={handleDeleteServices}
								onAddService={handleOpenAddModal}
								showAddButton={true}
							/>
							<AddServiceModal
								open={addModalOpen}
								onClose={handleCloseAddModal}
								onServiceAdded={handleServiceAdded}
							/>
							<EditServiceModal
								open={editModalOpen}
								onClose={handleCloseEditModal}
								onServiceUpdated={handleServiceUpdated}
								service={serviceToEdit}
							/>
						</Paper>
					)}

					{!isAdmin() && activeTab === 0 && (
						<Paper
							sx={{
								p: 3,
								borderRadius: 2,
								backgroundColor: COLOR_SURFACE,
								border: `1px solid ${COLOR_TEXT_SECONDARY}`,
							}}
						>
							{loadingServices ? (
								<Box sx={{ textAlign: "center", py: 5 }}>
									<CircularProgress sx={{ color: COLOR_PRIMARY }} />
								</Box>
							) : error ? (
								<Alert
									severity="error"
									sx={{
										mb: 2,
										backgroundColor: "rgba(239, 68, 68, 0.1)",
										color: COLOR_TEXT_PRIMARY,
										"& .MuiAlert-icon": {
											color: "#EF4444",
										},
									}}
								>
									{error}
									<Button
										variant="outlined"
										size="small"
										sx={{
											ml: 2,
											color: COLOR_PRIMARY,
											borderColor: COLOR_PRIMARY,
											"&:hover": {
												borderColor: "#2563EB",
												backgroundColor: "rgba(56, 130, 246, 0.1)",
											},
										}}
										onClick={fetchClientServices}
									>
										Retry
									</Button>
								</Alert>
							) : services.length === 0 ? (
								<Alert
									severity="info"
									sx={{
										backgroundColor: "rgba(34, 211, 238, 0.1)",
										color: COLOR_TEXT_PRIMARY,
										"& .MuiAlert-icon": {
											color: "#22D3EE",
										},
									}}
								>
									No service history found for your vehicles.
								</Alert>
							) : (
								<Box>
									<Typography
										variant="h6"
										fontWeight="bold"
										sx={{ mb: 2, color: COLOR_TEXT_PRIMARY }}
									>
										Your Service History
									</Typography>
									{services.map((service, index) => (
										<Paper
											key={`service-${service.id || index}`}
											elevation={0}
											sx={{
												p: 2,
												mb: 2,
												border: "1px solid",
												borderColor: COLOR_TEXT_SECONDARY,
												borderRadius: 2,
												backgroundColor: COLOR_BACKGROUND,
											}}
										>
											<Grid container spacing={2}>
												<Grid item xs={12} sm={8}>
													<Typography
														variant="h6"
														sx={{ color: COLOR_TEXT_PRIMARY }}
													>
														{service.name}
													</Typography>
													<Typography
														variant="body2"
														sx={{ color: COLOR_TEXT_SECONDARY }}
													>
														{service.vehicle?.make} {service.vehicle?.model} (
														{service.vehicle?.registration_number})
													</Typography>
													<Typography
														variant="body2"
														paragraph
														sx={{ color: COLOR_TEXT_PRIMARY }}
													>
														{service.description}
													</Typography>
													<Chip
														label={service.status || "Unknown"}
														size="small"
														sx={{
															bgcolor:
																service.status === "completed"
																	? "rgba(16, 185, 129, 0.2)"
																	: service.status === "in_progress"
																	? "rgba(245, 158, 11, 0.2)"
																	: "rgba(156, 163, 175, 0.2)",
															color:
																service.status === "completed"
																	? "#10B981"
																	: service.status === "in_progress"
																	? "#F59E0B"
																	: COLOR_TEXT_SECONDARY,
														}}
													/>
												</Grid>
												<Grid
													item
													xs={12}
													sm={4}
													sx={{ textAlign: { sm: "right" } }}
												>
													<Typography
														variant="body2"
														sx={{ color: COLOR_TEXT_PRIMARY }}
													>
														<strong>Date:</strong>{" "}
														{service.service_date
															? new Date(
																	service.service_date
															  ).toLocaleDateString()
															: "Not scheduled"}
													</Typography>
													<Typography
														variant="body2"
														sx={{ color: COLOR_TEXT_PRIMARY }}
													>
														<strong>Cost:</strong> ${service.cost || "0.00"}
													</Typography>
												</Grid>
											</Grid>
										</Paper>
									))}
								</Box>
							)}
						</Paper>
					)}

					{activeTab === 1 && (
						<Paper
							sx={{
								p: 3,
								borderRadius: 2,
								backgroundColor: COLOR_SURFACE,
								border: `1px solid ${COLOR_TEXT_SECONDARY}`,
							}}
						>
							{loadingSchedules ? (
								<Box sx={{ textAlign: "center", py: 5 }}>
									<CircularProgress sx={{ color: COLOR_PRIMARY }} />
								</Box>
							) : error ? (
								<Alert
									severity="error"
									sx={{
										mb: 2,
										backgroundColor: "rgba(239, 68, 68, 0.1)",
										color: COLOR_TEXT_PRIMARY,
										"& .MuiAlert-icon": {
											color: "#EF4444",
										},
									}}
								>
									{error}
									<Button
										variant="outlined"
										size="small"
										sx={{
											ml: 2,
											color: COLOR_PRIMARY,
											borderColor: COLOR_PRIMARY,
											"&:hover": {
												borderColor: "#2563EB",
												backgroundColor: "rgba(56, 130, 246, 0.1)",
											},
										}}
										onClick={fetchClientMaintenanceSchedules}
									>
										Retry
									</Button>
								</Alert>
							) : filteredSchedules.length === 0 ? (
								<Alert
									severity="info"
									sx={{
										backgroundColor: "rgba(34, 211, 238, 0.1)",
										color: COLOR_TEXT_PRIMARY,
										"& .MuiAlert-icon": {
											color: "#22D3EE",
										},
									}}
								>
									No maintenance schedules found for your vehicles.
								</Alert>
							) : (
								<Box>
									<Box
										sx={{
											display: "flex",
											justifyContent: "space-between",
											alignItems: "center",
											mb: 2,
										}}
									>
										<Typography
											variant="h6"
											fontWeight="bold"
											sx={{ color: COLOR_TEXT_PRIMARY }}
										>
											{isAdmin()
												? "All Maintenance Schedules"
												: "Your Maintenance Schedule"}
										</Typography>
										<Button
											variant="outlined"
											size="small"
											startIcon={<RefreshIcon />}
											onClick={
												isAdmin()
													? fetchAllMaintenanceSchedules
													: fetchDueMaintenanceSchedules
											}
											sx={{
												borderColor: COLOR_PRIMARY,
												color: COLOR_PRIMARY,
												"&:hover": {
													borderColor: "#2563EB",
													backgroundColor: "rgba(56, 130, 246, 0.1)",
												},
											}}
										>
											{isAdmin() ? "Refresh All" : "Check Due Maintenance"}
										</Button>
									</Box>

									{filteredSchedules.map((schedule, index) => (
										<Paper
											key={`schedule-${schedule.id || index}`}
											elevation={0}
											sx={{
												p: 2,
												mb: 2,
												border: "1px solid",
												borderColor: !schedule.status
													? COLOR_TEXT_SECONDARY
													: schedule.status === "overdue"
													? COLOR_PRIMARY
													: schedule.status === "pending"
													? "#F59E0B"
													: "#10B981",
												borderRadius: 2,
												backgroundColor: COLOR_BACKGROUND,
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
													<Typography
														variant="body1"
														fontWeight="bold"
														sx={{ color: COLOR_TEXT_PRIMARY }}
													>
														{schedule.service_type}
													</Typography>
													<Typography
														variant="body2"
														sx={{ color: COLOR_TEXT_SECONDARY }}
													>
														{schedule.vehicle_details?.make || "Unknown"}{" "}
														{schedule.vehicle_details?.model || "Unknown"} (
														{schedule.vehicle_details?.year || "Unknown"})
													</Typography>
													<Typography
														variant="body2"
														sx={{ color: COLOR_TEXT_SECONDARY }}
													>
														Reg:{" "}
														{schedule.vehicle_details?.registration_number ||
															"Unknown"}
													</Typography>
													<Box sx={{ mt: 1 }}>
														<Typography
															variant="caption"
															sx={{
																p: 0.5,
																borderRadius: 1,
																bgcolor:
																	schedule.status === "overdue"
																		? COLOR_PRIMARY
																		: schedule.status === "pending"
																		? "#F59E0B"
																		: "#10B981",
																color: "#fff",
															}}
														>
															{schedule.status
																? schedule.status.toUpperCase()
																: "UNKNOWN"}
														</Typography>
													</Box>
												</Box>
												<Box>
													<Typography
														variant="body2"
														align="right"
														sx={{ color: COLOR_TEXT_PRIMARY }}
													>
														Due:{" "}
														{schedule.due_date
															? new Date(schedule.due_date).toLocaleDateString()
															: "Unknown"}
													</Typography>
													{schedule.last_maintenance_date && (
														<Typography
															variant="caption"
															sx={{ color: COLOR_TEXT_SECONDARY }}
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
													<Typography
														variant="body2"
														sx={{ color: COLOR_TEXT_PRIMARY }}
													>
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

					<AddServiceModal
						open={addModalOpen}
						onClose={handleCloseAddModal}
						onServiceAdded={handleServiceAdded}
					/>

					<EditServiceModal
						open={editModalOpen}
						onClose={handleCloseEditModal}
						service={serviceToEdit}
						onServiceUpdated={handleServiceUpdated}
					/>
				</Box>

				<CustomSnackbar
					snackbarState={snackbar}
					onClose={handleSnackbarClose}
				/>
			</Container>
		</Mainlayout>
	);
};

export default Services;
