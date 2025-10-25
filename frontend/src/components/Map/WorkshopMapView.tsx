import React, { useState, useEffect } from "react";
import {
	Box,
	Card,
	CardContent,
	Typography,
	TextField,
	Button,
	Slider,
	FormControlLabel,
	Switch,
	Chip,
	List,
	ListItem,
	ListItemText,
	ListItemSecondaryAction,
	IconButton,
	Dialog,
	DialogTitle,
	DialogContent,
	DialogActions,
	Grid,
	Alert,
} from "@mui/material";
import {
	LocationOn as LocationIcon,
	Star as StarIcon,
	Phone as PhoneIcon,
	Email as EmailIcon,
	Directions as DirectionsIcon,
	Info as InfoIcon,
} from "@mui/icons-material";
import axios from "axios";
import { BASE_API_URL } from "../../constants";

interface Workshop {
	id: number;
	name: string;
	location: string;
	latitude?: number;
	longitude?: number;
	specialization: string;
	contact_email?: string;
	contact_phone?: string;
	rating: number;
	working_hours: string;
	distance?: number; // Will be calculated
}

interface MapComponentProps {
	userLatitude?: number;
	userLongitude?: number;
	onWorkshopSelect?: (workshop: Workshop) => void;
}

const WorkshopMapView: React.FC<MapComponentProps> = ({
	userLatitude,
	userLongitude,
	onWorkshopSelect,
}) => {
	const [workshops, setWorkshops] = useState<Workshop[]>([]);
	const [loading, setLoading] = useState(false);
	const [selectedWorkshop, setSelectedWorkshop] = useState<Workshop | null>(
		null
	);
	const [searchRadius, setSearchRadius] = useState(50); // km
	const [showOnlyWithLocation, setShowOnlyWithLocation] = useState(true);
	const [userLocation, setUserLocation] = useState<{
		lat: number;
		lng: number;
	} | null>(null);
	const [locationError, setLocationError] = useState<string | null>(null);

	useEffect(() => {
		if (userLatitude && userLongitude) {
			setUserLocation({ lat: userLatitude, lng: userLongitude });
		} else {
			getCurrentLocation();
		}
	}, [userLatitude, userLongitude]);

	useEffect(() => {
		if (userLocation) {
			fetchNearbyWorkshops();
		} else {
			fetchAllWorkshops();
		}
	}, [userLocation, searchRadius, showOnlyWithLocation]);

	const getCurrentLocation = () => {
		setLocationError(null);

		if (!navigator.geolocation) {
			setLocationError(
				"Geolokalizacja nie jest wspierana przez tę przeglądarkę"
			);
			fetchAllWorkshops();
			return;
		}

		navigator.geolocation.getCurrentPosition(
			(position) => {
				setUserLocation({
					lat: position.coords.latitude,
					lng: position.coords.longitude,
				});
			},
			(error) => {
				setLocationError(
					"Nie można uzyskać lokalizacji. Pokazywane są wszystkie warsztaty."
				);
				fetchAllWorkshops();
			}
		);
	};

	const fetchNearbyWorkshops = async () => {
		if (!userLocation) return;

		setLoading(true);
		try {
			const token = localStorage.getItem("access_token");
			const response = await axios.get(
				`${BASE_API_URL}/api/v1/workshops/nearby/`,
				{
					params: {
						latitude: userLocation.lat,
						longitude: userLocation.lng,
						radius: searchRadius,
					},
					headers: { Authorization: `Bearer ${token}` },
				}
			);

			let workshopsData = response.data;

			// Calculate distances
			workshopsData = workshopsData.map((workshop: Workshop) => ({
				...workshop,
				distance:
					workshop.latitude && workshop.longitude
						? calculateDistance(
								userLocation.lat,
								userLocation.lng,
								workshop.latitude,
								workshop.longitude
						  )
						: null,
			}));

			// Sort by distance
			workshopsData.sort((a: Workshop, b: Workshop) => {
				if (a.distance === null) return 1;
				if (b.distance === null) return -1;
				return a.distance - b.distance;
			});

			setWorkshops(workshopsData);
		} catch (error) {
			console.error("Error fetching nearby workshops:", error);
			fetchAllWorkshops();
		} finally {
			setLoading(false);
		}
	};

	const fetchAllWorkshops = async () => {
		setLoading(true);
		try {
			const token = localStorage.getItem("access_token");
			const response = await axios.get(`${BASE_API_URL}/api/v1/workshops/`, {
				headers: { Authorization: `Bearer ${token}` },
			});

			let workshopsData = response.data;

			if (showOnlyWithLocation) {
				workshopsData = workshopsData.filter(
					(w: Workshop) => w.latitude !== null && w.longitude !== null
				);
			}

			setWorkshops(workshopsData);
		} catch (error) {
			console.error("Error fetching workshops:", error);
		} finally {
			setLoading(false);
		}
	};

	const calculateDistance = (
		lat1: number,
		lng1: number,
		lat2: number,
		lng2: number
	): number => {
		const R = 6371; // Radius of the Earth in kilometers
		const dLat = toRadians(lat2 - lat1);
		const dLng = toRadians(lng2 - lng1);
		const a =
			Math.sin(dLat / 2) * Math.sin(dLat / 2) +
			Math.cos(toRadians(lat1)) *
				Math.cos(toRadians(lat2)) *
				Math.sin(dLng / 2) *
				Math.sin(dLng / 2);
		const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
		return R * c;
	};

	const toRadians = (degrees: number): number => {
		return degrees * (Math.PI / 180);
	};

	const getSpecializationColor = (specialization: string) => {
		const colors: {
			[key: string]: "primary" | "secondary" | "success" | "error" | "warning";
		} = {
			general: "primary",
			electric: "success",
			diesel: "warning",
			bodywork: "secondary",
			luxury: "error",
		};
		return colors[specialization] || "primary";
	};

	const openDirections = (workshop: Workshop) => {
		if (workshop.latitude && workshop.longitude) {
			const url = `https://www.google.com/maps/dir/?api=1&destination=${workshop.latitude},${workshop.longitude}`;
			window.open(url, "_blank");
		}
	};

	const handleWorkshopClick = (workshop: Workshop) => {
		setSelectedWorkshop(workshop);
		onWorkshopSelect?.(workshop);
	};

	return (
		<Box>
			{/* Controls */}
			<Card sx={{ mb: 3 }}>
				<CardContent>
					<Typography variant="h6" gutterBottom>
						Wyszukiwanie warsztatów
					</Typography>

					{locationError && (
						<Alert severity="warning" sx={{ mb: 2 }}>
							{locationError}
						</Alert>
					)}

					<Grid container spacing={2} alignItems="center">
						<Grid item xs={12} md={6}>
							<Typography gutterBottom>
								Promień wyszukiwania: {searchRadius} km
							</Typography>
							<Slider
								value={searchRadius}
								onChange={(_, value) => setSearchRadius(value as number)}
								min={5}
								max={200}
								step={5}
								disabled={!userLocation}
								valueLabelDisplay="auto"
							/>
						</Grid>

						<Grid item xs={12} md={6}>
							<Box display="flex" flexDirection="column" gap={1}>
								<FormControlLabel
									control={
										<Switch
											checked={showOnlyWithLocation}
											onChange={(e) =>
												setShowOnlyWithLocation(e.target.checked)
											}
										/>
									}
									label="Tylko z lokalizacją na mapie"
								/>

								<Button
									variant="outlined"
									onClick={getCurrentLocation}
									startIcon={<LocationIcon />}
								>
									Aktualizuj lokalizację
								</Button>
							</Box>
						</Grid>
					</Grid>
				</CardContent>
			</Card>

			{/* Workshop List */}
			<Card>
				<CardContent>
					<Typography variant="h6" gutterBottom>
						Znalezione warsztaty ({workshops.length})
					</Typography>

					{loading ? (
						<Typography>Ładowanie warsztatów...</Typography>
					) : (
						<List>
							{workshops.map((workshop) => (
								<ListItem
									key={workshop.id}
									button
									onClick={() => handleWorkshopClick(workshop)}
									sx={{
										border: "1px solid",
										borderColor: "divider",
										borderRadius: 1,
										mb: 1,
									}}
								>
									<ListItemText
										primary={
											<Box display="flex" alignItems="center" gap={1}>
												<Typography variant="h6">{workshop.name}</Typography>
												<Chip
													label={workshop.specialization}
													color={getSpecializationColor(
														workshop.specialization
													)}
													size="small"
												/>
											</Box>
										}
										secondary={
											<Box>
												<Box display="flex" alignItems="center" gap={1} mt={1}>
													<LocationIcon fontSize="small" />
													<Typography variant="body2">
														{workshop.location}
													</Typography>
													{workshop.distance && (
														<Chip
															label={`${workshop.distance.toFixed(1)} km`}
															size="small"
															variant="outlined"
														/>
													)}
												</Box>

												<Box
													display="flex"
													alignItems="center"
													gap={1}
													mt={0.5}
												>
													<StarIcon fontSize="small" color="warning" />
													<Typography variant="body2">
														{workshop.rating}/5
													</Typography>
													<Typography variant="body2" color="text.secondary">
														• {workshop.working_hours}
													</Typography>
												</Box>

												{(workshop.contact_phone || workshop.contact_email) && (
													<Box
														display="flex"
														alignItems="center"
														gap={2}
														mt={0.5}
													>
														{workshop.contact_phone && (
															<Box display="flex" alignItems="center" gap={0.5}>
																<PhoneIcon fontSize="small" />
																<Typography variant="body2">
																	{workshop.contact_phone}
																</Typography>
															</Box>
														)}
														{workshop.contact_email && (
															<Box display="flex" alignItems="center" gap={0.5}>
																<EmailIcon fontSize="small" />
																<Typography variant="body2">
																	{workshop.contact_email}
																</Typography>
															</Box>
														)}
													</Box>
												)}
											</Box>
										}
									/>

									<ListItemSecondaryAction>
										<Box display="flex" flexDirection="column" gap={1}>
											{workshop.latitude && workshop.longitude && (
												<IconButton
													edge="end"
													onClick={(e) => {
														e.stopPropagation();
														openDirections(workshop);
													}}
													title="Nawigacja"
												>
													<DirectionsIcon />
												</IconButton>
											)}

											<IconButton
												edge="end"
												onClick={(e) => {
													e.stopPropagation();
													setSelectedWorkshop(workshop);
												}}
												title="Szczegóły"
											>
												<InfoIcon />
											</IconButton>
										</Box>
									</ListItemSecondaryAction>
								</ListItem>
							))}
						</List>
					)}

					{workshops.length === 0 && !loading && (
						<Typography color="text.secondary" textAlign="center" py={4}>
							Brak warsztatów w określonym promieniu
						</Typography>
					)}
				</CardContent>
			</Card>

			{/* Workshop Details Dialog */}
			<Dialog
				open={!!selectedWorkshop}
				onClose={() => setSelectedWorkshop(null)}
				maxWidth="sm"
				fullWidth
			>
				{selectedWorkshop && (
					<>
						<DialogTitle>
							<Box display="flex" alignItems="center" gap={1}>
								{selectedWorkshop.name}
								<Chip
									label={selectedWorkshop.specialization}
									color={getSpecializationColor(
										selectedWorkshop.specialization
									)}
									size="small"
								/>
							</Box>
						</DialogTitle>

						<DialogContent>
							<Box display="flex" flexDirection="column" gap={2}>
								<Box display="flex" alignItems="center" gap={1}>
									<LocationIcon />
									<Typography>{selectedWorkshop.location}</Typography>
									{selectedWorkshop.distance && (
										<Chip
											label={`${selectedWorkshop.distance.toFixed(1)} km`}
											size="small"
											variant="outlined"
										/>
									)}
								</Box>

								<Box display="flex" alignItems="center" gap={1}>
									<StarIcon color="warning" />
									<Typography>Ocena: {selectedWorkshop.rating}/5</Typography>
								</Box>

								<Typography>
									<strong>Godziny pracy:</strong>{" "}
									{selectedWorkshop.working_hours}
								</Typography>

								{selectedWorkshop.contact_phone && (
									<Box display="flex" alignItems="center" gap={1}>
										<PhoneIcon />
										<Typography>{selectedWorkshop.contact_phone}</Typography>
									</Box>
								)}

								{selectedWorkshop.contact_email && (
									<Box display="flex" alignItems="center" gap={1}>
										<EmailIcon />
										<Typography>{selectedWorkshop.contact_email}</Typography>
									</Box>
								)}
							</Box>
						</DialogContent>

						<DialogActions>
							<Button onClick={() => setSelectedWorkshop(null)}>Zamknij</Button>
							{selectedWorkshop.latitude && selectedWorkshop.longitude && (
								<Button
									onClick={() => openDirections(selectedWorkshop)}
									variant="contained"
									startIcon={<DirectionsIcon />}
								>
									Nawigacja
								</Button>
							)}
						</DialogActions>
					</>
				)}
			</Dialog>
		</Box>
	);
};

export default WorkshopMapView;
