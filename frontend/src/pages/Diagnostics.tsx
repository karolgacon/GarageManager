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
	SelectChangeEvent,
	Dialog,
	DialogTitle,
	DialogContent,
	DialogActions,
	TextField,
	IconButton,
	FormControlLabel,
	Checkbox,
} from "@mui/material";
import BuildIcon from "@mui/icons-material/Build";
import WarningIcon from "@mui/icons-material/Warning";
import KeyboardBackspaceIcon from "@mui/icons-material/KeyboardBackspace";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import Mainlayout from "../components/Mainlayout/Mainlayout";
import AuthContext from "../context/AuthProvider";
import { useCustomerData } from "../hooks/useCustomerData";
import CustomSnackbar, {
	SnackbarState,
} from "../components/Mainlayout/Snackbar";
import {
	COLOR_PRIMARY,
	COLOR_BACKGROUND,
	COLOR_SURFACE,
	COLOR_TEXT_PRIMARY,
	COLOR_TEXT_SECONDARY,
	COLOR_WARNING,
	COLOR_ERROR,
} from "../constants";
import { workshopService } from "../api/WorkshopAPIEndpoint";
import { vehicleService } from "../api/VehicleAPIEndpoint";
import { diagnosticsService } from "../api/DiagnosticsAPIEndpoint";
import { DiagnosticIssue } from "../models/DiagnosticIssue";
import { Vehicle } from "../models/VehicleModel";
import WorkshopSelector from "../components/common/WorkshopSelector";

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

	// Dialog states for CRUD operations
	const [dialogOpen, setDialogOpen] = useState<boolean>(false);
	const [dialogMode, setDialogMode] = useState<"add" | "edit">("add");
	const [editingDiagnostic, setEditingDiagnostic] =
		useState<DiagnosticIssue | null>(null);
	const [diagnosticForm, setDiagnosticForm] = useState({
		diagnostic_notes: "",
		estimated_repair_cost: "",
		severity_level: "low",
		next_inspection_date: "",
		email_notification: true,
		sms_notification: false,
	});

	const { filteredCustomers, loading: customersLoading } = useCustomerData(
		auth,
		selectedWorkshopId
	);

	useEffect(() => {
		const fetchWorkshops = async () => {
			if (isAdmin()) {
				try {
					setLoading(true);
					await workshopService.getAllWorkshops();
					// Workshops są używane przez WorkshopSelector
				} catch (err) {
					setError("Failed to load workshops. Please try again.");
				} finally {
					setLoading(false);
				}
			}
		};

		fetchWorkshops();
	}, [isAdmin]);

	useEffect(() => {
		const fetchVehicles = async () => {
			try {
				setLoading(true);
				setVehicles([]);
				let vehiclesData: Vehicle[] = [];

				if (isClient() && auth.user_id) {
					vehiclesData = await vehicleService.getClientVehicles(auth.user_id);
					setSelectedCustomerId(auth.user_id);
				} else if (selectedCustomerId) {
					// For admin/root and other roles when a customer is selected
					vehiclesData = await vehicleService.getClientVehicles(
						selectedCustomerId
					);
					const client = filteredCustomers.find(
						(c) => c.id === selectedCustomerId
					);
					setSelectedClient(client);
				} else if (isOwner() || isMechanic()) {
					if ((auth as any).workshop_id) {
						vehiclesData = await vehicleService.getWorkshopVehicles(
							(auth as any).workshop_id
						);
					}
				} else if (isAdmin() && !selectedCustomerId) {
					// For admin without specific customer selected, don't load vehicles
					vehiclesData = [];
				}

				if (selectedWorkshopId) {
					vehiclesData = vehiclesData.filter(
						(vehicle) => vehicle.workshop_id === selectedWorkshopId
					);
				}

				setVehicles(vehiclesData);

				if (vehiclesData.length === 1) {
					setSelectedVehicleId(vehiclesData[0].id);
					setSelectedVehicle(vehiclesData[0]);
				} else {
					setSelectedVehicleId(null);
					setSelectedVehicle(null);
				}
			} catch (err) {
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
		isAdmin,
		selectedCustomerId,
		auth.user_id,
		(auth as any).workshop_id,
		selectedWorkshopId,
		filteredCustomers,
	]);

	useEffect(() => {
		if (selectedVehicleId) {
			fetchDiagnostics(selectedVehicleId);
		} else {
			setDiagnosticIssues([]);
			setSelectedVehicle(null);
		}
	}, [selectedVehicleId, vehicles]);

	const handleVehicleChange = (event: SelectChangeEvent<number>) => {
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
				return COLOR_ERROR;
			case "high":
				return COLOR_WARNING;
			case "medium":
				return "#FFC107";
			case "low":
				return COLOR_PRIMARY;
			default:
				return COLOR_PRIMARY;
		}
	};

	const criticalIssues = diagnosticIssues.filter(
		(issue) => issue.severity_level?.toLowerCase() === "critical"
	);

	// CRUD handlers
	const fetchDiagnostics = async (vehicleId: number) => {
		try {
			setLoading(true);
			setDiagnosticIssues([]);
			const data = await diagnosticsService.getVehicleDiagnostics(vehicleId);
			setDiagnosticIssues(data);

			const vehicle = vehicles.find((v) => v.id === vehicleId) || null;
			setSelectedVehicle(vehicle);
		} catch (err: any) {
			setError(`Failed to load diagnostic issues: ${err.message}`);
		} finally {
			setLoading(false);
		}
	};

	const handleAddDiagnostic = () => {
		setDialogMode("add");
		setEditingDiagnostic(null);
		// Calculate default next inspection date (1 year from today)
		const nextYear = new Date();
		nextYear.setFullYear(nextYear.getFullYear() + 1);
		const nextInspectionDate = nextYear.toISOString().split("T")[0];

		setDiagnosticForm({
			diagnostic_notes: "",
			estimated_repair_cost: "",
			severity_level: "low",
			next_inspection_date: nextInspectionDate,
			email_notification: true,
			sms_notification: false,
		});
		setDialogOpen(true);
	};

	const handleEditDiagnostic = (diagnostic: DiagnosticIssue) => {
		setDialogMode("edit");
		setEditingDiagnostic(diagnostic);
		setDiagnosticForm({
			diagnostic_notes: diagnostic.diagnostic_notes || "",
			estimated_repair_cost: diagnostic.estimated_repair_cost?.toString() || "",
			severity_level: diagnostic.severity_level || "low",
			next_inspection_date: diagnostic.next_inspection_date || "",
			email_notification: diagnostic.email_notification || false,
			sms_notification: diagnostic.sms_notification || false,
		});
		setDialogOpen(true);
	};

	const handleDeleteDiagnostic = async (diagnosticId: number) => {
		if (!window.confirm("Are you sure you want to delete this diagnostic?")) {
			return;
		}

		try {
			await diagnosticsService.deleteDiagnostic(diagnosticId);
			setSnackbar({
				open: true,
				message: "Diagnostic deleted successfully",
				severity: "success",
			});
			// Refresh data
			if (selectedVehicleId) {
				fetchDiagnostics(selectedVehicleId);
			}
		} catch (error) {
			setSnackbar({
				open: true,
				message: "Failed to delete diagnostic",
				severity: "error",
			});
		}
	};

	const handleSaveDiagnostic = async () => {
		if (!selectedVehicleId) return;

		try {
			const diagnosticData = {
				vehicle: selectedVehicleId,
				diagnostic_notes: diagnosticForm.diagnostic_notes,
				estimated_repair_cost:
					parseFloat(diagnosticForm.estimated_repair_cost) || 0,
				severity_level: diagnosticForm.severity_level as
					| "low"
					| "medium"
					| "high"
					| "critical",
				next_inspection_date: diagnosticForm.next_inspection_date || null,
				email_notification: diagnosticForm.email_notification,
				sms_notification: diagnosticForm.sms_notification,
			};

			if (dialogMode === "add") {
				await diagnosticsService.createDiagnostic(diagnosticData);
				setSnackbar({
					open: true,
					message: "Diagnostic added successfully",
					severity: "success",
				});
			} else {
				if (editingDiagnostic?.id) {
					await diagnosticsService.updateDiagnostic(
						editingDiagnostic.id,
						diagnosticData
					);
					setSnackbar({
						open: true,
						message: "Diagnostic updated successfully",
						severity: "success",
					});
				}
			}

			setDialogOpen(false);
			// Refresh data
			if (selectedVehicleId) {
				fetchDiagnostics(selectedVehicleId);
			}
		} catch (error) {
			setSnackbar({
				open: true,
				message: "Failed to save diagnostic",
				severity: "error",
			});
		}
	};

	const handleCloseDialog = () => {
		setDialogOpen(false);
		setEditingDiagnostic(null);
		setDiagnosticForm({
			diagnostic_notes: "",
			estimated_repair_cost: "",
			severity_level: "low",
			next_inspection_date: "",
			email_notification: true,
			sms_notification: false,
		});
	};

	const renderCustomerList = () => {
		return (
			<Paper
				sx={{
					p: 3,
					borderRadius: 2,
					mb: 3,
					backgroundColor: COLOR_SURFACE,
					color: COLOR_TEXT_PRIMARY,
				}}
			>
				{isAdmin() && selectedWorkshopId && (
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
							Select Customer
						</Typography>
						<Button
							variant="outlined"
							color="primary"
							startIcon={<KeyboardBackspaceIcon />}
							onClick={handleBackToWorkshops}
							size="small"
							sx={{
								borderColor: COLOR_PRIMARY,
								color: COLOR_PRIMARY,
								"&:hover": {
									borderColor: COLOR_PRIMARY,
									backgroundColor: `${COLOR_PRIMARY}20`,
								},
							}}
						>
							Back to Workshops
						</Button>
					</Box>
				)}

				{!isAdmin() && (
					<Typography
						variant="h6"
						sx={{
							mb: 2,
							fontWeight: "bold",
							color: COLOR_TEXT_PRIMARY,
						}}
					>
						Select Customer
					</Typography>
				)}

				{customersLoading ? (
					<Box sx={{ display: "flex", justifyContent: "center", my: 2 }}>
						<CircularProgress sx={{ color: COLOR_PRIMARY }} />
					</Box>
				) : (
					<>
						{filteredCustomers.length === 0 ? (
							<Alert
								severity="info"
								sx={{
									backgroundColor: `${COLOR_PRIMARY}20`,
									color: COLOR_TEXT_PRIMARY,
								}}
							>
								No customers found.
							</Alert>
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
												backgroundColor: COLOR_SURFACE,
												border:
													selectedCustomerId === customer.id
														? `2px solid ${COLOR_PRIMARY}`
														: `1px solid ${COLOR_TEXT_SECONDARY}40`,
												"&:hover": {
													borderColor: COLOR_PRIMARY,
													backgroundColor: `${COLOR_SURFACE}CC`,
												},
											}}
											onClick={() => {
												setSelectedCustomerId(customer.id);
												setSelectedClient(customer);
											}}
										>
											<CardContent>
												<Typography
													variant="subtitle1"
													fontWeight="bold"
													sx={{ color: COLOR_TEXT_PRIMARY }}
												>
													{customer.first_name || ""} {customer.last_name || ""}
													{!customer.first_name &&
														!customer.last_name &&
														"Customer Name Missing"}
												</Typography>
												<Typography
													variant="body2"
													sx={{ color: COLOR_TEXT_SECONDARY }}
												>
													Phone: {customer.phone || "N/A"}
												</Typography>
												<Typography
													variant="body2"
													sx={{ color: COLOR_TEXT_SECONDARY }}
												>
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
			<Paper
				sx={{
					p: 3,
					borderRadius: 2,
					mb: 3,
					backgroundColor: COLOR_SURFACE,
					color: COLOR_TEXT_PRIMARY,
				}}
			>
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
								sx={{
									mr: 1,
									borderColor: COLOR_PRIMARY,
									color: COLOR_PRIMARY,
									"&:hover": {
										borderColor: COLOR_PRIMARY,
										backgroundColor: `${COLOR_PRIMARY}20`,
									},
								}}
							>
								Back to Workshops
							</Button>
							<Button
								variant="contained"
								size="small"
								onClick={() => setSelectedCustomerId(null)}
								sx={{
									bgcolor: COLOR_PRIMARY,
									"&:hover": { bgcolor: `${COLOR_PRIMARY}CC` },
								}}
							>
								Change Customer
							</Button>
						</Box>
					) : (
						<Button
							variant="contained"
							size="small"
							onClick={() => setSelectedCustomerId(null)}
							sx={{
								bgcolor: COLOR_PRIMARY,
								"&:hover": { bgcolor: `${COLOR_PRIMARY}CC` },
							}}
						>
							Change Customer
						</Button>
					)}
				</Box>

				<List dense>
					<ListItem sx={{ color: COLOR_TEXT_PRIMARY }}>
						<ListItemText
							primary="Phone"
							secondary={selectedClient.phone || "N/A"}
							sx={{
								"& .MuiListItemText-primary": { color: COLOR_TEXT_PRIMARY },
								"& .MuiListItemText-secondary": { color: COLOR_TEXT_SECONDARY },
							}}
						/>
					</ListItem>
					<Divider sx={{ backgroundColor: COLOR_TEXT_SECONDARY + "40" }} />
					<ListItem sx={{ color: COLOR_TEXT_PRIMARY }}>
						<ListItemText
							primary="Email"
							secondary={selectedClient.email || "N/A"}
							sx={{
								"& .MuiListItemText-primary": { color: COLOR_TEXT_PRIMARY },
								"& .MuiListItemText-secondary": { color: COLOR_TEXT_SECONDARY },
							}}
						/>
					</ListItem>
					<Divider sx={{ backgroundColor: COLOR_TEXT_SECONDARY + "40" }} />
					<ListItem sx={{ color: COLOR_TEXT_PRIMARY }}>
						<ListItemText
							primary="Address"
							secondary={selectedClient.address || "N/A"}
							sx={{
								"& .MuiListItemText-primary": { color: COLOR_TEXT_PRIMARY },
								"& .MuiListItemText-secondary": { color: COLOR_TEXT_SECONDARY },
							}}
						/>
					</ListItem>
				</List>

				<Box sx={{ mt: 3 }}>
					<Typography
						variant="subtitle1"
						fontWeight="bold"
						sx={{
							mb: 2,
							color: COLOR_TEXT_PRIMARY,
						}}
					>
						Select Vehicle:
					</Typography>
					{vehicles.length === 0 ? (
						<Alert
							severity="info"
							sx={{
								backgroundColor: `${COLOR_PRIMARY}20`,
								color: COLOR_TEXT_PRIMARY,
							}}
						>
							No vehicles found for this customer.
						</Alert>
					) : (
						<FormControl fullWidth>
							<InputLabel
								id="vehicle-select-label"
								sx={{ color: COLOR_TEXT_SECONDARY }}
							>
								Vehicle
							</InputLabel>
							<Select
								labelId="vehicle-select-label"
								id="vehicle-select"
								value={selectedVehicleId || ""}
								label="Vehicle"
								onChange={handleVehicleChange}
								disabled={loading}
								sx={{
									color: COLOR_TEXT_PRIMARY,
									backgroundColor: COLOR_SURFACE,
									"& .MuiOutlinedInput-notchedOutline": {
										borderColor: COLOR_TEXT_SECONDARY + "60",
									},
									"&:hover .MuiOutlinedInput-notchedOutline": {
										borderColor: COLOR_PRIMARY,
									},
									"&.Mui-focused .MuiOutlinedInput-notchedOutline": {
										borderColor: COLOR_PRIMARY,
									},
									"& .MuiSvgIcon-root": {
										color: COLOR_TEXT_SECONDARY,
									},
								}}
								MenuProps={{
									PaperProps: {
										sx: {
											backgroundColor: COLOR_SURFACE,
											"& .MuiMenuItem-root": {
												color: COLOR_TEXT_PRIMARY,
												"&:hover": {
													backgroundColor: `${COLOR_PRIMARY}20`,
												},
											},
										},
									},
								}}
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
			<Paper
				sx={{
					p: 3,
					borderRadius: 2,
					mb: 3,
					backgroundColor: COLOR_SURFACE,
					color: COLOR_TEXT_PRIMARY,
				}}
			>
				<Typography
					variant="subtitle1"
					fontWeight="bold"
					sx={{
						mb: 2,
						color: COLOR_TEXT_PRIMARY,
					}}
				>
					Select Your Vehicle:
				</Typography>
				{vehicles.length === 0 ? (
					<Alert
						severity="info"
						sx={{
							backgroundColor: `${COLOR_PRIMARY}20`,
							color: COLOR_TEXT_PRIMARY,
						}}
					>
						You don't have any registered vehicles.
					</Alert>
				) : (
					<FormControl fullWidth>
						<InputLabel
							id="client-vehicle-select-label"
							sx={{ color: COLOR_TEXT_SECONDARY }}
						>
							Your Vehicle
						</InputLabel>
						<Select
							labelId="client-vehicle-select-label"
							id="client-vehicle-select"
							value={selectedVehicleId || ""}
							label="Vehicle"
							onChange={handleVehicleChange}
							disabled={loading}
							sx={{
								color: COLOR_TEXT_PRIMARY,
								backgroundColor: COLOR_SURFACE,
								"& .MuiOutlinedInput-notchedOutline": {
									borderColor: COLOR_TEXT_SECONDARY + "60",
								},
								"&:hover .MuiOutlinedInput-notchedOutline": {
									borderColor: COLOR_PRIMARY,
								},
								"&.Mui-focused .MuiOutlinedInput-notchedOutline": {
									borderColor: COLOR_PRIMARY,
								},
								"& .MuiSvgIcon-root": {
									color: COLOR_TEXT_SECONDARY,
								},
							}}
							MenuProps={{
								PaperProps: {
									sx: {
										backgroundColor: COLOR_SURFACE,
										"& .MuiMenuItem-root": {
											color: COLOR_TEXT_PRIMARY,
											"&:hover": {
												backgroundColor: `${COLOR_PRIMARY}20`,
											},
										},
									},
								},
							}}
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
			<Paper
				sx={{
					p: 3,
					borderRadius: 2,
					backgroundColor: COLOR_SURFACE,
					color: COLOR_TEXT_PRIMARY,
				}}
			>
				<Box
					sx={{
						display: "flex",
						justifyContent: "space-between",
						alignItems: "center",
						mb: 3,
					}}
				>
					<Box sx={{ display: "flex", alignItems: "center" }}>
						<BuildIcon sx={{ mr: 1, color: COLOR_PRIMARY }} />
						<Typography
							variant="h6"
							fontWeight="bold"
							sx={{ color: COLOR_TEXT_PRIMARY }}
						>
							Diagnostic Report - {selectedVehicle.brand}{" "}
							{selectedVehicle.model}
						</Typography>
					</Box>
					<Typography variant="subtitle2" sx={{ color: COLOR_TEXT_SECONDARY }}>
						{selectedVehicle.registration_number}
					</Typography>
				</Box>

				{/* Action buttons for CRUD operations */}
				{(isAdmin() || isMechanic()) && selectedVehicleId && (
					<Box sx={{ mb: 2, display: "flex", gap: 1 }}>
						<Button
							variant="contained"
							startIcon={<AddIcon />}
							onClick={() => handleAddDiagnostic()}
							sx={{
								bgcolor: COLOR_PRIMARY,
								"&:hover": {
									bgcolor: `${COLOR_PRIMARY}dd`,
								},
							}}
						>
							Add Diagnostic
						</Button>
					</Box>
				)}

				{loading ? (
					<Box sx={{ display: "flex", justifyContent: "center", my: 3 }}>
						<CircularProgress sx={{ color: COLOR_PRIMARY }} />
					</Box>
				) : (
					<>
						{diagnosticIssues.length === 0 ? (
							<Alert
								severity="info"
								sx={{
									backgroundColor: `${COLOR_PRIMARY}20`,
									color: COLOR_TEXT_PRIMARY,
								}}
							>
								No diagnostic issues found for this vehicle.
							</Alert>
						) : (
							<>
								<TableContainer
									sx={{
										backgroundColor: COLOR_BACKGROUND,
										borderRadius: 2,
									}}
								>
									<Table size="small">
										<TableHead>
											<TableRow>
												<TableCell
													sx={{
														color: COLOR_TEXT_PRIMARY,
														backgroundColor: COLOR_SURFACE,
														borderBottom: `1px solid ${COLOR_TEXT_SECONDARY}40`,
													}}
												>
													Diagnostic Date
												</TableCell>
												<TableCell
													sx={{
														color: COLOR_TEXT_PRIMARY,
														backgroundColor: COLOR_SURFACE,
														borderBottom: `1px solid ${COLOR_TEXT_SECONDARY}40`,
													}}
												>
													Next Inspection
												</TableCell>
												<TableCell
													sx={{
														color: COLOR_TEXT_PRIMARY,
														backgroundColor: COLOR_SURFACE,
														borderBottom: `1px solid ${COLOR_TEXT_SECONDARY}40`,
													}}
												>
													Diagnostic Notes
												</TableCell>
												<TableCell
													sx={{
														color: COLOR_TEXT_PRIMARY,
														backgroundColor: COLOR_SURFACE,
														borderBottom: `1px solid ${COLOR_TEXT_SECONDARY}40`,
													}}
												>
													Repair Cost
												</TableCell>
												<TableCell
													sx={{
														color: COLOR_TEXT_PRIMARY,
														backgroundColor: COLOR_SURFACE,
														borderBottom: `1px solid ${COLOR_TEXT_SECONDARY}40`,
													}}
												>
													Notifications
												</TableCell>
												<TableCell
													sx={{
														color: COLOR_TEXT_PRIMARY,
														backgroundColor: COLOR_SURFACE,
														borderBottom: `1px solid ${COLOR_TEXT_SECONDARY}40`,
													}}
												>
													Severity
												</TableCell>
												{(isAdmin() || isMechanic()) && (
													<TableCell
														sx={{
															color: COLOR_TEXT_PRIMARY,
															backgroundColor: COLOR_SURFACE,
															borderBottom: `1px solid ${COLOR_TEXT_SECONDARY}40`,
															width: 120,
														}}
													>
														Actions
													</TableCell>
												)}
											</TableRow>
										</TableHead>
										<TableBody>
											{diagnosticIssues.map((issue) => (
												<TableRow
													key={issue.id}
													sx={{
														"&:hover": {
															backgroundColor: `${COLOR_SURFACE}80`,
														},
													}}
												>
													<TableCell
														sx={{
															color: COLOR_TEXT_PRIMARY,
															borderBottom: `1px solid ${COLOR_TEXT_SECONDARY}20`,
														}}
													>
														{new Date(
															issue.diagnostic_date
														).toLocaleDateString()}
													</TableCell>
													<TableCell
														sx={{
															color: COLOR_TEXT_PRIMARY,
															borderBottom: `1px solid ${COLOR_TEXT_SECONDARY}20`,
														}}
													>
														{issue.next_inspection_date
															? new Date(
																	issue.next_inspection_date
															  ).toLocaleDateString()
															: "Not scheduled"}
													</TableCell>
													<TableCell
														sx={{
															color: COLOR_TEXT_PRIMARY,
															borderBottom: `1px solid ${COLOR_TEXT_SECONDARY}20`,
														}}
													>
														{issue.diagnostic_notes}
													</TableCell>
													<TableCell
														sx={{
															color: COLOR_TEXT_PRIMARY,
															borderBottom: `1px solid ${COLOR_TEXT_SECONDARY}20`,
														}}
													>
														$
														{issue.estimated_repair_cost
															? Number(issue.estimated_repair_cost).toFixed(2)
															: "0.00"}
													</TableCell>
													<TableCell
														sx={{
															color: COLOR_TEXT_PRIMARY,
															borderBottom: `1px solid ${COLOR_TEXT_SECONDARY}20`,
														}}
													>
														<Box
															sx={{
																display: "flex",
																gap: 0.5,
																flexWrap: "wrap",
															}}
														>
															{issue.email_notification && (
																<Box
																	sx={{
																		display: "inline-block",
																		bgcolor: COLOR_PRIMARY,
																		color: "white",
																		px: 0.5,
																		py: 0.25,
																		borderRadius: 0.5,
																		fontSize: "0.7rem",
																	}}
																>
																	📧
																</Box>
															)}
															{issue.sms_notification && (
																<Box
																	sx={{
																		display: "inline-block",
																		bgcolor: COLOR_PRIMARY,
																		color: "white",
																		px: 0.5,
																		py: 0.25,
																		borderRadius: 0.5,
																		fontSize: "0.7rem",
																	}}
																>
																	📱
																</Box>
															)}
															{!issue.email_notification &&
																!issue.sms_notification && (
																	<Typography
																		variant="caption"
																		sx={{ color: COLOR_TEXT_SECONDARY }}
																	>
																		None
																	</Typography>
																)}
														</Box>
													</TableCell>
													<TableCell
														sx={{
															borderBottom: `1px solid ${COLOR_TEXT_SECONDARY}20`,
														}}
													>
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
													{(isAdmin() || isMechanic()) && (
														<TableCell
															sx={{
																borderBottom: `1px solid ${COLOR_TEXT_SECONDARY}20`,
															}}
														>
															<Box sx={{ display: "flex", gap: 0.5 }}>
																{isAdmin() && (
																	<>
																		<IconButton
																			size="small"
																			onClick={() =>
																				handleEditDiagnostic(issue)
																			}
																			sx={{
																				color: COLOR_PRIMARY,
																				"&:hover": {
																					backgroundColor: `${COLOR_PRIMARY}20`,
																				},
																			}}
																		>
																			<EditIcon fontSize="small" />
																		</IconButton>
																		<IconButton
																			size="small"
																			onClick={() =>
																				handleDeleteDiagnostic(issue.id)
																			}
																			sx={{
																				color: COLOR_ERROR,
																				"&:hover": {
																					backgroundColor: `${COLOR_ERROR}20`,
																				},
																			}}
																		>
																			<DeleteIcon fontSize="small" />
																		</IconButton>
																	</>
																)}
																{isMechanic() && !isAdmin() && (
																	<IconButton
																		size="small"
																		onClick={() => handleEditDiagnostic(issue)}
																		sx={{
																			color: COLOR_PRIMARY,
																			"&:hover": {
																				backgroundColor: `${COLOR_PRIMARY}20`,
																			},
																		}}
																	>
																		<EditIcon fontSize="small" />
																	</IconButton>
																)}
															</Box>
														</TableCell>
													)}
												</TableRow>
											))}
										</TableBody>
									</Table>
								</TableContainer>

								{criticalIssues.length > 0 && (
									<Box sx={{ mt: 4 }}>
										<Box
											sx={{
												display: "flex",
												alignItems: "center",
												bgcolor: `${COLOR_ERROR}20`,
												p: 1.5,
												borderRadius: 1,
												mb: 2,
											}}
										>
											<WarningIcon sx={{ mr: 1, color: COLOR_ERROR }} />
											<Typography
												variant="subtitle1"
												fontWeight="bold"
												sx={{ color: COLOR_ERROR }}
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
													backgroundColor: COLOR_SURFACE,
													border: `1px solid ${COLOR_ERROR}40`,
													borderLeft: `4px solid ${COLOR_ERROR}`,
													borderRadius: 1,
												}}
											>
												<Typography
													variant="body1"
													fontWeight="bold"
													sx={{ color: COLOR_TEXT_PRIMARY }}
												>
													{issue.diagnostic_notes}
												</Typography>
												<Typography
													variant="body2"
													sx={{
														mt: 1,
														color: COLOR_TEXT_SECONDARY,
													}}
												>
													Severity: {issue.severity_level}
												</Typography>
												{issue.estimated_repair_cost && (
													<Typography
														variant="body2"
														sx={{
															mt: 1,
															color: COLOR_TEXT_SECONDARY,
														}}
													>
														Estimated Cost: ${issue.estimated_repair_cost}
													</Typography>
												)}
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
					<CircularProgress sx={{ color: COLOR_PRIMARY }} />
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
				{!isClient() ? renderCustomerDetails() : renderClientVehicleSelection()}
				{selectedVehicleId && renderDiagnosticReport()}
			</>
		);
	};

	return (
		<Mainlayout>
			<Box
				sx={{
					minHeight: "100vh",
					backgroundColor: COLOR_BACKGROUND,
					color: COLOR_TEXT_PRIMARY,
				}}
			>
				<Container maxWidth="lg">
					<Box sx={{ py: 3 }}>
						<Typography
							variant="h4"
							fontWeight="bold"
							sx={{
								mb: 3,
								color: COLOR_TEXT_PRIMARY,
							}}
						>
							Vehicle Diagnostics
						</Typography>

						{error && !loading && (
							<Alert
								severity="error"
								sx={{
									mb: 3,
									backgroundColor: `${COLOR_ERROR}20`,
									color: COLOR_TEXT_PRIMARY,
									"& .MuiAlert-icon": {
										color: COLOR_ERROR,
									},
								}}
								action={
									<Button
										color="inherit"
										size="small"
										onClick={() => setError(null)}
										sx={{ color: COLOR_TEXT_PRIMARY }}
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

					{/* Add/Edit Diagnostic Dialog */}
					<Dialog
						open={dialogOpen}
						onClose={handleCloseDialog}
						maxWidth="md"
						fullWidth
						PaperProps={{
							sx: {
								backgroundColor: COLOR_SURFACE,
								color: COLOR_TEXT_PRIMARY,
							},
						}}
					>
						<DialogTitle sx={{ color: COLOR_TEXT_PRIMARY }}>
							{dialogMode === "add" ? "Add New Diagnostic" : "Edit Diagnostic"}
						</DialogTitle>
						<DialogContent>
							<Box
								sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}
							>
								<TextField
									fullWidth
									multiline
									rows={4}
									label="Diagnostic Notes"
									value={diagnosticForm.diagnostic_notes}
									onChange={(e) =>
										setDiagnosticForm((prev) => ({
											...prev,
											diagnostic_notes: e.target.value,
										}))
									}
									sx={{
										"& .MuiOutlinedInput-root": {
											color: COLOR_TEXT_PRIMARY,
											"& fieldset": {
												borderColor: `${COLOR_TEXT_SECONDARY}60`,
											},
											"&:hover fieldset": {
												borderColor: COLOR_PRIMARY,
											},
										},
										"& .MuiInputLabel-root": {
											color: COLOR_TEXT_SECONDARY,
										},
									}}
								/>

								<TextField
									fullWidth
									type="number"
									label="Estimated Repair Cost"
									value={diagnosticForm.estimated_repair_cost}
									onChange={(e) =>
										setDiagnosticForm((prev) => ({
											...prev,
											estimated_repair_cost: e.target.value,
										}))
									}
									InputProps={{
										startAdornment: (
											<Typography sx={{ color: COLOR_TEXT_SECONDARY, mr: 0.5 }}>
												$
											</Typography>
										),
									}}
									sx={{
										"& .MuiOutlinedInput-root": {
											color: COLOR_TEXT_PRIMARY,
											"& fieldset": {
												borderColor: `${COLOR_TEXT_SECONDARY}60`,
											},
											"&:hover fieldset": {
												borderColor: COLOR_PRIMARY,
											},
										},
										"& .MuiInputLabel-root": {
											color: COLOR_TEXT_SECONDARY,
										},
									}}
								/>

								<FormControl fullWidth>
									<InputLabel sx={{ color: COLOR_TEXT_SECONDARY }}>
										Severity Level
									</InputLabel>
									<Select
										value={diagnosticForm.severity_level}
										onChange={(e) =>
											setDiagnosticForm((prev) => ({
												...prev,
												severity_level: e.target.value,
											}))
										}
										label="Severity Level"
										sx={{
											color: COLOR_TEXT_PRIMARY,
											"& .MuiOutlinedInput-notchedOutline": {
												borderColor: `${COLOR_TEXT_SECONDARY}60`,
											},
											"&:hover .MuiOutlinedInput-notchedOutline": {
												borderColor: COLOR_PRIMARY,
											},
											"& .MuiSvgIcon-root": {
												color: COLOR_TEXT_SECONDARY,
											},
										}}
									>
										<MenuItem value="low">Low</MenuItem>
										<MenuItem value="medium">Medium</MenuItem>
										<MenuItem value="high">High</MenuItem>
										<MenuItem value="critical">Critical</MenuItem>
									</Select>
								</FormControl>

								<TextField
									fullWidth
									type="date"
									label="Next Inspection Date"
									value={diagnosticForm.next_inspection_date}
									onChange={(e) =>
										setDiagnosticForm((prev) => ({
											...prev,
											next_inspection_date: e.target.value,
										}))
									}
									InputLabelProps={{
										shrink: true,
									}}
									sx={{
										"& .MuiOutlinedInput-root": {
											color: COLOR_TEXT_PRIMARY,
											"& fieldset": {
												borderColor: `${COLOR_TEXT_SECONDARY}60`,
											},
											"&:hover fieldset": {
												borderColor: COLOR_PRIMARY,
											},
										},
										"& .MuiInputLabel-root": {
											color: COLOR_TEXT_SECONDARY,
										},
									}}
								/>

								<Box>
									<Typography
										variant="subtitle2"
										sx={{ color: COLOR_TEXT_PRIMARY, mb: 1 }}
									>
										Notification Preferences
									</Typography>
									<FormControlLabel
										control={
											<Checkbox
												checked={diagnosticForm.email_notification}
												onChange={(e) =>
													setDiagnosticForm((prev) => ({
														...prev,
														email_notification: e.target.checked,
													}))
												}
												sx={{
													color: COLOR_TEXT_SECONDARY,
													"&.Mui-checked": {
														color: COLOR_PRIMARY,
													},
												}}
											/>
										}
										label="Send Email Notification"
										sx={{ color: COLOR_TEXT_PRIMARY }}
									/>
									<FormControlLabel
										control={
											<Checkbox
												checked={diagnosticForm.sms_notification}
												onChange={(e) =>
													setDiagnosticForm((prev) => ({
														...prev,
														sms_notification: e.target.checked,
													}))
												}
												sx={{
													color: COLOR_TEXT_SECONDARY,
													"&.Mui-checked": {
														color: COLOR_PRIMARY,
													},
												}}
											/>
										}
										label="Send SMS Notification"
										sx={{ color: COLOR_TEXT_PRIMARY }}
									/>
								</Box>
							</Box>
						</DialogContent>
						<DialogActions sx={{ p: 2 }}>
							<Button
								onClick={handleCloseDialog}
								sx={{ color: COLOR_TEXT_SECONDARY }}
							>
								Cancel
							</Button>
							<Button
								onClick={handleSaveDiagnostic}
								variant="contained"
								sx={{
									bgcolor: COLOR_PRIMARY,
									"&:hover": {
										bgcolor: `${COLOR_PRIMARY}dd`,
									},
								}}
							>
								{dialogMode === "add" ? "Add Diagnostic" : "Update Diagnostic"}
							</Button>
						</DialogActions>
					</Dialog>

					<CustomSnackbar
						snackbarState={snackbar}
						onClose={handleSnackbarClose}
					/>
				</Container>
			</Box>
		</Mainlayout>
	);
};

export default Diagnostics;
