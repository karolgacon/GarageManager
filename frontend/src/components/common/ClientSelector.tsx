import React, { useState, useEffect } from "react";
import {
	MenuItem,
	CircularProgress,
	Box,
	Typography,
	Avatar,
	TextField,
	InputAdornment,
	Autocomplete,
	Paper,
} from "@mui/material";
import EmailIcon from "@mui/icons-material/Email";
import SearchIcon from "@mui/icons-material/Search";
import { UserService } from "../../api/UserAPIEndpoint";
import {
	COLOR_PRIMARY,
	COLOR_SURFACE,
	COLOR_TEXT_PRIMARY,
	COLOR_TEXT_SECONDARY,
} from "../../constants";

interface Client {
	id: number;
	full_name?: string;
	email: string;
	first_name?: string;
	last_name?: string;
	username?: string;
	phone_number?: string;
}

interface ClientSelectorProps {
	value: number | null;
	onChange: (clientId: number | null) => void;
	disabled?: boolean;
	error?: string;
}

const ClientSelector: React.FC<ClientSelectorProps> = ({
	value,
	onChange,
	disabled = false,
	error,
}) => {
	const [clients, setClients] = useState<Client[]>([]);
	const [loading, setLoading] = useState(true);
	const [loadError, setLoadError] = useState<string | null>(null);
	const [searchQuery, setSearchQuery] = useState("");
	const [filteredClients, setFilteredClients] = useState<Client[]>([]);

	useEffect(() => {
		const fetchClients = async () => {
			try {
				setLoading(true);
				const data = await UserService.getClients();
				setClients(data);
				setFilteredClients(data);
				setLoadError(null);
			} catch (err) {
				setLoadError("Failed to load clients list");
			} finally {
				setLoading(false);
			}
		};

		fetchClients();
	}, []);

	useEffect(() => {
		if (searchQuery.trim() === "") {
			setFilteredClients(clients);
			return;
		}

		const query = searchQuery.toLowerCase();
		const filtered = clients.filter(
			(client) =>
				(client.full_name && client.full_name.toLowerCase().includes(query)) ||
				client.email.toLowerCase().includes(query) ||
				(client.first_name &&
					client.first_name.toLowerCase().includes(query)) ||
				(client.last_name && client.last_name.toLowerCase().includes(query)) ||
				(client.username && client.username.toLowerCase().includes(query))
		);
		setFilteredClients(filtered);
	}, [searchQuery, clients]);

	const getClientDisplayName = (client: Client) => {
		if (client.full_name) return client.full_name;
		if (client.first_name && client.last_name)
			return `${client.first_name} ${client.last_name}`;
		if (client.username) return client.username;
		return client.email;
	};

	const selectedClient = clients.find((c) => c.id === value);

	return (
		<>
			<Autocomplete
				value={selectedClient || null}
				onChange={(_, newValue) => onChange(newValue ? newValue.id : null)}
				options={filteredClients}
				getOptionLabel={(option) => getClientDisplayName(option)}
				loading={loading}
				disabled={disabled}
				renderInput={(params) => (
					<TextField
						{...params}
						label="Search Clients"
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
							},
							"& .MuiInputLabel-root": {
								color: COLOR_TEXT_SECONDARY,
								"&.Mui-focused": {
									color: COLOR_PRIMARY,
								},
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
				renderOption={(props, option) => (
					<MenuItem
						{...props}
						component="li"
						sx={{
							py: 1.5,
							backgroundColor: COLOR_SURFACE,
							color: COLOR_TEXT_PRIMARY,
							"&:hover": {
								backgroundColor: "rgba(56, 130, 246, 0.1)",
							},
						}}
					>
						<Box sx={{ display: "flex", alignItems: "center", width: "100%" }}>
							<Avatar sx={{ mr: 1.5, bgcolor: COLOR_PRIMARY }}>
								{option.first_name
									? option.first_name.charAt(0).toUpperCase()
									: "C"}
							</Avatar>
							<Box sx={{ flexGrow: 1 }}>
								<Typography
									variant="subtitle1"
									fontWeight="medium"
									sx={{ color: COLOR_TEXT_PRIMARY }}
								>
									{getClientDisplayName(option)}
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
									<EmailIcon
										fontSize="small"
										sx={{
											mr: 0.5,
											fontSize: "0.9rem",
											color: COLOR_TEXT_SECONDARY,
										}}
									/>
									{option.email}
								</Typography>
							</Box>
						</Box>
					</MenuItem>
				)}
				noOptionsText={
					<Box sx={{ p: 1, textAlign: "center" }}>
						<Typography variant="body2" sx={{ color: COLOR_TEXT_SECONDARY }}>
							No clients found
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
				sx={{ mb: 2 }}
			/>

			{selectedClient && (
				<Paper
					variant="outlined"
					sx={{
						p: 2,
						mt: 2,
						borderRadius: 2,
						backgroundColor: COLOR_SURFACE,
						borderColor: "rgba(228, 230, 232, 0.1)",
						borderWidth: "1px",
						borderStyle: "solid",
					}}
				>
					<Typography
						variant="subtitle2"
						sx={{ color: COLOR_TEXT_SECONDARY }}
						gutterBottom
					>
						Selected Client
					</Typography>
					<Box sx={{ display: "flex", alignItems: "center" }}>
						<Avatar sx={{ mr: 2, bgcolor: COLOR_PRIMARY }}>
							{selectedClient.first_name
								? selectedClient.first_name.charAt(0).toUpperCase()
								: "C"}
						</Avatar>
						<Box>
							<Typography
								variant="body1"
								fontWeight="medium"
								sx={{ color: COLOR_TEXT_PRIMARY }}
							>
								{getClientDisplayName(selectedClient)}
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
								<EmailIcon
									fontSize="small"
									sx={{
										mr: 0.5,
										fontSize: "0.9rem",
										color: COLOR_TEXT_SECONDARY,
									}}
								/>
								{selectedClient.email}
							</Typography>
							{selectedClient.phone_number && (
								<Typography
									variant="body2"
									sx={{
										color: COLOR_TEXT_SECONDARY,
										mt: 0.5,
									}}
								>
									Phone: {selectedClient.phone_number}
								</Typography>
							)}
						</Box>
					</Box>
				</Paper>
			)}
		</>
	);
};

export default ClientSelector;
