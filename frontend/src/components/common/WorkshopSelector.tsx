import React, { useState, useEffect } from "react";
import {
	FormControl,
	InputLabel,
	Select,
	MenuItem,
	FormHelperText,
	CircularProgress,
	Box,
	Typography,
	Avatar,
	Chip,
	TextField,
	InputAdornment,
	Autocomplete,
	Paper,
} from "@mui/material";
import BuildIcon from "@mui/icons-material/Build";
import SearchIcon from "@mui/icons-material/Search";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import { workshopService } from "../../api/WorkshopAPIEndpoint";

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
				renderInput={(params) => (
					<TextField
						{...params}
						label="Search Workshops"
						variant="outlined"
						error={!!error || !!loadError}
						helperText={error || loadError}
						onChange={(e) => setSearchQuery(e.target.value)}
						InputProps={{
							...params.InputProps,
							startAdornment: (
								<>
									<InputAdornment position="start">
										<SearchIcon color="action" />
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
						<MenuItem key={key} {...otherProps} component="li" sx={{ py: 1.5 }}>
							<Box
								sx={{ display: "flex", alignItems: "center", width: "100%" }}
							>
								<Avatar sx={{ mr: 1.5, bgcolor: "#ff3c4e" }}>
									<BuildIcon />
								</Avatar>
								<Box sx={{ flexGrow: 1 }}>
									<Typography variant="subtitle1" fontWeight="medium">
										{option.name}
									</Typography>
									<Typography
										variant="body2"
										color="text.secondary"
										sx={{ display: "flex", alignItems: "center", mt: 0.5 }}
									>
										<LocationOnIcon
											fontSize="small"
											sx={{ mr: 0.5, fontSize: "0.9rem" }}
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
						<Typography variant="body2" color="text.secondary">
							No workshops found
						</Typography>
					</Box>
				}
				PaperComponent={(props) => (
					<Paper {...props} elevation={3} sx={{ borderRadius: 2, mt: 0.5 }} />
				)}
				sx={{ mb: 2 }}
			/>

			{selectedWorkshop && (
				<Paper
					variant="outlined"
					sx={{
						p: 2,
						mt: 2,
						borderRadius: 2,
						boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
						borderColor: "#e0e0e0",
						borderWidth: "1px",
						borderStyle: "solid",
					}}
				>
					<Typography variant="subtitle2" color="text.secondary" gutterBottom>
						Selected Workshop
					</Typography>
					<Box sx={{ display: "flex", alignItems: "center" }}>
						<Avatar sx={{ mr: 2, bgcolor: "#ff3c4e" }}>
							<BuildIcon />
						</Avatar>
						<Box>
							<Typography variant="body1" fontWeight="medium">
								{selectedWorkshop.name}
							</Typography>
							<Typography
								variant="body2"
								color="text.secondary"
								sx={{ display: "flex", alignItems: "center", mt: 0.5 }}
							>
								<LocationOnIcon
									fontSize="small"
									sx={{ mr: 0.5, fontSize: "0.9rem" }}
								/>
								{selectedWorkshop.location}
							</Typography>
							{selectedWorkshop.phone && (
								<Chip
									label={selectedWorkshop.phone}
									size="small"
									variant="outlined"
									sx={{ mr: 1, mt: 1 }}
								/>
							)}
							{selectedWorkshop.email && (
								<Chip
									label={selectedWorkshop.email}
									size="small"
									variant="outlined"
									sx={{ mt: 1 }}
								/>
							)}
						</Box>
					</Box>
				</Paper>
			)}
		</>
	);
};

export default WorkshopSelector;
