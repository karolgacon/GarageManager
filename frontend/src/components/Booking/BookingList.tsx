import React from "react";
import {
	Box,
	Typography,
	Paper,
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableRow,
	IconButton,
	Chip,
	Tooltip,
} from "@mui/material";
import { format } from "date-fns";
import {
	Info as InfoIcon,
	Edit as EditIcon,
	Delete as DeleteIcon,
} from "@mui/icons-material";

interface BookingListProps {
	bookings: any[];
	onView: (id: number) => void;
	onEdit: (id: number) => void;
	onDelete: (id: number) => void;
	userRole?: string;
}

const BookingList: React.FC<BookingListProps> = ({
	bookings,
	onView,
	onEdit,
	onDelete,
	userRole,
}) => {
	const getStatusChip = (status: string) => {
		let color:
			| "default"
			| "primary"
			| "secondary"
			| "error"
			| "info"
			| "success"
			| "warning" = "default";
		let label = status;

		switch (status) {
			case "pending":
				color = "info";
				break;
			case "confirmed":
				color = "primary";
				break;
			case "in_progress":
				color = "warning";
				break;
			case "completed":
				color = "success";
				break;
			case "cancelled":
				color = "error";
				break;
			default:
				color = "default";
		}

		return <Chip size="small" label={label} color={color} />;
	};

	return (
		<TableContainer component={Paper} elevation={0}>
			<Table sx={{ minWidth: 650 }} aria-label="bookings table">
				<TableHead>
					<TableRow sx={{ backgroundColor: "#f5f5f5" }}>
						<TableCell>Date & Time</TableCell>
						<TableCell>Service</TableCell>
						<TableCell>Client</TableCell>
						<TableCell>Vehicle</TableCell>
						<TableCell>Mechanic</TableCell>
						<TableCell>Status</TableCell>
						<TableCell align="right">Actions</TableCell>
					</TableRow>
				</TableHead>
				<TableBody>
					{bookings.map((booking) => (
						<TableRow
							key={booking.id}
							sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
						>
							<TableCell component="th" scope="row">
								<Typography variant="body2" fontWeight="medium">
									{format(new Date(booking.date), "MMM d, yyyy")}
								</Typography>
								<Typography variant="caption" color="text.secondary">
									{format(new Date(booking.date), "HH:mm")}
								</Typography>
							</TableCell>
							<TableCell>{booking.service_type}</TableCell>
							<TableCell>{booking.client_name}</TableCell>
							<TableCell>
								<Typography variant="body2">{booking.vehicle_info}</Typography>
							</TableCell>
							<TableCell>{booking.mechanic_name}</TableCell>
							<TableCell>{getStatusChip(booking.status)}</TableCell>
							<TableCell align="right">
								<Tooltip title="View Details">
									<IconButton size="small" onClick={() => onView(booking.id)}>
										<InfoIcon fontSize="small" />
									</IconButton>
								</Tooltip>
								{(userRole === "admin" ||
									userRole === "owner" ||
									userRole === "mechanic") && (
									<Tooltip title="Edit">
										<IconButton size="small" onClick={() => onEdit(booking.id)}>
											<EditIcon fontSize="small" />
										</IconButton>
									</Tooltip>
								)}
								{(userRole === "admin" ||
									userRole === "owner" ||
									booking.status !== "completed") && (
									<Tooltip title="Cancel">
										<IconButton
											size="small"
											onClick={() => onDelete(booking.id)}
										>
											<DeleteIcon fontSize="small" />
										</IconButton>
									</Tooltip>
								)}
							</TableCell>
						</TableRow>
					))}
				</TableBody>
			</Table>
		</TableContainer>
	);
};

export default BookingList;
