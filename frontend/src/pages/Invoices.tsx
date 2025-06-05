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
import { COLOR_PRIMARY } from "../constants";
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

	const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
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

	const handleDownloadInvoice = (invoiceId: number) => {};

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
			return <Chip label="Unknown" color="default" size="small" />;
		}

		let color = "";
		switch (status.toLowerCase()) {
			case "paid":
				color = "success";
				break;
			case "pending":
				color = "warning";
				break;
			case "overdue":
				color = "error";
				break;
			default:
				color = "default";
		}
		return <Chip label={status} color={color as any} size="small" />;
	};

	const renderInvoiceActions = (invoice: Invoice) => {
		return (
			<Box sx={{ display: "flex", gap: 1 }}>
				<IconButton size="small" onClick={() => handleViewInvoice(invoice)}>
					<VisibilityIcon fontSize="small" />
				</IconButton>

				<IconButton
					size="small"
					onClick={() => handleDownloadInvoice(invoice.id)}
				>
					<GetAppIcon fontSize="small" />
				</IconButton>

				{isClient() && invoice.status.toLowerCase() === "pending" && (
					<IconButton
						size="small"
						color="primary"
						onClick={() => handleOpenPaymentDialog(invoice)}
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

	const formatDate = (dateString) => {
		if (!dateString) return "N/A";
		const date = new Date(dateString);
		return !isNaN(date.getTime()) ? date.toLocaleDateString() : "Invalid Date";
	};

	const formatAmount = (amount) => {
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
						<Typography variant="h4" fontWeight="bold">
							Invoices & Payments
						</Typography>

						{(isAdmin() || isOwner()) && (
							<Button
								variant="contained"
								startIcon={<AddIcon />}
								onClick={handleOpenCreateDialog}
								sx={{
									bgcolor: "#ff3c4e",
									"&:hover": { bgcolor: "#d6303f" },
								}}
							>
								New Invoice
							</Button>
						)}
					</Box>

					<Paper sx={{ mb: 3, overflow: "hidden" }} elevation={2}>
						<Tabs
							value={tabValue}
							onChange={handleTabChange}
							indicatorColor="primary"
							textColor="primary"
							sx={{ borderBottom: 1, borderColor: "divider" }}
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
									<Typography color="error">{error}</Typography>
								) : invoices.length === 0 ? (
									<Typography>No invoices found.</Typography>
								) : (
									<TableContainer>
										<Table sx={{ minWidth: 650 }}>
											<TableHead>
												<TableRow>
													<TableCell>Invoice #</TableCell>
													<TableCell>Date</TableCell>
													<TableCell>Due Date</TableCell>
													<TableCell>Client</TableCell>
													<TableCell>Amount</TableCell>
													<TableCell>Status</TableCell>
													<TableCell>Actions</TableCell>
												</TableRow>
											</TableHead>
											<TableBody>
												{invoices.map((invoice) => (
													<TableRow key={invoice.id}>
														<TableCell>{invoice.number}</TableCell>
														<TableCell>
															{formatDate(invoice.issue_date || invoice.date)}
														</TableCell>
														<TableCell>
															{formatDate(invoice.due_date)}
														</TableCell>
														<TableCell>
															{invoice.client_name || invoice.client}
														</TableCell>
														<TableCell>
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
									<Typography color="error">{error}</Typography>
								) : payments.length === 0 ? (
									<Typography>No payments found.</Typography>
								) : (
									<TableContainer>
										<Table sx={{ minWidth: 650 }}>
											<TableHead>
												<TableRow>
													<TableCell>Payment ID</TableCell>
													<TableCell>Invoice</TableCell>
													<TableCell>Date</TableCell>
													<TableCell>Amount</TableCell>
													<TableCell>Method</TableCell>
													<TableCell>Status</TableCell>
												</TableRow>
											</TableHead>
											<TableBody>
												{payments.map((payment) => (
													<TableRow key={payment.id}>
														<TableCell>{payment.id}</TableCell>
														<TableCell>
															{payment.invoice_number || payment.invoice}
														</TableCell>
														<TableCell>
															{new Date(
																payment.payment_date
															).toLocaleDateString()}
														</TableCell>
														<TableCell>
															{formatAmount(
																payment.amount_paid || payment.amount
															)}
														</TableCell>
														<TableCell>
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
																color={
																	payment.status &&
																	payment.status.toLowerCase() === "completed"
																		? "success"
																		: "default"
																}
																size="small"
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
				>
					<DialogTitle>Create New Invoice</DialogTitle>
					<DialogContent dividers>
						<Grid container spacing={3}>
							<Grid item xs={12} md={6}>
								<FormControl fullWidth margin="normal">
									<InputLabel>Client</InputLabel>
									<Select
										value={newInvoice.client}
										onChange={(e) =>
											setNewInvoice({ ...newInvoice, client: e.target.value })
										}
										label="Client"
									>
										<MenuItem value="1">Client 1</MenuItem>
										<MenuItem value="2">Client 2</MenuItem>
									</Select>
								</FormControl>
							</Grid>
							<Grid item xs={12} md={6}>
								<FormControl fullWidth margin="normal">
									<InputLabel>Booking</InputLabel>
									<Select
										value={newInvoice.booking}
										onChange={(e) =>
											setNewInvoice({ ...newInvoice, booking: e.target.value })
										}
										label="Booking"
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
									}}
									margin="normal"
								/>
							</Grid>
							<Grid item xs={12}>
								<Typography variant="h6" sx={{ mt: 2, mb: 2 }}>
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
											sx={{ width: "100px" }}
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
											sx={{ width: "150px" }}
										/>
										<Button
											color="error"
											onClick={() => handleRemoveInvoiceItem(index)}
											disabled={newInvoice.items.length <= 1}
										>
											Remove
										</Button>
									</Box>
								))}
								<Button
									variant="outlined"
									startIcon={<AddIcon />}
									onClick={handleAddInvoiceItem}
									sx={{ mt: 1 }}
								>
									Add Item
								</Button>
							</Grid>
						</Grid>
					</DialogContent>
					<DialogActions>
						<Button onClick={handleCloseCreateDialog}>Cancel</Button>
						<Button
							onClick={handleSaveInvoice}
							variant="contained"
							sx={{ backgroundColor: COLOR_PRIMARY }}
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
			>
				<DialogTitle>Make Payment</DialogTitle>
				<DialogContent dividers>
					<Box sx={{ mb: 2 }}>
						<Typography variant="subtitle1" gutterBottom>
							Invoice: {selectedInvoice?.number}
						</Typography>
						<Typography variant="body2" color="text.secondary" gutterBottom>
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
					/>

					<FormControl fullWidth margin="normal">
						<InputLabel>Payment Method</InputLabel>
						<Select
							value={paymentDetails.payment_method}
							onChange={(e) =>
								setPaymentDetails({
									...paymentDetails,
									payment_method: e.target.value as string,
								})
							}
							label="Payment Method"
						>
							<MenuItem value="card">Credit Card</MenuItem>
							<MenuItem value="bank_transfer">Bank Transfer</MenuItem>
							<MenuItem value="cash">Cash</MenuItem>
						</Select>
					</FormControl>
				</DialogContent>
				<DialogActions>
					<Button onClick={handleClosePaymentDialog}>Cancel</Button>
					<Button
						onClick={handleSavePayment}
						variant="contained"
						sx={{ backgroundColor: COLOR_PRIMARY }}
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
			>
				<DialogTitle>
					Invoice Details -{" "}
					{selectedInvoiceDetails?.id
						? `INV-${selectedInvoiceDetails.id.toString().padStart(3, "0")}`
						: ""}
				</DialogTitle>
				<DialogContent dividers>
					{selectedInvoiceDetails && (
						<Box sx={{ p: 2 }}>
							<Grid container spacing={2}>
								<Grid item xs={12} md={6}>
									<Typography variant="subtitle1" fontWeight="bold">
										Client Information
									</Typography>
									<Typography variant="body1">
										{selectedInvoiceDetails.client_name ||
											`Client #${selectedInvoiceDetails.client}`}
									</Typography>
								</Grid>
								<Grid item xs={12} md={6}>
									<Typography variant="subtitle1" fontWeight="bold">
										Invoice Details
									</Typography>
									<Typography variant="body2">
										Status: {selectedInvoiceDetails.status}
									</Typography>
									<Typography variant="body2">
										Issue Date:{" "}
										{formatDate(
											selectedInvoiceDetails.issue_date ||
												selectedInvoiceDetails.date
										)}
									</Typography>
									<Typography variant="body2">
										Due Date: {formatDate(selectedInvoiceDetails.due_date)}
									</Typography>
								</Grid>
								<Grid item xs={12}>
									<Typography
										variant="subtitle1"
										fontWeight="bold"
										sx={{ mt: 2 }}
									>
										Financial Summary
									</Typography>
									<Box
										sx={{
											mt: 1,
											p: 2,
											bgcolor: "#f5f5f5",
											borderRadius: 1,
										}}
									>
										<Grid container spacing={2}>
											<Grid item xs={6}>
												<Typography variant="body2">Subtotal:</Typography>
											</Grid>
											<Grid item xs={6} textAlign="right">
												<Typography variant="body2">
													{formatAmount(
														selectedInvoiceDetails.amount /
															(1 + (selectedInvoiceDetails.tax_rate || 0))
													)}
												</Typography>
											</Grid>
											{selectedInvoiceDetails.discount > 0 && (
												<>
													<Grid item xs={6}>
														<Typography variant="body2">Discount:</Typography>
													</Grid>
													<Grid item xs={6} textAlign="right">
														<Typography variant="body2" color="error">
															-{formatAmount(selectedInvoiceDetails.discount)}
														</Typography>
													</Grid>
												</>
											)}
											<Grid item xs={6}>
												<Typography variant="body2">
													Tax (
													{(
														(selectedInvoiceDetails.tax_rate || 0) * 100
													).toFixed(0)}
													%):
												</Typography>
											</Grid>
											<Grid item xs={6} textAlign="right">
												<Typography variant="body2">
													{formatAmount(
														(selectedInvoiceDetails.amount *
															(selectedInvoiceDetails.tax_rate || 0)) /
															(1 + (selectedInvoiceDetails.tax_rate || 0))
													)}
												</Typography>
											</Grid>
											<Grid item xs={6}>
												<Typography variant="body2" fontWeight="bold">
													Total Amount:
												</Typography>
											</Grid>
											<Grid item xs={6} textAlign="right">
												<Typography variant="body2" fontWeight="bold">
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
				<DialogActions>
					<Button onClick={handleCloseInvoiceDetailsDialog}>Close</Button>
					{selectedInvoiceDetails?.status.toLowerCase() === "pending" &&
						isClient() && (
							<Button
								variant="contained"
								color="primary"
								onClick={() => {
									handleCloseInvoiceDetailsDialog();
									handleOpenPaymentDialog(selectedInvoiceDetails);
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
