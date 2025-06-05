import React, { useState, useEffect, useContext } from "react";
import {
	Box,
	Grid,
	Paper,
	Typography,
	Button,
	Divider,
	CircularProgress,
	Avatar,
	List,
	ListItem,
	ListItemAvatar,
	ListItemText,
} from "@mui/material";
import { Link } from "react-router-dom";
import DirectionsCarIcon from "@mui/icons-material/DirectionsCar";
import BuildIcon from "@mui/icons-material/Build";
import InventoryIcon from "@mui/icons-material/Inventory";
import EventIcon from "@mui/icons-material/Event";
import PeopleIcon from "@mui/icons-material/People";
import PersonIcon from "@mui/icons-material/Person";
import { COLOR_PRIMARY } from "../../constants";
import AuthContext from "../../context/AuthProvider";
import { workshopService } from "../../api/WorkshopAPIEndpoint";
import { staffService } from "../../api/StaffAPIEndpoint";
import { vehicleService } from "../../api/VehicleAPIEndpoint";
import { bookingService } from "../../api/BookingAPIEndpoint";
import { inventoryService } from "../../api/PartAPIEndpoint";

const OwnerDashboard: React.FC = () => {
	const { auth } = useContext(AuthContext);
	const [loading, setLoading] = useState(true);
	const [workshopData, setWorkshopData] = useState({
		name: "",
		location: "",
		mechanicCount: 0,
		customerCount: 0,
		vehicleCount: 0,
		todayBookings: 0,
		inventoryItems: 0,
		recentMechanics: [],
	});

	useEffect(() => {
		const fetchWorkshopData = async () => {
			try {
				setLoading(true);

				const workshop = await workshopService.getCurrentUserWorkshop();

				const mechanics = await staffService.getWorkshopStaff(workshop.id);

				const customers = await workshopService.getWorkshopCustomers(
					workshop.id
				);

				const vehicles = await vehicleService.getWorkshopVehicles(workshop.id);

				const allBookings = await bookingService.getWorkshopBookings(
					workshop.id
				);
				const today = new Date().toISOString().split("T")[0];
				const todayBookings = allBookings.filter(
					(booking) =>
						booking.appointment_date &&
						booking.appointment_date.startsWith(today)
				);

				const inventory = await inventoryService.getPartsByWorkshop(
					workshop.id
				);

				setWorkshopData({
					name: workshop.name,
					location: workshop.location,
					mechanicCount: mechanics.length,
					customerCount: customers.length,
					vehicleCount: vehicles.length,
					todayBookings: todayBookings.length,
					inventoryItems: inventory.length,
					recentMechanics: mechanics.slice(0, 3).map((mechanic) => ({
						id: mechanic.id,
						name:
							`${mechanic.first_name || ""} ${
								mechanic.last_name || ""
							}`.trim() ||
							mechanic.username ||
							"Unknown",
						avatar: null,
						status: mechanic.status || "Available",
					})),
				});
			} catch (error) {
				setWorkshopData({
					name: "Error",
					location: "Unable to load data",
					mechanicCount: 0,
					customerCount: 0,
					vehicleCount: 0,
					todayBookings: 0,
					inventoryItems: 0,
					recentMechanics: [],
				});
			} finally {
				setLoading(false);
			}
		};

		fetchWorkshopData();
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
			<Box sx={{ mb: 4 }}>
				<Typography variant="h4" gutterBottom fontWeight="bold">
					{workshopData.name}
				</Typography>
				<Typography variant="subtitle1" color="text.secondary">
					{workshopData.location}
				</Typography>
			</Box>

			<Grid container spacing={3} sx={{ mb: 4 }}>
				<Grid item xs={12} sm={6} md={2.4}>
					<Paper elevation={2} sx={{ p: 2, borderRadius: 2, height: "100%" }}>
						<Box
							sx={{ display: "flex", flexDirection: "column", height: "100%" }}
						>
							<PeopleIcon sx={{ color: COLOR_PRIMARY, fontSize: 40, mb: 1 }} />
							<Typography variant="h5" fontWeight="bold">
								{workshopData.mechanicCount}
							</Typography>
							<Typography variant="body2" color="text.secondary">
								Mechanics
							</Typography>
						</Box>
					</Paper>
				</Grid>

				<Grid item xs={12} sm={6} md={2.4}>
					<Paper elevation={2} sx={{ p: 2, borderRadius: 2, height: "100%" }}>
						<Box
							sx={{ display: "flex", flexDirection: "column", height: "100%" }}
						>
							<PeopleIcon sx={{ color: COLOR_PRIMARY, fontSize: 40, mb: 1 }} />
							<Typography variant="h5" fontWeight="bold">
								{workshopData.customerCount}
							</Typography>
							<Typography variant="body2" color="text.secondary">
								Customers
							</Typography>
						</Box>
					</Paper>
				</Grid>

				<Grid item xs={12} sm={6} md={2.4}>
					<Paper elevation={2} sx={{ p: 2, borderRadius: 2, height: "100%" }}>
						<Box
							sx={{ display: "flex", flexDirection: "column", height: "100%" }}
						>
							<DirectionsCarIcon
								sx={{ color: COLOR_PRIMARY, fontSize: 40, mb: 1 }}
							/>
							<Typography variant="h5" fontWeight="bold">
								{workshopData.vehicleCount}
							</Typography>
							<Typography variant="body2" color="text.secondary">
								Vehicles
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
								{workshopData.todayBookings}
							</Typography>
							<Typography variant="body2" color="text.secondary">
								Today's Bookings
							</Typography>
						</Box>
					</Paper>
				</Grid>

				<Grid item xs={12} sm={6} md={2.4}>
					<Paper elevation={2} sx={{ p: 2, borderRadius: 2, height: "100%" }}>
						<Box
							sx={{ display: "flex", flexDirection: "column", height: "100%" }}
						>
							<InventoryIcon
								sx={{ color: COLOR_PRIMARY, fontSize: 40, mb: 1 }}
							/>
							<Typography variant="h5" fontWeight="bold">
								{workshopData.inventoryItems}
							</Typography>
							<Typography variant="body2" color="text.secondary">
								Inventory Items
							</Typography>
						</Box>
					</Paper>
				</Grid>
			</Grid>

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
									to="/inventory"
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
									MANAGE INVENTORY
								</Button>

								<Button
									variant="outlined"
									fullWidth
									component={Link}
									to="/services"
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
									VIEW SERVICES
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
							Staff Overview
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
							<List sx={{ mb: 2 }}>
								{workshopData.recentMechanics.length === 0 ? (
									<Typography
										variant="body1"
										sx={{ textAlign: "center", py: 2 }}
									>
										No staff members found.
									</Typography>
								) : (
									workshopData.recentMechanics.map((mechanic) => (
										<ListItem key={mechanic.id} sx={{ px: 0 }}>
											<ListItemAvatar>
												<Avatar sx={{ bgcolor: COLOR_PRIMARY }}>
													<PersonIcon />
												</Avatar>
											</ListItemAvatar>
											<ListItemText
												primary={mechanic.name}
												secondary={mechanic.status}
											/>
										</ListItem>
									))
								)}
							</List>

							<Box sx={{ textAlign: "center", mt: "auto" }}>
								<Button
									variant="contained"
									fullWidth
									component={Link}
									to="/staff"
									sx={{
										borderRadius: 1,
										bgcolor: COLOR_PRIMARY,
										py: 1.5,
										textTransform: "uppercase",
										"&:hover": { bgcolor: "#d6303f" },
									}}
								>
									VIEW ALL MECHANICS
								</Button>
							</Box>
						</Box>
					</Paper>
				</Grid>
			</Grid>
		</Box>
	);
};

export default OwnerDashboard;
