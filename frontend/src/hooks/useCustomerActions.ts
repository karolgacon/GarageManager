import { useState } from "react";
import { Customer } from "../models/CustomerModel";
import { customerService } from "../api/CustomerAPIEndpoint";
import { SnackbarState } from "../components/Mainlayout/Snackbar";

interface ModalStates {
	detail: boolean;
	add: boolean;
	edit: boolean;
	delete: boolean;
}

export const useCustomerActions = (
	customers: Customer[],
	setFilteredCustomers: (customers: Customer[]) => void
) => {
	const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(
		null
	);
	const [editCustomerId, setEditCustomerId] = useState<number | null>(null);
	const [deleteCustomerId, setDeleteCustomerId] = useState<number | null>(null);
	const [deleteLoading, setDeleteLoading] = useState(false);

	const [modalStates, setModalStates] = useState<ModalStates>({
		detail: false,
		add: false,
		edit: false,
		delete: false,
	});

	const [snackbar, setSnackbar] = useState<SnackbarState>({
		open: false,
		message: "",
		severity: "success",
	});

	const setModalState = (modal: keyof ModalStates, isOpen: boolean) => {
		setModalStates((prev) => ({ ...prev, [modal]: isOpen }));
	};

	// Handle viewing customer details
	const handleViewCustomer = (customer: Customer) => {
		console.log("handleViewCustomer called with customer:", customer);
		setSelectedCustomer(customer);
		setModalState("detail", true);
	};

	// Handle editing a customer
	const handleEditCustomer = (id: number) => {
		setEditCustomerId(id);
		setModalState("edit", true);
	};

	// Handle deleting a customer
	const handleDeleteCustomer = (id: number) => {
		const customer = customers.find((c) => c.id === id);
		setSelectedCustomer(customer || null);
		setDeleteCustomerId(id);
		setModalState("delete", true);
	};

	// Confirm delete a customer
	const confirmDeleteCustomer = async () => {
		if (!deleteCustomerId) return;

		try {
			setDeleteLoading(true);
			await customerService.deleteCustomer(deleteCustomerId);

			// Remove customer from local state
			const updatedCustomers = customers.filter(
				(customer) => customer.id !== deleteCustomerId
			);
			setFilteredCustomers(updatedCustomers);

			setSnackbar({
				open: true,
				message: "Customer deleted successfully",
				severity: "success",
			});

			setModalState("delete", false);
			setDeleteCustomerId(null);
		} catch (err) {
			console.error("Error deleting customer:", err);
			setSnackbar({
				open: true,
				message: "Failed to delete customer",
				severity: "error",
			});
		} finally {
			setDeleteLoading(false);
		}
	};

	// Handle adding a new customer
	const handleCustomerAdded = (customer: Customer) => {
		const updatedCustomers = [...customers, customer];
		setFilteredCustomers(updatedCustomers);

		setSnackbar({
			open: true,
			message: "Customer added successfully",
			severity: "success",
		});
	};

	// Handle updating a customer
	const handleCustomerUpdated = (updatedCustomer: Customer) => {
		const updatedCustomers = customers.map((customer) =>
			customer.id === updatedCustomer.id ? updatedCustomer : customer
		);

		setFilteredCustomers(updatedCustomers);

		setSnackbar({
			open: true,
			message: "Customer updated successfully",
			severity: "success",
		});
	};

	// Handle closing the snackbar
	const handleSnackbarClose = () => {
		setSnackbar({ ...snackbar, open: false });
	};

	return {
		snackbar,
		selectedCustomer,
		editCustomerId,
		deleteLoading,
		modalStates,
		handleViewCustomer, // Teraz przyjmuje Customer object zamiast ID
		handleEditCustomer,
		handleDeleteCustomer,
		handleCustomerAdded,
		handleCustomerUpdated,
		confirmDeleteCustomer,
		setModalState,
		handleSnackbarClose,
	};
};
