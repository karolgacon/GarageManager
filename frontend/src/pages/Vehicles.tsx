import React, { useState, useEffect, useContext } from "react";
import {
	Box,
	Container,
	Typography,
	Grid,
	Paper,
	Button,
	CircularProgress,
	Alert,
	Tabs,
	Tab,
	Divider,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import BuildIcon from "@mui/icons-material/Build";
import DirectionsCarIcon from "@mui/icons-material/DirectionsCar";
import Mainlayout from "../components/Mainlayout/Mainlayout";
import VehicleCard from "../components/Vehicle/VehicleCard";
import VehicleFilters from "../components/Vehicle/VehicleFilters";
import VehicleDetailDialog from "../components/Vehicle/VehicleDetailDialog";
import AddVehicleModal from "../components/Vehicle/AddVehicleModal";
import EditVehicleModal from "../components/Vehicle/EditVehicleModal";
import DeleteVehicleDialog from "../components/Vehicle/DeleteVehicleDialog";
import CustomSnackbar, {
	SnackbarState,
} from "../components/Mainlayout/Snackbar";
import AuthContext from "../context/AuthProvider";
import { Vehicle } from "../models/VehicleModel";
import { vehicleService } from "../api/VehicleAPIEndpoint";

const Vehicles: React.FC = () => {
	const [vehicles, setVehicles] = useState<Vehicle[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const { auth } = useContext(AuthContext);

	const [filteredVehicles, setFilteredVehicles] = useState<Vehicle[]>([]);
	const [activeTab, setActiveTab] = useState<string>("all");

	const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
	const [detailDialogOpen, setDetailDialogOpen] = useState(false);
	const [addModalOpen, setAddModalOpen] = useState(false);
	const [editModalOpen, setEditModalOpen] = useState(false);
	const [editVehicleId, setEditVehicleId] = useState<number | null>(null);
	const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
	const [deleteVehicleId, setDeleteVehicleId] = useState<number | null>(null);
	const [deleteLoading, setDeleteLoading] = useState(false);

	const [snackbar, setSnackbar] = useState<SnackbarState>({
		open: false,
		message: "",
		severity: "success",
	});

	useEffect(() => {
		fetchVehicles();
	}, [auth.roles]); 


	const fetchVehicles = async () => {
		try {
			setLoading(true);
			setError(null);

			let data: Vehicle[];
			const userRole = auth.roles?.[0];

			console.log("User role:", userRole); 
			console.log("Auth object:", auth); 

			if (userRole === "admin") {
				console.log("Fetching all vehicles for admin");
				data = await vehicleService.getAllVehicles();
			} else if (userRole === "client") {
				console.log("Fetching current user vehicles for client");
				data = await vehicleService.getCurrentUserVehicles();
			} else if (["owner", "mechanic"].includes(userRole || "")) {
				if (auth.workshopId) {
					console.log("Fetching workshop vehicles");
					data = await vehicleService.getWorkshopVehicles(auth.workshopId);
				} else {
					console.log("Fetching current user vehicles (fallback)");
					data = await vehicleService.getCurrentUserVehicles();
				}
			} else {
				data = [];
			}

			console.log("Fetched vehicles:", data); 
			setVehicles(data);
			setFilteredVehicles(data);
		} catch (err: any) {
			console.error("Error fetching vehicles:", err);
			setError("Failed to load vehicles. Please try again.");
		} finally {
			setLoading(false);
		}
	};

	const handleTabChange = (event: React.SyntheticEvent, newValue: string) => {
		setActiveTab(newValue);

		if (newValue === "all") {
			setFilteredVehicles(vehicles);
		} else if (newValue === "maintenance") {
			fetchMaintenanceVehicles();
		} else if (newValue === "active") {
			const activeVehicles = vehicles.filter(
				(vehicle) => vehicle.status === "active"
			);
			setFilteredVehicles(activeVehicles);
		}
	};

	const fetchMaintenanceVehicles = async () => {
		try {
			setLoading(true);
			const data = await vehicleService.getVehiclesDueForMaintenance();
			setFilteredVehicles(data);
		} catch (err) {
			console.error("Error fetching maintenance vehicles:", err);
			const dueForMaintenance = vehicles.filter(
				(vehicle) =>
					vehicle.next_service_due &&
					new Date(vehicle.next_service_due) <= new Date()
			);
			setFilteredVehicles(dueForMaintenance);
		} finally {
			setLoading(false);
		}
	};

	const handleFilterChange = (filters: any) => {
		const { searchTerm, brand, status, fuelType, maintenanceDue } = filters;

		if (brand && !searchTerm && !status && !fuelType && !maintenanceDue) {
			fetchVehiclesByBrand(brand);
			return;
		}

		const filtered = vehicles.filter((vehicle) => {
			const matchesSearch =
				searchTerm === "" ||
				vehicle.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
				vehicle.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
				vehicle.registration_number
					.toLowerCase()
					.includes(searchTerm.toLowerCase()) ||
				(vehicle.owner_name &&
					vehicle.owner_name.toLowerCase().includes(searchTerm.toLowerCase()));

			const matchesBrand =
				brand === "" || vehicle.brand.toLowerCase() === brand.toLowerCase();

			const matchesStatus = status === "" || vehicle.status === status;

			const matchesFuelType = fuelType === "" || vehicle.fuel_type === fuelType;

			const matchesMaintenance =
				!maintenanceDue ||
				(vehicle.next_service_due &&
					new Date(vehicle.next_service_due) <= new Date());

			return (
				matchesSearch &&
				matchesBrand &&
				matchesStatus &&
				matchesFuelType &&
				matchesMaintenance
			);
		});

		setFilteredVehicles(filtered);
	};

	const fetchVehiclesByBrand = async (brand: string) => {
		try {
			setLoading(true);
			const data = await vehicleService.getVehiclesByBrand(brand);
			setFilteredVehicles(data);
		} catch (err) {
			console.error(`Error fetching vehicles by brand ${brand}:`, err);
			const filteredByBrand = vehicles.filter(
				(vehicle) => vehicle.brand.toLowerCase() === brand.toLowerCase()
			);
			setFilteredVehicles(filteredByBrand);
		} finally {
			setLoading(false);
		}
	};

	const handleViewVehicle = async (id: number) => {
		try {
			const vehicle = await vehicleService.getVehicleById(id);
			setSelectedVehicle(vehicle);
			setDetailDialogOpen(true);
		} catch (err) {
			console.error("Error fetching vehicle details:", err);
			setSnackbar({
				open: true,
				message: "Failed to load vehicle details",
				severity: "error",
			});
		}
	};

	const handleEditVehicle = (id: number) => {
		console.log(`Trying to edit vehicle with ID: ${id}`);
		const vehicle = vehicles.find((v) => v.id === id);
		console.log("Vehicle data:", vehicle);

		if (!vehicle) {
			setSnackbar({
				open: true,
				message: "Cannot find vehicle to edit",
				severity: "error",
			});
			return;
		}

		setEditVehicleId(id);
		setEditModalOpen(true);
	};

	const handleDeleteVehicle = (id: number) => {
		const vehicle = vehicles.find((v) => v.id === id);
		setSelectedVehicle(vehicle || null);
		setDeleteVehicleId(id);
		setDeleteDialogOpen(true);
	};

	const confirmDeleteVehicle = async () => {
		if (!deleteVehicleId) return;

		try {
			setDeleteLoading(true);
			await vehicleService.deleteVehicle(deleteVehicleId);

			const updatedVehicles = vehicles.filter(
				(vehicle) => vehicle.id !== deleteVehicleId
			);
			setVehicles(updatedVehicles);
			setFilteredVehicles(
				filteredVehicles.filter((vehicle) => vehicle.id !== deleteVehicleId)
			);

			setSnackbar({
				open: true,
				message: "Vehicle deleted successfully",
				severity: "success",
			});

			setDeleteDialogOpen(false);
			setDeleteVehicleId(null);
		} catch (err) {
			console.error("Error deleting vehicle:", err);
			setSnackbar({
				open: true,
				message: "Failed to delete vehicle",
				severity: "error",
			});
		} finally {
			setDeleteLoading(false);
		}
	};

	const handleVehicleAdded = (vehicle: Vehicle) => {
		setVehicles([...vehicles, vehicle]);
		setFilteredVehicles([...filteredVehicles, vehicle]);

		setSnackbar({
			open: true,
			message: "Vehicle added successfully",
			severity: "success",
		});
	};

	const handleVehicleUpdated = (updatedVehicle: Vehicle) => {
		const updatedVehicles = vehicles.map((vehicle) =>
			vehicle.id === updatedVehicle.id ? updatedVehicle : vehicle
		);

		setVehicles(updatedVehicles);
		setFilteredVehicles(
			filteredVehicles.map((vehicle) =>
				vehicle.id === updatedVehicle.id ? updatedVehicle : vehicle
			)
		);

		setSnackbar({
			open: true,
			message: "Vehicle updated successfully",
			severity: "success",
		});
	};

	const handleSnackbarClose = () => {
		setSnackbar({ ...snackbar, open: false });
	};

	const getSectionTitle = () => {
		const userRole = auth.roles?.[0];

		switch (userRole) {
			case "client":
				return "My Vehicles";
			case "admin":
				return "All Vehicles";
			case "owner":
			case "mechanic":
				return "Workshop Vehicles";
			default:
				return "Vehicles";
		}
	};

	return (
		<Mainlayout>
			<Container
				maxWidth="xl"
				sx={{
					overflow: "hidden", 
				}}
			>
				<Box sx={{ py: 3 }}>
					<Box
						sx={{
							display: "flex",
							justifyContent: "space-between",
							alignItems: "center",
							mb: 3,
						}}
					>
						<Typography variant="h4" fontWeight="bold">
							{getSectionTitle()}
						</Typography>
						{auth.roles && auth.roles.length > 0 && (
							<Button
								variant="contained"
								startIcon={<AddIcon />}
								onClick={() => setAddModalOpen(true)}
								sx={{
									bgcolor: "#ff3c4e",
									"&:hover": { bgcolor: "#d6303f" },
								}}
							>
								Add Vehicle
							</Button>
						)}
					</Box>

					<Box sx={{ mb: 2 }}>
						<Tabs
							value={activeTab}
							onChange={handleTabChange}
							variant="scrollable"
							scrollButtons="auto"
							sx={{
								mb: 2,
								"& .MuiTab-root": {
									textTransform: "none",
									minWidth: "auto",
									px: 3,
								},
							}}
						>
							<Tab value="all" label="All Vehicles" />
							<Tab
								value="maintenance"
								label="Maintenance Due"
								icon={<BuildIcon fontSize="small" />}
								iconPosition="start"
							/>
							<Tab
								value="active"
								label="Active Vehicles"
								icon={<DirectionsCarIcon fontSize="small" />}
								iconPosition="start"
							/>
						</Tabs>
					</Box>

					<VehicleFilters onFilterChange={handleFilterChange} />

					{loading ? (
						<Box sx={{ textAlign: "center", py: 5 }}>
							<CircularProgress color="error" />
						</Box>
					) : error ? (
						<Alert
							severity="error"
							sx={{ mb: 2 }}
							action={
								<Button color="inherit" size="small" onClick={fetchVehicles}>
									Retry
								</Button>
							}
						>
							{error}
						</Alert>
					) : filteredVehicles.length === 0 ? (
						<Paper sx={{ p: 3, textAlign: "center", borderRadius: 2 }}>
							<Typography variant="body1" color="text.secondary">
								No vehicles found matching your criteria.
							</Typography>
						</Paper>
					) : (
						<Grid container spacing={3} sx={{ width: "100%", m: 0 }}>
							{filteredVehicles.map((vehicle) => (
								<Grid
									item
									key={vehicle.id}
									xs={12}
									sm={6}
									md={4}
									lg={3}
									sx={{ px: { xs: 1, md: 2 } }} 
								>
									<VehicleCard
										vehicle={vehicle}
										onView={handleViewVehicle}
										onEdit={handleEditVehicle}
										onDelete={handleDeleteVehicle}
										userRole={auth.roles?.[0] || ""}
									/>
								</Grid>
							))}
						</Grid>
					)}
				</Box>
			</Container>

			<VehicleDetailDialog
				open={detailDialogOpen}
				onClose={() => setDetailDialogOpen(false)}
				vehicle={selectedVehicle}
				userRole={auth.roles?.[0] || ""}
			/>
			<AddVehicleModal
				open={addModalOpen}
				onClose={() => setAddModalOpen(false)}
				onVehicleAdded={handleVehicleAdded}
				userRole={auth.roles?.[0]}
				currentWorkshopId={auth.workshopId}
			/>
			<EditVehicleModal
				open={editModalOpen}
				onClose={() => setEditModalOpen(false)}
				vehicleId={editVehicleId}
				onVehicleUpdated={handleVehicleUpdated}
				userRole={auth.roles?.[0]}
				currentWorkshopId={auth.workshopId}
			/>
			<DeleteVehicleDialog
				open={deleteDialogOpen}
				onClose={() => setDeleteDialogOpen(false)}
				vehicle={selectedVehicle}
				onConfirm={confirmDeleteVehicle}
				loading={deleteLoading}
			/>
			<CustomSnackbar snackbarState={snackbar} onClose={handleSnackbarClose} />
		</Mainlayout>
	);
};

export default Vehicles;
