import React, { useState, useEffect, useContext } from "react";
import { Box, Container, Typography } from "@mui/material";
import Mainlayout from "../components/Mainlayout/Mainlayout";
import CustomerHeader from "../components/Customer/CustomerHeader";
import CustomerWorkshopSelector from "../components/Customer/CustomerWorkshopSelector";
import CustomerTabs from "../components/Customer/CustomerTabs";
import CustomerFilters from "../components/Customer/CustomerFilters";
import CustomerList from "../components/Customer/CustomerList";
import CustomerModals from "../components/Customer/CustomerModals";
import CustomSnackbar, {
	SnackbarState,
} from "../components/Mainlayout/Snackbar";
import AuthContext from "../context/AuthProvider";
import { useCustomerData } from "../hooks/useCustomerData";
import { useCustomerActions } from "../hooks/useCustomerActions";

const Customers: React.FC = () => {
	const { auth } = useContext(AuthContext);
	const [activeTab, setActiveTab] = useState<string>("all");
	const [selectedWorkshopId, setSelectedWorkshopId] = useState<number | null>(
		null
	);

	// Custom hooks for data management
	const {
		customers,
		filteredCustomers,
		workshops,
		loading,
		error,
		setFilteredCustomers,
		fetchCustomers,
		fetchWorkshops,
	} = useCustomerData(auth, selectedWorkshopId);

	const {
		snackbar,
		selectedCustomer,
		modalStates,
		handleViewCustomer,
		handleEditCustomer,
		handleDeleteCustomer,
		handleCustomerAdded,
		handleCustomerUpdated,
		confirmDeleteCustomer,
		setModalState,
		handleSnackbarClose,
	} = useCustomerActions(customers, setFilteredCustomers);

	// Check if user has permission to access this page
	const hasPermission = () => {
		const userRole = auth.roles?.[0];
		return ["admin", "owner", "mechanic"].includes(userRole || "");
	};

	// Handle tab changes
	const handleTabChange = (event: React.SyntheticEvent, newValue: string) => {
		setActiveTab(newValue);

		if (newValue === "all") {
			setFilteredCustomers(customers);
		} else if (newValue === "active") {
			const activeCustomers = customers.filter(
				(customer) => customer.status === "active"
			);
			setFilteredCustomers(activeCustomers);
		} else if (newValue === "vip") {
			const vipCustomers = customers.filter(
				(customer) => customer.loyalty_points && customer.loyalty_points > 100
			);
			setFilteredCustomers(vipCustomers);
		}
	};

	// Handle workshop selection (for admin)
	const handleWorkshopChange = (workshopId: number) => {
		setSelectedWorkshopId(workshopId);
	};

	// Function to filter customers
	const handleFilterChange = (filters: any) => {
		const { searchTerm, status, loyaltyLevel } = filters;

		const filtered = customers.filter((customer) => {
			const matchesSearch =
				searchTerm === "" ||
				customer.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
				customer.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
				customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
				customer.username.toLowerCase().includes(searchTerm.toLowerCase());

			const matchesStatus = status === "" || customer.status === status;

			const matchesLoyalty =
				loyaltyLevel === "" ||
				(loyaltyLevel === "vip" &&
					customer.loyalty_points &&
					customer.loyalty_points > 100) ||
				(loyaltyLevel === "regular" &&
					(!customer.loyalty_points || customer.loyalty_points <= 100));

			return matchesSearch && matchesStatus && matchesLoyalty;
		});

		setFilteredCustomers(filtered);
	};

	if (!hasPermission()) {
		return (
			<Mainlayout>
				<Container maxWidth="xl">
					<Box sx={{ py: 3, textAlign: "center" }}>
						<Typography variant="h5" color="error">
							Access Denied
						</Typography>
						<Typography variant="body1" color="text.secondary" sx={{ mt: 2 }}>
							You don't have permission to view this page.
						</Typography>
					</Box>
				</Container>
			</Mainlayout>
		);
	}

	return (
		<Mainlayout>
			<Container maxWidth="xl" sx={{ py: 3 }}>
				{/* Header */}
				<CustomerHeader
					userRole={auth.roles?.[0]}
					selectedWorkshopId={selectedWorkshopId}
					onAddCustomer={() => setModalState("add", true)}
				/>

				{/* Workshop Selector for Admin */}
				{auth.roles?.[0] === "admin" && (
					<CustomerWorkshopSelector
						workshops={workshops}
						selectedWorkshopId={selectedWorkshopId}
						onWorkshopChange={handleWorkshopChange}
					/>
				)}

				{/* Main Content */}
				{(selectedWorkshopId || auth.roles?.[0] !== "admin") && (
					<>
						{/* Tabs */}
						<CustomerTabs activeTab={activeTab} onTabChange={handleTabChange} />

						{/* Filters */}
						<CustomerFilters onFilterChange={handleFilterChange} />

						{/* Customer List */}
						<CustomerList
							customers={filteredCustomers}
							loading={loading}
							error={error}
							userRole={auth.roles?.[0] || ""}
							onView={handleViewCustomer} // ✅ Teraz przekazuje Customer object
							onEdit={handleEditCustomer}
							onDelete={handleDeleteCustomer}
							onRetry={fetchCustomers}
						/>
					</>
				)}
			</Container>

			{/* Modals and Dialogs */}
			<CustomerModals
				modalStates={modalStates}
				selectedCustomer={selectedCustomer}
				userRole={auth.roles?.[0] || ""}
				workshopId={selectedWorkshopId || auth.workshopId}
				onClose={(modal) => setModalState(modal, false)}
				onCustomerAdded={handleCustomerAdded}
				onCustomerUpdated={handleCustomerUpdated}
				onConfirmDelete={confirmDeleteCustomer}
			/>

			<CustomSnackbar snackbarState={snackbar} onClose={handleSnackbarClose} />
		</Mainlayout>
	);
};

export default Customers;
