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

	const handleViewCustomer = (customer: Customer) => {
		setSelectedCustomer(customer);
		setModalState("detail", true);
	};

	const handleEditCustomer = (id: number) => {
		setEditCustomerId(id);
		setModalState("edit", true);
	};

	const handleDeleteCustomer = (id: number) => {
		const customer = customers.find((c) => c.id === id);
		setSelectedCustomer(customer || null);
		setDeleteCustomerId(id);
		setModalState("delete", true);
	};

	const confirmDeleteCustomer = async () => {
		if (!deleteCustomerId) return;

		try {
			setDeleteLoading(true);
			await customerService.deleteCustomer(deleteCustomerId);

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
			setSnackbar({
				open: true,
				message: "Failed to delete customer",
				severity: "error",
			});
		} finally {
			setDeleteLoading(false);
		}
	};

	const handleCustomerAdded = (customer: Customer) => {
		const updatedCustomers = [...customers, customer];
		setFilteredCustomers(updatedCustomers);

		setSnackbar({
			open: true,
			message: "Customer added successfully",
			severity: "success",
		});
	};

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

	const handleSnackbarClose = () => {
		setSnackbar({ ...snackbar, open: false });
	};

	return {
		snackbar,
		selectedCustomer,
		editCustomerId,
		deleteLoading,
		modalStates,
		handleViewCustomer, 
		handleEditCustomer,
		handleDeleteCustomer,
		handleCustomerAdded,
		handleCustomerUpdated,
		confirmDeleteCustomer,
		setModalState,
		handleSnackbarClose,
	};
};
