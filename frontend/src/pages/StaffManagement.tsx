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
	Dialog,
	DialogTitle,
	DialogContent,
	DialogActions,
	TextField,
	Chip,
	Avatar,
	IconButton,
	Menu,
	ListItemIcon,
	ListItemText,
	List,
	ListItem,
	ListItemAvatar,
	ListItemText as MuiListItemText,
	Divider,
} from "@mui/material";
import {
	Add as AddIcon,
	Person as PersonIcon,
	Edit as EditIcon,
	Delete as DeleteIcon,
	MoreVert as MoreVertIcon,
	Email as EmailIcon,
	Phone as PhoneIcon,
	CalendarToday as CalendarIcon,
	KeyboardBackspace as KeyboardBackspaceIcon,
} from "@mui/icons-material";
import Mainlayout from "../components/Mainlayout/Mainlayout";
import {
	COLOR_PRIMARY,
	COLOR_BACKGROUND,
	COLOR_SURFACE,
	COLOR_TEXT_PRIMARY,
	COLOR_TEXT_SECONDARY,
	COLOR_ERROR,
	COLOR_SUCCESS,
	COLOR_WARNING,
} from "../constants";
import AuthContext from "../context/AuthProvider";
import CustomSnackbar, {
	SnackbarState,
} from "../components/Mainlayout/Snackbar";
import { workshopService } from "../api/WorkshopAPIEndpoint";
import { staffService, StaffMember } from "../api/StaffAPIEndpoint";
import WorkshopSelector from "../components/common/WorkshopSelector";

const StaffManagement: React.FC = () => {
	const { auth, isAdmin, isOwner } = useContext(AuthContext);
	const [selectedWorkshopId, setSelectedWorkshopId] = useState<number | null>(
		null
	);
	const [staffMembers, setStaffMembers] = useState<StaffMember[]>([]);
	const [selectedStaff, setSelectedStaff] = useState<StaffMember | null>(null);
	const [loading, setLoading] = useState<boolean>(false);
	const [error, setError] = useState<string | null>(null);
	const [openDialog, setOpenDialog] = useState<boolean>(false);
	const [editingStaff, setEditingStaff] = useState<StaffMember | null>(null);
	const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
	const [snackbar, setSnackbar] = useState<SnackbarState>({
		open: false,
		message: "",
		severity: "success",
	});

	const [formData, setFormData] = useState({
		first_name: "",
		last_name: "",
		email: "",
		phone: "",
		role: "mechanic",
		password: "",
	});

	useEffect(() => {
		const fetchWorkshops = async () => {
			if (isAdmin()) {
				try {
					setLoading(true);
					await workshopService.getAllWorkshops();
					// workshops are used by WorkshopSelector component
				} catch (err) {
					setError("Failed to load workshops. Please try again.");
				} finally {
					setLoading(false);
				}
			} else if (isOwner() && (auth as any).workshop_id) {
				setSelectedWorkshopId((auth as any).workshop_id);
			}
		};

		fetchWorkshops();
	}, [isAdmin, isOwner, auth]);

	useEffect(() => {
		const fetchStaffMembers = async () => {
			if (selectedWorkshopId) {
				try {
					setLoading(true);
					const data = await staffService.getWorkshopStaff(selectedWorkshopId);
					setStaffMembers(data);
				} catch (err) {
					setError("Failed to load staff members. Please try again.");
				} finally {
					setLoading(false);
				}
			}
		};

		fetchStaffMembers();
	}, [selectedWorkshopId]);

	const handleSubmit = async () => {
		try {
			setLoading(true);
			if (editingStaff) {
				// Prevent owner from changing their own role
				if (
					editingStaff.id === auth.user_id &&
					isOwner() &&
					formData.role !== editingStaff.role
				) {
					setSnackbar({
						open: true,
						message: "You cannot change your own role as workshop owner",
						severity: "error",
					});
					setLoading(false);
					return;
				}

				// Validate that new role is allowed based on current user permissions
				if (formData.role === "admin" && !isAdmin()) {
					setSnackbar({
						open: true,
						message: "Only admins can assign admin role",
						severity: "error",
					});
					setLoading(false);
					return;
				}

				await staffService.updateStaff(editingStaff.id, formData);
				setSnackbar({
					open: true,
					message: "Staff member updated successfully!",
					severity: "success",
				});
			} else {
				const newStaffData = {
					...formData,
					workshop_id: selectedWorkshopId!,
				};
				await staffService.createStaff(newStaffData);
				setSnackbar({
					open: true,
					message: "Staff member created successfully!",
					severity: "success",
				});
			}
			handleCloseDialog();
			if (selectedWorkshopId) {
				const data = await staffService.getWorkshopStaff(selectedWorkshopId);
				setStaffMembers(data);
			}
		} catch (err) {
			setSnackbar({
				open: true,
				message: "Failed to save staff member. Please try again.",
				severity: "error",
			});
		} finally {
			setLoading(false);
		}
	};

	const handleDeleteStaff = async () => {
		if (selectedStaff) {
			// Prevent owner from deleting himself
			if (isOwner() && selectedStaff.id === auth.user_id) {
				setSnackbar({
					open: true,
					message: "You cannot delete yourself as the workshop owner!",
					severity: "warning",
				});
				handleMenuClose();
				return;
			}

			// Confirm deletion
			const confirmMessage =
				selectedStaff.role === "owner"
					? "Are you sure you want to delete this workshop owner? This may affect workshop operations."
					: "Are you sure you want to delete this staff member?";

			if (!window.confirm(confirmMessage)) {
				handleMenuClose();
				return;
			}

			try {
				setLoading(true);
				await staffService.deleteStaff(selectedStaff.id);
				setSnackbar({
					open: true,
					message: "Staff member deleted successfully!",
					severity: "success",
				});
				handleMenuClose();
				if (selectedWorkshopId) {
					const data = await staffService.getWorkshopStaff(selectedWorkshopId);
					setStaffMembers(data);
				}
			} catch (err) {
				setSnackbar({
					open: true,
					message: "Failed to delete staff member. Please try again.",
					severity: "error",
				});
			} finally {
				setLoading(false);
			}
		}
	};

	const handleSnackbarClose = () => {
		setSnackbar({ ...snackbar, open: false });
	};

	const handleBackToWorkshops = () => {
		setSelectedWorkshopId(null);
		setSelectedStaff(null);
	};

	const getRoleColor = (role: string) => {
		switch (role.toLowerCase()) {
			case "admin":
				return COLOR_PRIMARY;
			case "owner":
				return COLOR_WARNING;
			case "mechanic":
				return COLOR_SUCCESS;
			default:
				return COLOR_TEXT_SECONDARY;
		}
	};

	const getStatusColor = (status: string) => {
		switch (status) {
			case "working":
				return COLOR_SUCCESS;
			case "vacation":
				return COLOR_WARNING;
			case "sick_leave":
				return COLOR_ERROR;
			case "offline":
				return COLOR_TEXT_SECONDARY;
			default:
				return COLOR_TEXT_SECONDARY;
		}
	};

	const getInitials = (firstName: string, lastName: string) => {
		return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
	};

	const renderStaffList = () => {
		return (
			<Paper
				sx={{
					p: 2,
					height: "600px",
					overflow: "auto",
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
						Staff
					</Typography>
					<Button
						variant="contained"
						size="small"
						startIcon={<AddIcon />}
						onClick={() => handleOpenDialog()}
						sx={{
							bgcolor: COLOR_PRIMARY,
							"&:hover": { bgcolor: `${COLOR_PRIMARY}dd` },
							fontSize: "0.8rem",
						}}
					>
						Add Staff
					</Button>
				</Box>

				{loading ? (
					<Box sx={{ display: "flex", justifyContent: "center", my: 3 }}>
						<CircularProgress sx={{ color: COLOR_PRIMARY }} size={30} />
					</Box>
				) : (
					<List sx={{ p: 0 }}>
						{staffMembers.map((staff) => (
							<React.Fragment key={staff.id}>
								<ListItem
									button
									onClick={() => setSelectedStaff(staff)}
									sx={{
										border: selectedStaff?.id === staff.id ? 2 : 1,
										borderColor:
											selectedStaff?.id === staff.id
												? COLOR_PRIMARY
												: `${COLOR_TEXT_SECONDARY}40`,
										borderRadius: 1,
										mb: 1,
										bgcolor:
											selectedStaff?.id === staff.id
												? `${COLOR_PRIMARY}20`
												: COLOR_SURFACE,
										"&:hover": {
											bgcolor: `${COLOR_PRIMARY}10`,
											borderColor: COLOR_PRIMARY,
										},
									}}
								>
									<ListItemAvatar>
										<Avatar
											sx={{
												bgcolor: getRoleColor(staff.role),
												width: 40,
												height: 40,
												color: "white",
											}}
										>
											{getInitials(staff.first_name, staff.last_name)}
										</Avatar>
									</ListItemAvatar>
									<MuiListItemText
										primary={
											<Box
												sx={{
													display: "flex",
													alignItems: "center",
													gap: 1,
												}}
											>
												<Typography
													variant="subtitle2"
													fontWeight="bold"
													sx={{ color: COLOR_TEXT_PRIMARY }}
												>
													{staff.first_name} {staff.last_name}
												</Typography>
												<Chip
													label={staff.role}
													size="small"
													sx={{
														bgcolor: getRoleColor(staff.role),
														color: "white",
														fontSize: "0.7rem",
														height: "20px",
													}}
												/>
											</Box>
										}
										secondary={
											<Box>
												<Typography
													variant="body2"
													sx={{
														color: COLOR_TEXT_SECONDARY,
														fontSize: "0.8rem",
													}}
												>
													{staff.email}
												</Typography>
												<Typography
													variant="body2"
													sx={{
														color: COLOR_TEXT_SECONDARY,
														fontSize: "0.75rem",
													}}
												>
													Joined From{" "}
													{staff.created_at &&
													!isNaN(new Date(staff.created_at).getTime())
														? new Date(staff.created_at).toLocaleDateString()
														: "Not Available"}
												</Typography>
											</Box>
										}
									/>
									<Box
										sx={{
											display: "flex",
											flexDirection: "column",
											alignItems: "flex-end",
										}}
									>
										<Chip
											label={staff.current_status || "offline"}
											size="small"
											sx={{
												bgcolor: getStatusColor(
													staff.current_status || "offline"
												),
												color: "white",
												fontSize: "0.65rem",
												height: "18px",
												mb: 0.5,
											}}
										/>
										<IconButton
											size="small"
											onClick={(e) => {
												e.stopPropagation();
												handleMenuClick(e, staff);
											}}
											sx={{
												color: COLOR_TEXT_SECONDARY,
												"&:hover": {
													color: COLOR_PRIMARY,
													backgroundColor: `${COLOR_PRIMARY}10`,
												},
											}}
										>
											<MoreVertIcon fontSize="small" />
										</IconButton>
									</Box>
								</ListItem>
							</React.Fragment>
						))}
					</List>
				)}
			</Paper>
		);
	};

	const renderStaffDetails = () => {
		if (!selectedStaff) {
			return (
				<Paper
					sx={{
						p: 3,
						height: "600px",
						display: "flex",
						alignItems: "center",
						justifyContent: "center",
						backgroundColor: COLOR_SURFACE,
						color: COLOR_TEXT_PRIMARY,
					}}
				>
					<Box sx={{ textAlign: "center" }}>
						<PersonIcon
							sx={{ fontSize: 60, color: COLOR_TEXT_SECONDARY, mb: 2 }}
						/>
						<Typography variant="h6" sx={{ color: COLOR_TEXT_SECONDARY }}>
							Select a staff member to view details
						</Typography>
					</Box>
				</Paper>
			);
		}

		const employmentStartDate = new Date(
			selectedStaff.hired_date || selectedStaff.created_at
		);

		const currentDate = new Date();
		const employmentDays = Math.floor(
			(currentDate.getTime() - employmentStartDate.getTime()) /
				(1000 * 60 * 60 * 24)
		);

		const isValidEmploymentDays = !isNaN(employmentDays) && employmentDays >= 0;
		const displayEmploymentDays = isValidEmploymentDays ? employmentDays : 0;

		return (
			<Paper
				sx={{
					p: 3,
					height: "600px",
					overflow: "auto",
					backgroundColor: COLOR_SURFACE,
					color: COLOR_TEXT_PRIMARY,
				}}
			>
				<Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
					<Avatar
						sx={{
							bgcolor: getRoleColor(selectedStaff.role),
							width: 80,
							height: 80,
							mr: 3,
							color: "white",
						}}
					>
						{getInitials(selectedStaff.first_name, selectedStaff.last_name)}
					</Avatar>
					<Box sx={{ flex: 1 }}>
						<Typography
							variant="h5"
							fontWeight="bold"
							sx={{ color: COLOR_TEXT_PRIMARY }}
						>
							{selectedStaff.first_name} {selectedStaff.last_name}
						</Typography>
						<Box sx={{ display: "flex", gap: 1, mt: 1 }}>
							<Chip
								label={selectedStaff.role}
								sx={{
									bgcolor: getRoleColor(selectedStaff.role),
									color: "white",
								}}
							/>
							{selectedStaff.role !== "owner" && (
								<Chip
									label={`${displayEmploymentDays} days employed`}
									sx={{
										bgcolor: COLOR_PRIMARY,
										color: "white",
									}}
								/>
							)}
						</Box>
					</Box>
				</Box>

				<Divider sx={{ mb: 3, borderColor: `${COLOR_TEXT_SECONDARY}40` }} />

				<Box sx={{ mb: 3 }}>
					<Typography
						variant="h6"
						fontWeight="bold"
						sx={{ mb: 2, color: COLOR_TEXT_PRIMARY }}
					>
						Contact Information
					</Typography>
					<Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
						<EmailIcon sx={{ mr: 2, color: COLOR_TEXT_SECONDARY }} />
						<Typography component="span" sx={{ color: COLOR_TEXT_PRIMARY }}>
							{selectedStaff.email}
						</Typography>
					</Box>
					{selectedStaff.phone && (
						<Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
							<PhoneIcon sx={{ mr: 2, color: COLOR_TEXT_SECONDARY }} />
							<Typography component="span" sx={{ color: COLOR_TEXT_PRIMARY }}>
								{selectedStaff.phone}
							</Typography>
						</Box>
					)}
					<Box sx={{ display: "flex", alignItems: "center" }}>
						<CalendarIcon sx={{ mr: 2, color: COLOR_TEXT_SECONDARY }} />
						<Typography component="span" sx={{ color: COLOR_TEXT_PRIMARY }}>
							Hired{" "}
							{formatDate(selectedStaff.hired_date || selectedStaff.created_at)}
							{selectedStaff.role !== "owner" &&
								isValidEmploymentDays &&
								` (${displayEmploymentDays} days ago)`}
						</Typography>
					</Box>
				</Box>

				<Divider sx={{ mb: 3, borderColor: `${COLOR_TEXT_SECONDARY}40` }} />

				<Box>
					<Typography
						variant="h6"
						fontWeight="bold"
						sx={{ mb: 2, color: COLOR_TEXT_PRIMARY }}
					>
						Performance
					</Typography>
					<Box sx={{ textAlign: "center" }}>
						<Box
							sx={{
								position: "relative",
								display: "inline-flex",
								alignItems: "center",
								justifyContent: "center",
								width: 120,
								height: 120,
								borderRadius: "50%",
								background: `conic-gradient(${COLOR_PRIMARY} 0deg ${
									(selectedStaff.performance_score || 0) * 3.6
								}deg, ${COLOR_BACKGROUND} ${
									(selectedStaff.performance_score || 0) * 3.6
								}deg 360deg)`,
								mb: 2,
							}}
						>
							<Box
								sx={{
									width: 80,
									height: 80,
									borderRadius: "50%",
									bgcolor: COLOR_SURFACE,
									display: "flex",
									alignItems: "center",
									justifyContent: "center",
									flexDirection: "column",
								}}
							>
								<Typography
									variant="h6"
									fontWeight="bold"
									component="div"
									sx={{ color: COLOR_TEXT_PRIMARY }}
								>
									{selectedStaff.performance_score || 0}%
								</Typography>
								<Typography
									variant="caption"
									component="div"
									sx={{ color: COLOR_TEXT_SECONDARY }}
								>
									Services
								</Typography>
							</Box>
						</Box>

						<Box
							sx={{ display: "flex", justifyContent: "space-around", mt: 2 }}
						>
							<Box sx={{ textAlign: "center" }}>
								<Typography
									variant="h6"
									fontWeight="bold"
									component="div"
									sx={{ color: COLOR_TEXT_PRIMARY }}
								>
									{selectedStaff.days_worked || 0}
								</Typography>
								<Typography
									variant="caption"
									component="div"
									sx={{ color: COLOR_TEXT_SECONDARY }}
								>
									Days Worked
								</Typography>
							</Box>
							<Box sx={{ textAlign: "center" }}>
								<Typography
									variant="h6"
									fontWeight="bold"
									component="div"
									sx={{ color: COLOR_TEXT_PRIMARY }}
								>
									{selectedStaff.vacation_days_left || 0}
								</Typography>
								<Typography
									variant="caption"
									component="div"
									sx={{ color: COLOR_TEXT_SECONDARY }}
								>
									Vacation Days
								</Typography>
							</Box>
							<Box sx={{ textAlign: "center" }}>
								<Typography
									variant="h6"
									fontWeight="bold"
									component="div"
									sx={{ color: COLOR_TEXT_PRIMARY }}
								>
									{displayEmploymentDays}
								</Typography>
								<Typography
									variant="caption"
									component="div"
									sx={{ color: COLOR_TEXT_SECONDARY }}
								>
									Days Employed
								</Typography>
							</Box>
						</Box>
					</Box>
				</Box>
			</Paper>
		);
	};

	const renderWorkshopSelection = () => {
		return (
			<WorkshopSelector
				value={selectedWorkshopId}
				onChange={(workshopId) => {
					setSelectedWorkshopId(workshopId);
					setSelectedStaff(null);
				}}
				disabled={loading}
			/>
		);
	};

	const renderMainContent = () => {
		if (loading && !selectedWorkshopId) {
			return (
				<Box sx={{ display: "flex", justifyContent: "center", my: 4 }}>
					<CircularProgress color="error" />
				</Box>
			);
		}

		if (isAdmin() && !selectedWorkshopId) {
			return renderWorkshopSelection();
		}

		if (selectedWorkshopId || isOwner()) {
			return (
				<Grid container spacing={3}>
					<Grid item xs={12} md={5}>
						{renderStaffList()}
					</Grid>
					<Grid item xs={12} md={7}>
						{renderStaffDetails()}
					</Grid>
				</Grid>
			);
		}

		return (
			<Paper
				sx={{
					p: 4,
					textAlign: "center",
					backgroundColor: COLOR_SURFACE,
					color: COLOR_TEXT_PRIMARY,
				}}
			>
				<Typography variant="h6" sx={{ color: COLOR_TEXT_SECONDARY }}>
					No workshop assigned. Please contact your administrator.
				</Typography>
			</Paper>
		);
	};

	const handleOpenDialog = (staff?: StaffMember) => {
		if (staff) {
			setEditingStaff(staff);
			setFormData({
				first_name: staff.first_name,
				last_name: staff.last_name,
				email: staff.email,
				phone: staff.phone || "",
				role: staff.role,
				password: "",
			});
		} else {
			setEditingStaff(null);
			setFormData({
				first_name: "",
				last_name: "",
				email: "",
				phone: "",
				role: "mechanic",
				password: "",
			});
		}
		setOpenDialog(true);
	};

	const handleCloseDialog = () => {
		setOpenDialog(false);
		setEditingStaff(null);
		setFormData({
			first_name: "",
			last_name: "",
			email: "",
			phone: "",
			role: "mechanic",
			password: "",
		});
	};

	const handleFormChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		const { name, value } = event.target;
		setFormData((prev) => ({
			...prev,
			[name]: value,
		}));
	};

	const handleMenuClick = (
		event: React.MouseEvent<HTMLElement>,
		staff: StaffMember
	) => {
		setAnchorEl(event.currentTarget);
		setSelectedStaff(staff);
	};

	const handleMenuClose = () => {
		setAnchorEl(null);
		setSelectedStaff(null);
	};

	const formatDate = (dateString: string | null | undefined): string => {
		if (!dateString) return "Not Available";
		const date = new Date(dateString);
		return isNaN(date.getTime()) ? "Not Available" : date.toLocaleDateString();
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
						<Box
							sx={{
								display: "flex",
								justifyContent: "space-between",
								alignItems: "center",
								mb: 3,
							}}
						>
							<Typography
								variant="h4"
								fontWeight="bold"
								sx={{ color: COLOR_TEXT_PRIMARY }}
							>
								Staff Management
							</Typography>

							{isAdmin() && selectedWorkshopId && (
								<Button
									variant="outlined"
									startIcon={<KeyboardBackspaceIcon />}
									onClick={handleBackToWorkshops}
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
							)}
						</Box>

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

					<Dialog
						open={openDialog}
						onClose={handleCloseDialog}
						maxWidth="sm"
						fullWidth
						PaperProps={{
							sx: {
								backgroundColor: COLOR_SURFACE,
								color: COLOR_TEXT_PRIMARY,
							},
						}}
					>
						<DialogTitle sx={{ color: COLOR_TEXT_PRIMARY }}>
							{editingStaff ? "Edit Staff Member" : "Add New Staff Member"}
						</DialogTitle>
						<DialogContent>
							<Box
								sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}
							>
								<TextField
									name="first_name"
									label="First Name"
									value={formData.first_name}
									onChange={handleFormChange}
									fullWidth
									required
									sx={{
										"& .MuiOutlinedInput-root": {
											color: COLOR_TEXT_PRIMARY,
											backgroundColor: COLOR_SURFACE,
											"& fieldset": {
												borderColor: `${COLOR_TEXT_SECONDARY}60`,
											},
											"&:hover fieldset": {
												borderColor: COLOR_PRIMARY,
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
								<TextField
									name="last_name"
									label="Last Name"
									value={formData.last_name}
									onChange={handleFormChange}
									fullWidth
									required
									sx={{
										"& .MuiOutlinedInput-root": {
											color: COLOR_TEXT_PRIMARY,
											backgroundColor: COLOR_SURFACE,
											"& fieldset": {
												borderColor: `${COLOR_TEXT_SECONDARY}60`,
											},
											"&:hover fieldset": {
												borderColor: COLOR_PRIMARY,
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
								<TextField
									name="email"
									label="Email"
									type="email"
									value={formData.email}
									onChange={handleFormChange}
									fullWidth
									required
									sx={{
										"& .MuiOutlinedInput-root": {
											color: COLOR_TEXT_PRIMARY,
											backgroundColor: COLOR_SURFACE,
											"& fieldset": {
												borderColor: `${COLOR_TEXT_SECONDARY}60`,
											},
											"&:hover fieldset": {
												borderColor: COLOR_PRIMARY,
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
								<TextField
									name="phone"
									label="Phone"
									value={formData.phone}
									onChange={handleFormChange}
									fullWidth
									sx={{
										"& .MuiOutlinedInput-root": {
											color: COLOR_TEXT_PRIMARY,
											backgroundColor: COLOR_SURFACE,
											"& fieldset": {
												borderColor: `${COLOR_TEXT_SECONDARY}60`,
											},
											"&:hover fieldset": {
												borderColor: COLOR_PRIMARY,
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
								<FormControl fullWidth>
									<InputLabel
										id="role-select-label"
										sx={{
											color: COLOR_TEXT_SECONDARY,
											"&.Mui-focused": {
												color: COLOR_PRIMARY,
											},
										}}
									>
										Role
									</InputLabel>
									<Select
										labelId="role-select-label"
										name="role"
										value={formData.role}
										label="Role"
										disabled={editingStaff?.id === auth.user_id && isOwner()}
										onChange={(e) =>
											setFormData((prev) => ({ ...prev, role: e.target.value }))
										}
										sx={{
											color: COLOR_TEXT_PRIMARY,
											backgroundColor: COLOR_SURFACE,
											"& .MuiOutlinedInput-notchedOutline": {
												borderColor: `${COLOR_TEXT_SECONDARY}60`,
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
										<MenuItem value="mechanic">Mechanic</MenuItem>
										<MenuItem value="owner">Owner</MenuItem>
										{isAdmin() && <MenuItem value="admin">Admin</MenuItem>}
									</Select>
									{editingStaff?.id === auth.user_id && isOwner() && (
										<Typography
											variant="caption"
											sx={{
												color: COLOR_TEXT_SECONDARY,
												mt: 0.5,
												fontSize: "0.7rem",
											}}
										>
											You cannot change your own role as workshop owner
										</Typography>
									)}
								</FormControl>
								{!editingStaff && (
									<TextField
										name="password"
										label="Password"
										type="password"
										value={formData.password}
										onChange={handleFormChange}
										fullWidth
										required
										sx={{
											"& .MuiOutlinedInput-root": {
												color: COLOR_TEXT_PRIMARY,
												backgroundColor: COLOR_SURFACE,
												"& fieldset": {
													borderColor: `${COLOR_TEXT_SECONDARY}60`,
												},
												"&:hover fieldset": {
													borderColor: COLOR_PRIMARY,
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
								)}
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
								onClick={handleSubmit}
								variant="contained"
								disabled={loading}
								sx={{
									bgcolor: COLOR_PRIMARY,
									"&:hover": { bgcolor: `${COLOR_PRIMARY}dd` },
								}}
							>
								{editingStaff ? "Update" : "Create"}
							</Button>
						</DialogActions>
					</Dialog>

					<Menu
						anchorEl={anchorEl}
						open={Boolean(anchorEl)}
						onClose={handleMenuClose}
						PaperProps={{
							sx: {
								backgroundColor: COLOR_SURFACE,
								color: COLOR_TEXT_PRIMARY,
							},
						}}
					>
						<MenuItem
							onClick={() => {
								handleOpenDialog(selectedStaff!);
								handleMenuClose();
							}}
							sx={{
								color: COLOR_TEXT_PRIMARY,
								"&:hover": {
									backgroundColor: `${COLOR_PRIMARY}20`,
								},
							}}
						>
							<ListItemIcon>
								<EditIcon fontSize="small" sx={{ color: COLOR_PRIMARY }} />
							</ListItemIcon>
							<ListItemText>Edit</ListItemText>
						</MenuItem>

						{/* Only show delete option if user is not trying to delete himself */}
						{!(isOwner() && selectedStaff?.id === auth.user_id) && (
							<MenuItem
								onClick={handleDeleteStaff}
								sx={{
									color: COLOR_ERROR,
									"&:hover": {
										backgroundColor: `${COLOR_ERROR}20`,
									},
								}}
							>
								<ListItemIcon>
									<DeleteIcon fontSize="small" sx={{ color: COLOR_ERROR }} />
								</ListItemIcon>
								<ListItemText>Delete</ListItemText>
							</MenuItem>
						)}
					</Menu>

					<CustomSnackbar
						snackbarState={snackbar}
						onClose={handleSnackbarClose}
					/>
				</Container>
			</Box>
		</Mainlayout>
	);
};

export default StaffManagement;
