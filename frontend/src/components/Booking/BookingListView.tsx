import React, { useState } from "react";
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
	Chip,
	TablePagination,
	IconButton,
	Tooltip,
} from "@mui/material";
import { format } from "date-fns";
import VisibilityIcon from "@mui/icons-material/Visibility";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import {
	COLOR_TEXT_PRIMARY,
	COLOR_TEXT_SECONDARY,
	COLOR_SURFACE,
	COLOR_PRIMARY,
	COLOR_ERROR,
} from "../../constants";

interface BookingListViewProps {
	bookings: any[];
	userRole: string;
	onView: (id: number) => void;
	onEdit: (id: number) => void;
	onDelete: (id: number) => void;
}

const BookingListView: React.FC<BookingListViewProps> = ({
	bookings,
	userRole,
	onView,
	onEdit,
	onDelete,
}) => {
	const [page, setPage] = useState(0);
	const [rowsPerPage, setRowsPerPage] = useState(10);

	const handleChangePage = (_event: unknown, newPage: number) => {
		setPage(newPage);
	};

	const handleChangeRowsPerPage = (
		event: React.ChangeEvent<HTMLInputElement>
	) => {
		setRowsPerPage(parseInt(event.target.value, 10));
		setPage(0);
	};

	const getStatusChip = (status: string) => {
		let color: "success" | "warning" | "error" | "info" | "default" = "default";

		switch (status?.toLowerCase()) {
			case "confirmed":
				color = "success";
				break;
			case "pending":
				color = "warning";
				break;
			case "completed":
				color = "info";
				break;
			case "cancelled":
				color = "error";
				break;
		}

		return (
			<Chip
				label={
					status ? status.charAt(0).toUpperCase() + status.slice(1) : "Unknown"
				}
				color={color}
				size="small"
				sx={{ fontWeight: 500 }}
			/>
		);
	};

	const formatDateTime = (dateStr: string) => {
		if (!dateStr) return { date: "N/A", time: "N/A" };

		try {
			const date = new Date(dateStr);
			return {
				date: format(date, "dd MMM yyyy"),
				time: format(date, "HH:mm"),
			};
		} catch (e) {
			return { date: "Invalid Date", time: "Invalid Time" };
		}
	};

	if (bookings.length === 0) {
		return (
			<Box sx={{ textAlign: "center", py: 5 }}>
				<Typography
					variant="body1"
					color={COLOR_TEXT_SECONDARY}
					fontWeight={400}
				>
					No bookings found for this period
				</Typography>
				<Typography variant="body2" color={COLOR_TEXT_SECONDARY} sx={{ mt: 1 }}>
					{userRole === "admin" && !bookings.length
						? "Please select a workshop to view bookings"
						: ""}
				</Typography>
			</Box>
		);
	}

	const canEdit = (booking: any) => {
		return (
			["admin", "owner"].includes(userRole) ||
			(userRole === "mechanic" &&
				booking.mechanic?.id ===
					parseInt(localStorage.getItem("user_id") || "0")) ||
			(userRole === "client" &&
				booking.client?.id === parseInt(localStorage.getItem("user_id") || "0"))
		);
	};

	const canCancel = (booking: any) => {
		if (booking.status === "completed" || booking.status === "cancelled") {
			return false;
		}

		const bookingDate = new Date(booking.date);
		const today = new Date();
		return bookingDate > today && canEdit(booking);
	};

	return (
		<Paper
			sx={{
				width: "100%",
				overflow: "hidden",
				boxShadow: "none",
				backgroundColor: COLOR_SURFACE,
				color: COLOR_TEXT_PRIMARY,
			}}
		>
			<TableContainer sx={{ maxHeight: 600 }}>
				<Table stickyHeader aria-label="bookings table">
					<TableHead>
						<TableRow
							sx={{
								"& th": {
									fontWeight: 600,
									bgcolor: COLOR_SURFACE,
									color: COLOR_TEXT_PRIMARY,
									borderBottom: `1px solid rgba(255, 255, 255, 0.1)`,
								},
							}}
						>
							<TableCell>Date</TableCell>
							<TableCell>Time</TableCell>
							<TableCell>Client</TableCell>
							<TableCell>Service</TableCell>
							<TableCell>Vehicle</TableCell>
							<TableCell>Mechanic</TableCell>
							<TableCell>Status</TableCell>
							<TableCell align="right">Actions</TableCell>
						</TableRow>
					</TableHead>
					<TableBody>
						{bookings
							.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
							.map((booking) => {
								const { date, time } = formatDateTime(booking.date);

								return (
									<TableRow
										hover
										key={booking.id}
										sx={{
											"& td": {
												fontSize: "0.875rem",
												color: COLOR_TEXT_PRIMARY,
												borderBottom: `1px solid rgba(255, 255, 255, 0.1)`,
											},
											bgcolor:
												booking.status === "cancelled"
													? "rgba(239, 68, 68, 0.1)"
													: booking.status === "completed"
													? "rgba(56, 130, 246, 0.1)"
													: "transparent",
											"&:hover": {
												backgroundColor: "rgba(255, 255, 255, 0.05)",
											},
										}}
									>
										<TableCell>{date}</TableCell>
										<TableCell>{time}</TableCell>
										<TableCell>
											{booking.client?.first_name} {booking.client?.last_name}
										</TableCell>
										<TableCell>
											{booking.service_type || "General Service"}
										</TableCell>
										<TableCell>
											{booking.vehicle?.brand} {booking.vehicle?.model}{" "}
											{booking.vehicle?.year && `(${booking.vehicle.year})`}
										</TableCell>
										<TableCell>
											{booking.mechanic ? (
												`${booking.mechanic.first_name} ${booking.mechanic.last_name}`
											) : (
												<Typography
													variant="body2"
													color={COLOR_TEXT_SECONDARY}
												>
													Not assigned
												</Typography>
											)}
										</TableCell>
										<TableCell>{getStatusChip(booking.status)}</TableCell>
										<TableCell align="right">
											<Tooltip title="View Details">
												<IconButton
													size="small"
													sx={{ color: COLOR_TEXT_PRIMARY }}
													onClick={() => onView(booking.id)}
												>
													<VisibilityIcon fontSize="small" />
												</IconButton>
											</Tooltip>

											{canEdit(booking) && (
												<Tooltip title="Edit Booking">
													<IconButton
														size="small"
														sx={{ color: COLOR_PRIMARY }}
														onClick={() => onEdit(booking.id)}
													>
														<EditIcon fontSize="small" />
													</IconButton>
												</Tooltip>
											)}

											{canCancel(booking) && (
												<Tooltip title="Cancel Booking">
													<IconButton
														size="small"
														sx={{ color: COLOR_ERROR }}
														onClick={() => onDelete(booking.id)}
													>
														<DeleteIcon fontSize="small" />
													</IconButton>
												</Tooltip>
											)}
										</TableCell>
									</TableRow>
								);
							})}
					</TableBody>
				</Table>
			</TableContainer>
			<TablePagination
				rowsPerPageOptions={[5, 10, 25, 50]}
				component="div"
				count={bookings.length}
				rowsPerPage={rowsPerPage}
				page={page}
				onPageChange={handleChangePage}
				onRowsPerPageChange={handleChangeRowsPerPage}
				sx={{
					color: COLOR_TEXT_PRIMARY,
					"& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows":
						{
							fontSize: "0.875rem",
							color: COLOR_TEXT_PRIMARY,
						},
					"& .MuiSelect-select": {
						color: COLOR_TEXT_PRIMARY,
					},
					"& .MuiIconButton-root": {
						color: COLOR_TEXT_PRIMARY,
					},
					borderTop: `1px solid rgba(255, 255, 255, 0.1)`,
				}}
			/>
		</Paper>
	);
};

export default BookingListView;
