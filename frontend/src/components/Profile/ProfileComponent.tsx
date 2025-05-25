import React, { useState, useEffect } from "react";
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
import CustomSnackbar, { SnackbarState } from "../Mainlayout/Snackbar";
import { COLOR_PRIMARY } from "../../constants";

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
	}, []);

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
			// 404 to normalny przypadek - brak profilu
			if (err.response?.status === 404) {
				console.log("Profil nie istnieje - to jest OK");
				setProfile(null);
				setError(null);
			} else {
				setError("Nie udało się pobrać danych profilu. Spróbuj ponownie.");
				console.error("Error fetching profile:", err);
			}
		} finally {
			setLoading(false);
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
			console.error("Error saving profile:", err);
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
			console.error("Error deleting profile:", err);
		} finally {
			setLoading(false);
		}
	};

	return (
		<Box sx={{ maxWidth: 1200, mx: "auto", p: 3 }}>
			{/* Header */}
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

			{/* Error Alert */}
			{error && (
				<Alert severity="error" sx={{ mb: 3 }}>
					{error}
				</Alert>
			)}

			{/* Loading */}
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
				/* Profile Card */
				<Paper elevation={2} sx={{ overflow: "hidden" }}>
					{/* Profile Header */}
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

					{/* Profile Details */}
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
				</Paper>
			) : (
				/* Empty State */
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

			{/* Modal Dialog */}
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

			<CustomSnackbar
				snackbarState={snackbarState}
				onClose={handleSnackbarClose}
			/>
		</Box>
	);
};

export default ProfileComponent;
