import React, { useState, useEffect, useContext } from "react";
import {
	Box,
	TextField,
	FormControl,
	InputLabel,
	Select,
	MenuItem,
	Grid,
	Typography,
	FormHelperText,
	CircularProgress,
} from "@mui/material";
// Remove the Button import from here
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { parseISO } from "date-fns";
import { bookingService } from "../../api/BookingAPIEndpoint";
import { workshopService } from "../../api/WorkshopAPIEndpoint";
import AuthContext from "../../context/AuthProvider";
import { customerService } from "../../api/CustomerAPIEndpoint";
import { UserService } from "../../api/UserAPIEndpoint";
import { ThemeProvider, createTheme } from "@mui/material/styles";

// Add to the props interface:
interface BookingFormProps {
	id: string;
	initialData?: any;
	onSubmit: (data: any) => void;
	clientVehicles?: any[]; // Add this prop
	userRole?: string; // Add this prop
	userId?: number; // Add this prop
}

const BookingForm: React.FC<BookingFormProps> = ({
	initialData,
	onSubmit,
	id = "booking-form",
	clientVehicles, // Destructure the new prop
	userRole, // Destructure the new prop
	userId, // Destructure the new prop
}) => {
	const { auth } = useContext(AuthContext);
	const [loading, setLoading] = useState(false);
	const [formData, setFormData] = useState({
		date: new Date(),
		vehicle_id: "",
		service_type: "general_service",
		workshop_id: "",
		mechanic_id: "",
		client_id: "",
		notes: "",
		status: "pending",
	});
	const [errors, setErrors] = useState<any>({});
	const [workshops, setWorkshops] = useState<any[]>([]);
	const [mechanics, setMechanics] = useState<any[]>([]);
	const [vehicles, setVehicles] = useState<any[]>([]);
	const [clients, setClients] = useState<any[]>([]);
	const [availableSlots, setAvailableSlots] = useState<any[]>([]);

	// Initialize form with data if editing
	useEffect(() => {
		if (initialData) {
			setFormData({
				date: initialData.date ? parseISO(initialData.date) : new Date(),
				vehicle_id: initialData.vehicle?.id || "",
				service_type: initialData.service_type || "general_service",
				workshop_id: initialData.workshop?.id || "",
				mechanic_id: initialData.mechanic?.id || "",
				client_id: initialData.client?.id || "",
				notes: initialData.note || "",
				status: initialData.status || "pending",
			});
		}
	}, [initialData]);

	// Load workshops, mechanics, vehicles based on role
	useEffect(() => {
		const loadInitialData = async () => {
			setLoading(true);
			try {
				// Only load customer vehicles if they weren't passed as props
				let vehiclesData = clientVehicles || [];

				if (!vehiclesData.length && userRole === "client" && userId) {
					try {
						// Only fetch if we need to and have a valid ID
						vehiclesData = await customerService.getCustomerVehicles(userId);
					} catch (err) {
						console.error("Error loading vehicles:", err);
						vehiclesData = [];
					}
				}

				// Load workshops
				if (auth.roles?.[0] === "admin" || auth.roles?.[0] === "client") {
					const workshopsData = await workshopService.getAllWorkshops();
					setWorkshops(workshopsData);
				} else if (auth.roles?.[0] === "owner") {
					// Owner already has workshop_id
					if (auth.workshop_id) {
						const workshopData = await workshopService.getWorkshopById(
							auth.workshop_id
						);
						setWorkshops([workshopData]);
						setFormData((prev) => ({
							...prev,
							workshop_id: auth.workshop_id,
						}));
					}
				}

				// Load vehicles for client
				if (auth.roles?.[0] === "client") {
					// Use the existing function from CustomerAPIEndpoint
					setVehicles(vehiclesData);
					setFormData((prev) => ({
						...prev,
						client_id: auth.user_id,
					}));
				}

				// For owners and admins, load clients list
				if (auth.roles?.[0] === "owner" || auth.roles?.[0] === "admin") {
					// Use the existing function from UserAPIEndpoint
					const clientsData = await UserService.getClients();
					setClients(clientsData);
				}
			} catch (err) {
				console.error("Error loading initial data:", err);
			} finally {
				setLoading(false);
			}
		};

		loadInitialData();
	}, [
		auth.roles,
		auth.user_id,
		auth.workshop_id,
		clientVehicles,
		userRole,
		userId,
	]);

	// Load mechanics when workshop is selected
	useEffect(() => {
		const loadMechanics = async () => {
			if (formData.workshop_id) {
				try {
					const mechanicsData = await workshopService.getWorkshopMechanics(
						formData.workshop_id
					);
					setMechanics(mechanicsData);
				} catch (err) {
					console.error("Error loading mechanics:", err);
				}
			} else {
				setMechanics([]);
			}
		};

		loadMechanics();
	}, [formData.workshop_id]);

	// Load available slots when workshop and date change
	useEffect(() => {
		const loadAvailableSlots = async () => {
			if (formData.workshop_id && formData.date) {
				try {
					const date = new Date(formData.date);
					const formattedDate = date.toISOString().split("T")[0];
					const slotsData = await bookingService.getAvailableSlots(
						formData.workshop_id,
						formattedDate
					);
					setAvailableSlots(slotsData);
				} catch (err) {
					console.error("Error loading available slots:", err);
				}
			}
		};

		loadAvailableSlots();
	}, [formData.workshop_id, formData.date]);

	// Load vehicles when client is selected (for admin/owner)
	useEffect(() => {
		const loadClientVehicles = async () => {
			if (
				formData.client_id &&
				(auth.role === "admin" || auth.role === "owner")
			) {
				try {
					const vehiclesData = await workshopService.getUserVehicles(
						formData.client_id
					);
					setVehicles(vehiclesData);
				} catch (err) {
					console.error("Error loading client vehicles:", err);
				}
			}
		};

		loadClientVehicles();
	}, [formData.client_id, auth.role]);

	const handleChange = (
		e: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>
	) => {
		const { name, value } = e.target;
		setFormData({
			...formData,
			[name as string]: value,
		});

		// Clear error when field is changed
		if (errors[name as string]) {
			setErrors({
				...errors,
				[name as string]: "",
			});
		}
	};

	const handleDateChange = (date: Date | null) => {
		if (date) {
			setFormData({
				...formData,
				date,
			});

			if (errors.date) {
				setErrors({
					...errors,
					date: "",
				});
			}
		}
	};

	const validateForm = () => {
		const newErrors: any = {};

		if (!formData.date) newErrors.date = "Date is required";
		if (!formData.vehicle_id) newErrors.vehicle_id = "Vehicle is required";
		if (!formData.workshop_id) newErrors.workshop_id = "Workshop is required";
		if (!formData.service_type)
			newErrors.service_type = "Service type is required";
		if (auth.roles?.[0] !== "client" && !formData.client_id)
			newErrors.client_id = "Client is required";

		setErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	};

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();

		if (!validateForm()) {
			return;
		}

		// Prepare data for submission
		const bookingData = {
			date: formData.date.toISOString(),
			vehicle_id: formData.vehicle_id,
			service_type: formData.service_type,
			workshop_id: formData.workshop_id,
			mechanic_id: formData.mechanic_id || null,
			client_id: formData.client_id || auth.user_id,
			note: formData.notes,
			status: formData.status,
		};

		onSubmit(bookingData);
	};

	if (loading) {
		return (
			<Box sx={{ display: "flex", justifyContent: "center", my: 4 }}>
				<CircularProgress sx={{ color: "#ff3c4e" }} />
			</Box>
		);
	}

	// Stwórz własny motyw dla komponentów daty/czasu
	const dateTimePickerTheme = createTheme({
		palette: {
			primary: {
				main: "#ff3c4e",
			},
			secondary: {
				main: "#ff3c4e",
			},
		},
		components: {
			MuiPickersDay: {
				styleOverrides: {
					root: {
						"&.Mui-selected": {
							backgroundColor: "#ff3c4e !important",
						},
						"&.Mui-today": {
							borderColor: "#ff3c4e !important",
							color: "#ff3c4e !important",
						},
					},
				},
			},
			MuiClockNumber: {
				styleOverrides: {
					root: {
						"&.Mui-selected": {
							backgroundColor: "#ff3c4e !important",
						},
					},
				},
			},
			MuiClock: {
				styleOverrides: {
					pin: {
						backgroundColor: "#ff3c4e !important",
					},
				},
			},
			MuiClockPointer: {
				styleOverrides: {
					root: {
						backgroundColor: "#ff3c4e !important",
					},
					thumb: {
						backgroundColor: "#ff3c4e !important",
						borderColor: "#ff3c4e !important",
					},
				},
			},
			MuiTabs: {
				styleOverrides: {
					indicator: {
						backgroundColor: "#ff3c4e !important",
					},
				},
			},
			MuiTab: {
				styleOverrides: {
					root: {
						"&.Mui-selected": {
							color: "#ff3c4e !important",
						},
					},
				},
			},
			MuiDigitalClock: {
				styleOverrides: {
					root: {
						"& .MuiMenuItem-root.Mui-selected": {
							backgroundColor: "#ff3c4e !important",
						},
					},
				},
			},
			MuiButton: {
				styleOverrides: {
					root: {
						"&.MuiButton-text": {
							color: "#ff3c4e !important",
						},
					},
				},
			},
		},
	});

	return (
		<Box component="form" id={id} onSubmit={handleSubmit} sx={{ mt: 2 }}>
			<Grid container spacing={3}>
				{/* Date and Time */}
				<Grid item xs={12} md={6}>
					<ThemeProvider theme={dateTimePickerTheme}>
						<LocalizationProvider dateAdapter={AdapterDateFns}>
							<DateTimePicker
								label="Appointment Date and Time"
								value={formData.date}
								onChange={handleDateChange}
								slotProps={{
									textField: {
										fullWidth: true,
										error: !!errors.date,
										helperText: errors.date,
									},
									// Dostosujmy dokładnie styl kalendarza
									calendarHeader: {
										sx: {
											"& .MuiPickersCalendarHeader-label": {
												color: "#333",
												fontWeight: 500,
											},
											"& .MuiIconButton-root": {
												color: "#ff3c4e",
											},
										},
									},
									day: {
										sx: {
											"&.MuiPickersDay-root.Mui-selected": {
												backgroundColor: "#ff3c4e",
												"&:hover": {
													backgroundColor: "#d6303f",
												},
												"&:focus": {
													backgroundColor: "#d6303f",
												},
											},
											"&.MuiPickersDay-root.Mui-today": {
												borderColor: "#ff3c4e",
												color: "#ff3c4e",
											},
											"&.MuiPickersDay-root:hover": {
												backgroundColor: "rgba(255, 60, 78, 0.1)",
											},
										},
									},
									// Dodatkowe style dla selektora czasu
									digitalClockItem: {
										sx: {
											"&.MuiMenuItem-root.Mui-selected": {
												backgroundColor: "#ff3c4e !important",
												"&:hover": {
													backgroundColor: "#d6303f !important",
												},
											},
										},
									},
									// Style dla przycisków AM/PM
									ampmSelection: {
										sx: {
											"& .MuiTimeClock-amButton.Mui-selected": {
												backgroundColor: "#ff3c4e !important",
												color: "white",
											},
											"& .MuiTimeClock-pmButton.Mui-selected": {
												backgroundColor: "#ff3c4e !important",
												color: "white",
											},
										},
									},
									// Selektor minut/godzin
									timeSelection: {
										sx: {
											"& .MuiTabs-indicator": {
												backgroundColor: "#ff3c4e !important",
											},
											"& .MuiTab-root.Mui-selected": {
												color: "#ff3c4e !important",
											},
										},
									},
									// Komórki czasu w selektorze czasu
									digital: {
										sx: {
											"& .MuiClockNumber-root.Mui-selected": {
												backgroundColor: "#ff3c4e !important",
											},
											"& .MuiClockDigital-item.Mui-selected": {
												backgroundColor: "#ff3c4e !important",
											},
										},
									},
									// Przyciski OK/Cancel - dodatkowy !important
									actionBar: {
										sx: {
											"& .MuiButton-root": {
												color: "#ff3c4e !important",
												"&:hover": {
													backgroundColor: "rgba(255, 60, 78, 0.1)",
												},
											},
										},
									},
								}}
								sx={{
									"& .MuiOutlinedInput-root": {
										"& fieldset": {
											borderColor: !!errors.date ? "error.main" : "#ddd",
										},
										"&:hover fieldset": {
											borderColor: "#ff3c4e",
										},
										"&.Mui-focused fieldset": {
											borderColor: "#ff3c4e",
										},
									},
									"& .MuiInputLabel-root.Mui-focused": {
										color: "#ff3c4e",
									},
									// Dodatkowe style globalne dla komponentów selektora czasu
									"& .MuiClockPicker-root": {
										"& .MuiClock-pin": {
											backgroundColor: "#ff3c4e !important",
										},
										"& .MuiClockPointer-root": {
											backgroundColor: "#ff3c4e !important",
										},
										"& .MuiClockPointer-thumb": {
											border: "14px solid #ff3c4e !important",
										},
									},
									// Styl dla siatki selektora czasu
									"& .MuiDigitalClockItem-root.Mui-selected": {
										backgroundColor: "#ff3c4e !important",
									},
								}}
							/>
						</LocalizationProvider>
					</ThemeProvider>
				</Grid>

				{/* Workshop selection (for admin and client) */}
				{auth.roles?.[0] === "admin" && (
					<Grid item xs={12} md={6}>
						<FormControl fullWidth error={!!errors.workshop_id}>
							<InputLabel>Workshop</InputLabel>
							<Select
								name="workshop_id"
								value={formData.workshop_id}
								label="Workshop"
								onChange={handleChange}
								sx={{
									"& .MuiOutlinedInput-notchedOutline": {
										borderColor: !!errors.workshop_id ? "error.main" : "#ddd",
									},
									"&:hover .MuiOutlinedInput-notchedOutline": {
										borderColor: "#ff3c4e",
									},
									"&.Mui-focused .MuiOutlinedInput-notchedOutline": {
										borderColor: "#ff3c4e",
									},
								}}
							>
								{workshops.map((workshop) => (
									<MenuItem key={workshop.id} value={workshop.id}>
										{workshop.name}
									</MenuItem>
								))}
							</Select>
							{errors.workshop_id && (
								<FormHelperText>{errors.workshop_id}</FormHelperText>
							)}
						</FormControl>
					</Grid>
				)}

				{/* Owner and admin need to select client */}
				{(auth.roles?.[0] === "admin" || auth.roles?.[0] === "owner") && (
					<Grid item xs={12} md={6}>
						<FormControl fullWidth error={!!errors.client_id}>
							<InputLabel>Client</InputLabel>
							<Select
								name="client_id"
								value={formData.client_id}
								label="Client"
								onChange={handleChange}
								sx={{
									"& .MuiOutlinedInput-notchedOutline": {
										borderColor: !!errors.client_id ? "error.main" : "#ddd",
									},
									"&:hover .MuiOutlinedInput-notchedOutline": {
										borderColor: "#ff3c4e",
									},
									"&.Mui-focused .MuiOutlinedInput-notchedOutline": {
										borderColor: "#ff3c4e",
									},
								}}
							>
								{clients.map((client) => (
									<MenuItem key={client.id} value={client.id}>
										{client.first_name} {client.last_name}
									</MenuItem>
								))}
							</Select>
							{errors.client_id && (
								<FormHelperText>{errors.client_id}</FormHelperText>
							)}
						</FormControl>
					</Grid>
				)}

				{/* Vehicle selection */}
				<Grid item xs={12} md={6}>
					<FormControl fullWidth error={!!errors.vehicle_id}>
						<InputLabel>Vehicle</InputLabel>
						<Select
							name="vehicle_id"
							value={formData.vehicle_id}
							label="Vehicle"
							onChange={handleChange}
							disabled={vehicles.length === 0}
							sx={{
								"& .MuiOutlinedInput-notchedOutline": {
									borderColor: !!errors.vehicle_id ? "error.main" : "#ddd",
								},
								"&:hover .MuiOutlinedInput-notchedOutline": {
									borderColor: "#ff3c4e",
								},
								"&.Mui-focused .MuiOutlinedInput-notchedOutline": {
									borderColor: "#ff3c4e",
								},
							}}
						>
							{vehicles.map((vehicle) => (
								<MenuItem key={vehicle.id} value={vehicle.id}>
									{vehicle.brand} {vehicle.model} -{" "}
									{vehicle.registration_number}
								</MenuItem>
							))}
						</Select>
						{errors.vehicle_id && (
							<FormHelperText>{errors.vehicle_id}</FormHelperText>
						)}
						{vehicles.length === 0 && (
							<FormHelperText>No vehicles available</FormHelperText>
						)}
					</FormControl>
				</Grid>

				{/* Service Type */}
				<Grid item xs={12} md={6}>
					<FormControl fullWidth error={!!errors.service_type}>
						<InputLabel>Service Type</InputLabel>
						<Select
							name="service_type"
							value={formData.service_type}
							label="Service Type"
							onChange={handleChange}
							sx={{
								"& .MuiOutlinedInput-notchedOutline": {
									borderColor: !!errors.service_type ? "error.main" : "#ddd",
								},
								"&:hover .MuiOutlinedInput-notchedOutline": {
									borderColor: "#ff3c4e",
								},
								"&.Mui-focused .MuiOutlinedInput-notchedOutline": {
									borderColor: "#ff3c4e",
								},
							}}
						>
							<MenuItem value="general_service">General Service</MenuItem>
							<MenuItem value="oil_change">Oil Change</MenuItem>
							<MenuItem value="brake_inspection">Brake Inspection</MenuItem>
							<MenuItem value="tire_replacement">Tire Replacement</MenuItem>
							<MenuItem value="diagnostic">Diagnostic</MenuItem>
							<MenuItem value="repair">Repair</MenuItem>
						</Select>
						{errors.service_type && (
							<FormHelperText>{errors.service_type}</FormHelperText>
						)}
					</FormControl>
				</Grid>

				{/* Mechanic selection (optional) */}
				{(auth.roles?.[0] === "admin" || auth.roles?.[0] === "owner") && (
					<Grid item xs={12} md={6}>
						<FormControl fullWidth disabled={mechanics.length === 0}>
							<InputLabel>Assigned Mechanic (Optional)</InputLabel>
							<Select
								name="mechanic_id"
								value={formData.mechanic_id}
								label="Assigned Mechanic (Optional)"
								onChange={handleChange}
								sx={{
									"& .MuiOutlinedInput-notchedOutline": {
										borderColor: "#ddd",
									},
									"&:hover .MuiOutlinedInput-notchedOutline": {
										borderColor: "#ff3c4e",
									},
									"&.Mui-focused .MuiOutlinedInput-notchedOutline": {
										borderColor: "#ff3c4e",
									},
								}}
							>
								<MenuItem value="">Not Assigned</MenuItem>
								{mechanics.map((mechanic) => (
									<MenuItem key={mechanic.id} value={mechanic.id}>
										{mechanic.first_name} {mechanic.last_name}
									</MenuItem>
								))}
							</Select>
							{mechanics.length === 0 && (
								<FormHelperText>
									{formData.workshop_id
										? "No mechanics available"
										: "Select a workshop first"}
								</FormHelperText>
							)}
						</FormControl>
					</Grid>
				)}

				{/* Status (only for admin, owner) */}
				{(auth.roles?.[0] === "admin" || auth.roles?.[0] === "owner") &&
					initialData && (
						<Grid item xs={12} md={6}>
							<FormControl fullWidth>
								<InputLabel>Status</InputLabel>
								<Select
									name="status"
									value={formData.status}
									label="Status"
									onChange={handleChange}
									sx={{
										"& .MuiOutlinedInput-notchedOutline": {
											borderColor: "#ddd",
										},
										"&:hover .MuiOutlinedInput-notchedOutline": {
											borderColor: "#ff3c4e",
										},
										"&.Mui-focused .MuiOutlinedInput-notchedOutline": {
											borderColor: "#ff3c4e",
										},
									}}
								>
									<MenuItem value="pending">Pending</MenuItem>
									<MenuItem value="confirmed">Confirmed</MenuItem>
									<MenuItem value="in_progress">In Progress</MenuItem>
									<MenuItem value="completed">Completed</MenuItem>
									<MenuItem value="cancelled">Cancelled</MenuItem>
								</Select>
							</FormControl>
						</Grid>
					)}

				{/* Notes */}
				<Grid item xs={12}>
					<TextField
						name="notes"
						label="Notes"
						value={formData.notes}
						onChange={handleChange}
						multiline
						rows={4}
						fullWidth
						variant="outlined"
						placeholder="Additional information about your appointment"
						sx={{
							"& .MuiOutlinedInput-root": {
								"& fieldset": {
									borderColor: "#ddd",
								},
								"&:hover fieldset": {
									borderColor: "#ff3c4e",
								},
								"&.Mui-focused fieldset": {
									borderColor: "#ff3c4e",
								},
							},
						}}
					/>
				</Grid>

				{/* Submit button */}
				{/* <Grid item xs={12}>
                    <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
                        <Button
                            variant="contained"
                            type="submit"
                            sx={{
                                bgcolor: "#ff3c4e",
                                "&:hover": { bgcolor: "#d6303f" },
                                px: 4,
                            }}
                        >
                            {initialData ? "Update Booking" : "Create Booking"}
                        </Button>
                    </Box>
                </Grid> */}
			</Grid>
		</Box>
	);
};

export default BookingForm;
