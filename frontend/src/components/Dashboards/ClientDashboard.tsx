import React, { useState, useEffect, useContext } from "react";
import {
	Box,
	Grid,
	Paper,
	Typography,
	Button,
	Divider,
	CircularProgress,
	Card,
	CardContent,
	Chip,
	Avatar,
	List,
	ListItem,
	ListItemIcon,
	ListItemText,
} from "@mui/material";
import { Link } from "react-router-dom";
import DirectionsCarIcon from "@mui/icons-material/DirectionsCar";
import EventIcon from "@mui/icons-material/Event";
import BuildIcon from "@mui/icons-material/Build";
import WarningIcon from "@mui/icons-material/Warning";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import HistoryIcon from "@mui/icons-material/History";
import { COLOR_PRIMARY } from "../../constants";
import AuthContext from "../../context/AuthProvider";
import { vehicleService } from "../../api/VehicleAPIEndpoint";
import { bookingService } from "../../api/BookingAPIEndpoint";
import { serviceService } from "../../api/ServiceAPIEndpoint";
import { diagnosticsService } from "../../api/DiagnosticsAPIEndpoint";

const ClientDashboard: React.FC = () => {
	const { auth } = useContext(AuthContext);
	const [loading, setLoading] = useState(true);
	const [dashboardData, setDashboardData] = useState({
		vehicles: 0,
		upcomingBookings: 0,
		completedServices: 0,
		pendingIssues: 0,
		userVehicles: [],
		nextAppointment: null,
	});

	useEffect(() => {
		const fetchClientData = async () => {
			try {
				setLoading(true);
				const clientId = auth.user_id;

				if (!clientId) {
					console.error("Client ID not found");
					return;
				}

				// Get client vehicles
				const vehicles = await vehicleService.getClientVehicles(clientId);

				// Get upcoming bookings
				const upcomingBookings = await bookingService.getUpcomingBookings();

				// Get completed services for client's vehicles
				const vehicleIds = vehicles.map((v) => v.id);
				const services =
					vehicleIds.length > 0
						? await Promise.all(
								vehicleIds.map((id) => serviceService.getVehicleServices(id))
						  )
						: [];
				const completedServices = services
					.flat()
					.filter((service) => service.status === "completed");

				// Get pending issues for client's vehicles
				const diagnosticsPromises =
					vehicleIds.length > 0
						? vehicleIds.map((id) =>
								diagnosticsService.getVehicleDiagnostics(id)
						  )
						: [];
				const allDiagnostics = (await Promise.all(diagnosticsPromises)).flat();
				const pendingIssues = allDiagnostics.filter(
					(issue) => issue.status === "pending"
				);

				// Format vehicles data
				const formattedVehicles = vehicles.map((vehicle) => ({
					id: vehicle.id,
					brand: vehicle.make || vehicle.brand,
					model: vehicle.model,
					year: vehicle.year,
					registration: vehicle.registration_number,
					lastService: vehicle.last_service_date || "Never",
					status: vehicle.maintenance_status || "good",
				}));

				// Get next appointment (first upcoming booking)
				const nextAppointment =
					upcomingBookings.length > 0
						? {
								id: upcomingBookings[0].id,
								date: upcomingBookings[0].appointment_date,
								time: upcomingBookings[0].appointment_time,
								service: upcomingBookings[0].service_type || "Vehicle Service",
								workshop:
									upcomingBookings[0].workshop_name || "Unknown Workshop",
						  }
						: null;

				setDashboardData({
					vehicles: vehicles.length,
					upcomingBookings: upcomingBookings.length,
					completedServices: completedServices.length,
					pendingIssues: pendingIssues.length,
					userVehicles: formattedVehicles,
					nextAppointment,
				});
			} catch (error) {
				console.error("Error fetching client dashboard data:", error);
			} finally {
				setLoading(false);
			}
		};

		fetchClientData();
	}, [auth.user_id]);

	if (loading) {
		return (
			<Box sx={{ display: "flex", justifyContent: "center", p: 5 }}>
				<CircularProgress color="error" />
			</Box>
		);
	}

	return (
		<Box>
			{/* Stats Cards */}
			<Grid container spacing={3} sx={{ mb: 4 }}>
				<Grid item xs={12} sm={6} md={3}>
					<Paper elevation={2} sx={{ p: 2, borderRadius: 2, height: "100%" }}>
						<Box
							sx={{ display: "flex", flexDirection: "column", height: "100%" }}
						>
							<DirectionsCarIcon
								sx={{ color: COLOR_PRIMARY, fontSize: 40, mb: 1 }}
							/>
							<Typography variant="h5" fontWeight="bold">
								{dashboardData.vehicles}
							</Typography>
							<Typography variant="body2" color="text.secondary">
								Your Vehicles
							</Typography>
						</Box>
					</Paper>
				</Grid>

				<Grid item xs={12} sm={6} md={3}>
					<Paper elevation={2} sx={{ p: 2, borderRadius: 2, height: "100%" }}>
						<Box
							sx={{ display: "flex", flexDirection: "column", height: "100%" }}
						>
							<EventIcon sx={{ color: COLOR_PRIMARY, fontSize: 40, mb: 1 }} />
							<Typography variant="h5" fontWeight="bold">
								{dashboardData.upcomingBookings}
							</Typography>
							<Typography variant="body2" color="text.secondary">
								Upcoming Appointments
							</Typography>
						</Box>
					</Paper>
				</Grid>

				<Grid item xs={12} sm={6} md={3}>
					<Paper elevation={2} sx={{ p: 2, borderRadius: 2, height: "100%" }}>
						<Box
							sx={{ display: "flex", flexDirection: "column", height: "100%" }}
						>
							<BuildIcon sx={{ color: COLOR_PRIMARY, fontSize: 40, mb: 1 }} />
							<Typography variant="h5" fontWeight="bold">
								{dashboardData.completedServices}
							</Typography>
							<Typography variant="body2" color="text.secondary">
								Completed Services
							</Typography>
						</Box>
					</Paper>
				</Grid>

				<Grid item xs={12} sm={6} md={3}>
					<Paper elevation={2} sx={{ p: 2, borderRadius: 2, height: "100%" }}>
						<Box
							sx={{ display: "flex", flexDirection: "column", height: "100%" }}
						>
							<WarningIcon
								sx={{
									color:
										dashboardData.pendingIssues > 0
											? "warning.main"
											: COLOR_PRIMARY,
									fontSize: 40,
									mb: 1,
								}}
							/>
							<Typography variant="h5" fontWeight="bold">
								{dashboardData.pendingIssues}
							</Typography>
							<Typography variant="body2" color="text.secondary">
								Pending Issues
							</Typography>
						</Box>
					</Paper>
				</Grid>
			</Grid>

			{/* Main panels - Reorganized to single row */}
			<Grid container spacing={3}>
				{/* Your Vehicles Panel */}
				<Grid item xs={12} md={4}>
					<Paper
						elevation={2}
						sx={{
							p: 3,
							borderRadius: 2,
							height: "100%",
							display: "flex",
							flexDirection: "column",
						}}
					>
						<Box
							sx={{
								display: "flex",
								justifyContent: "space-between",
								alignItems: "center",
								mb: 1,
							}}
						>
							<Typography variant="h6" fontWeight="bold">
								Your Vehicles
							</Typography>
							<Button
								variant="text"
								size="small"
								component={Link}
								to="/vehicles"
								sx={{
									color: COLOR_PRIMARY,
									"&:hover": { bgcolor: "transparent" },
									p: 0,
									minWidth: 0,
								}}
							>
								+Add
							</Button>
						</Box>
						<Divider sx={{ my: 2 }} />

						<Box
							sx={{
								flex: 1,
								display: "flex",
								flexDirection: "column",
								justifyContent: "space-between",
							}}
						>
							{dashboardData.userVehicles.length === 0 ? (
								<Box
									sx={{
										textAlign: "center",
										py: 2,
										flex: 1,
										display: "flex",
										flexDirection: "column",
										justifyContent: "center",
									}}
								>
									<Typography variant="body1" gutterBottom>
										You haven't added any vehicles yet.
									</Typography>
									<Button
										variant="contained"
										startIcon={<AddCircleIcon />}
										component={Link}
										to="/vehicles"
										sx={{
											mt: 2,
											borderRadius: 2,
											bgcolor: COLOR_PRIMARY,
											alignSelf: "center",
											"&:hover": { bgcolor: "#d6303f" },
										}}
									>
										ADD VEHICLE
									</Button>
								</Box>
							) : (
								<List sx={{ p: 0, mb: 2, flex: 1 }}>
									{/* Show only the first 2 vehicles with simplified display */}
									{dashboardData.userVehicles.slice(0, 2).map((vehicle) => (
										<ListItem
											key={vehicle.id}
											sx={{
												p: 1,
												mb: 1,
												border: "1px solid #eee",
												borderRadius: 1,
												"&:last-child": { mb: 0 },
											}}
										>
											<ListItemIcon sx={{ minWidth: 40 }}>
												<Avatar
													sx={{
														bgcolor: COLOR_PRIMARY,
														width: 32,
														height: 32,
													}}
												>
													<DirectionsCarIcon sx={{ fontSize: 18 }} />
												</Avatar>
											</ListItemIcon>
											<ListItemText
												primary={`${vehicle.brand} ${vehicle.model}`}
												secondary={vehicle.registration}
												primaryTypographyProps={{
													variant: "body2",
													fontWeight: "medium",
												}}
												secondaryTypographyProps={{ variant: "caption" }}
											/>
											<Chip
												label={vehicle.status === "good" ? "Good" : "Check"}
												color={
													vehicle.status === "good" ? "success" : "warning"
												}
												size="small"
												sx={{ height: 24, fontSize: 11 }}
											/>
										</ListItem>
									))}
								</List>
							)}

							<Button
								variant="contained"
								component={Link}
								to="/vehicles"
								fullWidth
								sx={{
									borderRadius: 2,
									bgcolor: COLOR_PRIMARY,
									py: 1,
									mt: "auto",
									"&:hover": { bgcolor: "#d6303f" },
								}}
							>
								VIEW ALL VEHICLES
							</Button>
						</Box>
					</Paper>
				</Grid>

				{/* Next Appointment Panel */}
				<Grid item xs={12} md={4}>
					<Paper
						elevation={2}
						sx={{
							p: 3,
							borderRadius: 2,
							height: "100%",
							display: "flex",
							flexDirection: "column",
						}}
					>
						<Typography variant="h6" fontWeight="bold" gutterBottom>
							Next Appointment
						</Typography>
						<Divider sx={{ my: 2 }} />

						<Box
							sx={{
								flex: 1,
								display: "flex",
								flexDirection: "column",
								justifyContent: "space-between",
							}}
						>
							{!dashboardData.nextAppointment ? (
								<Box
									sx={{
										textAlign: "center",
										py: 2,
										flex: 1,
										display: "flex",
										flexDirection: "column",
										justifyContent: "center",
									}}
								>
									<Typography variant="body1" gutterBottom>
										No upcoming appointments.
									</Typography>
									<Button
										variant="contained"
										startIcon={<CalendarMonthIcon />}
										component={Link}
										to="/bookings"
										sx={{
											mt: 2,
											borderRadius: 2,
											bgcolor: COLOR_PRIMARY,
											alignSelf: "center",
											"&:hover": { bgcolor: "#d6303f" },
										}}
									>
										SCHEDULE SERVICE
									</Button>
								</Box>
							) : (
								<Box sx={{ flex: 1, mb: 2 }}>
									<Card
										variant="outlined"
										sx={{
											borderRadius: 2,
											borderColor: COLOR_PRIMARY,
											bgcolor: "#FFF5F5",
										}}
									>
										<CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
											<Box
												sx={{
													display: "flex",
													alignItems: "center",
													mb: 1,
												}}
											>
												<CalendarMonthIcon
													sx={{ color: COLOR_PRIMARY, mr: 1, fontSize: 20 }}
												/>
												<Typography variant="subtitle2" fontWeight="bold">
													{dashboardData.nextAppointment.date}
												</Typography>
												<Typography variant="body2" sx={{ ml: "auto" }}>
													{dashboardData.nextAppointment.time}
												</Typography>
											</Box>
											<Typography variant="body2">
												{dashboardData.nextAppointment.service}
											</Typography>
											<Typography variant="caption" color="text.secondary">
												at {dashboardData.nextAppointment.workshop}
											</Typography>
										</CardContent>
									</Card>
								</Box>
							)}

							<Button
								variant="contained"
								component={Link}
								to="/bookings"
								fullWidth
								sx={{
									borderRadius: 2,
									bgcolor: COLOR_PRIMARY,
									py: 1,
									mt: "auto",
									"&:hover": { bgcolor: "#d6303f" },
								}}
							>
								VIEW ALL BOOKINGS
							</Button>
						</Box>
					</Paper>
				</Grid>

				{/* Quick Actions Panel */}
				<Grid item xs={12} md={4}>
					<Paper
						elevation={2}
						sx={{
							p: 3,
							borderRadius: 2,
							height: "100%",
							display: "flex",
							flexDirection: "column",
						}}
					>
						<Typography variant="h6" fontWeight="bold" gutterBottom>
							Quick Actions
						</Typography>
						<Divider sx={{ my: 2 }} />

						<Box
							sx={{
								flex: 1,
								display: "flex",
								flexDirection: "column",
								justifyContent: "center",
							}}
						>
							<List disablePadding>
								<ListItem
									button
									component={Link}
									to="/bookings"
									disablePadding
									sx={{
										py: 1.5,
										borderBottom: "1px solid #eee",
									}}
								>
									<ListItemIcon sx={{ minWidth: 40 }}>
										<CalendarMonthIcon sx={{ color: COLOR_PRIMARY }} />
									</ListItemIcon>
									<ListItemText
										primary="BOOK SERVICE"
										sx={{ m: 0 }}
										primaryTypographyProps={{
											sx: { fontWeight: 500, color: "#444" },
										}}
									/>
								</ListItem>

								<ListItem
									button
									component={Link}
									to="/vehicles"
									disablePadding
									sx={{ py: 1.5 }}
								>
									<ListItemIcon sx={{ minWidth: 40 }}>
										<DirectionsCarIcon sx={{ color: COLOR_PRIMARY }} />
									</ListItemIcon>
									<ListItemText
										primary="REGISTER NEW VEHICLE"
										sx={{ m: 0 }}
										primaryTypographyProps={{
											sx: { fontWeight: 500, color: "#444" },
										}}
									/>
								</ListItem>

								<ListItem
									button
									component={Link}
									to="/services"
									disablePadding
									sx={{
										py: 1.5,
										borderTop: "1px solid #eee",
									}}
								>
									<ListItemIcon sx={{ minWidth: 40 }}>
										<BuildIcon sx={{ color: COLOR_PRIMARY }} />
									</ListItemIcon>
									<ListItemText
										primary="VIEW SERVICE HISTORY"
										sx={{ m: 0 }}
										primaryTypographyProps={{
											sx: { fontWeight: 500, color: "#444" },
										}}
									/>
								</ListItem>
							</List>
						</Box>
					</Paper>
				</Grid>
			</Grid>
		</Box>
	);
};

export default ClientDashboard;
