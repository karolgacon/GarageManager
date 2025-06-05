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
	Card,
	CardContent,
	Chip,
	Avatar,
	IconButton,
	Menu,
	ListItemIcon,
	ListItemText,
	Badge,
	Tooltip,
	LinearProgress,
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
	Work as WorkIcon,
	CalendarToday as CalendarIcon,
	Schedule as ScheduleIcon,
	BeachAccess as VacationIcon,
	TrendingUp as TrendingUpIcon,
} from "@mui/icons-material";
import Mainlayout from "../components/Mainlayout/Mainlayout";
import AuthContext from "../context/AuthProvider";
import CustomSnackbar, {
	SnackbarState,
} from "../components/Mainlayout/Snackbar";
import { workshopService } from "../api/WorkshopAPIEndpoint";
import { staffService, StaffMember } from "../api/StaffAPIEndpoint";
import { Workshop } from "../models/WorkshopModel";
import WorkshopSelector from "../components/Common/WorkshopSelector";

const StaffManagement: React.FC = () => {
	const { auth, isAdmin, isOwner } = useContext(AuthContext);
	const [selectedWorkshopId, setSelectedWorkshopId] = useState<number | null>(
		null
	);
	const [workshops, setWorkshops] = useState<Workshop[]>([]);
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
					const data = await workshopService.getAllWorkshops();
					setWorkshops(data);
				} catch (err) {
					setError("Failed to load workshops. Please try again.");
				} finally {
					setLoading(false);
				}
			} else if (isOwner() && auth.workshop_id) {
				setSelectedWorkshopId(auth.workshop_id);
			}
		};

		fetchWorkshops();
	}, [isAdmin, isOwner, auth.workshop_id]);

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

	const getRoleColor = (role: string) => {
		switch (role.toLowerCase()) {
			case "admin":
				return "#FF3E55";
			case "owner":
				return "#FF9800";
			case "mechanic":
				return "#2196F3";
			default:
				return "#9E9E9E";
		}
	};

	const getStatusColor = (status: string) => {
		switch (status) {
			case "working":
				return "#4CAF50";
			case "vacation":
				return "#FF9800";
			case "sick_leave":
				return "#F44336";
			case "offline":
				return "#9E9E9E";
			default:
				return "#9E9E9E";
		}
	};

	const getInitials = (firstName: string, lastName: string) => {
		return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
	};

	const renderStaffList = () => {
		return (
			<Paper sx={{ p: 2, height: "600px", overflow: "auto" }}>
				<Box
					sx={{
						display: "flex",
						justifyContent: "space-between",
						alignItems: "center",
						mb: 2,
					}}
				>
					<Typography variant="h6" fontWeight="bold">
						Staff
					</Typography>
					<Button
						variant="contained"
						size="small"
						startIcon={<AddIcon />}
						onClick={() => handleOpenDialog()}
						sx={{
							bgcolor: "#FF3E55",
							"&:hover": { bgcolor: "#E02A45" },
							fontSize: "0.8rem",
						}}
					>
						Add Staff
					</Button>
				</Box>

				{loading ? (
					<Box sx={{ display: "flex", justifyContent: "center", my: 3 }}>
						<CircularProgress color="error" size={30} />
					</Box>
				) : (
					<List sx={{ p: 0 }}>
						{staffMembers.map((staff, index) => (
							<React.Fragment key={staff.id}>
								<ListItem
									button
									onClick={() => setSelectedStaff(staff)}
									sx={{
										border: selectedStaff?.id === staff.id ? 2 : 1,
										borderColor:
											selectedStaff?.id === staff.id ? "#FF3E55" : "#e0e0e0",
										borderRadius: 1,
										mb: 1,
										bgcolor:
											selectedStaff?.id === staff.id ? "#fff5f5" : "white",
										"&:hover": {
											bgcolor: "#f9f9f9",
											borderColor: "#FF3E55",
										},
									}}
								>
									<ListItemAvatar>
										<Avatar
											sx={{
												bgcolor: getRoleColor(staff.role),
												width: 40,
												height: 40,
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
												<Typography variant="subtitle2" fontWeight="bold">
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
													color="text.secondary"
													fontSize="0.8rem"
												>
													{staff.email}
												</Typography>
												<Typography
													variant="body2"
													color="text.secondary"
													fontSize="0.75rem"
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
					}}
				>
					<Box sx={{ textAlign: "center" }}>
						<PersonIcon sx={{ fontSize: 60, color: "#e0e0e0", mb: 2 }} />
						<Typography variant="h6" color="text.secondary">
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
			<Paper sx={{ p: 3, height: "600px", overflow: "auto" }}>
				<Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
					<Avatar
						sx={{
							bgcolor: getRoleColor(selectedStaff.role),
							width: 80,
							height: 80,
							mr: 3,
						}}
					>
						{getInitials(selectedStaff.first_name, selectedStaff.last_name)}
					</Avatar>
					<Box sx={{ flex: 1 }}>
						<Typography variant="h5" fontWeight="bold">
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
										bgcolor: "#2196F3",
										color: "white",
									}}
								/>
							)}
						</Box>
					</Box>
				</Box>

				<Divider sx={{ mb: 3 }} />

				<Box sx={{ mb: 3 }}>
					<Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
						Contact Information
					</Typography>
					<Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
						<EmailIcon sx={{ mr: 2, color: "#9E9E9E" }} />
						<Typography component="span">{selectedStaff.email}</Typography>
					</Box>
					{selectedStaff.phone && (
						<Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
							<PhoneIcon sx={{ mr: 2, color: "#9E9E9E" }} />
							<Typography component="span">{selectedStaff.phone}</Typography>
						</Box>
					)}
					<Box sx={{ display: "flex", alignItems: "center" }}>
						<CalendarIcon sx={{ mr: 2, color: "#9E9E9E" }} />
						<Typography component="span">
							Hired{" "}
							{formatDate(selectedStaff.hired_date || selectedStaff.created_at)}
							{selectedStaff.role !== "owner" &&
								isValidEmploymentDays &&
								` (${displayEmploymentDays} days ago)`}
						</Typography>
					</Box>
				</Box>

				<Divider sx={{ mb: 3 }} />

				<Box>
					<Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
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
								background: `conic-gradient(#FF3E55 0deg ${
									(selectedStaff.performance_score || 0) * 3.6
								}deg, #f5f5f5 ${
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
									bgcolor: "white",
									display: "flex",
									alignItems: "center",
									justifyContent: "center",
									flexDirection: "column",
								}}
							>
								<Typography variant="h6" fontWeight="bold" component="div">
									{selectedStaff.performance_score || 0}%
								</Typography>
								<Typography
									variant="caption"
									color="text.secondary"
									component="div"
								>
									Services
								</Typography>
							</Box>
						</Box>

						<Box
							sx={{ display: "flex", justifyContent: "space-around", mt: 2 }}
						>
							<Box sx={{ textAlign: "center" }}>
								<Typography variant="h6" fontWeight="bold" component="div">
									{selectedStaff.days_worked || 0}
								</Typography>
								<Typography
									variant="caption"
									color="text.secondary"
									component="div"
								>
									Days Worked
								</Typography>
							</Box>
							<Box sx={{ textAlign: "center" }}>
								<Typography variant="h6" fontWeight="bold" component="div">
									{selectedStaff.vacation_days_left || 0}
								</Typography>
								<Typography
									variant="caption"
									color="text.secondary"
									component="div"
								>
									Vacation Days
								</Typography>
							</Box>
							<Box sx={{ textAlign: "center" }}>
								<Typography variant="h6" fontWeight="bold" component="div">
									{displayEmploymentDays}
								</Typography>
								<Typography
									variant="caption"
									color="text.secondary"
									component="div"
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
			<Paper sx={{ p: 4, textAlign: "center" }}>
				<Typography variant="h6" color="text.secondary">
					No workshop assigned. Please contact your administrator.
				</Typography>
			</Paper>
		);
	};

	const handleWorkshopChange = (event: any) => {
		setSelectedWorkshopId(event.target.value as number);
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

	const formatDate = (dateString) => {
		if (!dateString) return "Not Available";
		const date = new Date(dateString);
		return isNaN(date.getTime()) ? "Not Available" : date.toLocaleDateString();
	};

	return (
		<Mainlayout>
			<Container maxWidth="lg">
				<Box sx={{ py: 3 }}>
					<Typography variant="h4" fontWeight="bold" sx={{ mb: 3 }}>
						Staff Management
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

				<Dialog
					open={openDialog}
					onClose={handleCloseDialog}
					maxWidth="sm"
					fullWidth
				>
					<DialogTitle>
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
							/>
							<TextField
								name="last_name"
								label="Last Name"
								value={formData.last_name}
								onChange={handleFormChange}
								fullWidth
								required
							/>
							<TextField
								name="email"
								label="Email"
								type="email"
								value={formData.email}
								onChange={handleFormChange}
								fullWidth
								required
							/>
							<TextField
								name="phone"
								label="Phone"
								value={formData.phone}
								onChange={handleFormChange}
								fullWidth
							/>
							<FormControl fullWidth>
								<InputLabel id="role-select-label">Role</InputLabel>
								<Select
									labelId="role-select-label"
									name="role"
									value={formData.role}
									label="Role"
									onChange={(e) =>
										setFormData((prev) => ({ ...prev, role: e.target.value }))
									}
								>
									<MenuItem value="mechanic">Mechanic</MenuItem>
									<MenuItem value="owner">Owner</MenuItem>
									{isAdmin() && <MenuItem value="admin">Admin</MenuItem>}
								</Select>
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
								/>
							)}
						</Box>
					</DialogContent>
					<DialogActions>
						<Button onClick={handleCloseDialog}>Cancel</Button>
						<Button
							onClick={handleSubmit}
							variant="contained"
							color="error"
							disabled={loading}
							sx={{
								bgcolor: "#FF3E55",
								"&:hover": { bgcolor: "#E02A45" },
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
				>
					<MenuItem
						onClick={() => {
							handleOpenDialog(selectedStaff!);
							handleMenuClose();
						}}
					>
						<ListItemIcon>
							<EditIcon fontSize="small" />
						</ListItemIcon>
						<ListItemText>Edit</ListItemText>
					</MenuItem>
					<MenuItem onClick={handleDeleteStaff} sx={{ color: "#FF3E55" }}>
						<ListItemIcon>
							<DeleteIcon fontSize="small" sx={{ color: "#FF3E55" }} />
						</ListItemIcon>
						<ListItemText>Delete</ListItemText>
					</MenuItem>
				</Menu>

				<CustomSnackbar
					snackbarState={snackbar}
					onClose={handleSnackbarClose}
				/>
			</Container>
		</Mainlayout>
	);
};

export default StaffManagement;
