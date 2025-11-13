import React, { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import "../../../styles/leaflet-dark.css";
import L from "leaflet";
import {
	Box,
	Grid,
	Card,
	CardContent,
	Typography,
	Chip,
	Button,
	TextField,
	FormControl,
	InputLabel,
	Select,
	MenuItem,
	Rating,
	CircularProgress,
	Alert,
	IconButton,
	Tabs,
	Tab,
	Badge,
} from "@mui/material";
import {
	LocationOn as LocationIcon,
	Phone as PhoneIcon,
	Email as EmailIcon,
	MyLocation as MyLocationIcon,
	List as ListIcon,
	Map as MapIcon,
	FilterList as FilterIcon,
} from "@mui/icons-material";
import { workshopService } from "../../../api/WorkshopAPIEndpoint";
import {
	COLOR_PRIMARY,
	COLOR_SURFACE,
	COLOR_TEXT_PRIMARY,
	COLOR_TEXT_SECONDARY,
} from "../../../constants";

// Fix Leaflet default marker icons
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
	iconRetinaUrl:
		"https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
	iconUrl:
		"https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
	shadowUrl:
		"https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

interface Workshop {
	id: number;
	name: string;
	location: string;
	address_full?: string;
	specialization?: string; // Optional - może nie być w API
	contact_phone?: string;
	contact_email?: string;
	rating?: number; // Optional - może nie być w API
	latitude?: number;
	longitude?: number;
	distance_km?: number;
	// Dodatkowe pola z API
	owner_id?: number;
	phone?: string;
	email?: string;
	address?: string;
	city?: string;
	zip_code?: string;
	country?: string;
	is_active?: boolean;
	created_at?: string;
	updated_at?: string;
}

interface WorkshopSelectionStepProps {
	selectedWorkshop?: Workshop;
	onWorkshopSelect: (workshop: Workshop) => void;
	onValidationChange: (isValid: boolean) => void;
}

const WorkshopSelectionStep: React.FC<WorkshopSelectionStepProps> = ({
	selectedWorkshop,
	onWorkshopSelect,
	onValidationChange,
}) => {
	const [workshops, setWorkshops] = useState<Workshop[]>([]);
	const [loading, setLoading] = useState(false);
	const [searchQuery, setSearchQuery] = useState("");
	const [sortBy, setSortBy] = useState("name");
	const [specialization, setSpecialization] = useState("");
	const [specializations, setSpecializations] = useState<
		Array<{ value: string; label: string }>
	>([]);
	const [userLocation, setUserLocation] = useState<{
		lat: number;
		lng: number;
	} | null>(null);
	const [viewMode, setViewMode] = useState<"list" | "map">("list");
	const [locationError, setLocationError] = useState<string | null>(null);

	useEffect(() => {
		loadWorkshops();
		loadSpecializations();
	}, [searchQuery, sortBy, specialization, userLocation]);

	useEffect(() => {
		onValidationChange(!!selectedWorkshop);
	}, [selectedWorkshop, onValidationChange]);

	const loadWorkshops = async () => {
		setLoading(true);
		try {
			const params: any = {
				query: searchQuery || undefined,
				sort_by: sortBy,
				specialization: specialization || undefined,
				has_location: sortBy === "distance" ? true : undefined,
			};

			if (userLocation && sortBy === "distance") {
				params.latitude = userLocation.lat;
				params.longitude = userLocation.lng;
			}

			const response = await workshopService.searchWorkshops(params);
			setWorkshops(response);
		} catch (error) {
			console.error("Error loading workshops:", error);
		} finally {
			setLoading(false);
		}
	};

	const loadSpecializations = async () => {
		try {
			const response = await workshopService.getSpecializations();
			setSpecializations(response);
		} catch (error) {
			console.error("Error loading specializations:", error);
		}
	};

	const requestLocation = () => {
		setLocationError(null);
		if (navigator.geolocation) {
			navigator.geolocation.getCurrentPosition(
				(position) => {
					setUserLocation({
						lat: position.coords.latitude,
						lng: position.coords.longitude,
					});
					if (sortBy !== "distance") {
						setSortBy("distance");
					}
				},
				(error) => {
					setLocationError("Nie można pobrać lokalizacji: " + error.message);
				}
			);
		} else {
			setLocationError(
				"Geolokalizacja nie jest obsługiwana przez tę przeglądarkę"
			);
		}
	};

	const handleWorkshopSelect = (workshop: Workshop) => {
		onWorkshopSelect(workshop);
	};

	// Render map component
	const renderMap = () => {
		// Default center - Warsaw, Poland
		const defaultCenter: [number, number] = [52.2297, 21.0122];

		// Use user location if available
		const center: [number, number] = userLocation
			? [userLocation.lat, userLocation.lng]
			: defaultCenter;

		return (
			<MapContainer
				center={center}
				zoom={13}
				style={{ height: "400px", width: "100%", borderRadius: "8px" }}
			>
				<TileLayer
					attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
					url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
				/>

				{/* User location marker */}
				{userLocation && (
					<Marker position={[userLocation.lat, userLocation.lng]}>
						<Popup>
							<div>
								<strong>Twoja lokalizacja</strong>
							</div>
						</Popup>
					</Marker>
				)}

				{/* Workshop markers */}
				{workshops.map((workshop) => {
					// Use default coordinates if workshop doesn't have them
					const lat =
						workshop.latitude || 52.2297 + (Math.random() - 0.5) * 0.1;
					const lng =
						workshop.longitude || 21.0122 + (Math.random() - 0.5) * 0.1;

					return (
						<Marker key={workshop.id} position={[lat, lng]}>
							<Popup>
								<div style={{ minWidth: "200px" }}>
									<h3 style={{ margin: "0 0 8px 0", color: "#1976d2" }}>
										{workshop.name}
									</h3>
									<p style={{ margin: "4px 0", fontSize: "14px" }}>
										{workshop.location}
									</p>
									{workshop.specialization && (
										<p
											style={{
												margin: "4px 0",
												fontSize: "12px",
												color: "#666",
											}}
										>
											{workshop.specialization}
										</p>
									)}
									{workshop.distance_km && (
										<p
											style={{
												margin: "4px 0",
												fontSize: "12px",
												color: "#666",
											}}
										>
											Odległość: {workshop.distance_km.toFixed(1)} km
										</p>
									)}
									<button
										style={{
											marginTop: "8px",
											padding: "6px 12px",
											backgroundColor: "#1976d2",
											color: "white",
											border: "none",
											borderRadius: "4px",
											cursor: "pointer",
										}}
										onClick={() => handleWorkshopSelect(workshop)}
									>
										Wybierz warsztat
									</button>
								</div>
							</Popup>
						</Marker>
					);
				})}
			</MapContainer>
		);
	};

	const renderWorkshopCard = (workshop: Workshop) => (
		<Card
			key={workshop.id}
			sx={{
				backgroundColor:
					selectedWorkshop?.id === workshop.id
						? "rgba(56, 130, 246, 0.1)"
						: COLOR_SURFACE,
				border:
					selectedWorkshop?.id === workshop.id
						? `2px solid ${COLOR_PRIMARY}`
						: "1px solid rgba(255, 255, 255, 0.1)",
				cursor: "pointer",
				transition: "all 0.2s ease",
				"&:hover": {
					borderColor: COLOR_PRIMARY,
					transform: "translateY(-2px)",
				},
			}}
			onClick={() => handleWorkshopSelect(workshop)}
		>
			<CardContent sx={{ p: 3 }}>
				<Box
					sx={{
						display: "flex",
						justifyContent: "space-between",
						alignItems: "flex-start",
						mb: 2,
					}}
				>
					<Box sx={{ flex: 1 }}>
						<Typography
							variant="h6"
							sx={{ color: COLOR_TEXT_PRIMARY, fontWeight: 600, mb: 1 }}
						>
							{workshop.name}
						</Typography>
						<Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
							<LocationIcon
								sx={{ color: COLOR_TEXT_SECONDARY, fontSize: 16, mr: 0.5 }}
							/>
							<Typography variant="body2" sx={{ color: COLOR_TEXT_SECONDARY }}>
								{workshop.address_full || workshop.location}
							</Typography>
						</Box>
					</Box>

					{workshop.distance_km && (
						<Badge
							badgeContent={`${workshop.distance_km}km`}
							sx={{
								"& .MuiBadge-badge": {
									backgroundColor: COLOR_PRIMARY,
									color: "white",
									fontSize: "0.75rem",
									height: "20px",
									minWidth: "40px",
								},
							}}
						/>
					)}
				</Box>

				<Box
					sx={{
						display: "flex",
						alignItems: "center",
						justifyContent: "space-between",
						mb: 2,
					}}
				>
					<Box sx={{ display: "flex", alignItems: "center" }}>
						{workshop.rating !== undefined ? (
							<>
								<Rating
									value={Number(workshop.rating)}
									readOnly
									size="small"
									sx={{ mr: 1 }}
								/>
								<Typography
									variant="body2"
									sx={{ color: COLOR_TEXT_SECONDARY }}
								>
									({workshop.rating})
								</Typography>
							</>
						) : (
							<Typography variant="body2" sx={{ color: COLOR_TEXT_SECONDARY }}>
								Brak oceny
							</Typography>
						)}
					</Box>

					{workshop.specialization && (
						<Chip
							label={
								specializations.find((s) => s.value === workshop.specialization)
									?.label || workshop.specialization
							}
							size="small"
							sx={{
								backgroundColor: "rgba(56, 130, 246, 0.2)",
								color: COLOR_PRIMARY,
								border: `1px solid ${COLOR_PRIMARY}`,
							}}
						/>
					)}
				</Box>

				<Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
					{workshop.contact_phone && (
						<Box sx={{ display: "flex", alignItems: "center" }}>
							<PhoneIcon
								sx={{ fontSize: 14, color: COLOR_TEXT_SECONDARY, mr: 0.5 }}
							/>
							<Typography
								variant="caption"
								sx={{ color: COLOR_TEXT_SECONDARY }}
							>
								{workshop.contact_phone}
							</Typography>
						</Box>
					)}

					{workshop.contact_email && (
						<Box sx={{ display: "flex", alignItems: "center" }}>
							<EmailIcon
								sx={{ fontSize: 14, color: COLOR_TEXT_SECONDARY, mr: 0.5 }}
							/>
							<Typography
								variant="caption"
								sx={{ color: COLOR_TEXT_SECONDARY }}
							>
								{workshop.contact_email}
							</Typography>
						</Box>
					)}
				</Box>
			</CardContent>
		</Card>
	);

	return (
		<Box>
			{/* Filters and Search */}
			<Box sx={{ mb: 3 }}>
				<Grid container spacing={3} alignItems="center">
					<Grid item xs={12} md={4}>
						<TextField
							fullWidth
							label="Szukaj warsztatu..."
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
							sx={{
								"& .MuiInputLabel-root": {
									color: COLOR_TEXT_SECONDARY,
									"&.Mui-focused": { color: COLOR_PRIMARY },
								},
								"& .MuiInputBase-input": { color: COLOR_TEXT_PRIMARY },
								"& .MuiOutlinedInput-root": {
									"& fieldset": { borderColor: "rgba(255, 255, 255, 0.2)" },
									"&:hover fieldset": { borderColor: COLOR_PRIMARY },
									"&.Mui-focused fieldset": { borderColor: COLOR_PRIMARY },
								},
							}}
						/>
					</Grid>

					<Grid item xs={12} md={3}>
						<FormControl fullWidth>
							<InputLabel
								sx={{
									color: COLOR_TEXT_SECONDARY,
									"&.Mui-focused": { color: COLOR_PRIMARY },
								}}
							>
								Sortuj według
							</InputLabel>
							<Select
								value={sortBy}
								label="Sortuj według"
								onChange={(e) => setSortBy(e.target.value)}
								sx={{
									color: COLOR_TEXT_PRIMARY,
									"& .MuiSelect-icon": { color: COLOR_TEXT_SECONDARY },
									"& .MuiOutlinedInput-notchedOutline": {
										borderColor: "rgba(255, 255, 255, 0.2)",
									},
									"&:hover .MuiOutlinedInput-notchedOutline": {
										borderColor: COLOR_PRIMARY,
									},
									"&.Mui-focused .MuiOutlinedInput-notchedOutline": {
										borderColor: COLOR_PRIMARY,
									},
								}}
							>
								<MenuItem value="name">Nazwa</MenuItem>
								<MenuItem value="rating">Ocena</MenuItem>
								<MenuItem value="distance" disabled={!userLocation}>
									Odległość
								</MenuItem>
							</Select>
						</FormControl>
					</Grid>

					<Grid item xs={12} md={3}>
						<FormControl fullWidth>
							<InputLabel
								sx={{
									color: COLOR_TEXT_SECONDARY,
									"&.Mui-focused": { color: COLOR_PRIMARY },
								}}
							>
								Specjalizacja
							</InputLabel>
							<Select
								value={specialization}
								label="Specjalizacja"
								onChange={(e) => setSpecialization(e.target.value)}
								sx={{
									color: COLOR_TEXT_PRIMARY,
									"& .MuiSelect-icon": { color: COLOR_TEXT_SECONDARY },
									"& .MuiOutlinedInput-notchedOutline": {
										borderColor: "rgba(255, 255, 255, 0.2)",
									},
									"&:hover .MuiOutlinedInput-notchedOutline": {
										borderColor: COLOR_PRIMARY,
									},
									"&.Mui-focused .MuiOutlinedInput-notchedOutline": {
										borderColor: COLOR_PRIMARY,
									},
								}}
							>
								<MenuItem value="">Wszystkie</MenuItem>
								{specializations.map((spec) => (
									<MenuItem key={spec.value} value={spec.value}>
										{spec.label}
									</MenuItem>
								))}
							</Select>
						</FormControl>
					</Grid>

					<Grid item xs={12} md={2}>
						<Button
							fullWidth
							variant="outlined"
							startIcon={<MyLocationIcon />}
							onClick={requestLocation}
							disabled={loading}
							sx={{
								color: userLocation ? COLOR_PRIMARY : COLOR_TEXT_PRIMARY,
								borderColor: userLocation
									? COLOR_PRIMARY
									: "rgba(255, 255, 255, 0.3)",
								"&:hover": {
									borderColor: COLOR_PRIMARY,
									backgroundColor: "rgba(56, 130, 246, 0.1)",
								},
							}}
						>
							{userLocation ? "Lokalizacja" : "Znajdź"}
						</Button>
					</Grid>
				</Grid>

				{locationError && (
					<Alert severity="warning" sx={{ mt: 2 }}>
						{locationError}
					</Alert>
				)}
			</Box>
			{/* View Toggle */}
			<Box
				sx={{
					mb: 3,
					display: "flex",
					justifyContent: "space-between",
					alignItems: "center",
				}}
			>
				<Typography variant="h6" sx={{ color: COLOR_TEXT_PRIMARY }}>
					Dostępne warsztaty ({workshops.length})
				</Typography>

				<Tabs
					value={viewMode}
					onChange={(_, newValue) => setViewMode(newValue)}
					sx={{
						minHeight: "auto",
						"& .MuiTab-root": {
							color: COLOR_TEXT_SECONDARY,
							minHeight: "auto",
							padding: "8px 16px",
							"&.Mui-selected": { color: COLOR_PRIMARY },
						},
						"& .MuiTabs-indicator": { backgroundColor: COLOR_PRIMARY },
					}}
				>
					<Tab icon={<ListIcon />} value="list" label="Lista" />
					<Tab icon={<MapIcon />} value="map" label="Mapa" />
				</Tabs>
			</Box>
			{/* Results */}
			{loading ? (
				<Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
					<CircularProgress sx={{ color: COLOR_PRIMARY }} />
				</Box>
			) : workshops.length === 0 ? (
				<Alert severity="info" sx={{ mt: 2 }}>
					Nie znaleziono warsztatów spełniających kryteria wyszukiwania.
				</Alert>
			) : viewMode === "map" ? (
				<Box
					sx={{
						height: 400,
						borderRadius: 2,
						border: "1px solid rgba(255, 255, 255, 0.1)",
						overflow: "hidden",
					}}
				>
					{renderMap()}
				</Box>
			) : (
				<Grid container spacing={3}>
					{workshops.map((workshop) => (
						<Grid item xs={12} md={6} key={workshop.id}>
							{renderWorkshopCard(workshop)}
						</Grid>
					))}
				</Grid>
			)}{" "}
			{/* Selected Workshop Summary */}
			{selectedWorkshop && (
				<Box
					sx={{
						mt: 4,
						p: 3,
						backgroundColor: "rgba(56, 130, 246, 0.1)",
						borderRadius: 2,
						border: `1px solid ${COLOR_PRIMARY}`,
					}}
				>
					<Typography variant="h6" sx={{ color: COLOR_PRIMARY, mb: 2 }}>
						✓ Wybrany warsztat
					</Typography>
					<Typography
						variant="body1"
						sx={{ color: COLOR_TEXT_PRIMARY, fontWeight: 600 }}
					>
						{selectedWorkshop.name}
					</Typography>
					<Typography variant="body2" sx={{ color: COLOR_TEXT_SECONDARY }}>
						{selectedWorkshop.address_full || selectedWorkshop.location}
					</Typography>
				</Box>
			)}
		</Box>
	);
};

export default WorkshopSelectionStep;
