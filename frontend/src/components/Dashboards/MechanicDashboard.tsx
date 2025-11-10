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
import {
	COLOR_PRIMARY,
	COLOR_SURFACE,
	COLOR_TEXT_PRIMARY,
	COLOR_TEXT_SECONDARY,
} from "../../constants";
import AuthContext from "../../context/AuthProvider";
import { serviceService } from "../../api/ServiceAPIEndpoint";
import { diagnosticsService } from "../../api/DiagnosticsAPIEndpoint";
import { vehicleService } from "../../api/VehicleAPIEndpoint";
import { bookingService } from "../../api/BookingAPIEndpoint";

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
				const workshopId = (auth as any).workshop_id;

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
								sx={{ color: COLOR_PRIMARY, fontSize: 40, mb: 1 }}
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
				<Grid item xs={12} md={8}>
					<Paper
						elevation={2}
						sx={{
							p: 3,
							borderRadius: 2,
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
							<Typography
								variant="body1"
								sx={{
									textAlign: "center",
									py: 2,
									color: COLOR_TEXT_PRIMARY,
								}}
							>
								No tasks scheduled for today.
							</Typography>
						) : (
							<Grid container spacing={2}>
								{dashboardData.todayTasks.map((task) => (
									<Grid item xs={12} key={task.id}>
										<Card
											variant="outlined"
											sx={{
												borderRadius: 2,
												borderColor: COLOR_TEXT_SECONDARY,
												backgroundColor: COLOR_SURFACE,
											}}
										>
											<CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
												<Box
													sx={{
														display: "flex",
														justifyContent: "space-between",
														alignItems: "center",
													}}
												>
													<Box>
														<Typography
															variant="subtitle1"
															fontWeight="medium"
															sx={{ color: COLOR_TEXT_PRIMARY }}
														>
															{task.vehicle}
														</Typography>
														<Typography
															variant="body2"
															sx={{ color: COLOR_TEXT_SECONDARY }}
														>
															{task.service} - {task.time}
														</Typography>
													</Box>
													<Chip
														icon={<PendingIcon />}
														label="Pending"
														size="small"
														color="primary"
														sx={{
															bgcolor:
																task.status === "completed"
																	? "success.main"
																	: COLOR_PRIMARY,
														}}
													/>
												</Box>
											</CardContent>
										</Card>
									</Grid>
								))}
							</Grid>
						)}

						<Box sx={{ textAlign: "center", mt: 3 }}>
							<Button
								variant="contained"
								component={Link}
								to="/bookings"
								sx={{
									borderRadius: 2,
									bgcolor: COLOR_PRIMARY,
									"&:hover": { bgcolor: `${COLOR_PRIMARY}d9` },
								}}
							>
								View All Bookings
							</Button>
						</Box>
					</Paper>
				</Grid>

				<Grid item xs={12} md={4}>
					<Paper
						elevation={2}
						sx={{
							p: 3,
							borderRadius: 2,
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
							<Typography
								variant="body1"
								sx={{
									textAlign: "center",
									py: 2,
									color: COLOR_TEXT_PRIMARY,
								}}
							>
								No critical issues at the moment.
							</Typography>
						) : (
							<Grid container spacing={2}>
								{dashboardData.criticalIssues.map((issue) => (
									<Grid item xs={12} key={issue.id}>
										<Card
											variant="outlined"
											sx={{
												borderRadius: 2,
												borderColor:
													issue.severity === "critical"
														? "#EF4444"
														: COLOR_TEXT_SECONDARY,
												backgroundColor: COLOR_SURFACE,
											}}
										>
											<CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
												<Box sx={{ display: "flex", alignItems: "center" }}>
													<WarningIcon color="error" sx={{ mr: 1 }} />
													<Box>
														<Typography
															variant="subtitle2"
															fontWeight="medium"
															sx={{ color: COLOR_TEXT_PRIMARY }}
														>
															{issue.vehicle}
														</Typography>
														<Typography
															variant="body2"
															color="error"
															sx={{ color: "#EF4444" }}
														>
															{issue.issue}
														</Typography>
													</Box>
												</Box>
											</CardContent>
										</Card>
									</Grid>
								))}
							</Grid>
						)}

						<Box sx={{ textAlign: "center", mt: 3 }}>
							<Button
								variant="outlined"
								color="error"
								component={Link}
								to="/diagnostics"
								sx={{ borderRadius: 2 }}
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
