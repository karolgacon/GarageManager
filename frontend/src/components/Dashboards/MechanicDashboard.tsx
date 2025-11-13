import React, { useState, useEffect, useContext } from "react";
import {
	Box,
	Grid,
	Paper,
	Typography,
	Button,
	Divider,
	CircularProgress,
	Chip,
	Card,
	CardContent,
	Alert,
} from "@mui/material";
import { Link } from "react-router-dom";
import BuildIcon from "@mui/icons-material/Build";
import WarningIcon from "@mui/icons-material/Warning";
import DirectionsCarIcon from "@mui/icons-material/DirectionsCar";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import PendingIcon from "@mui/icons-material/Pending";
import EventIcon from "@mui/icons-material/Event";
import {
	COLOR_PRIMARY,
	COLOR_SURFACE,
	COLOR_TEXT_PRIMARY,
	COLOR_TEXT_SECONDARY,
	COLOR_SUCCESS,
} from "../../constants";
import AuthContext from "../../context/AuthProvider";
import { serviceService } from "../../api/ServiceAPIEndpoint";
import { diagnosticsService } from "../../api/DiagnosticsAPIEndpoint";
import { vehicleService } from "../../api/VehicleAPIEndpoint";
import { bookingService } from "../../api/BookingAPIEndpoint";
import { workshopService } from "../../api/WorkshopAPIEndpoint";

const MechanicDashboard: React.FC = () => {
	const { auth } = useContext(AuthContext);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [dashboardData, setDashboardData] = useState({
		assignedTasks: 0,
		pendingDiagnostics: 0,
		completedToday: 0,
		vehiclesInService: 0,
		todayTasks: [] as any[],
		criticalIssues: [] as any[],
	});

	useEffect(() => {
		const fetchDashboardData = async () => {
			try {
				setLoading(true);
				setError(null);

				if (!auth || auth.isLoading) {
					return;
				}

				const mechanicId = auth.user_id;

				// Pobierz warsztat mechanika przez API
				let workshopId = null;
				try {
					const workshop = await workshopService.getCurrentUserWorkshop();
					workshopId = workshop.id;
				} catch (workshopError) {
					console.error("Error fetching workshop:", workshopError);
				}

				if (!mechanicId || !workshopId) {
					setError(
						"Missing mechanic or workshop information. Please check your account profile."
					);
					setLoading(false);
					return;
				}

				const services = await serviceService.getAllServices();
				const assignedServices = services.filter(
					(service) =>
						service.assigned_to === mechanicId && service.status === "assigned"
				);

				const diagnostics = await diagnosticsService.getAllDiagnostics();
				const pendingDiagnostics = diagnostics.filter(
					(diag: any) =>
						diag.status === "pending" && diag.assigned_to === mechanicId
				);
				const criticalIssues = diagnostics.filter(
					(diag: any) =>
						diag.severity === "critical" && diag.workshop_id === workshopId
				);

				const today = new Date().toISOString().split("T")[0];
				const completedToday = services.filter(
					(service) =>
						service.assigned_to === mechanicId &&
						service.status === "completed" &&
						service.completion_date &&
						service.completion_date.startsWith(today)
				);

				const vehicles = await vehicleService.getWorkshopVehicles(workshopId);
				const inServiceVehicles = vehicles.filter(
					(vehicle: any) => vehicle.status === "maintenance"
				);

				const bookings = await bookingService.getWorkshopBookings(workshopId);
				const todayBookings = bookings.filter(
					(booking: any) =>
						booking.appointment_date &&
						booking.appointment_date.startsWith(today)
				);

				const todayTasks = todayBookings.map((booking: any) => ({
					id: booking.id,
					vehicle: booking.vehicle_details
						? `${booking.vehicle_details.make} ${booking.vehicle_details.model} (${booking.vehicle_details.registration_number})`
						: "Unknown Vehicle",
					time: booking.appointment_time || "Unknown Time",
					service: booking.service_type || "Vehicle Service",
					status: booking.status || "pending",
				}));

				setDashboardData({
					assignedTasks: assignedServices.length,
					pendingDiagnostics: pendingDiagnostics.length,
					completedToday: completedToday.length,
					vehiclesInService: inServiceVehicles.length,
					todayTasks,
					criticalIssues: criticalIssues.map((issue: any) => ({
						id: issue.id,
						vehicle: issue.vehicle_details
							? `${issue.vehicle_details.make} ${issue.vehicle_details.model} (${issue.vehicle_details.registration_number})`
							: "Unknown Vehicle",
						issue: issue.title || issue.description || "Unknown Issue",
						severity: issue.severity || "critical",
					})),
				});
			} catch (error) {
				setError("Could not load dashboard data. Please try again later.");
			} finally {
				setLoading(false);
			}
		};

		fetchDashboardData();
	}, [auth]);

	if (loading) {
		return (
			<Box sx={{ display: "flex", justifyContent: "center", p: 5 }}>
				<CircularProgress sx={{ color: COLOR_PRIMARY }} />
			</Box>
		);
	}

	if (error) {
		return (
			<Box sx={{ p: 3 }}>
				<Alert severity="warning" sx={{ mb: 3 }}>
					{error}
				</Alert>
				<Paper elevation={2} sx={{ p: 3, borderRadius: 2 }}>
					<Typography variant="h6" gutterBottom>
						Account Configuration Required
					</Typography>
					<Typography paragraph>
						Your account may need to be properly configured with workshop
						information. Please contact your administrator if this issue
						persists.
					</Typography>
					<Button
						variant="contained"
						component={Link}
						to="/profile"
						sx={{
							mr: 2,
							bgcolor: COLOR_PRIMARY,
							"&:hover": { bgcolor: "#d6303f" },
						}}
					>
						View Profile
					</Button>
					<Button variant="outlined" component={Link} to="/">
						Go to Home
					</Button>
				</Paper>
			</Box>
		);
	}

	return (
		<Box>
			<Box sx={{ mb: 4 }}>
				<Typography
					variant="h4"
					gutterBottom
					fontWeight="bold"
					sx={{ color: COLOR_TEXT_PRIMARY }}
				>
					Mechanic Dashboard
				</Typography>
				<Typography variant="subtitle1" sx={{ color: COLOR_TEXT_SECONDARY }}>
					Here's your work overview for today
				</Typography>
			</Box>

			<Grid container spacing={3} sx={{ mb: 4 }}>
				<Grid item xs={12} sm={6} md={3}>
					<Paper
						elevation={2}
						sx={{
							p: 2,
							borderRadius: 2,
							height: "100%",
							backgroundColor: COLOR_SURFACE,
						}}
					>
						<Box
							sx={{ display: "flex", flexDirection: "column", height: "100%" }}
						>
							<BuildIcon sx={{ color: COLOR_PRIMARY, fontSize: 40, mb: 1 }} />
							<Typography
								variant="h5"
								fontWeight="bold"
								sx={{ color: COLOR_TEXT_PRIMARY }}
							>
								{dashboardData.assignedTasks}
							</Typography>
							<Typography variant="body2" sx={{ color: COLOR_TEXT_SECONDARY }}>
								Assigned Tasks
							</Typography>
						</Box>
					</Paper>
				</Grid>

				<Grid item xs={12} sm={6} md={3}>
					<Paper
						elevation={2}
						sx={{
							p: 2,
							borderRadius: 2,
							height: "100%",
							backgroundColor: COLOR_SURFACE,
						}}
					>
						<Box
							sx={{ display: "flex", flexDirection: "column", height: "100%" }}
						>
							<WarningIcon sx={{ color: COLOR_PRIMARY, fontSize: 40, mb: 1 }} />
							<Typography
								variant="h5"
								fontWeight="bold"
								sx={{ color: COLOR_TEXT_PRIMARY }}
							>
								{dashboardData.pendingDiagnostics}
							</Typography>
							<Typography variant="body2" sx={{ color: COLOR_TEXT_SECONDARY }}>
								Pending Diagnostics
							</Typography>
						</Box>
					</Paper>
				</Grid>

				<Grid item xs={12} sm={6} md={3}>
					<Paper
						elevation={2}
						sx={{
							p: 2,
							borderRadius: 2,
							height: "100%",
							backgroundColor: COLOR_SURFACE,
						}}
					>
						<Box
							sx={{ display: "flex", flexDirection: "column", height: "100%" }}
						>
							<CheckCircleIcon
								sx={{ color: COLOR_SUCCESS, fontSize: 40, mb: 1 }}
							/>
							<Typography
								variant="h5"
								fontWeight="bold"
								sx={{ color: COLOR_TEXT_PRIMARY }}
							>
								{dashboardData.completedToday}
							</Typography>
							<Typography variant="body2" sx={{ color: COLOR_TEXT_SECONDARY }}>
								Completed Today
							</Typography>
						</Box>
					</Paper>
				</Grid>

				<Grid item xs={12} sm={6} md={3}>
					<Paper
						elevation={2}
						sx={{
							p: 2,
							borderRadius: 2,
							height: "100%",
							backgroundColor: COLOR_SURFACE,
						}}
					>
						<Box
							sx={{ display: "flex", flexDirection: "column", height: "100%" }}
						>
							<DirectionsCarIcon
								sx={{ color: COLOR_PRIMARY, fontSize: 40, mb: 1 }}
							/>
							<Typography
								variant="h5"
								fontWeight="bold"
								sx={{ color: COLOR_TEXT_PRIMARY }}
							>
								{dashboardData.vehiclesInService}
							</Typography>
							<Typography variant="body2" sx={{ color: COLOR_TEXT_SECONDARY }}>
								Vehicles In Service
							</Typography>
						</Box>
					</Paper>
				</Grid>
			</Grid>

			<Grid container spacing={3}>
				<Grid item xs={12} md={6}>
					<Paper
						elevation={2}
						sx={{
							p: 3,
							borderRadius: 2,
							width: "100%",
							display: "flex",
							flexDirection: "column",
							backgroundColor: COLOR_SURFACE,
						}}
					>
						<Typography
							variant="h6"
							fontWeight="bold"
							gutterBottom
							sx={{ color: COLOR_TEXT_PRIMARY }}
						>
							Today's Tasks
						</Typography>
						<Divider sx={{ my: 2, borderColor: COLOR_TEXT_SECONDARY }} />

						{dashboardData.todayTasks.length === 0 ? (
							<Box
								sx={{
									textAlign: "center",
									py: 4,
								}}
							>
								<EventIcon
									sx={{ fontSize: 48, color: COLOR_TEXT_SECONDARY, mb: 2 }}
								/>
								<Typography
									variant="h6"
									sx={{ color: COLOR_TEXT_PRIMARY, mb: 1 }}
								>
									No tasks scheduled for today
								</Typography>
								<Typography
									variant="body2"
									sx={{ color: COLOR_TEXT_SECONDARY }}
								>
									Enjoy your free time or check upcoming appointments!
								</Typography>
							</Box>
						) : (
							<Grid container spacing={2}>
								{dashboardData.todayTasks.map((task) => (
									<Grid item xs={12} key={task.id}>
										<Card
											elevation={1}
											sx={{
												borderRadius: 2,
												backgroundColor: COLOR_SURFACE,
											}}
										>
											<CardContent>
												<Box
													sx={{
														display: "flex",
														justifyContent: "space-between",
														alignItems: "center",
													}}
												>
													<Box sx={{ flex: 1 }}>
														<Typography
															variant="h6"
															fontWeight="bold"
															sx={{ color: COLOR_TEXT_PRIMARY, mb: 1 }}
														>
															{task.vehicle}
														</Typography>
														<Typography
															variant="body1"
															sx={{ color: COLOR_TEXT_SECONDARY, mb: 0.5 }}
														>
															{task.service}
														</Typography>
														<Typography
															variant="body2"
															sx={{ color: COLOR_PRIMARY, fontWeight: 500 }}
														>
															⏰ {task.time}
														</Typography>
													</Box>
													<Chip
														icon={<PendingIcon />}
														label={
															task.status === "completed"
																? "Completed"
																: "Pending"
														}
														sx={{
															bgcolor:
																task.status === "completed"
																	? COLOR_SUCCESS
																	: COLOR_PRIMARY,
															color: "white",
															"& .MuiChip-icon": { color: "white" },
														}}
													/>
												</Box>
											</CardContent>
										</Card>
									</Grid>
								))}
							</Grid>
						)}

						<Box
							sx={{
								flex: 1,
								display: "flex",
								flexDirection: "column",
								justifyContent: "space-between",
								mt: 3,
							}}
						>
							<Button
								variant="outlined"
								fullWidth
								component={Link}
								to="/bookings"
								sx={{
									borderRadius: 1,
									borderColor: COLOR_PRIMARY,
									color: COLOR_PRIMARY,
									py: 1.5,
									textTransform: "uppercase",
									"&:hover": {
										bgcolor: `${COLOR_PRIMARY}10`,
										borderColor: COLOR_PRIMARY,
									},
								}}
							>
								View All Bookings
							</Button>
						</Box>
					</Paper>
				</Grid>

				<Grid item xs={12} md={6}>
					<Paper
						elevation={2}
						sx={{
							p: 3,
							borderRadius: 2,
							width: "100%",
							display: "flex",
							flexDirection: "column",
							backgroundColor: COLOR_SURFACE,
						}}
					>
						<Typography
							variant="h6"
							fontWeight="bold"
							gutterBottom
							sx={{ color: COLOR_TEXT_PRIMARY }}
						>
							Critical Issues
						</Typography>
						<Divider sx={{ my: 2, borderColor: COLOR_TEXT_SECONDARY }} />

						{dashboardData.criticalIssues.length === 0 ? (
							<Box
								sx={{
									textAlign: "center",
									py: 4,
								}}
							>
								<CheckCircleIcon
									sx={{ fontSize: 48, color: COLOR_SUCCESS, mb: 2 }}
								/>
								<Typography
									variant="h6"
									sx={{ color: COLOR_TEXT_PRIMARY, mb: 1 }}
								>
									All clear!
								</Typography>
								<Typography
									variant="body2"
									sx={{ color: COLOR_TEXT_SECONDARY }}
								>
									No critical issues at the moment.
								</Typography>
							</Box>
						) : (
							<Grid container spacing={2}>
								{dashboardData.criticalIssues.map((issue) => (
									<Grid item xs={12} key={issue.id}>
										<Card
											elevation={1}
											sx={{
												borderRadius: 2,
												backgroundColor: COLOR_SURFACE,
											}}
										>
											<CardContent>
												<Box sx={{ display: "flex", alignItems: "flex-start" }}>
													<WarningIcon
														sx={{
															color: "#EF4444",
															fontSize: 24,
															mr: 2,
															mt: 0.5,
														}}
													/>
													<Box sx={{ flex: 1 }}>
														<Typography
															variant="subtitle1"
															fontWeight="bold"
															sx={{ color: COLOR_TEXT_PRIMARY, mb: 1 }}
														>
															{issue.vehicle}
														</Typography>
														<Typography
															variant="body1"
															sx={{ color: "#EF4444", fontWeight: 500 }}
														>
															{issue.issue}
														</Typography>
														<Chip
															label="CRITICAL"
															size="small"
															sx={{
																bgcolor: "#EF4444",
																color: "white",
																fontWeight: 600,
																fontSize: "0.75rem",
																mt: 1,
															}}
														/>
													</Box>
												</Box>
											</CardContent>
										</Card>
									</Grid>
								))}
							</Grid>
						)}

						<Box
							sx={{
								flex: 1,
								display: "flex",
								flexDirection: "column",
								justifyContent: "space-between",
								mt: 3,
							}}
						>
							<Button
								variant="outlined"
								fullWidth
								component={Link}
								to="/diagnostics"
								sx={{
									borderRadius: 1,
									borderColor: COLOR_PRIMARY,
									color: COLOR_PRIMARY,
									py: 1.5,
									textTransform: "uppercase",
									"&:hover": {
										bgcolor: `${COLOR_PRIMARY}10`,
										borderColor: COLOR_PRIMARY,
									},
								}}
							>
								View All Diagnostics
							</Button>
						</Box>
					</Paper>
				</Grid>
			</Grid>
		</Box>
	);
};

export default MechanicDashboard;
