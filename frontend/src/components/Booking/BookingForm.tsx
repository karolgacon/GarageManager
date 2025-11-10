import React, { useState, useEffect, useContext } from "react";
import {
	Box,
	TextField,
	FormControl,
	InputLabel,
	Select,
	MenuItem,
	Grid,
	FormHelperText,
	CircularProgress,
	SelectChangeEvent,
} from "@mui/material";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { parseISO } from "date-fns";
import { workshopService } from "../../api/WorkshopAPIEndpoint";
import AuthContext from "../../context/AuthProvider";
import { customerService } from "../../api/CustomerAPIEndpoint";
import { UserService } from "../../api/UserAPIEndpoint";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import {
	COLOR_PRIMARY,
	COLOR_TEXT_PRIMARY,
	COLOR_TEXT_SECONDARY,
	COLOR_SURFACE,
} from "../../constants";

interface BookingFormProps {
	id: string;
	initialData?: any;
	onSubmit: (data: any) => void;
	clientVehicles?: any[];
	userRole?: string;
	userId?: number;
}

const BookingForm: React.FC<BookingFormProps> = ({
	initialData,
	onSubmit,
	id = "booking-form",
	clientVehicles,
	userRole,
	userId,
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

	useEffect(() => {
		const loadInitialData = async () => {
			setLoading(true);
			try {
				let vehiclesData = clientVehicles || [];

				if (!vehiclesData.length && userRole === "client" && userId) {
					try {
						vehiclesData = await customerService.getCustomerVehicles(userId);
					} catch (err) {
						vehiclesData = [];
					}
				}

				if (auth.roles?.[0] === "admin" || auth.roles?.[0] === "client") {
					const workshopsData = await workshopService.getAllWorkshops();
					setWorkshops(workshopsData);
				} else if (auth.roles?.[0] === "owner") {
					// Workshop will be set based on owner's workshop
					const workshopsData = await workshopService.getAllWorkshops();
					setWorkshops(workshopsData);
					// Set workshop based on user's associated workshop
				}

				if (auth.roles?.[0] === "client") {
					setVehicles(vehiclesData);
					setFormData((prev) => ({
						...prev,
						client_id: String(auth.user_id || ""),
					}));
				}

				if (auth.roles?.[0] === "owner" || auth.roles?.[0] === "admin") {
					try {
						const clientsData = await UserService.getClients();
						console.log("Loaded clients:", clientsData); // Debug log
						setClients(clientsData);
					} catch (error) {
						console.error("Error loading clients:", error);
						setClients([]);
					}
				}
			} catch (err) {
			} finally {
				setLoading(false);
			}
		};

		loadInitialData();
	}, [auth.roles, auth.user_id, clientVehicles, userRole, userId]);

	useEffect(() => {
		const loadMechanics = async () => {
			if (formData.workshop_id) {
				try {
					const mechanicsData = await workshopService.getWorkshopMechanics(
						parseInt(formData.workshop_id)
					);
					setMechanics(mechanicsData);
				} catch (err) {}
			} else {
				setMechanics([]);
			}
		};

		loadMechanics();
	}, [formData.workshop_id]);

	useEffect(() => {
		// Available slots functionality can be added when API endpoint exists
	}, [formData.workshop_id, formData.date]);

	useEffect(() => {
		// Client vehicles loading functionality can be added when API endpoint exists
	}, [formData.client_id]);

	const handleChange = (
		e:
			| React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
			| SelectChangeEvent<string>
	) => {
		const { name, value } = e.target;
		setFormData({
			...formData,
			[name as string]: value,
		});

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
				<CircularProgress sx={{ color: COLOR_PRIMARY }} />
			</Box>
		);
	}

	const dateTimePickerTheme = createTheme({
		palette: {
			primary: {
				main: COLOR_PRIMARY,
			},
			secondary: {
				main: COLOR_PRIMARY,
			},
		},
		components: {
			MuiButton: {
				styleOverrides: {
					root: {
						"&.MuiButton-text": {
							color: COLOR_PRIMARY + " !important",
						},
					},
				},
			},
		},
	});

	return (
		<Box component="form" id={id} onSubmit={handleSubmit} sx={{ mt: 2 }}>
			<Grid container spacing={3}>
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
									actionBar: {
										sx: {
											"& .MuiButton-root": {
												color: COLOR_PRIMARY + " !important",
												"&:hover": {
													backgroundColor: "rgba(56, 130, 246, 0.1)",
												},
											},
										},
									},
									layout: {
										sx: {
											"& .MuiPickersDay-root": {
												color: COLOR_TEXT_PRIMARY,
												"&.Mui-selected": {
													bgcolor: COLOR_PRIMARY + " !important",
													color: COLOR_TEXT_PRIMARY + " !important",
													"&:hover": {
														bgcolor: COLOR_PRIMARY + " !important",
														opacity: 0.9,
													},
													"&:focus": {
														bgcolor: COLOR_PRIMARY + " !important",
														opacity: 0.9,
													},
												},
												"&:hover": {
													bgcolor: "rgba(56, 130, 246, 0.1)",
												},
											},
											"& .MuiPickersCalendarHeader-label": {
												color: COLOR_TEXT_PRIMARY,
											},
											"& .MuiPickersArrowSwitcher-button": {
												color: COLOR_TEXT_PRIMARY,
												"&:hover": {
													bgcolor: "rgba(56, 130, 246, 0.1)",
												},
											},
											"& .MuiDayCalendar-weekDayLabel": {
												color: COLOR_TEXT_SECONDARY,
											},
											bgcolor: COLOR_SURFACE,
											color: COLOR_TEXT_PRIMARY,
										},
									},
									popper: {
										sx: {
											"& .MuiPaper-root": {
												bgcolor: COLOR_SURFACE,
												border: `1px solid rgba(255, 255, 255, 0.1)`,
											},
										},
									},
								}}
								sx={{
									"& .MuiInputLabel-root": {
										color: COLOR_TEXT_SECONDARY,
										"&.Mui-focused": {
											color: COLOR_PRIMARY,
										},
									},
									"& .MuiInputBase-input": {
										color: COLOR_TEXT_PRIMARY,
									},
									"& .MuiOutlinedInput-root": {
										"& fieldset": {
											borderColor: !!errors.date
												? "error.main"
												: "rgba(255, 255, 255, 0.2)",
										},
										"&:hover fieldset": {
											borderColor: COLOR_PRIMARY,
										},
										"&.Mui-focused fieldset": {
											borderColor: COLOR_PRIMARY,
										},
									},
									"& .MuiInputLabel-root.Mui-focused": {
										color: COLOR_PRIMARY,
									},
									"& .MuiClockPicker-root": {
										"& .MuiClock-pin": {
											backgroundColor: COLOR_PRIMARY + " !important",
										},
										"& .MuiClockPointer-root": {
											backgroundColor: COLOR_PRIMARY + " !important",
										},
										"& .MuiClockPointer-thumb": {
											border: `14px solid ${COLOR_PRIMARY} !important`,
										},
									},
									"& .MuiDigitalClockItem-root.Mui-selected": {
										backgroundColor: COLOR_PRIMARY + " !important",
									},
								}}
							/>
						</LocalizationProvider>
					</ThemeProvider>
				</Grid>

				{auth.roles?.[0] === "admin" && (
					<Grid item xs={12} md={6}>
						<FormControl
							fullWidth
							error={!!errors.workshop_id}
							sx={{
								"& .MuiInputLabel-root": {
									color: COLOR_TEXT_SECONDARY,
									"&.Mui-focused": {
										color: COLOR_PRIMARY,
									},
								},
							}}
						>
							<InputLabel>Workshop</InputLabel>
							<Select
								name="workshop_id"
								value={formData.workshop_id}
								label="Workshop"
								onChange={handleChange}
								sx={{
									color: COLOR_TEXT_PRIMARY,
									"& .MuiSelect-select": {
										color: COLOR_TEXT_PRIMARY,
									},
									"& .MuiOutlinedInput-notchedOutline": {
										borderColor: !!errors.workshop_id
											? "error.main"
											: "rgba(255, 255, 255, 0.2)",
									},
									"&:hover .MuiOutlinedInput-notchedOutline": {
										borderColor: COLOR_PRIMARY,
									},
									"&.Mui-focused .MuiOutlinedInput-notchedOutline": {
										borderColor: COLOR_PRIMARY,
									},
									"& .MuiSelect-icon": {
										color: COLOR_TEXT_SECONDARY,
									},
								}}
								MenuProps={{
									PaperProps: {
										sx: {
											bgcolor: COLOR_SURFACE,
											color: COLOR_TEXT_PRIMARY,
											border: `1px solid rgba(255, 255, 255, 0.1)`,
											"& .MuiMenuItem-root": {
												color: COLOR_TEXT_PRIMARY,
												"&:hover": {
													backgroundColor: "rgba(56, 130, 246, 0.1)",
												},
												"&.Mui-selected": {
													backgroundColor: COLOR_PRIMARY,
													color: COLOR_TEXT_PRIMARY,
													"&:hover": {
														backgroundColor: "rgba(56, 130, 246, 0.8)",
													},
												},
											},
										},
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

				{(auth.roles?.[0] === "admin" || auth.roles?.[0] === "owner") && (
					<Grid item xs={12} md={6}>
						<FormControl
							fullWidth
							error={!!errors.client_id}
							sx={{
								"& .MuiInputLabel-root": {
									color: COLOR_TEXT_SECONDARY,
									"&.Mui-focused": {
										color: COLOR_PRIMARY,
									},
								},
							}}
						>
							<InputLabel>Client</InputLabel>
							<Select
								name="client_id"
								value={formData.client_id}
								label="Client"
								onChange={handleChange}
								sx={{
									color: COLOR_TEXT_PRIMARY,
									"& .MuiSelect-select": {
										color: COLOR_TEXT_PRIMARY,
									},
									"& .MuiOutlinedInput-notchedOutline": {
										borderColor: !!errors.client_id
											? "error.main"
											: "rgba(255, 255, 255, 0.2)",
									},
									"&:hover .MuiOutlinedInput-notchedOutline": {
										borderColor: COLOR_PRIMARY,
									},
									"&.Mui-focused .MuiOutlinedInput-notchedOutline": {
										borderColor: COLOR_PRIMARY,
									},
									"& .MuiSelect-icon": {
										color: COLOR_TEXT_SECONDARY,
									},
								}}
								MenuProps={{
									PaperProps: {
										sx: {
											bgcolor: COLOR_SURFACE,
											color: COLOR_TEXT_PRIMARY,
											border: `1px solid rgba(255, 255, 255, 0.1)`,
											"& .MuiMenuItem-root": {
												color: COLOR_TEXT_PRIMARY,
												"&:hover": {
													backgroundColor: "rgba(56, 130, 246, 0.1)",
												},
												"&.Mui-selected": {
													backgroundColor: COLOR_PRIMARY,
													color: COLOR_TEXT_PRIMARY,
													"&:hover": {
														backgroundColor: "rgba(56, 130, 246, 0.8)",
													},
												},
											},
										},
									},
								}}
							>
								{clients.length > 0 ? (
									clients.map((client) => (
										<MenuItem key={client.id} value={client.id}>
											{client.first_name} {client.last_name}
										</MenuItem>
									))
								) : (
									<MenuItem disabled value="">
										No clients available
									</MenuItem>
								)}
							</Select>
							{errors.client_id && (
								<FormHelperText>{errors.client_id}</FormHelperText>
							)}
							{clients.length === 0 && !errors.client_id && (
								<FormHelperText>Loading clients...</FormHelperText>
							)}
						</FormControl>
					</Grid>
				)}

				<Grid item xs={12} md={6}>
					<FormControl
						fullWidth
						error={!!errors.vehicle_id}
						sx={{
							"& .MuiInputLabel-root": {
								color: COLOR_TEXT_SECONDARY,
								"&.Mui-focused": {
									color: COLOR_PRIMARY,
								},
							},
						}}
					>
						<InputLabel>Vehicle</InputLabel>
						<Select
							name="vehicle_id"
							value={formData.vehicle_id}
							label="Vehicle"
							onChange={handleChange}
							disabled={vehicles.length === 0}
							sx={{
								color: COLOR_TEXT_PRIMARY,
								"& .MuiSelect-select": {
									color: COLOR_TEXT_PRIMARY,
								},
								"& .MuiOutlinedInput-notchedOutline": {
									borderColor: !!errors.vehicle_id
										? "error.main"
										: "rgba(255, 255, 255, 0.2)",
								},
								"&:hover .MuiOutlinedInput-notchedOutline": {
									borderColor: COLOR_PRIMARY,
								},
								"&.Mui-focused .MuiOutlinedInput-notchedOutline": {
									borderColor: COLOR_PRIMARY,
								},
								"& .MuiSelect-icon": {
									color: COLOR_TEXT_SECONDARY,
								},
								"&.Mui-disabled": {
									"& .MuiSelect-select": {
										color: "rgba(255, 255, 255, 0.3)",
									},
									"& .MuiSelect-icon": {
										color: "rgba(255, 255, 255, 0.3)",
									},
								},
							}}
							MenuProps={{
								PaperProps: {
									sx: {
										bgcolor: COLOR_SURFACE,
										color: COLOR_TEXT_PRIMARY,
										border: `1px solid rgba(255, 255, 255, 0.1)`,
										"& .MuiMenuItem-root": {
											color: COLOR_TEXT_PRIMARY,
											"&:hover": {
												backgroundColor: "rgba(56, 130, 246, 0.1)",
											},
											"&.Mui-selected": {
												backgroundColor: COLOR_PRIMARY,
												color: COLOR_TEXT_PRIMARY,
												"&:hover": {
													backgroundColor: "rgba(56, 130, 246, 0.8)",
												},
											},
										},
									},
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

				<Grid item xs={12} md={6}>
					<FormControl
						fullWidth
						error={!!errors.service_type}
						sx={{
							"& .MuiInputLabel-root": {
								color: COLOR_TEXT_SECONDARY,
								"&.Mui-focused": {
									color: COLOR_PRIMARY,
								},
							},
						}}
					>
						<InputLabel>Service Type</InputLabel>
						<Select
							name="service_type"
							value={formData.service_type}
							label="Service Type"
							onChange={handleChange}
							sx={{
								color: COLOR_TEXT_PRIMARY,
								"& .MuiSelect-select": {
									color: COLOR_TEXT_PRIMARY,
								},
								"& .MuiOutlinedInput-notchedOutline": {
									borderColor: !!errors.service_type
										? "error.main"
										: "rgba(255, 255, 255, 0.2)",
								},
								"&:hover .MuiOutlinedInput-notchedOutline": {
									borderColor: COLOR_PRIMARY,
								},
								"&.Mui-focused .MuiOutlinedInput-notchedOutline": {
									borderColor: COLOR_PRIMARY,
								},
								"& .MuiSelect-icon": {
									color: COLOR_TEXT_SECONDARY,
								},
							}}
							MenuProps={{
								PaperProps: {
									sx: {
										bgcolor: COLOR_SURFACE,
										color: COLOR_TEXT_PRIMARY,
										border: `1px solid rgba(255, 255, 255, 0.1)`,
										"& .MuiMenuItem-root": {
											color: COLOR_TEXT_PRIMARY,
											"&:hover": {
												backgroundColor: "rgba(56, 130, 246, 0.1)",
											},
											"&.Mui-selected": {
												backgroundColor: COLOR_PRIMARY,
												color: COLOR_TEXT_PRIMARY,
												"&:hover": {
													backgroundColor: "rgba(56, 130, 246, 0.8)",
												},
											},
										},
									},
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

				{(auth.roles?.[0] === "admin" || auth.roles?.[0] === "owner") && (
					<Grid item xs={12} md={6}>
						<FormControl
							fullWidth
							disabled={mechanics.length === 0}
							sx={{
								"& .MuiInputLabel-root": {
									color: COLOR_TEXT_SECONDARY,
									"&.Mui-focused": {
										color: COLOR_PRIMARY,
									},
									"&.Mui-disabled": {
										color: "rgba(255, 255, 255, 0.3)",
									},
								},
							}}
						>
							<InputLabel>Assigned Mechanic (Optional)</InputLabel>
							<Select
								name="mechanic_id"
								value={formData.mechanic_id}
								label="Assigned Mechanic (Optional)"
								onChange={handleChange}
								sx={{
									color: COLOR_TEXT_PRIMARY,
									"& .MuiSelect-select": {
										color: COLOR_TEXT_PRIMARY,
									},
									"& .MuiOutlinedInput-notchedOutline": {
										borderColor: "rgba(255, 255, 255, 0.2)",
									},
									"&:hover .MuiOutlinedInput-notchedOutline": {
										borderColor: COLOR_PRIMARY,
									},
									"&.Mui-focused .MuiOutlinedInput-notchedOutline": {
										borderColor: COLOR_PRIMARY,
									},
									"& .MuiSelect-icon": {
										color: COLOR_TEXT_SECONDARY,
									},
									"&.Mui-disabled": {
										"& .MuiSelect-select": {
											color: "rgba(255, 255, 255, 0.3)",
										},
										"& .MuiSelect-icon": {
											color: "rgba(255, 255, 255, 0.3)",
										},
									},
								}}
								MenuProps={{
									PaperProps: {
										sx: {
											bgcolor: COLOR_SURFACE,
											color: COLOR_TEXT_PRIMARY,
											border: `1px solid rgba(255, 255, 255, 0.1)`,
											"& .MuiMenuItem-root": {
												color: COLOR_TEXT_PRIMARY,
												"&:hover": {
													backgroundColor: "rgba(56, 130, 246, 0.1)",
												},
												"&.Mui-selected": {
													backgroundColor: COLOR_PRIMARY,
													color: COLOR_TEXT_PRIMARY,
													"&:hover": {
														backgroundColor: "rgba(56, 130, 246, 0.8)",
													},
												},
											},
										},
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

				{(auth.roles?.[0] === "admin" || auth.roles?.[0] === "owner") &&
					initialData && (
						<Grid item xs={12} md={6}>
							<FormControl
								fullWidth
								sx={{
									"& .MuiInputLabel-root": {
										color: COLOR_TEXT_SECONDARY,
										"&.Mui-focused": {
											color: COLOR_PRIMARY,
										},
									},
								}}
							>
								<InputLabel>Status</InputLabel>
								<Select
									name="status"
									value={formData.status}
									label="Status"
									onChange={handleChange}
									sx={{
										color: COLOR_TEXT_PRIMARY,
										"& .MuiSelect-select": {
											color: COLOR_TEXT_PRIMARY,
										},
										"& .MuiOutlinedInput-notchedOutline": {
											borderColor: "rgba(255, 255, 255, 0.2)",
										},
										"&:hover .MuiOutlinedInput-notchedOutline": {
											borderColor: COLOR_PRIMARY,
										},
										"&.Mui-focused .MuiOutlinedInput-notchedOutline": {
											borderColor: COLOR_PRIMARY,
										},
										"& .MuiSelect-icon": {
											color: COLOR_TEXT_SECONDARY,
										},
									}}
									MenuProps={{
										PaperProps: {
											sx: {
												bgcolor: COLOR_SURFACE,
												color: COLOR_TEXT_PRIMARY,
												border: `1px solid rgba(255, 255, 255, 0.1)`,
												"& .MuiMenuItem-root": {
													color: COLOR_TEXT_PRIMARY,
													"&:hover": {
														backgroundColor: "rgba(56, 130, 246, 0.1)",
													},
													"&.Mui-selected": {
														backgroundColor: COLOR_PRIMARY,
														color: COLOR_TEXT_PRIMARY,
														"&:hover": {
															backgroundColor: "rgba(56, 130, 246, 0.8)",
														},
													},
												},
											},
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
							"& .MuiInputLabel-root": {
								color: COLOR_TEXT_SECONDARY,
								"&.Mui-focused": {
									color: COLOR_PRIMARY,
								},
							},
							"& .MuiInputBase-input": {
								color: COLOR_TEXT_PRIMARY,
							},
							"& .MuiInputBase-input::placeholder": {
								color: COLOR_TEXT_SECONDARY,
								opacity: 1,
							},
							"& .MuiOutlinedInput-root": {
								"& fieldset": {
									borderColor: "rgba(255, 255, 255, 0.2)",
								},
								"&:hover fieldset": {
									borderColor: COLOR_PRIMARY,
								},
								"&.Mui-focused fieldset": {
									borderColor: COLOR_PRIMARY,
								},
							},
						}}
					/>
				</Grid>
			</Grid>
		</Box>
	);
};

export default BookingForm;
