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
	FormControl,
	InputLabel,
	Select,
	MenuItem,
	Divider,
	List,
	ListItem,
	ListItemText,
	Card,
	CardContent,
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableRow,
} from "@mui/material";
import BuildIcon from "@mui/icons-material/Build";
import SettingsIcon from "@mui/icons-material/Settings";
import WarningIcon from "@mui/icons-material/Warning";
import KeyboardBackspaceIcon from "@mui/icons-material/KeyboardBackspace";
import Mainlayout from "../components/Mainlayout/Mainlayout";
import AuthContext from "../context/AuthProvider";
import { useCustomerData } from "../hooks/useCustomerData";
import CustomSnackbar, {
	SnackbarState,
} from "../components/Mainlayout/Snackbar";
import { diagnosticsService } from "../api/DiagnosticsAPIEndpoint";
import { workshopService } from "../api/WorkshopAPIEndpoint";
import { vehicleService } from "../api/VehicleAPIEndpoint";
import { DiagnosticIssue } from "../models/DiagnosticIssue";
import { Vehicle } from "../models/VehicleModel";
import { Workshop } from "../models/WorkshopModel";
import WorkshopSelector from "../components/Common/WorkshopSelector";

const Diagnostics: React.FC = () => {
	const { auth, isAdmin, isOwner, isMechanic, isClient } =
		useContext(AuthContext);
	const [selectedWorkshopId, setSelectedWorkshopId] = useState<number | null>(
		null
	);
	const [selectedCustomerId, setSelectedCustomerId] = useState<number | null>(
		null
	);
	const [selectedVehicleId, setSelectedVehicleId] = useState<number | null>(
		null
	);
	const [workshops, setWorkshops] = useState<Workshop[]>([]);
	const [vehicles, setVehicles] = useState<Vehicle[]>([]);
	const [diagnosticIssues, setDiagnosticIssues] = useState<DiagnosticIssue[]>(
		[]
	);
	const [loading, setLoading] = useState<boolean>(false);
	const [error, setError] = useState<string | null>(null);
	const [snackbar, setSnackbar] = useState<SnackbarState>({
		open: false,
		message: "",
		severity: "success",
	});
	const [selectedClient, setSelectedClient] = useState<any>(null);
	const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
	const [debugInfo, setDebugInfo] = useState<string>("");

	// Use custom hook for customer data
	const {
		customers,
		filteredCustomers,
		loading: customersLoading,
		error: customersError,
	} = useCustomerData(auth, selectedWorkshopId);

	// Fetch workshops for admin users
	useEffect(() => {
		const fetchWorkshops = async () => {
			if (isAdmin()) {
				try {
					setLoading(true);
					const data = await workshopService.getAllWorkshops();
					setWorkshops(data);
				} catch (err) {
					console.error("Error fetching workshops:", err);
					setError("Failed to load workshops. Please try again.");
				} finally {
					setLoading(false);
				}
			}
		};

		fetchWorkshops();
	}, [isAdmin]);

	// Fetch vehicles based on selected customer or current user (if client)
	useEffect(() => {
		const fetchVehicles = async () => {
			try {
				setLoading(true);
				setVehicles([]); // Wyczyść poprzednie pojazdy
				let vehiclesData: Vehicle[] = [];

				if (isClient()) {
					// Klient widzi tylko swoje pojazdy
					vehiclesData = await vehicleService.getClientVehicles(auth.user_id);
					// Set client's own ID as selected customer ID for consistency
					setSelectedCustomerId(auth.user_id);
				} else if (selectedCustomerId) {
					// Admin/Właściciel/Mechanik z wybranym klientem
					vehiclesData = await vehicleService.getClientVehicles(
						selectedCustomerId
					);
					const client = filteredCustomers.find(
						(c) => c.id === selectedCustomerId
					);
					setSelectedClient(client);
				} else if (isOwner() || isMechanic()) {
					// Pokaż wszystkie pojazdy w warsztacie dla właściciela/mechanika
					if (auth.workshop_id) {
						vehiclesData = await vehicleService.getWorkshopVehicles(
							auth.workshop_id
						);
					}
				}

				// Filtruj pojazdy, aby upewnić się, że są przypisane do wybranego warsztatu
				if (selectedWorkshopId) {
					vehiclesData = vehiclesData.filter(
						(vehicle) => vehicle.workshop_id === selectedWorkshopId
					);
				}

				console.log("Filtered vehicles:", vehiclesData);
				setVehicles(vehiclesData);

				// Automatycznie wybierz pierwszy pojazd, jeśli istnieje tylko jeden
				if (vehiclesData.length === 1) {
					setSelectedVehicleId(vehiclesData[0].id);
					setSelectedVehicle(vehiclesData[0]);
				} else {
					// Zresetuj wybrany pojazd, jeśli brak pojazdów lub jest ich wiele
					setSelectedVehicleId(null);
					setSelectedVehicle(null);
				}
			} catch (err) {
				console.error("Error fetching vehicles:", err);
				setError("Failed to load vehicles. Please try again.");
			} finally {
				setLoading(false);
			}
		};

		fetchVehicles();
	}, [
		isClient,
		isOwner,
		isMechanic,
		selectedCustomerId,
		auth.user_id,
		auth.workshop_id,
		selectedWorkshopId, // Dodano zależność od wybranego warsztatu
		filteredCustomers,
	]);

	// Fetch diagnostic issues when a vehicle is selected
	useEffect(() => {
		const fetchDiagnosticIssues = async () => {
			if (selectedVehicleId) {
				try {
					setLoading(true);
					setDiagnosticIssues([]); // Clear previous diagnostics
					const data = await diagnosticsService.getVehicleDiagnostics(
						selectedVehicleId
					);
					console.log("Fetched diagnostics:", data);
					setDiagnosticIssues(data);
					setDebugInfo(JSON.stringify(data, null, 2));

					// Find the selected vehicle details
					const vehicle =
						vehicles.find((v) => v.id === selectedVehicleId) || null;
					setSelectedVehicle(vehicle);
				} catch (err) {
					console.error("Error fetching diagnostics:", err);
					setError(`Failed to load diagnostic issues: ${err.message}`);
				} finally {
					setLoading(false);
				}
			} else {
				setDiagnosticIssues([]);
			}
		};

		fetchDiagnosticIssues();
	}, [selectedVehicleId, vehicles]);

	const handleWorkshopChange = (
		event: React.ChangeEvent<{ value: unknown }>
	) => {
		setSelectedWorkshopId(event.target.value as number);
		setSelectedCustomerId(null);
		setSelectedVehicleId(null);
		setSelectedClient(null);
		setSelectedVehicle(null);
	};

	const handleCustomerChange = (
		event: React.ChangeEvent<{ value: unknown }>
	) => {
		setSelectedCustomerId(event.target.value as number);
		setSelectedVehicleId(null);
		setSelectedVehicle(null);
	};

	const handleVehicleChange = (
		event: React.ChangeEvent<{ value: unknown }>
	) => {
		setSelectedVehicleId(event.target.value as number);
	};

	const handleBackToWorkshops = () => {
		setSelectedWorkshopId(null);
		setSelectedCustomerId(null);
		setSelectedVehicleId(null);
		setSelectedClient(null);
		setSelectedVehicle(null);
	};

	const handleSnackbarClose = () => {
		setSnackbar({ ...snackbar, open: false });
	};

	const getSeverityColor = (severity: string) => {
		switch (severity?.toLowerCase()) {
			case "critical":
				return "#FF3E55";
			case "high":
				return "#FF9800";
			case "medium":
				return "#FFC107";
			case "low":
				return "#2196F3";
			default:
				return "#2196F3";
		}
	};

	// Group diagnostic issues by category
	const criticalIssues = diagnosticIssues.filter(
		(issue) => issue.severity?.toLowerCase() === "critical"
	);

	const otherIssues = diagnosticIssues.filter(
		(issue) => issue.severity?.toLowerCase() !== "critical"
	);

	const renderCustomerList = () => {
		return (
			<Paper sx={{ p: 3, borderRadius: 2, mb: 3 }}>
				{isAdmin() && selectedWorkshopId && (
					<Box
						sx={{
							display: "flex",
							justifyContent: "space-between",
							alignItems: "center",
							mb: 2,
						}}
					>
						<Typography variant="h6" fontWeight="bold">
							Select Customer
						</Typography>
						<Button
							variant="outlined"
							color="primary"
							startIcon={<KeyboardBackspaceIcon />}
							onClick={handleBackToWorkshops}
							size="small"
						>
							Back to Workshops
						</Button>
					</Box>
				)}

				{!isAdmin() && (
					<Typography variant="h6" sx={{ mb: 2, fontWeight: "bold" }}>
						Select Customer
					</Typography>
				)}

				{customersLoading ? (
					<Box sx={{ display: "flex", justifyContent: "center", my: 2 }}>
						<CircularProgress color="error" />
					</Box>
				) : (
					<>
						{filteredCustomers.length === 0 ? (
							<Alert severity="info">No customers found.</Alert>
						) : (
							<Grid container spacing={2}>
								{filteredCustomers.map((customer) => (
									<Grid
										item
										xs={12}
										key={customer.id || `customer-${Math.random()}`}
									>
										<Card
											sx={{
												cursor: "pointer",
												border:
													selectedCustomerId === customer.id
														? "2px solid #FF3E55"
														: "1px solid #e0e0e0",
												"&:hover": { borderColor: "#FF3E55" },
											}}
											onClick={() => {
												setSelectedCustomerId(customer.id);
												setSelectedClient(customer);
												console.log("Selected customer:", customer);
											}}
										>
											<CardContent>
												<Typography variant="subtitle1" fontWeight="bold">
													{customer.first_name || ""} {customer.last_name || ""}
													{!customer.first_name &&
														!customer.last_name &&
														"Customer Name Missing"}
												</Typography>
												<Typography variant="body2" color="text.secondary">
													Phone: {customer.phone || "N/A"}
												</Typography>
												<Typography variant="body2" color="text.secondary">
													Email: {customer.email || "N/A"}
												</Typography>
											</CardContent>
										</Card>
									</Grid>
								))}
							</Grid>
						)}
					</>
				)}
			</Paper>
		);
	};

	const renderCustomerDetails = () => {
		if (!selectedClient) return null;

		return (
			<Paper sx={{ p: 3, borderRadius: 2, mb: 3 }}>
				<Box
					sx={{
						display: "flex",
						justifyContent: "space-between",
						alignItems: "center",
						mb: 2,
					}}
				>
					<Typography variant="h6" fontWeight="bold">
						{selectedClient.first_name} {selectedClient.last_name}
					</Typography>

					{isAdmin() && selectedWorkshopId ? (
						<Box>
							<Button
								variant="outlined"
								color="primary"
								size="small"
								startIcon={<KeyboardBackspaceIcon />}
								onClick={handleBackToWorkshops}
								sx={{ mr: 1 }}
							>
								Back to Workshops
							</Button>
							<Button
								variant="contained"
								color="error"
								size="small"
								onClick={() => setSelectedCustomerId(null)}
								sx={{
									bgcolor: "#FF3E55",
									"&:hover": { bgcolor: "#E02A45" },
								}}
							>
								Change Customer
							</Button>
						</Box>
					) : (
						<Button
							variant="contained"
							color="error"
							size="small"
							onClick={() => setSelectedCustomerId(null)}
							sx={{
								bgcolor: "#FF3E55",
								"&:hover": { bgcolor: "#E02A45" },
							}}
						>
							Change Customer
						</Button>
					)}
				</Box>

				<List dense>
					<ListItem>
						<ListItemText
							primary="Phone"
							secondary={selectedClient.phone || "N/A"}
						/>
					</ListItem>
					<Divider />
					<ListItem>
						<ListItemText
							primary="Email"
							secondary={selectedClient.email || "N/A"}
						/>
					</ListItem>
					<Divider />
					<ListItem>
						<ListItemText
							primary="Address"
							secondary={selectedClient.address || "N/A"}
						/>
					</ListItem>
				</List>

				<Box sx={{ mt: 3 }}>
					<Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 2 }}>
						Select Vehicle:
					</Typography>
					{vehicles.length === 0 ? (
						<Alert severity="info">No vehicles found for this customer.</Alert>
					) : (
						<FormControl fullWidth>
							<InputLabel id="vehicle-select-label">Vehicle</InputLabel>
							<Select
								labelId="vehicle-select-label"
								id="vehicle-select"
								value={selectedVehicleId || ""}
								label="Vehicle"
								onChange={handleVehicleChange}
								disabled={loading}
							>
								<MenuItem value="">
									<em>Select a vehicle</em>
								</MenuItem>
								{vehicles.map((vehicle) => (
									<MenuItem key={vehicle.id} value={vehicle.id}>
										{vehicle.brand} {vehicle.model} (
										{vehicle.registration_number})
									</MenuItem>
								))}
							</Select>
						</FormControl>
					)}
				</Box>
			</Paper>
		);
	};

	const renderClientVehicleSelection = () => {
		return (
			<Paper sx={{ p: 3, borderRadius: 2, mb: 3 }}>
				<Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 2 }}>
					Select Your Vehicle:
				</Typography>
				{vehicles.length === 0 ? (
					<Alert severity="info">You don't have any registered vehicles.</Alert>
				) : (
					<FormControl fullWidth>
						<InputLabel id="client-vehicle-select-label">
							Your Vehicle
						</InputLabel>
						<Select
							labelId="client-vehicle-select-label"
							id="client-vehicle-select"
							value={selectedVehicleId || ""}
							label="Vehicle"
							onChange={handleVehicleChange}
							disabled={loading}
						>
							<MenuItem value="">
								<em>Select a vehicle</em>
							</MenuItem>
							{vehicles.map((vehicle) => (
								<MenuItem key={vehicle.id} value={vehicle.id}>
									{vehicle.brand} {vehicle.model} ({vehicle.registration_number}
									)
								</MenuItem>
							))}
						</Select>
					</FormControl>
				)}
			</Paper>
		);
	};

	const renderDiagnosticReport = () => {
		if (!selectedVehicle) return null;

		return (
			<Paper sx={{ p: 3, borderRadius: 2 }}>
				<Box
					sx={{
						display: "flex",
						justifyContent: "space-between",
						alignItems: "center",
						mb: 3,
					}}
				>
					<Box sx={{ display: "flex", alignItems: "center" }}>
						<BuildIcon sx={{ mr: 1, color: "#FF3E55" }} />
						<Typography variant="h6" fontWeight="bold">
							Diagnostic Report - {selectedVehicle.brand}{" "}
							{selectedVehicle.model}
						</Typography>
					</Box>
					<Typography variant="subtitle2" color="text.secondary">
						{selectedVehicle.registration_number}
					</Typography>
				</Box>

				{loading ? (
					<Box sx={{ display: "flex", justifyContent: "center", my: 3 }}>
						<CircularProgress color="error" />
					</Box>
				) : (
					<>
						{diagnosticIssues.length === 0 ? (
							<Alert severity="info">
								No diagnostic issues found for this vehicle.
							</Alert>
						) : (
							<>
								{/* Tabela ze wszystkimi problemami */}
								<TableContainer>
									<Table size="small">
										<TableHead>
											<TableRow>
												<TableCell>ID</TableCell>
												<TableCell>Date</TableCell>
												<TableCell>Description</TableCell>
												<TableCell align="right">Repair Cost</TableCell>
												<TableCell>Severity</TableCell>
											</TableRow>
										</TableHead>
										<TableBody>
											{diagnosticIssues.map((issue) => (
												<TableRow key={issue.id}>
													<TableCell>{issue.id}</TableCell>
													<TableCell>
														{new Date(
															issue.diagnostic_date
														).toLocaleDateString()}
													</TableCell>
													<TableCell>{issue.diagnostic_notes}</TableCell>
													<TableCell align="right">
														{issue.estimated_repair_cost
															? Number(issue.estimated_repair_cost).toFixed(2)
															: "N/A"}
													</TableCell>
													<TableCell>
														<Box
															sx={{
																display: "inline-block",
																bgcolor: getSeverityColor(issue.severity_level),
																color: "white",
																px: 1,
																py: 0.5,
																borderRadius: 1,
																fontSize: "0.75rem",
															}}
														>
															{issue.severity_level}
														</Box>
													</TableCell>
												</TableRow>
											))}
										</TableBody>
									</Table>
								</TableContainer>

								{/* Sekcja krytycznych problemów - tylko jeśli istnieją */}
								{criticalIssues.length > 0 && (
									<Box sx={{ mt: 4 }}>
										<Box
											sx={{
												display: "flex",
												alignItems: "center",
												bgcolor: "#FFEAEE",
												p: 1.5,
												borderRadius: 1,
												mb: 2,
											}}
										>
											<WarningIcon sx={{ mr: 1, color: "#FF3E55" }} />
											<Typography
												variant="subtitle1"
												fontWeight="bold"
												color="#FF3E55"
											>
												Critical Issues
											</Typography>
										</Box>
										{criticalIssues.map((issue) => (
											<Paper
												key={issue.id}
												elevation={0}
												sx={{
													p: 2,
													mb: 2,
													border: "1px solid #FFD1D9",
													borderLeft: "4px solid #FF3E55",
													borderRadius: 1,
												}}
											>
												<Typography variant="body1" fontWeight="bold">
													{issue.diagnostic_notes}
												</Typography>
												<Typography
													variant="body2"
													color="text.secondary"
													sx={{ mt: 1 }}
												>
													Estimated repair cost: $
													{issue.estimated_repair_cost
														? Number(issue.estimated_repair_cost).toFixed(2)
														: "0.00"}
												</Typography>
											</Paper>
										))}
									</Box>
								)}
							</>
						)}
					</>
				)}
			</Paper>
		);
	};

	const renderWorkshopSelection = () => {
		return (
			<WorkshopSelector
				value={selectedWorkshopId}
				onChange={(workshopId) => {
					setSelectedWorkshopId(workshopId);
					// Reset dependent selections
					setSelectedCustomerId(null);
					setSelectedVehicleId(null);
				}}
				disabled={loading}
			/>
		);
	};

	const renderMainContent = () => {
		if (loading && !selectedCustomerId && !selectedVehicleId) {
			return (
				<Box sx={{ display: "flex", justifyContent: "center", my: 4 }}>
					<CircularProgress color="error" />
				</Box>
			);
		}

		if (isAdmin() && !selectedWorkshopId) {
			return renderWorkshopSelection();
		}

		if (!selectedCustomerId && !isClient()) {
			return renderCustomerList();
		}

		return (
			<>
				{/* Show customer details for non-clients OR vehicle selection for clients */}
				{!isClient() ? renderCustomerDetails() : renderClientVehicleSelection()}
				{selectedVehicleId && renderDiagnosticReport()}
			</>
		);
	};

	return (
		<Mainlayout>
			<Container maxWidth="lg">
				<Box sx={{ py: 3 }}>
					<Typography variant="h4" fontWeight="bold" sx={{ mb: 3 }}>
						Vehicle Diagnostics
					</Typography>

					{error && !loading && (
						<Alert
							severity="error"
							sx={{ mb: 3 }}
							action={
								<Button
									color="inherit"
									size="small"
									onClick={() => setError(null)}
								>
									Dismiss
								</Button>
							}
						>
							{error}
						</Alert>
					)}

					{renderMainContent()}
				</Box>

				<CustomSnackbar
					snackbarState={snackbar}
					onClose={handleSnackbarClose}
				/>
			</Container>
		</Mainlayout>
	);
};

export default Diagnostics;
