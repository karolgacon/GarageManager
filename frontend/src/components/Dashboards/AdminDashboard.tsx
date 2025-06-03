import React, { useState, useEffect } from "react";
import {
	Box,
	Grid,
	Paper,
	Typography,
	Button,
	Divider,
	CircularProgress,
} from "@mui/material";
import { Link } from "react-router-dom";
import PeopleIcon from "@mui/icons-material/People";
import BuildIcon from "@mui/icons-material/Build";
import StoreIcon from "@mui/icons-material/Store";
import EventIcon from "@mui/icons-material/Event";
import WarningIcon from "@mui/icons-material/Warning";
import { COLOR_PRIMARY } from "../../constants";
import { UserService } from "../../api/UserAPIEndpoint";
import { workshopService } from "../../api/WorkshopAPIEndpoint";
import { bookingService } from "../../api/BookingAPIEndpoint";
import { serviceService } from "../../api/ServiceAPIEndpoint";
import { diagnosticsService } from "../../api/DiagnosticsAPIEndpoint";

const AdminDashboard: React.FC = () => {
	// State remains the same
	const [loading, setLoading] = useState(true);
	const [stats, setStats] = useState({
		totalUsers: 0,
		totalWorkshops: 0,
		totalBookings: 0,
		activeServices: 0,
		criticalIssues: 0,
	});

	// useEffect for fetching data remains the same
	useEffect(() => {
		const fetchStats = async () => {
			try {
				setLoading(true);

				// Using existing endpoints to gather statistics
				const usersPromise = UserService.getUsers();
				const workshopsPromise = workshopService.getAllWorkshops();
				const bookingsPromise = bookingService.getAllBookings();
				const servicesPromise = serviceService.getAllServices();
				const diagnosticsPromise = diagnosticsService.getCriticalDiagnostics();

				const [users, workshops, bookings, services, criticalDiagnostics] =
					await Promise.all([
						usersPromise,
						workshopsPromise,
						bookingsPromise,
						servicesPromise,
						diagnosticsPromise,
					]);

				setStats({
					totalUsers: users.length,
					totalWorkshops: workshops.length,
					totalBookings: bookings.length,
					activeServices: services.filter((service) => service.is_active)
						.length,
					criticalIssues: criticalDiagnostics.length,
				});
			} catch (error) {
				console.error("Error fetching dashboard stats:", error);
			} finally {
				setLoading(false);
			}
		};

		fetchStats();
	}, []);

	if (loading) {
		return (
			<Box sx={{ display: "flex", justifyContent: "center", p: 5 }}>
				<CircularProgress color="error" />
			</Box>
		);
	}

	return (
		<Box>
			<Typography variant="h4" gutterBottom fontWeight="bold">
				System Overview
			</Typography>

			{/* Stats Cards */}
			<Grid container spacing={3} sx={{ mb: 4 }}>
				<Grid item xs={12} sm={6} md={2.4}>
					<Paper elevation={2} sx={{ p: 2, borderRadius: 2, height: "100%" }}>
						<Box
							sx={{ display: "flex", flexDirection: "column", height: "100%" }}
						>
							<PeopleIcon sx={{ color: COLOR_PRIMARY, fontSize: 40, mb: 1 }} />
							<Typography variant="h5" fontWeight="bold">
								{stats.totalUsers}
							</Typography>
							<Typography variant="body2" color="text.secondary">
								Total Users
							</Typography>
						</Box>
					</Paper>
				</Grid>

				<Grid item xs={12} sm={6} md={2.4}>
					<Paper elevation={2} sx={{ p: 2, borderRadius: 2, height: "100%" }}>
						<Box
							sx={{ display: "flex", flexDirection: "column", height: "100%" }}
						>
							<StoreIcon sx={{ color: COLOR_PRIMARY, fontSize: 40, mb: 1 }} />
							<Typography variant="h5" fontWeight="bold">
								{stats.totalWorkshops}
							</Typography>
							<Typography variant="body2" color="text.secondary">
								Workshops
							</Typography>
						</Box>
					</Paper>
				</Grid>

				<Grid item xs={12} sm={6} md={2.4}>
					<Paper elevation={2} sx={{ p: 2, borderRadius: 2, height: "100%" }}>
						<Box
							sx={{ display: "flex", flexDirection: "column", height: "100%" }}
						>
							<EventIcon sx={{ color: COLOR_PRIMARY, fontSize: 40, mb: 1 }} />
							<Typography variant="h5" fontWeight="bold">
								{stats.totalBookings}
							</Typography>
							<Typography variant="body2" color="text.secondary">
								Total Bookings
							</Typography>
						</Box>
					</Paper>
				</Grid>

				<Grid item xs={12} sm={6} md={2.4}>
					<Paper elevation={2} sx={{ p: 2, borderRadius: 2, height: "100%" }}>
						<Box
							sx={{ display: "flex", flexDirection: "column", height: "100%" }}
						>
							<BuildIcon sx={{ color: COLOR_PRIMARY, fontSize: 40, mb: 1 }} />
							<Typography variant="h5" fontWeight="bold">
								{stats.activeServices}
							</Typography>
							<Typography variant="body2" color="text.secondary">
								Active Services
							</Typography>
						</Box>
					</Paper>
				</Grid>

				<Grid item xs={12} sm={6} md={2.4}>
					<Paper elevation={2} sx={{ p: 2, borderRadius: 2, height: "100%" }}>
						<Box
							sx={{ display: "flex", flexDirection: "column", height: "100%" }}
						>
							<WarningIcon sx={{ color: "#ff9800", fontSize: 40, mb: 1 }} />
							<Typography variant="h5" fontWeight="bold">
								{stats.criticalIssues}
							</Typography>
							<Typography variant="body2" color="text.secondary">
								Critical Issues
							</Typography>
						</Box>
					</Paper>
				</Grid>
			</Grid>

			{/* Quick Actions and System Health - matched height with display:flex and height:100% */}
			<Grid container spacing={3}>
				<Grid item xs={12} md={6} sx={{ display: "flex" }}>
					<Paper
						elevation={2}
						sx={{
							p: 3,
							borderRadius: 2,
							width: "100%",
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
								justifyContent: "space-between",
							}}
						>
							<Box>
								<Button
									variant="outlined"
									fullWidth
									component={Link}
									to="/customers"
									sx={{
										mb: 2,
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
									VIEW CUSTOMERS
								</Button>

								<Button
									variant="outlined"
									fullWidth
									component={Link}
									to="/services"
									sx={{
										mb: 2,
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
									MANAGE SERVICES
								</Button>

								<Button
									variant="outlined"
									fullWidth
									component={Link}
									to="/bookings"
									sx={{
										mb: 2,
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
									MANAGE BOOKINGS
								</Button>

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
									VIEW DIAGNOSTICS
								</Button>
							</Box>
						</Box>
					</Paper>
				</Grid>

				<Grid item xs={12} md={6} sx={{ display: "flex" }}>
					<Paper
						elevation={2}
						sx={{
							p: 3,
							borderRadius: 2,
							width: "100%",
							display: "flex",
							flexDirection: "column",
						}}
					>
						<Typography variant="h6" fontWeight="bold" gutterBottom>
							System Health
						</Typography>
						<Divider sx={{ my: 2 }} />

						<Box
							sx={{
								flex: 1,
								display: "flex",
								flexDirection: "column",
								py: 1,
								justifyContent: "space-between",
							}}
						>
							<Box>
								<Box
									sx={{
										display: "flex",
										justifyContent: "space-between",
										mb: 4,
									}}
								>
									<Typography variant="body1" sx={{ fontWeight: "500" }}>
										Database Status
									</Typography>
									<Typography
										variant="body1"
										sx={{ color: "success.main", fontWeight: "bold" }}
									>
										Online
									</Typography>
								</Box>
								<Box
									sx={{
										display: "flex",
										justifyContent: "space-between",
										mb: 4,
									}}
								>
									<Typography variant="body1" sx={{ fontWeight: "500" }}>
										API Services
									</Typography>
									<Typography
										variant="body1"
										sx={{ color: "success.main", fontWeight: "bold" }}
									>
										Operational
									</Typography>
								</Box>
								<Box
									sx={{
										display: "flex",
										justifyContent: "space-between",
										mb: 4,
									}}
								>
									<Typography variant="body1" sx={{ fontWeight: "500" }}>
										Notification Queue
									</Typography>
									<Typography
										variant="body1"
										sx={{ color: "success.main", fontWeight: "bold" }}
									>
										Running
									</Typography>
								</Box>
								<Box sx={{ display: "flex", justifyContent: "space-between" }}>
									<Typography variant="body1" sx={{ fontWeight: "500" }}>
										Last System Update
									</Typography>
									<Typography variant="body1" fontWeight="medium">
										2023-05-15
									</Typography>
								</Box>
							</Box>

							{/* Additional section to balance the layout */}
							<Box sx={{ mt: 4, pt: 2, borderTop: "1px solid #f0f0f0" }}>
								<Typography
									variant="body2"
									color="text.secondary"
									align="center"
								>
									System is running the latest version. All components are up to
									date.
								</Typography>
							</Box>
						</Box>
					</Paper>
				</Grid>
			</Grid>
		</Box>
	);
};

export default AdminDashboard;
