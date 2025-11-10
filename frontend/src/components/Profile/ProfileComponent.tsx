import React, { useState, useEffect, useContext } from "react";
import {
	Box,
	Typography,
	Button,
	Paper,
	TextField,
	Dialog,
	DialogTitle,
	DialogContent,
	DialogActions,
	FormControl,
	InputLabel,
	Select,
	MenuItem,
	Avatar,
	CircularProgress,
	Alert,
	Divider,
	Container,
} from "@mui/material";
import {
	Person as PersonIcon,
	Edit as EditIcon,
	Delete as DeleteIcon,
	Star as StarIcon,
	Phone as PhoneIcon,
	Email as EmailIcon,
	LocationOn as LocationIcon,
} from "@mui/icons-material";
import { Profile } from "../../models/ProfileModel";
import { ProfileService } from "../../api/ProfileAPIEndpoint";
import { LoyaltyService, LoyaltyPoints } from "../../api/LoyaltyAPIEndpoint";
import CustomSnackbar, { SnackbarState } from "../Mainlayout/Snackbar";
import {
	COLOR_PRIMARY,
	COLOR_BACKGROUND,
	COLOR_SURFACE,
	COLOR_TEXT_PRIMARY,
	COLOR_TEXT_SECONDARY,
	COLOR_ERROR,
	COLOR_SUCCESS,
	COLOR_WARNING,
} from "../../constants";
import AuthContext from "../../context/AuthProvider";

const ProfileComponent: React.FC = () => {
	const [profile, setProfile] = useState<Profile | null>(null);
	const [loading, setLoading] = useState<boolean>(true);
	const [error, setError] = useState<string | null>(null);
	const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
	const [modalMode, setModalMode] = useState<"create" | "edit">("edit");
	const [formData, setFormData] = useState<Profile>({
		id: 0,
		user: 0,
		address: "",
		phone: "",
		photo: "",
		preferred_contact_method: "email",
	});
	const [snackbarState, setSnackbarState] = useState<SnackbarState>({
		open: false,
		message: "",
		severity: "success",
	});
	const [loyaltyPoints, setLoyaltyPoints] = useState<LoyaltyPoints | null>(
		null
	);
	const [loyaltyLoading, setLoyaltyLoading] = useState<boolean>(false);
	const [loyaltyError, setLoyaltyError] = useState<string | null>(null);
	const [isLoyaltyModalOpen, setIsLoyaltyModalOpen] = useState<boolean>(false);
	const [loyaltyFormData, setLoyaltyFormData] = useState<
		Partial<LoyaltyPoints>
	>({
		total_points: 0,
		membership_level: "bronze",
	});
	const [pointsToAdd, setPointsToAdd] = useState<number>(0);
	const { auth } = useContext(AuthContext);

	const showSnackbar = (
		message: string,
		severity: "success" | "error" | "warning" | "info"
	) => {
		setSnackbarState({ open: true, message, severity });
	};

	const handleSnackbarClose = () => {
		setSnackbarState((prev) => ({ ...prev, open: false }));
	};

	useEffect(() => {
		fetchProfile();

		if (
			auth.roles &&
			(auth.roles.includes("admin") || auth.roles.includes("client"))
		) {
			fetchLoyaltyPoints();
		}
	}, [auth.roles]);

	const fetchProfile = async () => {
		try {
			setLoading(true);
			const userId = localStorage.getItem("userID");
			if (!userId) {
				setError(
					"Nie znaleziono identyfikatora użytkownika. Zaloguj się ponownie."
				);
				return;
			}

			const profileData = await ProfileService.getProfile(userId);
			setProfile(profileData);
			setFormData({
				id: profileData.id || "",
				user: profileData.user || "",
				address: profileData.address || "",
				phone: profileData.phone || "",
				photo: profileData.photo || "",
				preferred_contact_method:
					profileData.preferred_contact_method || "email",
			});
			setError(null);
		} catch (err: any) {
			if (err.response?.status === 404) {
				setProfile(null);
				setError(null);
			} else {
				setError("Nie udało się pobrać danych profilu. Spróbuj ponownie.");
			}
		} finally {
			setLoading(false);
		}
	};

	const fetchLoyaltyPoints = async () => {
		try {
			setLoyaltyLoading(true);
			setLoyaltyError(null);

			let pointsData;

			if (auth.roles && auth.roles.includes("admin")) {
				if (profile && profile.user) {
					try {
						pointsData = await LoyaltyService.getClientLoyaltyPoints(
							Number(profile.user)
						);
					} catch (err: any) {
						if (err.response?.status === 404) {
							setLoyaltyFormData({
								total_points: 0,
								membership_level: "bronze",
								user: Number(profile.user),
							});
						} else {
							throw err;
						}
					}
				}
			} else if (auth.roles && auth.roles.includes("client")) {
				try {
					pointsData = await LoyaltyService.getUserLoyaltyStatus();
				} catch (err: any) {
					if (err.response?.status === 404) {
					} else {
						throw err;
					}
				}
			}

			setLoyaltyPoints(pointsData || null);

			if (pointsData) {
				setLoyaltyFormData({
					total_points: pointsData.total_points,
					membership_level: pointsData.membership_level,
					user: pointsData.user,
				});
			} else if (profile && profile.user) {
				setLoyaltyFormData({
					total_points: 0,
					membership_level: "bronze",
					user: Number(profile.user),
				});
			}
		} catch (err: any) {
			setLoyaltyError("Nie udało się pobrać punktów lojalnościowych");
		} finally {
			setLoyaltyLoading(false);
		}
	};

	const handleEditClick = () => {
		if (profile) {
			setModalMode("edit");
			setFormData({
				id:
					typeof profile.id === "number" ? profile.id : Number(profile.id) || 0,
				user:
					typeof profile.user === "number"
						? profile.user
						: Number(profile.user) || 0,
				address: profile.address || "",
				phone: profile.phone || "",
				photo: profile.photo || "",
				preferred_contact_method: profile.preferred_contact_method || "email",
			});
		} else {
			setModalMode("create");
			setFormData({
				id: 0,
				user: 0,
				address: "",
				phone: "",
				photo: "",
				preferred_contact_method: "email",
			});
		}
		setIsModalOpen(true);
	};

	const handleModalClose = () => {
		setIsModalOpen(false);
		setError(null);
	};

	const handleChange = (
		e:
			| React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
			| { target: { name: string; value: string } }
	) => {
		const { name, value } = e.target;
		setFormData((prev) => ({ ...prev, [name]: value }));
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		try {
			setLoading(true);
			const userId = localStorage.getItem("userID");

			if (!userId) {
				showSnackbar(
					"Nie znaleziono identyfikatora użytkownika. Zaloguj się ponownie.",
					"error"
				);
				return;
			}

			let updatedProfile;
			if (profile && modalMode === "edit") {
				updatedProfile = await ProfileService.updateProfile(userId, formData);
				showSnackbar("Profil zaktualizowany pomyślnie!", "success");
			} else {
				updatedProfile = await ProfileService.createProfile(formData);
				showSnackbar("Profil utworzony pomyślnie!", "success");
			}

			setProfile(updatedProfile);
			setIsModalOpen(false);
			setError(null);
		} catch (err: any) {
			const errorMessage =
				err.response?.data?.message ||
				"Nie udało się zapisać profilu. Spróbuj ponownie.";
			showSnackbar(errorMessage, "error");
		} finally {
			setLoading(false);
		}
	};

	const handleDelete = async () => {
		if (!window.confirm("Czy na pewno chcesz usunąć swój profil?")) {
			return;
		}

		try {
			setLoading(true);
			await ProfileService.deleteProfile();
			setProfile(null);
			setFormData({
				id: 0,
				user: 0,
				address: "",
				phone: "",
				photo: "",
				preferred_contact_method: "email",
			});
			showSnackbar("Profil usunięty pomyślnie.", "success");
		} catch (err: any) {
			const errorMessage =
				err.response?.data?.message ||
				"Nie udało się usunąć profilu. Spróbuj ponownie.";
			showSnackbar(errorMessage, "error");
		} finally {
			setLoading(false);
		}
	};

	const handleEditLoyaltyPoints = () => {
		if (profile && profile.user) {
			setLoyaltyFormData((prev) => ({
				...prev,
				user: Number(profile.user),
				total_points: loyaltyPoints?.total_points || 0,
				membership_level: loyaltyPoints?.membership_level || "bronze",
			}));
		} else {
			showSnackbar("Nie można edytować punktów - brak ID użytkownika", "error");
			return;
		}

		setIsLoyaltyModalOpen(true);
	};

	const handleLoyaltyChange = (
		e:
			| React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
			| { target: { name: string; value: string } }
	) => {
		const { name, value } = e.target;
		setLoyaltyFormData((prev) => ({
			...prev,
			[name]: name === "total_points" ? Number(value) : value,
		}));
	};

	const handleLoyaltySubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!auth.roles?.includes("admin")) {
			showSnackbar("Brak uprawnień do edycji punktów", "error");
			return;
		}

		if (!loyaltyFormData.user && profile?.user) {
			setLoyaltyFormData((prev) => ({
				...prev,
				user: Number(profile.user),
			}));
		}

		if (!loyaltyFormData.user) {
			showSnackbar("Nie można zapisać punktów - brak ID użytkownika", "error");
			return;
		}

		try {
			setLoyaltyLoading(true);

			let result;
			if (loyaltyPoints?.id) {
				result = await LoyaltyService.updateLoyaltyPoints(
					loyaltyPoints.id,
					loyaltyFormData
				);
			} else {
				result = await LoyaltyService.createLoyaltyPoints({
					user: loyaltyFormData.user,
					total_points: loyaltyFormData.total_points || 0,
					membership_level: loyaltyFormData.membership_level || "bronze",
					points_earned_this_year: 0,
				} as LoyaltyPoints);
			}

			setLoyaltyPoints(result);
			setIsLoyaltyModalOpen(false);
			showSnackbar("Punkty lojalnościowe zaktualizowane", "success");
		} catch (err: any) {
			showSnackbar(
				err.response?.data?.message || "Nie udało się zaktualizować punktów",
				"error"
			);
		} finally {
			setLoyaltyLoading(false);
		}
	};

	const handleAddPoints = async () => {
		if (!auth.roles?.includes("admin")) {
			showSnackbar("Brak uprawnień do edycji punktów", "error");
			return;
		}

		if (pointsToAdd <= 0) {
			showSnackbar("Wprowadź dodatnią liczbę punktów", "error");
			return;
		}

		try {
			setLoyaltyLoading(true);

			const currentPoints = loyaltyPoints?.total_points || 0;
			const newTotalPoints = currentPoints + pointsToAdd;

			let result;
			if (loyaltyPoints?.id) {
				const determineMembershipLevel = (points: number): string => {
					if (points >= 100) return "platinum";
					if (points >= 50) return "gold";
					if (points >= 20) return "silver";
					return "bronze";
				};

				const newLevel = determineMembershipLevel(newTotalPoints);
				if (newLevel !== loyaltyPoints?.membership_level) {
					showSnackbar(
						`Zmieniono poziom na ${
							newLevel.charAt(0).toUpperCase() + newLevel.slice(1)
						}`,
						"info"
					);
				}

				result = await LoyaltyService.updateLoyaltyPoints(loyaltyPoints.id, {
					...loyaltyFormData,
					total_points: newTotalPoints,
					membership_level: newLevel,
				});
			} else if (profile?.user) {
				result = await LoyaltyService.createLoyaltyPoints({
					user: Number(profile.user),
					total_points: newTotalPoints,
					membership_level: "bronze",
					points_earned_this_year: pointsToAdd,
				} as LoyaltyPoints);
			} else {
				throw new Error("Brak ID użytkownika");
			}

			setLoyaltyPoints(result);
			setPointsToAdd(0);
			showSnackbar(`Dodano ${pointsToAdd} punktów lojalnościowych`, "success");

			fetchLoyaltyPoints();
		} catch (err: any) {
			showSnackbar(
				err.response?.data?.message || "Nie udało się dodać punktów",
				"error"
			);
		} finally {
			setLoyaltyLoading(false);
		}
	};

	return (
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
							mb: 4,
							flexWrap: "wrap",
							gap: 2,
						}}
					>
						<Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
							<PersonIcon sx={{ fontSize: 32, color: COLOR_PRIMARY }} />
							<Typography
								variant="h4"
								component="h1"
								fontWeight="bold"
								sx={{ color: COLOR_TEXT_PRIMARY }}
							>
								{profile ? "Twój Profil" : "Utwórz Profil"}
							</Typography>
						</Box>
						<Box sx={{ display: "flex", gap: 2 }}>
							<Button
								variant="contained"
								onClick={handleEditClick}
								disabled={loading}
								startIcon={profile ? <EditIcon /> : <PersonIcon />}
								sx={{
									backgroundColor: COLOR_PRIMARY,
									"&:hover": { backgroundColor: `${COLOR_PRIMARY}dd` },
									"&:disabled": {
										backgroundColor: `${COLOR_PRIMARY}60`,
										color: `${COLOR_TEXT_PRIMARY}60`,
									},
								}}
							>
								{profile ? "Edytuj Profil" : "Utwórz Profil"}
							</Button>
							{profile && (
								<Button
									variant="outlined"
									color="error"
									onClick={handleDelete}
									disabled={loading}
									startIcon={<DeleteIcon />}
									sx={{
										borderColor: COLOR_ERROR,
										color: COLOR_ERROR,
										"&:hover": {
											borderColor: COLOR_ERROR,
											backgroundColor: `${COLOR_ERROR}20`,
										},
										"&:disabled": {
											borderColor: `${COLOR_ERROR}60`,
											color: `${COLOR_ERROR}60`,
										},
									}}
								>
									Usuń Profil
								</Button>
							)}
						</Box>
					</Box>

					{error && (
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
						>
							{error}
						</Alert>
					)}

					{loading ? (
						<Box
							sx={{
								display: "flex",
								flexDirection: "column",
								alignItems: "center",
								justifyContent: "center",
								py: 8,
							}}
						>
							<CircularProgress
								size={40}
								sx={{ mb: 2, color: COLOR_PRIMARY }}
							/>
							<Typography
								color={COLOR_TEXT_SECONDARY}
								sx={{ color: COLOR_TEXT_SECONDARY }}
							>
								Ładowanie danych profilu...
							</Typography>
						</Box>
					) : profile ? (
						<Paper
							elevation={2}
							sx={{
								overflow: "hidden",
								backgroundColor: COLOR_SURFACE,
								border: `1px solid ${COLOR_TEXT_SECONDARY}20`,
							}}
						>
							<Box
								sx={{
									display: "flex",
									justifyContent: "space-between",
									alignItems: "center",
									p: 3,
									backgroundColor: `${COLOR_PRIMARY}10`,
									borderBottom: `1px solid ${COLOR_TEXT_SECONDARY}20`,
								}}
							>
								<Box>
									<Typography
										variant="h5"
										fontWeight="600"
										gutterBottom
										sx={{ color: COLOR_TEXT_PRIMARY }}
									>
										Informacje o profilu
									</Typography>
									<Typography
										variant="body2"
										sx={{ color: COLOR_TEXT_SECONDARY }}
									>
										Zarządzaj swoimi danymi osobowymi
									</Typography>
								</Box>
								{profile.photo ? (
									<Avatar
										src={profile.photo}
										sx={{
											width: 80,
											height: 80,
											border: `2px solid ${COLOR_PRIMARY}`,
										}}
										alt="Zdjęcie profilowe"
									/>
								) : (
									<Avatar
										sx={{
											width: 80,
											height: 80,
											backgroundColor: COLOR_PRIMARY,
											color: "white",
											fontSize: 32,
										}}
									>
										<PersonIcon fontSize="large" />
									</Avatar>
								)}
							</Box>

							<Box sx={{ p: 3 }}>
								<Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
									<Box
										sx={{
											display: "flex",
											alignItems: "center",
											py: 1.5,
											borderBottom: `1px solid ${COLOR_TEXT_SECONDARY}20`,
										}}
									>
										<LocationIcon
											sx={{
												mr: 2,
												color: COLOR_TEXT_SECONDARY,
												fontSize: 20,
											}}
										/>
										<Typography
											variant="body2"
											fontWeight="500"
											sx={{
												minWidth: 160,
												color: COLOR_TEXT_PRIMARY,
											}}
										>
											Adres:
										</Typography>
										<Typography
											variant="body2"
											sx={{ color: COLOR_TEXT_SECONDARY }}
										>
											{profile.address || "Nie podano"}
										</Typography>
									</Box>

									<Box
										sx={{
											display: "flex",
											alignItems: "center",
											py: 1.5,
											borderBottom: `1px solid ${COLOR_TEXT_SECONDARY}20`,
										}}
									>
										<PhoneIcon
											sx={{
												mr: 2,
												color: COLOR_TEXT_SECONDARY,
												fontSize: 20,
											}}
										/>
										<Typography
											variant="body2"
											fontWeight="500"
											sx={{
												minWidth: 160,
												color: COLOR_TEXT_PRIMARY,
											}}
										>
											Telefon:
										</Typography>
										<Typography
											variant="body2"
											sx={{ color: COLOR_TEXT_SECONDARY }}
										>
											{profile.phone || "Nie podano"}
										</Typography>
									</Box>

									<Box
										sx={{
											display: "flex",
											alignItems: "center",
											py: 1.5,
										}}
									>
										<EmailIcon
											sx={{
												mr: 2,
												color: COLOR_TEXT_SECONDARY,
												fontSize: 20,
											}}
										/>
										<Typography
											variant="body2"
											fontWeight="500"
											sx={{
												minWidth: 160,
												color: COLOR_TEXT_PRIMARY,
											}}
										>
											Preferowany kontakt:
										</Typography>
										<Typography
											variant="body2"
											sx={{ color: COLOR_TEXT_SECONDARY }}
										>
											{profile.preferred_contact_method === "email"
												? "Email"
												: profile.preferred_contact_method === "phone"
												? "Telefon"
												: "Nie określono"}
										</Typography>
									</Box>
								</Box>
							</Box>

							{(auth.roles?.includes("admin") ||
								auth.roles?.includes("client")) && (
								<>
									<Divider sx={{ borderColor: `${COLOR_TEXT_SECONDARY}20` }} />
									<Box
										sx={{
											p: 3,
											backgroundColor: `${COLOR_PRIMARY}08`,
											borderTop: `1px solid ${COLOR_TEXT_SECONDARY}20`,
										}}
									>
										<Box
											sx={{
												display: "flex",
												justifyContent: "space-between",
												alignItems: "center",
											}}
										>
											<Box
												sx={{ display: "flex", alignItems: "center", gap: 2 }}
											>
												<StarIcon
													sx={{
														fontSize: 24,
														color: COLOR_WARNING,
													}}
												/>
												<Box>
													<Typography
														variant="h5"
														fontWeight="600"
														gutterBottom
														sx={{ color: COLOR_TEXT_PRIMARY }}
													>
														Program Lojalnościowy
													</Typography>
													<Typography
														variant="body2"
														sx={{ color: COLOR_TEXT_SECONDARY }}
													>
														{auth.roles?.includes("client")
															? "Twoje punkty i poziom w programie lojalnościowym"
															: "Zarządzaj punktami klienta"}
													</Typography>
												</Box>
											</Box>

											{auth.roles?.includes("admin") && (
												<Button
													variant="outlined"
													onClick={handleEditLoyaltyPoints}
													disabled={loyaltyLoading}
													sx={{
														borderColor: COLOR_PRIMARY,
														color: COLOR_PRIMARY,
														"&:hover": {
															borderColor: COLOR_PRIMARY,
															backgroundColor: `${COLOR_PRIMARY}20`,
														},
														"&:disabled": {
															borderColor: `${COLOR_PRIMARY}60`,
															color: `${COLOR_PRIMARY}60`,
														},
													}}
												>
													{loyaltyPoints ? "Edytuj punkty" : "Dodaj punkty"}
												</Button>
											)}
										</Box>

										<Box sx={{ mt: 3 }}>
											{loyaltyLoading ? (
												<Box
													sx={{
														display: "flex",
														alignItems: "center",
														gap: 2,
													}}
												>
													<CircularProgress
														size={20}
														sx={{ color: COLOR_PRIMARY }}
													/>
													<Typography sx={{ color: COLOR_TEXT_PRIMARY }}>
														Ładowanie danych...
													</Typography>
												</Box>
											) : loyaltyError ? (
												<Alert
													severity="error"
													sx={{
														mb: 2,
														backgroundColor: `${COLOR_ERROR}20`,
														color: COLOR_TEXT_PRIMARY,
														"& .MuiAlert-icon": {
															color: COLOR_ERROR,
														},
													}}
												>
													{loyaltyError}
												</Alert>
											) : loyaltyPoints ? (
												<Box
													sx={{
														display: "flex",
														flexDirection: "column",
														gap: 2,
													}}
												>
													<Box
														sx={{
															display: "flex",
															alignItems: "center",
															py: 1.5,
															borderBottom: `1px solid ${COLOR_TEXT_SECONDARY}20`,
														}}
													>
														<StarIcon
															sx={{
																mr: 2,
																color: COLOR_WARNING,
																fontSize: 20,
															}}
														/>
														<Typography
															variant="body2"
															fontWeight="500"
															sx={{
																minWidth: 160,
																color: COLOR_TEXT_PRIMARY,
															}}
														>
															Punkty lojalnościowe:
														</Typography>
														<Typography
															variant="body2"
															sx={{
																color: COLOR_SUCCESS,
																fontWeight: "bold",
															}}
														>
															{loyaltyPoints.total_points} pkt
														</Typography>
													</Box>

													<Box
														sx={{
															display: "flex",
															py: 1.5,
															borderBottom: `1px solid ${COLOR_TEXT_SECONDARY}20`,
														}}
													>
														<Typography
															variant="body2"
															fontWeight="500"
															sx={{
																minWidth: 200,
																color: COLOR_TEXT_PRIMARY,
															}}
														>
															Poziom:
														</Typography>
														<Typography
															variant="body2"
															sx={{
																color:
																	loyaltyPoints.membership_level === "gold"
																		? "#FFD700"
																		: loyaltyPoints.membership_level ===
																		  "silver"
																		? "#C0C0C0"
																		: loyaltyPoints.membership_level ===
																		  "bronze"
																		? "#CD7F32"
																		: loyaltyPoints.membership_level ===
																		  "platinum"
																		? "#E5E4E2"
																		: COLOR_TEXT_SECONDARY,
																fontWeight: "bold",
															}}
														>
															{loyaltyPoints.membership_level
																.charAt(0)
																.toUpperCase() +
																loyaltyPoints.membership_level.slice(1)}{" "}
														</Typography>
													</Box>

													{loyaltyPoints.last_updated && (
														<Box sx={{ display: "flex", py: 1.5 }}>
															<Typography
																variant="body2"
																fontWeight="500"
																sx={{
																	minWidth: 200,
																	color: COLOR_TEXT_PRIMARY,
																}}
															>
																Ostatnia aktualizacja:
															</Typography>
															<Typography
																variant="body2"
																sx={{ color: COLOR_TEXT_SECONDARY }}
															>
																{new Date(
																	loyaltyPoints.last_updated
																).toLocaleDateString()}
															</Typography>
														</Box>
													)}
												</Box>
											) : (
												<Typography sx={{ color: COLOR_TEXT_SECONDARY }}>
													{auth.roles?.includes("client")
														? "Nie masz jeszcze punktów lojalnościowych."
														: "Ten klient nie ma jeszcze punktów lojalnościowych."}
												</Typography>
											)}
										</Box>

										{auth.roles?.includes("admin") && loyaltyPoints && (
											<Box sx={{ display: "flex", mt: 2, gap: 1 }}>
												<TextField
													label="Liczba punktów do dodania"
													type="number"
													size="small"
													value={pointsToAdd}
													onChange={(e) =>
														setPointsToAdd(parseInt(e.target.value) || 0)
													}
													InputProps={{ inputProps: { min: 0 } }}
													sx={{ width: 200 }}
												/>
												<Button
													variant="contained"
													onClick={handleAddPoints}
													disabled={loyaltyLoading || pointsToAdd <= 0}
													sx={{ backgroundColor: COLOR_PRIMARY }}
												>
													Dodaj punkty
												</Button>
											</Box>
										)}
									</Box>
								</>
							)}
						</Paper>
					) : (
						<Paper
							elevation={2}
							sx={{
								textAlign: "center",
								py: 8,
								px: 4,
								backgroundColor: COLOR_SURFACE,
								border: `1px solid ${COLOR_TEXT_SECONDARY}20`,
							}}
						>
							<PersonIcon
								sx={{
									fontSize: 64,
									opacity: 0.5,
									mb: 2,
									color: COLOR_TEXT_SECONDARY,
								}}
							/>
							<Typography
								variant="h5"
								fontWeight="600"
								gutterBottom
								sx={{ color: COLOR_TEXT_PRIMARY }}
							>
								Nie znaleziono profilu
							</Typography>
							<Typography
								variant="body1"
								sx={{
									mb: 3,
									color: COLOR_TEXT_SECONDARY,
								}}
							>
								Utwórz swój profil, aby rozpocząć
							</Typography>
							<Button
								variant="contained"
								onClick={handleEditClick}
								sx={{
									backgroundColor: COLOR_PRIMARY,
									"&:hover": { backgroundColor: `${COLOR_PRIMARY}dd` },
								}}
							>
								Utwórz Profil
							</Button>
						</Paper>
					)}

					<Dialog
						open={isModalOpen}
						onClose={handleModalClose}
						maxWidth="sm"
						fullWidth
						PaperProps={{
							sx: {
								backgroundColor: COLOR_SURFACE,
								border: `1px solid ${COLOR_TEXT_SECONDARY}20`,
							},
						}}
					>
						<DialogTitle
							sx={{
								backgroundColor: `${COLOR_PRIMARY}10`,
								borderBottom: `1px solid ${COLOR_TEXT_SECONDARY}20`,
								color: COLOR_TEXT_PRIMARY,
								fontWeight: "600",
								display: "flex",
								alignItems: "center",
								gap: 2,
							}}
						>
							<PersonIcon sx={{ color: COLOR_PRIMARY }} />
							{modalMode === "edit" ? "Edytuj Profil" : "Utwórz Profil"}
						</DialogTitle>
						<form onSubmit={handleSubmit}>
							<DialogContent
								sx={{
									backgroundColor: COLOR_SURFACE,
									color: COLOR_TEXT_PRIMARY,
								}}
							>
								<Box
									sx={{
										display: "flex",
										flexDirection: "column",
										gap: 3,
										pt: 1,
									}}
								>
									<TextField
										fullWidth
										label="Adres"
										name="address"
										value={formData.address}
										onChange={handleChange}
										placeholder="Wprowadź adres"
										variant="outlined"
										sx={{
											"& .MuiOutlinedInput-root": {
												backgroundColor: COLOR_BACKGROUND,
												color: COLOR_TEXT_PRIMARY,
												"& fieldset": {
													borderColor: `${COLOR_TEXT_SECONDARY}40`,
												},
												"&:hover fieldset": {
													borderColor: `${COLOR_TEXT_SECONDARY}60`,
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
											"& .MuiInputBase-input::placeholder": {
												color: `${COLOR_TEXT_SECONDARY}80`,
											},
										}}
									/>

									<TextField
										fullWidth
										label="Telefon"
										name="phone"
										value={formData.phone}
										onChange={handleChange}
										placeholder="Wprowadź numer telefonu"
										variant="outlined"
										sx={{
											"& .MuiOutlinedInput-root": {
												backgroundColor: COLOR_BACKGROUND,
												color: COLOR_TEXT_PRIMARY,
												"& fieldset": {
													borderColor: `${COLOR_TEXT_SECONDARY}40`,
												},
												"&:hover fieldset": {
													borderColor: `${COLOR_TEXT_SECONDARY}60`,
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
											"& .MuiInputBase-input::placeholder": {
												color: `${COLOR_TEXT_SECONDARY}80`,
											},
										}}
									/>

									<TextField
										fullWidth
										type="file"
										label="Zdjęcie profilowe"
										name="photo"
										InputLabelProps={{ shrink: true }}
										inputProps={{ accept: "image/*" }}
										onChange={(e) => {
											const file = (e.target as HTMLInputElement).files?.[0];
											if (file) {
												const reader = new FileReader();
												reader.onloadend = () => {
													setFormData((prev) => ({
														...prev,
														photo: reader.result as string,
													}));
												};
												reader.readAsDataURL(file);
											}
										}}
										variant="outlined"
										sx={{
											"& .MuiOutlinedInput-root": {
												backgroundColor: COLOR_BACKGROUND,
												color: COLOR_TEXT_PRIMARY,
												"& fieldset": {
													borderColor: `${COLOR_TEXT_SECONDARY}40`,
												},
												"&:hover fieldset": {
													borderColor: `${COLOR_TEXT_SECONDARY}60`,
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

									{formData.photo && (
										<Box
											sx={{
												display: "flex",
												justifyContent: "center",
												p: 2,
												backgroundColor: `${COLOR_PRIMARY}08`,
												borderRadius: 2,
												border: `1px solid ${COLOR_TEXT_SECONDARY}20`,
											}}
										>
											<Avatar
												src={formData.photo}
												sx={{
													width: 120,
													height: 120,
													border: `3px solid ${COLOR_PRIMARY}`,
													boxShadow: `0 4px 8px ${COLOR_PRIMARY}40`,
												}}
												alt="Podgląd"
											/>
										</Box>
									)}

									<FormControl fullWidth>
										<InputLabel
											sx={{
												color: COLOR_TEXT_SECONDARY,
												"&.Mui-focused": {
													color: COLOR_PRIMARY,
												},
											}}
										>
											Preferowana metoda kontaktu
										</InputLabel>
										<Select
											name="preferred_contact_method"
											value={formData.preferred_contact_method}
											onChange={(event) =>
												handleChange({
													target: {
														name: "preferred_contact_method",
														value: event.target.value,
													},
												})
											}
											label="Preferowana metoda kontaktu"
											sx={{
												backgroundColor: COLOR_BACKGROUND,
												color: COLOR_TEXT_PRIMARY,
												"& .MuiOutlinedInput-notchedOutline": {
													borderColor: `${COLOR_TEXT_SECONDARY}40`,
												},
												"&:hover .MuiOutlinedInput-notchedOutline": {
													borderColor: `${COLOR_TEXT_SECONDARY}60`,
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
														backgroundColor: COLOR_SURFACE,
														color: COLOR_TEXT_PRIMARY,
														border: `1px solid ${COLOR_TEXT_SECONDARY}20`,
														"& .MuiMenuItem-root": {
															color: COLOR_TEXT_PRIMARY,
															"&:hover": {
																backgroundColor: `${COLOR_PRIMARY}20`,
															},
															"&.Mui-selected": {
																backgroundColor: `${COLOR_PRIMARY}30`,
																"&:hover": {
																	backgroundColor: `${COLOR_PRIMARY}40`,
																},
															},
														},
													},
												},
											}}
										>
											<MenuItem value="email">
												<Box
													sx={{ display: "flex", alignItems: "center", gap: 1 }}
												>
													<EmailIcon
														sx={{ fontSize: 18, color: COLOR_TEXT_SECONDARY }}
													/>
													Email
												</Box>
											</MenuItem>
											<MenuItem value="phone">
												<Box
													sx={{ display: "flex", alignItems: "center", gap: 1 }}
												>
													<PhoneIcon
														sx={{ fontSize: 18, color: COLOR_TEXT_SECONDARY }}
													/>
													Telefon
												</Box>
											</MenuItem>
										</Select>
									</FormControl>
								</Box>
							</DialogContent>
							<DialogActions
								sx={{
									p: 3,
									gap: 1,
									backgroundColor: `${COLOR_PRIMARY}05`,
									borderTop: `1px solid ${COLOR_TEXT_SECONDARY}20`,
								}}
							>
								<Button
									onClick={handleModalClose}
									variant="outlined"
									sx={{
										borderColor: COLOR_TEXT_SECONDARY,
										color: COLOR_TEXT_SECONDARY,
										"&:hover": {
											borderColor: COLOR_TEXT_PRIMARY,
											backgroundColor: `${COLOR_TEXT_SECONDARY}10`,
										},
									}}
								>
									Anuluj
								</Button>
								<Button
									type="submit"
									variant="contained"
									disabled={loading}
									sx={{
										backgroundColor: COLOR_PRIMARY,
										"&:hover": { backgroundColor: `${COLOR_PRIMARY}dd` },
										"&:disabled": {
											backgroundColor: `${COLOR_PRIMARY}60`,
											color: `${COLOR_TEXT_PRIMARY}60`,
										},
									}}
								>
									{loading
										? "Zapisywanie..."
										: modalMode === "edit"
										? "Zapisz zmiany"
										: "Utwórz Profil"}
								</Button>
							</DialogActions>
						</form>
					</Dialog>

					{auth.roles?.includes("admin") && (
						<Dialog
							open={isLoyaltyModalOpen}
							onClose={() => setIsLoyaltyModalOpen(false)}
							maxWidth="sm"
							fullWidth
							PaperProps={{
								sx: {
									backgroundColor: COLOR_SURFACE,
									border: `1px solid ${COLOR_TEXT_SECONDARY}20`,
								},
							}}
						>
							<DialogTitle
								sx={{
									backgroundColor: `${COLOR_WARNING}10`,
									borderBottom: `1px solid ${COLOR_TEXT_SECONDARY}20`,
									color: COLOR_TEXT_PRIMARY,
									fontWeight: "600",
									display: "flex",
									alignItems: "center",
									gap: 2,
								}}
							>
								<StarIcon sx={{ color: COLOR_WARNING }} />
								{loyaltyPoints
									? "Edytuj punkty lojalnościowe"
									: "Dodaj punkty lojalnościowe"}
							</DialogTitle>
							<form onSubmit={handleLoyaltySubmit}>
								<DialogContent
									sx={{
										backgroundColor: COLOR_SURFACE,
										color: COLOR_TEXT_PRIMARY,
									}}
								>
									<Box
										sx={{
											display: "flex",
											flexDirection: "column",
											gap: 3,
											pt: 1,
										}}
									>
										<TextField
											fullWidth
											label="Liczba punktów"
											name="total_points"
											type="number"
											value={loyaltyFormData.total_points || 0}
											onChange={handleLoyaltyChange}
											variant="outlined"
											InputProps={{ inputProps: { min: 0 } }}
											sx={{
												"& .MuiOutlinedInput-root": {
													backgroundColor: COLOR_BACKGROUND,
													color: COLOR_TEXT_PRIMARY,
													"& fieldset": {
														borderColor: `${COLOR_TEXT_SECONDARY}40`,
													},
													"&:hover fieldset": {
														borderColor: `${COLOR_TEXT_SECONDARY}60`,
													},
													"&.Mui-focused fieldset": {
														borderColor: COLOR_WARNING,
													},
												},
												"& .MuiInputLabel-root": {
													color: COLOR_TEXT_SECONDARY,
													"&.Mui-focused": {
														color: COLOR_WARNING,
													},
												},
											}}
										/>

										<FormControl fullWidth>
											<InputLabel
												sx={{
													color: COLOR_TEXT_SECONDARY,
													"&.Mui-focused": {
														color: COLOR_WARNING,
													},
												}}
											>
												Poziom
											</InputLabel>
											<Select
												name="membership_level"
												value={loyaltyFormData.membership_level || "bronze"}
												onChange={(event) =>
													handleLoyaltyChange({
														target: {
															name: "membership_level",
															value: event.target.value,
														},
													})
												}
												label="Poziom"
												sx={{
													backgroundColor: COLOR_BACKGROUND,
													color: COLOR_TEXT_PRIMARY,
													"& .MuiOutlinedInput-notchedOutline": {
														borderColor: `${COLOR_TEXT_SECONDARY}40`,
													},
													"&:hover .MuiOutlinedInput-notchedOutline": {
														borderColor: `${COLOR_TEXT_SECONDARY}60`,
													},
													"&.Mui-focused .MuiOutlinedInput-notchedOutline": {
														borderColor: COLOR_WARNING,
													},
													"& .MuiSelect-icon": {
														color: COLOR_TEXT_SECONDARY,
													},
												}}
												MenuProps={{
													PaperProps: {
														sx: {
															backgroundColor: COLOR_SURFACE,
															color: COLOR_TEXT_PRIMARY,
															border: `1px solid ${COLOR_TEXT_SECONDARY}20`,
															"& .MuiMenuItem-root": {
																color: COLOR_TEXT_PRIMARY,
																"&:hover": {
																	backgroundColor: `${COLOR_WARNING}20`,
																},
																"&.Mui-selected": {
																	backgroundColor: `${COLOR_WARNING}30`,
																	"&:hover": {
																		backgroundColor: `${COLOR_WARNING}40`,
																	},
																},
															},
														},
													},
												}}
											>
												<MenuItem value="bronze">
													<Box
														sx={{
															display: "flex",
															alignItems: "center",
															gap: 1,
														}}
													>
														<StarIcon sx={{ fontSize: 18, color: "#CD7F32" }} />
														Bronze
													</Box>
												</MenuItem>
												<MenuItem value="silver">
													<Box
														sx={{
															display: "flex",
															alignItems: "center",
															gap: 1,
														}}
													>
														<StarIcon sx={{ fontSize: 18, color: "#C0C0C0" }} />
														Silver
													</Box>
												</MenuItem>
												<MenuItem value="gold">
													<Box
														sx={{
															display: "flex",
															alignItems: "center",
															gap: 1,
														}}
													>
														<StarIcon sx={{ fontSize: 18, color: "#FFD700" }} />
														Gold
													</Box>
												</MenuItem>
												<MenuItem value="platinum">
													<Box
														sx={{
															display: "flex",
															alignItems: "center",
															gap: 1,
														}}
													>
														<StarIcon sx={{ fontSize: 18, color: "#E5E4E2" }} />
														Platinum
													</Box>
												</MenuItem>
											</Select>
										</FormControl>
									</Box>
								</DialogContent>
								<DialogActions
									sx={{
										p: 3,
										gap: 1,
										backgroundColor: `${COLOR_WARNING}05`,
										borderTop: `1px solid ${COLOR_TEXT_SECONDARY}20`,
									}}
								>
									<Button
										onClick={() => setIsLoyaltyModalOpen(false)}
										variant="outlined"
										sx={{
											borderColor: COLOR_TEXT_SECONDARY,
											color: COLOR_TEXT_SECONDARY,
											"&:hover": {
												borderColor: COLOR_TEXT_PRIMARY,
												backgroundColor: `${COLOR_TEXT_SECONDARY}10`,
											},
										}}
									>
										Anuluj
									</Button>
									<Button
										type="submit"
										variant="contained"
										disabled={loyaltyLoading}
										sx={{
											backgroundColor: COLOR_WARNING,
											"&:hover": { backgroundColor: `${COLOR_WARNING}dd` },
											"&:disabled": {
												backgroundColor: `${COLOR_WARNING}60`,
												color: `${COLOR_TEXT_PRIMARY}60`,
											},
										}}
									>
										{loyaltyLoading ? "Zapisywanie..." : "Zapisz"}
									</Button>
								</DialogActions>
							</form>
						</Dialog>
					)}

					<CustomSnackbar
						snackbarState={snackbarState}
						onClose={handleSnackbarClose}
					/>
				</Box>
			</Container>
		</Box>
	);
};

export default ProfileComponent;
