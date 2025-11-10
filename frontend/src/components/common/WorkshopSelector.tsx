import React, { useState, useEffect } from "react";
import {
	CircularProgress,
	Box,
	Typography,
	Avatar,
	Chip,
	TextField,
	InputAdornment,
	Autocomplete,
	Paper,
	MenuItem,
} from "@mui/material";
import BuildIcon from "@mui/icons-material/Build";
import SearchIcon from "@mui/icons-material/Search";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import { workshopService } from "../../api/WorkshopAPIEndpoint";
import {
	COLOR_PRIMARY,
	COLOR_SURFACE,
	COLOR_TEXT_PRIMARY,
	COLOR_TEXT_SECONDARY,
} from "../../constants";

interface Workshop {
	id: number;
	name: string;
	location: string;
	city?: string;
	address?: string;
	phone?: string;
	email?: string;
}

interface WorkshopSelectorProps {
	value: number | null;
	onChange?: (workshopId: number | null) => void;
	disabled?: boolean;
	error?: string;
}

const WorkshopSelector: React.FC<WorkshopSelectorProps> = ({
	value,
	onChange,
	disabled = false,
	error,
}) => {
	const [workshops, setWorkshops] = useState<Workshop[]>([]);
	const [loading, setLoading] = useState(true);
	const [loadError, setLoadError] = useState<string | null>(null);
	const [searchQuery, setSearchQuery] = useState("");
	const [filteredWorkshops, setFilteredWorkshops] = useState<Workshop[]>([]);

	useEffect(() => {
		const fetchWorkshops = async () => {
			try {
				setLoading(true);
				const data = await workshopService.getAllWorkshops();
				setWorkshops(data);
				setFilteredWorkshops(data);
				setLoadError(null);
			} catch (err) {
				setLoadError("Failed to load workshops list");
			} finally {
				setLoading(false);
			}
		};

		fetchWorkshops();
	}, []);

	useEffect(() => {
		if (searchQuery.trim() === "") {
			setFilteredWorkshops(workshops);
			return;
		}

		const query = searchQuery.toLowerCase();
		const filtered = workshops.filter(
			(workshop) =>
				workshop.name.toLowerCase().includes(query) ||
				workshop.location.toLowerCase().includes(query) ||
				(workshop.city && workshop.city.toLowerCase().includes(query))
		);
		setFilteredWorkshops(filtered);
	}, [searchQuery, workshops]);

	const selectedWorkshop = workshops.find((w) => w.id === value);

	const handleWorkshopChange = (newValue: Workshop | null) => {
		if (typeof onChange === "function") {
			onChange(newValue ? newValue.id : null);
		} else {
		}
	};

	return (
		<>
			<Autocomplete
				value={selectedWorkshop || null}
				onChange={(_, newValue) => handleWorkshopChange(newValue)}
				options={filteredWorkshops}
				getOptionLabel={(option) => option.name}
				loading={loading}
				disabled={disabled}
				sx={{
					mb: 2,
					"& .MuiAutocomplete-input": {
						color: `${COLOR_TEXT_PRIMARY} !important`,
					},
				}}
				renderInput={(params) => (
					<TextField
						{...params}
						label="Search Workshops"
						variant="outlined"
						error={!!error || !!loadError}
						helperText={error || loadError}
						onChange={(e) => setSearchQuery(e.target.value)}
						sx={{
							"& .MuiOutlinedInput-root": {
								backgroundColor: COLOR_SURFACE,
								color: COLOR_TEXT_PRIMARY,
								"& fieldset": {
									borderColor: "rgba(228, 230, 232, 0.3)",
								},
								"&:hover fieldset": {
									borderColor: "rgba(228, 230, 232, 0.5)",
								},
								"&.Mui-focused fieldset": {
									borderColor: COLOR_PRIMARY,
								},
								"& input": {
									color: `${COLOR_TEXT_PRIMARY} !important`,
									"&::placeholder": {
										color: COLOR_TEXT_SECONDARY,
										opacity: 0.8,
									},
								},
								"& .MuiAutocomplete-input": {
									color: `${COLOR_TEXT_PRIMARY} !important`,
								},
							},
							"& .MuiInputLabel-root": {
								color: COLOR_TEXT_SECONDARY,
								"&.Mui-focused": {
									color: COLOR_PRIMARY,
								},
								"&.MuiFormLabel-filled": {
									color: COLOR_TEXT_SECONDARY,
								},
								"&.Mui-shrink": {
									color: COLOR_TEXT_SECONDARY,
								},
							},
							"& .MuiFormHelperText-root": {
								color: COLOR_TEXT_SECONDARY,
								"&.Mui-error": {
									color: "#ff6b6b",
								},
							},
							"& .MuiAutocomplete-clearIndicator": {
								color: COLOR_TEXT_SECONDARY,
							},
							"& .MuiAutocomplete-popupIndicator": {
								color: COLOR_TEXT_SECONDARY,
							},
						}}
						InputProps={{
							...params.InputProps,
							startAdornment: (
								<>
									<InputAdornment position="start">
										<SearchIcon sx={{ color: COLOR_TEXT_SECONDARY }} />
									</InputAdornment>
									{params.InputProps.startAdornment}
								</>
							),
							endAdornment: (
								<>
									{loading ? (
										<CircularProgress color="inherit" size={20} />
									) : null}
									{params.InputProps.endAdornment}
								</>
							),
						}}
					/>
				)}
				renderOption={(props, option) => {
					const { key, ...otherProps } = props;
					return (
						<MenuItem
							key={key}
							{...otherProps}
							component="li"
							sx={{
								py: 1.5,
								backgroundColor: COLOR_SURFACE,
								color: COLOR_TEXT_PRIMARY,
								"&:hover": { backgroundColor: "rgba(56, 130, 246, 0.1)" },
							}}
						>
							<Box
								sx={{ display: "flex", alignItems: "center", width: "100%" }}
							>
								<Avatar sx={{ mr: 1.5, bgcolor: COLOR_PRIMARY }}>
									<BuildIcon />
								</Avatar>
								<Box sx={{ flexGrow: 1 }}>
									<Typography
										variant="subtitle1"
										fontWeight="medium"
										sx={{ color: COLOR_TEXT_PRIMARY }}
									>
										{option.name}
									</Typography>
									<Typography
										variant="body2"
										sx={{
											color: COLOR_TEXT_SECONDARY,
											display: "flex",
											alignItems: "center",
											mt: 0.5,
										}}
									>
										<LocationOnIcon
											fontSize="small"
											sx={{
												mr: 0.5,
												fontSize: "0.9rem",
												color: COLOR_TEXT_SECONDARY,
											}}
										/>
										{option.location}
									</Typography>
								</Box>
							</Box>
						</MenuItem>
					);
				}}
				noOptionsText={
					<Box sx={{ p: 1, textAlign: "center" }}>
						<Typography variant="body2" sx={{ color: COLOR_TEXT_SECONDARY }}>
							No workshops found
						</Typography>
					</Box>
				}
				PaperComponent={(props) => (
					<Paper
						{...props}
						elevation={3}
						sx={{
							borderRadius: 2,
							mt: 0.5,
							backgroundColor: COLOR_SURFACE,
							border: `1px solid rgba(228, 230, 232, 0.1)`,
						}}
					/>
				)}
			/>

			{selectedWorkshop && (
				<Box
					sx={{
						p: 3,
						mt: 2,
						borderRadius: 2,
						backgroundColor: COLOR_SURFACE,
					}}
				>
					<Typography
						variant="subtitle2"
						sx={{ color: COLOR_TEXT_SECONDARY }}
						gutterBottom
					>
						Selected Workshop
					</Typography>
					<Box sx={{ display: "flex", alignItems: "center" }}>
						<Avatar sx={{ mr: 2, bgcolor: COLOR_PRIMARY }}>
							<BuildIcon />
						</Avatar>
						<Box>
							<Typography
								variant="body1"
								fontWeight="medium"
								sx={{ color: COLOR_TEXT_PRIMARY }}
							>
								{selectedWorkshop.name}
							</Typography>
							<Typography
								variant="body2"
								sx={{
									color: COLOR_TEXT_SECONDARY,
									display: "flex",
									alignItems: "center",
									mt: 0.5,
								}}
							>
								<LocationOnIcon
									fontSize="small"
									sx={{
										mr: 0.5,
										fontSize: "0.9rem",
										color: COLOR_TEXT_SECONDARY,
									}}
								/>
								{selectedWorkshop.location}
							</Typography>
							{selectedWorkshop.phone && (
								<Chip
									label={selectedWorkshop.phone}
									size="small"
									variant="outlined"
									sx={{
										mr: 1,
										mt: 1,
										color: COLOR_TEXT_PRIMARY,
										borderColor: "rgba(228, 230, 232, 0.3)",
									}}
								/>
							)}
							{selectedWorkshop.email && (
								<Chip
									label={selectedWorkshop.email}
									size="small"
									variant="outlined"
									sx={{
										mt: 1,
										color: COLOR_TEXT_PRIMARY,
										borderColor: "rgba(228, 230, 232, 0.3)",
									}}
								/>
							)}
						</Box>
					</Box>
				</Box>
			)}
		</>
	);
};

export default WorkshopSelector;
