import React, { useState, useEffect } from "react";
import {
	Box,
	Grid,
	Card,
	CardContent,
	Typography,
	TextField,
	FormControl,
	RadioGroup,
	FormControlLabel,
	Radio,
	Alert,
	Chip,
} from "@mui/material";
import {
	Build as ServiceIcon,
	Assignment as InspectionIcon,
	Search as DiagnosticIcon,
	Handyman as RepairIcon,
	Schedule as MaintenanceIcon,
	Help as OtherIcon,
	PriorityHigh as PriorityIcon,
} from "@mui/icons-material";
import {
	COLOR_PRIMARY,
	COLOR_SURFACE,
	COLOR_TEXT_PRIMARY,
	COLOR_TEXT_SECONDARY,
} from "../../../constants";

interface ServiceDescriptionStepProps {
	appointmentType?: string;
	serviceDescription?: string;
	priority?: string;
	onDataChange: (data: {
		appointmentType?: string;
		serviceDescription?: string;
		priority?: string;
	}) => void;
	onValidationChange: (isValid: boolean) => void;
}

const appointmentTypes = [
	{
		value: "service",
		label: "Service",
		description: "Regular service, part replacements",
		icon: <ServiceIcon />,
		duration: 120,
	},
	{
		value: "inspection",
		label: "Inspection",
		description: "Periodic inspection, technical check",
		icon: <InspectionIcon />,
		duration: 60,
	},
	{
		value: "diagnostic",
		label: "Diagnostic",
		description: "Computer diagnostics, issue identification",
		icon: <DiagnosticIcon />,
		duration: 90,
	},
	{
		value: "repair",
		label: "Repair",
		description: "Damage repair, breakdowns",
		icon: <RepairIcon />,
		duration: 180,
	},
	{
		value: "maintenance",
		label: "Maintenance",
		description: "Cleaning, maintenance, care",
		icon: <MaintenanceIcon />,
		duration: 90,
	},
	{
		value: "other",
		label: "Other",
		description: "Other services or special requests",
		icon: <OtherIcon />,
		duration: 120,
	},
];

const priorityLevels = [
	{
		value: "low",
		label: "Low",
		description: "Planned visit, no rush",
		color: "#4ade80",
	},
	{
		value: "medium",
		label: "Medium",
		description: "Standard visit",
		color: "#facc15",
	},
	{
		value: "high",
		label: "High",
		description: "Issue requires quick intervention",
		color: "#f97316",
	},
	{
		value: "urgent",
		label: "Urgent",
		description: "Breakdown, vehicle not drivable",
		color: "#ef4444",
	},
];

const ServiceDescriptionStep: React.FC<ServiceDescriptionStepProps> = ({
	appointmentType,
	serviceDescription,
	priority,
	onDataChange,
	onValidationChange,
}) => {
	const [selectedType, setSelectedType] = useState(appointmentType || "");
	const [description, setDescription] = useState(serviceDescription || "");
	const [selectedPriority, setSelectedPriority] = useState(
		priority || "medium"
	);

	useEffect(() => {
		// Walidacja - wymagany typ i opis
		const isValid = !!(selectedType && description.trim().length > 10);
		onValidationChange(isValid);

		// Przekaż dane do rodzica
		onDataChange({
			appointmentType: selectedType,
			serviceDescription: description,
			priority: selectedPriority,
		});
	}, [
		selectedType,
		description,
		selectedPriority,
		onDataChange,
		onValidationChange,
	]);

	const handleTypeChange = (type: string) => {
		setSelectedType(type);
	};

	const handleDescriptionChange = (
		event: React.ChangeEvent<HTMLTextAreaElement>
	) => {
		setDescription(event.target.value);
	};

	const handlePriorityChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		setSelectedPriority(event.target.value);
	};

	const getSelectedTypeInfo = () => {
		return appointmentTypes.find((type) => type.value === selectedType);
	};

	const getSelectedPriorityInfo = () => {
		return priorityLevels.find((level) => level.value === selectedPriority);
	};

	return (
		<Box>
			<Grid container spacing={4}>
				{/* Typ wizyty */}
				<Grid item xs={12}>
					<Typography variant="h6" sx={{ color: COLOR_TEXT_PRIMARY, mb: 3 }}>
						1. Select Appointment Type
					</Typography>

					<Grid container spacing={2}>
						{appointmentTypes.map((type) => (
							<Grid item xs={12} sm={6} md={4} key={type.value}>
								<Card
									sx={{
										backgroundColor:
											selectedType === type.value
												? "rgba(56, 130, 246, 0.1)"
												: COLOR_SURFACE,
										border:
											selectedType === type.value
												? `2px solid ${COLOR_PRIMARY}`
												: "1px solid rgba(255, 255, 255, 0.1)",
										cursor: "pointer",
										transition: "all 0.2s ease",
										minHeight: 180,
										display: "flex",
										flexDirection: "column",
										"&:hover": {
											borderColor: COLOR_PRIMARY,
											transform: "translateY(-2px)",
										},
									}}
									onClick={() => handleTypeChange(type.value)}
								>
									<CardContent
										sx={{
											textAlign: "center",
											p: 3,
											flex: 1,
											display: "flex",
											flexDirection: "column",
											justifyContent: "center",
											minHeight: 120, // Zapewnij minimalne wnętrze
											alignItems: "center",
										}}
									>
										<Box
											sx={{
												color:
													selectedType === type.value
														? COLOR_PRIMARY
														: COLOR_TEXT_SECONDARY,
												mb: 2,
											}}
										>
											{React.cloneElement(type.icon, { fontSize: "large" })}
										</Box>
										<Typography
											variant="h6"
											sx={{
												color:
													selectedType === type.value
														? COLOR_PRIMARY
														: COLOR_TEXT_PRIMARY,
												fontWeight: 600,
												mb: 1,
											}}
										>
											{type.label}
										</Typography>
										<Typography
											variant="body2"
											sx={{ color: COLOR_TEXT_SECONDARY }}
										>
											{type.description}
										</Typography>
									</CardContent>
								</Card>
							</Grid>
						))}
					</Grid>

					{selectedType && (
						<Alert severity="success" sx={{ mt: 2 }}>
							<strong>Selected:</strong> {getSelectedTypeInfo()?.label} -{" "}
							{getSelectedTypeInfo()?.description}
						</Alert>
					)}
				</Grid>

				{/* Opis problemu */}
				<Grid item xs={12}>
					<Typography variant="h6" sx={{ color: COLOR_TEXT_PRIMARY, mb: 3 }}>
						2. Describe the Issue or Requirements
					</Typography>

					<TextField
						fullWidth
						multiline
						rows={6}
						label="Detailed description..."
						value={description}
						onChange={handleDescriptionChange}
						placeholder={`Describe in detail:
${
	selectedType === "service"
		? "- What service work is needed?\n- Is this a planned part replacement?"
		: ""
}
${
	selectedType === "inspection"
		? "- What type of inspection?\n- Is this a periodic or pre-registration inspection?"
		: ""
}
${
	selectedType === "diagnostic"
		? "- What symptoms have you noticed?\n- When did the problem appear?"
		: ""
}
${
	selectedType === "repair"
		? "- What is the issue?\n- Is the vehicle drivable?"
		: ""
}
${
	selectedType === "maintenance"
		? "- What maintenance services?\n- Is this regular maintenance?"
		: ""
}
${
	selectedType === "other"
		? "- Describe your needs\n- Is this a special service?"
		: ""
}
- Do you have preferred parts or materials?
- Additional notes...`}
						sx={{
							"& .MuiInputLabel-root": {
								color: COLOR_TEXT_SECONDARY,
								"&.Mui-focused": { color: COLOR_PRIMARY },
							},
							"& .MuiInputBase-input": {
								color: COLOR_TEXT_PRIMARY,
							},
							"& .MuiInputBase-input::placeholder": {
								color: COLOR_TEXT_SECONDARY,
								opacity: 0.7,
							},
							"& .MuiOutlinedInput-root": {
								"& fieldset": { borderColor: "rgba(255, 255, 255, 0.2)" },
								"&:hover fieldset": { borderColor: COLOR_PRIMARY },
								"&.Mui-focused fieldset": { borderColor: COLOR_PRIMARY },
							},
						}}
					/>

					<Box
						sx={{
							display: "flex",
							justifyContent: "space-between",
							alignItems: "center",
							mt: 1,
						}}
					>
						<Typography
							variant="caption"
							sx={{
								color:
									description.length < 10 ? "#ef4444" : COLOR_TEXT_SECONDARY,
							}}
						>
							{description.length}/500 characters (minimum 10)
						</Typography>

						{description.length < 10 && (
							<Typography variant="caption" sx={{ color: "#ef4444" }}>
								Description is too short
							</Typography>
						)}
					</Box>
				</Grid>

				{/* Priorytet */}
				<Grid item xs={12}>
					<Typography variant="h6" sx={{ color: COLOR_TEXT_PRIMARY, mb: 3 }}>
						3. Set Priority Level
					</Typography>

					<Card
						sx={{
							backgroundColor: COLOR_SURFACE,
							border: "1px solid rgba(255, 255, 255, 0.1)",
						}}
					>
						<CardContent>
							<FormControl component="fieldset">
								<RadioGroup
									value={selectedPriority}
									onChange={handlePriorityChange}
									sx={{ gap: 2 }}
								>
									{priorityLevels.map((level) => (
										<FormControlLabel
											key={level.value}
											value={level.value}
											control={
												<Radio
													sx={{
														color: level.color,
														"&.Mui-checked": {
															color: level.color,
														},
													}}
												/>
											}
											label={
												<Box
													sx={{ display: "flex", alignItems: "center", gap: 2 }}
												>
													<Box sx={{ minWidth: 100 }}>
														<Typography
															variant="body1"
															sx={{
																color: COLOR_TEXT_PRIMARY,
																fontWeight: 600,
															}}
														>
															{level.label}
														</Typography>
													</Box>
													<Typography
														variant="body2"
														sx={{ color: COLOR_TEXT_SECONDARY }}
													>
														{level.description}
													</Typography>
													<Chip
														size="small"
														label={level.label}
														sx={{
															backgroundColor: level.color + "20",
															color: level.color,
															border: `1px solid ${level.color}`,
															fontWeight: 600,
														}}
													/>
												</Box>
											}
											sx={{
												m: 0,
												p: 2,
												borderRadius: 1,
												border:
													selectedPriority === level.value
														? `2px solid ${level.color}`
														: "1px solid rgba(255, 255, 255, 0.1)",
												backgroundColor:
													selectedPriority === level.value
														? level.color + "10"
														: "transparent",
												"&:hover": {
													backgroundColor: level.color + "10",
													borderColor: level.color,
												},
											}}
										/>
									))}
								</RadioGroup>
							</FormControl>
						</CardContent>
					</Card>
				</Grid>
			</Grid>

			{/* Podsumowanie */}
			{selectedType && description.length >= 10 && (
				<Card
					sx={{
						mt: 4,
						backgroundColor: "rgba(56, 130, 246, 0.1)",
						border: `1px solid ${COLOR_PRIMARY}`,
					}}
				>
					<CardContent>
						<Typography variant="h6" sx={{ color: COLOR_PRIMARY, mb: 3 }}>
							✓ Service Summary
						</Typography>

						<Grid container spacing={3}>
							<Grid item xs={12} md={6}>
								<Box sx={{ mb: 2 }}>
									<Typography
										variant="body2"
										sx={{ color: COLOR_TEXT_SECONDARY, mb: 0.5 }}
									>
										Appointment Type:
									</Typography>
									<Chip
										icon={getSelectedTypeInfo()?.icon}
										label={getSelectedTypeInfo()?.label}
										sx={{
											backgroundColor: COLOR_PRIMARY,
											color: "white",
											"& .MuiChip-icon": { color: "white" },
										}}
									/>
								</Box>

								<Box>
									<Typography
										variant="body2"
										sx={{ color: COLOR_TEXT_SECONDARY, mb: 0.5 }}
									>
										Priority:
									</Typography>
									<Chip
										icon={<PriorityIcon />}
										label={getSelectedPriorityInfo()?.label}
										sx={{
											backgroundColor: getSelectedPriorityInfo()?.color + "20",
											color: getSelectedPriorityInfo()?.color,
											border: `1px solid ${getSelectedPriorityInfo()?.color}`,
											"& .MuiChip-icon": {
												color: getSelectedPriorityInfo()?.color,
											},
										}}
									/>
								</Box>
							</Grid>

							<Grid item xs={12} md={6}>
								<Typography
									variant="body2"
									sx={{ color: COLOR_TEXT_SECONDARY, mb: 0.5 }}
								>
									Issue Description:
								</Typography>
								<Typography
									variant="body2"
									sx={{
										color: COLOR_TEXT_PRIMARY,
										backgroundColor: "rgba(255, 255, 255, 0.05)",
										p: 1.5,
										borderRadius: 1,
										maxHeight: 120,
										overflow: "auto",
									}}
								>
									{description}
								</Typography>
							</Grid>
						</Grid>
					</CardContent>
				</Card>
			)}
		</Box>
	);
};

export default ServiceDescriptionStep;
