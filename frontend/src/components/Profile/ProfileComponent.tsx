import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
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
} from "@mui/material";
import { Profile } from "../../models/ProfileModel";
import { ProfileService } from "../../api/ProfileAPIEndpoint";
import { LoyaltyService, LoyaltyPoints } from "../../api/LoyaltyAPIEndpoint";
import CustomSnackbar, { SnackbarState } from "../Mainlayout/Snackbar";
import { COLOR_PRIMARY } from "../../constants";
import AuthContext from "../../context/AuthProvider";

const ProfileComponent: React.FC = () => {
	const [profile, setProfile] = useState<Profile | null>(null);
	const [loading, setLoading] = useState<boolean>(true);
	const [error, setError] = useState<string | null>(null);
	const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
	const [modalMode, setModalMode] = useState<"create" | "edit">("edit");
	const [formData, setFormData] = useState<Profile>({
		id: "",
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
	const navigate = useNavigate();

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
				id: profile.id || "",
				user: profile.user || "",
				address: profile.address || "",
				phone: profile.phone || "",
				photo: profile.photo || "",
				preferred_contact_method: profile.preferred_contact_method || "email",
			});
		} else {
			setModalMode("create");
			setFormData({
				id: "",
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
		e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
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
				id: "",
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
		e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
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
						`Zmieniono poziom na ${newLevel.charAt(0).toUpperCase() + newLevel.slice(1)}`,
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
		<Box sx={{ maxWidth: 1200, mx: "auto", p: 3 }}>
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
				<Typography variant="h4" component="h1" fontWeight="bold">
					{profile ? "Twój Profil" : "Utwórz Profil"}
				</Typography>
				<Box sx={{ display: "flex", gap: 2 }}>
					<Button
						variant="contained"
						onClick={handleEditClick}
						disabled={loading}
						sx={{ backgroundColor: COLOR_PRIMARY }}
					>
						{profile ? "Edytuj Profil" : "Utwórz Profil"}
					</Button>
					{profile && (
						<Button
							variant="outlined"
							color="error"
							onClick={handleDelete}
							disabled={loading}
						>
							Usuń Profil
						</Button>
					)}
				</Box>
			</Box>

			{error && (
				<Alert severity="error" sx={{ mb: 3 }}>
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
					<CircularProgress size={40} sx={{ mb: 2 }} />
					<Typography color="text.secondary">
						Ładowanie danych profilu...
					</Typography>
				</Box>
			) : profile ? (
				<Paper elevation={2} sx={{ overflow: "hidden" }}>
					<Box
						sx={{
							display: "flex",
							justifyContent: "space-between",
							alignItems: "center",
							p: 3,
							backgroundColor: "#f9fafb",
							borderBottom: "1px solid #e5e7eb",
						}}
					>
						<Box>
							<Typography variant="h5" fontWeight="600" gutterBottom>
								Informacje o profilu
							</Typography>
							<Typography variant="body2" color="text.secondary">
								Zarządzaj swoimi danymi osobowymi
							</Typography>
						</Box>
						{profile.photo && (
							<Avatar
								src={profile.photo}
								sx={{ width: 80, height: 80 }}
								alt="Zdjęcie profilowe"
							/>
						)}
					</Box>

					<Box sx={{ p: 3 }}>
						<Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
							<Box
								sx={{
									display: "flex",
									py: 1.5,
									borderBottom: "1px solid #f3f4f6",
								}}
							>
								<Typography
									variant="body2"
									fontWeight="500"
									sx={{ minWidth: 200 }}
								>
									Adres:
								</Typography>
								<Typography variant="body2" color="text.secondary">
									{profile.address || "Nie podano"}
								</Typography>
							</Box>

							<Box
								sx={{
									display: "flex",
									py: 1.5,
									borderBottom: "1px solid #f3f4f6",
								}}
							>
								<Typography
									variant="body2"
									fontWeight="500"
									sx={{ minWidth: 200 }}
								>
									Telefon:
								</Typography>
								<Typography variant="body2" color="text.secondary">
									{profile.phone || "Nie podano"}
								</Typography>
							</Box>

							<Box sx={{ display: "flex", py: 1.5 }}>
								<Typography
									variant="body2"
									fontWeight="500"
									sx={{ minWidth: 200 }}
								>
									Preferowana metoda kontaktu:
								</Typography>
								<Typography variant="body2" color="text.secondary">
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
							<Divider />
							<Box
								sx={{
									p: 3,
									backgroundColor: "#f9fafb",
									borderTop: "1px solid #e5e7eb",
								}}
							>
								<Box
									sx={{
										display: "flex",
										justifyContent: "space-between",
										alignItems: "center",
									}}
								>
									<Box>
										<Typography variant="h5" fontWeight="600" gutterBottom>
											Program Lojalnościowy
										</Typography>
										<Typography variant="body2" color="text.secondary">
											{auth.roles?.includes("client")
												? "Twoje punkty i poziom w programie lojalnościowym"
												: "Zarządzaj punktami klienta"}
										</Typography>
									</Box>

									{auth.roles?.includes("admin") && (
										<Button
											variant="outlined"
											onClick={handleEditLoyaltyPoints}
											disabled={loyaltyLoading}
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
											<CircularProgress size={20} />
											<Typography>Ładowanie danych...</Typography>
										</Box>
									) : loyaltyError ? (
										<Alert severity="error" sx={{ mb: 2 }}>
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
													py: 1.5,
													borderBottom: "1px solid #f3f4f6",
												}}
											>
												<Typography
													variant="body2"
													fontWeight="500"
													sx={{ minWidth: 200 }}
												>
													Punkty lojalnościowe:
												</Typography>
												<Typography variant="body2" color="text.secondary">
													{loyaltyPoints.total_points} pkt{" "}
												</Typography>
											</Box>

											<Box sx={{ display: "flex", py: 1.5 }}>
												<Typography
													variant="body2"
													fontWeight="500"
													sx={{ minWidth: 200 }}
												>
													Poziom:
												</Typography>
												<Typography
													variant="body2"
													sx={{
														color:
															loyaltyPoints.membership_level === "gold"
																? "#B8860B"
																: loyaltyPoints.membership_level === "silver"
																? "#808080"
																: loyaltyPoints.membership_level === "bronze"
																? "#CD7F32"
																: loyaltyPoints.membership_level === "platinum"
																? "#E5E4E2"
																: "text.secondary",
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
														sx={{ minWidth: 200 }}
													>
														Ostatnia aktualizacja:
													</Typography>
													<Typography variant="body2" color="text.secondary">
														{new Date(
															loyaltyPoints.last_updated
														).toLocaleDateString()}
													</Typography>
												</Box>
											)}
										</Box>
									) : (
										<Typography color="text.secondary">
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
					}}
				>
					<Typography variant="h1" sx={{ fontSize: 48, opacity: 0.5, mb: 2 }}>
						👤
					</Typography>
					<Typography variant="h5" fontWeight="600" gutterBottom>
						Nie znaleziono profilu
					</Typography>
					<Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
						Utwórz swój profil, aby rozpocząć
					</Typography>
					<Button
						variant="contained"
						onClick={handleEditClick}
						sx={{ backgroundColor: COLOR_PRIMARY }}
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
			>
				<DialogTitle>
					{modalMode === "edit" ? "Edytuj Profil" : "Utwórz Profil"}
				</DialogTitle>
				<form onSubmit={handleSubmit}>
					<DialogContent>
						<Box
							sx={{ display: "flex", flexDirection: "column", gap: 3, pt: 1 }}
						>
							<TextField
								fullWidth
								label="Adres"
								name="address"
								value={formData.address}
								onChange={handleChange}
								placeholder="Wprowadź adres"
								variant="outlined"
							/>

							<TextField
								fullWidth
								label="Telefon"
								name="phone"
								value={formData.phone}
								onChange={handleChange}
								placeholder="Wprowadź numer telefonu"
								variant="outlined"
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
							/>

							{formData.photo && (
								<Box sx={{ display: "flex", justifyContent: "center" }}>
									<Avatar
										src={formData.photo}
										sx={{ width: 120, height: 120 }}
										alt="Podgląd"
									/>
								</Box>
							)}

							<FormControl fullWidth>
								<InputLabel>Preferowana metoda kontaktu</InputLabel>
								<Select
									name="preferred_contact_method"
									value={formData.preferred_contact_method}
									onChange={handleChange}
									label="Preferowana metoda kontaktu"
								>
									<MenuItem value="email">Email</MenuItem>
									<MenuItem value="phone">Telefon</MenuItem>
								</Select>
							</FormControl>
						</Box>
					</DialogContent>
					<DialogActions sx={{ p: 3, gap: 1 }}>
						<Button onClick={handleModalClose} variant="outlined">
							Anuluj
						</Button>
						<Button
							type="submit"
							variant="contained"
							disabled={loading}
							sx={{ backgroundColor: COLOR_PRIMARY }}
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
				>
					<DialogTitle>
						{loyaltyPoints
							? "Edytuj punkty lojalnościowe"
							: "Dodaj punkty lojalnościowe"}
					</DialogTitle>
					<form onSubmit={handleLoyaltySubmit}>
						<DialogContent>
							<Box
								sx={{ display: "flex", flexDirection: "column", gap: 3, pt: 1 }}
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
								/>

								<FormControl fullWidth>
									<InputLabel>Poziom</InputLabel>
									<Select
										name="membership_level" 
										value={loyaltyFormData.membership_level || "bronze"} 
										onChange={handleLoyaltyChange}
										label="Poziom"
									>
										<MenuItem value="bronze">Bronze</MenuItem>
										<MenuItem value="silver">Silver</MenuItem>
										<MenuItem value="gold">Gold</MenuItem>
										<MenuItem value="platinum">Platinum</MenuItem>
									</Select>
								</FormControl>
							</Box>
						</DialogContent>
						<DialogActions sx={{ p: 3, gap: 1 }}>
							<Button
								onClick={() => setIsLoyaltyModalOpen(false)}
								variant="outlined"
							>
								Anuluj
							</Button>
							<Button
								type="submit"
								variant="contained"
								disabled={loyaltyLoading}
								sx={{ backgroundColor: COLOR_PRIMARY }}
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
	);
};

export default ProfileComponent;
