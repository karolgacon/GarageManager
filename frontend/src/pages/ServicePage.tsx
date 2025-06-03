import React, { useState, useEffect, useContext } from "react";
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
	Chip, // Add Chip here since it's used in your component
} from "@mui/material";
import { Link } from "react-router-dom"; // Add this import for the Link component
import SearchIcon from "@mui/icons-material/Search";
import BuildIcon from "@mui/icons-material/Build";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import RefreshIcon from "@mui/icons-material/Refresh";
import Mainlayout from "../components/Mainlayout/Mainlayout";

// Components
import ServiceTable from "../components/Service/ServiceTable";
import CustomSnackbar, {
	SnackbarState,
} from "../components/Mainlayout/Snackbar";

// Models
import { Service } from "../models/ServiceModel";
import { MaintenanceSchedule } from "../models/MaintenanceScheduleModel";

// API Services
import { serviceService } from "../api/ServiceAPIEndpoint";
import { maintenanceScheduleService } from "../api/MaintenanceScheduleAPIEndpoint";
import { vehicleService } from "../api/VehicleAPIEndpoint";
import AuthContext from "../context/AuthProvider";
import { COLOR_PRIMARY } from "../constants";

const Services: React.FC = () => {
	// Auth context for user role and ID
	const { auth } = useContext(AuthContext);

	// Tab state - only two tabs now: services and maintenance
	const [activeTab, setActiveTab] = useState<number>(0);

	// Services states
	const [services, setServices] = useState<Service[]>([]);
	const [loadingServices, setLoadingServices] = useState(false);

	// Maintenance schedules states
	const [maintenanceSchedules, setMaintenanceSchedules] = useState<
		MaintenanceSchedule[]
	>([]);
	const [loadingSchedules, setLoadingSchedules] = useState(false);

	// Common states
	const [error, setError] = useState<string | null>(null);
	const [searchTerm, setSearchTerm] = useState("");
	const [userVehicles, setUserVehicles] = useState<any[]>([]);
	const [loadingVehicles, setLoadingVehicles] = useState(false);

	// Snackbar state
	const [snackbar, setSnackbar] = useState<SnackbarState>({
		open: false,
		message: "",
		severity: "success",
	});

	// Load data when tab changes
	useEffect(() => {
		if (auth.user_id) {
			fetchUserVehicles();
		}
	}, [auth.user_id]);

	useEffect(() => {
		if (userVehicles.length > 0) {
			if (activeTab === 0) {
				fetchClientServices();
			} else if (activeTab === 1) {
				fetchClientMaintenanceSchedules();
			}
		}
	}, [activeTab, userVehicles]);

	// Fetch client's vehicles
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
			console.error("Error fetching user vehicles:", error);
			setError("Failed to load your vehicles. Please try again.");
		} finally {
			setLoadingVehicles(false);
		}
	};

	// Fetch services for client's vehicles only - more efficient method
	const fetchClientServices = async () => {
		try {
			setLoadingServices(true);
			setError(null);

			if (!auth.user_id) {
				setError("User information not available");
				return;
			}

			// Option 1: Get client's services directly if API supports it
			try {
				const clientServices = await serviceService.getClientServices(
					auth.user_id
				);
				if (clientServices && Array.isArray(clientServices)) {
					console.log(
						`Found ${clientServices.length} services for client ${auth.user_id}`
					);
					setServices(clientServices);
					return;
				}
			} catch (directError) {
				console.error(
					"Direct client services fetch failed, falling back to vehicle-by-vehicle method"
				);
			}

			// Option 2: Fetch services for each vehicle if needed
			if (userVehicles.length === 0) {
				setServices([]);
				return;
			}

			const vehicleIds = userVehicles.map((vehicle) => vehicle.id);
			let allServices: Service[] = [];
			const serviceIdsSet = new Set<number>(); // Track service IDs to prevent duplicates

			// Fetch services for each vehicle
			for (const vehicleId of vehicleIds) {
				try {
					const vehicleServices = await serviceService.getVehicleServices(
						vehicleId
					);
					if (vehicleServices && Array.isArray(vehicleServices)) {
						// Only add services that haven't been added yet
						const uniqueServices = vehicleServices.filter((service) => {
							if (!serviceIdsSet.has(service.id)) {
								serviceIdsSet.add(service.id);
								return true;
							}
							return false;
						});
						allServices = [...allServices, ...uniqueServices];
					}
				} catch (err) {
					console.error(
						`Error fetching services for vehicle ${vehicleId}:`,
						err
					);
				}
			}

			setServices(allServices);
		} catch (error) {
			console.error("Error fetching client services:", error);
			setError("Failed to load your service history. Please try again.");
		} finally {
			setLoadingServices(false);
		}
	};

	// Fetch maintenance schedules for client's vehicles
	const fetchClientMaintenanceSchedules = async () => {
		try {
			setLoadingSchedules(true);
			setError(null);

			if (!auth.user_id) {
				setError("User information not available");
				return;
			}

			// Option 1: Try to get all client schedules at once if endpoint supports it
			try {
				const clientSchedules =
					await maintenanceScheduleService.getClientSchedules(auth.user_id);
				if (clientSchedules && Array.isArray(clientSchedules)) {
					console.log(
						`Found ${clientSchedules.length} maintenance schedules for client ${auth.user_id}`
					);
					setMaintenanceSchedules(clientSchedules);
					return;
				}
			} catch (directError) {
				console.error(
					"Direct client schedules fetch failed, falling back to vehicle-by-vehicle method"
				);
			}

			// Option 2: Fetch schedules for each vehicle if needed
			if (userVehicles.length === 0) {
				setMaintenanceSchedules([]);
				return;
			}

			const vehicleIds = userVehicles.map((vehicle) => vehicle.id);
			let allSchedules: MaintenanceSchedule[] = [];
			const scheduleIdsSet = new Set<number>(); // Track schedule IDs to prevent duplicates

			// Fetch maintenance schedules for each vehicle
			for (const vehicleId of vehicleIds) {
				try {
					const vehicleSchedules =
						await maintenanceScheduleService.getVehicleSchedules(vehicleId);
					if (vehicleSchedules && Array.isArray(vehicleSchedules)) {
						// Only add schedules that haven't been added yet
						const uniqueSchedules = vehicleSchedules.filter((schedule) => {
							if (!scheduleIdsSet.has(schedule.id)) {
								scheduleIdsSet.add(schedule.id);
								return true;
							}
							return false;
						});
						allSchedules = [...allSchedules, ...uniqueSchedules];
					}
				} catch (err) {
					console.error(
						`Error fetching maintenance for vehicle ${vehicleId}:`,
						err
					);
				}
			}

			setMaintenanceSchedules(allSchedules);
		} catch (error) {
			console.error("Error fetching maintenance schedules:", error);
			setError("Failed to load your maintenance schedules. Please try again.");
		} finally {
			setLoadingSchedules(false);
		}
	};

	// Fetch overdue and upcoming maintenance
	const fetchDueMaintenanceSchedules = async () => {
		try {
			setLoadingSchedules(true);
			setError(null);

			// Pass the client ID to get only this client's due schedules
			const dueSchedules = await maintenanceScheduleService.getDueSchedules(
				auth.user_id
			);

			// Highlight these in the UI with appropriate status
			const updatedSchedules = [...maintenanceSchedules];

			// Mark matching schedules as due/overdue
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
					// If the schedule wasn't loaded before, add it to the list
					updatedSchedules.push({
						...dueSchedule,
						status: "overdue",
					});
				}
			});

			setMaintenanceSchedules(updatedSchedules);
		} catch (error) {
			console.error("Error fetching due maintenance schedules:", error);
		} finally {
			setLoadingSchedules(false);
		}
	};

	// Filter services based on search term
	const filteredServices = services.filter((service) => {
		const matchesSearch =
			service.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
			service.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
			service.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
			service.vehicle?.make?.toLowerCase().includes(searchTerm.toLowerCase()) ||
			service.vehicle?.model
				?.toLowerCase()
				.includes(searchTerm.toLowerCase()) ||
			service.vehicle?.registration_number
				?.toLowerCase()
				.includes(searchTerm.toLowerCase());

		return matchesSearch;
	});

	// Filter maintenance schedules based on search term
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

	// Handle tab change
	const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
		setActiveTab(newValue);
	};

	// Handle snackbar close
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
							Your Vehicle Services
						</Typography>
					</Box>

					{/* Tabs */}
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

					{/* Search field */}
					<Box sx={{ mb: 3 }}>
						<TextField
							fullWidth
							variant="outlined"
							placeholder="Search services, vehicles..."
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

					{loadingVehicles ? (
						<Box sx={{ textAlign: "center", py: 5 }}>
							<CircularProgress sx={{ color: COLOR_PRIMARY }} />
						</Box>
					) : userVehicles.length === 0 ? (
						<Paper sx={{ p: 4, borderRadius: 2, textAlign: "center" }}>
							<Typography variant="h6" gutterBottom>
								No Vehicles Found
							</Typography>
							<Typography variant="body1" color="text.secondary" paragraph>
								You need to add a vehicle to view service history and
								maintenance schedules.
							</Typography>
							<Button
								component={Link}
								to="/vehicles/add"
								variant="contained"
								sx={{
									bgcolor: COLOR_PRIMARY,
									"&:hover": { bgcolor: "#d6303f" },
								}}
							>
								Add Vehicle
							</Button>
						</Paper>
					) : (
						<>
							{/* Services Tab Content */}
							{activeTab === 0 && (
								<Paper sx={{ p: 3, borderRadius: 2 }}>
									{loadingServices ? (
										<Box sx={{ textAlign: "center", py: 5 }}>
											<CircularProgress sx={{ color: COLOR_PRIMARY }} />
										</Box>
									) : error ? (
										<Alert severity="error" sx={{ mb: 2 }}>
											{error}
											<Button
												variant="outlined"
												size="small"
												sx={{
													ml: 2,
													color: COLOR_PRIMARY,
													borderColor: COLOR_PRIMARY,
												}}
												onClick={fetchClientServices}
											>
												Retry
											</Button>
										</Alert>
									) : filteredServices.length === 0 ? (
										<Alert severity="info">
											No service history found for your vehicles.
										</Alert>
									) : (
										<Box>
											<Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
												Your Service History
											</Typography>

											{filteredServices.map((service, index) => (
												<Paper
													key={`service-${service.id || index}`} // Use compound key
													elevation={0}
													sx={{
														p: 2,
														mb: 2,
														border: "1px solid",
														borderColor: "grey.300",
														borderRadius: 2,
													}}
												>
													<Grid container spacing={2}>
														<Grid item xs={12} sm={8}>
															<Typography variant="h6">
																{service.name}
															</Typography>
															<Typography
																variant="body2"
																color="text.secondary"
															>
																{service.vehicle?.make} {service.vehicle?.model}{" "}
																({service.vehicle?.registration_number})
															</Typography>
															<Typography variant="body2" paragraph>
																{service.description}
															</Typography>
															<Chip
																label={service.status || "Unknown"}
																size="small"
																sx={{
																	bgcolor:
																		service.status === "completed"
																			? "#e8f5e9"
																			: service.status === "in_progress"
																			? "#fff8e1"
																			: "#f5f5f5",
																	color:
																		service.status === "completed"
																			? "#2e7d32"
																			: service.status === "in_progress"
																			? "#f57c00"
																			: "#757575",
																}}
															/>
														</Grid>
														<Grid
															item
															xs={12}
															sm={4}
															sx={{ textAlign: { sm: "right" } }}
														>
															<Typography variant="body2">
																<strong>Date:</strong>{" "}
																{service.service_date
																	? new Date(
																			service.service_date
																	  ).toLocaleDateString()
																	: "Not scheduled"}
															</Typography>
															<Typography variant="body2">
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

							{/* Maintenance Tab Content */}
							{activeTab === 1 && (
								<Paper sx={{ p: 3, borderRadius: 2 }}>
									{loadingSchedules ? (
										<Box sx={{ textAlign: "center", py: 5 }}>
											<CircularProgress sx={{ color: COLOR_PRIMARY }} />
										</Box>
									) : error ? (
										<Alert severity="error" sx={{ mb: 2 }}>
											{error}
											<Button
												variant="outlined"
												size="small"
												sx={{
													ml: 2,
													color: COLOR_PRIMARY,
													borderColor: COLOR_PRIMARY,
												}}
												onClick={fetchClientMaintenanceSchedules}
											>
												Retry
											</Button>
										</Alert>
									) : filteredSchedules.length === 0 ? (
										<Alert severity="info">
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
												<Typography variant="h6" fontWeight="bold">
													Your Maintenance Schedule
												</Typography>
												<Button
													variant="outlined"
													size="small"
													startIcon={<RefreshIcon />}
													onClick={fetchDueMaintenanceSchedules}
													sx={{
														borderColor: COLOR_PRIMARY,
														color: COLOR_PRIMARY,
													}}
												>
													Check Due Maintenance
												</Button>
											</Box>

											{filteredSchedules.map((schedule, index) => (
												<Paper
													key={`schedule-${schedule.id || index}`} // Use compound key
													elevation={0}
													sx={{
														p: 2,
														mb: 2,
														border: "1px solid",
														borderColor: !schedule.status
															? "grey.300"
															: schedule.status === "overdue"
															? COLOR_PRIMARY
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
															<Typography
																variant="body2"
																color="text.secondary"
															>
																{schedule.vehicle_details?.make || "Unknown"}{" "}
																{schedule.vehicle_details?.model || "Unknown"} (
																{schedule.vehicle_details?.year || "Unknown"})
															</Typography>
															<Typography
																variant="body2"
																color="text.secondary"
															>
																Reg:{" "}
																{schedule.vehicle_details
																	?.registration_number || "Unknown"}
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
																				? "warning.light"
																				: "success.light",
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
															<Typography variant="body2" align="right">
																Due:{" "}
																{schedule.due_date
																	? new Date(
																			schedule.due_date
																	  ).toLocaleDateString()
																	: "Unknown"}
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
						</>
					)}
				</Box>

				{/* Snackbar */}
				<CustomSnackbar
					snackbarState={snackbar}
					onClose={handleSnackbarClose}
				/>
			</Container>
		</Mainlayout>
	);
};

export default Services;
