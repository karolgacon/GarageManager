import React, { useState, useEffect } from "react";
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

interface EditCustomerModalProps {
	open: boolean;
	onClose: () => void;
	customer: Customer | null;
	onCustomerUpdated: (customer: Customer) => void;
	userRole?: string;
	currentWorkshopId?: number | null;
}

const EditCustomerModal: React.FC<EditCustomerModalProps> = ({
	open,
	onClose,
	customer,
	onCustomerUpdated,
	userRole,
	currentWorkshopId,
}) => {
	const [formData, setFormData] = useState({
		username: "",
		email: "",
		first_name: "",
		last_name: "",
		role: "client",
		status: "active",
		phone: "",
		address: "",
		preferred_contact_method: "email",
	});

	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		if (customer) {
			setFormData({
				username: customer.username || "",
				email: customer.email || "",
				first_name: customer.first_name || "",
				last_name: customer.last_name || "",
				role: customer.role || "client",
				status: customer.status || "active",
				phone: customer.profile?.phone || "",
				address: customer.profile?.address || "",
				preferred_contact_method:
					customer.profile?.preferred_contact_method || "email",
			});
		}
	}, [customer]);

	const handleInputChange = (field: string, value: string) => {
		setFormData((prev) => ({ ...prev, [field]: value }));
		if (error) setError(null);
	};

	const handleSubmit = async () => {
		if (!customer) return;

		try {
			setLoading(true);
			setError(null);

			if (
				!formData.username ||
				!formData.email ||
				!formData.first_name ||
				!formData.last_name
			) {
				setError("Please fill in all required fields");
				return;
			}

			const updateData = {
				username: formData.username,
				email: formData.email,
				first_name: formData.first_name,
				last_name: formData.last_name,
				role: formData.role,
				status: formData.status,
				profile: {
					...customer.profile,
					phone: formData.phone,
					address: formData.address,
					preferred_contact_method: formData.preferred_contact_method,
				},
			};

			const updatedCustomer = await customerService.updateCustomer(
				customer.id,
				updateData
			);
			onCustomerUpdated(updatedCustomer);
			handleClose();
		} catch (err: any) {
			setError(err.response?.data?.message || "Failed to update customer");
		} finally {
			setLoading(false);
		}
	};

	const handleClose = () => {
		setError(null);
		onClose();
	};

	if (!customer) return null;

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
					Edit Customer
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
								disabled={userRole !== "admin"}
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
												"&.Mui-disabled": {
													color: COLOR_TEXT_SECONDARY,
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
									"&.Mui-disabled": {
										backgroundColor: "rgba(26, 29, 35, 0.5)",
										color: COLOR_TEXT_SECONDARY,
									},
								},
								"& .MuiInputLabel-root": {
									color: COLOR_TEXT_SECONDARY,
									"&.Mui-focused": {
										color: COLOR_PRIMARY,
									},
									"&.Mui-disabled": {
										color: COLOR_TEXT_SECONDARY,
									},
								},
							}}
						>
							<InputLabel>Status</InputLabel>
							<Select
								value={formData.status}
								label="Status"
								onChange={(e) => handleInputChange("status", e.target.value)}
								disabled={userRole === "mechanic"}
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
								<MenuItem value="active">Active</MenuItem>
								<MenuItem value="blocked">Blocked</MenuItem>
								<MenuItem value="suspended">Suspended</MenuItem>
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
						"Update Customer"
					)}
				</Button>
			</DialogActions>
		</Dialog>
	);
};

export default EditCustomerModal;
