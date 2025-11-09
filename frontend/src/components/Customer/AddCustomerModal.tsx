import React, { useState } from "react";
import {
	Dialog,
	DialogTitle,
	DialogContent,
	DialogActions,
	Button,
	TextField,
	Grid,
	FormControl,
	InputLabel,
	Select,
	MenuItem,
	Box,
	Typography,
	Alert,
	CircularProgress,
} from "@mui/material";
import { customerService } from "../../api/CustomerAPIEndpoint";
import { Customer } from "../../models/CustomerModel";
import {
	COLOR_PRIMARY,
	COLOR_SURFACE,
	COLOR_TEXT_PRIMARY,
	COLOR_TEXT_SECONDARY,
} from "../../constants";

interface AddCustomerModalProps {
	open: boolean;
	onClose: () => void;
	onCustomerAdded: (customer: Customer) => void;
	userRole?: string;
	currentWorkshopId?: number | null;
}

const AddCustomerModal: React.FC<AddCustomerModalProps> = ({
	open,
	onClose,
	onCustomerAdded,
	userRole,
	currentWorkshopId,
}) => {
	const [formData, setFormData] = useState({
		username: "",
		email: "",
		first_name: "",
		last_name: "",
		password: "",
		role: "client",
		phone: "",
		address: "",
		preferred_contact_method: "email",
	});

	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const handleInputChange = (field: string, value: string) => {
		setFormData((prev) => ({ ...prev, [field]: value }));
		if (error) setError(null);
	};

	const handleSubmit = async () => {
		try {
			setLoading(true);
			setError(null);

			if (
				!formData.username ||
				!formData.email ||
				!formData.first_name ||
				!formData.last_name ||
				!formData.password
			) {
				setError("Please fill in all required fields");
				return;
			}

			const customerData = {
				username: formData.username,
				email: formData.email,
				first_name: formData.first_name,
				last_name: formData.last_name,
				password: formData.password,
				role: formData.role,
				workshop_id: currentWorkshopId,
				profile: {
					phone: formData.phone,
					address: formData.address,
					preferred_contact_method: formData.preferred_contact_method,
				},
			};

			const newCustomer = await customerService.createCustomer(customerData);
			onCustomerAdded(newCustomer);
			handleClose();
		} catch (err: any) {
			setError(err.response?.data?.message || "Failed to add customer");
		} finally {
			setLoading(false);
		}
	};

	const handleClose = () => {
		setFormData({
			username: "",
			email: "",
			first_name: "",
			last_name: "",
			password: "",
			role: "client",
			phone: "",
			address: "",
			preferred_contact_method: "email",
		});
		setError(null);
		onClose();
	};

	return (
		<Dialog
			open={open}
			onClose={handleClose}
			maxWidth="md"
			fullWidth
			PaperProps={{
				sx: {
					backgroundColor: COLOR_SURFACE,
					color: COLOR_TEXT_PRIMARY,
					borderRadius: 2,
					border: `1px solid rgba(228, 230, 232, 0.1)`,
				},
			}}
		>
			<DialogTitle>
				<Typography
					variant="h5"
					fontWeight="bold"
					sx={{ color: COLOR_TEXT_PRIMARY }}
				>
					Add New Customer
				</Typography>
			</DialogTitle>

			<DialogContent sx={{ backgroundColor: COLOR_SURFACE }}>
				{error && (
					<Alert
						severity="error"
						sx={{
							mb: 2,
							backgroundColor: "rgba(244, 67, 54, 0.1)",
							color: "#ff6b6b",
							"& .MuiAlert-icon": {
								color: "#ff6b6b",
							},
						}}
					>
						{error}
					</Alert>
				)}

				<Grid container spacing={2} sx={{ mt: 1 }}>
					<Grid item xs={12}>
						<Typography
							variant="h6"
							gutterBottom
							sx={{ color: COLOR_TEXT_PRIMARY }}
						>
							Basic Information
						</Typography>
					</Grid>

					<Grid item xs={12} sm={6}>
						<TextField
							fullWidth
							label="Username *"
							value={formData.username}
							onChange={(e) => handleInputChange("username", e.target.value)}
							sx={{
								"& .MuiOutlinedInput-root": {
									backgroundColor: COLOR_SURFACE,
									color: COLOR_TEXT_PRIMARY,
									"& fieldset": {
										borderColor: "rgba(228, 230, 232, 0.3)",
									},
									"&:hover fieldset": {
										borderColor: COLOR_TEXT_SECONDARY,
									},
									"&.Mui-focused fieldset": {
										borderColor: COLOR_PRIMARY,
									},
								},
								"& .MuiInputLabel-root": {
									color: COLOR_TEXT_SECONDARY,
									"&.Mui-focused": {
										color: COLOR_PRIMARY,
									},
								},
							}}
						/>
					</Grid>

					<Grid item xs={12} sm={6}>
						<TextField
							fullWidth
							label="Email *"
							type="email"
							value={formData.email}
							onChange={(e) => handleInputChange("email", e.target.value)}
							sx={{
								"& .MuiOutlinedInput-root": {
									backgroundColor: COLOR_SURFACE,
									color: COLOR_TEXT_PRIMARY,
									"& fieldset": {
										borderColor: "rgba(228, 230, 232, 0.3)",
									},
									"&:hover fieldset": {
										borderColor: COLOR_TEXT_SECONDARY,
									},
									"&.Mui-focused fieldset": {
										borderColor: COLOR_PRIMARY,
									},
								},
								"& .MuiInputLabel-root": {
									color: COLOR_TEXT_SECONDARY,
									"&.Mui-focused": {
										color: COLOR_PRIMARY,
									},
								},
							}}
						/>
					</Grid>

					<Grid item xs={12} sm={6}>
						<TextField
							fullWidth
							label="First Name *"
							value={formData.first_name}
							onChange={(e) => handleInputChange("first_name", e.target.value)}
							sx={{
								"& .MuiOutlinedInput-root": {
									backgroundColor: COLOR_SURFACE,
									color: COLOR_TEXT_PRIMARY,
									"& fieldset": {
										borderColor: "rgba(228, 230, 232, 0.3)",
									},
									"&:hover fieldset": {
										borderColor: COLOR_TEXT_SECONDARY,
									},
									"&.Mui-focused fieldset": {
										borderColor: COLOR_PRIMARY,
									},
								},
								"& .MuiInputLabel-root": {
									color: COLOR_TEXT_SECONDARY,
									"&.Mui-focused": {
										color: COLOR_PRIMARY,
									},
								},
							}}
						/>
					</Grid>

					<Grid item xs={12} sm={6}>
						<TextField
							fullWidth
							label="Last Name *"
							value={formData.last_name}
							onChange={(e) => handleInputChange("last_name", e.target.value)}
							sx={{
								"& .MuiOutlinedInput-root": {
									backgroundColor: COLOR_SURFACE,
									color: COLOR_TEXT_PRIMARY,
									"& fieldset": {
										borderColor: "rgba(228, 230, 232, 0.3)",
									},
									"&:hover fieldset": {
										borderColor: COLOR_TEXT_SECONDARY,
									},
									"&.Mui-focused fieldset": {
										borderColor: COLOR_PRIMARY,
									},
								},
								"& .MuiInputLabel-root": {
									color: COLOR_TEXT_SECONDARY,
									"&.Mui-focused": {
										color: COLOR_PRIMARY,
									},
								},
							}}
						/>
					</Grid>

					<Grid item xs={12} sm={6}>
						<TextField
							fullWidth
							label="Password *"
							type="password"
							value={formData.password}
							onChange={(e) => handleInputChange("password", e.target.value)}
							sx={{
								"& .MuiOutlinedInput-root": {
									backgroundColor: COLOR_SURFACE,
									color: COLOR_TEXT_PRIMARY,
									"& fieldset": {
										borderColor: "rgba(228, 230, 232, 0.3)",
									},
									"&:hover fieldset": {
										borderColor: COLOR_TEXT_SECONDARY,
									},
									"&.Mui-focused fieldset": {
										borderColor: COLOR_PRIMARY,
									},
								},
								"& .MuiInputLabel-root": {
									color: COLOR_TEXT_SECONDARY,
									"&.Mui-focused": {
										color: COLOR_PRIMARY,
									},
								},
							}}
						/>
					</Grid>

					<Grid item xs={12} sm={6}>
						<FormControl
							fullWidth
							sx={{
								"& .MuiOutlinedInput-root": {
									backgroundColor: COLOR_SURFACE,
									color: COLOR_TEXT_PRIMARY,
									"& fieldset": {
										borderColor: "rgba(228, 230, 232, 0.3)",
									},
									"&:hover fieldset": {
										borderColor: COLOR_TEXT_SECONDARY,
									},
									"&.Mui-focused fieldset": {
										borderColor: COLOR_PRIMARY,
									},
								},
								"& .MuiInputLabel-root": {
									color: COLOR_TEXT_SECONDARY,
									"&.Mui-focused": {
										color: COLOR_PRIMARY,
									},
								},
							}}
						>
							<InputLabel>Role</InputLabel>
							<Select
								value={formData.role}
								label="Role"
								onChange={(e) => handleInputChange("role", e.target.value)}
								MenuProps={{
									PaperProps: {
										sx: {
											backgroundColor: COLOR_SURFACE,
											border: `1px solid rgba(228, 230, 232, 0.2)`,
											"& .MuiMenuItem-root": {
												color: COLOR_TEXT_PRIMARY,
												"&:hover": {
													backgroundColor: "rgba(56, 130, 246, 0.1)",
												},
												"&.Mui-selected": {
													backgroundColor: COLOR_PRIMARY,
													color: "#fff",
													"&:hover": {
														backgroundColor: COLOR_PRIMARY,
													},
												},
											},
										},
									},
								}}
							>
								<MenuItem value="client">Client</MenuItem>
								{userRole === "admin" && (
									<>
										<MenuItem value="mechanic">Mechanic</MenuItem>
										<MenuItem value="owner">Owner</MenuItem>
									</>
								)}
							</Select>
						</FormControl>
					</Grid>

					<Grid item xs={12}>
						<Typography
							variant="h6"
							gutterBottom
							sx={{
								mt: 2,
								color: COLOR_TEXT_PRIMARY,
							}}
						>
							Contact Information
						</Typography>
					</Grid>

					<Grid item xs={12} sm={6}>
						<TextField
							fullWidth
							label="Phone"
							value={formData.phone}
							onChange={(e) => handleInputChange("phone", e.target.value)}
							sx={{
								"& .MuiOutlinedInput-root": {
									backgroundColor: COLOR_SURFACE,
									color: COLOR_TEXT_PRIMARY,
									"& fieldset": {
										borderColor: "rgba(228, 230, 232, 0.3)",
									},
									"&:hover fieldset": {
										borderColor: COLOR_TEXT_SECONDARY,
									},
									"&.Mui-focused fieldset": {
										borderColor: COLOR_PRIMARY,
									},
								},
								"& .MuiInputLabel-root": {
									color: COLOR_TEXT_SECONDARY,
									"&.Mui-focused": {
										color: COLOR_PRIMARY,
									},
								},
							}}
						/>
					</Grid>

					<Grid item xs={12} sm={6}>
						<FormControl
							fullWidth
							sx={{
								"& .MuiOutlinedInput-root": {
									backgroundColor: COLOR_SURFACE,
									color: COLOR_TEXT_PRIMARY,
									"& fieldset": {
										borderColor: "rgba(228, 230, 232, 0.3)",
									},
									"&:hover fieldset": {
										borderColor: COLOR_TEXT_SECONDARY,
									},
									"&.Mui-focused fieldset": {
										borderColor: COLOR_PRIMARY,
									},
								},
								"& .MuiInputLabel-root": {
									color: COLOR_TEXT_SECONDARY,
									"&.Mui-focused": {
										color: COLOR_PRIMARY,
									},
								},
							}}
						>
							<InputLabel>Preferred Contact Method</InputLabel>
							<Select
								value={formData.preferred_contact_method}
								label="Preferred Contact Method"
								onChange={(e) =>
									handleInputChange("preferred_contact_method", e.target.value)
								}
								MenuProps={{
									PaperProps: {
										sx: {
											backgroundColor: COLOR_SURFACE,
											border: `1px solid rgba(228, 230, 232, 0.2)`,
											"& .MuiMenuItem-root": {
												color: COLOR_TEXT_PRIMARY,
												"&:hover": {
													backgroundColor: "rgba(56, 130, 246, 0.1)",
												},
												"&.Mui-selected": {
													backgroundColor: COLOR_PRIMARY,
													color: "#fff",
													"&:hover": {
														backgroundColor: COLOR_PRIMARY,
													},
												},
											},
										},
									},
								}}
							>
								<MenuItem value="email">Email</MenuItem>
								<MenuItem value="phone">Phone</MenuItem>
								<MenuItem value="sms">SMS</MenuItem>
							</Select>
						</FormControl>
					</Grid>

					<Grid item xs={12}>
						<TextField
							fullWidth
							label="Address"
							multiline
							rows={2}
							value={formData.address}
							onChange={(e) => handleInputChange("address", e.target.value)}
							sx={{
								"& .MuiOutlinedInput-root": {
									backgroundColor: COLOR_SURFACE,
									color: COLOR_TEXT_PRIMARY,
									"& fieldset": {
										borderColor: "rgba(228, 230, 232, 0.3)",
									},
									"&:hover fieldset": {
										borderColor: COLOR_TEXT_SECONDARY,
									},
									"&.Mui-focused fieldset": {
										borderColor: COLOR_PRIMARY,
									},
								},
								"& .MuiInputLabel-root": {
									color: COLOR_TEXT_SECONDARY,
									"&.Mui-focused": {
										color: COLOR_PRIMARY,
									},
								},
							}}
						/>
					</Grid>
				</Grid>
			</DialogContent>

			<DialogActions
				sx={{
					backgroundColor: COLOR_SURFACE,
					borderTop: `1px solid rgba(228, 230, 232, 0.1)`,
					px: 3,
					py: 2,
				}}
			>
				<Button
					onClick={handleClose}
					disabled={loading}
					sx={{
						color: COLOR_TEXT_SECONDARY,
						"&:hover": {
							backgroundColor: "rgba(156, 163, 175, 0.1)",
							color: COLOR_TEXT_PRIMARY,
						},
						"&:disabled": {
							color: "rgba(156, 163, 175, 0.5)",
						},
					}}
				>
					Cancel
				</Button>
				<Button
					onClick={handleSubmit}
					variant="contained"
					disabled={loading}
					sx={{
						bgcolor: COLOR_PRIMARY,
						color: "#fff",
						"&:hover": {
							bgcolor: "rgba(56, 130, 246, 0.8)",
						},
						"&:disabled": {
							bgcolor: "rgba(56, 130, 246, 0.3)",
							color: "rgba(255, 255, 255, 0.5)",
						},
					}}
				>
					{loading ? (
						<CircularProgress size={20} sx={{ color: "#fff" }} />
					) : (
						"Add Customer"
					)}
				</Button>
			</DialogActions>
		</Dialog>
	);
};

export default AddCustomerModal;
