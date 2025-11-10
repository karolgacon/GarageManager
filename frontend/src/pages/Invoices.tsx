import { useContext, useState, useEffect } from "react";
import {
	Box,
	Typography,
	Paper,
	Tabs,
	Tab,
	Button,
	CircularProgress,
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableRow,
	Chip,
	IconButton,
	Dialog,
	DialogTitle,
	DialogContent,
	DialogActions,
	TextField,
	MenuItem,
	Select,
	FormControl,
	InputLabel,
	Grid,
	Container,
} from "@mui/material";
import VisibilityIcon from "@mui/icons-material/Visibility";
import GetAppIcon from "@mui/icons-material/GetApp";
import PaymentIcon from "@mui/icons-material/Payment";
import AddIcon from "@mui/icons-material/Add";
import AuthContext from "../context/AuthProvider";
import {
	COLOR_PRIMARY,
	COLOR_SURFACE,
	COLOR_TEXT_PRIMARY,
	COLOR_TEXT_SECONDARY,
	COLOR_SUCCESS,
	COLOR_WARNING,
	COLOR_ERROR,
} from "../constants";
import api from "../api";
import Mainlayout from "../components/Mainlayout/Mainlayout";
import CustomSnackbar, {
	SnackbarState,
} from "../components/Mainlayout/Snackbar";

interface Invoice {
	id: number;
	client: number;
	amount: number;
	discount: number;
	issue_date: string;
	due_date: string;
	status: string;
	tax_rate: number;
	description?: string;
	client_name?: string;
	// Dodane właściwości dla kompatybilności
	number?: string;
	date?: string;
	total_amount?: number;
}

interface Payment {
	id: number;
	invoice: number;
	amount_paid: number;
	payment_method: string;
	payment_date: string;
	transaction_id: string;
	notes?: string;
	invoice_number?: string;
	// Dodane właściwości dla kompatybilności
	amount?: number;
	status?: string;
}
const Invoices = () => {
	const { auth, isAdmin, isOwner, isClient } = useContext(AuthContext);
	const [tabValue, setTabValue] = useState(0);
	const [invoices, setInvoices] = useState<Invoice[]>([]);
	const [payments, setPayments] = useState<Payment[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	const [openCreateDialog, setOpenCreateDialog] = useState(false);
	const [newInvoice, setNewInvoice] = useState({
		client: "",
		booking: "",
		due_date: "",
		items: [{ description: "", quantity: 1, price: 0 }],
	});

	const [openPaymentDialog, setOpenPaymentDialog] = useState(false);
	const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
	const [paymentDetails, setPaymentDetails] = useState({
		amount: 0,
		payment_method: "card",
	});

	const [snackbar, setSnackbar] = useState<SnackbarState>({
		open: false,
		message: "",
		severity: "success",
	});

	const [selectedInvoiceDetails, setSelectedInvoiceDetails] =
		useState<Invoice | null>(null);
	const [openInvoiceDetailsDialog, setOpenInvoiceDetailsDialog] =
		useState(false);

	useEffect(() => {
		const fetchData = async () => {
			setLoading(true);
			setError(null);

			try {
				const [invoicesResponse, paymentsResponse] = await Promise.all([
					api.get("/invoices/"),
					api.get("/payments/"),
				]);

				const validInvoices = Array.isArray(invoicesResponse.data)
					? invoicesResponse.data.map((invoice) => ({
							...invoice,
							number: invoice.id
								? `INV-${invoice.id.toString().padStart(3, "0")}`
								: "N/A",
							date: invoice.issue_date,
							total_amount: Number(invoice.amount || 0),
					  }))
					: [];

				const validPayments = Array.isArray(paymentsResponse.data)
					? paymentsResponse.data.map((payment) => ({
							...payment,
							amount: Number(payment.amount_paid || 0),
							status: "completed",
					  }))
					: [];

				if (isClient()) {
					setInvoices(
						validInvoices.filter(
							(invoice: Invoice) => invoice.client === auth.user_id
						)
					);
					setPayments(
						validPayments.filter((payment: Payment) =>
							validInvoices.find(
								(invoice: Invoice) =>
									invoice.id === payment.invoice &&
									invoice.client === auth.user_id
							)
						)
					);
				} else {
					setInvoices(validInvoices);
					setPayments(validPayments);
				}
			} catch (err: any) {
				setError("Nie udało się pobrać danych faktur i płatności.");
			} finally {
				setLoading(false);
			}
		};

		fetchData();
	}, [auth.user_id, isClient]);

	const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
		setTabValue(newValue);
	};

	const handleOpenCreateDialog = () => {
		setOpenCreateDialog(true);
	};

	const handleCloseCreateDialog = () => {
		setOpenCreateDialog(false);
	};

	const handleAddInvoiceItem = () => {
		setNewInvoice({
			...newInvoice,
			items: [...newInvoice.items, { description: "", quantity: 1, price: 0 }],
		});
	};

	const handleRemoveInvoiceItem = (index: number) => {
		const updatedItems = [...newInvoice.items];
		updatedItems.splice(index, 1);
		setNewInvoice({
			...newInvoice,
			items: updatedItems,
		});
	};

	const handleSaveInvoice = async () => {
		try {
			const totalAmount = newInvoice.items.reduce(
				(sum, item) => sum + item.quantity * item.price,
				0
			);

			const invoiceData = {
				client: parseInt(newInvoice.client),
				amount: totalAmount,
				discount: 0,
				due_date: newInvoice.due_date,
				status: "pending",
				tax_rate: 0.23,
				description: newInvoice.items
					.map(
						(item) => `${item.description} (${item.quantity} x ${item.price})`
					)
					.join("; "),
			};

			await api.post("/api/v1/invoices/", invoiceData);

			handleCloseCreateDialog();
			setSnackbar({
				open: true,
				message: "Faktura została utworzona pomyślnie",
				severity: "success",
			});
		} catch (err) {
			setSnackbar({
				open: true,
				message: "Nie udało się utworzyć faktury",
				severity: "error",
			});
		}
	};

	const handleOpenPaymentDialog = (invoice: Invoice) => {
		setSelectedInvoice(invoice);
		setPaymentDetails({
			amount: invoice.amount,
			payment_method: "card",
		});
		setOpenPaymentDialog(true);
	};

	const handleClosePaymentDialog = () => {
		setOpenPaymentDialog(false);
		setSelectedInvoice(null);
	};

	const handleSavePayment = async () => {
		try {
			if (!selectedInvoice) return;

			handleClosePaymentDialog();
			setSnackbar({
				open: true,
				message: "Płatność została zrealizowana pomyślnie",
				severity: "success",
			});
		} catch (err) {
			setSnackbar({
				open: true,
				message: "Nie udało się zrealizować płatności",
				severity: "error",
			});
		}
	};

	const handleDownloadInvoice = (_invoiceId: number) => {
		// TODO: Implement invoice download functionality
	};

	const handleViewInvoice = (invoice: Invoice) => {
		setSelectedInvoiceDetails(invoice);
		setOpenInvoiceDetailsDialog(true);
	};

	const handleCloseInvoiceDetailsDialog = () => {
		setOpenInvoiceDetailsDialog(false);
		setSelectedInvoiceDetails(null);
	};

	const renderInvoiceStatus = (status: string) => {
		if (!status) {
			return (
				<Chip
					label="Unknown"
					size="small"
					sx={{
						backgroundColor: "rgba(156, 163, 175, 0.2)",
						color: COLOR_TEXT_PRIMARY,
					}}
				/>
			);
		}

		let chipSx = {};
		switch (status.toLowerCase()) {
			case "paid":
				chipSx = {
					backgroundColor: `${COLOR_SUCCESS}20`,
					color: COLOR_SUCCESS,
				};
				break;
			case "pending":
				chipSx = {
					backgroundColor: `${COLOR_WARNING}20`,
					color: COLOR_WARNING,
				};
				break;
			case "overdue":
				chipSx = {
					backgroundColor: `${COLOR_ERROR}20`,
					color: COLOR_ERROR,
				};
				break;
			default:
				chipSx = {
					backgroundColor: "rgba(156, 163, 175, 0.2)",
					color: COLOR_TEXT_PRIMARY,
				};
		}
		return <Chip label={status} size="small" sx={chipSx} />;
	};

	const renderInvoiceActions = (invoice: Invoice) => {
		return (
			<Box sx={{ display: "flex", gap: 1 }}>
				<IconButton
					size="small"
					onClick={() => handleViewInvoice(invoice)}
					sx={{
						color: COLOR_TEXT_PRIMARY,
						"&:hover": {
							color: COLOR_PRIMARY,
							backgroundColor: `${COLOR_PRIMARY}20`,
						},
					}}
				>
					<VisibilityIcon fontSize="small" />
				</IconButton>

				<IconButton
					size="small"
					onClick={() => handleDownloadInvoice(invoice.id)}
					sx={{
						color: COLOR_TEXT_PRIMARY,
						"&:hover": {
							color: COLOR_PRIMARY,
							backgroundColor: `${COLOR_PRIMARY}20`,
						},
					}}
				>
					<GetAppIcon fontSize="small" />
				</IconButton>

				{isClient() && invoice.status.toLowerCase() === "pending" && (
					<IconButton
						size="small"
						onClick={() => handleOpenPaymentDialog(invoice)}
						sx={{
							color: COLOR_SUCCESS,
							"&:hover": {
								backgroundColor: `${COLOR_SUCCESS}20`,
							},
						}}
					>
						<PaymentIcon fontSize="small" />
					</IconButton>
				)}
			</Box>
		);
	};

	const handleSnackbarClose = () => {
		setSnackbar({ ...snackbar, open: false });
	};

	const formatDate = (dateString: string | undefined) => {
		if (!dateString) return "N/A";
		const date = new Date(dateString);
		return !isNaN(date.getTime()) ? date.toLocaleDateString() : "Invalid Date";
	};

	const formatAmount = (amount: number | undefined) => {
		const numAmount = Number(amount || 0);
		return `$${numAmount.toFixed(2)}`;
	};

	return (
		<Mainlayout>
			<Container maxWidth="xl">
				<Box sx={{ py: 3 }}>
					<Box
						sx={{
							display: "flex",
							justifyContent: "space-between",
							alignItems: "center",
							mb: 3,
						}}
					>
						<Typography
							variant="h4"
							fontWeight="bold"
							sx={{ color: COLOR_TEXT_PRIMARY }}
						>
							Invoices & Payments
						</Typography>

						{(isAdmin() || isOwner()) && (
							<Button
								variant="contained"
								startIcon={<AddIcon />}
								onClick={handleOpenCreateDialog}
								sx={{
									bgcolor: COLOR_PRIMARY,
									color: COLOR_TEXT_PRIMARY,
									"&:hover": { bgcolor: "#2563EB" },
								}}
							>
								New Invoice
							</Button>
						)}
					</Box>

					<Paper
						sx={{
							mb: 3,
							overflow: "hidden",
							backgroundColor: COLOR_SURFACE,
							border: "1px solid rgba(255, 255, 255, 0.1)",
						}}
						elevation={0}
					>
						<Tabs
							value={tabValue}
							onChange={handleTabChange}
							indicatorColor="primary"
							textColor="primary"
							sx={{
								borderBottom: 1,
								borderColor: "rgba(255, 255, 255, 0.1)",
								"& .MuiTab-root": {
									color: COLOR_TEXT_SECONDARY,
									"&.Mui-selected": {
										color: COLOR_PRIMARY,
									},
								},
							}}
						>
							<Tab label="Invoices" />
							<Tab label="Payments" />
						</Tabs>

						{tabValue === 0 && (
							<Box sx={{ p: 3 }}>
								{loading ? (
									<Box sx={{ display: "flex", justifyContent: "center", p: 3 }}>
										<CircularProgress sx={{ color: COLOR_PRIMARY }} />
									</Box>
								) : error ? (
									<Typography sx={{ color: COLOR_ERROR }}>{error}</Typography>
								) : invoices.length === 0 ? (
									<Typography sx={{ color: COLOR_TEXT_PRIMARY }}>
										No invoices found.
									</Typography>
								) : (
									<TableContainer>
										<Table sx={{ minWidth: 650 }}>
											<TableHead>
												<TableRow>
													<TableCell sx={{ color: COLOR_TEXT_PRIMARY }}>
														Invoice #
													</TableCell>
													<TableCell sx={{ color: COLOR_TEXT_PRIMARY }}>
														Date
													</TableCell>
													<TableCell sx={{ color: COLOR_TEXT_PRIMARY }}>
														Due Date
													</TableCell>
													<TableCell sx={{ color: COLOR_TEXT_PRIMARY }}>
														Client
													</TableCell>
													<TableCell sx={{ color: COLOR_TEXT_PRIMARY }}>
														Amount
													</TableCell>
													<TableCell sx={{ color: COLOR_TEXT_PRIMARY }}>
														Status
													</TableCell>
													<TableCell sx={{ color: COLOR_TEXT_PRIMARY }}>
														Actions
													</TableCell>
												</TableRow>
											</TableHead>
											<TableBody>
												{invoices.map((invoice) => (
													<TableRow
														key={invoice.id}
														sx={{
															"&:hover": {
																backgroundColor: "rgba(255, 255, 255, 0.05)",
															},
														}}
													>
														<TableCell sx={{ color: COLOR_TEXT_PRIMARY }}>
															{invoice.number}
														</TableCell>
														<TableCell sx={{ color: COLOR_TEXT_PRIMARY }}>
															{formatDate(invoice.issue_date || invoice.date)}
														</TableCell>
														<TableCell sx={{ color: COLOR_TEXT_PRIMARY }}>
															{formatDate(invoice.due_date)}
														</TableCell>
														<TableCell sx={{ color: COLOR_TEXT_PRIMARY }}>
															{invoice.client_name || invoice.client}
														</TableCell>
														<TableCell sx={{ color: COLOR_TEXT_PRIMARY }}>
															{formatAmount(
																invoice.amount || invoice.total_amount
															)}
														</TableCell>
														<TableCell>
															{renderInvoiceStatus(invoice.status)}
														</TableCell>
														<TableCell>
															{renderInvoiceActions(invoice)}
														</TableCell>
													</TableRow>
												))}
											</TableBody>
										</Table>
									</TableContainer>
								)}
							</Box>
						)}

						{tabValue === 1 && (
							<Box sx={{ p: 3 }}>
								{loading ? (
									<Box sx={{ display: "flex", justifyContent: "center", p: 3 }}>
										<CircularProgress sx={{ color: COLOR_PRIMARY }} />
									</Box>
								) : error ? (
									<Typography sx={{ color: COLOR_ERROR }}>{error}</Typography>
								) : payments.length === 0 ? (
									<Typography sx={{ color: COLOR_TEXT_PRIMARY }}>
										No payments found.
									</Typography>
								) : (
									<TableContainer>
										<Table sx={{ minWidth: 650 }}>
											<TableHead>
												<TableRow>
													<TableCell sx={{ color: COLOR_TEXT_PRIMARY }}>
														Payment ID
													</TableCell>
													<TableCell sx={{ color: COLOR_TEXT_PRIMARY }}>
														Invoice
													</TableCell>
													<TableCell sx={{ color: COLOR_TEXT_PRIMARY }}>
														Date
													</TableCell>
													<TableCell sx={{ color: COLOR_TEXT_PRIMARY }}>
														Amount
													</TableCell>
													<TableCell sx={{ color: COLOR_TEXT_PRIMARY }}>
														Method
													</TableCell>
													<TableCell sx={{ color: COLOR_TEXT_PRIMARY }}>
														Status
													</TableCell>
												</TableRow>
											</TableHead>
											<TableBody>
												{payments.map((payment) => (
													<TableRow
														key={payment.id}
														sx={{
															"&:hover": {
																backgroundColor: "rgba(255, 255, 255, 0.05)",
															},
														}}
													>
														<TableCell sx={{ color: COLOR_TEXT_PRIMARY }}>
															{payment.id}
														</TableCell>
														<TableCell sx={{ color: COLOR_TEXT_PRIMARY }}>
															{payment.invoice_number || payment.invoice}
														</TableCell>
														<TableCell sx={{ color: COLOR_TEXT_PRIMARY }}>
															{new Date(
																payment.payment_date
															).toLocaleDateString()}
														</TableCell>
														<TableCell sx={{ color: COLOR_TEXT_PRIMARY }}>
															{formatAmount(
																payment.amount_paid || payment.amount
															)}
														</TableCell>
														<TableCell sx={{ color: COLOR_TEXT_PRIMARY }}>
															{payment.payment_method
																? payment.payment_method
																		.charAt(0)
																		.toUpperCase() +
																  payment.payment_method.slice(1)
																: "Unknown"}
														</TableCell>
														<TableCell>
															<Chip
																label={payment.status || "Unknown"}
																size="small"
																sx={{
																	backgroundColor:
																		payment.status &&
																		payment.status.toLowerCase() === "completed"
																			? `${COLOR_SUCCESS}20`
																			: "rgba(156, 163, 175, 0.2)",
																	color:
																		payment.status &&
																		payment.status.toLowerCase() === "completed"
																			? COLOR_SUCCESS
																			: COLOR_TEXT_PRIMARY,
																}}
															/>
														</TableCell>
													</TableRow>
												))}
											</TableBody>
										</Table>
									</TableContainer>
								)}
							</Box>
						)}
					</Paper>
				</Box>
			</Container>

			{(isAdmin() || isOwner()) && (
				<Dialog
					open={openCreateDialog}
					onClose={handleCloseCreateDialog}
					maxWidth="md"
					fullWidth
					PaperProps={{
						sx: {
							backgroundColor: COLOR_SURFACE,
							border: "1px solid rgba(255, 255, 255, 0.1)",
						},
					}}
				>
					<DialogTitle sx={{ color: COLOR_TEXT_PRIMARY }}>
						Create New Invoice
					</DialogTitle>
					<DialogContent
						dividers
						sx={{
							borderColor: "rgba(255, 255, 255, 0.1)",
						}}
					>
						<Grid container spacing={3}>
							<Grid item xs={12} md={6}>
								<FormControl fullWidth margin="normal">
									<InputLabel sx={{ color: COLOR_TEXT_SECONDARY }}>
										Client
									</InputLabel>
									<Select
										value={newInvoice.client}
										onChange={(e) =>
											setNewInvoice({ ...newInvoice, client: e.target.value })
										}
										label="Client"
										sx={{
											color: COLOR_TEXT_PRIMARY,
											"& .MuiOutlinedInput-notchedOutline": {
												borderColor: "rgba(255, 255, 255, 0.23)",
											},
											"&:hover .MuiOutlinedInput-notchedOutline": {
												borderColor: "rgba(255, 255, 255, 0.4)",
											},
											"&.Mui-focused .MuiOutlinedInput-notchedOutline": {
												borderColor: COLOR_PRIMARY,
											},
										}}
									>
										<MenuItem value="1">Client 1</MenuItem>
										<MenuItem value="2">Client 2</MenuItem>
									</Select>
								</FormControl>
							</Grid>
							<Grid item xs={12} md={6}>
								<FormControl fullWidth margin="normal">
									<InputLabel sx={{ color: COLOR_TEXT_SECONDARY }}>
										Booking
									</InputLabel>
									<Select
										value={newInvoice.booking}
										onChange={(e) =>
											setNewInvoice({ ...newInvoice, booking: e.target.value })
										}
										label="Booking"
										sx={{
											color: COLOR_TEXT_PRIMARY,
											"& .MuiOutlinedInput-notchedOutline": {
												borderColor: "rgba(255, 255, 255, 0.23)",
											},
											"&:hover .MuiOutlinedInput-notchedOutline": {
												borderColor: "rgba(255, 255, 255, 0.4)",
											},
											"&.Mui-focused .MuiOutlinedInput-notchedOutline": {
												borderColor: COLOR_PRIMARY,
											},
										}}
									>
										<MenuItem value="1">Booking #1</MenuItem>
										<MenuItem value="2">Booking #2</MenuItem>
									</Select>
								</FormControl>
							</Grid>
							<Grid item xs={12} md={6}>
								<TextField
									fullWidth
									label="Due Date"
									type="date"
									value={newInvoice.due_date}
									onChange={(e) =>
										setNewInvoice({ ...newInvoice, due_date: e.target.value })
									}
									InputLabelProps={{
										shrink: true,
										sx: { color: COLOR_TEXT_SECONDARY },
									}}
									sx={{
										"& .MuiInputBase-input": {
											color: COLOR_TEXT_PRIMARY,
										},
										"& .MuiOutlinedInput-notchedOutline": {
											borderColor: "rgba(255, 255, 255, 0.23)",
										},
										"&:hover .MuiOutlinedInput-notchedOutline": {
											borderColor: "rgba(255, 255, 255, 0.4)",
										},
										"&.Mui-focused .MuiOutlinedInput-notchedOutline": {
											borderColor: COLOR_PRIMARY,
										},
									}}
									margin="normal"
								/>
							</Grid>
							<Grid item xs={12}>
								<Typography
									variant="h6"
									sx={{ mt: 2, mb: 2, color: COLOR_TEXT_PRIMARY }}
								>
									Invoice Items
								</Typography>
								{newInvoice.items.map((item, index) => (
									<Box
										key={index}
										sx={{
											display: "flex",
											gap: 2,
											mb: 2,
											alignItems: "center",
										}}
									>
										<TextField
											label="Description"
											value={item.description}
											onChange={(e) => {
												const updatedItems = [...newInvoice.items];
												updatedItems[index].description = e.target.value;
												setNewInvoice({ ...newInvoice, items: updatedItems });
											}}
											fullWidth
											InputLabelProps={{
												sx: { color: COLOR_TEXT_SECONDARY },
											}}
											sx={{
												"& .MuiInputBase-input": {
													color: COLOR_TEXT_PRIMARY,
												},
												"& .MuiOutlinedInput-notchedOutline": {
													borderColor: "rgba(255, 255, 255, 0.23)",
												},
												"&:hover .MuiOutlinedInput-notchedOutline": {
													borderColor: "rgba(255, 255, 255, 0.4)",
												},
												"&.Mui-focused .MuiOutlinedInput-notchedOutline": {
													borderColor: COLOR_PRIMARY,
												},
											}}
										/>
										<TextField
											label="Qty"
											type="number"
											value={item.quantity}
											onChange={(e) => {
												const updatedItems = [...newInvoice.items];
												updatedItems[index].quantity =
													parseInt(e.target.value) || 1;
												setNewInvoice({ ...newInvoice, items: updatedItems });
											}}
											sx={{
												width: "100px",
												"& .MuiInputBase-input": {
													color: COLOR_TEXT_PRIMARY,
												},
												"& .MuiOutlinedInput-notchedOutline": {
													borderColor: "rgba(255, 255, 255, 0.23)",
												},
												"&:hover .MuiOutlinedInput-notchedOutline": {
													borderColor: "rgba(255, 255, 255, 0.4)",
												},
												"&.Mui-focused .MuiOutlinedInput-notchedOutline": {
													borderColor: COLOR_PRIMARY,
												},
											}}
											InputLabelProps={{
												sx: { color: COLOR_TEXT_SECONDARY },
											}}
										/>
										<TextField
											label="Price"
											type="number"
											value={item.price}
											onChange={(e) => {
												const updatedItems = [...newInvoice.items];
												updatedItems[index].price =
													parseFloat(e.target.value) || 0;
												setNewInvoice({ ...newInvoice, items: updatedItems });
											}}
											sx={{
												width: "150px",
												"& .MuiInputBase-input": {
													color: COLOR_TEXT_PRIMARY,
												},
												"& .MuiOutlinedInput-notchedOutline": {
													borderColor: "rgba(255, 255, 255, 0.23)",
												},
												"&:hover .MuiOutlinedInput-notchedOutline": {
													borderColor: "rgba(255, 255, 255, 0.4)",
												},
												"&.Mui-focused .MuiOutlinedInput-notchedOutline": {
													borderColor: COLOR_PRIMARY,
												},
											}}
											InputLabelProps={{
												sx: { color: COLOR_TEXT_SECONDARY },
											}}
										/>
										<Button
											color="error"
											onClick={() => handleRemoveInvoiceItem(index)}
											disabled={newInvoice.items.length <= 1}
											sx={{
												color: COLOR_ERROR,
												"&:hover": {
													backgroundColor: `${COLOR_ERROR}20`,
												},
											}}
										>
											Remove
										</Button>
									</Box>
								))}
								<Button
									variant="outlined"
									startIcon={<AddIcon />}
									onClick={handleAddInvoiceItem}
									sx={{
										mt: 1,
										color: COLOR_PRIMARY,
										borderColor: COLOR_PRIMARY,
										"&:hover": {
											borderColor: COLOR_PRIMARY,
											backgroundColor: `${COLOR_PRIMARY}20`,
										},
									}}
								>
									Add Item
								</Button>
							</Grid>
						</Grid>
					</DialogContent>
					<DialogActions
						sx={{ borderTop: "1px solid rgba(255, 255, 255, 0.1)" }}
					>
						<Button
							onClick={handleCloseCreateDialog}
							sx={{ color: COLOR_TEXT_SECONDARY }}
						>
							Cancel
						</Button>
						<Button
							onClick={handleSaveInvoice}
							variant="contained"
							sx={{
								backgroundColor: COLOR_PRIMARY,
								color: COLOR_TEXT_PRIMARY,
								"&:hover": {
									backgroundColor: "#2563EB",
								},
							}}
						>
							Create Invoice
						</Button>
					</DialogActions>
				</Dialog>
			)}

			<Dialog
				open={openPaymentDialog}
				onClose={handleClosePaymentDialog}
				maxWidth="sm"
				fullWidth
				PaperProps={{
					sx: {
						backgroundColor: COLOR_SURFACE,
						border: "1px solid rgba(255, 255, 255, 0.1)",
					},
				}}
			>
				<DialogTitle sx={{ color: COLOR_TEXT_PRIMARY }}>
					Make Payment
				</DialogTitle>
				<DialogContent
					dividers
					sx={{
						borderColor: "rgba(255, 255, 255, 0.1)",
					}}
				>
					<Box sx={{ mb: 2 }}>
						<Typography
							variant="subtitle1"
							gutterBottom
							sx={{ color: COLOR_TEXT_PRIMARY }}
						>
							Invoice: {selectedInvoice?.number}
						</Typography>
						<Typography
							variant="body2"
							color={COLOR_TEXT_SECONDARY}
							gutterBottom
						>
							Total Amount: ${(selectedInvoice?.amount || 0).toFixed(2)}
						</Typography>
					</Box>

					<TextField
						fullWidth
						label="Amount"
						type="number"
						value={paymentDetails.amount}
						onChange={(e) =>
							setPaymentDetails({
								...paymentDetails,
								amount: parseFloat(e.target.value) || 0,
							})
						}
						margin="normal"
						InputLabelProps={{
							sx: { color: COLOR_TEXT_SECONDARY },
						}}
						sx={{
							"& .MuiInputBase-input": {
								color: COLOR_TEXT_PRIMARY,
							},
							"& .MuiOutlinedInput-notchedOutline": {
								borderColor: "rgba(255, 255, 255, 0.23)",
							},
							"&:hover .MuiOutlinedInput-notchedOutline": {
								borderColor: "rgba(255, 255, 255, 0.4)",
							},
							"&.Mui-focused .MuiOutlinedInput-notchedOutline": {
								borderColor: COLOR_PRIMARY,
							},
						}}
					/>

					<FormControl fullWidth margin="normal">
						<InputLabel sx={{ color: COLOR_TEXT_SECONDARY }}>
							Payment Method
						</InputLabel>
						<Select
							value={paymentDetails.payment_method}
							onChange={(e) =>
								setPaymentDetails({
									...paymentDetails,
									payment_method: e.target.value as string,
								})
							}
							label="Payment Method"
							sx={{
								color: COLOR_TEXT_PRIMARY,
								"& .MuiOutlinedInput-notchedOutline": {
									borderColor: "rgba(255, 255, 255, 0.23)",
								},
								"&:hover .MuiOutlinedInput-notchedOutline": {
									borderColor: "rgba(255, 255, 255, 0.4)",
								},
								"&.Mui-focused .MuiOutlinedInput-notchedOutline": {
									borderColor: COLOR_PRIMARY,
								},
							}}
						>
							<MenuItem value="card">Credit Card</MenuItem>
							<MenuItem value="bank_transfer">Bank Transfer</MenuItem>
							<MenuItem value="cash">Cash</MenuItem>
						</Select>
					</FormControl>
				</DialogContent>
				<DialogActions sx={{ borderTop: "1px solid rgba(255, 255, 255, 0.1)" }}>
					<Button
						onClick={handleClosePaymentDialog}
						sx={{ color: COLOR_TEXT_SECONDARY }}
					>
						Cancel
					</Button>
					<Button
						onClick={handleSavePayment}
						variant="contained"
						sx={{
							backgroundColor: COLOR_PRIMARY,
							color: COLOR_TEXT_PRIMARY,
							"&:hover": {
								backgroundColor: "#2563EB",
							},
						}}
					>
						Pay Now
					</Button>
				</DialogActions>
			</Dialog>

			<Dialog
				open={openInvoiceDetailsDialog}
				onClose={handleCloseInvoiceDetailsDialog}
				maxWidth="md"
				fullWidth
				PaperProps={{
					sx: {
						backgroundColor: COLOR_SURFACE,
						border: "1px solid rgba(255, 255, 255, 0.1)",
					},
				}}
			>
				<DialogTitle sx={{ color: COLOR_TEXT_PRIMARY }}>
					Invoice Details -{" "}
					{selectedInvoiceDetails?.id
						? `INV-${selectedInvoiceDetails.id.toString().padStart(3, "0")}`
						: ""}
				</DialogTitle>
				<DialogContent
					dividers
					sx={{
						borderColor: "rgba(255, 255, 255, 0.1)",
					}}
				>
					{selectedInvoiceDetails && (
						<Box sx={{ p: 2 }}>
							<Grid container spacing={2}>
								<Grid item xs={12} md={6}>
									<Typography
										variant="subtitle1"
										fontWeight="bold"
										sx={{ color: COLOR_TEXT_PRIMARY }}
									>
										Client Information
									</Typography>
									<Typography
										variant="body1"
										sx={{ color: COLOR_TEXT_PRIMARY }}
									>
										{selectedInvoiceDetails.client_name ||
											`Client #${selectedInvoiceDetails.client}`}
									</Typography>
								</Grid>
								<Grid item xs={12} md={6}>
									<Typography
										variant="subtitle1"
										fontWeight="bold"
										sx={{ color: COLOR_TEXT_PRIMARY }}
									>
										Invoice Details
									</Typography>
									<Typography
										variant="body2"
										sx={{ color: COLOR_TEXT_PRIMARY }}
									>
										Status: {selectedInvoiceDetails.status}
									</Typography>
									<Typography
										variant="body2"
										sx={{ color: COLOR_TEXT_PRIMARY }}
									>
										Issue Date:{" "}
										{formatDate(
											selectedInvoiceDetails.issue_date ||
												selectedInvoiceDetails.date
										)}
									</Typography>
									<Typography
										variant="body2"
										sx={{ color: COLOR_TEXT_PRIMARY }}
									>
										Due Date: {formatDate(selectedInvoiceDetails.due_date)}
									</Typography>
								</Grid>
								<Grid item xs={12}>
									<Typography
										variant="subtitle1"
										fontWeight="bold"
										sx={{ mt: 2, color: COLOR_TEXT_PRIMARY }}
									>
										Financial Summary
									</Typography>
									<Box
										sx={{
											mt: 1,
											p: 2,
											bgcolor: `${COLOR_SURFACE}80`,
											border: "1px solid rgba(255, 255, 255, 0.1)",
											borderRadius: 1,
										}}
									>
										<Grid container spacing={2}>
											<Grid item xs={6}>
												<Typography
													variant="body2"
													sx={{ color: COLOR_TEXT_PRIMARY }}
												>
													Subtotal:
												</Typography>
											</Grid>
											<Grid item xs={6} textAlign="right">
												<Typography
													variant="body2"
													sx={{ color: COLOR_TEXT_PRIMARY }}
												>
													{formatAmount(
														selectedInvoiceDetails.amount /
															(1 + (selectedInvoiceDetails.tax_rate || 0))
													)}
												</Typography>
											</Grid>
											{selectedInvoiceDetails.discount > 0 && (
												<>
													<Grid item xs={6}>
														<Typography
															variant="body2"
															sx={{ color: COLOR_TEXT_PRIMARY }}
														>
															Discount:
														</Typography>
													</Grid>
													<Grid item xs={6} textAlign="right">
														<Typography variant="body2" color={COLOR_ERROR}>
															-{formatAmount(selectedInvoiceDetails.discount)}
														</Typography>
													</Grid>
												</>
											)}
											<Grid item xs={6}>
												<Typography
													variant="body2"
													sx={{ color: COLOR_TEXT_PRIMARY }}
												>
													Tax (
													{(
														(selectedInvoiceDetails.tax_rate || 0) * 100
													).toFixed(0)}
													%):
												</Typography>
											</Grid>
											<Grid item xs={6} textAlign="right">
												<Typography
													variant="body2"
													sx={{ color: COLOR_TEXT_PRIMARY }}
												>
													{formatAmount(
														(selectedInvoiceDetails.amount *
															(selectedInvoiceDetails.tax_rate || 0)) /
															(1 + (selectedInvoiceDetails.tax_rate || 0))
													)}
												</Typography>
											</Grid>
											<Grid item xs={6}>
												<Typography
													variant="body2"
													fontWeight="bold"
													sx={{ color: COLOR_TEXT_PRIMARY }}
												>
													Total Amount:
												</Typography>
											</Grid>
											<Grid item xs={6} textAlign="right">
												<Typography
													variant="body2"
													fontWeight="bold"
													sx={{ color: COLOR_TEXT_PRIMARY }}
												>
													{formatAmount(selectedInvoiceDetails.amount)}
												</Typography>
											</Grid>
										</Grid>
									</Box>
								</Grid>
							</Grid>
						</Box>
					)}
				</DialogContent>
				<DialogActions sx={{ borderTop: "1px solid rgba(255, 255, 255, 0.1)" }}>
					<Button
						onClick={handleCloseInvoiceDetailsDialog}
						sx={{ color: COLOR_TEXT_SECONDARY }}
					>
						Close
					</Button>
					{selectedInvoiceDetails?.status.toLowerCase() === "pending" &&
						isClient() && (
							<Button
								variant="contained"
								onClick={() => {
									handleCloseInvoiceDetailsDialog();
									handleOpenPaymentDialog(selectedInvoiceDetails);
								}}
								sx={{
									backgroundColor: COLOR_PRIMARY,
									color: COLOR_TEXT_PRIMARY,
									"&:hover": {
										backgroundColor: "#2563EB",
									},
								}}
							>
								Pay Now
							</Button>
						)}
					<Button
						variant="outlined"
						onClick={() => {
							handleCloseInvoiceDetailsDialog();
							selectedInvoiceDetails &&
								handleDownloadInvoice(selectedInvoiceDetails.id);
						}}
						sx={{
							color: COLOR_PRIMARY,
							borderColor: COLOR_PRIMARY,
							"&:hover": {
								borderColor: COLOR_PRIMARY,
								backgroundColor: `${COLOR_PRIMARY}20`,
							},
						}}
					>
						Download
					</Button>
				</DialogActions>
			</Dialog>

			<CustomSnackbar snackbarState={snackbar} onClose={handleSnackbarClose} />
		</Mainlayout>
	);
};

export default Invoices;
